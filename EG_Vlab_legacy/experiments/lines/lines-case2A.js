// ── CASE 2A: Perpendicular to HP ─────────────────────────────
// TV = point a(b), FV = true length vertical a'b'
function drawCase2A(step) {
  const { L, d, lowerH } = state;
  const xA  = calcXA();
  const yB  = -d;                // TV: b is d below xy
  const yBp = lowerH;            // FV: b' is lowerH above xy (0 if resting on HP)
  const yAp = lowerH + L;        // FV: a' is L above b'

  switch(step) {
    case 1:
      drawXYLine();
      updateInstructions('Step 1', 'Draw Reference Line xy',
        'The line is perpendicular to HP. It will project as a POINT in the top view and as its true length in the front view.');
      break;

    case 2:
      drawXYLine();
      drawProjector(xA, yB - 8, yBp + 8);
      drawPoint(xA, yB,  cfg.tvColor); drawLabel('b',  xA, yB,  cfg.tvColor, {dx:-9, dy:0});
      drawPoint(xA, yBp, cfg.fvColor); drawLabel("b'", xA, yBp, cfg.fvColor, {dx:8, dy:0});
      updateInstructions('Step 2', 'Locate Lower End B',
        `b (TV) is ${d} mm below xy — distance of B from VP.\nb' (FV) is ${lowerH > 0 ? lowerH + ' mm above' : 'ON'} xy — lower end height above HP = ${lowerH} mm.`);
      break;

    case 3:
      drawXYLine();
      drawProjector(xA, yB - 8, yBp + 8);
      // TV: coincident point a(b)
      drawPoint(xA, yB, cfg.tvColor, 4);
      drawPointRing(xA, yB, cfg.tvColor, 7);
      drawLabel('a(b)', xA, yB, cfg.tvColor, {dx:10, dy:0});
      drawPoint(xA, yBp, cfg.fvColor); drawLabel("b'", xA, yBp, cfg.fvColor, {dx:8, dy:0});
      updateInstructions('Step 3', 'Top View = POINT',
        'Since the line is perpendicular to HP, ALL points of the line project to the SAME point on HP.\nThe top view is a single point a(b) — both endpoints coincide.');
      break;

    case 4:
      drawXYLine();
      drawProjector(xA, yB - 8, yAp + 8);
      drawPoint(xA, yB, cfg.tvColor, 4);
      drawPointRing(xA, yB, cfg.tvColor, 7);
      drawLabel('a(b)', xA, yB, cfg.tvColor, {dx:10, dy:0});
      drawLine(xA, yBp, xA, yAp, cfg.fvColor, cfg.finalWidth);
      drawPoint(xA, yBp, cfg.fvColor); drawLabel("b'", xA, yBp, cfg.fvColor, {dx:8,  dy:0});
      drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, {dx:8, dy:0});
      updateInstructions('Step 4', 'Front View = True Length',
        `From b' upward, draw vertical line ⊥ xy of length L = ${L} mm.\nThis shows the TRUE LENGTH since the line is parallel to VP.\na' is ${lowerH + L} mm above xy.`);
      break;

    case 5:
      drawXYLine();
      drawProjector(xA, yB - 8, yAp + 8);
      drawPoint(xA, yB, cfg.tvColor, 4);
      drawPointRing(xA, yB, cfg.tvColor, 7);
      drawLabel('a(b)', xA, yB, cfg.tvColor, {dx:10, dy:0});
      drawLine(xA, yBp, xA, yAp, cfg.fvColor, cfg.finalWidth);
      drawPoint(xA, yBp, cfg.fvColor); drawLabel("b'", xA, yBp, cfg.fvColor, {dx:8, dy:0});
      drawPoint(xA, yAp, cfg.fvColor); drawLabel("a'", xA, yAp, cfg.fvColor, {dx:8, dy:0});
      drawDimension(xA + 6, yBp, xA + 6, yAp, `TL = ${L} mm`);
      updateInstructions('Step 5 ✓', 'Final – Perpendicular to HP',
        `Top view = point a(b).\nFront view a'b' = ${L} mm (True Length), perpendicular to xy.`);
      break;
  }
}

