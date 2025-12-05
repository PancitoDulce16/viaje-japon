/* ========================================
   HEALTH DASHBOARD - Panel de Salud del Itinerario
   Visualiza problemas, métricas y permite quick fixes
   ======================================== */

import { HealthCalculator } from './health-calculator.js';
import { QuickFixes } from './quick-fixes.js';
import { Notifications } from '/js/notifications.js';

export class HealthDashboard {
  constructor() {
    this.isOpen = false;
    this.currentTab = 'overview';
    this.healthData = null;
    this.itinerary = null;
    this.tripId = null;
    this.quickFixes = null;
  }

  /**
   * Inicializar el dashboard
   */
  init() {
    console.log('🏥 Inicializando Health Dashboard...');
    this.createFloatingButton();
    this.createDashboardPanel();
    this.setupEventListeners();
  }

  /**
   * Crear botón flotante con badge de score
   */
  createFloatingButton() {
    // Remover botón existente si hay
    const existing = document.getElementById('healthFloatingBtn');
    if (existing) existing.remove();

    const button = document.createElement('button');
    button.id = 'healthFloatingBtn';
    button.className = 'health-floating-btn hidden';
    button.innerHTML = `
      <div class="relative">
        <span class="text-2xl">🏥</span>
        <span id="healthScoreBadge" class="health-score-badge">--</span>
      </div>
    `;

    document.body.appendChild(button);

    button.addEventListener('click', () => this.toggle());
  }

  /**
   * Crear panel principal del dashboard
   */
  createDashboardPanel() {
    // Remover panel existente si hay
    const existing = document.getElementById('healthDashboardPanel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'healthDashboardPanel';
    panel.className = 'health-dashboard-panel';
    panel.innerHTML = `
      <!-- Header -->
      <div class="health-dashboard-header">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🏥</span>
          <div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Health Dashboard</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">Diagnóstico del itinerario</p>
          </div>
        </div>
        <button id="closeDashboard" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="health-dashboard-tabs">
        <button class="health-tab active" data-tab="overview">
          <span class="text-lg">📊</span>
          <span>Overview</span>
        </button>
        <button class="health-tab" data-tab="issues">
          <span class="text-lg">⚠️</span>
          <span>Issues</span>
          <span id="issuesCount" class="health-tab-badge">0</span>
        </button>
        <button class="health-tab" data-tab="quick-fixes">
          <span class="text-lg">🔧</span>
          <span>Quick Fixes</span>
        </button>
        <button class="health-tab" data-tab="analytics">
          <span class="text-lg">📈</span>
          <span>Analytics</span>
        </button>
      </div>

      <!-- Content -->
      <div class="health-dashboard-content" id="dashboardContent">
        <!-- Content will be dynamically loaded here -->
      </div>

      <!-- Actions Footer -->
      <div class="health-dashboard-footer">
        <button id="refreshHealthBtn" class="btn-secondary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh
        </button>
        <button id="fixAllBtn" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          Fix All Issues
        </button>
      </div>
    `;

    document.body.appendChild(panel);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Close button
    document.getElementById('closeDashboard')?.addEventListener('click', () => this.close());

    // Tab switching
    document.querySelectorAll('.health-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.currentTarget.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Refresh button
    document.getElementById('refreshHealthBtn')?.addEventListener('click', () => this.analyze());

    // Fix all button
    document.getElementById('fixAllBtn')?.addEventListener('click', () => this.fixAllIssues());
  }

  /**
   * Abrir dashboard
   */
  async open(itinerary, tripId) {
    this.itinerary = itinerary;
    this.tripId = tripId;
    this.isOpen = true;

    // Mostrar panel
    const panel = document.getElementById('healthDashboardPanel');
    if (panel) {
      panel.classList.add('open');
    }

    // Analizar itinerario
    await this.analyze();
  }

  /**
   * Cerrar dashboard
   */
  close() {
    this.isOpen = false;
    const panel = document.getElementById('healthDashboardPanel');
    if (panel) {
      panel.classList.remove('open');
    }
  }

  /**
   * Toggle dashboard
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      // Necesitamos obtener el itinerario actual
      if (window.ItineraryHandler?.currentItinerary) {
        this.open(
          window.ItineraryHandler.currentItinerary,
          window.ItineraryHandler.currentTripId
        );
      } else {
        Notifications.error('No hay itinerario cargado');
      }
    }
  }

  /**
   * Analizar salud del itinerario
   */
  async analyze() {
    if (!this.itinerary) {
      Notifications.error('No hay itinerario para analizar');
      return;
    }

    console.log('🔍 Analizando salud del itinerario...');

    // Mostrar loading
    this.showLoading();

    // Ejecutar análisis
    const calculator = new HealthCalculator(this.itinerary);
    this.healthData = calculator.analyze();

    // Inicializar quick fixes
    this.quickFixes = new QuickFixes(this.itinerary, this.tripId);

    // Actualizar badge del botón flotante
    this.updateScoreBadge(this.healthData.score);

    // Actualizar badge de issues count
    const totalIssues = this.healthData.issues.critical.length +
                        this.healthData.issues.warnings.length +
                        this.healthData.issues.suggestions.length;

    const issuesCountBadge = document.getElementById('issuesCount');
    if (issuesCountBadge) {
      issuesCountBadge.textContent = totalIssues;
      issuesCountBadge.classList.toggle('hidden', totalIssues === 0);
    }

    // Renderizar tab actual
    this.renderCurrentTab();

    console.log('✅ Análisis completado:', this.healthData);
  }

  /**
   * Actualizar badge de score
   */
  updateScoreBadge(score) {
    const badge = document.getElementById('healthScoreBadge');
    if (!badge) return;

    badge.textContent = score;

    // Color según score
    badge.className = 'health-score-badge';
    if (score >= 80) {
      badge.classList.add('score-excellent');
    } else if (score >= 60) {
      badge.classList.add('score-good');
    } else if (score >= 40) {
      badge.classList.add('score-warning');
    } else {
      badge.classList.add('score-critical');
    }
  }

  /**
   * Mostrar el botón flotante
   */
  show() {
    const button = document.getElementById('healthFloatingBtn');
    if (button) {
      button.classList.remove('hidden');
    }
  }

  /**
   * Ocultar el botón flotante
   */
  hide() {
    const button = document.getElementById('healthFloatingBtn');
    if (button) {
      button.classList.add('hidden');
    }
    this.close();
  }

  /**
   * Cambiar tab activo
   */
  switchTab(tabName) {
    this.currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.health-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Render content
    this.renderCurrentTab();
  }

  /**
   * Renderizar contenido del tab actual
   */
  renderCurrentTab() {
    const content = document.getElementById('dashboardContent');
    if (!content) return;

    switch (this.currentTab) {
      case 'overview':
        content.innerHTML = this.renderOverview();
        break;
      case 'issues':
        content.innerHTML = this.renderIssues();
        break;
      case 'quick-fixes':
        content.innerHTML = this.renderQuickFixes();
        break;
      case 'analytics':
        content.innerHTML = this.renderAnalytics();
        break;
    }

    // Setup event listeners for rendered content
    this.setupContentListeners();
  }

  /**
   * Renderizar tab Overview
   */
  renderOverview() {
    if (!this.healthData) return '<div class="text-center py-8 text-gray-500">Cargando...</div>';

    const { score, issues, metrics } = this.healthData;
    const totalIssues = issues.critical.length + issues.warnings.length + issues.suggestions.length;

    // Determinar mensaje de salud
    let healthMessage = '';
    let healthEmoji = '';
    if (score >= 80) {
      healthMessage = 'Tu itinerario está en excelente forma!';
      healthEmoji = '🎉';
    } else if (score >= 60) {
      healthMessage = 'Tu itinerario está bien, pero hay áreas de mejora';
      healthEmoji = '👍';
    } else if (score >= 40) {
      healthMessage = 'Tu itinerario necesita atención';
      healthEmoji = '⚠️';
    } else {
      healthMessage = 'Tu itinerario tiene problemas críticos';
      healthEmoji = '🚨';
    }

    return `
      <div class="space-y-6">
        <!-- Score Circle -->
        <div class="flex flex-col items-center justify-center py-8">
          <div class="relative">
            <svg class="health-score-circle" width="200" height="200">
              <circle class="score-bg" cx="100" cy="100" r="80" />
              <circle class="score-fill score-${this.getScoreClass(score)}"
                      cx="100" cy="100" r="80"
                      stroke-dasharray="${(score / 100) * 502.4}, 502.4" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-5xl font-bold text-gray-800 dark:text-white">${score}</span>
              <span class="text-sm text-gray-600 dark:text-gray-400">/ 100</span>
            </div>
          </div>
          <div class="mt-4 text-center">
            <p class="text-xl font-semibold text-gray-800 dark:text-white">
              ${healthEmoji} ${healthMessage}
            </p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="health-stat-card">
            <span class="text-2xl">🔴</span>
            <div class="stat-value">${issues.critical.length}</div>
            <div class="stat-label">Críticos</div>
          </div>
          <div class="health-stat-card">
            <span class="text-2xl">🟡</span>
            <div class="stat-value">${issues.warnings.length}</div>
            <div class="stat-label">Warnings</div>
          </div>
          <div class="health-stat-card">
            <span class="text-2xl">🔵</span>
            <div class="stat-value">${issues.suggestions.length}</div>
            <div class="stat-label">Sugerencias</div>
          </div>
          <div class="health-stat-card">
            <span class="text-2xl">📅</span>
            <div class="stat-value">${metrics.totalDays}</div>
            <div class="stat-label">Días</div>
          </div>
        </div>

        <!-- Metrics Summary -->
        <div class="health-metrics-card">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Métricas del Itinerario</h3>
          <div class="space-y-3">
            <div class="metric-row">
              <span class="metric-label">Total de Actividades:</span>
              <span class="metric-value">${metrics.totalActivities}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Promedio por Día:</span>
              <span class="metric-value">${metrics.averageActivitiesPerDay.toFixed(1)}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Costo Estimado:</span>
              <span class="metric-value">¥${metrics.totalEstimatedCost.toLocaleString()}</span>
            </div>
            ${metrics.overloadedDays.length > 0 ? `
              <div class="metric-row">
                <span class="metric-label text-orange-600 dark:text-orange-400">Días Sobrecargados:</span>
                <span class="metric-value">${metrics.overloadedDays.length}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Quick Actions -->
        ${totalIssues > 0 ? `
          <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-700">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-200">
                  ${totalIssues} problema${totalIssues > 1 ? 's' : ''} detectado${totalIssues > 1 ? 's' : ''}
                </h3>
                <p class="text-sm text-purple-700 dark:text-purple-300">
                  Usa Quick Fixes para resolverlos automáticamente
                </p>
              </div>
              <button onclick="window.HealthDashboard.switchTab('issues')"
                      class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Ver Issues
              </button>
            </div>
          </div>
        ` : `
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-700 text-center">
            <span class="text-4xl">✨</span>
            <h3 class="text-lg font-semibold text-green-900 dark:text-green-200 mt-2">
              ¡Itinerario perfecto!
            </h3>
            <p class="text-sm text-green-700 dark:text-green-300 mt-1">
              No se encontraron problemas. Tu itinerario está listo para el viaje.
            </p>
          </div>
        `}
      </div>
    `;
  }

  /**
   * Renderizar tab Issues
   */
  renderIssues() {
    if (!this.healthData) return '<div class="text-center py-8 text-gray-500">Cargando...</div>';

    const { issues } = this.healthData;
    const allIssues = [
      ...issues.critical.map(i => ({ ...i, severity: 'critical' })),
      ...issues.warnings.map(i => ({ ...i, severity: 'warning' })),
      ...issues.suggestions.map(i => ({ ...i, severity: 'suggestion' }))
    ];

    if (allIssues.length === 0) {
      return `
        <div class="text-center py-12">
          <span class="text-6xl">✨</span>
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white mt-4">
            No hay issues
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            Tu itinerario no tiene problemas detectados
          </p>
        </div>
      `;
    }

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
            ${allIssues.length} Issue${allIssues.length > 1 ? 's' : ''} Detectado${allIssues.length > 1 ? 's' : ''}
          </h3>
        </div>

        ${allIssues.map(issue => this.renderIssueCard(issue)).join('')}
      </div>
    `;
  }

  /**
   * Renderizar una issue card
   */
  renderIssueCard(issue) {
    const severityClasses = {
      critical: 'border-red-500 bg-red-50 dark:bg-red-900/20',
      warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      suggestion: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    };

    const severityLabels = {
      critical: '🔴 Crítico',
      warning: '🟡 Warning',
      suggestion: '🔵 Sugerencia'
    };

    return `
      <div class="health-issue-card ${severityClasses[issue.severity]}">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">${issue.icon}</span>
              <h4 class="font-semibold text-gray-800 dark:text-white">${issue.title}</h4>
              <span class="severity-badge ${issue.severity}">${severityLabels[issue.severity]}</span>
            </div>
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
              ${issue.description}
            </p>
            ${issue.day ? `
              <span class="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                📅 Día ${issue.day}
              </span>
            ` : ''}
          </div>
          ${issue.fixable ? `
            <button onclick="window.HealthDashboard.runQuickFix('${issue.fixAction}', '${issue.id}')"
                    class="ml-4 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Fix
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Renderizar tab Quick Fixes
   */
  renderQuickFixes() {
    if (!this.healthData) return '<div class="text-center py-8 text-gray-500">Cargando...</div>';

    const { issues } = this.healthData;
    const fixableIssues = [
      ...issues.critical,
      ...issues.warnings,
      ...issues.suggestions
    ].filter(i => i.fixable);

    if (fixableIssues.length === 0) {
      return `
        <div class="text-center py-12">
          <span class="text-6xl">✅</span>
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white mt-4">
            No hay fixes disponibles
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            Todos los issues han sido resueltos o no tienen fix automático
          </p>
        </div>
      `;
    }

    return `
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <h3 class="font-semibold text-gray-800 dark:text-white mb-2">
            🔧 ${fixableIssues.length} Fix${fixableIssues.length > 1 ? 'es' : ''} Automático${fixableIssues.length > 1 ? 's' : ''} Disponible${fixableIssues.length > 1 ? 's' : ''}
          </h3>
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Los Quick Fixes modificarán automáticamente tu itinerario para resolver problemas detectados.
          </p>
          <button onclick="window.HealthDashboard.fixAllIssues()"
                  class="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
            ⚡ Ejecutar Todos los Fixes
          </button>
        </div>

        <div class="space-y-3">
          ${fixableIssues.map(issue => `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xl">${issue.icon}</span>
                    <h4 class="font-semibold text-gray-800 dark:text-white text-sm">${issue.title}</h4>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-400">
                    ${this.getFixActionDescription(issue.fixAction)}
                  </p>
                </div>
                <button onclick="window.HealthDashboard.runQuickFix('${issue.fixAction}', '${issue.id}')"
                        class="ml-4 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors">
                  Fix
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Obtener descripción de una acción de fix
   */
  getFixActionDescription(fixAction) {
    const descriptions = {
      fillDay: 'Generar actividades para el día vacío',
      resolveOverlap: 'Reajustar horarios para eliminar conflictos',
      adjustTransportTime: 'Agregar tiempo de transporte adicional',
      balanceDay: 'Reducir actividades del día sobrecargado',
      fillGap: 'Llenar tiempo libre con actividad sugerida',
      reduceBudget: 'Encontrar alternativas más económicas',
      addMeal: 'Agregar comida al itinerario'
    };
    return descriptions[fixAction] || 'Resolver problema automáticamente';
  }

  /**
   * Renderizar tab Analytics
   */
  renderAnalytics() {
    if (!this.healthData) return '<div class="text-center py-8 text-gray-500">Cargando...</div>';

    const { metrics } = this.healthData;

    // Calcular distribución de categorías
    const categoryEntries = Object.entries(metrics.activitiesByCategory)
      .sort((a, b) => b[1] - a[1]);

    return `
      <div class="space-y-6">
        <!-- Category Distribution -->
        <div class="health-metrics-card">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Distribución de Actividades por Categoría
          </h3>
          <div class="space-y-3">
            ${categoryEntries.map(([category, count]) => {
              const percentage = (count / metrics.totalActivities) * 100;
              return `
                <div>
                  <div class="flex items-center justify-between text-sm mb-1">
                    <span class="font-medium text-gray-700 dark:text-gray-300">${category}</span>
                    <span class="text-gray-600 dark:text-gray-400">${count} (${percentage.toFixed(0)}%)</span>
                  </div>
                  <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                         style="width: ${percentage}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Day Load Distribution -->
        <div class="health-metrics-card">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Carga por Día
          </h3>
          <div class="space-y-2">
            ${this.itinerary.days.map(day => {
              const actCount = day.activities?.length || 0;
              const isOverloaded = actCount > 6;
              return `
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-gray-700 dark:text-gray-300">Día ${day.day}</span>
                  <div class="flex items-center gap-2">
                    <div class="flex gap-0.5">
                      ${Array(Math.min(actCount, 10)).fill('').map(() =>
                        `<div class="w-2 h-4 ${isOverloaded ? 'bg-red-500' : 'bg-purple-500'} rounded-sm"></div>`
                      ).join('')}
                    </div>
                    <span class="${isOverloaded ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}">
                      ${actCount}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Budget Analysis -->
        ${this.itinerary.budget ? `
          <div class="health-metrics-card">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Análisis de Presupuesto
            </h3>
            <div class="space-y-3">
              <div class="metric-row">
                <span class="metric-label">Presupuesto Total:</span>
                <span class="metric-value">¥${this.itinerary.budget.total.toLocaleString()}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Gastos Estimados:</span>
                <span class="metric-value">¥${metrics.totalEstimatedCost.toLocaleString()}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Restante:</span>
                <span class="metric-value ${this.itinerary.budget.total - metrics.totalEstimatedCost < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}">
                  ¥${(this.itinerary.budget.total - metrics.totalEstimatedCost).toLocaleString()}
                </span>
              </div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                <div class="h-full ${metrics.totalEstimatedCost > this.itinerary.budget.total ? 'bg-red-500' : 'bg-green-500'} rounded-full"
                     style="width: ${Math.min((metrics.totalEstimatedCost / this.itinerary.budget.total) * 100, 100)}%"></div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Obtener clase de color según score
   */
  getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'warning';
    return 'critical';
  }

  /**
   * Ejecutar un quick fix específico
   */
  async runQuickFix(fixAction, issueId) {
    if (!this.quickFixes) {
      Notifications.error('Quick Fixes no inicializado');
      return;
    }

    // Buscar el issue
    const allIssues = [
      ...this.healthData.issues.critical,
      ...this.healthData.issues.warnings,
      ...this.healthData.issues.suggestions
    ];

    const issue = allIssues.find(i => i.id === issueId);
    if (!issue) {
      Notifications.error('Issue no encontrado');
      return;
    }

    console.log('🔧 Ejecutando quick fix:', fixAction, issue);

    // Mostrar loading
    Notifications.info('Aplicando fix...');

    try {
      let success = false;

      switch (fixAction) {
        case 'fillDay':
          success = await this.quickFixes.fillDay(issue);
          break;
        case 'resolveOverlap':
          success = await this.quickFixes.resolveOverlap(issue);
          break;
        case 'adjustTransportTime':
          success = await this.quickFixes.adjustTransportTime(issue);
          break;
        case 'balanceDay':
          success = await this.quickFixes.balanceDay(issue);
          break;
        case 'fillGap':
          success = await this.quickFixes.fillGap(issue);
          break;
        case 'reduceBudget':
          success = await this.quickFixes.reduceBudget(issue);
          break;
        case 'addMeal':
          success = await this.quickFixes.addMeal(issue);
          break;
        default:
          Notifications.error('Fix action no reconocido');
          return;
      }

      if (success) {
        // Recargar itinerario y re-analizar
        if (window.ItineraryHandler?.reinitialize) {
          await window.ItineraryHandler.reinitialize();
        }

        // Actualizar itinerario local
        this.itinerary = window.ItineraryHandler.currentItinerary;

        // Re-analizar
        await this.analyze();
      }
    } catch (error) {
      console.error('Error ejecutando quick fix:', error);
      Notifications.error('Error al aplicar fix');
    }
  }

  /**
   * Ejecutar todos los fixes automáticos
   */
  async fixAllIssues() {
    if (!this.healthData || !this.quickFixes) return;

    const fixableIssues = [
      ...this.healthData.issues.critical,
      ...this.healthData.issues.warnings,
      ...this.healthData.issues.suggestions
    ].filter(i => i.fixable);

    if (fixableIssues.length === 0) {
      Notifications.info('No hay issues para resolver');
      return;
    }

    Notifications.info(`Resolviendo ${fixableIssues.length} issues...`);

    let fixed = 0;
    for (const issue of fixableIssues) {
      try {
        const success = await this.runQuickFix(issue.fixAction, issue.id);
        if (success) fixed++;
      } catch (error) {
        console.error('Error fixing issue:', issue, error);
      }
    }

    Notifications.success(`✨ ${fixed}/${fixableIssues.length} issues resueltos`);

    // Re-analizar
    await this.analyze();
  }

  /**
   * Mostrar loading state
   */
  showLoading() {
    const content = document.getElementById('dashboardContent');
    if (content) {
      content.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12">
          <div class="loading-spinner"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Analizando itinerario...</p>
        </div>
      `;
    }
  }

  /**
   * Setup event listeners para contenido renderizado
   */
  setupContentListeners() {
    // Los event listeners se manejan mediante onclick inline para simplicidad
    // Ya que el contenido se re-renderiza dinámicamente
  }
}

// Crear instancia global
window.HealthDashboard = new HealthDashboard();

export default HealthDashboard;
