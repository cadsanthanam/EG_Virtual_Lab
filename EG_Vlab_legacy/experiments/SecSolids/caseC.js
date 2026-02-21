// ========================================
// Case C - Axis Inclined to HP
// ========================================
// Phase I reuses Case A functions (from caseA.js)
// Phase II implements the final FV rotation, projectors/loci, and final TV

// ========================================
// Case C - Auto-compute β from resting condition
// ========================================
function computeCaseC_Beta() {
    const sides = getSidesCount(state.solidType);

    // Per solids.md: Case C resting is always base-edge or base-corner
    // for BOTH prisms and pyramids
    if (state.restingOn === 'base-edge') {
        // Resting on base edge: β = 90° (edge perpendicular to XY, vertical on right side)
        return 90;
    } else if (state.restingOn === 'base-corner') {
        // Resting on base corner: shape-specific β
        // Odd-sided (3,5): β=270° flips polygon so vertical edge is on LEFT,
        // resting corner becomes the rightmost point (as required by spec)
        switch (sides) {
            case 3: return 270; // Triangle: vertical edge on LEFT, corner on RIGHT
            case 4: return 45;  // Square: 45°
            case 5: return 270; // Pentagon: vertical edge on LEFT, corner on RIGHT
            case 6: return 0;   // Hexagon: horizontal edge
            default: return 0;
        }
    }
    // Default: resting on base edge
    return 90;
}

// ========================================
// Case C - Step Dispatcher
// ========================================
function drawCaseCStep(step) {
    const isPrism = state.solidType.includes('prism');
    const isPyramid = state.solidType.includes('pyramid');
    const sides = getSidesCount(state.solidType);

    // Auto-compute β for Phase I
    const savedEdgeAngle = state.edgeAngle;
    state.edgeAngle = computeCaseC_Beta();

    // Phase I: Steps 1–5 reuse Case A
    if (step <= 5) {
        // Prefix instructions with "Phase I" context
        const phasePrefix = 'Phase I (Initial Position): ';
        switch (step) {
            case 1:
                updateInstructions('Phase I - Step 1: Draw XY Reference Line',
                    'Drawing the XY line. Phase I places the solid with axis ⊥ HP to get the initial views.');
                drawXYLine();
                break;
            case 2:
                updateInstructions('Phase I - Step 2: Determine Base Orientation',
                    `Initial position: edge angle β = ${state.edgeAngle}° (auto-determined from resting condition: ${state.restingOn || 'base-edge'}).`);
                drawXYLine();
                drawAngleIndicator();
                break;
            case 3:
                updateInstructions('Phase I - Step 3: Draw Initial Top View (True Shape)',
                    `Drawing the ${state.solidType} base with β = ${state.edgeAngle}°. This is the true shape in the initial position.`);
                drawXYLine();
                if (isPrism) drawCaseA_TopViewPrism(sides);
                else if (isPyramid) drawCaseA_TopViewPyramid(sides);
                break;
            case 4:
                updateInstructions('Phase I - Step 4: Project to Initial Front View',
                    'Drawing projectors from initial TV to get the initial FV.');
                drawXYLine();
                if (isPrism) {
                    drawCaseA_TopViewPrism(sides);
                    drawCaseA_ProjectorsPrism(sides);
                } else if (isPyramid) {
                    drawCaseA_TopViewPyramid(sides);
                    drawCaseA_ProjectorsPyramid(sides);
                }
                break;
            case 5:
                updateInstructions('Phase I - Step 5: Complete Initial Front View',
                    'Initial FV complete with visible and hidden edges. The axis is vertical (⊥ HP) here.');
                drawXYLine();
                if (isPrism) {
                    drawCaseA_TopViewPrism(sides);
                    drawCaseA_FrontViewPrism(sides);
                } else if (isPyramid) {
                    drawCaseA_TopViewPyramid(sides);
                    drawCaseA_FrontViewPyramid(sides);
                }
                break;
        }
    }

    // Phase II: Steps 6–8
    if (step >= 6) {
        // Always draw initial views first (they remain on the sheet)
        drawXYLine();
        if (isPrism) {
            drawCaseA_TopViewPrism(sides);
            drawCaseA_FrontViewPrism(sides);
        } else if (isPyramid) {
            drawCaseA_TopViewPyramid(sides);
            drawCaseA_FrontViewPyramid(sides);
        }

        switch (step) {
            case 6:
                updateInstructions('Phase II - Step 6: Draw Final Front View (Axis Inclined)',
                    `Rotating the initial FV by ${state.axisAngleHP}° about the lower-right pivot so the axis is inclined to HP.`);
                drawCaseC_FinalFrontView();
                break;
            case 7:
                updateInstructions('Phase II - Step 7: Project to Final Top View',
                    'Drawing vertical projectors from final FV and horizontal loci from initial TV to find intersection points.');
                drawCaseC_FinalFrontView();
                drawCaseC_ProjectorsAndLoci();
                break;
            case 8:
                updateInstructions('Phase II - Step 8: Complete Final Top View',
                    'Joining the intersection points to get the final TV with visible and hidden edges.');
                drawCaseC_FinalFrontView();
                drawCaseC_ProjectorsAndLoci();
                drawCaseC_FinalTopView();
                break;
        }
    }

    // Restore edge angle
    state.edgeAngle = savedEdgeAngle;
}

// ========================================
// Case C - Final Front View (Rotated)
// ========================================
function drawCaseC_FinalFrontView() {
    const isPrism = state.solidType.includes('prism');
    const isPyramid = state.solidType.includes('pyramid');
    const theta = degreesToRadians(state.axisAngleHP);
    const offset = 45 + 2 * state.baseEdge; // Translation distance

    // Get initial FV corners
    const initBase = state.corners.frontViewBase;
    const initTop = isPrism ? state.corners.frontViewTop : null;
    const initApex = isPyramid ? state.corners.frontViewApex : null;

    if (!initBase || initBase.length === 0) return;

    // Find pivot: lower-right corner (max X on XY line)
    let pivotIdx = 0;
    for (let i = 1; i < initBase.length; i++) {
        if (initBase[i].x > initBase[pivotIdx].x ||
            (initBase[i].x === initBase[pivotIdx].x && initBase[i].y > initBase[pivotIdx].y)) {
            pivotIdx = i;
        }
    }
    const pivot = { x: initBase[pivotIdx].x, y: initBase[pivotIdx].y };

    // Rotate all corners around pivot by theta
    function rotateAroundPivot(pt) {
        const dx = pt.x - pivot.x;
        const dy = pt.y - pivot.y;
        // Rotate counter-clockwise in screen coords so the axis tilts from
        // vertical towards HP. Positive theta = axis moves towards horizontal.
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        return {
            x: pivot.x + dx * cos - dy * sin,
            y: pivot.y + dx * sin + dy * cos
        };
    }

    // Compute rotated + translated corners
    const finalBase = [];
    for (let i = 0; i < initBase.length; i++) {
        const rot = rotateAroundPivot(initBase[i]);
        finalBase.push({
            x: rot.x + offset,
            y: rot.y,
            label: (i + 1) + "₁'",
            tvY: initBase[i].tvY
        });
    }

    let finalTop = null;
    let finalApex = null;

    if (isPrism && initTop) {
        finalTop = [];
        for (let i = 0; i < initTop.length; i++) {
            const rot = rotateAroundPivot(initTop[i]);
            finalTop.push({
                x: rot.x + offset,
                y: rot.y,
                label: String.fromCharCode(97 + i) + "₁'",
                tvY: initTop[i].tvY
            });
        }
    }

    if (isPyramid && initApex) {
        const rot = rotateAroundPivot(initApex);
        finalApex = {
            x: rot.x + offset,
            y: rot.y,
            label: "o₁'"
        };
    }

    // Store final FV corners
    state.corners.finalFVBase = finalBase;
    state.corners.finalFVTop = finalTop;
    state.corners.finalFVApex = finalApex;
    state.corners.finalFVPivotOffset = offset;

    const n = finalBase.length;

    // Draw using corner-joining logic (visible edges only for now — simplified)
    // For final FV, use same hidden detection as Case A but with final corners
    function drawEdge(x1, y1, x2, y2, hidden) {
        ctx.save();
        if (hidden) {
            ctx.strokeStyle = config.hiddenColor;
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = config.hiddenLineWidth;
        } else {
            ctx.strokeStyle = config.visibleColor;
            ctx.setLineDash([]);
            ctx.lineWidth = config.visibleLineWidth;
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }

    // Hidden detection: use same TV-based logic from initial view
    const centerY = state.corners.center ? state.corners.center.y :
        (state.corners.apex ? state.corners.apex.y : 0);
    const isHidden = [];
    const points = state.corners.topView;
    for (let i = 0; i < n; i++) {
        isHidden.push(points[i].y < centerY);
    }

    // Silhouette override using final FV positions
    const allX = finalBase.map(c => c.x);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    if (finalTop) {
        for (const c of finalTop) {
            allX.push(c.x);
        }
    }
    const fvMinX = Math.min(...allX);
    const fvMaxX = Math.max(...allX);
    const EPS = 0.5;
    for (let i = 0; i < n; i++) {
        if (Math.abs(finalBase[i].x - fvMinX) < EPS || Math.abs(finalBase[i].x - fvMaxX) < EPS) {
            isHidden[i] = false;
        }
        if (finalTop && (Math.abs(finalTop[i].x - fvMinX) < EPS || Math.abs(finalTop[i].x - fvMaxX) < EPS)) {
            isHidden[i] = false;
        }
    }

    if (isPrism && finalTop) {
        // Draw hidden first, then visible
        for (let pass = 0; pass < 2; pass++) {
            const drawHidden = (pass === 0);

            // Base edges
            for (let i = 0; i < n; i++) {
                const j = (i + 1) % n;
                const edgeHidden = isHidden[i] && isHidden[j];
                if (edgeHidden === drawHidden) {
                    drawEdge(finalBase[i].x, finalBase[i].y,
                        finalBase[j].x, finalBase[j].y, edgeHidden);
                }
            }

            // Top edges
            for (let i = 0; i < n; i++) {
                const j = (i + 1) % n;
                const edgeHidden = isHidden[i] && isHidden[j];
                if (edgeHidden === drawHidden) {
                    drawEdge(finalTop[i].x, finalTop[i].y,
                        finalTop[j].x, finalTop[j].y, edgeHidden);
                }
            }

            // Vertical edges
            for (let i = 0; i < n; i++) {
                if (isHidden[i] === drawHidden) {
                    drawEdge(finalBase[i].x, finalBase[i].y,
                        finalTop[i].x, finalTop[i].y, isHidden[i]);
                }
            }
        }

        // Label corners
        ctx.save();
        ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
        ctx.fillStyle = config.labelColor;
        for (let i = 0; i < n; i++) {
            ctx.beginPath(); ctx.arc(finalBase[i].x, finalBase[i].y, 2, 0, 2 * Math.PI); ctx.fill();
            ctx.fillText(finalBase[i].label, finalBase[i].x + 5, finalBase[i].y + 15);
            ctx.beginPath(); ctx.arc(finalTop[i].x, finalTop[i].y, 2, 0, 2 * Math.PI); ctx.fill();
            ctx.fillText(finalTop[i].label, finalTop[i].x + 5, finalTop[i].y - 8);
        }
        ctx.restore();

    } else if (isPyramid && finalApex) {
        // Draw hidden first, then visible
        for (let pass = 0; pass < 2; pass++) {
            const drawHidden = (pass === 0);

            // Base edges
            for (let i = 0; i < n; i++) {
                const j = (i + 1) % n;
                const edgeHidden = isHidden[i] && isHidden[j];
                if (edgeHidden === drawHidden) {
                    drawEdge(finalBase[i].x, finalBase[i].y,
                        finalBase[j].x, finalBase[j].y, edgeHidden);
                }
            }

            // Slant edges
            for (let i = 0; i < n; i++) {
                if (isHidden[i] === drawHidden) {
                    drawEdge(finalBase[i].x, finalBase[i].y,
                        finalApex.x, finalApex.y, isHidden[i]);
                }
            }
        }

        // Label corners
        ctx.save();
        ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
        ctx.fillStyle = config.labelColor;
        for (let i = 0; i < n; i++) {
            ctx.beginPath(); ctx.arc(finalBase[i].x, finalBase[i].y, 2, 0, 2 * Math.PI); ctx.fill();
            ctx.fillText(finalBase[i].label, finalBase[i].x + 5, finalBase[i].y + 15);
        }
        ctx.beginPath(); ctx.arc(finalApex.x, finalApex.y, 2, 0, 2 * Math.PI); ctx.fill();
        ctx.fillText(finalApex.label, finalApex.x + 5, finalApex.y - 8);
        ctx.restore();
    }

    // Draw axis construction line
    const baseCenterX = finalBase.reduce((s, c) => s + c.x, 0) / n;
    const baseCenterY = finalBase.reduce((s, c) => s + c.y, 0) / n;
    if (isPrism && finalTop) {
        const topCenterX = finalTop.reduce((s, c) => s + c.x, 0) / n;
        const topCenterY = finalTop.reduce((s, c) => s + c.y, 0) / n;
        drawLine(baseCenterX, baseCenterY, topCenterX, topCenterY, false, true);
    } else if (isPyramid && finalApex) {
        drawLine(baseCenterX, baseCenterY, finalApex.x, finalApex.y, false, true);
    }
}

// ========================================
// Convex Hull Utility (Andrew's Monotone Chain)
// ========================================
function convexHull(points) {
    // Returns vertices of the convex hull in CCW order
    const pts = points.map((p, i) => ({ x: p.x, y: p.y, idx: i }));
    pts.sort((a, b) => a.x - b.x || a.y - b.y);
    const n = pts.length;
    if (n <= 2) return pts;

    function cross(O, A, B) {
        return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
    }

    // Lower hull
    const lower = [];
    for (const p of pts) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
            lower.pop();
        }
        lower.push(p);
    }

    // Upper hull
    const upper = [];
    for (let i = pts.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[i]) <= 0) {
            upper.pop();
        }
        upper.push(pts[i]);
    }

    // Remove last point of each half because it's repeated
    lower.pop();
    upper.pop();

    return lower.concat(upper);
}

function isOnConvexHull(pt, hullSet) {
    // Check if a point is on the convex hull using a pre-built coordinate set
    const key = pt.x.toFixed(2) + ',' + pt.y.toFixed(2);
    return hullSet.has(key);
}

function buildHullSet(points) {
    const hull = convexHull(points);
    const set = new Set();
    for (const p of hull) {
        set.add(p.x.toFixed(2) + ',' + p.y.toFixed(2));
    }
    return set;
}

// ========================================
// Segment Intersection & Point-in-Polygon
// ========================================

// Returns true if segments (p1-p2) and (p3-p4) properly cross each other
// (excludes shared endpoints / touching at endpoints)
function segmentsIntersect(p1, p2, p3, p4) {
    const EPS = 1e-9;
    function cross2D(o, a, b) {
        return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    }
    const d1 = cross2D(p3, p4, p1);
    const d2 = cross2D(p3, p4, p2);
    const d3 = cross2D(p1, p2, p3);
    const d4 = cross2D(p1, p2, p4);

    // Proper intersection: endpoints on strictly opposite sides
    if (((d1 > EPS && d2 < -EPS) || (d1 < -EPS && d2 > EPS)) &&
        ((d3 > EPS && d4 < -EPS) || (d3 < -EPS && d4 > EPS))) {
        return true;
    }
    return false;
}

// Returns true if point is inside the polygon (ray-casting algorithm)
function isPointInsidePolygon(pt, polygon) {
    let inside = false;
    const n = polygon.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        if (((yi > pt.y) !== (yj > pt.y)) &&
            (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

// ========================================
// Case C - Projectors and Loci
// ========================================
function drawCaseC_ProjectorsAndLoci() {
    const isPrism = state.solidType.includes('prism');
    const isPyramid = state.solidType.includes('pyramid');

    // Initial TV corners
    const initTV = state.corners.topView;
    const initTVCenter = state.corners.center;
    const initTVApex = state.corners.apex;

    // Final FV corners
    const finalFVBase = state.corners.finalFVBase;
    const finalFVTop = state.corners.finalFVTop;
    const finalFVApex = state.corners.finalFVApex;

    if (!initTV || !finalFVBase) return;

    const n = initTV.length;

    // Find the lowest Y in initial TV (farthest from XY) for projector extent
    let maxTVY = 0;
    for (const pt of initTV) {
        if (pt.y > maxTVY) maxTVY = pt.y;
    }
    if (initTVCenter && initTVCenter.y > maxTVY) maxTVY = initTVCenter.y;
    if (initTVApex && initTVApex.y > maxTVY) maxTVY = initTVApex.y;
    maxTVY += 20; // Add margin

    // Find rightmost X of final FV for loci extent
    let maxFVX = 0;
    for (const pt of finalFVBase) {
        if (pt.x > maxFVX) maxFVX = pt.x;
    }
    if (finalFVTop) {
        for (const pt of finalFVTop) {
            if (pt.x > maxFVX) maxFVX = pt.x;
        }
    }
    if (finalFVApex && finalFVApex.x > maxFVX) maxFVX = finalFVApex.x;
    maxFVX += 30; // Add margin

    ctx.save();
    ctx.strokeStyle = config.constructionColor;
    ctx.lineWidth = config.constructionLineWidth;
    ctx.setLineDash([2, 2]);

    // 1. Vertical projectors from final FV corners downward
    for (const pt of finalFVBase) {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x, maxTVY);
        ctx.stroke();
    }
    if (isPrism && finalFVTop) {
        for (const pt of finalFVTop) {
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x, maxTVY);
            ctx.stroke();
        }
    }
    if (isPyramid && finalFVApex) {
        ctx.beginPath();
        ctx.moveTo(finalFVApex.x, finalFVApex.y);
        ctx.lineTo(finalFVApex.x, maxTVY);
        ctx.stroke();
    }

    // 2. Horizontal loci from initial TV corners rightward
    for (const pt of initTV) {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(maxFVX, pt.y);
        ctx.stroke();
    }
    // Center/Apex locus
    if (isPrism && initTVCenter) {
        ctx.beginPath();
        ctx.moveTo(initTVCenter.x, initTVCenter.y);
        ctx.lineTo(maxFVX, initTVCenter.y);
        ctx.stroke();
    }
    if (isPyramid && initTVApex) {
        ctx.beginPath();
        ctx.moveTo(initTVApex.x, initTVApex.y);
        ctx.lineTo(maxFVX, initTVApex.y);
        ctx.stroke();
    }

    ctx.restore();

    // 3. Compute intersection points (final TV corners)
    // For each corner: final TV x = final FV x (from vertical projector),
    //                  final TV y = initial TV y (from horizontal locus of same corner)
    const finalTV = [];
    for (let i = 0; i < n; i++) {
        // For prisms: base corners map to base corners, top corners map to top corners
        // Both base and top TV corners in initial position coincide (same polygon)
        // so we use the same initTV[i].y for both
        finalTV.push({
            x: finalFVBase[i].x,
            y: initTV[i].y,
            label: (i + 1) + '₁',
            isBase: true
        });
    }

    let finalTVTop = null;
    let finalTVApex = null;

    if (isPrism && finalFVTop) {
        finalTVTop = [];
        for (let i = 0; i < n; i++) {
            finalTVTop.push({
                x: finalFVTop[i].x,
                y: initTV[i].y, // Same y as base (they coincide in TV of Case A)
                label: String.fromCharCode(97 + i) + '₁'
            });
        }
    }

    if (isPyramid && finalFVApex && initTVApex) {
        finalTVApex = {
            x: finalFVApex.x,
            y: initTVApex.y,
            label: 'o₁'
        };
    }

    // Store final TV corners
    state.corners.finalTV = finalTV;
    state.corners.finalTVTop = finalTVTop;
    state.corners.finalTVApex = finalTVApex;

    // Mark intersection points
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    for (const pt of finalTV) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(pt.label, pt.x + 5, pt.y - 5);
    }
    if (finalTVTop) {
        for (const pt of finalTVTop) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillText(pt.label, pt.x + 5, pt.y + 15);
        }
    }
    if (finalTVApex) {
        ctx.beginPath();
        ctx.arc(finalTVApex.x, finalTVApex.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(finalTVApex.label, finalTVApex.x + 5, finalTVApex.y - 5);
    }
    ctx.restore();
}

// ========================================
// Case C - Final Top View
// ========================================
function drawCaseC_FinalTopView() {
    const isPrism = state.solidType.includes('prism');
    const isPyramid = state.solidType.includes('pyramid');

    const finalTV = state.corners.finalTV;
    const finalTVTop = state.corners.finalTVTop;
    const finalTVApex = state.corners.finalTVApex;

    if (!finalTV || finalTV.length === 0) return;

    const n = finalTV.length;

    function drawEdge(x1, y1, x2, y2, hidden) {
        ctx.save();
        if (hidden) {
            ctx.strokeStyle = config.hiddenColor;
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = config.hiddenLineWidth;
        } else {
            ctx.strokeStyle = config.visibleColor;
            ctx.setLineDash([]);
            ctx.lineWidth = config.visibleLineWidth;
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }

    if (isPrism && finalTVTop) {
        // STEP 1: Compute convex hull of ALL final TV points
        // Outermost edges (on the hull boundary) are ALWAYS visible.
        const allPts = [...finalTV, ...finalTVTop];
        const hullPts = convexHull(allPts);
        const hullSet = buildHullSet(allPts);

        // Helper: is an edge on the convex hull boundary?
        function isEdgeOnHull(pA, pB) {
            const EPS = 1.0;
            for (let k = 0; k < hullPts.length; k++) {
                const m = (k + 1) % hullPts.length;
                // Check both directions (pA→pB matches hull[k]→hull[m] or reverse)
                if ((Math.abs(pA.x - hullPts[k].x) < EPS && Math.abs(pA.y - hullPts[k].y) < EPS &&
                    Math.abs(pB.x - hullPts[m].x) < EPS && Math.abs(pB.y - hullPts[m].y) < EPS) ||
                    (Math.abs(pA.x - hullPts[m].x) < EPS && Math.abs(pA.y - hullPts[m].y) < EPS &&
                        Math.abs(pB.x - hullPts[k].x) < EPS && Math.abs(pB.y - hullPts[k].y) < EPS)) {
                    return true;
                }
            }
            return false;
        }

        // Helper: does segment (pA-pB) cross any top-surface edge?
        function crossesTopSurface(pA, pB) {
            for (let k = 0; k < n; k++) {
                const m = (k + 1) % n;
                if (segmentsIntersect(pA, pB, finalTVTop[k], finalTVTop[m])) {
                    return true;
                }
            }
            return false;
        }

        // Helper: is edge midpoint inside the top polygon?
        function midpointInsideTop(pA, pB) {
            const mid = { x: (pA.x + pB.x) / 2, y: (pA.y + pB.y) / 2 };
            return isPointInsidePolygon(mid, finalTVTop);
        }

        // 1. Top surface edges — ALWAYS visible
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            drawEdge(finalTVTop[i].x, finalTVTop[i].y,
                finalTVTop[j].x, finalTVTop[j].y, false);
        }

        // 2. Base edges — OVERRIDE: if edge is on hull boundary → visible
        //    Otherwise: hidden if it crosses top surface or lies inside it
        const baseEdgeHidden = [];
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            let hidden;
            if (isEdgeOnHull(finalTV[i], finalTV[j])) {
                hidden = false; // Outermost edge — always visible
            } else {
                hidden = crossesTopSurface(finalTV[i], finalTV[j]) ||
                    midpointInsideTop(finalTV[i], finalTV[j]);
            }
            baseEdgeHidden.push(hidden);
            drawEdge(finalTV[i].x, finalTV[i].y,
                finalTV[j].x, finalTV[j].y, hidden);
        }

        // 3. Longer edges — OVERRIDE: if edge is on hull boundary → visible
        //    Otherwise: hidden if it crosses top surface or base corner has 2 hidden base edges
        for (let i = 0; i < n; i++) {
            let hidden;
            if (isEdgeOnHull(finalTV[i], finalTVTop[i])) {
                hidden = false; // Outermost edge — always visible
            } else {
                const prevI = (i - 1 + n) % n;
                let hiddenAdjacentCount = 0;
                if (baseEdgeHidden[prevI]) hiddenAdjacentCount++;
                if (baseEdgeHidden[i]) hiddenAdjacentCount++;

                hidden = crossesTopSurface(finalTV[i], finalTVTop[i]) ||
                    hiddenAdjacentCount >= 2;
            }

            drawEdge(finalTV[i].x, finalTV[i].y,
                finalTVTop[i].x, finalTVTop[i].y, hidden);
        }

        // Label corners
        ctx.save();
        ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
        ctx.fillStyle = config.labelColor;
        for (let i = 0; i < n; i++) {
            ctx.beginPath(); ctx.arc(finalTV[i].x, finalTV[i].y, 2, 0, 2 * Math.PI); ctx.fill();
            ctx.fillText(finalTV[i].label, finalTV[i].x + 5, finalTV[i].y + 15);
            ctx.beginPath(); ctx.arc(finalTVTop[i].x, finalTVTop[i].y, 2, 0, 2 * Math.PI); ctx.fill();
            ctx.fillText(finalTVTop[i].label, finalTVTop[i].x + 5, finalTVTop[i].y - 8);
        }
        ctx.restore();

    } else if (isPyramid && finalTVApex) {
        // STEP 1: Compute convex hull — outermost edges are ALWAYS visible
        const allPts = [...finalTV, finalTVApex];
        const hullSet = buildHullSet(allPts);
        const hullPts = convexHull(allPts);

        // Helper: is an edge on the convex hull boundary?
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

        const baseOnHull = [];
        for (let i = 0; i < n; i++) {
            baseOnHull.push(isOnConvexHull(finalTV[i], hullSet));
        }

        // Base edges — OVERRIDE: hull boundary edges are always visible
        const baseEdgeHidden = [];
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            let hidden;
            if (isEdgeOnHull(finalTV[i], finalTV[j])) {
                hidden = false; // Outermost edge — always visible
            } else {
                hidden = !baseOnHull[i] && !baseOnHull[j];
            }
            baseEdgeHidden.push(hidden);
        }

        // Draw base edges (hidden first, then visible)
        for (let pass = 0; pass < 2; pass++) {
            const drawHidden = (pass === 0);
            for (let i = 0; i < n; i++) {
                const j = (i + 1) % n;
                if (baseEdgeHidden[i] === drawHidden) {
                    drawEdge(finalTV[i].x, finalTV[i].y,
                        finalTV[j].x, finalTV[j].y, baseEdgeHidden[i]);
                }
            }
        }

        // Slant edges — OVERRIDE: hull boundary edges are always visible
        //   Otherwise: hidden if base corner has 2 hidden adjacent base edges
        for (let pass = 0; pass < 2; pass++) {
            const drawHidden = (pass === 0);
            for (let i = 0; i < n; i++) {
                let edgeHidden;
                if (isEdgeOnHull(finalTV[i], finalTVApex)) {
                    edgeHidden = false; // Outermost — always visible
                } else {
                    const prevI = (i - 1 + n) % n;
                    let hiddenAdjacentCount = 0;
                    if (baseEdgeHidden[prevI]) hiddenAdjacentCount++;
                    if (baseEdgeHidden[i]) hiddenAdjacentCount++;
                    edgeHidden = hiddenAdjacentCount >= 2;
                }
                if (edgeHidden === drawHidden) {
                    drawEdge(finalTV[i].x, finalTV[i].y,
                        finalTVApex.x, finalTVApex.y, edgeHidden);
                }
            }
        }

        // Label
        ctx.save();
        ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
        ctx.fillStyle = config.labelColor;
        for (let i = 0; i < n; i++) {
            ctx.beginPath(); ctx.arc(finalTV[i].x, finalTV[i].y, 2, 0, 2 * Math.PI); ctx.fill();
            ctx.fillText(finalTV[i].label, finalTV[i].x + 5, finalTV[i].y + 15);
        }
        ctx.beginPath(); ctx.arc(finalTVApex.x, finalTVApex.y, 2, 0, 2 * Math.PI); ctx.fill();
        ctx.fillText(finalTVApex.label, finalTVApex.x + 5, finalTVApex.y - 8);
        ctx.restore();
    }
}
