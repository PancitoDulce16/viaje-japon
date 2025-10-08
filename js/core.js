import { AppModals, ModalRenderer } from './modals.js';
import { ItineraryHandler } from './itinerary.js';
import { TabsHandler } from './tabs.js';

const App = {
    init() {
        // Cargar estado
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
            if (document.getElementById('darkModeIcon')) {
                document.getElementById('darkModeIcon').textContent = '☀️';
            }
        }
        
        // Renderizar contenido
        ModalRenderer.renderModals();
        ItineraryHandler.renderItinerary();
        TabsHandler.renderAllTabs();

        // Configurar Listeners
        this.setupEventListeners();
        
        // Actualizar UI
        updateCountdown();
        setInterval(updateCountdown, 60000);
    },
    setupEventListeners() {
        // Theme Toggle
        document.getElementById('themeToggle')?.addEventListener('click', toggleDarkMode);

        // Tab Selector
        document.getElementById('tabSelector')?.addEventListener('click', e => {
            if (e.target.matches('.tab-btn')) {
                switchTab(e.target.dataset.tab);
            }
        });

        // Modals Openers (CORREGIDO)
        document.querySelector('button[data-modal="emergency"]')?.addEventListener('click', () => AppModals.open('emergency'));
        document.querySelectorAll('.floating-btn[data-modal]').forEach(btn => {
            btn.addEventListener('click', () => AppModals.open(btn.dataset.modal));
        });

        // Modals Closers
        document.getElementById('modalsContainer')?.addEventListener('click', e => {
            const btn = e.target.closest('.modal-close-btn');
            if (btn) AppModals.close(btn.dataset.modalClose);
        });
    }
};

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
    if (document.getElementById('darkModeIcon')) {
        document.getElementById('darkModeIcon').textContent = isDark ? '☀️' : '🌙';
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const content = document.getElementById(`content-${tabName}`);
    const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    
    if (content) content.classList.remove('hidden');
    if (btn) btn.classList.add('active');
}

function updateCountdown() {
    const tripStart = new Date('2025-02-16T00:00:00');
    const now = new Date();
    const diff = tripStart.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const elem = document.getElementById('countdown');
    if (!elem) return;

    if (days > 0) {
        elem.textContent = `Faltan ${days} días`;
    } else {
        elem.textContent = 'Viaje completado ✓';
    }
}

export { App, toggleDarkMode, switchTab, updateCountdown };
