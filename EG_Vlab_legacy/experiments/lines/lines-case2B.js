// ── CASE 2B: Perpendicular to VP ─────────────────────────────
// FV = point c'(d'), TV = true length vertical cd
function drawCase2B(step) {
  const { L, h, d } = state;
  const xA = calcXA();
  // c is the near end (d mm from VP)
  const yC  = -d;     // TV: c below xy (d > 0 means in front of VP)
  const yCp =  h;     // FV: c' above xy
  const yD  = yC - L; // TV: d is L further from xy (perpendicular to VP means extends in depth)

  switch(step) {
    case 1:
      drawXYLine();
      updateInstructions('Step 1', 'Draw Reference Line xy',
        'The line is perpendicular to VP. It will project as a POINT in the front view and as its true length in the top view.');
      break;

    case 2:
      drawXYLine();
      drawProjector(xA, yC - 8, yCp + 8);
      drawPoint(xA, yC,  cfg.tvColor); drawLabel('c',  xA, yC,  cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA, yCp, cfg.fvColor); drawLabel("c'", xA, yCp, cfg.fvColor, {dx:8,  dy:0});
      updateInstructions('Step 2', 'Locate Near End C',
        `c (TV) is ${d} mm below xy — near end distance from VP.\nc' (FV) is ${h} mm above xy — height of C above HP.`);
      break;

    case 3:
      drawXYLine();
      drawProjector(xA, yC - 8, yCp + 8);
      drawPoint(xA, yC, cfg.tvColor); drawLabel('c', xA, yC, cfg.tvColor, {dx:-9, dy:0});
      // FV: coincident point c'(d')
      drawPoint(xA, yCp, cfg.fvColor, 4);
      drawPointRing(xA, yCp, cfg.fvColor, 7);
      drawLabel("c'(d')", xA, yCp, cfg.fvColor, {dx:10, dy:0});
      updateInstructions('Step 3', 'Front View = POINT',
        'Since the line is perpendicular to VP, ALL points project to the SAME point on VP.\nThe front view is a single point c\'(d\').');
      break;

    case 4:
      drawXYLine();
      drawProjector(xA, yD - 8, yCp + 8);
      drawLine(xA, yC, xA, yD, cfg.tvColor, cfg.finalWidth);
      drawPoint(xA, yC, cfg.tvColor); drawLabel('c', xA, yC, cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA, yD, cfg.tvColor); drawLabel('d', xA, yD, cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA, yCp, cfg.fvColor, 4);
      drawPointRing(xA, yCp, cfg.fvColor, 7);
      drawLabel("c'(d')", xA, yCp, cfg.fvColor, {dx:10, dy:0});
      updateInstructions('Step 4', 'Top View = True Length',
        `From c downward, draw vertical line ⊥ xy of length L = ${L} mm.\nThis is the TRUE LENGTH since the line is parallel to HP.\nd is ${d + L} mm below xy.`);
      break;

    case 5:
      drawXYLine();
      drawProjector(xA, yD - 8, yCp + 8);
      drawLine(xA, yC, xA, yD, cfg.tvColor, cfg.finalWidth);
      drawPoint(xA, yC,  cfg.tvColor); drawLabel('c',      xA, yC,  cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA, yD,  cfg.tvColor); drawLabel('d',      xA, yD,  cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA, yCp, cfg.fvColor, 4);
      drawPointRing(xA, yCp, cfg.fvColor, 7);
      drawLabel("c'(d')", xA, yCp, cfg.fvColor, {dx:10, dy:0});
      drawDimension(xA + 6, yC, xA + 6, yD, `TL = ${L} mm`);
      updateInstructions('Step 5 ✓', 'Final – Perpendicular to VP',
        `Front view = point c'(d').\nTop view cd = ${L} mm (True Length), perpendicular to xy.`);
      break;
  }
}

