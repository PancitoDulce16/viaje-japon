// js/pre-trip-checklist.js - Checklist Pre-Viaje Automatizado con Recordatorios

import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { Logger, escapeHTML, DateFormatter } from './helpers.js';
import { Notifications } from './notifications.js';

/**
 * PreTripChecklist - Sistema automatizado de checklist pre-viaje con recordatorios temporales
 */
export const PreTripChecklist = {
    currentTrip: null,
    tripStartDate: null,
    checklist: {},
    unsubscribe: null,

    // Tareas organizadas por tiempo antes del viaje
    tasksByTimeline: {
        '3months': {
            label: '3 Meses Antes',
            icon: '📅',
            color: 'blue',
            tasks: [
                { id: 'passport', label: 'Verificar validez del pasaporte (min 6 meses)', priority: 'high' },
                { id: 'visa', label: 'Verificar si necesitas visa', priority: 'high' },
                { id: 'budget', label: 'Establecer presupuesto del viaje', priority: 'medium' },
                { id: 'research', label: 'Investigar destinos y actividades', priority: 'low' }
            ]
        },
        '2months': {
            label: '2 Meses Antes',
            icon: '✈️',
            color: 'purple',
            tasks: [
                { id: 'flights', label: 'Reservar vuelos', priority: 'high' },
                { id: 'insurance', label: 'Contratar seguro de viaje', priority: 'high' },
                { id: 'jrpass', label: 'Comprar JR Pass (si aplica)', priority: 'medium' },
                { id: 'hotels', label: 'Reservar alojamiento', priority: 'high' },
                { id: 'vaccinations', label: 'Verificar vacunas necesarias', priority: 'medium' }
            ]
        },
        '1month': {
            label: '1 Mes Antes',
            icon: '🎫',
            color: 'green',
            tasks: [
                { id: 'sim', label: 'Reservar SIM card o Pocket WiFi', priority: 'high' },
                { id: 'activities', label: 'Reservar actividades/tours populares', priority: 'medium' },
                { id: 'restaurants', label: 'Hacer reservas en restaurantes', priority: 'low' },
                { id: 'cash', label: 'Solicitar yenes en tu banco', priority: 'medium' },
                { id: 'creditcard', label: 'Avisar a banco sobre viaje internacional', priority: 'high' },
                { id: 'suica', label: 'Investigar sobre tarjeta Suica/Pasmo', priority: 'low' }
            ]
        },
        '2weeks': {
            label: '2 Semanas Antes',
            icon: '📱',
            color: 'yellow',
            tasks: [
                { id: 'apps', label: 'Descargar apps útiles (Google Maps, Translate, Hyperdia)', priority: 'medium' },
                { id: 'copies', label: 'Hacer copias digitales de documentos', priority: 'high' },
                { id: 'emergency', label: 'Guardar números de emergencia', priority: 'high' },
                { id: 'itinerary', label: 'Finalizar itinerario detallado', priority: 'medium' },
                { id: 'adapter', label: 'Conseguir adaptador de enchufe tipo A/B', priority: 'medium' }
            ]
        },
        '1week': {
            label: '1 Semana Antes',
            icon: '🎒',
            color: 'orange',
            tasks: [
                { id: 'pack', label: 'Empezar a empacar', priority: 'high' },
                { id: 'weather', label: 'Verificar pronóstico del clima', priority: 'medium' },
                { id: 'vouchers', label: 'Imprimir/descargar todos los vouchers', priority: 'high' },
                { id: 'embassy', label: 'Registrarte en embajada (opcional)', priority: 'low' },
                { id: 'pet', label: 'Organizar cuidado de mascotas', priority: 'medium' },
                { id: 'mail', label: 'Suspender entrega de correo', priority: 'low' }
            ]
        },
        '1day': {
            label: '1 Día Antes',
            icon: '✅',
            color: 'red',
            tasks: [
                { id: 'documents', label: 'Verificar pasaporte, visa, tickets', priority: 'high' },
                { id: 'money', label: 'Preparar efectivo/tarjetas', priority: 'high' },
                { id: 'baggage', label: 'Verificar peso del equipaje', priority: 'medium' },
                { id: 'checkin', label: 'Hacer check-in online', priority: 'medium' },
                { id: 'electronics', label: 'Cargar todos los dispositivos', priority: 'medium' },
                { id: 'meds', label: 'Empacar medicamentos', priority: 'high' },
                { id: 'keys', label: 'Dejar llave a alguien de confianza', priority: 'low' }
            ]
        }
    },

    /**
     * Inicializar checklist
     */
    async init(tripId, startDate) {
        Logger.info('📋 PreTripChecklist: Inicializando...');

        if (!tripId) {
            Logger.warn('PreTripChecklist: No trip ID provided');
            return;
        }

        this.currentTrip = tripId;
        this.tripStartDate = startDate ? new Date(startDate) : null;

        await this.loadChecklist();
        await this.setupRealtimeSync();
        this.render();
        this.checkReminders();
    },

    /**
     * Cargar checklist desde Firestore
     */
    async loadChecklist() {
        try {
            const checklistRef = doc(db, `trips/${this.currentTrip}/data`, 'preTripChecklist');
            const checklistSnap = await getDoc(checklistRef);

            if (checklistSnap.exists()) {
                this.checklist = checklistSnap.data().checklist || {};
            } else {
                // Inicializar checklist vacío
                this.checklist = {};
            }
        } catch (error) {
            Logger.error('Error loading checklist:', error);
            Notifications.error('Error al cargar checklist');
        }
    },

    /**
     * Configurar sincronización en tiempo real
     */
    async setupRealtimeSync() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        const checklistRef = doc(db, `trips/${this.currentTrip}/data`, 'preTripChecklist');

        this.unsubscribe = onSnapshot(checklistRef, (docSnap) => {
            if (docSnap.exists()) {
                this.checklist = docSnap.data().checklist || {};
                this.render();
            }
        }, (error) => {
            Logger.error('Error in realtime sync:', error);
        });
    },

    /**
     * Renderizar checklist
     */
    render() {
        const container = document.getElementById('preTripChecklistContent');
        if (!container) {
            Logger.warn('PreTripChecklist: Container not found');
            return;
        }

        const daysUntilTrip = this.calculateDaysUntilTrip();
        const progress = this.calculateProgress();
        const currentPhase = this.getCurrentPhase(daysUntilTrip);

        const html = `
            <div class="pre-trip-checklist">
                <!-- Header con progreso -->
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-xl font-bold">📋 Checklist Pre-Viaje</h3>
                        <span class="text-sm text-gray-500">
                            ${progress.completed}/${progress.total} completadas
                        </span>
                    </div>

                    <!-- Barra de progreso -->
                    <div class="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div class="absolute h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                             style="width: ${progress.percentage}%"></div>
                    </div>
                    <div class="text-center mt-1 font-bold text-lg">
                        ${progress.percentage}%
                    </div>
                </div>

                <!-- Contador de días -->
                ${daysUntilTrip !== null ? `
                    <div class="mb-6 p-4 rounded-lg ${this.getCountdownStyle(daysUntilTrip)}">
                        <div class="text-center">
                            <div class="text-4xl font-bold mb-1">${daysUntilTrip}</div>
                            <div class="text-sm">días para tu viaje</div>
                            ${currentPhase ? `<div class="mt-2 text-xs opacity-80">Fase actual: ${currentPhase.label}</div>` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- Tareas por timeline -->
                ${this.renderTimelines(daysUntilTrip)}

                <!-- Acciones -->
                <div class="mt-6 flex flex-wrap gap-3">
                    <button id="resetChecklistBtn" class="btn-secondary">
                        🔄 Reiniciar Checklist
                    </button>
                    <button id="exportChecklistBtn" class="btn-secondary">
                        📥 Exportar Lista
                    </button>
                    <button id="printChecklistBtn" class="btn-secondary">
                        🖨️ Imprimir
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.attachEventListeners();
    },

    /**
     * Renderizar timelines
     */
    renderTimelines(daysUntilTrip) {
        return Object.entries(this.tasksByTimeline)
            .map(([timelineId, timeline]) => {
                const isActive = this.isTimelineActive(timelineId, daysUntilTrip);
                const timelineTasks = timeline.tasks;
                const completedTasks = timelineTasks.filter(task =>
                    this.checklist[`${timelineId}_${task.id}`]
                ).length;

                return `
                    <div class="timeline-section mb-4 ${isActive ? 'timeline-active' : ''}">
                        <div class="timeline-header p-3 rounded-t-lg bg-${timeline.color}-100 dark:bg-${timeline.color}-900/20 border-2 border-${timeline.color}-300 dark:border-${timeline.color}-700">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <span class="text-2xl">${timeline.icon}</span>
                                    <span class="font-bold">${timeline.label}</span>
                                    ${isActive ? '<span class="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">AHORA</span>' : ''}
                                </div>
                                <span class="text-sm">
                                    ${completedTasks}/${timelineTasks.length}
                                </span>
                            </div>
                        </div>
                        <div class="timeline-body bg-white dark:bg-gray-800 p-3 rounded-b-lg border-x-2 border-b-2 border-${timeline.color}-200 dark:border-${timeline.color}-800">
                            ${this.renderTasks(timelineId, timelineTasks)}
                        </div>
                    </div>
                `;
            }).join('');
    },

    /**
     * Renderizar tareas
     */
    renderTasks(timelineId, tasks) {
        return tasks.map(task => {
            const taskId = `${timelineId}_${task.id}`;
            const isCompleted = this.checklist[taskId] || false;
            const priorityColor = {
                high: 'red',
                medium: 'yellow',
                low: 'gray'
            }[task.priority];

            return `
                <div class="task-item flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input type="checkbox"
                           id="${taskId}"
                           class="task-checkbox mt-1 w-5 h-5 rounded"
                           ${isCompleted ? 'checked' : ''}
                           data-task-id="${taskId}">
                    <label for="${taskId}" class="flex-1 cursor-pointer ${isCompleted ? 'line-through text-gray-400' : ''}">
                        <div class="flex items-center gap-2">
                            <span>${escapeHTML(task.label)}</span>
                            <span class="text-xs px-2 py-0.5 rounded-full bg-${priorityColor}-100 text-${priorityColor}-700 dark:bg-${priorityColor}-900/30 dark:text-${priorityColor}-400">
                                ${task.priority === 'high' ? '!' : task.priority === 'medium' ? '·' : ''}
                            </span>
                        </div>
                    </label>
                </div>
            `;
        }).join('');
    },

    /**
     * Calcular días hasta el viaje
     */
    calculateDaysUntilTrip() {
        if (!this.tripStartDate) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tripDate = new Date(this.tripStartDate);
        tripDate.setHours(0, 0, 0, 0);

        const diffTime = tripDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 0 ? diffDays : 0;
    },

    /**
     * Determinar fase actual según días restantes
     */
    getCurrentPhase(daysUntilTrip) {
        if (daysUntilTrip === null) return null;

        if (daysUntilTrip >= 90) return this.tasksByTimeline['3months'];
        if (daysUntilTrip >= 60) return this.tasksByTimeline['2months'];
        if (daysUntilTrip >= 30) return this.tasksByTimeline['1month'];
        if (daysUntilTrip >= 14) return this.tasksByTimeline['2weeks'];
        if (daysUntilTrip >= 7) return this.tasksByTimeline['1week'];
        return this.tasksByTimeline['1day'];
    },

    /**
     * Verificar si timeline está activo
     */
    isTimelineActive(timelineId, daysUntilTrip) {
        if (daysUntilTrip === null) return false;

        const ranges = {
            '3months': [90, Infinity],
            '2months': [60, 89],
            '1month': [30, 59],
            '2weeks': [14, 29],
            '1week': [7, 13],
            '1day': [0, 6]
        };

        const range = ranges[timelineId];
        return daysUntilTrip >= range[0] && daysUntilTrip <= range[1];
    },

    /**
     * Estilo del countdown según días restantes
     */
    getCountdownStyle(days) {
        if (days > 30) return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
        if (days > 7) return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
    },

    /**
     * Calcular progreso
     */
    calculateProgress() {
        let total = 0;
        let completed = 0;

        Object.values(this.tasksByTimeline).forEach(timeline => {
            total += timeline.tasks.length;
        });

        completed = Object.values(this.checklist).filter(Boolean).length;

        return {
            total,
            completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    },

    /**
     * Verificar y mostrar recordatorios
     */
    checkReminders() {
        const daysUntilTrip = this.calculateDaysUntilTrip();
        if (daysUntilTrip === null) return;

        // Mostrar notificación según fase
        if (daysUntilTrip === 90) {
            Notifications.info('¡3 meses para tu viaje! Verifica tu pasaporte y documentos.');
        } else if (daysUntilTrip === 60) {
            Notifications.warning('¡2 meses! Es hora de reservar vuelos y hoteles.');
        } else if (daysUntilTrip === 30) {
            Notifications.warning('¡1 mes! Reserva SIM card y actividades populares.');
        } else if (daysUntilTrip === 14) {
            Notifications.warning('¡2 semanas! Descarga apps y haz copias de documentos.');
        } else if (daysUntilTrip === 7) {
            Notifications.error('¡1 semana! Empieza a empacar e imprime vouchers.');
        } else if (daysUntilTrip === 1) {
            Notifications.error('¡Último día! Verifica documentos, dinero y equipaje.');
        }
    },

    /**
     * Agregar event listeners
     */
    attachEventListeners() {
        // Checkboxes
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', async (e) => {
                const taskId = e.target.dataset.taskId;
                const isCompleted = e.target.checked;
                await this.toggleTask(taskId, isCompleted);
            });
        });

        // Botón reset
        const resetBtn = document.getElementById('resetChecklistBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetChecklist());
        }

        // Botón export
        const exportBtn = document.getElementById('exportChecklistBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportChecklist());
        }

        // Botón print
        const printBtn = document.getElementById('printChecklistBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => window.print());
        }
    },

    /**
     * Toggle tarea
     */
    async toggleTask(taskId, isCompleted) {
        try {
            this.checklist[taskId] = isCompleted;
            await this.saveChecklist();

            if (isCompleted) {
                Notifications.success('✓ Tarea completada');
            }
        } catch (error) {
            Logger.error('Error toggling task:', error);
            Notifications.error('Error al actualizar tarea');
        }
    },

    /**
     * Guardar checklist en Firestore
     */
    async saveChecklist() {
        try {
            const checklistRef = doc(db, `trips/${this.currentTrip}/data`, 'preTripChecklist');
            await setDoc(checklistRef, {
                checklist: this.checklist,
                updatedAt: serverTimestamp(),
                updatedBy: auth.currentUser.uid
            });
        } catch (error) {
            Logger.error('Error saving checklist:', error);
            throw error;
        }
    },

    /**
     * Resetear checklist
     */
    async resetChecklist() {
        if (!confirm('¿Reiniciar todo el checklist? Esta acción no se puede deshacer.')) return;

        try {
            this.checklist = {};
            await this.saveChecklist();
            Notifications.success('Checklist reiniciado');
        } catch (error) {
            Logger.error('Error resetting checklist:', error);
            Notifications.error('Error al reiniciar checklist');
        }
    },

    /**
     * Exportar checklist
     */
    exportChecklist() {
        let text = '📋 CHECKLIST PRE-VIAJE A JAPÓN\n\n';

        Object.entries(this.tasksByTimeline).forEach(([timelineId, timeline]) => {
            text += `${timeline.icon} ${timeline.label}\n`;
            text += '─'.repeat(30) + '\n';

            timeline.tasks.forEach(task => {
                const taskId = `${timelineId}_${task.id}`;
                const isCompleted = this.checklist[taskId];
                const checkbox = isCompleted ? '☑' : '☐';
                text += `${checkbox} ${task.label}\n`;
            });

            text += '\n';
        });

        // Copiar al portapapeles
        navigator.clipboard.writeText(text);
        Notifications.success('Checklist copiado al portapapeles');
    },

    /**
     * Cleanup
     */
    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        Logger.info('🧹 PreTripChecklist: Cleaned up');
    }
};

// Exponer globalmente
if (typeof window !== 'undefined') {
    window.PreTripChecklist = PreTripChecklist;
}
