/* ========================================
   JAPAN RULES UI - Sistema de 30 Reglas
   Manejo de interfaz y modal
   ======================================== */

// ===================================
// REGLA DEL DÍA - Widget Dashboard
// ===================================
function mostrarReglaDelDia() {
  const widget = document.getElementById('reglaDelDiaWidget');
  if (!widget) return;

  const regla = window.JapanRules.delDia();

  widget.innerHTML = `
    <h3>📌 Regla del Día #${regla.id}</h3>
    <div class="regla-emoji-large">${regla.emoji}</div>
    <div class="regla-titulo">${regla.titulo}</div>
    <div class="regla-texto">${regla.regla}</div>
    <div class="regla-severidad ${regla.severidad}">
      ${regla.severidad === 'crítica' ? '⚠️ MUY IMPORTANTE' : ''}
      ${regla.severidad === 'alta' ? '❗ IMPORTANTE' : ''}
      ${regla.severidad === 'media' ? '📍 RECUERDA' : ''}
      ${regla.severidad === 'baja' ? '💡 CONSEJO' : ''}
    </div>
    <button class="view-all-rules-btn" onclick="JapanRulesUI.openModal()">
      📚 Ver todas las reglas
    </button>
  `;
}

// ===================================
// MODAL DE TODAS LAS REGLAS
// ===================================
const JapanRulesUI = {
  currentFilter: 'todas',
  searchTerm: '',

  openModal() {
    const modal = document.getElementById('japanRulesModal');
    if (!modal) {
      this.createModal();
    }
    document.getElementById('japanRulesModal').classList.add('active');
    this.renderRules();
  },

  closeModal() {
    document.getElementById('japanRulesModal').classList.remove('active');
  },

  createModal() {
    const modalHTML = `
      <div id="japanRulesModal" class="japan-rules-modal">
        <div class="rules-modal-content">
          <div class="rules-modal-header">
            <h2>🇯🇵 30 Reglas Anti-Error</h2>
            <button class="rules-close-btn" onclick="JapanRulesUI.closeModal()">×</button>
          </div>

          <div class="rules-search-bar">
            <input
              type="text"
              class="rules-search-input"
              placeholder="🔍 Buscar reglas... (ej: 'tren', 'comida', 'templo')"
              oninput="JapanRulesUI.handleSearch(this.value)"
            />
          </div>

          <div class="rules-filter-tabs">
            <button class="filter-tab active" onclick="JapanRulesUI.setFilter('todas')">
              🌸 Todas
            </button>
            <button class="filter-tab" onclick="JapanRulesUI.setFilter('Transporte')">
              🚄 Transporte
            </button>
            <button class="filter-tab" onclick="JapanRulesUI.setFilter('Comida')">
              🍜 Comida
            </button>
            <button class="filter-tab" onclick="JapanRulesUI.setFilter('Templos')">
              ⛩️ Templos
            </button>
            <button class="filter-tab" onclick="JapanRulesUI.setFilter('Onsen')">
              ♨️ Onsen
            </button>
            <button class="filter-tab" onclick="JapanRulesUI.setFilter('Social')">
              🙇 Social
            </button>
            <button class="filter-tab" onclick="JapanRulesUI.setFilter('crítica')">
              ⚠️ Críticas
            </button>
          </div>

          <div id="rulesGrid" class="rules-grid"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Cerrar modal al hacer click fuera
    document.getElementById('japanRulesModal').addEventListener('click', (e) => {
      if (e.target.id === 'japanRulesModal') {
        this.closeModal();
      }
    });
  },

  setFilter(filter) {
    this.currentFilter = filter;
    this.searchTerm = '';

    // Actualizar tabs activos
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Limpiar búsqueda
    const searchInput = document.querySelector('.rules-search-input');
    if (searchInput) searchInput.value = '';

    this.renderRules();
  },

  handleSearch(term) {
    this.searchTerm = term.toLowerCase();
    this.renderRules();
  },

  renderRules() {
    const grid = document.getElementById('rulesGrid');
    if (!grid) return;

    let reglas = window.JapanRules.todas;

    // Aplicar filtro por categoría o severidad
    if (this.currentFilter !== 'todas') {
      if (this.currentFilter === 'crítica') {
        reglas = reglas.filter(r => r.severidad === 'crítica');
      } else {
        reglas = reglas.filter(r => r.categoria === this.currentFilter);
      }
    }

    // Aplicar búsqueda
    if (this.searchTerm) {
      reglas = window.JapanRules.buscar(this.searchTerm);
    }

    // Renderizar
    if (reglas.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <div class="no-results-emoji">🤔</div>
          <p>No se encontraron reglas con ese criterio</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = reglas.map(regla => `
      <div class="rule-card">
        <div class="rule-card-header">
          <div class="rule-card-emoji">${regla.emoji}</div>
          <div class="rule-card-title">
            <div class="rule-card-category">${regla.categoria}</div>
            <h4 class="rule-card-heading">${regla.titulo}</h4>
          </div>
        </div>
        <p class="rule-card-text">${regla.regla}</p>
        <div class="rule-card-footer">
          <span class="regla-severidad ${regla.severidad}">
            ${regla.severidad === 'crítica' ? '⚠️ CRÍTICA' : ''}
            ${regla.severidad === 'alta' ? 'IMPORTANTE' : ''}
            ${regla.severidad === 'media' ? 'RECUERDA' : ''}
            ${regla.severidad === 'baja' ? 'CONSEJO' : ''}
          </span>
        </div>
      </div>
    `).join('');
  }
};

// ===================================
// INICIALIZAR
// ===================================
window.addEventListener('load', () => {
  // Mostrar regla del día si existe el widget
  if (document.getElementById('reglaDelDiaWidget')) {
    mostrarReglaDelDia();
  }
});

// Export para uso global
if (typeof window !== 'undefined') {
  window.JapanRulesUI = JapanRulesUI;
}
