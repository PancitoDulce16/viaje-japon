import { AppModals, ModalRenderer } from './modals.js';
import { ItineraryHandler } from './itinerary.js';
// Importa los otros handlers si es necesario
import { TabsHandler } from './tabs.js';

const App = {
    state: {
        currentTab: 'itinerary',
        darkMode: false,
    },
    init() {
        // Cargar estado
        this.state.darkMode = localStorage.getItem('darkMode') === 'true';
        if (this.state.darkMode) {
            document.documentElement.classList.add('dark');
            document.getElementById('darkModeIcon').textContent = '☀️';
        }
        
        // Renderizar contenido dinámico
        ModalRenderer.renderModals();
        ItineraryHandler.renderItinerary();
        TabsHandler.renderAllTabs(); // Asegúrate de que esto renderice map, flights, utils.

        // Configurar Listeners
        this.setupEventListeners();
        
        // Actualizar UI
        updateCountdown();
        setInterval(updateCountdown, 60000);
    },
    setupEventListeners() {
        // Theme Toggle
        document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);

        // Tab Selector
        document.getElementById('tabSelector').addEventListener('click', e => {
            if (e.target.matches('.tab-btn')) {
                switchTab(e.target.dataset.tab);
            }
        });

        // Modals
        document.querySelector('button[data-modal="emergency"]').addEventListener('click', () => AppModals.open('emergency'));
        document.querySelectorAll('.floating-btn').forEach(btn => {
            btn.addEventListener('click', () => AppModals.open(btn.dataset.modal));
        });
        document.getElementById('modalsContainer').addEventListener('click', e => {
            const btn = e.target.closest('.modal-close-btn');
            if (btn) AppModals.close(btn.dataset.modalClose);
        });
    }
};

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
    document.getElementById('darkModeIcon').textContent = isDark ? '☀️' : '🌙';
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`content-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

function updateCountdown() {
    const tripStart = new Date('2025-02-16T00:00:00');
    const now = new Date();
    const diff = tripStart.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const elem = document.getElementById('countdown');
    if (days > 0) {
        elem.textContent = `Faltan ${days} días`;
    } else {
        elem.textContent = '¡Disfrutando el viaje!';
    }
}

// Exportar funciones globales si algún módulo las necesita, o mantenerlas aquí.
export { App, toggleDarkMode, switchTab, updateCountdown };
