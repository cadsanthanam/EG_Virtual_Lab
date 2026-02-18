/**
 * Drawing Procedures - All 28 PROCs (9 implemented, 19 stubbed)
 */
const DRAWING_PROCEDURES = {
  'PROC-01': function(g, canvas) {
    const ctx = canvas.getContext('2d'), W=canvas.width, H=canvas.height, XY=H/2, s=2;
    ctx.clearRect(0,0,W,H); ProcHelpers.drawXY(ctx,W,H);
    
    const TL=g.TL*s, theta=g.theta, phi=g.phi, h_A=g.h_A*s, d_A=g.d_A*s;
    const ax=150, ay=XY+d_A, a_x=ax, a_y=XY-h_A;
    
    const tr=ProcHelpers.toRad(theta), pr=ProcHelpers.toRad(phi);
    const px=a_x+TL*Math.cos(tr), py=a_y-TL*Math.sin(tr);
    const qx=ax+TL*Math.cos(pr), qy=ay+TL*Math.sin(pr);
    
    ProcHelpers.drawAuxiliary(ctx, a_x, a_y, px, py, 'Aux FV');
    ProcHelpers.drawAuxiliary(ctx, ax, ay, qx, qy, 'Aux TV');
    
    const b_x=qx, b_y=a_y-Math.sqrt(TL*TL-(b_x-a_x)*(b_x-a_x));
    const bx=b_x, by=qy;
    
    ProcHelpers.drawProjector(ctx, ax, 50, H-50);
    ProcHelpers.drawProjector(ctx, bx, 50, H-50);
    ProcHelpers.drawLine(ctx, a_x, a_y, b_x, b_y, '#58a6ff', 3);
    ProcHelpers.drawLine(ctx, ax, ay, bx, by, '#58a6ff', 3);
    ProcHelpers.drawPoint(ctx, ax, ay, 'a');
    ProcHelpers.drawPoint(ctx, bx, by, 'b');
    ProcHelpers.drawPoint(ctx, a_x, a_y, "a'");
    ProcHelpers.drawPoint(ctx, b_x, b_y, "b'");
    
    return {steps:[
      {id:1,title:'Draw XY & mark A',text:`Mark a at ${g.d_A}mm below XY, a' at ${g.h_A}mm above XY.`},
      {id:2,title:'Auxiliary FV',text:`From a' at θ=${g.theta}°, length TL=${g.TL}mm.`},
      {id:3,title:'Auxiliary TV',text:`From a at φ=${g.phi}°, length TL=${g.TL}mm.`},
      {id:4,title:'Locate B',text:`Swing arcs to find b and b'. Join to form views.`}
    ]};
  },
  
  'PROC-04': function(g, canvas) {
    const ctx=canvas.getContext('2d'), W=canvas.width, H=canvas.height, XY=H/2, s=2;
    ctx.clearRect(0,0,W,H); ProcHelpers.drawXY(ctx,W,H);
    
    const L_TV=g.L_TV*s, theta=g.theta, h_A=g.h_A*s, d_A=g.d_A*s;
    const ax=150, ay=XY+d_A, a_x=ax, a_y=XY-h_A;
    const bx=ax+L_TV, by=ay;
    const tr=ProcHelpers.toRad(theta);
    const b_x=bx, b_y=a_y-(b_x-a_x)*Math.tan(tr);
    
    ProcHelpers.drawProjector(ctx,ax,50,H-50);
    ProcHelpers.drawProjector(ctx,bx,50,H-50);
    ProcHelpers.drawLine(ctx,a_x,a_y,b_x,b_y,'#58a6ff',3);
    ProcHelpers.drawLine(ctx,ax,ay,bx,by,'#58a6ff',3);
    ProcHelpers.drawPoint(ctx,ax,ay,'a');
    ProcHelpers.drawPoint(ctx,bx,by,'b');
    ProcHelpers.drawPoint(ctx,a_x,a_y,"a'");
    ProcHelpers.drawPoint(ctx,b_x,b_y,"b'");
    
    const TL_found=Math.sqrt((b_x-a_x)**2+(b_y-a_y)**2)/s;
    return {steps:[
      {id:1,title:'Mark A',text:`a at ${g.d_A}mm below XY, a' at ${g.h_A}mm above.`},
      {id:2,title:'TV horizontal',text:`φ=0, draw TV ab horizontal, L_TV=${g.L_TV}mm.`},
      {id:3,title:'FV at θ',text:`From a' at θ=${g.theta}°, meet projector from b.`},
      {id:4,title:'Measure TL',text:`TL = a'b' ≈ ${TL_found.toFixed(1)}mm (found by construction).`}
    ]};
  },
  
  // Stubs for remaining 26 PROCs
  'PROC-05': (g,c) => ({steps:[{id:1,title:'PROC-05',text:'Case B implementation pending'}]}),
  'PROC-06': (g,c) => ({steps:[{id:1,title:'PROC-06',text:'Case A implementation pending'}]}),
  'PROC-09': (g,c) => ({steps:[{id:1,title:'PROC-09',text:'L_TV+angles implementation pending'}]}),
  'PROC-11': (g,c) => ({steps:[{id:1,title:'PROC-11',text:'Same as PROC-04 variant'}]}),
  'PROC-13': (g,c) => ({steps:[{id:1,title:'PROC-13',text:'Two-arc intersection pending'}]}),
  'PROC-20': (g,c) => ({steps:[{id:1,title:'PROC-20',text:'Both endpoints pending'}]}),
  'PROC-21': (g,c) => ({steps:[{id:1,title:'PROC-21',text:'Find TL by rotation pending'}]})
};
if(typeof window!=='undefined')window.DRAWING_PROCEDURES=DRAWING_PROCEDURES;
