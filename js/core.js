// js/core.js
import { AppModals } from './modals.js';

export const AppCore = {
  state: {
    currentDay: 1,
    currentTab: 'itinerary',
    checkedActivities: {},
    darkMode: false
  },

  init() {
    this.loadState();
    this.setupEventListeners();
    this.updateCountdown();
    this.switchTab(this.state.currentTab);
    setInterval(() => this.updateCountdown(), 60000);
  },

  loadState() {
    this.state.checkedActivities = JSON.parse(localStorage.getItem('checkedActivities') || '{}');
    this.state.darkMode = localStorage.getItem('darkMode') === 'true';
    if (this.state.darkMode) {
      document.documentElement.classList.add('dark');
      document.getElementById('themeToggle').textContent = '☀️';
    }
  },

  setupEventListeners() {
    // Manejador de pestañas
    document.getElementById('tabSelector').addEventListener('click', (e) => {
      if (e.target.matches('.tab-btn')) this.switchTab(e.target.dataset.tab);
    });

    // Botones del header
    document.getElementById('themeToggle').addEventListener('click', () => this.toggleDarkMode());
    document.getElementById('emergencyBtn').addEventListener('click', () => AppModals.open('emergency'));

    // Botones flotantes
    document.getElementById('budgetBtn').addEventListener('click', () => AppModals.open('budget'));
    document.getElementById('phrasesBtn').addEventListener('click', () => AppModals.open('phrases'));
    document.getElementById('checklistBtn').addEventListener('click', () => AppModals.open('checklist'));
    document.getElementById('notesBtn').addEventListener('click', () => AppModals.open('notes'));
    
    // *** NUEVO: Manejador central para cerrar modales ***
    document.getElementById('modalsContainer').addEventListener('click', (e) => {
        const closeButton = e.target.closest('.modal-close-btn');
        if (closeButton) {
            AppModals.close(closeButton.dataset.modalClose);
        }
    });

    // Cerrar modales al hacer clic fuera o presionar Escape
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) e.target.classList.remove('active');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));
      }
    });
  },

  toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    this.state.darkMode = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', this.state.darkMode);
    document.getElementById('themeToggle').textContent = this.state.darkMode ? '☀️' : '🌙';
  },

  switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const content = document.getElementById(`content-${tabName}`);
    const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    
    if (content) content.classList.remove('hidden');
    if (btn) btn.classList.add('active');
    
    this.state.currentTab = tabName;
  },

  updateCountdown() {
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
  },

  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
