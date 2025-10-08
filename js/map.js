// js/map.js
export const MapHandler = {
  renderMap() {
    const container = document.getElementById('content-map');
    if (!container) return;
    container.innerHTML = `
      <h2 class="text-3xl font-bold mb-4 text-gray-800 dark:text-white">🗺️ Mapa Interactivo</h2>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-96 flex items-center justify-center">
        <p class="text-gray-500 dark:text-gray-400">Mapa en construcción... ¡Pronto estará listo!</p>
      </div>
    `;
  }
};
