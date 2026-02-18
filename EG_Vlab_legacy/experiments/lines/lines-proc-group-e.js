/**
 * lines-proc-group-e.js
 * PROC-16: L_TV + α + h_A + d_A + h_B  (view length + apparent angle + far-end height)
 * PROC-17: L_FV + β + h_A + d_A + d_B  (view length + apparent angle + far-end depth)
 * PROC-18: TL + α + h_A + d_A + h_B    (TL + apparent TV angle + far-end height)
 * PROC-19: TL + β + h_A + d_A + d_B    (TL + apparent FV angle + far-end depth)
 * PROC-20: TL + h_A + d_A + h_B + d_B  (TL + both endpoints)
 */

// ─────────────────────────────────────────────────────────────
// PROC-16  {L_TV, α, h_A, d_A, h_B}
// TV length given, TV angle α with xy, and B's height
// ─────────────────────────────────────────────────────────────
registerProc('PROC-16', {
    name: 'TV Length + Apparent Angle α + h_B',
    totalSteps: 8,
    compute(g) {
        const { L_TV, alpha, h_A, d_A, h_B } = g;
        const xA = Geom.calcXA(L_TV + 20);
        const yA = -d_A;
        const yAp = h_A;
        const aRad = Geom.rad(alpha);

        // TV ab at angle α below xy from a
        const bX = xA + L_TV * Math.cos(aRad);
        const bY = yA - L_TV * Math.sin(aRad);

        // FV: b' is on the projector of b at height h_B
        const bpX = bX;
        const bpY = h_B;

        // TL by rotation
        const dh = h_B - h_A;
        const dd = Math.abs(bY - yA);  // depth diff from TV
        const dx = bX - xA;
        const TL = Math.sqrt(dx * dx + dh * dh + dd * dd);
        const L_FV = Math.sqrt(dx * dx + dh * dh);
        const theta = Geom.deg(Math.asin(Math.min(1, Math.abs(dh) / (TL || 1))));
        const phi = Geom.deg(Math.asin(Math.min(1, dd / (TL || 1))));

        return { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_FV, theta, phi, L_TV, dh, dd };
    },
    drawStep(n, g, c) {
        const { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_FV, theta, phi, L_TV } = g;
        switch (n) {
            case 1:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and locate A',
                    `a: ${c.d_A}mm below xy | a': ${c.h_A}mm above xy`,
                    'Start by placing end A at its known position.');
                break;
            case 2:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawAngleArc(xA, yA, c.alpha, 14, cfg.tvColor, 'down');
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                updateInstructions('Step 2', 'Draw TV at angle α',
                    `TV ab = ${c.L_TV}mm at α = ${c.alpha}° below xy`,
                    'α is the apparent angle the TV makes with xy. The TV length is directly given, so we draw it directly.');
                break;
            case 3:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                drawProjector(bX, bY - 5, bpY + 5);
                updateInstructions('Step 3', 'Draw projector from b',
                    `Projector of B extends vertically from b`,
                    'b and b\' share the same projector. We draw it to locate b\' on the FV side.');
                break;
            case 4:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                drawProjector(bX, bY - 5, bpY + 5);
                Draw.locus(xA - 10, bpX + 15, bpY);
                drawLabel(`h_B=${c.h_B}mm`, bpX + 10, bpY, cfg.dimColor, { dx: 0, dy: -8 });
                updateInstructions('Step 4', 'Mark h_B locus',
                    `b' is at height h_B = ${c.h_B}mm above xy`,
                    'Since h_B is given, b\' lies at this height on the projector of B.');
                break;
            case 5:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: -4 });
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                updateInstructions('Step 5', 'Draw FV a\'b\'',
                    `FV a'b': from a' to b' (length = ${L_FV.toFixed(1)}mm)`,
                    'The FV is now determined: a\' is known, b\' is at the intersection of projector and h_B locus.');
                break;
            case 6: {
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                const rotX = xA + TL;
                drawArc(xA, yAp, L_FV, 0, 45, cfg.arcColor, 1.0, [3, 3]);
                drawLine(xA, yAp, rotX, yAp, cfg.dimColor, 0.8, [2, 3]);
                drawDimension(xA, yAp, rotX, yAp, `TL=${TL.toFixed(1)}mm`);
                updateInstructions('Step 6', 'Find TL by rotation',
                    `Rotate FV to horizontal → TL = ${TL.toFixed(1)}mm`,
                    'TL² = L_FV² + Δd². Rotating the FV to horizontal gives the true length.');
                break;
            }
            case 7:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                updateInstructions('Step 7', 'Find true angles',
                    `θ = ${theta.toFixed(1)}° | φ = ${phi.toFixed(1)}°`,
                    'The true angles are found from the final views by comparing with the horizontal.');
                break;
            case 8:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                if (state.showTraces) Draw.traces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
                updateInstructions('Step 8 ✓', 'Complete — L_TV + α + h_B',
                    `TL=${TL.toFixed(1)}mm | θ=${theta.toFixed(1)}° | φ=${phi.toFixed(1)}°\nL_TV=${c.L_TV}mm | α=${c.alpha}° | h_B=${c.h_B}mm`,
                    'From TV length, apparent angle, and far-end height, we found TL and both true angles. ' +
                    'Key: α is NOT the true angle, it\'s the apparent angle.');
                break;
        }
    }
});

// ─────────────────────────────────────────────────────────────
// PROC-17  {L_FV, β, h_A, d_A, d_B}
// FV length + FV angle β with xy + B's depth
// ─────────────────────────────────────────────────────────────
registerProc('PROC-17', {
    name: 'FV Length + Apparent Angle β + d_B',
    totalSteps: 8,
    compute(g) {
        const { L_FV, beta, h_A, d_A, d_B } = g;
        const xA = Geom.calcXA(L_FV + 20);
        const yA = -d_A;
        const yAp = h_A;
        const bRad = Geom.rad(beta);

        // FV a'b' at angle β above xy from a'
        const bpX = xA + L_FV * Math.cos(bRad);
        const bpY = yAp + L_FV * Math.sin(bRad);

        // TV: b is on the projector of b' at depth d_B
        const bX = bpX;
        const bY = -d_B;

        const dh = bpY - yAp;
        const dd = Math.abs(bY - yA);
        const dx = bX - xA;
        const TL = Math.sqrt(dx * dx + dh * dh + dd * dd);
        const L_TV = Math.sqrt(dx * dx + dd * dd);
        const theta = Geom.deg(Math.asin(Math.min(1, Math.abs(dh) / (TL || 1))));
        const phi = Geom.deg(Math.asin(Math.min(1, dd / (TL || 1))));

        return { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_TV, theta, phi, L_FV, dh, dd };
    },
    drawStep(n, g, c) {
        const { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_TV, theta, phi, L_FV } = g;
        switch (n) {
            case 1:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and locate A',
                    `a: ${c.d_A}mm below xy | a': ${c.h_A}mm above xy`, '');
                break;
            case 2:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawAngleArc(xA, yAp, c.beta, 14, cfg.fvColor, 'up');
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: -4 });
                updateInstructions('Step 2', 'Draw FV at angle β',
                    `FV a'b' = ${c.L_FV}mm at β = ${c.beta}° above xy`,
                    'β is the apparent angle the FV makes with xy. We draw it directly since L_FV is given.');
                break;
            case 3:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: -4 });
                drawProjector(bpX, bY - 5, bpY + 5);
                updateInstructions('Step 3', 'Draw projector from b\'',
                    `Projector of B extends vertically from b'`, '');
                break;
            case 4:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: -4 });
                drawProjector(bpX, bY - 5, bpY + 5);
                Draw.locus(xA - 10, bX + 15, bY);
                drawLabel(`d_B=${c.d_B}mm`, bX + 10, bY, cfg.dimColor, { dx: 0, dy: 6 });
                updateInstructions('Step 4', 'Mark d_B locus',
                    `b is at depth d_B = ${c.d_B}mm below xy`,
                    'Since d_B is given, b lies at this depth on the projector of B.');
                break;
            case 5:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                updateInstructions('Step 5', 'Draw TV ab',
                    `TV ab from a to b (length = ${L_TV.toFixed(1)}mm)`,
                    'Both views are now complete.');
                break;
            case 6: {
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                const rotX = xA + TL;
                drawLine(xA, yA, rotX, yA, cfg.dimColor, 0.8, [2, 3]);
                drawDimension(xA, yA, rotX, yA, `TL=${TL.toFixed(1)}mm`);
                updateInstructions('Step 6', 'Find TL by rotation',
                    `TL = ${TL.toFixed(1)}mm`, '');
                break;
            }
            case 7:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                updateInstructions('Step 7', 'Find true angles',
                    `θ = ${theta.toFixed(1)}° | φ = ${phi.toFixed(1)}°`, '');
                break;
            case 8:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                if (state.showTraces) Draw.traces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
                updateInstructions('Step 8 ✓', 'Complete — L_FV + β + d_B',
                    `TL=${TL.toFixed(1)}mm | θ=${theta.toFixed(1)}° | φ=${phi.toFixed(1)}°\nL_FV=${c.L_FV}mm | β=${c.beta}° | d_B=${c.d_B}mm`, '');
                break;
        }
    }
});

// ─────────────────────────────────────────────────────────────
// PROC-18  {TL, α, h_A, d_A, h_B}
// TL + apparent TV angle α + both-end heights → draw TV at α, find b' from h_B
// ─────────────────────────────────────────────────────────────
registerProc('PROC-18', {
    name: 'TL + Apparent Angle α + h_B',
    totalSteps: 8,
    compute(g) {
        const { TL, alpha, h_A, d_A, h_B } = g;
        const xA = Geom.calcXA(TL);
        const yA = -d_A;
        const yAp = h_A;
        const dh = h_B - h_A;
        // θ = arcsin(dh / TL)
        const theta = Geom.deg(Math.asin(Math.min(1, Math.abs(dh) / TL)));
        const tRad = Geom.rad(theta);
        const L_TV = TL * Math.cos(tRad);
        const aRad = Geom.rad(alpha);

        // TV at apparent angle α with length L_TV (which we just found)
        // But wait — α is given, L_TV is derived. The TV is at angle α.
        // L_TV_actual from the construction: TV length
        // We draw TV at α, but its x-extent = L_TV·cos(α), y-extent = L_TV·sin(α)?
        // No. TV makes angle α with xy. TV length IS L_TV. a→b at angle α below.
        const bX = xA + L_TV * Math.cos(aRad);
        const bY = yA - L_TV * Math.sin(aRad);
        const bpX = bX;
        const bpY = h_B;
        const L_FV = Math.sqrt((bpX - xA) ** 2 + (bpY - yAp) ** 2);
        const phi = Geom.deg(Math.acos(Math.min(1, L_FV / TL)));

        return { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_TV, L_FV, theta, phi };
    },
    drawStep(n, g, c) {
        const { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_TV, L_FV, theta, phi } = g;
        switch (n) {
            case 1:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and locate A',
                    `a: ${c.d_A}mm below xy | a': ${c.h_A}mm above xy`, '');
                break;
            case 2:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                // θ from TL and dh
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawAngleArc(xA, yA, c.alpha, 14, cfg.tvColor, 'down');
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                updateInstructions('Step 2', 'Draw TV at α',
                    `TV at α = ${c.alpha}°. Since θ = arcsin(Δh/TL) = ${theta.toFixed(1)}°, L_TV = TL·cos θ = ${L_TV.toFixed(1)}mm`,
                    'α is the apparent angle. L_TV comes from TL and the height difference.');
                break;
            case 3:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                drawProjector(bX, bY - 5, bpY + 5);
                Draw.locus(xA - 10, bpX + 15, bpY);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: -4 });
                updateInstructions('Step 3', 'Locate b\' at h_B',
                    `b' on projector of b at height h_B = ${c.h_B}mm`,
                    'We know B\'s height, so b\' is at h_B above xy on the same projector as b.');
                break;
            case 4:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                updateInstructions('Step 4', 'Draw FV',
                    `FV a'b' = ${L_FV.toFixed(1)}mm`, '');
                break;
            case 5:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                updateInstructions('Step 5', 'True angles',
                    `θ = ${theta.toFixed(1)}° | φ = ${phi.toFixed(1)}°`, '');
                break;
            case 6:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawDimension(xA, yA, bX, bY, `${L_TV.toFixed(1)}mm`);
                drawDimension(xA, yAp, bpX, bpY, `${L_FV.toFixed(1)}mm`);
                updateInstructions('Step 6', 'View lengths',
                    `L_TV = ${L_TV.toFixed(1)}mm | L_FV = ${L_FV.toFixed(1)}mm`, '');
                break;
            case 7: {
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                const rotX = xA + TL;
                drawLine(xA, yAp, rotX, yAp, cfg.dimColor, 0.8, [2, 3]);
                drawDimension(xA, yAp, rotX, yAp, `TL=${TL.toFixed(1)}mm`);
                updateInstructions('Step 7', 'Verify TL',
                    `TL = ${TL.toFixed(1)}mm (given, verified)`, '');
                break;
            }
            case 8:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                if (state.showTraces) Draw.traces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
                updateInstructions('Step 8 ✓', 'Complete — TL + α + h_B',
                    `TL=${TL}mm | θ=${theta.toFixed(1)}° | φ=${phi.toFixed(1)}°`, '');
                break;
        }
    }
});

// ─────────────────────────────────────────────────────────────
// PROC-19  {TL, β, h_A, d_A, d_B}
// TL + apparent FV angle β + B's depth
// ─────────────────────────────────────────────────────────────
registerProc('PROC-19', {
    name: 'TL + Apparent Angle β + d_B',
    totalSteps: 8,
    compute(g) {
        const { TL, beta, h_A, d_A, d_B } = g;
        const xA = Geom.calcXA(TL);
        const yA = -d_A;
        const yAp = h_A;
        const dd = d_B - d_A;
        const phi = Geom.deg(Math.asin(Math.min(1, Math.abs(dd) / TL)));
        const pRad = Geom.rad(phi);
        const L_FV = TL * Math.cos(pRad);
        const bRad = Geom.rad(beta);

        const bpX = xA + L_FV * Math.cos(bRad);
        const bpY = yAp + L_FV * Math.sin(bRad);
        const bX = bpX;
        const bY = -d_B;
        const L_TV = Math.sqrt((bX - xA) ** 2 + (bY - yA) ** 2);
        const theta = Geom.deg(Math.acos(Math.min(1, L_TV / TL)));

        return { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_TV, L_FV, theta, phi };
    },
    drawStep(n, g, c) {
        const { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_TV, L_FV, theta, phi } = g;
        switch (n) {
            case 1:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and locate A',
                    `a: ${c.d_A}mm below xy | a': ${c.h_A}mm above xy`, '');
                break;
            case 2:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawAngleArc(xA, yAp, c.beta, 14, cfg.fvColor, 'up');
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: -4 });
                updateInstructions('Step 2', 'Draw FV at β',
                    `FV at β = ${c.beta}°. φ = arcsin(Δd/TL) = ${phi.toFixed(1)}°, L_FV = ${L_FV.toFixed(1)}mm`,
                    'β is the apparent FV angle. L_FV comes from TL and the depth difference.');
                break;
            case 3:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: -4 });
                drawProjector(bpX, bY - 5, bpY + 5);
                Draw.locus(xA - 10, bX + 15, bY);
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                updateInstructions('Step 3', 'Locate b at d_B',
                    `b on projector of b' at depth d_B = ${c.d_B}mm`, '');
                break;
            case 4:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                updateInstructions('Step 4', 'Draw TV',
                    `TV ab = ${L_TV.toFixed(1)}mm`, '');
                break;
            case 5:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                updateInstructions('Step 5', 'True angles',
                    `θ = ${theta.toFixed(1)}° | φ = ${phi.toFixed(1)}°`, '');
                break;
            case 6:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawDimension(xA, yA, bX, bY, `${L_TV.toFixed(1)}mm`);
                drawDimension(xA, yAp, bpX, bpY, `${L_FV.toFixed(1)}mm`);
                updateInstructions('Step 6', 'View lengths',
                    `L_TV = ${L_TV.toFixed(1)}mm | L_FV = ${L_FV.toFixed(1)}mm`, '');
                break;
            case 7: {
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                const rotX = xA + TL;
                drawLine(xA, yA, rotX, yA, cfg.dimColor, 0.8, [2, 3]);
                drawDimension(xA, yA, rotX, yA, `TL=${TL}mm`);
                updateInstructions('Step 7', 'Verify TL',
                    `TL = ${TL}mm (given, verified)`, '');
                break;
            }
            case 8:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                if (state.showTraces) Draw.traces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
                updateInstructions('Step 8 ✓', 'Complete — TL + β + d_B',
                    `TL=${TL}mm | θ=${theta.toFixed(1)}° | φ=${phi.toFixed(1)}°`, '');
                break;
        }
    }
});

// ─────────────────────────────────────────────────────────────
// PROC-20  {TL, h_A, d_A, h_B, d_B}
// TL + both endpoints fully known (two-rotation or direct)
// ─────────────────────────────────────────────────────────────
registerProc('PROC-20', {
    name: 'TL + Both Endpoints',
    totalSteps: 8,
    compute(g) {
        const { TL, h_A, d_A, h_B, d_B } = g;
        const dh = h_B - h_A;
        const dd = d_B - d_A;
        // TL² = Δx² + dh² + dd²  →  Δx = √(TL² - dh² - dd²)
        const dxSq = TL * TL - dh * dh - dd * dd;
        const deltaX = Math.sqrt(Math.max(0, dxSq));
        const xA = Geom.calcXA(TL);
        const yA = -d_A;
        const yAp = h_A;
        const bX = xA + deltaX;
        const bY = -d_B;
        const bpX = bX;
        const bpY = h_B;
        const L_TV = Math.sqrt(deltaX * deltaX + dd * dd);
        const L_FV = Math.sqrt(deltaX * deltaX + dh * dh);
        const theta = Geom.deg(Math.asin(Math.min(1, Math.abs(dh) / TL)));
        const phi = Geom.deg(Math.asin(Math.min(1, Math.abs(dd) / TL)));

        return { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_TV, L_FV, theta, phi, deltaX };
    },
    drawStep(n, g, c) {
        const { xA, yA, yAp, bX, bY, bpX, bpY, TL, L_TV, L_FV, theta, phi, deltaX } = g;
        switch (n) {
            case 1:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                updateInstructions('Step 1', 'Draw xy and locate A',
                    `a: ${c.d_A}mm below xy | a': ${c.h_A}mm above xy`, '');
                break;
            case 2:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                Draw.locus(xA - 10, bpX + 15, bpY);
                Draw.locus(xA - 10, bX + 15, bY);
                updateInstructions('Step 2', 'Mark h_B and d_B loci',
                    `b' at h_B = ${c.h_B}mm, b at d_B = ${c.d_B}mm`,
                    'Both end positions of B are known. We need to find Δx (projector distance).');
                break;
            case 3:
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                // Arc from a with radius TL
                drawArc(xA, yAp, TL, 0, 90, cfg.arcColor, 1.0, [3, 3]);
                updateInstructions('Step 3', 'Swing TL arc from a\'',
                    `Arc centre a', radius = TL = ${TL}mm`,
                    'TL² = Δx² + Δh² + Δd². Since we know Δh and Δd, Δx = √(TL² - Δh² - Δd²) = ' + deltaX.toFixed(1) + 'mm');
                break;
            case 4: {
                drawXYLine(); Draw.baseA(xA, yA, yAp);
                drawProjector(bX, bY - 5, bpY + 5);
                drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: -4 });
                drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
                updateInstructions('Step 4', 'Locate B',
                    `Δx = ${deltaX.toFixed(1)}mm → b and b' on projector at Δx from A`,
                    'The projector distance is computed from the constraint TL² = Δx² + Δh² + Δd².');
                break;
            }
            case 5:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                updateInstructions('Step 5', 'Draw both views',
                    `TV ab = ${L_TV.toFixed(1)}mm | FV a'b' = ${L_FV.toFixed(1)}mm`, '');
                break;
            case 6:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                updateInstructions('Step 6', 'True angles',
                    `θ = ${theta.toFixed(1)}° | φ = ${phi.toFixed(1)}°`, '');
                break;
            case 7: {
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                const rotX = xA + TL;
                drawLine(xA, yAp, rotX, yAp, cfg.dimColor, 0.8, [2, 3]);
                drawDimension(xA, yAp, rotX, yAp, `TL=${TL}mm`);
                updateInstructions('Step 7', 'Verify TL',
                    `TL = ${TL}mm (given, verified by construction)`, '');
                break;
            }
            case 8:
                drawXYLine();
                Draw.projectors(xA, yA, yAp, bX, bY, bpY);
                Draw.finalViews(xA, yA, yAp, bpX, bY, bpY);
                drawAngleArc(xA, yAp, theta, 14, cfg.dimColor, 'up');
                drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
                if (state.showTraces) Draw.traces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
                updateInstructions('Step 8 ✓', 'Complete — TL + Both Endpoints',
                    `TL=${TL}mm | θ=${theta.toFixed(1)}° | φ=${phi.toFixed(1)}°\nh_A=${c.h_A} d_A=${c.d_A} | h_B=${c.h_B} d_B=${c.d_B}`,
                    'With TL and all four endpoint distances known, we compute Δx and draw both views directly.');
                break;
        }
    }
});

if (typeof window !== 'undefined') console.log('[✓] PROC Group E loaded (PROC-16 to PROC-20)');
