import { AppModals, ModalRenderer } from './modals.js';
import { ItineraryHandler } from './itinerary.js';
import { TabsHandler } from './tabs.js';

const App = {
    init() {
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
            document.getElementById('darkModeIcon').textContent = '☀️';
        }
        
        ModalRenderer.renderModals();
        ItineraryHandler.init(); // Usamos init para configurar el itinerario
        TabsHandler.renderAllTabs();

        this.setupEventListeners();
        
        updateCountdown();
        setInterval(updateCountdown, 60000);
    },

    setupEventListeners() {
        // Botón de Modo Oscuro
        document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);

        // Pestañas de Navegación
        document.getElementById('tabSelector').addEventListener('click', (e) => {
            const tabButton = e.target.closest('.tab-btn');
            if (tabButton) switchTab(tabButton.dataset.tab);
        });

        // Botones que abren modales (TODOS)
        document.body.addEventListener('click', (e) => {
            const modalButton = e.target.closest('[data-modal]');
            if (modalButton) {
                AppModals.open(modalButton.dataset.modal);
            }
        });

        // Lógica para CERRAR los modales
        document.getElementById('modalsContainer').addEventListener('click', (e) => {
            const closeButton = e.target.closest('.modal-close-btn');
            if (closeButton) AppModals.close(closeButton.dataset.modalClose);
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
    elem.textContent = days > 0 ? `Faltan ${days} días` : 'Viaje completado ✓';
}

export { App };
