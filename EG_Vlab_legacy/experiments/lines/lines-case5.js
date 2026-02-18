// ── CASE 5: Profile Plane ─────────────────────────────────────
// θ + φ = 90° → both projections perpendicular to xy
function drawCase5(step) {
  const { L, h, d, theta } = state;
  const phi = 90 - theta;
  const tRad = theta * Math.PI / 180;
  const pRad = phi * Math.PI / 180;

  const xA = calcXA();
  const yA = -d;
  const yAp = h;
  // Naming: p and q
  const xP = xA, yP = yA, yPp = yAp;

  // Step 3: From p', draw at θ → get pq₁ length (TV length)
  const q1pX = xP + L * Math.cos(tRad);
  const q1pY = yPp + L * Math.sin(tRad);
  const tvLen = L * Math.cos(tRad);    // pq₁ (projected down)
  const q1X = xP + tvLen;
  const q1Y = yP;

  // Step 4: From p, draw at φ → get p'q₁' length (FV length)
  const q2X = xP + L * Math.cos(pRad);
  const q2Y = yP - L * Math.sin(pRad);
  const fvLen = L * Math.cos(pRad);
  const q2pX = xP + fvLen;
  const q2pY = yPp;

  // Step 5: Final projections perpendicular to xy
  const qX = xP;
  const qY = yP - tvLen;   // downward from p
  const qpX = xP;
  const qpY = yPp + fvLen;   // upward from p'

  switch (step) {
    case 1:
      drawXYLine();
      updateInstructions('Step 1', 'Draw Reference Line xy',
        `Profile plane case: θ=${theta}° → φ=${phi}° (complementary, sum=90°).\nBoth projections will be perpendicular to xy.`);
      break;

    case 2:
      drawXYLine();
      drawProjector(xP, yP - 8, yPp + 8);
      drawPoint(xP, yP, cfg.tvColor); drawLabel('p', xP, yP, cfg.tvColor, { dx: -9, dy: 0 });
      drawPoint(xP, yPp, cfg.fvColor); drawLabel("p'", xP, yPp, cfg.fvColor, { dx: -10, dy: 0 });
      updateInstructions('Step 2', 'Locate Endpoint P',
        `p (TV): ${d} mm below xy.\np' (FV): ${h} mm above xy.`);
      break;

    case 3:
      drawXYLine();
      drawProjector(xP, yP - 8, yPp + 8);
      drawLine(xP, yPp, q1pX, q1pY, cfg.constructionColor, cfg.consWidth, [4, 3]);
      drawLine(xP, yP, q1X, q1Y, cfg.constructionColor, cfg.consWidth, [3, 3]);
      drawProjector(q1pX, q1pY, yP - 3);
      drawPoint(xP, yP, cfg.tvColor); drawLabel('p', xP, yP, cfg.tvColor, { dx: -9, dy: 0 });
      drawPoint(xP, yPp, cfg.fvColor); drawLabel("p'", xP, yPp, cfg.fvColor, { dx: -10, dy: 0 });
      drawPoint(q1pX, q1pY, cfg.dimColor, 3); drawLabel("q\u2081'", q1pX, q1pY, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(q1X, q1Y, cfg.dimColor, 3); drawLabel('q\u2081', q1X, q1Y, cfg.dimColor, { dx: 6, dy: 0 });
      drawAngleArc(xP, yPp, theta, 12, cfg.dimColor);
      updateInstructions('Step 3', 'Determine Top View Length (pq₁)',
        `From p', draw line at θ=${theta}° to xy, length L=${L}mm → q₁'.\nDrop projector to horizontal from p → q₁.\npq₁ = TV length = ${tvLen.toFixed(1)} mm.`);
      break;

    case 4:
      drawXYLine();
      drawProjector(xP, yP - 8, yPp + 8);
      drawLine(xP, yPp, q1pX, q1pY, cfg.constructionColor, cfg.consWidth, [4, 3]);
      drawLine(xP, yP, q1X, q1Y, cfg.constructionColor, cfg.consWidth, [3, 3]);
      drawProjector(q1pX, q1pY, yP - 3);
      drawLine(xP, yP, q2X, q2Y, cfg.constructionColor, cfg.consWidth, [4, 3]);
      drawLine(xP, yPp, q2pX, q2pY, cfg.constructionColor, cfg.consWidth, [3, 3]);
      drawProjector(q2X, q2Y, yPp + 3);
      drawPoint(xP, yP, cfg.tvColor); drawLabel('p', xP, yP, cfg.tvColor, { dx: -9, dy: 0 });
      drawPoint(xP, yPp, cfg.fvColor); drawLabel("p'", xP, yPp, cfg.fvColor, { dx: -10, dy: 0 });
      drawPoint(q1pX, q1pY, cfg.dimColor, 3); drawLabel("q\u2081'", q1pX, q1pY, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(q1X, q1Y, cfg.dimColor, 3); drawLabel('q\u2081', q1X, q1Y, cfg.dimColor, { dx: 6, dy: 0 });
      drawPoint(q2X, q2Y, cfg.dimColor, 3); drawLabel('q\u2082', q2X, q2Y, cfg.dimColor, { dx: 6, dy: 4 });
      drawPoint(q2pX, q2pY, cfg.dimColor, 3); drawLabel("q\u2082'", q2pX, q2pY, cfg.dimColor, { dx: 6, dy: 0 });
      drawAngleArc(xP, yPp, theta, 12, cfg.dimColor);
      drawAngleArc(xP, yP, phi, 12, cfg.dimColor, 'down');
      updateInstructions('Step 4', 'Determine Front View Length (p\'q₁\')',
        `From p, draw line at φ=${phi}° to xy (in TV region), length L=${L}mm → q₂.\nProject up to horizontal from p' → q₂'.\np'q₂' = FV length = ${fvLen.toFixed(1)} mm.`);
      break;

    case 5:
      drawXYLine();
      drawProjector(xP, yP - 8, yPp + 8);
      // Construction (light)
      drawLine(xP, yPp, q1pX, q1pY, cfg.constructionColor, 0.7, [4, 4]);
      drawLine(xP, yP, q2X, q2Y, cfg.constructionColor, 0.7, [4, 4]);
      // Final perpendicular projections
      drawLine(xP, yP, qX, qY, cfg.tvColor, cfg.finalWidth);
      drawLine(xP, yPp, qpX, qpY, cfg.fvColor, cfg.finalWidth);
      drawPoint(xP, yP, cfg.tvColor); drawLabel('p', xP, yP, cfg.tvColor, { dx: -9, dy: 0 });
      drawPoint(xP, yPp, cfg.fvColor); drawLabel("p'", xP, yPp, cfg.fvColor, { dx: -10, dy: 0 });
      drawPoint(qX, qY, cfg.tvColor); drawLabel('q', qX, qY, cfg.tvColor, { dx: -9, dy: 0 });
      drawPoint(qpX, qpY, cfg.fvColor); drawLabel("q'", qpX, qpY, cfg.fvColor, { dx: -10, dy: 0 });
      updateInstructions('Step 5', 'Draw Final Projections – Perpendicular to xy',
        `From p downward: TV pq = ${tvLen.toFixed(1)} mm (⊥ to xy).\nFrom p' upward: FV p'q' = ${fvLen.toFixed(1)} mm (⊥ to xy).\nBoth on the same projector — profile plane confirmed.`);
      break;

    case 6:
      drawXYLine();
      drawProjector(xP, yP - 8, yPp + 8);
      drawLine(xP, yP, qX, qY, cfg.tvColor, cfg.finalWidth);
      drawLine(xP, yPp, qpX, qpY, cfg.fvColor, cfg.finalWidth);
      drawPoint(xP, yP, cfg.tvColor); drawLabel('p', xP, yP, cfg.tvColor, { dx: -9, dy: 0 });
      drawPoint(xP, yPp, cfg.fvColor); drawLabel("p'", xP, yPp, cfg.fvColor, { dx: -10, dy: 0 });
      drawPoint(qX, qY, cfg.tvColor); drawLabel('q', qX, qY, cfg.tvColor, { dx: -9, dy: 0 });
      drawPoint(qpX, qpY, cfg.fvColor); drawLabel("q'", qpX, qpY, cfg.fvColor, { dx: -10, dy: 0 });
      drawDimension(xP + 6, yP, xP + 6, qY, `${tvLen.toFixed(1)}mm`);
      drawDimension(xP + 6, yPp, xP + 6, qpY, `${fvLen.toFixed(1)}mm`);
      updateInstructions('Step 6 ✓', 'Final – Profile Plane',
        `θ=${theta}° + φ=${phi}° = 90° ✓ (complementary angles confirm profile plane).\nTV pq = ${tvLen.toFixed(1)} mm ⊥ xy.\nFV p'q' = ${fvLen.toFixed(1)} mm ⊥ xy.\nTrue Length = ${L} mm.`);
      break;
  }
}