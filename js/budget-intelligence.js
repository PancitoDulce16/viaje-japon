/**
 * 💰 BUDGET INTELLIGENCE SYSTEM
 * ==============================
 *
 * Smart budget tracking and prediction:
 * - Real-time budget monitoring
 * - Category-based tracking
 * - Spending predictions
 * - Alerts and warnings
 * - Savings suggestions
 * - Exchange rate integration
 *
 * SAVES: Prevents overspending, optimizes budget allocation
 */

class BudgetIntelligence {
  constructor() {
    this.initialized = false;

    // Budget categories with typical Japan costs (JPY)
    this.categories = {
      accommodation: { name: 'Alojamiento', icon: '🏨', avgPerNight: 8000 },
      food: { name: 'Comida', icon: '🍜', avgPerDay: 3000 },
      transport: { name: 'Transporte', icon: '🚄', avgPerDay: 1500 },
      attractions: { name: 'Atracciones', icon: '🎫', avgPerDay: 2000 },
      shopping: { name: 'Compras', icon: '🛍️', avgPerDay: 3000 },
      misc: { name: 'Otros', icon: '💸', avgPerDay: 1000 }
    };

    // Spending thresholds (percentage of budget)
    this.thresholds = {
      warning: 0.75,  // 75% - warning
      critical: 0.90, // 90% - critical
      danger: 0.95    // 95% - danger zone
    };

    // Exchange rates (will be updated from API)
    this.exchangeRates = {
      USD: 150,  // 1 USD = 150 JPY
      EUR: 165,  // 1 EUR = 165 JPY
      MXN: 8.5,  // 1 MXN = 8.5 JPY
      lastUpdated: null
    };

    console.log('💰 Budget Intelligence initialized');
  }

  /**
   * Analyze complete budget for a trip
   */
  analyzeBudget(tripData) {
    const analysis = {
      total: 0,
      spent: 0,
      remaining: 0,
      dailyAverage: 0,
      projectedTotal: 0,
      categories: {},
      alerts: [],
      suggestions: [],
      status: 'good' // good, warning, critical, danger
    };

    // Calculate totals
    analysis.total = tripData.budget || 0;
    analysis.spent = this.calculateSpent(tripData.expenses || []);
    analysis.remaining = analysis.total - analysis.spent;

    // Calculate daily average
    const daysElapsed = this.getDaysElapsed(tripData.startDate);
    const totalDays = this.getTotalDays(tripData.startDate, tripData.endDate);

    if (daysElapsed > 0) {
      analysis.dailyAverage = analysis.spent / daysElapsed;
      analysis.projectedTotal = analysis.dailyAverage * totalDays;
    }

    // Analyze by category
    analysis.categories = this.analyzeByCategory(tripData.expenses || []);

    // Generate alerts
    analysis.alerts = this.generateAlerts(analysis);

    // Generate savings suggestions
    analysis.suggestions = this.generateSuggestions(analysis, tripData);

    // Determine status
    const spentPercentage = analysis.total > 0 ? analysis.spent / analysis.total : 0;
    if (spentPercentage >= this.thresholds.danger) {
      analysis.status = 'danger';
    } else if (spentPercentage >= this.thresholds.critical) {
      analysis.status = 'critical';
    } else if (spentPercentage >= this.thresholds.warning) {
      analysis.status = 'warning';
    } else {
      analysis.status = 'good';
    }

    return analysis;
  }

  /**
   * Calculate total spent from expenses
   */
  calculateSpent(expenses) {
    return expenses.reduce((total, expense) => {
      return total + (expense.amount || 0);
    }, 0);
  }

  /**
   * Get days elapsed since start date
   */
  getDaysElapsed(startDate) {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diff = now - start;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  /**
   * Get total days in trip
   */
  getTotalDays(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end - start;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  /**
   * Analyze spending by category
   */
  analyzeByCategory(expenses) {
    const categoryAnalysis = {};

    // Initialize categories
    Object.keys(this.categories).forEach(key => {
      categoryAnalysis[key] = {
        name: this.categories[key].name,
        icon: this.categories[key].icon,
        spent: 0,
        count: 0,
        percentage: 0
      };
    });

    // Sum by category
    expenses.forEach(expense => {
      const category = expense.category || 'misc';
      if (categoryAnalysis[category]) {
        categoryAnalysis[category].spent += expense.amount || 0;
        categoryAnalysis[category].count++;
      }
    });

    // Calculate percentages
    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    if (total > 0) {
      Object.keys(categoryAnalysis).forEach(key => {
        categoryAnalysis[key].percentage = (categoryAnalysis[key].spent / total) * 100;
      });
    }

    return categoryAnalysis;
  }

  /**
   * Generate budget alerts
   */
  generateAlerts(analysis) {
    const alerts = [];

    // Overall budget alerts
    const spentPercentage = analysis.total > 0 ? analysis.spent / analysis.total : 0;

    if (spentPercentage >= this.thresholds.danger) {
      alerts.push({
        severity: 'danger',
        icon: '🚨',
        title: '¡PRESUPUESTO CASI AGOTADO!',
        message: `Has gastado ${(spentPercentage * 100).toFixed(0)}% de tu presupuesto total (¥${analysis.spent.toLocaleString()} de ¥${analysis.total.toLocaleString()})`,
        action: 'reduce_spending'
      });
    } else if (spentPercentage >= this.thresholds.critical) {
      alerts.push({
        severity: 'critical',
        icon: '⚠️',
        title: 'Atención: Presupuesto Alto',
        message: `Has gastado ${(spentPercentage * 100).toFixed(0)}% de tu presupuesto. Quedan ¥${analysis.remaining.toLocaleString()}`,
        action: 'monitor_spending'
      });
    } else if (spentPercentage >= this.thresholds.warning) {
      alerts.push({
        severity: 'warning',
        icon: '⚡',
        title: 'Monitoreo de Presupuesto',
        message: `Vas por el ${(spentPercentage * 100).toFixed(0)}% de tu presupuesto`,
        action: 'stay_aware'
      });
    }

    // Projection alerts
    if (analysis.projectedTotal > analysis.total) {
      const overage = analysis.projectedTotal - analysis.total;
      alerts.push({
        severity: 'warning',
        icon: '📊',
        title: 'Proyección: Exceso de Presupuesto',
        message: `Al ritmo actual, gastarás ¥${overage.toLocaleString()} más de lo planeado`,
        action: 'adjust_spending'
      });
    }

    // Category-specific alerts
    Object.entries(analysis.categories).forEach(([key, cat]) => {
      if (cat.percentage > 40) {
        alerts.push({
          severity: 'info',
          icon: '💡',
          title: `Alto gasto en ${cat.name}`,
          message: `${cat.icon} ${cat.name} representa el ${cat.percentage.toFixed(0)}% de tus gastos`,
          action: 'rebalance'
        });
      }
    });

    return alerts;
  }

  /**
   * Generate savings suggestions
   */
  generateSuggestions(analysis, tripData) {
    const suggestions = [];

    // Food savings
    if (analysis.categories.food && analysis.categories.food.spent > 0) {
      const avgPerDay = analysis.categories.food.spent / Math.max(1, this.getDaysElapsed(tripData.startDate));
      if (avgPerDay > 4000) {
        suggestions.push({
          category: 'food',
          icon: '🍜',
          title: 'Ahorra en comida',
          message: 'Prueba más konbini (7-Eleven, Lawson) y restaurantes locales fuera de zonas turísticas',
          potential: Math.round((avgPerDay - 3000) * this.getTotalDays(tripData.startDate, tripData.endDate))
        });
      }
    }

    // Transport savings
    if (analysis.categories.transport && analysis.categories.transport.spent > 0) {
      suggestions.push({
        category: 'transport',
        icon: '🎫',
        title: 'Considera JR Pass',
        message: 'Si viajas entre ciudades, el JR Pass puede ahorrarte hasta 50%',
        potential: Math.round(analysis.categories.transport.spent * 0.3)
      });
    }

    // Attractions savings
    if (analysis.categories.attractions && analysis.categories.attractions.spent > 2000) {
      suggestions.push({
        category: 'attractions',
        icon: '⛩️',
        title: 'Visita templos gratis',
        message: 'Muchos templos y santuarios son gratuitos. Planifica más visitas sin costo',
        potential: 1000
      });
    }

    // Shopping optimization
    if (analysis.categories.shopping && analysis.categories.shopping.percentage > 35) {
      suggestions.push({
        category: 'shopping',
        icon: '🛍️',
        title: 'Compras inteligentes',
        message: 'Usa tiendas 100 yen (como Daiso) para souvenirs económicos',
        potential: Math.round(analysis.categories.shopping.spent * 0.2)
      });
    }

    // General tip
    if (analysis.dailyAverage > 12000) {
      suggestions.push({
        category: 'general',
        icon: '💡',
        title: 'Reduce gasto diario',
        message: 'Tu promedio diario es alto (¥' + Math.round(analysis.dailyAverage).toLocaleString() + '). Planifica más actividades gratuitas',
        potential: Math.round((analysis.dailyAverage - 10000) * this.getTotalDays(tripData.startDate, tripData.endDate))
      });
    }

    return suggestions;
  }

  /**
   * Predict future spending
   */
  predictSpending(tripData) {
    const daysElapsed = this.getDaysElapsed(tripData.startDate);
    const totalDays = this.getTotalDays(tripData.startDate, tripData.endDate);
    const daysRemaining = totalDays - daysElapsed;

    if (daysElapsed === 0) {
      // Before trip - use averages
      return {
        estimated: this.estimatePreTripBudget(tripData),
        confidence: 'low'
      };
    }

    // During/after trip - use actual data
    const spent = this.calculateSpent(tripData.expenses || []);
    const dailyAverage = spent / daysElapsed;
    const projectedTotal = dailyAverage * totalDays;
    const projectedRemaining = dailyAverage * daysRemaining;

    return {
      dailyAverage: Math.round(dailyAverage),
      projectedTotal: Math.round(projectedTotal),
      projectedRemaining: Math.round(projectedRemaining),
      confidence: daysElapsed >= 3 ? 'high' : 'medium'
    };
  }

  /**
   * Estimate pre-trip budget
   */
  estimatePreTripBudget(tripData) {
    const days = this.getTotalDays(tripData.startDate, tripData.endDate);

    let estimate = 0;

    // Accommodation
    estimate += this.categories.accommodation.avgPerNight * days;

    // Daily expenses
    estimate += this.categories.food.avgPerDay * days;
    estimate += this.categories.transport.avgPerDay * days;
    estimate += this.categories.attractions.avgPerDay * days;
    estimate += this.categories.shopping.avgPerDay * days;
    estimate += this.categories.misc.avgPerDay * days;

    return Math.round(estimate);
  }

  /**
   * Convert currency
   */
  convertCurrency(amount, from, to = 'JPY') {
    if (from === to) return amount;

    if (from === 'JPY') {
      // JPY to other currency
      return amount / (this.exchangeRates[to] || 1);
    } else if (to === 'JPY') {
      // Other currency to JPY
      return amount * (this.exchangeRates[from] || 1);
    } else {
      // Between two non-JPY currencies
      const inJPY = amount * (this.exchangeRates[from] || 1);
      return inJPY / (this.exchangeRates[to] || 1);
    }
  }

  /**
   * Get recommended daily budget
   */
  getRecommendedDailyBudget(totalBudget, totalDays, daysElapsed, spent) {
    const remaining = totalBudget - spent;
    const daysRemaining = totalDays - daysElapsed;

    if (daysRemaining <= 0) return 0;

    return Math.round(remaining / daysRemaining);
  }

  /**
   * Check if expense is within budget
   */
  checkExpense(amount, currentSpent, totalBudget) {
    const afterExpense = currentSpent + amount;
    const percentage = afterExpense / totalBudget;

    return {
      allowed: percentage < 1,
      percentage: percentage * 100,
      warning: percentage >= this.thresholds.warning,
      critical: percentage >= this.thresholds.critical,
      message: this.getExpenseMessage(percentage)
    };
  }

  /**
   * Get message for expense check
   */
  getExpenseMessage(percentage) {
    if (percentage >= 1) {
      return '🚨 Este gasto excede tu presupuesto total';
    } else if (percentage >= this.thresholds.danger) {
      return '⚠️ Atención: Este gasto te deja con muy poco margen';
    } else if (percentage >= this.thresholds.critical) {
      return '⚡ Este gasto usa una parte significativa de tu presupuesto';
    } else if (percentage >= this.thresholds.warning) {
      return '💡 Este gasto es considerable, verifica que sea necesario';
    } else {
      return '✅ Este gasto está dentro de tu presupuesto';
    }
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.BudgetIntelligence = new BudgetIntelligence();
  console.log('💰 Budget Intelligence System loaded!');
}
