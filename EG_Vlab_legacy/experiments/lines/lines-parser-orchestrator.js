/**
 * Enterprise Orchestrator - COMPLETE with all methods
 */
class ParserOrchestrator {
  constructor() {
    this.normalizer = new ParserNormalizer();
    this.extractor = new ParserExtractor();
    this.classifier = new ParserClassifier();
    this.validator = new ParserValidator();
    this.disambiguationUI = null; // CRITICAL: for integration
  }
  
  /**
   * CRITICAL METHOD - was missing in simplified version!
   */
  setDisambiguationUI(ui) {
    this.disambiguationUI = ui;
  }
  
  parse(text) {
    try {
      const normResult = this.normalizer.normalize(text);
      const normalized = normResult.normalized;
      
      const extraction = this.extractor.extract(normalized, text);
      const classification = this.classifier.classify(extraction);
      const validation = this.validator.validate(classification.constraints);
      
      return {
        success: true,
        procId: classification.procId,
        caseType: classification.caseType,
        slotsConsumed: classification.slotsConsumed,
        constraints: classification.constraints,
        completeness: classification.completeness,
        validation: validation,
        metadata: {
          originalText: text,
          normalizedText: normalized,
          normalizationChanges: normResult.metadata.changes
        }
      };
    } catch(err) {
      console.error('[Orchestrator] Parse error:', err);
      return {
        success: false,
        error: err.message,
        constraints: null,
        validation: {valid:false, errors:[err.message], warnings:[], summary:err.message}
      };
    }
  }
}
if(typeof window!=='undefined')window.ParserOrchestrator=ParserOrchestrator;
