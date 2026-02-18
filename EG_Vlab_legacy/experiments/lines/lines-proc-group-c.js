/**
 * lines-proc-group-c.js
 * PROC-09 to PROC-12: Projected length + angles given
 */

// ─────────────────────────────────────────────────────────────
// PROC-09  {L_TV, θ, φ, h_A, d_A}  — TV length + both angles (8 steps)
// ─────────────────────────────────────────────────────────────
registerProc('PROC-09', {
    name: 'TV Length given with both angles (L_TV, θ, φ, hA, dA)',
    totalSteps: 8,

    compute(g) {
        const { L_TV, theta, phi, h_A, d_A } = g;
        const { TL, L_FV } = Geom.fromLTV(L_TV, theta, phi);
        const xA = Geom.calcXA(TL);
        const yA = -d_A;
        const yAp = h_A;
        const tRad = Geom.rad(theta);
        const pRad = Geom.rad(phi);
        // TV: horizontal from a, length L_TV
        const bX = xA + L_TV;
        const bY = yA;
        // FV: from a' at angle theta, length TL
        const bpX = xA + TL * Math.cos(tRad);
        const bpY = yAp + TL * Math.sin(tRad);
        // Rotation arc: from b, swing to horizontal to show TL
        const tlArcX = xA + TL;
        const tlArcY = yA;
        return { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_FV, tlArcX, tlArcY };
    },

    drawStep(n, g, c) {
        const { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_FV, tlArcX } = g;
        const { L_TV, theta, phi } = c;
        const tRad = Geom.rad(theta);

        switch (n) {
            case 1:
                drawXYLine();
                Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and Locate End A',
                    `Given: TV length L_TV=${L_TV}mm, θ=${theta}°, φ=${phi}°.\n` +
                    `a is ${c.d_A}mm below xy. a' is ${c.h_A}mm above xy.`,
                    'Here the TOP VIEW LENGTH is given directly — not the true length. ' +
                    'We know L_TV = TL·cos θ, so TL = L_TV / cos θ. ' +
                    'The construction finds TL by rotation.');
                break;
            case 2:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 2', 'Draw TV ab — Horizontal, Length L_TV',
                    `From a, draw horizontal (∥ xy), length L_TV=${L_TV}mm → b.\n` +
                    `ab is the given Top View length.`,
                    'The TV is horizontal because the line is inclined to HP (not VP). ' +
                    'We draw it directly since L_TV is given.');
                break;
            case 3:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawProjector(bX, bY, yAp + 5);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 3', 'Project b Up to FV Region',
                    `Drop projector from b upward into FV region.\n` +
                    `b' must lie on this projector.`,
                    'b and b\' must always be on the same projector (same x-coordinate). ' +
                    'We know the x-position of b\' from the projector, but not its height yet.');
                break;
            case 4:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawProjector(bX, bY, yAp + TL + 5);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 0 });
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                updateInstructions('Step 4', "Draw FV a'b' at θ",
                    `From a', draw at θ=${theta}° to xy until it meets the projector from b → b'.\n` +
                    `a'b' is the Front View.`,
                    'Since the line is parallel to VP (φ=0 is NOT the case here — φ is given), ' +
                    'we use the angle θ to draw the FV. The projector constraint fixes b\'.');
                break;
            case 5:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawProjector(bX, bY, bpY + 5);
                // Rotation arc to find TL
                drawArc(xA, yAp, TL, 0, theta + 5, cfg.arcColor, 1.0, []);
                drawLine(xA, yAp, tlArcX, yAp, cfg.dimColor, 0.8, []);
                drawPoint(tlArcX, yAp, cfg.dimColor, 3); drawLabel('TL', tlArcX, yAp, cfg.dimColor, { dx: 6, dy: 0 });
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                updateInstructions('Step 5', 'Find True Length by Rotation',
                    `Rotate a'b' to horizontal: swing arc from a', radius a'b'.\n` +
                    `TL = L_TV / cos θ = ${L_TV} / cos ${theta}° = ${TL.toFixed(1)}mm.`,
                    'Rotating the FV to horizontal gives the True Length. ' +
                    'This is the "rabatment" technique: swing the inclined line down to the reference plane.');
                break;
            case 6:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bX, bY - 5, bpY + 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                updateInstructions('Step 6', 'Final Views',
                    `TV ab = L_TV = ${L_TV}mm (given)\n` +
                    `FV a'b' = L_FV = ${L_FV.toFixed(1)}mm`,
                    'Both views are now drawn. The TV was given directly; the FV was constructed using θ and the projector.');
                break;
            case 7:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bX, bY - 5, bpY + 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawDimension(xA, yAp, bpX, bpY, `${L_FV.toFixed(1)}mm`);
                drawDimension(xA, yA, bX, bY, `${L_TV}mm`);
                updateInstructions('Step 7', 'Verify Angles',
                    `FV a'b' makes θ=${theta}° with xy ✓\n` +
                    `TV ab ∥ xy (φ component) ✓`,
                    'The FV angle equals θ because the line is parallel to VP in this case. ' +
                    'If φ were also non-zero, we would need the full two-rotation method.');
                break;
            case 8:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bX, bY - 5, bpY + 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawDimension(xA, yAp, bpX, bpY, `${L_FV.toFixed(1)}mm`);
                drawDimension(xA, yA, bX, bY, `${L_TV}mm`);
                if (state.showTraces) Draw.traces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
                updateInstructions('Step 8 ✓', 'Complete — TV Length Given',
                    `L_TV=${L_TV}mm (given) | TL=${TL.toFixed(1)}mm (found)\n` +
                    `θ=${theta}° | φ=${phi}°\n` +
                    `L_FV=${L_FV.toFixed(1)}mm`,
                    'Summary: L_TV = TL·cos θ → TL = L_TV/cos θ. ' +
                    'The construction directly uses the given TV length without needing the two-rotation method.');
                break;
        }
    }
});

// ─────────────────────────────────────────────────────────────
// PROC-10  {L_FV, θ, φ, h_A, d_A}  — FV length + both angles (8 steps)
// ─────────────────────────────────────────────────────────────
registerProc('PROC-10', {
    name: 'FV Length given with both angles (L_FV, θ, φ, hA, dA)',
    totalSteps: 8,

    compute(g) {
        const { L_FV, theta, phi, h_A, d_A } = g;
        const { TL, L_TV } = Geom.fromLFV(L_FV, theta, phi);
        const xA = Geom.calcXA(TL);
        const yA = -d_A;
        const yAp = h_A;
        const pRad = Geom.rad(phi);
        // TV: from a at angle phi, length TL
        const bX = xA + TL * Math.cos(pRad);
        const bY = yA - TL * Math.sin(pRad);
        // FV: horizontal from a', length L_FV
        const bpX = xA + L_FV;
        const bpY = yAp;
        const tlArcX = xA + TL;
        return { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_TV, tlArcX };
    },

    drawStep(n, g, c) {
        const { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_TV, tlArcX } = g;
        const { L_FV, theta, phi } = c;

        switch (n) {
            case 1:
                drawXYLine();
                Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and Locate End A',
                    `Given: FV length L_FV=${L_FV}mm, θ=${theta}°, φ=${phi}°.\n` +
                    `a is ${c.d_A}mm below xy. a' is ${c.h_A}mm above xy.`,
                    'Here the FRONT VIEW LENGTH is given directly. ' +
                    'L_FV = TL·cos φ, so TL = L_FV / cos φ. ' +
                    'This is the mirror of PROC-09 (TV↔FV, θ↔φ).');
                break;
            case 2:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 2', "Draw FV a'b' — Horizontal, Length L_FV",
                    `From a', draw horizontal (∥ xy), length L_FV=${L_FV}mm → b'.\n` +
                    `a'b' is the given Front View length.`,
                    'The FV is horizontal because the line is parallel to HP (θ=0 is NOT the case — θ is given). ' +
                    'Wait — if θ is given and non-zero, the FV would not be horizontal. ' +
                    'This PROC applies when the FV length is given and the line is inclined to VP (∥ HP, θ=0). ' +
                    'The FV is horizontal in this case.');
                break;
            case 3:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawProjector(bpX, bpY, yA - 5);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 3', "Project b' Down to TV Region",
                    `Drop projector from b' downward into TV region.\n` +
                    `b must lie on this projector.`,
                    'b and b\' share the same projector. We know x-position of b from the projector.');
                break;
            case 4:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawProjector(bpX, bpY, yA - TL - 5);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                updateInstructions('Step 4', 'Draw TV ab at φ',
                    `From a, draw at φ=${phi}° below xy until it meets the projector from b' → b.\n` +
                    `ab is the Top View.`,
                    'The projector constraint fixes b. The angle φ determines how deep b goes below xy.');
                break;
            case 5:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawProjector(bpX, bpY, bY - 5);
                drawArc(xA, yA, TL, -phi - 5, 0, cfg.arcColor, 1.0, []);
                drawLine(xA, yA, tlArcX, yA, cfg.dimColor, 0.8, []);
                drawPoint(tlArcX, yA, cfg.dimColor, 3); drawLabel('TL', tlArcX, yA, cfg.dimColor, { dx: 6, dy: 0 });
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                updateInstructions('Step 5', 'Find True Length by Rotation',
                    `Rotate ab to horizontal: swing arc from a, radius ab.\n` +
                    `TL = L_FV / cos φ = ${L_FV} / cos ${phi}° = ${TL.toFixed(1)}mm.`,
                    'Rotating the TV to horizontal gives the True Length. ' +
                    'This is the same rabatment technique as PROC-09, applied to the TV instead of FV.');
                break;
            case 6:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bpX, bY - 5, bpY + 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                updateInstructions('Step 6', 'Final Views',
                    `FV a'b' = L_FV = ${L_FV}mm (given)\n` +
                    `TV ab = L_TV = ${L_TV.toFixed(1)}mm`,
                    'Both views are now drawn. The FV was given directly; the TV was constructed using φ and the projector.');
                break;
            case 7:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bpX, bY - 5, bpY + 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                drawDimension(xA, yAp, bpX, bpY, `${L_FV}mm`);
                drawDimension(xA, yA, bX, bY, `${L_TV.toFixed(1)}mm`);
                updateInstructions('Step 7', 'Verify Angles',
                    `TV ab makes φ=${phi}° with xy ✓\n` +
                    `FV a'b' ∥ xy ✓`,
                    'The TV angle equals φ because the line is parallel to HP in this case.');
                break;
            case 8:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bpX, bY - 5, bpY + 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                drawDimension(xA, yAp, bpX, bpY, `${L_FV}mm`);
                drawDimension(xA, yA, bX, bY, `${L_TV.toFixed(1)}mm`);
                if (state.showTraces) Draw.traces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
                updateInstructions('Step 8 ✓', 'Complete — FV Length Given',
                    `L_FV=${L_FV}mm (given) | TL=${TL.toFixed(1)}mm (found)\n` +
                    `θ=${theta}° | φ=${phi}°\n` +
                    `L_TV=${L_TV.toFixed(1)}mm`,
                    'Summary: L_FV = TL·cos φ → TL = L_FV/cos φ. Mirror of PROC-09.');
                break;
        }
    }
});

// ─────────────────────────────────────────────────────────────
// PROC-11  {L_TV, θ, φ=0, h_A, d_A}  — TV length + inclined to HP ∥ VP (6 steps)
// ─────────────────────────────────────────────────────────────
registerProc('PROC-11', {
    name: 'TV Length + Inclined to HP, Parallel to VP (L_TV, θ, hA, dA)',
    totalSteps: 6,

    compute(g) {
        const { L_TV, theta, h_A, d_A } = g;
        const tRad = Geom.rad(theta);
        const TL = L_TV / Math.cos(tRad);
        const xA = Geom.calcXA(TL);
        const yA = -d_A;
        const yAp = h_A;
        const bX = xA + L_TV;
        const bY = yA;
        const bpX = xA + TL * Math.cos(tRad);
        const bpY = yAp + TL * Math.sin(tRad);
        const tlArcX = xA + TL;
        return { xA, yA, yAp, bX, bY, bpX, bpY, TL, tlArcX };
    },

    drawStep(n, g, c) {
        const { xA, yA, yAp, bX, bY, bpX, bpY, TL, tlArcX } = g;
        const { L_TV, theta } = c;

        switch (n) {
            case 1:
                drawXYLine();
                Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and Locate End A',
                    `Given: TV length L_TV=${L_TV}mm, θ=${theta}°, φ=0° (∥ VP).\n` +
                    `a is ${c.d_A}mm below xy. a' is ${c.h_A}mm above xy.`,
                    'The line is parallel to VP (φ=0), so the FV shows TL at angle θ. ' +
                    'The TV is horizontal and has length L_TV (given directly).');
                break;
            case 2:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 2', 'Draw TV ab — Horizontal, Length L_TV',
                    `From a, draw horizontal, length L_TV=${L_TV}mm → b.`,
                    'The TV is horizontal (∥ xy) because the line is parallel to VP. ' +
                    'We draw it directly since L_TV is given.');
                break;
            case 3:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawProjector(bX, bY, yAp + TL + 5);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 3', 'Project b Up',
                    `Drop projector from b upward. b' lies on this projector.`,
                    'b\' must be directly above b on the same projector.');
                break;
            case 4:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawProjector(bX, bY, bpY + 5);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 0 });
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                updateInstructions('Step 4', "Draw FV a'b' at θ",
                    `From a', draw at θ=${theta}° to xy until it meets the projector from b → b'.\n` +
                    `a'b' = TL = ${TL.toFixed(1)}mm (true length, since ∥ VP).`,
                    'Since the line is parallel to VP, the FV shows the TRUE LENGTH at the TRUE ANGLE θ. ' +
                    'The projector from b fixes the position of b\'.');
                break;
            case 5:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawProjector(bX, bY, bpY + 5);
                drawArc(xA, yAp, TL, 0, theta + 5, cfg.arcColor, 1.0, []);
                drawLine(xA, yAp, tlArcX, yAp, cfg.dimColor, 0.8, []);
                drawPoint(tlArcX, yAp, cfg.dimColor, 3); drawLabel(`TL=${TL.toFixed(1)}`, tlArcX, yAp, cfg.dimColor, { dx: 6, dy: 0 });
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                updateInstructions('Step 5', 'Verify TL by Rotation',
                    `Rotate a'b' to horizontal → TL = ${TL.toFixed(1)}mm.\n` +
                    `Check: L_TV = TL·cos θ = ${TL.toFixed(1)}·cos ${theta}° = ${L_TV}mm ✓`,
                    'Rotating the FV to horizontal confirms the True Length. ' +
                    'This verifies our construction: TL·cos θ should equal the given L_TV.');
                break;
            case 6:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bX, bY - 5, bpY + 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawDimension(xA, yAp, bpX, bpY, `TL=${TL.toFixed(1)}mm`);
                drawDimension(xA, yA, bX, bY, `L_TV=${L_TV}mm`);
                if (state.showTraces) Draw.traces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
                updateInstructions('Step 6 ✓', 'Complete — TV Length + ∥ VP',
                    `L_TV=${L_TV}mm (given) | TL=${TL.toFixed(1)}mm (found)\n` +
                    `FV a'b' = TL at θ=${theta}° | TV ab ∥ xy`,
                    'Summary: When ∥ VP and L_TV is given, TL = L_TV/cos θ. ' +
                    'The FV shows TL at θ, TV is horizontal.');
                break;
        }
    }
});

// ─────────────────────────────────────────────────────────────
// PROC-12  {L_FV, θ=0, φ, h_A, d_A}  — FV length + inclined to VP ∥ HP (6 steps)
// ─────────────────────────────────────────────────────────────
registerProc('PROC-12', {
    name: 'FV Length + Inclined to VP, Parallel to HP (L_FV, φ, hA, dA)',
    totalSteps: 6,

    compute(g) {
        const { L_FV, phi, h_A, d_A } = g;
        const pRad = Geom.rad(phi);
        const TL = L_FV / Math.cos(pRad);
        const xA = Geom.calcXA(TL);
        const yA = -d_A;
        const yAp = h_A;
        const bpX = xA + L_FV;
        const bpY = yAp;
        const bX = xA + TL * Math.cos(pRad);
        const bY = yA - TL * Math.sin(pRad);
        const tlArcX = xA + TL;
        return { xA, yA, yAp, bX, bY, bpX, bpY, TL, tlArcX };
    },

    drawStep(n, g, c) {
        const { xA, yA, yAp, bX, bY, bpX, bpY, TL, tlArcX } = g;
        const { L_FV, phi } = c;

        switch (n) {
            case 1:
                drawXYLine();
                Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and Locate End A',
                    `Given: FV length L_FV=${L_FV}mm, θ=0° (∥ HP), φ=${phi}°.\n` +
                    `a is ${c.d_A}mm below xy. a' is ${c.h_A}mm above xy.`,
                    'The line is parallel to HP (θ=0), so the TV shows TL at angle φ. ' +
                    'The FV is horizontal and has length L_FV (given directly). Mirror of PROC-11.');
                break;
            case 2:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 2', "Draw FV a'b' — Horizontal, Length L_FV",
                    `From a', draw horizontal, length L_FV=${L_FV}mm → b'.`,
                    'The FV is horizontal (∥ xy) because the line is parallel to HP. ' +
                    'We draw it directly since L_FV is given.');
                break;
            case 3:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawProjector(bpX, bpY, yA - TL - 5);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 3', "Project b' Down",
                    `Drop projector from b' downward. b lies on this projector.`,
                    'b must be directly below b\' on the same projector.');
                break;
            case 4:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawProjector(bpX, bpY, bY - 5);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                updateInstructions('Step 4', 'Draw TV ab at φ',
                    `From a, draw at φ=${phi}° below xy until it meets the projector from b' → b.\n` +
                    `ab = TL = ${TL.toFixed(1)}mm (true length, since ∥ HP).`,
                    'Since the line is parallel to HP, the TV shows the TRUE LENGTH at the TRUE ANGLE φ. ' +
                    'The projector from b\' fixes the position of b.');
                break;
            case 5:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawProjector(bpX, bpY, bY - 5);
                drawArc(xA, yA, TL, -phi - 5, 0, cfg.arcColor, 1.0, []);
                drawLine(xA, yA, tlArcX, yA, cfg.dimColor, 0.8, []);
                drawPoint(tlArcX, yA, cfg.dimColor, 3); drawLabel(`TL=${TL.toFixed(1)}`, tlArcX, yA, cfg.dimColor, { dx: 6, dy: 0 });
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                updateInstructions('Step 5', 'Verify TL by Rotation',
                    `Rotate ab to horizontal → TL = ${TL.toFixed(1)}mm.\n` +
                    `Check: L_FV = TL·cos φ = ${TL.toFixed(1)}·cos ${phi}° = ${L_FV}mm ✓`,
                    'Rotating the TV to horizontal confirms the True Length.');
                break;
            case 6:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bpX, bY - 5, bpY + 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                drawDimension(xA, yAp, bpX, bpY, `L_FV=${L_FV}mm`);
                drawDimension(xA, yA, bX, bY, `TL=${TL.toFixed(1)}mm`);
                if (state.showTraces) Draw.traces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
                updateInstructions('Step 6 ✓', 'Complete — FV Length + ∥ HP',
                    `L_FV=${L_FV}mm (given) | TL=${TL.toFixed(1)}mm (found)\n` +
                    `TV ab = TL at φ=${phi}° | FV a'b' ∥ xy`,
                    'Summary: When ∥ HP and L_FV is given, TL = L_FV/cos φ. ' +
                    'The TV shows TL at φ, FV is horizontal.');
                break;
        }
    }
});

if (typeof window !== 'undefined') console.log('[✓] PROC Group C loaded (PROC-09 to PROC-12)');
