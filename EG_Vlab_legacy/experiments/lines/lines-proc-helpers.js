/**
 * Drawing Utilities
 */
const ProcHelpers = {
  drawXY(ctx, w, h) {
    const y = h/2;
    ctx.strokeStyle = '#30363d'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
    ctx.fillStyle = '#8b949e'; ctx.font = '14px Arial';
    ctx.fillText('X', w-30, y-10); ctx.fillText('Y', w-30, y+20);
  },
  drawProjector(ctx, x, y1, y2) {
    ctx.strokeStyle = '#484f58'; ctx.lineWidth = 1; ctx.setLineDash([5,5]);
    ctx.beginPath(); ctx.moveTo(x,y1); ctx.lineTo(x,y2); ctx.stroke();
    ctx.setLineDash([]);
  },
  drawPoint(ctx, x, y, label, color='#58a6ff') {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x,y,4,0,2*Math.PI); ctx.fill();
    ctx.font = '12px Arial'; ctx.fillText(label, x+8, y-8);
  },
  drawLine(ctx, x1, y1, x2, y2, color='#58a6ff', width=2) {
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  },
  drawAuxiliary(ctx, x1, y1, x2, y2, label) {
    ctx.strokeStyle = '#7ee787'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    ctx.setLineDash([]);
    if(label) {
      ctx.font = '11px Arial'; ctx.fillStyle = '#7ee787';
      ctx.fillText(label, (x1+x2)/2, (y1+y2)/2-5);
    }
  },
  toRad(deg) { return deg * Math.PI / 180; },
  scale(mm, factor=2) { return mm * factor; }
};
if(typeof window!=='undefined')window.ProcHelpers=ProcHelpers;
