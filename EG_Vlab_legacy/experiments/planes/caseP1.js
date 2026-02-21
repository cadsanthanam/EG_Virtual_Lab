// ========================================
// Case P1 — Plane ⊥ HP, ∥ VP
// caseP1.js  (load after planes-core.js)
//
// THEORY:
//   Plane ⊥ HP and ∥ VP → FV (Front View) shows TRUE SHAPE.
//                        → TV (Top View)  shows EDGE VIEW (line ∥ XY).
//
// RESTING OPTIONS (state.restingOn):
//   'side'   — one EDGE (AB) lies on the XY line.  Standard position.
//   'corner' — one CORNER (A) touches XY; adjacent side AB makes angle
//              α = state.alphaEdge with HP (XY).  Shape is ROTATED in FV.
//
// In both cases the TV is always a horizontal edge view ∥ XY at tvY.
// The x-span of the TV edge equals the x-span of the (possibly rotated) FV.
//
// STEP MAP (5 steps):
//   Step 1  XY reference line.
//   Step 2  FV TRUE SHAPE (above XY, resting on side or corner).
//   Step 3  Vertical projectors from every FV vertex down through XY → TV.
//   Step 4  TV EDGE VIEW — horizontal line connecting projected points.
//   Step 5  Full labels, annotations, optional angle arc for corner mode.
// ========================================

const P1_TV_GAP = 40;   // px below XY where TV edge view is drawn

// ---- Main dispatcher ----
function drawCaseP1Step(step) {
    const geo = _p1BuildGeometry();
    switch (step) {
        case 1: _p1Step1(geo); break;
        case 2: _p1Step2(geo); break;
        case 3: _p1Step3(geo); break;
        case 4: _p1Step4(geo); break;
        case 5: _p1Step5(geo); break;
        default: updateInstructions('Case P1', 'Unknown step.');
    }
}

// ---- Geometry builder ----
function _p1BuildGeometry() {
    const onCorner = (state.restingOn === 'corner' &&
        state.shapeType !== 'circle' &&
        state.shapeType !== 'semicircle');

    const fvShape = onCorner
        ? buildFVShapeOnCorner(state.alphaEdge)
        : buildFVShape(true);

    const { left, right } = getShapeXExtent(fvShape);
    const tvY = config.xyLineY + P1_TV_GAP;

    // TV projected points: one per FV vertex/keypoint at the same x, at tvY
    const srcPts = fvShape.type === 'polygon' ? fvShape.vertices : fvShape.keyPoints;
    const tvPoints = srcPts.map(v => ({
        x: v.x,
        y: tvY,
        label: v.label.replace("'", '')   // unprimed
    }));

    // Resting corner x (for angle-arc annotation in step 5)
    const cornerX = onCorner ? srcPts[0].x : null;
    const cornerY = onCorner ? srcPts[0].y : null;

    return { fvShape, tvY, tvLeft: left, tvRight: right, tvPoints, onCorner, cornerX, cornerY };
}

// ---- Steps ----
function _p1Step1(geo) {
    updateInstructions(
        'Step 1 — Draw the XY Reference Line',
        'The XY line is the intersection of the Horizontal Plane (HP) and the Vertical Plane (VP). ' +
        'In First Angle Projection, the Front View (FV) is drawn ABOVE XY and the ' +
        'Top View (TV) is drawn BELOW it. Always draw this line first.'
    );
    drawXYLine();
    _p1DrawRegionLabels();
}

function _p1Step2(geo) {
    const modeNote = geo.onCorner
        ? `Corner A rests on XY; side AB makes α = ${state.alphaEdge}° with HP. ` +
        'The shape is rotated so the resting corner is at XY level. '
        : 'Edge AB rests on the XY line. ';

    updateInstructions(
        'Step 2 — Draw the True Shape in Front View (FV)',
        'Because the plane is PARALLEL to VP, it appears in its TRUE SHAPE in the FV. ' +
        modeNote +
        'All edges are solid visible lines. This is the key result of P1: the FV always shows true size and shape.'
    );
    drawXYLine();
    _p1DrawRegionLabels();
    drawFVShape(geo.fvShape, 'visible');
    labelFVVertices(geo.fvShape);
    const cx = canvas.width / 2;
    const fvH = _p1FVHeight(geo.fvShape);
    drawAnnotation('TRUE SHAPE (FV)', cx, config.xyLineY - fvH - 14);
}

function _p1Step3(geo) {
    updateInstructions(
        'Step 3 — Draw Projection Lines (Projectors)',
        'From EVERY corner of the FV true shape draw thin vertical construction lines ' +
        'straight DOWN through XY into the TV region. Because the plane is ⊥ HP, ' +
        'ALL points project onto the SAME horizontal line in the TV.'
    );
    drawXYLine();
    _p1DrawRegionLabels();
    drawFVShape(geo.fvShape, 'visible');
    labelFVVertices(geo.fvShape);
    drawProjectorsToY(geo.fvShape, geo.tvY);
    _p1MarkXYCrossings(geo);
    const cx = canvas.width / 2;
    drawAnnotation('TRUE SHAPE (FV)', cx, config.xyLineY - _p1FVHeight(geo.fvShape) - 14);
}

function _p1Step4(geo) {
    updateInstructions(
        'Step 4 — Draw the Edge View in Top View (TV)',
        'Because the plane is PERPENDICULAR to HP it appears as a single straight EDGE VIEW ' +
        'in the Top View — a horizontal line PARALLEL to XY. ' +
        'Draw it at the TV level connecting the leftmost to rightmost projected points.'
    );
    drawXYLine();
    _p1DrawRegionLabels();
    drawFVShape(geo.fvShape, 'visible');
    labelFVVertices(geo.fvShape);
    drawProjectorsToY(geo.fvShape, geo.tvY);
    _p1MarkXYCrossings(geo);
    // TV edge view line
    drawLine(geo.tvLeft, geo.tvY, geo.tvRight, geo.tvY, 'visible');
    // Mark projected points
    for (const tp of geo.tvPoints) {
        ctx.save();
        ctx.fillStyle = config.labelColor;
        ctx.beginPath(); ctx.arc(tp.x, tp.y, 2, 0, 2 * Math.PI); ctx.fill();
        ctx.restore();
    }
    const cx = canvas.width / 2;
    drawAnnotation('TRUE SHAPE (FV)', cx, config.xyLineY - _p1FVHeight(geo.fvShape) - 14);
    drawAnnotation('EDGE VIEW (TV)', cx, geo.tvY + 28);
}

function _p1Step5(geo) {
    updateInstructions(
        'Step 5 — Label Views and Finalise',
        'FV (True Shape) labels: primed notation a′, b′, c′… ' +
        'TV (Edge View) labels: unprimed a, b, c…  ' +
        'All TV labels coincide on the edge-view line at their respective x-positions. ' +
        (geo.onCorner ? `Angle α = ${state.alphaEdge}° is shown at the resting corner. ` : '') +
        'Final: FV = TRUE SHAPE ∥ VP; TV = EDGE VIEW ∥ XY.'
    );
    drawXYLine();
    _p1DrawRegionLabels();

    drawFVShape(geo.fvShape, 'visible');
    labelFVVertices(geo.fvShape);

    drawProjectorsToY(geo.fvShape, geo.tvY);

    drawLine(geo.tvLeft, geo.tvY, geo.tvRight, geo.tvY, 'visible');
    labelTVEdgeView(geo.fvShape, geo.tvY);

    // Parallel-to-XY tick on TV line
    _p1DrawParallelIndicator(geo);

    // Angle arc at resting corner for corner mode: arc from XY rightward up to side AB direction
    if (geo.onCorner && geo.cornerX !== null) {
        drawAngleArc(geo.cornerX, geo.cornerY, 28, -state.alphaEdge, 0,
            '\u03b1=' + state.alphaEdge + '\u00b0');
    }

    const cx = canvas.width / 2;
    const xyY = config.xyLineY;
    const fvH = _p1FVHeight(geo.fvShape);
    drawAnnotation('TRUE SHAPE (FV)', cx, xyY - fvH - 14);
    drawAnnotation('EDGE VIEW (TV)', cx, geo.tvY + 30);

    // Condition label
    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.font = `italic ${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(
        _p1ShapeLabel() + '  ∥ VP  |  ⊥ HP' +
        (geo.onCorner ? `  (α=${state.alphaEdge}° at corner)` : '  (side on XY)'),
        config.xyLineStartX + 4, xyY - 6
    );
    ctx.restore();
}

// ---- Helpers ----
function _p1DrawRegionLabels() {
    ctx.save();
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `13px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'right';
    const ex = config.xyLineStartX + config.xyLineLength;
    ctx.fillText('FV ↑', ex - 4, config.xyLineY - 8);
    ctx.fillText('TV ↓', ex - 4, config.xyLineY + 18);
    ctx.restore();
}

function _p1MarkXYCrossings(geo) {
    const xyY = config.xyLineY;
    const xs = (geo.fvShape.type === 'polygon')
        ? geo.fvShape.vertices.map(v => v.x)
        : geo.fvShape.keyPoints.map(kp => kp.x);
    ctx.save();
    ctx.strokeStyle = config.constructionColor;
    ctx.lineWidth = config.constructionLineWidth;
    for (const x of xs) {
        ctx.beginPath(); ctx.moveTo(x - 3, xyY); ctx.lineTo(x + 3, xyY); ctx.stroke();
    }
    ctx.restore();
}

function _p1DrawParallelIndicator(geo) {
    const y = geo.tvY;
    const mid = (geo.tvLeft + geo.tvRight) / 2;
    ctx.save();
    ctx.strokeStyle = config.annotationColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    for (const offset of [-4, 4]) {
        ctx.beginPath(); ctx.moveTo(mid - 10, y + offset); ctx.lineTo(mid + 10, y + offset); ctx.stroke();
    }
    ctx.restore();
}

function _p1FVHeight(shape) {
    if (shape.type === 'circle') return shape.radius * 2;
    if (shape.type === 'semicircle') return shape.radius;
    const { top } = getShapeYExtent(shape);
    return config.xyLineY - top;
}

function _p1ShapeLabel() {
    const m = {
        square: 'Square', rectangle: 'Rectangle', triangle: 'Equilateral Triangle',
        circle: 'Circle', pentagon: 'Regular Pentagon', hexagon: 'Regular Hexagon', semicircle: 'Semicircle'
    };
    return m[state.shapeType] || state.shapeType;
}
