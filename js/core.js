import { AppModals, ModalRenderer } from './modals.js';
import { ItineraryHandler } from './itinerary.js';
import { TabsHandler } from './tabs.js';

const App = {
    init() {
        // Cargar estado guardado (como el modo oscuro)
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
            const icon = document.getElementById('darkModeIcon');
            if (icon) icon.textContent = '☀️';
        }
        
        // Renderizar todo el contenido dinámico en la página
        ModalRenderer.renderModals();
        ItineraryHandler.renderItinerary(); // ¡CORREGIDO!
        TabsHandler.renderAllTabs();

        // Configurar TODOS los event listeners
        this.setupEventListeners();
        
        // Iniciar la cuenta regresiva
        updateCountdown();
        setInterval(updateCountdown, 60000);
    },

    setupEventListeners() {
        // Botón de Modo Oscuro
        document.getElementById('themeToggle')?.addEventListener('click', toggleDarkMode);

        // Navegación por Pestañas (Tabs)
        document.getElementById('tabSelector')?.addEventListener('click', (e) => {
            const tabButton = e.target.closest('.tab-btn');
            if (tabButton) {
                switchTab(tabButton.dataset.tab);
            }
        });

        // Botón de Emergencia (SOS)
        document.querySelector('button[data-modal="emergency"]')?.addEventListener('click', () => AppModals.open('emergency'));

        // Botones Flotantes
        document.querySelectorAll('.floating-btn[data-modal]').forEach(btn => {
            btn.addEventListener('click', () => AppModals.open(btn.dataset.modal));
        });

        // Lógica para CERRAR los modales
        document.getElementById('modalsContainer')?.addEventListener('click', (e) => {
            const closeButton = e.target.closest('.modal-close-btn');
            if (closeButton) {
                AppModals.close(closeButton.dataset.modalClose);
            }
        });
    }
};

// --- FUNCIONES GLOBALES ---

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
    const icon = document.getElementById('darkModeIcon');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
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

export { App };
