/**
 * lines-parser-normalizer.js
 * Enterprise Text Normalization Module — ML-Enhanced Edition
 * Multi-stage pipeline: char-correction → Levenshtein typo fix → synonym expand → unit convert → semantic clean
 * Version: 4.0.0 Enterprise ML
 */

class ParserNormalizer {

  constructor(config) {
    this.config = config || (typeof window !== 'undefined' ? window.ParserConfig : null);
    this.stats = {
      totalNormalizations: 0, degreeFixes: 0,
      unitConversions: 0, abbreviationExpansions: 0,
      typoCorrections: 0, semanticExpansions: 0
    };

    // Levenshtein max edit distances by word length
    this.EDIT_DISTANCE_THRESHOLDS = { 4: 1, 6: 1, 8: 2, 12: 2, 99: 3 };

    // Common OCR character confusions
    this.CHAR_CORRECTIONS = [
      [/[|l]ine\b/g, 'line'],         // OCR: 'l' vs '|'
      [/(\d)\s*[oO]\s*(\d)/g, '$1 0 $2'],  // OCR '0' vs 'O'
      [/\bHP\s*[\.,]\s*VP/g, 'HP and VP'],  // "HP.VP" → "HP and VP"
    ];

    // Direct word replacement dictionary (sorted by length desc for priority)
    this.TYPO_DICT = this._buildTypoDict();

    // Synonym map for semantic normalization
    this.SYNONYM_MAP = this._buildSynonymMap();

    // Compiled degree patterns
    this.DEGREE_PATTERNS = [
      { pattern: /(\d+(?:\.\d+)?)\s*degrees?(?![a-z])/gi, label: 'degrees-word' },
      { pattern: /(\d+(?:\.\d+)?)\s*deg(?![a-z])/gi, label: 'deg-abbrev' },
      { pattern: /(\d+(?:\.\d+)?)\s*°/g, label: 'degree-symbol-variant' },
      { pattern: /(\d+(?:\.\d+)?)\s*º/g, label: 'ordinal-degree' },
      { pattern: /(\d+(?:\.\d+)?)\s*˚/g, label: 'ring-degree' },
      // Encoded variants from corrupted HTML/copy-paste
      { pattern: /(\d+(?:\.\d+)?)\s*Â°/g, label: 'utf8-corrupted' },
      { pattern: /(\d+(?:\.\d+)?)\s*&deg;/gi, label: 'html-entity' },
    ];
  }

  /**
   * Main normalization entry point — Multi-Stage Pipeline
   * @param {string} text - Raw input text
   * @returns {{ normalized: string, metadata: object }}
   */
  normalize(text) {
    if (!text || typeof text !== 'string') {
      return { normalized: '', metadata: { error: 'Invalid input', corrections: [], confidence: 0, changes: [] } };
    }

    const original = text;
    const corrections = [];
    const changes = [];
    const startTime = Date.now();

    try {
      let t = text;

      // ── Stage 1: Character-level corrections (OCR, encoding artifacts) ────
      t = this._fixCharacterErrors(t, corrections, changes);

      // ── Stage 2: Lowercase (preserve for downstream) ─────────────────────
      t = t.toLowerCase();

      // ── Stage 3: Normalize ALL degree symbol variants → '°' ──────────────
      const degRes = this._normalizeDegrees(t);
      if (degRes.changed) { t = degRes.text; changes.push('degree_normalization'); }

      // ── Stage 4: Levenshtein typo correction on individual words ─────────
      const typoRes = this._correctTypos(t);
      if (typoRes.corrections.length > 0) {
        t = typoRes.text;
        corrections.push(...typoRes.corrections);
        changes.push('typo_correction');
        this.stats.typoCorrections += typoRes.corrections.length;
      }

      // ── Stage 5: Synonym / abbreviation expansion ─────────────────────────
      const synRes = this._expandSynonyms(t);
      if (synRes.changed) { t = synRes.text; changes.push('synonym_expansion'); this.stats.semanticExpansions++; }

      // ── Stage 6: Plane abbreviation normalization ─────────────────────────
      const planeRes = this._normalizePlanes(t);
      if (planeRes.changed) { t = planeRes.text; changes.push('plane_normalization'); }

      // ── Stage 7: Unit standardization (cm→mm, m→mm, unit inference) ──────
      const unitRes = this._standardizeUnits(t);
      if (unitRes.changed) { t = unitRes.text; changes.push('unit_conversion'); this.stats.unitConversions += unitRes.count; }

      // ── Stage 8: Infer missing units for numbers adjacent to angle/length contexts ──
      const inferRes = this._inferMissingUnits(t);
      if (inferRes.changed) { t = inferRes.text; changes.push('unit_inference'); }

      // ── Stage 9: Grammar / whitespace cleanup ─────────────────────────────
      t = this._cleanGrammar(t);
      t = this._cleanWhitespace(t);

      const confidence = this._computeConfidence(original, t, corrections);

      this.stats.totalNormalizations++;

      return {
        normalized: t,
        metadata: {
          originalLength: original.length,
          normalizedLength: t.length,
          corrections,
          confidence,
          changes,
          processingMs: Date.now() - startTime,
          stats: { ...this.stats }
        }
      };

    } catch (err) {
      console.error('[Normalizer] Error:', err);
      return {
        normalized: text.toLowerCase(),
        metadata: { error: err.message, corrections, confidence: 0.5, changes }
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 1 — Character-level error correction
  // ─────────────────────────────────────────────────────────────────────────
  _fixCharacterErrors(text, corrections, changes) {
    let t = text;
    let changed = false;

    // Fix corrupted unicode degree symbols first (HTML-encoded, UTF-8 misread)
    const unicodeFixes = [
      [/Â°/g, '°'], [/â€˜/g, "'"], [/Ã‚Â°/g, '°'], [/&deg;/gi, '°'],
      [/&#176;/g, '°'], [/&#xB0;/gi, '°'],
      // Corrupted angle chars from PDF copy
      [/(\d)\s*Ëš/g, '$1°'], [/(\d)\s*Âº/g, '$1°']
    ];
    for (const [from, to] of unicodeFixes) {
      if (from.test(t)) { t = t.replace(from, to); changed = true; }
    }

    // Fix 'Î¸', 'Ï†', etc. (corrupted Greek letters)
    const greekFixes = [
      [/Î¸|θ_raw/g, 'θ'], [/Ï†/g, 'φ'], [/Î±/g, 'α'], [/Î²/g, 'β'],
      [/Î"/g, 'Δ'], [/â€™/g, "'"]
    ];
    for (const [from, to] of greekFixes) {
      if (from.test(t)) { t = t.replace(from, to); changed = true; }
    }

    // Fix corrupted parentheses or special chars
    t = t.replace(/â€"/g, '-').replace(/â€˜|â€™/g, "'").replace(/â€œ|â€/g, '"');

    // Apply char-level OCR corrections
    for (const [from, to] of this.CHAR_CORRECTIONS) {
      const before = t;
      t = t.replace(from, to);
      if (t !== before) changed = true;
    }

    if (changed) changes.push('character_correction');
    return t;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 3 — Normalize ALL degree representations → '°'
  // ─────────────────────────────────────────────────────────────────────────
  _normalizeDegrees(text) {
    let t = text;
    let changed = false;

    for (const { pattern, label } of this.DEGREE_PATTERNS) {
      const before = t;
      // "30 degrees" → "30°" — handle both 'degree' and 'degrees'
      t = t.replace(pattern, '$1°');
      if (t !== before) {
        changed = true;
        this.stats.degreeFixes++;
      }
    }

    // Collapse duplicate degree symbols: "30°°" → "30°"
    t = t.replace(/°+/g, '°');

    // Handle cases like "at 30 to HP" — bare number before plane → infer degree
    // (done in stage 8 - unit inference)

    return { text: t, changed };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 4 — Levenshtein-based typo correction
  // ─────────────────────────────────────────────────────────────────────────
  _correctTypos(text) {
    const words = text.split(/(\s+|,|\.|\(|\))/);  // split preserving delimiters
    const corrected = [];
    const corrections = [];

    for (const word of words) {
      const clean = word.replace(/[^a-z]/gi, '').toLowerCase();
      if (clean.length < 4 || /^\d+$/.test(clean)) {
        corrected.push(word);
        continue;
      }

      // Direct dictionary lookup (fast path)
      if (this.TYPO_DICT[clean]) {
        corrections.push({ original: word, corrected: this.TYPO_DICT[clean], method: 'dictionary' });
        corrected.push(word.replace(new RegExp(clean, 'i'), this.TYPO_DICT[clean]));
        continue;
      }

      // Levenshtein fuzzy matching (slower path)
      const fuzzy = this._fuzzyCorrect(clean);
      if (fuzzy && fuzzy !== clean) {
        corrections.push({ original: word, corrected: fuzzy, method: 'levenshtein', confidence: fuzzy.score });
        corrected.push(fuzzy.word);
      } else {
        corrected.push(word);
      }
    }

    return { text: corrected.join(''), corrections };
  }

  /**
   * Fuzzy match a word against the typo dictionary using Levenshtein distance
   * Returns { word, score } or null
   */
  _fuzzyCorrect(word) {
    if (word.length < 4) return null;
    const threshold = this._getEditThreshold(word.length);

    let bestMatch = null, bestDist = Infinity;

    for (const [typo, correct] of Object.entries(this.TYPO_DICT)) {
      if (Math.abs(typo.length - word.length) > threshold) continue;
      const dist = this._levenshtein(word, typo);
      if (dist <= threshold && dist < bestDist) {
        bestDist = dist;
        bestMatch = { word: correct, score: 1 - dist / Math.max(word.length, typo.length) };
      }
    }

    // Also check against tech vocabulary
    if (!bestMatch) {
      const techWords = ['parallel', 'perpendicular', 'inclined', 'inclination', 'horizontal',
        'vertical', 'projection', 'projectors', 'elevation', 'midpoint', 'measures', 'length', 'above', 'below', 'front', 'behind'];
      for (const w of techWords) {
        if (Math.abs(w.length - word.length) > threshold) continue;
        const dist = this._levenshtein(word, w);
        if (dist <= threshold && dist < bestDist) {
          bestDist = dist;
          bestMatch = { word: w, score: 1 - dist / Math.max(word.length, w.length) };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Levenshtein distance — O(n*m) dynamic programming
   */
  _levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }

  _getEditThreshold(len) {
    for (const [max, thresh] of Object.entries(this.EDIT_DISTANCE_THRESHOLDS).sort((a, b) => +a[0] - +b[0])) {
      if (len <= +max) return thresh;
    }
    return 3;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 5 — Synonym and abbreviation expansion
  // ─────────────────────────────────────────────────────────────────────────
  _expandSynonyms(text) {
    let t = text;
    let changed = false;

    // Multi-word synonyms first (longer match priority)
    const sorted = Object.entries(this.SYNONYM_MAP)
      .sort((a, b) => b[0].length - a[0].length);

    for (const [from, to] of sorted) {
      const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`\\b${escaped}\\b`, 'gi');
      if (re.test(t)) {
        t = t.replace(re, to);
        changed = true;
        this.stats.abbreviationExpansions++;
      }
    }

    return { text: t, changed };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 6 — Plane abbreviation normalization
  // ─────────────────────────────────────────────────────────────────────────
  _normalizePlanes(text) {
    let t = text;
    let changed = false;

    const replacements = [
      [/\bh\.p\.\b/gi, 'HP'], [/\bv\.p\.\b/gi, 'VP'], [/\bp\.p\.\b/gi, 'PP'],
      [/\bxy[-\s]?(?:line|axis|plane)?\b/gi, 'XY'],
      // Long form already handled in synonym map
    ];

    for (const [p, r] of replacements) {
      const before = t;
      t = t.replace(p, r);
      if (t !== before) changed = true;
    }

    return { text: t, changed };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 7 — Unit standardization
  // ─────────────────────────────────────────────────────────────────────────
  _standardizeUnits(text) {
    let t = text;
    let changed = false;
    let count = 0;

    // cm → mm (×10)
    t = t.replace(/(\d+(?:\.\d+)?)\s*cm(?![a-z])/gi, (_, n) => {
      changed = true; count++;
      return `${parseFloat(n) * 10}mm`;
    });

    // m → mm (×1000) — careful not to match 'mm'
    t = t.replace(/(\d+(?:\.\d+)?)\s*m(?!m)(?![a-z])/gi, (_, n) => {
      changed = true; count++;
      return `${parseFloat(n) * 1000}mm`;
    });

    // Normalize "75 mm" → "75mm" (remove space before unit)
    t = t.replace(/(\d+(?:\.\d+)?)\s+mm\b/gi, '$1mm');

    return { text: t, changed, count };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 8 — Infer missing units from context
  // ─────────────────────────────────────────────────────────────────────────
  _inferMissingUnits(text) {
    let t = text;
    let changed = false;

    // Pattern: bare number followed by angle context without '°'
    // "inclined 30 to HP" → "inclined 30° to HP"
    const angleContexts = ['to HP', 'to VP', 'with HP', 'with VP', 'to the HP', 'to the VP',
      'to horizontal', 'to vertical', 'makes', 'inclined'];
    for (const ctx of angleContexts) {
      const re = new RegExp(`(inclined?\\s+(?:at\\s+)?)(\\d+(?:\\.\\d+)?)\\s+(${ctx.replace(/\s+/g, '\\s+')})`, 'gi');
      const before = t;
      t = t.replace(re, '$1$2° $3');
      if (t !== before) changed = true;
    }

    // "makes 30 with HP" → "makes 30° with HP"
    t = t.replace(/(makes?\s+(?:an?\s+angle\s+of\s+)?)(\d+(?:\.\d+)?)\s+(with|to)\s+(HP|VP)/gi, '$1$2° $3 $4');

    return { text: t, changed };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 9 — Grammar and whitespace cleanup
  // ─────────────────────────────────────────────────────────────────────────
  _cleanGrammar(text) {
    let t = text;

    // Fix "above hp" → "above HP" (restore uppercase after synonyms)
    t = t.replace(/\b(above|below|from|in|on|parallel to|perpendicular to|inclined to|with)\s+(hp|vp|pp|xy)\b/gi,
      (m, prep, plane) => `${prep} ${plane.toUpperCase()}`);

    // Fix "in front of vp" etc.
    t = t.replace(/\bin front of\s+(hp|vp|pp)\b/gi, (m, p) => `in front of ${p.toUpperCase()}`);

    // Fix double spaces after corrections
    t = t.replace(/\s{2,}/g, ' ');

    return t;
  }

  _cleanWhitespace(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*\.\s*(?=[a-zA-Z])/g, '. ')
      .trim();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Confidence Scoring
  // ─────────────────────────────────────────────────────────────────────────
  _computeConfidence(original, normalized, corrections) {
    // High confidence if: few corrections, has key terms, degree symbols present
    let score = 1.0;

    // Penalty per uncertain correction
    score -= corrections.filter(c => c.method === 'levenshtein').length * 0.03;

    // Boost if key terms present in normalized
    const keyTerms = ['HP', 'VP', 'mm', '°', 'line', 'inclined', 'parallel', 'front view', 'top view'];
    const found = keyTerms.filter(t => normalized.includes(t)).length;
    score = Math.min(1.0, score + found * 0.02);

    return Math.max(0.3, Math.min(1.0, score));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Dictionary Builders
  // ─────────────────────────────────────────────────────────────────────────
  _buildTypoDict() {
    const base = (this.config && this.config.TYPO_DICTIONARY) ? { ...this.config.TYPO_DICTIONARY } : {};

    // Additional typos not in config
    const extra = {
      'infornt': 'in front', 'infron': 'in front', 'infront': 'in front',
      'fornt': 'front', 'fromt': 'front', 'frount': 'front',
      'bove': 'above', 'abov': 'above', 'abobe': 'above', 'aboue': 'above',
      'belows': 'below', 'bellow': 'below', 'belw': 'below',
      'mesures': 'measures', 'measurs': 'measures', 'mesure': 'measure',
      'measrues': 'measures', 'meaures': 'measures',
      'inclned': 'inclined', 'inclind': 'inclined', 'inclied': 'inclined',
      'paralel': 'parallel', 'paralle': 'parallel', 'parrallel': 'parallel',
      'perpendiculr': 'perpendicular', 'perpendiclar': 'perpendicular',
      'incliation': 'inclination', 'incliantion': 'inclination',
      'lenth': 'length', 'lenght': 'length', 'lengt': 'length', 'lenthg': 'length',
      'hieght': 'height', 'heigh': 'height', 'hight': 'height',
      'verticle': 'vertical', 'vertcal': 'vertical',
      'horizantal': 'horizontal', 'horizonatal': 'horizontal', 'horizonal': 'horizontal',
      'midponit': 'midpoint', 'midpoitn': 'midpoint', 'midepoint': 'midpoint',
      'projectoin': 'projection', 'porjection': 'projection', 'projecion': 'projection',
      'projecors': 'projectors', 'projecs': 'projectors',
      'lne': 'line', 'lien': 'line', 'liine': 'line',
      'elevtion': 'elevation', 'elevetion': 'elevation',
      'incliantion': 'inclination',
    };

    return { ...base, ...extra };
  }

  _buildSynonymMap() {
    const base = (this.config && this.config.SYNONYM_MAP) ? { ...this.config.SYNONYM_MAP } : {};

    const extra = {
      // Views
      'elevation': 'front view', 'front elevation': 'front view',
      'plan view': 'top view', 'plan': 'top view',
      'top projection': 'top view', 'horizontal projection': 'top view',
      'vertical projection': 'front view',
      // Plane full names
      'horizontal plane': 'HP', 'vertical plane': 'VP', 'profile plane': 'PP',
      // Typo+synonym
      'infront of': 'in front of', 'infront': 'in front',
      // Geometry synonyms
      'straight line': 'line', 'straight': '',
      'makes an angle': 'inclined', 'making an angle': 'inclined',
      'makes angle': 'inclined', 'at an angle of': 'at',
      // Common phrasing
      'equidistant': 'equidistant', // keep this
      'measures': 'measures',       // keep
    };

    return { ...base, ...extra };
  }

  // Public API
  getStats() { return { ...this.stats }; }
  resetStats() {
    this.stats = {
      totalNormalizations: 0, degreeFixes: 0,
      unitConversions: 0, abbreviationExpansions: 0,
      typoCorrections: 0, semanticExpansions: 0
    };
  }
}

if (typeof window !== 'undefined') window.ParserNormalizer = ParserNormalizer;
if (typeof module !== 'undefined' && module.exports) module.exports = ParserNormalizer;