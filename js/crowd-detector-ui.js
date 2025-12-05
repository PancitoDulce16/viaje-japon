// js/crowd-detector-ui.js - UI Integration for Crowd Detection System
// Integra el sistema de detección de multitudes con la UI del itinerario

class CrowdDetectorUI {
    constructor() {
        this.detector = window.crowdDetector;
        this.warningBadgeHTML = '';
        this.init();
    }

    init() {
        console.log('👥 Inicializando Crowd Detector UI...');
        if (!this.detector) {
            console.error('❌ CrowdDetector no está disponible');
            return;
        }

        // Agregar estilos CSS para los warnings
        this.injectStyles();

        console.log('✅ Crowd Detector UI inicializado');
    }

    /**
     * Inyecta estilos CSS para los warnings de multitudes
     */
    injectStyles() {
        if (document.getElementById('crowd-detector-styles')) {
            return; // Ya están inyectados
        }

        const style = document.createElement('style');
        style.id = 'crowd-detector-styles';
        style.textContent = `
            /* Crowd Detector Warning Styles */
            .crowd-warning-container {
                margin: 16px 0;
                padding: 0;
                border-radius: 12px;
                overflow: hidden;
            }

            .crowd-warning-banner {
                padding: 16px;
                border-radius: 12px;
                margin-bottom: 8px;
                display: flex;
                align-items: start;
                gap: 12px;
                animation: slideInDown 0.4s ease-out;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .crowd-warning-banner.normal {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
            }

            .crowd-warning-banner.high {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
            }

            .crowd-warning-banner.extreme {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                animation: pulse 2s ease-in-out infinite;
            }

            .crowd-warning-icon {
                font-size: 32px;
                line-height: 1;
                flex-shrink: 0;
            }

            .crowd-warning-content {
                flex: 1;
            }

            .crowd-warning-title {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 4px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .crowd-warning-subtitle {
                font-size: 14px;
                opacity: 0.9;
                margin-bottom: 8px;
            }

            .crowd-warning-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .crowd-warning-list li {
                font-size: 13px;
                padding: 4px 0;
                padding-left: 20px;
                position: relative;
            }

            .crowd-warning-list li::before {
                content: "•";
                position: absolute;
                left: 0;
                font-weight: bold;
                font-size: 16px;
            }

            .crowd-tip-card {
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(10px);
                border-radius: 8px;
                padding: 12px;
                margin-top: 12px;
                font-size: 13px;
            }

            .crowd-tip-card strong {
                display: block;
                margin-bottom: 6px;
                font-size: 14px;
            }

            .crowd-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .crowd-badge.normal {
                background: #10b981;
                color: white;
            }

            .crowd-badge.high {
                background: #f59e0b;
                color: white;
            }

            .crowd-badge.extreme {
                background: #ef4444;
                color: white;
                animation: pulse 2s ease-in-out infinite;
            }

            .crowd-activity-warning {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                margin-top: 8px;
            }

            .crowd-activity-warning.best-day {
                background: #d1fae5;
                color: #065f46;
                border: 1px solid #10b981;
            }

            .crowd-activity-warning.worst-day {
                background: #fee2e2;
                color: #991b1b;
                border: 1px solid #ef4444;
            }

            .crowd-activity-warning.closed {
                background: #fef3c7;
                color: #92400e;
                border: 1px solid #f59e0b;
            }

            /* Dark mode support */
            html.dark .crowd-activity-warning.best-day {
                background: rgba(16, 185, 129, 0.2);
                color: #6ee7b7;
                border-color: #10b981;
            }

            html.dark .crowd-activity-warning.worst-day {
                background: rgba(239, 68, 68, 0.2);
                color: #fca5a5;
                border-color: #ef4444;
            }

            html.dark .crowd-activity-warning.closed {
                background: rgba(245, 158, 11, 0.2);
                color: #fcd34d;
                border-color: #f59e0b;
            }

            @keyframes slideInDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.02);
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Genera el HTML para mostrar un warning banner en la UI
     * @param {Date|string} date - Fecha a analizar
     * @param {string[]} activities - Array de nombres de actividades
     * @returns {string} HTML del warning banner
     */
    generateWarningBanner(date, activities = []) {
        const analysis = this.detector.analyzeCrowdLevel(date);

        let levelClass = 'normal';
        let levelIcon = '✅';
        let levelText = 'Nivel de Multitudes: Normal';

        if (analysis.crowdLevel === 'high') {
            levelClass = 'high';
            levelIcon = '⚠️';
            levelText = 'Nivel de Multitudes: Alto';
        } else if (analysis.crowdLevel === 'extreme') {
            levelClass = 'extreme';
            levelIcon = '🚨';
            levelText = 'Nivel de Multitudes: EXTREMO';
        }

        // Analizar actividades específicas
        const activityWarnings = [];
        const activityTips = [];

        activities.forEach(activityName => {
            const activityAnalysis = this.detector.analyzeCrowdLevel(date, activityName);

            // Agregar warnings y tips específicos de la actividad
            if (activityAnalysis.warnings && activityAnalysis.warnings.length > 0) {
                activityWarnings.push(...activityAnalysis.warnings);
            }
            if (activityAnalysis.tips && activityAnalysis.tips.length > 0) {
                activityTips.push(...activityAnalysis.tips);
            }

            // Obtener mejor hora para la actividad
            const timeInfo = this.detector.getBestTimeForActivity(activityName);
            if (timeInfo && timeInfo.recommendation) {
                activityTips.push(`⏰ ${activityName}: ${timeInfo.recommendation}`);
            }
        });

        // Combinar warnings generales con los específicos de actividades
        const allWarnings = [...analysis.warnings, ...activityWarnings];
        const allTips = [...analysis.tips, ...activityTips];

        // Generar HTML
        let html = `
            <div class="crowd-warning-container">
                <div class="crowd-warning-banner ${levelClass}">
                    <div class="crowd-warning-icon">${levelIcon}</div>
                    <div class="crowd-warning-content">
                        <div class="crowd-warning-title">
                            ${levelText}
                            ${analysis.isHoliday ? '<span class="crowd-badge extreme">🎌 FESTIVO</span>' : ''}
                        </div>
                        <div class="crowd-warning-subtitle">
                            ${analysis.dayOfWeek}, ${new Date(analysis.date).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                            ${analysis.holidayName ? ` - ${analysis.holidayName}` : ''}
                        </div>
        `;

        // Agregar warnings si hay
        if (allWarnings.length > 0) {
            html += `
                <ul class="crowd-warning-list">
                    ${allWarnings.map(warning => `<li>${warning}</li>`).join('')}
                </ul>
            `;
        }

        // Agregar tips si hay
        if (allTips.length > 0) {
            html += `
                <div class="crowd-tip-card">
                    <strong>💡 Consejos:</strong>
                    ${allTips.map(tip => `<div>${tip}</div>`).join('')}
                </div>
            `;
        }

        html += `
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Genera un badge pequeño para mostrar en la lista de actividades
     * @param {Date|string} date - Fecha de la actividad
     * @param {string} activityName - Nombre de la actividad
     * @returns {string} HTML del badge
     */
    generateActivityBadge(date, activityName) {
        const analysis = this.detector.analyzeCrowdLevel(date, activityName);
        const dayAnalysis = this.detector.suggestBestDay(activityName);

        if (!dayAnalysis) {
            return ''; // No hay información para esta actividad
        }

        const dayOfWeek = new Date(date).toLocaleDateString('es-ES', { weekday: 'long' });

        // Check si está cerrado
        if (dayAnalysis.closedDays && dayAnalysis.closedDays.includes(dayOfWeek)) {
            return `<div class="crowd-activity-warning closed">❌ Cierra los ${dayAnalysis.closedDays.join(', ')}</div>`;
        }

        // Check si es mejor día
        if (dayAnalysis.bestDays && dayAnalysis.bestDays.includes(dayOfWeek)) {
            return `<div class="crowd-activity-warning best-day">✅ Mejor día - Menos gente</div>`;
        }

        // Check si es peor día
        if (dayAnalysis.worstDays && dayAnalysis.worstDays.includes(dayOfWeek)) {
            return `<div class="crowd-activity-warning worst-day">⚠️ Peor día - Más concurrido</div>`;
        }

        return '';
    }

    /**
     * Genera un report completo para mostrar en un modal
     * @param {Date|string} date - Fecha a analizar
     * @param {string[]} activities - Array de nombres de actividades
     * @returns {string} HTML del report completo
     */
    generateDetailedReport(date, activities = []) {
        return this.detector.generateCrowdReport(date, activities);
    }

    /**
     * Muestra un modal con el análisis completo de multitudes para una fecha
     * @param {Date|string} date - Fecha a analizar
     * @param {string[]} activities - Array de nombres de actividades
     */
    showCrowdAnalysisModal(date, activities = []) {
        const reportHTML = this.generateDetailedReport(date, activities);

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.zIndex = '10000';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div class="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-xl z-10">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold">👥 Análisis de Multitudes</h2>
                        <button class="text-white hover:text-gray-200 text-3xl font-bold leading-none" onclick="this.closest('.modal').remove()">
                            &times;
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    ${reportHTML}
                </div>
                <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button onclick="this.closest('.modal').remove()" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Cerrar al hacer click en el overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Agrega un badge de crowd level en el header del itinerario
     * @param {Date|string} startDate - Fecha de inicio del viaje
     * @param {Date|string} endDate - Fecha de fin del viaje
     * @returns {string} HTML del badge
     */
    generateTripCrowdBadge(startDate, endDate) {
        const analysis = this.detector.analyzeDateRange(startDate, endDate);

        if (!analysis || analysis.length === 0) {
            return '';
        }

        // Contar días por nivel
        const levels = {
            normal: 0,
            high: 0,
            extreme: 0
        };

        analysis.forEach(day => {
            levels[day.crowdLevel]++;
        });

        let badgeClass = 'normal';
        let badgeIcon = '✅';
        let badgeText = 'Multitudes Normales';

        if (levels.extreme > 0) {
            badgeClass = 'extreme';
            badgeIcon = '🚨';
            badgeText = `${levels.extreme} días EXTREMOS`;
        } else if (levels.high > 0) {
            badgeClass = 'high';
            badgeIcon = '⚠️';
            badgeText = `${levels.high} días concurridos`;
        }

        return `
            <span class="crowd-badge ${badgeClass}" title="Click para ver detalles" style="cursor: pointer;">
                ${badgeIcon} ${badgeText}
            </span>
        `;
    }
}

// Export global
window.CrowdDetectorUI = CrowdDetectorUI;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.crowdDetectorUI = new CrowdDetectorUI();
    });
} else {
    window.crowdDetectorUI = new CrowdDetectorUI();
}

console.log('✅ CrowdDetectorUI cargado');
