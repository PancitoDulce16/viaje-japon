// js/tabs.js
import { AppCore } from './core.js';
import { AppModals } from './modals.js';
import { AppUtils } from './utils.js';
import { GalleryHandler } from './gallery.js';

export const TabsHandler = {
  renderAllTabs() {
    this.renderFlightsTab();
    this.renderFoodTab();
    this.renderSouvenirsTab();
    this.renderUtilsTab();
    GalleryHandler.renderGallery();
    // Modals are now rendered by app.js
  },

  renderFlightsTab() {
    const container = document.getElementById('content-flights');
    if (!container) return;
    container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">✈️ Información de Vuelos</h2>
        <div class="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-l-4 border-blue-500">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">🛫</span>
            <div>
              <h3 class="text-xl font-bold text-gray-800 dark:text-white">Ida: Costa Rica → Japón</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">Domingo, 16 de Febrero 2025</p>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-gray-800 dark:text-white">Vuelo AM58</span>
              <span class="badge badge-info">Aeroméxico</span>
            </div>
            <div class="grid grid-cols-3 gap-4 text-sm dark:text-gray-300">
              <div><p class="text-gray-500 dark:text-gray-400">Salida</p><p class="font-semibold">MTY - Monterrey</p></div>
              <div class="text-center"><p class="text-gray-500 dark:text-gray-400">→</p></div>
              <div class="text-right"><p class="text-gray-500 dark:text-gray-400">Llegada</p><p class="font-semibold text-green-600 dark:text-green-400">NRT 6:30 AM</p></div>
            </div>
          </div>
        </div>
        <div class="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-l-4 border-orange-500">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">🛬</span>
            <div>
              <h3 class="text-xl font-bold text-gray-800 dark:text-white">Regreso: Japón → Costa Rica</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">Domingo, 2 de Marzo 2025</p>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-700 p-4 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-gray-800 dark:text-white">Vuelo AM58</span>
              <span class="badge badge-warning">Aeroméxico</span>
            </div>
            <div class="mt-3 p-3 bg-red-50 dark:bg-red-900/30 rounded border-l-4 border-red-500">
              <p class="text-sm font-semibold text-red-700 dark:text-red-300">⚠️ ¡IMPORTANTE!</p>
              <p class="text-xs text-red-600 dark:text-red-400 mt-1">Wake up: 4:30 AM • Salida hotel: 5:30 AM • Vuelo: 9:30 AM</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderFoodTab() {
    const container = document.getElementById('content-food');
    if (!container) return;
    container.innerHTML = `
      <h2 class="text-3xl font-bold mb-2 text-gray-800 dark:text-white">🍱 Comida Japonesa por Región</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">Explora los platos típicos y rangos de precio</p>
      <div class="space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover-lift">
          <div class="flex items-center gap-3 mb-4"><span class="text-4xl">🗼</span><h3 class="text-2xl font-bold text-red-600 dark:text-red-400">Tokyo</h3></div>
          <ul class="space-y-3">
            <li class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span class="text-2xl flex-shrink-0">🍣</span>
              <div><p class="font-bold dark:text-white">Sushi Edomae</p><p class="text-sm text-gray-600 dark:text-gray-400">¥2,000–¥10,000 • Sushi Dai (Toyosu Market)</p></div>
            </li>
          </ul>
        </div>
      </div>
    `;
  },

  renderSouvenirsTab() {
    const container = document.getElementById('content-souvenirs');
    if (!container) return;
    container.innerHTML = `
      <h2 class="text-3xl font-bold mb-2 text-gray-800 dark:text-white">🎁 Souvenirs Japoneses</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">Los recuerdos más populares y dónde encontrarlos</p>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
          <div class="flex items-center gap-3 mb-4"><span class="text-4xl">🎎</span><h3 class="text-xl font-bold text-yellow-600 dark:text-yellow-400">Tradicionales</h3></div>
          <ul class="space-y-3 text-sm">
            <li class="flex items-start gap-2">
              <span class="text-lg">🌸</span>
              <div><p class="font-semibold dark:text-white">Abanicos japoneses</p><p class="text-xs text-gray-500 dark:text-gray-400">Kyoto - Tiendas de artesanía</p></div>
            </li>
          </ul>
        </div>
      </div>
    `;
  },

  renderUtilsTab() {
    const container = document.getElementById('content-utils');
    if (!container) return;
    container.innerHTML = `
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">💸 Conversor de Moneda</h3>
          <div class="space-y-3">
            <div class="flex gap-2">
              <input id="usdInput" type="number" class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="USD" aria-label="Monto en USD">
              <input id="jpyInput" type="number" class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="JPY" aria-label="Monto en JPY">
            </div>
            <div class="grid grid-cols-3 gap-2 text-sm">
              <button class="quick-convert-btn bg-gray-100 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600" data-amount="10">10 USD</button>
              <button class="quick-convert-btn bg-gray-100 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600" data-amount="50">50 USD</button>
              <button class="quick-convert-btn bg-gray-100 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600" data-amount="100">100 USD</button>
            </div>
          </div>
        </div>
      </div>
    `;
    AppUtils.setupCurrencyConverter();
  }
};
