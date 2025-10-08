// js/core.js
import { AppModals } from './modals.js';

export const AppCore = {
  state: {
    currentDay: 1,
    currentTab: 'itinerary',
    darkMode: false,
    checkedActivities: {}
  },

  init() {
    this.loadState();
    this.setupEventListeners();
    this.updateCountdown();
    this.switchTab(this.state.currentTab);
    setInterval(() => this.updateCountdown(), 60000);
  },

  loadState() {
    // Dark Mode
    this.state.darkMode = localStorage.getItem('darkMode') === 'true';
    if (this.state.darkMode) {
      document.documentElement.classList.add('dark');
      document.getElementById('darkModeIcon').textContent = '☀️';
    }
    // Checked activities
    this.state.checkedActivities = JSON.parse(localStorage.getItem('checkedActivities') || '{}');
  },

  setupEventListeners() {
    // Header Buttons
    document.getElementById('themeToggle').addEventListener('click', () => this.toggleDarkMode());
    document.querySelector('button[data-modal="emergency"]').addEventListener('click', () => AppModals.open('emergency'));

    // Tab Navigation
    document.getElementById('tabSelector').addEventListener('click', (e) => {
      if (e.target.matches('.tab-btn')) {
        this.switchTab(e.target.dataset.tab);
      }
    });

    // Floating Action Buttons
    document.getElementById('floating-buttons-container').addEventListener('click', (e) => {
        const fab = e.target.closest('.floating-btn');
        if (fab) {
            AppModals.open(fab.dataset.modal);
        }
    });
    
    // Modal Close Logic
    document.getElementById('modalsContainer').addEventListener('click', (e) => {
        const closeButton = e.target.closest('.modal-close-btn');
        if (closeButton) {
            AppModals.close(closeButton.dataset.modalClose);
        }
    });
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
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
    document.getElementById('darkModeIcon').textContent = this.state.darkMode ? '☀️' : '🌙';
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
      const currentDay = Math.floor((now - tripStart) / (1000 * 60 * 60 * 24)) + 1;
      elem.textContent = currentDay <= 15 ? `Día ${currentDay} de 15` : 'Viaje completado ✓';
    }
  },

  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
