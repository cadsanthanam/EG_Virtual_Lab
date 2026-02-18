/**
 * lines-parser-classifier.js
 * Enterprise Classifier — ML-Enhanced Edition
 * Weighted feature-matching ensemble with explainability and calibrated confidence scores
 * Provides top-3 PROC alternatives with reasoning
 * Version: 4.0.0 Enterprise ML
 */

class ParserClassifier {

  constructor(config) {
    this.config = config || (typeof window !== 'undefined' ? window.ParserConfig : null);

    // Feature importance weights for slot matching
    this.SLOT_WEIGHTS = {
      D01: 1.2, D02: 1.0, D03: 1.0, D04: 1.1, D05: 1.1,
      D06: 1.0, D07: 1.0, D08: 0.9, D09: 0.9, D10: 0.8,
      D11: 0.8, D12: 0.85, D13: 0.75, D14: 0.75, D15: 0.7,
      D16: 0.7, D17: 0.6, D18: 0.6,
      SK01: 1.1, SK02: 1.1, SK03: 1.0, SK04: 1.0, SK05: 1.0,
      SK06: 1.0, SK07: 1.2, SK08: 1.1, SK09: 0.9, SK10: 1.1,
      SK11: 0.7, SK12: 0.8, SK13: 0.5
    };

    // Case type detection weights
    this.CASE_RULES = {
      '2A': (c) => c.theta === 90,
      '2B': (c) => c.phi === 90,
      'D★': (c) => c.theta !== null && c.phi !== null && Math.abs(c.theta + c.phi - 90) < 0.5,
      'D': (c) => c.theta > 0 && c.phi > 0 && c.theta + c.phi < 90,
      'C': (c) => c.theta > 0 && c.phi === 0,
      'B': (c) => c.phi > 0 && c.theta === 0,
      'A': (c) => c.theta === 0 && c.phi === 0
    };

    // Precompute proc feature vectors
    this._procVectors = this._buildProcVectors();

    // Training example index for semantic matching
    this._trainingIndex = this._buildTrainingIndex();
  }

  /**
   * Main classification entry point
   * @param {object} extraction - Output from ParserExtractor
   * @returns {{ procId, confidence, caseType, alternatives, reasoning, constraints, completeness }}
   */
  classify(extraction) {
    try {
      const { atoms, endpoints, specialFlags } = extraction;
      const startTime = Date.now();

      // ── Step 1: Build constraint map ─────────────────────────────────
      const constraints = this._buildConstraints(atoms, specialFlags);

      // ── Step 2: Count slots ───────────────────────────────────────────
      const slotCount = this._countSlots(atoms, specialFlags);

      // ── Step 3: Build feature vector for query ─────────────────────────
      const queryVector = this._buildQueryVector(atoms, specialFlags);

      // ── Step 4: Score all PROCs with weighted matching ─────────────────
      const scored = this._scoreAllProcs(queryVector, constraints, slotCount);

      // ── Step 5: Top-3 alternatives with reasoning ─────────────────────
      const top3 = scored.slice(0, 3);
      const best = top3[0] || { procId: null, score: 0, proc: null };

      // ── Step 6: Detect case type from constraints ─────────────────────
      const caseType = this._detectCase(constraints);

      // ── Step 7: Calibrate confidence (Platt scaling approximation) ────
      const confidence = this._calibrateConfidence(best.score, slotCount.total, caseType);

      // ── Step 8: Build completeness assessment ─────────────────────────
      const completeness = this._assessCompleteness(slotCount, top3);

      // ── Step 9: Build explanation ─────────────────────────────────────
      const reasoning = this._buildReasoning(best, queryVector, constraints, caseType);

      return {
        constraints,
        procId: confidence >= 0.6 ? best.procId : null,
        caseType,
        slotsConsumed: slotCount.total,
        slotDetails: slotCount.details,
        completeness,
        dataTypesFound: [...queryVector.keys()],
        confidence,
        alternatives: top3.map((t, i) => ({
          rank: i + 1,
          procId: t.procId,
          procName: t.proc?.name,
          confidence: this._calibrateConfidence(t.score, slotCount.total, caseType),
          score: t.score,
          reasoning: t.reasoning
        })),
        reasoning,
        processingMs: Date.now() - startTime
      };

    } catch (err) {
      console.error('[Classifier] Error:', err);
      return {
        constraints: null, procId: null, caseType: null, slotsConsumed: 0,
        completeness: { sufficient: false }, confidence: 0,
        alternatives: [], reasoning: 'Classification failed: ' + err.message,
        error: err.message
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Build constraint map from atoms + flags
  // ─────────────────────────────────────────────────────────────────────────
  _buildConstraints(atoms, flags) {
    const c = {
      TL: null, theta: null, phi: null, alpha: null, beta: null,
      h_A: null, d_A: null, h_B: null, d_B: null,
      L_TV: null, L_FV: null, delta_X: null,
      h_mid: null, d_mid: null, VT_h: null, HT_d: null,
      L_SV: null, gamma: null,
      special: []
    };

    // Apply special flags first (they may override)
    for (const f of flags) {
      if (f.effect.theta !== undefined) c.theta = f.effect.theta;
      if (f.effect.phi !== undefined) c.phi = f.effect.phi;
      if (f.flag === 'ON_BOTH' || f.flag === 'ON_XY') {
        const ep = f.endpoint || 'A';
        if (ep === 'A') { c.h_A = 0; c.d_A = 0; }
        else { c.h_B = 0; c.d_B = 0; }
      }
      if (f.flag === 'EQUAL_DIST_N' && f.value !== undefined) {
        const ep = f.endpoint || 'A';
        if (ep === 'A') { c.h_A = f.value; c.d_A = f.value; }
        else { c.h_B = f.value; c.d_B = f.value; }
      }
      if (f.flag === 'ON_HP') {
        const ep = f.endpoint || 'A';
        if (ep === 'A') c.h_A = 0;
        else c.h_B = 0;
      }
      if (f.flag === 'ON_VP') {
        const ep = f.endpoint || 'A';
        if (ep === 'A') c.d_A = 0;
        else c.d_B = 0;
      }
      c.special.push(f.flag);
    }

    // Apply atom values
    for (const a of atoms) {
      if (c[a.field] === null) c[a.field] = a.value;  // Don't override flag-set values unless null
    }

    return c;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: Count slots with multi-slot awareness
  // ─────────────────────────────────────────────────────────────────────────
  _countSlots(atoms, flags) {
    let total = atoms.length;
    const details = atoms.map(a => ({
      dataType: a.dataType, field: a.field, slots: 1,
      value: a.value, source: a.source
    }));

    for (const f of flags) {
      if (f.slots > 0) {
        total += f.slots;
        details.push({ dataType: f.id, flag: f.flag, slots: f.slots });
      }
    }

    return { total, details };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: Build query feature vector (Set of data type IDs)
  // ─────────────────────────────────────────────────────────────────────────
  _buildQueryVector(atoms, flags) {
    const v = new Map();

    for (const a of atoms) {
      v.set(a.dataType, (v.get(a.dataType) || 0) + (this.SLOT_WEIGHTS[a.dataType] || 1));
    }

    for (const f of flags) {
      if (f.slots > 0) {
        v.set(f.id, (v.get(f.id) || 0) + (this.SLOT_WEIGHTS[f.id] || 1) * f.slots);
      }
    }

    return v;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4: Score all PROCs with weighted Jaccard similarity + priority bonus
  // ─────────────────────────────────────────────────────────────────────────
  _scoreAllProcs(queryVector, constraints, slotCount) {
    const querySet = new Set(queryVector.keys());
    const results = [];

    for (const proc of this.config.PROC_COMBINATIONS) {
      const procSet = new Set(proc.slots);

      // Weighted intersection score
      let intersectionScore = 0;
      let unionScore = 0;
      const matchedSlots = [];
      const missingSlots = [];

      for (const slot of procSet) {
        const w = this.SLOT_WEIGHTS[slot] || 1;
        if (querySet.has(slot)) {
          intersectionScore += w;
          matchedSlots.push(slot);
        } else {
          missingSlots.push(slot);
        }
        unionScore += w;
      }

      // Also add query-only weights to union
      for (const [qSlot, qW] of queryVector.entries()) {
        if (!procSet.has(qSlot)) unionScore += qW;
      }

      // Weighted Jaccard similarity
      const jaccardScore = unionScore > 0 ? intersectionScore / unionScore : 0;

      // Coverage bonus: what fraction of PROC slots are matched?
      const coverageScore = procSet.size > 0 ? matchedSlots.length / procSet.size : 0;

      // Priority bonus (normalized)
      const priorityBonus = proc.priority / 100 * 0.05;

      // Case type match bonus
      const caseBonus = (this._detectCase(constraints) === proc.caseType) ? 0.1 : 0;

      // Combined score (weighted ensemble)
      const score = (jaccardScore * 0.5) + (coverageScore * 0.4) + priorityBonus + caseBonus;

      const reasoning = this._buildProcReasoning(proc, matchedSlots, missingSlots, score, coverageScore);

      results.push({
        procId: proc.procId,
        proc,
        score,
        coverageScore,
        jaccardScore,
        matchedSlots,
        missingSlots,
        reasoning
      });
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 5: Detect engineering case type
  // ─────────────────────────────────────────────────────────────────────────
  _detectCase(c) {
    if (c.theta === 90) return '2A';
    if (c.phi === 90) return '2B';
    if (c.theta !== null && c.phi !== null && Math.abs(c.theta + c.phi - 90) < 0.5) return 'D★';
    if (c.theta !== null && c.theta > 0 && c.phi !== null && c.phi > 0) return 'D';
    if (c.theta !== null && c.theta > 0 && c.phi === 0) return 'C';
    if (c.phi !== null && c.phi > 0 && c.theta === 0) return 'B';
    if (c.theta === 0 && c.phi === 0) return 'A';
    // Fallback: check special flags
    if (c.special.includes('PARALLEL_HP') && c.special.includes('PARALLEL_VP')) return 'A';
    if (c.special.includes('PARALLEL_HP') && !c.special.includes('PARALLEL_VP')) return 'B';
    if (c.special.includes('PARALLEL_VP') && !c.special.includes('PARALLEL_HP')) return 'C';
    if (c.special.includes('PERP_HP')) return '2A';
    if (c.special.includes('PERP_VP')) return '2B';
    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 6: Calibrate confidence score (Platt scaling approximation)
  // Maps raw [0,1] score → calibrated probability with slot-count correction
  // ─────────────────────────────────────────────────────────────────────────
  _calibrateConfidence(rawScore, slotCount, caseType) {
    // Logistic calibration: P = 1 / (1 + exp(-k*(score - 0.5)))
    const k = 8;  // steepness
    let calibrated = 1 / (1 + Math.exp(-k * (rawScore - 0.5)));

    // Slot count correction: penalize if too few slots
    if (slotCount < 3) calibrated *= 0.5;
    else if (slotCount < 4) calibrated *= 0.75;
    else if (slotCount < 5) calibrated *= 0.90;

    // Case type certainty bonus
    if (caseType !== null) calibrated = Math.min(1, calibrated + 0.03);

    return Math.round(calibrated * 100) / 100;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 7: Completeness assessment with missing slot identification
  // ─────────────────────────────────────────────────────────────────────────
  _assessCompleteness(slotCount, top3) {
    const nearest = top3[0];
    const missing = nearest ? nearest.missingSlots : [];

    // Get human-readable names for missing slots
    const missingDescriptions = missing.map(slotId => {
      const dtype = this.config && this.config.DATA_TYPES[slotId];
      const sk = this.config && this.config.SPECIAL_CONDITIONS && this.config.SPECIAL_CONDITIONS[slotId];
      return dtype ? `${dtype.name} (${dtype.symbol})` : sk ? sk.description : slotId;
    });

    return {
      sufficient: slotCount.total >= 5,
      slotsFound: slotCount.total,
      slotsRequired: 5,
      missing: missingDescriptions,
      missingIds: missing,
      nearestProcId: nearest?.procId,
      nearestProcName: nearest?.proc?.name,
      coveragePercent: nearest ? Math.round(nearest.coverageScore * 100) : 0
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 8: Build human-readable reasoning
  // ─────────────────────────────────────────────────────────────────────────
  _buildReasoning(best, queryVector, constraints, caseType) {
    if (!best.proc) return 'No matching PROC found.';

    const lines = [
      `Selected ${best.procId} (${best.proc.name}) with score ${(best.score * 100).toFixed(1)}%.`,
      `Case type: ${caseType || 'undetermined'}.`,
      `Matched slots: ${best.matchedSlots.join(', ')}.`
    ];

    if (best.missingSlots.length > 0) {
      lines.push(`Unmatched in PROC: ${best.missingSlots.join(', ')}.`);
    }

    const extraSlots = [...queryVector.keys()].filter(s => !best.proc.slots.includes(s));
    if (extraSlots.length > 0) {
      lines.push(`Extra data not in PROC definition: ${extraSlots.join(', ')}.`);
    }

    if (constraints.theta !== null && constraints.phi !== null) {
      lines.push(`θ=${constraints.theta}°, φ=${constraints.phi}° → θ+φ=${(constraints.theta + constraints.phi).toFixed(1)}°.`);
    }

    return lines.join(' ');
  }

  _buildProcReasoning(proc, matched, missing, score, coverage) {
    if (coverage === 1.0) return `Perfect slot match for ${proc.procId}.`;
    if (coverage >= 0.8) return `Strong match: ${matched.length}/${proc.slots.length} slots matched. Missing: ${missing.join(', ')}.`;
    if (coverage >= 0.6) return `Partial match: ${matched.length}/${proc.slots.length} slots matched.`;
    return `Weak match: only ${matched.length}/${proc.slots.length} slots matched.`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Pre-computation helpers
  // ─────────────────────────────────────────────────────────────────────────
  _buildProcVectors() {
    const vectors = {};
    for (const proc of (this.config?.PROC_COMBINATIONS || [])) {
      const v = new Map();
      for (const slot of proc.slots) {
        v.set(slot, this.SLOT_WEIGHTS[slot] || 1);
      }
      vectors[proc.procId] = v;
    }
    return vectors;
  }

  _buildTrainingIndex() {
    // Build a simple inverted index over training examples for semantic matching
    const index = {};
    for (const proc of (this.config?.PROC_COMBINATIONS || [])) {
      for (const ex of (proc.trainingExamples || [])) {
        const words = ex.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        for (const w of words) {
          if (!index[w]) index[w] = [];
          if (!index[w].includes(proc.procId)) index[w].push(proc.procId);
        }
      }
    }
    return index;
  }

  /**
   * Semantic similarity boost using training example word overlap
   * Returns a small bonus score [0, 0.1] for procs whose training examples
   * share keywords with the query
   */
  _semanticBoost(queryText, procId) {
    if (!queryText) return 0;
    const words = queryText.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    let hits = 0;
    for (const w of words) {
      if (this._trainingIndex[w] && this._trainingIndex[w].includes(procId)) hits++;
    }
    return Math.min(0.1, hits * 0.01);
  }
}

if (typeof window !== 'undefined') window.ParserClassifier = ParserClassifier;
if (typeof module !== 'undefined' && module.exports) module.exports = ParserClassifier;