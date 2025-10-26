// js/core.js - Con sincronización de notas

import { ModalRenderer } from './modals.js';
import { ItineraryHandler } from './itinerary.js';
import { TabsHandler } from './tabs.js';
import { db, auth } from '/js/firebase-config.js';
import { 
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const AppCore = {
    notes: '',
    notesUnsubscribe: null,

    init() {
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
            const icon = document.getElementById('darkModeIcon');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }

        // Renderizar modales (CRITICAL: necesario para que los modales existan en el DOM)
        ModalRenderer.renderModals();

        this.setupEventListeners();
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 60000);

        // Inicializar sync de notas
        this.initNotesSync();
    },

    // Obtener el tripId actual
    getCurrentTripId() {
        if (window.TripsManager && window.TripsManager.currentTrip) {
            return window.TripsManager.currentTrip.id;
        }
        return localStorage.getItem('currentTripId');
    },

    // 🔥 Inicializar listener de notas en tiempo real
    async initNotesSync() {
        // Si ya hay un listener, limpiarlo
        if (this.notesUnsubscribe) {
            this.notesUnsubscribe();
        }

        // Si no hay usuario, cargar de localStorage
        if (!auth.currentUser) {
            this.notes = localStorage.getItem('travelNotes') || '';
            return;
        }

        const tripId = this.getCurrentTripId();
        const userId = auth.currentUser.uid;

        // Si NO hay trip, usar el sistema antiguo (por usuario)
        if (!tripId) {
            console.log('⚠️ Notes: No hay trip seleccionado, usando modo individual');
            const notesRef = doc(db, `users/${userId}/notes`, 'travel');

            this.notesUnsubscribe = onSnapshot(notesRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    this.notes = docSnapshot.data().content || '';
                } else {
                    this.notes = '';
                }
                
                localStorage.setItem('travelNotes', this.notes);
                
                // Actualizar textarea si está abierto
                const textarea = document.getElementById('notesTextarea');
                if (textarea && document.getElementById('modal-notes').classList.contains('active')) {
                    textarea.value = this.notes;
                }
                
                console.log('✅ Notas (individual) sincronizadas');
            }, (error) => {
                console.error('❌ Error en sync de notas:', error);
                this.notes = localStorage.getItem('travelNotes') || '';
            });

            return;
        }

        // 🔥 MODO COLABORATIVO: Usar el trip compartido
        console.log('🤝 Notes: Modo colaborativo activado para trip:', tripId);
        const notesRef = doc(db, `trips/${tripId}/data`, 'notes');

        this.notesUnsubscribe = onSnapshot(notesRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                this.notes = docSnapshot.data().content || '';
            } else {
                this.notes = '';
            }
            
            // También guardar en localStorage como backup
            localStorage.setItem('travelNotes', this.notes);
            
            // Actualizar textarea si está abierto
            const textarea = document.getElementById('notesTextarea');
            if (textarea && document.getElementById('modal-notes').classList.contains('active')) {
                textarea.value = this.notes;
            }
            
            console.log('✅ Notas COMPARTIDAS sincronizadas');
        }, (error) => {
            console.error('❌ Error en sync de notas compartidas:', error);
            this.notes = localStorage.getItem('travelNotes') || '';
        });
    },

    setupEventListeners() {
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggleDarkMode());
        }

        const tabSelector = document.getElementById('tabSelector');
        if (tabSelector) {
            tabSelector.addEventListener('click', (e) => {
                const tabButton = e.target.closest('.tab-btn');
                if (tabButton) this.switchTab(tabButton.dataset.tab);
            });
        }

        document.body.addEventListener('click', (e) => {
            const modalButton = e.target.closest('[data-modal]');
            if (modalButton) {
                e.preventDefault();
                this.openModal(modalButton.dataset.modal);
            }
        });

        const modalsContainer = document.getElementById('modalsContainer');
        if (modalsContainer) {
            modalsContainer.addEventListener('click', (e) => {
                const closeButton = e.target.closest('.modal-close');
                if (closeButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    const modalId = closeButton.dataset.modalClose;
                    this.closeModal(modalId);
                    return;
                }
                
                if (e.target.classList.contains('modal')) {
                    const modalId = e.target.id.replace('modal-', '');
                    this.closeModal(modalId);
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    const modalId = modal.id.replace('modal-', '');
                    this.closeModal(modalId);
                });
            }
        });
    },

    toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDark);
        const icon = document.getElementById('darkModeIcon');
        if (icon) {
            if (isDark) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    },

    switchTab(tabName) {
        // 🔥 Limpiar listeners de Firestore antes de cambiar de tab (previene memory leaks)
        this.cleanupCurrentTab();

        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
            tab.classList.remove('animate__animated', 'animate__fadeIn');
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const content = document.getElementById(`content-${tabName}`);
        if (content) {
            content.classList.remove('hidden');
            content.classList.add('animate__animated', 'animate__fadeIn');
        }

        const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (btn) btn.classList.add('active');

        // Fix map size when switching to map tab
        if (tabName === 'map' && window.MapHandler) {
            setTimeout(() => {
                if (window.MapHandler.fixMapSize) {
                    window.MapHandler.fixMapSize();
                }
            }, 150);
        }
    },

    cleanupCurrentTab() {
        // 🔥 Limpiar listeners de Firestore de todos los handlers
        const handlers = [
            window.FlightsHandler,
            window.HotelsHandler,
            window.BudgetTracker,
            window.PackingList,
            window.FavoritesManager,
            window.ChatManager,
            window.PreparationHandler,
            window.TripsManager
        ];

        handlers.forEach(handler => {
            if (handler && typeof handler.cleanup === 'function') {
                handler.cleanup();
            }
        });
    },

    updateCountdown() {
        const tripStart = new Date('2026-02-16T00:00:00');
        const now = new Date();
        const diff = tripStart.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        
        const elem = document.getElementById('countdown');
        if (elem) {
            if (days > 0) {
                elem.textContent = `Faltan ${days} días`;
            } else if (days === 0) {
                elem.textContent = '¡HOY ES EL DÍA! 🎉';
            } else {
                elem.textContent = 'Viaje completado ✓';
            }
        }
    },

    openModal(modalName) {
        const modal = document.getElementById(`modal-${modalName}`);
        if (!modal) return;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (modalName === 'notes') {
            const textarea = document.getElementById('notesTextarea');
            if (textarea) {
                textarea.value = this.notes || localStorage.getItem('travelNotes') || '';
            }

            // Actualizar indicador de sync
            this.updateNotesSyncIndicator();
        }

        if (modalName === 'budget') {
            import('./budget-tracker.js').then(module => {
                module.BudgetTracker.updateModal();
            });
        }

        if (modalName === 'packing') {
            if (window.PackingList) {
                window.PackingList.renderList();
            }
        }

        if (modalName === 'favorites') {
            if (window.FavoritesManager) {
                window.FavoritesManager.renderFavoritesList();
            }
        }
    },

    closeModal(modalName) {
        const modal = document.getElementById(`modal-${modalName}`);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    updateNotesSyncIndicator() {
        const syncBadge = document.querySelector('#modal-notes .sync-badge');
        if (!syncBadge) return;

        const tripId = this.getCurrentTripId();
        let syncStatus;
        
        if (!auth.currentUser) {
            syncStatus = '<span class="text-sm text-yellow-600 dark:text-yellow-400">📱 Solo local</span>';
        } else if (tripId) {
            syncStatus = '<span class="text-sm text-green-600 dark:text-green-400">🤝 Modo Colaborativo - Cambios se sincronizan en tiempo real</span>';
        } else {
            syncStatus = '<span class="text-sm text-blue-600 dark:text-blue-400">☁️ Sincronizado con tu cuenta</span>';
        }
        
        syncBadge.innerHTML = syncStatus;
    },

    async saveNotes() {
        const textarea = document.getElementById('notesTextarea');
        if (!textarea) return;

        this.notes = textarea.value;

        try {
            if (!auth.currentUser) {
                // Sin usuario, solo guardar localmente
                localStorage.setItem('travelNotes', this.notes);
                window.Notifications.success('✅ Notas guardadas localmente');
                this.closeModal('notes');
                return;
            }

            const tripId = this.getCurrentTripId();

            if (!tripId) {
                // Modo individual
                const userId = auth.currentUser.uid;
                const notesRef = doc(db, `users/${userId}/notes`, 'travel');
                
                await setDoc(notesRef, {
                    content: this.notes,
                    lastUpdated: new Date().toISOString(),
                    updatedBy: auth.currentUser.email
                });
                
                console.log('✅ Notas sincronizadas (individual)');
                window.Notifications.success('✅ Notas guardadas y sincronizadas');
            } else {
                // 🔥 Modo colaborativo
                const notesRef = doc(db, `trips/${tripId}/data`, 'notes');
                
                await setDoc(notesRef, {
                    content: this.notes,
                    lastUpdated: new Date().toISOString(),
                    updatedBy: auth.currentUser.email
                });
                
                console.log('✅ Notas sincronizadas (COMPARTIDAS) por:', auth.currentUser.email);
                window.Notifications.success('✅ Notas guardadas y compartidas con el equipo');
            }

            this.closeModal('notes');
        } catch (error) {
            console.error('❌ Error guardando notas:', error);
            window.Notifications.error('Error al guardar. Intenta de nuevo.');
        }
    },

    // Re-inicializar cuando cambie el trip
    reinitialize() {
        this.initNotesSync();
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Expose globally for inline handlers and other modules
window.AppCore = AppCore;
// ====================================================================================
// MANEJO DE EVENTOS DE AUTENTICACIÓN
// ====================================================================================
window.addEventListener('auth:initialized', (event) => {
    console.log('[AppCore] ✨ Evento auth:initialized recibido. Inicializando sync de notas...');
    AppCore.initNotesSync();
});

window.addEventListener('auth:loggedOut', () => {
    console.log('[AppCore] 🚫 Evento auth:loggedOut recibido. Limpiando notas...');
    if (AppCore.notesUnsubscribe) AppCore.notesUnsubscribe();
    AppCore.notes = '';
    localStorage.removeItem('travelNotes');
});
