// ========================================
// Case B - Axis Perpendicular to VP
// Front View shows TRUE SHAPE of the base.
// Projection sequence: Draw FV (polygon above XY) → project DOWN → get TV.
// ========================================

// ========================================
// Case B - Compute alpha angle from resting condition
// alpha = angle the FIRST edge of the polygon makes with the XY line in the FV
// ========================================
function computeCaseB_Alpha() {
    const sides = getSidesCount(state.solidType);
    const isPrism = state.solidType.includes('prism');
    const isPyramid = state.solidType.includes('pyramid');
    const resting = state.restingOnB || 'rectangular-face';

    if (isPrism) {
        switch (resting) {
            case 'rectangular-face':
                // One side of the polygon lies ON the XY line → α = 0
                return 0;

            case 'longer-edge-equal':
                // Faces equally inclined → one CORNER touches XY, adjacent sides
                // make equal angle. Formula: α = 360 / (2 * n) = 180/n
                // triangle=60°, square=45°, pentagon=36°, hexagon=30°
                return 180 / sides;

            case 'longer-edge-angle':
                // User-specified angle
                return state.caseBAlpha || 0;

            default:
                return 0;
        }
    }

    if (isPyramid) {
        switch (resting) {
            case 'base-edge':
                // One base edge lies on XY → α = 0
                return 0;

            case 'base-corner-equal':
                // Resting corner on XY, adjacent edges equally inclined.
                // Same symmetric formula: α = 180/n
                return 180 / sides;

            case 'base-corner-angle':
                // User-specified angle
                return state.caseBAlpha || 0;

            default:
                return 0;
        }
    }

    return 0; // cone / cylinder fallback
}

// ========================================
// Case B - Step Dispatcher
// 5 steps total:
//   1 - XY line
//   2 - Determine orientation (alpha)
//   3 - Draw FV true shape
//   4 - Draw projectors downward
//   5 - Complete TV with visible/hidden edges
// ========================================
function drawCaseBStep(step) {
    const isPrism = state.solidType.includes('prism');
    const isPyramid = state.solidType.includes('pyramid');
    const sides = getSidesCount(state.solidType);
    const alpha = computeCaseB_Alpha();
    const resting = state.restingOnB || 'rectangular-face';

    // Human-readable description of resting condition for instructions
    function restingDesc() {
        if (isPrism) {
            if (resting === 'rectangular-face') return 'resting on rectangular face (α=0°)';
            if (resting === 'longer-edge-equal') return `resting on longer edge, faces equally inclined (α=${alpha.toFixed(1)}°)`;
            return `resting on longer edge, face at ${alpha}° to HP`;
        }
        if (isPyramid) {
            if (resting === 'base-edge') return 'resting on base edge (α=0°)';
            if (resting === 'base-corner-equal') return `resting on base corner, edges equally inclined (α=${alpha.toFixed(1)}°)`;
            return `resting on base corner, edge at ${alpha}° to HP`;
        }
        return '';
    }

    switch (step) {
        case 1:
            updateInstructions(
                'Step 1: Draw XY Reference Line',
                'Draw the XY reference line across the canvas. ' +
                'Front View (true shape) goes ABOVE this line. ' +
                'Top View goes BELOW. First angle projection.'
            );
            drawXYLine();
            break;

        case 2:
            updateInstructions(
                'Step 2: Determine Polygon Orientation (α)',
                `Solid is ${restingDesc()}. ` +
                `The first edge of the polygon in Front View makes α = ${alpha.toFixed(1)}° with the XY line. ` +
                `The complete polygon must stay entirely ABOVE the XY line.`
            );
            drawXYLine();
            drawCaseB_AlphaIndicator(alpha);
            break;

        case 3:
            updateInstructions(
                'Step 3: Draw Front View – True Shape',
                `Drawing the true shape of the ${state.solidType} (${sides}-sided polygon) above the XY line. ` +
                `First corner 1' is on XY (h=0), first edge 1'→2' at α=${alpha.toFixed(1)}°. ` +
                `Polygon grows away from XY. Each corner is named: ` +
                (isPrism ? 'front face 1\'(a\'), 2\'(b\') … side by side at each corner.' :
                    'base corners 1\',2\'… and apex o\' at centre.')
            );
            drawXYLine();
            if (isPrism) drawCaseB_FrontViewPrism(sides, alpha);
            else if (isPyramid) drawCaseB_FrontViewPyramid(sides, alpha);
            break;

        case 4:
            updateInstructions(
                'Step 4: Project Downward to Top View',
                'Drawing vertical projectors from every FV corner downward below XY. ' +
                'The axis projects 30mm below XY to mark one end of the solid, ' +
                'then continues for the full axis length to mark the other end. ' +
                (isPrism ?
                    'Near-end corners 1,2,3… appear 30mm below XY; far-end a,b,c… at axisLength below.' :
                    'Base corners 1,2,3… appear 30mm below XY; apex o at axisLength below on axis.')
            );
            drawXYLine();
            if (isPrism) drawCaseB_FrontViewPrism(sides, alpha);
            else if (isPyramid) drawCaseB_FrontViewPyramid(sides, alpha);
            if (isPrism) drawCaseB_ProjectorsPrism(sides, alpha);
            else if (isPyramid) drawCaseB_ProjectorsPyramid(sides, alpha);
            break;

        case 5:
            updateInstructions(
                'Step 5: Complete Top View – Visible and Hidden Edges',
                'Joining all corners in the Top View using corner-joining logic. ' +
                'Near-end outline (closer to XY) is always visible. ' +
                'Far-end outline (farther from XY) is hidden (dashed). ' +
                'Silhouette long edges on left/right extremes are always visible.'
            );
            drawXYLine();
            if (isPrism) drawCaseB_FrontViewPrism(sides, alpha);
            else if (isPyramid) drawCaseB_FrontViewPyramid(sides, alpha);
            if (isPrism) drawCaseB_TopViewPrism(sides, alpha);
            else if (isPyramid) drawCaseB_TopViewPyramid(sides, alpha);
            break;
    }
}

// ========================================
// Case B - Alpha angle indicator
// ========================================
function drawCaseB_AlphaIndicator(alpha) {
    const startX = config.xyLineStartX + 30;
    const y = config.xyLineY;

    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    if (alpha === 0) {
        // Show a sample edge lying flat on XY
        ctx.strokeStyle = config.visibleColor;
        ctx.lineWidth = config.visibleLineWidth;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + state.baseEdge, y);
        ctx.stroke();
        ctx.fillText("α = 0° (edge on XY)", startX, y - 8);
    } else {
        const rad = degreesToRadians(alpha);
        const ex = startX + state.baseEdge * Math.cos(rad);
        const ey = y - state.baseEdge * Math.sin(rad); // above XY → negative y offset

        ctx.strokeStyle = config.visibleColor;
        ctx.lineWidth = config.visibleLineWidth;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Angle arc
        ctx.strokeStyle = config.constructionColor;
        ctx.lineWidth = config.constructionLineWidth;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(startX, y, 20, -rad, 0); // from α above XY down to XY (0 = rightward)
        ctx.stroke();

        ctx.fillText(`α = ${alpha.toFixed(1)}°`, startX + 25, y - 8);
    }
    ctx.restore();
}

// ========================================
// Case B - Build polygon points ABOVE XY line
//
// The polygon is built edge-by-edge starting from (startX, XY) going UPWARD.
// Rule: subsequent edges rotate by the EXTERNAL angle at each vertex,
//       but the growth direction is chosen so the polygon expands AWAY from XY
//       (i.e. y values decrease = go upward on canvas).
//
// The first edge goes at angle alpha above XY:
//   direction vector = (cos(alpha), -sin(alpha))   [up-right for alpha > 0]
// ========================================
function buildCaseB_PolygonPoints(sides, alpha) {
    const edgeLen = state.baseEdge;
    const insideAngle = degreesToRadians(180 - (360 / sides)); // internal angle
    const extAngle = Math.PI - insideAngle;                  // external (turning) angle

    // Start: 30mm from left end of XY, ON the XY line
    const startX = config.xyLineStartX + 30;
    const startY = config.xyLineY;

    const points = [];
    points.push({ x: startX, y: startY });

    // Initial direction: alpha degrees ABOVE the horizontal (canvas y goes up = negative)
    // In canvas coords: rightward = +x, upward = -y
    // angle measured CCW from +x axis in math space, but canvas y is flipped:
    // so unit vector = ( cos(alpha), -sin(alpha) )
    let dirAngle = degreesToRadians(alpha); // angle in standard math coords

    let cx = startX;
    let cy = startY;

    for (let i = 1; i < sides; i++) {
        cx += edgeLen * Math.cos(dirAngle);
        cy -= edgeLen * Math.sin(dirAngle); // subtract because canvas y is inverted
        points.push({ x: cx, y: cy });

        // Turn LEFT (clockwise in canvas coords = counter-clockwise in math coords)
        // to keep the polygon above XY.  In canvas space:
        // turning left by external angle means dirAngle INCREASES (math CCW)
        dirAngle += extAngle;
    }

    // Compute centroid
    let sumX = 0, sumY = 0;
    for (const p of points) { sumX += p.x; sumY += p.y; }
    const cx0 = sumX / sides;
    const cy0 = sumY / sides;

    return { points, centerX: cx0, centerY: cy0 };
}

// ========================================
// Case B - Front View: Prism (true shape above XY)
// Naming: front-face corners 1'(a'), 2'(b') … side-by-side at each corner
// ========================================
function drawCaseB_FrontViewPrism(sides, alpha) {
    const { points, centerX, centerY } = buildCaseB_PolygonPoints(sides, alpha);

    // Store in state for projectors / TV
    state.corners.fvPoints = points;
    state.corners.fvCenterX = centerX;
    state.corners.fvCenterY = centerY;

    // ---- Draw polygon edges (all visible – true shape) ----
    ctx.save();
    ctx.strokeStyle = config.visibleColor;
    ctx.lineWidth = config.visibleLineWidth;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < sides; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // ---- Label corners side by side: "1'  a'" ----
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;
    const gap = 3;

    for (let i = 0; i < sides; i++) {
        const p = points[i];

        // Dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
        ctx.fill();

        // Two labels side by side: front-face "1'" LEFT, rear-face "a'" RIGHT
        const fl = (i + 1) + "'";
        const rl = String.fromCharCode(97 + i) + "'";
        const flW = ctx.measureText(fl).width;

        // Place label block upper-right of the corner dot
        const lx = p.x + 5;
        const ly = p.y - 5;
        ctx.fillText(fl, lx, ly);
        ctx.fillText(rl, lx + flW + gap, ly);
    }

    // Centre point o' (axis passes through here)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText("o'", centerX + 4, centerY - 4);

    ctx.restore();

    // ---- Axis line (construction) from centre to XY ----
    drawLine(centerX, centerY, centerX, config.xyLineY, false, true);
}

// ========================================
// Case B - Front View: Pyramid (true shape above XY)
// Naming: base corners 1',2',3'… and apex o' at centroid
// ========================================
function drawCaseB_FrontViewPyramid(sides, alpha) {
    const { points, centerX, centerY } = buildCaseB_PolygonPoints(sides, alpha);

    state.corners.fvPoints = points;
    state.corners.fvCenterX = centerX;
    state.corners.fvCenterY = centerY;

    // ---- Draw base edges ----
    ctx.save();
    ctx.strokeStyle = config.visibleColor;
    ctx.lineWidth = config.visibleLineWidth;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < sides; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.stroke();

    // ---- Draw slant edges to apex ----
    for (const p of points) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();
    }
    ctx.restore();

    // ---- Label corners ----
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    for (let i = 0; i < sides; i++) {
        const p = points[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText((i + 1) + "'", p.x + 5, p.y - 5);
    }

    // Apex
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText("o'", centerX + 4, centerY - 4);
    ctx.restore();

    // ---- Axis line (construction) from apex to XY ----
    drawLine(centerX, centerY, centerX, config.xyLineY, false, true);
}

// ========================================
// Case B - Projectors: Prism
// Drop vertical construction lines from each FV corner down through XY
// Mark near-end corners (1,2,3…) 30mm below XY
// Mark far-end corners  (a,b,c…) at (30 + axisLength) below XY
// ========================================
function drawCaseB_ProjectorsPrism(sides, alpha) {
    const points = state.corners.fvPoints;
    const centerX = state.corners.fvCenterX;
    const axisLen = state.axisLength;
    const nearY = config.xyLineY + 30;           // near end (in front)
    const farY = config.xyLineY + 30 + axisLen; // far end (behind)

    // ---- Construction projector lines ----
    ctx.save();
    ctx.strokeStyle = config.constructionColor;
    ctx.lineWidth = config.constructionLineWidth;
    ctx.setLineDash([2, 2]);
    for (const p of points) {
        ctx.beginPath();
        ctx.moveTo(p.x, config.xyLineY);
        ctx.lineTo(p.x, farY + 20); // extend a little past far end
        ctx.stroke();
    }
    // Axis projector
    ctx.beginPath();
    ctx.moveTo(centerX, config.xyLineY);
    ctx.lineTo(centerX, farY + 20);
    ctx.stroke();
    ctx.restore();

    // ---- Near-end corner dots and labels (1, 2, 3…) ----
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    const nearCorners = [];
    const farCorners = [];

    for (let i = 0; i < sides; i++) {
        const p = points[i];
        const nearPt = { x: p.x, y: nearY };
        const farPt = { x: p.x, y: farY };
        nearCorners.push(nearPt);
        farCorners.push(farPt);

        // Near-end dot + label
        ctx.beginPath();
        ctx.arc(nearPt.x, nearPt.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText((i + 1), nearPt.x + 4, nearPt.y - 4);

        // Far-end dot + label
        ctx.beginPath();
        ctx.arc(farPt.x, farPt.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(String.fromCharCode(97 + i), farPt.x + 4, farPt.y + 12);
    }

    // Axis endpoints
    ctx.beginPath();
    ctx.arc(centerX, nearY, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX, farY, 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();

    // Store TV corners for step 5
    state.corners.tvNear = nearCorners;
    state.corners.tvFar = farCorners;
    state.corners.tvAxisNearY = nearY;
    state.corners.tvAxisFarY = farY;
    state.corners.tvAxisX = centerX;
}

// ========================================
// Case B - Projectors: Pyramid
// Near-end = base corners (1,2,3…) 30mm below XY on the FV corner x-positions
// Far-end  = apex (o) at axisLength below XY on axis x
// ========================================
function drawCaseB_ProjectorsPyramid(sides, alpha) {
    const points = state.corners.fvPoints;
    const centerX = state.corners.fvCenterX;
    const axisLen = state.axisLength;
    const nearY = config.xyLineY + 30;
    const apexY = config.xyLineY + 30 + axisLen;

    // ---- Construction projector lines ----
    ctx.save();
    ctx.strokeStyle = config.constructionColor;
    ctx.lineWidth = config.constructionLineWidth;
    ctx.setLineDash([2, 2]);
    for (const p of points) {
        ctx.beginPath();
        ctx.moveTo(p.x, config.xyLineY);
        ctx.lineTo(p.x, apexY + 20);
        ctx.stroke();
    }
    // Axis projector
    ctx.beginPath();
    ctx.moveTo(centerX, config.xyLineY);
    ctx.lineTo(centerX, apexY + 20);
    ctx.stroke();
    ctx.restore();

    // ---- Base corner dots and labels ----
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    const baseCorners = [];
    for (let i = 0; i < sides; i++) {
        const p = points[i];
        const pt = { x: p.x, y: nearY };
        baseCorners.push(pt);

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText((i + 1), pt.x + 4, pt.y - 4);
    }

    // Apex dot + label
    const apexPt = { x: centerX, y: apexY };
    ctx.beginPath();
    ctx.arc(apexPt.x, apexPt.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText('o', apexPt.x + 4, apexPt.y + 12);
    ctx.restore();

    // ---- Axis line (construction) ----
    drawLine(centerX, nearY, centerX, apexY, false, true);

    // Store for step 5
    state.corners.tvBase = baseCorners;
    state.corners.tvApex = apexPt;
    state.corners.tvAxisX = centerX;
}

// ========================================
// Case B - Top View: Prism  (Step 5)
// Shape: a rectangle-like outline.
// Near end (1,2,3…) = visible outline.
// Far end  (a,b,c…) = hidden (dashed).
// Left/right silhouette long edges = always visible.
// ========================================
function drawCaseB_TopViewPrism(sides, alpha) {
    // Build TV corners from projectors (already stored if step 4 ran)
    // If called standalone (step 5 after redraw), recompute them
    const points = state.corners.fvPoints;
    const centerX = state.corners.fvCenterX;
    const axisLen = state.axisLength;
    const nearY = config.xyLineY + 30;
    const farY = config.xyLineY + 30 + axisLen;

    const nearCorners = points.map((p, i) => ({
        x: p.x, y: nearY,
        label: (i + 1).toString()
    }));
    const farCorners = points.map((p, i) => ({
        x: p.x, y: farY,
        label: String.fromCharCode(97 + i)
    }));

    state.corners.tvNear = nearCorners;
    state.corners.tvFar = farCorners;

    const n = sides;

    // ---- Determine visible/hidden for near-end corners ----
    // In TV of Case B: axis is horizontal (left-right).
    // The near end (closer to VP, i.e. near XY) is always VISIBLE.
    // The far end (away from VP) is always HIDDEN.
    // Silhouette edges (at min-X and max-X of FV polygon) are always visible.
    const allX = nearCorners.map(c => c.x);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const EPS = 0.5;

    // isHidden[i] = true means the near-end corner is NOT on the silhouette
    // For this view: near end is always drawn VISIBLE (they form the outline).
    // Far end is always HIDDEN — unless it is at the silhouette X.
    const farHidden = farCorners.map(c =>
        !(Math.abs(c.x - minX) < EPS || Math.abs(c.x - maxX) < EPS)
    );

    function drawEdge(x1, y1, x2, y2, hidden) {
        ctx.save();
        if (hidden) {
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

    // ---- 1. Near-end outline: all visible ----
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        drawEdge(nearCorners[i].x, nearCorners[i].y,
            nearCorners[j].x, nearCorners[j].y, false);
    }

    // ---- 2. Far-end outline: hidden (except silhouette) ----
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        // Edge is hidden only if BOTH endpoints are non-silhouette
        const edgeHidden = farHidden[i] && farHidden[j];
        drawEdge(farCorners[i].x, farCorners[i].y,
            farCorners[j].x, farCorners[j].y, edgeHidden);
    }

    // ---- 3. Long edges (near to far) — silhouette always visible, rest hidden ----
    for (let i = 0; i < n; i++) {
        const isSilhouette = !farHidden[i]; // silhouette columns
        drawEdge(nearCorners[i].x, nearCorners[i].y,
            farCorners[i].x, farCorners[i].y, !isSilhouette);
    }

    // ---- 4. Axis (construction) ----
    drawLine(centerX, nearY, centerX, farY, false, true);

    // ---- 5. Labels ----
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;
    const gap = 3;

    for (let i = 0; i < n; i++) {
        const nc = nearCorners[i];
        const fc = farCorners[i];

        // Near-end: label above-right
        ctx.beginPath();
        ctx.arc(nc.x, nc.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(nc.label, nc.x + 4, nc.y - 4);

        // Far-end: label below-right
        ctx.beginPath();
        ctx.arc(fc.x, fc.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(fc.label, fc.x + 4, fc.y + 12);
    }
    ctx.restore();
}

// ========================================
// Case B - Top View: Pyramid  (Step 5)
// Near end = base corners (visible outline)
// Far end  = apex o (joined to all base corners; slant edges mostly hidden)
// ========================================
function drawCaseB_TopViewPyramid(sides, alpha) {
    const points = state.corners.fvPoints;
    const centerX = state.corners.fvCenterX;
    const axisLen = state.axisLength;
    const nearY = config.xyLineY + 30;
    const apexY = config.xyLineY + 30 + axisLen;

    const baseCorners = points.map((p, i) => ({
        x: p.x, y: nearY,
        label: (i + 1).toString()
    }));
    const apexPt = { x: centerX, y: apexY, label: 'o' };

    state.corners.tvBase = baseCorners;
    state.corners.tvApex = apexPt;

    const n = sides;

    // Silhouette: base corners at min-X and max-X are always visible
    const allX = baseCorners.map(c => c.x);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const EPS = 0.5;

    const isSilhouette = baseCorners.map(c =>
        Math.abs(c.x - minX) < EPS || Math.abs(c.x - maxX) < EPS
    );

    function drawEdge(x1, y1, x2, y2, hidden) {
        ctx.save();
        if (hidden) {
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

    // ---- 1. Base (near-end) outline: all visible ----
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        drawEdge(baseCorners[i].x, baseCorners[i].y,
            baseCorners[j].x, baseCorners[j].y, false);
    }

    // ---- 2. Slant edges to apex ----
    // Silhouette slant edges = visible; others = hidden
    for (let i = 0; i < n; i++) {
        drawEdge(baseCorners[i].x, baseCorners[i].y,
            apexPt.x, apexPt.y, !isSilhouette[i]);
    }

    // ---- 3. Axis (construction) ----
    drawLine(centerX, nearY, centerX, apexY, false, true);

    // ---- 4. Labels ----
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    for (let i = 0; i < n; i++) {
        const c = baseCorners[i];
        ctx.beginPath();
        ctx.arc(c.x, c.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(c.label, c.x + 4, c.y - 4);
    }
    // Apex
    ctx.beginPath();
    ctx.arc(apexPt.x, apexPt.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText('o', apexPt.x + 4, apexPt.y + 12);
    ctx.restore();
}