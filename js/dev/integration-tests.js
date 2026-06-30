// js/integration-tests.js - Pruebas de Integración para Flujos Críticos
// Estas pruebas se ejecutan automáticamente para prevenir regresiones

/**
 * IntegrationTests - Pruebas end-to-end de flujos críticos
 * Se ejecutan después de cargar la app para verificar que todo funcione
 */
export class IntegrationTests {
    constructor() {
        this.results = [];
        this.criticalFailures = [];
    }

    /**
     * Test 1: Login Redirect Loop
     * Verifica que después del login NO se vuelva a la página de login
     */
    async testLoginRedirect() {
        console.log('🧪 TEST: Login Redirect');

        try {
            // Verificar que el usuario autenticado NO vea la landing page
            const user = window.auth?.currentUser;
            const landingPage = document.getElementById('landingPage');
            const appDashboard = document.getElementById('appDashboard');

            if (user) {
                // Usuario autenticado
                const isLandingVisible = landingPage && !landingPage.classList.contains('hidden');
                const isDashboardVisible = appDashboard && !appDashboard.classList.contains('hidden');

                if (isLandingVisible) {
                    throw new Error('❌ CRITICAL: Usuario autenticado ve landing page (login loop)');
                }

                if (!isDashboardVisible) {
                    throw new Error('❌ CRITICAL: Usuario autenticado no ve dashboard');
                }

                return { passed: true, message: '✅ Login redirect funciona correctamente' };
            } else {
                // Usuario no autenticado - debería ver landing
                const isLandingVisible = landingPage && !landingPage.classList.contains('hidden');

                if (!isLandingVisible) {
                    throw new Error('❌ Usuario no autenticado no ve landing page');
                }

                return { passed: true, message: '✅ Landing page correcta para usuario no autenticado' };
            }

        } catch (error) {
            return { passed: false, message: error.message, critical: true };
        }
    }

    /**
     * Test 2: Activity Titles Not Undefined
     * Verifica que los títulos de actividades NO sean undefined
     */
    async testActivityTitles() {
        console.log('🧪 TEST: Activity Titles');

        try {
            const activityCards = document.querySelectorAll('.activity-card h3');
            let undefinedCount = 0;
            const undefinedActivities = [];

            activityCards.forEach((titleEl, index) => {
                const text = titleEl.textContent || titleEl.innerText;
                if (text.includes('undefined') || text.trim() === '') {
                    undefinedCount++;
                    undefinedActivities.push({ index, text });
                }
            });

            if (undefinedCount > 0) {
                throw new Error(
                    `❌ CRITICAL: ${undefinedCount} actividades con título undefined: ${JSON.stringify(undefinedActivities)}`
                );
            }

            return {
                passed: true,
                message: `✅ ${activityCards.length} actividades tienen títulos válidos`
            };

        } catch (error) {
            return { passed: false, message: error.message, critical: true };
        }
    }

    /**
     * Test 3: Day Selector Scroll Bar
     * Verifica que la barra de scroll de días esté visible
     */
    async testDayScrollBar() {
        console.log('🧪 TEST: Day Scroll Bar');

        try {
            const daySelector = document.getElementById('daySelector');

            if (!daySelector) {
                throw new Error('❌ CRITICAL: Day selector no existe');
            }

            // Verificar que tenga overflow-x
            const styles = window.getComputedStyle(daySelector);
            const overflowX = styles.overflowX;

            if (overflowX !== 'auto' && overflowX !== 'scroll') {
                throw new Error(`❌ CRITICAL: Day selector no tiene overflow-x (actual: ${overflowX})`);
            }

            // Verificar que tenga botones
            const dayButtons = daySelector.querySelectorAll('.day-btn');
            if (dayButtons.length === 0) {
                throw new Error('❌ CRITICAL: No hay botones de días');
            }

            return {
                passed: true,
                message: `✅ Day selector con ${dayButtons.length} días y scroll visible`
            };

        } catch (error) {
            return { passed: false, message: error.message, critical: true };
        }
    }

    /**
     * Test 4: Activity Buttons Functional
     * Verifica que los botones de agregar/editar/eliminar existan y sean clickeables
     */
    async testActivityButtons() {
        console.log('🧪 TEST: Activity Buttons');

        try {
            // Botón de agregar
            const addButtons = document.querySelectorAll('[id^="addActivityBtn_"]');
            if (addButtons.length === 0) {
                throw new Error('❌ CRITICAL: No hay botón de agregar actividad');
            }

            // Botones de editar
            const editButtons = document.querySelectorAll('.activity-edit-btn');

            // Botones de eliminar
            const deleteButtons = document.querySelectorAll('.activity-delete-btn');

            // Verificar que los botones tengan data attributes
            let invalidButtons = 0;
            editButtons.forEach(btn => {
                if (!btn.dataset.activityId || !btn.dataset.day) {
                    invalidButtons++;
                }
            });

            deleteButtons.forEach(btn => {
                if (!btn.dataset.activityId || !btn.dataset.day) {
                    invalidButtons++;
                }
            });

            if (invalidButtons > 0) {
                throw new Error(`❌ CRITICAL: ${invalidButtons} botones sin data attributes`);
            }

            return {
                passed: true,
                message: `✅ Botones funcionales: ${addButtons.length} add, ${editButtons.length} edit, ${deleteButtons.length} delete`
            };

        } catch (error) {
            return { passed: false, message: error.message, critical: true };
        }
    }

    /**
     * Test 5: Drag and Drop Available
     * Verifica que el drag and drop esté disponible
     */
    async testDragAndDrop() {
        console.log('🧪 TEST: Drag and Drop');

        try {
            // Verificar que Sortable.js esté cargado
            if (typeof Sortable === 'undefined') {
                throw new Error('❌ CRITICAL: Sortable.js no está cargado');
            }

            // Verificar que haya drag handles
            const dragHandles = document.querySelectorAll('.drag-handle');
            if (dragHandles.length === 0) {
                throw new Error('❌ CRITICAL: No hay drag handles en actividades');
            }

            return {
                passed: true,
                message: `✅ Drag and drop disponible con ${dragHandles.length} handles`
            };

        } catch (error) {
            return { passed: false, message: error.message, critical: true };
        }
    }

    /**
     * Test 6: Contrast Requirements
     * Verifica que los elementos críticos tengan buen contraste
     */
    async testContrast() {
        console.log('🧪 TEST: Contrast');

        try {
            if (!window.contrastValidator) {
                throw new Error('❌ ContrastValidator no disponible');
            }

            const issues = window.contrastValidator.scanDocument();

            if (issues.length > 5) {
                // Permitir hasta 5 falsos positivos
                throw new Error(`❌ ${issues.length} problemas de contraste detectados`);
            }

            return {
                passed: true,
                message: `✅ Contraste aceptable (${issues.length} issues menores)`
            };

        } catch (error) {
            return { passed: false, message: error.message, critical: false };
        }
    }

    /**
     * Test 7: Firebase Connectivity
     * Verifica que Firebase esté conectado y funcionando
     */
    async testFirebaseConnectivity() {
        console.log('🧪 TEST: Firebase Connectivity');

        try {
            if (!window.FirebaseResilience) {
                throw new Error('❌ FirebaseResilience no disponible');
            }

            const health = await window.FirebaseResilience.checkFirebaseHealth();

            if (!health.auth) {
                throw new Error('❌ CRITICAL: Firebase Auth no disponible');
            }

            if (!health.firestore) {
                throw new Error('❌ CRITICAL: Firestore no disponible');
            }

            return {
                passed: true,
                message: `✅ Firebase conectado (user: ${health.user ? 'yes' : 'no'})`
            };

        } catch (error) {
            return { passed: false, message: error.message, critical: true };
        }
    }

    /**
     * Ejecutar todas las pruebas
     */
    async runAll() {
        console.log('\n🧪 ========================================');
        console.log('🧪 INTEGRATION TESTS - Iniciando...');
        console.log('🧪 ========================================\n');

        this.results = [];
        this.criticalFailures = [];

        const tests = [
            this.testLoginRedirect(),
            this.testActivityTitles(),
            this.testDayScrollBar(),
            this.testActivityButtons(),
            this.testDragAndDrop(),
            this.testContrast(),
            this.testFirebaseConnectivity()
        ];

        for (const testPromise of tests) {
            const result = await testPromise;
            this.results.push(result);

            if (!result.passed) {
                console.error(result.message);
                if (result.critical) {
                    this.criticalFailures.push(result);
                }
            } else {
                console.log(result.message);
            }
        }

        this.printSummary();
        return this.results;
    }

    /**
     * Imprimir resumen
     */
    printSummary() {
        console.log('\n🧪 ========================================');
        console.log('🧪 INTEGRATION TESTS - Resumen');
        console.log('🧪 ========================================');

        const passed = this.results.filter(r => r.passed).length;
        const failed = this.results.filter(r => !r.passed).length;
        const critical = this.criticalFailures.length;

        console.log(`✅ Pasadas: ${passed}`);
        console.log(`❌ Fallidas: ${failed}`);
        console.log(`🚨 Críticas: ${critical}`);
        console.log('========================================\n');

        if (critical > 0) {
            this.showCriticalAlert();
        }
    }

    /**
     * Mostrar alerta visual para fallos críticos
     */
    showCriticalAlert() {
        const alertDiv = document.createElement('div');
        alertDiv.id = 'integration-test-alert';
        alertDiv.innerHTML = `
            <div style="position: fixed; top: 20px; left: 20px; z-index: 99999;
                        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                        color: white; padding: 20px 30px; border-radius: 12px;
                        box-shadow: 0 10px 40px rgba(220, 38, 38, 0.6);
                        max-width: 500px; font-family: system-ui;
                        animation: slideInLeft 0.5s ease-out;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                    <span style="font-size: 2.5rem;">🚨</span>
                    <div>
                        <h3 style="margin: 0; font-size: 1.3rem; font-weight: bold;">
                            ${this.criticalFailures.length} Prueba(s) Crítica(s) Fallida(s)
                        </h3>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem; opacity: 0.9;">
                            Funcionalidades rotas detectadas
                        </p>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 6px; margin-bottom: 10px; max-height: 200px; overflow-y: auto;">
                    ${this.criticalFailures.map(f => `
                        <div style="font-size: 0.85rem; margin-bottom: 5px;">
                            • ${f.message.replace('❌ CRITICAL: ', '')}
                        </div>
                    `).join('')}
                </div>
                <button onclick="console.log('Integration Test Results:', window.integrationTestResults); document.getElementById('integration-test-alert').remove();"
                        style="width: 100%; padding: 10px; background: rgba(255,255,255,0.2);
                               border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 600;
                               transition: background 0.2s;">
                    Ver detalles en consola y cerrar
                </button>
            </div>
        `;
        document.body.appendChild(alertDiv);
    }
}

// Exportar instancia global
export const integrationTests = new IntegrationTests();

// Ejecutar automáticamente en desarrollo
if (typeof window !== 'undefined') {
    window.integrationTests = integrationTests;

    // Ejecutar después de que la app esté cargada
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(async () => {
            console.log('\n🧪 Ejecutando Integration Tests...\n');
            const results = await integrationTests.runAll();
            window.integrationTestResults = results;
        }, 5000); // 5 segundos después de cargar
    }
}
