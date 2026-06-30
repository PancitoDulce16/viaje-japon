/**
 * ⛩️ CULTURAL KNOWLEDGE UI
 * ========================
 *
 * Interactive interface for cultural guide
 */

class CulturalKnowledgeUI {
  constructor() {
    this.knowledge = window.CulturalKnowledge;
    this.currentTab = 'etiquette';
  }

  /**
   * Show cultural guide
   */
  showGuide() {
    const modal = this.createModal();

    modal.innerHTML = `
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">⛩️ Guía Cultural de Japón</h2>
          <button class="close-modal text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button class="cultural-tab active" data-tab="etiquette">
            🙇 Etiqueta
          </button>
          <button class="cultural-tab" data-tab="phrases">
            🗣️ Frases
          </button>
          <button class="cultural-tab" data-tab="festivals">
            🎌 Festivales
          </button>
          <button class="cultural-tab" data-tab="taboos">
            🚫 Tabúes
          </button>
          <button class="cultural-tab" data-tab="tips">
            💡 Tips
          </button>
        </div>

        <!-- Content -->
        <div id="cultural-content">
          ${this.renderEtiquette()}
        </div>
      </div>
    `;

    // Add close handler
    modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal());

    // Add tab handlers
    modal.querySelectorAll('.cultural-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName, modal);
      });
    });
  }

  /**
   * Switch between tabs
   */
  switchTab(tabName, modal) {
    this.currentTab = tabName;

    // Update active tab
    modal.querySelectorAll('.cultural-tab').forEach(t => t.classList.remove('active'));
    modal.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content
    const content = modal.querySelector('#cultural-content');
    switch (tabName) {
      case 'etiquette':
        content.innerHTML = this.renderEtiquette();
        break;
      case 'phrases':
        content.innerHTML = this.renderPhrases();
        break;
      case 'festivals':
        content.innerHTML = this.renderFestivals();
        break;
      case 'taboos':
        content.innerHTML = this.renderTaboos();
        break;
      case 'tips':
        content.innerHTML = this.renderTips();
        break;
    }
  }

  /**
   * Render etiquette section
   */
  renderEtiquette() {
    const etiquette = this.knowledge.getEtiquette();

    return `
      <div class="space-y-6">
        ${Object.entries(etiquette).map(([category, rules]) => `
          <div>
            <h3 class="text-xl font-bold mb-4 capitalize">
              ${this.getCategoryIcon(category)} ${this.getCategoryName(category)}
            </h3>
            <div class="space-y-3">
              ${rules.map(rule => this.renderEtiquetteCard(rule)).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render single etiquette card
   */
  renderEtiquetteCard(rule) {
    const importanceColors = {
      critical: 'border-red-300 bg-red-50 dark:bg-red-900/20',
      high: 'border-orange-300 bg-orange-50 dark:bg-orange-900/20',
      medium: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20',
      low: 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
    };

    const importanceLabels = {
      critical: '🔴 CRÍTICO',
      high: '🟠 MUY IMPORTANTE',
      medium: '🟡 IMPORTANTE',
      low: '🔵 ÚTIL'
    };

    return `
      <div class="border-2 rounded-lg p-5 ${importanceColors[rule.importance]}">
        <div class="flex items-start gap-3 mb-3">
          <div class="text-3xl">${rule.icon}</div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-bold text-lg">${rule.title}</h4>
              <span class="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800">
                ${importanceLabels[rule.importance]}
              </span>
            </div>
            <p class="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ${rule.rule}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              ${rule.details}
            </p>
            <div class="grid md:grid-cols-2 gap-2">
              <div class="bg-white dark:bg-gray-800 rounded p-2">
                <p class="text-xs font-semibold text-green-600 mb-1">✅ SÍ:</p>
                <p class="text-sm">${rule.doExample}</p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded p-2">
                <p class="text-xs font-semibold text-red-600 mb-1">❌ NO:</p>
                <p class="text-sm">${rule.dontExample}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render phrases section
   */
  renderPhrases() {
    const phrases = this.knowledge.getPhrases();

    return `
      <div class="space-y-6">
        ${Object.entries(phrases).map(([category, phrasesList]) => `
          <div>
            <h3 class="text-xl font-bold mb-4 capitalize">
              ${this.getPhraseCategoryIcon(category)} ${this.getPhraseCategoryName(category)}
            </h3>
            <div class="space-y-2">
              ${phrasesList.map(phrase => this.renderPhraseCard(phrase)).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render single phrase card
   */
  renderPhraseCard(phrase) {
    return `
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="grid md:grid-cols-3 gap-3">
          <div>
            <div class="text-xs text-gray-500 mb-1">Japonés:</div>
            <div class="text-xl font-bold">${phrase.japanese}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Romaji:</div>
            <div class="text-lg font-semibold text-purple-600">${phrase.romaji}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Español:</div>
            <div class="text-base">${phrase.english}</div>
          </div>
        </div>
        <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span class="font-semibold">Contexto:</span> ${phrase.context}
        </div>
      </div>
    `;
  }

  /**
   * Render festivals section
   */
  renderFestivals() {
    const festivals = this.knowledge.festivals;
    const currentMonth = new Date().getMonth() + 1;
    const upcoming = festivals.filter(f => f.months.some(m => m >= currentMonth));
    const past = festivals.filter(f => f.months.every(m => m < currentMonth));

    return `
      <div class="space-y-6">
        ${upcoming.length > 0 ? `
          <div>
            <h3 class="text-xl font-bold mb-4">🎌 Festivales Próximos/Actuales</h3>
            <div class="space-y-4">
              ${upcoming.map(f => this.renderFestivalCard(f, true)).join('')}
            </div>
          </div>
        ` : ''}

        ${past.length > 0 ? `
          <div>
            <h3 class="text-xl font-bold mb-4">📅 Otros Festivales del Año</h3>
            <div class="space-y-4">
              ${past.map(f => this.renderFestivalCard(f, false)).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render single festival card
   */
  renderFestivalCard(festival, isUpcoming) {
    const borderColor = isUpcoming ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-800';

    return `
      <div class="border-2 rounded-lg p-5 ${borderColor}">
        <div class="flex items-start gap-3 mb-3">
          <div class="text-4xl">${festival.icon}</div>
          <div class="flex-1">
            <h4 class="font-bold text-xl mb-1">${festival.name}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              📅 ${festival.peakWeeks}
            </p>
            <p class="text-base mb-3">${festival.description}</p>

            <div class="bg-white dark:bg-gray-900 rounded p-3 mb-3">
              <p class="text-sm font-semibold mb-2">📍 Mejores Lugares:</p>
              <ul class="list-disc list-inside text-sm space-y-1">
                ${festival.bestPlaces.map(place => `<li>${place}</li>`).join('')}
              </ul>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
              <p class="text-sm"><span class="font-semibold">💡 Tip:</span> ${festival.tips}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render taboos section
   */
  renderTaboos() {
    const taboos = this.knowledge.taboos;

    return `
      <div class="space-y-6">
        ${taboos.map(category => `
          <div>
            <h3 class="text-xl font-bold mb-4">${category.icon} ${category.category}</h3>
            <div class="space-y-2">
              ${category.items.map(item => this.renderTabooCard(item)).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render single taboo card
   */
  renderTabooCard(item) {
    const severityColors = {
      critical: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20',
      high: 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20',
      medium: 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      low: 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    };

    const icon = item.do ? '✅' : '❌';
    const text = item.do || item.dont;
    const label = item.do ? 'SÍ' : 'NO';

    return `
      <div class="${severityColors[item.severity]} rounded p-4">
        <div class="flex items-start gap-3">
          <div class="text-2xl">${icon}</div>
          <div class="flex-1">
            <p class="font-semibold mb-1">
              <span class="text-xs px-2 py-1 rounded ${item.do ? 'bg-green-600' : 'bg-red-600'} text-white mr-2">
                ${label}
              </span>
              ${text}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <span class="font-semibold">Por qué:</span> ${item.because}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render tips section
   */
  renderTips() {
    return `
      <div class="space-y-6">
        <div>
          <h3 class="text-xl font-bold mb-4">💡 Consejos por Situación</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Selecciona una situación para ver consejos específicos:
          </p>
          <div class="grid md:grid-cols-2 gap-3">
            ${this.renderTipCategory('restaurant', '🍜', 'Restaurante')}
            ${this.renderTipCategory('temple', '⛩️', 'Templo/Santuario')}
            ${this.renderTipCategory('train', '🚄', 'Tren/Transporte')}
            ${this.renderTipCategory('shopping', '🛍️', 'Compras')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render tip category
   */
  renderTipCategory(situation, icon, name) {
    const tips = this.knowledge.getContextualTips(situation);

    return `
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 class="font-bold text-lg mb-3">${icon} ${name}</h4>
        <ul class="space-y-2">
          ${tips.map(tip => `
            <li class="flex items-start gap-2">
              <span class="text-purple-600 mt-1">•</span>
              <span class="text-sm">${tip}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category) {
    const icons = {
      general: '🌏',
      dining: '🍜',
      temples: '⛩️',
      transport: '🚄',
      onsen: '♨️'
    };
    return icons[category] || '📋';
  }

  /**
   * Get category name
   */
  getCategoryName(category) {
    const names = {
      general: 'Etiqueta General',
      dining: 'Comida y Restaurantes',
      temples: 'Templos y Santuarios',
      transport: 'Transporte Público',
      onsen: 'Onsen y Baños'
    };
    return names[category] || category;
  }

  /**
   * Get phrase category icon
   */
  getPhraseCategoryIcon(category) {
    const icons = {
      greetings: '👋',
      gratitude: '🙏',
      dining: '🍜',
      emergencies: '🚨',
      shopping: '🛍️'
    };
    return icons[category] || '💬';
  }

  /**
   * Get phrase category name
   */
  getPhraseCategoryName(category) {
    const names = {
      greetings: 'Saludos',
      gratitude: 'Agradecimientos',
      dining: 'En Restaurantes',
      emergencies: 'Emergencias',
      shopping: 'Compras'
    };
    return names[category] || category;
  }

  /**
   * Create modal
   */
  createModal() {
    // Remove existing modal
    const existing = document.getElementById('cultural-knowledge-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'cultural-knowledge-modal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4 overflow-y-auto';
    modal.innerHTML = '<div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl my-8"></div>';

    // Add custom styles for tabs
    const style = document.createElement('style');
    style.textContent = `
      .cultural-tab {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        background: white;
        border: 2px solid #e5e7eb;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .cultural-tab:hover {
        background: #f3f4f6;
      }
      .cultural-tab.active {
        background: #9333ea;
        color: white;
        border-color: #9333ea;
      }
      .dark .cultural-tab {
        background: #374151;
        border-color: #4b5563;
        color: white;
      }
      .dark .cultural-tab:hover {
        background: #4b5563;
      }
      .dark .cultural-tab.active {
        background: #9333ea;
        border-color: #9333ea;
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(modal);

    return modal.firstElementChild;
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.getElementById('cultural-knowledge-modal');
    if (modal) modal.remove();
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.CulturalKnowledgeUI = new CulturalKnowledgeUI();

  // Add button listener (when DOM is ready)
  document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-cultural-guide');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        window.CulturalKnowledgeUI.showGuide();
      });
    }
  });

  console.log('⛩️ Cultural Knowledge UI loaded!');
}
