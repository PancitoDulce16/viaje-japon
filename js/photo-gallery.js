// js/photo-gallery.js - Galería de fotos compartidas con upload, comentarios y likes

import { auth, db, storage } from './firebase-config.js';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

export const PhotoGallery = {
    currentTripId: null,
    unsubscribers: [],
    currentView: 'grid', // grid | detail

    // ============================================
    // RENDER MAIN UI
    // ============================================
    render() {
        return `
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-4 rounded-lg border-2 border-pink-300 dark:border-pink-600">
                    <h4 class="text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                        <span>📸</span>
                        <span>Memorias Compartidas</span>
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                        Comparte fotos del viaje con el grupo. Comenta, da likes y guarda los mejores momentos.
                    </p>
                </div>

                <!-- Upload Section -->
                <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h5 class="font-bold mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                        <span>📤</span>
                        <span>Subir Nueva Foto</span>
                    </h5>

                    <div class="space-y-3">
                        <!-- Preview -->
                        <div id="photoPreview" class="hidden">
                            <img id="previewImage" class="w-full h-48 object-cover rounded-lg mb-2" alt="Preview">
                            <button
                                onclick="PhotoGallery.clearPreview()"
                                class="text-sm text-red-500 hover:text-red-600"
                            >
                                ✕ Cancelar
                            </button>
                        </div>

                        <!-- File Input -->
                        <div class="relative">
                            <input
                                type="file"
                                id="photoInput"
                                accept="image/*"
                                class="hidden"
                                onchange="PhotoGallery.handleFileSelect(event)"
                            >
                            <button
                                onclick="document.getElementById('photoInput').click()"
                                class="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-3 rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <span>📷</span>
                                <span>Seleccionar Foto</span>
                            </button>
                        </div>

                        <!-- Caption -->
                        <textarea
                            id="photoCaption"
                            placeholder="Agrega una descripción... (opcional)"
                            rows="2"
                            class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 resize-none"
                        ></textarea>

                        <!-- Upload Button -->
                        <button
                            id="uploadBtn"
                            onclick="PhotoGallery.uploadPhoto()"
                            disabled
                            class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-bold transition shadow-lg"
                        >
                            ⬆️ Subir Foto
                        </button>

                        <!-- Progress -->
                        <div id="uploadProgress" class="hidden">
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div id="progressBar" class="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all" style="width: 0%"></div>
                            </div>
                            <p id="progressText" class="text-sm text-center text-gray-600 dark:text-gray-400 mt-1">Subiendo...</p>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="flex gap-2 overflow-x-auto">
                    <button
                        onclick="PhotoGallery.filterGallery('all')"
                        class="gallery-filter-btn px-4 py-2 rounded-lg font-semibold bg-pink-500 text-white whitespace-nowrap"
                        data-filter="all"
                    >
                        Todas
                    </button>
                    <button
                        onclick="PhotoGallery.filterGallery('mine')"
                        class="gallery-filter-btn px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                        data-filter="mine"
                    >
                        Mis Fotos
                    </button>
                    <button
                        onclick="PhotoGallery.filterGallery('liked')"
                        class="gallery-filter-btn px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                        data-filter="liked"
                    >
                        ❤️ Con Like
                    </button>
                </div>

                <!-- Photo Grid -->
                <div id="photoGalleryGrid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div class="col-span-full text-center text-gray-400 py-8">
                        Cargando fotos...
                    </div>
                </div>

                <!-- Photo Detail Modal -->
                <div id="photoDetailModal" class="hidden fixed inset-0 bg-black/80 z-50 overflow-y-auto" onclick="PhotoGallery.closeDetail(event)">
                    <div class="min-h-screen px-4 py-8">
                        <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl" onclick="event.stopPropagation()">
                            <div id="photoDetailContent">
                                <!-- Content will be injected here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ============================================
    // FILE HANDLING
    // ============================================
    selectedFile: null,

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona una imagen válida');
            return;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen es muy grande. Máximo 5MB');
            return;
        }

        this.selectedFile = file;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photoPreview');
            const previewImage = document.getElementById('previewImage');
            const uploadBtn = document.getElementById('uploadBtn');

            if (preview && previewImage && uploadBtn) {
                previewImage.src = e.target.result;
                preview.classList.remove('hidden');
                uploadBtn.disabled = false;
            }
        };
        reader.readAsDataURL(file);
    },

    clearPreview() {
        this.selectedFile = null;
        const preview = document.getElementById('photoPreview');
        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('photoInput');

        if (preview) preview.classList.add('hidden');
        if (uploadBtn) uploadBtn.disabled = true;
        if (fileInput) fileInput.value = '';
    },

    // ============================================
    // UPLOAD PHOTO
    // ============================================
    async uploadPhoto() {
        const tripId = window.currentTripId || localStorage.getItem('currentTripId');

        if (!tripId || !auth.currentUser) {
            alert('Debes estar autenticado y tener un viaje activo');
            return;
        }

        if (!this.selectedFile) {
            alert('Selecciona una foto primero');
            return;
        }

        const captionInput = document.getElementById('photoCaption');
        const caption = captionInput?.value.trim() || '';

        const uploadBtn = document.getElementById('uploadBtn');
        const progress = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        try {
            // Deshabilitar botón y mostrar progress
            if (uploadBtn) uploadBtn.disabled = true;
            if (progress) progress.classList.remove('hidden');

            // Upload to Firebase Storage
            const timestamp = Date.now();
            const fileName = `${auth.currentUser.uid}_${timestamp}_${this.selectedFile.name}`;
            const storageRef = ref(storage, `trips/${tripId}/photos/${fileName}`);

            if (progressText) progressText.textContent = 'Subiendo foto...';
            if (progressBar) progressBar.style.width = '30%';

            await uploadBytes(storageRef, this.selectedFile);

            if (progressBar) progressBar.style.width = '60%';
            if (progressText) progressText.textContent = 'Obteniendo URL...';

            const photoURL = await getDownloadURL(storageRef);

            if (progressBar) progressBar.style.width = '90%';
            if (progressText) progressText.textContent = 'Guardando en base de datos...';

            // Save to Firestore
            const photoId = timestamp.toString();
            const photoRef = doc(db, `trips/${tripId}/photos/${photoId}`);

            await setDoc(photoRef, {
                photoURL,
                storagePath: `trips/${tripId}/photos/${fileName}`,
                caption,
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName || 'Usuario',
                userPhoto: auth.currentUser.photoURL || null,
                uploadedAt: serverTimestamp(),
                likes: [],
                comments: []
            });

            // Log to timeline
            if (window.logTimelineActivity) {
                window.logTimelineActivity('photo', {
                    description: 'subió una nueva foto',
                    photoURL,
                    caption
                });
            }

            if (progressBar) progressBar.style.width = '100%';
            if (progressText) progressText.textContent = '¡Foto subida! ✓';

            // Limpiar formulario
            setTimeout(() => {
                this.clearPreview();
                if (captionInput) captionInput.value = '';
                if (progress) progress.classList.add('hidden');
                if (progressBar) progressBar.style.width = '0%';
                if (uploadBtn) uploadBtn.disabled = false;
            }, 1000);

        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Error al subir la foto: ' + error.message);

            if (uploadBtn) uploadBtn.disabled = false;
            if (progress) progress.classList.add('hidden');
        }
    },

    // ============================================
    // LOAD GALLERY
    // ============================================
    currentFilter: 'all',

    async loadGallery() {
        const tripId = window.currentTripId || localStorage.getItem('currentTripId');
        const container = document.getElementById('photoGalleryGrid');

        if (!container) return;

        if (!auth.currentUser) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-4xl mb-3">🔒</p>
                    <p class="text-gray-600 dark:text-gray-400">Debes estar autenticado</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Inicia sesión para ver y subir fotos</p>
                </div>
            `;
            return;
        }

        if (!tripId) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-4xl mb-3">✈️</p>
                    <p class="text-gray-600 dark:text-gray-400">No hay viaje activo</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Selecciona o crea un viaje primero</p>
                </div>
            `;
            return;
        }

        try {
            const photosRef = collection(db, `trips/${tripId}/photos`);
            const photosQuery = query(photosRef, orderBy('uploadedAt', 'desc'));

            // Real-time listener
            const unsubscribe = onSnapshot(photosQuery, (snapshot) => {
                const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                this.renderGallery(photos, tripId);
            });

            this.unsubscribers.push(unsubscribe);
        } catch (error) {
            console.error('Error loading gallery:', error);
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-4xl mb-3">⚠️</p>
                    <p class="text-gray-600 dark:text-gray-400">Error al cargar fotos</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">${error.message}</p>
                </div>
            `;
        }
    },

    // ============================================
    // RENDER GALLERY
    // ============================================
    renderGallery(photos, tripId) {
        const container = document.getElementById('photoGalleryGrid');
        if (!container) return;

        const userId = auth.currentUser?.uid;

        // Aplicar filtro
        let filteredPhotos = photos;
        if (this.currentFilter === 'mine') {
            filteredPhotos = photos.filter(photo => photo.userId === userId);
        } else if (this.currentFilter === 'liked') {
            filteredPhotos = photos.filter(photo => photo.likes?.includes(userId));
        }

        if (filteredPhotos.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-4xl mb-3">📸</p>
                    <p class="text-gray-600 dark:text-gray-400">No hay fotos aún</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">¡Sé el primero en subir una foto!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredPhotos.map(photo => {
            const likeCount = photo.likes?.length || 0;
            const commentCount = photo.comments?.length || 0;
            const hasLiked = photo.likes?.includes(userId);

            return `
                <div class="relative group cursor-pointer" onclick="PhotoGallery.showDetail('${photo.id}', '${tripId}')">
                    <div class="aspect-square overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                        <img
                            src="${photo.photoURL}"
                            alt="${photo.caption || 'Foto del viaje'}"
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                        >
                    </div>

                    <!-- Overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <div class="absolute bottom-2 left-2 right-2">
                            <p class="text-white text-xs font-bold mb-1">${photo.userName}</p>
                            ${photo.caption ? `<p class="text-white text-xs line-clamp-2">${photo.caption}</p>` : ''}
                            <div class="flex items-center gap-3 mt-2 text-white text-xs">
                                <span>${hasLiked ? '❤️' : '🤍'} ${likeCount}</span>
                                <span>💬 ${commentCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ============================================
    // PHOTO DETAIL VIEW
    // ============================================
    async showDetail(photoId, tripId) {
        try {
            const photoRef = doc(db, `trips/${tripId}/photos/${photoId}`);
            const photoSnap = await getDoc(photoRef);

            if (!photoSnap.exists()) {
                alert('Foto no encontrada');
                return;
            }

            const photo = { id: photoSnap.id, ...photoSnap.data() };
            const userId = auth.currentUser?.uid;
            const hasLiked = photo.likes?.includes(userId);

            const modal = document.getElementById('photoDetailModal');
            const content = document.getElementById('photoDetailContent');

            if (!modal || !content) return;

            content.innerHTML = `
                <!-- Header -->
                <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            ${photo.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h5 class="font-bold text-gray-800 dark:text-white">${photo.userName}</h5>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                ${photo.uploadedAt ? new Date(photo.uploadedAt.seconds * 1000).toLocaleDateString() : 'Reciente'}
                            </p>
                        </div>
                    </div>
                    <button
                        onclick="PhotoGallery.closeDetailModal()"
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <!-- Photo -->
                <div class="relative">
                    <img
                        src="${photo.photoURL}"
                        alt="${photo.caption || 'Foto del viaje'}"
                        class="w-full max-h-96 object-contain bg-black"
                    >
                </div>

                <!-- Caption & Actions -->
                <div class="p-4 space-y-4">
                    ${photo.caption ? `<p class="text-gray-800 dark:text-white">${photo.caption}</p>` : ''}

                    <div class="flex items-center gap-4">
                        <button
                            onclick="PhotoGallery.toggleLike('${tripId}', '${photoId}')"
                            class="flex items-center gap-2 px-4 py-2 rounded-lg transition ${hasLiked ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}"
                        >
                            <span class="text-xl">${hasLiked ? '❤️' : '🤍'}</span>
                            <span class="font-semibold">${photo.likes?.length || 0}</span>
                        </button>
                        ${photo.userId === userId ? `
                            <button
                                onclick="PhotoGallery.deletePhoto('${tripId}', '${photoId}', '${photo.storagePath}')"
                                class="ml-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                            >
                                🗑️ Eliminar
                            </button>
                        ` : ''}
                    </div>

                    <!-- Comments Section -->
                    <div class="border-t dark:border-gray-700 pt-4">
                        <h6 class="font-bold text-gray-800 dark:text-white mb-3">💬 Comentarios (${photo.comments?.length || 0})</h6>

                        <div class="space-y-3 mb-4 max-h-64 overflow-y-auto">
                            ${photo.comments && photo.comments.length > 0 ? photo.comments.map((comment, idx) => `
                                <div class="flex gap-3">
                                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        ${comment.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div class="flex-1">
                                        <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                            <p class="font-semibold text-sm text-gray-800 dark:text-white">${comment.userName}</p>
                                            <p class="text-sm text-gray-700 dark:text-gray-300">${comment.text}</p>
                                        </div>
                                        ${comment.userId === userId ? `
                                            <button
                                                onclick="PhotoGallery.deleteComment('${tripId}', '${photoId}', ${idx})"
                                                class="text-xs text-red-500 hover:text-red-600 mt-1"
                                            >
                                                Eliminar
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('') : '<p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No hay comentarios aún</p>'}
                        </div>

                        <div class="flex gap-2">
                            <input
                                type="text"
                                id="commentInput_${photoId}"
                                placeholder="Escribe un comentario..."
                                class="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                onkeypress="if(event.key === 'Enter') PhotoGallery.addComment('${tripId}', '${photoId}')"
                            >
                            <button
                                onclick="PhotoGallery.addComment('${tripId}', '${photoId}')"
                                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-bold transition"
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            `;

            modal.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading photo detail:', error);
            alert('Error al cargar los detalles de la foto');
        }
    },

    closeDetailModal() {
        const modal = document.getElementById('photoDetailModal');
        if (modal) modal.classList.add('hidden');
    },

    closeDetail(event) {
        if (event.target.id === 'photoDetailModal') {
            this.closeDetailModal();
        }
    },

    // ============================================
    // LIKES
    // ============================================
    async toggleLike(tripId, photoId) {
        if (!auth.currentUser) {
            alert('Debes estar autenticado');
            return;
        }

        try {
            const userId = auth.currentUser.uid;
            const photoRef = doc(db, `trips/${tripId}/photos/${photoId}`);
            const photoSnap = await getDoc(photoRef);

            if (!photoSnap.exists()) return;

            const currentLikes = photoSnap.data().likes || [];
            const hasLiked = currentLikes.includes(userId);

            if (hasLiked) {
                await updateDoc(photoRef, {
                    likes: currentLikes.filter(id => id !== userId)
                });
            } else {
                await updateDoc(photoRef, {
                    likes: [...currentLikes, userId]
                });
            }

            // Recargar detalle
            this.showDetail(photoId, tripId);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    },

    // ============================================
    // COMMENTS
    // ============================================
    async addComment(tripId, photoId) {
        if (!auth.currentUser) {
            alert('Debes estar autenticado');
            return;
        }

        const input = document.getElementById(`commentInput_${photoId}`);
        const text = input?.value.trim();

        if (!text) {
            alert('Escribe un comentario');
            return;
        }

        try {
            const photoRef = doc(db, `trips/${tripId}/photos/${photoId}`);
            const photoSnap = await getDoc(photoRef);

            if (!photoSnap.exists()) return;

            const currentComments = photoSnap.data().comments || [];

            await updateDoc(photoRef, {
                comments: [...currentComments, {
                    userId: auth.currentUser.uid,
                    userName: auth.currentUser.displayName || 'Usuario',
                    text,
                    createdAt: new Date().toISOString()
                }]
            });

            // Limpiar input y recargar
            if (input) input.value = '';
            this.showDetail(photoId, tripId);
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Error al agregar comentario');
        }
    },

    async deleteComment(tripId, photoId, commentIndex) {
        if (!confirm('¿Eliminar este comentario?')) return;

        try {
            const photoRef = doc(db, `trips/${tripId}/photos/${photoId}`);
            const photoSnap = await getDoc(photoRef);

            if (!photoSnap.exists()) return;

            const currentComments = photoSnap.data().comments || [];
            currentComments.splice(commentIndex, 1);

            await updateDoc(photoRef, { comments: currentComments });

            this.showDetail(photoId, tripId);
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Error al eliminar comentario');
        }
    },

    // ============================================
    // DELETE PHOTO
    // ============================================
    async deletePhoto(tripId, photoId, storagePath) {
        if (!confirm('¿Eliminar esta foto permanentemente?')) return;

        try {
            // Eliminar de Storage
            const storageRef = ref(storage, storagePath);
            await deleteObject(storageRef);

            // Eliminar de Firestore
            const photoRef = doc(db, `trips/${tripId}/photos/${photoId}`);
            await deleteDoc(photoRef);

            this.closeDetailModal();
            alert('Foto eliminada');
        } catch (error) {
            console.error('Error deleting photo:', error);
            alert('Error al eliminar la foto');
        }
    },

    // ============================================
    // FILTER
    // ============================================
    filterGallery(filter) {
        this.currentFilter = filter;

        // Update button styles
        document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.className = 'gallery-filter-btn px-4 py-2 rounded-lg font-semibold bg-pink-500 text-white whitespace-nowrap';
            } else {
                btn.className = 'gallery-filter-btn px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap';
            }
        });

        this.loadGallery();
    },

    // ============================================
    // Cleanup
    // ============================================
    cleanup() {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
        this.selectedFile = null;
    }
};

// Exportar para uso global
window.PhotoGallery = PhotoGallery;
