/**
 * 🎯 ENHANCED DASHBOARD
 * =====================
 *
 * Beautiful, informative dashboard with widgets and quick actions
 */

class EnhancedDashboard {
  constructor() {
    this.initialized = false;
    this.widgets = [];
    this.refreshInterval = null;
  }

  async initialize() {
    if (this.initialized) return;

    console.log('🎯 Enhanced Dashboard initializing...');

    // Create dashboard UI
    this.createDashboardUI();

    // Load widgets
    await this.loadWidgets();

    // Setup auto-refresh
    this.setupAutoRefresh();

    // Setup event listeners
    this.setupEventListeners();

    this.initialized = true;
    console.log('✅ Enhanced Dashboard ready');
  }

  /**
   * Create dashboard UI
   */
  createDashboardUI() {
    let container = document.getElementById('enhanced-dashboard');
    if (!container) {
      container = document.createElement('div');
      container.id = 'enhanced-dashboard';
      container.className = 'enhanced-dashboard';

      // Find main content area
      const mainContent = document.getElementById('main-content') || document.querySelector('main');
      if (mainContent) {
        mainContent.insertBefore(container, mainContent.firstChild);
      }
    }

    container.innerHTML = `
      <div class="dashboard-header">
        <h1 class="dashboard-title">¡Hola! 👋</h1>
        <p class="dashboard-subtitle" id="dashboard-greeting"></p>
      </div>

      <!-- Quick Stats Row -->
      <div class="quick-stats">
        <div class="stat-widget" id="days-until-trip">
          <div class="stat-icon">🗓️</div>
          <div class="stat-content">
            <div class="stat-value">--</div>
            <div class="stat-label">Días para el viaje</div>
          </div>
        </div>

        <div class="stat-widget" id="trip-progress">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">--</div>
            <div class="stat-label">Progreso</div>
          </div>
        </div>

        <div class="stat-widget" id="total-activities">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-value">--</div>
            <div class="stat-label">Actividades</div>
          </div>
        </div>

        <div class="stat-widget" id="budget-status">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-value">--</div>
            <div class="stat-label">Presupuesto</div>
          </div>
        </div>
      </div>

      <!-- Main Widgets Grid -->
      <div class="widgets-grid">
        <!-- Next Tasks Widget -->
        <div class="widget-card" id="next-tasks-widget">
          <div class="widget-header">
            <h3>📋 Próximas Tareas</h3>
            <button class="widget-expand">⤢</button>
          </div>
          <div class="widget-body" id="next-tasks-body"></div>
        </div>

        <!-- Quick Actions Widget -->
        <div class="widget-card" id="quick-actions-widget">
          <div class="widget-header">
            <h3>⚡ Acciones Rápidas</h3>
          </div>
          <div class="widget-body quick-actions-grid" id="quick-actions-body"></div>
        </div>

        <!-- Trip Overview Widget -->
        <div class="widget-card" id="trip-overview-widget">
          <div class="widget-header">
            <h3>🗺️ Resumen del Viaje</h3>
          </div>
          <div class="widget-body" id="trip-overview-body"></div>
        </div>

        <!-- Recent Activity Widget -->
        <div class="widget-card" id="recent-activity-widget">
          <div class="widget-header">
            <h3>⏱️ Actividad Reciente</h3>
          </div>
          <div class="widget-body" id="recent-activity-body"></div>
        </div>
      </div>

      <!-- Today's Focus (only shown when in Japan) -->
      <div class="widget-card full-width hidden" id="todays-focus-widget">
        <div class="widget-header">
          <h3>🎯 Hoy en Japón</h3>
        </div>
        <div class="widget-body" id="todays-focus-body"></div>
      </div>
    `;

    this.updateGreeting();
  }

  /**
   * Update greeting based on time of day
   */
  updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 12) greeting = '¡Buenos días!';
    else if (hour < 18) greeting = '¡Buenas tardes!';
    else greeting = '¡Buenas noches!';

    const greetingEl = document.getElementById('dashboard-greeting');
    if (greetingEl) {
      greetingEl.textContent = greeting + ' Listo para planear tu aventura japonesa?';
    }
  }

  /**
   * Load all widgets
   */
  async loadWidgets() {
    await Promise.all([
      this.loadQuickStats(),
      this.loadNextTasks(),
      this.loadQuickActions(),
      this.loadTripOverview(),
      this.loadRecentActivity()
    ]);
  }

  /**
   * Load quick stats
   */
  async loadQuickStats() {
    const itinerary = this.getCurrentItinerary();

    // Days until trip
    const daysUntil = this.calculateDaysUntilTrip(itinerary);
    const daysWidget = document.querySelector('#days-until-trip .stat-value');
    if (daysWidget) {
      daysWidget.textContent = daysUntil >= 0 ? daysUntil : 'En curso';
    }

    // Trip progress
    const progress = this.calculateTripProgress(itinerary);
    const progressWidget = document.querySelector('#trip-progress .stat-value');
    if (progressWidget) {
      progressWidget.textContent = `${progress}%`;
    }

    // Total activities
    const totalActivities = this.getTotalActivities(itinerary);
    const activitiesWidget = document.querySelector('#total-activities .stat-value');
    if (activitiesWidget) {
      activitiesWidget.textContent = totalActivities;
    }

    // Budget status
    const budgetStatus = this.getBudgetStatus();
    const budgetWidget = document.querySelector('#budget-status .stat-value');
    if (budgetWidget) {
      budgetWidget.textContent = budgetStatus;
    }
  }

  /**
   * Load next tasks widget
   */
  async loadNextTasks() {
    const tasks = this.getNextTasks();
    const body = document.getElementById('next-tasks-body');
    if (!body) return;

    if (tasks.length === 0) {
      body.innerHTML = '<p class="empty-state">¡Todo listo! 🎉</p>';
      return;
    }

    body.innerHTML = `
      <ul class="tasks-list">
        ${tasks.map(task => `
          <li class="task-item ${task.priority}">
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            ${task.daysLeft ? `<span class="task-badge">${task.daysLeft}d</span>` : ''}
          </li>
        `).join('')}
      </ul>
    `;
  }

  /**
   * Load quick actions
   */
  async loadQuickActions() {
    const actions = [
      { icon: '🔍', label: 'Buscar', action: 'showSearch' },
      { icon: '📊', label: 'Analytics', action: 'showAnalytics' },
      { icon: '💰', label: 'Gastos', action: 'showBudget' },
      { icon: '📔', label: 'Diario', action: 'showJournal' },
      { icon: '🏆', label: 'Logros', action: 'showGamification' },
      { icon: '🗺️', label: 'Optimizar', action: 'optimizeRoute' }
    ];

    const body = document.getElementById('quick-actions-body');
    if (!body) return;

    body.innerHTML = actions.map(action => `
      <button class="quick-action-btn" data-action="${action.action}">
        <span class="action-icon">${action.icon}</span>
        <span class="action-label">${action.label}</span>
      </button>
    `).join('');
  }

  /**
   * Load trip overview
   */
  async loadTripOverview() {
    const itinerary = this.getCurrentItinerary();
    const body = document.getElementById('trip-overview-body');
    if (!body) return;

    if (!itinerary || !itinerary.days) {
      body.innerHTML = '<p class="empty-state">No hay itinerario aún. <a href="#" id="create-itinerary-link">Crear uno</a></p>';
      return;
    }

    const stats = this.getItineraryStats(itinerary);

    body.innerHTML = `
      <div class="overview-stats">
        <div class="overview-item">
          <span class="overview-label">Duración:</span>
          <span class="overview-value">${stats.totalDays} días</span>
        </div>
        <div class="overview-item">
          <span class="overview-label">Ciudades:</span>
          <span class="overview-value">${stats.cities.join(', ') || 'No especificadas'}</span>
        </div>
        <div class="overview-item">
          <span class="overview-label">Balance:</span>
          <span class="overview-value ${stats.balanceClass}">${stats.balanceText}</span>
        </div>
        <div class="overview-item">
          <span class="overview-label">Categorías:</span>
          <span class="overview-value">${stats.topCategories.join(', ')}</span>
        </div>
      </div>
    `;
  }

  /**
   * Load recent activity
   */
  async loadRecentActivity() {
    const activities = this.getRecentActivities();
    const body = document.getElementById('recent-activity-body');
    if (!body) return;

    if (activities.length === 0) {
      body.innerHTML = '<p class="empty-state">Sin actividad reciente</p>';
      return;
    }

    body.innerHTML = `
      <ul class="activity-feed">
        ${activities.map(activity => `
          <li class="activity-item">
            <span class="activity-icon">${activity.icon}</span>
            <div class="activity-content">
              <span class="activity-text">${activity.text}</span>
              <span class="activity-time">${activity.time}</span>
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  }

  /**
   * Helper: Get current itinerary
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
   * Helper: Calculate days until trip
   */
  calculateDaysUntilTrip(itinerary) {
    if (!itinerary || !itinerary.startDate) return '--';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tripDate = new Date(itinerary.startDate);
    tripDate.setHours(0, 0, 0, 0);

    const diff = tripDate - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days;
  }

  /**
   * Helper: Calculate trip progress
   */
  calculateTripProgress(itinerary) {
    if (!itinerary) return 0;

    let completedTasks = 0;
    let totalTasks = 10; // Base tasks

    // Check pre-trip checklist
    const checklist = this.getChecklistCompletion();
    completedTasks += checklist.completed;
    totalTasks += checklist.total;

    // Check if has activities
    if (itinerary.days && itinerary.days.length > 0) {
      completedTasks += 1;
    }

    // Check if has budget
    if (window.BudgetTracker && window.BudgetTracker.expenses && window.BudgetTracker.expenses.length > 0) {
      completedTasks += 1;
    }

    return Math.round((completedTasks / totalTasks) * 100);
  }

  /**
   * Helper: Get total activities
   */
  getTotalActivities(itinerary) {
    if (!itinerary || !itinerary.days) return 0;

    return itinerary.days.reduce((total, day) => {
      return total + (day.activities ? day.activities.length : 0);
    }, 0);
  }

  /**
   * Helper: Get budget status
   */
  getBudgetStatus() {
    if (!window.BudgetTracker || !window.BudgetTracker.expenses) return '--';

    const total = window.BudgetTracker.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return total > 0 ? `¥${total.toLocaleString()}` : '¥0';
  }

  /**
   * Helper: Get next tasks
   */
  getNextTasks() {
    const tasks = [];
    const itinerary = this.getCurrentItinerary();
    const daysUntil = this.calculateDaysUntilTrip(itinerary);

    // Pre-trip tasks based on days remaining
    if (daysUntil > 90) {
      tasks.push({ text: 'Reservar vuelos', priority: 'high', daysLeft: daysUntil });
      tasks.push({ text: 'Solicitar JR Pass', priority: 'medium', daysLeft: daysUntil });
    } else if (daysUntil > 30) {
      tasks.push({ text: 'Reservar hoteles', priority: 'high', daysLeft: daysUntil });
      tasks.push({ text: 'Planear actividades', priority: 'medium', daysLeft: daysUntil });
    } else if (daysUntil > 7) {
      tasks.push({ text: 'Cambiar moneda', priority: 'high', daysLeft: daysUntil });
      tasks.push({ text: 'Preparar maleta', priority: 'medium', daysLeft: daysUntil });
    } else if (daysUntil > 0) {
      tasks.push({ text: 'Imprimir documentos', priority: 'high', daysLeft: daysUntil });
      tasks.push({ text: 'Revisar itinerario', priority: 'high', daysLeft: daysUntil });
    }

    return tasks.slice(0, 5);
  }

  /**
   * Helper: Get checklist completion
   */
  getChecklistCompletion() {
    // This would integrate with actual pre-trip checklist
    return { completed: 3, total: 10 };
  }

  /**
   * Helper: Get itinerary stats
   */
  getItineraryStats(itinerary) {
    const stats = {
      totalDays: itinerary.days ? itinerary.days.length : 0,
      cities: [],
      balanceClass: 'balanced',
      balanceText: 'Balanceado',
      topCategories: []
    };

    if (!itinerary.days) return stats;

    // Get cities
    const citySet = new Set();
    itinerary.days.forEach(day => {
      if (day.city) citySet.add(day.city);
    });
    stats.cities = Array.from(citySet);

    // Check balance
    const activitiesPerDay = itinerary.days.map(d => d.activities ? d.activities.length : 0);
    const avg = activitiesPerDay.reduce((a, b) => a + b, 0) / activitiesPerDay.length;

    if (avg > 6) {
      stats.balanceClass = 'intense';
      stats.balanceText = 'Muy intenso';
    } else if (avg < 3) {
      stats.balanceClass = 'relaxed';
      stats.balanceText = 'Relajado';
    }

    // Top categories
    const categories = {};
    itinerary.days.forEach(day => {
      if (day.activities) {
        day.activities.forEach(act => {
          const cat = act.category || 'other';
          categories[cat] = (categories[cat] || 0) + 1;
        });
      }
    });

    stats.topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    return stats;
  }

  /**
   * Helper: Get recent activities
   */
  getRecentActivities() {
    // This would integrate with actual activity tracking
    return [
      { icon: '➕', text: 'Agregaste templo Fushimi Inari', time: 'Hace 2 horas' },
      { icon: '💰', text: 'Registraste gasto de ¥5000', time: 'Ayer' },
      { icon: '📔', text: 'Creaste entrada en diario', time: 'Hace 2 días' }
    ].slice(0, 5);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Quick action buttons
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleQuickAction(action);
      });
    });

    // Listen for itinerary changes
    if (window.eventBus) {
      window.eventBus.on('itinerary:updated', () => {
        this.refreshWidgets();
      });
    }
  }

  /**
   * Handle quick action
   */
  handleQuickAction(action) {
    console.log('Quick action:', action);

    switch (action) {
      case 'showSearch':
        if (window.GlobalSearchFilters) {
          window.GlobalSearchFilters.show();
        }
        break;
      case 'showAnalytics':
        if (window.AnalyticsIntegration) {
          window.AnalyticsIntegration.showAnalytics();
        }
        break;
      case 'showJournal':
        if (window.TravelJournal) {
          window.TravelJournal.show();
        }
        break;
      case 'showGamification':
        if (window.GamificationSystem) {
          window.GamificationSystem.showAllBadges();
        }
        break;
      case 'showBudget':
        if (window.BudgetVisualCharts) {
          window.BudgetVisualCharts.show();
        }
        break;
      case 'showTimeline':
        // Show Instagram timeline
        break;
      // Add more actions...
    }
  }

  /**
   * Refresh all widgets
   */
  async refreshWidgets() {
    await this.loadWidgets();
  }

  /**
   * Setup auto-refresh
   */
  setupAutoRefresh() {
    // Refresh every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.refreshWidgets();
    }, 5 * 60 * 1000);
  }

  /**
   * Show dashboard
   */
  show() {
    const dashboard = document.getElementById('enhanced-dashboard');
    if (dashboard) {
      dashboard.classList.remove('hidden');
      this.refreshWidgets();
    }
  }

  /**
   * Hide dashboard
   */
  hide() {
    const dashboard = document.getElementById('enhanced-dashboard');
    if (dashboard) {
      dashboard.classList.add('hidden');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.EnhancedDashboard = new EnhancedDashboard();
  console.log('🎯 Enhanced Dashboard loaded!');
}
