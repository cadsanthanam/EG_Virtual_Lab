// ========================================
// Sections of Solids Module  (sectioning.js)
// Loaded AFTER core.js and all caseX.js files.
// ========================================
// Coordinate convention (matches core.js):
//   X   = canvas pixel x (left→right)
//   Y3D = real height above HP  = config.xyLineY - canvas_y_fv
//   Z3D = real depth from VP    = canvas_y_tv - config.xyLineY
//
// Cutting plane (⊥ VP, inclined at θ to HP):
//   normal  n = (sin θ, −cos θ, 0)   (contains Z direction)
//   equation  sin(θ)·X − cos(θ)·Y = d
//   anchor on axis at height h:  d = sin(θ)·axisX − cos(θ)·h
//   → Y_cut on vertical edge i  = h + tan(θ)·(xi − axisX)
//
// Cutting plane (⊥ HP, inclined at φ to VP) for Case B:
//   normal  n = (−sin φ, 0, cos φ)  (contains Y direction)
//   equation  −sin(φ)·X + cos(φ)·Z = d
//   anchor on axis at Z = cutZ:  d = −sin(φ)·axisX + cos(φ)·cutZ
//   → Z_cut on Z-parallel edge i  = cutZ + tan(φ)·(xi − axisX)
// ========================================

// ─────────────────────────────────────────
// Sectioning State
// ─────────────────────────────────────────
const sectionState = {
    enabled: false,
    planeType: 'inclined-hp',   // 'inclined-hp' | 'parallel-hp' | 'inclined-vp' | 'parallel-vp'
    cutRatio: 0.5,               // fraction 0‥1 along axis from base
    cutAngle: 45,                // θ (for inclined planes) in degrees

    // Computed each time Generate is pressed (or step changes)
    cutPoints: [],   // [{X, Y, Z, fvX, fvY, tvX, tvY, edgeLabel}]
    vtStart: null,   // {x,y} canvas – one endpoint of cutting line in FV/TV
    vtEnd:   null,   // {x,y} canvas
    tsOrigin: null,  // {x,y} canvas – origin of true-shape auxiliary view
    tsPoints: [],    // [{x,y}] canvas – true shape polygon
};

const SEC_STEPS = 5;   // steps appended after base projection steps

// ─────────────────────────────────────────
// UI helpers – injected once, re-used
// ─────────────────────────────────────────
function setupSectioningUI() {
    // Guard: only inject once
    if (document.getElementById('sectioningPanel')) return;

    const inputSection = document.querySelector('.input-section');

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="section-toggle-row">
        <label class="sec-toggle-label" for="enableSectioning">
          <input type="checkbox" id="enableSectioning">
          <span class="sec-toggle-text">✂ Enable Sectioning</span>
        </label>
      </div>

      <div id="sectioningPanel" class="sectioning-panel" style="display:none;">
        <div class="sec-panel-title">Section Plane Parameters</div>

        <div class="input-group">
          <label for="sectionPlaneType">Plane Type:</label>
          <select id="sectionPlaneType" class="input-field">
            <option value="inclined-hp">⊥ VP, Inclined to HP</option>
            <option value="parallel-hp">∥ HP (Horizontal cut)</option>
            <option value="inclined-vp">⊥ HP, Inclined to VP</option>
            <option value="parallel-vp">∥ VP (Vertical cut)</option>
          </select>
        </div>

        <div class="input-group">
          <label for="cutRatioSlider">Cut Position (<span id="cutRatioLabel">50</span>% from base):</label>
          <input type="range" id="cutRatioSlider" class="input-field" min="10" max="90" value="50" step="5">
        </div>

        <div class="input-group" id="cutAngleRow">
          <label for="cutAngle">Plane Angle with HP (°):</label>
          <input type="number" id="cutAngle" class="input-field" min="15" max="75" value="45">
        </div>

        <div class="sec-info-box">
          <strong>Note:</strong> Generate the full projection first,
          then enable sectioning – it adds 5 extra steps.
        </div>
      </div>
    `;
    inputSection.appendChild(wrapper);

    // Events
    document.getElementById('enableSectioning').addEventListener('change', e => {
        sectionState.enabled = e.target.checked;
        document.getElementById('sectioningPanel').style.display =
            sectionState.enabled ? 'block' : 'none';
        if (state.totalSteps > 0) {
            // Recompute total steps and restart
            initializeSteps();
            state.currentStep = 1;
            updateStepIndicator();
            drawStep(1);
        }
    });

    document.getElementById('sectionPlaneType').addEventListener('change', e => {
        sectionState.planeType = e.target.value;
        const angleRow = document.getElementById('cutAngleRow');
        angleRow.style.display =
            (e.target.value === 'inclined-hp' || e.target.value === 'inclined-vp') ? 'block' : 'none';
    });

    document.getElementById('cutRatioSlider').addEventListener('input', e => {
        sectionState.cutRatio = parseInt(e.target.value) / 100;
        document.getElementById('cutRatioLabel').textContent = e.target.value;
    });

    document.getElementById('cutAngle').addEventListener('input', e => {
        sectionState.cutAngle = parseFloat(e.target.value) || 45;
    });
}

function syncSectionStateFromUI() {
    const en = document.getElementById('enableSectioning');
    if (en) sectionState.enabled = en.checked;
    const pt = document.getElementById('sectionPlaneType');
    if (pt) sectionState.planeType = pt.value;
    const cr = document.getElementById('cutRatioSlider');
    if (cr) sectionState.cutRatio = parseInt(cr.value) / 100;
    const ca = document.getElementById('cutAngle');
    if (ca) sectionState.cutAngle = parseFloat(ca.value) || 45;
}

// ─────────────────────────────────────────
// Step Integration (called by core.js)
// ─────────────────────────────────────────
function getSectionBaseSteps() {
    switch (state.caseType) {
        case 'A': case 'B': return 5;
        case 'C': case 'D': return 8;
        default: return 5;
    }
}

// Main dispatcher – called by drawStep() in core.js when step > baseSteps
function drawSectioningStep(secStep) {
    // secStep: 1‥5 (relative step number within the sectioning sequence)
    // Each step REDRAWS the completed projection then adds its overlay cumulatively.

    const caseOK = ['A', 'B'].includes(state.caseType);
    if (!caseOK) {
        updateInstructions('Sectioning – Not Yet Implemented',
            `Case ${state.caseType} sectioning is coming soon. ` +
            'Sectioning is currently fully supported for Cases A and B.');
        _redrawFinalProjection();
        return;
    }

    // Validate that state.corners has the data we need
    if (!_hasValidCorners()) {
        updateInstructions('Sectioning – Error',
            'Please use "Previous" to go back to the projection steps, then "Next" again.');
        _redrawFinalProjection();
        return;
    }

    // Compute geometry on first sectioning step
    if (secStep === 1) {
        _computeSectionGeometry();
    } else if (sectionState.cutPoints.length === 0) {
        // Re-compute if navigating forward directly
        _computeSectionGeometry();
    }

    // Draw cumulative layers
    _redrawFinalProjection();
    if (secStep >= 1) _drawStep_VT();
    if (secStep >= 2) _drawStep_CutPointsFV();
    if (secStep >= 3) _drawStep_ProjectToTV();
    if (secStep >= 4) _drawStep_HatchSection();
    if (secStep >= 5) _drawStep_TrueShape();

    // Update instruction panel
    const titles = [
        'Section Step 1 – Draw Cutting Plane Line (VT)',
        'Section Step 2 – Mark Cut Points on Edges in FV',
        'Section Step 3 – Project Cut Points to Top View',
        'Section Step 4 – Hatch Section in Top View',
        'Section Step 5 – Construct True Shape (Auxiliary View)',
    ];
    const texts = [
        'Draw the cutting plane line (VT – vertical trace) in the Front View as a chain-dot line. ' +
        'Arrows at its ends show the direction of viewing the cut face. ' +
        'Label the two ends A–A. The line makes angle θ = ' + sectionState.cutAngle + '° with XY. ' +
        'It appears as a straight line here because the plane is ⊥ to VP.',

        'Label each point where the cutting plane line crosses an edge in the FV as P1, P2, … Pn. ' +
        'These are the piercing points on the lateral edges (or generators for cylinder/cone). ' +
        'Note that the height of each point tells you how far up the edge the section cuts.',

        'Draw vertical projectors from each FV cut point P1, P2, … down to the Top View. ' +
        'Each projector lands on the corresponding base-polygon outline in TV. ' +
        'Connect these TV points in the same cyclic order as the FV points to reveal the ' +
        'shape of the section as seen from above.',

        'Hatch the section polygon in the Top View with thin 45° lines uniformly spaced. ' +
        'This hatching represents the cut surface (the material exposed by the saw). ' +
        'Hidden lines are omitted in the section view. ' +
        'The TV polygon with hatching = sectional top view.',

        'Draw the x₁y₁ reference line PARALLEL to the cutting plane line VT. ' +
        'Project each cut point PERPENDICULAR to x₁y₁. ' +
        'Transfer the depth (Z) of each point from the Top View as the distance away from x₁y₁. ' +
        'Join the resulting points to form the TRUE SHAPE of the section — this is the actual ' +
        'shape of the cut face, undistorted by the inclination of the plane.',
    ];
    updateInstructions(titles[secStep - 1], texts[secStep - 1]);
}

// ─────────────────────────────────────────
// Validity check
// ─────────────────────────────────────────
function _hasValidCorners() {
    if (state.caseType === 'A') {
        return !!(state.corners.topView && state.corners.topView.length > 0 &&
            (state.corners.frontViewBase || state.corners.frontViewTop));
    }
    if (state.caseType === 'B') {
        return !!(state.corners.fvPoints && state.corners.fvPoints.length > 0);
    }
    return false;
}

// ─────────────────────────────────────────
// Redraw the completed projection (without section overlay)
// ─────────────────────────────────────────
function _redrawFinalProjection() {
    clearCanvas();
    const baseSteps = getSectionBaseSteps();
    switch (state.caseType) {
        case 'A': drawCaseAStep(baseSteps); break;
        case 'B': drawCaseBStep(baseSteps); break;
        case 'C': drawCaseCStep(baseSteps); break;
        case 'D': drawCaseDStep(baseSteps); break;
    }
}

// ─────────────────────────────────────────
// GEOMETRY ENGINE
// ─────────────────────────────────────────
function _computeSectionGeometry() {
    sectionState.cutPoints = [];
    sectionState.vtStart = null;
    sectionState.vtEnd = null;
    sectionState.tsPoints = [];

    if (state.caseType === 'A') {
        _computeGeometry_CaseA();
    } else if (state.caseType === 'B') {
        _computeGeometry_CaseB();
    }
}

// ── Case A geometry ─────────────────────
function _computeGeometry_CaseA() {
    const tv = state.corners.topView;
    const n = tv.length;
    const xyY = config.xyLineY;
    const axLen = state.axisLength;

    // Build 3D vertices (canvas units)
    const baseVerts = tv.map(p => ({ X: p.x, Y: 0, Z: p.y - xyY }));
    const isPyramid = state.solidType.includes('pyramid');
    const apexTV = state.corners.apex;
    const apexV = isPyramid
        ? { X: apexTV.x, Y: axLen, Z: apexTV.y - xyY }
        : null;
    const topVerts = isPyramid ? null : tv.map(p => ({ X: p.x, Y: axLen, Z: p.y - xyY }));

    // Axis X (centroid X)
    const axisX = tv.reduce((s, p) => s + p.x, 0) / n;

    const cutRatio = sectionState.cutRatio;
    const h = cutRatio * axLen;       // 3D cut height (canvas Y units)
    const θ = sectionState.planeType === 'parallel-hp'
        ? 0
        : (sectionState.cutAngle * Math.PI / 180);
    const d = Math.sin(θ) * axisX - Math.cos(θ) * h;  // plane constant

    const pts = [];

    if (isPyramid) {
        // Slant edges base[i] → apex
        for (let i = 0; i < n; i++) {
            const A = baseVerts[i];
            const B = apexV;
            const pt = _edgePlaneIntersect(A, B, θ, d);
            if (pt) pts.push({ ...pt, edgeLabel: `P${i + 1}` });
        }
        // If no slant edges cut, try base edges (for very low cuts)
        if (pts.length < 3) {
            pts.length = 0;
            for (let i = 0; i < n; i++) {
                const A = baseVerts[i];
                const B = baseVerts[(i + 1) % n];
                const pt = _edgePlaneIntersect(A, B, θ, d);
                if (pt) pts.push({ ...pt, edgeLabel: `P${pts.length + 1}` });
            }
        }
    } else {
        // Prism – cut vertical edges base[i] → top[i]
        for (let i = 0; i < n; i++) {
            const A = baseVerts[i];
            const B = topVerts[i];
            const pt = _edgePlaneIntersect(A, B, θ, d);
            if (pt) pts.push({ ...pt, edgeLabel: `P${i + 1}` });
        }
    }

    // Compute canvas coordinates for each cut point
    sectionState.cutPoints = pts.map(p => ({
        ...p,
        fvX: p.X,
        fvY: xyY - p.Y,
        tvX: p.X,
        tvY: xyY + p.Z,
    }));

    // Cutting line (VT) endpoints in FV – extend beyond solid bounds
    const allFvX = sectionState.cutPoints.map(p => p.fvX);
    const margin = state.baseEdge * 0.6;
    const x1 = Math.min(...allFvX) - margin;
    const x2 = Math.max(...allFvX) + margin;
    const y1 = (xyY - h) + Math.tan(θ) * (axisX - x1);
    const y2 = (xyY - h) + Math.tan(θ) * (axisX - x2);
    sectionState.vtStart = { x: x1, y: y1 };
    sectionState.vtEnd = { x: x2, y: y2 };

    // Place true-shape view to the right
    const rightX = Math.max(...sectionState.cutPoints.map(p => p.fvX)) + 90;
    sectionState.tsOrigin = { x: rightX, y: xyY - h };
    _computeTrueShape(θ);
}

// ── Case B geometry ─────────────────────
function _computeGeometry_CaseB() {
    const fvPts = state.corners.fvPoints;
    const n = fvPts.length;
    const xyY = config.xyLineY;
    const axLen = state.axisLength;
    const nearZoffset = 30;  // near face is 30px from VP in TV

    // Build 3D vertices: axis runs along Z
    // Near face: Z = nearZoffset, Far face: Z = nearZoffset + axLen
    // FV vertex i: X = fvPts[i].x, Y = xyY - fvPts[i].y  (both canvas units)
    const nearVerts = fvPts.map(p => ({ X: p.x, Y: xyY - p.y, Z: nearZoffset }));
    const isPyramid = state.solidType.includes('pyramid');
    const apexZ = nearZoffset + axLen;
    const axisX = state.corners.fvCenterX;
    const axisY = xyY - (fvPts.reduce((s, p) => s + p.y, 0) / n); // centroid Y

    const farVerts = isPyramid
        ? [{ X: axisX, Y: axisY, Z: apexZ }]   // apex
        : fvPts.map(p => ({ X: p.x, Y: xyY - p.y, Z: nearZoffset + axLen }));

    const cutRatio = sectionState.cutRatio;
    const cutZ = nearZoffset + cutRatio * axLen;
    const φ = (sectionState.planeType === 'parallel-vp')
        ? 0
        : (sectionState.cutAngle * Math.PI / 180);

    // plane: −sin(φ)·X + cos(φ)·Z = d
    const d = -Math.sin(φ) * axisX + Math.cos(φ) * cutZ;

    const pts = [];

    if (isPyramid) {
        // Slant edges near[i] → apex
        for (let i = 0; i < n; i++) {
            const A = nearVerts[i];
            const B = farVerts[0];
            const pt = _edgePlaneIntersect_CaseB(A, B, φ, d);
            if (pt) pts.push({ ...pt, edgeLabel: `P${i + 1}` });
        }
    } else {
        // Z-parallel edges near[i] → far[i]
        for (let i = 0; i < n; i++) {
            const A = nearVerts[i];
            const B = farVerts[i];
            const pt = _edgePlaneIntersect_CaseB(A, B, φ, d);
            if (pt) pts.push({ ...pt, edgeLabel: `P${i + 1}` });
        }
    }

    // Canvas coordinates: FV=(X, xyY-Y), TV=(X, xyY+Z)
    sectionState.cutPoints = pts.map(p => ({
        ...p,
        fvX: p.X,
        fvY: xyY - p.Y,
        tvX: p.X,
        tvY: xyY + p.Z,
    }));

    // Cutting line in TV (not FV) for Case B
    const allTvY = sectionState.cutPoints.map(p => p.tvY);
    const allTvX = sectionState.cutPoints.map(p => p.tvX);
    const margin = state.baseEdge * 0.6;
    const y1 = Math.min(...allTvY) - margin;
    const y2 = Math.max(...allTvY) + margin;
    // TV canvas: x increases rightward, y = Z canvas. Cutting line in TV:
    // Z_cut(x) = cutZ + tan(φ)*(x - axisX)  → canvas: tvY = xyY + Z_cut
    const tvY_at_y1 = xyY + cutZ + Math.tan(φ) * ((Math.min(...allTvX) - margin) - axisX);
    const tvY_at_y2 = xyY + cutZ + Math.tan(φ) * ((Math.max(...allTvX) + margin) - axisX);
    const xLeft = Math.min(...allTvX) - margin;
    const xRight = Math.max(...allTvX) + margin;
    sectionState.vtStart = { x: xLeft, y: xyY + cutZ + Math.tan(φ) * (xLeft - axisX) };
    sectionState.vtEnd = { x: xRight, y: xyY + cutZ + Math.tan(φ) * (xRight - axisX) };

    // True shape placed to the right, below FV
    const rightX = Math.max(...sectionState.cutPoints.map(p => p.fvX)) + 100;
    sectionState.tsOrigin = { x: rightX, y: xyY };
    _computeTrueShape_CaseB(φ);
}

// ── Edge–plane intersection (Case A: ⊥ VP plane) ────────────────────────
// Plane: sin(θ)·X − cos(θ)·Y = d   (Z does not appear)
function _edgePlaneIntersect(A, B, θ, d) {
    const sA = Math.sin(θ) * A.X - Math.cos(θ) * A.Y - d;
    const sB = Math.sin(θ) * B.X - Math.cos(θ) * B.Y - d;
    if (sA * sB >= 0) return null;
    const t = sA / (sA - sB);
    return {
        X: A.X + t * (B.X - A.X),
        Y: A.Y + t * (B.Y - A.Y),
        Z: A.Z + t * (B.Z - A.Z),
    };
}

// ── Edge–plane intersection (Case B: ⊥ HP plane) ───────────────────────
// Plane: −sin(φ)·X + cos(φ)·Z = d   (Y does not appear)
function _edgePlaneIntersect_CaseB(A, B, φ, d) {
    const sA = -Math.sin(φ) * A.X + Math.cos(φ) * A.Z - d;
    const sB = -Math.sin(φ) * B.X + Math.cos(φ) * B.Z - d;
    if (sA * sB >= 0) return null;
    const t = sA / (sA - sB);
    return {
        X: A.X + t * (B.X - A.X),
        Y: A.Y + t * (B.Y - A.Y),
        Z: A.Z + t * (B.Z - A.Z),
    };
}

// ─────────────────────────────────────────
// TRUE SHAPE computation
// ─────────────────────────────────────────
// Place x1y1 reference line parallel to VT (cutting line).
// Direction along x1y1 (canvas): (cos θ, −sin θ)
// Perpendicular toward TV (+Z direction, canvas): (sin θ, cos θ)
//
// For each cut point i, canvas FV position = (fvX_i, fvY_i):
//   si    = projection along x1y1 direction relative to first point
//   Z_i   = Z3D of cut point (depth from VP)
//   true_pt = tsOrigin + si*(cosθ, −sinθ) + Z_i*(sinθ, cosθ)
function _computeTrueShape(θ) {
    const pts = sectionState.cutPoints;
    if (pts.length < 3) return;
    const o = sectionState.tsOrigin;
    const cosT = Math.cos(θ), sinT = Math.sin(θ);
    const dir = { x: cosT, y: -sinT };    // along x1y1
    const perp = { x: sinT, y: cosT };    // perpendicular (toward TV side)

    // Use first point as reference for "along" projection
    const ref = { x: pts[0].fvX, y: pts[0].fvY };

    sectionState.tsPoints = pts.map(p => {
        const dx = p.fvX - ref.x, dy = p.fvY - ref.y;
        const si = dx * dir.x + dy * dir.y;    // along x1y1
        const zi = p.Z;                          // depth (TV side)
        return {
            x: o.x + si * dir.x + zi * perp.x,
            y: o.y + si * dir.y + zi * perp.y,
        };
    });
}

function _computeTrueShape_CaseB(φ) {
    const pts = sectionState.cutPoints;
    if (pts.length < 3) return;
    const o = sectionState.tsOrigin;
    // For Case B, cutting line is in TV. x1y1 is parallel to TV cutting line.
    // Direction of TV cutting line (canvas): (cos φ, sin φ) in TV canvas
    //   (TV canvas: x→right, y→down = Z increases)
    // For true shape: project TV cut points onto x1y1, transfer Y from FV.
    const cosP = Math.cos(φ), sinP = Math.sin(φ);
    const dir = { x: cosP, y: sinP };    // along x1y1 (in TV canvas orientation)
    const perp = { x: -sinP, y: cosP };  // perpendicular (away from TV side, upward)

    const ref = { x: pts[0].tvX, y: pts[0].tvY };

    sectionState.tsPoints = pts.map(p => {
        const dx = p.tvX - ref.x, dy = p.tvY - ref.y;
        const si = dx * dir.x + dy * dir.y;  // along x1y1
        const yi = p.Y;                        // real Y (height) of each point
        return {
            x: o.x + si * dir.x - yi * perp.x,
            y: o.y + si * dir.y - yi * perp.y,
        };
    });
}

// ─────────────────────────────────────────
// RENDERING – Step 1: Cutting Plane Line
// ─────────────────────────────────────────
function _drawStep_VT() {
    if (!sectionState.vtStart) return;
    const vt = state.caseType === 'B' ? 'TV' : 'FV';
    const { vtStart: s, vtEnd: e } = sectionState;

    ctx.save();

    // Chain-dot line  (long–short–short)
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([16, 4, 4, 4]);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();

    // Bold thick ends (standard cutting plane convention)
    ctx.setLineDash([]);
    ctx.lineWidth = 4;
    const len = Math.hypot(e.x - s.x, e.y - s.y) || 1;
    const ux = (e.x - s.x) / len, uy = (e.y - s.y) / len;
    const thickLen = 14;

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + ux * thickLen, s.y + uy * thickLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(e.x, e.y);
    ctx.lineTo(e.x - ux * thickLen, e.y - uy * thickLen);
    ctx.stroke();

    // Arrow heads (perpendicular to cutting line = direction of viewing)
    const nx = -uy, ny = ux;   // normal to cutting line
    const arrowLen = 18, arrowW = 5;

    function drawArrowHead(px, py, dx, dy) {
        ctx.lineWidth = 1.5;
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + dx * arrowLen - dy * arrowW, py + dy * arrowLen + dx * arrowW);
        ctx.lineTo(px + dx * arrowLen + dy * arrowW, py + dy * arrowLen - dx * arrowW);
        ctx.closePath();
        ctx.fill();
    }
    drawArrowHead(s.x, s.y, nx, ny);
    drawArrowHead(e.x, e.y, nx, ny);

    // Labels  A – A
    ctx.fillStyle = '#e11d48';
    ctx.font = `bold 13px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('A', s.x + nx * 28, s.y + ny * 28);
    ctx.fillText('A', e.x + nx * 28, e.y + ny * 28);
    ctx.textAlign = 'left';

    ctx.restore();
}

// ─────────────────────────────────────────
// RENDERING – Step 2: Cut Points in FV
// ─────────────────────────────────────────
function _drawStep_CutPointsFV() {
    const pts = sectionState.cutPoints;
    if (!pts.length) return;
    ctx.save();
    ctx.fillStyle = '#e11d48';
    ctx.strokeStyle = '#e11d48';
    ctx.font = `bold 11px ${getComputedStyle(document.body).fontFamily}`;

    pts.forEach(p => {
        // Dot
        ctx.beginPath();
        ctx.arc(p.fvX, p.fvY, 3, 0, 2 * Math.PI);
        ctx.fill();
        // Label
        ctx.fillText(p.edgeLabel, p.fvX + 5, p.fvY - 5);
    });
    ctx.restore();
}

// ─────────────────────────────────────────
// RENDERING – Step 3: Projectors → TV cut polygon
// ─────────────────────────────────────────
function _drawStep_ProjectToTV() {
    const pts = sectionState.cutPoints;
    if (!pts.length) return;
    ctx.save();

    // Projector lines (construction, thin gray)
    ctx.strokeStyle = config.constructionColor;
    ctx.lineWidth = config.constructionLineWidth;
    ctx.setLineDash([2, 3]);
    pts.forEach(p => {
        ctx.beginPath();
        if (state.caseType === 'A') {
            // vertical projector from FV down to TV
            ctx.moveTo(p.fvX, p.fvY);
            ctx.lineTo(p.tvX, p.tvY);
        } else {
            // horizontal projector from TV left to FV
            ctx.moveTo(p.tvX, p.tvY);
            ctx.lineTo(p.fvX, p.fvY);
        }
        ctx.stroke();
    });

    // TV cut points + polygon outline
    ctx.setLineDash([]);
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pts[0].tvX, pts[0].tvY);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].tvX, pts[i].tvY);
    ctx.closePath();
    ctx.stroke();

    // TV cut point dots + labels
    ctx.fillStyle = '#e11d48';
    ctx.font = `bold 11px ${getComputedStyle(document.body).fontFamily}`;
    pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.tvX, p.tvY, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(p.edgeLabel + "'", p.tvX + 5, p.tvY - 4);
    });

    ctx.restore();
}

// ─────────────────────────────────────────
// RENDERING – Step 4: Hatching
// ─────────────────────────────────────────
function _drawStep_HatchSection() {
    const pts = sectionState.cutPoints;
    if (pts.length < 3) return;

    const tvPoly = pts.map(p => ({ x: p.tvX, y: p.tvY }));

    ctx.save();

    // Draw outline (thicker red)
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(tvPoly[0].x, tvPoly[0].y);
    tvPoly.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.stroke();

    // Clip to polygon for hatching
    ctx.beginPath();
    ctx.moveTo(tvPoly[0].x, tvPoly[0].y);
    tvPoly.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.clip();

    // 45° hatching
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 0.6;
    ctx.setLineDash([]);
    const xs = tvPoly.map(p => p.x), ys = tvPoly.map(p => p.y);
    const minX = Math.min(...xs) - 20, maxX = Math.max(...xs) + 20;
    const minY = Math.min(...ys) - 20, maxY = Math.max(...ys) + 20;
    const spacing = 7;
    for (let c = (minY - maxX); c <= (maxY - minX); c += spacing) {
        ctx.beginPath();
        ctx.moveTo(minX, minX + c);
        ctx.lineTo(maxX, maxX + c);
        ctx.stroke();
    }

    ctx.restore();
}

// ─────────────────────────────────────────
// RENDERING – Step 5: True Shape (Auxiliary View)
// ─────────────────────────────────────────
function _drawStep_TrueShape() {
    const pts = sectionState.cutPoints;
    const tsPts = sectionState.tsPoints;
    if (tsPts.length < 3) return;

    const θ = sectionState.planeType === 'parallel-hp' || sectionState.planeType === 'parallel-vp'
        ? 0 : (sectionState.cutAngle * Math.PI / 180);
    const o = sectionState.tsOrigin;
    const cosT = Math.cos(θ), sinT = Math.sin(θ);

    ctx.save();

    // ── Draw x1y1 reference line ──────────
    // Parallel to cutting plane line, through tsOrigin
    const x1y1Len = state.axisLength * 1.2;
    const dir = { x: cosT, y: -sinT };

    // Draw as thin chain-dot
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([10, 3, 3, 3]);
    const x1x = o.x - dir.x * x1y1Len * 0.5;
    const x1y = o.y - dir.y * x1y1Len * 0.5;
    const y1x = o.x + dir.x * x1y1Len * 0.5;
    const y1y = o.y + dir.y * x1y1Len * 0.5;
    ctx.beginPath();
    ctx.moveTo(x1x, x1y);
    ctx.lineTo(y1x, y1y);
    ctx.stroke();

    // Labels x1, y1
    ctx.setLineDash([]);
    ctx.fillStyle = '#e11d48';
    ctx.font = `bold 12px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillText('x₁', x1x - 18, x1y + 4);
    ctx.fillText('y₁', y1x + 5, y1y + 4);

    // ── Projection lines from FV cut points to x1y1 ──
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 3]);

    const ref = { x: pts[0].fvX, y: pts[0].fvY };
    pts.forEach((p, i) => {
        // foot of perpendicular from FV point onto x1y1
        const dx = p.fvX - ref.x, dy = p.fvY - ref.y;
        const si = dx * dir.x + dy * dir.y;
        const fx = o.x + si * dir.x, fy = o.y + si * dir.y;
        ctx.beginPath();
        ctx.moveTo(p.fvX, p.fvY);
        ctx.lineTo(fx, fy);
        ctx.stroke();
        // line from foot to true shape point
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tsPts[i].x, tsPts[i].y);
        ctx.stroke();
    });

    // ── Draw true shape polygon ──
    ctx.setLineDash([]);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tsPts[0].x, tsPts[0].y);
    tsPts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.stroke();

    // ── Hatch true shape ──
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tsPts[0].x, tsPts[0].y);
    tsPts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.6;
    const txs = tsPts.map(p => p.x), tys = tsPts.map(p => p.y);
    const tminX = Math.min(...txs) - 20, tmaxX = Math.max(...txs) + 20;
    const tminY = Math.min(...tys) - 20, tmaxY = Math.max(...tys) + 20;
    const spc = 7;
    for (let c = (tminY - tmaxX); c <= (tmaxY - tminX); c += spc) {
        ctx.beginPath();
        ctx.moveTo(tminX, tminX + c);
        ctx.lineTo(tmaxX, tmaxX + c);
        ctx.stroke();
    }
    ctx.restore();

    // ── Labels on true shape points ──
    ctx.fillStyle = '#0f172a';
    ctx.font = `10px ${getComputedStyle(document.body).fontFamily}`;
    pts.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(tsPts[i].x, tsPts[i].y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(p.edgeLabel + '₀', tsPts[i].x + 4, tsPts[i].y - 4);
    });

    // Title
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold 11px ${getComputedStyle(document.body).fontFamily}`;
    const centX = tsPts.reduce((s, p) => s + p.x, 0) / tsPts.length;
    const topY = Math.min(...tsPts.map(p => p.y));
    ctx.textAlign = 'center';
    ctx.fillText('True Shape', centX, topY - 16);
    ctx.textAlign = 'left';

    ctx.restore();
}
