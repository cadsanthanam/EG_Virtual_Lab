// ── CASE 3B: Inclined to VP, Parallel to HP ──────────────────
// TV = true length at angle φ; FV = foreshortened, parallel to xy
function drawCase3B(step) {
  const { L, h, d, phi, showTraces } = state;
  const pRad = phi * Math.PI / 180;
  const xA = calcXA();
  const yA = -d;
  const yAp = h;
  // TV endpoint b (true length at φ)
  const bX = xA + L * Math.cos(pRad);
  const bY = yA - L * Math.sin(pRad);  // inclined downward in TV (below xy)
  // FV endpoint b' — project up from b, horizontal from a'
  const bpX = bX;
  const bpY = yAp;
  const fvLen = L * Math.cos(pRad);

  switch (step) {
    case 1:
      drawXYLine();
      updateInstructions('Step 1', 'Draw Reference Line xy',
        `Line inclined to VP at φ = ${phi}°, parallel to HP.\nTop view shows TRUE LENGTH at angle φ.\nFront view is parallel to xy (foreshortened).`);
      break;

    case 2:
      drawXYLine();
      drawProjector(xA, yA - 8, yAp + 8);
      drawPoint(xA, yA, cfg.tvColor); drawLabel('a', xA, yA, cfg.tvColor, { dx: -9, dy: 0 });
      drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, { dx: -10, dy: 0 });
      updateInstructions('Step 2', 'Locate Endpoint A',
        `a (TV): ${d} mm below xy.\na' (FV): ${h} mm above xy.`);
      break;

    case 3:
      drawXYLine();
      drawProjector(xA, yA - 8, yAp + 8);
      drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
      drawPoint(xA, yA, cfg.tvColor); drawLabel('a', xA, yA, cfg.tvColor, { dx: -9, dy: 0 });
      drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, { dx: -10, dy: 0 });
      drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 0 });
      drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
      updateInstructions('Step 3', `Draw Top View – True Length at φ=${phi}°`,
        `From a, draw line at φ = ${phi}° to xy (in TV region), length = ${L} mm.\nThis is TRUE LENGTH since parallel to HP.`);
      break;

    case 4:
      drawXYLine();
      drawProjector(xA, yA - 8, yAp + 8);
      drawProjector(bX, bY - 8, bpY + 8);
      drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
      drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
      drawPoint(xA, yA, cfg.tvColor); drawLabel('a', xA, yA, cfg.tvColor, { dx: -9, dy: 0 });
      drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, { dx: -10, dy: 0 });
      drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 0 });
      drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
      drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
      updateInstructions('Step 4', 'Draw Front View – Foreshortened, Parallel to xy',
        `From a', draw horizontal line parallel to xy.\nProject up from b to meet horizontal → point b'.\nFV length a'b' = L·cos(φ) = ${fvLen.toFixed(1)} mm.`);
      break;

    case 5:
      drawXYLine();
      drawProjector(xA, yA - 8, yAp + 8);
      drawProjector(bX, bY - 8, bpY + 8);
      drawLine(xA, yA, bX, bY, cfg.tvColor, cfg.finalWidth);
      drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
      drawPoint(xA, yA, cfg.tvColor); drawLabel('a', xA, yA, cfg.tvColor, { dx: -9, dy: 0 });
      drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, { dx: -10, dy: 0 });
      drawPoint(bX, bY, cfg.tvColor); drawLabel('b', bX, bY, cfg.tvColor, { dx: 6, dy: 0 });
      drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, { dx: 6, dy: 0 });
      drawAngleArc(xA, yA, phi, 14, cfg.dimColor, 'down');
      drawDimension(xA, yA + 6, bX, bY + 6, `TL=${L}mm`);
      drawDimension(xA, yAp + 6, bpX, bpY + 6, `${fvLen.toFixed(1)}mm`);
      if (showTraces) {
        findAndDrawTraces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
      }
      updateInstructions('Step 5 ✓', 'Final – Case 3B',
        `TV ab = ${L} mm (True Length) at φ=${phi}° to xy.\nFV a'b' = ${fvLen.toFixed(1)} mm (= L·cos φ), parallel to xy.` +
        (showTraces ? '\nTraces HT and VT shown.' : ''));
      break;
  }
}
