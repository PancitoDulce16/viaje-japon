// js/core.js

import { ModalRenderer } from './modals.js';
import { ItineraryHandler } from './itinerary.js';
import { TabsHandler } from './tabs.js';

export const AppCore = {
    init() {
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
            const icon = document.getElementById('darkModeIcon');
            if (icon) icon.textContent = '☀️';
        }
        
        this.setupEventListeners();
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 60000);
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
        if (icon) icon.textContent = isDark ? '☀️' : '🌙';
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const content = document.getElementById(`content-${tabName}`);
        if (content) content.classList.remove('hidden');
        
        const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (btn) btn.classList.add('active');
    },

    updateCountdown() {
        const tripStart = new Date('2025-02-16T00:00:00');
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
                textarea.value = localStorage.getItem('travelNotes') || '';
            }
        }
        
        if (modalName === 'budget') {
            import('./budget-tracker.js').then(module => {
                module.BudgetTracker.updateModal();
            });
        }
    },

    closeModal(modalName) {
        const modal = document.getElementById(`modal-${modalName}`);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    saveNotes() {
        const textarea = document.getElementById('notesTextarea');
        if (textarea) {
            localStorage.setItem('travelNotes', textarea.value);
            alert('✅ Notas guardadas!');
            this.closeModal('notes');
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

window.AppCore = AppCore;
