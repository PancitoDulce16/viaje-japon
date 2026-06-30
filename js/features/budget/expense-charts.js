// js/expense-charts.js - Gráficos Visuales para Gastos

export const ExpenseCharts = {
  charts: {},

  /**
   * Renderizar gráfico de gastos por persona (Bar Chart)
   */
  renderPaymentsByPersonChart(canvasId, paymentsByMember, membersInfo) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Destruir gráfico anterior si existe
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');

    // Preparar datos
    const members = Object.keys(paymentsByMember);
    const amounts = Object.values(paymentsByMember);
    const labels = members.map(memberId => membersInfo[memberId]?.displayName || 'Usuario');

    // Colores gradient
    const colors = members.map((_, index) => {
      const hue = (index * 360) / members.length;
      return `hsl(${hue}, 70%, 60%)`;
    });

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Pagado (¥)',
          data: amounts,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('60%', '50%')),
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: colors.map(c => c.replace('60%', '70%'))
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `¥${context.parsed.y.toLocaleString()}`;
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `¥${value.toLocaleString()}`,
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { size: 11, weight: 'bold' }
            }
          }
        }
      }
    });
  },

  /**
   * Renderizar gráfico de distribución de deudas (Doughnut Chart)
   */
  renderDebtsDistributionChart(canvasId, summary) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Destruir gráfico anterior si existe
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');

    // Calcular quién está sobre/bajo el promedio
    const overPaid = [];
    const underPaid = [];
    const perPerson = summary.perPerson;

    Object.entries(summary.paymentsByMember).forEach(([memberId, amount]) => {
      const difference = amount - perPerson;
      if (difference > 0) {
        overPaid.push({ member: memberId, amount: difference });
      } else if (difference < 0) {
        underPaid.push({ member: memberId, amount: Math.abs(difference) });
      }
    });

    const totalOverPaid = overPaid.reduce((sum, item) => sum + item.amount, 0);
    const totalUnderPaid = underPaid.reduce((sum, item) => sum + item.amount, 0);

    this.charts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pagaron de más', 'Deben dinero'],
        datasets: [{
          label: 'Balance (¥)',
          data: [totalOverPaid, totalUnderPaid],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // Green - pagaron más
            'rgba(234, 179, 8, 0.8)'    // Yellow - deben
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(234, 179, 8, 1)'
          ],
          borderWidth: 2,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12, weight: 'bold' },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ¥${value.toLocaleString()} (${percentage}%)`;
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8
          }
        }
      }
    });
  },

  /**
   * Renderizar gráfico de balance (Horizontal Bar)
   */
  renderBalanceChart(canvasId, paymentsByMember, perPerson, membersInfo) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Destruir gráfico anterior si existe
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');

    // Calcular balances
    const balances = Object.entries(paymentsByMember).map(([memberId, paid]) => {
      return {
        member: membersInfo[memberId]?.displayName || 'Usuario',
        balance: paid - perPerson
      };
    }).sort((a, b) => b.balance - a.balance);

    const labels = balances.map(b => b.member);
    const data = balances.map(b => b.balance);

    // Colores: verde si pagaron más, rojo si deben
    const colors = data.map(value =>
      value >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
    );

    const borderColors = data.map(value =>
      value >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
    );

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Balance (¥)',
          data: data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.x;
                const prefix = value >= 0 ? 'Pagaron ' : 'Deben ';
                return `${prefix}¥${Math.abs(value).toLocaleString()}`;
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            ticks: {
              callback: (value) => {
                const prefix = value >= 0 ? '+' : '';
                return `${prefix}¥${value.toLocaleString()}`;
              },
              font: { size: 11 }
            },
            grid: {
              color: (context) => {
                return context.tick.value === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)';
              },
              lineWidth: (context) => {
                return context.tick.value === 0 ? 2 : 1;
              }
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: { size: 11, weight: 'bold' }
            }
          }
        }
      }
    });
  },

  /**
   * Destruir todos los gráficos
   */
  destroyAll() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  }
};

// Exportar globalmente
window.ExpenseCharts = ExpenseCharts;

console.log('✅ Expense Charts module loaded');

export default ExpenseCharts;
