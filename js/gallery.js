// js/gallery.js
export const GalleryHandler = {
  renderGallery() {
    const container = document.getElementById('content-gallery');
    if (!container) return;
    const photos = [
      { src: '/viaje-japon/images/tokyo/tokyo-tower.jpg', alt: 'Tokyo Tower' },
      { src: '/viaje-japon/images/kyoto/fushimi-inari.jpg', alt: 'Fushimi Inari Shrine' }
    ];
    container.innerHTML = `
      <h2 class="text-3xl font-bold mb-4 text-gray-800 dark:text-white">📸 Galería de Fotos</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${photos.map(photo => `
          <div class="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md animate-pulse"></div>
        `).join('')}
      </div>
    `;
    // Simular carga de imágenes para evitar error de imagen no encontrada
    setTimeout(() => {
      container.querySelector('.grid').innerHTML = photos.map(photo => `
        <img src="${photo.src}" alt="${photo.alt}" class="w-full h-48 object-cover rounded-lg shadow-md fade-in" 
             onerror="this.style.display='none'; this.parentElement.querySelector('.bg-gray-200').style.display='block';">
      `).join('');
    }, 500);
  }
};
