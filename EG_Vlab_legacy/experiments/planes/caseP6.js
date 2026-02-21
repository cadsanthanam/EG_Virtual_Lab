// ========================================
// Case P6 — Oblique Plane (θ to HP + α edge to VP)
// caseP6.js  (load after planes-core.js)
//
// THEORY (Change-of-Position / Three-Stage):
//   The plane is inclined θ to HP AND the resting/specified edge makes angle α to VP.
//
//   STAGE 1 (assume ∥ HP, same as P2):
//     TV = True shape  (polygon below XY)
//     FV = Edge view on XY  (horizontal line)
//
//   STAGE 2 (tilt surface to θ, same as P4):
//     FV edge tilts to θ; intermediate (foreshortened) TV is computed.
//     s2.fv  = tilted FV edge points
//     s2.tv  = foreshortened TV polygon (intermediate)
//
//   STAGE 3 (rotate intermediate TV so specified edge makes α to XY):
//     The bottom edge of the Stage-2 TV (currently horizontal) is rotated about
//     the pivot (left end of that bottom edge) by angle α in canvas plane.
//     Then each Stage-3 TV vertex is projected UPWARD; its FV y-position comes
//     from the corresponding Stage-2 FV point (horizontal loci from Stage-2 FV).
//     Final FV is obtained at those intersections.
//
// STEP MAP:
//   Step 1   XY line.
//   Step 2   Stage-1: TV true shape (dashed).
//   Step 3   Stage-1: FV edge on XY (dashed).
//   Step 4   Stage-2: Tilt FV edge to θ (solid).
//   Step 5   Stage-2: Compute & draw intermediate TV (dashed).
//   Step 6   Horizontal loci from Stage-2 FV.
//   Step 7   Stage-3: Rotate intermediate TV by α (final TV, solid).
//   Step 8   Project from final TV up to Stage-2 loci → final FV points.
//   Step 9   Draw final FV (solid foreshortened shape).
//   Step 10  Full labels and annotations.
// ========================================

function drawCaseP6Step(step) {
    const geo = _p6BuildGeometry();
    switch (step) {
        case 1:  _p6Step1(geo);  break;
        case 2:  _p6Step2(geo);  break;
        case 3:  _p6Step3(geo);  break;
        case 4:  _p6Step4(geo);  break;
        case 5:  _p6Step5(geo);  break;
        case 6:  _p6Step6(geo);  break;
        case 7:  _p6Step7(geo);  break;
        case 8:  _p6Step8(geo);  break;
        case 9:  _p6Step9(geo);  break;
        case 10: _p6Step10(geo); break;
        default: updateInstructions('Case P6', 'Unknown step.');
    }
}

// ========================================
// Geometry builder
// ========================================
function _p6BuildGeometry() {
    const xyY   = config.xyLineY;
    const theta = state.theta;
    const alpha = state.alpha;

    // Stage-1 TV: true shape below XY — placed at left-centre so Stages 2+3 fit to the right
    const s1TV = buildTVShape(false, canvas.width * 0.25);
    const { left: xPivot, right: xRight } = getShapeXExtent(s1TV);

    // Offset for Stage-2: shift final views to the RIGHT of Stage-1 — no overlap
    const xOffset = getStage2Offset(s1TV);

    // Stage-2: tilt FV to θ, all Stage-2 points shifted right by xOffset
    const s2 = computeP4Stage2(s1TV, theta, xOffset);
    // s2.fv    = points on tilted FV edge (shifted right)
    // s2.tv    = foreshortened TV polygon (shifted right)
    // s2.pivotX = Stage-2 pivot x = xPivot + xOffset

    const pivotFV = { x: s2.pivotX, y: xyY };
    const tipFV   = s2.fv.reduce((b, p) => p.x > b.x ? p : b, s2.fv[0]);

    // Stage-3: rotate s2.tv about its bottom-left corner by angle α
    // The "bottom edge" is the row of points at the largest y value in s2.tv
    const s2tvBottomY = Math.max(...s2.tv.map(p => p.y));
    const s2tvPivot   = s2.tv.reduce((b, p) =>
        (Math.abs(p.y - s2tvBottomY) < 0.5 && p.x < b.x) ? p : b,
        { x: Infinity, y: s2tvBottomY }
    );

    // Rotate Stage-2 TV polygon about s2tvPivot by α (clockwise in canvas coords)
    const alphaRad = degreesToRadians(alpha);
    const s3tv = s2.tv.map(p => {
        const rotated = rotatePoint(p.x, p.y, s2tvPivot.x, s2tvPivot.y, alphaRad);
        return { ...rotated, label: p.label };
    });

    // Stage-2 FV y-levels per label (horizontal loci)
    const s2FVByLabel = {};
    for (const fp of s2.fv) s2FVByLabel[fp.label.replace("'","")] = fp.y;

    // Final FV: from each Stage-3 TV vertex project up to Stage-2 locus y
    const s3fv = s3tv.map(p => {
        const baseLabel = p.label.replace("'","");
        const fvY = s2FVByLabel[baseLabel] !== undefined ? s2FVByLabel[baseLabel] : xyY;
        return { x: p.x, y: fvY, label: p.label + "'" };
    });

    return {
        xyY, theta, alpha,
        s1TV, xPivot,
        s2, pivotFV, tipFV,
        s2tvPivot,
        s3tv, s3fv,
        s2FVByLabel
    };
}

// ========================================
// Steps
// ========================================
function _p6Step1(geo) {
    updateInstructions(
        'Step 1 — Draw XY Reference Line',
        'Start with the XY ground line. Case P6 is the most general (oblique) plane case. ' +
        'The plane is inclined at \u03B8 = ' + geo.theta + '\u00B0 to HP AND its specified edge ' +
        'makes \u03B1 = ' + geo.alpha + '\u00B0 to VP. ' +
        'We use a THREE-STAGE Change-of-Position method. ' +
        'Stage 1: assume \u2225 HP. Stage 2: tilt to \u03B8. Stage 3: rotate plan to \u03B1.'
    );
    drawXYLine();
    _p6DrawRegionLabels();
}

function _p6Step2(geo) {
    updateInstructions(
        'Step 2 — Stage 1: TV True Shape (Temporary)',
        'Assume the plane is temporarily parallel to HP. ' +
        'The TV shows the TRUE SHAPE of the ' + _p6ShapeLabel() + ' (like P2 Stage-1). ' +
        'Draw it dashed below XY. This is the starting position — not the final answer.'
    );
    drawXYLine();
    _p6DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    _p6TempLabel('Stage 1 — True Shape (temp)', canvas.width/2, config.xyLineY + _p6TVDepth(geo) + 22);
}

function _p6Step3(geo) {
    updateInstructions(
        'Step 3 — Stage 1: FV Edge View on XY (Temporary)',
        'In Stage 1, the FV is a horizontal EDGE VIEW on the XY line (like P2/P4 Stage-1). ' +
        'Draw it dashed. The LEFT end is the pivot for Stage-2 tilt. ' +
        'Stage-2 will tilt this edge upward to angle \u03B8 = ' + geo.theta + '\u00B0.'
    );
    drawXYLine();
    _p6DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    drawLine(geo.xPivot, geo.xyY, getShapeXExtent(geo.s1TV).right, geo.xyY, 'temp');
    _p6DrawPivot(geo.pivotFV, 'Stage-2 Pivot');
    _p6TempLabel('Stage 1 — TV true shape (temp)', canvas.width/2, config.xyLineY + _p6TVDepth(geo) + 22);
    _p6TempLabel('Stage 1 — FV edge on XY (temp)', canvas.width/2, geo.xyY - 22);
}

function _p6Step4(geo) {
    updateInstructions(
        'Step 4 — Stage 2: Tilt FV Edge to \u03B8 = ' + geo.theta + '\u00B0',
        'Rotate the Stage-1 FV edge about the pivot (left end on XY) upward at angle \u03B8 = ' +
        geo.theta + '\u00B0. This is the Stage-2 FV — an inclined edge view of the tilted plane. ' +
        'The pivot point stays fixed at XY. The tilted FV will be used to derive the Stage-2 TV ' +
        'and then the final Stage-3 loci.'
    );
    drawXYLine();
    _p6DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    drawLine(geo.xPivot, geo.xyY, getShapeXExtent(geo.s1TV).right, geo.xyY, 'temp');
    _p6DrawPivot(geo.pivotFV, 'Stage-2 Pivot');
    // Stage-2 FV: tilted edge (solid)
    drawLine(geo.pivotFV.x, geo.pivotFV.y, geo.tipFV.x, geo.tipFV.y, 'visible');
    drawAngleArc(geo.pivotFV.x, geo.pivotFV.y, 28, 180, 180 + geo.theta, '\u03B8=' + geo.theta + '\u00B0');
    ctx.save();
    ctx.fillStyle = config.annotationColor; ctx.font = `bold ${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center';
    ctx.fillText('Stage-2 FV (edge at \u03B8)', (geo.pivotFV.x + geo.tipFV.x)/2, geo.tipFV.y - 14);
    ctx.restore();
}

function _p6Step5(geo) {
    updateInstructions(
        'Step 5 — Stage 2: Compute Intermediate (Foreshortened) TV',
        'From each point on the Stage-2 tilted FV edge, drop vertical projectors. ' +
        'Intersect with horizontal loci from Stage-1 TV vertices to find the Stage-2 TV. ' +
        'This intermediate TV is a foreshortened shape (dashed). ' +
        'In Stage 3, we will rotate THIS intermediate TV so its bottom edge makes \u03B1 = ' +
        geo.alpha + '\u00B0 with XY.'
    );
    drawXYLine();
    _p6DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    drawLine(geo.xPivot, geo.xyY, getShapeXExtent(geo.s1TV).right, geo.xyY, 'temp');
    drawLine(geo.pivotFV.x, geo.pivotFV.y, geo.tipFV.x, geo.tipFV.y, 'visible');
    drawAngleArc(geo.pivotFV.x, geo.pivotFV.y, 28, 180, 180 + geo.theta, '\u03B8=' + geo.theta + '\u00B0');
    // Projectors Stage-2 FV → Stage-2 TV
    for (const fp of geo.s2.fv) {
        const tp = geo.s2.tv.find(t => Math.abs(t.x - fp.x) < 0.5);
        if (tp) drawProjector(fp.x, fp.y, tp.x, tp.y);
    }
    // Stage-2 (intermediate) TV (dashed)
    drawPointSet(geo.s2.tv, 'temp');
    _p6TempLabel('Stage-2 TV (intermediate, temp)', canvas.width/2, config.xyLineY + _p6MaxTVY(geo) + 24);
}

function _p6Step6(geo) {
    updateInstructions(
        'Step 6 — Draw Horizontal Loci from Stage-2 FV Points',
        'From each point on the Stage-2 FV (tilted edge), draw a horizontal locus line to the right. ' +
        'These loci carry height information: in the final FV, each vertex must lie at the SAME ' +
        'height as its corresponding Stage-2 FV point. The intersection of vertical projectors ' +
        'from the Stage-3 (final) TV with these loci gives the final FV vertices.'
    );
    drawXYLine();
    _p6DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    drawLine(geo.pivotFV.x, geo.pivotFV.y, geo.tipFV.x, geo.tipFV.y, 'visible');
    drawAngleArc(geo.pivotFV.x, geo.pivotFV.y, 28, 180, 180 + geo.theta, '\u03B8=' + geo.theta + '\u00B0');
    drawPointSet(geo.s2.tv, 'temp');
    // Loci from Stage-2 FV extending right
    const lociEndX = Math.max(...geo.s2.fv.map(p=>p.x), ...geo.s3tv.map(p=>p.x)) + 30;
    const seenY = new Set();
    for (const fp of geo.s2.fv) {
        const yKey = Math.round(fp.y);
        if (!seenY.has(yKey)) {
            seenY.add(yKey);
            drawProjector(fp.x, fp.y, lociEndX, fp.y);
        }
    }
}

function _p6Step7(geo) {
    updateInstructions(
        'Step 7 — Stage 3: Rotate Intermediate TV so Edge Makes \u03B1 = ' + geo.alpha + '\u00B0 to XY (Final TV)',
        'Rotate the Stage-2 intermediate TV about the pivot (bottom-left corner) by angle \u03B1 = ' +
        geo.alpha + '\u00B0. This makes the specified bottom edge incline at \u03B1 to the XY line. ' +
        'The result is the FINAL TOP VIEW (solid). Each vertex of this rotated TV will be ' +
        'projected upward in Step 8 to find the final FV.'
    );
    drawXYLine();
    _p6DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    drawLine(geo.pivotFV.x, geo.pivotFV.y, geo.tipFV.x, geo.tipFV.y, 'visible');
    drawAngleArc(geo.pivotFV.x, geo.pivotFV.y, 28, 180, 180 + geo.theta, '\u03B8=' + geo.theta + '\u00B0');
    drawPointSet(geo.s2.tv, 'temp');
    const lociEndX = Math.max(...geo.s2.fv.map(p=>p.x), ...geo.s3tv.map(p=>p.x)) + 30;
    const seenY = new Set();
    for (const fp of geo.s2.fv) {
        const yKey = Math.round(fp.y);
        if (!seenY.has(yKey)) { seenY.add(yKey); drawProjector(fp.x, fp.y, lociEndX, fp.y); }
    }
    // Stage-3 pivot marker
    _p6DrawPivot(geo.s2tvPivot, '\u03B1 Pivot');
    // Final TV (Stage-3)
    drawPointSet(geo.s3tv, 'visible');
    // α angle arc at pivot
    drawAngleArc(geo.s2tvPivot.x, geo.s2tvPivot.y, 24, 0, geo.alpha, '\u03B1=' + geo.alpha + '\u00B0');
    ctx.save();
    ctx.fillStyle = config.annotationColor; ctx.font = `bold ${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center';
    const tvCx = geo.s3tv.reduce((s,p) => s + p.x, 0) / geo.s3tv.length;
    const tvCy = geo.s3tv.reduce((s,p) => s + p.y, 0) / geo.s3tv.length;
    ctx.fillText('FINAL TV (\u03B1=' + geo.alpha + '\u00B0)', tvCx, tvCy + 20);
    ctx.restore();
}

function _p6Step8(geo) {
    updateInstructions(
        'Step 8 — Draw Projectors from Final TV up to Stage-2 Loci',
        'From each vertex of the FINAL TV (Stage 3), draw a vertical projector UPWARD. ' +
        'Each projector will intersect the corresponding horizontal locus from Stage-2 FV. ' +
        'These intersection points are the vertices of the FINAL FV. ' +
        'This step applies the loci method to find the oblique FV in one go.'
    );
    drawXYLine();
    _p6DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    drawLine(geo.pivotFV.x, geo.pivotFV.y, geo.tipFV.x, geo.tipFV.y, 'visible');
    drawAngleArc(geo.pivotFV.x, geo.pivotFV.y, 28, 180, 180 + geo.theta, '\u03B8=' + geo.theta + '\u00B0');
    drawPointSet(geo.s2.tv, 'temp');
    // Loci
    const lociEndX = Math.max(...geo.s2.fv.map(p=>p.x), ...geo.s3tv.map(p=>p.x)) + 30;
    const seenY = new Set();
    for (const fp of geo.s2.fv) {
        const yKey = Math.round(fp.y);
        if (!seenY.has(yKey)) { seenY.add(yKey); drawProjector(fp.x, fp.y, lociEndX, fp.y); }
    }
    drawPointSet(geo.s3tv, 'visible');
    drawAngleArc(geo.s2tvPivot.x, geo.s2tvPivot.y, 24, 0, geo.alpha, '\u03B1=' + geo.alpha + '\u00B0');
    // Projectors from Stage-3 TV up to Stage-3 FV
    for (let i = 0; i < geo.s3tv.length; i++) {
        drawProjector(geo.s3tv[i].x, geo.s3tv[i].y, geo.s3fv[i].x, geo.s3fv[i].y);
    }
}

function _p6Step9(geo) {
    updateInstructions(
        'Step 9 — Draw Final FV (Solid)',
        'Connect the intersection points from Step 8 to form the FINAL FRONT VIEW. ' +
        'This is the oblique FV of the plane — foreshortened in both x and y due to the ' +
        'combined effect of \u03B8 (tilt to HP) and \u03B1 (rotation to VP). ' +
        'Draw it as solid visible lines. Visible/hidden edges are identified by depth.'
    );
    drawXYLine();
    _p6DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    drawLine(geo.pivotFV.x, geo.pivotFV.y, geo.tipFV.x, geo.tipFV.y, 'visible');
    drawAngleArc(geo.pivotFV.x, geo.pivotFV.y, 28, 180, 180 + geo.theta, '\u03B8=' + geo.theta + '\u00B0');
    drawPointSet(geo.s2.tv, 'temp');
    const lociEndX = Math.max(...geo.s2.fv.map(p=>p.x), ...geo.s3tv.map(p=>p.x)) + 30;
    const seenY = new Set();
    for (const fp of geo.s2.fv) {
        const yKey = Math.round(fp.y);
        if (!seenY.has(yKey)) { seenY.add(yKey); drawProjector(fp.x, fp.y, lociEndX, fp.y); }
    }
    drawPointSet(geo.s3tv, 'visible');
    drawAngleArc(geo.s2tvPivot.x, geo.s2tvPivot.y, 24, 0, geo.alpha, '\u03B1=' + geo.alpha + '\u00B0');
    for (let i = 0; i < geo.s3tv.length; i++) drawProjector(geo.s3tv[i].x, geo.s3tv[i].y, geo.s3fv[i].x, geo.s3fv[i].y);
    // Final FV (solid)
    drawPointSet(geo.s3fv, 'visible');
    ctx.save();
    ctx.fillStyle = config.annotationColor; ctx.font = `bold ${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center';
    const fvCx = geo.s3fv.reduce((s,p) => s + p.x, 0) / geo.s3fv.length;
    const fvCy = geo.s3fv.reduce((s,p) => s + p.y, 0) / geo.s3fv.length;
    ctx.fillText('FINAL FV (oblique)', fvCx, fvCy - 14);
    ctx.restore();
}

function _p6Step10(geo) {
    updateInstructions(
        'Step 10 — Label All Views and Finalise',
        'Add labels: Stage-1 TV (temp, unprimed), Stage-2 FV (tilted edge, primed), ' +
        'Stage-2 TV (intermediate, temp), FINAL TV (Stage-3, unprimed), FINAL FV (Stage-3, primed). ' +
        '\u03B8 = ' + geo.theta + '\u00B0 to HP is shown at the Stage-2 FV pivot; ' +
        '\u03B1 = ' + geo.alpha + '\u00B0 to VP is shown at the Stage-3 TV pivot. ' +
        'The three-stage construction gives the oblique plane projections in First Angle.'
    );
    drawXYLine();
    _p6DrawRegionLabels();
    drawTVShape(geo.s1TV, 'temp');
    drawLine(geo.pivotFV.x, geo.pivotFV.y, geo.tipFV.x, geo.tipFV.y, 'visible');
    drawAngleArc(geo.pivotFV.x, geo.pivotFV.y, 28, 180, 180 + geo.theta, '\u03B8=' + geo.theta + '\u00B0');
    drawPointSet(geo.s2.tv, 'temp');
    const lociEndX = Math.max(...geo.s2.fv.map(p=>p.x), ...geo.s3tv.map(p=>p.x)) + 30;
    const seenY = new Set();
    for (const fp of geo.s2.fv) {
        const yKey = Math.round(fp.y);
        if (!seenY.has(yKey)) { seenY.add(yKey); drawProjector(fp.x, fp.y, lociEndX, fp.y); }
    }
    drawPointSet(geo.s3tv, 'visible');
    drawAngleArc(geo.s2tvPivot.x, geo.s2tvPivot.y, 24, 0, geo.alpha, '\u03B1=' + geo.alpha + '\u00B0');
    for (let i = 0; i < geo.s3tv.length; i++) drawProjector(geo.s3tv[i].x, geo.s3tv[i].y, geo.s3fv[i].x, geo.s3fv[i].y);
    drawPointSet(geo.s3fv, 'visible');
    // Labels
    labelPointSet(geo.s3tv, 5, 14);
    labelPointSet(geo.s3fv, 5, -6);
    // Stage-2 FV edge labels
    const seen = new Set();
    for (const fp of geo.s2.fv) {
        const key = Math.round(fp.x) + '_' + Math.round(fp.y);
        if (!seen.has(key)) { seen.add(key); drawLabel(fp.label, fp.x, fp.y, 5, -6); }
    }
    // Final annotations
    ctx.save();
    ctx.fillStyle = config.annotationColor; ctx.font = `bold ${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center';
    const tvCx = geo.s3tv.reduce((s,p) => s + p.x, 0) / geo.s3tv.length;
    const tvCy = geo.s3tv.reduce((s,p) => s + p.y, 0) / geo.s3tv.length;
    const fvCx = geo.s3fv.reduce((s,p) => s + p.x, 0) / geo.s3fv.length;
    const fvCy = geo.s3fv.reduce((s,p) => s + p.y, 0) / geo.s3fv.length;
    ctx.fillText('FINAL TV (\u03B1=' + geo.alpha + '\u00B0 to VP)', tvCx, tvCy + 24);
    ctx.fillText('FINAL FV (oblique)', fvCx, fvCy - 14);
    ctx.restore();
}

// ---- private helpers ----

function _p6DrawRegionLabels() {
    ctx.save();
    ctx.fillStyle = '#cbd5e1'; ctx.font = `13px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'right';
    const ex = config.xyLineStartX + config.xyLineLength;
    ctx.fillText('FV \u2191', ex - 4, config.xyLineY - 8);
    ctx.fillText('TV \u2193', ex - 4, config.xyLineY + 18);
    ctx.restore();
}

function _p6DrawPivot(pt, label) {
    ctx.save();
    ctx.fillStyle = config.annotationColor;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, 2*Math.PI); ctx.fill();
    ctx.font = `${config.labelFontSize - 1}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillText(label, pt.x + 6, pt.y - 8);
    ctx.restore();
}

function _p6TempLabel(text, x, y) {
    ctx.save();
    ctx.fillStyle = config.tempColor; ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
    ctx.restore();
}

function _p6TVDepth(geo) {
    const ext = getShapeYExtent(geo.s1TV);
    return ext.bottom - config.xyLineY;
}

function _p6TVWidth(geo) {
    const ext = getShapeXExtent(geo.s1TV);
    return ext.right - ext.left;
}

function _p6MaxTVY(geo) {
    return Math.max(...geo.s2.tv.map(p => p.y)) - config.xyLineY;
}

function _p6ShapeLabel() {
    const m = { square:'Square', rectangle:'Rectangle', triangle:'Equilateral Triangle',
                circle:'Circle', pentagon:'Regular Pentagon', hexagon:'Regular Hexagon', semicircle:'Semicircle' };
    return m[state.shapeType] || state.shapeType;
}
