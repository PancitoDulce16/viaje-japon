/**
 * 💰 BUDGET INTELLIGENCE UI
 * ==========================
 *
 * Visual interface for budget tracking and insights
 */

class BudgetIntelligenceUI {
  constructor() {
    this.intelligence = window.BudgetIntelligence;
    this.currentAnalysis = null;
  }

  /**
   * Show budget dashboard
   */
  showDashboard(tripData) {
    // Analyze budget
    const analysis = this.intelligence.analyzeBudget(tripData);
    const prediction = this.intelligence.predictSpending(tripData);
    this.currentAnalysis = analysis;

    // Create modal
    const modal = this.createModal();

    modal.innerHTML = `
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">💰 Presupuesto Inteligente</h2>
          <button class="close-modal text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Status Overview -->
        ${this.renderStatusOverview(analysis)}

        <!-- Alerts -->
        ${analysis.alerts.length > 0 ? this.renderAlerts(analysis.alerts) : ''}

        <!-- Budget Breakdown -->
        ${this.renderBudgetBreakdown(analysis, tripData)}

        <!-- Category Analysis -->
        ${this.renderCategoryAnalysis(analysis)}

        <!-- Predictions -->
        ${this.renderPredictions(prediction, tripData)}

        <!-- Savings Suggestions -->
        ${analysis.suggestions.length > 0 ? this.renderSuggestions(analysis.suggestions) : ''}

        <!-- Actions -->
        <div class="flex gap-3 mt-6">
          <button class="btn btn-primary flex-1" onclick="window.BudgetIntelligenceUI.exportReport()">
            <i class="fas fa-download mr-2"></i>
            Exportar Reporte
          </button>
          <button class="btn btn-secondary" onclick="window.BudgetIntelligenceUI.closeModal()">
            Cerrar
          </button>
        </div>
      </div>
    `;

    // Add close handler
    modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
  }

  /**
   * Render status overview
   */
  renderStatusOverview(analysis) {
    const statusColors = {
      good: 'bg-green-50 dark:bg-green-900/20 border-green-200',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200',
      critical: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200',
      danger: 'bg-red-50 dark:bg-red-900/20 border-red-200'
    };

    const statusIcons = {
      good: '✅',
      warning: '⚠️',
      critical: '🔶',
      danger: '🚨'
    };

    const statusMessages = {
      good: 'Tu presupuesto está bajo control',
      warning: 'Monitorea tus gastos de cerca',
      critical: 'Atención: Presupuesto elevado',
      danger: '¡Cuidado! Presupuesto casi agotado'
    };

    const percentage = analysis.total > 0 ? (analysis.spent / analysis.total) * 100 : 0;

    return `
      <div class="border rounded-lg p-6 mb-6 ${statusColors[analysis.status]}">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-4xl">${statusIcons[analysis.status]}</span>
            <div>
              <h3 class="text-xl font-bold">${statusMessages[analysis.status]}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Has gastado ${percentage.toFixed(1)}% de tu presupuesto
              </p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-purple-600">¥${analysis.spent.toLocaleString()}</div>
            <div class="text-sm text-gray-600">de ¥${analysis.total.toLocaleString()}</div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div class="h-4 rounded-full transition-all duration-300"
               style="width: ${Math.min(percentage, 100)}%; background: ${this.getProgressColor(percentage)}">
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mt-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">¥${analysis.remaining.toLocaleString()}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Disponible</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">¥${Math.round(analysis.dailyAverage).toLocaleString()}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Promedio/Día</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">¥${Math.round(analysis.projectedTotal).toLocaleString()}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Proyección</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get progress bar color based on percentage
   */
  getProgressColor(percentage) {
    if (percentage >= 95) return '#dc2626'; // red
    if (percentage >= 90) return '#ea580c'; // orange
    if (percentage >= 75) return '#eab308'; // yellow
    return '#10b981'; // green
  }

  /**
   * Render alerts
   */
  renderAlerts(alerts) {
    if (alerts.length === 0) return '';

    return `
      <div class="mb-6">
        <h3 class="text-xl font-bold mb-3">🚨 Alertas</h3>
        <div class="space-y-3">
          ${alerts.map(alert => this.renderAlert(alert)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render single alert
   */
  renderAlert(alert) {
    const severityColors = {
      danger: 'bg-red-50 border-red-200 dark:bg-red-900/20',
      critical: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20',
      warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20',
      info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20'
    };

    return `
      <div class="border rounded-lg p-4 ${severityColors[alert.severity]}">
        <div class="flex items-start gap-3">
          <div class="text-2xl">${alert.icon}</div>
          <div class="flex-1">
            <p class="font-semibold mb-1">${alert.title}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">${alert.message}</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render budget breakdown
   */
  renderBudgetBreakdown(analysis, tripData) {
    const daysElapsed = this.intelligence.getDaysElapsed(tripData.startDate);
    const totalDays = this.intelligence.getTotalDays(tripData.startDate, tripData.endDate);
    const daysRemaining = totalDays - daysElapsed;
    const recommendedDaily = this.intelligence.getRecommendedDailyBudget(
      analysis.total,
      totalDays,
      daysElapsed,
      analysis.spent
    );

    return `
      <div class="mb-6">
        <h3 class="text-xl font-bold mb-3">📊 Desglose</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Días Transcurridos</div>
            <div class="text-2xl font-bold">${daysElapsed}</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Días Restantes</div>
            <div class="text-2xl font-bold">${daysRemaining}</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de Días</div>
            <div class="text-2xl font-bold">${totalDays}</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Presupuesto/Día</div>
            <div class="text-2xl font-bold">¥${recommendedDaily.toLocaleString()}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render category analysis
   */
  renderCategoryAnalysis(analysis) {
    const categories = Object.entries(analysis.categories)
      .filter(([_, cat]) => cat.spent > 0)
      .sort((a, b) => b[1].spent - a[1].spent);

    if (categories.length === 0) {
      return `
        <div class="mb-6 text-center text-gray-500 py-8">
          <i class="fas fa-chart-pie text-4xl mb-3"></i>
          <p>No hay gastos registrados aún</p>
        </div>
      `;
    }

    return `
      <div class="mb-6">
        <h3 class="text-xl font-bold mb-3">📈 Gastos por Categoría</h3>
        <div class="space-y-3">
          ${categories.map(([key, cat]) => `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">${cat.icon}</span>
                  <span class="font-semibold">${cat.name}</span>
                  <span class="text-sm text-gray-500">(${cat.count} gastos)</span>
                </div>
                <div class="text-right">
                  <div class="font-bold">¥${cat.spent.toLocaleString()}</div>
                  <div class="text-sm text-gray-500">${cat.percentage.toFixed(1)}%</div>
                </div>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div class="bg-purple-500 h-2 rounded-full" style="width: ${cat.percentage}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render predictions
   */
  renderPredictions(prediction, tripData) {
    return `
      <div class="mb-6">
        <h3 class="text-xl font-bold mb-3">🔮 Proyecciones</h3>
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Gasto Diario Promedio</div>
              <div class="text-3xl font-bold text-purple-600">¥${(prediction.dailyAverage || 0).toLocaleString()}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Proyectado</div>
              <div class="text-3xl font-bold text-blue-600">¥${(prediction.projectedTotal || 0).toLocaleString()}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Faltante Proyectado</div>
              <div class="text-3xl font-bold text-green-600">¥${(prediction.projectedRemaining || 0).toLocaleString()}</div>
            </div>
          </div>
          <div class="mt-4 text-center">
            <span class="inline-block px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm">
              Confianza: <span class="font-semibold">${this.getConfidenceLabel(prediction.confidence)}</span>
            </span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get confidence label
   */
  getConfidenceLabel(confidence) {
    const labels = {
      low: '📊 Baja (pre-viaje)',
      medium: '📈 Media (pocos datos)',
      high: '✅ Alta (suficientes datos)'
    };
    return labels[confidence] || 'N/A';
  }

  /**
   * Render savings suggestions
   */
  renderSuggestions(suggestions) {
    if (suggestions.length === 0) return '';

    return `
      <div class="mb-6">
        <h3 class="text-xl font-bold mb-3">💡 Sugerencias de Ahorro</h3>
        <div class="space-y-3">
          ${suggestions.map(sug => `
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200">
              <div class="flex items-start gap-3">
                <div class="text-2xl">${sug.icon}</div>
                <div class="flex-1">
                  <p class="font-semibold mb-1">${sug.title}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">${sug.message}</p>
                  ${sug.potential ? `<p class="text-sm text-green-600 mt-1">💰 Ahorro potencial: ¥${sug.potential.toLocaleString()}</p>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Create modal
   */
  createModal() {
    // Remove existing modal
    const existing = document.getElementById('budget-intelligence-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'budget-intelligence-modal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto';
    modal.innerHTML = '<div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-5xl"></div>';

    document.body.appendChild(modal);

    return modal.firstElementChild;
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.getElementById('budget-intelligence-modal');
    if (modal) modal.remove();
  }

  /**
   * Export budget report
   */
  exportReport() {
    if (!this.currentAnalysis) return;

    // Create text report
    let report = '💰 REPORTE DE PRESUPUESTO - Japitin\n';
    report += '=' .repeat(50) + '\n\n';
    report += `Presupuesto Total: ¥${this.currentAnalysis.total.toLocaleString()}\n`;
    report += `Gastado: ¥${this.currentAnalysis.spent.toLocaleString()}\n`;
    report += `Disponible: ¥${this.currentAnalysis.remaining.toLocaleString()}\n`;
    report += `Promedio Diario: ¥${Math.round(this.currentAnalysis.dailyAverage).toLocaleString()}\n\n`;

    // Add categories
    report += 'GASTOS POR CATEGORÍA:\n';
    report += '-'.repeat(50) + '\n';
    Object.entries(this.currentAnalysis.categories).forEach(([key, cat]) => {
      if (cat.spent > 0) {
        report += `${cat.icon} ${cat.name}: ¥${cat.spent.toLocaleString()} (${cat.percentage.toFixed(1)}%)\n`;
      }
    });

    // Add alerts
    if (this.currentAnalysis.alerts.length > 0) {
      report += '\n🚨 ALERTAS:\n';
      report += '-'.repeat(50) + '\n';
      this.currentAnalysis.alerts.forEach(alert => {
        report += `${alert.icon} ${alert.title}\n`;
        report += `   ${alert.message}\n\n`;
      });
    }

    // Add suggestions
    if (this.currentAnalysis.suggestions.length > 0) {
      report += '💡 SUGERENCIAS:\n';
      report += '-'.repeat(50) + '\n';
      this.currentAnalysis.suggestions.forEach(sug => {
        report += `${sug.icon} ${sug.title}\n`;
        report += `   ${sug.message}\n`;
        if (sug.potential) {
          report += `   Ahorro potencial: ¥${sug.potential.toLocaleString()}\n`;
        }
        report += '\n';
      });
    }

    // Download
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presupuesto-japitin-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📥 Budget report exported');
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.BudgetIntelligenceUI = new BudgetIntelligenceUI();

  // Add button listener (when DOM is ready)
  document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-budget-intelligence');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        // Get trip data (mock for now)
        const tripData = window.BudgetIntelligenceUI.getMockTripData();
        window.BudgetIntelligenceUI.showDashboard(tripData);
      });
    }
  });

  console.log('💰 Budget Intelligence UI loaded!');
}

// Add to global UI instance
if (typeof window !== 'undefined') {
  window.BudgetIntelligenceUI.getMockTripData = function() {
    // This would normally get real data from the app
    return {
      budget: 200000, // 200,000 JPY
      startDate: '2024-03-15',
      endDate: '2024-03-25',
      expenses: [
        { amount: 15000, category: 'accommodation', description: 'Hotel Tokyo' },
        { amount: 3500, category: 'food', description: 'Ramen dinner' },
        { amount: 2000, category: 'transport', description: 'Subway' },
        { amount: 5000, category: 'attractions', description: 'Tokyo Skytree' },
        { amount: 8000, category: 'shopping', description: 'Souvenirs' },
        { amount: 12000, category: 'accommodation', description: 'Hotel Kyoto' },
        { amount: 4000, category: 'food', description: 'Kaiseki dinner' },
        { amount: 3000, category: 'transport', description: 'Shinkansen' },
        { amount: 1500, category: 'attractions', description: 'Fushimi Inari' }
      ]
    };
  };
}
