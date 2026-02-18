// ── CASE 4: Oblique (inclined to both HP and VP) ──────────────
// Two-step rotation method — 10 steps
function drawCase4(step) {
  const { L, h, d, theta, phi, showTraces } = state;
  const tRad = theta * Math.PI / 180;
  const pRad = phi * Math.PI / 180;

  const xA = calcXA();
  const yA = -d;
  const yAp = h;

  // Phase I: assumed inclined to HP only (parallel to VP) → get TV length
  const b1pX = xA + L * Math.cos(tRad);
  const b1pY = yAp + L * Math.sin(tRad);
  const tvLen = L * Math.cos(tRad);           // ab₁ = TV length
  const b1X = xA + tvLen;
  const b1Y = yA;

  // Phase I: assumed inclined to VP only (parallel to HP) → get FV length
  const b2X = xA + L * Math.cos(pRad);
  const b2Y = yA - L * Math.sin(pRad);
  const fvLen = L * Math.cos(pRad);           // a'b₂' = FV length
  const b2pX = xA + fvLen;
  const b2pY = yAp;

  // Phase II: locus lines
  const locusYFV = b1pY;    // horizontal locus for b' at height of b₁'
  const locusYTV = b2Y;     // horizontal locus for b  at depth  of b₂

  // Arc intersections:
  // b': center a', radius fvLen, intersect y = locusYFV  →  x = xA + sqrt(fvLen²-(locusYFV-yAp)²)
  const dy_fv = locusYFV - yAp;
  const dx_fv = Math.sqrt(Math.max(0, fvLen * fvLen - dy_fv * dy_fv));
  const bpX = xA + dx_fv;
  const bpY = locusYFV;

  // b: center a, radius tvLen, intersect y = locusYTV  → x aligned with b'
  // Also must align vertically with b': bX = bpX
  const bX = bpX;
  const bY = locusYTV;

  // Apparent angles
  const alphaRad = Math.atan2(bpY - yAp, bpX - xA);
  const alpha = alphaRad * 180 / Math.PI;
  const betaRad = Math.atan2(Math.abs(bY - yA), bX - xA);
  const beta = betaRad * 180 / Math.PI;

  // Extent for locus / construction lines
  const xMax = xA + L + 20;

  function drawBase() {
    drawXYLine();
    drawProjector(xA, yA - 8, yAp + 8);
    drawPoint(xA, yA, cfg.tvColor); drawLabel('a', xA, yA, cfg.tvColor, { dx: -9, dy: 0 });
    drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, { dx: -10, dy: 0 });
  }

  switch (step) {
    case 1:
      drawXYLine();
      updateInstructions('Step 1', 'Draw xy and Locate A',
        `Oblique line: θ=${theta}° (with HP), φ=${phi}° (with VP), L=${L}mm.\nTwo-step rotation method required.\na at ${d}mm below xy, a' at ${h}mm above xy.`);
      drawBase();
      break;

    case 2:
      drawBase();
      drawLine(xA, yAp, b1pX, b1pY, cfg.constructionColor, cfg.consWidth, []);
      drawPoint(b1pX, b1pY, cfg.dimColor, 3); drawLabel("b\u2081'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
      drawAngleArc(xA, yAp, theta, 12, cfg.dimColor);
      updateInstructions('Step 2', 'Assume Line Inclined to HP Only (Parallel to VP)',
        `From a', draw construction line at θ=${theta}° to xy, length L=${L}mm.\nMark b₁' (intermediate point).\nThis gives the height of B when the line is parallel to VP.`);
      break;

    case 3:
      drawBase();
      drawLine(xA, yAp, b1pX, b1pY, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yA, b1X, b1Y, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b1pX, b1pY, yA - 5);
      drawPoint(b1pX, b1pY, cfg.dimColor, 3); drawLabel("b\u2081'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(b1X, b1Y, cfg.tvColor, 3); drawLabel('b\u2081', b1X, b1Y, cfg.tvColor, { dx: 6, dy: 0 });
      drawAngleArc(xA, yAp, theta, 12, cfg.dimColor);
      updateInstructions('Step 3', 'Get Top View Length = ab₁',
        `Drop projector from b₁' to meet horizontal from a.\nab₁ = TV length = L·cos(θ) = ${tvLen.toFixed(1)} mm.\nThis length is used to draw the final top view.`);
      break;

    case 4:
      drawBase();
      drawLine(xA, yAp, b1pX, b1pY, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yA, b1X, b1Y, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b1pX, b1pY, yA - 5);
      drawLine(xA, yA, b2X, b2Y, cfg.constructionColor, cfg.consWidth, []);
      drawPoint(b1pX, b1pY, cfg.dimColor, 3); drawLabel("b\u2081'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(b1X, b1Y, cfg.tvColor, 3); drawLabel('b\u2081', b1X, b1Y, cfg.tvColor, { dx: 6, dy: 0 });
      drawPoint(b2X, b2Y, cfg.tvColor, 3); drawLabel('b\u2082', b2X, b2Y, cfg.tvColor, { dx: 6, dy: 4 });
      drawAngleArc(xA, yA, phi, 12, cfg.dimColor, 'down');
      updateInstructions('Step 4', 'Assume Line Inclined to VP Only (Parallel to HP)',
        `From a, draw construction line at φ=${phi}° to xy (in TV region), length L=${L}mm.\nMark b₂ (intermediate point).\nThis gives the depth of B when the line is parallel to HP.`);
      break;

    case 5:
      drawBase();
      drawLine(xA, yAp, b1pX, b1pY, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yA, b1X, b1Y, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b1pX, b1pY, yA - 5);
      drawLine(xA, yA, b2X, b2Y, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yAp, b2pX, b2pY, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b2X, b2Y, yAp + 5);
      drawPoint(b1pX, b1pY, cfg.dimColor, 3); drawLabel("b\u2081'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(b1X, b1Y, cfg.tvColor, 3); drawLabel('b\u2081', b1X, b1Y, cfg.tvColor, { dx: 6, dy: 0 });
      drawPoint(b2X, b2Y, cfg.tvColor, 3); drawLabel('b\u2082', b2X, b2Y, cfg.tvColor, { dx: 6, dy: 4 });
      drawPoint(b2pX, b2pY, cfg.fvColor, 3); drawLabel("b\u2082'", b2pX, b2pY, cfg.fvColor, { dx: 6, dy: 0 });
      drawAngleArc(xA, yAp, theta, 12, cfg.dimColor);
      drawAngleArc(xA, yA, phi, 12, cfg.dimColor, 'down');
      updateInstructions('Step 5', 'Get Front View Length = a\'b₂\'',
        `Drop projector from b₂ to meet horizontal from a'.\na'b₂' = FV length = L·cos(φ) = ${fvLen.toFixed(1)} mm.\nThis length is used to draw the final front view.`);
      break;

    case 6:
      drawBase();
      // ── Persist Phase I construction ──
      drawLine(xA, yAp, b1pX, b1pY, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yA, b1X, b1Y, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b1pX, b1pY, yA - 5);
      drawLine(xA, yA, b2X, b2Y, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yAp, b2pX, b2pY, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b2X, b2Y, yAp + 5);
      drawAngleArc(xA, yAp, theta, 12, cfg.dimColor);
      drawAngleArc(xA, yA, phi, 12, cfg.dimColor, 'down');
      drawPoint(b1pX, b1pY, cfg.dimColor, 3); drawLabel("b\u2081'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(b1X, b1Y, cfg.dimColor, 3); drawLabel('b\u2081', b1X, b1Y, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(b2X, b2Y, cfg.dimColor, 3); drawLabel('b\u2082', b2X, b2Y, cfg.dimColor, { dx: 6, dy: 4 });
      drawPoint(b2pX, b2pY, cfg.dimColor, 3); drawLabel("b\u2082'", b2pX, b2pY, cfg.dimColor, { dx: 6, dy: 0 });
      // ── New: Locus lines ──
      drawLine(xA - 5, locusYFV, xMax, locusYFV, cfg.locusColor, cfg.dimWidth, []);
      drawLine(xA - 5, locusYTV, xMax, locusYTV, cfg.locusColor, cfg.dimWidth, []);
      updateInstructions('Step 6', 'Draw Locus Lines',
        `Horizontal locus of b' passes through b₁' at y = ${locusYFV.toFixed(1)} mm.\nHorizontal locus of b passes through b₂ at y = ${locusYTV.toFixed(1)} mm.\nB must lie on these horizontal lines (depth/height constant).`);
      break;

    case 7:
      drawBase();
      // ── Persist Phase I construction ──
      drawLine(xA, yAp, b1pX, b1pY, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yA, b1X, b1Y, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b1pX, b1pY, yA - 5);
      drawLine(xA, yA, b2X, b2Y, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yAp, b2pX, b2pY, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b2X, b2Y, yAp + 5);
      drawAngleArc(xA, yAp, theta, 12, cfg.dimColor);
      drawAngleArc(xA, yA, phi, 12, cfg.dimColor, 'down');
      drawPoint(b1pX, b1pY, cfg.dimColor, 3); drawLabel("b\u2081'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(b1X, b1Y, cfg.dimColor, 3); drawLabel('b\u2081', b1X, b1Y, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(b2X, b2Y, cfg.dimColor, 3); drawLabel('b\u2082', b2X, b2Y, cfg.dimColor, { dx: 6, dy: 4 });
      drawPoint(b2pX, b2pY, cfg.dimColor, 3); drawLabel("b\u2082'", b2pX, b2pY, cfg.dimColor, { dx: 6, dy: 0 });
      // ── Persist locus lines ──
      drawLine(xA - 5, locusYFV, xMax, locusYFV, cfg.locusColor, cfg.dimWidth, []);
      drawLine(xA - 5, locusYTV, xMax, locusYTV, cfg.locusColor, cfg.dimWidth, []);
      // ── New: Arc + final FV ──
      drawArc(xA, yAp, fvLen, 0, alpha + 15, cfg.arcColor, 1.0, []);
      drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
      drawPoint(bpX, bpY, cfg.fvColor, 4); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
      updateInstructions('Step 7', "Locate b' Using Front View Length",
        `Center at a', radius = a'b₂' = ${fvLen.toFixed(1)} mm.\nArc meets locus of b' at point b' (choose intersection to the right).\na'b' is the final front view.`);
      break;

    case 8:
      drawBase();
      // ── Persist Phase I construction ──
      drawLine(xA, yAp, b1pX, b1pY, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yA, b1X, b1Y, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b1pX, b1pY, yA - 5);
      drawLine(xA, yA, b2X, b2Y, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yAp, b2pX, b2pY, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b2X, b2Y, yAp + 5);
      drawAngleArc(xA, yAp, theta, 12, cfg.dimColor);
      drawAngleArc(xA, yA, phi, 12, cfg.dimColor, 'down');
      drawPoint(b1pX, b1pY, cfg.dimColor, 3); drawLabel("b\u2081'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(b1X, b1Y, cfg.dimColor, 3); drawLabel('b\u2081', b1X, b1Y, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(b2X, b2Y, cfg.dimColor, 3); drawLabel('b\u2082', b2X, b2Y, cfg.dimColor, { dx: 6, dy: 4 });
      drawPoint(b2pX, b2pY, cfg.dimColor, 3); drawLabel("b\u2082'", b2pX, b2pY, cfg.dimColor, { dx: 6, dy: 0 });
      // ── Persist locus lines ──
      drawLine(xA - 5, locusYFV, xMax, locusYFV, cfg.locusColor, cfg.dimWidth, []);
      drawLine(xA - 5, locusYTV, xMax, locusYTV, cfg.locusColor, cfg.dimWidth, []);
      // ── Persist FV final + arc ──
      drawArc(xA, yAp, fvLen, 0, alpha + 15, cfg.arcColor, 1.0, []);
      drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
      drawPoint(bpX, bpY, cfg.fvColor, 4); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
      // ── New: Projector from b', arc + final TV ──
      drawProjector(bpX, bpY, bY - 5);
      drawArc(xA, yA, tvLen, -beta - 15, 0, cfg.arcColor, 1.0, []);
      drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
      drawPoint(bX, bY, cfg.tvColor, 4); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
      updateInstructions('Step 8', 'Locate b Using Top View Length',
        `Center at a, radius = ab₁ = ${tvLen.toFixed(1)} mm.\nArc meets locus of b, aligned with b' (same projector).\nab is the final top view.`);
      break;

    case 9:
      drawBase();
      // ── Persist Phase I construction (lighter) ──
      drawLine(xA, yAp, b1pX, b1pY, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yA, b1X, b1Y, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b1pX, b1pY, yA - 5);
      drawLine(xA, yA, b2X, b2Y, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yAp, b2pX, b2pY, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b2X, b2Y, yAp + 5);
      drawPoint(b1pX, b1pY, cfg.dimColor, 3); drawLabel("b\u2081'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(b1X, b1Y, cfg.dimColor, 3); drawLabel('b\u2081', b1X, b1Y, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(b2X, b2Y, cfg.dimColor, 3); drawLabel('b\u2082', b2X, b2Y, cfg.dimColor, { dx: 6, dy: 4 });
      drawPoint(b2pX, b2pY, cfg.dimColor, 3); drawLabel("b\u2082'", b2pX, b2pY, cfg.dimColor, { dx: 6, dy: 0 });
      // ── Persist locus lines ──
      drawLine(xA - 5, locusYFV, xMax, locusYFV, cfg.locusColor, cfg.dimWidth, []);
      drawLine(xA - 5, locusYTV, xMax, locusYTV, cfg.locusColor, cfg.dimWidth, []);
      // ── Final projections (thick, bright) ──
      drawProjector(bpX, bpY - 5, bY - 5);
      drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
      drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
      drawPoint(bX, bY, cfg.tvColor, 4); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
      drawPoint(bpX, bpY, cfg.fvColor, 4); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
      updateInstructions('Step 9', 'Final Projections',
        `ab  = ${tvLen.toFixed(1)} mm (TV, foreshortened)\na'b' = ${fvLen.toFixed(1)} mm (FV, foreshortened)\nBoth projections are oblique — neither parallel to xy.`);
      break;

    case 10:
      drawBase();
      // ── Persist Phase I construction ──
      drawLine(xA, yAp, b1pX, b1pY, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yA, b1X, b1Y, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b1pX, b1pY, yA - 5);
      drawLine(xA, yA, b2X, b2Y, cfg.constructionColor, cfg.consWidth, []);
      drawLine(xA, yAp, b2pX, b2pY, cfg.constructionColor, cfg.consWidth, []);
      drawProjector(b2X, b2Y, yAp + 5);
      drawPoint(b1pX, b1pY, cfg.dimColor, 3); drawLabel("b\u2081'", b1pX, b1pY, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(b1X, b1Y, cfg.dimColor, 3); drawLabel('b\u2081', b1X, b1Y, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(b2X, b2Y, cfg.dimColor, 3); drawLabel('b\u2082', b2X, b2Y, cfg.dimColor, { dx: 6, dy: 4 });
      drawPoint(b2pX, b2pY, cfg.dimColor, 3); drawLabel("b\u2082'", b2pX, b2pY, cfg.dimColor, { dx: 6, dy: 0 });
      // ── Persist locus lines ──
      drawLine(xA - 5, locusYFV, xMax, locusYFV, cfg.locusColor, cfg.dimWidth, []);
      drawLine(xA - 5, locusYTV, xMax, locusYTV, cfg.locusColor, cfg.dimWidth, []);
      // ── Final projections (thick, bright) ──
      drawProjector(bpX, bpY - 5, bY - 5);
      drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
      drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
      drawPoint(bX, bY, cfg.tvColor, 4); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 4 });
      drawPoint(bpX, bpY, cfg.fvColor, 4); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
      // ── Dimensions & angles ──
      drawAngleArc(xA, yAp, alpha, 16, cfg.dimColor);
      drawAngleArc(xA, yA, beta, 16, cfg.dimColor, 'down');
      drawDimension(xA, yAp, bpX, bpY, `${fvLen.toFixed(1)}mm`);
      drawDimension(xA, yA, bX, bY, `${tvLen.toFixed(1)}mm`);
      if (showTraces) {
        findAndDrawTraces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
      }
      updateInstructions('Step 10 ✓', 'Final – Oblique Line Verification',
        `True Length TL = ${L} mm  (θ=${theta}° with HP, φ=${phi}° with VP)\n` +
        `FV a'b' = ${fvLen.toFixed(1)} mm  |  Apparent angle α = ${alpha.toFixed(1)}° in FV\n` +
        `TV ab  = ${tvLen.toFixed(1)} mm  |  Apparent angle β = ${beta.toFixed(1)}° in TV` +
        (showTraces ? '\nTraces HT and VT shown.' : ''));
      break;
  }
}
