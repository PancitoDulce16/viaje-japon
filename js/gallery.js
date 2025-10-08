/* ===================================
   GALERÍA DE FOTOS - GESTIÓN DE IMÁGENES
   =================================== */

   const GalleryHandler = {
    photos: [],

    init() {
        this.renderGallery();
        this.setupUpload();
    },

    renderGallery() {
        const container = document.getElementById('galleryContainer');
        if (!container) return;
        
        container.innerHTML = `
            <h2 class="text-3xl font-bold mb-4 text-gray-800 dark:text-white">📸 Galería de Fotos</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">Sube tus fotos del viaje (se guardan solo en tu dispositivo)</p>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <input type="file" id="photoUpload" accept="image/*" multiple class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Selecciona una o varias fotos</p>
            </div>
            
            <div id="photoGrid" class="gallery-grid"></div>
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
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-6xl mb-4">📷</p>
                    <p class="text-gray-500 dark:text-gray-400">No hay fotos aún. ¡Sube tus recuerdos de Japón!</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = this.photos.map((photo, index) => `
            <div class="gallery-item" onclick="GalleryHandler.viewPhoto(${index})">
                <img src="${photo.data}" alt="${photo.name}" loading="lazy">
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p class="text-white text-xs truncate">${photo.name}</p>
                    <p class="text-white/70 text-xs">${photo.date}</p>
                </div>
            </div>
        `).join('');
    },

    viewPhoto(index) {
        const photo = this.photos[index];
        if (!photo) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content max-w-4xl">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold dark:text-white">${photo.name}</h3>
                    <button onclick="this.closest('.modal').remove()" class="text-3xl hover:text-red-600">&times;</button>
                </div>
                <img src="${photo.data}" alt="${photo.name}" class="w-full rounded-lg">
                <div class="mt-4 flex justify-between items-center">
                    <p class="text-sm text-gray-500 dark:text-gray-400">${photo.date}</p>
                    <button onclick="GalleryHandler.deletePhoto(${index}); this.closest('.modal').remove()" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    deletePhoto(index) {
        if (!confirm('¿Eliminar esta foto?')) return;
        this.photos.splice(index, 1);
        this.updatePhotoGrid();
    }
};

// Initialize
GalleryHandler.init();