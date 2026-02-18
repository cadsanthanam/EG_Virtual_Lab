/**
 * lines-parser-extractor.js
 * Enterprise Extractor — ML-Enhanced Edition
 * Multi-pass NER: endpoint-detect → special-conditions → paired-angles → numerical-extract → context-resolve
 * Handles: all 18 data types, all 13 special conditions, implicit endpoints, 'one end...other end' patterns
 * Version: 4.0.0 Enterprise ML
 */

class ParserExtractor {
  constructor(config) {
    this.config = config || (typeof window !== 'undefined' ? window.ParserConfig : null);
    this._buildPatternCache();
  }

  /**
   * Main extraction entry point
   * @param {string} normText - Normalized text (from ParserNormalizer)
   * @param {string} origText - Original text (for endpoint detection)
   * @returns {{ atoms: [], endpoints: [], specialFlags: [], metadata: {} }}
   */
  extract(normText, origText) {
    const startTime = Date.now();
    try {
      // ── Pass 1: Detect endpoints ────────────────────────────────────────
      const endpoints = this._detectEndpoints(origText || normText);

      // ── Pass 2: Extract special conditions (flags with slot cost) ───────
      const specialFlags = this._extractSpecial(normText, endpoints);

      // ── Pass 3: Extract paired angles (30° to HP and 45° to VP) ─────────
      const pairedAngles = this._extractPairedAngles(normText);

      // ── Pass 4: Numerical extraction for all 18 data types ──────────────
      const numerical = this._extractAllNumerical(normText, endpoints, pairedAngles, specialFlags);

      // ── Pass 5: Context-aware deduplication and resolution ───────────────
      const atoms = this._resolveAndDeduplicate([...pairedAngles, ...numerical], endpoints, normText);

      // ── Pass 6: Implicit endpoint resolution ─────────────────────────────
      this._resolveImplicitEndpoints(atoms, endpoints, normText);

      // ── Pass 7: Validate semantic consistency ─────────────────────────────
      const validAtoms = this._validateAtoms(atoms);

      return {
        atoms: validAtoms,
        endpoints,
        specialFlags,
        metadata: {
          atomCount: validAtoms.length,
          specialCount: specialFlags.length,
          endpointsFound: endpoints,
          processingMs: Date.now() - startTime,
          method: 'multi-pass-nlp-ner',
          confidence: this._computeConfidence(validAtoms, specialFlags)
        }
      };

    } catch (err) {
      console.error('[Extractor] Error:', err);
      return {
        atoms: [], endpoints: [], specialFlags: [],
        metadata: { error: err.message, processingMs: Date.now() - startTime }
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PASS 1: Endpoint Detection — Disambiguates article "A" from endpoint A
  // ─────────────────────────────────────────────────────────────────────────
  _detectEndpoints(text) {
    const eps = new Set();

    // Strategy 1: Two-letter line labels (AB, PQ, CD, MN, etc.)
    for (const m of text.matchAll(/\b([A-Z])([A-Z])\b/g)) {
      // Only consider uppercase pairs that look like labels
      if (/[A-Z]{2}/.test(m[0]) && !['HP', 'VP', 'PP', 'XY', 'HT', 'VT', 'TV', 'FV', 'SV', 'TL'].includes(m[0])) {
        eps.add(m[1]); eps.add(m[2]);
      }
    }

    // Strategy 2: Explicit "end A", "point A", "end B"
    for (const m of text.matchAll(/\b(?:end|point)\s+([A-Z])\b/gi)) {
      eps.add(m[1].toUpperCase());
    }

    // Strategy 3: Implicit endpoint from context "one end ... other end"
    if (/\bone\s+end\b/i.test(text) || /\bother\s+end\b/i.test(text)) {
      // Default to A and B if no explicit endpoints
      if (eps.size === 0) { eps.add('A'); eps.add('B'); }
    }

    // Strategy 4: Single letter with clear endpoint context
    for (const m of text.matchAll(/\b([A-Z])\s+is\s+\d+mm\s+(?:above|below|in front of|behind)\b/gi)) {
      const candidate = m[1].toUpperCase();
      if (!['I', 'A'].includes(candidate) || eps.has(candidate)) eps.add(candidate);
    }

    const arr = Array.from(eps).sort();

    // Disambiguation: remove article "A" if no clear endpoint context
    if (arr.includes('A') && eps.size === 1) {
      const hasEndpointContext = /\b(?:AB|AC|end\s*A|point\s*A|A\s+is\s+\d)/i.test(text);
      if (!hasEndpointContext) return arr.filter(e => e !== 'A');
    }

    return arr.length > 0 ? arr : ['A', 'B'];  // Default endpoints
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PASS 2: Special Conditions (SK01–SK13)
  // ─────────────────────────────────────────────────────────────────────────
  _extractSpecial(text, endpoints) {
    const flags = [];
    const epA = endpoints[0] || 'A';
    const epB = endpoints[1] || 'B';

    // SK01: Parallel to HP
    if (/parallel\s+to\s+(?:the\s+)?HP/i.test(text)) {
      flags.push({ id: 'SK01', flag: 'PARALLEL_HP', slots: 1, effect: { theta: 0 } });
    }

    // SK02: Parallel to VP
    if (/parallel\s+to\s+(?:the\s+)?VP/i.test(text)) {
      flags.push({ id: 'SK02', flag: 'PARALLEL_VP', slots: 1, effect: { phi: 0 } });
    }

    // SK03: Perpendicular to HP (vertical)
    if (/perpendicular\s+to\s+(?:the\s+)?HP|vertical\s+line/i.test(text)) {
      flags.push({ id: 'SK03', flag: 'PERP_HP', slots: 1, effect: { theta: 90 } });
    }

    // SK04: Perpendicular to VP
    if (/perpendicular\s+to\s+(?:the\s+)?VP/i.test(text)) {
      flags.push({ id: 'SK04', flag: 'PERP_VP', slots: 1, effect: { phi: 90 } });
    }

    // SK07: On BOTH HP and VP (must check before SK05/SK06)
    const onBothMatch = /(?:end|point)\s+([a-z])\s+(?:is\s+)?(?:on|in)\s+both\s+(?:HP\s+and\s+VP|VP\s+and\s+HP)/i.exec(text)
      || /(?:on|in)\s+both\s+(?:HP\s+and\s+VP|VP\s+and\s+HP)/i.exec(text);
    if (onBothMatch) {
      const ep = (onBothMatch[1] || epA).toUpperCase();
      flags.push({ id: 'SK07', flag: 'ON_BOTH', slots: 2, effect: { h: 0, d: 0 }, endpoint: ep });
    }

    // SK10: On XY axis (h=0, d=0)
    const xyMatch = /(?:intersects?|meets?|on|crosses?)\s+(?:the\s+)?XY/i.exec(text);
    if (xyMatch) {
      // Find which endpoint
      const lookback = text.substring(Math.max(0, xyMatch.index - 40), xyMatch.index);
      const ep = this._findEndpointInText(lookback, endpoints) || epA;
      flags.push({ id: 'SK10', flag: 'ON_XY', slots: 2, effect: { h: 0, d: 0 }, endpoint: ep });
    }

    // SK08: Equal distance from BOTH (numeric value given)
    const eqDistMatch = /(\d+(?:\.\d+)?)\s*mm\s+from\s+both\s+(?:HP\s+and\s+VP|planes?)/i.exec(text)
      || /(\d+(?:\.\d+)?)\s*mm\s+(?:from\s+each|equally\s+(?:from|distant))/i.exec(text);
    if (eqDistMatch) {
      const ep = this._findEndpointInText(text.substring(Math.max(0, eqDistMatch.index - 40), eqDistMatch.index), endpoints) || epA;
      flags.push({ id: 'SK08', flag: 'EQUAL_DIST_N', slots: 2, value: parseFloat(eqDistMatch[1]), effect: { h: 'N', d: 'N' }, endpoint: ep });
    }

    // SK09: Equidistant (value unknown)
    if (!eqDistMatch && /equidistant\s+from\s+both|equal\s+distances?\s+from\s+both/i.test(text)) {
      flags.push({ id: 'SK09', flag: 'EQUAL_DIST_UNK', slots: 1, effect: { constraint: 'h=d' } });
    }

    // SK05: On HP (specific endpoint) — after SK07 check
    if (!flags.some(f => f.flag === 'ON_BOTH')) {
      for (const m of text.matchAll(/(?:end\s+|point\s+)?([a-z])\s+(?:is\s+)?(?:in|on|lies?\s+(?:in|on))\s+(?:the\s+)?HP(?!\s+and)/gi)) {
        const ep = m[1].toUpperCase();
        if (endpoints.includes(ep) || ep === 'A' || ep === 'B') {
          // Make sure it's not SK07 territory
          if (!/(HP\s+and\s+VP|both)/i.test(text.substring(m.index, m.index + 20))) {
            flags.push({ id: 'SK05', flag: 'ON_HP', slots: 1, effect: { h: 0 }, endpoint: ep });
          }
        }
      }

      // "end A is in HP" without explicit letter
      if (/\bone\s+end\s+(?:is\s+)?(?:in|on)\s+(?:the\s+)?HP/i.test(text)) {
        if (!flags.some(f => f.flag === 'ON_HP')) {
          flags.push({ id: 'SK05', flag: 'ON_HP', slots: 1, effect: { h: 0 }, endpoint: epA });
        }
      }
    }

    // SK06: On VP (specific endpoint)
    if (!flags.some(f => f.flag === 'ON_BOTH')) {
      for (const m of text.matchAll(/(?:end\s+|point\s+)?([a-z])\s+(?:is\s+)?(?:in|on|lies?\s+(?:in|on))\s+(?:the\s+)?VP/gi)) {
        const ep = m[1].toUpperCase();
        if (endpoints.includes(ep) || ep === 'A' || ep === 'B') {
          flags.push({ id: 'SK06', flag: 'ON_VP', slots: 1, effect: { d: 0 }, endpoint: ep });
        }
      }
    }

    // SK11: Midpoint routing flag
    if (/mid(?:dle|[-\s]?point)|centre\s+of\s+(?:the\s+)?line/i.test(text)) {
      flags.push({ id: 'SK11', flag: 'MIDPOINT', slots: 0, effect: {} });
    }

    // SK12: Trace requirement
    if (/(?:mark|find|show|locate)\s+(?:its\s+)?traces?|(?:HT|VT)\s+and\s+(?:VT|HT)/i.test(text)) {
      flags.push({ id: 'SK12', flag: 'TRACE_REQ', slots: 0, effect: {} });
    }

    // SK13: First quadrant context
    if (/first\s+(?:quadrant|angle|dihedral)|1st\s+(?:quadrant|angle)/i.test(text)) {
      flags.push({ id: 'SK13', flag: 'FIRST_QUAD', slots: 0, effect: {} });
    }

    return flags;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PASS 3: Paired angle extraction (handles both orders)
  // ─────────────────────────────────────────────────────────────────────────
  _extractPairedAngles(text) {
    const pairs = [];
    let m;

    // Pattern: "30° to HP and 45° to VP" (any order, any separator)
    const templates = [
      // HP then VP
      {
        re: /(\d+(?:\.\d+)?)°\s*(?:to|with)\s+HP[^.]*?(\d+(?:\.\d+)?)°\s*(?:to|with)\s+VP/i,
        assign: (a, b) => [{ dtype: 'D02', field: 'theta', val: a }, { dtype: 'D03', field: 'phi', val: b }]
      },
      // VP then HP
      {
        re: /(\d+(?:\.\d+)?)°\s*(?:to|with)\s+VP[^.]*?(\d+(?:\.\d+)?)°\s*(?:to|with)\s+HP/i,
        assign: (a, b) => [{ dtype: 'D03', field: 'phi', val: a }, { dtype: 'D02', field: 'theta', val: b }]
      },
      // "inclined at 30° and 45°" (order: theta then phi, inferred)
      {
        re: /inclined?\s+(?:at\s+)?(\d+(?:\.\d+)?)°\s+(?:to\s+HP\s+)?and\s+(\d+(?:\.\d+)?)°\s+to\s+VP/i,
        assign: (a, b) => [{ dtype: 'D02', field: 'theta', val: a }, { dtype: 'D03', field: 'phi', val: b }]
      },
    ];

    for (const { re, assign } of templates) {
      if (m = re.exec(text)) {
        const assigned = assign(parseFloat(m[1]), parseFloat(m[2]));
        pairs.push(...assigned.map(a => ({ dataType: a.dtype, field: a.field, value: a.val, endpoint: null, source: 'paired' })));
        break;
      }
    }

    return pairs;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PASS 4: Comprehensive numerical extraction for all 18 data types
  // ─────────────────────────────────────────────────────────────────────────
  _extractAllNumerical(text, endpoints, paired, specialFlags) {
    const atoms = [];
    const epA = endpoints[0] || 'A';
    const epB = endpoints[1] || 'B';
    const hasPaired = paired.length > 0;
    const pairedFields = new Set(paired.map(p => p.field));

    // ── D01: True Length ─────────────────────────────────────────────────
    // Important: "top view of 75mm long line" — 75 is TL, not L_TV
    let m;
    const tlPatterns = [
      /(\d+(?:\.\d+)?)\s*mm\s+long\s+(?:straight\s+)?line/i,      // "75mm long line"
      /line\s+(?:\w{1,4}\s+)?(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+long/i, // "line AB 75mm long"
      /line\s+(?:\w{1,4}\s+)?(\d+(?:\.\d+)?)\s*mm\s+(?:in\s+)?(?:true\s+)?length/i,
      /(?:true\s+)?length\s+(?:of\s+(?:the\s+)?line\s+(?:\w+\s+)?(?:is\s+)?)?(\d+(?:\.\d+)?)\s*mm/i,
      /(\d+(?:\.\d+)?)\s*mm\s+(?:in\s+)?length/i,
      /(?:it|line)\s+(?:has\s+)?(?:true\s+)?length\s+(?:of\s+)?(\d+(?:\.\d+)?)/i,
      // "A 75mm line" — when number immediately after article
      /^(?:a|an)\s+(\d+(?:\.\d+)?)\s*mm\s+(?:long\s+)?(?:straight\s+)?line/i
    ];

    for (const pat of tlPatterns) {
      if (m = pat.exec(text)) {
        atoms.push({ dataType: 'D01', field: 'TL', value: parseFloat(m[1]), source: 'pattern' });
        break;
      }
    }

    // ── D02/D03: Inclination angles (only if not already from paired) ────
    if (!hasPaired || !pairedFields.has('theta')) {
      // Single theta
      const thetaPatterns = [
        /(?:inclined?\s+(?:at\s+)?)?(\d+(?:\.\d+)?)°\s*(?:to|with)\s+(?:the\s+)?HP/i,
        /(?:inclination|angle)\s+(?:to|with)\s+HP\s+(?:is\s+)?(\d+(?:\.\d+)?)°/i,
        /HP\s+(?:at|=|:)\s*(\d+(?:\.\d+)?)°/i
      ];
      for (const pat of thetaPatterns) {
        if (m = pat.exec(text)) {
          atoms.push({ dataType: 'D02', field: 'theta', value: parseFloat(m[1]), source: 'pattern' });
          break;
        }
      }
    }

    if (!hasPaired || !pairedFields.has('phi')) {
      // Single phi
      const phiPatterns = [
        /(?:inclined?\s+(?:at\s+)?)?(\d+(?:\.\d+)?)°\s*(?:to|with)\s+(?:the\s+)?VP/i,
        /(?:inclination|angle)\s+(?:to|with)\s+VP\s+(?:is\s+)?(\d+(?:\.\d+)?)°/i,
        /VP\s+(?:at|=|:)\s*(\d+(?:\.\d+)?)°/i
      ];
      for (const pat of phiPatterns) {
        if (m = pat.exec(text)) {
          atoms.push({ dataType: 'D03', field: 'phi', value: parseFloat(m[1]), source: 'pattern' });
          break;
        }
      }
    }

    // ── D04/D05/D06/D07: End positions — context-aware ──────────────────
    this._extractEndpointPositions(text, atoms, endpoints, specialFlags);

    // ── D08: Top View length ──────────────────────────────────────────────
    // Critical: "top view of 75mm long line measures 65mm" → L_TV=65, TL=75
    const tvPatterns = [
      /top\s+view\s+(?:\w+\s+)?(?:measures?|is)\s+(\d+(?:\.\d+)?)\s*mm(?!\s+long)/i,
      /(?:its\s+)?top\s+view\s+(?:length\s+)?(?:is|=)\s*(\d+(?:\.\d+)?)\s*mm/i,
      /(?:top\s+view|plan|TV)\s+(?:measures?|is)\s*(\d+(?:\.\d+)?)\s*mm/i,
      /(\d+(?:\.\d+)?)\s*mm\s+(?:long\s+)?(?:in\s+)?top\s+view/i,
      // "plan view = 65mm"
      /plan\s+(?:view\s+)?(?:measures?|is|=)\s*(\d+(?:\.\d+)?)\s*mm/i
    ];
    for (const pat of tvPatterns) {
      if (m = pat.exec(text)) {
        // Make sure this isn't the TL value we already captured
        const val = parseFloat(m[1]);
        if (!atoms.some(a => a.field === 'TL' && a.value === val)) {
          atoms.push({ dataType: 'D08', field: 'L_TV', value: val, source: 'pattern' });
          break;
        }
      }
    }

    // ── D09: Front View length ───────────────────────────────────────────
    const fvPatterns = [
      /front\s+view\s+(?:\w+\s+)?(?:measures?|is)\s+(\d+(?:\.\d+)?)\s*mm/i,
      /(?:elevation|FV)\s+(?:measures?|is|=)\s*(\d+(?:\.\d+)?)\s*mm/i,
      /(\d+(?:\.\d+)?)\s*mm\s+(?:in\s+)?front\s+view/i
    ];
    for (const pat of fvPatterns) {
      if (m = pat.exec(text)) {
        atoms.push({ dataType: 'D09', field: 'L_FV', value: parseFloat(m[1]), source: 'pattern' });
        break;
      }
    }

    // ── D10: Alpha (TV angle) ────────────────────────────────────────────
    const alphaPatterns = [
      /(?:top\s+view|plan|TV)\s+(?:makes?|is)\s+(?:an?\s+angle\s+of\s+)?(\d+(?:\.\d+)?)°\s*(?:with|to)\s+XY/i,
      /(?:apparent\s+)?angle\s+(?:of\s+)?(?:top\s+view|plan)\s+(?:is\s+)?(\d+(?:\.\d+)?)°/i
    ];
    for (const pat of alphaPatterns) {
      if (m = pat.exec(text)) {
        atoms.push({ dataType: 'D10', field: 'alpha', value: parseFloat(m[1]), source: 'pattern' });
        break;
      }
    }

    // ── D11: Beta (FV angle) ─────────────────────────────────────────────
    const betaPatterns = [
      /(?:front\s+view|elevation|FV)\s+(?:makes?|is)\s+(?:an?\s+angle\s+of\s+)?(\d+(?:\.\d+)?)°\s*(?:with|to)\s+XY/i,
      /(?:apparent\s+)?angle\s+(?:of\s+)?(?:front\s+view|elevation)\s+(?:is\s+)?(\d+(?:\.\d+)?)°/i
    ];
    for (const pat of betaPatterns) {
      if (m = pat.exec(text)) {
        atoms.push({ dataType: 'D11', field: 'beta', value: parseFloat(m[1]), source: 'pattern' });
        break;
      }
    }

    // ── D12: Projector distance ───────────────────────────────────────────
    const dxPatterns = [
      /projectors?\s+(?:are\s+)?(\d+(?:\.\d+)?)\s*mm\s+apart/i,
      /(\d+(?:\.\d+)?)\s*mm\s+(?:between|apart).{0,25}projectors?/i,
      /end\s+projectors?\s+(?:are\s+)?(\d+(?:\.\d+)?)\s*mm/i,
      /distance\s+between\s+(?:end\s+)?projectors?\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm/i
    ];
    for (const pat of dxPatterns) {
      if (m = pat.exec(text)) {
        atoms.push({ dataType: 'D12', field: 'delta_X', value: parseFloat(m[1]), source: 'pattern' });
        break;
      }
    }

    // ── D13/D14: Midpoint positions ───────────────────────────────────────
    if (specialFlags.some(f => f.flag === 'MIDPOINT')) {
      const midAbove = /mid(?:dle|[-\s]?point)?\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+above\s+HP/i.exec(text);
      if (midAbove) atoms.push({ dataType: 'D13', field: 'h_mid', value: parseFloat(midAbove[1]), source: 'pattern' });

      const midFront = /mid(?:dle|[-\s]?point)?\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+(?:in\s+front\s+of|from)\s+VP/i.exec(text);
      if (midFront) atoms.push({ dataType: 'D14', field: 'd_mid', value: parseFloat(midFront[1]), source: 'pattern' });
    }

    // ── D15/D16: Traces ────────────────────────────────────────────────────
    const vtMatch = /VT\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+above\s+HP/i.exec(text);
    if (vtMatch) atoms.push({ dataType: 'D15', field: 'VT_h', value: parseFloat(vtMatch[1]), source: 'pattern' });

    const htMatch = /HT\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+(?:in\s+front\s+of|from)\s+VP/i.exec(text);
    if (htMatch) atoms.push({ dataType: 'D16', field: 'HT_d', value: parseFloat(htMatch[1]), source: 'pattern' });

    // ── D17: Side View length ─────────────────────────────────────────────
    const svMatch = /side\s+view\s+(?:is|measures?)\s+(\d+(?:\.\d+)?)\s*mm/i.exec(text);
    if (svMatch) atoms.push({ dataType: 'D17', field: 'L_SV', value: parseFloat(svMatch[1]), source: 'pattern' });

    // ── D18: Inclination to PP ────────────────────────────────────────────
    const ppMatch = /(\d+(?:\.\d+)?)°\s*(?:to|with)\s+(?:profile\s+plane|PP)/i.exec(text);
    if (ppMatch) atoms.push({ dataType: 'D18', field: 'gamma', value: parseFloat(ppMatch[1]), source: 'pattern' });

    return atoms;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PASS 4 helper: Endpoint position extraction with context-window analysis
  // ─────────────────────────────────────────────────────────────────────────
  _extractEndpointPositions(text, atoms, endpoints, specialFlags) {
    const epA = endpoints[0] || 'A';
    const epB = endpoints[1] || 'B';

    // Skip h_A if SK07/SK10/SK05 already sets it to 0
    const hasSkipHA = specialFlags.some(f =>
      (f.flag === 'ON_BOTH' || f.flag === 'ON_XY') && f.endpoint === epA
    ) || specialFlags.some(f => f.flag === 'ON_HP' && f.endpoint === epA);
    const hasSkipDA = specialFlags.some(f =>
      (f.flag === 'ON_BOTH' || f.flag === 'ON_XY') && f.endpoint === epA
    ) || specialFlags.some(f => f.flag === 'ON_VP' && f.endpoint === epA);

    // ── Explicit "above HP" / "below HP" with contextual endpoint detection ──
    for (const match of text.matchAll(/(\d+(?:\.\d+)?)\s*mm\s+(above|below)\s+(?:the\s+)?HP/gi)) {
      const val = parseFloat(match[1]) * (match[2].toLowerCase() === 'below' ? -1 : 1);
      const lookback = text.substring(Math.max(0, match.index - 60), match.index);
      const lookahead = text.substring(match.index, Math.min(text.length, match.index + 30));

      const ep = this._resolveEndpointContext(lookback, lookahead, endpoints);

      if (ep === epA && !hasSkipHA && !atoms.some(a => a.field === 'h_A')) {
        atoms.push({ dataType: 'D04', field: 'h_A', value: val, endpoint: epA, source: 'position' });
      } else if (ep === epB && !atoms.some(a => a.field === 'h_B')) {
        atoms.push({ dataType: 'D06', field: 'h_B', value: val, endpoint: epB, source: 'position' });
      }
    }

    // ── "in front of VP" / "behind VP" ────────────────────────────────────
    for (const match of text.matchAll(/(\d+(?:\.\d+)?)\s*mm\s+(?:(in\s+front\s+of|behind)\s+(?:the\s+)?VP)/gi)) {
      const val = parseFloat(match[1]) * (match[2].toLowerCase().includes('behind') ? -1 : 1);
      const lookback = text.substring(Math.max(0, match.index - 60), match.index);
      const lookahead = text.substring(match.index, Math.min(text.length, match.index + 30));

      const ep = this._resolveEndpointContext(lookback, lookahead, endpoints);

      if (ep === epA && !hasSkipDA && !atoms.some(a => a.field === 'd_A')) {
        atoms.push({ dataType: 'D05', field: 'd_A', value: val, endpoint: epA, source: 'position' });
      } else if (ep === epB && !atoms.some(a => a.field === 'd_B')) {
        atoms.push({ dataType: 'D07', field: 'd_B', value: val, endpoint: epB, source: 'position' });
      }
    }

    // ── "one end X above HP, other end Y above HP" pattern ────────────────
    const oneEnd = text.match(/one\s+end\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+(above|below)\s+HP/i);
    const otherEnd = text.match(/other\s+end\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+(above|below)\s+HP/i);
    if (oneEnd && !atoms.some(a => a.field === 'h_A')) {
      const val = parseFloat(oneEnd[1]) * (oneEnd[2].toLowerCase() === 'below' ? -1 : 1);
      atoms.push({ dataType: 'D04', field: 'h_A', value: val, endpoint: epA, source: 'one-end-pattern' });
    }
    if (otherEnd && !atoms.some(a => a.field === 'h_B')) {
      const val = parseFloat(otherEnd[1]) * (otherEnd[2].toLowerCase() === 'below' ? -1 : 1);
      atoms.push({ dataType: 'D06', field: 'h_B', value: val, endpoint: epB, source: 'one-end-pattern' });
    }

    // ── EQUAL_DIST_N: if SK08 captured a value, set h_A=d_A=N ────────────
    const sk08 = specialFlags.find(f => f.flag === 'EQUAL_DIST_N');
    if (sk08 && sk08.value) {
      const ep = sk08.endpoint || epA;
      if (ep === epA) {
        if (!atoms.some(a => a.field === 'h_A')) atoms.push({ dataType: 'D04', field: 'h_A', value: sk08.value, endpoint: epA, source: 'sk08' });
        if (!atoms.some(a => a.field === 'd_A')) atoms.push({ dataType: 'D05', field: 'd_A', value: sk08.value, endpoint: epA, source: 'sk08' });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PASS 5: Resolve and deduplicate (prefer higher-confidence sources)
  // ─────────────────────────────────────────────────────────────────────────
  _resolveAndDeduplicate(atoms, endpoints, text) {
    const sourcePriority = { 'paired': 3, 'pattern': 2, 'position': 2, 'one-end-pattern': 1, 'sk08': 2 };
    const map = new Map();

    for (const a of atoms) {
      const key = `${a.field}:${a.endpoint || 'null'}`;
      const existing = map.get(key);
      const aPriority = sourcePriority[a.source] || 0;
      if (!existing || aPriority > (sourcePriority[existing.source] || 0)) {
        map.set(key, a);
      }
    }

    return Array.from(map.values());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PASS 6: Implicit endpoint resolution
  // ─────────────────────────────────────────────────────────────────────────
  _resolveImplicitEndpoints(atoms, endpoints, text) {
    const epA = endpoints[0] || 'A';
    const epB = endpoints[1] || 'B';

    // If we have h_A but not h_B, and text mentions "other end X above", try to extract
    // (already handled in _extractEndpointPositions one-end-pattern)

    // If endpoint field missing, default to first/second endpoint heuristically
    for (const atom of atoms) {
      if (!atom.endpoint) {
        if (['h_A', 'd_A'].includes(atom.field)) atom.endpoint = epA;
        else if (['h_B', 'd_B'].includes(atom.field)) atom.endpoint = epB;
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PASS 7: Validate atoms
  // ─────────────────────────────────────────────────────────────────────────
  _validateAtoms(atoms) {
    return atoms.filter(a => {
      if (a.value === null || a.value === undefined || isNaN(a.value)) return false;
      // Domain validation
      const dtype = this.config && this.config.DATA_TYPES[a.dataType];
      if (dtype && dtype.domain) {
        const [min, max] = dtype.domain;
        if (a.value < min || a.value > max) {
          console.warn(`[Extractor] Value ${a.value} out of domain [${min}, ${max}] for ${a.dataType}`);
          return false;
        }
      }
      return true;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Resolve which endpoint is referred to in a context window
   * Uses proximity scoring: letter closest to measurement wins
   */
  _resolveEndpointContext(lookback, lookahead, endpoints) {
    const epA = endpoints[0] || 'A';
    const epB = endpoints[1] || 'B';

    // Check for explicit endpoint letters in lookback
    const context = lookback + ' ' + lookahead;

    // Explicit mention of epB closer than epA?
    const bIdx = context.lastIndexOf(epB);
    const aIdx = context.lastIndexOf(epA);

    // Keyword cues
    if (/\b(?:other\s+end|end\s+b|point\s+b|second\s+end|higher\s+end)\b/i.test(context)) return epB;
    if (/\b(?:one\s+end|end\s+a|point\s+a|first\s+end|lower\s+end)\b/i.test(context)) return epA;

    // Explicit "B is" or "b is"
    if (new RegExp(`\\b${epB}\\s+is\\b`, 'i').test(context)) return epB;
    if (new RegExp(`\\b${epA}\\s+is\\b`, 'i').test(context)) return epA;

    // Proximity: which endpoint letter appears more recently in lookback?
    if (bIdx > aIdx && bIdx !== -1) return epB;
    if (aIdx > bIdx && aIdx !== -1) return epA;

    // Default to first endpoint (A)
    return epA;
  }

  _findEndpointInText(text, endpoints) {
    for (const ep of [...endpoints].reverse()) {
      if (new RegExp(`\\b${ep}\\b`).test(text)) return ep;
    }
    return null;
  }

  _computeConfidence(atoms, flags) {
    const totalSlots = atoms.length + flags.reduce((s, f) => s + (f.slots || 0), 0);
    if (totalSlots >= 5) return 0.95;
    if (totalSlots >= 4) return 0.80;
    if (totalSlots >= 3) return 0.65;
    return 0.4;
  }

  _buildPatternCache() {
    // Pre-compile patterns from config if available
    this._configPatterns = {};
    if (this.config && this.config.DATA_TYPES) {
      for (const [id, dt] of Object.entries(this.config.DATA_TYPES)) {
        this._configPatterns[id] = (dt.extractPatterns || []).map(p => new RegExp(p.source, p.flags || 'i'));
      }
    }
  }
}

if (typeof window !== 'undefined') window.ParserExtractor = ParserExtractor;
if (typeof module !== 'undefined' && module.exports) module.exports = ParserExtractor;