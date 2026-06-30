// js/crowd-detector-integration.js
// Integration examples for Crowd Detector with the Itinerary System

/**
 * INSTRUCCIONES DE INTEGRACIÓN
 *
 * Este archivo contiene funciones de ejemplo para integrar el Crowd Detector
 * en el sistema de itinerarios. Copia estas funciones en itinerary-v3.js
 * para agregar detección de multitudes a tu itinerario.
 */

/**
 * 🏗️ PASO 1: Agregar warning banner en renderDayOverview()
 *
 * En itinerary-v3.js, dentro de la función renderDayOverview(), agrega esto
 * DESPUÉS del análisis inteligente del día y ANTES de las actividades:
 */

function renderCrowdWarningForDay(day) {
    // Verificar que CrowdDetectorUI esté disponible
    if (!window.crowdDetectorUI || !window.crowdDetector) {
        return '';
    }

    // Obtener la fecha del día
    const startDate = new Date(currentItinerary.startDate);
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (day.day - 1));

    // Obtener nombres de actividades del día
    const activityNames = day.activities.map(a => a.name || a.title);

    // Generar el warning banner
    return window.crowdDetectorUI.generateWarningBanner(dayDate, activityNames);
}

/**
 * 🏗️ PASO 2: Agregar badges en renderActivities()
 *
 * En itinerary-v3.js, dentro de la función que renderiza cada actividad,
 * agrega el badge de crowd level:
 */

function renderActivityCrowdBadge(day, activity) {
    // Verificar que CrowdDetectorUI esté disponible
    if (!window.crowdDetectorUI || !window.crowdDetector) {
        return '';
    }

    // Obtener la fecha del día
    const startDate = new Date(currentItinerary.startDate);
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (day.day - 1));

    // Generar el badge para la actividad
    return window.crowdDetectorUI.generateActivityBadge(dayDate, activity.name || activity.title);
}

/**
 * 🏗️ PASO 3: Agregar badge en el header del trip
 *
 * En itinerary-v3.js, en la función renderTripSelector(), agrega esto
 * junto a los otros badges del header:
 */

function renderTripCrowdBadge() {
    // Verificar que CrowdDetectorUI esté disponible
    if (!window.crowdDetectorUI || !window.crowdDetector || !currentItinerary) {
        return '';
    }

    const startDate = currentItinerary.startDate;
    const endDate = currentItinerary.endDate;

    // Generar badge del trip completo
    const badgeHTML = window.crowdDetectorUI.generateTripCrowdBadge(startDate, endDate);

    // Agregar click handler para mostrar análisis completo
    setTimeout(() => {
        const badge = document.querySelector('.crowd-badge');
        if (badge) {
            badge.onclick = () => {
                // Obtener todas las actividades del trip
                const allActivities = [];
                currentItinerary.days.forEach(day => {
                    day.activities.forEach(a => {
                        allActivities.push(a.name || a.title);
                    });
                });

                // Mostrar modal con análisis completo
                window.crowdDetectorUI.showCrowdAnalysisModal(startDate, [...new Set(allActivities)]);
            };
        }
    }, 100);

    return badgeHTML;
}

/**
 * 🏗️ PASO 4: Agregar botón de análisis de multitudes
 *
 * Agrega un botón en el day overview para ver el análisis completo:
 */

function renderCrowdAnalysisButton(day) {
    // Verificar que CrowdDetectorUI esté disponible
    if (!window.crowdDetectorUI || !window.crowdDetector) {
        return '';
    }

    return `
        <button
            type="button"
            onclick="showDayCrowdAnalysis(${day.day})"
            class="w-full bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-600 rounded-lg p-3 transition flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300 font-semibold text-sm"
        >
            <span>👥</span>
            <span>Ver Análisis de Multitudes</span>
        </button>
    `;
}

/**
 * Handler para el botón de análisis de multitudes
 */
function showDayCrowdAnalysis(dayNumber) {
    if (!window.crowdDetectorUI || !currentItinerary) {
        return;
    }

    const day = currentItinerary.days.find(d => d.day === dayNumber);
    if (!day) return;

    // Obtener fecha del día
    const startDate = new Date(currentItinerary.startDate);
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (day.day - 1));

    // Obtener actividades del día
    const activityNames = day.activities.map(a => a.name || a.title);

    // Mostrar modal con análisis completo
    window.crowdDetectorUI.showCrowdAnalysisModal(dayDate, activityNames);
}

/**
 * 🏗️ PASO 5: Agregar sección colapsable con análisis de multitudes
 *
 * Similar a renderDayIntelligenceCollapsible(), crea una sección colapsable:
 */

function renderDayCrowdAnalysisCollapsible(day) {
    // Verificar que CrowdDetectorUI esté disponible
    if (!window.crowdDetectorUI || !window.crowdDetector || !currentItinerary) {
        return '';
    }

    // Obtener fecha del día
    const startDate = new Date(currentItinerary.startDate);
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (day.day - 1));

    // Analizar el día
    const analysis = window.crowdDetector.analyzeCrowdLevel(dayDate);

    // Obtener actividades
    const activityNames = day.activities.map(a => a.name || a.title);

    // Determinar color del badge según nivel
    let badgeClass = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300';
    let badgeIcon = '✅';

    if (analysis.crowdLevel === 'high') {
        badgeClass = 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300';
        badgeIcon = '⚠️';
    } else if (analysis.crowdLevel === 'extreme') {
        badgeClass = 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300';
        badgeIcon = '🚨';
    }

    const collapsibleId = `crowd-analysis-${day.day}`;

    return `
        <div class="mt-4 border rounded-lg overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <button
                type="button"
                onclick="toggleCollapsible('${collapsibleId}')"
                class="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
            >
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${badgeIcon}</span>
                    <div class="text-left">
                        <div class="text-sm font-bold text-gray-900 dark:text-white">Análisis de Multitudes</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                            ${analysis.crowdLevel === 'normal' ? 'Nivel normal' :
                              analysis.crowdLevel === 'high' ? 'Nivel alto' :
                              'Nivel extremo'}
                            ${analysis.isHoliday ? ' · Día festivo' : ''}
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold border ${badgeClass}">
                        ${analysis.warnings.length + analysis.tips.length} alertas
                    </span>
                    <i class="fas fa-chevron-down text-gray-400 dark:text-gray-500 transition-transform duration-200 collapsible-icon"></i>
                </div>
            </button>
            <div id="${collapsibleId}" class="collapsible-content max-h-0 overflow-hidden transition-all duration-300">
                <div class="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    ${window.crowdDetectorUI.generateWarningBanner(dayDate, activityNames)}
                </div>
            </div>
        </div>
    `;
}

/**
 * 🏗️ PASO 6: Código de integración completo para itinerary-v3.js
 *
 * COPIA Y PEGA ESTE CÓDIGO en itinerary-v3.js
 */

// ========== INTEGRACIÓN CÓDIGO COMPLETO ==========

/*
// 1. En la función renderDayOverview(), agrega esto después de renderDayIntelligenceCollapsible():

    <!-- 👥 Análisis de Multitudes (Colapsable) -->
    ${renderDayCrowdAnalysisCollapsible(day)}

// 2. En la función que renderiza cada actividad individual, agrega esto después del nombre:

    ${renderActivityCrowdBadge(day, activity)}

// 3. En la función renderTripSelector(), agrega esto en los badges del header:

    ${renderTripCrowdBadge()}

// 4. Agrega estas funciones al final de itinerary-v3.js:

function renderDayCrowdAnalysisCollapsible(day) {
    if (!window.crowdDetectorUI || !window.crowdDetector || !currentItinerary) {
        return '';
    }

    const startDate = new Date(currentItinerary.startDate);
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (day.day - 1));

    const analysis = window.crowdDetector.analyzeCrowdLevel(dayDate);
    const activityNames = day.activities.map(a => a.name || a.title);

    let badgeClass = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300';
    let badgeIcon = '✅';

    if (analysis.crowdLevel === 'high') {
        badgeClass = 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300';
        badgeIcon = '⚠️';
    } else if (analysis.crowdLevel === 'extreme') {
        badgeClass = 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300';
        badgeIcon = '🚨';
    }

    const collapsibleId = `crowd-analysis-${day.day}`;

    return `
        <div class="mt-4 border rounded-lg overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <button
                type="button"
                onclick="toggleCollapsible('${collapsibleId}')"
                class="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
            >
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${badgeIcon}</span>
                    <div class="text-left">
                        <div class="text-sm font-bold text-gray-900 dark:text-white">Análisis de Multitudes</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                            ${analysis.crowdLevel === 'normal' ? 'Nivel normal' :
                              analysis.crowdLevel === 'high' ? 'Nivel alto' :
                              'Nivel extremo'}
                            ${analysis.isHoliday ? ' · Día festivo' : ''}
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold border ${badgeClass}">
                        ${analysis.warnings.length + analysis.tips.length} alertas
                    </span>
                    <i class="fas fa-chevron-down text-gray-400 dark:text-gray-500 transition-transform duration-200 collapsible-icon"></i>
                </div>
            </button>
            <div id="${collapsibleId}" class="collapsible-content max-h-0 overflow-hidden transition-all duration-300">
                <div class="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    ${window.crowdDetectorUI.generateWarningBanner(dayDate, activityNames)}
                </div>
            </div>
        </div>
    `;
}

function renderActivityCrowdBadge(day, activity) {
    if (!window.crowdDetectorUI || !window.crowdDetector || !currentItinerary) {
        return '';
    }

    const startDate = new Date(currentItinerary.startDate);
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (day.day - 1));

    return window.crowdDetectorUI.generateActivityBadge(dayDate, activity.name || activity.title);
}

function renderTripCrowdBadge() {
    if (!window.crowdDetectorUI || !window.crowdDetector || !currentItinerary) {
        return '';
    }

    const startDate = currentItinerary.startDate;
    const endDate = currentItinerary.endDate;

    const badgeHTML = window.crowdDetectorUI.generateTripCrowdBadge(startDate, endDate);

    setTimeout(() => {
        const badge = document.querySelector('.crowd-badge');
        if (badge) {
            badge.onclick = () => {
                const allActivities = [];
                currentItinerary.days.forEach(day => {
                    day.activities.forEach(a => {
                        allActivities.push(a.name || a.title);
                    });
                });
                window.crowdDetectorUI.showCrowdAnalysisModal(startDate, [...new Set(allActivities)]);
            };
        }
    }, 100);

    return badgeHTML;
}

*/

// ========== FIN INTEGRACIÓN CÓDIGO COMPLETO ==========

/**
 * 🧪 TESTING: Función de prueba para verificar que todo funciona
 */
function testCrowdDetector() {
    console.log('🧪 Iniciando test del Crowd Detector...');

    if (!window.crowdDetector) {
        console.error('❌ CrowdDetector no disponible');
        return;
    }

    if (!window.crowdDetectorUI) {
        console.error('❌ CrowdDetectorUI no disponible');
        return;
    }

    // Test 1: Analizar Golden Week 2025
    console.log('\n📅 Test 1: Golden Week 2025');
    const goldenWeek = window.crowdDetector.analyzeCrowdLevel('2025-05-03', 'Tokyo DisneySea');
    console.log('Resultado:', goldenWeek);

    // Test 2: Analizar día normal
    console.log('\n📅 Test 2: Día normal (Martes cualquiera)');
    const normalDay = window.crowdDetector.analyzeCrowdLevel('2025-06-10', 'Fushimi Inari');
    console.log('Resultado:', normalDay);

    // Test 3: Generar warning banner
    console.log('\n🎨 Test 3: Generar Warning Banner');
    const banner = window.crowdDetectorUI.generateWarningBanner('2025-05-03', ['Tokyo DisneySea', 'Sensō-ji']);
    console.log('HTML generado:', banner.substring(0, 200) + '...');

    // Test 4: Generar badge de actividad
    console.log('\n🏷️ Test 4: Generar Activity Badge');
    const badge = window.crowdDetectorUI.generateActivityBadge('2025-06-11', 'Sanrio Puroland'); // Miércoles = cerrado
    console.log('HTML generado:', badge);

    // Test 5: Analizar rango de fechas
    console.log('\n📊 Test 5: Analizar Rango de Fechas');
    const range = window.crowdDetector.analyzeDateRange('2025-05-01', '2025-05-07');
    console.log('Días analizados:', range.length);
    console.log('Días extremos:', range.filter(d => d.crowdLevel === 'extreme').length);

    console.log('\n✅ Tests completados. Revisa los resultados arriba.');
}

// Exportar para testing
window.testCrowdDetector = testCrowdDetector;

console.log('✅ Crowd Detector Integration Guide cargado');
console.log('💡 Tip: Ejecuta testCrowdDetector() en la consola para probar el sistema');
