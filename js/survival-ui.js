/* ========================================
   SURVIVAL GUIDE UI
   ======================================== */

const SurvivalUI = {
  currentTab: 'basicas',

  openModal() {
    const modal = document.getElementById('survivalModal');
    if (!modal) {
      this.createModal();
    }
    document.getElementById('survivalModal').classList.add('active');
    this.renderContent();
  },

  closeModal() {
    document.getElementById('survivalModal').classList.remove('active');
  },

  createModal() {
    const modalHTML = `
      <div id="survivalModal" class="survival-modal">
        <div class="survival-modal-content">
          <div class="survival-modal-header">
            <h2>🆘 Survival Guide</h2>
            <button class="survival-close-btn" onclick="SurvivalUI.closeModal()">×</button>
          </div>

          <div class="survival-tabs">
            <button class="survival-tab active" onclick="SurvivalUI.switchTab('basicas')">
              👋 Básicas
            </button>
            <button class="survival-tab" onclick="SurvivalUI.switchTab('restaurante')">
              🍜 Restaurante
            </button>
            <button class="survival-tab" onclick="SurvivalUI.switchTab('compras')">
              🛍️ Compras
            </button>
            <button class="survival-tab" onclick="SurvivalUI.switchTab('transporte')">
              🚄 Transporte
            </button>
            <button class="survival-tab" onclick="SurvivalUI.switchTab('hotel')">
              🏨 Hotel
            </button>
            <button class="survival-tab" onclick="SurvivalUI.switchTab('cortesia')">
              🙇 Cortesía
            </button>
            <button class="survival-tab" onclick="SurvivalUI.switchTab('numeros')">
              🔢 Números
            </button>
            <button class="survival-tab" onclick="SurvivalUI.switchTab('emergencias')">
              🚨 Emergencias
            </button>
            <button class="survival-tab" onclick="SurvivalUI.switchTab('consejos')">
              💡 Consejos
            </button>
            <button class="survival-tab" onclick="SurvivalUI.switchTab('embajadas')">
              🏛️ Embajadas
            </button>
          </div>

          <div id="survivalContent"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Cerrar modal al hacer click fuera
    document.getElementById('survivalModal').addEventListener('click', (e) => {
      if (e.target.id === 'survivalModal') {
        this.closeModal();
      }
    });
  },

  switchTab(tab) {
    this.currentTab = tab;

    // Actualizar tabs activos
    document.querySelectorAll('.survival-tab').forEach(t => {
      t.classList.remove('active');
    });
    event.target.classList.add('active');

    this.renderContent();
  },

  renderContent() {
    const container = document.getElementById('survivalContent');
    if (!container) return;

    const guide = window.SurvivalGuide;

    switch(this.currentTab) {
      case 'basicas':
      case 'restaurante':
      case 'compras':
      case 'transporte':
      case 'hotel':
      case 'cortesia':
        const categoria = guide.frases[this.currentTab];
        container.innerHTML = `
          <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 16px; color: #ef4444;">
            ${categoria.icono} ${categoria.nombre}
          </h3>
          <div class="frases-grid">
            ${categoria.frases.map(frase => `
              <div class="frase-card" onclick="SurvivalUI.speakPhrase('${frase.romaji}')">
                <div class="frase-japones">${frase.japones}</div>
                <div class="frase-romaji">${frase.romaji}</div>
                <div class="frase-espanol">${frase.espanol}</div>
              </div>
            `).join('')}
          </div>
          <p style="text-align: center; color: #6b7280; margin-top: 20px; font-size: 0.85rem;">
            💡 Tip: Haz click en cualquier frase para escuchar la pronunciación
          </p>
        `;
        break;

      case 'numeros':
        container.innerHTML = `
          <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 16px; color: #ef4444;">
            🔢 Números en Japonés
          </h3>
          <div class="numeros-grid">
            ${guide.numeros.map(num => `
              <div class="numero-card">
                <div class="numero-arabigo">${num.numero}</div>
                <div class="numero-kanji">${num.japones}</div>
                <div class="numero-romaji">${num.romaji}</div>
              </div>
            `).join('')}
          </div>
          <p style="text-align: center; color: #6b7280; margin-top: 20px; font-size: 0.85rem;">
            💡 Nota: Algunos números tienen lecturas alternativas según el contexto
          </p>
        `;
        break;

      case 'emergencias':
        container.innerHTML = `
          <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 16px; color: #dc2626;">
            🚨 Teléfonos de Emergencia
          </h3>
          <div class="emergencias-grid">
            ${guide.emergencias.map(em => `
              <div class="emergencia-card">
                <div class="emergencia-icono">${em.icono}</div>
                <div class="emergencia-servicio">${em.servicio}</div>
                <div class="emergencia-numero">${em.numero}</div>
                <div class="emergencia-descripcion">${em.descripcion}</div>
              </div>
            `).join('')}
          </div>
          <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin-top: 20px;">
            <p style="font-weight: 700; margin-bottom: 8px;">⚠️ IMPORTANTE:</p>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>110 = POLICÍA (robos, accidentes de tráfico)</li>
              <li>119 = BOMBEROS/AMBULANCIA (emergencias médicas, incendios)</li>
              <li>Si no hablas japonés, di claramente "ENGLISH PLEASE"</li>
              <li>Guarda estos números en tu teléfono ANTES de viajar</li>
            </ul>
          </div>
        `;
        break;

      case 'consejos':
        container.innerHTML = `
          <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 16px; color: #10b981;">
            💡 Consejos de Seguridad
          </h3>
          <ul class="consejos-lista">
            ${guide.consejos.map(consejo => `
              <li class="consejo-item">${consejo}</li>
            `).join('')}
          </ul>
        `;
        break;

      case 'embajadas':
        container.innerHTML = `
          <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 16px; color: #3b82f6;">
            🏛️ Embajadas en Tokio
          </h3>
          <div class="embajadas-grid">
            ${Object.keys(guide.embajadas).map(key => {
              const emb = guide.embajadas[key];
              return `
                <div class="embajada-card">
                  <div class="embajada-nombre">${emb.nombre}</div>
                  <div class="embajada-telefono">📞 ${emb.telefono}</div>
                  <div class="embajada-info">📍 ${emb.direccion}</div>
                </div>
              `;
            }).join('')}
          </div>
          <p style="text-align: center; color: #6b7280; margin-top: 20px; font-size: 0.85rem;">
            💡 Guarda el número de tu embajada en tu teléfono antes de viajar
          </p>
        `;
        break;
    }
  },

  speakPhrase(text) {
    // Usar Web Speech API para pronunciar (si está disponible)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      console.log('Text-to-speech no disponible:', text);
    }
  }
};

// Export para uso global
if (typeof window !== 'undefined') {
  window.SurvivalUI = SurvivalUI;
}
