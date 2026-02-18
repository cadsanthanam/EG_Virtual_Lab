/**
 * lines-parser-ml-engine.js
 * Central ML Engine — Orchestrates the full inference pipeline
 * LRU cache, performance metrics, active learning support, graceful fallback
 * Version: 4.0.0 Enterprise ML
 * 
 * Pipeline: Input → Normalize → Extract → Classify → Validate → Output
 */

class ParserMLEngine {

  /**
   * @param {object} [options]
   * @param {number} [options.cacheSize=200] - LRU cache capacity
   * @param {boolean} [options.verbose=false] - Enable detailed logging
   * @param {number} [options.minConfidenceThreshold=0.6] - Below this, flag for review
   * @param {object} [options.config] - Override ParserConfig
   */
  constructor(options = {}) {
    this.options = {
      cacheSize: options.cacheSize || 200,
      verbose: options.verbose || false,
      minConfidenceThreshold: options.minConfidenceThreshold || 0.6,
      fallbackToRuleBased: options.fallbackToRuleBased !== false
    };

    // Component references (set during initialize)
    this.config = null;
    this.normalizer = null;
    this.extractor = null;
    this.classifier = null;
    this.validator = null;

    // LRU Cache
    this._cache = new LRUCache(this.options.cacheSize);

    // Performance metrics
    this._metrics = {
      totalProcessed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      fallbacks: 0,
      lowConfidence: 0,
      stageLatencies: { normalize: [], extract: [], classify: [], validate: [] },
      procDistribution: {},
      correctionLog: []  // Active learning corrections
    };

    this._initialized = false;
  }

  /**
   * Initialize all ML components
   * Supports lazy loading — components are loaded on first use if not pre-initialized
   * @param {object} [preloadedConfig] - Pre-built ParserConfig (optional)
   * @returns {Promise<ParserMLEngine>}
   */
  async initialize(preloadedConfig = null) {
    if (this._initialized) return this;

    this._log('Initializing ParserMLEngine v4.0.0...');

    // Load config
    this.config = preloadedConfig
      || (typeof window !== 'undefined' && window.ParserConfig)
      || (typeof require !== 'undefined' ? this._tryRequire('./lines-parser-config') : null);

    if (!this.config) {
      throw new Error('[MLEngine] ParserConfig not found. Load lines-parser-config.js first.');
    }

    // Instantiate components
    const NormClass = this._getClass('ParserNormalizer', './lines-parser-normalizer');
    const ExtrClass = this._getClass('ParserExtractor', './lines-parser-extractor');
    const ClfClass  = this._getClass('ParserClassifier', './lines-parser-classifier');
    const ValClass  = this._getClass('ParserValidator', './lines-parser-validator');

    this.normalizer = new NormClass(this.config);
    this.extractor  = new ExtrClass(this.config);
    this.classifier = new ClfClass(this.config);
    this.validator  = new ValClass(this.config);

    // Warm up (pre-process one example to trigger JIT compilation)
    this._warmUp();

    this._initialized = true;
    this._log('MLEngine initialized successfully.');
    return this;
  }

  /**
   * Process a single engineering drawing problem statement
   * Full pipeline: normalize → extract → classify → validate
   * 
   * @param {string} text - Raw problem text
   * @param {object} [options]
   * @param {boolean} [options.useCache=true]
   * @param {boolean} [options.skipValidation=false]
   * @returns {Promise<MLEngineResult>}
   */
  async process(text, options = {}) {
    if (!this._initialized) await this.initialize();
    const useCache = options.useCache !== false;
    const startTime = Date.now();

    this._metrics.totalProcessed++;

    // ── Cache lookup ─────────────────────────────────────────────────────
    const cacheKey = this._hashText(text);
    if (useCache) {
      const cached = this._cache.get(cacheKey);
      if (cached) {
        this._metrics.cacheHits++;
        this._log(`Cache hit for key ${cacheKey}`);
        return { ...cached, fromCache: true, processingMs: 0 };
      }
    }
    this._metrics.cacheMisses++;

    try {
      // ── Stage 1: Normalize ────────────────────────────────────────────
      const t0 = Date.now();
      const normResult = await this._runStage('normalize', () => this.normalizer.normalize(text));
      this._recordLatency('normalize', Date.now() - t0);

      if (!normResult || normResult.metadata?.error) {
        throw new Error('Normalization failed: ' + (normResult?.metadata?.error || 'unknown'));
      }

      // ── Stage 2: Extract ──────────────────────────────────────────────
      const t1 = Date.now();
      const extraction = await this._runStage('extract', () =>
        this.extractor.extract(normResult.normalized, text)
      );
      this._recordLatency('extract', Date.now() - t1);

      // ── Stage 3: Classify ─────────────────────────────────────────────
      const t2 = Date.now();
      const classification = await this._runStage('classify', () =>
        this.classifier.classify(extraction)
      );
      this._recordLatency('classify', Date.now() - t2);

      // ── Stage 4: Validate ─────────────────────────────────────────────
      const t3 = Date.now();
      let validation = null;
      if (!options.skipValidation && classification.constraints) {
        validation = await this._runStage('validate', () =>
          this.validator.validate(classification.constraints, classification.slotDetails)
        );
      }
      this._recordLatency('validate', Date.now() - t3);

      // ── Assemble result ───────────────────────────────────────────────
      const totalMs = Date.now() - startTime;
      const result = this._assembleResult({
        text, normResult, extraction, classification, validation, totalMs
      });

      // Track proc distribution
      if (classification.procId) {
        this._metrics.procDistribution[classification.procId] =
          (this._metrics.procDistribution[classification.procId] || 0) + 1;
      }

      // Track low confidence
      if (result.overallConfidence < this.options.minConfidenceThreshold) {
        this._metrics.lowConfidence++;
        result.requiresReview = true;
        result.reviewReason = `Overall confidence ${result.overallConfidence} below threshold ${this.options.minConfidenceThreshold}`;
      }

      // Cache successful result
      if (useCache && result.success) {
        this._cache.set(cacheKey, { ...result, fromCache: false });
      }

      this._log(`Processed in ${totalMs}ms → PROC: ${result.procId}, confidence: ${result.overallConfidence}`);
      return result;

    } catch (err) {
      this._metrics.errors++;
      console.error('[MLEngine] Pipeline error:', err);

      // Graceful fallback to rule-based extraction
      if (this.options.fallbackToRuleBased) {
        this._metrics.fallbacks++;
        return this._fallbackProcess(text, err, Date.now() - startTime);
      }

      return {
        success: false,
        text,
        error: err.message,
        procId: null,
        confidence: 0,
        processingMs: Date.now() - startTime
      };
    }
  }

  /**
   * Process multiple problems in batch (parallel with concurrency limit)
   * @param {string[]} texts - Array of problem texts
   * @param {object} [options]
   * @param {number} [options.concurrency=4] - Max parallel processes
   * @returns {Promise<MLEngineResult[]>}
   */
  async processBatch(texts, options = {}) {
    const concurrency = options.concurrency || 4;
    const results = [];

    for (let i = 0; i < texts.length; i += concurrency) {
      const batch = texts.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(t => this.process(t, options)));
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Active learning: Update from a correction
   * Logs the correction for future model improvement
   * @param {string} inputText - Original problem text
   * @param {object} predicted - What the engine predicted
   * @param {object} actual - Correct ground truth
   */
  async updateFromCorrection(inputText, predicted, actual) {
    const correction = {
      timestamp: Date.now(),
      input: inputText,
      predictedProcId: predicted.procId,
      actualProcId: actual.procId,
      predictedConstraints: predicted.constraints,
      actualConstraints: actual.constraints,
      cacheKey: this._hashText(inputText)
    };

    // Invalidate cache for this input
    this._cache.delete(correction.cacheKey);

    // Log for future training
    this._metrics.correctionLog.push(correction);
    this._log(`Correction logged: ${predicted.procId} → ${actual.procId}`);

    // Limit correction log size
    if (this._metrics.correctionLog.length > 1000) {
      this._metrics.correctionLog = this._metrics.correctionLog.slice(-500);
    }

    return correction;
  }

  /**
   * Get comprehensive performance metrics
   * @returns {object}
   */
  getMetrics() {
    const latencyStats = {};
    for (const [stage, times] of Object.entries(this._metrics.stageLatencies)) {
      if (times.length === 0) { latencyStats[stage] = null; continue; }
      const sorted = [...times].sort((a, b) => a - b);
      latencyStats[stage] = {
        count: times.length,
        mean: Math.round(times.reduce((s, t) => s + t, 0) / times.length),
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
        max: sorted[sorted.length - 1]
      };
    }

    const hitRate = this._metrics.totalProcessed > 0
      ? (this._metrics.cacheHits / this._metrics.totalProcessed * 100).toFixed(1)
      : 0;

    const errorRate = this._metrics.totalProcessed > 0
      ? (this._metrics.errors / this._metrics.totalProcessed * 100).toFixed(1)
      : 0;

    return {
      summary: {
        totalProcessed: this._metrics.totalProcessed,
        cacheHits: this._metrics.cacheHits,
        cacheMisses: this._metrics.cacheMisses,
        cacheHitRate: `${hitRate}%`,
        errors: this._metrics.errors,
        errorRate: `${errorRate}%`,
        fallbacks: this._metrics.fallbacks,
        lowConfidenceRequests: this._metrics.lowConfidence,
        pendingCorrections: this._metrics.correctionLog.length
      },
      latency: latencyStats,
      procDistribution: this._metrics.procDistribution,
      cacheSize: this._cache.size(),
      engineVersion: '4.0.0',
      modelVersion: (this.config && this.config.MODEL_VERSION) || 'unknown'
    };
  }

  /**
   * Reset all metrics (useful for testing)
   */
  resetMetrics() {
    this._metrics = {
      totalProcessed: 0, cacheHits: 0, cacheMisses: 0,
      errors: 0, fallbacks: 0, lowConfidence: 0,
      stageLatencies: { normalize: [], extract: [], classify: [], validate: [] },
      procDistribution: {}, correctionLog: []
    };
  }

  /**
   * Clear the LRU cache
   */
  clearCache() {
    this._cache.clear();
    this._log('Cache cleared');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  _assembleResult({ text, normResult, extraction, classification, validation, totalMs }) {
    const normConfidence = normResult.metadata?.confidence || 1;
    const extractConfidence = extraction.metadata?.confidence || 0.8;
    const classifConfidence = classification.confidence || 0;
    const validConfidence = validation ? (validation.valid ? 1 : 0.5) : 1;

    // Geometric mean of stage confidences
    const overallConfidence = Math.round(
      Math.pow(normConfidence * extractConfidence * classifConfidence * validConfidence, 0.25) * 100
    ) / 100;

    return {
      success: true,
      text,

      // Normalization
      normalized: normResult.normalized,
      normalizationChanges: normResult.metadata?.changes || [],
      normalizationCorrections: normResult.metadata?.corrections || [],

      // Extraction
      atoms: extraction.atoms,
      endpoints: extraction.endpoints,
      specialFlags: extraction.specialFlags,
      slotsFound: extraction.atoms.length +
        extraction.specialFlags.reduce((s, f) => s + (f.slots || 0), 0),

      // Classification
      procId: classification.procId,
      procName: classification.procId
        ? (this.config.getProcById && this.config.getProcById(classification.procId)?.name)
        : null,
      caseType: classification.caseType,
      constraints: classification.constraints,
      alternatives: classification.alternatives || [],
      reasoning: classification.reasoning,
      completeness: classification.completeness,

      // Validation
      valid: validation ? validation.valid : null,
      validationErrors: validation ? validation.errors : [],
      validationWarnings: validation ? validation.warnings : [],
      validationExplanations: validation ? validation.explanations : [],
      anomalyScore: validation ? validation.anomalyScore : 0,

      // Confidence scores
      stageConfidences: {
        normalization: normConfidence,
        extraction: extractConfidence,
        classification: classifConfidence,
        validation: validConfidence
      },
      overallConfidence,

      // Performance
      processingMs: totalMs,
      fromCache: false,
      requiresReview: false
    };
  }

  _fallbackProcess(text, originalError, elapsedMs) {
    // Minimal rule-based fallback when ML pipeline fails
    this._log('Falling back to rule-based processing...');
    const simple = {};

    // Extract bare numbers with units
    for (const m of text.matchAll(/(\d+(?:\.\d+)?)\s*mm/g)) simple['value_' + m.index] = parseFloat(m[1]);

    // Detect basic conditions
    const hasHP = /HP/i.test(text);
    const hasVP = /VP/i.test(text);
    const hasDeg = /\d+°|\d+\s*deg/i.test(text);

    return {
      success: false,
      text,
      normalized: text.toLowerCase(),
      atoms: [],
      endpoints: ['A', 'B'],
      specialFlags: [],
      slotsFound: 0,
      procId: null,
      caseType: null,
      constraints: {},
      alternatives: [],
      reasoning: 'Fallback mode: ML pipeline failed. Original error: ' + originalError.message,
      valid: null,
      validationErrors: [],
      validationWarnings: [],
      anomalyScore: 0.5,
      overallConfidence: 0.1,
      stageConfidences: {},
      processingMs: elapsedMs,
      fromCache: false,
      requiresReview: true,
      reviewReason: 'Fallback result — requires manual review',
      fallbackData: simple
    };
  }

  async _runStage(name, fn) {
    try {
      const result = fn();
      // Support both sync and async functions
      return result instanceof Promise ? await result : result;
    } catch (err) {
      console.error(`[MLEngine] Stage '${name}' failed:`, err);
      throw err;
    }
  }

  _recordLatency(stage, ms) {
    if (this._metrics.stageLatencies[stage]) {
      this._metrics.stageLatencies[stage].push(ms);
      // Keep only last 1000 samples
      if (this._metrics.stageLatencies[stage].length > 1000) {
        this._metrics.stageLatencies[stage] = this._metrics.stageLatencies[stage].slice(-500);
      }
    }
  }

  _getClass(globalName, modulePath) {
    if (typeof window !== 'undefined' && window[globalName]) return window[globalName];
    if (typeof require !== 'undefined') {
      try { return require(modulePath); } catch (e) { /* ignore */ }
    }
    throw new Error(`[MLEngine] Cannot find ${globalName}. Load the corresponding script file.`);
  }

  _tryRequire(path) {
    try { return require(path); } catch (e) { return null; }
  }

  _warmUp() {
    try {
      const warmupText = 'Line AB 80mm long at 30° to HP and 45° to VP. A is 20mm above HP and 15mm in front of VP.';
      const norm = this.normalizer.normalize(warmupText);
      const ext = this.extractor.extract(norm.normalized, warmupText);
      this.classifier.classify(ext);
    } catch (e) {
      // Warm-up failure is non-fatal
      this._log('Warm-up failed (non-fatal): ' + e.message);
    }
  }

  /**
   * Simple djb2-based hash for cache keys
   */
  _hashText(text) {
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
      hash = hash & hash;  // Convert to 32-bit integer
    }
    return `ml_${Math.abs(hash).toString(36)}`;
  }

  _log(msg) {
    if (this.options.verbose) console.log(`[MLEngine] ${msg}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LRU Cache implementation (doubly-linked list + hash map, O(1) operations)
// ─────────────────────────────────────────────────────────────────────────────
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this._map = new Map();
    // Sentinel nodes for doubly-linked list
    this._head = { key: null, value: null, prev: null, next: null };
    this._tail = { key: null, value: null, prev: null, next: null };
    this._head.next = this._tail;
    this._tail.prev = this._head;
  }

  get(key) {
    if (!this._map.has(key)) return null;
    const node = this._map.get(key);
    this._moveToFront(node);
    return node.value;
  }

  set(key, value) {
    if (this._map.has(key)) {
      const node = this._map.get(key);
      node.value = value;
      this._moveToFront(node);
      return;
    }

    const node = { key, value, prev: null, next: null };
    this._map.set(key, node);
    this._addToFront(node);

    if (this._map.size > this.capacity) {
      const evicted = this._tail.prev;
      this._removeNode(evicted);
      this._map.delete(evicted.key);
    }
  }

  delete(key) {
    if (!this._map.has(key)) return;
    const node = this._map.get(key);
    this._removeNode(node);
    this._map.delete(key);
  }

  clear() {
    this._map.clear();
    this._head.next = this._tail;
    this._tail.prev = this._head;
  }

  size() { return this._map.size; }

  _addToFront(node) {
    node.next = this._head.next;
    node.prev = this._head;
    this._head.next.prev = node;
    this._head.next = node;
  }

  _removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _moveToFront(node) {
    this._removeNode(node);
    this._addToFront(node);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory function for easy initialization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create and initialize a ParserMLEngine instance
 * @param {object} [options] - Engine options
 * @returns {Promise<ParserMLEngine>}
 * 
 * @example
 * const engine = await createMLEngine({ verbose: true });
 * const result = await engine.process('Line AB 75mm long at 30° to HP and 45° to VP...');
 * console.log(result.procId, result.overallConfidence);
 */
async function createMLEngine(options = {}) {
  const engine = new ParserMLEngine(options);
  await engine.initialize();
  return engine;
}

// Export
if (typeof window !== 'undefined') {
  window.ParserMLEngine = ParserMLEngine;
  window.LRUCache = LRUCache;
  window.createMLEngine = createMLEngine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ParserMLEngine, LRUCache, createMLEngine };
}
