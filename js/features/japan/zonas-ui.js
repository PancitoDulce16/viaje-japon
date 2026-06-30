/* ========================================
   ZONAS UI - Sistema de Zonas
   ======================================== */

const ZonasUI = {
  selectedPreferencias: [],

  openModal() {
    const modal = document.getElementById('zonasModal');
    if (!modal) {
      this.createModal();
    }
    document.getElementById('zonasModal').classList.add('active');
    this.renderZonas();
  },

  closeModal() {
    document.getElementById('zonasModal').classList.remove('active');
  },

  createModal() {
    const modalHTML = `
      <div id="zonasModal" class="zonas-modal">
        <div class="zonas-modal-content">
          <div class="zonas-modal-header">
            <h2>🗾 Regiones de Japón</h2>
            <button class="zonas-close-btn" onclick="ZonasUI.closeModal()">×</button>
          </div>

          <div class="zonas-filtros">
            <h3>🎯 ¿Qué te interesa? (selecciona para recomendaciones)</h3>
            <div class="preferencias-tags">
              <div class="preferencia-tag" onclick="ZonasUI.togglePreferencia('moderna')">🏙️ Ciudades Modernas</div>
              <div class="preferencia-tag" onclick="ZonasUI.togglePreferencia('tradicional')">⛩️ Cultura Tradicional</div>
              <div class="preferencia-tag" onclick="ZonasUI.togglePreferencia('naturaleza')">🏔️ Naturaleza</div>
              <div class="preferencia-tag" onclick="ZonasUI.togglePreferencia('playa')">🏖️ Playas</div>
              <div class="preferencia-tag" onclick="ZonasUI.togglePreferencia('ski')">⛷️ Ski/Nieve</div>
              <div class="preferencia-tag" onclick="ZonasUI.togglePreferencia('comida')">🍜 Gastronomía</div>
              <div class="preferencia-tag" onclick="ZonasUI.togglePreferencia('historia')">🏯 Historia</div>
              <div class="preferencia-tag" onclick="ZonasUI.togglePreferencia('onsen')">♨️ Onsens</div>
            </div>
          </div>

          <div id="recomendacionesContainer"></div>

          <div id="zonasGrid" class="zonas-grid"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Cerrar modal al hacer click fuera
    document.getElementById('zonasModal').addEventListener('click', (e) => {
      if (e.target.id === 'zonasModal') {
        this.closeModal();
      }
    });
  },

  togglePreferencia(pref) {
    const index = this.selectedPreferencias.indexOf(pref);
    if (index > -1) {
      this.selectedPreferencias.splice(index, 1);
    } else {
      this.selectedPreferencias.push(pref);
    }

    // Actualizar UI de tags
    document.querySelectorAll('.preferencia-tag').forEach(tag => {
      const text = tag.textContent.toLowerCase();
      if (this.selectedPreferencias.some(p => text.includes(p))) {
        tag.classList.add('active');
      } else {
        tag.classList.remove('active');
      }
    });

    // Actualizar recomendaciones
    this.renderRecomendaciones();
  },

  renderRecomendaciones() {
    const container = document.getElementById('recomendacionesContainer');
    if (!container) return;

    if (this.selectedPreferencias.length === 0) {
      container.innerHTML = '';
      return;
    }

    const recomendaciones = window.ZonasSystem.recomendar(this.selectedPreferencias);

    if (recomendaciones.length === 0) {
      container.innerHTML = '';
      return;
    }

    // Agrupar por zona
    const zonasRecomendadas = {};
    recomendaciones.forEach(rec => {
      if (!zonasRecomendadas[rec.zona]) {
        zonasRecomendadas[rec.zona] = [];
      }
      zonasRecomendadas[rec.zona].push(rec.razon);
    });

    container.innerHTML = `
      <div class="recomendaciones-container">
        <h4>✨ Zonas recomendadas según tus intereses:</h4>
        ${Object.keys(zonasRecomendadas).map(zonaKey => {
          const zona = window.ZonasSystem.zonas[zonaKey];
          const razones = zonasRecomendadas[zonaKey];
          return `
            <div class="recomendacion-item">
              <span class="recomendacion-zona">${zona.icono} ${zona.nombre}</span>
              <ul style="margin: 4px 0 0 20px; padding: 0;">
                ${razones.map(r => `<li style="font-size: 0.85rem; color: #6b7280;">${r}</li>`).join('')}
              </ul>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderZonas() {
    const grid = document.getElementById('zonasGrid');
    if (!grid) return;

    const zonas = window.ZonasSystem.zonas;

    grid.innerHTML = Object.keys(zonas).map(key => {
      const zona = zonas[key];
      return `
        <div class="zona-card" data-zona="${key}">
          <div class="zona-card-header">
            <div class="zona-icono">${zona.icono}</div>
            <h3 class="zona-nombre">${zona.nombre}</h3>
          </div>
          <div class="zona-card-body">
            <p class="zona-descripcion">${zona.descripcion}</p>

            <div class="zona-info-section">
              <div class="zona-info-title">🏙️ Ciudades Principales</div>
              <ul class="zona-ciudades-list">
                ${zona.ciudadesImportantes.slice(0, 3).map(ciudad => `
                  <li><strong>${ciudad.nombre}</strong>: ${ciudad.descripcion}</li>
                `).join('')}
              </ul>
            </div>

            <div class="zona-info-section">
              <div class="zona-info-title">✨ Características</div>
              <ul class="zona-caracteristicas-list">
                ${zona.caracteristicas.slice(0, 3).map(car => `<li>${car}</li>`).join('')}
              </ul>
            </div>

            <div class="zona-info-section">
              <div class="zona-info-title">🌡️ Clima</div>
              <div class="zona-info-content">${zona.clima}</div>
            </div>

            <div class="zona-mejor-epoca">
              <div class="zona-info-title">📅 Mejor Época</div>
              <div class="zona-info-content"><strong>${zona.mejorEpoca}</strong></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
};

// Export para uso global
if (typeof window !== 'undefined') {
  window.ZonasUI = ZonasUI;
}
