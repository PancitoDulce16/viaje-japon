/**
 * 🤖 PANEL CENTRAL DE IA
 * =======================
 *
 * Panel unificado que muestra todas las features de ML/IA:
 * - Health Score del itinerario
 * - Predicción de energía
 * - Anomalías detectadas
 * - Recomendaciones ML
 * - Comandos NLP
 * - Insights colaborativos
 */

class AIControlPanel {
  constructor() {
    this.isOpen = false;
    this.currentItinerary = null;

    console.log('🤖 AI Control Panel initialized');
  }

  /**
   * 🎨 Renderiza el botón flotante y panel
   */
  render() {
    // Verificar si ya existe
    if (document.getElementById('ai-control-panel-btn')) return;

    // Crear botón flotante
    const button = document.createElement('button');
    button.id = 'ai-control-panel-btn';
    button.className = 'fixed bottom-6 right-6 z-[60] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110';
    button.innerHTML = `
      <div class="relative">
        <span class="text-3xl">🤖</span>
        <span id="ai-notification-badge" class="hidden absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
          !
        </span>
      </div>
    `;
    button.title = 'Asistente IA';
    button.onclick = () => this.toggle();

    document.body.appendChild(button);

    // Crear panel lateral
    const panel = document.createElement('div');
    panel.id = 'ai-control-panel';
    panel.className = 'fixed top-0 right-0 h-full w-full md:w-[500px] bg-white dark:bg-gray-800 shadow-2xl z-[70] transform translate-x-full transition-transform duration-300 overflow-y-auto';
    panel.innerHTML = `
      <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 z-10 shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <span>🤖</span>
            <span>Asistente IA</span>
          </h2>
          <button onclick="window.AIControlPanel.close()" class="text-white hover:bg-white/20 rounded-lg p-2 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <p class="text-sm text-purple-100">
          Tu asistente inteligente para optimizar tu viaje
        </p>
      </div>

      <div class="p-6 space-y-6">
        <!-- NLP Command Input -->
        <div class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-700">
          <h3 class="text-sm font-bold mb-2 flex items-center gap-2">
            <span>🗣️</span>
            <span>Comando Rápido</span>
          </h3>
          <input
            type="text"
            id="ai-quick-command"
            placeholder='Ej: "Agrega más templos al día 3"'
            class="w-full px-4 py-2 rounded-lg border border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onclick="window.AIControlPanel.executeCommand()"
            class="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Ejecutar
          </button>
        </div>

        <!-- Health Score -->
        <div id="ai-health-score" class="bg-white dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
          <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
            <span>🏥</span>
            <span>Health Score del Itinerario</span>
          </h3>
          <div class="text-center text-gray-400">
            Selecciona un itinerario para ver el análisis
          </div>
        </div>

        <!-- Energy Prediction -->
        <div id="ai-energy-prediction" class="bg-white dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
          <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
            <span>⚡</span>
            <span>Predicción de Energía</span>
          </h3>
          <div class="text-center text-gray-400">
            Selecciona un itinerario para ver la predicción
          </div>
        </div>

        <!-- Anomalies -->
        <div id="ai-anomalies" class="bg-white dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
          <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
            <span>🔍</span>
            <span>Anomalías Detectadas</span>
          </h3>
          <div class="text-center text-gray-400">
            Selecciona un itinerario para ver anomalías
          </div>
        </div>

        <!-- ML Insights -->
        <div id="ai-ml-insights" class="bg-white dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
          <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
            <span>🧠</span>
            <span>Insights ML</span>
          </h3>
          <div class="text-center text-gray-400">
            Cargando insights...
          </div>
        </div>

        <!-- Collaborative Recommendations -->
        <div id="ai-collab-recs" class="bg-white dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
          <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
            <span>🤝</span>
            <span>Usuarios como tú visitaron...</span>
          </h3>
          <div class="text-center text-gray-400">
            Cargando recomendaciones...
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
            <span>⚡</span>
            <span>Acciones Rápidas</span>
          </h3>
          <div class="space-y-2">
            <button onclick="window.AIControlPanel.optimizeAllRoutes()" class="w-full text-left px-4 py-2 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-lg transition flex items-center gap-2">
              <span>🧬</span>
              <span class="text-sm">Optimizar todas las rutas</span>
            </button>
            <button onclick="window.AIControlPanel.detectAllAnomalies()" class="w-full text-left px-4 py-2 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-lg transition flex items-center gap-2">
              <span>🔍</span>
              <span class="text-sm">Detectar anomalías</span>
            </button>
            <button onclick="window.AIControlPanel.generateDescriptions()" class="w-full text-left px-4 py-2 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-lg transition flex items-center gap-2">
              <span>✍️</span>
              <span class="text-sm">Generar descripciones</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Cerrar al hacer click fuera (solo en desktop)
    panel.addEventListener('click', (e) => {
      if (e.target === panel && window.innerWidth < 768) {
        this.close();
      }
    });

    // 🔔 Escuchar eventos de actualización de itinerario
    window.addEventListener('itineraryUpdated', async (e) => {
      console.log('🔔 AI Panel: Itinerario actualizado', e.detail);
      if (e.detail && e.detail.itinerary) {
        await this.updateWithItinerary(e.detail.itinerary);
      }
    });

    window.addEventListener('itineraryLoaded', async (e) => {
      console.log('🔔 AI Panel: Itinerario cargado', e.detail);
      if (e.detail && e.detail.itinerary) {
        await this.updateWithItinerary(e.detail.itinerary);
      }
    });

    // Cargar datos iniciales
    this.loadInitialData();
  }

  /**
   * 🔄 Carga datos iniciales
   */
  async loadInitialData() {
    // Cargar ML Insights
    if (window.MLIntegration) {
      const stats = window.MLIntegration.getMLStats();
      const container = document.getElementById('ai-ml-insights');
      if (container && stats) {
        container.innerHTML = `
          <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
            <span>🧠</span>
            <span>Insights ML</span>
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Acciones totales:</span>
              <span class="font-semibold">${stats.totalActions || 0}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Top categorías:</span>
              <span class="font-semibold">${stats.topCategories?.length || 0}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Intereses:</span>
              <span class="font-semibold">${stats.topInterests?.length || 0}</span>
            </div>
          </div>
        `;
      }
    }

    // Cargar Collaborative Recommendations Stats
    if (window.CollaborativeRecommender) {
      const stats = window.CollaborativeRecommender.getStats();
      const container = document.getElementById('ai-collab-recs');
      if (container && stats) {
        container.innerHTML = `
          <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
            <span>🤝</span>
            <span>Sistema Colaborativo</span>
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Viajeros:</span>
              <span class="font-semibold">${stats.users}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Lugares:</span>
              <span class="font-semibold">${stats.places}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Calidad datos:</span>
              <span class="font-semibold">${stats.dataQuality}%</span>
            </div>
            ${stats.canRecommend ? `
              <div class="mt-2 text-xs text-green-600 dark:text-green-400">
                ✅ Listo para generar recomendaciones
              </div>
            ` : `
              <div class="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                ⚠️ Necesita más datos
              </div>
            `}
          </div>
        `;
      }
    }
  }

  /**
   * 🔄 Actualiza el panel con el itinerario actual
   */
  async updateWithItinerary(itinerary) {
    if (!itinerary || !itinerary.days) return;

    this.currentItinerary = itinerary;

    // Analizar con todos los sistemas
    await this.analyzeHealthScore(itinerary);
    await this.analyzeEnergy(itinerary);
    await this.analyzeAnomalies(itinerary);

    // Mostrar badge de notificación si hay problemas
    this.updateNotificationBadge();
  }

  /**
   * 🏥 Analiza Health Score
   */
  async analyzeHealthScore(itinerary) {
    const container = document.getElementById('ai-health-score');
    if (!container || !window.HealthCalculator) return;

    try {
      const health = window.HealthCalculator.calculateHealth(itinerary);

      const color = health.score >= 80 ? 'green' : health.score >= 60 ? 'yellow' : 'red';

      container.innerHTML = `
        <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
          <span>🏥</span>
          <span>Health Score</span>
        </h3>
        <div class="text-center mb-3">
          <div class="text-5xl font-bold text-${color}-600 dark:text-${color}-400">
            ${health.score}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
            ${health.verdict}
          </div>
        </div>
        <div class="space-y-1 text-xs">
          ${health.issues.slice(0, 3).map(issue => `
            <div class="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-600/50 rounded">
              <span>${issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵'}</span>
              <span>${issue.message}</span>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      console.error('Error analyzing health:', e);
    }
  }

  /**
   * ⚡ Analiza energía
   */
  async analyzeEnergy(itinerary) {
    const container = document.getElementById('ai-energy-prediction');
    if (!container || !window.EnergyBurnoutPredictor) return;

    try {
      const energyData = window.EnergyBurnoutPredictor.predictEnergyLevels(itinerary);

      container.innerHTML = `
        <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
          <span>⚡</span>
          <span>Predicción de Energía</span>
        </h3>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Promedio:</span>
            <span class="font-semibold">${energyData.summary.averageEnergy}%</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Tendencia:</span>
            <span class="font-semibold">${energyData.summary.trend === 'improving' ? '📈 Mejorando' : energyData.summary.trend === 'declining' ? '📉 Bajando' : '➡️ Estable'}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Riesgo burnout:</span>
            <span class="font-semibold">${energyData.summary.hasBurnoutRisk ? '⚠️ Sí' : '✅ No'}</span>
          </div>
        </div>
        ${energyData.recommendations.length > 0 ? `
          <div class="mt-3 text-xs bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
            <strong>⚠️ ${energyData.recommendations[0].title}</strong>
          </div>
        ` : ''}
      `;
    } catch (e) {
      console.error('Error analyzing energy:', e);
    }
  }

  /**
   * 🔍 Analiza anomalías
   */
  async analyzeAnomalies(itinerary) {
    const container = document.getElementById('ai-anomalies');
    if (!container || !window.AnomalyDetector) return;

    try {
      const anomalies = window.AnomalyDetector.analyzeItinerary(itinerary);

      const totalIssues = anomalies.critical.length + anomalies.warnings.length;

      container.innerHTML = `
        <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
          <span>🔍</span>
          <span>Anomalías (${totalIssues})</span>
        </h3>
        ${totalIssues === 0 ? `
          <div class="text-center text-green-600 dark:text-green-400 py-4">
            <div class="text-3xl mb-2">✨</div>
            <div class="text-sm">Sin anomalías detectadas</div>
          </div>
        ` : `
          <div class="space-y-2">
            ${anomalies.critical.slice(0, 2).map(issue => `
              <div class="text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-500">
                <div class="font-semibold text-red-800 dark:text-red-200">🔴 ${issue.title}</div>
                <div class="text-red-700 dark:text-red-300 mt-1">${issue.description}</div>
              </div>
            `).join('')}
            ${anomalies.warnings.slice(0, 2).map(issue => `
              <div class="text-xs p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-2 border-yellow-500">
                <div class="font-semibold text-yellow-800 dark:text-yellow-200">🟡 ${issue.title}</div>
                <div class="text-yellow-700 dark:text-yellow-300 mt-1">${issue.description}</div>
              </div>
            `).join('')}
          </div>
        `}
      `;
    } catch (e) {
      console.error('Error analyzing anomalies:', e);
    }
  }

  /**
   * 🔔 Actualiza badge de notificación
   */
  updateNotificationBadge() {
    const badge = document.getElementById('ai-notification-badge');
    if (!badge || !this.currentItinerary) return;

    // Contar issues críticos
    let criticalCount = 0;

    if (window.AnomalyDetector) {
      const anomalies = window.AnomalyDetector.analyzeItinerary(this.currentItinerary);
      criticalCount += anomalies.critical.length;
    }

    if (window.EnergyBurnoutPredictor) {
      const energyData = window.EnergyBurnoutPredictor.predictEnergyLevels(this.currentItinerary);
      if (energyData.summary.hasBurnoutRisk) criticalCount++;
    }

    if (criticalCount > 0) {
      badge.textContent = criticalCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  /**
   * 🗣️ Ejecuta comando NLP
   */
  async executeCommand() {
    const input = document.getElementById('ai-quick-command');
    if (!input || !input.value.trim()) return;

    const command = input.value.trim();

    if (!window.NLPCommandParser) {
      alert('❌ NLP Parser no disponible');
      return;
    }

    const parsed = window.NLPCommandParser.parse(command);

    if (parsed.success) {
      alert(`✅ Comando entendido:\n\nAcción: ${parsed.intent}\nConfianza: ${Math.round(parsed.confidence * 100)}%\n\nNota: Implementación de acciones próximamente`);
    } else {
      alert(`❌ No entendí el comando\n\n${parsed.error}\n\n${parsed.suggestion || ''}`);
    }

    input.value = '';
  }

  /**
   * ⚡ Acciones rápidas
   */
  async optimizeAllRoutes() {
    if (!this.currentItinerary) {
      alert('⚠️ Selecciona un itinerario primero');
      return;
    }
    alert('🧬 Optimizando rutas... (Implementación próximamente)');
  }

  async detectAllAnomalies() {
    if (!this.currentItinerary) {
      alert('⚠️ Selecciona un itinerario primero');
      return;
    }
    await this.analyzeAnomalies(this.currentItinerary);
    alert('✅ Anomalías detectadas. Revisa el panel.');
  }

  async generateDescriptions() {
    if (!this.currentItinerary) {
      alert('⚠️ Selecciona un itinerario primero');
      return;
    }
    alert('✍️ Generando descripciones... (Implementación próximamente)');
  }

  /**
   * 🔄 Toggle panel
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * 📂 Abre panel
   */
  open() {
    const panel = document.getElementById('ai-control-panel');
    if (panel) {
      panel.classList.remove('translate-x-full');
      this.isOpen = true;

      // Recargar datos si hay itinerario
      if (this.currentItinerary) {
        this.updateWithItinerary(this.currentItinerary);
      }
    }
  }

  /**
   * ❌ Cierra panel
   */
  close() {
    const panel = document.getElementById('ai-control-panel');
    if (panel) {
      panel.classList.add('translate-x-full');
      this.isOpen = false;
    }
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.AIControlPanel = new AIControlPanel();

  // Renderizar al cargar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AIControlPanel.render();
    });
  } else {
    window.AIControlPanel.render();
  }
}

export default AIControlPanel;
