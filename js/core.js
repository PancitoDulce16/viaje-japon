// js/core.js
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
    setInterval(() => this.updateCountdown(), 60000);
  },

  loadState() {
    try {
      this.state.checkedActivities = JSON.parse(localStorage.getItem('checkedActivities') || '{}');
      this.state.darkMode = localStorage.getItem('darkMode') === 'true';
      if (this.state.darkMode) {
        document.documentElement.classList.add('dark');
        const darkIcon = document.getElementById('darkModeIcon');
        if (darkIcon) darkIcon.textContent = '☀️';
        else console.warn('Elemento darkModeIcon no encontrado');
      }
    } catch (error) {
      console.error('Error al cargar estado:', error);
    }
  },

  setupEventListeners() {
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
    const darkIcon = document.getElementById('darkModeIcon');
    if (darkIcon) darkIcon.textContent = this.state.darkMode ? '☀️' : '🌙';
  },

  switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const content = document.getElementById(`content-${tabName}`);
    const btn = document.getElementById(`tab-${tabName}`);
    if (content) content.classList.remove('hidden');
    if (btn) btn.classList.add('active');
    this.state.currentTab = tabName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  updateCountdown() {
    const tripStart = new Date('2025-02-16');
    const now = new Date();
    const diff = tripStart - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const elem = document.getElementById('countdown');
    if (!elem) return;
    if (days > 0) {
      elem.textContent = `Faltan ${days} días`;
    } else if (days === 0) {
      elem.textContent = '¡HOY es el día!';
    } else {
      const currentDay = Math.abs(days) + 1;
      elem.textContent = currentDay <= 15 ? `Día ${currentDay} de 15` : 'Viaje completado ✓';
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

