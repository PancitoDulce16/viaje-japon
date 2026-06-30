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
        <div class="bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105" onclick="window.showMainMenu()">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold opacity-90">Tu Viaje a Japón</h3>
            <span class="text-4xl animate-bounce-slow">🇯🇵</span>
          </div>
          <div class="text-5xl font-bold mb-2 drop-shadow-lg">${daysUntilTrip}</div>
          <p class="text-purple-100 dark:text-purple-200">días para tu aventura</p>
          <div class="mt-4 pt-4 border-t border-white/20">
            <p class="text-sm text-purple-100 dark:text-purple-200">¡Ya casi! Sigue planeando 🎌</p>
          </div>
        </div>

        <!-- Planning Progress Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 transform hover:scale-105">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Progreso</h3>
            <span class="text-4xl">📋</span>
          </div>
          <div class="mb-3">
            <div class="flex justify-between items-center mb-2">
              <span class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">${planningProgress}%</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">completo</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div class="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all shadow-lg" style="width: ${planningProgress}%"></div>
            </div>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span class="${this.tripData?.days ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}">
                ${this.tripData?.days ? '✅' : '⬜'}
              </span>
              <span>Itinerario creado</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span class="${budgetInfo.hasExpenses ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}">
                ${budgetInfo.hasExpenses ? '✅' : '⬜'}
              </span>
              <span>Presupuesto configurado</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span class="text-gray-400 dark:text-gray-600">⬜</span>
              <span>Reservas confirmadas</span>
            </div>
          </div>
        </div>

        <!-- Budget Tracker Card -->
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105" onclick="window.BudgetIntelligenceUI?.showDashboard()">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold opacity-90">Presupuesto</h3>
            <span class="text-4xl">💰</span>
          </div>
          <div class="mb-2">
            <div class="text-3xl font-bold drop-shadow-lg">¥${budgetInfo.spent.toLocaleString()}</div>
            <div class="text-sm text-green-100 dark:text-green-200">de ¥${budgetInfo.total.toLocaleString()}</div>
          </div>
          <div class="w-full bg-green-700/30 dark:bg-green-900/40 rounded-full h-2 overflow-hidden mb-3 shadow-inner">
            <div class="bg-white dark:bg-green-200 h-full rounded-full shadow-lg" style="width: ${budgetInfo.percentage}%"></div>
          </div>
          <p class="text-sm text-green-100 dark:text-green-200">
            ${budgetInfo.percentage < 50 ? '¡Vas bien! 👍' : budgetInfo.percentage < 80 ? 'Controla gastos 👀' : '¡Cuidado! 🚨'}
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <span class="text-2xl">⚡</span>
          Acciones Rápidas
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onclick="window.showMainMenu()" class="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all transform hover:scale-105 shadow-sm hover:shadow-md border border-purple-100 dark:border-purple-800">
            <span class="text-3xl">➕</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">Añadir Día</span>
          </button>
          <button onclick="window.showMainMenu()" class="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all transform hover:scale-105 shadow-sm hover:shadow-md border border-blue-100 dark:border-blue-800">
            <span class="text-3xl">📅</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">Ver Itinerario</span>
          </button>
          <button onclick="window.GeoOptimizerUI?.runOptimization()" class="flex flex-col items-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all transform hover:scale-105 shadow-sm hover:shadow-md border border-orange-100 dark:border-orange-800">
            <span class="text-3xl">🗺️</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">Optimizar</span>
          </button>
          <button onclick="window.AIChatUI?.open()" class="flex flex-col items-center gap-2 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-all transform hover:scale-105 shadow-sm hover:shadow-md border border-pink-100 dark:border-pink-800">
            <span class="text-3xl">🤖</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">AI Chat</span>
          </button>
        </div>
      </div>

      <!-- Live Chat / Chat en Vivo Card -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div class="bg-gradient-to-br from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105" onclick="window.LiveModeUI?.activate()">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold opacity-90">Modo Live</h3>
            <span class="text-4xl animate-pulse">📍</span>
          </div>
          <div class="mb-3">
            <p class="text-blue-100 dark:text-blue-200 text-sm mb-2">¿Ya estás en Japón?</p>
            <p class="text-2xl font-bold drop-shadow-lg">Activa el Modo Live</p>
          </div>
          <div class="mt-4 pt-4 border-t border-white/20">
            <p class="text-sm text-blue-100 dark:text-blue-200">Navega tu itinerario en tiempo real, marca lugares visitados y descubre recomendaciones cercanas 🗾</p>
          </div>
          <div class="mt-4">
            <button class="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2">
              <i class="fas fa-location-arrow"></i>
              Activar Modo Live
            </button>
          </div>
        </div>

        <div class="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105" onclick="window.AIChatUI?.open()">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold opacity-90">Chat en Vivo</h3>
            <span class="text-4xl">💬</span>
          </div>
          <div class="mb-3">
            <p class="text-indigo-100 dark:text-indigo-200 text-sm mb-2">Asistente AI siempre disponible</p>
            <p class="text-2xl font-bold drop-shadow-lg">¡Pregúntame lo que sea!</p>
          </div>
          <div class="mt-4 pt-4 border-t border-white/20">
            <p class="text-sm text-indigo-100 dark:text-indigo-200">Consejos personalizados, recomendaciones instantáneas y ayuda para planear tu viaje perfecto ✨</p>
          </div>
          <div class="mt-4">
            <button class="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2">
              <i class="fas fa-comment-dots"></i>
              Abrir Chat
            </button>
          </div>
        </div>
      </div>

      <!-- Instagram Timeline Card -->
      <div class="bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 dark:from-pink-600 dark:via-rose-600 dark:to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 mt-4" onclick="window.InstagramTimeline?.open()">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-bold opacity-90">✨ ¡NUEVO! Timeline Instagram</h3>
          <span class="text-5xl animate-bounce">📸</span>
        </div>
        <div class="mb-3">
          <p class="text-pink-100 dark:text-pink-200 text-lg mb-3">Tu viaje en formato feed</p>
          <p class="text-3xl font-bold drop-shadow-lg">¡Mira tu viaje como un Instagram!</p>
        </div>
        <div class="grid grid-cols-3 gap-2 mb-4">
          <div class="aspect-square rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">🏯</div>
          <div class="aspect-square rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">🍜</div>
          <div class="aspect-square rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">⛩️</div>
        </div>
        <div class="mt-4 pt-4 border-t border-white/20">
          <p class="text-sm text-pink-100 dark:text-pink-200 mb-4">Visualiza cada actividad como un post, dale like a tus favoritos y disfruta tu viaje en un formato súper visual 💝</p>
          <button class="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
            <i class="fas fa-images"></i>
            Abrir Timeline
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
