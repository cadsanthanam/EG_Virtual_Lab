// ========================================
// Case D - Axis Inclined to VP
// ========================================
// Phase I  : Axis ⊥ VP  → reuse Case B functions (FV = true shape, TV projected down)
// Phase II : Rotate the initial TV so the axis makes φ with VP,
//            then project upward to get the final FV.
//
// Step sequence (8 steps total):
//   Steps 1–5  : Phase I  (identical to Case B steps 1–5)
//   Step 6     : Phase II – Draw final TV (initial TV rotated by φ)
//   Step 7     : Phase II – Projectors up from final TV + loci across from initial FV
//   Step 8     : Phase II – Complete final FV with visible/hidden edges
// ========================================

// ========================================
// Case D - Step Dispatcher
// ========================================
function drawCaseDStep(step) {
    const isPrism = state.solidType.includes('prism');
    const isPyramid = state.solidType.includes('pyramid');
    const sides = getSidesCount(state.solidType);
    const phi = state.axisAngleVP || 45; // inclination of axis with VP in degrees

    // Alpha for Phase I is the same as Case B
    const alpha = computeCaseB_Alpha();

    // ---- Phase I : Steps 1–5 (reuse Case B) ----
    if (step <= 5) {
        switch (step) {
            case 1:
                updateInstructions(
                    'Phase I – Step 1: Draw XY Reference Line',
                    'Phase I assumes the axis is ⊥ VP (same as Case B). ' +
                    'Draw the XY reference line. Front View (true shape) will be above XY; Top View below.'
                );
                drawXYLine();
                break;

            case 2:
                updateInstructions(
                    'Phase I – Step 2: Determine Polygon Orientation (α)',
                    `Resting condition gives α = ${alpha.toFixed(1)}°. ` +
                    'First edge of the polygon in FV makes this angle with XY. ' +
                    'The complete polygon stays entirely above XY.'
                );
                drawXYLine();
                drawCaseB_AlphaIndicator(alpha);
                break;

            case 3:
                updateInstructions(
                    'Phase I – Step 3: Draw Initial Front View – True Shape',
                    `Drawing the true shape of the ${state.solidType} above XY. ` +
                    'All corners named and labelled.'
                );
                drawXYLine();
                if (isPrism) drawCaseB_FrontViewPrism(sides, alpha);
                else if (isPyramid) drawCaseB_FrontViewPyramid(sides, alpha);
                break;

            case 4:
                updateInstructions(
                    'Phase I – Step 4: Project Downward – Initial Top View',
                    'Dropping vertical projectors from FV corners to get the initial TV. ' +
                    'Near-end corners (1,2,3…) 30mm below XY; ' +
                    (isPrism ? 'far-end corners (a,b,c…) at axisLength below.' :
                        'apex (o) at axisLength below on axis.')
                );
                drawXYLine();
                if (isPrism) drawCaseB_FrontViewPrism(sides, alpha);
                else if (isPyramid) drawCaseB_FrontViewPyramid(sides, alpha);
                if (isPrism) drawCaseB_ProjectorsPrism(sides, alpha);
                else if (isPyramid) drawCaseB_ProjectorsPyramid(sides, alpha);
                break;

            case 5:
                updateInstructions(
                    'Phase I – Step 5: Complete Initial Top View',
                    'Joining corners in the initial TV with visible (near-end) and hidden (far-end) edges. ' +
                    'Silhouette long edges at left/right extremes always visible.'
                );
                drawXYLine();
                if (isPrism) drawCaseB_FrontViewPrism(sides, alpha);
                else if (isPyramid) drawCaseB_FrontViewPyramid(sides, alpha);
                if (isPrism) drawCaseB_TopViewPrism(sides, alpha);
                else if (isPyramid) drawCaseB_TopViewPyramid(sides, alpha);
                break;
        }
        return;
    }

    // ---- Phase II : Steps 6–8 ----
    // Always redraw Phase I views first (they stay on the sheet)
    drawXYLine();
    if (isPrism) {
        drawCaseB_FrontViewPrism(sides, alpha);
        drawCaseB_TopViewPrism(sides, alpha);
    } else if (isPyramid) {
        drawCaseB_FrontViewPyramid(sides, alpha);
        drawCaseB_TopViewPyramid(sides, alpha);
    }

    switch (step) {
        case 6:
            updateInstructions(
                `Phase II – Step 6: Draw Final Top View (Axis at φ=${phi}° to VP)`,
                `Rotating the initial TV about its top-right pivot by φ=${phi}° so the axis ` +
                'becomes inclined to VP. The final TV is drawn to the right of the initial TV ' +
                'with a gap of ≈ 2× side length. All corners relabelled with subscript ₁.'
            );
            drawCaseD_FinalTopView(sides, alpha, phi);
            break;

        case 7:
            updateInstructions(
                'Phase II – Step 7: Projectors and Loci',
                'Drawing vertical projectors UPWARD from each final TV corner, ' +
                'and horizontal locus lines RIGHTWARD from each initial FV corner. ' +
                'Intersections will give the final FV corners.'
            );
            drawCaseD_FinalTopView(sides, alpha, phi);
            drawCaseD_ProjectorsAndLoci(sides, alpha, phi);
            break;

        case 8:
            updateInstructions(
                'Phase II – Step 8: Complete Final Front View',
                'Joining the intersection points to complete the final FV. ' +
                'Visible edges drawn as continuous lines; hidden edges as dashed lines.'
            );
            drawCaseD_FinalTopView(sides, alpha, phi);
            drawCaseD_ProjectorsAndLoci(sides, alpha, phi);
            drawCaseD_FinalFrontView(sides, alpha, phi);
            break;
    }
}

// ========================================
// Case D – Phase II Step 6
// Draw the Final Top View = initial TV rotated by φ about its top-right pivot
//
// "Top-right" in the initial TV means the corner that is:
//   - nearest to XY (smallest Y, i.e. in the nearCorners row)
//   - rightmost among those (largest X)
// ========================================
function drawCaseD_FinalTopView(sides, alpha, phi) {
    const isPrism = state.solidType.includes('prism');
    const isPyramid = state.solidType.includes('pyramid');

    // Ensure Phase I TV state is populated
    if (isPrism && (!state.corners.tvNear || state.corners.tvNear.length === 0)) {
        drawCaseB_TopViewPrism(sides, alpha);
    }
    if (isPyramid && (!state.corners.tvBase || state.corners.tvBase.length === 0)) {
        drawCaseB_TopViewPyramid(sides, alpha);
    }

    const nearCorners = isPrism ? state.corners.tvNear : state.corners.tvBase;
    const farCorners = isPrism ? state.corners.tvFar : null;
    const apexPt = isPyramid ? state.corners.tvApex : null;
    const axisX = state.corners.fvCenterX;

    // ---- Find pivot: rightmost of the near-end (top) corners ----
    // Spec: "take the point nearer to xy also on the right side of axis line"
    let pivot = nearCorners[0];
    for (const c of nearCorners) {
        if (c.x > pivot.x) pivot = c;
    }

    // ---- Translation gap: place final TV to the right of initial TV ----
    const offset = 45 + 2 * state.baseEdge;

    // ---- Rotation direction fix ----
    // In the initial TV, the axis is VERTICAL (runs top→bottom, parallel to canvas Y).
    // We need the axis in the final TV to make angle φ with XY (horizontal).
    // The axis currently points downward (0° from vertical = 90° from XY).
    // We want it at φ° from XY = (90°-φ) from vertical.
    // Rotating COUNTER-CLOCKWISE (negative angle in canvas coords where CW=positive)
    // tilts the top of the figure to the RIGHT and downward → stays below XY.
    // rotAngle is NEGATIVE = CCW in canvas space.
    const rotAngle = -degreesToRadians(90 - phi); // CCW: keeps figure below XY

    function rotatePt(pt) {
        const dx = pt.x - pivot.x;
        const dy = pt.y - pivot.y;
        const cos = Math.cos(rotAngle);
        const sin = Math.sin(rotAngle);
        return {
            x: pivot.x + dx * cos - dy * sin + offset,
            y: pivot.y + dx * sin + dy * cos
        };
    }

    // ---- Rotate all TV corners ----
    const finalNear = nearCorners.map((c, i) => ({
        ...rotatePt(c),
        label: (i + 1) + '\u2081'
    }));

    let finalFar = null;
    let finalApex = null;

    if (isPrism && farCorners) {
        finalFar = farCorners.map((c, i) => ({
            ...rotatePt(c),
            label: String.fromCharCode(97 + i) + '\u2081'
        }));
    }

    if (isPyramid && apexPt) {
        finalApex = { ...rotatePt(apexPt), label: 'o\u2081' };
    }

    // Rotated axis endpoints (for construction line and angle indicator)
    const axisNear = rotatePt({ x: axisX, y: nearCorners[0].y });
    const axisFar = isPrism
        ? rotatePt({ x: axisX, y: farCorners[0].y })
        : (apexPt ? rotatePt(apexPt) : axisNear);

    // Store for subsequent steps
    state.corners.finalTVNear = finalNear;
    state.corners.finalTVFar = finalFar;
    state.corners.finalTVApex = finalApex;
    state.corners.finalTVAxisNear = axisNear;
    state.corners.finalTVAxisFar = axisFar;
    state.corners.finalTVPivotX = pivot.x + offset;
    state.corners.finalTVPivotY = pivot.y;

    const n = sides;

    // ---- Visibility: convex hull rule ----
    // ALL edges on the convex hull boundary are ALWAYS visible.
    // Interior edges are hidden.
    const allPts = [...finalNear];
    if (isPrism && finalFar) allPts.push(...finalFar);
    if (isPyramid && finalApex) allPts.push(finalApex);

    const hullPts = convexHull(allPts);

    function isEdgeOnHull(pA, pB) {
        const EPS = 1.0;
        for (let k = 0; k < hullPts.length; k++) {
            const m = (k + 1) % hullPts.length;
            if ((Math.abs(pA.x - hullPts[k].x) < EPS && Math.abs(pA.y - hullPts[k].y) < EPS &&
                Math.abs(pB.x - hullPts[m].x) < EPS && Math.abs(pB.y - hullPts[m].y) < EPS) ||
                (Math.abs(pA.x - hullPts[m].x) < EPS && Math.abs(pA.y - hullPts[m].y) < EPS &&
                    Math.abs(pB.x - hullPts[k].x) < EPS && Math.abs(pB.y - hullPts[k].y) < EPS)) {
                return true;
            }
        }
        return false;
    }

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

    if (isPrism && finalFar) {
        // Near-end polygon edges
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const hidden = !isEdgeOnHull(finalNear[i], finalNear[j]);
            drawEdge(finalNear[i].x, finalNear[i].y,
                finalNear[j].x, finalNear[j].y, hidden);
        }
        // Far-end polygon edges
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const hidden = !isEdgeOnHull(finalFar[i], finalFar[j]);
            drawEdge(finalFar[i].x, finalFar[i].y,
                finalFar[j].x, finalFar[j].y, hidden);
        }
        // Long edges (near to far)
        for (let i = 0; i < n; i++) {
            const hidden = !isEdgeOnHull(finalNear[i], finalFar[i]);
            drawEdge(finalNear[i].x, finalNear[i].y,
                finalFar[i].x, finalFar[i].y, hidden);
        }

    } else if (isPyramid && finalApex) {
        // Base edges
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const hidden = !isEdgeOnHull(finalNear[i], finalNear[j]);
            drawEdge(finalNear[i].x, finalNear[i].y,
                finalNear[j].x, finalNear[j].y, hidden);
        }
        // Slant edges
        for (let i = 0; i < n; i++) {
            const hidden = !isEdgeOnHull(finalNear[i], finalApex);
            drawEdge(finalNear[i].x, finalNear[i].y,
                finalApex.x, finalApex.y, hidden);
        }
    }

    // Axis construction line
    drawLine(axisNear.x, axisNear.y, axisFar.x, axisFar.y, false, true);

    // ---- Angle indicator: φ arc at pivot ----
    ctx.save();
    ctx.strokeStyle = config.constructionColor;
    ctx.lineWidth = config.constructionLineWidth;
    ctx.setLineDash([]);
    const px = state.corners.finalTVPivotX;
    const py = state.corners.finalTVPivotY;
    const arcR = 25;
    // Reference horizontal at pivot
    ctx.beginPath();
    ctx.moveTo(px - 10, py);
    ctx.lineTo(px + 45, py);
    ctx.stroke();
    // Arc showing φ between axis and XY
    // Axis direction after CCW rotation: from pivot going down-right at angle (90-φ) from vertical
    // = φ from horizontal → arc from 0 (rightward) downward by φ
    ctx.beginPath();
    ctx.arc(px, py, arcR, 0, degreesToRadians(phi));
    ctx.stroke();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;
    ctx.fillText(`φ=${phi}°`, px + arcR + 4, py + 8);
    ctx.restore();

    // ---- Labels ----
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    for (let i = 0; i < n; i++) {
        const nc = finalNear[i];
        ctx.beginPath();
        ctx.arc(nc.x, nc.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(nc.label, nc.x + 4, nc.y - 4);
    }
    if (isPrism && finalFar) {
        for (let i = 0; i < n; i++) {
            const fc = finalFar[i];
            ctx.beginPath();
            ctx.arc(fc.x, fc.y, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillText(fc.label, fc.x + 4, fc.y + 12);
        }
    }
    if (isPyramid && finalApex) {
        ctx.beginPath();
        ctx.arc(finalApex.x, finalApex.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(finalApex.label, finalApex.x + 4, finalApex.y + 12);
    }
    ctx.restore();
}

// ========================================
// Case D – Phase II Step 7
// Projectors UPWARD from final TV corners
// Loci RIGHTWARD from initial FV corners
// Compute intersections = final FV corners
// ========================================
function drawCaseD_ProjectorsAndLoci(sides, alpha, phi) {
    const isPrism = state.solidType.includes('prism');
    const isPyramid = state.solidType.includes('pyramid');

    const finalNear = state.corners.finalTVNear;
    const finalFar = state.corners.finalTVFar;
    const finalApex = state.corners.finalTVApex;
    const initFVPts = state.corners.fvPoints;          // initial FV polygon corners
    const initFVCx = state.corners.fvCenterX;
    const initFVCy = state.corners.fvCenterY;

    if (!finalNear || !initFVPts) return;

    const n = sides;

    // ---- Extent limits ----
    // Projectors go upward — find the highest Y among all initial FV corners
    let minFVY = initFVPts[0].y;
    for (const p of initFVPts) if (p.y < minFVY) minFVY = p.y;
    if (initFVCy < minFVY) minFVY = initFVCy;
    minFVY -= 25; // margin above highest FV corner

    // Loci go rightward — find rightmost X among all final TV corners
    let maxTVX = finalNear[0].x;
    for (const c of finalNear) if (c.x > maxTVX) maxTVX = c.x;
    if (isPrism && finalFar) for (const c of finalFar) if (c.x > maxTVX) maxTVX = c.x;
    if (isPyramid && finalApex && finalApex.x > maxTVX) maxTVX = finalApex.x;
    maxTVX += 30;

    ctx.save();
    ctx.strokeStyle = config.constructionColor;
    ctx.lineWidth = config.constructionLineWidth;
    ctx.setLineDash([2, 2]);

    // 1. Vertical projectors UPWARD from all final TV corners
    const allFinalTV = [...finalNear];
    if (isPrism && finalFar) allFinalTV.push(...finalFar);
    if (isPyramid && finalApex) allFinalTV.push(finalApex);

    for (const c of allFinalTV) {
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x, minFVY);
        ctx.stroke();
    }

    // 2. Horizontal loci RIGHTWARD from all initial FV corners
    for (const p of initFVPts) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(maxTVX, p.y);
        ctx.stroke();
    }
    // Centre/apex locus
    ctx.beginPath();
    ctx.moveTo(initFVCx, initFVCy);
    ctx.lineTo(maxTVX, initFVCy);
    ctx.stroke();

    ctx.restore();

    // ---- Compute intersection points = final FV corners ----
    // For each corner i:
    //   Final FV x  = final TV corner x  (from vertical projector)
    //   Final FV y  = initial FV corner y (from horizontal locus of SAME corner)
    //
    // Corner correspondence:
    //   Near-end TV (1₁,2₁…)  ↔  FV polygon corners (1',2'…)  at initFVPts[i].y
    //   Far-end TV  (a₁,b₁…)  ↔  same FV corners (both ends coincide in FV)  at initFVPts[i].y
    //   Apex TV (o₁)           ↔  FV centre at initFVCy

    const finalFVNear = finalNear.map((c, i) => ({
        x: c.x,
        y: initFVPts[i].y,
        label: (i + 1) + "\u2081'"   // 1₁', 2₁'…
    }));

    let finalFVFar = null;
    let finalFVApex = null;

    if (isPrism && finalFar) {
        finalFVFar = finalFar.map((c, i) => ({
            x: c.x,
            y: initFVPts[i].y,   // same y as near-end (both ends coincide in initial FV)
            label: String.fromCharCode(97 + i) + "\u2081'"   // a₁', b₁'…
        }));
    }

    if (isPyramid && finalApex) {
        finalFVApex = {
            x: finalApex.x,
            y: initFVCy,
            label: "o\u2081'"        // o₁'
        };
    }

    // Store for step 8
    state.corners.finalFVNear = finalFVNear;
    state.corners.finalFVFar = finalFVFar;
    state.corners.finalFVApex2 = finalFVApex;

    // ---- Mark intersection dots and labels ----
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    for (const pt of finalFVNear) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(pt.label, pt.x + 4, pt.y - 5);
    }
    if (finalFVFar) {
        const gap = 3;
        // Group coincident-Y corners for side-by-side labeling
        const byXY = {};
        for (let i = 0; i < n; i++) {
            const key = Math.round(finalFVNear[i].x) + ',' + Math.round(finalFVNear[i].y);
            if (!byXY[key]) byXY[key] = { near: [], far: [] };
            byXY[key].near.push(i);
        }
        for (let i = 0; i < n; i++) {
            const pt = finalFVFar[i];
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillText(pt.label, pt.x + 4, pt.y + 12);
        }
    }
    if (finalFVApex) {
        ctx.beginPath();
        ctx.arc(finalFVApex.x, finalFVApex.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(finalFVApex.label, finalFVApex.x + 4, finalFVApex.y - 5);
    }
    ctx.restore();
}

// ========================================
// Case D – Phase II Step 8
// Complete the Final Front View
// Uses convex-hull + hidden-edge logic (same approach as Case C final TV)
// ========================================
function drawCaseD_FinalFrontView(sides, alpha, phi) {
    const isPrism = state.solidType.includes('prism');
    const isPyramid = state.solidType.includes('pyramid');

    const finalFVNear = state.corners.finalFVNear;
    const finalFVFar = state.corners.finalFVFar;
    const finalFVApex = state.corners.finalFVApex2;

    if (!finalFVNear || finalFVNear.length === 0) return;

    const n = sides;

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

    // ---- Build convex hull of ALL final FV points for silhouette detection ----
    const allPts = [...finalFVNear];
    if (isPrism && finalFVFar) allPts.push(...finalFVFar);
    if (isPyramid && finalFVApex) allPts.push(finalFVApex);

    const hullPts = convexHull(allPts);

    function isEdgeOnHull(pA, pB) {
        const EPS = 1.0;
        for (let k = 0; k < hullPts.length; k++) {
            const m = (k + 1) % hullPts.length;
            if ((Math.abs(pA.x - hullPts[k].x) < EPS && Math.abs(pA.y - hullPts[k].y) < EPS &&
                Math.abs(pB.x - hullPts[m].x) < EPS && Math.abs(pB.y - hullPts[m].y) < EPS) ||
                (Math.abs(pA.x - hullPts[m].x) < EPS && Math.abs(pA.y - hullPts[m].y) < EPS &&
                    Math.abs(pB.x - hullPts[k].x) < EPS && Math.abs(pB.y - hullPts[m].y) < EPS)) {
                return true;
            }
        }
        return false;
    }

    // ---- Visibility: convex hull rule ----
    // ALL edges on the convex hull boundary are ALWAYS visible.
    // Interior edges are hidden.
    const hullSet = buildHullSet(allPts);

    function isEdgeOnHull(pA, pB) {
        const EPS = 1.0;
        for (let k = 0; k < hullPts.length; k++) {
            const m = (k + 1) % hullPts.length;
            if ((Math.abs(pA.x - hullPts[k].x) < EPS && Math.abs(pA.y - hullPts[k].y) < EPS &&
                Math.abs(pB.x - hullPts[m].x) < EPS && Math.abs(pB.y - hullPts[m].y) < EPS) ||
                (Math.abs(pA.x - hullPts[m].x) < EPS && Math.abs(pA.y - hullPts[m].y) < EPS &&
                    Math.abs(pB.x - hullPts[k].x) < EPS && Math.abs(pB.y - hullPts[k].y) < EPS)) {
                return true;
            }
        }
        return false;
    }

    // For prisms:
    if (isPrism && finalFVFar) {
        // Near-end polygon edges
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            drawEdge(finalFVNear[i].x, finalFVNear[i].y,
                finalFVNear[j].x, finalFVNear[j].y,
                !isEdgeOnHull(finalFVNear[i], finalFVNear[j]));
        }
        // Far-end polygon edges
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            drawEdge(finalFVFar[i].x, finalFVFar[i].y,
                finalFVFar[j].x, finalFVFar[j].y,
                !isEdgeOnHull(finalFVFar[i], finalFVFar[j]));
        }
        // Long edges (near to far)
        for (let i = 0; i < n; i++) {
            drawEdge(finalFVNear[i].x, finalFVNear[i].y,
                finalFVFar[i].x, finalFVFar[i].y,
                !isEdgeOnHull(finalFVNear[i], finalFVFar[i]));
        }

        // Labels — coincident corners side by side
        ctx.save();
        ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
        ctx.fillStyle = config.labelColor;
        const gap = 3;

        for (let i = 0; i < n; i++) {
            const nc = finalFVNear[i];
            const fc = finalFVFar[i];
            ctx.beginPath(); ctx.arc(nc.x, nc.y, 2, 0, 2 * Math.PI); ctx.fill();

            if (Math.abs(nc.x - fc.x) < 1.5 && Math.abs(nc.y - fc.y) < 1.5) {
                const nlbl = nc.label;
                const flbl = fc.label;
                const nlW = ctx.measureText(nlbl).width;
                const lx = nc.x + 4;
                const ly = nc.y - 5;
                ctx.fillText(nlbl, lx, ly);
                ctx.fillText(flbl, lx + nlW + gap, ly);
            } else {
                ctx.fillText(nc.label, nc.x + 4, nc.y - 5);
                ctx.beginPath(); ctx.arc(fc.x, fc.y, 2, 0, 2 * Math.PI); ctx.fill();
                ctx.fillText(fc.label, fc.x + 4, fc.y + 12);
            }
        }
        ctx.restore();

    } else if (isPyramid && finalFVApex) {
        // Base edges
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            drawEdge(finalFVNear[i].x, finalFVNear[i].y,
                finalFVNear[j].x, finalFVNear[j].y,
                !isEdgeOnHull(finalFVNear[i], finalFVNear[j]));
        }
        // Slant edges to apex
        for (let i = 0; i < n; i++) {
            drawEdge(finalFVNear[i].x, finalFVNear[i].y,
                finalFVApex.x, finalFVApex.y,
                !isEdgeOnHull(finalFVNear[i], finalFVApex));
        }

        // Labels
        ctx.save();
        ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
        ctx.fillStyle = config.labelColor;
        for (let i = 0; i < n; i++) {
            const c = finalFVNear[i];
            ctx.beginPath(); ctx.arc(c.x, c.y, 2, 0, 2 * Math.PI); ctx.fill();
            ctx.fillText(c.label, c.x + 4, c.y - 5);
        }
        ctx.beginPath();
        ctx.arc(finalFVApex.x, finalFVApex.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(finalFVApex.label, finalFVApex.x + 4, finalFVApex.y - 5);
        ctx.restore();
    }

    // Axis construction line
    const nearCx = finalFVNear.reduce((s, c) => s + c.x, 0) / n;
    const nearCy = finalFVNear.reduce((s, c) => s + c.y, 0) / n;
    if (isPrism && finalFVFar) {
        const farCx = finalFVFar.reduce((s, c) => s + c.x, 0) / n;
        const farCy = finalFVFar.reduce((s, c) => s + c.y, 0) / n;
        drawLine(nearCx, nearCy, farCx, farCy, false, true);
    } else if (isPyramid && finalFVApex) {
        drawLine(nearCx, nearCy, finalFVApex.x, finalFVApex.y, false, true);
    }
}