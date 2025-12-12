/**
 * 📊 VISUAL DASHBOARD
 * ===================
 *
 * Dashboard más atractivo y visual
 * IMPROVED.md Priority #5
 */

class VisualDashboard {
  constructor() {
    this.tripData = null;
  }

  /**
   * Renderizar dashboard mejorado
   */
  render(tripData) {
    this.tripData = tripData;

    const container = document.getElementById('appDashboard');
    if (!container) return;

    // Agregar cards visuales al dashboard
    const dashboardCards = this.createDashboardCards();

    // Buscar un lugar para insertarlos (después del header)
    const header = container.querySelector('header');
    if (header && header.nextSibling) {
      const cardsContainer = document.createElement('div');
      cardsContainer.id = 'visual-dashboard-cards';
      cardsContainer.className = 'p-4 md:p-6 space-y-4';
      cardsContainer.innerHTML = dashboardCards;

      // Insertar después del header
      header.parentNode.insertBefore(cardsContainer, header.nextSibling);
    }
  }

  /**
   * Crear cards del dashboard
   */
  createDashboardCards() {
    const daysUntilTrip = this.calculateDaysUntilTrip();
    const planningProgress = this.calculatePlanningProgress();
    const budgetInfo = this.getBudgetInfo();

    return `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Countdown Card -->
        <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer" onclick="window.showMainMenu()">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold opacity-90">Tu Viaje a Japón</h3>
            <span class="text-4xl">🇯🇵</span>
          </div>
          <div class="text-5xl font-bold mb-2">${daysUntilTrip}</div>
          <p class="text-purple-100">días para tu aventura</p>
          <div class="mt-4 pt-4 border-t border-white/20">
            <p class="text-sm text-purple-100">¡Ya casi! Sigue planeando 🎌</p>
          </div>
        </div>

        <!-- Planning Progress Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Progreso</h3>
            <span class="text-4xl">📋</span>
          </div>
          <div class="mb-3">
            <div class="flex justify-between items-center mb-2">
              <span class="text-3xl font-bold text-purple-600">${planningProgress}%</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">completo</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div class="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all" style="width: ${planningProgress}%"></div>
            </div>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span class="${this.tripData?.days ? 'text-green-500' : 'text-gray-400'}">
                ${this.tripData?.days ? '✅' : '⬜'}
              </span>
              <span>Itinerario creado</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span class="${budgetInfo.hasExpenses ? 'text-green-500' : 'text-gray-400'}">
                ${budgetInfo.hasExpenses ? '✅' : '⬜'}
              </span>
              <span>Presupuesto configurado</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span class="text-gray-400">⬜</span>
              <span>Reservas confirmadas</span>
            </div>
          </div>
        </div>

        <!-- Budget Tracker Card -->
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer" onclick="window.BudgetIntelligenceUI?.showDashboard()">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold opacity-90">Presupuesto</h3>
            <span class="text-4xl">💰</span>
          </div>
          <div class="mb-2">
            <div class="text-3xl font-bold">¥${budgetInfo.spent.toLocaleString()}</div>
            <div class="text-sm text-green-100">de ¥${budgetInfo.total.toLocaleString()}</div>
          </div>
          <div class="w-full bg-green-700/30 rounded-full h-2 overflow-hidden mb-3">
            <div class="bg-white h-full rounded-full" style="width: ${budgetInfo.percentage}%"></div>
          </div>
          <p class="text-sm text-green-100">
            ${budgetInfo.percentage < 50 ? '¡Vas bien! 👍' : budgetInfo.percentage < 80 ? 'Controla gastos 👀' : '¡Cuidado! 🚨'}
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Acciones Rápidas</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onclick="window.showMainMenu()" class="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all">
            <span class="text-3xl">➕</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">Añadir Día</span>
          </button>
          <button onclick="window.showMainMenu()" class="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all">
            <span class="text-3xl">📅</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">Ver Itinerario</span>
          </button>
          <button onclick="window.GeoOptimizerUI?.runOptimization()" class="flex flex-col items-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all">
            <span class="text-3xl">🗺️</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">Optimizar</span>
          </button>
          <button onclick="window.AIChatUI?.open()" class="flex flex-col items-center gap-2 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-all">
            <span class="text-3xl">🤖</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">AI Chat</span>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Calcular días hasta el viaje
   */
  calculateDaysUntilTrip() {
    // TODO: Obtener fecha real del viaje
    const tripDate = new Date('2025-04-01'); // Fecha de ejemplo
    const today = new Date();
    const diffTime = tripDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * Calcular progreso de planeación
   */
  calculatePlanningProgress() {
    let progress = 0;
    const weights = {
      hasItinerary: 40,
      hasBudget: 30,
      hasReservations: 30
    };

    if (this.tripData?.days && this.tripData.days.length > 0) {
      progress += weights.hasItinerary;
    }

    // TODO: Verificar presupuesto real
    const budgetInfo = this.getBudgetInfo();
    if (budgetInfo.hasExpenses) {
      progress += weights.hasBudget;
    }

    // TODO: Verificar reservas
    // progress += weights.hasReservations;

    return Math.round(progress);
  }

  /**
   * Obtener info de presupuesto
   */
  getBudgetInfo() {
    // TODO: Integrar con sistema real de presupuesto
    return {
      spent: 45000,
      total: 100000,
      percentage: 45,
      hasExpenses: true
    };
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.VisualDashboard = new VisualDashboard();
  console.log('📊 Visual Dashboard loaded!');
}
