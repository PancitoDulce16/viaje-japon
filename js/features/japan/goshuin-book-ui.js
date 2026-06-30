/* ========================================
   GOSHUIN BOOK UI
   ======================================== */

const GoshuinBookUI = {
  book: null,

  init(containerId) {
    this.book = new window.GoshuinBook();
    this.render(containerId);
  },

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stats = this.book.obtenerEstadisticas();

    container.innerHTML = `
      <div class="goshuin-book-container">
        <div style="text-align: center; margin-bottom: 30px;">
          <h3 style="font-size: 2rem; font-weight: 800; color: #8b5cf6; margin-bottom: 12px;">
            ⛩️ Goshuin Book (御朱印帳)
          </h3>
          <p style="color: #6b7280; line-height: 1.6;">
            El goshuin (御朱印) es un sello caligráfico que se recibe en templos y santuarios.<br>
            Colecciona digitalmente todos los sellos que obtengas durante tu viaje.
          </p>
        </div>

        <div class="goshuin-stats">
          <div class="goshuin-stat-card">
            <div class="goshuin-stat-number">${stats.total}</div>
            <div class="goshuin-stat-label">Sellos Colectados</div>
          </div>
          <div class="goshuin-stat-card">
            <div class="goshuin-stat-number">${stats.templos}</div>
            <div class="goshuin-stat-label">Templos</div>
          </div>
          <div class="goshuin-stat-card">
            <div class="goshuin-stat-number">${stats.santuarios}</div>
            <div class="goshuin-stat-label">Santuarios</div>
          </div>
          <div class="goshuin-stat-card">
            <div class="goshuin-stat-number">${stats.ciudadesVisitadas}</div>
            <div class="goshuin-stat-label">Ciudades</div>
          </div>
          <div class="goshuin-stat-card">
            <div class="goshuin-stat-number">¥${stats.costoTotal.toLocaleString()}</div>
            <div class="goshuin-stat-label">Gasto Total</div>
          </div>
        </div>

        ${this.renderTemplosSugeridos()}

        <div class="add-goshuin-form">
          <h4 style="font-weight: 700; margin-bottom: 16px; color: #8b5cf6;">➕ Registrar Nuevo Goshuin</h4>

          <div class="goshuin-form-grid">
            <div class="goshuin-form-group">
              <label>Nombre del Templo/Santuario *</label>
              <input type="text" id="goshuinNombre" placeholder="Ej: Sensoji" required>
            </div>

            <div class="goshuin-form-group">
              <label>Ciudad</label>
              <input type="text" id="goshuinCiudad" placeholder="Tokyo, Kyoto, etc.">
            </div>

            <div class="goshuin-form-group">
              <label>Tipo</label>
              <select id="goshuinTipo">
                <option value="Templo Budista">🏯 Templo Budista</option>
                <option value="Santuario Shintoista">⛩️ Santuario Shintoista</option>
              </select>
            </div>

            <div class="goshuin-form-group">
              <label>Precio (¥)</label>
              <input type="number" id="goshuinPrecio" placeholder="300" min="0" value="300">
            </div>
          </div>

          <div class="goshuin-form-group" style="margin-bottom: 16px;">
            <label>Notas / Experiencia</label>
            <textarea id="goshuinNotas" rows="2" placeholder="¿Qué te pareció el lugar?"></textarea>
          </div>

          <button class="btn-submit-goshuin" onclick="GoshuinBookUI.agregarGoshuin()">
            ⛩️ Guardar Goshuin
          </button>
        </div>

        <div id="goshuinList"></div>
      </div>
    `;

    this.renderLista();
  },

  renderTemplosSugeridos() {
    return `
      <div class="templos-sugeridos">
        <h5>💡 Templos y Santuarios Famosos para Visitar:</h5>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px;">
          ${window.GoshuinData.templosFamosos.slice(0, 6).map(templo => `
            <div class="templo-sugerido" onclick="GoshuinBookUI.llenarDesdeTemplo('${templo.nombre}', '${templo.ciudad}', '${templo.tipo}', ${templo.precio})">
              <span><strong>${templo.nombre}</strong> - ${templo.ciudad}</span>
              <span style="font-size: 0.75rem; opacity: 0.7;">Click para agregar</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  llenarDesdeTemplo(nombre, ciudad, tipo, precio) {
    document.getElementById('goshuinNombre').value = nombre;
    document.getElementById('goshuinCiudad').value = ciudad;
    document.getElementById('goshuinTipo').value = tipo;
    document.getElementById('goshuinPrecio').value = precio;

    // Scroll al formulario
    document.querySelector('.add-goshuin-form').scrollIntoView({ behavior: 'smooth' });
  },

  agregarGoshuin() {
    const nombre = document.getElementById('goshuinNombre').value.trim();
    const ciudad = document.getElementById('goshuinCiudad').value.trim();
    const tipo = document.getElementById('goshuinTipo').value;
    const precio = parseInt(document.getElementById('goshuinPrecio').value) || 300;
    const notas = document.getElementById('goshuinNotas').value.trim();

    if (!nombre) {
      alert('Por favor ingresa el nombre del templo/santuario');
      return;
    }

    const sello = {
      nombreTemplo: nombre,
      ciudad: ciudad || 'N/A',
      tipo,
      precio,
      notas
    };

    this.book.agregar(sello);

    // Limpiar formulario
    document.getElementById('goshuinNombre').value = '';
    document.getElementById('goshuinCiudad').value = '';
    document.getElementById('goshuinPrecio').value = '300';
    document.getElementById('goshuinNotas').value = '';

    // Re-render stats
    const stats = this.book.obtenerEstadisticas();
    const statNumbers = document.querySelectorAll('.goshuin-stat-number');
    statNumbers[0].textContent = stats.total;
    statNumbers[1].textContent = stats.templos;
    statNumbers[2].textContent = stats.santuarios;
    statNumbers[3].textContent = stats.ciudadesVisitadas;
    statNumbers[4].textContent = `¥${stats.costoTotal.toLocaleString()}`;

    this.renderLista();
  },

  renderLista() {
    const container = document.getElementById('goshuinList');
    if (!container) return;

    const goshuin = this.book.goshuin;

    if (goshuin.length === 0) {
      container.innerHTML = `
        <div class="goshuin-empty-state">
          <div class="goshuin-empty-icon">⛩️</div>
          <h4 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 8px;">
            Tu libro está vacío
          </h4>
          <p>¡Empieza a coleccionar goshuin en templos y santuarios!</p>
          <p style="margin-top: 12px; font-size: 0.9rem; color: #9ca3af;">
            💡 Tip: El precio típico de un goshuin es ¥300-500
          </p>
        </div>
      `;
      return;
    }

    // Mostrar más recientes primero
    const goshuinOrdenados = [...goshuin].reverse();

    container.innerHTML = `
      <h4 style="font-weight: 700; margin: 30px 0 20px 0; font-size: 1.3rem;">
        📚 Tu Colección (${goshuin.length} sellos)
      </h4>
      <div class="goshuin-list">
        ${goshuinOrdenados.map(g => this.renderGoshuinCard(g)).join('')}
      </div>
    `;
  },

  renderGoshuinCard(goshuin) {
    const fecha = new Date(goshuin.fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const tipoClass = goshuin.tipo.includes('Templo') ? 'templo' : 'santuario';
    const icono = goshuin.tipo.includes('Templo') ? '🏯' : '⛩️';

    return `
      <div class="goshuin-card">
        <div class="goshuin-card-header">
          <div class="goshuin-nombre">${icono} ${goshuin.nombreTemplo}</div>
          <div class="goshuin-ciudad">📍 ${goshuin.ciudad}</div>
        </div>
        <div class="goshuin-card-body">
          <div class="goshuin-tipo ${tipoClass}">${goshuin.tipo}</div>
          <div class="goshuin-info">
            <span>💴</span>
            <span>¥${goshuin.precio.toLocaleString()}</span>
          </div>
          <div class="goshuin-fecha">📅 ${fecha}</div>
          ${goshuin.notas ? `<div class="goshuin-notas">"${goshuin.notas}"</div>` : ''}
          <button class="btn-delete-goshuin" onclick="GoshuinBookUI.eliminarGoshuin(${goshuin.id})">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    `;
  },

  eliminarGoshuin(id) {
    if (confirm('¿Seguro que quieres eliminar este goshuin?')) {
      this.book.eliminar(id);

      // Re-render stats
      const stats = this.book.obtenerEstadisticas();
      const statNumbers = document.querySelectorAll('.goshuin-stat-number');
      statNumbers[0].textContent = stats.total;
      statNumbers[1].textContent = stats.templos;
      statNumbers[2].textContent = stats.santuarios;
      statNumbers[3].textContent = stats.ciudadesVisitadas;
      statNumbers[4].textContent = `¥${stats.costoTotal.toLocaleString()}`;

      this.renderLista();
    }
  }
};

// Export
if (typeof window !== 'undefined') {
  window.GoshuinBookUI = GoshuinBookUI;
}
