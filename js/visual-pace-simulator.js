/**
 * 📊 SIMULADOR DE RITMO VISUAL (#5)
 * ===================================
 *
 * Muestra gráfico de intensidad hora por hora del día
 * para visualizar cómo se distribuye la energía a lo largo del itinerario.
 *
 * Características:
 * - Gráfico de intensidad por hora
 * - Visualización de walking distance
 * - Energy levels prediction
 * - Rest time calculation
 * - Usa Chart.js para gráficos
 */

class VisualPaceSimulator {
  constructor() {
    this.intensityLevels = {
      'temple': 80,
      'shrine': 75,
      'museum': 60,
      'park': 50,
      'garden': 45,
      'shopping': 70,
      'restaurant': 40,
      'cafe': 30,
      'nightlife': 85,
      'izakaya': 70,
      'bar': 75,
      'karaoke': 80,
      'hiking': 95,
      'onsen': 20,
      'tea-ceremony': 35,
      'market': 75,
      'street-food': 65,
      'observation-deck': 50,
      'aquarium': 60,
      'zoo': 70,
      'arcade': 80,
      'anime-shop': 70,
      'default': 60
    };

    this.chartInstance = null;
  }

  /**
   * 📊 Analiza un día completo y retorna datos para visualización
   * @param {Object} day - Día del itinerario
   * @returns {Object} Análisis completo
   */
  analyzeDay(day) {
    const hourlyData = this.generateHourlyBreakdown(day);
    const metrics = this.calculateDayMetrics(day, hourlyData);

    return {
      hourlyData,
      metrics,
      visualization: this.generateVisualizationData(hourlyData),
      recommendations: this.generateRecommendations(metrics)
    };
  }

  /**
   * ⏰ Genera breakdown hora por hora del día
   */
  generateHourlyBreakdown(day) {
    const breakdown = [];
    let currentHour = 9; // Asumir inicio a las 9am

    // Si el día tiene startTime, usarlo
    if (day.startTime) {
      currentHour = parseInt(day.startTime.split(':')[0]);
    }

    day.activities?.forEach((activity, index) => {
      const duration = activity.duration || 60; // Default 60 min
      const intensity = this.getActivityIntensity(activity);

      // Agregar actividad
      breakdown.push({
        hour: currentHour,
        type: 'activity',
        name: activity.name,
        category: activity.category,
        intensity,
        duration,
        energyCost: this.calculateEnergyCost(intensity, duration)
      });

      currentHour += Math.ceil(duration / 60);

      // Agregar tiempo de tránsito si no es la última actividad
      if (index < day.activities.length - 1) {
        const transitTime = this.estimateTransitTime(activity, day.activities[index + 1]);

        breakdown.push({
          hour: currentHour,
          type: 'transit',
          name: `Tránsito: ${activity.area || 'área'} → ${day.activities[index + 1].area || 'área'}`,
          intensity: 40, // Intensidad media para tránsito
          duration: transitTime,
          energyCost: this.calculateEnergyCost(40, transitTime)
        });

        currentHour += Math.ceil(transitTime / 60);
      }

      // Agregar descanso automático después de 2-3 actividades intensas
      if ((index + 1) % 3 === 0 && index < day.activities.length - 1) {
        breakdown.push({
          hour: currentHour,
          type: 'rest',
          name: 'Descanso / Snack',
          intensity: 20,
          duration: 30,
          energyCost: -10 // El descanso recupera energía
        });

        currentHour += 0.5;
      }
    });

    return breakdown;
  }

  /**
   * 🎯 Obtiene intensidad de una actividad
   */
  getActivityIntensity(activity) {
    const category = activity.category?.toLowerCase() || 'default';

    // Buscar intensidad exacta
    if (this.intensityLevels[category]) {
      return this.intensityLevels[category];
    }

    // Buscar por keywords en el nombre
    const name = activity.name?.toLowerCase() || '';

    if (name.includes('temple') || name.includes('shrine')) return 80;
    if (name.includes('museum')) return 60;
    if (name.includes('park') || name.includes('garden')) return 50;
    if (name.includes('shopping') || name.includes('market')) return 70;
    if (name.includes('restaurant') || name.includes('cafe')) return 35;
    if (name.includes('bar') || name.includes('izakaya')) return 75;
    if (name.includes('onsen') || name.includes('spa')) return 20;

    return this.intensityLevels.default;
  }

  /**
   * ⚡ Calcula costo energético
   */
  calculateEnergyCost(intensity, duration) {
    // Energía = (intensidad/100) * (duración en horas) * 100
    return (intensity / 100) * (duration / 60) * 100;
  }

  /**
   * 🚇 Estima tiempo de tránsito entre actividades
   */
  estimateTransitTime(activity1, activity2) {
    // Si están en la misma área, 15 min
    if (activity1.area === activity2.area) {
      return 15;
    }

    // Si tienen coordenadas, calcular distancia
    if (activity1.coordinates && activity2.coordinates) {
      const distance = this.calculateDistance(activity1.coordinates, activity2.coordinates);
      // 10 min por km + 5 min base
      return Math.min(Math.round(distance * 10 + 5), 60); // Max 60 min
    }

    // Default: 30 min
    return 30;
  }

  /**
   * 📏 Calcula distancia entre coordenadas
   */
  calculateDistance(coords1, coords2) {
    if (!coords1 || !coords2) return 5;

    // Validar que sean arrays o convertir de objeto
    if (!Array.isArray(coords1)) {
      if (coords1.lat !== undefined && coords1.lon !== undefined) {
        coords1 = [coords1.lat, coords1.lon];
      } else {
        return 5; // Default distance
      }
    }

    if (!Array.isArray(coords2)) {
      if (coords2.lat !== undefined && coords2.lon !== undefined) {
        coords2 = [coords2.lat, coords2.lon];
      } else {
        return 5; // Default distance
      }
    }

    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;

    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 📊 Calcula métricas del día
   */
  calculateDayMetrics(day, hourlyData) {
    const totalIntensity = hourlyData.reduce((sum, h) => sum + h.intensity, 0);
    const avgIntensity = totalIntensity / hourlyData.length;

    const totalEnergyCost = hourlyData.reduce((sum, h) => sum + h.energyCost, 0);

    const walkingActivities = hourlyData.filter(h =>
      h.type === 'activity' && (h.category === 'park' || h.category === 'temple' || h.category === 'shrine' || h.category === 'hiking')
    );
    const estimatedWalking = walkingActivities.length * 2 + (hourlyData.filter(h => h.type === 'transit').length * 0.5);

    const restTime = hourlyData.filter(h => h.type === 'rest').reduce((sum, h) => sum + h.duration, 0);

    const peakHours = hourlyData
      .filter(h => h.intensity >= 80)
      .map(h => `${h.hour}:00`);

    const lowEnergyHours = hourlyData
      .filter(h => h.intensity <= 30)
      .map(h => `${h.hour}:00`);

    return {
      avgIntensity: Math.round(avgIntensity),
      totalEnergyCost: Math.round(totalEnergyCost),
      estimatedWalking: estimatedWalking.toFixed(1),
      restTime,
      peakHours,
      lowEnergyHours,
      startHour: hourlyData[0]?.hour || 9,
      endHour: hourlyData[hourlyData.length - 1]?.hour || 20,
      totalDuration: hourlyData.reduce((sum, h) => sum + h.duration, 0)
    };
  }

  /**
   * 🎨 Genera datos para Chart.js
   */
  generateVisualizationData(hourlyData) {
    const labels = [];
    const intensityData = [];
    const energyData = [];

    hourlyData.forEach(item => {
      const label = `${item.hour}:00`;
      labels.push(label);
      intensityData.push(item.intensity);
      energyData.push(item.energyCost);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Intensidad (%)',
          data: intensityData,
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Costo Energético',
          data: energyData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    };
  }

  /**
   * 💡 Genera recomendaciones basadas en métricas
   */
  generateRecommendations(metrics) {
    const recommendations = [];

    if (metrics.avgIntensity > 75) {
      recommendations.push({
        type: 'warning',
        icon: '⚠️',
        message: 'Día muy intenso - considera reducir actividades o agregar más descansos'
      });
    }

    if (metrics.estimatedWalking > 15) {
      recommendations.push({
        type: 'warning',
        icon: '🚶',
        message: `${metrics.estimatedWalking}km de caminata estimada - lleva zapatos cómodos`
      });
    }

    if (metrics.restTime < 60) {
      recommendations.push({
        type: 'suggestion',
        icon: '☕',
        message: 'Considera agregar más tiempo de descanso para evitar fatiga'
      });
    }

    if (metrics.peakHours.length > 5) {
      recommendations.push({
        type: 'warning',
        icon: '🔥',
        message: 'Muchas horas de alta intensidad - balancea con actividades más relajadas'
      });
    }

    if (metrics.totalDuration > 720) { // Más de 12 horas
      recommendations.push({
        type: 'warning',
        icon: '⏰',
        message: 'Día muy largo - considera dividir actividades en dos días'
      });
    }

    if (metrics.avgIntensity >= 50 && metrics.avgIntensity <= 70 && metrics.estimatedWalking <= 12) {
      recommendations.push({
        type: 'success',
        icon: '✅',
        message: 'Excelente balance de intensidad y caminata'
      });
    }

    return recommendations;
  }

  /**
   * 📊 Renderiza gráfico usando Chart.js
   * @param {string} canvasId - ID del canvas element
   * @param {Object} dayData - Análisis del día
   */
  renderChart(canvasId, dayData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error(`Canvas ${canvasId} no encontrado`);
      return;
    }

    const ctx = canvas.getContext('2d');

    // Destruir gráfico anterior si existe
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Crear nuevo gráfico
    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: dayData.visualization,
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          title: {
            display: true,
            text: 'Ritmo del Día - Intensidad y Energía',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += Math.round(context.parsed.y * 100) / 100;
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Intensidad (%)'
            },
            min: 0,
            max: 100
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Energía'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  /**
   * 🎨 Genera visualización ASCII para consola/texto
   */
  generateASCIIVisualization(hourlyData) {
    let ascii = '\n📊 RITMO DEL DÍA:\n\n';

    hourlyData.forEach(item => {
      const bars = '█'.repeat(Math.round(item.intensity / 5));
      const emoji = this.getEmojiForIntensity(item.intensity);

      ascii += `${String(item.hour).padStart(2, '0')}:00 ${emoji} ${bars} (${item.intensity}% - ${item.name})\n`;
    });

    return ascii;
  }

  /**
   * 😊 Obtiene emoji basado en intensidad
   */
  getEmojiForIntensity(intensity) {
    if (intensity >= 90) return '🔥';
    if (intensity >= 75) return '💪';
    if (intensity >= 60) return '🚶';
    if (intensity >= 40) return '😊';
    if (intensity >= 25) return '☕';
    return '😴';
  }
}

// 🌐 Exportar para uso global
if (typeof window !== 'undefined') {
  window.VisualPaceSimulator = VisualPaceSimulator;
}
