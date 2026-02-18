// ── CASE 1: Parallel to both HP and VP ───────────────────────
// FV: a'b' horizontal at h above xy (true length)
// TV: ab  horizontal at d below xy  (true length)
function drawCase1(step) {
  const { L, h, d } = state;
  const xA = calcXA();
  // paper coords
  const yA  = -d;          // TV: below xy
  const yAp =  h;          // FV: above xy
  const xB  = xA + L;
  const yB  = yA;
  const yBp = yAp;

  switch(step) {
    case 1:
      drawXYLine();
      updateInstructions('Step 1', 'Draw Reference Line xy',
        'The xy line represents the intersection of HP and VP. Front view goes ABOVE xy, top view goes BELOW.');
      break;

    case 2:
      drawXYLine();
      drawProjector(xA, yA - 8, yAp + 8);
      drawPoint(xA, yA,  cfg.tvColor);  drawLabel('a',  xA, yA,  cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA, yAp, cfg.fvColor);  drawLabel("a'", xA, yAp, cfg.fvColor, {dx:-10, dy:0});
      updateInstructions('Step 2', 'Locate Endpoint A',
        `Point a (TV) is ${d} mm below xy — distance of A from VP.\nPoint a' (FV) is ${h} mm above xy — height of A above HP.\nBoth lie on the same vertical projector.`);
      break;

    case 3:
      drawXYLine();
      drawProjector(xA, yA - 8, yAp + 8);
      drawPoint(xA, yA,  cfg.tvColor); drawLabel('a',  xA, yA,  cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, {dx:-10, dy:0});
      // TV line
      drawLine(xA, yA, xB, yB, cfg.tvColor, cfg.finalWidth);
      drawPoint(xB, yB, cfg.tvColor); drawLabel('b', xB, yB, cfg.tvColor, {dx:6, dy:0});
      updateInstructions('Step 3', 'Draw Top View ab',
        `From a, draw horizontal line parallel to xy of length L = ${L} mm. This is the TRUE LENGTH since the line is parallel to HP.\nEnd point b is at the same distance ${d} mm below xy.`);
      break;

    case 4:
      drawXYLine();
      drawProjector(xA, yA - 8, yAp + 8);
      drawProjector(xB, yB - 8, yBp + 8);
      drawPoint(xA, yA, cfg.tvColor); drawLabel('a',  xA, yA,  cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA, yAp,cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, {dx:-10, dy:0});
      drawLine(xA, yA,  xB, yB,  cfg.tvColor, cfg.finalWidth);
      drawLine(xA, yAp, xB, yBp, cfg.fvColor, cfg.finalWidth);
      drawPoint(xB, yB,  cfg.tvColor); drawLabel('b',  xB, yB,  cfg.tvColor, {dx:6, dy:0});
      drawPoint(xB, yBp, cfg.fvColor); drawLabel("b'", xB, yBp, cfg.fvColor, {dx:6, dy:0});
      updateInstructions('Step 4', "Draw Front View a'b'",
        `From a', draw horizontal line parallel to xy of length L = ${L} mm. This is the TRUE LENGTH since the line is parallel to VP.\nb and b' lie on the same vertical projector.`);
      break;

    case 5:
      drawXYLine();
      drawProjector(xA, yA - 8, yAp + 8);
      drawProjector(xB, yB - 8, yBp + 8);
      drawLine(xA, yA,  xB, yB,  cfg.tvColor, cfg.finalWidth);
      drawLine(xA, yAp, xB, yBp, cfg.fvColor, cfg.finalWidth);
      drawPoint(xA, yA,  cfg.tvColor); drawLabel('a',  xA, yA,  cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, {dx:-10, dy:0});
      drawPoint(xB, yB,  cfg.tvColor); drawLabel('b',  xB, yB,  cfg.tvColor, {dx:6, dy:0});
      drawPoint(xB, yBp, cfg.fvColor); drawLabel("b'", xB, yBp, cfg.fvColor, {dx:6, dy:0});
      drawDimension(xA, yA, xB, yB, `TL = ${L} mm`);
      drawDimension(xA, yAp, xB, yBp, `TL = ${L} mm`);
      updateInstructions('Step 5 ✓', 'Final – Both Views Show True Length',
        `ab = a'b' = ${L} mm (True Length).\nab ∥ xy and a'b' ∥ xy.\nDistance from VP = ${d} mm  |  Height above HP = ${h} mm.`);
      break;
  }
}

