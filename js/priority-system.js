/**
 * ⭐ PRIORITY SYSTEM
 * ==================
 * Advanced priority management for activities and wishlist
 */

class PrioritySystem {
  constructor() {
    this.initialized = false;
    this.priorities = {
      must: { name: 'Imprescindible', icon: '🔴', color: '#ef4444', level: 1 },
      high: { name: 'Alta Prioridad', icon: '🟠', color: '#f59e0b', level: 2 },
      medium: { name: 'Prioridad Media', icon: '🟡', color: '#eab308', level: 3 },
      low: { name: 'Baja Prioridad', icon: '🟢', color: '#22c55e', level: 4 },
      maybe: { name: 'Si hay tiempo', icon: '⚪', color: '#9ca3af', level: 5 },
      wishlist: { name: 'Lista de deseos', icon: '⭐', color: '#8b5cf6', level: 6 }
    };
  }

  /**
   * Initialize priority system
   */
  async initialize() {
    if (this.initialized) return;

    console.log('⭐ Initializing Priority System...');

    this.initialized = true;
    console.log('✅ Priority System ready');
  }

  /**
   * Show priority manager
   */
  show() {
    const panel = this.createPriorityPanel();
    document.body.appendChild(panel);
    this.loadActivities();
  }

  /**
   * Create priority panel
   */
  createPriorityPanel() {
    const panel = document.createElement('div');
    panel.className = 'priority-panel';
    panel.id = 'priority-panel';

    panel.innerHTML = `
      <div class="priority-overlay" onclick="document.getElementById('priority-panel').remove()"></div>
      <div class="priority-content">
        <!-- Header -->
        <div class="priority-header">
          <div>
            <h2>⭐ Gestor de Prioridades</h2>
            <p class="priority-subtitle">Organiza tus actividades por importancia</p>
          </div>
          <button class="priority-close" onclick="document.getElementById('priority-panel').remove()">✕</button>
        </div>

        <!-- Priority Tabs -->
        <div class="priority-tabs">
          <button class="priority-tab active" data-view="all">
            <span class="tab-icon">📋</span>
            <span class="tab-label">Todas</span>
            <span class="tab-count" id="count-all">0</span>
          </button>
          <button class="priority-tab" data-view="itinerary">
            <span class="tab-icon">🗓️</span>
            <span class="tab-label">Itinerario</span>
            <span class="tab-count" id="count-itinerary">0</span>
          </button>
          <button class="priority-tab" data-view="wishlist">
            <span class="tab-icon">⭐</span>
            <span class="tab-label">Wishlist</span>
            <span class="tab-count" id="count-wishlist">0</span>
          </button>
          <button class="priority-tab" data-view="bucket">
            <span class="tab-icon">🪣</span>
            <span class="tab-label">Bucket List</span>
            <span class="tab-count" id="count-bucket">0</span>
          </button>
        </div>

        <!-- Filter Bar -->
        <div class="priority-filter-bar">
          <div class="priority-filters">
            <select id="priority-filter" class="priority-select">
              <option value="">Todas las prioridades</option>
              ${Object.entries(this.priorities).map(([key, p]) => `
                <option value="${key}">${p.icon} ${p.name}</option>
              `).join('')}
            </select>

            <select id="day-filter" class="priority-select">
              <option value="">Todos los días</option>
            </select>

            <select id="sort-by" class="priority-select">
              <option value="priority">Ordenar por prioridad</option>
              <option value="day">Ordenar por día</option>
              <option value="name">Ordenar por nombre</option>
            </select>
          </div>

          <button class="add-wishlist-btn" id="add-wishlist-btn">
            ➕ Agregar a Wishlist
          </button>
        </div>

        <!-- Activities List -->
        <div class="priority-activities" id="priority-activities">
          <!-- Will be populated dynamically -->
        </div>
      </div>
    `;

    // Setup event listeners
    setTimeout(() => this.setupEventListeners(), 50);

    return panel;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.priority-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.priority-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.loadActivities(tab.dataset.view);
      });
    });

    // Filters
    const priorityFilter = document.getElementById('priority-filter');
    const dayFilter = document.getElementById('day-filter');
    const sortBy = document.getElementById('sort-by');

    if (priorityFilter) {
      priorityFilter.addEventListener('change', () => this.loadActivities());
    }

    if (dayFilter) {
      dayFilter.addEventListener('change', () => this.loadActivities());
    }

    if (sortBy) {
      sortBy.addEventListener('change', () => this.loadActivities());
    }

    // Add to wishlist button
    const addWishlistBtn = document.getElementById('add-wishlist-btn');
    if (addWishlistBtn) {
      addWishlistBtn.addEventListener('click', () => this.showAddWishlistDialog());
    }

    // Populate day filter
    this.populateDayFilter();
  }

  /**
   * Populate day filter options
   */
  populateDayFilter() {
    const itinerary = this.getCurrentItinerary();
    if (!itinerary || !itinerary.days) return;

    const dayFilter = document.getElementById('day-filter');
    if (!dayFilter) return;

    dayFilter.innerHTML = '<option value="">Todos los días</option>';
    itinerary.days.forEach((day, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `Día ${index + 1}${day.city ? ` - ${day.city}` : ''}`;
      dayFilter.appendChild(option);
    });
  }

  /**
   * Load and display activities
   */
  loadActivities(view = 'all') {
    const itinerary = this.getCurrentItinerary();
    const container = document.getElementById('priority-activities');
    if (!container) return;

    // Get all activities with priority
    const activities = this.getAllActivitiesWithPriority(itinerary);

    // Get filters
    const priorityFilter = document.getElementById('priority-filter')?.value || '';
    const dayFilter = document.getElementById('day-filter')?.value || '';
    const sortBy = document.getElementById('sort-by')?.value || 'priority';

    // Filter activities
    let filtered = activities;

    // Filter by view
    if (view === 'itinerary') {
      filtered = filtered.filter(a => a.priority !== 'wishlist' && a.priority !== 'bucket');
    } else if (view === 'wishlist') {
      filtered = filtered.filter(a => a.priority === 'wishlist');
    } else if (view === 'bucket') {
      filtered = filtered.filter(a => a.priority === 'bucket');
    }

    // Filter by priority
    if (priorityFilter) {
      filtered = filtered.filter(a => a.priority === priorityFilter);
    }

    // Filter by day
    if (dayFilter) {
      filtered = filtered.filter(a => a.dayIndex === parseInt(dayFilter));
    }

    // Sort activities
    filtered = this.sortActivities(filtered, sortBy);

    // Update counts
    this.updateCounts(activities);

    // Render activities
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="priority-empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-text">No hay actividades con estas condiciones</div>
        </div>
      `;
      return;
    }

    // Group by priority
    const grouped = this.groupByPriority(filtered);

    container.innerHTML = Object.entries(grouped).map(([priority, items]) => {
      const priorityInfo = this.priorities[priority];
      if (!priorityInfo || items.length === 0) return '';

      return `
        <div class="priority-group">
          <div class="priority-group-header">
            <span class="priority-badge" style="background-color: ${priorityInfo.color}">
              ${priorityInfo.icon} ${priorityInfo.name}
            </span>
            <span class="priority-group-count">${items.length}</span>
          </div>
          <div class="priority-group-items">
            ${items.map(item => this.renderActivityItem(item)).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Setup item event listeners
    this.setupItemEventListeners();
  }

  /**
   * Render single activity item
   */
  renderActivityItem(item) {
    const { activity, dayIndex, priority } = item;
    const priorityInfo = this.priorities[priority];

    return `
      <div class="priority-item" data-day="${dayIndex}" data-activity="${activity.name}">
        <div class="priority-item-main">
          <div class="priority-item-icon" style="color: ${priorityInfo.color}">
            ${priorityInfo.icon}
          </div>
          <div class="priority-item-content">
            <div class="priority-item-title">${activity.name || 'Sin nombre'}</div>
            <div class="priority-item-meta">
              ${dayIndex >= 0 ? `<span class="meta-badge day-badge">Día ${dayIndex + 1}</span>` : ''}
              ${activity.category ? `<span class="meta-badge category-badge">${activity.category}</span>` : ''}
              ${activity.city ? `<span class="meta-badge city-badge">${activity.city}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="priority-item-actions">
          <select class="priority-dropdown" data-current="${priority}">
            ${Object.entries(this.priorities).map(([key, p]) => `
              <option value="${key}" ${priority === key ? 'selected' : ''}>
                ${p.icon} ${p.name}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
    `;
  }

  /**
   * Setup item event listeners
   */
  setupItemEventListeners() {
    document.querySelectorAll('.priority-dropdown').forEach(dropdown => {
      dropdown.addEventListener('change', (e) => {
        const newPriority = e.target.value;
        const item = e.target.closest('.priority-item');
        const dayIndex = parseInt(item.dataset.day);
        const activityName = item.dataset.activity;

        this.updateActivityPriority(dayIndex, activityName, newPriority);
      });
    });
  }

  /**
   * Update activity priority
   */
  updateActivityPriority(dayIndex, activityName, newPriority) {
    const itinerary = this.getCurrentItinerary();
    if (!itinerary || !itinerary.days || dayIndex < 0) return;

    const day = itinerary.days[dayIndex];
    if (!day || !day.activities) return;

    const activity = day.activities.find(a => a.name === activityName);
    if (!activity) return;

    // Update priority
    activity.priority = newPriority;

    // Save to storage
    this.saveItinerary(itinerary);

    // Reload activities
    const activeView = document.querySelector('.priority-tab.active')?.dataset.view || 'all';
    this.loadActivities(activeView);

    // Show success notification
    this.showNotification(`Prioridad actualizada: ${this.priorities[newPriority].name}`);
  }

  /**
   * Get all activities with priority
   */
  getAllActivitiesWithPriority(itinerary) {
    if (!itinerary || !itinerary.days) return [];

    const activities = [];

    itinerary.days.forEach((day, dayIndex) => {
      if (!day.activities) return;

      day.activities.forEach(activity => {
        activities.push({
          activity: {
            ...activity,
            city: day.city
          },
          dayIndex,
          priority: activity.priority || 'medium'
        });
      });
    });

    return activities;
  }

  /**
   * Sort activities
   */
  sortActivities(activities, sortBy) {
    switch (sortBy) {
      case 'priority':
        return activities.sort((a, b) => {
          const aLevel = this.priorities[a.priority]?.level || 999;
          const bLevel = this.priorities[b.priority]?.level || 999;
          return aLevel - bLevel;
        });

      case 'day':
        return activities.sort((a, b) => a.dayIndex - b.dayIndex);

      case 'name':
        return activities.sort((a, b) => {
          const aName = a.activity.name || '';
          const bName = b.activity.name || '';
          return aName.localeCompare(bName);
        });

      default:
        return activities;
    }
  }

  /**
   * Group activities by priority
   */
  groupByPriority(activities) {
    const grouped = {};

    Object.keys(this.priorities).forEach(priority => {
      grouped[priority] = activities.filter(a => a.priority === priority);
    });

    return grouped;
  }

  /**
   * Update counts
   */
  updateCounts(activities) {
    const all = activities.length;
    const itinerary = activities.filter(a => a.priority !== 'wishlist' && a.priority !== 'bucket').length;
    const wishlist = activities.filter(a => a.priority === 'wishlist').length;
    const bucket = activities.filter(a => a.priority === 'bucket').length;

    const updateCount = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    };

    updateCount('count-all', all);
    updateCount('count-itinerary', itinerary);
    updateCount('count-wishlist', wishlist);
    updateCount('count-bucket', bucket);
  }

  /**
   * Show add to wishlist dialog
   */
  showAddWishlistDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'wishlist-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay" onclick="this.parentElement.remove()"></div>
      <div class="dialog-content">
        <h3>⭐ Agregar a Wishlist</h3>
        <input type="text" id="wishlist-name" placeholder="Nombre del lugar o actividad" class="dialog-input">
        <textarea id="wishlist-notes" placeholder="Notas (opcional)" class="dialog-textarea"></textarea>
        <div class="dialog-actions">
          <button class="dialog-btn cancel" onclick="this.closest('.wishlist-dialog').remove()">Cancelar</button>
          <button class="dialog-btn confirm" id="confirm-wishlist">Agregar</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Focus input
    setTimeout(() => document.getElementById('wishlist-name')?.focus(), 100);

    // Confirm button
    const confirmBtn = document.getElementById('confirm-wishlist');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const name = document.getElementById('wishlist-name')?.value || '';
        const notes = document.getElementById('wishlist-notes')?.value || '';

        if (!name) {
          alert('Por favor ingresa un nombre');
          return;
        }

        this.addToWishlist(name, notes);
        dialog.remove();
      });
    }
  }

  /**
   * Add item to wishlist
   */
  addToWishlist(name, notes) {
    const itinerary = this.getCurrentItinerary();
    if (!itinerary) return;

    // Create wishlist day if it doesn't exist
    if (!itinerary.wishlist) {
      itinerary.wishlist = [];
    }

    // Add to wishlist
    itinerary.wishlist.push({
      name,
      description: notes,
      priority: 'wishlist',
      addedAt: Date.now()
    });

    // Save
    this.saveItinerary(itinerary);

    // Reload
    this.loadActivities('wishlist');

    // Notification
    this.showNotification(`⭐ "${name}" agregado a wishlist`);
  }

  /**
   * Get current itinerary
   */
  getCurrentItinerary() {
    if (window.currentItinerary && window.currentItinerary.days) {
      return window.currentItinerary;
    }
    if (window.TripsManager && window.TripsManager.currentTrip) {
      return window.TripsManager.currentTrip;
    }
    return null;
  }

  /**
   * Save itinerary
   */
  saveItinerary(itinerary) {
    if (window.TripsManager && window.TripsManager.saveCurrentTrip) {
      window.TripsManager.saveCurrentTrip();
    }

    // Also update localStorage backup
    localStorage.setItem('currentItinerary', JSON.stringify(itinerary));
  }

  /**
   * Show notification
   */
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'priority-notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.PrioritySystem = new PrioritySystem();

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.PrioritySystem.initialize();
    });
  } else {
    window.PrioritySystem.initialize();
  }
}
