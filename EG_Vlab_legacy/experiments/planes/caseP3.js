// ========================================
// Case P3 — Plane ⊥ HP and ⊥ VP  (∥ Profile Plane / PP)
// caseP3.js  (load after planes-core.js)
//
// THEORY:
//   Plane ⊥ HP and ⊥ VP → it is parallel to the Profile Plane (PP).
//   FV shows EDGE VIEW (vertical line ⊥ XY).
//   TV shows EDGE VIEW (vertical line ⊥ XY, same x as FV).
//   SV (Side View) shows TRUE SHAPE — drawn to the right of the Y–Y′ line.
//
// ORIENTATION INPUT (state.gammaEdge = γ):
//   γ = angle one side of the shape makes with HP.
//   γ = 0  → that side is HORIZONTAL in the SV (∥ HP).
//   γ > 0  → side is inclined γ° upward from horizontal in SV.
//
// PROJECTION RULES:
//   • Each SV vertex (svx, svy) has:
//       Height above HP  → FV point y = svy (same level in FV)
//       Depth from Y–Y′ → TV point y = xyY + (svx − svMinX)
//   • All FV and TV points share one vertical edge at x = fvEdgeX.
//   • FV and TV points are labeled with the SAME letter as their SV corner
//     (primed a′,b′… for FV; unprimed a,b… for TV).
//
// STEP MAP (6 steps):
//   Step 1  Draw XY and Y–Y′ reference lines.
//   Step 2  Draw TRUE SHAPE in SV (right of Y–Y′, oriented by γ).
//   Step 3  Draw horizontal projectors from SV vertices → FV region; draw FV EDGE VIEW.
//   Step 4  Draw vertical projectors from FV edge → TV region; draw TV EDGE VIEW.
//   Step 5  Label all points (FV primed, TV unprimed, SV double-primed).
//   Step 6  Annotations and finalise.
// ========================================

// ---- Main dispatcher ----
function drawCaseP3Step(step) {
    const geo = _p3BuildGeometry();
    switch (step) {
        case 1: _p3Step1(geo); break;
        case 2: _p3Step2(geo); break;
        case 3: _p3Step3(geo); break;
        case 4: _p3Step4(geo); break;
        case 5: _p3Step5(geo); break;
        case 6: _p3Step6(geo); break;
        default: updateInstructions('Case P3', 'Unknown step.');
    }
}

// ---- Geometry builder ----
function _p3BuildGeometry() {
    const xyY = config.xyLineY;
    const cx = canvas.width / 2;
    const gamma = degreesToRadians(state.gammaEdge);

    // ── Build shape in local coordinates ──
    // Convention: a at origin, base edge horizontal, shape extends UP (negative local-y)
    // and RIGHT (positive local-x).
    const localVerts = _p3LocalVerts();   // [{x,y,label}]

    // ── Apply rotation by gamma about vertex 'a' (origin) ──
    // Using _rotUp: side goes UP-RIGHT at gamma → correct for SV orientation
    const rotV = localVerts.map(v => {
        const r = _rotUp(v.x, v.y, 0, 0, gamma);
        return { ...v, x: r.x, y: r.y };
    });

    // ── Y–Y′ line position: place it to the right of canvas center ──
    // Use max shape dimension as a proxy for how wide the SV will be
    const d = state.dims;
    const maxDim = Math.max(d.side || 0, d.length || 0, d.width || 0, d.diameter || 0, 60);
    const yyX = cx + maxDim * 0.8 + 60;

    // Scale the local shape to canvas pixels (it is already in pixels from buildFVShape dims)
    // Place vertex 'a' at (yyX + 20, xyY) in canvas
    const svA_x = yyX + 20;
    const svA_y = xyY;
    // Translate so local origin → (svA_x, svA_y)
    const svVerts = rotV.map(v => ({
        x: v.x + svA_x,
        y: v.y + svA_y,
        label: v.label,
        svLabel: v.label + '\u2033',   // double-prime: a″
        fvLabel: v.label + '\u2032',   // prime:        a′
        tvLabel: v.label               // unprimed:     a
    }));

    // ── SV bounding box (for projection ranges) ──
    const svXs = svVerts.map(v => v.x);
    const svYs = svVerts.map(v => v.y);
    const svMinX = Math.min(...svXs);
    const svMaxX = Math.max(...svXs);
    const svMinY = Math.min(...svYs);
    const svMaxY = Math.max(...svYs);

    // ── FV edge view ──
    const fvEdgeX = cx - 20;   // x of FV/TV edge, in the FV region (left of center)
    const fvPoints = svVerts.map(v => ({
        x: fvEdgeX,
        y: v.y,             // same height as SV vertex
        label: v.fvLabel,
        svRef: v               // reference back to SV vertex
    }));
    const fvTop = svMinY;
    const fvBottom = svMaxY;

    // ── TV edge view ──
    // Depth of each vertex from Y–Y' reference: svx - svMinX (normalised to 0)
    const tvPoints = svVerts.map(v => ({
        x: fvEdgeX,
        y: xyY + (v.x - svMinX),   // depth folds down below XY
        label: v.tvLabel,
        svRef: v
    }));
    const tvTop = xyY;
    const tvBottom = xyY + (svMaxX - svMinX);

    return {
        xyY, cx, yyX,
        svVerts, svMinX, svMaxX, svMinY, svMaxY,
        fvEdgeX, fvPoints, fvTop, fvBottom,
        tvPoints, tvTop, tvBottom
    };
}

// Build shape vertices in local coords (a at origin, base horizontal, shape above/right)
function _p3LocalVerts() {
    const d = state.dims;
    switch (state.shapeType) {
        case 'square': {
            const s = d.side;
            return [
                { x: 0, y: 0, label: 'a' },
                { x: s, y: 0, label: 'b' },
                { x: s, y: -s, label: 'c' },
                { x: 0, y: -s, label: 'd' }
            ];
        }
        case 'rectangle': {
            const L = d.length, W = d.width;
            return [
                { x: 0, y: 0, label: 'a' },
                { x: L, y: 0, label: 'b' },
                { x: L, y: -W, label: 'c' },
                { x: 0, y: -W, label: 'd' }
            ];
        }
        case 'triangle': {
            const s = d.side;
            const h = s * Math.sqrt(3) / 2;
            return [
                { x: 0, y: 0, label: 'a' },
                { x: s, y: 0, label: 'b' },
                { x: s / 2, y: -h, label: 'c' }
            ];
        }
        case 'pentagon':
        case 'hexagon': {
            const n = state.shapeType === 'pentagon' ? 5 : 6;
            const s = d.side;
            const R = s / (2 * Math.sin(Math.PI / n));
            const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
            const verts = [];
            // Place with one flat edge at bottom (angle offset so base is horizontal)
            const startAngle = -(Math.PI / 2 + Math.PI / n);
            for (let i = 0; i < n; i++) {
                const a = startAngle + i * (2 * Math.PI / n);
                verts.push({
                    x: R + R * Math.cos(a),
                    y: R * Math.sin(a),       // will be negative for upper vertices
                    label: letters[i]
                });
            }
            // Normalise so lowest y = 0 (base on horizontal at y=0)
            const minY = Math.min(...verts.map(v => v.y));
            return verts.map(v => ({ ...v, y: v.y - minY }));
        }
        case 'circle': {
            const r = d.diameter / 2;
            // Key points: leftmost, rightmost, top, bottom
            return [
                { x: 0, y: -r, label: 'a' },  // left
                { x: r, y: 0, label: 'b' },  // bottom
                { x: 2 * r, y: -r, label: 'c' },  // right
                { x: r, y: -2 * r, label: 'd' } // top
            ];
        }
        case 'semicircle': {
            const r = d.diameter / 2;
            return [
                { x: 0, y: 0, label: 'a' },  // left end of diameter
                { x: 2 * r, y: 0, label: 'b' },  // right end of diameter
                { x: r, y: -r, label: 'c' }   // top of arc
            ];
        }
        default:
            return [{ x: 0, y: 0, label: 'a' }, { x: 60, y: 0, label: 'b' },
            { x: 60, y: -60, label: 'c' }, { x: 0, y: -60, label: 'd' }];
    }
}

// ---- Steps ----
function _p3Step1(geo) {
    updateInstructions(
        'Step 1 — Draw XY and Y\u2013Y\u2032 Reference Lines',
        'Draw the XY ground line first. Then draw a vertical Y\u2013Y\u2032 line to the right \u2014 ' +
        'this is the edge of the Profile Plane (PP). The region to the right of Y\u2013Y\u2032 ' +
        'is the Side View (SV). ' +
        'Because the plane is \u22A5 HP and \u22A5 VP, both FV and TV show EDGE VIEWS; only the SV shows TRUE SHAPE.'
    );
    drawXYLine();
    _p3DrawYYLine(geo);
    _p3DrawRegionLabels(geo);
}

function _p3Step2(geo) {
    updateInstructions(
        'Step 2 — Draw TRUE SHAPE in Side View (SV)',
        'The plane is \u2225 PP, so its TRUE SHAPE appears in the Side View. ' +
        'Draw the ' + _p3ShapeLabel() + ' to the right of the Y\u2013Y\u2032 line. ' +
        (state.gammaEdge > 0
            ? `One side is inclined at \u03B3 = ${state.gammaEdge}\u00B0 to HP (horizontal). `
            : 'One side is parallel to HP (horizontal). ') +
        'Vertex A rests closest to Y\u2013Y\u2032. ' +
        'Label each corner with double-prime notation: a\u2033, b\u2033, c\u2033\u2026'
    );
    drawXYLine();
    _p3DrawYYLine(geo);
    _p3DrawRegionLabels(geo);
    _p3DrawSVShape(geo, 'visible');
    _p3LabelSV(geo);
    if (state.gammaEdge > 0) {
        // angle arc at corner a
        const a = geo.svVerts[0];
        const b = geo.svVerts[1];
        drawAngleArc(a.x, a.y, 26, 180, 180 + state.gammaEdge, '\u03B3=' + state.gammaEdge + '\u00B0');
    }
    drawAnnotation('TRUE SHAPE (SV)', (geo.svMinX + geo.svMaxX) / 2, geo.svMinY - 16);
}

function _p3Step3(geo) {
    updateInstructions(
        'Step 3 — Project SV Heights \u2192 FV Edge View',
        'From each vertex of the SV true shape, draw a HORIZONTAL projector leftward ' +
        'to the FV region (crossing the Y\u2013Y\u2032 line). ' +
        'Because the plane is \u22A5 VP, all x-coordinates in FV collapse to ONE vertical line \u2014 ' +
        'the FV EDGE VIEW. Each SV vertex at height h maps directly to a point on the FV edge at the same h.'
    );
    drawXYLine();
    _p3DrawYYLine(geo);
    _p3DrawRegionLabels(geo);
    _p3DrawSVShape(geo, 'visible');
    _p3LabelSV(geo);
    // Horizontal projectors SV → FV
    for (const fp of geo.fvPoints) {
        drawProjector(fp.svRef.x, fp.svRef.y, fp.x, fp.y);
    }
    // FV edge view
    drawLine(geo.fvEdgeX, geo.fvTop, geo.fvEdgeX, geo.fvBottom, 'visible');
    drawAnnotation('EDGE VIEW (FV)', geo.fvEdgeX - 10, geo.fvTop - 14);
}

function _p3Step4(geo) {
    updateInstructions(
        'Step 4 — Project FV Heights \u2192 TV Edge View',
        'From the TOP and BOTTOM of the FV edge view, draw vertical projectors DOWNWARD ' +
        'through XY into the TV region. ' +
        'The TV EDGE VIEW is a vertical line at the same x, below XY. ' +
        'Its length equals the horizontal DEPTH of the SV shape (extent perpendicular to VP).'
    );
    drawXYLine();
    _p3DrawYYLine(geo);
    _p3DrawRegionLabels(geo);
    _p3DrawSVShape(geo, 'visible');
    _p3LabelSV(geo);
    for (const fp of geo.fvPoints) drawProjector(fp.svRef.x, fp.svRef.y, fp.x, fp.y);
    drawLine(geo.fvEdgeX, geo.fvTop, geo.fvEdgeX, geo.fvBottom, 'visible');
    // Depth projectors from SV to TV (horizontal → fold at Y-Y' → vertical down)
    for (const tp of geo.tvPoints) {
        // Show the depth transfer: horizontal from TV x-position up to XY then down
        drawProjector(tp.svRef.x, geo.xyY, geo.yyX, geo.xyY);            // horizontal above XY
        drawProjector(geo.fvEdgeX, geo.xyY, geo.fvEdgeX, tp.y);          // vertical down to TV point
    }
    // TV edge view
    drawLine(geo.fvEdgeX, geo.tvTop, geo.fvEdgeX, geo.tvBottom, 'visible');
    drawAnnotation('EDGE VIEW (FV)', geo.fvEdgeX - 10, geo.fvTop - 14);
    drawAnnotation('EDGE VIEW (TV)', geo.fvEdgeX + 12, (geo.tvTop + geo.tvBottom) / 2);
}

function _p3Step5(geo) {
    updateInstructions(
        'Step 5 — Label All Views',
        'Label each corner consistently across all three views using the SAME letter:\n' +
        '\u2022 SV (True Shape): double-prime \u2014 a\u2033, b\u2033, c\u2033\u2026\n' +
        '\u2022 FV (Edge View): primed \u2014 a\u2032, b\u2032, c\u2032\u2026 (same y-level as SV corner)\n' +
        '\u2022 TV (Edge View): unprimed \u2014 a, b, c\u2026 (depth position below XY)\n' +
        'Coincident labels on the edge lines are grouped at their y-positions.'
    );
    drawXYLine();
    _p3DrawYYLine(geo);
    _p3DrawRegionLabels(geo);
    _p3DrawSVShape(geo, 'visible');
    _p3LabelSV(geo);
    for (const fp of geo.fvPoints) drawProjector(fp.svRef.x, fp.svRef.y, fp.x, fp.y);
    for (const tp of geo.tvPoints) drawProjector(geo.fvEdgeX, geo.xyY, geo.fvEdgeX, tp.y);
    drawLine(geo.fvEdgeX, geo.fvTop, geo.fvEdgeX, geo.fvBottom, 'visible');
    drawLine(geo.fvEdgeX, geo.tvTop, geo.fvEdgeX, geo.tvBottom, 'visible');
    // Label FV edge points
    _p3LabelEdgePoints(geo.fvPoints, 'fv');
    // Label TV edge points
    _p3LabelEdgePoints(geo.tvPoints, 'tv');
    drawAnnotation('EDGE VIEW (FV)', geo.fvEdgeX - 10, geo.fvTop - 14);
    drawAnnotation('EDGE VIEW (TV)', geo.fvEdgeX + 12, (geo.tvTop + geo.tvBottom) / 2);
    drawAnnotation('TRUE SHAPE (SV)', (geo.svMinX + geo.svMaxX) / 2, geo.svMinY - 16);
}

function _p3Step6(geo) {
    updateInstructions(
        'Step 6 — Final Annotations',
        'The three-view drawing is complete. ' +
        'SV (right of Y\u2013Y\u2032): TRUE SHAPE \u2014 actual size and orientation of the plane. ' +
        'FV (left of center): EDGE VIEW \u22A5 XY. ' +
        'TV (below XY): EDGE VIEW \u22A5 XY. ' +
        (state.gammaEdge > 0
            ? `Side makes \u03B3 = ${state.gammaEdge}\u00B0 with HP. ` : '') +
        'This is the standard result for a plane \u22A5 HP, \u22A5 VP, \u2225 PP (Profile Plane).'
    );
    drawXYLine();
    _p3DrawYYLine(geo);
    _p3DrawRegionLabels(geo);
    _p3DrawSVShape(geo, 'visible');
    _p3LabelSV(geo);
    for (const fp of geo.fvPoints) drawProjector(fp.svRef.x, fp.svRef.y, fp.x, fp.y);
    for (const tp of geo.tvPoints) drawProjector(geo.fvEdgeX, geo.xyY, geo.fvEdgeX, tp.y);
    drawLine(geo.fvEdgeX, geo.fvTop, geo.fvEdgeX, geo.fvBottom, 'visible');
    drawLine(geo.fvEdgeX, geo.tvTop, geo.fvEdgeX, geo.tvBottom, 'visible');
    _p3LabelEdgePoints(geo.fvPoints, 'fv');
    _p3LabelEdgePoints(geo.tvPoints, 'tv');
    if (state.gammaEdge > 0) {
        const a = geo.svVerts[0];
        drawAngleArc(a.x, a.y, 26, 180, 180 + state.gammaEdge, '\u03B3=' + state.gammaEdge + '\u00B0');
    }
    drawAnnotation('EDGE VIEW (FV)', geo.fvEdgeX - 10, geo.fvTop - 14);
    drawAnnotation('EDGE VIEW (TV)', geo.fvEdgeX + 12, (geo.tvTop + geo.tvBottom) / 2);
    drawAnnotation('TRUE SHAPE (SV)', (geo.svMinX + geo.svMaxX) / 2, geo.svMinY - 16);
    // Condition note
    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.font = `italic ${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(
        _p3ShapeLabel() + '  \u22A5 HP  |  \u22A5 VP  |  \u2225 PP' +
        (state.gammaEdge > 0 ? `  (\u03B3=${state.gammaEdge}\u00B0 to HP)` : ''),
        config.xyLineStartX + 4, config.xyLineY - 6
    );
    ctx.restore();
}

// ---- Drawing helpers ----
function _p3DrawSVShape(geo, style) {
    // Draw the SV polygon from svVerts
    if (state.shapeType === 'circle') {
        // Circle: draw circle centered between keypoints
        const cxSV = (geo.svVerts[0].x + geo.svVerts[2].x) / 2;
        const cySV = (geo.svVerts[0].y + geo.svVerts[2].y) / 2;
        const r = Math.hypot(geo.svVerts[2].x - geo.svVerts[0].x,
            geo.svVerts[2].y - geo.svVerts[0].y) / 2;
        drawCircleArc(cxSV, cySV, r, 0, 2 * Math.PI, style);
    } else if (state.shapeType === 'semicircle') {
        // Semicircle: diameter between [0] and [1], arc toward [2]
        const a = geo.svVerts[0], b = geo.svVerts[1], c = geo.svVerts[2];
        drawLine(a.x, a.y, b.x, b.y, style);
        const cxSV = (a.x + b.x) / 2, cySV = (a.y + b.y) / 2;
        const r = Math.hypot(b.x - a.x, b.y - a.y) / 2;
        const startA = Math.atan2(a.y - cySV, a.x - cxSV);
        const endA = Math.atan2(b.y - cySV, b.x - cxSV);
        // Draw the arc going through c (shorter arc)
        drawCircleArc(cxSV, cySV, r, startA, endA, style);
    } else {
        // Polygon
        drawClosedPolyline(geo.svVerts, style);
    }
}

function _p3LabelSV(geo) {
    for (const v of geo.svVerts) {
        drawLabel(v.svLabel, v.x, v.y, 6, -6);
    }
}

function _p3DrawYYLine(geo) {
    const xyY = config.xyLineY;
    const top = Math.min(geo.svMinY, xyY) - 25;
    const bot = Math.max(geo.tvBottom, xyY + 60);
    ctx.save();
    ctx.strokeStyle = config.xyLineColor;
    ctx.lineWidth = config.visibleLineWidth;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(geo.yyX, top); ctx.lineTo(geo.yyX, bot); ctx.stroke();
    ctx.font = `${config.labelFontSize + 1}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;
    ctx.fillText('Y', geo.yyX - 6, top - 4);
    ctx.fillText('Y\u2032', geo.yyX - 8, bot + 12);
    ctx.restore();
}

function _p3DrawRegionLabels(geo) {
    ctx.save();
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `13px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'right';
    const ex = config.xyLineStartX + config.xyLineLength;
    ctx.fillText('FV \u2191', ex - 4, config.xyLineY - 8);
    ctx.fillText('TV \u2193', ex - 4, config.xyLineY + 18);
    ctx.fillText('SV \u2192', geo.yyX - 4, config.xyLineY - 8);
    ctx.restore();
}

// Label points on a FV or TV edge, grouping coincident positions
function _p3LabelEdgePoints(pts, view) {
    // Group by y-position (distinct y levels)
    const byY = {};
    for (const p of pts) {
        const key = Math.round(p.y);
        if (!byY[key]) byY[key] = [];
        byY[key].push(p.label);
    }
    ctx.save();
    ctx.fillStyle = config.labelColor;
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    for (const [key, labels] of Object.entries(byY)) {
        const y = parseInt(key);
        const txt = labels.join(',');
        const xOff = view === 'fv' ? -28 : 8; // FV labels left of edge, TV labels right
        ctx.fillText(txt, pts[0].x + xOff, y + 4);
        // Small dot at each distinct y on the edge
        ctx.beginPath(); ctx.arc(pts[0].x, y, 2, 0, 2 * Math.PI); ctx.fill();
    }
    ctx.restore();
}

function _p3ShapeLabel() {
    const m = {
        square: 'Square', rectangle: 'Rectangle', triangle: 'Equilateral Triangle',
        circle: 'Circle', pentagon: 'Regular Pentagon', hexagon: 'Regular Hexagon', semicircle: 'Semicircle'
    };
    return m[state.shapeType] || state.shapeType;
}
