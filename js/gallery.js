// js/gallery.js
export const GalleryHandler = {
  renderGallery() {
    const container = document.getElementById('galleryContainer');
    if (!container) return;
    // Ejemplo: Lista de fotos placeholder
    const photos = [
      { src: 'images/photo1.jpg', alt: 'Templo en Kyoto' },
      { src: 'images/photo2.jpg', alt: 'Calle de Tokyo' }
    ];
    container.innerHTML = `
      <h2 class="text-3xl font-bold mb-4 text-gray-800 dark:text-white">📸 Galería de Fotos</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${photos.map(photo => `
          <img src="${photo.src}" alt="${photo.alt}" class="w-full h-48 object-cover rounded-lg shadow-md">
        `).join('')}
      </div>
    `;
  }
};
