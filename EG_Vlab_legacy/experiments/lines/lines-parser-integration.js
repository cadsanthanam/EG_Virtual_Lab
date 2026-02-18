/**
 * Enterprise Integration Layer
 */
function injectParserPanel() {
  if(document.getElementById('parserPanel')) return;
  const panel = document.createElement('div');
  panel.id = 'parserPanel';
  panel.style.cssText = 'background:#0d1117;color:#c9d1d9;padding:15px;margin:15px 0;border-radius:6px;border:1px solid #30363d;font-size:13px';
  const controls = document.getElementById('controls') || document.body;
  controls.appendChild(panel);
}

function renderParserFeedback(result) {
  const panel = document.getElementById('parserPanel');
  if(!panel) return;
  
  if(!result || !result.constraints) {
    panel.innerHTML = '<div style="color:#f85149;font-weight:bold">⚠ Parse Error</div><div style="color:#8b949e;margin-top:5px">' + (result?.error || 'Unknown error') + '</div>';
    return;
  }
  
  let html = '<div style="font-weight:bold;color:#7ee787;margin-bottom:8px">✓ Parser Ready</div>';
  html += `<div><strong>PROC-ID:</strong> <span style="color:#58a6ff">${result.procId || 'Unknown'}</span></div>`;
  html += `<div><strong>Case:</strong> <span style="color:#58a6ff">${result.caseType || 'Undetermined'}</span></div>`;
  html += `<div><strong>Slots:</strong> <span style="color:${result.slotsConsumed>=5?'#7ee787':'#f85149'}">${result.slotsConsumed}/5</span></div>`;
  
  if(!result.completeness.sufficient) {
    html += '<div style="color:#f85149;margin-top:8px;padding:8px;background:#161b22;border-radius:4px">⚠ Insufficient data (need 5 slots)</div>';
  }
  
  if(result.validation && !result.validation.valid) {
    html += `<div style="color:#f85149;margin-top:8px">${result.validation.errors.join(', ')}</div>`;
  }
  
  panel.innerHTML = html;
}

function updateFieldsFromParser(result) {
  if(!result || !result.constraints) return;
  const c = result.constraints;
  const set = (id,val) => {const el=document.getElementById(id); if(el&&val!==null)el.value=val;};
  set('inL', c.TL);
  set('inTheta', c.theta);
  set('inPhi', c.phi);
  set('inH', c.h_A);
  set('inD', c.d_A);
  set('inLowerH', c.h_B);
}

if(typeof window!=='undefined') {
  window.injectParserPanel = injectParserPanel;
  window.renderParserFeedback = renderParserFeedback;
  window.updateFieldsFromParser = updateFieldsFromParser;
}
