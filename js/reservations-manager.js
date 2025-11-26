// js/reservations-manager.js - Sistema de Gestión de Reservas

import { db, auth } from './firebase-config.js';
import { collection, doc, getDoc, setDoc, onSnapshot, deleteDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { Logger } from './helpers.js';
import { Notifications } from './notifications.js';

/**
 * ReservationsManager - Sistema para gestionar reservas del viaje
 */
export const ReservationsManager = {
    currentTrip: null,
    reservations: [],
    unsubscribe: null,

    /**
     * Inicializar el gestor de reservas
     */
    async init(tripId) {
        Logger.info('🎫 ReservationsManager: Inicializando...');

        if (!tripId) {
            Logger.warn('ReservationsManager: No trip ID provided');
            return;
        }

        this.currentTrip = tripId;
        await this.setupRealtimeSync();
        this.render();
    },

    /**
     * Configurar sincronización en tiempo real
     */
    async setupRealtimeSync() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        const reservationsRef = doc(db, `trips/${this.currentTrip}/data`, 'reservations');

        this.unsubscribe = onSnapshot(reservationsRef, (docSnap) => {
            if (docSnap.exists()) {
                this.reservations = docSnap.data().reservations || [];
                this.render();
            }
        }, (error) => {
            Logger.error('Error in realtime sync:', error);
        });
    },

    /**
     * Renderizar la UI del gestor de reservas
     */
    render() {
        const container = document.getElementById('reservationsContent');
        if (!container) {
            Logger.warn('ReservationsManager: Container not found');
            return;
        }

        // Agrupar reservas por tipo
        const byType = this.groupReservationsByType();
        const upcomingReservations = this.getUpcomingReservations();

        const html = `
            <div class="reservations-manager">
                <!-- Header -->
                <div class="mb-6">
                    <h3 class="text-xl font-bold mb-2">🎫 Gestor de Reservas</h3>
                    <p class="text-gray-600 dark:text-gray-400">
                        Guarda todas tus reservas de hotel, restaurantes, actividades y transporte
                    </p>
                </div>

                <!-- Quick Stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${byType.hotel?.length || 0}</div>
                        <div class="text-xs text-blue-700 dark:text-blue-300 font-semibold">🏨 Hoteles</div>
                    </div>
                    <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                        <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">${byType.restaurant?.length || 0}</div>
                        <div class="text-xs text-orange-700 dark:text-orange-300 font-semibold">🍜 Restaurantes</div>
                    </div>
                    <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${byType.activity?.length || 0}</div>
                        <div class="text-xs text-purple-700 dark:text-purple-300 font-semibold">🎮 Actividades</div>
                    </div>
                    <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <div class="text-2xl font-bold text-green-600 dark:text-green-400">${byType.transport?.length || 0}</div>
                        <div class="text-xs text-green-700 dark:text-green-300 font-semibold">🚄 Transporte</div>
                    </div>
                </div>

                <!-- Add Reservation Button -->
                <div class="mb-6">
                    <button id="addReservationBtn" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg">
                        ➕ Nueva Reserva
                    </button>
                </div>

                <!-- Upcoming Reservations -->
                ${upcomingReservations.length > 0 ? `
                    <div class="mb-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
                        <h4 class="font-bold mb-3 flex items-center gap-2">
                            <span>⏰</span>
                            <span>Próximas Reservas (siguientes 7 días)</span>
                        </h4>
                        <div class="space-y-2">
                            ${upcomingReservations.map(r => this.renderReservationCard(r, true)).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Reservations by Type -->
                <div class="space-y-6">
                    ${this.renderReservationSection('hotel', '🏨 Hoteles', byType.hotel || [])}
                    ${this.renderReservationSection('restaurant', '🍜 Restaurantes', byType.restaurant || [])}
                    ${this.renderReservationSection('activity', '🎮 Actividades', byType.activity || [])}
                    ${this.renderReservationSection('transport', '🚄 Transporte', byType.transport || [])}
                </div>

                <!-- Export Actions -->
                <div class="mt-6 flex flex-wrap gap-3">
                    <button id="exportReservationsPDFBtn" class="btn-primary">
                        📄 Exportar a PDF
                    </button>
                    <button id="exportReservationsCSVBtn" class="btn-secondary">
                        📊 Exportar a CSV
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.attachEventListeners();
    },

    /**
     * Renderizar sección de reservas por tipo
     */
    renderReservationSection(type, title, reservations) {
        if (reservations.length === 0) {
            return `
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 class="font-bold mb-3">${title}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No hay reservas de ${title.toLowerCase()} aún
                    </p>
                </div>
            `;
        }

        // Ordenar por fecha
        const sorted = reservations.sort((a, b) => new Date(a.date) - new Date(b.date));

        return `
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 class="font-bold mb-3">${title}</h4>
                <div class="space-y-2">
                    ${sorted.map(r => this.renderReservationCard(r)).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Renderizar card de reserva individual
     */
    renderReservationCard(reservation, compact = false) {
        const typeIcons = {
            hotel: '🏨',
            restaurant: '🍜',
            activity: '🎮',
            transport: '🚄'
        };

        const icon = typeIcons[reservation.type] || '📌';
        const date = new Date(reservation.date);
        const dateStr = date.toLocaleDateString('es', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = reservation.time || '--:--';

        // Determinar si la reserva requiere recordatorio
        const daysUntil = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
        const needsAttention = daysUntil <= 7 && daysUntil >= 0;

        return `
            <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border ${needsAttention ? 'border-yellow-400 dark:border-yellow-600' : 'border-gray-200 dark:border-gray-600'} hover:shadow-md transition">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xl">${icon}</span>
                            <h5 class="font-bold text-gray-900 dark:text-white">${reservation.name}</h5>
                            ${needsAttention ? '<span class="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full font-semibold">⚠️ Próximamente</span>' : ''}
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <div class="flex items-center gap-2">
                                <span>📅</span>
                                <span>${dateStr} • ${timeStr}</span>
                            </div>
                            ${reservation.confirmationNumber ? `
                                <div class="flex items-center gap-2">
                                    <span>🎫</span>
                                    <span class="font-mono text-xs">${reservation.confirmationNumber}</span>
                                </div>
                            ` : ''}
                            ${reservation.location ? `
                                <div class="flex items-center gap-2">
                                    <span>📍</span>
                                    <span>${reservation.location}</span>
                                </div>
                            ` : ''}
                            ${reservation.url ? `
                                <div class="flex items-center gap-2">
                                    <span>🔗</span>
                                    <a href="${reservation.url}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline text-xs">Ver reserva</a>
                                </div>
                            ` : ''}
                            ${reservation.notes ? `
                                <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                                    💡 ${reservation.notes}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="flex flex-col gap-1 ml-3">
                        <button class="edit-reservation-btn text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                data-reservation-id="${reservation.id}"
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-reservation-btn text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                                data-reservation-id="${reservation.id}"
                                title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Agrupar reservas por tipo
     */
    groupReservationsByType() {
        const grouped = {};
        this.reservations.forEach(reservation => {
            if (!grouped[reservation.type]) {
                grouped[reservation.type] = [];
            }
            grouped[reservation.type].push(reservation);
        });
        return grouped;
    },

    /**
     * Obtener reservas próximas (siguientes 7 días)
     */
    getUpcomingReservations() {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

        return this.reservations.filter(r => {
            const reservationDate = new Date(r.date);
            return reservationDate >= now && reservationDate <= sevenDaysFromNow;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    /**
     * Agregar event listeners
     */
    attachEventListeners() {
        // Botón agregar reserva
        const addBtn = document.getElementById('addReservationBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddReservationModal());
        }

        // Botones editar
        document.querySelectorAll('.edit-reservation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.reservationId;
                this.showEditReservationModal(id);
            });
        });

        // Botones eliminar
        document.querySelectorAll('.delete-reservation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.reservationId;
                this.deleteReservation(id);
            });
        });

        // Exportar PDF
        const exportPDFBtn = document.getElementById('exportReservationsPDFBtn');
        if (exportPDFBtn) {
            exportPDFBtn.addEventListener('click', () => this.exportToPDF());
        }

        // Exportar CSV
        const exportCSVBtn = document.getElementById('exportReservationsCSVBtn');
        if (exportCSVBtn) {
            exportCSVBtn.addEventListener('click', () => this.exportToCSV());
        }
    },

    /**
     * Mostrar modal para agregar reserva
     */
    showAddReservationModal() {
        // TODO: Implementar modal
        Notifications.info('Modal de agregar reserva - Por implementar');
    },

    /**
     * Mostrar modal para editar reserva
     */
    showEditReservationModal(id) {
        // TODO: Implementar modal
        Notifications.info('Modal de editar reserva - Por implementar');
    },

    /**
     * Eliminar reserva
     */
    async deleteReservation(id) {
        if (!confirm('¿Eliminar esta reserva?')) return;

        try {
            this.reservations = this.reservations.filter(r => r.id !== id);
            await this.saveReservations();
            Notifications.success('Reserva eliminada');
        } catch (error) {
            Logger.error('Error deleting reservation:', error);
            Notifications.error('Error al eliminar reserva');
        }
    },

    /**
     * Guardar reservas en Firestore
     */
    async saveReservations() {
        try {
            const reservationsRef = doc(db, `trips/${this.currentTrip}/data`, 'reservations');
            await setDoc(reservationsRef, {
                reservations: this.reservations,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            Logger.error('Error saving reservations:', error);
            throw error;
        }
    },

    /**
     * Exportar a PDF
     */
    exportToPDF() {
        Notifications.info('Exportar a PDF - Por implementar');
    },

    /**
     * Exportar a CSV
     */
    exportToCSV() {
        if (this.reservations.length === 0) {
            Notifications.error('No hay reservas para exportar');
            return;
        }

        // Crear CSV
        const headers = ['Tipo', 'Nombre', 'Fecha', 'Hora', 'Ubicación', 'Confirmación', 'URL', 'Notas'];
        const rows = this.reservations.map(r => [
            r.type,
            r.name,
            r.date,
            r.time || '',
            r.location || '',
            r.confirmationNumber || '',
            r.url || '',
            r.notes || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reservas_japon_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Notifications.success('CSV descargado');
    },

    /**
     * Cleanup
     */
    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        Logger.info('🧹 ReservationsManager: Cleaned up');
    }
};

// Exportar globalmente
window.ReservationsManager = ReservationsManager;

console.log('✅ Reservations Manager module loaded');

export default ReservationsManager;
