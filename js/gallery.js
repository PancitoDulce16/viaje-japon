// gallery.js - Galería mejorada con persistence

export const GalleryHandler = {
  photos: [],

  init() {
    this.loadPhotos();
    this.renderGallery();
    this.setupUpload();
  },

  loadPhotos() {
    try {
      this.photos = JSON.parse(localStorage.getItem('tripPhotos') || '[]');
    } catch (error) {
      // Manejo de errores
    }
  },

  savePhotos() {
    localStorage.setItem('tripPhotos', JSON.stringify(this.photos));
  },

  renderGallery() {
    const container = document.getElementById('galleryContainer');
    if (!container) return;
    container.innerHTML = `
      <h2 class="text-xl font-bold mb-4">📸 Galería de Fotos</h2>
      <p class="mb-4">Sube tus fotos del viaje (se guardan solo en tu dispositivo)</p>
      <input type="file" id="photoUpload" multiple accept="image/*" class="mb-4">
      <div id="photoGrid" class="grid grid-cols-2 md:grid-cols-3 gap-4"></div>
    `;
    this.updatePhotoGrid();
  },

  setupUpload() {
    const input = document.getElementById('photoUpload');
    if (!input) return;
    input.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.photos.push({
            data: event.target.result,
            name: file.name,
            date: new Date().toLocaleDateString('es-ES')
          });
          this.savePhotos();
          this.updatePhotoGrid();
        };
        reader.readAsDataURL(file);
      });
    });
  },

  updatePhotoGrid() {
    const grid = document.getElementById('photoGrid');
    if (!grid) return;
    if (this.photos.length === 0) {
      grid.innerHTML = '<p class="text-center">📷 No hay fotos aún. ¡Sube tus recuerdos de Japón!</p>';
      return;
    }
    grid.innerHTML = this.photos.map((photo, index) => `
      <div class="relative">
        <img src="${photo.data}" alt="${photo.name}" class="w-full h-32 object-cover rounded cursor-pointer" onclick="GalleryHandler.viewPhoto(${index})">
        <button class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded" onclick="GalleryHandler.deletePhoto(${index})">🗑️</button>
        <p class="text-xs mt-1">${photo.date}</p>
      </div>
    `).join('');
  },

  viewPhoto(index) {
    const photo = this.photos[index];
    if (!photo) return;
    const modal = document.createElement('div');
    modal.className = 'modal active fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-3xl w-full">
        <img src="${photo.data}" alt="${photo.name}" class="w-full max-h-[80vh] object-contain">
        <p class="mt-2 text-center">${photo.name} - ${photo.date}</p>
        <button class="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onclick="this.parentElement.parentElement.remove()">Cerrar</button>
      </div>
    `;
    document.body.appendChild(modal);
  },

  deletePhoto(index) {
    if (!confirm('¿Eliminar esta foto?')) return;
    this.photos.splice(index, 1);
    this.savePhotos();
    this.updatePhotoGrid();
  }
};

// Inicializa
document.addEventListener('DOMContentLoaded', () => GalleryHandler.init());
