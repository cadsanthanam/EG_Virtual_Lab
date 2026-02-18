/**
 * lines-parser-disambig.js
 * 
 * Disambiguation UI for ambiguous value assignments
 * Modal interface for user to resolve ambiguities
 */

class DisambiguationUI {
  constructor(containerId) {
    this.containerId = containerId;
    this.resolveCallback = null;
    this.rejectCallback = null;
  }

  async promptUser(ambiguities) {
    return new Promise((resolve, reject) => {
      this.resolveCallback = resolve;
      this.rejectCallback = reject;
      this._renderModal(ambiguities);
    });
  }

  _renderModal(ambiguities) {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`[Disambig] Container #${this.containerId} not found`);
      this.rejectCallback?.(new Error('Container not found'));
      return;
    }

    const modalHTML = `
      <div style="
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      " id="disambigModal">
        <div style="
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
          padding: 24px;
          max-width: 500px;
          color: #c9d1d9;
        ">
          <h3 style="margin:0 0 16px 0; color:#58a6ff;">Clarify Ambiguous Data</h3>
          <p style="margin:0 0 16px 0; font-size:14px; color:#8b949e;">
            Multiple interpretations possible. Please select the correct assignment:
          </p>
          <div id="disambigOptions">
            ${ambiguities.map((amb, idx) => `
              <div style="margin-bottom: 16px; padding: 12px; background: #0d1117; border-radius: 4px;">
                <label style="display:block; margin-bottom:8px; font-weight:600;">
                  ${amb.question}
                </label>
                ${amb.options.map((opt, optIdx) => `
                  <div style="margin:4px 0;">
                    <input type="radio" 
                           name="disambig_${idx}" 
                           value="${optIdx}" 
                           id="opt_${idx}_${optIdx}"
                           ${optIdx === 0 ? 'checked' : ''}>
                    <label for="opt_${idx}_${optIdx}" style="margin-left:8px;">
                      ${opt.label}
                    </label>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
          <div style="margin-top:16px; display:flex; gap:8px; justify-content:flex-end;">
            <button id="disambigCancel" style="
              padding: 8px 16px;
              background: #21262d;
              border: 1px solid #30363d;
              border-radius: 4px;
              color: #c9d1d9;
              cursor: pointer;
            ">Cancel</button>
            <button id="disambigConfirm" style="
              padding: 8px 16px;
              background: #238636;
              border: 1px solid #2ea043;
              border-radius: 4px;
              color: #fff;
              cursor: pointer;
            ">Confirm</button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = modalHTML;

    document.getElementById('disambigCancel').onclick = () => {
      container.innerHTML = '';
      this.rejectCallback?.(new Error('User cancelled disambiguation'));
    };

    document.getElementById('disambigConfirm').onclick = () => {
      const resolutions = ambiguities.map((amb, idx) => {
        const selected = document.querySelector(`input[name="disambig_${idx}"]:checked`);
        const optionIndex = selected ? parseInt(selected.value) : 0;
        return amb.options[optionIndex];
      });
      container.innerHTML = '';
      this.resolveCallback?.(resolutions);
    };
  }

  static applyResolutions(extracted, resolutions) {
    // Apply user's disambiguation choices to extracted data
    resolutions.forEach(resolution => {
      if (resolution.assign) {
        Object.keys(resolution.assign).forEach(key => {
          extracted[key] = resolution.assign[key];
        });
      }
    });
    return extracted;
  }
}

if (typeof window !== 'undefined') window.DisambiguationUI = DisambiguationUI;
if (typeof module !== 'undefined' && module.exports) module.exports = DisambiguationUI;