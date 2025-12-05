/* ========================================
   RAMEN PASSPORT UI
   ======================================== */

const RamenPassportUI = {
  passport: null,
  currentRating: 0,

  init(containerId) {
    this.passport = new window.RamenPassport();
    this.render(containerId);
  },

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stats = this.passport.obtenerEstadisticas();

    container.innerHTML = `
      <div class="ramen-passport-container">
        <div style="text-align: center; margin-bottom: 30px;">
          <h3 style="font-size: 2rem; font-weight: 800; color: #f59e0b; margin-bottom: 12px;">
            🍜 Ramen Passport
          </h3>
          <p style="color: #6b7280;">
            Registra todos los ramen que pruebes en Japón y conviértete en un ramen master
          </p>
        </div>

        <div class="ramen-stats">
          <div class="stat-card">
            <div class="stat-number">${stats.total}</div>
            <div class="stat-label">Ramen Probados</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.tiposVisitados}</div>
            <div class="stat-label">Tipos Diferentes</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.ciudadesVisitadas}</div>
            <div class="stat-label">Ciudades</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.ratingPromedio}</div>
            <div class="stat-label">Rating Promedio</div>
          </div>
        </div>

        <div class="add-ramen-form">
          <h4 style="font-weight: 700; margin-bottom: 16px; color: #f59e0b;">➕ Agregar Nuevo Ramen</h4>

          <div class="form-grid">
            <div class="form-group">
              <label>Nombre del Restaurante *</label>
              <input type="text" id="ramenNombre" placeholder="Ej: Ichiran Shibuya" required>
            </div>

            <div class="form-group">
              <label>Ciudad</label>
              <input type="text" id="ramenCiudad" placeholder="Tokyo, Osaka, etc.">
            </div>

            <div class="form-group">
              <label>Tipo de Ramen *</label>
              <select id="ramenTipo">
                ${window.RamenData.tipos.map(t => `
                  <option value="${t.id}">${t.nombre}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>Precio (¥)</label>
              <input type="number" id="ramenPrecio" placeholder="800" min="0">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label>Tu Rating</label>
            <div class="rating-stars" id="ratingStars">
              <span data-rating="1">☆</span>
              <span data-rating="2">☆</span>
              <span data-rating="3">☆</span>
              <span data-rating="4">☆</span>
              <span data-rating="5">☆</span>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label>Notas / Comentarios</label>
            <textarea id="ramenNotas" rows="3" placeholder="¿Cómo estuvo? Toppings favoritos, etc."></textarea>
          </div>

          <button class="btn-submit-ramen" onclick="RamenPassportUI.agregarRamen()">
            🍜 Guardar Ramen
          </button>
        </div>

        <div id="ramenList"></div>
      </div>
    `;

    this.setupRatingStars();
    this.renderLista();
  },

  setupRatingStars() {
    const stars = document.querySelectorAll('#ratingStars span');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        this.currentRating = rating;
        this.updateStars(rating);
      });
    });
  },

  updateStars(rating) {
    const stars = document.querySelectorAll('#ratingStars span');
    stars.forEach(star => {
      const starRating = parseInt(star.dataset.rating);
      if (starRating <= rating) {
        star.textContent = '★';
        star.classList.add('active');
      } else {
        star.textContent = '☆';
        star.classList.remove('active');
      }
    });
  },

  agregarRamen() {
    const nombre = document.getElementById('ramenNombre').value.trim();
    const ciudad = document.getElementById('ramenCiudad').value.trim();
    const tipo = document.getElementById('ramenTipo').value;
    const precio = parseInt(document.getElementById('ramenPrecio').value) || 0;
    const notas = document.getElementById('ramenNotas').value.trim();

    if (!nombre) {
      alert('Por favor ingresa el nombre del restaurante');
      return;
    }

    const visita = {
      nombre,
      ciudad: ciudad || 'N/A',
      tipo,
      rating: this.currentRating,
      precio,
      notas
    };

    this.passport.agregarVisita(visita);

    // Limpiar formulario
    document.getElementById('ramenNombre').value = '';
    document.getElementById('ramenCiudad').value = '';
    document.getElementById('ramenPrecio').value = '';
    document.getElementById('ramenNotas').value = '';
    this.currentRating = 0;
    this.updateStars(0);

    // Re-render
    const stats = this.passport.obtenerEstadisticas();
    document.querySelectorAll('.stat-number')[0].textContent = stats.total;
    document.querySelectorAll('.stat-number')[1].textContent = stats.tiposVisitados;
    document.querySelectorAll('.stat-number')[2].textContent = stats.ciudadesVisitadas;
    document.querySelectorAll('.stat-number')[3].textContent = stats.ratingPromedio;

    this.renderLista();
  },

  renderLista() {
    const container = document.getElementById('ramenList');
    if (!container) return;

    const visitas = this.passport.visitas;

    if (visitas.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🍜</div>
          <h4 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 8px;">
            No has registrado ningún ramen aún
          </h4>
          <p>¡Empieza tu aventura ramenera registrando tu primer bowl!</p>
        </div>
      `;
      return;
    }

    // Mostrar más recientes primero
    const visitasOrdenadas = [...visitas].reverse();

    container.innerHTML = `
      <h4 style="font-weight: 700; margin: 30px 0 20px 0; font-size: 1.3rem;">
        📋 Tu Colección (${visitas.length} ramen)
      </h4>
      <div class="ramen-list">
        ${visitasOrdenadas.map(v => this.renderRamenCard(v)).join('')}
      </div>
    `;
  },

  renderRamenCard(visita) {
    const tipo = window.RamenData.tipos.find(t => t.id === visita.tipo);
    const stars = '★'.repeat(visita.rating) + '☆'.repeat(5 - visita.rating);
    const fecha = new Date(visita.fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return `
      <div class="ramen-card">
        <div class="ramen-card-header">
          <div class="ramen-nombre">${visita.nombre}</div>
          <div class="ramen-meta">
            <span>${visita.ciudad}</span>
            <span>${fecha}</span>
          </div>
        </div>
        <div class="ramen-card-body">
          <div class="ramen-rating">${stars}</div>
          <div class="ramen-info">
            <strong>${tipo ? tipo.icono : '🍜'} ${tipo ? tipo.nombre : visita.tipo}</strong>
          </div>
          ${visita.precio > 0 ? `<div class="ramen-info">💴 ¥${visita.precio.toLocaleString()}</div>` : ''}
          ${visita.notas ? `<div class="ramen-notas">"${visita.notas}"</div>` : ''}
          <button class="btn-delete-ramen" onclick="RamenPassportUI.eliminarRamen(${visita.id})">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    `;
  },

  eliminarRamen(id) {
    if (confirm('¿Seguro que quieres eliminar este ramen de tu passport?')) {
      this.passport.eliminarVisita(id);

      // Re-render stats
      const stats = this.passport.obtenerEstadisticas();
      document.querySelectorAll('.stat-number')[0].textContent = stats.total;
      document.querySelectorAll('.stat-number')[1].textContent = stats.tiposVisitados;
      document.querySelectorAll('.stat-number')[2].textContent = stats.ciudadesVisitadas;
      document.querySelectorAll('.stat-number')[3].textContent = stats.ratingPromedio;

      this.renderLista();
    }
  }
};

// Export
if (typeof window !== 'undefined') {
  window.RamenPassportUI = RamenPassportUI;
}
