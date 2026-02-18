// ============================================================
// Virtual Lab – Projections of Straight Lines
// lines-cases.js  –  All Case Drawing Functions
// ============================================================
// Coordinate convention (paper mm):
//   x: positive → right
//   y: positive → up (above xy line)
//   y: negative → down (below xy line, top view region)
//   FV (front view) lives above xy  →  y > 0
//   TV (top view)   lives below xy  →  y < 0
// ============================================================

// ── Shared helpers ───────────────────────────────────────────

/** Draw xy, mark x/y, draw projector at xA, place a and a' dots + labels */
function drawSetup(xA, yA, yAp, showProjector = true) {
  drawXYLine();
  if (showProjector) drawProjector(xA, Math.min(yA - 10, -5), Math.max(yAp + 10, 5));
  // point a (top view)
  drawPoint(xA, yA, cfg.tvColor);
  drawLabel("a", xA, yA, cfg.tvColor, { dx: -8, dy: 0 });
  // point a' (front view)
  drawPoint(xA, yAp, cfg.fvColor);
  drawLabel("a'", xA, yAp, cfg.fvColor, { dx: -10, dy: 0 });
}

/** Trace finder: extend FV line a'b' to xy → drop projector → HT on TV line */
function findAndDrawTraces(ax, ay_tv, bx, by_tv, ax_fv, ay_fv, bx_fv, by_fv) {
  // ── HT: extend FV line to xy (y=0) ──
  const dxFV = bx_fv - ax_fv, dyFV = by_fv - ay_fv;
  if (Math.abs(dyFV) > 0.001) {
    const tHp = -ay_fv / dyFV;    // parameter where FV line y = 0
    const hPrimX = ax_fv + tHp * dxFV;  // h' on xy
    drawLine(ax_fv, ay_fv, hPrimX, 0, cfg.htColor, 0.8, []);
    drawProjector(hPrimX, 0, by_tv - 5);
    // HT on extended TV line
    const dxTV = bx - ax, dyTV = by_tv - ay_tv;
    const t2 = Math.abs(dxTV) > 0.001 ? (hPrimX - ax) / dxTV : null;
    if (t2 !== null) {
      const htX = ax + t2 * dxTV;
      const htY = ay_tv + t2 * dyTV;
      drawPoint(htX, htY, cfg.htColor, 4);
      drawPointRing(htX, htY, cfg.htColor, 7);
      drawLabel('HT', htX, htY, cfg.htColor, { dx: 8, dy: 4 });
    }
  }
  // ── VT: extend TV line to xy (y=0) ──
  const dxTV = bx - ax, dyTV = by_tv - ay_tv;
  if (Math.abs(dyTV) > 0.001) {
    const tVp = -ay_tv / dyTV;
    const vX = ax + tVp * dxTV;
    drawLine(ax, ay_tv, vX, 0, cfg.vtColor, 0.8, []);
    drawProjector(vX, 0, ay_fv + 5);
    // VT on extended FV line
    const t3 = Math.abs(dxFV) > 0.001 ? (vX - ax_fv) / dxFV : null;
    if (t3 !== null) {
      const vtX = ax_fv + t3 * dxFV;
      const vtY = ay_fv + t3 * dyFV;
      drawPoint(vtX, vtY, cfg.vtColor, 4);
      drawPointRing(vtX, vtY, cfg.vtColor, 7);
      drawLabel('VT', vtX, vtY, cfg.vtColor, { dx: 8, dy: -4 });
    }
  }
}

