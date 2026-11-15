import { galleryState, galleryText as safe, galleryImageUrl, commentIdentity } from './gallery-state.js';
import { enhanceDialog } from '../../ui/dialog-a11y.js';
﻿// js/photo-gallery.js - Galería de fotos compartidas con upload, comentarios y likes

import { auth, db, storage } from '../../core/firebase-config.js';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const PhotoGallery = {
    ...galleryState,
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
                <div id="photoDetailModal" class="hidden fixed inset-0 bg-black/80 z-[10001] overflow-y-auto" onclick="PhotoGallery.closeDetail(event)">
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
        const selection=this.selectionVersion=(this.selectionVersion||0)+1,scope=this.galleryScope();

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            if(selection!==this.selectionVersion||this.selectedFile!==file||!this.isGalleryCurrent(scope))return;
            const preview = document.getElementById('photoPreview');
            const previewImage = document.getElementById('previewImage');
            const uploadBtn = document.getElementById('uploadBtn');

            if (preview && previewImage && uploadBtn) {
                previewImage.src = e.target.result;
                preview.classList.remove('hidden');
                uploadBtn.disabled = Boolean(this.uploadPending);
            }
        };
        reader.readAsDataURL(file);
    },



    // ============================================
    // UPLOAD PHOTO
    // ============================================


    // ============================================
    // LOAD GALLERY
    // ============================================
    currentFilter: 'all',



    // ============================================
    // RENDER GALLERY
    // ============================================
    renderGallery(photos, tripId) {
        photos=photos.map(photo=>this.normalizePhoto(photo));
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
                <div class="relative group cursor-pointer" data-gallery-open="${safe(photo.id)}">
                    <div class="aspect-square overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                        <img
                            src="${safe(galleryImageUrl(photo.photoURL))}"
                            alt="${safe(photo.caption || 'Foto del viaje')}"
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                        >
                    </div>

                    <!-- Overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <div class="absolute bottom-2 left-2 right-2">
                            <p class="text-white text-xs font-bold mb-1">${safe(photo.userName)}</p>
                            ${photo.caption ? `<p class="text-white text-xs line-clamp-2">${safe(photo.caption)}</p>` : ''}
                            <div class="flex items-center gap-3 mt-2 text-white text-xs">
                                <span>${hasLiked ? '❤️' : '🤍'} ${likeCount}</span>
                                <span>💬 ${commentCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        container.querySelectorAll('[data-gallery-open]').forEach(button=>button.onclick=()=>this.showDetail(button.dataset.galleryOpen,tripId));
    },

    // ============================================
    // PHOTO DETAIL VIEW
    // ============================================
    async showDetail(photoId, tripId) {
        const scope=this.galleryScope();if(!this.isGalleryCurrent(scope)||tripId!==scope.tripId)return;
        const request=this.detailRequest=(this.detailRequest||0)+1,originalModal=document.getElementById('photoDetailModal');
        try {
            const photoRef = doc(db, `trips/${tripId}/photos/${photoId}`);
            const photoSnap = await getDoc(photoRef);

            if(!this.isGalleryCurrent(scope)||request!==this.detailRequest||document.getElementById('photoDetailModal')!==originalModal)return;
            if (!photoSnap.exists()) {
                alert('Foto no encontrada');
                return;
            }

            const photo=this.normalizePhoto({...photoSnap.data(),id:photoId});
            const previousInput=this.detailPhotoId===photoId?document.getElementById('galleryCommentInput'):null;
            const draft=previousInput?.value||'',hadFocus=originalModal?.contains(document.activeElement);
            const focusedAction=document.activeElement?.hasAttribute('data-gallery-send')?'[data-gallery-send]':document.activeElement?.hasAttribute('data-gallery-like')?'[data-gallery-like]':'#galleryCommentInput';
            this.detailPhotoId=photoId;this.detailPhoto=photo;
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
                            ${safe(photo.userName.charAt(0).toUpperCase())}
                        </div>
                        <div>
                            <h5 class="font-bold text-gray-800 dark:text-white">${safe(photo.userName)}</h5>
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
                        src="${safe(galleryImageUrl(photo.photoURL))}"
                        alt="${safe(photo.caption || 'Foto del viaje')}"
                        class="w-full max-h-96 object-contain bg-black"
                    >
                </div>

                <!-- Caption & Actions -->
                <div class="p-4 space-y-4">
                    ${photo.caption ? `<p class="text-gray-800 dark:text-white">${safe(photo.caption)}</p>` : ''}

                    <div class="flex items-center gap-4">
                        <button
                            data-gallery-like
                            class="flex items-center gap-2 px-4 py-2 rounded-lg transition ${hasLiked ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}"
                        >
                            <span class="text-xl">${hasLiked ? '❤️' : '🤍'}</span>
                            <span class="font-semibold">${photo.likes?.length || 0}</span>
                        </button>
                        ${photo.userId === userId ? `
                            <button
                                data-gallery-delete
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
                                        ${safe(comment.userName.charAt(0).toUpperCase())}
                                    </div>
                                    <div class="flex-1">
                                        <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                            <p class="font-semibold text-sm text-gray-800 dark:text-white">${safe(comment.userName)}</p>
                                            <p class="text-sm text-gray-700 dark:text-gray-300">${safe(comment.text)}</p>
                                        </div>
                                        ${comment.userId === userId ? `
                                            <button
                                                data-gallery-delete-comment="${safe(commentIdentity(comment))}"
                                                class="text-xs text-red-500 hover:text-red-600 mt-1"
                                            >
                                                Eliminar
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('') : '<p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No hay comentarios aún</p>'}
                        </div>

                        <div class="flex gap-2" data-gallery-comment-row>
                            <input
                                type="text"
                                id="galleryCommentInput" maxlength="2000" aria-label="Comentario"
                                placeholder="Escribe un comentario..."
                                class="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"

                            >
                            <button
                                data-gallery-send
                                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-bold transition"
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            `;

            content.querySelector('[data-gallery-like]').onclick=()=>this.toggleLike(tripId,photoId);
            const remove=content.querySelector('[data-gallery-delete]');if(remove)remove.onclick=()=>this.deletePhoto(tripId,photoId,photo.storagePath);
            content.querySelector('[data-gallery-send]').onclick=()=>this.addComment(tripId,photoId);
            const input=content.querySelector('#galleryCommentInput');input.value=draft;input.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();this.addComment(tripId,photoId);}};
            content.querySelectorAll('[data-gallery-delete-comment]').forEach(button=>button.onclick=()=>this.deleteComment(tripId,photoId,button.dataset.galleryDeleteComment));
            const wasHidden=modal.classList.contains('hidden');modal.classList.remove('hidden');
            modal.setAttribute('aria-label','Detalle de la foto');
            if(wasHidden)this.detailCleanup=enhanceDialog(modal,{onClose:()=>this.closeDetailModal()});
            else if(hadFocus)content.querySelector(focusedAction)?.focus();
        } catch (error) {
            console.error('Error loading photo detail:', error);
            if(this.isGalleryCurrent(scope)&&request===this.detailRequest)window.Notifications?.error('No se pudieron cargar los detalles de la foto');
        }
    },

    closeDetailModal() {
        this.detailRequest=(this.detailRequest||0)+1;this.detailPhotoId=null;this.detailCleanup?.();this.detailCleanup=null;
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


    // ============================================
    // COMMENTS
    // ============================================




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

};

// Exportar para uso global
window.PhotoGallery = PhotoGallery;
window.addEventListener('tripSelected',()=>{PhotoGallery.cleanup();if(document.getElementById('photoGalleryGrid'))PhotoGallery.loadGallery();});
window.addEventListener('auth:loggedOut',()=>{PhotoGallery.cleanup();const grid=document.getElementById('photoGalleryGrid');if(grid)grid.textContent='Inicia sesi\u00f3n para ver tus fotos.';});

window.addEventListener('auth:initialized',()=>{if(document.getElementById('photoGalleryGrid'))PhotoGallery.loadGallery();});
