// ========================================
// Case P2 — Plane ⊥ VP, ∥ HP
// caseP2.js  (load after planes-core.js)
//
// THEORY:
//   Plane ⊥ VP and ∥ HP → TV (Top View)  shows TRUE SHAPE.
//                        → FV (Front View) shows EDGE VIEW on XY.
//
// ANGLE INPUT (state.betaEdge):
//   β = angle one side (AB) of the plane makes with VP.
//   β = 0  → side AB is PARALLEL to VP  → AB appears horizontal in TV (∥ XY).
//   β > 0  → side AB makes angle β with XY in TV (shape is rotated in plan).
//
// TV POSITION:
//   The TV true shape is drawn BELOW XY with a gap P2_TV_GAP, not touching XY.
//   The plane rests ON HP; corner A of the shape is nearest to VP (top-left of TV).
//
// FV EDGE VIEW:
//   A horizontal line exactly ON XY, spanning the x-extent of the TV shape.
//   (Plane ⊥ VP → seen from front, it collapses to a line.)
//
// STEP MAP (5 steps):
//   Step 1  XY reference line.
//   Step 2  TV TRUE SHAPE (below XY, with gap, rotated by β).
//   Step 3  Vertical projectors from TV vertices upward to XY.
//   Step 4  FV EDGE VIEW — horizontal line on XY.
//   Step 5  Full labels and annotations.
// ========================================

const P2_TV_GAP = 35;   // px gap between XY and the nearest point of the TV shape

// ---- Main dispatcher ----
function drawCaseP2Step(step) {
    const geo = _p2BuildGeometry();
    switch (step) {
        case 1: _p2Step1(geo); break;
        case 2: _p2Step2(geo); break;
        case 3: _p2Step3(geo); break;
        case 4: _p2Step4(geo); break;
        case 5: _p2Step5(geo); break;
        default: updateInstructions('Case P2', 'Unknown step.');
    }
}

// ---- Geometry builder ----
function _p2BuildGeometry() {
    // TV shape: rotated by betaEdge, placed below XY with P2_TV_GAP
    const tvShape = buildTVShapeRotated(state.betaEdge, P2_TV_GAP);

    const { left: fvLeft, right: fvRight } = getShapeXExtent(tvShape);
    const fvEdgeY = config.xyLineY;  // FV edge view is ON XY

    // FV projected points: each TV vertex projected up to XY (vertical projection)
    const srcPts = tvShape.type === 'polygon' ? tvShape.vertices : tvShape.keyPoints;
    const fvPoints = srcPts.map(v => ({
        x: v.x,
        y: fvEdgeY,
        label: v.label + "'"   // primed for FV
    }));

    return { tvShape, fvEdgeY, fvLeft, fvRight, fvPoints };
}

// ---- Steps ----
function _p2Step1(geo) {
    updateInstructions(
        'Step 1 — Draw the XY Reference Line',
        'The XY line is the Ground Line — intersection of HP and VP. ' +
        'In First Angle Projection FV is ABOVE XY and TV is BELOW. ' +
        'Always draw this line first. The TV true shape will appear below XY ' +
        'at a distance; the FV edge view will rest on XY.'
    );
    drawXYLine();
    _p2DrawRegionLabels();
}

function _p2Step2(geo) {
    const betaNote = state.betaEdge > 0
        ? `Side AB makes β = ${state.betaEdge}° with VP (rotated from horizontal by β in the plan view). `
        : 'Side AB is PARALLEL to VP (β = 0°, horizontal in TV). ';

    updateInstructions(
        'Step 2 — Draw the True Shape in Top View (TV)',
        'Because the plane is PARALLEL to HP it appears in its TRUE SHAPE in the TV. ' +
        betaNote +
        'The shape is drawn below XY with a gap (the plane is at some distance from VP). ' +
        'Corner A is the vertex nearest to VP.'
    );
    drawXYLine();
    _p2DrawRegionLabels();
    drawTVShape(geo.tvShape, 'visible');
    labelTVVertices(geo.tvShape);
    const tvDepth = _p2TVCenter(geo.tvShape);
    drawAnnotation('TRUE SHAPE (TV)', canvas.width / 2, tvDepth + 20);
    if (state.betaEdge > 0) {
        // Draw beta angle arc at corner A
        const pts = geo.tvShape.type === 'polygon' ? geo.tvShape.vertices : geo.tvShape.keyPoints;
        if (pts.length) {
            drawAngleArc(pts[0].x, pts[0].y, 26, 0, state.betaEdge, 'β=' + state.betaEdge + '°');
        }
    }
}

function _p2Step3(geo) {
    updateInstructions(
        'Step 3 — Draw Projection Lines (Projectors)',
        'From every corner of the TV true shape draw thin vertical construction lines ' +
        'UPWARD through XY into the FV region. Because the plane is ⊥ VP, ALL points ' +
        'of the plane project onto the SAME horizontal line on XY in the FV.'
    );
    drawXYLine();
    _p2DrawRegionLabels();
    drawTVShape(geo.tvShape, 'visible');
    labelTVVertices(geo.tvShape);
    // Projectors from TV up to slightly above XY
    const fvAboveY = config.xyLineY - 30;
    drawProjectorsToY(geo.tvShape, fvAboveY);
    const tvD = _p2TVCenter(geo.tvShape);
    drawAnnotation('TRUE SHAPE (TV)', canvas.width / 2, tvD + 20);
}

function _p2Step4(geo) {
    updateInstructions(
        'Step 4 — Draw the Edge View in Front View (FV)',
        'Because the plane is PERPENDICULAR to VP it appears as a single straight ' +
        'EDGE VIEW in the Front View. This line lies exactly ON the XY reference line, ' +
        'spanning from the leftmost to rightmost projected point. ' +
        'All points of the plane collapse onto this edge line.'
    );
    drawXYLine();
    _p2DrawRegionLabels();
    drawTVShape(geo.tvShape, 'visible');
    labelTVVertices(geo.tvShape);
    drawProjectorsToY(geo.tvShape, config.xyLineY - 30);
    // FV edge view ON XY
    drawLine(geo.fvLeft, geo.fvEdgeY, geo.fvRight, geo.fvEdgeY, 'visible');
    // Mark projected points on FV edge
    for (const fp of geo.fvPoints) {
        ctx.save();
        ctx.fillStyle = config.labelColor;
        ctx.beginPath(); ctx.arc(fp.x, fp.y, 2, 0, 2 * Math.PI); ctx.fill();
        ctx.restore();
    }
    const tvD = _p2TVCenter(geo.tvShape);
    drawAnnotation('TRUE SHAPE (TV)', canvas.width / 2, tvD + 20);
    drawAnnotation('EDGE VIEW (FV) — on XY', canvas.width / 2, geo.fvEdgeY - 16);
}

function _p2Step5(geo) {
    updateInstructions(
        'Step 5 — Label Views and Finalise',
        'TV (True Shape) labels: unprimed a, b, c… ' +
        'FV (Edge View on XY) labels: primed a′, b′… coincident on XY. ' +
        (state.betaEdge > 0 ? `Side AB makes β = ${state.betaEdge}° with VP. ` : '') +
        'Final drawing: TV = TRUE SHAPE below XY; FV = EDGE VIEW on XY.'
    );
    drawXYLine();
    _p2DrawRegionLabels();

    // TV true shape + labels
    drawTVShape(geo.tvShape, 'visible');
    labelTVVertices(geo.tvShape);

    // Projectors (faint construction)
    drawProjectorsToY(geo.tvShape, config.xyLineY - 30);

    // FV edge view + primed labels
    drawLine(geo.fvLeft, geo.fvEdgeY, geo.fvRight, geo.fvEdgeY, 'visible');
    _p2LabelFVEdge(geo);

    // Beta angle arc on TV
    if (state.betaEdge > 0) {
        const pts = geo.tvShape.type === 'polygon' ? geo.tvShape.vertices : geo.tvShape.keyPoints;
        if (pts.length) {
            drawAngleArc(pts[0].x, pts[0].y, 26, 0, state.betaEdge, 'β=' + state.betaEdge + '°');
        }
    }

    // Annotations
    const tvD = _p2TVCenter(geo.tvShape);
    drawAnnotation('TRUE SHAPE (TV)', canvas.width / 2, tvD + 20);
    drawAnnotation('EDGE VIEW (FV)', canvas.width / 2, geo.fvEdgeY - 18);

    // Condition note
    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.font = `italic ${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(
        _p2ShapeLabel() + '  ∥ HP  |  ⊥ VP' +
        (state.betaEdge > 0 ? `  (β=${state.betaEdge}° to VP)` : '  (side AB ∥ VP)'),
        config.xyLineStartX + 4, config.xyLineY + 14
    );
    ctx.restore();
}

// ---- Helpers ----
function _p2DrawRegionLabels() {
    ctx.save();
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `13px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'right';
    const ex = config.xyLineStartX + config.xyLineLength;
    ctx.fillText('FV ↑', ex - 4, config.xyLineY - 8);
    ctx.fillText('TV ↓', ex - 4, config.xyLineY + 18);
    ctx.restore();
}

function _p2LabelFVEdge(geo) {
    ctx.save();
    ctx.fillStyle = config.labelColor;
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    // Group primed labels by x-position (multiple vertices can share same x after rotation)
    const byX = {};
    for (const fp of geo.fvPoints) {
        const key = Math.round(fp.x);
        if (!byX[key]) byX[key] = [];
        byX[key].push(fp.label);
    }
    for (const [key, labels] of Object.entries(byX)) {
        ctx.fillText(labels.join(','), parseInt(key) + 4, config.xyLineY - 6);
    }
    ctx.restore();
}

// Return the y-centroid of the TV shape (for annotation placement)
function _p2TVCenter(tvShape) {
    const { bottom } = getShapeYExtent(tvShape);
    return bottom;
}

function _p2ShapeLabel() {
    const m = {
        square: 'Square', rectangle: 'Rectangle', triangle: 'Equilateral Triangle',
        circle: 'Circle', pentagon: 'Regular Pentagon', hexagon: 'Regular Hexagon', semicircle: 'Semicircle'
    };
    return m[state.shapeType] || state.shapeType;
}
