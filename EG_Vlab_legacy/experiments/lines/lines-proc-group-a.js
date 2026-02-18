/**
 * lines-proc-group-a.js
 * PROC-01 to PROC-05: True Length + angles given
 */

// ─────────────────────────────────────────────────────────────
// PROC-01  {TL, θ, φ, h_A, d_A}  — Canonical Oblique (10 steps)
// ─────────────────────────────────────────────────────────────
registerProc('PROC-01', {
    name: 'Canonical Oblique (TL, θ, φ, hA, dA)',
    totalSteps: 10,

    compute(g) {
        const xA = Geom.calcXA(g.TL);
        const yA = -g.d_A;
        const yAp = g.h_A;
        return Object.assign({ xA, yA, yAp }, Geom.twoRotation(g.TL, g.theta, g.phi, xA, yA, yAp));
    },

    drawStep(n, g, c) {
        const { xA, yA, yAp, b1pX, b1pY, b1X, b1Y, b2X, b2Y, b2pX, b2pY,
            locusYFV, locusYTV, bpX, bpY, bX, bY,
            tvLen, fvLen, alpha, beta, xMax } = g;
        const { TL, theta, phi } = c;

        function base() { Draw.baseA(xA, yA, yAp); }

        switch (n) {
            case 1:
                drawXYLine();
                base();
                updateInstructions('Step 1', 'Draw xy and Locate End A',
                    `Oblique line: TL=${TL}mm, θ=${theta}°, φ=${phi}°.\n` +
                    `a is ${c.d_A}mm below xy (TV). a' is ${c.h_A}mm above xy (FV).`,
                    'The xy line represents the intersection of HP and VP. ' +
                    'Points below xy are in the Top View (HP); points above are in the Front View (VP). ' +
                    'We always start by locating the known endpoint A.');
                break;

            case 2:
                base();
                Draw.construction(xA, yAp, b1pX, b1pY);
                drawPoint(b1pX, b1pY, cfg.dimColor, 3);
                drawLabel("b₁'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
                drawAngleArc(xA, yAp, theta, 12, cfg.dimColor, 'up');
                updateInstructions('Step 2', 'Assume Line ∥ VP — Draw Auxiliary FV',
                    `From a', draw at θ=${theta}° to xy, length TL=${TL}mm → b₁'.\n` +
                    `This gives the HEIGHT of B when the line is parallel to VP.`,
                    'If the line were parallel to VP (φ=0), its Front View would show the TRUE LENGTH at the TRUE ANGLE θ. ' +
                    'We use this imaginary position to find how high B is above HP.');
                break;

            case 3:
                base();
                Draw.construction(xA, yAp, b1pX, b1pY);
                Draw.construction(xA, yA, b1X, b1Y);
                drawProjector(b1pX, b1pY, yA - 5);
                drawPoint(b1pX, b1pY, cfg.dimColor, 3); drawLabel("b₁'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
                drawPoint(b1X, b1Y, cfg.tvColor, 3); drawLabel('b₁', b1X, b1Y, cfg.tvColor, { dx: 6, dy: 0 });
                drawAngleArc(xA, yAp, theta, 12, cfg.dimColor, 'up');
                updateInstructions('Step 3', 'Get TV Length = ab₁',
                    `Drop projector from b₁' to horizontal from a → b₁.\n` +
                    `TV length = L·cos θ = ${tvLen.toFixed(1)}mm.`,
                    'The Top View of the line (when ∥ VP) is a horizontal line of length L·cos θ. ' +
                    'This foreshortened length is what we will use to draw the final Top View.');
                break;

            case 4:
                base();
                Draw.construction(xA, yAp, b1pX, b1pY);
                Draw.construction(xA, yA, b1X, b1Y);
                drawProjector(b1pX, b1pY, yA - 5);
                Draw.construction(xA, yA, b2X, b2Y);
                drawPoint(b1pX, b1pY, cfg.dimColor, 3); drawLabel("b₁'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
                drawPoint(b1X, b1Y, cfg.tvColor, 3); drawLabel('b₁', b1X, b1Y, cfg.tvColor, { dx: 6, dy: 0 });
                drawPoint(b2X, b2Y, cfg.tvColor, 3); drawLabel('b₂', b2X, b2Y, cfg.tvColor, { dx: 6, dy: 4 });
                drawAngleArc(xA, yA, phi, 12, cfg.dimColor, 'down');
                updateInstructions('Step 4', 'Assume Line ∥ HP — Draw Auxiliary TV',
                    `From a, draw at φ=${phi}° below xy, length TL=${TL}mm → b₂.\n` +
                    `This gives the DEPTH of B when the line is parallel to HP.`,
                    'If the line were parallel to HP (θ=0), its Top View would show the TRUE LENGTH at the TRUE ANGLE φ. ' +
                    'We use this imaginary position to find how far B is from VP.');
                break;

            case 5:
                base();
                Draw.construction(xA, yAp, b1pX, b1pY);
                Draw.construction(xA, yA, b1X, b1Y);
                drawProjector(b1pX, b1pY, yA - 5);
                Draw.construction(xA, yA, b2X, b2Y);
                Draw.construction(xA, yAp, b2pX, b2pY);
                drawProjector(b2X, b2Y, yAp + 5);
                drawPoint(b1pX, b1pY, cfg.dimColor, 3); drawLabel("b₁'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
                drawPoint(b1X, b1Y, cfg.tvColor, 3); drawLabel('b₁', b1X, b1Y, cfg.tvColor, { dx: 6, dy: 0 });
                drawPoint(b2X, b2Y, cfg.tvColor, 3); drawLabel('b₂', b2X, b2Y, cfg.tvColor, { dx: 6, dy: 4 });
                drawPoint(b2pX, b2pY, cfg.fvColor, 3); drawLabel("b₂'", b2pX, b2pY, cfg.fvColor, { dx: 6, dy: 0 });
                drawAngleArc(xA, yAp, theta, 12, cfg.dimColor, 'up');
                drawAngleArc(xA, yA, phi, 12, cfg.dimColor, 'down');
                updateInstructions('Step 5', "Get FV Length = a'b₂'",
                    `Project b₂ up to horizontal from a' → b₂'.\n` +
                    `FV length = L·cos φ = ${fvLen.toFixed(1)}mm.`,
                    'Similarly, the Front View length (when ∥ HP) is L·cos φ. ' +
                    'We now have both view lengths needed to locate the true position of B.');
                break;

            case 6:
                base();
                Draw.construction(xA, yAp, b1pX, b1pY);
                Draw.construction(xA, yA, b2X, b2Y);
                Draw.locus(xA - 5, xMax, locusYFV);
                Draw.locus(xA - 5, xMax, locusYTV);
                drawPoint(b1pX, b1pY, cfg.dimColor, 3); drawLabel("b₁'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
                drawPoint(b2X, b2Y, cfg.tvColor, 3); drawLabel('b₂', b2X, b2Y, cfg.tvColor, { dx: 6, dy: 4 });
                updateInstructions('Step 6', 'Draw Locus Lines',
                    `Locus of b' is horizontal through b₁' (y = ${locusYFV.toFixed(1)}mm).\n` +
                    `Locus of b  is horizontal through b₂  (y = ${locusYTV.toFixed(1)}mm).\n` +
                    `B must lie on BOTH these lines simultaneously.`,
                    'B has a fixed height (from Step 2) and a fixed depth (from Step 4). ' +
                    'These horizontal lines are the "loci" — B must lie somewhere on each. ' +
                    'The intersection with the arc (next step) gives the exact position.');
                break;

            case 7:
                base();
                Draw.locus(xA - 5, xMax, locusYFV);
                Draw.locus(xA - 5, xMax, locusYTV);
                drawArc(xA, yAp, fvLen, 0, alpha + 15, cfg.arcColor, 1.0, []);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(bpX, bpY, cfg.fvColor, 4); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 7', "Locate b' — Final Front View",
                    `Centre at a', radius = FV length = ${fvLen.toFixed(1)}mm.\n` +
                    `Arc meets locus of b' → point b'. Draw a'b'.`,
                    "We swing an arc of radius = FV length from a'. " +
                    "Where it crosses the locus of b' is the true position of b'. " +
                    "a'b' is the final Front View — foreshortened and oblique.");
                break;

            case 8:
                base();
                Draw.locus(xA - 5, xMax, locusYFV);
                Draw.locus(xA - 5, xMax, locusYTV);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawProjector(bpX, bpY, bY - 5);
                drawArc(xA, yA, tvLen, -beta - 15, 0, cfg.arcColor, 1.0, []);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawPoint(bpX, bpY, cfg.fvColor, 4); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawPoint(bX, bY, cfg.tvColor, 4); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                updateInstructions('Step 8', 'Locate b — Final Top View',
                    `Centre at a, radius = TV length = ${tvLen.toFixed(1)}mm.\n` +
                    `Arc meets locus of b, aligned with b' (same projector) → b. Draw ab.`,
                    'b must be directly below b\' (same projector). ' +
                    'We swing an arc of radius = TV length from a to find where it meets the locus at the correct x-position.');
                break;

            case 9:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bpX, bpY - 5, bY - 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                updateInstructions('Step 9', 'Final Projections',
                    `TV ab = ${tvLen.toFixed(1)}mm (foreshortened)\n` +
                    `FV a'b' = ${fvLen.toFixed(1)}mm (foreshortened)\n` +
                    `Both views are oblique — neither parallel to xy.`,
                    'In an oblique line, BOTH views are foreshortened and inclined. ' +
                    'Neither view shows the true length or true angles θ and φ directly.');
                break;

            case 10:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bpX, bpY - 5, bY - 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, alpha, 16, cfg.dimColor, 'up');
                drawAngleArc(xA, yA, beta, 16, cfg.dimColor, 'down');
                drawDimension(xA, yAp, bpX, bpY, `${fvLen.toFixed(1)}mm`);
                drawDimension(xA, yA, bX, bY, `${tvLen.toFixed(1)}mm`);
                if (state.showTraces) Draw.traces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
                updateInstructions('Step 10 ✓', 'Complete — Oblique Line',
                    `TL=${TL}mm | θ=${theta}° | φ=${phi}°\n` +
                    `FV a'b'=${fvLen.toFixed(1)}mm, apparent α=${alpha.toFixed(1)}°\n` +
                    `TV ab=${tvLen.toFixed(1)}mm, apparent β=${beta.toFixed(1)}°`,
                    'Verification: α < θ and β < φ always (apparent angles are always less than true angles). ' +
                    'The true length TL can be recovered by rotating either view back to horizontal.');
                break;
        }
    }
});

// ─────────────────────────────────────────────────────────────
// PROC-02  {TL, θ, φ, h_B, d_B}  — B given (11 steps)
// ─────────────────────────────────────────────────────────────
registerProc('PROC-02', {
    name: 'Oblique — End B given (TL, θ, φ, hB, dB)',
    totalSteps: 11,

    compute(g) {
        const xB = 20;  // place B at a fixed right position
        const yB = -g.d_B;
        const yBp = g.h_B;
        const r = Geom.twoRotationFromB(g.TL, g.theta, g.phi, xB, yB, yBp);
        return Object.assign({ xB, yB, yBp }, r);
    },

    drawStep(n, g, c) {
        const { xB, yB, yBp, apX, apY, aX, aY,
            a1pX, a1pY, a1X, a1Y, a2X, a2Y, a2pX, a2pY,
            locusYFV, locusYTV, tvLen, fvLen, alpha, beta } = g;
        const { TL, theta, phi } = c;
        const xMin = aX - 20;

        function base() {
            drawXYLine();
            drawProjector(xB, yB - 8, yBp + 8);
            drawPoint(xB, yB, cfg.tvColor); drawLabel('b', xB, yB, cfg.tvColor, { dx: 6, dy: 4 });
            drawPoint(xB, yBp, cfg.fvColor); drawLabel("b'", xB, yBp, cfg.fvColor, { dx: 6, dy: 0 });
        }

        switch (n) {
            case 1:
                drawXYLine();
                base();
                updateInstructions('Step 1', 'Draw xy and Locate End B',
                    `TL=${TL}mm, θ=${theta}°, φ=${phi}°. End B is given.\n` +
                    `b is ${c.d_B}mm below xy. b' is ${c.h_B}mm above xy.`,
                    'When end B is given instead of A, we work backwards. ' +
                    'The construction mirrors PROC-01 — we find A from B using the same two-rotation method.');
                break;
            case 2:
                base();
                Draw.construction(xB, yBp, a1pX, a1pY);
                drawPoint(a1pX, a1pY, cfg.dimColor, 3); drawLabel("a₁'", a1pX, a1pY, cfg.dimColor, { dx: -12, dy: 0 });
                drawAngleArc(xB, yBp, theta, 12, cfg.dimColor, 'up');
                updateInstructions('Step 2', 'Assume Line ∥ VP — Auxiliary FV from B',
                    `From b', draw backward at θ=${theta}°, length TL=${TL}mm → a₁'.\n` +
                    `This gives the HEIGHT of A.`,
                    'Working from B backward: if the line were ∥ VP, the FV would show TL at angle θ. ' +
                    'Drawing from b\' backward gives us the height of A.');
                break;
            case 3:
                base();
                Draw.construction(xB, yBp, a1pX, a1pY);
                Draw.construction(xB, yB, a1X, a1Y);
                drawProjector(a1pX, a1pY, yB - 5);
                drawPoint(a1pX, a1pY, cfg.dimColor, 3); drawLabel("a₁'", a1pX, a1pY, cfg.dimColor, { dx: -12, dy: 0 });
                drawPoint(a1X, a1Y, cfg.tvColor, 3); drawLabel('a₁', a1X, a1Y, cfg.tvColor, { dx: -12, dy: 0 });
                updateInstructions('Step 3', 'Get TV Length = a₁b',
                    `Drop projector from a₁' to horizontal from b → a₁.\n` +
                    `TV length = L·cos θ = ${tvLen.toFixed(1)}mm.`,
                    'The TV length is still L·cos θ regardless of which end is given.');
                break;
            case 4:
                base();
                Draw.construction(xB, yBp, a1pX, a1pY);
                Draw.construction(xB, yB, a1X, a1Y);
                drawProjector(a1pX, a1pY, yB - 5);
                Draw.construction(xB, yB, a2X, a2Y);
                drawPoint(a1pX, a1pY, cfg.dimColor, 3); drawLabel("a₁'", a1pX, a1pY, cfg.dimColor, { dx: -12, dy: 0 });
                drawPoint(a1X, a1Y, cfg.tvColor, 3); drawLabel('a₁', a1X, a1Y, cfg.tvColor, { dx: -12, dy: 0 });
                drawPoint(a2X, a2Y, cfg.tvColor, 3); drawLabel('a₂', a2X, a2Y, cfg.tvColor, { dx: -12, dy: 4 });
                drawAngleArc(xB, yB, phi, 12, cfg.dimColor, 'down');
                updateInstructions('Step 4', 'Assume Line ∥ HP — Auxiliary TV from B',
                    `From b, draw backward at φ=${phi}°, length TL=${TL}mm → a₂.\n` +
                    `This gives the DEPTH of A.`,
                    'Same logic as Step 4 of PROC-01, but working from B toward A.');
                break;
            case 5:
                base();
                Draw.construction(xB, yBp, a1pX, a1pY);
                Draw.construction(xB, yB, a1X, a1Y);
                drawProjector(a1pX, a1pY, yB - 5);
                Draw.construction(xB, yB, a2X, a2Y);
                Draw.construction(xB, yBp, a2pX, a2pY);
                drawProjector(a2X, a2Y, yBp + 5);
                drawPoint(a1pX, a1pY, cfg.dimColor, 3); drawLabel("a₁'", a1pX, a1pY, cfg.dimColor, { dx: -12, dy: 0 });
                drawPoint(a1X, a1Y, cfg.tvColor, 3); drawLabel('a₁', a1X, a1Y, cfg.tvColor, { dx: -12, dy: 0 });
                drawPoint(a2X, a2Y, cfg.tvColor, 3); drawLabel('a₂', a2X, a2Y, cfg.tvColor, { dx: -12, dy: 4 });
                drawPoint(a2pX, a2pY, cfg.fvColor, 3); drawLabel("a₂'", a2pX, a2pY, cfg.fvColor, { dx: -12, dy: 0 });
                updateInstructions('Step 5', "Get FV Length = a₂'b'",
                    `Project a₂ up → a₂'. FV length = L·cos φ = ${fvLen.toFixed(1)}mm.`,
                    'FV length = L·cos φ — same formula as before.');
                break;
            case 6:
                base();
                Draw.construction(xB, yBp, a1pX, a1pY);
                Draw.construction(xB, yB, a2X, a2Y);
                Draw.locus(xMin, xB + 5, locusYFV);
                Draw.locus(xMin, xB + 5, locusYTV);
                updateInstructions('Step 6', 'Draw Locus Lines for A',
                    `Locus of a' through a₁' (y=${locusYFV.toFixed(1)}mm).\n` +
                    `Locus of a  through a₂  (y=${locusYTV.toFixed(1)}mm).`,
                    'A must lie on both locus lines simultaneously. The arc intersection gives the exact position.');
                break;
            case 7:
                base();
                Draw.locus(xMin, xB + 5, locusYFV);
                Draw.locus(xMin, xB + 5, locusYTV);
                drawArc(xB, yBp, fvLen, 180 - alpha - 15, 180, cfg.arcColor, 1.0, []);
                drawLine(apX, apY, xB, yBp, cfg.fvColor, cfg.finalWidth);
                drawPoint(apX, apY, cfg.fvColor, 4); drawLabel("a'", apX, apY, cfg.fvColor, { dx: -10, dy: 0 });
                updateInstructions('Step 7', "Locate a' — Final Front View",
                    `Centre at b', radius = FV length = ${fvLen.toFixed(1)}mm.\n` +
                    `Arc meets locus of a' → a'. Draw a'b'.`,
                    'Same arc-intersection technique as PROC-01, but the arc is centred at b\'.');
                break;
            case 8:
                base();
                Draw.locus(xMin, xB + 5, locusYFV);
                Draw.locus(xMin, xB + 5, locusYTV);
                drawLine(apX, apY, xB, yBp, cfg.fvColor, cfg.finalWidth);
                drawProjector(apX, apY, aY - 5);
                drawArc(xB, yB, tvLen, 180, 180 + beta + 15, cfg.arcColor, 1.0, []);
                drawLine(aX, aY, xB, yB, cfg.tvColor, cfg.finalWidth);
                drawPoint(apX, apY, cfg.fvColor, 4); drawLabel("a'", apX, apY, cfg.fvColor, { dx: -10, dy: 0 });
                drawPoint(aX, aY, cfg.tvColor, 4); drawLabel('a', aX, aY, cfg.tvColor, { dx: -9, dy: 0 });
                updateInstructions('Step 8', 'Locate a — Final Top View',
                    `Centre at b, radius = TV length = ${tvLen.toFixed(1)}mm.\n` +
                    `Arc meets locus of a, aligned with a' → a. Draw ab.`,
                    'a must be directly below a\' (same projector).');
                break;
            case 9:
                drawXYLine();
                drawProjector(apX, apY - 5, aY - 5);
                drawProjector(xB, yB - 8, yBp + 8);
                Draw.finalViews(aX, aY, apY, xB, yB, yBp);
                updateInstructions('Step 9', 'Final Projections',
                    `TV ab=${tvLen.toFixed(1)}mm | FV a'b'=${fvLen.toFixed(1)}mm`,
                    'Both views are foreshortened oblique lines.');
                break;
            case 10:
                drawXYLine();
                drawProjector(apX, apY - 5, aY - 5);
                drawProjector(xB, yB - 8, yBp + 8);
                Draw.finalViews(aX, aY, apY, xB, yB, yBp);
                drawAngleArc(aX, apY, alpha, 16, cfg.dimColor, 'up');
                drawAngleArc(aX, aY, beta, 16, cfg.dimColor, 'down');
                updateInstructions('Step 10', 'Angles and Dimensions',
                    `Apparent FV angle α=${alpha.toFixed(1)}° | Apparent TV angle β=${beta.toFixed(1)}°`,
                    'α < θ and β < φ — apparent angles are always less than true angles.');
                break;
            case 11:
                drawXYLine();
                drawProjector(apX, apY - 5, aY - 5);
                drawProjector(xB, yB - 8, yBp + 8);
                Draw.finalViews(aX, aY, apY, xB, yB, yBp);
                drawAngleArc(aX, apY, alpha, 16, cfg.dimColor, 'up');
                drawAngleArc(aX, aY, beta, 16, cfg.dimColor, 'down');
                drawDimension(aX, apY, xB, yBp, `${fvLen.toFixed(1)}mm`);
                drawDimension(aX, aY, xB, yB, `${tvLen.toFixed(1)}mm`);
                if (state.showTraces) Draw.traces(aX, aY, xB, yB, aX, apY, xB, yBp);
                updateInstructions('Step 11 ✓', 'Complete — End B Given',
                    `TL=${TL}mm | θ=${theta}° | φ=${phi}°\n` +
                    `FV=${fvLen.toFixed(1)}mm | TV=${tvLen.toFixed(1)}mm`,
                    'Result is identical to PROC-01 — the construction method is the same, just mirrored.');
                break;
        }
    }
});

// ─────────────────────────────────────────────────────────────
// PROC-03  {TL, θ, φ, h_mid, d_mid}  — Midpoint given (12 steps)
// ─────────────────────────────────────────────────────────────
registerProc('PROC-03', {
    name: 'Oblique — Midpoint given (TL, θ, φ, hM, dM)',
    totalSteps: 12,

    compute(g) {
        const xM = 0;
        const yM = -g.d_mid;
        const yMp = g.h_mid;
        const r = Geom.twoRotationFromMid(g.TL, g.theta, g.phi, xM, yM, yMp);
        // Also compute half-rotation for construction display
        const half = Geom.twoRotation(g.TL / 2, g.theta, g.phi, xM, yM, yMp);
        return Object.assign({ xM, yM, yMp }, r, { half });
    },

    drawStep(n, g, c) {
        const { xM, yM, yMp, xA, yA, yAp, xB, yB, yBp, tvLen, fvLen, half } = g;
        const { TL, theta, phi } = c;

        function base() {
            drawXYLine();
            drawProjector(xM, yM - 8, yMp + 8);
            drawPoint(xM, yM, cfg.dimColor); drawLabel('m', xM, yM, cfg.dimColor, { dx: -9, dy: 0 });
            drawPoint(xM, yMp, cfg.dimColor); drawLabel("m'", xM, yMp, cfg.dimColor, { dx: -10, dy: 0 });
        }

        switch (n) {
            case 1:
                drawXYLine();
                base();
                updateInstructions('Step 1', 'Draw xy and Locate Midpoint M',
                    `TL=${TL}mm, θ=${theta}°, φ=${phi}°. Midpoint M given.\n` +
                    `m is ${c.d_mid}mm below xy. m' is ${c.h_mid}mm above xy.`,
                    'When the midpoint is given, we use half the true length (TL/2) to find A and B on either side of M.');
                break;
            case 2:
                base();
                updateInstructions('Step 2', 'Strategy: Use Half-Length',
                    `We will apply the two-rotation method with TL/2 = ${(TL / 2).toFixed(1)}mm.\n` +
                    `This gives us the position of B (one end). A is symmetrically opposite.`,
                    'The midpoint M divides AB equally. So MA = MB = TL/2. ' +
                    'We find B by rotating TL/2 from M, then A is the mirror image.');
                break;
            case 3:
                base();
                Draw.construction(xM, yMp, half.b1pX, half.b1pY);
                drawPoint(half.b1pX, half.b1pY, cfg.dimColor, 3);
                drawLabel("b₁'", half.b1pX, half.b1pY, cfg.dimColor, { dx: 6, dy: 0 });
                drawAngleArc(xM, yMp, theta, 12, cfg.dimColor, 'up');
                updateInstructions('Step 3', 'Auxiliary FV from M (half-length)',
                    `From m', draw at θ=${theta}°, length TL/2=${(TL / 2).toFixed(1)}mm → b₁'.`,
                    'Using TL/2 from M gives us the height of B above HP.');
                break;
            case 4:
                base();
                Draw.construction(xM, yMp, half.b1pX, half.b1pY);
                Draw.construction(xM, yM, half.b1X, half.b1Y);
                drawProjector(half.b1pX, half.b1pY, yM - 5);
                Draw.construction(xM, yM, half.b2X, half.b2Y);
                Draw.locus(xM - 5, xM + TL, half.locusYFV);
                Draw.locus(xM - 5, xM + TL, half.locusYTV);
                drawPoint(half.b1pX, half.b1pY, cfg.dimColor, 3); drawLabel("b₁'", half.b1pX, half.b1pY, cfg.dimColor, { dx: 6, dy: 0 });
                drawPoint(half.b2X, half.b2Y, cfg.tvColor, 3); drawLabel('b₂', half.b2X, half.b2Y, cfg.tvColor, { dx: 6, dy: 4 });
                updateInstructions('Step 4', 'Auxiliary TV + Locus Lines',
                    `From m, draw at φ=${phi}° (half-length) → b₂.\nDraw locus lines through b₁' and b₂.`,
                    'Same two-rotation logic as PROC-01, applied with TL/2 to find B from M.');
                break;
            case 5:
                base();
                Draw.locus(xM - 5, xM + TL, half.locusYFV);
                Draw.locus(xM - 5, xM + TL, half.locusYTV);
                drawArc(xM, yMp, half.fvLen, 0, half.alpha + 15, cfg.arcColor, 1.0, []);
                drawLine(xM, yMp, half.bpX, half.bpY, cfg.fvColor, 1.5, []);
                drawLine(xM, yM, half.bX, half.bY, cfg.tvColor, 1.5, []);
                drawPoint(half.bpX, half.bpY, cfg.fvColor, 4); drawLabel("b'", half.bpX, half.bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawPoint(half.bX, half.bY, cfg.tvColor, 4); drawLabel('b', half.bX, half.bY, cfg.tvColor, { dx: 6, dy: 4 });
                updateInstructions('Step 5', 'Locate B from M',
                    `Arc (radius=FV half-len) meets locus → b'. Project down → b.\n` +
                    `MB = TL/2 = ${(TL / 2).toFixed(1)}mm.`,
                    'Arc intersection gives the true position of B, exactly TL/2 from M.');
                break;
            case 6:
                base();
                Draw.locus(xM - TL, xM + 5, half.locusYFV);
                Draw.locus(xM - TL, xM + 5, half.locusYTV);
                drawArc(xM, yMp, half.fvLen, 180 - half.alpha - 15, 180, cfg.arcColor, 1.0, []);
                drawLine(xM, yMp, half.bpX, half.bpY, cfg.fvColor, 1.5, []);
                drawLine(xM, yM, half.bX, half.bY, cfg.tvColor, 1.5, []);
                drawPoint(half.bpX, half.bpY, cfg.fvColor, 3);
                // A is mirror of B about M
                const apX2 = 2 * xM - half.bpX, apY2 = 2 * yMp - half.bpY;
                const aX2 = 2 * xM - half.bX, aY2 = 2 * yM - half.bY;
                drawArc(xM, yMp, half.fvLen, 180, 180 + half.alpha + 15, cfg.arcColor, 1.0, []);
                drawLine(xM, yMp, apX2, apY2, cfg.fvColor, 1.5, []);
                drawLine(xM, yM, aX2, aY2, cfg.tvColor, 1.5, []);
                drawPoint(apX2, apY2, cfg.fvColor, 4); drawLabel("a'", apX2, apY2, cfg.fvColor, { dx: -10, dy: 0 });
                drawPoint(aX2, aY2, cfg.tvColor, 4); drawLabel('a', aX2, aY2, cfg.tvColor, { dx: -9, dy: 0 });
                updateInstructions('Step 6', 'Locate A — Mirror of B about M',
                    `A is symmetrically opposite B about M.\n` +
                    `MA = MB = TL/2 = ${(TL / 2).toFixed(1)}mm.`,
                    'Since M is the midpoint, A is exactly the mirror image of B about M. ' +
                    'We swing the same arc on the other side.');
                break;
            case 7:
                base();
                const apX = 2 * xM - half.bpX, apY = 2 * yMp - half.bpY;
                const aX = 2 * xM - half.bX, aY = 2 * yM - half.bY;
                drawProjector(apX, apY - 5, aY - 5);
                drawProjector(half.bpX, half.bpY - 5, half.bY - 5);
                Draw.finalViews(aX, aY, apY, half.bpX, half.bY, half.bpY);
                drawPoint(xM, yM, cfg.dimColor); drawLabel('m', xM, yM, cfg.dimColor, { dx: -9, dy: 0 });
                drawPoint(xM, yMp, cfg.dimColor); drawLabel("m'", xM, yMp, cfg.dimColor, { dx: -10, dy: 0 });
                updateInstructions('Step 7', 'Draw Final Views Through M',
                    `a'b' passes through m'. ab passes through m.\n` +
                    `TV=${tvLen.toFixed(1)}mm | FV=${fvLen.toFixed(1)}mm`,
                    'The midpoint M must lie on both final view lines — this is a useful check.');
                break;
            case 8: case 9: case 10: case 11: case 12: {
                const apXf = 2 * xM - half.bpX, apYf = 2 * yMp - half.bpY;
                const aXf = 2 * xM - half.bX, aYf = 2 * yM - half.bY;
                drawXYLine();
                drawProjector(apXf, apYf - 5, aYf - 5);
                drawProjector(half.bpX, half.bpY - 5, half.bY - 5);
                Draw.finalViews(aXf, aYf, apYf, half.bpX, half.bY, half.bpY);
                drawPoint(xM, yM, cfg.dimColor); drawLabel('m', xM, yM, cfg.dimColor, { dx: -9, dy: 0 });
                drawPoint(xM, yMp, cfg.dimColor); drawLabel("m'", xM, yMp, cfg.dimColor, { dx: -10, dy: 0 });
                if (n >= 9) {
                    drawAngleArc(aXf, apYf, half.alpha, 16, cfg.dimColor, 'up');
                    drawAngleArc(aXf, aYf, half.beta, 16, cfg.dimColor, 'down');
                }
                if (n >= 10) drawDimension(aXf, apYf, half.bpX, half.bpY, `${fvLen.toFixed(1)}mm`);
                if (n >= 11) drawDimension(aXf, aYf, half.bX, half.bY, `${tvLen.toFixed(1)}mm`);
                if (n === 12 && state.showTraces) Draw.traces(aXf, aYf, half.bX, half.bY, aXf, apYf, half.bpX, half.bpY);
                const tag = n === 12 ? 'Step 12 ✓' : `Step ${n}`;
                updateInstructions(tag, n < 12 ? 'Adding Dimensions' : 'Complete — Midpoint Given',
                    `TL=${TL}mm | θ=${theta}° | φ=${phi}°\n` +
                    `Midpoint M: ${c.d_mid}mm from VP, ${c.h_mid}mm above HP`,
                    'Verify: m and m\' are exactly at the midpoints of ab and a\'b\' respectively.');
                break;
            }
        }
    }
});

// ─────────────────────────────────────────────────────────────
// PROC-04  {TL, θ, φ=0, h_A, d_A}  — Inclined to HP, ∥ VP (5 steps)
// ─────────────────────────────────────────────────────────────
registerProc('PROC-04', {
    name: 'Inclined to HP, Parallel to VP (TL, θ, hA, dA)',
    totalSteps: 5,

    compute(g) {
        const xA = Geom.calcXA(g.TL);
        const yA = -g.d_A;
        const yAp = g.h_A;
        const tRad = Geom.rad(g.theta);
        const bpX = xA + g.TL * Math.cos(tRad);
        const bpY = yAp + g.TL * Math.sin(tRad);
        const tvLen = g.TL * Math.cos(tRad);
        const bX = xA + tvLen;
        const bY = yA;
        return { xA, yA, yAp, bpX, bpY, bX, bY, tvLen };
    },

    drawStep(n, g, c) {
        const { xA, yA, yAp, bpX, bpY, bX, bY, tvLen } = g;
        const { TL, theta } = c;

        switch (n) {
            case 1:
                drawXYLine();
                Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and Locate End A',
                    `Line ∥ VP: TL=${TL}mm, θ=${theta}°, φ=0°.\n` +
                    `a is ${c.d_A}mm below xy. a' is ${c.h_A}mm above xy.`,
                    'When the line is parallel to VP (φ=0), the Front View shows the TRUE LENGTH at the TRUE ANGLE θ. ' +
                    'The Top View will be a horizontal line (foreshortened).');
                break;
            case 2:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                updateInstructions('Step 2', 'Draw Front View a\'b\' at θ',
                    `From a', draw at θ=${theta}° to xy, length TL=${TL}mm → b'.\n` +
                    `a'b' IS the true length (line ∥ VP).`,
                    'Since the line is parallel to VP, the Front View is undistorted — it shows the true length and true angle θ.');
                break;
            case 3:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawProjector(bpX, bpY, yA - 5);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawPoint(bX, bY, cfg.tvColor, 3); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 3', 'Project b\' Down to Get b',
                    `Drop projector from b' to horizontal from a → b.\n` +
                    `TV length ab = L·cos θ = ${tvLen.toFixed(1)}mm.`,
                    'The Top View of b is directly below b\' (same projector). ' +
                    'The TV is horizontal because the line is parallel to VP (no depth change).');
                break;
            case 4:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawProjector(bpX, bpY, yA - 5);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 0 });
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                updateInstructions('Step 4', 'Draw Top View ab ∥ xy',
                    `ab is horizontal (∥ xy), length = ${tvLen.toFixed(1)}mm.\n` +
                    `FV a'b' is at θ=${theta}° to xy, length = TL=${TL}mm.`,
                    'The TV is always parallel to xy when the line is parallel to VP. ' +
                    'This is a key property: ∥ VP → TV ∥ xy.');
                break;
            case 5:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bpX, bpY - 5, bY - 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawDimension(xA, yAp, bpX, bpY, `TL=${TL}mm`);
                drawDimension(xA, yA, bX, bY, `${tvLen.toFixed(1)}mm`);
                if (state.showTraces) Draw.traces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
                updateInstructions('Step 5 ✓', 'Complete — Line ∥ VP',
                    `FV a'b' = TL = ${TL}mm at θ=${theta}° ✓\n` +
                    `TV ab = ${tvLen.toFixed(1)}mm ∥ xy ✓`,
                    'Summary: ∥ VP means FV = TL at θ, TV ∥ xy and foreshortened. ' +
                    'The line has no inclination to VP (φ=0).');
                break;
        }
    }
});

// ─────────────────────────────────────────────────────────────
// PROC-05  {TL, θ=0, φ, h_A, d_A}  — Inclined to VP, ∥ HP (5 steps)
// ─────────────────────────────────────────────────────────────
registerProc('PROC-05', {
    name: 'Inclined to VP, Parallel to HP (TL, φ, hA, dA)',
    totalSteps: 5,

    compute(g) {
        const xA = Geom.calcXA(g.TL);
        const yA = -g.d_A;
        const yAp = g.h_A;
        const pRad = Geom.rad(g.phi);
        const bX = xA + g.TL * Math.cos(pRad);
        const bY = yA - g.TL * Math.sin(pRad);
        const fvLen = g.TL * Math.cos(pRad);
        const bpX = xA + fvLen;
        const bpY = yAp;
        return { xA, yA, yAp, bX, bY, bpX, bpY, fvLen };
    },

    drawStep(n, g, c) {
        const { xA, yA, yAp, bX, bY, bpX, bpY, fvLen } = g;
        const { TL, phi } = c;

        switch (n) {
            case 1:
                drawXYLine();
                Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and Locate End A',
                    `Line ∥ HP: TL=${TL}mm, θ=0°, φ=${phi}°.\n` +
                    `a is ${c.d_A}mm below xy. a' is ${c.h_A}mm above xy.`,
                    'When the line is parallel to HP (θ=0), the Top View shows the TRUE LENGTH at the TRUE ANGLE φ. ' +
                    'The Front View will be a horizontal line (foreshortened).');
                break;
            case 2:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                updateInstructions('Step 2', 'Draw Top View ab at φ',
                    `From a, draw at φ=${phi}° below xy, length TL=${TL}mm → b.\n` +
                    `ab IS the true length (line ∥ HP).`,
                    'Since the line is parallel to HP, the Top View is undistorted — it shows the true length and true angle φ.');
                break;
            case 3:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawProjector(bX, bY, yAp + 5);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                drawPoint(bpX, bpY, cfg.fvColor, 3); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 3', 'Project b Up to Get b\'',
                    `Project b up to horizontal from a' → b'.\n` +
                    `FV length a'b' = L·cos φ = ${fvLen.toFixed(1)}mm.`,
                    'b\' is directly above b (same projector). ' +
                    'The FV is horizontal because the line is parallel to HP (no height change).');
                break;
            case 4:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawProjector(bX, bY, yAp + 5);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                updateInstructions('Step 4', 'Draw Front View a\'b\' ∥ xy',
                    `a'b' is horizontal (∥ xy), length = ${fvLen.toFixed(1)}mm.\n` +
                    `TV ab is at φ=${phi}° to xy, length = TL=${TL}mm.`,
                    'The FV is always parallel to xy when the line is parallel to HP. ' +
                    'Key property: ∥ HP → FV ∥ xy.');
                break;
            case 5:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bX, bY - 5, bpY + 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                drawDimension(xA, yA, bX, bY, `TL=${TL}mm`);
                drawDimension(xA, yAp, bpX, bpY, `${fvLen.toFixed(1)}mm`);
                if (state.showTraces) Draw.traces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
                updateInstructions('Step 5 ✓', 'Complete — Line ∥ HP',
                    `TV ab = TL = ${TL}mm at φ=${phi}° ✓\n` +
                    `FV a'b' = ${fvLen.toFixed(1)}mm ∥ xy ✓`,
                    'Summary: ∥ HP means TV = TL at φ, FV ∥ xy and foreshortened. ' +
                    'The line has no inclination to HP (θ=0).');
                break;
        }
    }
});

if (typeof window !== 'undefined') console.log('[✓] PROC Group A loaded (PROC-01 to PROC-05)');
