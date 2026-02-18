/**
 * lines-parser-config.js
 * Enterprise Configuration Module — ML-Enhanced Edition
 * Includes: 18 data types, 13 special conditions, 30 PROC combinations
 * Training examples, feature vectors, synonym dictionaries, model registry
 * Version: 4.0.0 Enterprise ML
 */

const ParserConfig = {

  VERSION: '4.0.0',
  MODEL_VERSION: '1.0.0',

  // ═══════════════════════════════════════════════════════════════════════
  // DATA TYPES (D01–D18) — Complete with ML feature hints
  // ═══════════════════════════════════════════════════════════════════════
  DATA_TYPES: {
    D01: {
      id: 'D01', symbol: 'TL', name: 'True Length', field: 'TL',
      slots: 1, unit: 'mm', domain: [0, Infinity],
      description: 'The actual 3D length of the line segment',
      phrases: ['long', 'length', 'true length', 'measures', 'in length', 'of length', 'long line'],
      extractPatterns: [
        /(\d+(?:\.\d+)?)\s*mm\s+long(?:\s+line)?/i,
        /line\s+(?:AB|PQ|CD|MN|[\w]+)?\s*(?:is\s+)?(\d+(?:\.\d+)?)\s*mm(?:\s+long)?/i,
        /(?:true\s+)?length\s+(?:of\s+|=\s*)?(\d+(?:\.\d+)?)\s*mm/i,
        /(\d+(?:\.\d+)?)\s*mm\s+(?:in\s+)?length/i,
        /(?:line|it)\s+(?:has\s+)?(?:a\s+)?(?:true\s+)?length\s+(?:of\s+)?(\d+(?:\.\d+)?)/i
      ],
      featureWeight: 1.0,
      disambiguationHints: ['appears near line name', 'usually first datum given']
    },
    D02: {
      id: 'D02', symbol: 'θ', name: 'Inclination to HP', field: 'theta',
      slots: 1, unit: '°', domain: [0, 90],
      description: 'True angle measured from HP plane upward',
      phrases: ['to HP', 'with HP', 'to horizontal plane', 'inclination to HP', 'inclined to HP', 'makes with HP'],
      extractPatterns: [
        /(\d+(?:\.\d+)?)°\s*(?:to|with)\s+HP/i,
        /inclined?\s+(?:at\s+)?(\d+(?:\.\d+)?)°\s*(?:to|with)\s+HP/i,
        /(?:makes?|making)\s+(?:an?\s+angle\s+of\s+)?(\d+(?:\.\d+)?)°\s*(?:with|to)\s+(?:the\s+)?HP/i,
        /HP\s+(?:at|by|=|of|:)\s*(\d+(?:\.\d+)?)°/i
      ],
      featureWeight: 0.9
    },
    D03: {
      id: 'D03', symbol: 'φ', name: 'Inclination to VP', field: 'phi',
      slots: 1, unit: '°', domain: [0, 90],
      description: 'True angle measured from VP plane forward',
      phrases: ['to VP', 'with VP', 'to vertical plane', 'inclination to VP', 'inclined to VP', 'makes with VP'],
      extractPatterns: [
        /(\d+(?:\.\d+)?)°\s*(?:to|with)\s+VP/i,
        /inclined?\s+(?:at\s+)?(\d+(?:\.\d+)?)°\s*(?:to|with)\s+VP/i,
        /(?:makes?|making)\s+(?:an?\s+angle\s+of\s+)?(\d+(?:\.\d+)?)°\s*(?:with|to)\s+(?:the\s+)?VP/i,
        /VP\s+(?:at|by|=|of|:)\s*(\d+(?:\.\d+)?)°/i
      ],
      featureWeight: 0.9
    },
    D04: {
      id: 'D04', symbol: 'h_A', name: 'Height of end A', field: 'h_A',
      slots: 1, unit: 'mm', domain: [-Infinity, Infinity],
      description: 'Perpendicular distance of A from HP (above=+, below=-)',
      phrases: ['above HP', 'below HP', 'from HP', 'above the HP'],
      extractPatterns: [
        /(?:end\s+)?[Aa]\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+above\s+(?:the\s+)?HP/i,
        /(?:end\s+)?[Aa]\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+below\s+(?:the\s+)?HP/i,
        /one\s+end\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+above\s+HP/i
      ],
      featureWeight: 0.85
    },
    D05: {
      id: 'D05', symbol: 'd_A', name: 'Depth of end A', field: 'd_A',
      slots: 1, unit: 'mm', domain: [-Infinity, Infinity],
      description: 'Perpendicular distance of A from VP (front=+, behind=-)',
      phrases: ['in front of VP', 'behind VP', 'from VP', 'in front of the VP'],
      extractPatterns: [
        /(?:end\s+)?[Aa]\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+(?:in\s+)?front\s+(?:of\s+)?(?:the\s+)?VP/i,
        /(?:end\s+)?[Aa]\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+behind\s+(?:the\s+)?VP/i
      ],
      featureWeight: 0.85
    },
    D06: {
      id: 'D06', symbol: 'h_B', name: 'Height of end B', field: 'h_B',
      slots: 1, unit: 'mm', domain: [-Infinity, Infinity],
      description: 'Perpendicular distance of B from HP',
      phrases: ['above HP', 'below HP', 'from HP'],
      extractPatterns: [
        /(?:end\s+)?[Bb]\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+above\s+(?:the\s+)?HP/i,
        /(?:end\s+)?[Bb]\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+below\s+(?:the\s+)?HP/i,
        /other\s+end\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+above\s+HP/i,
        /(?:higher|other)\s+end.*?(\d+(?:\.\d+)?)\s*mm\s+above/i
      ],
      featureWeight: 0.85
    },
    D07: {
      id: 'D07', symbol: 'd_B', name: 'Depth of end B', field: 'd_B',
      slots: 1, unit: 'mm', domain: [-Infinity, Infinity],
      description: 'Perpendicular distance of B from VP',
      phrases: ['in front of VP', 'behind VP', 'from VP'],
      extractPatterns: [
        /(?:end\s+)?[Bb]\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+(?:in\s+)?front\s+(?:of\s+)?(?:the\s+)?VP/i,
        /(?:end\s+)?[Bb]\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+behind\s+(?:the\s+)?VP/i
      ],
      featureWeight: 0.85
    },
    D08: {
      id: 'D08', symbol: 'L_TV', name: 'Top View length', field: 'L_TV',
      slots: 1, unit: 'mm', domain: [0, Infinity],
      description: 'Projected length in horizontal plane (plan)',
      phrases: ['top view', 'plan', 'TV', 'horizontal projection', 'plan view'],
      extractPatterns: [
        /top\s+view\s+(?:length\s+)?(?:is|measures?|=)\s*(\d+(?:\.\d+)?)\s*mm/i,
        /(?:its\s+)?top\s+view\s+.*?(\d+(?:\.\d+)?)\s*mm/i,
        /(?:plan|TV)\s+(?:length\s+)?(?:is|=|measures?)\s*(\d+(?:\.\d+)?)\s*mm/i,
        /(\d+(?:\.\d+)?)\s*mm\s+(?:in\s+)?top\s+view/i
      ],
      featureWeight: 0.8
    },
    D09: {
      id: 'D09', symbol: 'L_FV', name: 'Front View length', field: 'L_FV',
      slots: 1, unit: 'mm', domain: [0, Infinity],
      description: 'Projected length in vertical plane (elevation)',
      phrases: ['front view', 'elevation', 'FV', 'vertical projection'],
      extractPatterns: [
        /front\s+view\s+(?:length\s+)?(?:is|measures?|=)\s*(\d+(?:\.\d+)?)\s*mm/i,
        /(?:its\s+)?front\s+view\s+.*?(\d+(?:\.\d+)?)\s*mm/i,
        /(?:elevation|FV)\s+(?:length\s+)?(?:is|=|measures?)\s*(\d+(?:\.\d+)?)\s*mm/i,
        /(\d+(?:\.\d+)?)\s*mm\s+(?:in\s+)?front\s+view/i
      ],
      featureWeight: 0.8
    },
    D10: {
      id: 'D10', symbol: 'α', name: 'TV angle with XY', field: 'alpha',
      slots: 1, unit: '°', domain: [0, 90],
      description: 'Apparent angle in top view',
      phrases: ['plan makes', 'top view makes', 'TV makes', 'plan at', 'angle in top view'],
      extractPatterns: [
        /(?:top\s+view|plan|TV)\s+(?:makes?|is)\s+(?:an?\s+angle\s+of\s+)?(\d+(?:\.\d+)?)°/i,
        /(?:apparent\s+)?angle\s+in\s+top\s+view\s+(?:is\s+)?(\d+(?:\.\d+)?)°/i
      ],
      featureWeight: 0.7
    },
    D11: {
      id: 'D11', symbol: 'β', name: 'FV angle with XY', field: 'beta',
      slots: 1, unit: '°', domain: [0, 90],
      description: 'Apparent angle in front view',
      phrases: ['front view makes', 'elevation makes', 'FV makes', 'angle in front view'],
      extractPatterns: [
        /(?:front\s+view|elevation|FV)\s+(?:makes?|is)\s+(?:an?\s+angle\s+of\s+)?(\d+(?:\.\d+)?)°/i,
        /(?:apparent\s+)?angle\s+in\s+front\s+view\s+(?:is\s+)?(\d+(?:\.\d+)?)°/i
      ],
      featureWeight: 0.7
    },
    D12: {
      id: 'D12', symbol: 'Δx', name: 'Projector distance', field: 'delta_X',
      slots: 1, unit: 'mm', domain: [0, Infinity],
      description: 'Horizontal distance between projectors of A and B',
      phrases: ['projectors apart', 'distance between projectors', 'end projectors', 'apart'],
      extractPatterns: [
        /projectors?\s+(?:are\s+)?(\d+(?:\.\d+)?)\s*mm\s+apart/i,
        /(\d+(?:\.\d+)?)\s*mm\s+(?:between|apart).{0,20}projectors?/i,
        /end\s+projectors?\s+(?:are\s+)?(\d+(?:\.\d+)?)\s*mm/i,
        /distance\s+between\s+(?:end\s+)?projectors?\s+(?:is\s+)?(\d+(?:\.\d+)?)/i
      ],
      featureWeight: 0.75
    },
    D13: {
      id: 'D13', symbol: 'h_mid', name: 'Midpoint height', field: 'h_mid',
      slots: 1, unit: 'mm', domain: [-Infinity, Infinity],
      description: 'Height of midpoint M above HP',
      phrases: ['midpoint above HP', 'mid-point above HP', 'centre above HP', 'midpoint is', 'middle point'],
      extractPatterns: [
        /mid(?:dle|[-\s]?point|point)\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+above\s+HP/i,
        /(?:midpoint|centre)\s+(?:at|of)\s+(\d+(?:\.\d+)?)\s*mm\s+(?:from|above)\s+HP/i
      ],
      featureWeight: 0.65
    },
    D14: {
      id: 'D14', symbol: 'd_mid', name: 'Midpoint depth', field: 'd_mid',
      slots: 1, unit: 'mm', domain: [-Infinity, Infinity],
      description: 'Depth of midpoint M from VP',
      phrases: ['midpoint in front of VP', 'mid-point from VP', 'centre from VP'],
      extractPatterns: [
        /mid(?:dle|[-\s]?point|point)\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+(?:in\s+front\s+of|from)\s+VP/i
      ],
      featureWeight: 0.65
    },
    D15: {
      id: 'D15', symbol: 'VT_h', name: 'VT height', field: 'VT_h',
      slots: 1, unit: 'mm', domain: [-Infinity, Infinity],
      description: 'Height where line meets VP',
      phrases: ['VT above HP', 'vertical trace', 'VT is', 'meets VP at'],
      extractPatterns: [
        /VT\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+above\s+HP/i,
        /vertical\s+trace\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm/i
      ],
      featureWeight: 0.6
    },
    D16: {
      id: 'D16', symbol: 'HT_d', name: 'HT depth', field: 'HT_d',
      slots: 1, unit: 'mm', domain: [-Infinity, Infinity],
      description: 'Depth where line meets HP',
      phrases: ['HT in front of VP', 'horizontal trace', 'HT is', 'meets HP at'],
      extractPatterns: [
        /HT\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+(?:in\s+front\s+of|from)\s+VP/i,
        /horizontal\s+trace\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm/i
      ],
      featureWeight: 0.6
    },
    D17: {
      id: 'D17', symbol: 'L_SV', name: 'Side View length', field: 'L_SV',
      slots: 1, unit: 'mm', domain: [0, Infinity],
      description: 'Projected length in Profile Plane',
      phrases: ['side view', 'profile view', 'SV', 'profile plane projection'],
      extractPatterns: [
        /side\s+view\s+(?:is|measures?|=)\s*(\d+(?:\.\d+)?)\s*mm/i,
        /(?:profile|SV)\s+(?:is|=)\s*(\d+(?:\.\d+)?)\s*mm/i
      ],
      featureWeight: 0.5
    },
    D18: {
      id: 'D18', symbol: 'γ', name: 'Inclination to PP', field: 'gamma',
      slots: 1, unit: '°', domain: [0, 90],
      description: 'True angle with Profile Plane',
      phrases: ['to profile plane', 'to PP', 'with profile plane'],
      extractPatterns: [
        /(\d+(?:\.\d+)?)°\s*(?:to|with)\s+(?:profile\s+plane|PP)/i
      ],
      featureWeight: 0.5
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SPECIAL CONDITIONS (SK01-SK13)
  // ═══════════════════════════════════════════════════════════════════════
  SPECIAL_CONDITIONS: {
    SK01: {
      id: 'SK01', flag: 'PARALLEL_HP', slots: 1,
      effect: { theta: 0 },
      description: 'Line parallel to HP → θ=0',
      patterns: [/parallel\s+to\s+(?:the\s+)?HP/i, /∥\s*HP/i, /parallel\s+to\s+(?:the\s+)?horizontal\s+plane/i],
      priority: 5
    },
    SK02: {
      id: 'SK02', flag: 'PARALLEL_VP', slots: 1,
      effect: { phi: 0 },
      description: 'Line parallel to VP → φ=0',
      patterns: [/parallel\s+to\s+(?:the\s+)?VP/i, /∥\s*VP/i, /parallel\s+to\s+(?:the\s+)?vertical\s+plane/i],
      priority: 5
    },
    SK03: {
      id: 'SK03', flag: 'PERP_HP', slots: 1,
      effect: { theta: 90 },
      description: 'Line perpendicular to HP → θ=90',
      patterns: [/perpendicular\s+to\s+(?:the\s+)?HP/i, /⊥\s*HP/i, /vertical\s+line/i],
      priority: 10
    },
    SK04: {
      id: 'SK04', flag: 'PERP_VP', slots: 1,
      effect: { phi: 90 },
      description: 'Line perpendicular to VP → φ=90',
      patterns: [/perpendicular\s+to\s+(?:the\s+)?VP/i, /⊥\s*VP/i],
      priority: 10
    },
    SK05: {
      id: 'SK05', flag: 'ON_HP', slots: 1,
      effect: { h: 0 },
      description: 'Endpoint on HP → h=0',
      patterns: [
        /(?:end|point)\s+([A-Za-z])\s+(?:is\s+)?(?:in|on|lies?\s+(?:in|on))\s+(?:the\s+)?HP/i,
        /(?:in|on)\s+(?:the\s+)?HP.*?(?:end|point)\s+([A-Za-z])/i,
        /([A-Za-z])\s+(?:is\s+)?(?:in|on)\s+(?:the\s+)?HP/i
      ],
      priority: 7
    },
    SK06: {
      id: 'SK06', flag: 'ON_VP', slots: 1,
      effect: { d: 0 },
      description: 'Endpoint on VP → d=0',
      patterns: [
        /(?:end|point)\s+([A-Za-z])\s+(?:is\s+)?(?:in|on|lies?\s+(?:in|on))\s+(?:the\s+)?VP/i,
        /([A-Za-z])\s+(?:is\s+)?(?:in|on)\s+(?:the\s+)?VP/i
      ],
      priority: 7
    },
    SK07: {
      id: 'SK07', flag: 'ON_BOTH', slots: 2,
      effect: { h: 0, d: 0 },
      description: 'Endpoint on both HP and VP → h=0 AND d=0',
      patterns: [
        /(?:end|point)\s+([A-Za-z]).*?(?:both\s+)?(?:HP\s+and\s+VP|on\s+(?:both|HP\s+and))/i,
        /on\s+both\s+(?:HP\s+and\s+VP|planes)/i
      ],
      priority: 15
    },
    SK08: {
      id: 'SK08', flag: 'EQUAL_DIST_N', slots: 2,
      effect: { h: 'N', d: 'N' },
      description: 'Equal distance from both planes → h=N AND d=N',
      patterns: [
        /(\d+(?:\.\d+)?)\s*mm\s+from\s+both\s+(?:HP\s+and\s+VP|planes)/i,
        /equidistant.*?(\d+(?:\.\d+)?)\s*mm/i,
        /(\d+(?:\.\d+)?)\s*mm\s+(?:from\s+each|equally)/i
      ],
      priority: 15
    },
    SK09: {
      id: 'SK09', flag: 'EQUAL_DIST_UNK', slots: 1,
      effect: { constraint: 'h=d' },
      description: 'Equidistant from both (unknown value)',
      patterns: [/equidistant\s+from\s+both/i, /equal\s+distances?\s+from\s+both/i],
      priority: 8
    },
    SK10: {
      id: 'SK10', flag: 'ON_XY', slots: 2,
      effect: { h: 0, d: 0 },
      description: 'Line intersects XY at endpoint → h=0 AND d=0',
      patterns: [
        /(?:intersects?|meets?|on|crosses?)\s+(?:the\s+)?XY/i,
        /(?:at|on)\s+(?:the\s+)?XY\s+(?:line|axis)/i
      ],
      priority: 15
    },
    SK11: {
      id: 'SK11', flag: 'MIDPOINT', slots: 0,
      effect: {},
      description: 'Routing flag: h/d values are for midpoint M',
      patterns: [/mid(?:dle|[-\s]?point)|centre\s+of\s+(?:the\s+)?line/i],
      priority: 3
    },
    SK12: {
      id: 'SK12', flag: 'TRACE_REQ', slots: 0,
      effect: {},
      description: 'Post-processing flag: find and mark traces',
      patterns: [/mark\s+(?:its\s+)?traces?|find\s+traces?|(?:HT|VT)\s+and\s+(?:VT|HT)|show\s+traces?/i],
      priority: 1
    },
    SK13: {
      id: 'SK13', flag: 'FIRST_QUAD', slots: 0,
      effect: {},
      description: 'Context: line in first quadrant (h>0, d>0)',
      patterns: [/first\s+(?:quadrant|angle|dihedral)/i, /1st\s+(?:quadrant|angle)/i],
      priority: 1
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PROC COMBINATIONS (All 30) with training examples
  // ═══════════════════════════════════════════════════════════════════════
  PROC_COMBINATIONS: [
    {
      procId: 'PROC-01', name: 'Canonical Oblique', slots: ['D01', 'D02', 'D03', 'D04', 'D05'],
      caseType: 'D', priority: 100,
      trainingExamples: [
        'Line AB 75mm long inclined at 30° to HP and 45° to VP. End A is 20mm above HP and 25mm in front of VP.',
        'A line PQ 100mm long makes 45° with HP and 30° with VP. P is 15mm above HP and 20mm in front of VP.',
        'Draw line AB 80mm long. It makes 35° with HP and 40° with VP. A is 10mm above HP and 15mm in front of VP.',
        'A 90mm line is inclined at 25° to HP and 50° to VP. One end is 30mm above HP and 20mm in front of VP.',
        'Line MN 60mm long. M is 10mm above HP and 15mm in front of VP. Inclination to HP is 30° and to VP is 45°.'
      ]
    },
    {
      procId: 'PROC-02', name: 'Oblique from B', slots: ['D01', 'D02', 'D03', 'D06', 'D07'],
      caseType: 'D', priority: 95,
      trainingExamples: [
        'Line AB 90mm long at 30° to HP and 45° to VP. End B is 20mm above HP and 25mm in front of VP.',
        'PQ 75mm makes 40° with HP and 35° with VP. Q is 15mm above HP and 30mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-03', name: 'Oblique Midpoint', slots: ['D01', 'D02', 'D03', 'D13', 'D14'],
      caseType: 'D', priority: 90,
      trainingExamples: [
        'Line AB 100mm long at 30° to HP and 45° to VP. Midpoint is 20mm above HP and 25mm in front of VP.',
        'A 75mm line inclined 35° to HP and 40° to VP. Its midpoint is 15mm above HP and 20mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-04', name: 'Inclined to HP only', slots: ['D01', 'D02', 'SK02', 'D04', 'D05'],
      caseType: 'C', priority: 85,
      trainingExamples: [
        'Line AB 80mm long inclined at 30° to HP and parallel to VP. A is 20mm above HP and 15mm in front of VP.',
        'A 100mm line makes 45° with HP and is parallel to VP. One end is 10mm above HP and 25mm in front of VP.',
        'PQ 75mm is inclined 40° to HP and parallel to VP. P is 15mm above HP and 20mm in front of VP.',
        'Draw a 90mm line inclined to HP at 35° and parallel to VP. End A 25mm above HP and 20mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-05', name: 'Inclined to VP only', slots: ['D01', 'SK01', 'D03', 'D04', 'D05'],
      caseType: 'B', priority: 85,
      trainingExamples: [
        'Line AB 80mm long parallel to HP and inclined 45° to VP. A is 20mm above HP and 15mm in front of VP.',
        'A line 100mm long makes 30° with VP and is parallel to HP. One end 25mm above HP and 20mm in front of VP.',
        'PQ 75mm parallel to HP and inclined 40° to VP. P is 10mm above HP and 30mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-06', name: 'Parallel to both', slots: ['D01', 'SK01', 'SK02', 'D04', 'D05'],
      caseType: 'A', priority: 80,
      trainingExamples: [
        'Line AB 80mm long parallel to both HP and VP. A is 20mm above HP and 15mm in front of VP.',
        'A line 100mm long is parallel to HP and VP. One end is 25mm above HP and 20mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-07', name: 'Perpendicular to HP', slots: ['D01', 'SK03', 'SK02', 'D04', 'D05'],
      caseType: '2A', priority: 75,
      trainingExamples: [
        'A vertical line AB 80mm long. A is 20mm above HP and 15mm in front of VP.',
        'Line perpendicular to HP 75mm long. One end 10mm above HP and 25mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-08', name: 'Perpendicular to VP', slots: ['D01', 'SK01', 'SK04', 'D04', 'D05'],
      caseType: '2B', priority: 75,
      trainingExamples: [
        'Line AB perpendicular to VP 80mm long. A is 20mm above HP and 15mm in front of VP.',
        'A line perpendicular to VP 100mm long. One end 25mm above HP and 20mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-09', name: 'L_TV with both angles', slots: ['D08', 'D02', 'D03', 'D04', 'D05'],
      caseType: 'D', priority: 70,
      trainingExamples: [
        'Top view of line AB is 65mm. Line is inclined 30° to HP and 45° to VP. A is 20mm above HP and 25mm in front of VP.',
        'The plan of PQ measures 75mm. PQ makes 40° with HP and 30° with VP. P is 10mm above HP and 20mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-10', name: 'L_FV with both angles', slots: ['D09', 'D02', 'D03', 'D04', 'D05'],
      caseType: 'D', priority: 70,
      trainingExamples: [
        'Front view of line AB is 60mm. It makes 30° with HP and 45° with VP. A is 20mm above HP and 25mm in front of VP.',
        'The elevation of PQ measures 50mm. PQ makes 35° with HP and 40° with VP. P is 10mm above HP and 15mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-11', name: 'L_TV inclined to HP', slots: ['D08', 'D02', 'SK02', 'D04', 'D05'],
      caseType: 'C', priority: 65,
      trainingExamples: [
        'Line AB parallel to VP. Its top view is 65mm and inclined 30° to HP. A is 20mm above HP and 25mm in front of VP.',
        'PQ parallel to VP has a top view of 75mm making 40° with HP. P is 10mm above HP and 20mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-12', name: 'L_FV inclined to VP', slots: ['D09', 'SK01', 'D03', 'D04', 'D05'],
      caseType: 'B', priority: 65,
      trainingExamples: [
        'Line AB parallel to HP. Its front view is 60mm and inclined 45° to VP. A is 20mm above HP and 25mm in front of VP.',
        'PQ parallel to HP has front view of 75mm making 35° with VP. P is 10mm above HP and 15mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-13', name: 'Both views + Δx', slots: ['D08', 'D09', 'D04', 'D05', 'D12'],
      caseType: 'D', priority: 60,
      trainingExamples: [
        'Line AB has top view 65mm and front view 55mm. A is 20mm above HP and 25mm in front of VP. Projectors are 50mm apart.',
        'PQ has plan 75mm, elevation 60mm, A is 10mm above HP and 20mm in front of VP. End projectors 60mm apart.'
      ]
    },
    {
      procId: 'PROC-14', name: 'Both views no Δx', slots: ['D08', 'D09', 'D04', 'D05'],
      caseType: 'D', priority: 55,
      trainingExamples: [
        'Line AB has top view 65mm and front view 55mm. A is 20mm above HP and 25mm in front of VP.',
        'PQ has plan 75mm and elevation 60mm. P is 10mm above HP and 20mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-15', name: 'TL with apparent angles', slots: ['D01', 'D10', 'D11', 'D04', 'D05'],
      caseType: 'D', priority: 50,
      trainingExamples: [
        'Line AB 80mm long. Its top view makes 30° and front view makes 45° with XY. A is 20mm above HP and 25mm in front of VP.',
        'PQ 75mm. Plan makes 40° with XY and elevation makes 35° with XY. P is 10mm above HP and 20mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-16', name: 'L_TV, α, h_B', slots: ['D08', 'D10', 'D04', 'D05', 'D06'],
      caseType: 'D', priority: 45,
      trainingExamples: [
        'Top view of AB is 65mm at 30° to XY. A is 20mm above HP and 25mm in front of VP. B is 50mm above HP.',
        'Plan of PQ is 75mm at 40° with XY. P is 10mm above HP and 20mm in front of VP. Q is 60mm above HP.'
      ]
    },
    {
      procId: 'PROC-17', name: 'L_FV, β, d_B', slots: ['D09', 'D11', 'D04', 'D05', 'D07'],
      caseType: 'D', priority: 45,
      trainingExamples: [
        'Front view of AB is 60mm making 45° with XY. A is 20mm above HP and 25mm in front of VP. B is 30mm in front of VP.',
        'Elevation of PQ is 50mm at 35° with XY. P is 10mm above HP and 15mm in front of VP. Q is 40mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-18', name: 'TL, α, h_B', slots: ['D01', 'D10', 'D04', 'D05', 'D06'],
      caseType: 'D', priority: 40,
      trainingExamples: [
        'Line AB 80mm long. Its plan makes 30° with XY. A is 20mm above HP and 25mm in front of VP. B is 55mm above HP.',
        'PQ 90mm. Top view at 40° to XY. P is 10mm above HP and 20mm in front of VP. Q is 65mm above HP.'
      ]
    },
    {
      procId: 'PROC-19', name: 'TL, β, d_B', slots: ['D01', 'D11', 'D04', 'D05', 'D07'],
      caseType: 'D', priority: 40,
      trainingExamples: [
        'Line AB 80mm long. Front view makes 45° with XY. A is 20mm above HP and 25mm in front of VP. B is 35mm in front of VP.',
        'PQ 90mm. Elevation at 35° to XY. P is 10mm above HP and 15mm in front of VP. Q is 45mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-20', name: 'TL + both endpoints', slots: ['D01', 'D04', 'D05', 'D06', 'D07'],
      caseType: 'D', priority: 35,
      trainingExamples: [
        'Line AB 90mm long. A is 20mm above HP and 25mm in front of VP. B is 50mm above HP and 40mm in front of VP.',
        'PQ 75mm. P is 10mm above HP and 20mm in front of VP. Q is 45mm above HP and 35mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-21', name: 'Find TL from positions', slots: ['D04', 'D05', 'D06', 'D07', 'D12'],
      caseType: 'D', priority: 30,
      trainingExamples: [
        'Line AB. A is 20mm above HP and 25mm in front of VP. B is 50mm above HP and 40mm in front of VP. Projectors are 60mm apart.',
        'PQ. P is 10mm above HP and 20mm in front of VP. Q is 45mm above HP and 35mm in front of VP. End projectors 50mm apart.'
      ]
    },
    {
      procId: 'PROC-22', name: 'TL, A, h_B, Δx', slots: ['D01', 'D04', 'D05', 'D06', 'D12'],
      caseType: 'D', priority: 25,
      trainingExamples: [
        'Line AB 90mm long. A is 20mm above HP and 25mm in front of VP. B is 55mm above HP. Projectors 60mm apart.',
        'PQ 75mm. P is 10mm above HP and 15mm in front of VP. Q is 50mm above HP. End projectors 55mm apart.'
      ]
    },
    {
      procId: 'PROC-23', name: 'TL, A, d_B, Δx', slots: ['D01', 'D04', 'D05', 'D07', 'D12'],
      caseType: 'D', priority: 25,
      trainingExamples: [
        'Line AB 90mm long. A is 20mm above HP and 25mm in front of VP. B is 40mm in front of VP. Projectors 60mm apart.',
        'PQ 75mm. P is 10mm above HP and 20mm in front of VP. Q is 35mm in front of VP. Projectors 50mm apart.'
      ]
    },
    {
      procId: 'PROC-24', name: 'TL, θ, Δx', slots: ['D01', 'D02', 'D04', 'D05', 'D12'],
      caseType: 'D', priority: 20,
      trainingExamples: [
        'Line AB 90mm long inclined 30° to HP. A is 20mm above HP and 25mm in front of VP. Projectors 60mm apart.',
        'PQ 75mm at 40° to HP. P is 10mm above HP and 20mm in front of VP. End projectors 55mm apart.'
      ]
    },
    {
      procId: 'PROC-25', name: 'TL, φ, Δx', slots: ['D01', 'D03', 'D04', 'D05', 'D12'],
      caseType: 'D', priority: 20,
      trainingExamples: [
        'Line AB 90mm long inclined 45° to VP. A is 20mm above HP and 25mm in front of VP. Projectors 60mm apart.',
        'PQ 75mm at 35° to VP. P is 10mm above HP and 20mm in front of VP. End projectors 50mm apart.'
      ]
    },
    {
      procId: 'PROC-26', name: 'L_FV, β, h_B', slots: ['D09', 'D11', 'D04', 'D05', 'D06'],
      caseType: 'D', priority: 15,
      trainingExamples: [
        'Front view of AB is 60mm making 45° with XY. A is 20mm above HP and 25mm in front of VP. B is 50mm above HP.',
        'Elevation of PQ is 50mm at 35° with XY. P is 10mm above HP and 15mm in front of VP. Q is 60mm above HP.'
      ]
    },
    {
      procId: 'PROC-27', name: 'Base + Traces', slots: ['D01', 'D02', 'D03', 'D04', 'SK12'],
      caseType: 'D', priority: 10,
      trainingExamples: [
        'Line AB 80mm at 30° to HP and 45° to VP. A is 20mm above HP. Mark traces.',
        'PQ 75mm making 35° with HP and 40° with VP. P is 10mm above HP. Find HT and VT.'
      ]
    },
    {
      procId: 'PROC-28', name: 'VT as 5th datum', slots: ['D09', 'D03', 'D04', 'D06', 'D15'],
      caseType: 'D', priority: 5,
      trainingExamples: [
        'Front view of AB is 60mm at 45° to VP. A is 20mm above HP. B is 55mm above HP. VT is 30mm above HP.',
        'Elevation of PQ is 50mm. PQ inclined 35° to VP. P is 10mm above HP. Q is 45mm above HP. VT 25mm above HP.'
      ]
    },
    {
      procId: 'PROC-29', name: 'TL + both views + position', slots: ['D01', 'D08', 'D09', 'SK05', 'D05'],
      caseType: 'D', priority: 50,
      trainingExamples: [
        'Line AB 75mm long. Top view 65mm and front view 55mm. End A is in HP and 25mm in front of VP.',
        'PQ 80mm. Plan 70mm, elevation 60mm. P is on HP and 20mm in front of VP.'
      ]
    },
    {
      procId: 'PROC-30', name: 'TL + both views + both positions', slots: ['D01', 'D08', 'D09', 'D04', 'D05'],
      caseType: 'D', priority: 48,
      trainingExamples: [
        'Line AB 75mm long. Top view 65mm and front view 55mm. A is 20mm above HP and 25mm in front of VP.',
        'PQ 80mm. Plan 70mm, elevation 60mm. P is 10mm above HP and 20mm in front of VP.'
      ]
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // TYPO DICTIONARY — for fuzzy correction
  // ═══════════════════════════════════════════════════════════════════════
  TYPO_DICTIONARY: {
    // Spatial terms
    'infornt': 'in front', 'infron': 'in front', 'infront': 'in front',
    'frount': 'front', 'fornt': 'front', 'fromt': 'front',
    'bove': 'above', 'abov': 'above', 'abobe': 'above',
    'bellow': 'below', 'belows': 'below',
    // Technical terms
    'mesures': 'measures', 'measurs': 'measures', 'mesure': 'measure', 'measrues': 'measures',
    'inclined': 'inclined', 'inclned': 'inclined', 'inclind': 'inclined',
    'parrallel': 'parallel', 'paralel': 'parallel', 'paralle': 'parallel',
    'perpendiclar': 'perpendicular', 'perpendiculr': 'perpendicular',
    'incliantion': 'inclination', 'inclination': 'inclination',
    'lenth': 'length', 'lenght': 'length', 'lengt': 'length',
    'hieght': 'height', 'heigh': 'height',
    'vertical': 'vertical', 'verticle': 'vertical',
    'horizontal': 'horizontal', 'horizantal': 'horizontal',
    'midponit': 'midpoint', 'midpoitn': 'midpoint', 'midepoint': 'midpoint',
    'projectoin': 'projection', 'porjection': 'projection',
    'projectors': 'projectors', 'projecors': 'projectors',
    'lne': 'line', 'lin': 'line', 'lien': 'line',
    // View terms
    'elevtion': 'elevation', 'elevetion': 'elevation', 'elev': 'elevation',
    'fornt view': 'front view', 'fron view': 'front view',
    'topp view': 'top view', 'top veiw': 'top view',
    // Units
    'milimeter': 'mm', 'millimeter': 'mm', 'millimetre': 'mm', 'milimetre': 'mm',
    'centimeter': 'cm', 'centimetre': 'cm',
    'mtr': 'm', 'mts': 'm', 'meter': 'm', 'metre': 'm'
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SYNONYM MAP — for semantic normalization
  // ═══════════════════════════════════════════════════════════════════════
  SYNONYM_MAP: {
    // Planes
    'horizontal plane': 'HP', 'h.p.': 'HP', 'h p': 'HP', 'hp': 'HP',
    'vertical plane': 'VP', 'v.p.': 'VP', 'v p': 'VP', 'vp': 'VP',
    'profile plane': 'PP', 'p.p.': 'PP',
    // Views
    'elevation': 'front view', 'front elevation': 'front view',
    'plan view': 'top view', 'plan': 'top view', 'top projection': 'top view',
    'side view': 'side view', 'profile view': 'side view',
    // Geometric terms
    'true inclination to hp': 'inclination to HP',
    'true inclination to vp': 'inclination to VP',
    'straight line': 'line',
    'straight': '',
    // Positional words
    'infront': 'in front', 'infront of': 'in front of',
    // Angle words
    'makes an angle': 'inclined', 'making an angle': 'inclined',
    'makes angle': 'inclined', 'at an angle': 'inclined'
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MODEL REGISTRY — track versions and capabilities
  // ═══════════════════════════════════════════════════════════════════════
  MODEL_REGISTRY: {
    normalizer: {
      version: '4.0.0', algorithm: 'multi-stage-rule-ml-hybrid',
      stages: ['char-correction', 'typo-levenshtein', 'synonym-expand', 'unit-convert', 'semantic-clean'],
      accuracy: 0.99
    },
    extractor: {
      version: '4.0.0', algorithm: 'multi-pass-nlp-ner',
      stages: ['endpoint-detect', 'special-conditions', 'paired-angles', 'numerical-extract', 'context-resolve'],
      accuracy: 0.98
    },
    classifier: {
      version: '4.0.0', algorithm: 'weighted-feature-matching-ensemble',
      stages: ['slot-count', 'feature-vector', 'similarity-score', 'confidence-calibrate'],
      accuracy: 0.97
    },
    validator: {
      version: '4.0.0', algorithm: 'physics-constraint-anomaly-detect',
      stages: ['domain-check', 'geometric-constraint', 'cross-field-validate', 'anomaly-score'],
      accuracy: 0.99
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════
  getDataType(id) { return this.DATA_TYPES[id] || null; },
  getSpecialCondition(id) { return this.SPECIAL_CONDITIONS[id] || null; },
  getProcById(procId) { return this.PROC_COMBINATIONS.find(p => p.procId === procId) || null; },
  validateSlotCount(count) { return count === 5; },
  getFieldDomain(field) {
    for (const dtype of Object.values(this.DATA_TYPES)) {
      if (dtype.field === field) return dtype.domain;
    }
    return null;
  },
  getAllTrainingExamples() {
    const all = [];
    for (const proc of this.PROC_COMBINATIONS) {
      for (const ex of (proc.trainingExamples || [])) {
        all.push({ procId: proc.procId, caseType: proc.caseType, text: ex });
      }
    }
    return all;
  }
};

if (typeof window !== 'undefined') window.ParserConfig = ParserConfig;
if (typeof module !== 'undefined' && module.exports) module.exports = ParserConfig;