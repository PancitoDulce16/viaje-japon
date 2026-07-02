/* ========================================
   JR PASS CALCULATOR UI
   ======================================== */

const JRPassUI = {
  viajes: [],
  diasSeleccionados: 7,

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="jr-pass-container">
        <div class="jr-pass-header">
          <h3>🚄 JR Pass Calculator</h3>
          <p class="jr-pass-description">
            Calcula si te conviene comprar el Japan Rail Pass según tu itinerario.
            El JR Pass te da acceso ilimitado a trenes JR por 7, 14 o 21 días.
          </p>
        </div>

        <div id="jrPassRealTripSection"></div>

        <div class="ejemplos-section">
          <h4 style="font-weight: 700; margin-bottom: 12px;">📍 O prueba con un itinerario de ejemplo:</h4>
          <div class="ejemplos-grid">
            <button class="ejemplo-btn" onclick="JRPassUI.cargarEjemplo('clasico')">
              Ruta Clásica (7 días)
            </button>
            <button class="ejemplo-btn" onclick="JRPassUI.cargarEjemplo('completo')">
              Gran Tour (14 días)
            </button>
            <button class="ejemplo-btn" onclick="JRPassUI.cargarEjemplo('kanto')">
              Solo Kanto (7 días)
            </button>
            <button class="ejemplo-btn" onclick="JRPassUI.cargarEjemplo('oeste')">
              Kansai & Hiroshima
            </button>
          </div>
        </div>

        <div class="viajes-form">
          <h4 style="font-weight: 700; margin-bottom: 16px;">✈️ Tus Viajes:</h4>
          <div id="viajesLista"></div>
          <button class="btn-add-viaje" onclick="JRPassUI.agregarViaje()">
            ➕ Agregar Viaje
          </button>
        </div>

        <div class="dias-selector">
          <label>📅 Duración del JR Pass:</label>
          <div class="dias-buttons">
            <button class="btn-dias active" data-dias="7" onclick="JRPassUI.seleccionarDias(7)">
              7 Días - ¥50,000
            </button>
            <button class="btn-dias" data-dias="14" onclick="JRPassUI.seleccionarDias(14)">
              14 Días - ¥80,000
            </button>
            <button class="btn-dias" data-dias="21" onclick="JRPassUI.seleccionarDias(21)">
              21 Días - ¥100,000
            </button>
          </div>
        </div>

        <button class="btn-calcular" onclick="JRPassUI.calcular()">
          🧮 Calcular si Vale la Pena
        </button>

        <div id="resultadoJRPass"></div>
      </div>
    `;

    this.renderRealTripSection();

    // Agregar primer viaje por defecto
    if (this.viajes.length === 0) {
      this.agregarViaje();
    }
  },

  /**
   * 🆕 Si hay un itinerario real cargado (window.getCurrentItinerary, ver
   * itinerary-v3.js), ofrece usarlo directamente en vez de forzar al
   * usuario a re-escribir su ruta a mano o elegir un ejemplo genérico que
   * no tiene nada que ver con su viaje.
   */
  renderRealTripSection() {
    const container = document.getElementById('jrPassRealTripSection');
    if (!container) return;

    const itinerary = window.getCurrentItinerary?.();
    const derivado = window.JRPassCalculator.derivarViajesDeItinerario(itinerary);

    if (!derivado) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div style="background: rgba(16, 185, 129, 0.1); border: 2px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <p style="font-weight: 700; margin-bottom: 4px;">🎯 Usa tu itinerario real</p>
        <p style="font-size: 0.85rem; margin-bottom: 12px; opacity: 0.85;">
          Detectamos ${derivado.viajes.length} traslado${derivado.viajes.length === 1 ? '' : 's'} entre ciudades en tu itinerario actual (${derivado.dias} días) - nada de rutas genéricas.
        </p>
        <button class="ejemplo-btn" onclick="JRPassUI.usarItinerarioReal()">
          ✅ Calcular con MI itinerario
        </button>
      </div>
    `;
  },

  /**
   * 🆕 Carga los traslados reales del itinerario actual y calcula de una.
   */
  usarItinerarioReal() {
    const itinerary = window.getCurrentItinerary?.();
    const derivado = window.JRPassCalculator.derivarViajesDeItinerario(itinerary);
    if (!derivado) return;

    this.viajes = derivado.viajes;
    // Redondear a la duración de pase más cercana disponible (7/14/21)
    this.diasSeleccionados = derivado.dias <= 7 ? 7 : (derivado.dias <= 14 ? 14 : 21);

    this.renderViajesLista();
    document.querySelectorAll('.btn-dias').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.dias) === this.diasSeleccionados);
    });
    this.calcular();
  },

  cargarEjemplo(tipo) {
    const ejemplo = window.JRPassCalculator.ejemplos[tipo];
    if (!ejemplo) return;

    this.viajes = [...ejemplo.viajes];
    this.diasSeleccionados = ejemplo.dias;

    // Actualizar UI
    this.renderViajesLista();

    // Actualizar botón de días activo
    document.querySelectorAll('.btn-dias').forEach(btn => {
      btn.classList.remove('active');
      if (parseInt(btn.dataset.dias) === this.diasSeleccionados) {
        btn.classList.add('active');
      }
    });
  },

  agregarViaje() {
    this.viajes.push({
      origen: "Tokyo",
      destino: "Kyoto",
      veces: 1
    });
    this.renderViajesLista();
  },

  removerViaje(index) {
    this.viajes.splice(index, 1);
    this.renderViajesLista();
  },

  renderViajesLista() {
    const lista = document.getElementById('viajesLista');
    if (!lista) return;

    const ciudades = window.JRPassCalculator.ciudades;

    lista.innerHTML = this.viajes.map((viaje, index) => `
      <div class="viaje-item">
        <select onchange="JRPassUI.actualizarViaje(${index}, 'origen', this.value)">
          ${ciudades.map(c => `<option value="${c}" ${viaje.origen === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>

        <select onchange="JRPassUI.actualizarViaje(${index}, 'destino', this.value)">
          ${ciudades.map(c => `<option value="${c}" ${viaje.destino === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>

        <input
          type="number"
          min="1"
          max="10"
          value="${viaje.veces}"
          onchange="JRPassUI.actualizarViaje(${index}, 'veces', parseInt(this.value))"
          style="width: 70px; text-align: center;"
          title="Veces que harás este viaje"
        >

        <button class="btn-remove-viaje" onclick="JRPassUI.removerViaje(${index})" ${this.viajes.length === 1 ? 'disabled' : ''}>
          ×
        </button>
      </div>
    `).join('');
  },

  actualizarViaje(index, campo, valor) {
    if (this.viajes[index]) {
      this.viajes[index][campo] = valor;
    }
  },

  seleccionarDias(dias) {
    this.diasSeleccionados = dias;

    // Actualizar botones
    document.querySelectorAll('.btn-dias').forEach(btn => {
      btn.classList.remove('active');
      if (parseInt(btn.dataset.dias) === dias) {
        btn.classList.add('active');
      }
    });
  },

  calcular() {
    const resultado = window.JRPassCalculator.calcularValor(this.viajes, this.diasSeleccionados);
    const recomendaciones = window.JRPassCalculator.generarRecomendaciones(this.viajes, resultado);

    const container = document.getElementById('resultadoJRPass');
    if (!container) return;

    const claseResultado = resultado.valeLaPena ? '' : 'no-vale';

    container.innerHTML = `
      <div class="resultado-container">
        <div class="resultado-card ${claseResultado}">
          <div class="resultado-titulo">
            ${resultado.valeLaPena ? '✅ ¡SÍ COMPRA EL JR PASS!' : '❌ NO COMPRES EL JR PASS'}
          </div>

          <div class="resultado-detalles">
            <div class="detalle-item">
              <div class="detalle-label">Costo de Tickets Individuales</div>
              <div class="detalle-valor">¥${resultado.costoTotal.toLocaleString()}</div>
            </div>

            <div class="detalle-item">
              <div class="detalle-label">Precio JR Pass (${this.diasSeleccionados} días)</div>
              <div class="detalle-valor">¥${resultado.precioPass.toLocaleString()}</div>
            </div>

            <div class="detalle-item">
              <div class="detalle-label">${resultado.valeLaPena ? 'Ahorro' : 'Pérdida'}</div>
              <div class="detalle-valor">¥${Math.abs(resultado.ahorro).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <ul class="recomendaciones-lista">
          ${recomendaciones.map(rec => `
            <li class="recomendacion-item ${rec.tipo}">
              <span class="recomendacion-icono">${rec.icono}</span>
              <span>${rec.mensaje}</span>
            </li>
          `).join('')}
        </ul>

        <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 16px; border-radius: 12px; margin-top: 20px;">
          <p style="font-weight: 700; margin-bottom: 8px;">💡 Tips Importantes:</p>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>El JR Pass debe activarse dentro de 3 meses de comprarlo</li>
            <li>NO cubre Shinkansen Nozomi ni Mizuho (usa Hikari o Sakura)</li>
            <li>Cómpralo ANTES de llegar a Japón (más barato)</li>
            <li>Incluye trenes JR urbanos en Tokyo, Osaka, Kyoto</li>
            <li>NO cubre metro privado (necesitas IC card aparte)</li>
          </ul>
        </div>
      </div>
    `;

    // Scroll suave al resultado
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Export
if (typeof window !== 'undefined') {
  window.JRPassUI = JRPassUI;
}
