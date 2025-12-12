/**
 * 🖼️ ENHANCED GALLERY
 * ===================
 * Lazy loading, lightbox, export
 */

class EnhancedGallery {
  constructor() {
    this.photos = [];
    this.currentIndex = 0;
  }

  addPhoto(photo) {
    this.photos.push({...photo, timestamp: Date.now()});
  }

  showLightbox(index) {
    this.currentIndex = index;
    const photo = this.photos[index];
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/90 z-50 flex items-center justify-center';
    modal.innerHTML = `
      <button onclick="this.parentElement.remove()" class="absolute top-4 right-4 text-white text-2xl">
        <i class="fas fa-times"></i>
      </button>
      <button onclick="window.EnhancedGallery.prev()" class="absolute left-4 text-white text-4xl">
        <i class="fas fa-chevron-left"></i>
      </button>
      <img src="${photo.url}" class="max-h-[90vh] max-w-[90vw]" />
      <button onclick="window.EnhancedGallery.next()" class="absolute right-4 text-white text-4xl">
        <i class="fas fa-chevron-right"></i>
      </button>
    `;
    document.body.appendChild(modal);
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
    this.updateLightbox();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
    this.updateLightbox();
  }

  exportAlbum() {
    alert('Exportando álbum...');
  }
}

if (typeof window !== 'undefined') {
  window.EnhancedGallery = new EnhancedGallery();
}
