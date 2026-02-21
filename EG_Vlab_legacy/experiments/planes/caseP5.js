// ========================================
// Case P5 — Plane ⊥ HP, Inclined φ to VP
// caseP5.js  (load after planes-core.js)
//
// THEORY (Change-of-Position / Two-Stage):
//   The plane is perpendicular to HP → TV always shows edge view.
//   The plane is inclined at φ to VP → TV edge is tilted at φ to XY.
//
//   STAGE 1 (assume ∥ VP, same as P1):
//     FV = True shape  (solid polygon above XY)
//     TV = Edge view on XY  (horizontal line)
//
//   STAGE 2 (tilt to φ):
//     Pivot = leftmost point of TV edge on XY (resting edge stays fixed on HP).
//     TV edge rotates from horizontal down at angle φ below XY.
//     For each vertex i of Stage-1 FV at (xi, yi):
//       • Distance from pivot along edge = xi − xPivot
//       • New TV position: x = xPivot + dist·cos φ,  y = xyY + dist·sin φ
//       • New FV position: x = xPivot + dist·cos φ,  y = yi   (locus intersection)
//     Final TV is the tilted edge line at φ below XY.
//     Final FV is a foreshortened polygon.
//
// STEP MAP:
//   Step 1  XY line only.
//   Step 2  Stage-1: FV true shape (dashed — temporary).
//   Step 3  Stage-1: TV edge on XY (dashed — temporary).
//   Step 4  Mark horizontal loci from Stage-1 FV vertices.
//   Step 5  Stage-2: TV tilted edge at φ below XY (solid — final TV).
//   Step 6  Project up from Stage-2 TV to FV loci → final FV (solid).
//   Step 7  Full labels and angle annotation.
// ========================================

function drawCaseP5Step(step) {
    const geo = _p5BuildGeometry();
    switch (step) {
        case 1: _p5Step1(geo); break;
        case 2: _p5Step2(geo); break;
        case 3: _p5Step3(geo); break;
        case 4: _p5Step4(geo); break;
        case 5: _p5Step5(geo); break;
        case 6: _p5Step6(geo); break;
        case 7: _p5Step7(geo); break;
        default: updateInstructions('Case P5', 'Unknown step.');
    }
}

// ========================================
// Geometry builder
// ========================================
function _p5BuildGeometry() {
    const xyY = config.xyLineY;
    const phi = state.phi;

    // Stage-1 FV: true shape above XY — placed at left-centre so Stage-2 fits to the right
    const s1FV = buildFVShape(true, canvas.width * 0.30);   // primed labels
    const { left: xPivot, right: xRight } = getShapeXExtent(s1FV);

    // Stage-1 TV: horizontal edge on XY (same x-span as FV)
    const s1TVLeft  = xPivot;
    const s1TVRight = xRight;

    // Offset for Stage-2: push final views to the RIGHT of Stage-1, no overlap
    const xOffset = getStage2Offset(s1FV);

    // Stage-2: tilted TV + foreshortened FV, all shifted right by xOffset
    const s2 = computeP5Stage2(s1FV, phi, xOffset);
    // s2.tv    = tilted TV edge points (shifted right)
    // s2.fv    = final FV foreshortened points (shifted right)
    // s2.pivotX = x-coordinate of Stage-2 pivot (= xPivot + xOffset)

    const pivotTV = { x: s2.pivotX, y: xyY };

    // Tip of tilted TV edge (furthest point from pivotTV)
    const tipTV = s2.tv.reduce((best, p) => {
        const d = Math.hypot(p.x - s2.pivotX, p.y - xyY);
        return d > Math.hypot(best.x - s2.pivotX, best.y - xyY) ? p : best;
    }, s2.tv[0]);

    return { xyY, phi, s1FV, s1TVLeft, s1TVRight, s2, pivotTV, tipTV, xPivot };
}

// ========================================
// Steps
// ========================================
function _p5Step1(geo) {
    updateInstructions(
        'Step 1 — Draw XY Reference Line',
        'Start with the XY ground line. Case P5 involves the plane perpendicular to HP and ' +
        'inclined at \u03C6 = ' + geo.phi + '\u00B0 to VP. ' +
        'We use the Change-of-Position method (two stages): ' +
        'Stage 1 assumes the plane is \u2225 VP (same as P1), giving a FV true shape. ' +
        'Stage 2 tilts the plane to the required angle \u03C6 to VP.'
    );
    drawXYLine();
    _p5DrawRegionLabels();
}

function _p5Step2(geo) {
    updateInstructions(
        'Step 2 — Stage 1: Draw FV True Shape (Temporary)',
        'Temporarily assume the plane is parallel to VP. In this position, the FV shows the ' +
        'TRUE SHAPE of the ' + _p5ShapeLabel() + ' (same as Case P1 Stage-1). ' +
        'Draw it in dashed lines above XY — this is a construction position, not the final answer. ' +
        'The left edge (pivot edge) rests with one end on XY.'
    );
    drawXYLine();
    _p5DrawRegionLabels();
    drawFVShape(geo.s1FV, 'temp');
    ctx.save();
    ctx.fillStyle = config.tempColor; ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center';
    ctx.fillText('Stage 1 — True Shape (temp)', canvas.width/2, config.xyLineY - _p5FVHeight(geo) - 16);
    ctx.restore();
}

function _p5Step3(geo) {
    updateInstructions(
        'Step 3 — Stage 1: Draw TV Edge View on XY (Temporary)',
        'In Stage 1 (plane \u2225 VP), the TV is an EDGE VIEW lying on the XY line. ' +
        'Draw a horizontal dashed line on XY spanning the full width of the FV shape. ' +
        'This is the Stage-1 TV — temporary, shown dashed. The LEFT end is the ' +
        'PIVOT POINT about which we tilt the plane in Stage 2.'
    );
    drawXYLine();
    _p5DrawRegionLabels();
    drawFVShape(geo.s1FV, 'temp');
    // Stage-1 TV edge on XY (dashed)
    drawLine(geo.s1TVLeft, geo.xyY, geo.s1TVRight, geo.xyY, 'temp');
    _p5DrawPivot(geo);
    ctx.save();
    ctx.fillStyle = config.tempColor; ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center';
    ctx.fillText('Stage 1 — TV edge on XY (temp)', canvas.width/2, geo.xyY + 22);
    ctx.fillText('Stage 1 — True Shape (temp)',    canvas.width/2, geo.xyY - _p5FVHeight(geo) - 16);
    ctx.restore();
}

function _p5Step4(geo) {
    updateInstructions(
        'Step 4 — Mark Horizontal Loci from Stage-1 FV Vertices',
        'From each corner of the Stage-1 FV true shape, draw a HORIZONTAL locus line. ' +
        'These loci represent the height (y-level) of each vertex above XY — heights are ' +
        'preserved when we tilt the plane sideways. In Stage 2, final FV vertices are found ' +
        'by intersecting vertical projectors from the tilted TV with these horizontal loci.'
    );
    drawXYLine();
    _p5DrawRegionLabels();
    drawFVShape(geo.s1FV, 'temp');
    drawLine(geo.s1TVLeft, geo.xyY, geo.s1TVRight, geo.xyY, 'temp');
    _p5DrawPivot(geo);
    // Horizontal loci from FV vertices extending right
    const lociEndX = geo.xPivot + _p5FVWidth(geo) * 1.5 + 30;
    _p5DrawLoci(geo, lociEndX);
}

function _p5Step5(geo) {
    updateInstructions(
        'Step 5 — Stage 2: Tilt TV Edge to \u03C6 = ' + geo.phi + '\u00B0 (Final TV)',
        'Rotate the TV edge line about the PIVOT POINT (left end on XY) downward at angle \u03C6 = ' +
        geo.phi + '\u00B0 below XY. This tilted line is the FINAL TOP VIEW — it is the edge view ' +
        'of the plane inclined at \u03C6 to VP. Draw it as a solid visible line. ' +
        'The pivot stays at XY; the far end drops to depth = width \u00D7 sin(\u03C6) below XY.'
    );
    drawXYLine();
    _p5DrawRegionLabels();
    drawFVShape(geo.s1FV, 'temp');
    drawLine(geo.s1TVLeft, geo.xyY, geo.s1TVRight, geo.xyY, 'temp');
    _p5DrawPivot(geo);
    _p5DrawLoci(geo, _p5LociEndX(geo));
    // Stage-2 TV: tilted edge (solid)
    drawLine(geo.pivotTV.x, geo.pivotTV.y, geo.tipTV.x, geo.tipTV.y, 'visible');
    // Angle arc at pivot (below XY — angles in canvas space)
    drawAngleArc(geo.pivotTV.x, geo.pivotTV.y, 28, 0, geo.phi, '\u03C6=' + geo.phi + '\u00B0');
    ctx.save();
    ctx.fillStyle = config.annotationColor; ctx.font = `bold ${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center';
    ctx.fillText('FINAL TV (edge at \u03C6)', (geo.pivotTV.x + geo.tipTV.x)/2, geo.tipTV.y + 18);
    ctx.restore();
}

function _p5Step6(geo) {
    updateInstructions(
        'Step 6 — Project Up to Get Final FV (Foreshortened Shape)',
        'From each point on the Stage-2 TV tilted edge, draw vertical projectors UPWARD. ' +
        'Where each projector intersects its corresponding horizontal LOCUS in the FV region, ' +
        'you get the final FV vertex. Connect these points to form the FINAL FV — a foreshortened ' +
        'version of the true shape (compressed in the direction of tilt \u03C6).'
    );
    drawXYLine();
    _p5DrawRegionLabels();
    drawFVShape(geo.s1FV, 'temp');
    drawLine(geo.s1TVLeft, geo.xyY, geo.s1TVRight, geo.xyY, 'temp');
    _p5DrawPivot(geo);
    _p5DrawLoci(geo, _p5LociEndX(geo));
    drawLine(geo.pivotTV.x, geo.pivotTV.y, geo.tipTV.x, geo.tipTV.y, 'visible');
    drawAngleArc(geo.pivotTV.x, geo.pivotTV.y, 28, 0, geo.phi, '\u03C6=' + geo.phi + '\u00B0');
    // Vertical projectors from Stage-2 TV to FV
    for (const tv of geo.s2.tv) {
        const fvPt = geo.s2.fv.find(f => Math.abs(f.x - tv.x) < 0.5);
        if (fvPt) drawProjector(tv.x, tv.y, fvPt.x, fvPt.y);
    }
    // Final FV (solid polygon)
    drawPointSet(geo.s2.fv, 'visible');
    ctx.save();
    ctx.fillStyle = config.annotationColor; ctx.font = `bold ${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center';
    ctx.fillText('FINAL FV (foreshortened)', canvas.width/2, config.xyLineY - _p5FVHeight(geo) - 20);
    ctx.restore();
}

function _p5Step7(geo) {
    updateInstructions(
        'Step 7 — Label All Views and Finalise',
        'Label FV points with primed notation (a\u2032, b\u2032\u2026) and TV points with unprimed (a, b\u2026). ' +
        'The FINAL TV is the tilted edge at \u03C6 = ' + geo.phi + '\u00B0 below XY. ' +
        'The FINAL FV is the foreshortened shape (compressed in the direction of tilt). ' +
        'Stage-1 construction lines remain shown faint for reference.'
    );
    drawXYLine();
    _p5DrawRegionLabels();
    drawFVShape(geo.s1FV, 'temp');
    drawLine(geo.s1TVLeft, geo.xyY, geo.s1TVRight, geo.xyY, 'temp');
    _p5DrawPivot(geo);
    _p5DrawLoci(geo, _p5LociEndX(geo));
    drawLine(geo.pivotTV.x, geo.pivotTV.y, geo.tipTV.x, geo.tipTV.y, 'visible');
    drawAngleArc(geo.pivotTV.x, geo.pivotTV.y, 28, 0, geo.phi, '\u03C6=' + geo.phi + '\u00B0');
    for (const tv of geo.s2.tv) {
        const fvPt = geo.s2.fv.find(f => Math.abs(f.x - tv.x) < 0.5);
        if (fvPt) drawProjector(tv.x, tv.y, fvPt.x, fvPt.y);
    }
    drawPointSet(geo.s2.fv, 'visible');
    // Labels
    labelPointSet(geo.s2.fv, 5, -6);
    _p5LabelTVEdge(geo);
    // Annotations
    ctx.save();
    ctx.fillStyle = config.annotationColor; ctx.font = `bold ${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center';
    ctx.fillText('FINAL FV (foreshortened)', canvas.width/2, config.xyLineY - _p5FVHeight(geo) - 20);
    ctx.fillText('FINAL TV — edge at \u03C6=' + geo.phi + '\u00B0', (geo.pivotTV.x + geo.tipTV.x)/2, geo.tipTV.y + 18);
    ctx.restore();
}

// ---- private helpers ----

function _p5DrawRegionLabels() {
    ctx.save();
    ctx.fillStyle = '#cbd5e1'; ctx.font = `13px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'right';
    const ex = config.xyLineStartX + config.xyLineLength;
    ctx.fillText('FV \u2191', ex - 4, config.xyLineY - 8);
    ctx.fillText('TV \u2193', ex - 4, config.xyLineY + 18);
    ctx.restore();
}

function _p5DrawPivot(geo) {
    ctx.save();
    ctx.fillStyle = config.annotationColor;
    ctx.beginPath(); ctx.arc(geo.pivotTV.x, geo.pivotTV.y, 4, 0, 2*Math.PI); ctx.fill();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillText('Pivot', geo.pivotTV.x - 30, geo.pivotTV.y + 14);
    ctx.restore();
}

function _p5DrawLoci(geo, endX) {
    const seenY = new Set();
    for (const fv of geo.s2.fv) {
        const yKey = Math.round(fv.y);
        if (!seenY.has(yKey)) {
            seenY.add(yKey);
            drawProjector(geo.xPivot - 10, fv.y, endX, fv.y);
        }
    }
}

function _p5LociEndX(geo) {
    const allX = [...geo.s2.fv.map(p=>p.x), ...geo.s2.tv.map(p=>p.x)];
    return Math.max(...allX) + 25;
}

function _p5LabelTVEdge(geo) {
    const byPos = {};
    for (const tv of geo.s2.tv) {
        const key = Math.round(tv.x) + '_' + Math.round(tv.y);
        if (!byPos[key]) byPos[key] = { x: tv.x, y: tv.y, labels: [] };
        byPos[key].labels.push(tv.label);
    }
    ctx.save();
    ctx.fillStyle = config.labelColor; ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    for (const pt of Object.values(byPos)) {
        drawLabel(pt.labels.join(','), pt.x, pt.y, 5, 12);
    }
    ctx.restore();
}

function _p5FVHeight(geo) {
    const ext = getShapeYExtent(geo.s1FV);
    return config.xyLineY - ext.top;
}

function _p5FVWidth(geo) {
    const ext = getShapeXExtent(geo.s1FV);
    return ext.right - ext.left;
}

function _p5ShapeLabel() {
    const m = { square:'Square', rectangle:'Rectangle', triangle:'Equilateral Triangle',
                circle:'Circle', pentagon:'Regular Pentagon', hexagon:'Regular Hexagon', semicircle:'Semicircle' };
    return m[state.shapeType] || state.shapeType;
}
