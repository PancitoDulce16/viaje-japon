// js/budget-calculator.js - Calculadora automática de presupuesto

import { calculateDayTransportTime } from '/data/transport-times-data.js';

export const BudgetCalculator = {
  /**
   * Calcula el presupuesto total del viaje
   */
  calculateTotalBudget(trip) {
    const breakdown = {
      flights: 0,
      hotels: 0,
      activities: 0,
      food: 0,
      transport: 0,
      total: 0,
      perDay: 0,
      currency: 'JPY'
    };

    if (!trip) return breakdown;

    // 1. VUELOS
    if (trip.flights && Array.isArray(trip.flights)) {
      breakdown.flights = trip.flights.reduce((sum, flight) => {
        return sum + (flight.price || 0);
      }, 0);
    }

    // 2. HOTELES
    if (trip.hotels && Array.isArray(trip.hotels)) {
      breakdown.hotels = trip.hotels.reduce((sum, hotel) => {
        const nights = this.calculateNights(hotel.checkIn, hotel.checkOut);
        return sum + ((hotel.pricePerNight || 0) * nights);
      }, 0);
    }

    // 3. ACTIVIDADES Y COMIDA (desde itinerario)
    if (trip.itinerary && trip.itinerary.days) {
      trip.itinerary.days.forEach(day => {
        if (day.activities) {
          day.activities.forEach(activity => {
            const cost = activity.cost || 0;
            if (activity.isMeal) {
              breakdown.food += cost;
            } else {
              breakdown.activities += cost;
            }
          });

          // Calcular transporte del día
          const dayTransport = calculateDayTransportTime(day.activities);
          breakdown.transport += dayTransport.totalCost || 0;
        }
      });
    }

    // TOTAL
    breakdown.total = breakdown.flights + breakdown.hotels + breakdown.activities + breakdown.food + breakdown.transport;

    // PER DAY (excluyendo vuelos)
    const days = this.getTripDays(trip);
    if (days > 0) {
      breakdown.perDay = Math.round((breakdown.total - breakdown.flights) / days);
    }

    return breakdown;
  },

  /**
   * Calcula presupuesto por día
   */
  calculateDailyBudget(day) {
    const breakdown = {
      activities: 0,
      food: 0,
      transport: 0,
      total: 0
    };

    if (!day || !day.activities) return breakdown;

    day.activities.forEach(activity => {
      const cost = activity.cost || 0;
      if (activity.isMeal) {
        breakdown.food += cost;
      } else {
        breakdown.activities += cost;
      }
    });

    // Transport
    const transport = calculateDayTransportTime(day.activities);
    breakdown.transport = transport.totalCost || 0;

    breakdown.total = breakdown.activities + breakdown.food + breakdown.transport;

    return breakdown;
  },

  /**
   * Calcula el número de noches
   */
  calculateNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  /**
   * Obtiene el número total de días del viaje
   */
  getTripDays(trip) {
    if (!trip.info) return 0;
    const start = new Date(trip.info.dateStart);
    const end = new Date(trip.info.dateEnd);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end
  },

  /**
   * Formatea el presupuesto para mostrar
   */
  formatBudget(amount, currency = 'JPY') {
    if (currency === 'JPY') {
      return `¥${amount.toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  },

  /**
   * Convierte yenes a dólares (aproximado)
   */
  convertYenToUSD(yen) {
    const rate = 145; // Aproximado
    return Math.round(yen / rate);
  },

  /**
   * Genera un resumen visual del presupuesto
   */
  generateBudgetSummary(trip) {
    const budget = this.calculateTotalBudget(trip);
    const usdTotal = this.convertYenToUSD(budget.total);
    const days = this.getTripDays(trip);

    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-4 border-green-600 dark:border-green-500">
        <h3 class="text-2xl font-black text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
          💰 Presupuesto Total del Viaje
        </h3>

        <div class="grid md:grid-cols-2 gap-4 mb-6">
          <!-- Total -->
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border-2 border-green-500">
            <p class="text-sm font-bold text-gray-700 dark:text-gray-300">TOTAL</p>
            <p class="text-3xl font-black text-green-700 dark:text-green-400">${this.formatBudget(budget.total)}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-bold">~$${usdTotal.toLocaleString()} USD</p>
          </div>

          <!-- Por Día -->
          <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border-2 border-blue-500">
            <p class="text-sm font-bold text-gray-700 dark:text-gray-300">POR DÍA (${days} días)</p>
            <p class="text-3xl font-black text-blue-700 dark:text-blue-400">${this.formatBudget(budget.perDay)}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-bold">~$${this.convertYenToUSD(budget.perDay)} USD</p>
          </div>
        </div>

        <!-- Desglose -->
        <div class="space-y-2">
          <h4 class="font-black text-gray-800 dark:text-white mb-3">Desglose por Categoría:</h4>

          ${this.renderBudgetItem('✈️ Vuelos', budget.flights, budget.total)}
          ${this.renderBudgetItem('🏨 Hoteles', budget.hotels, budget.total)}
          ${this.renderBudgetItem('🎯 Actividades', budget.activities, budget.total)}
          ${this.renderBudgetItem('🍜 Comida', budget.food, budget.total)}
          ${this.renderBudgetItem('🚇 Transporte Local', budget.transport, budget.total)}
        </div>

        <!-- Notas -->
        <div class="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-600">
          <p class="text-xs text-black dark:text-gray-200 font-bold">
            💡 <strong>Nota:</strong> Este es un presupuesto estimado basado en tu itinerario.
            Los precios reales pueden variar. Se recomienda agregar un 10-15% de margen para imprevistos.
          </p>
        </div>
      </div>
    `;
  },

  /**
   * Renderiza un item del presupuesto con barra de progreso
   */
  renderBudgetItem(label, amount, total) {
    const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
    const usd = this.convertYenToUSD(amount);

    return `
      <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm font-black text-black dark:text-white">${label}</span>
          <span class="text-sm font-bold text-gray-800 dark:text-gray-200">
            ${this.formatBudget(amount)} <span class="text-xs text-gray-600 dark:text-gray-400">(~$${usd})</span>
          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
               style="width: ${percentage}%"></div>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 font-bold">${percentage}% del total</p>
      </div>
    `;
  },

  /**
   * Genera alertas de presupuesto
   */
  checkBudgetAlerts(trip, userBudget) {
    const calculated = this.calculateTotalBudget(trip);
    const alerts = [];

    if (!userBudget) return alerts;

    const percentageUsed = (calculated.total / userBudget) * 100;

    if (percentageUsed > 100) {
      alerts.push({
        type: 'danger',
        message: `⚠️ ¡SOBRE PRESUPUESTO! Estás ${this.formatBudget(calculated.total - userBudget)} por encima de tu presupuesto.`,
        amount: calculated.total - userBudget
      });
    } else if (percentageUsed > 90) {
      alerts.push({
        type: 'warning',
        message: `⚡ Cerca del límite: usando ${percentageUsed.toFixed(0)}% de tu presupuesto.`,
        amount: userBudget - calculated.total
      });
    } else if (percentageUsed < 50) {
      alerts.push({
        type: 'success',
        message: `✅ ¡Excelente! Estás usando solo ${percentageUsed.toFixed(0)}% de tu presupuesto. Puedes agregar más actividades.`,
        amount: userBudget - calculated.total
      });
    }

    return alerts;
  }
};

// Exponer globalmente
window.BudgetCalculator = BudgetCalculator;

export default BudgetCalculator;
