// ========================================
// Case P4 — Plane Inclined θ to HP, ⊥ VP
// caseP4.js  (load after planes-core.js)
//
// THEORY (Change-of-Position / Two-Stage):
//   The plane is perpendicular to VP → FV always shows edge view.
//   The plane is inclined at θ to HP → FV edge is tilted at θ to XY.
//
//   STAGE 1 (assume ∥ HP, same as P2):
//     TV = True shape  (solid polygon below XY)
//     FV = Edge view on XY  (horizontal line)
//
//   STAGE 2 (tilt to θ):
//     Pivot = leftmost point of FV edge (the resting edge on HP stays fixed).
//     FV edge rotates from horizontal to angle θ above XY (tilts to the right-up).
//     For each vertex i of Stage-1 TV at (xi, yi):
//       • Distance from pivot along edge = xi - xPivot
//       • New FV position: x = xPivot + dist·cos θ,  y = xyY − dist·sin θ
//       • New TV position: x = xPivot + dist·cos θ,  y = yi   (locus intersection)
//     Final TV is a foreshortened polygon (parallelogram for rectangle/square).
//     Final FV is the tilted edge line at angle θ.
//
// STEP MAP:
//   Step 1  XY line only.
//   Step 2  Stage-1: TV true shape (dashed — temporary).
//   Step 3  Stage-1: FV edge on XY (dashed — temporary).
//   Step 4  Mark horizontal loci from Stage-1 TV vertices.
//   Step 5  Stage-2: FV tilted edge at θ (solid — final FV).
//   Step 6  Drop projectors from Stage-2 FV; draw final TV (solid).
//   Step 7  Full labels and angle annotation.
// ========================================

function drawCaseP4Step(step) {
    const geo = _p4BuildGeometry();
    switch (step) {
        case 1: _p4Step1(geo); break;
        case 2: _p4Step2(geo); break;
        case 3: _p4Step3(geo); break;
        case 4: _p4Step4(geo); break;
        case 5: _p4Step5(geo); break;
        case 6: _p4Step6(geo); break;
        case 7: _p4Step7(geo); break;
        default: updateInstructions('Case P4', 'Unknown step.');
    }
}

// ========================================
// Geometry builder — computes all Stage-1 and Stage-2 points
// ========================================
function _p4BuildGeometry() {
    const xyY   = config.xyLineY;
    const theta = state.theta;

    // Stage-1 TV: true shape below XY — placed at left-centre so Stage-2 fits to the right
    const s1TV  = buildTVShape(false, canvas.width * 0.30);
    const { left: xPivot, right: xRight } = getShapeXExtent(s1TV);

    // Stage-1 FV: horizontal edge on XY (same x-span as TV)
    const s1FVLeft  = xPivot;
    const s1FVRight = xRight;

    // Offset for Stage-2: push final views to the RIGHT of Stage-1, no overlap
    // Mirrors solids caseC pattern: offset = shapeWidth + gap
    const xOffset = getStage2Offset(s1TV);

    // Stage-2: tilted FV + foreshortened TV, all shifted right by xOffset
    const s2 = computeP4Stage2(s1TV, theta, xOffset);
    // s2.fv    = FV points on tilted edge (shifted right)
    // s2.tv    = foreshortened TV polygon (shifted right)
    // s2.pivotX = x-coordinate of Stage-2 pivot (= xPivot + xOffset)

    const pivotFV = { x: s2.pivotX, y: xyY };

    // Tip = rightmost FV point on the tilted edge
    const tipFV = s2.fv.reduce((best, p) => p.x > best.x ? p : best, s2.fv[0]);

    return { xyY, theta, s1TV, s1FVLeft, s1FVRight, s2, pivotFV, tipFV, xPivot };
}

// ========================================
// Steps
// ========================================
function _p4Step1(geo) {
    updateInstructions(
        'Step 1 — Draw XY Reference Line',
        'Start with the XY ground line (HP\u2013VP intersection). ' +
        'Case P4 involves the plane inclined at \u03B8 = ' + geo.theta + '\u00B0 to HP and perpendicular to VP. ' +
        'We use the Change-of-Position method (two stages): ' +
        'Stage 1 assumes the plane is \u2225 HP (same as P2), giving a TV true shape. ' +
        'Stage 2 tilts the plane to the required angle \u03B8.'
    );
    drawXYLine();
    _p4DrawRegionLabels();
}

function _p4Step2(geo) {
    updateInstructions(
        'Step 2 — Stage 1: Draw TV True Shape (Temporary)',
        'Temporarily assume the plane is parallel to HP. In this position, the TV shows the ' +
        'TRUE SHAPE of the ' + _p4ShapeLabel() + ' (same as Case P2 Stage-1). ' +
        'Draw it in dashed lines below XY — this is a construction position, not the final answer. ' +
        'Note that the left edge (pivot edge) rests on XY.'
    );
    drawXYLine();
    _p4DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    // Dim labels for Stage-1 TV
    ctx.save();
    ctx.fillStyle = config.tempColor;
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('Stage 1 — True Shape (temp)', canvas.width/2, config.xyLineY + _p4TVDepth(geo) + 24);
    ctx.restore();
}

function _p4Step3(geo) {
    updateInstructions(
        'Step 3 — Stage 1: Draw FV Edge View on XY (Temporary)',
        'In Stage 1 (plane \u2225 HP), the FV is an EDGE VIEW lying on the XY line. ' +
        'Draw a horizontal dashed line on XY spanning the full width of the TV shape. ' +
        'This is the Stage-1 FV — temporary, shown dashed. The LEFT end of this line is ' +
        'the PIVOT POINT about which we tilt the plane in Stage 2.'
    );
    drawXYLine();
    _p4DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    // Stage-1 FV edge (dashed)
    drawLine(geo.s1FVLeft, geo.xyY, geo.s1FVRight, geo.xyY, 'temp');
    // Mark pivot
    _p4DrawPivot(geo);
    ctx.save();
    ctx.fillStyle = config.tempColor;
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('Stage 1 — FV edge on XY (temp)', canvas.width/2, geo.xyY - 22);
    ctx.fillText('Stage 1 — True Shape (temp)',     canvas.width/2, geo.xyY + _p4TVDepth(geo) + 24);
    ctx.restore();
}

function _p4Step4(geo) {
    updateInstructions(
        'Step 4 — Mark Horizontal Loci from Stage-1 TV Vertices',
        'From each corner of the Stage-1 TV, draw a HORIZONTAL locus line (extending to the right). ' +
        'These loci represent the y-position (height above/below HP) that each vertex maintains ' +
        'during the tilting operation. In Stage 2, the final TV vertices are found where ' +
        'vertical projectors from the new FV edge intersect these horizontal loci.'
    );
    drawXYLine();
    _p4DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    drawLine(geo.s1FVLeft, geo.xyY, geo.s1FVRight, geo.xyY, 'temp');
    _p4DrawPivot(geo);
    // Draw loci lines
    const lociEndX = geo.xPivot + _p4TVWidth(geo) * 1.5 + 30;
    _p4DrawLoci(geo, lociEndX);
}

function _p4Step5(geo) {
    updateInstructions(
        'Step 5 — Stage 2: Tilt FV Edge to \u03B8 = ' + geo.theta + '\u00B0 (Final FV)',
        'Rotate the FV edge line about the PIVOT POINT (left end on XY) upward at angle \u03B8 = ' +
        geo.theta + '\u00B0 to XY. This tilted line is the FINAL FRONT VIEW — it is the edge view ' +
        'of the plane inclined at \u03B8 to HP. Draw it as a solid visible line. ' +
        'The pivot stays at XY; the far end rises to height = width \u00D7 sin(\u03B8).'
    );
    drawXYLine();
    _p4DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    drawLine(geo.s1FVLeft, geo.xyY, geo.s1FVRight, geo.xyY, 'temp');
    _p4DrawPivot(geo);
    _p4DrawLoci(geo, _p4LociEndX(geo));
    // Stage-2 FV: tilted edge (solid)
    drawLine(geo.pivotFV.x, geo.pivotFV.y, geo.tipFV.x, geo.tipFV.y, 'visible');
    // Angle arc at pivot
    drawAngleArc(geo.pivotFV.x, geo.pivotFV.y, 28, 180, 180 + geo.theta, '\u03B8=' + geo.theta + '\u00B0');
    // FV label
    ctx.save();
    ctx.fillStyle = config.annotationColor;
    ctx.font = `bold ${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('FINAL FV (edge at \u03B8)', (geo.pivotFV.x + geo.tipFV.x)/2, geo.tipFV.y - 12);
    ctx.restore();
}

function _p4Step6(geo) {
    updateInstructions(
        'Step 6 — Project to Get Final TV (Foreshortened Shape)',
        'From each point on the Stage-2 FV tilted edge, drop vertical projectors downward. ' +
        'Where each projector intersects its corresponding horizontal LOCUS line from Stage 1, ' +
        'you get the final TV vertex position. Connect these points to complete the FINAL TV — ' +
        'a foreshortened version of the true shape (appears compressed due to the tilt).'
    );
    drawXYLine();
    _p4DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    drawLine(geo.s1FVLeft, geo.xyY, geo.s1FVRight, geo.xyY, 'temp');
    _p4DrawPivot(geo);
    _p4DrawLoci(geo, _p4LociEndX(geo));
    drawLine(geo.pivotFV.x, geo.pivotFV.y, geo.tipFV.x, geo.tipFV.y, 'visible');
    drawAngleArc(geo.pivotFV.x, geo.pivotFV.y, 28, 180, 180 + geo.theta, '\u03B8=' + geo.theta + '\u00B0');
    // Vertical projectors from Stage-2 FV to TV
    for (const fp of geo.s2.fv) {
        const tvPt = geo.s2.tv.find(t => Math.abs(t.x - fp.x) < 0.5);
        if (tvPt) drawProjector(fp.x, fp.y, tvPt.x, tvPt.y);
    }
    // Final TV (solid polygon)
    drawPointSet(geo.s2.tv, 'visible');
    ctx.save();
    ctx.fillStyle = config.annotationColor;
    ctx.font = `bold ${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('FINAL TV (foreshortened)', canvas.width/2, config.xyLineY + _p4TVDepth(geo) + 40);
    ctx.restore();
}

function _p4Step7(geo) {
    updateInstructions(
        'Step 7 — Label All Views and Finalise',
        'Label FV points with primed notation (a\u2032, b\u2032\u2026) and TV points with unprimed (a, b\u2026). ' +
        'The FINAL FV is the tilted edge line at \u03B8 = ' + geo.theta + '\u00B0 to XY. ' +
        'The FINAL TV is the foreshortened shape (compressed in the direction of tilt). ' +
        'The Stage-1 (temporary) construction lines are shown faint for reference.'
    );
    drawXYLine();
    _p4DrawRegionLabels();
    // Stage-1 (faint)
    drawTVShape(geo.s1TV, 'temp');
    drawLine(geo.s1FVLeft, geo.xyY, geo.s1FVRight, geo.xyY, 'temp');
    _p4DrawPivot(geo);
    _p4DrawLoci(geo, _p4LociEndX(geo));
    // Stage-2 FV
    drawLine(geo.pivotFV.x, geo.pivotFV.y, geo.tipFV.x, geo.tipFV.y, 'visible');
    drawAngleArc(geo.pivotFV.x, geo.pivotFV.y, 28, 180, 180 + geo.theta, '\u03B8=' + geo.theta + '\u00B0');
    // Projectors
    for (const fp of geo.s2.fv) {
        const tvPt = geo.s2.tv.find(t => Math.abs(t.x - fp.x) < 0.5);
        if (tvPt) drawProjector(fp.x, fp.y, tvPt.x, tvPt.y);
    }
    // Final TV (solid)
    drawPointSet(geo.s2.tv, 'visible');
    // Labels
    _p4LabelFVEdge(geo);
    labelPointSet(geo.s2.tv, 5, 12);
    // Annotations
    ctx.save();
    ctx.fillStyle = config.annotationColor;
    ctx.font = `bold ${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('FINAL FV — edge at \u03B8=' + geo.theta + '\u00B0', (geo.pivotFV.x + geo.tipFV.x)/2, geo.tipFV.y - 14);
    ctx.fillText('FINAL TV (foreshortened)', canvas.width/2, config.xyLineY + _p4TVDepth(geo) + 40);
    ctx.restore();
}

// ---- private helpers ----

function _p4DrawRegionLabels() {
    ctx.save();
    ctx.fillStyle = '#cbd5e1'; ctx.font = `13px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'right';
    const ex = config.xyLineStartX + config.xyLineLength;
    ctx.fillText('FV \u2191', ex - 4, config.xyLineY - 8);
    ctx.fillText('TV \u2193', ex - 4, config.xyLineY + 18);
    ctx.restore();
}

function _p4DrawPivot(geo) {
    ctx.save();
    ctx.fillStyle = config.annotationColor;
    ctx.beginPath(); ctx.arc(geo.pivotFV.x, geo.pivotFV.y, 4, 0, 2*Math.PI); ctx.fill();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillText('Pivot', geo.pivotFV.x - 30, geo.pivotFV.y - 8);
    ctx.restore();
}

function _p4DrawLoci(geo, endX) {
    // Draw horizontal loci lines from each unique y-position of Stage-2 TV vertices.
    // Loci start from left of Stage-1 TV and extend to endX (covers both stages).
    const lociStartX = geo.xPivot - 10;
    const seenY = new Set();
    for (const tv of geo.s2.tv) {
        const yKey = Math.round(tv.y);
        if (!seenY.has(yKey)) {
            seenY.add(yKey);
            drawProjector(lociStartX, tv.y, endX, tv.y);
        }
    }
}

// Compute loci endX: rightmost Stage-2 TV/FV point + margin
function _p4LociEndX(geo) {
    const allX = [...geo.s2.tv.map(p=>p.x), ...geo.s2.fv.map(p=>p.x)];
    return Math.max(...allX) + 25;
}

function _p4LabelFVEdge(geo) {
    // Group unique positions on tilted FV edge
    const byX = {};
    for (const fp of geo.s2.fv) {
        const key = Math.round(fp.x);
        if (!byX[key]) byX[key] = [];
        byX[key].push(fp.label);
    }
    ctx.save();
    ctx.fillStyle = config.labelColor;
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    for (const [key, labels] of Object.entries(byX)) {
        const fp = geo.s2.fv.find(p => Math.round(p.x) === parseInt(key));
        if (fp) ctx.fillText(labels.join(','), fp.x + 4, fp.y - 6);
    }
    ctx.restore();
}

function _p4TVDepth(geo) {
    const ext = getShapeYExtent(geo.s1TV);
    return ext.bottom - config.xyLineY;
}

function _p4TVWidth(geo) {
    const ext = getShapeXExtent(geo.s1TV);
    return ext.right - ext.left;
}

function _p4ShapeLabel() {
    const m = { square:'Square', rectangle:'Rectangle', triangle:'Equilateral Triangle',
                circle:'Circle', pentagon:'Regular Pentagon', hexagon:'Regular Hexagon', semicircle:'Semicircle' };
    return m[state.shapeType] || state.shapeType;
}
