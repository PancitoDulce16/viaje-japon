/* ========================================
   HORARIOS UI - Control de Horarios
   ======================================== */

const HorariosUI = {
  selectedDate: new Date(),

  openModal() {
    const modal = document.getElementById('horariosModal');
    if (!modal) {
      this.createModal();
    }
    document.getElementById('horariosModal').classList.add('active');
    this.renderHorarios();
  },

  closeModal() {
    document.getElementById('horariosModal').classList.remove('active');
  },

  createModal() {
    // Formatear fecha para input type="date"
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const modalHTML = `
      <div id="horariosModal" class="horarios-modal">
        <div class="horarios-modal-content">
          <div class="horarios-modal-header">
            <h2>🕐 Control de Horarios</h2>
            <button class="horarios-close-btn" onclick="HorariosUI.closeModal()">×</button>
          </div>

          <div class="fecha-selector">
            <label for="horariosDatePicker">📅 Selecciona una fecha para ver advertencias:</label>
            <input
              type="date"
              id="horariosDatePicker"
              value="${dateStr}"
              onchange="HorariosUI.handleDateChange(this.value)"
            />
          </div>

          <div id="advertenciasFecha"></div>

          <h3 style="margin: 24px 0 16px 0; font-size: 1.3rem; font-weight: 700; color: #9333ea;">
            📍 Horarios Típicos en Japón
          </h3>

          <div id="horariosGrid" class="horarios-grid"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Cerrar modal al hacer click fuera
    document.getElementById('horariosModal').addEventListener('click', (e) => {
      if (e.target.id === 'horariosModal') {
        this.closeModal();
      }
    });
  },

  handleDateChange(dateStr) {
    this.selectedDate = new Date(dateStr + 'T12:00:00');
    this.renderAdvertencias();
  },

  renderAdvertencias() {
    const container = document.getElementById('advertenciasFecha');
    if (!container) return;

    const advertencias = window.HorariosSystem.obtenerAdvertenciasFecha(this.selectedDate);

    if (advertencias.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #6b7280;">
          <div style="font-size: 3rem; margin-bottom: 10px;">✅</div>
          <p>No hay advertencias especiales para esta fecha</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="advertencias-fecha">
        ${advertencias.map(adv => `
          <div class="advertencia-card ${adv.tipo}">
            <div class="advertencia-header">
              <div class="advertencia-icono">${adv.icono}</div>
              <h4 class="advertencia-titulo">${adv.titulo}</h4>
            </div>
            <p class="advertencia-mensaje">${adv.mensaje}</p>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderHorarios() {
    const grid = document.getElementById('horariosGrid');
    if (!grid) return;

    const horarios = window.HorariosSystem.horarios;

    grid.innerHTML = Object.keys(horarios).map(key => {
      const horario = horarios[key];
      const status = window.HorariosSystem.estaAbierto(key);

      let horarioDisplay = '';
      let statusClass = '';
      let statusText = '';

      if (horario.horario) {
        horarioDisplay = horario.horario;
        statusClass = 'abierto';
        statusText = '🟢 Abierto 24/7';
      } else if (horario.desayuno) {
        horarioDisplay = `🌅 ${horario.desayuno}<br>🍱 ${horario.almuerzo}<br>🌙 ${horario.cena}`;
      } else {
        horarioDisplay = `${horario.apertura} - ${horario.cierre}`;

        if (status.abierto === true) {
          statusClass = 'abierto';
          statusText = `🟢 ${status.mensaje}`;
        } else if (status.abierto === false) {
          statusClass = 'cerrado';
          statusText = `🔴 ${status.mensaje}`;
        }
      }

      if (horario.diaDescanso) {
        statusText += `<br><small>Cerrado: ${horario.diaDescanso}</small>`;
      }

      return `
        <div class="horario-card">
          <div class="horario-card-header">
            <div class="horario-icono">${horario.icono}</div>
            <h4 class="horario-nombre">${horario.nombre}</h4>
          </div>
          <div class="horario-info">
            <div class="horario-time">${horarioDisplay}</div>
            ${statusText ? `<div class="horario-status ${statusClass}">${statusText}</div>` : ''}
          </div>
          ${horario.notas ? `<div class="horario-notas">💡 ${horario.notas}</div>` : ''}
        </div>
      `;
    }).join('');

    // Renderizar advertencias para la fecha seleccionada
    this.renderAdvertencias();
  }
};

// Export para uso global
if (typeof window !== 'undefined') {
  window.HorariosUI = HorariosUI;
}
