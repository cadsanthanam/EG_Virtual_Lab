/**
 * Canvas Renderer — Interprets backend JSON render instructions.
 *
 * This is the core frontend module. Each function ports a specific
 * Canvas 2D drawing function from core.js. The renderer is solid-agnostic
 * and case-agnostic — adding new solid types or cases requires zero
 * frontend changes.
 *
 * Source mapping:
 *   drawLineElement()    ← drawLine()      core.js:437-460
 *   drawPointElement()   ← drawPoint()     core.js:462-475
 *   drawPolygonElement() ← drawPolygon()   core.js:477-497
 *   drawArrowElement()   ← drawArrow()     core.js:423-435
 *   drawArcElement()     ← drawAngleArc()  core.js:499-510
 *   drawLabelElement()   ← (new)
 */

import type {
    ArcElement,
    ArrowElement,
    LabelElement,
    LineElement,
    PointElement,
    PolygonElement,
    RenderElement,
    StepInstruction,
} from '@/types/projection';

// ============================================================
// Drawing Configuration — Direct port of core.js:36-50
// ============================================================

export const DRAW_CONFIG = {
    /** core.js:41 */
    visibleLineWidth: 1.5,
    /** core.js:42 */
    hiddenLineWidth: 1,
    /** core.js:43 */
    constructionLineWidth: 0.5,
    /** core.js:44 */
    visibleColor: '#0f172a',
    /** core.js:45 */
    hiddenColor: '#64748b',
    /** core.js:46 */
    constructionColor: '#cbd5e1',
    /** core.js:47 */
    xyLineColor: '#1e293b',
    /** core.js:48 */
    labelFontSize: 12,
    /** core.js:49 */
    labelColor: '#0f172a',
    /** Point marker radius — matches drawPoint() in core.js:466 */
    defaultPointRadius: 2,
    /** Font family — matches core.js:411 system font stack */
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
} as const;

// ============================================================
// Transform state for zoom/pan
// ============================================================

export interface CanvasTransform {
    zoom: number;
    panX: number;
    panY: number;
}

// ============================================================
// Main render function
// ============================================================

/**
 * Render a complete step onto the canvas.
 *
 * Clears the canvas, applies the zoom/pan transform, and draws all
 * elements in order. Elements are drawn in the order they appear in
 * the array — the backend guarantees correct z-ordering (hidden
 * edges first, then visible edges on top).
 *
 * @param ctx - Canvas 2D rendering context.
 * @param step - Step instruction containing all render elements.
 * @param canvasWidth - Physical canvas width in pixels.
 * @param canvasHeight - Physical canvas height in pixels.
 * @param transform - Current zoom/pan state.
 */
export function renderStep(
    ctx: CanvasRenderingContext2D,
    step: StepInstruction,
    canvasWidth: number,
    canvasHeight: number,
    transform: CanvasTransform = { zoom: 1, panX: 0, panY: 0 },
): void {
    // Clear canvas
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // Apply zoom/pan — port of applyTransform() in core.js:75-77
    ctx.save();
    ctx.setTransform(
        transform.zoom, 0,
        0, transform.zoom,
        transform.panX, transform.panY,
    );

    // Draw all elements in order
    for (const element of step.elements) {
        drawElement(ctx, element);
    }

    ctx.restore();
}

/**
 * Dispatch a single render element to its type-specific draw function.
 */
export function drawElement(ctx: CanvasRenderingContext2D, element: RenderElement): void {
    switch (element.type) {
        case 'line':
            drawLineElement(ctx, element);
            break;
        case 'polygon':
            drawPolygonElement(ctx, element);
            break;
        case 'point':
            drawPointElement(ctx, element);
            break;
        case 'label':
            drawLabelElement(ctx, element);
            break;
        case 'arc':
            drawArcElement(ctx, element);
            break;
        case 'arrow':
            drawArrowElement(ctx, element);
            break;
    }
}

/**
 * Render a raw array of elements onto the canvas.
 *
 * Used by curve lab pages that manage their own canvas lifecycle
 * (clearing, transforms) but want to reuse the element drawing.
 *
 * @param yFlipped - Set true when the canvas has a negative Y scale
 *   (math coords). Text elements will be counter-flipped so labels
 *   render right-side-up.
 */
export function renderElements(
    ctx: CanvasRenderingContext2D,
    elements: RenderElement[],
    yFlipped: boolean = false,
): void {
    for (const element of elements) {
        // Text-bearing elements need counter-flip when Y is inverted
        if (yFlipped && (element.type === 'label' || element.type === 'point')) {
            ctx.save();
            const tx = element.x;
            const ty = element.y;
            // Move to element position, flip Y back, draw at origin
            ctx.translate(tx, ty);
            ctx.scale(1, -1);
            // Draw a copy shifted to origin
            if (element.type === 'label') {
                drawLabelElement(ctx, { ...element, x: 0, y: 0 });
            } else {
                // For point: draw the circle at (0,0) and label
                drawPointElement(ctx, { ...element, x: 0, y: 0 });
            }
            ctx.restore();
        } else {
            drawElement(ctx, element);
        }
    }
}

// ============================================================
// Element-specific drawing functions
// ============================================================

/**
 * Draw a line segment.
 *
 * Port of drawLine() from core.js:437-460.
 * Style mapping:
 *   - 'visible'      → solid line, visibleColor, 1.5px (core.js:448-451)
 *   - 'hidden'       → dashed [5,5], hiddenColor, 1px (core.js:444-447)
 *   - 'construction' → dashed [2,2], constructionColor, 0.5px (core.js:440-443)
 */
function drawLineElement(ctx: CanvasRenderingContext2D, el: LineElement): void {
    ctx.save();

    switch (el.style) {
        case 'construction':
            // core.js:440-443
            ctx.strokeStyle = DRAW_CONFIG.constructionColor;
            ctx.lineWidth = DRAW_CONFIG.constructionLineWidth;
            ctx.setLineDash([2, 2]);
            break;
        case 'hidden':
            // core.js:444-447
            ctx.strokeStyle = DRAW_CONFIG.hiddenColor;
            ctx.lineWidth = DRAW_CONFIG.hiddenLineWidth;
            ctx.setLineDash([5, 5]);
            break;
        case 'visible':
        default:
            // core.js:448-451
            ctx.strokeStyle = DRAW_CONFIG.visibleColor;
            ctx.lineWidth = DRAW_CONFIG.visibleLineWidth;
            ctx.setLineDash([]);
            break;
    }

    ctx.beginPath();
    ctx.moveTo(el.x1, el.y1);
    ctx.lineTo(el.x2, el.y2);
    ctx.stroke();

    ctx.restore();
}

/**
 * Draw a polygon (closed or open path).
 *
 * Port of drawPolygon() from core.js:477-497.
 * The backend pre-computes all vertex positions — this function
 * only draws the path.
 */
function drawPolygonElement(ctx: CanvasRenderingContext2D, el: PolygonElement): void {
    if (el.points.length < 2) return;

    ctx.save();

    switch (el.style) {
        case 'construction':
            ctx.strokeStyle = DRAW_CONFIG.constructionColor;
            ctx.lineWidth = DRAW_CONFIG.constructionLineWidth;
            ctx.setLineDash([2, 2]);
            break;
        case 'hidden':
            ctx.strokeStyle = DRAW_CONFIG.hiddenColor;
            ctx.lineWidth = DRAW_CONFIG.hiddenLineWidth;
            ctx.setLineDash([5, 5]);
            break;
        case 'visible':
        default:
            ctx.strokeStyle = DRAW_CONFIG.visibleColor;
            ctx.lineWidth = DRAW_CONFIG.visibleLineWidth;
            ctx.setLineDash([]);
            break;
    }

    ctx.beginPath();
    ctx.moveTo(el.points[0].x, el.points[0].y);
    for (let i = 1; i < el.points.length; i++) {
        ctx.lineTo(el.points[i].x, el.points[i].y);
    }
    if (el.closed) {
        ctx.closePath();
    }
    ctx.stroke();

    ctx.restore();
}

/**
 * Draw a labeled point marker.
 *
 * Port of drawPoint() from core.js:462-475.
 * Draws a small filled circle at (x, y) and optional text label offset
 * at (x + 5, y - 5) matching core.js:471.
 */
function drawPointElement(ctx: CanvasRenderingContext2D, el: PointElement): void {
    ctx.save();

    // Draw point marker — core.js:464-467
    ctx.fillStyle = DRAW_CONFIG.labelColor;
    ctx.beginPath();
    ctx.arc(el.x, el.y, el.radius || DRAW_CONFIG.defaultPointRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw label if present — core.js:469-472
    if (el.label) {
        ctx.font = `${DRAW_CONFIG.labelFontSize}px ${DRAW_CONFIG.fontFamily}`;
        ctx.fillText(el.label, el.x + 5, el.y - 5);
    }

    ctx.restore();
}

/**
 * Draw a text label (not attached to a point marker).
 *
 * Used for annotations like "Edge angle β = 30°".
 */
function drawLabelElement(ctx: CanvasRenderingContext2D, el: LabelElement): void {
    ctx.save();

    ctx.fillStyle = DRAW_CONFIG.labelColor;
    ctx.font = `${el.font_size || DRAW_CONFIG.labelFontSize}px ${DRAW_CONFIG.fontFamily}`;
    ctx.fillText(el.text, el.x, el.y);

    ctx.restore();
}

/**
 * Draw an arc.
 *
 * Port of drawAngleArc() from core.js:499-510.
 * Angles are provided in degrees and converted to radians for Canvas API.
 */
function drawArcElement(ctx: CanvasRenderingContext2D, el: ArcElement): void {
    ctx.save();

    // core.js:501-503
    ctx.strokeStyle = DRAW_CONFIG.visibleColor;
    ctx.lineWidth = DRAW_CONFIG.constructionLineWidth;
    ctx.setLineDash([]);

    // core.js:505-506 — degreesToRadians inline
    ctx.beginPath();
    ctx.arc(
        el.center_x,
        el.center_y,
        el.radius,
        (el.start_angle * Math.PI) / 180,
        (el.end_angle * Math.PI) / 180,
    );
    ctx.stroke();

    ctx.restore();
}

/**
 * Draw an arrowhead.
 *
 * Port of drawArrow() from core.js:423-435.
 * Draws two lines from the tip forming a V-shaped arrowhead.
 * Head length = 5px, spread angle = ±30° (π/6).
 */
function drawArrowElement(ctx: CanvasRenderingContext2D, el: ArrowElement): void {
    const headLen = 5; // core.js:424
    const angle = Math.atan2(el.to_y - el.from_y, el.to_x - el.from_x); // core.js:425

    ctx.save();
    ctx.strokeStyle = DRAW_CONFIG.visibleColor;
    ctx.lineWidth = DRAW_CONFIG.visibleLineWidth;
    ctx.setLineDash([]);

    // core.js:427-434
    ctx.beginPath();
    ctx.moveTo(el.to_x, el.to_y);
    ctx.lineTo(
        el.to_x - headLen * Math.cos(angle - Math.PI / 6),
        el.to_y - headLen * Math.sin(angle - Math.PI / 6),
    );
    ctx.moveTo(el.to_x, el.to_y);
    ctx.lineTo(
        el.to_x - headLen * Math.cos(angle + Math.PI / 6),
        el.to_y - headLen * Math.sin(angle + Math.PI / 6),
    );
    ctx.stroke();

    ctx.restore();
}
