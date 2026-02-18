// ── CASE 3A: Inclined to HP, Parallel to VP ──────────────────
// FV = true length at angle θ; TV = foreshortened, parallel to xy
function drawCase3A(step) {
  const { L, h, d, theta, showTraces } = state;
  const tRad = theta * Math.PI / 180;
  const xA = calcXA();
  const yA  = -d;
  const yAp =  h;
  // FV endpoint b'
  const bpX = xA + L * Math.cos(tRad);
  const bpY = yAp + L * Math.sin(tRad);
  // TV endpoint b — project down from b', horizontal from a
  const bX  = bpX;
  const bY  = yA;
  const tvLen = L * Math.cos(tRad);

  switch(step) {
    case 1:
      drawXYLine();
      updateInstructions('Step 1', 'Draw Reference Line xy',
        `Line inclined to HP at θ = ${theta}°, parallel to VP.\nFront view shows TRUE LENGTH at angle θ.\nTop view is parallel to xy (foreshortened).`);
      break;

    case 2:
      drawXYLine();
      drawProjector(xA, yA - 8, yAp + 8);
      drawPoint(xA, yA,  cfg.tvColor); drawLabel('a',  xA, yA,  cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, {dx:-10, dy:0});
      updateInstructions('Step 2', 'Locate Endpoint A',
        `a (TV): ${d} mm below xy (from VP).\na' (FV): ${h} mm above xy (above HP).`);
      break;

    case 3:
      drawXYLine();
      drawProjector(xA, yA - 8, yAp + 8);
      drawPoint(xA, yA,  cfg.tvColor); drawLabel('a',  xA, yA,  cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, {dx:-10, dy:0});
      drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
      drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, {dx:6, dy:0});
      drawAngleArc(xA, yAp, theta, 14, cfg.dimColor);
      updateInstructions('Step 3', `Draw Front View – True Length at θ=${theta}°`,
        `From a', draw line at θ = ${theta}° to xy, length = ${L} mm.\nThis is TRUE LENGTH since the line is parallel to VP.\nb' is at (${bpX.toFixed(1)}, ${bpY.toFixed(1)}) mm.`);
      break;

    case 4:
      drawXYLine();
      drawProjector(xA,  yA - 8, yAp + 8);
      drawProjector(bpX, yA - 8, bpY + 8);
      drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
      drawLine(xA, yA,  bX,  bY,  cfg.tvColor, cfg.finalWidth);
      drawPoint(xA,  yA,  cfg.tvColor); drawLabel('a',  xA,  yA,  cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA,  yAp, cfg.fvColor); drawLabel("a'", xA,  yAp, cfg.fvColor, {dx:-10, dy:0});
      drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, {dx:6, dy:0});
      drawPoint(bX,  bY,  cfg.tvColor); drawLabel('b',  bX,  bY,  cfg.tvColor, {dx:6, dy:0});
      drawAngleArc(xA, yAp, theta, 14, cfg.dimColor);
      updateInstructions('Step 4', 'Draw Top View – Foreshortened, Parallel to xy',
        `From a, draw horizontal line parallel to xy.\nDrop projector from b' to meet horizontal → point b.\nTV length ab = L·cos(θ) = ${tvLen.toFixed(1)} mm (foreshortened).`);
      break;

    case 5:
      drawXYLine();
      drawProjector(xA,  yA - 8, yAp + 8);
      drawProjector(bpX, yA - 8, bpY + 8);
      drawLine(xA, yAp, bpX, bpY, cfg.fvColor, cfg.finalWidth);
      drawLine(xA, yA,  bX,  bY,  cfg.tvColor, cfg.finalWidth);
      drawPoint(xA,  yA,  cfg.tvColor); drawLabel('a',  xA,  yA,  cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA,  yAp, cfg.fvColor); drawLabel("a'", xA,  yAp, cfg.fvColor, {dx:-10, dy:0});
      drawPoint(bpX, bpY, cfg.fvColor); drawLabel("b'", bpX, bpY, cfg.fvColor, {dx:6, dy:0});
      drawPoint(bX,  bY,  cfg.tvColor); drawLabel('b',  bX,  bY,  cfg.tvColor, {dx:6, dy:0});
      drawAngleArc(xA, yAp, theta, 14, cfg.dimColor);
      drawDimension(xA, yAp, bpX, bpY, `TL=${L}mm`);
      drawDimension(xA, yA - 6, bX, bY - 6, `${tvLen.toFixed(1)}mm`);
      if (showTraces) {
        findAndDrawTraces(xA, yA, bX, bY, xA, yAp, bpX, bpY);
      }
      updateInstructions('Step 5 ✓', 'Final – Case 3A',
        `FV a'b' = ${L} mm (True Length) at θ=${theta}° to xy.\nTV ab = ${tvLen.toFixed(1)} mm (= L·cos θ), parallel to xy.` +
        (showTraces ? '\nTraces HT and VT shown.' : ''));
      break;
  }
}

