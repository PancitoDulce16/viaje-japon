// js/gallery.js

export const GalleryHandler = {
    renderGallery() {
        const container = document.getElementById('content-gallery');
        if (!container) return;
        
        const photos = [
            { src: './images/tokyo/tokyo-tower.jpg', alt: 'Tokyo Tower' },
            { src: './images/kyoto/fushimi-inari.jpg', alt: 'Fushimi Inari Shrine' },
            { src: './images/osaka/dotonbori.jpg', alt: 'Dotonbori' }
        ];
        
        container.innerHTML = `
            <div class="max-w-6xl mx-auto p-4 md:p-6">
                <h2 class="text-3xl font-bold mb-4 text-gray-800 dark:text-white">📸 Galería de Fotos</h2>
                
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <p class="text-gray-600 dark:text-gray-400 mb-4 text-center">
                        Sube las fotos de tu viaje aquí
                    </p>
                    <button class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                        📤 Subir Fotos (próximamente)
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${photos.map(photo => `
                        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                            <div class="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                                <span class="text-4xl opacity-50">📷</span>
                            </div>
                            <div class="p-3">
                                <p class="text-sm text-gray-600 dark:text-gray-400">${photo.alt}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};
