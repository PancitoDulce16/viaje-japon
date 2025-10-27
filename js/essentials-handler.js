// js/essentials-handler.js - Handler para tiendas, productos y experiencias esenciales

import { ESSENTIAL_STORES, ESSENTIAL_PRODUCTS } from '/data/stores-products-data.js';
import { JAPANESE_EXPERIENCES } from '/data/experiences-data.js';
import { Notifications } from './notifications.js';

export const EssentialsHandler = {
  currentView: 'stores', // stores, products, experiences

  init() {
    console.log('🏪 Inicializando Essentials Handler...');
    this.render();
  },

  render() {
    const container = document.getElementById('content-essentials');
    if (!container) {
      console.warn('⚠️ Container #content-essentials no encontrado');
      return;
    }

    container.innerHTML = `
      <div class="max-w-7xl mx-auto p-4 md:p-6">
        <!-- Header -->
        <div class="mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800 dark:text-white">🎌 Guía Esencial de Japón</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Todo lo que necesitas saber para tu viaje: tiendas, productos, experiencias y más.
          </p>

          <!-- View Selector Tabs -->
          <div class="flex gap-2 overflow-x-auto scrollbar-hide mb-6 border-b-2 border-gray-200 dark:border-gray-700">
            <button
              onclick="EssentialsHandler.switchView('stores')"
              class="essentials-tab px-6 py-3 font-semibold transition rounded-t-lg ${this.currentView === 'stores' ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
            >
              🏪 Tiendas
            </button>
            <button
              onclick="EssentialsHandler.switchView('products')"
              class="essentials-tab px-6 py-3 font-semibold transition rounded-t-lg ${this.currentView === 'products' ? 'bg-green-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
            >
              💊 Productos
            </button>
            <button
              onclick="EssentialsHandler.switchView('experiences')"
              class="essentials-tab px-6 py-3 font-semibold transition rounded-t-lg ${this.currentView === 'experiences' ? 'bg-purple-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}"
            >
              🎎 Experiencias
            </button>
          </div>
        </div>

        <!-- Content Area -->
        <div id="essentialsContent">
          ${this.renderCurrentView()}
        </div>
      </div>
    `;
  },

  renderCurrentView() {
    switch(this.currentView) {
      case 'stores':
        return this.renderStores();
      case 'products':
        return this.renderProducts();
      case 'experiences':
        return this.renderExperiences();
      default:
        return '';
    }
  },

  renderStores() {
    return `
      <div class="space-y-8">
        ${this.renderStoreCategory(ESSENTIAL_STORES.discount)}
        ${this.renderStoreCategory(ESSENTIAL_STORES.konbini)}
      </div>
    `;
  },

  renderStoreCategory(category) {
    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
          <span class="text-3xl">${category.icon}</span>
          ${category.name}
        </h3>
        ${category.description ? `<p class="text-gray-600 dark:text-gray-400 mb-6">${category.description}</p>` : ''}

        <div class="space-y-6">
          ${category.stores.map(store => this.renderStore(store)).join('')}
        </div>
      </div>
    `;
  },

  renderStore(store) {
    return `
      <div class="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg transition">
        <!-- Store Header -->
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="text-xl font-bold text-gray-800 dark:text-white">${store.name}</h4>
            ${store.nickname ? `<p class="text-sm text-gray-500 dark:text-gray-400">Aka "${store.nickname}"</p>` : ''}
          </div>
          <span class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold">
            ${store.priceRange}
          </span>
        </div>

        <!-- Description -->
        <p class="text-gray-700 dark:text-gray-300 mb-4">${store.description}</p>

        <!-- Quick Info -->
        <div class="grid md:grid-cols-2 gap-3 mb-4">
          <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p class="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">⏰ Horarios</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">${store.hours}</p>
          </div>
          ${store.specialty ? `
            <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <p class="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">⭐ Especialidad</p>
              <p class="text-sm text-gray-700 dark:text-gray-300">${store.specialty}</p>
            </div>
          ` : ''}
        </div>

        <!-- Best For -->
        ${store.bestFor ? `
          <div class="mb-4">
            <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">✨ Mejor para:</p>
            <div class="flex flex-wrap gap-2">
              ${store.bestFor.map(item => `
                <span class="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                  ${item}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Tips -->
        ${store.tips && store.tips.length > 0 ? `
          <div class="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-lg mb-4 border border-orange-200 dark:border-orange-800">
            <p class="text-sm font-bold text-orange-700 dark:text-orange-400 mb-2">💡 Tips Pro:</p>
            <ul class="space-y-2">
              ${store.tips.map(tip => `
                <li class="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span class="text-orange-500 mt-0.5">▸</span>
                  <span>${tip}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Must Try (for konbini) -->
        ${store.mustTry ? `
          <div class="mb-4">
            <p class="text-sm font-bold text-gray-800 dark:text-white mb-3">🍱 Imperdibles:</p>
            <div class="grid md:grid-cols-2 gap-3">
              ${store.mustTry.map(item => `
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div class="flex justify-between items-start mb-1">
                    <p class="font-semibold text-sm text-gray-800 dark:text-white">${item.item}</p>
                    <span class="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">${item.price}</span>
                  </div>
                  ${item.rating ? `<p class="text-xs text-yellow-500 mb-1">${'⭐'.repeat(item.rating)}</p>` : ''}
                  <p class="text-xs text-gray-600 dark:text-gray-400">${item.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Must Buy (for stores) -->
        ${store.mustBuy ? `
          <div class="mb-4">
            <p class="text-sm font-bold text-gray-800 dark:text-white mb-3">🛒 Qué Comprar:</p>
            <div class="space-y-2">
              ${store.mustBuy.map(item => `
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-start">
                  <div>
                    <p class="font-semibold text-sm text-gray-800 dark:text-white">${item.item}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">${item.why}</p>
                  </div>
                  <span class="text-xs bg-blue-500 text-white px-2 py-1 rounded-full whitespace-nowrap">${item.price}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Locations -->
        ${store.locations ? `
          <button
            onclick="EssentialsHandler.toggleLocations('${store.id}')"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          >
            📍 Ver Ubicaciones
          </button>
          <div id="locations-${store.id}" class="hidden mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            ${Object.entries(store.locations).map(([city, areas]) => `
              <div class="mb-3">
                <p class="font-bold text-sm text-blue-700 dark:text-blue-400 mb-2">${city}:</p>
                <div class="flex flex-wrap gap-2">
                  ${(Array.isArray(areas) ? areas : [areas]).map(area => `
                    <span class="bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-700 dark:text-gray-300 border border-blue-200 dark:border-blue-800">
                      ${typeof area === 'string' ? area : area.shop || area.area || area.name}
                    </span>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  renderProducts() {
    return `
      <div class="space-y-8">
        ${this.renderProductCategory('health', ESSENTIAL_PRODUCTS.health)}
        ${this.renderProductCategory('snacks', ESSENTIAL_PRODUCTS.snacks)}
        ${this.renderProductCategory('souvenirs', ESSENTIAL_PRODUCTS.souvenirs)}
      </div>
    `;
  },

  renderProductCategory(type, category) {
    const colors = {
      health: { bg: 'red', icon: '💊' },
      snacks: { bg: 'orange', icon: '🍜' },
      souvenirs: { bg: 'purple', icon: '🎁' }
    };

    const color = colors[type];

    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
          <span class="text-3xl">${color.icon}</span>
          ${category.name}
        </h3>

        <div class="space-y-6">
          ${Object.entries(category.categories).map(([key, subcat]) => `
            <div class="border-2 border-${color.bg}-200 dark:border-${color.bg}-800 rounded-lg p-5">
              <h4 class="text-lg font-bold text-${color.bg}-700 dark:text-${color.bg}-400 mb-4">
                ${subcat.name}
              </h4>

              ${type === 'souvenirs' ? `
                <!-- Souvenirs List -->
                <div class="grid md:grid-cols-2 gap-3">
                  ${subcat.items.map(item => `
                    <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                      <span class="text-sm font-semibold text-gray-800 dark:text-white">${item.name}</span>
                      <span class="text-xs bg-green-500 text-white px-2 py-1 rounded-full whitespace-nowrap">${item.price}</span>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <!-- Products List -->
                <div class="space-y-4">
                  ${(subcat.products || []).map(product => `
                    <div class="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg border-l-4 border-${color.bg}-500">
                      <div class="flex justify-between items-start mb-2">
                        <div>
                          <h5 class="font-bold text-gray-800 dark:text-white">
                            ${product.icon || ''} ${product.name}
                          </h5>
                          ${product.type ? `<p class="text-xs text-gray-500 dark:text-gray-400">${product.type}</p>` : ''}
                        </div>
                        <span class="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                          ${product.price}
                        </span>
                      </div>

                      <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">${product.description || product.desc}</p>

                      ${product.where ? `
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          📍 Dónde: <span class="font-semibold">${product.where}</span>
                        </p>
                      ` : ''}

                      ${product.usage ? `
                        <p class="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-2 rounded">
                          💡 ${product.usage}
                        </p>
                      ` : ''}

                      ${product.tip ? `
                        <p class="text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 p-2 rounded mt-2">
                          ⭐ Tip: ${product.tip}
                        </p>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderExperiences() {
    return `
      <div class="space-y-8">
        ${Object.entries(JAPANESE_EXPERIENCES).map(([key, category]) => `
          ${this.renderExperienceCategory(category)}
        `).join('')}
      </div>
    `;
  },

  renderExperienceCategory(category) {
    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 class="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
          <span class="text-3xl">${category.icon}</span>
          ${category.name}
        </h3>

        <div class="grid md:grid-cols-2 gap-6">
          ${category.experiences.map(exp => `
            <div class="border-2 border-purple-200 dark:border-purple-800 rounded-lg p-5 hover:shadow-xl transition">
              <div class="flex justify-between items-start mb-3">
                <h4 class="text-lg font-bold text-gray-800 dark:text-white">${exp.name}</h4>
                <span class="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                  ${exp.priceRange}
                </span>
              </div>

              <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">${exp.description}</p>

              <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  <p class="text-blue-600 dark:text-blue-400 font-semibold">⏱️ Duración</p>
                  <p class="text-gray-700 dark:text-gray-300">${exp.duration}</p>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  <p class="text-green-600 dark:text-green-400 font-semibold">📊 Dificultad</p>
                  <p class="text-gray-700 dark:text-gray-300">${exp.difficulty}</p>
                </div>
              </div>

              ${exp.rating ? `
                <p class="text-yellow-500 text-sm mb-3">${'⭐'.repeat(exp.rating)}</p>
              ` : ''}

              ${exp.tips && exp.tips.length > 0 ? `
                <button
                  onclick="EssentialsHandler.toggleTips('${exp.id}')"
                  class="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold text-sm transition"
                >
                  💡 Ver Tips (${exp.tips.length})
                </button>
                <div id="tips-${exp.id}" class="hidden mt-3 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <ul class="space-y-2">
                    ${exp.tips.map(tip => `
                      <li class="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span class="text-yellow-600 mt-0.5">▸</span>
                        <span>${tip}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  switchView(view) {
    this.currentView = view;
    this.render();
  },

  toggleLocations(storeId) {
    const element = document.getElementById(`locations-${storeId}`);
    if (element) {
      element.classList.toggle('hidden');
    }
  },

  toggleTips(expId) {
    const element = document.getElementById(`tips-${expId}`);
    if (element) {
      element.classList.toggle('hidden');
    }
  }
};

// Exportar globalmente
window.EssentialsHandler = EssentialsHandler;

export default EssentialsHandler;
