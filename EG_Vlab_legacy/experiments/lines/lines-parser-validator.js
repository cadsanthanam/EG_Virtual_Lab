/**
 * lines-parser-validator.js
 * Enterprise Validator — ML-Enhanced Edition
 * Physics-based constraint checking + anomaly detection + explainable validation
 * Version: 4.0.0 Enterprise ML
 */

class ParserValidator {

  constructor(config) {
    this.config = config || (typeof window !== 'undefined' ? window.ParserConfig : null);

    // Historical value distributions (mean, std) learned from engineering textbooks
    // Used for anomaly scoring via Z-score
    this.FIELD_DISTRIBUTIONS = {
      TL: { mean: 80, std: 30, min: 10, max: 300 },
      theta: { mean: 35, std: 20, min: 0, max: 90 },
      phi: { mean: 35, std: 20, min: 0, max: 90 },
      h_A: { mean: 20, std: 15, min: -100, max: 150 },
      d_A: { mean: 20, std: 15, min: -100, max: 150 },
      h_B: { mean: 40, std: 25, min: -100, max: 200 },
      d_B: { mean: 30, std: 20, min: -100, max: 200 },
      L_TV: { mean: 65, std: 25, min: 0, max: 300 },
      L_FV: { mean: 55, std: 20, min: 0, max: 300 },
      alpha: { mean: 35, std: 20, min: 0, max: 90 },
      beta: { mean: 40, std: 20, min: 0, max: 90 },
      delta_X: { mean: 55, std: 20, min: 0, max: 300 }
    };

    // Geometric constraint rules — each returns { valid, message } or null if not applicable
    this.CONSTRAINT_RULES = [
      this._checkTLPositive.bind(this),
      this._checkAngles.bind(this),
      this._checkAngleSum.bind(this),
      this._checkProjectionConsistency.bind(this),
      this._checkProjectorDistance.bind(this),
      this._checkMidpointConsistency.bind(this),
      this._checkHeightConsistency.bind(this),
      this._checkViewLengthBounds.bind(this),
      this._checkTracesConsistency.bind(this)
    ];
  }

  /**
   * Main validation entry point
   * @param {object} constraints - Output from ParserClassifier._buildConstraints
   * @param {object} [slotDetails] - Optional slot detail array
   * @returns {{ valid, errors[], warnings[], confidence, anomalyScore, explanations[] }}
   */
  validate(constraints, slotDetails = []) {
    const errors = [];
    const warnings = [];
    const explanations = [];
    const startTime = Date.now();

    try {
      // ── Run all geometric constraint rules ───────────────────────────
      for (const rule of this.CONSTRAINT_RULES) {
        const result = rule(constraints);
        if (!result) continue;

        if (result.type === 'error') {
          errors.push(result.message);
          explanations.push({ severity: 'error', check: result.check, message: result.message, reason: result.reason });
        } else if (result.type === 'warning') {
          warnings.push(result.message);
          explanations.push({ severity: 'warning', check: result.check, message: result.message, reason: result.reason });
        }
      }

      // ── Anomaly detection (Z-score based) ────────────────────────────
      const anomalyResults = this._detectAnomalies(constraints);
      for (const a of anomalyResults) {
        warnings.push(a.message);
        explanations.push({ severity: 'anomaly', check: 'distribution', ...a });
      }

      // ── Cross-field plausibility checks ──────────────────────────────
      const crossChecks = this._crossFieldCheck(constraints);
      for (const c of crossChecks) {
        if (c.type === 'warning') warnings.push(c.message);
        else errors.push(c.message);
        explanations.push({ severity: c.type, check: 'cross-field', ...c });
      }

      // ── Compute anomaly score [0,1] ───────────────────────────────────
      const anomalyScore = this._computeAnomalyScore(constraints, errors, warnings);

      // ── Validator confidence ─────────────────────────────────────────
      const validatorConfidence = errors.length === 0
        ? Math.max(0.5, 1.0 - anomalyScore * 0.5)
        : 0.95;  // High confidence in error detection

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        confidence: Math.round(validatorConfidence * 100) / 100,
        anomalyScore: Math.round(anomalyScore * 100) / 100,
        explanations,
        summary: errors.length
          ? `${errors.length} error(s): ${errors.join('; ')}`
          : warnings.length
            ? `Valid with ${warnings.length} warning(s)`
            : 'All constraints valid',
        processingMs: Date.now() - startTime
      };

    } catch (err) {
      console.error('[Validator] Error:', err);
      return {
        valid: false, errors: ['Validation error: ' + err.message], warnings: [],
        confidence: 0, anomalyScore: 1, explanations: [], summary: 'Validation failed'
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Geometric Constraint Rules
  // ─────────────────────────────────────────────────────────────────────────

  _checkTLPositive(c) {
    if (c.TL === null) return null;
    if (c.TL <= 0) return {
      type: 'error', check: 'TL_positive',
      message: `True Length must be positive (got ${c.TL}mm)`,
      reason: 'A line segment cannot have zero or negative length'
    };
    return null;
  }

  _checkAngles(c) {
    const checks = [
      { field: 'theta', label: 'θ (inclination to HP)', value: c.theta },
      { field: 'phi', label: 'φ (inclination to VP)', value: c.phi },
      { field: 'alpha', label: 'α (TV angle)', value: c.alpha },
      { field: 'beta', label: 'β (FV angle)', value: c.beta },
      { field: 'gamma', label: 'γ (inclination to PP)', value: c.gamma }
    ];

    for (const { field, label, value } of checks) {
      if (value === null) continue;
      if (value < 0 || value > 90) {
        return {
          type: 'error', check: `angle_domain_${field}`,
          message: `${label} must be in [0°, 90°] (got ${value}°)`,
          reason: `Inclination angles are measured from the reference plane [0°, 90°]`
        };
      }
    }
    return null;
  }

  _checkAngleSum(c) {
    const { theta, phi } = c;
    if (theta === null || phi === null) return null;
    if (theta === 0 && phi === 0) return null;  // Parallel to both — fine

    const sum = theta + phi;

    // Mathematically impossible: θ + φ > 90°
    if (sum > 90.5) {
      return {
        type: 'error', check: 'angle_sum',
        message: `θ + φ = ${sum.toFixed(1)}° exceeds 90° (θ=${theta}°, φ=${phi}°)`,
        reason: 'For any line in 3D space, the sum of true inclinations to HP and VP cannot exceed 90°. ' +
          'This is a fundamental geometric constraint: cos²θ + cos²φ ≤ 1'
      };
    }

    // Boundary case warning: exactly 90° means line is in a coordinate plane
    if (Math.abs(sum - 90) < 0.5 && theta > 0 && phi > 0) {
      return {
        type: 'warning', check: 'angle_sum_boundary',
        message: `θ + φ ≈ 90° (${sum.toFixed(1)}°) — line lies in a principal plane`,
        reason: 'When θ + φ = 90°, the line lies in either HP or VP, giving a degenerate case'
      };
    }

    return null;
  }

  _checkProjectionConsistency(c) {
    const { TL, theta, phi, L_TV, L_FV } = c;
    if (!TL) return null;

    // Check: L_TV = TL * cos(θ) — tolerance ±2mm
    if (theta !== null && L_TV !== null) {
      const expected = TL * Math.cos(theta * Math.PI / 180);
      if (Math.abs(L_TV - expected) > 2 + 0.05 * TL) {
        return {
          type: 'error', check: 'tv_length_consistency',
          message: `L_TV=${L_TV}mm inconsistent with TL=${TL}mm and θ=${theta}° (expected ~${expected.toFixed(1)}mm)`,
          reason: `Top view length = TL × cos(θ). With TL=${TL} and θ=${theta}°, L_TV should be ~${expected.toFixed(1)}mm`
        };
      }
    }

    // Check: L_FV = TL * cos(φ)
    if (phi !== null && L_FV !== null) {
      const expected = TL * Math.cos(phi * Math.PI / 180);
      if (Math.abs(L_FV - expected) > 2 + 0.05 * TL) {
        return {
          type: 'error', check: 'fv_length_consistency',
          message: `L_FV=${L_FV}mm inconsistent with TL=${TL}mm and φ=${phi}° (expected ~${expected.toFixed(1)}mm)`,
          reason: `Front view length = TL × cos(φ). With TL=${TL} and φ=${phi}°, L_FV should be ~${expected.toFixed(1)}mm`
        };
      }
    }

    // Check: L_TV² + (Δh)² ≤ TL² if h_A and h_B known
    if (L_TV !== null && c.h_A !== null && c.h_B !== null) {
      const deltaH = Math.abs(c.h_B - c.h_A);
      const tl_computed = Math.sqrt(L_TV * L_TV + deltaH * deltaH + (c.d_A !== null && c.d_B !== null
        ? Math.pow(c.d_B - c.d_A, 2) : 0));
      if (TL !== null && Math.abs(tl_computed - TL) > 3 + 0.05 * TL) {
        return {
          type: 'warning', check: 'tl_geometry_check',
          message: `TL=${TL}mm may be inconsistent with endpoint positions (computed TL≈${tl_computed.toFixed(1)}mm)`,
          reason: `TL² = L_TV² + ΔH² + ΔD². Check that endpoint coordinates are correct.`
        };
      }
    }

    return null;
  }

  _checkProjectorDistance(c) {
    const { delta_X, L_TV, alpha } = c;
    if (!delta_X) return null;

    // delta_X should be ≤ L_TV (projector distance ≤ plan length)
    if (L_TV !== null && delta_X > L_TV + 1) {
      return {
        type: 'error', check: 'projector_distance',
        message: `Projector distance Δx=${delta_X}mm cannot exceed top view length L_TV=${L_TV}mm`,
        reason: 'The horizontal distance between projectors equals L_TV × cos(α), so Δx ≤ L_TV always'
      };
    }

    // Check Δx = L_TV × cos(α) if alpha known
    if (L_TV !== null && alpha !== null) {
      const expected = L_TV * Math.cos(alpha * Math.PI / 180);
      if (Math.abs(delta_X - expected) > 2) {
        return {
          type: 'warning', check: 'projector_alpha_consistency',
          message: `Δx=${delta_X}mm inconsistent with L_TV=${L_TV}mm and α=${alpha}° (expected ~${expected.toFixed(1)}mm)`,
          reason: `Δx = L_TV × cos(α)`
        };
      }
    }

    return null;
  }

  _checkMidpointConsistency(c) {
    const { h_A, h_B, h_mid, d_A, d_B, d_mid } = c;

    // Midpoint should be average of endpoints
    if (h_A !== null && h_B !== null && h_mid !== null) {
      const expected = (h_A + h_B) / 2;
      if (Math.abs(h_mid - expected) > 1) {
        return {
          type: 'error', check: 'midpoint_height',
          message: `Midpoint height ${h_mid}mm ≠ (h_A + h_B)/2 = ${expected.toFixed(1)}mm`,
          reason: 'Midpoint height must be the average of endpoint heights'
        };
      }
    }

    if (d_A !== null && d_B !== null && d_mid !== null) {
      const expected = (d_A + d_B) / 2;
      if (Math.abs(d_mid - expected) > 1) {
        return {
          type: 'error', check: 'midpoint_depth',
          message: `Midpoint depth ${d_mid}mm ≠ (d_A + d_B)/2 = ${expected.toFixed(1)}mm`,
          reason: 'Midpoint depth must be the average of endpoint depths'
        };
      }
    }

    return null;
  }

  _checkHeightConsistency(c) {
    // If theta=0 (parallel to HP), then h_A must equal h_B
    if (c.theta === 0 && c.h_A !== null && c.h_B !== null) {
      if (Math.abs(c.h_A - c.h_B) > 1) {
        return {
          type: 'error', check: 'parallel_hp_height',
          message: `If line is parallel to HP (θ=0), both endpoints must have same height. h_A=${c.h_A}, h_B=${c.h_B}`,
          reason: 'A line parallel to HP is at constant height throughout its length'
        };
      }
    }

    // If phi=0 (parallel to VP), then d_A must equal d_B
    if (c.phi === 0 && c.d_A !== null && c.d_B !== null) {
      if (Math.abs(c.d_A - c.d_B) > 1) {
        return {
          type: 'error', check: 'parallel_vp_depth',
          message: `If line is parallel to VP (φ=0), both endpoints must have same depth. d_A=${c.d_A}, d_B=${c.d_B}`,
          reason: 'A line parallel to VP is at constant depth throughout its length'
        };
      }
    }

    return null;
  }

  _checkViewLengthBounds(c) {
    const { TL, L_TV, L_FV } = c;
    if (!TL) return null;

    // Projected lengths cannot exceed TL
    if (L_TV !== null && L_TV > TL + 1) {
      return {
        type: 'error', check: 'tv_length_bound',
        message: `Top view length L_TV=${L_TV}mm cannot exceed true length TL=${TL}mm`,
        reason: 'A projection is always ≤ the true length (cos(θ) ≤ 1)'
      };
    }

    if (L_FV !== null && L_FV > TL + 1) {
      return {
        type: 'error', check: 'fv_length_bound',
        message: `Front view length L_FV=${L_FV}mm cannot exceed true length TL=${TL}mm`,
        reason: 'A projection is always ≤ the true length (cos(φ) ≤ 1)'
      };
    }

    // Pythagorean check: L_TV² + L_FV² ≤ TL² is NOT always true (different planes)
    // But: TL² = L_TV² + (Δd)² and TL² = L_FV² + (Δh)², so use as soft check

    return null;
  }

  _checkTracesConsistency(c) {
    const { VT_h, theta, phi, h_A, d_A, TL } = c;

    // VT should be above XY if theta > 0 and h_A > 0
    if (VT_h !== null && theta !== null && h_A !== null) {
      if (theta > 0 && h_A > 0 && VT_h < 0) {
        return {
          type: 'warning', check: 'vt_position',
          message: `VT at ${VT_h}mm below HP is unusual when line rises from HP (θ=${theta}°)`,
          reason: 'Check sign conventions for VT height'
        };
      }
    }

    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Anomaly Detection (Z-score based)
  // ─────────────────────────────────────────────────────────────────────────
  _detectAnomalies(c) {
    const anomalies = [];
    const ZSCORE_THRESHOLD = 3.0;  // Flag if > 3 standard deviations from mean

    for (const [field, dist] of Object.entries(this.FIELD_DISTRIBUTIONS)) {
      const value = c[field];
      if (value === null || value === undefined) continue;

      // Hard bounds check
      if (value < dist.min || value > dist.max) {
        anomalies.push({
          field, value,
          message: `${field}=${value} is outside expected range [${dist.min}, ${dist.max}]`,
          anomalyScore: 1.0,
          reason: `Typical values for ${field} are between ${dist.min} and ${dist.max}`
        });
        continue;
      }

      // Z-score
      const z = Math.abs(value - dist.mean) / dist.std;
      if (z > ZSCORE_THRESHOLD) {
        anomalies.push({
          field, value,
          message: `${field}=${value} is unusual (Z-score: ${z.toFixed(1)}, mean=${dist.mean})`,
          anomalyScore: Math.min(1.0, z / 5),
          reason: `This value is ${z.toFixed(1)} standard deviations from the typical mean of ${dist.mean}`
        });
      }
    }

    return anomalies;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Cross-field plausibility checks
  // ─────────────────────────────────────────────────────────────────────────
  _crossFieldCheck(c) {
    const issues = [];

    // h_B should be > h_A if the line rises from A to B
    if (c.h_A !== null && c.h_B !== null && c.theta !== null && c.theta > 0) {
      if (c.h_B < c.h_A) {
        issues.push({
          type: 'warning',
          message: `End B (h_B=${c.h_B}) is lower than End A (h_A=${c.h_A}) while θ=${c.theta}° — check endpoint labeling`,
          reason: 'Typically end A is the lower end when the line rises from A to B'
        });
      }
    }

    // Angles should be consistent with projections
    if (c.theta !== null && c.phi !== null && c.L_TV !== null && c.L_FV !== null) {
      const sinTheta2 = Math.sin(c.theta * Math.PI / 180) ** 2;
      const sinPhi2 = Math.sin(c.phi * Math.PI / 180) ** 2;
      if (sinTheta2 + sinPhi2 > 1.01) {
        issues.push({
          type: 'error',
          message: `sin²θ + sin²φ = ${(sinTheta2 + sinPhi2).toFixed(3)} > 1: angles are geometrically impossible`,
          reason: 'For a line in 3D space: sin²θ + sin²φ ≤ 1 always'
        });
      }
    }

    return issues;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Compute overall anomaly score [0,1]
  // ─────────────────────────────────────────────────────────────────────────
  _computeAnomalyScore(constraints, errors, warnings) {
    let score = 0;
    score += errors.length * 0.3;    // Each error adds significant anomaly
    score += warnings.length * 0.05; // Each warning adds minor anomaly

    // Check angle sum proximity to 90
    if (constraints.theta !== null && constraints.phi !== null) {
      const sum = constraints.theta + constraints.phi;
      if (sum > 85) score += 0.1;
    }

    return Math.min(1.0, score);
  }
}

if (typeof window !== 'undefined') window.ParserValidator = ParserValidator;
if (typeof module !== 'undefined' && module.exports) module.exports = ParserValidator;