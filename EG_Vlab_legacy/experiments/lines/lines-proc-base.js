/**
 * lines-proc-base.js
 * Shared geometry computation engine for all 30 PROC drawing procedures.
 * All geometry is in "paper mm" coordinates:
 *   x: horizontal (positive = right)
 *   y: vertical   (positive = UP, i.e. above xy line)
 *   TV (top view) is BELOW xy → y negative
 *   FV (front view) is ABOVE xy → y positive
 *
 * All drawing uses lines-core.js primitives:
 *   drawLine, drawPoint, drawLabel, drawProjector,
 *   drawAngleArc, drawDimension, drawArc, drawXYLine
 *
 * Version: 1.0.0
 */

// ─────────────────────────────────────────────────────────────────────────────
// PROC REGISTRY — populated by each proc-group file
// ─────────────────────────────────────────────────────────────────────────────
const PROC_REGISTRY = {};

function registerProc(procId, descriptor) {
    PROC_REGISTRY[procId] = descriptor;
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const Geom = {

    /**
     * Convert degrees to radians.
     */
    rad(deg) { return deg * Math.PI / 180; },

    /**
     * Convert radians to degrees.
     */
    deg(rad) { return rad * 180 / Math.PI; },

    /**
     * Two-rotation method: given TL, θ, φ and endpoint A position,
     * compute all intermediate and final geometry for an oblique line.
     *
     * Returns an object with all coordinates needed by PROC-01 steps.
     */
    twoRotation(TL, theta, phi, xA, yA, yAp) {
        const tRad = Geom.rad(theta);
        const pRad = Geom.rad(phi);

        // Phase I: assume ∥ VP (φ=0) → FV at true angle θ
        const b1pX = xA + TL * Math.cos(tRad);
        const b1pY = yAp + TL * Math.sin(tRad);
        const tvLen = TL * Math.cos(tRad);   // TV length = L·cos θ
        const b1X = xA + tvLen;
        const b1Y = yA;

        // Phase I: assume ∥ HP (θ=0) → TV at true angle φ
        const b2X = xA + TL * Math.cos(pRad);
        const b2Y = yA - TL * Math.sin(pRad);
        const fvLen = TL * Math.cos(pRad);  // FV length = L·cos φ
        const b2pX = xA + fvLen;
        const b2pY = yAp;

        // Phase II: locus lines (horizontal)
        const locusYFV = b1pY;   // b' must lie on this horizontal
        const locusYTV = b2Y;    // b  must lie on this horizontal

        // Locate b': center a', radius fvLen, intersect y = locusYFV
        const dyFV = locusYFV - yAp;
        const dxFV = Math.sqrt(Math.max(0, fvLen * fvLen - dyFV * dyFV));
        const bpX = xA + dxFV;
        const bpY = locusYFV;

        // Locate b: same projector as b', at locus depth
        const bX = bpX;
        const bY = locusYTV;

        // Apparent angles
        const alpha = Geom.deg(Math.atan2(bpY - yAp, bpX - xA));
        const beta = Geom.deg(Math.atan2(Math.abs(bY - yA), bX - xA));

        return {
            xA, yA, yAp,
            b1pX, b1pY, b1X, b1Y,
            b2X, b2Y, b2pX, b2pY,
            locusYFV, locusYTV,
            bpX, bpY, bX, bY,
            tvLen, fvLen, alpha, beta,
            xMax: xA + TL + 20
        };
    },

    /**
     * Reverse two-rotation: given TL, θ, φ and endpoint B position,
     * compute endpoint A and all intermediate geometry.
     */
    twoRotationFromB(TL, theta, phi, xB, yB, yBp) {
        const tRad = Geom.rad(theta);
        const pRad = Geom.rad(phi);

        // B is the known end; A is to the LEFT
        const tvLen = TL * Math.cos(tRad);
        const fvLen = TL * Math.cos(pRad);

        // Phase I: assume ∥ VP → FV at θ from B backward
        const a1pX = xB - TL * Math.cos(tRad);
        const a1pY = yBp - TL * Math.sin(tRad);
        const a1X = xB - tvLen;
        const a1Y = yB;

        // Phase I: assume ∥ HP → TV at φ from B backward
        const a2X = xB - TL * Math.cos(pRad);
        const a2Y = yB + TL * Math.sin(pRad);
        const a2pX = xB - fvLen;
        const a2pY = yBp;

        // Locus lines
        const locusYFV = a1pY;
        const locusYTV = a2Y;

        // Locate a': center b', radius fvLen, intersect y = locusYFV
        const dyFV = locusYFV - yBp;
        const dxFV = Math.sqrt(Math.max(0, fvLen * fvLen - dyFV * dyFV));
        const apX = xB - dxFV;
        const apY = locusYFV;

        // Locate a: same projector as a', at locus depth
        const aX = apX;
        const aY = locusYTV;

        const alpha = Geom.deg(Math.atan2(yBp - apY, xB - apX));
        const beta = Geom.deg(Math.atan2(Math.abs(yB - aY), xB - aX));

        return {
            xB, yB, yBp,
            a1pX, a1pY, a1X, a1Y,
            a2X, a2Y, a2pX, a2pY,
            locusYFV, locusYTV,
            apX, apY, aX, aY,
            tvLen, fvLen, alpha, beta
        };
    },

    /**
     * Midpoint two-rotation: given TL, θ, φ and midpoint M position,
     * compute A and B.
     */
    twoRotationFromMid(TL, theta, phi, xM, yM, yMp) {
        const half = TL / 2;
        const tRad = Geom.rad(theta);
        const pRad = Geom.rad(phi);
        const tvLen = TL * Math.cos(tRad);
        const fvLen = TL * Math.cos(pRad);

        // A is half-TL before M, B is half-TL after M
        // Use same two-rotation but with half-TL to find direction
        const g = Geom.twoRotation(half, theta, phi, xM, yM, yMp);

        // A is at the "start" side, B at the "end" side
        const xA = xM - (g.bX - xM);
        const yA = yM - (g.bY - yM);
        const yAp = yMp - (g.bpY - yMp);
        const xB = g.bX;
        const yB = g.bY;
        const yBp = g.bpY;

        return { xA, yA, yAp, xM, yM, yMp, xB, yB, yBp, tvLen, fvLen };
    },

    /**
     * Find TL from both view lengths and endpoint heights/depths.
     * TL = √(Δx² + Δh² + Δd²)
     * where Δx is the horizontal projector distance.
     *
     * From FV: TL² = Δx² + Δh²  → L_FV² = Δx²  (since L_FV = TL·cos φ, Δh = TL·sin φ... wait)
     *
     * Actually the correct relation:
     *   L_TV = TL · cos θ  (TV length = TL projected onto HP)
     *   L_FV = TL · cos φ  (FV length = TL projected onto VP)
     *   Δx   = L_TV · cos φ = L_FV · cos θ  (horizontal distance between projectors)
     *
     * Given L_TV and L_FV:
     *   TL = √(L_TV² + (h_B - h_A)²)  [from FV rotation]
     *      = √(L_FV² + (d_B - d_A)²)  [from TV rotation]
     */
    findTLFromViews(L_TV, L_FV, h_A, d_A) {
        // We need one more constraint (h_B or d_B) to fully solve.
        // This helper returns what we can compute.
        // sin θ = (h_B - h_A) / TL  and  L_FV = TL · cos φ
        // Without h_B or d_B, we can only express TL parametrically.
        // Callers should provide the missing constraint.
        return { L_TV, L_FV, note: 'Need h_B or d_B to fully solve' };
    },

    /**
     * Find TL by rotation (rabatment) from a known view.
     * Given a view line from (xA, yA) to (xB, yB) in paper coords,
     * rotate it to horizontal to find TL.
     *
     * Returns the horizontal endpoint after rotation.
     */
    rotateToHorizontal(xA, yA, xB, yB) {
        const len = Math.sqrt((xB - xA) ** 2 + (yB - yA) ** 2);
        return {
            len,
            xEnd: xA + len,  // rotated endpoint (horizontal from A)
            yEnd: yA          // same height as A
        };
    },

    /**
     * Find HT (Horizontal Trace) and VT (Vertical Trace) of a line.
     * HT: where the line meets HP (y=0 in TV, i.e. xy line from TV side)
     * VT: where the line meets VP (y=0 in FV, i.e. xy line from FV side)
     *
     * Given: TV line (xA,yA)→(xB,yB) and FV line (xAp,yAp)→(xBp,yBp)
     * Returns: { HT: {x,y}, VT: {x,y} } or null if parallel
     */
    findTraces(xA, yA, xB, yB, xAp, yAp, xBp, yBp) {
        // HT: extend TV line until y=0 (xy line)
        let HT = null, VT = null;
        const dxTV = xB - xA, dyTV = yB - yA;
        if (Math.abs(dyTV) > 0.001) {
            const t = (0 - yA) / dyTV;
            HT = { x: xA + t * dxTV, y: 0 };
        }
        // VT: extend FV line until y=0 (xy line)
        const dxFV = xBp - xAp, dyFV = yBp - yAp;
        if (Math.abs(dyFV) > 0.001) {
            const t = (0 - yAp) / dyFV;
            VT = { x: xAp + t * dxFV, y: 0 };
        }
        return { HT, VT };
    },

    /**
     * Compute apparent angles α (FV) and β (TV) from final view endpoints.
     */
    apparentAngles(xA, yA, xB, yB, xAp, yAp, xBp, yBp) {
        const alpha = Geom.deg(Math.atan2(yBp - yAp, xBp - xAp));
        const beta = Geom.deg(Math.atan2(Math.abs(yB - yA), xB - xA));
        return { alpha, beta };
    },

    /**
     * Given L_TV (top view length) and θ, compute TL and FV length.
     * L_TV = TL · cos θ  →  TL = L_TV / cos θ
     * L_FV = TL · cos φ  (need φ too)
     */
    fromLTV(L_TV, theta, phi) {
        const tRad = Geom.rad(theta);
        const pRad = Geom.rad(phi);
        const TL = L_TV / Math.cos(tRad);
        const L_FV = TL * Math.cos(pRad);
        return { TL, L_FV };
    },

    /**
     * Given L_FV (front view length) and φ, compute TL and TV length.
     * L_FV = TL · cos φ  →  TL = L_FV / cos φ
     */
    fromLFV(L_FV, theta, phi) {
        const tRad = Geom.rad(theta);
        const pRad = Geom.rad(phi);
        const TL = L_FV / Math.cos(pRad);
        const L_TV = TL * Math.cos(tRad);
        return { TL, L_TV };
    },

    /**
     * Given both endpoints A and B (all four distances + Δx),
     * compute TL and angles.
     * TL = √(Δx² + (h_B-h_A)² + (d_B-d_A)²)
     * θ  = arcsin((h_B-h_A) / TL)
     * φ  = arcsin((d_B-d_A) / TL)
     */
    fromBothEndpoints(h_A, d_A, h_B, d_B, deltaX) {
        const dh = h_B - h_A;
        const dd = d_B - d_A;
        const TL = Math.sqrt(deltaX * deltaX + dh * dh + dd * dd);
        const theta = Geom.deg(Math.asin(Math.min(1, Math.abs(dh) / TL)));
        const phi = Geom.deg(Math.asin(Math.min(1, Math.abs(dd) / TL)));
        const L_TV = Math.sqrt(deltaX * deltaX + dd * dd);  // = TL·cos θ
        const L_FV = Math.sqrt(deltaX * deltaX + dh * dh);  // = TL·cos φ
        return { TL, theta, phi, L_TV, L_FV, dh, dd };
    },

    /**
     * Standard X placement for endpoint A on canvas.
     * Keeps the drawing centred with room for the line.
     */
    calcXA(TL) {
        // Use the global calcXA from lines-core.js if available,
        // otherwise use a sensible default.
        if (typeof calcXA === 'function') return calcXA();
        return -TL / 2;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP BUILDER — standardised step object
// ─────────────────────────────────────────────────────────────────────────────
function makeStep(n, total, tag, title, text, why = '') {
    return { n, total, tag, title, text, why };
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED DRAWING HELPERS (use lines-core.js primitives)
// ─────────────────────────────────────────────────────────────────────────────
const Draw = {

    /** Draw the xy reference line + endpoint A projector + a and a' points */
    baseA(xA, yA, yAp) {
        drawXYLine();
        drawProjector(xA, yA - 8, yAp + 8);
        drawPoint(xA, yA, cfg.tvColor); drawLabel('a', xA, yA, cfg.tvColor, { dx: -9, dy: 0 });
        drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, { dx: -10, dy: 0 });
    },

    /** Draw both final views with labels */
    finalViews(xA, yA, yAp, xB, yB, yBp) {
        drawLine(xA, yAp, xB, yBp, cfg.fvColor, cfg.finalWidth);
        drawLine(xA, yA, xB, yB, cfg.tvColor, cfg.finalWidth);
        drawPoint(xA, yA, cfg.tvColor); drawLabel('a', xA, yA, cfg.tvColor, { dx: -9, dy: 0 });
        drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, { dx: -10, dy: 0 });
        drawPoint(xB, yB, cfg.tvColor); drawLabel('b', xB, yB, cfg.tvColor, { dx: 6, dy: 4 });
        drawPoint(xB, yBp, cfg.fvColor); drawLabel("b'", xB, yBp, cfg.fvColor, { dx: 6, dy: 0 });
    },

    /** Draw projectors for both A and B */
    projectors(xA, yA, yAp, xB, yB, yBp) {
        drawProjector(xA, yA - 8, yAp + 8);
        drawProjector(xB, Math.min(yB, yBp) - 8, Math.max(yB, yBp) + 8);
    },

    /** Draw a construction line (dashed, dim colour) */
    construction(x1, y1, x2, y2) {
        drawLine(x1, y1, x2, y2, cfg.constructionColor, cfg.consWidth, []);
    },

    /** Draw a locus line (horizontal, orange dashed) */
    locus(xFrom, xTo, y) {
        drawLine(xFrom, y, xTo, y, cfg.locusColor, cfg.dimWidth, []);
    },

    /** Draw HT and VT traces */
    traces(xA, yA, xB, yB, xAp, yAp, xBp, yBp) {
        const tr = Geom.findTraces(xA, yA, xB, yB, xAp, yAp, xBp, yBp);
        if (tr.HT) {
            drawPoint(tr.HT.x, tr.HT.y, cfg.htColor, 5);
            drawLabel('HT', tr.HT.x, tr.HT.y, cfg.htColor, { dx: 0, dy: -10 });
        }
        if (tr.VT) {
            drawPoint(tr.VT.x, tr.VT.y, cfg.vtColor, 5);
            drawLabel('VT', tr.VT.x, tr.VT.y, cfg.vtColor, { dx: 0, dy: 10 });
        }
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Export to window
// ─────────────────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
    window.PROC_REGISTRY = PROC_REGISTRY;
    window.registerProc = registerProc;
    window.Geom = Geom;
    window.Draw = Draw;
    window.makeStep = makeStep;
}
