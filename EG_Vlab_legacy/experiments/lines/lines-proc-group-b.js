/**
 * lines-proc-group-b.js
 * PROC-06 to PROC-08: Special cases (parallel/perpendicular)
 */

// ─────────────────────────────────────────────────────────────
// PROC-06  {TL, θ=0, φ=0, h_A, d_A}  — Parallel to both HP & VP (5 steps)
// ─────────────────────────────────────────────────────────────
registerProc('PROC-06', {
    name: 'Parallel to HP and VP (TL, hA, dA)',
    totalSteps: 5,

    compute(g) {
        const xA = Geom.calcXA(g.TL);
        const yA = -g.d_A;
        const yAp = g.h_A;
        const bX = xA + g.TL;
        const bY = yA;
        const bpX = xA + g.TL;
        const bpY = yAp;
        return { xA, yA, yAp, bX, bY, bpX, bpY };
    },

    drawStep(n, g, c) {
        const { xA, yA, yAp, bX, bY, bpX, bpY } = g;
        const { TL } = c;

        switch (n) {
            case 1:
                drawXYLine();
                Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and Locate End A',
                    `Line ∥ HP and ∥ VP: TL=${TL}mm.\n` +
                    `a is ${c.d_A}mm below xy. a' is ${c.h_A}mm above xy.`,
                    'When a line is parallel to BOTH HP and VP, it is parallel to the xy line direction. ' +
                    'Both views will show the TRUE LENGTH, and both will be parallel to xy.');
                break;
            case 2:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 2', 'Draw Front View a\'b\' ∥ xy',
                    `From a', draw horizontal (∥ xy), length TL=${TL}mm → b'.\n` +
                    `a'b' = TL (true length shown in FV).`,
                    'The FV is horizontal (∥ xy) because the line has no inclination to VP (φ=0). ' +
                    'It shows the true length because the line is also parallel to HP (θ=0).');
                break;
            case 3:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawProjector(bpX, bpY, bY - 5);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 3', 'Project Down — Draw Top View ab ∥ xy',
                    `Drop projector from b' → b. Draw ab horizontal.\n` +
                    `ab = TL = ${TL}mm (true length also in TV).`,
                    'Both views show the true length because the line is parallel to both planes. ' +
                    'This is the simplest case in projections of straight lines.');
                break;
            case 4:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bpX, bpY - 5, bY - 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                updateInstructions('Step 4', 'Both Views Parallel to xy',
                    `FV a'b' ∥ xy, length = TL = ${TL}mm\n` +
                    `TV ab ∥ xy, length = TL = ${TL}mm`,
                    'Key rule: ∥ HP AND ∥ VP → both views ∥ xy and both show TL. ' +
                    'The line is at constant height h_A above HP and constant depth d_A from VP.');
                break;
            case 5:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawProjector(bpX, bpY - 5, bY - 5);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawDimension(xA, yAp, bpX, bpY, `TL=${TL}mm`);
                drawDimension(xA, yA, bX, bY, `TL=${TL}mm`);
                updateInstructions('Step 5 ✓', 'Complete — Parallel to Both Planes',
                    `FV = TV = TL = ${TL}mm ∥ xy ✓\n` +
                    `Height = ${c.h_A}mm | Depth = ${c.d_A}mm`,
                    'Both projections are equal to the true length. This is the only case where both views show TL simultaneously.');
                break;
        }
    }
});

// ─────────────────────────────────────────────────────────────
// PROC-07  {TL, θ=90, h_A, d_A}  — Perpendicular to HP (5 steps)
// ─────────────────────────────────────────────────────────────
registerProc('PROC-07', {
    name: 'Perpendicular to HP (TL, hA, dA)',
    totalSteps: 5,

    compute(g) {
        const xA = Geom.calcXA(g.TL);
        const yA = -g.d_A;
        const yAp = g.h_A;
        // B is directly above A (θ=90°)
        const bX = xA;
        const bY = yA;
        const bpX = xA;
        const bpY = yAp + g.TL;
        // Lower end height (h_A is the lower end, h_A+TL is upper)
        const lowerH = g.h_A;
        return { xA, yA, yAp, bX, bY, bpX, bpY, lowerH };
    },

    drawStep(n, g, c) {
        const { xA, yA, yAp, bX, bY, bpX, bpY } = g;
        const { TL } = c;
        const h_A = c.h_A;

        switch (n) {
            case 1:
                drawXYLine();
                Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and Locate End A (Lower End)',
                    `Line ⊥ HP: TL=${TL}mm.\n` +
                    `a (TV point) is ${c.d_A}mm below xy.\n` +
                    `a' (FV lower end) is ${h_A}mm above xy.`,
                    'When a line is perpendicular to HP, it stands vertically on HP. ' +
                    'The Top View collapses to a POINT (both ends project to the same spot). ' +
                    'The Front View shows the TRUE LENGTH as a vertical line.');
                break;
            case 2:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 2', 'Draw Front View a\'b\' ⊥ xy',
                    `From a', draw vertically upward (⊥ xy), length TL=${TL}mm → b'.\n` +
                    `a'b' = TL (true length, perpendicular to xy).`,
                    'The FV is perpendicular to xy because the line is perpendicular to HP. ' +
                    'It shows the true length because the line is parallel to VP (it has no inclination to VP).');
                break;
            case 3:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawPoint(xA, yA, cfg.tvColor, 6);
                drawPointRing(xA, yA, cfg.tvColor, 8);
                drawLabel('a,b', xA, yA, cfg.tvColor, { dx: -14, dy: 0 });
                updateInstructions('Step 3', 'Top View is a Point',
                    `Both a and b project to the SAME point in the TV.\n` +
                    `TV = single point at ${c.d_A}mm below xy.`,
                    'Since the line is perpendicular to HP, every point on the line has the same x and y coordinates on HP. ' +
                    'The entire line collapses to a single point in the Top View.');
                break;
            case 4:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(xA, yA, cfg.tvColor, 6);
                drawPointRing(xA, yA, cfg.tvColor, 8);
                drawLabel('a,b', xA, yA, cfg.tvColor, { dx: -14, dy: 0 });
                drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, { dx: -10, dy: 0 });
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                updateInstructions('Step 4', 'Final Views',
                    `FV a'b' ⊥ xy, length = TL = ${TL}mm\n` +
                    `TV = point (a and b coincide)`,
                    'Key rule: ⊥ HP → TV = point, FV = TL ⊥ xy. ' +
                    'The lower end a\' is at height h_A, upper end b\' is at height h_A + TL.');
                break;
            case 5:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(xA, yA, cfg.tvColor, 6);
                drawPointRing(xA, yA, cfg.tvColor, 8);
                drawLabel('a,b', xA, yA, cfg.tvColor, { dx: -14, dy: 0 });
                drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, { dx: -10, dy: 0 });
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
                drawDimension(xA + 6, yAp, xA + 6, bpY, `TL=${TL}mm`);
                updateInstructions('Step 5 ✓', 'Complete — Perpendicular to HP',
                    `FV = TL = ${TL}mm ⊥ xy ✓\n` +
                    `TV = point at ${c.d_A}mm from VP ✓\n` +
                    `Lower end a': ${h_A}mm above HP | Upper end b': ${(h_A + TL)}mm above HP`,
                    'Verification: the TV is a point, and the FV is a vertical line of length TL. ' +
                    'This is the degenerate case where one view loses all dimensional information.');
                break;
        }
    }
});

// ─────────────────────────────────────────────────────────────
// PROC-08  {TL, φ=90, h_A, d_A}  — Perpendicular to VP (5 steps)
// ─────────────────────────────────────────────────────────────
registerProc('PROC-08', {
    name: 'Perpendicular to VP (TL, hA, dA)',
    totalSteps: 5,

    compute(g) {
        const xA = Geom.calcXA(g.TL);
        const yA = -g.d_A;
        const yAp = g.h_A;
        // B is directly in front of A (φ=90°)
        const bX = xA;
        const bY = yA - g.TL;
        const bpX = xA;
        const bpY = yAp;
        return { xA, yA, yAp, bX, bY, bpX, bpY };
    },

    drawStep(n, g, c) {
        const { xA, yA, yAp, bX, bY, bpX, bpY } = g;
        const { TL } = c;

        switch (n) {
            case 1:
                drawXYLine();
                Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and Locate End A (Nearer End)',
                    `Line ⊥ VP: TL=${TL}mm.\n` +
                    `a (TV nearer end) is ${c.d_A}mm below xy.\n` +
                    `a' (FV point) is ${c.h_A}mm above xy.`,
                    'When a line is perpendicular to VP, it points directly toward/away from the observer. ' +
                    'The Front View collapses to a POINT. ' +
                    'The Top View shows the TRUE LENGTH as a vertical line (perpendicular to xy).');
                break;
            case 2:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: -9, dy: 0 });
                updateInstructions('Step 2', 'Draw Top View ab ⊥ xy',
                    `From a, draw vertically downward (⊥ xy), length TL=${TL}mm → b.\n` +
                    `ab = TL (true length, perpendicular to xy).`,
                    'The TV is perpendicular to xy because the line is perpendicular to VP. ' +
                    'It shows the true length because the line is parallel to HP (θ=0).');
                break;
            case 3:
                Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: -9, dy: 0 });
                drawPoint(xA, yAp, cfg.fvColor, 6);
                drawPointRing(xA, yAp, cfg.fvColor, 8);
                drawLabel("a',b'", xA, yAp, cfg.fvColor, { dx: -18, dy: 0 });
                updateInstructions('Step 3', 'Front View is a Point',
                    `Both a' and b' project to the SAME point in the FV.\n` +
                    `FV = single point at ${c.h_A}mm above xy.`,
                    'Since the line is perpendicular to VP, every point on the line has the same height. ' +
                    'The entire line collapses to a single point in the Front View.');
                break;
            case 4:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawPoint(xA, yAp, cfg.fvColor, 6);
                drawPointRing(xA, yAp, cfg.fvColor, 8);
                drawLabel("a',b'", xA, yAp, cfg.fvColor, { dx: -18, dy: 0 });
                drawPoint(xA, yA, cfg.tvColor); drawLabel('a', xA, yA, cfg.tvColor, { dx: -9, dy: 0 });
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: -9, dy: 0 });
                updateInstructions('Step 4', 'Final Views',
                    `TV ab ⊥ xy, length = TL = ${TL}mm\n` +
                    `FV = point (a' and b' coincide)`,
                    'Key rule: ⊥ VP → FV = point, TV = TL ⊥ xy. ' +
                    'The nearer end a is at depth d_A, far end b is at depth d_A + TL.');
                break;
            case 5:
                drawXYLine();
                drawProjector(xA, yA - 8, yAp + 8);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawPoint(xA, yAp, cfg.fvColor, 6);
                drawPointRing(xA, yAp, cfg.fvColor, 8);
                drawLabel("a',b'", xA, yAp, cfg.fvColor, { dx: -18, dy: 0 });
                drawPoint(xA, yA, cfg.tvColor); drawLabel('a', xA, yA, cfg.tvColor, { dx: -9, dy: 0 });
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: -9, dy: 0 });
                drawDimension(xA + 6, yA, xA + 6, bY, `TL=${TL}mm`);
                updateInstructions('Step 5 ✓', 'Complete — Perpendicular to VP',
                    `TV = TL = ${TL}mm ⊥ xy ✓\n` +
                    `FV = point at ${c.h_A}mm above HP ✓\n` +
                    `Nearer end a: ${c.d_A}mm from VP | Far end b: ${(c.d_A + TL)}mm from VP`,
                    'Verification: the FV is a point, and the TV is a vertical line of length TL. ' +
                    'Compare with PROC-07: the two cases are mirror images of each other (HP↔VP).');
                break;
        }
    }
});

if (typeof window !== 'undefined') console.log('[✓] PROC Group B loaded (PROC-06 to PROC-08)');
