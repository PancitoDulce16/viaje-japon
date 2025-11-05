// js/test-runner.js - Sistema de pruebas automáticas para prevenir regresiones

/**
 * TestRunner - Sistema de pruebas que se ejecuta al cargar la aplicación
 * para detectar funcionalidades rotas ANTES de que el usuario las encuentre
 */
export class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: [],
            failed: [],
            warnings: []
        };
    }

    /**
     * Agregar una prueba
     */
    addTest(name, testFn, isCritical = true) {
        this.tests.push({
            name,
            testFn,
            isCritical
        });
    }

    /**
     * Ejecutar todas las pruebas
     */
    async runAll() {
        console.log('🧪 TestRunner: Iniciando pruebas automáticas...');

        for (const test of this.tests) {
            try {
                const result = await test.testFn();

                if (result.passed) {
                    this.results.passed.push({
                        name: test.name,
                        message: result.message
                    });
                    console.log(`✅ PASS: ${test.name}`);
                } else {
                    const failure = {
                        name: test.name,
                        message: result.message,
                        isCritical: test.isCritical
                    };

                    if (test.isCritical) {
                        this.results.failed.push(failure);
                        console.error(`❌ FAIL (CRITICAL): ${test.name}`, result.message);
                    } else {
                        this.results.warnings.push(failure);
                        console.warn(`⚠️ WARNING: ${test.name}`, result.message);
                    }
                }
            } catch (error) {
                this.results.failed.push({
                    name: test.name,
                    message: error.message,
                    isCritical: test.isCritical
                });
                console.error(`❌ ERROR: ${test.name}`, error);
            }
        }

        this.printSummary();
        return this.results;
    }

    /**
     * Imprimir resumen de pruebas
     */
    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE PRUEBAS');
        console.log('='.repeat(60));
        console.log(`✅ Pasadas: ${this.results.passed.length}`);
        console.log(`⚠️ Advertencias: ${this.results.warnings.length}`);
        console.log(`❌ Fallidas: ${this.results.failed.length}`);
        console.log('='.repeat(60));

        if (this.results.failed.length > 0) {
            console.error('\n❌ PRUEBAS FALLIDAS:');
            this.results.failed.forEach(f => {
                console.error(`  - ${f.name}: ${f.message}`);
            });
        }

        if (this.results.warnings.length > 0) {
            console.warn('\n⚠️ ADVERTENCIAS:');
            this.results.warnings.forEach(w => {
                console.warn(`  - ${w.name}: ${w.message}`);
            });
        }

        // Mostrar notificación visual si hay errores críticos
        if (this.results.failed.length > 0) {
            this.showVisualAlert();
        }
    }

    /**
     * Mostrar alerta visual para errores críticos
     */
    showVisualAlert() {
        const alertDiv = document.createElement('div');
        alertDiv.id = 'test-failure-alert';
        alertDiv.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; z-index: 99999;
                        background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
                        color: white; padding: 20px 30px; border-radius: 12px;
                        box-shadow: 0 10px 40px rgba(220, 38, 38, 0.6);
                        max-width: 400px; font-family: system-ui;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                    <span style="font-size: 2rem;">⚠️</span>
                    <div>
                        <h3 style="margin: 0; font-size: 1.2rem; font-weight: bold;">
                            ${this.results.failed.length} Prueba(s) Fallida(s)
                        </h3>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem; opacity: 0.9;">
                            Se detectaron funcionalidades rotas
                        </p>
                    </div>
                </div>
                <button onclick="console.log('Test Results:', window.testResults); document.getElementById('test-failure-alert').remove();"
                        style="width: 100%; padding: 10px; margin-top: 10px; background: rgba(255,255,255,0.2);
                               border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 600;
                               transition: background 0.2s;">
                    Ver detalles en consola y cerrar
                </button>
            </div>
        `;
        document.body.appendChild(alertDiv);

        // Auto-cerrar después de 10 segundos
        setTimeout(() => {
            const alert = document.getElementById('test-failure-alert');
            if (alert) alert.remove();
        }, 10000);
    }
}

// Crear instancia global
export const testRunner = new TestRunner();

/**
 * Definir pruebas críticas del sistema
 */
export function setupCriticalTests() {

    // TEST 1: Verificar que funciones de sanitización existen y son síncronas
    testRunner.addTest(
        'Funciones de sanitización disponibles',
        async () => {
            try {
                const { sanitizeHTML, escapeHTML, sanitizeText } = await import('./helpers.js');

                if (typeof sanitizeHTML !== 'function') {
                    return { passed: false, message: 'sanitizeHTML no es una función' };
                }

                if (typeof escapeHTML !== 'function') {
                    return { passed: false, message: 'escapeHTML no es una función' };
                }

                // Verificar que son síncronas (no devuelven Promise)
                const testResult = sanitizeHTML('<script>test</script>');
                if (testResult instanceof Promise) {
                    return { passed: false, message: 'sanitizeHTML es async pero debería ser sync' };
                }

                return { passed: true, message: 'Todas las funciones de sanitización disponibles' };
            } catch (error) {
                return { passed: false, message: `Error: ${error.message}` };
            }
        },
        true // crítico
    );

    // TEST 2: Verificar que EventManager está disponible
    testRunner.addTest(
        'EventManager disponible',
        async () => {
            try {
                const { eventManager } = await import('./event-manager.js');

                if (!eventManager || typeof eventManager.add !== 'function') {
                    return { passed: false, message: 'EventManager no está correctamente configurado' };
                }

                return { passed: true, message: 'EventManager disponible' };
            } catch (error) {
                return { passed: false, message: `Error: ${error.message}` };
            }
        },
        true
    );

    // TEST 3: Verificar que itinerario puede renderizar
    testRunner.addTest(
        'Itinerario puede renderizar',
        async () => {
            const container = document.getElementById('content-itinerary');
            if (!container) {
                return { passed: false, message: 'Container de itinerario no existe' };
            }

            // Verificar que ItineraryHandler existe
            if (typeof window.ItineraryHandler === 'undefined') {
                return { passed: false, message: 'ItineraryHandler no está disponible globalmente' };
            }

            return { passed: true, message: 'Itinerario listo para renderizar' };
        },
        true
    );

    // TEST 4: Verificar drag and drop dependencies
    testRunner.addTest(
        'Sortable.js disponible',
        async () => {
            if (typeof Sortable === 'undefined') {
                return { passed: false, message: 'Sortable.js no está cargado (drag & drop no funcionará)' };
            }
            return { passed: true, message: 'Sortable.js disponible' };
        },
        true
    );

    // TEST 5: Verificar Firebase
    testRunner.addTest(
        'Firebase inicializado',
        async () => {
            try {
                const { auth, db } = await import('./firebase-config.js');

                if (!auth) {
                    return { passed: false, message: 'Firebase Auth no inicializado' };
                }

                if (!db) {
                    return { passed: false, message: 'Firestore no inicializado' };
                }

                return { passed: true, message: 'Firebase correctamente inicializado' };
            } catch (error) {
                return { passed: false, message: `Error: ${error.message}` };
            }
        },
        true
    );

    // TEST 6: Verificar que tabs existen
    testRunner.addTest(
        'Todos los tabs existen en DOM',
        async () => {
            const requiredTabs = [
                'content-itinerary',
                'content-preparation',
                'content-flights',
                'content-hotels',
                'content-transport',
                'content-map',
                'content-attractions',
                'content-essentials',
                'content-utils'
            ];

            const missing = [];
            for (const tabId of requiredTabs) {
                if (!document.getElementById(tabId)) {
                    missing.push(tabId);
                }
            }

            if (missing.length > 0) {
                return { passed: false, message: `Tabs faltantes: ${missing.join(', ')}` };
            }

            return { passed: true, message: 'Todos los tabs existen' };
        },
        true
    );

    // TEST 7: Verificar helpers críticos
    testRunner.addTest(
        'Helper functions disponibles',
        async () => {
            try {
                const helpers = await import('./helpers.js');
                const required = [
                    'Logger',
                    'Validator',
                    'DateFormatter',
                    'CurrencyFormatter',
                    'debounce',
                    'throttle'
                ];

                const missing = required.filter(name => !helpers[name]);

                if (missing.length > 0) {
                    return { passed: false, message: `Helpers faltantes: ${missing.join(', ')}` };
                }

                return { passed: true, message: 'Todos los helpers disponibles' };
            } catch (error) {
                return { passed: false, message: `Error: ${error.message}` };
            }
        },
        true
    );

    // TEST 8: Verificar Chart.js para gráficos de presupuesto
    testRunner.addTest(
        'Chart.js disponible',
        async () => {
            if (typeof Chart === 'undefined') {
                return { passed: false, message: 'Chart.js no está cargado (gráficos no funcionarán)' };
            }
            return { passed: true, message: 'Chart.js disponible' };
        },
        false // no crítico, pero importante
    );

    // TEST 9: Verificar Leaflet para mapas
    testRunner.addTest(
        'Leaflet.js disponible',
        async () => {
            if (typeof L === 'undefined') {
                return { passed: false, message: 'Leaflet.js no está cargado (mapas no funcionarán)' };
            }
            return { passed: true, message: 'Leaflet.js disponible' };
        },
        false
    );

    // TEST 10: Verificar módulos nuevos
    testRunner.addTest(
        'Módulos nuevos disponibles',
        async () => {
            const modules = [
                'EmergencyAssistant',
                'ExpenseSplitter',
                'PreTripChecklist',
                'EssentialsHandler'
            ];

            const missing = modules.filter(name => typeof window[name] === 'undefined');

            if (missing.length > 0) {
                return { passed: false, message: `Módulos faltantes: ${missing.join(', ')}` };
            }

            return { passed: true, message: 'Todos los módulos nuevos disponibles' };
        },
        false
    );
}

/**
 * Ejecutar pruebas automáticamente en desarrollo
 */
export async function runAutomatedTests() {
    setupCriticalTests();

    const results = await testRunner.runAll();

    // Guardar resultados globalmente para debugging
    window.testResults = results;

    return results;
}

// Auto-ejecutar en desarrollo
if (typeof window !== 'undefined') {
    window.testRunner = testRunner;
    window.runTests = runAutomatedTests;
}
