/**
 * 📅 ITINERARY VISUAL TIMELINE
 * ============================
 * Beautiful visual timeline view for itinerary with drag & drop
 */

export class ItineraryVisualTimeline {
  constructor() {
    this.initialized = false;
    this.currentView = 'timeline'; // timeline, cards, compact, map
    this.draggedItem = null;
    this.itinerary = null;
  }

  /**
   * Initialize timeline
   */
  async initialize(itinerary) {
    this.itinerary = itinerary;
    this.initialized = true;
    console.log('📅 Visual Timeline initialized');
  }

  /**
   * Render timeline view
   */
  render(container, itinerary) {
    if (!container) return;

    this.itinerary = itinerary;

    container.innerHTML = `
      <div class="visual-timeline-wrapper">
        <!-- View Switcher -->
        <div class="timeline-view-switcher">
          <button class="view-btn active" data-view="timeline">
            <span class="view-icon">📅</span>
            <span class="view-label">Timeline</span>
          </button>
          <button class="view-btn" data-view="cards">
            <span class="view-icon">🎴</span>
            <span class="view-label">Cards</span>
          </button>
          <button class="view-btn" data-view="compact">
            <span class="view-icon">📋</span>
            <span class="view-label">Compacto</span>
          </button>
          <button class="view-btn" data-view="map">
            <span class="view-icon">🗺️</span>
            <span class="view-label">Mapa</span>
          </button>
        </div>

        <!-- Timeline Content -->
        <div class="timeline-content" id="timeline-content">
          ${this.renderTimelineContent(itinerary)}
        </div>
      </div>
    `;

    this.setupEventListeners(container);
    this.initializeDragDrop();
  }

  /**
   * Render timeline content
   */
  renderTimelineContent(itinerary) {
    if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
      return this.renderEmptyState();
    }

    if (this.currentView === 'timeline') {
      return this.renderTimelineView(itinerary);
    } else if (this.currentView === 'cards') {
      return this.renderCardsView(itinerary);
    } else if (this.currentView === 'compact') {
      return this.renderCompactView(itinerary);
    } else if (this.currentView === 'map') {
      return this.renderMapView(itinerary);
    }
  }

  /**
   * Render timeline view
   */
  renderTimelineView(itinerary) {
    return `
      <div class="timeline-view">
        ${itinerary.days.map((day, dayIndex) => this.renderDayTimeline(day, dayIndex)).join('')}
      </div>
    `;
  }

  /**
   * Render single day in timeline
   */
  renderDayTimeline(day, dayIndex) {
    const activities = day.activities || [];
    const dayNumber = dayIndex + 1;
    const totalDuration = this.calculateDayDuration(activities);
    const intensity = this.calculateDayIntensity(activities);

    return `
      <div class="timeline-day" data-day="${dayIndex}">
        <!-- Day Header -->
        <div class="timeline-day-header">
          <div class="day-info">
            <div class="day-number">Día ${dayNumber}</div>
            ${day.city ? `<div class="day-city">${day.city}</div>` : ''}
            ${day.date ? `<div class="day-date">${this.formatDate(day.date)}</div>` : ''}
          </div>
          <div class="day-stats">
            <div class="day-stat">
              <span class="stat-icon">🎯</span>
              <span class="stat-value">${activities.length}</span>
              <span class="stat-label">actividades</span>
            </div>
            <div class="day-stat">
              <span class="stat-icon">⏱️</span>
              <span class="stat-value">${totalDuration}h</span>
              <span class="stat-label">duración</span>
            </div>
            <div class="day-stat ${this.getIntensityClass(intensity)}">
              <span class="stat-icon">${this.getIntensityIcon(intensity)}</span>
              <span class="stat-label">${this.getIntensityLabel(intensity)}</span>
            </div>
          </div>
          <div class="day-actions">
            <button class="day-action-btn" data-action="add" data-day="${dayIndex}" title="Agregar actividad">
              ➕
            </button>
            <button class="day-action-btn" data-action="optimize" data-day="${dayIndex}" title="Optimizar ruta">
              🗺️
            </button>
            <button class="day-action-btn" data-action="balance" data-day="${dayIndex}" title="Balancear día">
              ⚖️
            </button>
          </div>
        </div>

        <!-- Timeline Track -->
        <div class="timeline-track">
          <div class="timeline-line"></div>

          <!-- Activities -->
          <div class="timeline-activities" data-day="${dayIndex}">
            ${activities.length > 0
              ? activities.map((activity, actIndex) =>
                  this.renderActivityInTimeline(activity, dayIndex, actIndex)
                ).join('')
              : `<div class="timeline-empty">Sin actividades. Haz clic en ➕ para agregar</div>`
            }
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render activity in timeline
   */
  renderActivityInTimeline(activity, dayIndex, actIndex) {
    const time = activity.time || '09:00';
    const duration = activity.duration || 1;
    const category = activity.category || 'other';

    return `
      <div class="timeline-activity"
           data-day="${dayIndex}"
           data-index="${actIndex}"
           draggable="true">
        <div class="activity-time">${time}</div>
        <div class="activity-marker ${category}">
          <div class="marker-icon">${this.getCategoryIcon(category)}</div>
          <div class="marker-line"></div>
        </div>
        <div class="activity-card">
          <div class="activity-header">
            <div class="activity-title">${activity.name || 'Sin nombre'}</div>
            <div class="activity-category-badge ${category}">
              ${this.getCategoryIcon(category)} ${this.getCategoryLabel(category)}
            </div>
          </div>
          ${activity.location ? `
            <div class="activity-location">
              📍 ${activity.location}
            </div>
          ` : ''}
          ${activity.description ? `
            <div class="activity-description">${activity.description}</div>
          ` : ''}
          <div class="activity-meta">
            <span class="meta-item">
              <span class="meta-icon">⏱️</span>
              <span class="meta-text">${duration}h</span>
            </span>
            ${activity.cost ? `
              <span class="meta-item">
                <span class="meta-icon">💰</span>
                <span class="meta-text">¥${activity.cost.toLocaleString()}</span>
              </span>
            ` : ''}
            ${activity.transportation ? `
              <span class="meta-item">
                <span class="meta-icon">🚇</span>
                <span class="meta-text">${activity.transportation}</span>
              </span>
            ` : ''}
          </div>
          <div class="activity-actions">
            <button class="activity-action-btn" data-action="edit" title="Editar">
              ✏️
            </button>
            <button class="activity-action-btn" data-action="delete" title="Eliminar">
              🗑️
            </button>
            <button class="activity-action-btn" data-action="move" title="Mover">
              ↕️
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render cards view
   */
  renderCardsView(itinerary) {
    return `
      <div class="cards-view">
        ${itinerary.days.map((day, dayIndex) => `
          <div class="day-card" data-day="${dayIndex}">
            <div class="day-card-header">
              <h3>Día ${dayIndex + 1}</h3>
              ${day.city ? `<span class="city-tag">${day.city}</span>` : ''}
            </div>
            <div class="activities-grid">
              ${(day.activities || []).map((act, i) => `
                <div class="activity-mini-card" data-day="${dayIndex}" data-index="${i}">
                  <div class="mini-icon">${this.getCategoryIcon(act.category)}</div>
                  <div class="mini-title">${act.name}</div>
                  <div class="mini-time">${act.time || '--:--'}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render compact view
   */
  renderCompactView(itinerary) {
    return `
      <div class="compact-view">
        <table class="compact-table">
          <thead>
            <tr>
              <th>Día</th>
              <th>Ciudad</th>
              <th>Actividades</th>
              <th>Duración</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            ${itinerary.days.map((day, i) => {
              const acts = day.activities || [];
              const totalCost = acts.reduce((sum, a) => sum + (a.cost || 0), 0);
              const totalDuration = this.calculateDayDuration(acts);

              return `
                <tr>
                  <td><strong>Día ${i + 1}</strong></td>
                  <td>${day.city || '-'}</td>
                  <td>${acts.length} actividades</td>
                  <td>${totalDuration}h</td>
                  <td>¥${totalCost.toLocaleString()}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Render map view
   */
  renderMapView(itinerary) {
    return `
      <div class="map-view">
        <div class="map-container" id="itinerary-map">
          <div class="map-placeholder">
            🗺️ Mapa interactivo (requiere integración con Leaflet o Google Maps)
          </div>
        </div>
        <div class="map-sidebar">
          <h3>Ubicaciones</h3>
          <div class="locations-list">
            ${itinerary.days.map((day, dayIndex) =>
              (day.activities || [])
                .filter(act => act.location)
                .map(act => `
                  <div class="location-item">
                    <div class="location-marker">${this.getCategoryIcon(act.category)}</div>
                    <div class="location-info">
                      <div class="location-name">${act.name}</div>
                      <div class="location-address">${act.location}</div>
                    </div>
                  </div>
                `).join('')
            ).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render empty state
   */
  renderEmptyState() {
    return `
      <div class="timeline-empty-state">
        <div class="empty-icon">📅</div>
        <h3>No hay itinerario aún</h3>
        <p>Crea tu primer itinerario para verlo aquí</p>
        <button class="btn-create-itinerary">Crear Itinerario</button>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners(container) {
    // View switcher
    container.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = btn.dataset.view;
        this.switchView(view, container);
      });
    });

    // Day actions
    container.querySelectorAll('.day-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        const day = parseInt(btn.dataset.day);
        this.handleDayAction(action, day);
      });
    });

    // Activity actions
    container.querySelectorAll('.activity-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const card = btn.closest('.timeline-activity');
        const day = parseInt(card.dataset.day);
        const index = parseInt(card.dataset.index);
        this.handleActivityAction(action, day, index);
      });
    });
  }

  /**
   * Switch view
   */
  switchView(view, container) {
    this.currentView = view;

    // Update active button
    container.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Re-render content
    const content = container.querySelector('#timeline-content');
    if (content) {
      content.innerHTML = this.renderTimelineContent(this.itinerary);
      this.setupEventListeners(container);
      if (view === 'timeline') {
        this.initializeDragDrop();
      }
    }
  }

  /**
   * Handle day action
   */
  handleDayAction(action, dayIndex) {
    console.log('Day action:', action, dayIndex);

    switch (action) {
      case 'add':
        this.addActivity(dayIndex);
        break;
      case 'optimize':
        this.optimizeDay(dayIndex);
        break;
      case 'balance':
        this.balanceDay(dayIndex);
        break;
    }
  }

  /**
   * Handle activity action
   */
  handleActivityAction(action, dayIndex, activityIndex) {
    console.log('Activity action:', action, dayIndex, activityIndex);

    switch (action) {
      case 'edit':
        this.editActivity(dayIndex, activityIndex);
        break;
      case 'delete':
        this.deleteActivity(dayIndex, activityIndex);
        break;
      case 'move':
        this.moveActivity(dayIndex, activityIndex);
        break;
    }
  }

  /**
   * Initialize drag and drop
   */
  initializeDragDrop() {
    const activities = document.querySelectorAll('.timeline-activity');

    activities.forEach(activity => {
      activity.addEventListener('dragstart', (e) => {
        this.draggedItem = {
          day: parseInt(activity.dataset.day),
          index: parseInt(activity.dataset.index)
        };
        activity.classList.add('dragging');
      });

      activity.addEventListener('dragend', (e) => {
        activity.classList.remove('dragging');
        this.draggedItem = null;
      });
    });

    // Drop zones
    document.querySelectorAll('.timeline-activities').forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', (e) => {
        zone.classList.remove('drag-over');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');

        if (this.draggedItem) {
          const targetDay = parseInt(zone.dataset.day);
          this.moveActivityToDay(
            this.draggedItem.day,
            this.draggedItem.index,
            targetDay
          );
        }
      });
    });
  }

  /**
   * Move activity to different day
   */
  moveActivityToDay(fromDay, fromIndex, toDay) {
    if (!this.itinerary) return;

    const activity = this.itinerary.days[fromDay].activities[fromIndex];

    // Remove from source
    this.itinerary.days[fromDay].activities.splice(fromIndex, 1);

    // Add to target
    if (!this.itinerary.days[toDay].activities) {
      this.itinerary.days[toDay].activities = [];
    }
    this.itinerary.days[toDay].activities.push(activity);

    // Trigger save
    this.triggerSave();
  }

  /**
   * Helper methods
   */
  calculateDayDuration(activities) {
    return activities.reduce((sum, act) => sum + (act.duration || 1), 0);
  }

  calculateDayIntensity(activities) {
    const count = activities.length;
    if (count <= 2) return 'relaxed';
    if (count <= 4) return 'moderate';
    if (count <= 6) return 'busy';
    return 'intense';
  }

  getIntensityClass(intensity) {
    return `intensity-${intensity}`;
  }

  getIntensityIcon(intensity) {
    const icons = {
      relaxed: '😌',
      moderate: '🙂',
      busy: '😅',
      intense: '🔥'
    };
    return icons[intensity] || '🙂';
  }

  getIntensityLabel(intensity) {
    const labels = {
      relaxed: 'Relajado',
      moderate: 'Moderado',
      busy: 'Ocupado',
      intense: 'Intenso'
    };
    return labels[intensity] || 'Moderado';
  }

  getCategoryIcon(category) {
    const icons = {
      temple: '⛩️',
      food: '🍜',
      shopping: '🛍️',
      nature: '🌸',
      museum: '🏛️',
      entertainment: '🎮',
      transport: '🚇',
      hotel: '🏨',
      other: '📍'
    };
    return icons[category?.toLowerCase()] || '📍';
  }

  getCategoryLabel(category) {
    const labels = {
      temple: 'Templo',
      food: 'Comida',
      shopping: 'Compras',
      nature: 'Naturaleza',
      museum: 'Museo',
      entertainment: 'Entretenimiento',
      transport: 'Transporte',
      hotel: 'Alojamiento',
      other: 'Otro'
    };
    return labels[category?.toLowerCase()] || 'Otro';
  }

  formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  /**
   * Trigger save callback
   */
  triggerSave() {
    if (window.saveItinerary) {
      window.saveItinerary(this.itinerary);
    }
  }

  // Placeholder methods for actions
  addActivity(dayIndex) {
    console.log('Add activity to day', dayIndex);
  }

  optimizeDay(dayIndex) {
    console.log('Optimize day', dayIndex);
  }

  balanceDay(dayIndex) {
    console.log('Balance day', dayIndex);
  }

  editActivity(dayIndex, activityIndex) {
    console.log('Edit activity', dayIndex, activityIndex);
  }

  deleteActivity(dayIndex, activityIndex) {
    if (confirm('¿Eliminar esta actividad?')) {
      this.itinerary.days[dayIndex].activities.splice(activityIndex, 1);
      this.triggerSave();
    }
  }

  moveActivity(dayIndex, activityIndex) {
    console.log('Move activity', dayIndex, activityIndex);
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.ItineraryVisualTimeline = new ItineraryVisualTimeline();
}
