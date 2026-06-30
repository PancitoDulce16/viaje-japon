// js/cost-calculator.js - Calculadora Inteligente de Costos

/**
 * 💰 Calculadora de Costos para Itinerarios
 * @namespace CostCalculator
 */
export const CostCalculator = {

  /**
   * Calcular costo total de un itinerario
   * @param {Object} itinerary - Itinerario completo
   * @returns {Object} Breakdown de costos
   */
  calculateItineraryCost(itinerary) {
    if (!itinerary || !itinerary.days) {
      return this.getEmptyCostBreakdown();
    }

    const costs = {
      activities: 0,
      food: 0,
      transport: 0,
      accommodation: 0,
      total: 0,
      byDay: [],
      byCategory: {}
    };

    // Calcular costos por día
    itinerary.days.forEach(day => {
      const dayCost = this.calculateDayCost(day);
      costs.byDay.push({
        day: day.day,
        date: day.date,
        total: dayCost.total,
        breakdown: dayCost
      });

      // Sumar al total
      costs.activities += dayCost.activities;
      costs.food += dayCost.food;
      costs.transport += dayCost.transport;
    });

    // Estimar alojamiento (si hay fechas)
    if (itinerary.startDate && itinerary.endDate) {
      const nights = this.calculateNights(itinerary.startDate, itinerary.endDate);
      costs.accommodation = this.estimateAccommodation(nights, itinerary.cities);
    }

    costs.total = costs.activities + costs.food + costs.transport + costs.accommodation;

    return costs;
  },

  /**
   * Calcular costo de un día específico
   */
  calculateDayCost(day) {
    const costs = {
      activities: 0,
      food: 0,
      transport: 0,
      total: 0
    };

    if (!day.activities) return costs;

    day.activities.forEach(activity => {
      const activityCost = activity.price || 0;

      // Categorizar el costo
      if (this.isFoodActivity(activity)) {
        costs.food += activityCost;
      } else {
        costs.activities += activityCost;
      }
    });

    // Estimar transporte del día (básico)
    costs.transport = this.estimateDailyTransport(day);

    costs.total = costs.activities + costs.food + costs.transport;

    return costs;
  },

  /**
   * Determinar si una actividad es de comida
   */
  isFoodActivity(activity) {
    const foodKeywords = ['restaurant', 'ramen', 'sushi', 'cafe', 'food', 'okonomiyaki',
                          'izakaya', 'yakiniku', 'curry', 'takoyaki', 'market'];

    const text = `${activity.name} ${activity.description || ''} ${activity.category || ''}`.toLowerCase();

    return foodKeywords.some(keyword => text.includes(keyword));
  },

  /**
   * Estimar transporte diario
   */
  estimateDailyTransport(day) {
    // Estimación básica basada en número de actividades y ciudades
    const activityCount = day.activities ? day.activities.length : 0;
    const isMultiCity = day.isMultiCity || false;

    if (isMultiCity) {
      // Si visita múltiples ciudades, transporte más alto
      return 2000; // ~$15 USD
    } else if (activityCount > 3) {
      // Día activo en una ciudad
      return 1000; // ~$7 USD
    } else if (activityCount > 0) {
      // Día tranquilo
      return 600; // ~$4 USD
    }

    return 0;
  },

  /**
   * Estimar alojamiento total
   */
  estimateAccommodation(nights, cities = []) {
    if (nights === 0) return 0;

    // Precios promedio por noche según ciudad (JPY)
    const cityPrices = {
      'tokyo': 8000,
      'kyoto': 7000,
      'osaka': 7000,
      'hiroshima': 6000,
      'fukuoka': 6000,
      'hakone': 12000, // Onsen más caro
      'nara': 6500,
      'default': 7000
    };

    // Si tenemos info de ciudades, calcular promedio
    if (cities && cities.length > 0) {
      const avgPrice = cities.reduce((sum, cityId) => {
        const city = cityId.toLowerCase();
        const price = cityPrices[city] || cityPrices.default;
        return sum + price;
      }, 0) / cities.length;

      return Math.round(avgPrice * nights);
    }

    // Default: precio promedio
    return cityPrices.default * nights;
  },

  /**
   * Calcular número de noches
   */
  calculateNights(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays; // Número de noches = días - 1, pero para viajes contamos igual
  },

  /**
   * Obtener breakdown vacío
   */
  getEmptyCostBreakdown() {
    return {
      activities: 0,
      food: 0,
      transport: 0,
      accommodation: 0,
      total: 0,
      byDay: [],
      byCategory: {}
    };
  },

  /**
   * Formatear costo en JPY
   */
  formatJPY(amount) {
    return `¥${amount.toLocaleString('ja-JP')}`;
  },

  /**
   * Convertir JPY a USD (estimado)
   */
  toUSD(jpy) {
    const rate = 0.0067; // Aproximado, actualizar según necesidad
    return Math.round(jpy * rate);
  },

  /**
   * Generar resumen legible de costos
   */
  generateCostSummary(costs) {
    return {
      total: this.formatJPY(costs.total),
      totalUSD: `$${this.toUSD(costs.total)}`,
      breakdown: {
        activities: this.formatJPY(costs.activities),
        food: this.formatJPY(costs.food),
        transport: this.formatJPY(costs.transport),
        accommodation: this.formatJPY(costs.accommodation)
      },
      daily: costs.byDay.map(day => ({
        day: day.day,
        total: this.formatJPY(day.total),
        totalUSD: `$${this.toUSD(day.total)}`
      }))
    };
  },

  /**
   * Comparar con presupuesto del usuario
   */
  compareWithBudget(costs, userBudget) {
    if (!userBudget || userBudget === 0) {
      return {
        hasbudget: false,
        message: 'No hay presupuesto definido'
      };
    }

    const difference = userBudget - costs.total;
    const percentage = (costs.total / userBudget) * 100;

    if (difference >= 0) {
      return {
        status: 'ok',
        message: `Estás dentro del presupuesto`,
        difference: this.formatJPY(difference),
        percentage: Math.round(percentage)
      };
    } else {
      return {
        status: 'over',
        message: `Excedes el presupuesto`,
        difference: this.formatJPY(Math.abs(difference)),
        percentage: Math.round(percentage)
      };
    }
  }
};

// Exponer globalmente
window.CostCalculator = CostCalculator;

console.log('💰 Cost Calculator module loaded');

export default CostCalculator;
