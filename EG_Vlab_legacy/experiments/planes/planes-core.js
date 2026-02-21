// ========================================
// Virtual Lab - Projections of Planes
// Core Infrastructure (planes-core.js)
// Mirrors solids core.js architecture.
// ========================================

// ========================================
// Global Canvas
// ========================================
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

// ========================================
// Application State
// ========================================
const state = {
    shapeType: '',
    caseType: '',
    // Shape dimensions — populated by dynamic inputs
    dims: {
        side: 60,       // square / triangle / pentagon / hexagon
        length: 80,     // rectangle length
        width: 50,      // rectangle width
        diameter: 60    // circle / semicircle
    },
    // Case-specific angles
    theta: 30,   // inclination to HP  (P4, P6)
    phi: 30,   // inclination to VP  (P5)
    alpha: 45,   // edge angle to VP   (P6)
    // P1/P2/P3 orientation inputs
    restingOn: 'side', // 'side' | 'corner'  — P1
    alphaEdge: 30,     // °, side makes with HP when resting on corner — P1
    betaEdge: 30,     // °, side makes with VP — P2
    gammaEdge: 0,      // °, side makes with HP in SV — P3
    // Step state
    currentStep: 0,
    totalSteps: 0,
    // Computed geometry storage (filled per case at draw time)
    corners: {},
    // View transform
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    lastX: 0,
    lastY: 0
};

// ========================================
// Drawing Configuration
// ========================================
const config = {
    xyLineLength: 600,    // recalculated in setupCanvas
    xyLineY: 0,           // set to canvas.height * 0.55 in setupCanvas
    xyLineStartX: 40,
    // Line widths
    visibleLineWidth: 1.5,
    hiddenLineWidth: 1.0,
    constructionLineWidth: 0.5,
    // Colours
    visibleColor: '#0f172a',
    hiddenColor: '#64748b',
    constructionColor: '#cbd5e1',
    tempColor: '#94a3b8',  // stage-1 dashed / temporary geometry
    xyLineColor: '#1e293b',
    tvEdgeColor: '#059669',  // planes green accent for TV/FV labels
    // Typography
    labelFontSize: 12,
    labelColor: '#0f172a',
    annotationColor: '#059669'
};

// ========================================
// Initialization
// ========================================
function init() {
    setupCanvas();
    attachEventListeners();
    updateStepIndicator();
    drawInitialCanvas();
}

function setupCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth - 40;
    canvas.height = container.clientHeight - 40;

    // XY line sits at 55% height — gives more room above for FV true shapes
    config.xyLineY = canvas.height * 0.55;
    config.xyLineLength = canvas.width - 80;
    config.xyLineStartX = 40;

    applyTransform();
}

function applyTransform() {
    ctx.setTransform(state.zoom, 0, 0, state.zoom, state.panX, state.panY);
}

// ========================================
// Event Listeners
// ========================================
function attachEventListeners() {
    document.getElementById('shapeType').addEventListener('change', e => {
        state.shapeType = e.target.value;
        updateDynamicInputs();
    });
    document.getElementById('caseType').addEventListener('change', e => {
        state.caseType = e.target.value;
        updateDynamicInputs();
    });

    document.getElementById('generateBtn').addEventListener('click', generateProjection);
    document.getElementById('resetBtn').addEventListener('click', resetAll);

    document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
    document.getElementById('resetViewBtn').addEventListener('click', resetView);
    document.getElementById('panBtn').addEventListener('click', togglePan);

    document.getElementById('prevStepBtn').addEventListener('click', previousStep);
    document.getElementById('nextStepBtn').addEventListener('click', nextStep);

    canvas.addEventListener('mousedown', startPan);
    canvas.addEventListener('mousemove', doPan);
    canvas.addEventListener('mouseup', endPan);
    canvas.addEventListener('mouseleave', endPan);

    window.addEventListener('resize', handleResize);
}

// ========================================
// Dynamic Inputs
// ========================================
function updateDynamicInputs() {
    const shapeDimContainer = document.getElementById('shapeDimInputs');
    const caseSpecContainer = document.getElementById('caseSpecificInputs');
    shapeDimContainer.innerHTML = '';
    caseSpecContainer.innerHTML = '';

    // Shape dimension inputs
    if (state.shapeType) {
        buildShapeDimInputs(shapeDimContainer);
    }
    // Case-specific angle inputs
    if (state.caseType) {
        buildCaseAngleInputs(caseSpecContainer);
    }
}

function buildShapeDimInputs(container) {
    switch (state.shapeType) {
        case 'square':
            addDimInput(container, 'side', 'Side Length (mm):', state.dims.side);
            break;
        case 'rectangle':
            addDimInput(container, 'length', 'Length (mm):', state.dims.length);
            addDimInput(container, 'width', 'Width (mm):', state.dims.width);
            break;
        case 'triangle':
            addDimInput(container, 'side', 'Side Length (mm):', state.dims.side);
            break;
        case 'circle':
        case 'semicircle':
            addDimInput(container, 'diameter', 'Diameter (mm):', state.dims.diameter);
            break;
        case 'pentagon':
        case 'hexagon':
            addDimInput(container, 'side', 'Side Length (mm):', state.dims.side);
            break;
    }
}

function buildCaseAngleInputs(container) {
    switch (state.caseType) {
        case 'P1': {
            // Resting-on select
            const d1 = document.createElement('div');
            d1.className = 'input-group';
            d1.innerHTML = `<label for="sel_restingOn">Resting on HP via:</label>
                <select id="sel_restingOn" class="input-field">
                    <option value="side">Side (edge on XY)</option>
                    <option value="corner">Corner (vertex on XY)</option>
                </select>`;
            container.appendChild(d1);
            // Alpha edge input (hidden by default if side)
            const d2 = document.createElement('div');
            d2.className = 'input-group';
            d2.id = 'alphaEdge_group';
            d2.style.display = state.restingOn === 'corner' ? 'block' : 'none';
            d2.innerHTML = `<label for="angle_alphaEdge">Side AB angle to HP &alpha; (&deg;):</label>
                <input type="number" id="angle_alphaEdge" class="input-field" min="1" max="89" value="${state.alphaEdge}">`;
            container.appendChild(d2);
            setTimeout(() => {
                const sel = document.getElementById('sel_restingOn');
                if (sel) {
                    sel.value = state.restingOn;
                    sel.addEventListener('change', e => {
                        state.restingOn = e.target.value;
                        const ag = document.getElementById('alphaEdge_group');
                        if (ag) ag.style.display = state.restingOn === 'corner' ? 'block' : 'none';
                    });
                }
                const ai = document.getElementById('angle_alphaEdge');
                if (ai) ai.addEventListener('input', e => { state.alphaEdge = parseFloat(e.target.value) || state.alphaEdge; });
            }, 0);
            break;
        }
        case 'P2':
            addAngleInput(container, 'betaEdge', 'Side AB angle to VP \u03B2 (\u00B0, 0=\u2225VP):', state.betaEdge);
            break;
        case 'P3':
            addAngleInput(container, 'gammaEdge', 'Side angle to HP \u03B3 (\u00B0, 0=\u2225HP):', state.gammaEdge);
            break;
        case 'P4':
            addAngleInput(container, 'theta', 'Inclination to HP \u03B8 (\u00B0):', state.theta);
            break;
        case 'P5':
            addAngleInput(container, 'phi', 'Inclination to VP \u03C6 (\u00B0):', state.phi);
            break;
        case 'P6':
            addAngleInput(container, 'theta', 'Inclination to HP \u03B8 (\u00B0):', state.theta);
            addAngleInput(container, 'alpha', 'Edge angle to VP \u03B1 (\u00B0):', state.alpha);
            break;
    }
}

// Helper: dimension input (updates state.dims[key])
function addDimInput(container, key, label, defaultVal) {
    const div = document.createElement('div');
    div.className = 'input-group';
    const id = 'dim_' + key;
    div.innerHTML = `
        <label for="${id}">${label}</label>
        <input type="number" id="${id}" class="input-field"
               min="10" max="200" value="${defaultVal}" placeholder="${defaultVal}">
    `;
    container.appendChild(div);
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', e => {
                state.dims[key] = parseFloat(e.target.value) || defaultVal;
            });
        }
    }, 0);
}

// Helper: angle input (updates state[key] directly)
function addAngleInput(container, key, label, defaultVal) {
    const div = document.createElement('div');
    div.className = 'input-group';
    const id = 'angle_' + key;
    div.innerHTML = `
        <label for="${id}">${label}</label>
        <input type="number" id="${id}" class="input-field"
               min="1" max="89" value="${defaultVal}" placeholder="${defaultVal}">
    `;
    container.appendChild(div);
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', e => {
                state[key] = parseFloat(e.target.value) || defaultVal;
            });
        }
    }, 0);
}

// ========================================
// Validation
// ========================================
function validateInputs() {
    if (!state.shapeType) {
        alert('Please select a plane shape.');
        return false;
    }
    if (!state.caseType) {
        alert('Please select a projection case.');
        return false;
    }
    // Sync current DOM values into state before validating
    syncDynamicInputs();

    const d = state.dims;
    switch (state.shapeType) {
        case 'square':
        case 'triangle':
        case 'pentagon':
        case 'hexagon':
            if (!d.side || d.side < 10) { alert('Side length must be at least 10 mm.'); return false; }
            break;
        case 'rectangle':
            if (!d.length || d.length < 10) { alert('Length must be at least 10 mm.'); return false; }
            if (!d.width || d.width < 10) { alert('Width must be at least 10 mm.'); return false; }
            break;
        case 'circle':
        case 'semicircle':
            if (!d.diameter || d.diameter < 10) { alert('Diameter must be at least 10 mm.'); return false; }
            break;
    }
    if ((state.caseType === 'P4' || state.caseType === 'P6') && (state.theta <= 0 || state.theta >= 90)) {
        alert('\u03B8 must be between 1\u00B0 and 89\u00B0.'); return false;
    }
    if (state.caseType === 'P5' && (state.phi <= 0 || state.phi >= 90)) {
        alert('\u03C6 must be between 1\u00B0 and 89\u00B0.'); return false;
    }
    if (state.caseType === 'P6' && (state.alpha <= 0 || state.alpha >= 90)) {
        alert('\u03B1 must be between 1\u00B0 and 89\u00B0.'); return false;
    }
    if (state.caseType === 'P1' && state.restingOn === 'corner' && (state.alphaEdge <= 0 || state.alphaEdge >= 90)) {
        alert('\u03B1 (corner angle) must be between 1\u00B0 and 89\u00B0.'); return false;
    }
    if (state.caseType === 'P2' && (state.betaEdge < 0 || state.betaEdge >= 90)) {
        alert('\u03B2 must be between 0\u00B0 and 89\u00B0.'); return false;
    }
    if (state.caseType === 'P3' && (state.gammaEdge < 0 || state.gammaEdge >= 90)) {
        alert('\u03B3 must be between 0\u00B0 and 89\u00B0.'); return false;
    }
    return true;
}

function syncDynamicInputs() {
    // Sync dimension inputs
    const dimKeys = ['side', 'length', 'width', 'diameter'];
    for (const k of dimKeys) {
        const el = document.getElementById('dim_' + k);
        if (el) state.dims[k] = parseFloat(el.value) || state.dims[k];
    }
    // Sync angle inputs
    const angleKeys = ['theta', 'phi', 'alpha', 'alphaEdge', 'betaEdge', 'gammaEdge'];
    for (const k of angleKeys) {
        const el = document.getElementById('angle_' + k);
        if (el) state[k] = parseFloat(el.value) || state[k];
    }
    // Sync restingOn select
    const sel = document.getElementById('sel_restingOn');
    if (sel) state.restingOn = sel.value || state.restingOn;
}

// ========================================
// Generate Projection
// ========================================
function generateProjection() {
    if (!validateInputs()) return;

    console.log('Generating planes projection:', state.shapeType, state.caseType);

    initializeSteps();
    state.currentStep = 1;
    updateStepIndicator();
    drawStep(1);
}

function initializeSteps() {
    switch (state.caseType) {
        case 'P1': state.totalSteps = 5; break;
        case 'P2': state.totalSteps = 5; break;
        case 'P3': state.totalSteps = 6; break;
        case 'P4': state.totalSteps = 7; break;
        case 'P5': state.totalSteps = 7; break;
        case 'P6': state.totalSteps = 10; break;
        default: state.totalSteps = 0;
    }
}

function drawStep(stepNumber) {
    clearCanvas();
    applyTransform();

    switch (state.caseType) {
        case 'P1': drawCaseP1Step(stepNumber); break;
        case 'P2': drawCaseP2Step(stepNumber); break;
        case 'P3': drawCaseP3Step(stepNumber); break;
        case 'P4': drawCaseP4Step(stepNumber); break;
        case 'P5': drawCaseP5Step(stepNumber); break;
        case 'P6': drawCaseP6Step(stepNumber); break;
    }
}

// ========================================
// Step Controls
// ========================================
function nextStep() {
    if (state.currentStep < state.totalSteps) {
        state.currentStep++;
        updateStepIndicator();
        drawStep(state.currentStep);
    }
}

function previousStep() {
    if (state.currentStep > 1) {
        state.currentStep--;
        updateStepIndicator();
        drawStep(state.currentStep);
    }
}

function updateStepIndicator() {
    document.getElementById('stepIndicator').textContent =
        `Step ${state.currentStep} / ${state.totalSteps}`;
}

function updateInstructions(title, text) {
    document.getElementById('instructionTitle').textContent = title;
    document.getElementById('instructionText').textContent = text;
}

// ========================================
// Shape Builder
// Returns vertices in CANVAS coordinates.
// Convention:
//   - Bottom reference edge sits ON XY line (y = xyLineY)
//   - Shape extends ABOVE XY (decreasing y in canvas space)
//   - Labels: FV uses primed notation e.g. "a'", "b'"
//   - TV uses unprimed e.g. "a", "b"
// ========================================
function buildFVShape(labelPrime, centerX) {
    const xyY = config.xyLineY;
    const cx = (centerX !== undefined) ? centerX : canvas.width / 2;   // horizontal centre
    const d = state.dims;
    const prime = labelPrime ? "'" : '';
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    switch (state.shapeType) {

        case 'square': {
            const s = d.side;
            return {
                type: 'polygon',
                vertices: [
                    { x: cx - s / 2, y: xyY, label: 'a' + prime },
                    { x: cx + s / 2, y: xyY, label: 'b' + prime },
                    { x: cx + s / 2, y: xyY - s, label: 'c' + prime },
                    { x: cx - s / 2, y: xyY - s, label: 'd' + prime }
                ],
                center: { x: cx, y: xyY - s / 2 }
            };
        }

        case 'rectangle': {
            const l = d.length, w = d.width;
            return {
                type: 'polygon',
                vertices: [
                    { x: cx - l / 2, y: xyY, label: 'a' + prime },
                    { x: cx + l / 2, y: xyY, label: 'b' + prime },
                    { x: cx + l / 2, y: xyY - w, label: 'c' + prime },
                    { x: cx - l / 2, y: xyY - w, label: 'd' + prime }
                ],
                center: { x: cx, y: xyY - w / 2 }
            };
        }

        case 'triangle': {
            const s = d.side;
            const h = s * Math.sqrt(3) / 2;
            return {
                type: 'polygon',
                vertices: [
                    { x: cx - s / 2, y: xyY, label: 'a' + prime },
                    { x: cx + s / 2, y: xyY, label: 'b' + prime },
                    { x: cx, y: xyY - h, label: 'c' + prime }
                ],
                // centroid — 1/3 up from base
                center: { x: cx, y: xyY - h / 3 }
            };
        }

        case 'pentagon':
        case 'hexagon': {
            const n = state.shapeType === 'pentagon' ? 5 : 6;
            const s = d.side;
            const R = s / (2 * Math.sin(Math.PI / n));   // circumradius
            const r = R * Math.cos(Math.PI / n);          // inradius (height to flat bottom)
            // Starting angle: places vertex[0] at bottom-left on XY
            const startAngle = -(Math.PI / 2 + Math.PI / n);
            const verts = [];
            for (let i = 0; i < n; i++) {
                const a = startAngle + i * (2 * Math.PI / n);
                verts.push({
                    x: cx + R * Math.cos(a),
                    // canvas y = xyY − (r + R·sin(a))  [since local y↑ maps to canvas y↓]
                    y: xyY - r - R * Math.sin(a),
                    label: letters[i] + prime
                });
            }
            return {
                type: 'polygon',
                vertices: verts,
                center: { x: cx, y: xyY - r }
            };
        }

        case 'circle': {
            const r = d.diameter / 2;
            return {
                type: 'circle',
                center: { x: cx, y: xyY - r },
                radius: r,
                // Key points used for projectors and TV labelling
                keyPoints: [
                    { x: cx - r, y: xyY - r, label: 'a' + prime },  // leftmost
                    { x: cx, y: xyY, label: 'b' + prime },  // bottom (on XY)
                    { x: cx + r, y: xyY - r, label: 'c' + prime },  // rightmost
                    { x: cx, y: xyY - d.diameter, label: 'd' + prime }  // top
                ]
            };
        }

        case 'semicircle': {
            const r = d.diameter / 2;
            // Flat edge (diameter) rests on XY; arc is above
            return {
                type: 'semicircle',
                center: { x: cx, y: xyY },
                radius: r,
                keyPoints: [
                    { x: cx - r, y: xyY, label: 'a' + prime }, // left end of diameter
                    { x: cx + r, y: xyY, label: 'b' + prime }, // right end of diameter
                    { x: cx, y: xyY - r, label: 'c' + prime }  // top of arc
                ]
            };
        }

        default:
            console.warn('buildFVShape: unknown shapeType', state.shapeType);
            return { type: 'polygon', vertices: [], center: { x: cx, y: xyY } };
    }
}

// ========================================
// buildTVShape — mirrors buildFVShape but places the shape BELOW XY.
// Top reference edge rests ON XY (y = xyLineY), shape extends downward.
// labelPrime: false → unprimed labels (a,b…), true → primed (a',b'…)
// ========================================
function buildTVShape(labelPrime, centerX) {
    const xyY = config.xyLineY;
    const cx = (centerX !== undefined) ? centerX : canvas.width / 2;
    const d = state.dims;
    const prime = labelPrime ? "'" : '';
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    switch (state.shapeType) {

        case 'square': {
            const s = d.side;
            return {
                type: 'polygon',
                vertices: [
                    { x: cx - s / 2, y: xyY, label: 'a' + prime },
                    { x: cx + s / 2, y: xyY, label: 'b' + prime },
                    { x: cx + s / 2, y: xyY + s, label: 'c' + prime },
                    { x: cx - s / 2, y: xyY + s, label: 'd' + prime }
                ],
                center: { x: cx, y: xyY + s / 2 }
            };
        }

        case 'rectangle': {
            const l = d.length, w = d.width;
            return {
                type: 'polygon',
                vertices: [
                    { x: cx - l / 2, y: xyY, label: 'a' + prime },
                    { x: cx + l / 2, y: xyY, label: 'b' + prime },
                    { x: cx + l / 2, y: xyY + w, label: 'c' + prime },
                    { x: cx - l / 2, y: xyY + w, label: 'd' + prime }
                ],
                center: { x: cx, y: xyY + w / 2 }
            };
        }

        case 'triangle': {
            const s = d.side;
            const h = s * Math.sqrt(3) / 2;
            return {
                type: 'polygon',
                vertices: [
                    { x: cx - s / 2, y: xyY, label: 'a' + prime },
                    { x: cx + s / 2, y: xyY, label: 'b' + prime },
                    { x: cx, y: xyY + h, label: 'c' + prime }
                ],
                center: { x: cx, y: xyY + h / 3 }
            };
        }

        case 'pentagon':
        case 'hexagon': {
            const n = state.shapeType === 'pentagon' ? 5 : 6;
            const s = d.side;
            const R = s / (2 * Math.sin(Math.PI / n));
            const r = R * Math.cos(Math.PI / n);
            // Start angle: flat edge on top (touching XY)
            const startAngle = (Math.PI / 2 + Math.PI / n);
            const verts = [];
            for (let i = 0; i < n; i++) {
                const a = startAngle + i * (2 * Math.PI / n);
                verts.push({
                    x: cx + R * Math.cos(a),
                    y: xyY + r + R * Math.sin(a),
                    label: letters[i] + prime
                });
            }
            return { type: 'polygon', vertices: verts, center: { x: cx, y: xyY + r } };
        }

        case 'circle': {
            const r = d.diameter / 2;
            return {
                type: 'circle',
                center: { x: cx, y: xyY + r },
                radius: r,
                keyPoints: [
                    { x: cx - r, y: xyY + r, label: 'a' + prime },
                    { x: cx, y: xyY, label: 'b' + prime },
                    { x: cx + r, y: xyY + r, label: 'c' + prime },
                    { x: cx, y: xyY + d.diameter, label: 'd' + prime }
                ]
            };
        }

        case 'semicircle': {
            const r = d.diameter / 2;
            return {
                type: 'semicircle',
                center: { x: cx, y: xyY },
                radius: r,
                keyPoints: [
                    { x: cx - r, y: xyY, label: 'a' + prime },
                    { x: cx + r, y: xyY, label: 'b' + prime },
                    { x: cx, y: xyY + r, label: 'c' + prime }
                ]
            };
        }

        default:
            return { type: 'polygon', vertices: [], center: { x: cx, y: xyY } };
    }
}

// ========================================
// drawTVShape — draw a TV shape (below XY).
// Works for polygon, circle, semicircle (arc points downward).
// ========================================
function drawTVShape(shape, style) {
    style = style || 'visible';
    if (shape.type === 'polygon') {
        drawClosedPolyline(shape.vertices, style);
    } else if (shape.type === 'circle') {
        drawCircleArc(shape.center.x, shape.center.y, shape.radius, 0, 2 * Math.PI, style);
    } else if (shape.type === 'semicircle') {
        // Arc below XY: from 0 to π (right to left, lower half)
        drawCircleArc(shape.center.x, shape.center.y, shape.radius, 0, Math.PI, style);
        drawLine(shape.center.x - shape.radius, shape.center.y,
            shape.center.x + shape.radius, shape.center.y, style);
    }
}

// ========================================
// labelTVVertices — labels for TV shape (below XY)
// ========================================
function labelTVVertices(shape) {
    if (shape.type === 'polygon') {
        for (const v of shape.vertices) {
            const dx = v.x - shape.center.x;
            const dy = v.y - shape.center.y;
            const len = Math.hypot(dx, dy) || 1;
            drawLabel(v.label, v.x, v.y, (dx / len) * 10, (dy / len) * 10);
        }
    } else if (shape.type === 'circle' || shape.type === 'semicircle') {
        for (const kp of shape.keyPoints) {
            drawLabel(kp.label, kp.x, kp.y, 6, 10);
        }
    }
}

// ========================================
// drawFVEdgeView — horizontal edge line ON XY (FV edge view for P2/P4/P6 Stage-1)
// ========================================
function drawFVEdgeView(shape, style) {
    style = style || 'visible';
    const { left, right } = getShapeXExtent(shape);
    drawLine(left, config.xyLineY, right, config.xyLineY, style);
    // Mark endpoints
    ctx.save();
    ctx.fillStyle = config.labelColor;
    for (const x of [left, right]) {
        ctx.beginPath(); ctx.arc(x, config.xyLineY, 2, 0, 2 * Math.PI); ctx.fill();
    }
    ctx.restore();
}

// ========================================
// computeP4Stage2 — foreshortened TV for two-stage P4/P6
// Given the Stage-1 TV polygon and theta (in degrees),
// returns a new polygon whose x-positions are foreshortened.
// Pivot = leftmost point (resting edge).
// Stage-2 TV vertex i: x = xPivot + (xi - xPivot)*cos(θ), y = yi (unchanged)
// Stage-2 FV vertex i (on tilted edge): x = xPivot + (xi - xPivot)*cos(θ),
//                                        y = xyY   - (xi - xPivot)*sin(θ)
// ========================================
function computeP4Stage2(tvShape, thetaDeg, xOffset) {
    const theta = degreesToRadians(thetaDeg);
    const xyY = config.xyLineY;
    xOffset = xOffset || 0;
    const { left: xPivot } = getShapeXExtent(tvShape);
    // pivotX is the Stage-2 pivot position — shifted right by xOffset
    // so Stage-2 final views don't overlap Stage-1 views
    const pivotX = xPivot + xOffset;

    const result = { fv: [], tv: [], pivotX };

    const processPoint = (x, y, label) => {
        const dist = x - xPivot;   // distance along edge, measured from Stage-1 pivot
        result.fv.push({ x: pivotX + dist * Math.cos(theta), y: xyY - dist * Math.sin(theta), label: label + "'" });
        result.tv.push({ x: pivotX + dist * Math.cos(theta), y, label });
    };

    if (tvShape.type === 'polygon') {
        for (const v of tvShape.vertices) processPoint(v.x, v.y, v.label);
    } else if (tvShape.type === 'circle' || tvShape.type === 'semicircle') {
        for (const kp of tvShape.keyPoints) processPoint(kp.x, kp.y, kp.label);
    }
    return result;   // { fv: [{x,y,label}], tv: [{x,y,label}], pivotX }
}

// ========================================
// computeP5Stage2 — foreshortened FV for two-stage P5
// Given Stage-1 FV polygon and phi (in degrees).
// Pivot = leftmost point of FV edge on XY.
// Stage-2 TV vertex i: x = xPivot + (xi - xPivot)*cos(φ), y = xyY + (xi - xPivot)*sin(φ)
// Stage-2 FV vertex i: x = same as Stage-2 TV x, y = original FV y (from locus)
// ========================================
function computeP5Stage2(fvShape, phiDeg, xOffset) {
    const phi = degreesToRadians(phiDeg);
    const xyY = config.xyLineY;
    xOffset = xOffset || 0;
    const { left: xPivot } = getShapeXExtent(fvShape);
    // pivotX is the Stage-2 pivot position — shifted right by xOffset
    const pivotX = xPivot + xOffset;

    const result = { fv: [], tv: [], pivotX };

    const processPoint = (x, y, label) => {
        const dist = x - xPivot;   // distance along edge, measured from Stage-1 pivot
        const newX = pivotX + dist * Math.cos(phi);
        result.tv.push({ x: newX, y: xyY + dist * Math.sin(phi), label });
        result.fv.push({ x: newX, y, label: label + "'" });
    };

    if (fvShape.type === 'polygon') {
        for (const v of fvShape.vertices) processPoint(v.x, v.y, v.label.replace("'", ""));
    } else if (fvShape.type === 'circle' || fvShape.type === 'semicircle') {
        for (const kp of fvShape.keyPoints) processPoint(kp.x, kp.y, kp.label.replace("'", ""));
    }
    return result;   // { fv: [{x,y,label}], tv: [{x,y,label}], pivotX }
}

// ========================================
// getStage2Offset — returns the X offset to separate Stage-2 views from Stage-1.
// Matches solids pattern: gap = shapeWidth + 60px.
// ========================================
function getStage2Offset(shape) {
    const ext = getShapeXExtent(shape);
    return (ext.right - ext.left) + 60;
}

// Returns {top, bottom} — minimum and maximum y-coordinates of a shape.
function getShapeYExtent(shape) {
    let pts = [];
    if (shape.type === 'polygon') pts = shape.vertices;
    else if (shape.keyPoints && shape.keyPoints.length) pts = shape.keyPoints;
    else if (shape.center && shape.radius !== undefined) {
        return { top: shape.center.y - shape.radius, bottom: shape.center.y + shape.radius };
    }
    if (!pts.length) return { top: shape.center ? shape.center.y : 0, bottom: shape.center ? shape.center.y : 0 };
    return {
        top: Math.min(...pts.map(p => p.y)),
        bottom: Math.max(...pts.map(p => p.y))
    };
}

// ========================================
// drawPointSet — draw a closed polygon from [{x,y}] array
// ========================================
function drawPointSet(points, style) {
    if (!points || points.length < 2) return;
    ctx.save();
    switch (style) {
        case 'hidden': ctx.strokeStyle = config.hiddenColor; ctx.lineWidth = config.hiddenLineWidth; ctx.setLineDash([5, 5]); break;
        case 'temp': ctx.strokeStyle = config.tempColor; ctx.lineWidth = config.hiddenLineWidth; ctx.setLineDash([6, 4]); break;
        case 'construction': ctx.strokeStyle = config.constructionColor; ctx.lineWidth = config.constructionLineWidth; ctx.setLineDash([2, 3]); break;
        default: ctx.strokeStyle = config.visibleColor; ctx.lineWidth = config.visibleLineWidth; ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

// ========================================
// labelPointSet — label each point in a [{x,y,label}] array
// ========================================
function labelPointSet(points, offsetX, offsetY) {
    offsetX = offsetX || 6;
    offsetY = offsetY || -7;
    for (const p of points) {
        if (p.label) drawLabel(p.label, p.x, p.y, offsetX, offsetY);
    }
}

// ========================================
// Shape extent helpers
// ========================================
function getShapeXExtent(shape) {
    if (shape.type === 'circle') {
        return { left: shape.center.x - shape.radius, right: shape.center.x + shape.radius };
    }
    if (shape.type === 'semicircle') {
        return { left: shape.center.x - shape.radius, right: shape.center.x + shape.radius };
    }
    const xs = shape.vertices.map(v => v.x);
    return { left: Math.min(...xs), right: Math.max(...xs) };
}

function getShapeYExtent(shape) {
    if (shape.type === 'circle') {
        return { top: shape.center.y - shape.radius, bottom: shape.center.y + shape.radius };
    }
    if (shape.type === 'semicircle') {
        return { top: shape.center.y - shape.radius, bottom: shape.center.y };
    }
    const ys = shape.vertices.map(v => v.y);
    return { top: Math.min(...ys), bottom: Math.max(...ys) };
}

// ========================================
// Drawing Utilities
// ========================================
function clearCanvas() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function drawXYLine() {
    ctx.save();
    ctx.strokeStyle = config.xyLineColor;
    ctx.lineWidth = config.visibleLineWidth;
    ctx.setLineDash([]);

    const sx = config.xyLineStartX;
    const ex = sx + config.xyLineLength;
    const y = config.xyLineY;

    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.lineTo(ex, y);
    ctx.stroke();

    // X and Y labels + arrowheads
    ctx.font = `${config.labelFontSize + 1}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;
    ctx.fillText('X', sx - 15, y + 5);
    ctx.fillText('Y', ex + 6, y + 5);

    drawArrow(sx, y, sx - 10, y);
    drawArrow(ex, y, ex + 10, y);

    ctx.restore();
}

function drawArrow(fromX, fromY, toX, toY) {
    const headLen = 5;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6),
        toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6),
        toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

// drawLine — solid visible, dashed hidden, dotted construction, dashed-light temp
function drawLine(x1, y1, x2, y2, style) {
    // style: 'visible' | 'hidden' | 'construction' | 'temp'
    ctx.save();
    switch (style) {
        case 'hidden':
            ctx.strokeStyle = config.hiddenColor;
            ctx.lineWidth = config.hiddenLineWidth;
            ctx.setLineDash([5, 5]);
            break;
        case 'construction':
            ctx.strokeStyle = config.constructionColor;
            ctx.lineWidth = config.constructionLineWidth;
            ctx.setLineDash([2, 3]);
            break;
        case 'temp':
            ctx.strokeStyle = config.tempColor;
            ctx.lineWidth = config.hiddenLineWidth;
            ctx.setLineDash([6, 4]);
            break;
        default: // 'visible'
            ctx.strokeStyle = config.visibleColor;
            ctx.lineWidth = config.visibleLineWidth;
            ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
}

// Draw a projector (thin dashed vertical/diagonal helper line)
function drawProjector(x1, y1, x2, y2) {
    drawLine(x1, y1, x2, y2, 'construction');
}

// Draw a polygon given an array of {x,y} points — closed
function drawClosedPolyline(points, style) {
    if (!points || points.length < 2) return;
    ctx.save();
    switch (style) {
        case 'hidden':
            ctx.strokeStyle = config.hiddenColor;
            ctx.lineWidth = config.hiddenLineWidth;
            ctx.setLineDash([5, 5]);
            break;
        case 'temp':
            ctx.strokeStyle = config.tempColor;
            ctx.lineWidth = config.hiddenLineWidth;
            ctx.setLineDash([6, 4]);
            break;
        default:
            ctx.strokeStyle = config.visibleColor;
            ctx.lineWidth = config.visibleLineWidth;
            ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

// Draw a circle
function drawCircleArc(cx, cy, r, startAngle, endAngle, style) {
    ctx.save();
    switch (style) {
        case 'hidden':
            ctx.strokeStyle = config.hiddenColor;
            ctx.lineWidth = config.hiddenLineWidth;
            ctx.setLineDash([5, 5]);
            break;
        case 'temp':
            ctx.strokeStyle = config.tempColor;
            ctx.lineWidth = config.hiddenLineWidth;
            ctx.setLineDash([6, 4]);
            break;
        default:
            ctx.strokeStyle = config.visibleColor;
            ctx.lineWidth = config.visibleLineWidth;
            ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.stroke();
    ctx.restore();
}

// Label a point with a small dot + text
function drawLabel(text, x, y, offsetX, offsetY) {
    offsetX = offsetX === undefined ? 5 : offsetX;
    offsetY = offsetY === undefined ? -6 : offsetY;
    ctx.save();
    ctx.fillStyle = config.labelColor;
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    // Small dot at point
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(text, x + offsetX, y + offsetY);
    ctx.restore();
}

// Draw annotation text (e.g. "TRUE SHAPE", "EDGE VIEW")
function drawAnnotation(text, x, y, color) {
    ctx.save();
    ctx.fillStyle = color || config.annotationColor;
    ctx.font = `bold ${config.labelFontSize + 1}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
    ctx.restore();
}

// Draw a small angle arc near a point
function drawAngleArc(cx, cy, radius, startDeg, endDeg, label) {
    ctx.save();
    ctx.strokeStyle = config.annotationColor;
    ctx.lineWidth = config.constructionLineWidth;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, degreesToRadians(startDeg), degreesToRadians(endDeg));
    ctx.stroke();

    if (label) {
        const midDeg = (startDeg + endDeg) / 2;
        const lx = cx + (radius + 8) * Math.cos(degreesToRadians(midDeg));
        const ly = cy + (radius + 8) * Math.sin(degreesToRadians(midDeg));
        ctx.fillStyle = config.annotationColor;
        ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
        ctx.textAlign = 'center';
        ctx.fillText(label, lx, ly);
    }
    ctx.restore();
}

// ========================================
// Draw the FV (Front View) shape
// ========================================
function drawFVShape(shape, style) {
    style = style || 'visible';
    if (shape.type === 'polygon') {
        drawClosedPolyline(shape.vertices, style);
    } else if (shape.type === 'circle') {
        drawCircleArc(shape.center.x, shape.center.y, shape.radius, 0, 2 * Math.PI, style);
    } else if (shape.type === 'semicircle') {
        // Arc above XY: from π to 0 (left to right, upper half in canvas = angles π..0)
        drawCircleArc(shape.center.x, shape.center.y, shape.radius, Math.PI, 0, style);
        // Diameter line across XY
        drawLine(shape.center.x - shape.radius, shape.center.y,
            shape.center.x + shape.radius, shape.center.y, style);
    }
}

// ========================================
// Label all FV vertices
// ========================================
function labelFVVertices(shape) {
    if (shape.type === 'polygon') {
        for (const v of shape.vertices) {
            // Offset: push label away from polygon centre
            const dx = v.x - shape.center.x;
            const dy = v.y - shape.center.y;
            const len = Math.hypot(dx, dy) || 1;
            drawLabel(v.label, v.x, v.y, (dx / len) * 10, (dy / len) * 10);
        }
    } else if (shape.type === 'circle' || shape.type === 'semicircle') {
        for (const kp of shape.keyPoints) {
            drawLabel(kp.label, kp.x, kp.y, 6, -6);
        }
    }
}

// ========================================
// Draw projector lines from FV vertices down to a target y
// ========================================
function drawProjectorsToY(shape, targetY) {
    const drawProjectorLine = (px, py) => {
        // From FV vertex upward to FV, then down through XY to targetY
        drawProjector(px, py, px, targetY);
    };

    if (shape.type === 'polygon') {
        for (const v of shape.vertices) drawProjectorLine(v.x, v.y);
    } else if (shape.type === 'circle') {
        // Project from leftmost, rightmost, top, bottom key points
        for (const kp of shape.keyPoints) drawProjectorLine(kp.x, kp.y);
    } else if (shape.type === 'semicircle') {
        for (const kp of shape.keyPoints) drawProjectorLine(kp.x, kp.y);
    }
}

// ========================================
// Draw TV Edge View (horizontal line below XY)
// ========================================
function drawTVEdgeView(shape, tvY, style) {
    style = style || 'visible';
    const { left, right } = getShapeXExtent(shape);
    drawLine(left, tvY, right, tvY, style);

    // Mark the projected points on the TV edge line
    if (shape.type === 'polygon') {
        for (const v of shape.vertices) {
            ctx.save();
            ctx.fillStyle = config.labelColor;
            ctx.beginPath();
            ctx.arc(v.x, tvY, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
    } else if (shape.type === 'circle' || shape.type === 'semicircle') {
        for (const kp of shape.keyPoints) {
            ctx.save();
            ctx.fillStyle = config.labelColor;
            ctx.beginPath();
            ctx.arc(kp.x, tvY, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
    }
}

// Label the TV edge view points (unprimed labels)
function labelTVEdgeView(shape, tvY) {
    ctx.save();
    ctx.fillStyle = config.labelColor;
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;

    if (shape.type === 'polygon') {
        // Group points by x to handle coincident projections
        const byX = {};
        for (const v of shape.vertices) {
            const key = Math.round(v.x);
            if (!byX[key]) byX[key] = [];
            byX[key].push(v.label.replace("'", '')); // strip prime → TV unprimed
        }
        for (const key of Object.keys(byX)) {
            const labels = byX[key];
            const xPos = parseInt(key);
            const combined = labels.join(',');
            ctx.fillText(combined, xPos + 4, tvY + 14);
        }
    } else if (shape.type === 'circle' || shape.type === 'semicircle') {
        for (const kp of shape.keyPoints) {
            const tvLabel = kp.label.replace("'", '');
            ctx.fillText(tvLabel, kp.x + 4, tvY + 14);
        }
    }
    ctx.restore();
}

// ========================================
// Utility: Geometry Helpers
// ========================================
function degreesToRadians(deg) { return deg * Math.PI / 180; }
function radiansToDegrees(rad) { return rad * 180 / Math.PI; }

function rotatePoint(x, y, cx, cy, angleRad) {
    const cos = Math.cos(angleRad), sin = Math.sin(angleRad);
    const dx = x - cx, dy = y - cy;
    return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
}

function rotatePoints(points, cx, cy, angleRad) {
    return points.map(p => ({ ...rotatePoint(p.x, p.y, cx, cy, angleRad), label: p.label }));
}

function translatePoints(points, dx, dy) {
    return points.map(p => ({ ...p, x: p.x + dx, y: p.y + dy }));
}

// ========================================
// Canvas Controls
// ========================================
function zoomIn() { state.zoom = Math.min(state.zoom * 1.2, 5); applyTransform(); redrawCanvas(); }
function zoomOut() { state.zoom = Math.max(state.zoom / 1.2, 0.2); applyTransform(); redrawCanvas(); }

function resetView() {
    state.zoom = 1; state.panX = 0; state.panY = 0;
    applyTransform(); redrawCanvas();
}

function togglePan() {
    canvas.style.cursor = canvas.style.cursor === 'grab' ? 'crosshair' : 'grab';
}

function startPan(e) {
    if (canvas.style.cursor === 'grab') {
        state.isPanning = true;
        state.lastX = e.clientX; state.lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
    }
}

function doPan(e) {
    if (state.isPanning) {
        state.panX += e.clientX - state.lastX;
        state.panY += e.clientY - state.lastY;
        state.lastX = e.clientX; state.lastY = e.clientY;
        applyTransform(); redrawCanvas();
    }
}

function endPan() {
    if (state.isPanning) { state.isPanning = false; canvas.style.cursor = 'grab'; }
}

// ========================================
// Initial / Reset Drawing
// ========================================
function drawInitialCanvas() {
    clearCanvas();
    ctx.save();
    ctx.font = `16px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('Virtual Lab — Projections of Planes', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '14px ' + getComputedStyle(document.body).fontFamily;
    ctx.fillText('Select a shape and case to begin', canvas.width / 2, canvas.height / 2 + 10);
    ctx.restore();
}

function redrawCanvas() {
    if (state.currentStep > 0) {
        drawStep(state.currentStep);
    } else {
        drawInitialCanvas();
    }
}

function resetAll() {
    state.shapeType = '';
    state.caseType = '';
    state.dims = { side: 60, length: 80, width: 50, diameter: 60 };
    state.theta = 30;
    state.phi = 30;
    state.alpha = 45;
    state.restingOn = 'side';
    state.alphaEdge = 30;
    state.betaEdge = 30;
    state.gammaEdge = 0;
    state.currentStep = 0;
    state.totalSteps = 0;
    state.corners = {};
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;

    document.getElementById('shapeType').value = '';
    document.getElementById('caseType').value = '';
    document.getElementById('shapeDimInputs').innerHTML = '';
    document.getElementById('caseSpecificInputs').innerHTML = '';

    applyTransform();
    updateStepIndicator();
    updateInstructions(
        'Welcome to Virtual Lab — Projections of Planes',
        'Select a plane shape and case type from the left panel to begin.'
    );
    drawInitialCanvas();
}

function handleResize() {
    setupCanvas();
    redrawCanvas();
}

// ========================================
// TV True-Shape Builder
// Used by P2, P4 Stage-1, P6 Stage-1.
// Mirrors buildFVShape() about the XY line with a small gap below.
// ========================================
const _TV_GAP = 5; // px gap between XY line and the topmost TV edge

function buildTVTrueShape() {
    const xyY = config.xyLineY;
    // Reflect a canvas y-coordinate (which was above XY) to below XY
    function reflectY(y) { return 2 * xyY - y + _TV_GAP; }

    const fv = buildFVShape(false); // unprimed labels

    if (fv.type === 'polygon') {
        return {
            type: 'polygon',
            vertices: fv.vertices.map(v => ({ ...v, y: reflectY(v.y) })),
            center: { ...fv.center, y: reflectY(fv.center.y) }
        };
    }
    if (fv.type === 'circle') {
        return {
            type: 'circle',
            center: { x: fv.center.x, y: reflectY(fv.center.y) },
            radius: fv.radius,
            keyPoints: fv.keyPoints.map(kp => ({ ...kp, y: reflectY(kp.y) }))
        };
    }
    if (fv.type === 'semicircle') {
        // TV: diameter (flat edge) at top (xyY + _TV_GAP), arc curves downward
        return {
            type: 'semicircle_tv',
            center: { x: fv.center.x, y: xyY + _TV_GAP },
            radius: fv.radius,
            keyPoints: fv.keyPoints.map(kp => ({ ...kp, y: reflectY(kp.y) }))
        };
    }
    return { ...fv };
}

// ========================================
// Draw TV shape (handles semicircle_tv orientation)
// ========================================
function drawTVShape(shape, style) {
    style = style || 'visible';
    if (shape.type === 'polygon') {
        drawClosedPolyline(shape.vertices, style);
    } else if (shape.type === 'circle') {
        drawCircleArc(shape.center.x, shape.center.y, shape.radius, 0, 2 * Math.PI, style);
    } else if (shape.type === 'semicircle') {
        // FV orientation: arc above, flat edge at bottom
        drawCircleArc(shape.center.x, shape.center.y, shape.radius, Math.PI, 0, style);
        drawLine(shape.center.x - shape.radius, shape.center.y,
            shape.center.x + shape.radius, shape.center.y, style);
    } else if (shape.type === 'semicircle_tv') {
        // TV orientation: flat edge at top, arc curves downward
        drawCircleArc(shape.center.x, shape.center.y, shape.radius, 0, Math.PI, style);
        drawLine(shape.center.x - shape.radius, shape.center.y,
            shape.center.x + shape.radius, shape.center.y, style);
    }
}

// ========================================
// Projectors from TV shape upward to a target Y
// ========================================
function drawProjectorsFromTV(shape, targetY) {
    function proj(px, py) { drawProjector(px, py, px, targetY); }
    if (shape.type === 'polygon') {
        for (const v of shape.vertices) proj(v.x, v.y);
    } else {
        for (const kp of (shape.keyPoints || [])) proj(kp.x, kp.y);
    }
}

// Label TV shape vertices (labels already unprimed from buildTVTrueShape)
function labelTVShapeVertices(shape) {
    labelFVVertices(shape); // identical logic — reads .label and .center
}

// Return the representative points array for a shape
function getShapePoints(shape) {
    if (shape.type === 'polygon') return shape.vertices;
    return shape.keyPoints || [];
}

// Build N-point polyline approximation of a circle (used for Stage-2/3 projections)
function buildCircleProjPoints(cx, cy, r, n, prime) {
    n = n || 16;
    const letters = 'abcdefghijklmnop';
    const sfx = prime ? "'" : '';
    const pts = [];
    for (let i = 0; i < n; i++) {
        const a = (2 * Math.PI * i / n) - Math.PI / 2;
        pts.push({
            x: cx + r * Math.cos(a),
            y: cy + r * Math.sin(a),
            label: letters[i % letters.length] + sfx
        });
    }
    return pts;
}

// ========================================
// Rotation Helpers
// ========================================

// Rotate (x,y) about (ox,oy) in the "UP" direction — for P1 FV resting on corner.
// Side goes UP-RIGHT at angle alpha: direction (cos a, -sin a) in canvas.
// (Standard CW in math coords = visual CCW in canvas with Y-down)
function _rotUp(x, y, ox, oy, alpha) {
    const dx = x - ox, dy = y - oy;
    const c = Math.cos(alpha), s = Math.sin(alpha);
    return { x: ox + dx * c + dy * s, y: oy - dx * s + dy * c };
}

// Rotate (x,y) about (ox,oy) in the "DOWN" direction — for P2 TV rotation.
// Side goes DOWN-RIGHT at angle beta: direction (cos b, +sin b) in canvas.
// (Standard CCW in math coords)
function _rotDown(x, y, ox, oy, beta) {
    const dx = x - ox, dy = y - oy;
    const c = Math.cos(beta), s = Math.sin(beta);
    return { x: ox + dx * c - dy * s, y: oy + dx * s + dy * c };
}

// Apply _rotUp to a full shape's first vertex as pivot, then translate pivot to (tx, ty).
function _rotateShapeToTarget(shape, rotFn, angleDeg, tx, ty) {
    const alpha = degreesToRadians(angleDeg);
    const pts = shape.type === 'polygon' ? shape.vertices : shape.keyPoints;
    if (!pts || !pts.length) return shape;
    const ox = pts[0].x, oy = pts[0].y;
    const tdx = tx - ox, tdy = ty - oy;
    const mapPt = p => {
        const r = rotFn(p.x, p.y, ox, oy, alpha);
        return { ...p, x: r.x + tdx, y: r.y + tdy };
    };
    const rotCen = rotFn(shape.center ? shape.center.x : ox, shape.center ? shape.center.y : oy, ox, oy, alpha);
    const center = { x: rotCen.x + tdx, y: rotCen.y + tdy };
    if (shape.type === 'polygon') {
        return { ...shape, vertices: shape.vertices.map(mapPt), center };
    } else {
        return { ...shape, center, keyPoints: shape.keyPoints.map(mapPt) };
    }
}

// Build FV shape with plane resting on CORNER 'a': vertex a on XY, side ab at alphaEdge to XY.
// Only for polygon shapes; circles fall back to resting-on-side.
function buildFVShapeOnCorner(alphaEdge, centerX) {
    const cx = (centerX !== undefined) ? centerX : canvas.width / 2;
    const xyY = config.xyLineY;
    // Circle/semicircle: resting on corner not applicable — use side
    if (state.shapeType === 'circle' || state.shapeType === 'semicircle') {
        return buildFVShape(true, cx);
    }
    const std = buildFVShape(true, cx);
    return _rotateShapeToTarget(std, _rotUp, alphaEdge, cx, xyY);
}

// Build TV shape with gap below XY and optional rotation betaEdge (side AB at beta to VP/XY).
function buildTVShapeRotated(betaEdge, gap, centerX) {
    const cx = (centerX !== undefined) ? centerX : canvas.width / 2;
    const xyY = config.xyLineY;
    const std = buildTVShape(false, cx);
    return _rotateShapeToTarget(std, _rotDown, betaEdge, cx, xyY + gap);
}

// ========================================
// Boot
// ========================================
window.addEventListener('DOMContentLoaded', init);
console.log('Virtual Lab — Projections of Planes: core loaded');
