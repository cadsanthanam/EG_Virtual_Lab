// ========================================
// Virtual Lab - Projections of Solids
// Core Infrastructure (core.js)
// ========================================

// ========================================
// Global Variables
// ========================================
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

// Application State
const state = {
    solidType: '',
    caseType: '',
    baseEdge: 40,
    axisLength: 80,
    edgeAngle: 30, // Default edge angle for Case A
    axisAngleHP: 0,
    axisAngleVP: 0,
    restingOn: '',        // Case C/D resting condition
    restingOnB: '',       // Case B resting condition
    caseBAlpha: 0,        // Case B alpha angle (user-specified or auto-computed)
    lateralFaceAngle: 0,
    baseEdgeAngle: 0,
    currentStep: 0,
    totalSteps: 0,
    corners: {},
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    lastX: 0,
    lastY: 0
};

// Drawing Configuration
const config = {
    xyLineLength: 200,
    xyLineY: 0, // Will be set to canvas center
    xyLineStartX: 0, // Will be calculated
    scale: 1,
    visibleLineWidth: 1.5,
    hiddenLineWidth: 1,
    constructionLineWidth: 0.5,
    visibleColor: '#0f172a',
    hiddenColor: '#64748b',
    constructionColor: '#cbd5e1',
    xyLineColor: '#1e293b',
    labelFontSize: 12,
    labelColor: '#0f172a'
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

    // Calculate center positions for XY line
    config.xyLineY = canvas.height / 2;
    config.xyLineStartX = (canvas.width - config.xyLineLength) / 2;

    // Apply zoom and pan
    applyTransform();
}

function applyTransform() {
    ctx.setTransform(state.zoom, 0, 0, state.zoom, state.panX, state.panY);
}

// ========================================
// Event Listeners
// ========================================
function attachEventListeners() {
    // Solid and Case Selection
    document.getElementById('solidType').addEventListener('change', handleSolidChange);
    document.getElementById('caseType').addEventListener('change', handleCaseChange);

    // Input Fields
    document.getElementById('baseEdge').addEventListener('input', handleInputChange);
    document.getElementById('axisLength').addEventListener('input', handleInputChange);

    // Buttons
    document.getElementById('generateBtn').addEventListener('click', generateProjection);
    document.getElementById('resetBtn').addEventListener('click', resetAll);

    // Canvas Controls
    document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
    document.getElementById('resetViewBtn').addEventListener('click', resetView);
    document.getElementById('panBtn').addEventListener('click', togglePan);

    // Step Controls
    document.getElementById('prevStepBtn').addEventListener('click', previousStep);
    document.getElementById('nextStepBtn').addEventListener('click', nextStep);

    // Canvas Events for Panning
    canvas.addEventListener('mousedown', startPan);
    canvas.addEventListener('mousemove', doPan);
    canvas.addEventListener('mouseup', endPan);
    canvas.addEventListener('mouseleave', endPan);

    // Window Resize
    window.addEventListener('resize', handleResize);
}

// ========================================
// Event Handlers
// ========================================
function handleSolidChange(e) {
    state.solidType = e.target.value;
    console.log('Solid selected:', state.solidType);
    updateDynamicInputs();
}

function handleCaseChange(e) {
    state.caseType = e.target.value;
    console.log('Case selected:', state.caseType);
    updateDynamicInputs();
}

function handleInputChange(e) {
    const field = e.target.id;
    state[field] = parseFloat(e.target.value) || 0;
}

function updateDynamicInputs() {
    const container = document.getElementById('caseSpecificInputs');
    container.innerHTML = '';

    if (!state.solidType || !state.caseType) return;

    const isPrism = state.solidType.includes('prism');
    const isPyramid = state.solidType.includes('pyramid');

    // Case-specific inputs
    switch (state.caseType) {
        case 'A':
            // Axis perpendicular to HP
            addInput(container, 'edgeAngle', 'Edge Angle with VP (°):', 'number', 0, 90, 30);
            break;

        case 'B':
            // Axis perpendicular to VP — true shape in FV
            // Resting condition determines the alpha angle (orientation of polygon in FV)
            addRestingInputCaseB(container, isPrism, isPyramid);
            break;

        case 'C':
            // Axis inclined to HP — resting on base edge or base corner (for BOTH prisms and pyramids)
            addInput(container, 'axisAngleHP', 'Axis Inclination with HP (°):', 'number', 0, 90, 45);
            addRestingInputCaseC(container);
            break;

        case 'D':
            // Axis inclined to VP — Phase I follows Case B, Phase II tilts the TV
            // Inputs: same resting condition as Case B + the VP inclination angle (phi)
            addRestingInputCaseB(container, isPrism, isPyramid);
            addInput(container, 'axisAngleVP', 'Axis Inclination with VP φ (°):', 'number', 1, 89, 45);
            break;
    }
}

function addInput(container, id, label, type, min, max, defaultValue) {
    const div = document.createElement('div');
    div.className = 'input-group';
    div.innerHTML = `
        <label for="${id}">${label}</label>
        <input type="${type}" id="${id}" class="input-field" 
               min="${min}" max="${max}" value="${defaultValue}" placeholder="${defaultValue}">
    `;
    container.appendChild(div);

    // Attach event listener
    setTimeout(() => {
        document.getElementById(id).addEventListener('input', (e) => {
            state[id] = parseFloat(e.target.value) || 0;
        });
    }, 0);
}

// Case C/D resting input: base-edge or base-corner (same for prisms and pyramids)
function addRestingInputCaseC(container) {
    const div = document.createElement('div');
    div.className = 'input-group';
    div.innerHTML = `
        <label for="restingOn">Resting On:</label>
        <select id="restingOn" class="input-field">
            <option value="base-edge">Base Edge</option>
            <option value="base-corner">Base Corner</option>
        </select>
    `;
    container.appendChild(div);

    setTimeout(() => {
        document.getElementById('restingOn').addEventListener('change', (e) => {
            state.restingOn = e.target.value;
        });
    }, 0);
}

// ========================================
// Case B resting input — prism or pyramid, with conditional alpha angle input
// ========================================
function addRestingInputCaseB(container, isPrism, isPyramid) {
    const div = document.createElement('div');
    div.className = 'input-group';

    let options = '';
    if (isPrism) {
        options = `
            <option value="rectangular-face">Resting on Rectangular Face (α=0°)</option>
            <option value="longer-edge-equal">Longer Edge – Faces Equally Inclined to HP</option>
            <option value="longer-edge-angle">Longer Edge – Face at Specific Angle to HP</option>
        `;
    } else if (isPyramid) {
        options = `
            <option value="base-edge">Resting on Base Edge (α=0°)</option>
            <option value="base-corner-equal">Base Corner – Edges Equally Inclined to HP</option>
            <option value="base-corner-angle">Base Corner – Edge at Specific Angle to HP</option>
        `;
    } else {
        return; // Cone/Cylinder — no resting dropdown needed
    }

    div.innerHTML = `
        <label for="restingOnB">Resting On:</label>
        <select id="restingOnB" class="input-field">${options}</select>
    `;
    container.appendChild(div);

    const alphaContainer = document.createElement('div');
    alphaContainer.id = 'caseBAlphaContainer';
    container.appendChild(alphaContainer);

    function updateAlphaInput(restingValue) {
        alphaContainer.innerHTML = '';
        if (restingValue === 'longer-edge-angle' || restingValue === 'base-corner-angle') {
            const alphaDiv = document.createElement('div');
            alphaDiv.className = 'input-group';
            alphaDiv.innerHTML = `
                <label for="caseBAlpha">Face/Edge Angle with HP (α°):</label>
                <input type="number" id="caseBAlpha" class="input-field"
                       min="0" max="90" value="30" placeholder="30">
            `;
            alphaContainer.appendChild(alphaDiv);
            setTimeout(() => {
                const el = document.getElementById('caseBAlpha');
                if (el) {
                    state.caseBAlpha = parseFloat(el.value) || 30;
                    el.addEventListener('input', (e) => {
                        state.caseBAlpha = parseFloat(e.target.value) || 0;
                    });
                }
            }, 0);
        } else {
            state.caseBAlpha = 0;
        }
        state.restingOnB = restingValue;
    }

    setTimeout(() => {
        const sel = document.getElementById('restingOnB');
        if (sel) {
            state.restingOnB = sel.value;
            updateAlphaInput(sel.value);
            sel.addEventListener('change', (e) => updateAlphaInput(e.target.value));
        }
    }, 0);
}

// ========================================
// Canvas Controls
// ========================================
function zoomIn() {
    state.zoom = Math.min(state.zoom * 1.2, 5);
    applyTransform();
    redrawCanvas();
}

function zoomOut() {
    state.zoom = Math.max(state.zoom / 1.2, 0.2);
    applyTransform();
    redrawCanvas();
}

function resetView() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    applyTransform();
    redrawCanvas();
}

function togglePan() {
    canvas.style.cursor = canvas.style.cursor === 'grab' ? 'crosshair' : 'grab';
}

function startPan(e) {
    if (canvas.style.cursor === 'grab') {
        state.isPanning = true;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
    }
}

function doPan(e) {
    if (state.isPanning) {
        const dx = e.clientX - state.lastX;
        const dy = e.clientY - state.lastY;
        state.panX += dx;
        state.panY += dy;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        applyTransform();
        redrawCanvas();
    }
}

function endPan() {
    if (state.isPanning) {
        state.isPanning = false;
        canvas.style.cursor = 'grab';
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
    if (state.currentStep > 0) {
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
// Main Generation Function
// ========================================
function generateProjection() {
    if (!state.solidType || !state.caseType) {
        alert('Please select both a solid type and a case.');
        return;
    }

    // Sync all dynamic input values into state
    syncDynamicInputs();

    console.log('Generating projection with state:', state);

    // Compute dynamic XY line length
    // Case C/D need more space for initial + final views side by side
    if (state.caseType === 'C' || state.caseType === 'D') {
        config.xyLineLength = Math.max(8 * state.axisLength, 500);
    } else {
        config.xyLineLength = Math.max(5 * state.axisLength, 300);
    }
    config.xyLineStartX = (canvas.width - config.xyLineLength) / 2;

    // Initialize step sequence based on case
    initializeSteps();

    // Start from step 1
    state.currentStep = 1;
    updateStepIndicator();

    // Draw the first step
    drawStep(1);
}

function syncDynamicInputs() {
    // Read all dynamically created numeric input values into state
    const dynamicFields = ['edgeAngle', 'axisAngleHP', 'axisAngleVP', 'lateralFaceAngle', 'baseEdgeAngle'];
    for (const field of dynamicFields) {
        const el = document.getElementById(field);
        if (el) {
            state[field] = parseFloat(el.value) || 0;
        }
    }
    // Base inputs
    const baseEdgeEl = document.getElementById('baseEdge');
    const axisLengthEl = document.getElementById('axisLength');
    if (baseEdgeEl) state.baseEdge = parseFloat(baseEdgeEl.value) || 40;
    if (axisLengthEl) state.axisLength = parseFloat(axisLengthEl.value) || 80;
    // Case C/D resting select
    const restingEl = document.getElementById('restingOn');
    if (restingEl) state.restingOn = restingEl.value;
    // Case B resting select + optional alpha
    const restingBEl = document.getElementById('restingOnB');
    if (restingBEl) state.restingOnB = restingBEl.value;
    const caseBAlphaEl = document.getElementById('caseBAlpha');
    if (caseBAlphaEl) state.caseBAlpha = parseFloat(caseBAlphaEl.value) || 0;
}

function initializeSteps() {
    // Determine total steps based on case
    switch (state.caseType) {
        case 'A':
            state.totalSteps = 5; // XY line, Base orientation, Top view, Project to FV, Final
            break;
        case 'B':
            state.totalSteps = 5; // XY line, FV true shape, Project to TV, Complete
            break;
        case 'C':
        case 'D':
            state.totalSteps = 8; // Phase I (5 steps) + Phase II (3 steps)
            break;
        default:
            state.totalSteps = 0;
    }
}

function drawStep(stepNumber) {
    clearCanvas();

    // Draw based on case and step
    switch (state.caseType) {
        case 'A':
            drawCaseAStep(stepNumber);
            break;
        case 'B':
            drawCaseBStep(stepNumber);
            break;
        case 'C':
            drawCaseCStep(stepNumber);
            break;
        case 'D':
            drawCaseDStep(stepNumber);
            break;
    }
}

// ========================================
// Basic Drawing Utilities
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

    const startX = config.xyLineStartX;
    const endX = startX + config.xyLineLength;
    const y = config.xyLineY;

    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();

    // Draw labels
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;
    ctx.fillText('X', startX - 15, y + 5);
    ctx.fillText('Y', endX + 10, y + 5);

    // Draw arrow indicators (optional)
    drawArrow(ctx, startX, y, startX - 10, y);
    drawArrow(ctx, endX, y, endX + 10, y);

    ctx.restore();
}

function drawArrow(ctx, fromX, fromY, toX, toY) {
    const headlen = 5;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6),
        toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6),
        toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function drawLine(x1, y1, x2, y2, isHidden = false, isConstruction = false) {
    ctx.save();

    if (isConstruction) {
        ctx.strokeStyle = config.constructionColor;
        ctx.lineWidth = config.constructionLineWidth;
        ctx.setLineDash([2, 2]);
    } else if (isHidden) {
        ctx.strokeStyle = config.hiddenColor;
        ctx.lineWidth = config.hiddenLineWidth;
        ctx.setLineDash([5, 5]);
    } else {
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

function drawPoint(x, y, label = '') {
    ctx.save();
    ctx.fillStyle = config.labelColor;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();

    if (label) {
        ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
        ctx.fillText(label, x + 5, y - 5);
    }

    ctx.restore();
}

function drawPolygon(centerX, centerY, radius, sides, rotation = 0) {
    const angleStep = (2 * Math.PI) / sides;
    const points = [];

    for (let i = 0; i < sides; i++) {
        const angle = rotation + i * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push({ x, y });
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    return points;
}

function drawAngleArc(centerX, centerY, radius, startAngle, endAngle) {
    ctx.save();
    ctx.strokeStyle = config.visibleColor;
    ctx.lineWidth = config.constructionLineWidth;
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, degreesToRadians(startAngle), degreesToRadians(endAngle));
    ctx.stroke();

    ctx.restore();
}

function drawAngleIndicator() {
    // This is called in step 2 to show the edge angle concept
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    const noteX = config.xyLineStartX + config.xyLineLength + 20;
    const noteY = config.xyLineY + 30;

    ctx.fillText(`Edge angle β = ${state.edgeAngle}°`, noteX, noteY);
    ctx.fillText('(Angle between base edge and VP)', noteX, noteY + 15);

    ctx.restore();
}

// ========================================
// Utility Functions
// ========================================
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
}

function rotatePoint(x, y, centerX, centerY, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = x - centerX;
    const dy = y - centerY;

    return {
        x: centerX + dx * cos - dy * sin,
        y: centerY + dx * sin + dy * cos
    };
}

function getSidesCount(solidType) {
    if (solidType.includes('triangular')) return 3;
    if (solidType.includes('square')) return 4;
    if (solidType.includes('pentagonal')) return 5;
    if (solidType.includes('hexagonal')) return 6;
    return 0;
}

// ========================================
// Initial Drawing and Reset
// ========================================
function drawInitialCanvas() {
    clearCanvas();

    ctx.save();
    ctx.font = '16px ' + getComputedStyle(document.body).fontFamily;
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('Virtual Lab - Projections of Solids', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '14px ' + getComputedStyle(document.body).fontFamily;
    ctx.fillText('Select a solid and case to begin', canvas.width / 2, canvas.height / 2 + 10);
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
    // Reset state
    state.solidType = '';
    state.caseType = '';
    state.baseEdge = 40;
    state.axisLength = 80;
    state.edgeAngle = 30;
    state.axisAngleHP = 0;
    state.axisAngleVP = 0;
    state.restingOn = '';
    state.restingOnB = '';
    state.caseBAlpha = 0;
    state.lateralFaceAngle = 0;
    state.baseEdgeAngle = 0;
    state.currentStep = 0;
    state.totalSteps = 0;
    state.corners = {};
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;

    // Reset UI
    document.getElementById('solidType').value = '';
    document.getElementById('caseType').value = '';
    document.getElementById('baseEdge').value = 40;
    document.getElementById('axisLength').value = 80;
    document.getElementById('caseSpecificInputs').innerHTML = '';

    updateStepIndicator();
    updateInstructions('Welcome to Virtual Lab',
        'Select a solid and case type from the left panel to begin.');

    applyTransform();
    drawInitialCanvas();
}

function handleResize() {
    setupCanvas();
    redrawCanvas();
}

// ========================================
// Initialize Application
// ========================================
window.addEventListener('DOMContentLoaded', init);

console.log('Virtual Lab - Projections of Solids initialized');