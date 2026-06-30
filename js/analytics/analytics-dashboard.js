/**
 * 📊 ANALYTICS DASHBOARD
 * ======================
 *
 * Interactive visualizations and analytics for trip data
 */

class AnalyticsDashboard {
  constructor() {
    this.charts = {};
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    console.log('📊 Analytics Dashboard initializing...');

    // Wait for Chart.js to load
    await this.waitForChartJS();

    this.initialized = true;
    console.log('✅ Analytics Dashboard ready');
  }

  /**
   * Wait for Chart.js library to be available
   */
  async waitForChartJS() {
    return new Promise((resolve) => {
      if (typeof Chart !== 'undefined') {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if (typeof Chart !== 'undefined') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        console.warn('⚠️ Chart.js not loaded, using fallback');
        resolve();
      }, 10000);
    });
  }

  /**
   * Create activity distribution chart (pie/doughnut)
   */
  createActivityDistributionChart(canvasId, itinerary) {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not available');
      return null;
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    // Destroy existing chart
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    // Count activities by category
    const categoryCounts = {};
    const categoryColors = {
      'temple': '#FF6B6B',
      'shrine': '#4ECDC4',
      'restaurant': '#FFE66D',
      'shopping': '#95E1D3',
      'nature': '#38A169',
      'museum': '#9B59B6',
      'attraction': '#3498DB',
      'accommodation': '#E74C3C',
      'transport': '#95A5A6',
      'other': '#BDC3C7'
    };

    itinerary.days.forEach(day => {
      if (day.activities) {
        day.activities.forEach(activity => {
          const category = activity.category || 'other';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
      }
    });

    const labels = Object.keys(categoryCounts).map(cat =>
      cat.charAt(0).toUpperCase() + cat.slice(1)
    );
    const data = Object.values(categoryCounts);
    const colors = Object.keys(categoryCounts).map(cat =>
      categoryColors[cat] || '#BDC3C7'
    );

    this.charts[canvasId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff'
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
              font: {
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: 'Distribución de Actividades',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: 20
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return this.charts[canvasId];
  }

  /**
   * Create activities per day chart (bar)
   */
  createActivitiesPerDayChart(canvasId, itinerary) {
    if (typeof Chart === 'undefined') return null;

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const labels = itinerary.days.map((day, index) => `Día ${index + 1}`);
    const data = itinerary.days.map(day =>
      day.activities ? day.activities.length : 0
    );

    // Color based on intensity
    const colors = data.map(count => {
      if (count <= 2) return '#38A169'; // Green - relaxed
      if (count <= 4) return '#3498DB'; // Blue - moderate
      if (count <= 6) return '#F39C12'; // Orange - busy
      return '#E74C3C'; // Red - very busy
    });

    this.charts[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Actividades',
          data: data,
          backgroundColor: colors,
          borderRadius: 8,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Actividades por Día',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: 20
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const count = context.parsed.y;
                if (count <= 2) return '🟢 Día relajado';
                if (count <= 4) return '🔵 Día moderado';
                if (count <= 6) return '🟠 Día ocupado';
                return '🔴 Día muy ocupado';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    return this.charts[canvasId];
  }

  /**
   * Create timeline heatmap
   */
  createTimelineHeatmap(canvasId, itinerary) {
    if (typeof Chart === 'undefined') return null;

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    // Calculate intensity score for each day
    const labels = itinerary.days.map((day, index) => `Día ${index + 1}`);
    const intensityData = itinerary.days.map(day => {
      if (!day.activities) return 0;

      // Intensity = (number of activities * 10) + variety bonus
      const count = day.activities.length;
      const uniqueCategories = new Set(day.activities.map(a => a.category)).size;
      return (count * 10) + (uniqueCategories * 5);
    });

    const colors = intensityData.map(intensity => {
      if (intensity <= 20) return '#C6F6D5';
      if (intensity <= 40) return '#68D391';
      if (intensity <= 60) return '#F6AD55';
      return '#FC8181';
    });

    this.charts[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Intensidad',
          data: intensityData,
          backgroundColor: colors,
          borderRadius: 6
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
          title: {
            display: true,
            text: 'Intensidad del Viaje',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: 20
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const intensity = context.parsed.x;
                let level = '';
                if (intensity <= 20) level = '🟢 Muy relajado';
                else if (intensity <= 40) level = '🔵 Moderado';
                else if (intensity <= 60) level = '🟠 Intenso';
                else level = '🔴 Muy intenso';
                return `${level} (${intensity} pts)`;
              }
            }
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    return this.charts[canvasId];
  }

  /**
   * Create category timeline (stacked area)
   */
  createCategoryTimelineChart(canvasId, itinerary) {
    if (typeof Chart === 'undefined') return null;

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const categories = ['temple', 'shrine', 'restaurant', 'shopping', 'nature', 'museum', 'attraction'];
    const categoryColors = {
      'temple': 'rgba(255, 107, 107, 0.7)',
      'shrine': 'rgba(78, 205, 196, 0.7)',
      'restaurant': 'rgba(255, 230, 109, 0.7)',
      'shopping': 'rgba(149, 225, 211, 0.7)',
      'nature': 'rgba(56, 161, 105, 0.7)',
      'museum': 'rgba(155, 89, 182, 0.7)',
      'attraction': 'rgba(52, 152, 219, 0.7)'
    };

    const labels = itinerary.days.map((day, index) => `Día ${index + 1}`);

    const datasets = categories.map(category => {
      const data = itinerary.days.map(day => {
        if (!day.activities) return 0;
        return day.activities.filter(a => a.category === category).length;
      });

      return {
        label: category.charAt(0).toUpperCase() + category.slice(1),
        data: data,
        backgroundColor: categoryColors[category],
        borderColor: categoryColors[category].replace('0.7', '1'),
        borderWidth: 2,
        fill: true
      };
    });

    this.charts[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 10,
              font: {
                size: 11
              }
            }
          },
          title: {
            display: true,
            text: 'Evolución de Actividades por Tipo',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: 20
          }
        },
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            stacked: true,
            grid: {
              display: false
            }
          }
        }
      }
    });

    return this.charts[canvasId];
  }

  /**
   * Refresh all charts with new data
   */
  refreshCharts(itinerary) {
    if (!itinerary || !itinerary.days) return;

    // Refresh each chart if canvas exists
    if (document.getElementById('activityDistributionChart')) {
      this.createActivityDistributionChart('activityDistributionChart', itinerary);
    }

    if (document.getElementById('activitiesPerDayChart')) {
      this.createActivitiesPerDayChart('activitiesPerDayChart', itinerary);
    }

    if (document.getElementById('timelineHeatmap')) {
      this.createTimelineHeatmap('timelineHeatmap', itinerary);
    }

    if (document.getElementById('categoryTimelineChart')) {
      this.createCategoryTimelineChart('categoryTimelineChart', itinerary);
    }
  }

  /**
   * Destroy all charts
   */
  destroyAllCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.AnalyticsDashboard = new AnalyticsDashboard();
  console.log('📊 Analytics Dashboard loaded!');
}
