// ============================================================
// Virtual Lab – Projections of Straight Lines
// lines-core.js  –  Infrastructure, State, Drawing Primitives
// ============================================================

// ── Canvas & Context ─────────────────────────────────────────
const canvas = document.getElementById('lineCanvas');
const ctx = canvas.getContext('2d');

// ── Application State ────────────────────────────────────────
const state = {
  // ── PROC-based system (new) ──────────────────────────────
  procId: null,          // e.g. 'PROC-01'
  constraints: null,     // raw parser constraints object
  geom: {},              // computed geometry from proc.compute()

  // ── Legacy case-based system (kept for manual dropdown) ──
  caseType: '',
  // common inputs (mm)
  L: 70, h: 30, d: 20,
  theta: 30, phi: 30,
  // Case 2A specific
  lowerH: 0,
  // Case 4 / 5
  theta4: 40, phi4: 30,
  // traces
  showTraces: false,

  // ── Step machine (shared) ─────────────────────────────────
  currentStep: 0,
  totalSteps: 0,
  // zoom / pan
  zoom: 1, panX: 0, panY: 0,
  isPanning: false, lastX: 0, lastY: 0
};

// ── Drawing Config ───────────────────────────────────────────
const cfg = {
  // scale: pixels per mm
  scale: 2.4,

  // ── HIGH-CONTRAST colours for dark #0d1117 background ──────
  xyColor: '#79c0ff',    // xy reference line — vivid sky blue
  projectorColor: '#c9d1d9',    // projector lines — bright white-gray
  constructionColor: '#c9d1d9',    // construction / helper lines — bright white-gray
  tvColor: '#7ee787',    // top view final — vivid green
  fvColor: '#79c0ff',    // front view final — vivid blue
  finalColor: '#f0f6fc',    // final highlight — near-white
  dimColor: '#d2dae4',    // dimensions & angle labels — bright silver
  htColor: '#ff7b72',    // HT trace — bright coral-red
  vtColor: '#d2a8ff',    // VT trace — bright violet
  locusColor: '#e3b341',    // locus lines — strong yellow
  arcColor: '#f9826c',    // construction arcs — bright orange
  pointColor: '#f0f6fc',    // points — near-white

  // ── Line widths (drawing convention hierarchy) ──────────────
  xyWidth: 1.8,                 // xy reference line
  projWidth: 0.8,                 // projector — thin continuous
  consWidth: 0.8,                 // construction lines — thin dashed
  finalWidth: 2.8,                 // ★ FINAL projections — THICKEST
  dimWidth: 0.8,                 // dimension / locus lines — thin

  // ── Fonts ──────────────────────────────────────────────────
  labelFont: '13px "DM Mono", monospace',
  labelSmall: '11px "DM Mono", monospace'
};

// ── Quick Reference text ─────────────────────────────────────
const quickRef = {
  '1': '<strong>Both views = True Length</strong><br>ab ∥ xy  |  a\'b\' ∥ xy<br>Line parallel to xy direction in 3D.',
  '2A': '<strong>TV = Point</strong><br><strong>FV = True Length ⊥ xy</strong><br>Perpendicular to HP → collapses to point in TV.',
  '2B': '<strong>FV = Point</strong><br><strong>TV = True Length ⊥ xy</strong><br>Perpendicular to VP → collapses to point in FV.',
  '3A': '<strong>FV = True Length at θ</strong><br><strong>TV = foreshortened ∥ xy</strong><br>TV length = L·cos(θ)',
  '3B': '<strong>TV = True Length at φ</strong><br><strong>FV = foreshortened ∥ xy</strong><br>FV length = L·cos(φ)',
  '4': '<strong>Both views foreshortened</strong><br>Two-step rotation method.<br>α < θ (apparent FV angle)<br>β < φ (apparent TV angle)',
  '5': '<strong>Both views ⊥ xy</strong><br>θ + φ = 90° (profile plane)<br>Trapezoidal method for TL.'
};

// ── Canvas Setup ─────────────────────────────────────────────
function setupCanvas() {
  const wrap = document.getElementById('canvasWrap');
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
}

function toScreen(xMm, yMm) {
  // paper coords: xMm from centre-x, yMm above xy (positive = up)
  // canvas coords: origin top-left
  const cx = canvas.width / 2 + state.panX;
  const cy = canvas.height / 2 + state.panY;
  return {
    x: cx + xMm * cfg.scale * state.zoom,
    y: cy - yMm * cfg.scale * state.zoom   // canvas y flipped
  };
}

function mm(px) { return px / (cfg.scale * state.zoom); }  // px→mm helper
function px(mm_) { return mm_ * cfg.scale * state.zoom; }  // mm→px helper

function clearCanvas() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ── Drawing Primitives ───────────────────────────────────────

function drawLine(x1mm, y1mm, x2mm, y2mm, color, width, dash = []) {
  const p1 = toScreen(x1mm, y1mm);
  const p2 = toScreen(x2mm, y2mm);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.restore();
}

function drawPoint(xmm, ymm, color = cfg.pointColor, r = 3) {
  const p = toScreen(xmm, ymm);
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
  ctx.fill();
  // white inner ring for visibility
  ctx.strokeStyle = '#0d1117';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawPointRing(xmm, ymm, color = cfg.pointColor, r = 5) {
  const p = toScreen(xmm, ymm);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

// offset: {dx, dy} in canvas pixels; align: 'left'|'right'|'center'
function drawLabel(text, xmm, ymm, color = cfg.pointColor, offset = { dx: 6, dy: -6 }, font = cfg.labelFont) {
  const p = toScreen(xmm, ymm);
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = offset.dx < 0 ? 'right' : (offset.dx === 0 ? 'center' : 'left');
  ctx.textBaseline = 'middle';
  ctx.fillText(text, p.x + offset.dx, p.y + offset.dy);
  ctx.restore();
}

function drawArc(cxmm, cymm, rMm, startDeg, endDeg, color = cfg.arcColor, width = 0.8, dash = [4, 4]) {
  const c = toScreen(cxmm, cymm);
  const r = px(rMm);
  // angles: 0=right, measured CW in canvas (angles in degrees, canvas y-flipped)
  const sa = (-startDeg) * Math.PI / 180;
  const ea = (-endDeg) * Math.PI / 180;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.arc(c.x, c.y, r, sa, ea, true); // anticlockwise = CCW in screen = correct for above-xy arcs
  ctx.stroke();
  ctx.restore();
}

// ── XY Line ─────────────────────────────────────────────────
function drawXYLine(extraMm = 20) {
  const half = canvas.width / (2 * cfg.scale * state.zoom) + extraMm;
  drawLine(-half, 0, half, 0, cfg.xyColor, cfg.xyWidth);
  drawLabel('x', -half, 0, cfg.xyColor, { dx: -2, dy: -10 });
  drawLabel('y', half, 0, cfg.xyColor, { dx: 2, dy: -10 });
}

// ── Projector (vertical construction line) ───────────────────
// Drawing convention: projectors are CONTINUOUS thin lines (no dash)
function drawProjector(xmm, y1mm, y2mm) {
  drawLine(xmm, y1mm, xmm, y2mm, cfg.projectorColor, cfg.projWidth, []);
}

// ── Angle arc indicator ──────────────────────────────────────
// direction: 'up'  = arc sweeps upward from horizontal  (FV angles, above xy)
//            'down'= arc sweeps downward from horizontal (TV angles, below xy)
function drawAngleArc(cxmm, cymm, deg, rMm = 10, color = cfg.dimColor, direction = 'up') {
  const c = toScreen(cxmm, cymm);
  const r = px(rMm);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.0;
  ctx.setLineDash([]);
  ctx.beginPath();
  if (direction === 'up') {
    // 0→-deg anticlockwise in canvas = upward in paper coords
    ctx.arc(c.x, c.y, r, 0, -deg * Math.PI / 180, true);
  } else {
    // 0→+deg clockwise in canvas = downward in paper coords
    ctx.arc(c.x, c.y, r, 0, deg * Math.PI / 180, false);
  }
  ctx.stroke();
  ctx.restore();
  // Label at midpoint of arc
  const midDeg = deg / 2;
  const lx = cxmm + (rMm + 5) * Math.cos(midDeg * Math.PI / 180);
  const sign = (direction === 'up') ? 1 : -1;
  const ly = cymm + sign * (rMm + 5) * Math.sin(midDeg * Math.PI / 180);
  drawLabel(deg.toFixed(0) + '°', lx, ly, color, { dx: 0, dy: 0 }, cfg.labelSmall);
}

// ── Dimension arrow ──────────────────────────────────────────
function drawDimension(x1mm, y1mm, x2mm, y2mm, textOverride) {
  const len = Math.sqrt((x2mm - x1mm) ** 2 + (y2mm - y1mm) ** 2);
  const txt = textOverride || (len.toFixed(1) + ' mm');
  // midpoint
  const mx = (x1mm + x2mm) / 2, my = (y1mm + y2mm) / 2;
  drawLine(x1mm, y1mm, x2mm, y2mm, cfg.dimColor, cfg.dimWidth, []);
  drawLabel(txt, mx, my, cfg.dimColor, { dx: 6, dy: -8 }, cfg.labelSmall);
}

// ── Instructions ─────────────────────────────────────────────
function updateInstructions(tag, title, text) {
  document.getElementById('instrTag').textContent = tag;
  document.getElementById('instrTitle').textContent = title;
  document.getElementById('instrText').textContent = text;
}

// ── Step counter ─────────────────────────────────────────────
function updateStepUI() {
  document.getElementById('stepCurrent').textContent = state.currentStep;
  document.getElementById('stepTotal').textContent = state.totalSteps;
  document.getElementById('prevBtn').disabled = state.currentStep <= 1;
  document.getElementById('nextBtn').disabled = state.currentStep >= state.totalSteps;
}

// ── Dynamic Inputs ───────────────────────────────────────────
function buildField(id, label, defaultVal, min = 0, max = 999) {
  return `<div class="input-group">
    <label class="field-label" for="${id}">${label}</label>
    <input id="${id}" class="field-input" type="number" value="${defaultVal}" min="${min}" max="${max}" step="1">
  </div>`;
}

function buildInputsFor(caseType) {
  const c = document.getElementById('dynamicFields');
  const t = document.getElementById('traceSection');
  t.classList.add('hidden');
  switch (caseType) {
    case '1':
      c.innerHTML =
        buildField('inL', 'Line Length L (mm)', 70, 10, 300) +
        buildField('inH', 'Height above HP, h (mm)', 30, 0, 200) +
        buildField('inD', 'Distance from VP, d (mm)', 20, 0, 200);
      break;
    case '2A':
      c.innerHTML =
        buildField('inL', 'Line Length L (mm)', 60, 10, 300) +
        buildField('inD', 'Distance from VP, d (mm)', 20, 0, 200) +
        buildField('inLowerH', 'Lower end height above HP (mm)', 0, 0, 200);
      break;
    case '2B':
      c.innerHTML =
        buildField('inL', 'Line Length L (mm)', 60, 10, 300) +
        buildField('inH', 'Height above HP, h (mm)', 20, 0, 200) +
        buildField('inD', 'Distance of near end from VP, d (mm)', 15, 0, 200);
      break;
    case '3A':
      c.innerHTML =
        buildField('inL', 'Line Length L (mm)', 70, 10, 300) +
        buildField('inTheta', 'Inclination with HP θ (°)', 45, 1, 89) +
        buildField('inH', 'Height of A above HP, h (mm)', 20, 0, 200) +
        buildField('inD', 'Distance of A from VP, d (mm)', 15, 0, 200);
      t.classList.remove('hidden');
      break;
    case '3B':
      c.innerHTML =
        buildField('inL', 'Line Length L (mm)', 70, 10, 300) +
        buildField('inPhi', 'Inclination with VP φ (°)', 30, 1, 89) +
        buildField('inH', 'Height of A above HP, h (mm)', 20, 0, 200) +
        buildField('inD', 'Distance of A from VP, d (mm)', 15, 0, 200);
      t.classList.remove('hidden');
      break;
    case '4':
      c.innerHTML =
        buildField('inL', 'Line Length L (mm)', 80, 10, 300) +
        buildField('inTheta', 'Inclination with HP θ (°)', 40, 1, 89) +
        buildField('inPhi', 'Inclination with VP φ (°)', 30, 1, 89) +
        buildField('inH', 'Height of A above HP, h (mm)', 20, 0, 200) +
        buildField('inD', 'Distance of A from VP, d (mm)', 15, 0, 200);
      t.classList.remove('hidden');
      break;
    case '5':
      c.innerHTML =
        buildField('inL', 'Line Length L (mm)', 65, 10, 300) +
        buildField('inTheta', 'Inclination with HP θ (°)', 50, 1, 89) +
        buildField('inH', 'Height of P above HP, h (mm)', 25, 0, 200) +
        buildField('inD', 'Distance of P from VP, d (mm)', 20, 0, 200);
      break;
    default:
      c.innerHTML = '';
  }
  document.getElementById('generateBtn').disabled = !caseType;
}

function readInputs() {
  function v(id) { const el = document.getElementById(id); return el ? parseFloat(el.value) || 0 : 0; }
  state.L = v('inL');
  state.h = v('inH');
  state.d = v('inD');
  state.theta = v('inTheta');
  state.phi = v('inPhi');
  state.lowerH = v('inLowerH');
  state.showTraces = document.getElementById('showTraces')?.checked || false;
  // clamp θ + φ for case 5
  if (state.caseType === '5') {
    state.phi = 90 - state.theta;
  }
  // validate for case 4: θ+φ must be < 90 for non-profile
  if (state.caseType === '4') {
    if (state.theta + state.phi >= 90) {
      updateInstructions('⚠ Input Error',
        'Invalid Angle Combination',
        `θ + φ must be less than 90° for an oblique line. ` +
        `You entered θ=${state.theta}° + φ=${state.phi}° = ${state.theta + state.phi}°. ` +
        `Please reduce one of the angles and click Generate again.`);
      document.getElementById('instrTag').style.background = '#b91c1c';
      return false;
    }
  }
  document.getElementById('instrTag').style.background = '';
  return true;
}

// ── Placement algorithm ──────────────────────────────────────
function calcXA() {
  // Returns xA in mm (paper coordinates, centred on canvas)
  const halfW = canvas.width / (2 * cfg.scale * state.zoom);
  const margin = 15; // mm
  const L = state.L;
  // place A roughly at left quarter, leaving L room to the right
  const candidate = -halfW / 2;
  return Math.max(-halfW + margin + L, Math.min(candidate, halfW - margin - L));
}

// ── Zoom / Pan ───────────────────────────────────────────────
function zoomIn() { state.zoom = Math.min(state.zoom * 1.25, 8); redraw(); }
function zoomOut() { state.zoom = Math.max(state.zoom / 1.25, 0.2); redraw(); }
function fitView() { state.zoom = 1; state.panX = 0; state.panY = 0; redraw(); }

let panActive = false;
function togglePan() {
  panActive = !panActive;
  document.getElementById('canvasWrap').classList.toggle('pan-mode', panActive);
  document.getElementById('panBtn').classList.toggle('active', panActive);
}

canvas.addEventListener('mousedown', e => {
  if (!panActive) return;
  state.isPanning = true; state.lastX = e.clientX; state.lastY = e.clientY;
});
canvas.addEventListener('mousemove', e => {
  if (!state.isPanning) return;
  state.panX += e.clientX - state.lastX;
  state.panY += e.clientY - state.lastY;
  state.lastX = e.clientX; state.lastY = e.clientY;
  redraw();
});
canvas.addEventListener('mouseup', () => { state.isPanning = false; });
canvas.addEventListener('mouseleave', () => { state.isPanning = false; });

// ── Redraw dispatcher ────────────────────────────────────────
function redraw() {
  clearCanvas();
  if (state.currentStep === 0) return;
  if (!state.procId && !state.caseType) return;
  drawStep(state.currentStep);
}

function drawStep(n) {
  // ── New PROC-based system ─────────────────────────────────
  if (state.procId) {
    const proc = (typeof PROC_REGISTRY !== 'undefined') && PROC_REGISTRY[state.procId];
    if (proc && proc.drawStep) {
      proc.drawStep(n, state.geom, state.constraints);
      return;
    }
    // PROC registered but drawStep missing — show placeholder
    drawXYLine();
    updateInstructions('⚠', state.procId + ' — Step ' + n,
      'Drawing procedure for ' + state.procId + ' is not yet implemented.');
    return;
  }
  // ── Legacy case-based system (manual dropdown) ────────────
  switch (state.caseType) {
    case '1': drawCase1(n); break;
    case '2A': drawCase2A(n); break;
    case '2B': drawCase2B(n); break;
    case '3A': drawCase3A(n); break;
    case '3B': drawCase3B(n); break;
    case '4': drawCase4(n); break;
    case '5': drawCase5(n); break;
  }
}

// ── Generate (legacy manual dropdown) ────────────────────────
function generate() {
  if (!readInputs()) return;   // validation failed → instruction bar shows error
  // Clear PROC-based state so legacy drawing takes over
  state.procId = null;
  state.constraints = null;
  state.currentStep = 1;
  switch (state.caseType) {
    case '1': state.totalSteps = 5; break;
    case '2A': state.totalSteps = 5; break;
    case '2B': state.totalSteps = 5; break;
    case '3A': state.totalSteps = 5; break;
    case '3B': state.totalSteps = 5; break;
    case '4': state.totalSteps = 10; break;
    case '5': state.totalSteps = 6; break;
  }
  document.getElementById('canvasHint').classList.add('hidden');
  updateStepUI();
  redraw();
}

// ── Load from PROC (NLP parser path) ─────────────────────────
/**
 * Called by the NLP parser integration after a successful parse.
 * @param {string} procId  - e.g. 'PROC-01'
 * @param {object} constraints - parser constraints object
 */
function loadFromProc(procId, constraints) {
  const proc = (typeof PROC_REGISTRY !== 'undefined') && PROC_REGISTRY[procId];
  if (!proc) {
    updateInstructions('⚠ Not Implemented', procId,
      'This drawing procedure (' + procId + ') has not been implemented yet. ' +
      'Please try a different problem or use the manual dropdown.');
    return;
  }

  // Clear legacy state
  state.caseType = '';

  // Store PROC info
  state.procId = procId;
  state.constraints = constraints;

  // Mirror key constraints into legacy state fields (for calcXA etc.)
  state.L = constraints.TL || constraints.L_TV || constraints.L_FV || 70;
  state.theta = constraints.theta != null ? constraints.theta : 0;
  state.phi = constraints.phi != null ? constraints.phi : 0;
  state.h = constraints.h_A != null ? constraints.h_A : 20;
  state.d = constraints.d_A != null ? constraints.d_A : 15;
  state.lowerH = constraints.h_B != null ? constraints.h_B : 0;
  state.showTraces = constraints.special && constraints.special.includes('TRACE_REQ');

  // Compute geometry via the PROC handler
  try {
    state.geom = proc.compute(constraints);
  } catch (err) {
    console.error('[loadFromProc] compute() failed for', procId, err);
    updateInstructions('⚠ Geometry Error', procId, err.message);
    return;
  }

  state.totalSteps = proc.totalSteps;
  state.currentStep = 1;

  const hint = document.getElementById('canvasHint');
  if (hint) hint.classList.add('hidden');

  updateStepUI();
  redraw();
}

// ── Button wiring ────────────────────────────────────────────
document.getElementById('caseSelect').addEventListener('change', e => {
  state.caseType = e.target.value;
  buildInputsFor(state.caseType);
  document.getElementById('qrBody').innerHTML = quickRef[state.caseType] || 'Select a case to see key projection rules.';
  state.currentStep = 0; state.totalSteps = 0;
  updateStepUI();
  clearCanvas();
  document.getElementById('canvasHint').classList.remove('hidden');
  document.getElementById('instrTag').textContent = '—';
  document.getElementById('instrTitle').textContent = 'Virtual Lab – Projections of Straight Lines';
  document.getElementById('instrText').textContent = 'Fill in the parameters and click Generate.';
});

document.getElementById('generateBtn').addEventListener('click', () => {
  setupCanvas(); generate();
});
document.getElementById('resetBtn').addEventListener('click', () => {
  state.currentStep = 0; state.totalSteps = 0;
  clearCanvas();
  document.getElementById('canvasHint').classList.remove('hidden');
  document.getElementById('instrTag').textContent = '—';
  document.getElementById('instrTitle').textContent = 'Virtual Lab – Projections of Straight Lines';
  document.getElementById('instrText').textContent = 'Select a case and click Generate.';
  updateStepUI();
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (state.currentStep < state.totalSteps) { state.currentStep++; updateStepUI(); redraw(); }
});
document.getElementById('prevBtn').addEventListener('click', () => {
  if (state.currentStep > 1) { state.currentStep--; updateStepUI(); redraw(); }
});

document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
document.getElementById('fitBtn').addEventListener('click', fitView);
document.getElementById('panBtn').addEventListener('click', togglePan);

// Keyboard shortcuts
window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') document.getElementById('nextBtn').click();
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') document.getElementById('prevBtn').click();
  if (e.key === '+' || e.key === '=') zoomIn();
  if (e.key === '-') zoomOut();
  if (e.key === 'f' || e.key === 'F') fitView();
});

window.addEventListener('resize', () => { setupCanvas(); redraw(); });

// ── Init ─────────────────────────────────────────────────────
window.addEventListener('load', () => { setupCanvas(); updateStepUI(); });