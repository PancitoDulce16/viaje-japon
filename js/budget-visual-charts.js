/**
 * 💰 BUDGET VISUAL CHARTS
 * =======================
 * Beautiful interactive charts for budget visualization
 */

class BudgetVisualCharts {
  constructor() {
    this.charts = {};
    this.initialized = false;
  }

  /**
   * Initialize visual charts
   */
  async initialize() {
    if (this.initialized) return;

    console.log('💰 Initializing Budget Visual Charts...');

    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.error('❌ Chart.js not loaded!');
      return;
    }

    this.initialized = true;
    console.log('✅ Budget Visual Charts ready');
  }

  /**
   * Show budget charts panel
   */
  show() {
    if (!window.BudgetTracker || !window.BudgetTracker.expenses) {
      alert('No hay datos de presupuesto aún. Agrega algunos gastos primero.');
      return;
    }

    const panel = this.createChartsPanel();
    document.body.appendChild(panel);

    // Render charts after panel is in DOM
    setTimeout(() => {
      this.renderAllCharts();
    }, 100);
  }

  /**
   * Create charts panel
   */
  createChartsPanel() {
    const panel = document.createElement('div');
    panel.className = 'budget-charts-panel';
    panel.id = 'budget-charts-panel';

    const expenses = window.BudgetTracker.expenses || [];
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    panel.innerHTML = `
      <div class="budget-charts-overlay" onclick="document.getElementById('budget-charts-panel').remove()"></div>
      <div class="budget-charts-content">
        <!-- Header -->
        <div class="budget-charts-header">
          <div>
            <h2>💰 Análisis de Presupuesto</h2>
            <p class="budget-charts-subtitle">Total gastado: ¥${total.toLocaleString()} (~$${Math.round(total / 145)} USD)</p>
          </div>
          <button class="budget-charts-close" onclick="document.getElementById('budget-charts-panel').remove()">✕</button>
        </div>

        <!-- Charts Grid -->
        <div class="budget-charts-grid">
          <!-- Category Breakdown -->
          <div class="budget-chart-card">
            <h3>📊 Gastos por Categoría</h3>
            <div class="chart-container">
              <canvas id="budget-category-chart"></canvas>
            </div>
          </div>

          <!-- Daily Spending Trend -->
          <div class="budget-chart-card">
            <h3>📈 Tendencia Diaria</h3>
            <div class="chart-container">
              <canvas id="budget-daily-chart"></canvas>
            </div>
          </div>

          <!-- Budget vs Actual -->
          <div class="budget-chart-card full-width">
            <h3>⚖️ Presupuesto vs Real</h3>
            <div class="chart-container">
              <canvas id="budget-comparison-chart"></canvas>
            </div>
          </div>

          <!-- Spending Insights -->
          <div class="budget-chart-card full-width">
            <h3>💡 Insights</h3>
            <div class="budget-insights" id="budget-insights"></div>
          </div>
        </div>
      </div>
    `;

    return panel;
  }

  /**
   * Render all charts
   */
  renderAllCharts() {
    this.renderCategoryChart();
    this.renderDailyChart();
    this.renderComparisonChart();
    this.renderInsights();
  }

  /**
   * Render category breakdown pie chart
   */
  renderCategoryChart() {
    const canvas = document.getElementById('budget-category-chart');
    if (!canvas) return;

    const expenses = window.BudgetTracker.expenses || [];

    // Group by category
    const byCategory = expenses.reduce((acc, exp) => {
      const cat = exp.category || 'Otros';
      acc[cat] = (acc[cat] || 0) + exp.amount;
      return acc;
    }, {});

    const labels = Object.keys(byCategory);
    const data = Object.values(byCategory);

    // Category colors
    const colors = {
      'Comida': '#f59e0b',
      'Transporte': '#3b82f6',
      'Alojamiento': '#8b5cf6',
      'Entretenimiento': '#ec4899',
      'Compras': '#10b981',
      'Otros': '#6b7280'
    };

    const backgroundColors = labels.map(label => colors[label] || '#6b7280');

    // Destroy existing chart
    if (this.charts.category) {
      this.charts.category.destroy();
    }

    // Create new chart
    this.charts.category = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12,
                weight: '600'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ¥${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Render daily spending trend line chart
   */
  renderDailyChart() {
    const canvas = document.getElementById('budget-daily-chart');
    if (!canvas) return;

    const expenses = window.BudgetTracker.expenses || [];

    // Group by date
    const byDate = expenses.reduce((acc, exp) => {
      const date = exp.date || new Date(exp.timestamp).toLocaleDateString('es-ES');
      acc[date] = (acc[date] || 0) + exp.amount;
      return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(byDate).sort((a, b) => {
      return new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-'));
    });

    const labels = sortedDates;
    const data = sortedDates.map(date => byDate[date]);

    // Calculate cumulative
    const cumulative = [];
    let sum = 0;
    data.forEach(value => {
      sum += value;
      cumulative.push(sum);
    });

    // Destroy existing chart
    if (this.charts.daily) {
      this.charts.daily.destroy();
    }

    // Create new chart
    this.charts.daily = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Gasto Diario',
            data: data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Acumulado',
            data: cumulative,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 10,
              font: {
                size: 11,
                weight: '600'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y || 0;
                return `${label}: ¥${value.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '¥' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  /**
   * Render budget vs actual comparison
   */
  renderComparisonChart() {
    const canvas = document.getElementById('budget-comparison-chart');
    if (!canvas) return;

    const expenses = window.BudgetTracker.expenses || [];

    // Get categories
    const categories = ['Comida', 'Transporte', 'Alojamiento', 'Entretenimiento', 'Compras'];

    // Suggested budgets (example values)
    const suggestedBudgets = {
      'Comida': 50000,
      'Transporte': 30000,
      'Alojamiento': 70000,
      'Entretenimiento': 40000,
      'Compras': 30000
    };

    // Calculate actual spending
    const actualSpending = categories.map(cat => {
      return expenses
        .filter(exp => exp.category === cat)
        .reduce((sum, exp) => sum + exp.amount, 0);
    });

    const budgets = categories.map(cat => suggestedBudgets[cat] || 0);

    // Destroy existing chart
    if (this.charts.comparison) {
      this.charts.comparison.destroy();
    }

    // Create new chart
    this.charts.comparison = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Presupuesto Sugerido',
            data: budgets,
            backgroundColor: 'rgba(209, 213, 219, 0.5)',
            borderColor: '#9ca3af',
            borderWidth: 2
          },
          {
            label: 'Gasto Real',
            data: actualSpending,
            backgroundColor: budgets.map((budget, i) => {
              const actual = actualSpending[i];
              if (actual > budget) return 'rgba(239, 68, 68, 0.7)'; // Over budget - red
              if (actual > budget * 0.8) return 'rgba(245, 158, 11, 0.7)'; // Near budget - orange
              return 'rgba(16, 185, 129, 0.7)'; // Under budget - green
            }),
            borderColor: budgets.map((budget, i) => {
              const actual = actualSpending[i];
              if (actual > budget) return '#dc2626';
              if (actual > budget * 0.8) return '#d97706';
              return '#059669';
            }),
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12,
                weight: '600'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y || 0;
                return `${label}: ¥${value.toLocaleString()}`;
              },
              afterLabel: function(context) {
                if (context.datasetIndex === 1) {
                  const budget = budgets[context.dataIndex];
                  const actual = actualSpending[context.dataIndex];
                  const diff = budget - actual;
                  const percentage = ((actual / budget) * 100).toFixed(1);
                  return `${percentage}% del presupuesto\n${diff > 0 ? 'Ahorro' : 'Exceso'}: ¥${Math.abs(diff).toLocaleString()}`;
                }
                return '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '¥' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  /**
   * Render spending insights
   */
  renderInsights() {
    const container = document.getElementById('budget-insights');
    if (!container) return;

    const expenses = window.BudgetTracker.expenses || [];
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate insights
    const insights = [];

    // Top category
    const byCategory = expenses.reduce((acc, exp) => {
      const cat = exp.category || 'Otros';
      acc[cat] = (acc[cat] || 0) + exp.amount;
      return acc;
    }, {});

    const topCategory = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])[0];

    if (topCategory) {
      const percentage = ((topCategory[1] / total) * 100).toFixed(1);
      insights.push({
        icon: '📊',
        text: `${topCategory[0]} es tu categoría principal con ${percentage}% del gasto total (¥${topCategory[1].toLocaleString()})`
      });
    }

    // Average daily spending
    const dates = [...new Set(expenses.map(exp => exp.date || new Date(exp.timestamp).toLocaleDateString('es-ES')))];
    if (dates.length > 0) {
      const avgDaily = Math.round(total / dates.length);
      insights.push({
        icon: '📅',
        text: `Promedio de gasto diario: ¥${avgDaily.toLocaleString()} (~$${Math.round(avgDaily / 145)} USD)`
      });
    }

    // Budget status
    const totalBudget = 220000; // Example total budget
    const remaining = totalBudget - total;
    const percentageUsed = ((total / totalBudget) * 100).toFixed(1);

    if (remaining > 0) {
      insights.push({
        icon: '💰',
        text: `Te quedan ¥${remaining.toLocaleString()} del presupuesto (${percentageUsed}% usado)`
      });
    } else {
      insights.push({
        icon: '⚠️',
        text: `Has excedido el presupuesto por ¥${Math.abs(remaining).toLocaleString()}`
      });
    }

    // Most expensive item
    const mostExpensive = expenses.sort((a, b) => b.amount - a.amount)[0];
    if (mostExpensive) {
      insights.push({
        icon: '💎',
        text: `Gasto más alto: ${mostExpensive.description || 'Sin descripción'} - ¥${mostExpensive.amount.toLocaleString()}`
      });
    }

    // Spending trend
    if (dates.length >= 3) {
      const recent = expenses
        .filter(exp => {
          const expDate = new Date(exp.date || exp.timestamp);
          const now = new Date();
          const daysDiff = (now - expDate) / (1000 * 60 * 60 * 24);
          return daysDiff <= 3;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      const recentAvg = recent / 3;
      const overallAvg = total / dates.length;

      if (recentAvg > overallAvg * 1.2) {
        insights.push({
          icon: '📈',
          text: `Estás gastando más de lo usual en los últimos días. Promedio reciente: ¥${Math.round(recentAvg).toLocaleString()}/día`
        });
      } else if (recentAvg < overallAvg * 0.8) {
        insights.push({
          icon: '📉',
          text: `Estás gastando menos últimamente. ¡Buen control del presupuesto!`
        });
      }
    }

    // Render insights
    container.innerHTML = insights.map(insight => `
      <div class="budget-insight-item">
        <span class="insight-icon">${insight.icon}</span>
        <span class="insight-text">${insight.text}</span>
      </div>
    `).join('');
  }

  /**
   * Destroy all charts
   */
  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.BudgetVisualCharts = new BudgetVisualCharts();

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.BudgetVisualCharts.initialize();
    });
  } else {
    window.BudgetVisualCharts.initialize();
  }
}
