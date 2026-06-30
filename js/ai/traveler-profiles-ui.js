/**
 * 👤 TRAVELER PROFILES UI
 * ========================
 *
 * Interactive interface for traveler profiles
 */

class TravelerProfilesUI {
  constructor() {
    this.profiles = window.TravelerProfiles;
    this.selectedProfiles = [];
  }

  /**
   * Show profile selector
   */
  showProfileSelector() {
    const modal = this.createModal();

    modal.innerHTML = `
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">👤 ¿Qué tipo de viajero eres?</h2>
          <button class="close-modal text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Selecciona uno o varios perfiles que te identifiquen para recibir recomendaciones personalizadas
        </p>

        <!-- Profile Cards -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          ${this.renderProfileCards()}
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button class="btn btn-primary flex-1" onclick="window.TravelerProfilesUI.viewSelectedProfiles()">
            <i class="fas fa-check mr-2"></i>
            Ver Recomendaciones (${this.selectedProfiles.length})
          </button>
          <button class="btn btn-secondary" onclick="window.TravelerProfilesUI.closeModal()">
            Cancelar
          </button>
        </div>
      </div>
    `;

    // Add close handler
    modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal());

    // Add profile selection handlers
    modal.querySelectorAll('.profile-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const profileKey = e.currentTarget.dataset.profile;
        this.toggleProfile(profileKey, card);
      });
    });
  }

  /**
   * Render profile cards
   */
  renderProfileCards() {
    const allProfiles = this.profiles.getAllProfiles();

    return Object.entries(allProfiles).map(([key, profile]) => `
      <div class="profile-card cursor-pointer border-2 rounded-lg p-5 transition-all hover:shadow-lg ${this.selectedProfiles.includes(key) ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700'}"
           data-profile="${key}">
        <div class="flex items-start gap-3 mb-3">
          <div class="text-4xl">${profile.icon}</div>
          <div class="flex-1">
            <h3 class="font-bold text-lg mb-1">${profile.name}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">${profile.description}</p>
          </div>
          ${this.selectedProfiles.includes(key) ? '<i class="fas fa-check-circle text-purple-600 text-xl"></i>' : ''}
        </div>

        <!-- Traits -->
        <div class="flex flex-wrap gap-1 mb-3">
          ${profile.traits.slice(0, 3).map(trait => `
            <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">${trait}</span>
          `).join('')}
        </div>

        <!-- Budget -->
        <div class="text-sm">
          <span class="font-semibold">Presupuesto diario:</span>
          <span class="text-purple-600 font-bold">¥${profile.budget.daily.toLocaleString()}</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Toggle profile selection
   */
  toggleProfile(profileKey, cardElement) {
    const index = this.selectedProfiles.indexOf(profileKey);

    if (index > -1) {
      // Deselect
      this.selectedProfiles.splice(index, 1);
      cardElement.classList.remove('border-purple-500', 'bg-purple-50', 'dark:bg-purple-900/20');
      cardElement.classList.add('border-gray-200', 'dark:border-gray-700');

      const checkIcon = cardElement.querySelector('.fa-check-circle');
      if (checkIcon) checkIcon.remove();
    } else {
      // Select
      this.selectedProfiles.push(profileKey);
      cardElement.classList.add('border-purple-500', 'bg-purple-50', 'dark:bg-purple-900/20');
      cardElement.classList.remove('border-gray-200', 'dark:border-gray-700');

      // Add check icon
      const iconDiv = cardElement.querySelector('.flex.items-start.gap-3');
      if (iconDiv && !cardElement.querySelector('.fa-check-circle')) {
        iconDiv.insertAdjacentHTML('beforeend', '<i class="fas fa-check-circle text-purple-600 text-xl"></i>');
      }
    }

    // Update button count
    const btn = document.querySelector('button[onclick*="viewSelectedProfiles"]');
    if (btn) {
      btn.innerHTML = `<i class="fas fa-check mr-2"></i>Ver Recomendaciones (${this.selectedProfiles.length})`;
    }
  }

  /**
   * View selected profiles recommendations
   */
  viewSelectedProfiles() {
    if (this.selectedProfiles.length === 0) {
      alert('Selecciona al menos un perfil');
      return;
    }

    this.closeModal();
    this.showRecommendations();
  }

  /**
   * Show personalized recommendations
   */
  showRecommendations() {
    const modal = this.createModal();

    const allProfiles = this.profiles.getAllProfiles();
    const selectedProfilesData = this.selectedProfiles.map(key => allProfiles[key]);

    // Calculate combined must-visit
    const combinedMustVisit = [];
    selectedProfilesData.forEach(profile => {
      combinedMustVisit.push(...profile.mustVisit.slice(0, 3));
    });

    // Calculate average budget
    const avgBudget = Math.round(
      selectedProfilesData.reduce((sum, p) => sum + p.budget.daily, 0) / selectedProfilesData.length
    );

    modal.innerHTML = `
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">✨ Tu Perfil de Viajero</h2>
          <button class="close-modal text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Selected Profiles Summary -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 mb-6">
          <h3 class="font-bold text-lg mb-3">Tu combinación de estilos:</h3>
          <div class="flex flex-wrap gap-3 mb-4">
            ${selectedProfilesData.map(p => `
              <span class="px-4 py-2 bg-white dark:bg-gray-800 rounded-full font-semibold flex items-center gap-2">
                <span class="text-2xl">${p.icon}</span>
                ${p.name}
              </span>
            `).join('')}
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Presupuesto Diario Recomendado</div>
              <div class="text-3xl font-bold text-purple-600">¥${avgBudget.toLocaleString()}</div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de Recomendaciones</div>
              <div class="text-3xl font-bold text-blue-600">${combinedMustVisit.length}</div>
            </div>
          </div>
        </div>

        <!-- Must Visit Places -->
        <div class="mb-6">
          <h3 class="text-xl font-bold mb-4">📍 Lugares Imperdibles Para Ti</h3>
          <div class="grid md:grid-cols-2 gap-3">
            ${combinedMustVisit.map(place => `
              <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-bold">${place.name}</h4>
                  <span class="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded">${place.city}</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">${place.reason}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Detailed Recommendations per Profile -->
        ${selectedProfilesData.map(profile => this.renderProfileRecommendations(profile)).join('')}

        <!-- Actions -->
        <div class="flex gap-3 mt-6">
          <button class="btn btn-primary flex-1" onclick="window.TravelerProfilesUI.saveProfiles()">
            <i class="fas fa-save mr-2"></i>
            Guardar Mi Perfil
          </button>
          <button class="btn btn-secondary" onclick="window.TravelerProfilesUI.showProfileSelector()">
            <i class="fas fa-edit mr-2"></i>
            Cambiar Perfil
          </button>
          <button class="btn btn-secondary" onclick="window.TravelerProfilesUI.closeModal()">
            Cerrar
          </button>
        </div>
      </div>
    `;

    // Add close handler
    modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
  }

  /**
   * Render detailed recommendations for a profile
   */
  renderProfileRecommendations(profile) {
    return `
      <div class="mb-6">
        <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span class="text-3xl">${profile.icon}</span>
          Recomendaciones ${profile.name}
        </h3>

        <div class="grid md:grid-cols-2 gap-4">
          ${Object.entries(profile.recommendations).map(([category, items]) => `
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 class="font-bold mb-3 capitalize">${this.getCategoryName(category)}</h4>
              <ul class="space-y-2">
                ${items.slice(0, 5).map(item => `
                  <li class="flex items-start gap-2 text-sm">
                    <span class="text-purple-600 mt-1">•</span>
                    <span>${item}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Get category display name
   */
  getCategoryName(category) {
    const names = {
      restaurants: '🍽️ Restaurantes',
      experiences: '🎯 Experiencias',
      tips: '💡 Tips',
      activities: '🎨 Actividades',
      shopping: '🛍️ Compras',
      seasons: '🍂 Por Temporada',
      accommodation: '🏨 Alojamiento',
      goldHours: '📸 Mejores Momentos',
      locations: '📍 Locations',
      gear: '🎒 Equipo',
      onsen: '♨️ Onsens',
      temples: '⛩️ Templos',
      museums: '🏛️ Museos',
      routes: '🗺️ Rutas',
      taxFree: '💰 Tax-Free',
      brands: '🏷️ Marcas'
    };
    return names[category] || category;
  }

  /**
   * Save profiles to localStorage
   */
  saveProfiles() {
    localStorage.setItem('travelerProfiles', JSON.stringify(this.selectedProfiles));

    // Show confirmation
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 slide-in-bottom';
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="fas fa-check-circle text-2xl"></i>
        <div>
          <p class="font-bold">Perfil Guardado</p>
          <p class="text-sm">Tus preferencias se usarán para personalizar recomendaciones</p>
        </div>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);

    console.log('✅ Profiles saved:', this.selectedProfiles);
  }

  /**
   * Load profiles from localStorage
   */
  loadProfiles() {
    const saved = localStorage.getItem('travelerProfiles');
    if (saved) {
      this.selectedProfiles = JSON.parse(saved);
      console.log('📂 Profiles loaded:', this.selectedProfiles);
    }
  }

  /**
   * Create modal
   */
  createModal() {
    // Remove existing modal
    const existing = document.getElementById('traveler-profiles-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'traveler-profiles-modal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto';
    modal.innerHTML = '<div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl my-8"></div>';

    document.body.appendChild(modal);

    return modal.firstElementChild;
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.getElementById('traveler-profiles-modal');
    if (modal) modal.remove();
  }

  /**
   * Show quick profile picker (mobile-friendly)
   */
  showQuickPicker() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-0 md:p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-lg w-full md:max-w-2xl p-6 slide-in-bottom">
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6 md:hidden"></div>
        <h3 class="text-xl font-bold mb-4">👤 Selecciona Tu Perfil</h3>
        <div class="grid grid-cols-2 gap-3 mb-4">
          ${this.renderQuickProfileCards()}
        </div>
        <button class="w-full py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold" onclick="this.closest('.fixed').remove();">
          Cerrar
        </button>
      </div>
    `;

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    document.body.appendChild(modal);
  }

  /**
   * Render quick profile cards (simplified)
   */
  renderQuickProfileCards() {
    const allProfiles = this.profiles.getAllProfiles();

    return Object.entries(allProfiles).map(([key, profile]) => `
      <button class="flex flex-col items-center gap-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              onclick="window.TravelerProfilesUI.selectQuickProfile('${key}'); this.closest('.fixed').remove();">
        <span class="text-4xl">${profile.icon}</span>
        <span class="text-sm font-semibold text-center">${profile.name}</span>
      </button>
    `).join('');
  }

  /**
   * Quick select profile
   */
  selectQuickProfile(profileKey) {
    this.selectedProfiles = [profileKey];
    this.saveProfiles();
    this.showRecommendations();
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.TravelerProfilesUI = new TravelerProfilesUI();

  // Load saved profiles on init
  window.TravelerProfilesUI.loadProfiles();

  // Add button listener (when DOM is ready)
  document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-traveler-profiles');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        window.TravelerProfilesUI.showProfileSelector();
      });
    }
  });

  console.log('👤 Traveler Profiles UI loaded!');
}
