// ========================================
// Case A - Axis Perpendicular to HP (LOCKED)
// ========================================
// This file contains all Case A drawing functions.
// DO NOT MODIFY — Case A logic is finalized.

// ========================================
// Drawing Functions - Case A Implementation
// ========================================
function drawCaseAStep(step) {
    const isPrism = state.solidType.includes('prism');
    const isPyramid = state.solidType.includes('pyramid');
    const sides = getSidesCount(state.solidType);

    switch (step) {
        case 1:
            updateInstructions('Step 1: Draw XY Reference Line',
                'Drawing the reference line (XY line) for first angle projection. Top View will be below this line, Front View above.');
            drawXYLine();
            break;

        case 2:
            updateInstructions('Step 2: Determine Base Orientation',
                `The solid axis is perpendicular to HP. One base edge will be at ${state.edgeAngle}° to VP (XY line).`);
            drawXYLine();
            drawAngleIndicator();
            break;

        case 3:
            updateInstructions('Step 3: Draw True Shape in Top View',
                `Drawing the ${state.solidType} base (${sides}-sided polygon) below the XY line. This is the true shape.`);
            drawXYLine();
            if (isPrism) {
                drawCaseA_TopViewPrism(sides);
            } else if (isPyramid) {
                drawCaseA_TopViewPyramid(sides);
            }
            break;

        case 4:
            updateInstructions('Step 4: Project to Front View',
                'Drawing vertical projectors from each corner in the top view to create the front view.');
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
            updateInstructions('Step 5: Complete Projection with Visible and Hidden Edges',
                'Completing the front view by identifying visible edges (solid lines) and hidden edges (dashed lines).');
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

// ========================================
// Case A - Top View for Prism
// ========================================
function drawCaseA_TopViewPrism(sides) {
    const baseEdge = state.baseEdge;
    const edgeAngle = degreesToRadians(state.edgeAngle);

    // Starting point for the polygon (30mm + baseEdge below XY, 40mm from left end)
    const startX = config.xyLineStartX + 40;
    const startY = config.xyLineY + 30 + baseEdge; // Below XY line per spec

    // Calculate polygon points
    const points = [];
    const insideAngle = degreesToRadians(180 - (360 / sides));

    // First point
    points.push({ x: startX, y: startY, label: 'a(1)' });

    // First edge direction (going down and at angle beta from vertical)
    let currentX = startX;
    let currentY = startY;
    let currentAngle = edgeAngle; // Angle measured from horizontal XY line

    // Calculate all points
    for (let i = 1; i < sides; i++) {
        currentX += baseEdge * Math.cos(currentAngle);
        currentY += baseEdge * Math.sin(currentAngle);
        points.push({
            x: currentX,
            y: currentY,
            label: String.fromCharCode(97 + i) + '(' + (i + 1) + ')'
        });
        currentAngle += Math.PI - insideAngle; // External angle
    }

    // Calculate center point
    let centerX = 0, centerY = 0;
    for (let pt of points) {
        centerX += pt.x;
        centerY += pt.y;
    }
    centerX /= points.length;
    centerY /= points.length;

    // Store corners in state
    state.corners.topView = points;
    state.corners.center = { x: centerX, y: centerY };

    // Draw the polygon edges
    ctx.save();
    ctx.strokeStyle = config.visibleColor;
    ctx.lineWidth = config.visibleLineWidth;
    ctx.setLineDash([]);

    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        if (i === 0) {
            ctx.moveTo(pt.x, pt.y);
        } else {
            ctx.lineTo(pt.x, pt.y);
        }
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Draw and label all corners
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    for (let pt of points) {
        // Draw point
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
        ctx.fill();

        // Label with both top and bottom corner notation
        ctx.fillText(pt.label, pt.x + 5, pt.y - 5);
    }

    // Mark center point 'O'
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText('O', centerX + 5, centerY - 5);
    ctx.restore();

    // Draw horizontal reference line and angle indicator
    const refLineEnd = points[0].x + 30;
    drawLine(points[0].x, config.xyLineY, refLineEnd, config.xyLineY, false, true);

    // Draw vertical line from first point to XY for reference
    drawLine(points[0].x, points[0].y, points[0].x, config.xyLineY, false, true);

    // Draw angle arc
    drawAngleArc(points[0].x, config.xyLineY, 20, 0, state.edgeAngle);
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;
    ctx.fillText(`${state.edgeAngle}°`, points[0].x + 25, config.xyLineY + 15);
    ctx.restore();
}

// ========================================
// Case A - Top View for Pyramid
// ========================================
function drawCaseA_TopViewPyramid(sides) {
    const baseEdge = state.baseEdge;
    const edgeAngle = degreesToRadians(state.edgeAngle);

    // Starting point for the pyramid base (30mm + baseEdge below XY, 40mm from left end)
    const startX = config.xyLineStartX + 40;
    const startY = config.xyLineY + 30 + baseEdge;

    // Calculate polygon points
    const points = [];
    const insideAngle = degreesToRadians(180 - (360 / sides));

    // First point
    points.push({ x: startX, y: startY, label: '1' });

    // Calculate all base corners
    let currentX = startX;
    let currentY = startY;
    let currentAngle = edgeAngle; // Angle measured from horizontal XY line

    for (let i = 1; i < sides; i++) {
        currentX += baseEdge * Math.cos(currentAngle);
        currentY += baseEdge * Math.sin(currentAngle);
        points.push({
            x: currentX,
            y: currentY,
            label: (i + 1).toString()
        });
        currentAngle += Math.PI - insideAngle;
    }

    // Calculate center (apex)
    let centerX = 0, centerY = 0;
    for (let pt of points) {
        centerX += pt.x;
        centerY += pt.y;
    }
    centerX /= points.length;
    centerY /= points.length;

    // Store corners
    state.corners.topView = points;
    state.corners.apex = { x: centerX, y: centerY, label: 'o' };

    // Draw base edges
    ctx.save();
    ctx.strokeStyle = config.visibleColor;
    ctx.lineWidth = config.visibleLineWidth;
    ctx.setLineDash([]);

    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        if (i === 0) {
            ctx.moveTo(pt.x, pt.y);
        } else {
            ctx.lineTo(pt.x, pt.y);
        }
    }
    ctx.closePath();
    ctx.stroke();

    // Draw slant edges from each corner to apex
    for (let pt of points) {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();
    }
    ctx.restore();

    // Draw and label corners
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    for (let pt of points) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(pt.label, pt.x + 5, pt.y - 5);
    }

    // Mark apex 'o'
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText('o', centerX + 5, centerY - 5);
    ctx.restore();
}

// ========================================
// Case A - Projectors for Prism
// ========================================
function drawCaseA_ProjectorsPrism(sides) {
    const points = state.corners.topView;
    const center = state.corners.center;

    // Draw vertical projector lines from each corner to XY line
    ctx.save();
    ctx.strokeStyle = config.constructionColor;
    ctx.lineWidth = config.constructionLineWidth;
    ctx.setLineDash([2, 2]);

    for (let pt of points) {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x, config.xyLineY - state.axisLength); // Extend above XY to FV area
        ctx.stroke();
    }

    // Draw projector from center
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x, config.xyLineY - state.axisLength); // Extend above XY
    ctx.stroke();

    ctx.restore();

    // Mark intersection points on XY line (base corners in FV)
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        ctx.beginPath();
        ctx.arc(pt.x, config.xyLineY, 2, 0, 2 * Math.PI);
        ctx.fill();

        const label = (i + 1) + "'";
        ctx.fillText(label, pt.x + 5, config.xyLineY - 8);
    }
    ctx.restore();
}

// ========================================
// Case A - Projectors for Pyramid
// ========================================
function drawCaseA_ProjectorsPyramid(sides) {
    const points = state.corners.topView;
    const apex = state.corners.apex;

    // Draw vertical projectors
    ctx.save();
    ctx.strokeStyle = config.constructionColor;
    ctx.lineWidth = config.constructionLineWidth;
    ctx.setLineDash([2, 2]);

    for (let pt of points) {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x, config.xyLineY - state.axisLength); // Extend above XY to FV area
        ctx.stroke();
    }

    // Projector from apex
    ctx.beginPath();
    ctx.moveTo(apex.x, apex.y);
    ctx.lineTo(apex.x, config.xyLineY - state.axisLength); // Extend above XY
    ctx.stroke();

    ctx.restore();

    // Mark base corners on XY line
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        ctx.beginPath();
        ctx.arc(pt.x, config.xyLineY, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText((i + 1) + "'", pt.x + 5, config.xyLineY - 8);
    }
    ctx.restore();
}

// ========================================
// Case A - Front View for Prism
// ========================================
function drawCaseA_FrontViewPrism(sides) {
    const points = state.corners.topView;
    const axisLength = state.axisLength;
    const centerY = state.corners.center.y;
    const n = points.length;

    // Build FV corners: base corners (1', 2'...) on XY, top corners (a', b'...) above
    const baseCorners = [];
    const topCorners = [];

    for (let i = 0; i < n; i++) {
        const pt = points[i];
        baseCorners.push({
            x: pt.x,
            y: config.xyLineY,
            label: (i + 1) + "'",
            tvY: pt.y // store TV y for hidden detection
        });
        topCorners.push({
            x: pt.x,
            y: config.xyLineY - axisLength,
            label: String.fromCharCode(97 + i) + "'",
            tvY: pt.y
        });
    }

    // Store FV corners in state for potential use by Case C
    state.corners.frontViewBase = baseCorners;
    state.corners.frontViewTop = topCorners;

    // Determine hidden status for each corner
    // Corners whose TV y < centerY (between center and XY line) are on the far side → hidden
    const isHidden = [];
    for (let i = 0; i < n; i++) {
        isHidden.push(points[i].y < centerY);
    }

    // Silhouette override: outermost edges (at minX/maxX) are ALWAYS visible
    const allX = baseCorners.map(c => c.x);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const EPS = 0.5; // tolerance for floating point comparison
    for (let i = 0; i < n; i++) {
        if (Math.abs(baseCorners[i].x - minX) < EPS || Math.abs(baseCorners[i].x - maxX) < EPS) {
            isHidden[i] = false; // force visible at outline
        }
    }

    // Helper to draw an edge with visibility
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

    // Draw hidden edges first, then visible (so visible lines win at overlaps)

    // 1. Base edges (hidden first)
    for (let pass = 0; pass < 2; pass++) {
        const drawHidden = (pass === 0);
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const edgeHidden = isHidden[i] && isHidden[j];
            if (edgeHidden === drawHidden) {
                drawEdge(baseCorners[i].x, baseCorners[i].y,
                    baseCorners[j].x, baseCorners[j].y, edgeHidden);
            }
        }
    }

    // 2. Top edges (hidden first)
    for (let pass = 0; pass < 2; pass++) {
        const drawHidden = (pass === 0);
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const edgeHidden = isHidden[i] && isHidden[j];
            if (edgeHidden === drawHidden) {
                drawEdge(topCorners[i].x, topCorners[i].y,
                    topCorners[j].x, topCorners[j].y, edgeHidden);
            }
        }
    }

    // 3. Vertical edges (hidden first)
    for (let pass = 0; pass < 2; pass++) {
        const drawHidden = (pass === 0);
        for (let i = 0; i < n; i++) {
            if (isHidden[i] === drawHidden) {
                drawEdge(baseCorners[i].x, baseCorners[i].y,
                    topCorners[i].x, topCorners[i].y, isHidden[i]);
            }
        }
    }

    // 4. Label all corners with point markers
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    for (let i = 0; i < n; i++) {
        // Base corner point and label
        ctx.beginPath();
        ctx.arc(baseCorners[i].x, baseCorners[i].y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(baseCorners[i].label, baseCorners[i].x + 5, baseCorners[i].y + 15);

        // Top corner point and label
        ctx.beginPath();
        ctx.arc(topCorners[i].x, topCorners[i].y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(topCorners[i].label, topCorners[i].x + 5, topCorners[i].y - 8);
    }
    ctx.restore();

    // 5. Draw axis line (construction)
    const centerX = state.corners.center.x;
    drawLine(centerX, config.xyLineY, centerX, config.xyLineY - axisLength, false, true);
}

// ========================================
// Case A - Front View for Pyramid
// ========================================
function drawCaseA_FrontViewPyramid(sides) {
    const points = state.corners.topView;
    const apex = state.corners.apex;
    const axisLength = state.axisLength;
    const centerY = apex.y; // apex Y in TV = center Y
    const n = points.length;

    // Build FV corners
    const baseCorners = [];
    for (let i = 0; i < n; i++) {
        baseCorners.push({
            x: points[i].x,
            y: config.xyLineY,
            label: (i + 1) + "'",
            tvY: points[i].y
        });
    }

    // Apex in FV: projected from TV apex, at height = axisLength above XY
    const apexFV = {
        x: apex.x,
        y: config.xyLineY - axisLength,
        label: "o'"
    };

    // Store FV corners in state
    state.corners.frontViewBase = baseCorners;
    state.corners.frontViewApex = apexFV;

    // Determine hidden status for each base corner
    const isHidden = [];
    for (let i = 0; i < n; i++) {
        isHidden.push(points[i].y < centerY);
    }

    // Silhouette override: outermost edges (at minX/maxX) are ALWAYS visible
    const allX = baseCorners.map(c => c.x);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const EPS = 0.5;
    for (let i = 0; i < n; i++) {
        if (Math.abs(baseCorners[i].x - minX) < EPS || Math.abs(baseCorners[i].x - maxX) < EPS) {
            isHidden[i] = false;
        }
    }

    // Helper to draw an edge with visibility
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

    // Draw hidden edges first, then visible

    // 1. Base edges
    for (let pass = 0; pass < 2; pass++) {
        const drawHidden = (pass === 0);
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const edgeHidden = isHidden[i] && isHidden[j];
            if (edgeHidden === drawHidden) {
                drawEdge(baseCorners[i].x, baseCorners[i].y,
                    baseCorners[j].x, baseCorners[j].y, edgeHidden);
            }
        }
    }

    // 2. Slant edges
    for (let pass = 0; pass < 2; pass++) {
        const drawHidden = (pass === 0);
        for (let i = 0; i < n; i++) {
            if (isHidden[i] === drawHidden) {
                drawEdge(baseCorners[i].x, baseCorners[i].y,
                    apexFV.x, apexFV.y, isHidden[i]);
            }
        }
    }

    // 3. Label all corners with point markers
    ctx.save();
    ctx.font = `${config.labelFontSize}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = config.labelColor;

    // Label base corners
    for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.arc(baseCorners[i].x, baseCorners[i].y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(baseCorners[i].label, baseCorners[i].x + 5, baseCorners[i].y + 15);
    }

    // Label apex
    ctx.beginPath();
    ctx.arc(apexFV.x, apexFV.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(apexFV.label, apexFV.x + 5, apexFV.y - 8);
    ctx.restore();

    // 4. Draw axis (construction line)
    drawLine(apex.x, config.xyLineY, apexFV.x, apexFV.y, false, true);
}
