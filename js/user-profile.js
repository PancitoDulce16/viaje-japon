// js/user-profile.js - Sistema de perfiles de usuario con foto, bio y stats

import { auth, db, storage } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

export const UserProfile = {
    currentUserId: null,
    isOwnProfile: false,

    // ============================================
    // RENDER PROFILE
    // ============================================
    render(userId = null) {
        const targetUserId = userId || auth.currentUser?.uid;
        this.currentUserId = targetUserId;
        this.isOwnProfile = targetUserId === auth.currentUser?.uid;

        return `
            <div class="space-y-4">
                <!-- Profile Header -->
                <div class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-600">
                    <h4 class="text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                        <span>👤</span>
                        <span>${this.isOwnProfile ? 'Mi Perfil' : 'Perfil de Usuario'}</span>
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                        ${this.isOwnProfile ? 'Personaliza tu perfil y revisa tus estadísticas del viaje' : 'Información del viajero'}
                    </p>
                </div>

                <!-- Profile Content -->
                <div id="profileContent" class="space-y-4">
                    <div class="text-center text-gray-400 py-8">
                        Cargando perfil...
                    </div>
                </div>

                <!-- Edit Modal -->
                ${this.isOwnProfile ? `
                    <div id="editProfileModal" class="hidden fixed inset-0 bg-black/80 z-50 overflow-y-auto" onclick="UserProfile.closeEditModal(event)">
                        <div class="min-h-screen px-4 py-8">
                            <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl" onclick="event.stopPropagation()">
                                <div id="editProfileContent">
                                    <!-- Content will be injected here -->
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // ============================================
    // LOAD PROFILE
    // ============================================
    async loadProfile(userId = null) {
        const targetUserId = userId || auth.currentUser?.uid;
        const container = document.getElementById('profileContent');

        if (!container) return;

        if (!auth.currentUser) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-4xl mb-3">🔒</p>
                    <p class="text-gray-600 dark:text-gray-400">Debes estar autenticado</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Inicia sesión para ver perfiles</p>
                </div>
            `;
            return;
        }

        try {
            // Obtener datos del perfil de Firestore
            const profileRef = doc(db, `users/${targetUserId}`);
            const profileSnap = await getDoc(profileRef);

            let profileData;
            if (!profileSnap.exists()) {
                // Crear perfil inicial si no existe
                profileData = {
                    userId: targetUserId,
                    displayName: auth.currentUser.displayName || 'Usuario',
                    email: auth.currentUser.email,
                    photoURL: auth.currentUser.photoURL || null,
                    bio: '',
                    country: '',
                    favoriteCity: '',
                    travelStyle: 'explorer',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                if (this.isOwnProfile) {
                    await setDoc(profileRef, profileData);
                }
            } else {
                profileData = profileSnap.data();
            }

            // Obtener estadísticas del viaje
            const stats = await this.getUserStats(targetUserId);

            this.renderProfile(profileData, stats);
        } catch (error) {
            console.error('Error loading profile:', error);
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-4xl mb-3">⚠️</p>
                    <p class="text-gray-600 dark:text-gray-400">Error al cargar perfil</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">${error.message}</p>
                </div>
            `;
        }
    },

    // ============================================
    // RENDER PROFILE CONTENT
    // ============================================
    renderProfile(profile, stats) {
        const container = document.getElementById('profileContent');
        if (!container) return;

        const travelStyles = {
            explorer: { icon: '🗺️', name: 'Explorador' },
            foodie: { icon: '🍜', name: 'Foodie' },
            photographer: { icon: '📸', name: 'Fotógrafo' },
            culture: { icon: '🏯', name: 'Amante Cultural' },
            nature: { icon: '🌸', name: 'Naturaleza' },
            urban: { icon: '🏙️', name: 'Urbano' }
        };

        const style = travelStyles[profile.travelStyle] || travelStyles.explorer;

        container.innerHTML = `
            <!-- Profile Card -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <!-- Cover Image -->
                <div class="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <!-- Profile Info -->
                <div class="relative px-6 pb-6">
                    <!-- Profile Picture -->
                    <div class="flex justify-center -mt-16 mb-4">
                        <div class="relative">
                            <div class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500">
                                ${profile.photoURL ? `
                                    <img src="${profile.photoURL}" alt="${profile.displayName}" class="w-full h-full object-cover">
                                ` : `
                                    <div class="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                                        ${profile.displayName.charAt(0).toUpperCase()}
                                    </div>
                                `}
                            </div>
                            ${this.isOwnProfile ? `
                                <button
                                    onclick="UserProfile.openEditModal()"
                                    class="absolute bottom-0 right-0 bg-white dark:bg-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                    title="Editar perfil"
                                >
                                    <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                    </svg>
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Name & Bio -->
                    <div class="text-center mb-4">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-1">${profile.displayName}</h2>
                        ${profile.email ? `
                            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                📧 ${profile.email}
                            </p>
                        ` : ''}
                        ${profile.country ? `
                            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                🌍 ${profile.country}
                            </p>
                        ` : ''}
                        ${profile.bio ? `
                            <p class="text-gray-600 dark:text-gray-300 mt-3 max-w-lg mx-auto">
                                ${profile.bio}
                            </p>
                        ` : ''}
                    </div>

                    <!-- Travel Style & Favorite City -->
                    <div class="flex justify-center gap-4 mb-6 flex-wrap">
                        <div class="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 px-4 py-2 rounded-full">
                            <span class="text-sm font-semibold text-gray-800 dark:text-white">
                                ${style.icon} ${style.name}
                            </span>
                        </div>
                        ${profile.favoriteCity ? `
                            <div class="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 px-4 py-2 rounded-full">
                                <span class="text-sm font-semibold text-gray-800 dark:text-white">
                                    ⭐ ${profile.favoriteCity}
                                </span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Stats Grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800 text-center">
                            <div class="text-3xl font-bold text-pink-600 dark:text-pink-400">${stats.photosUploaded}</div>
                            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">📸 Fotos</div>
                        </div>
                        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">${stats.journalEntries}</div>
                            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">📔 Entradas</div>
                        </div>
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
                            <div class="text-3xl font-bold text-green-600 dark:text-green-400">${stats.mealsTracked}</div>
                            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">🍱 Comidas</div>
                        </div>
                        <div class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center">
                            <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">${stats.achievements}</div>
                            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">🏆 Logros</div>
                        </div>
                    </div>

                    <!-- Additional Stats -->
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${stats.bingoCompleted}</div>
                            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">🎯 Bingo</div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                            <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${stats.stampsCollected}</div>
                            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">🎫 Sellos</div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                            <div class="text-2xl font-bold text-red-600 dark:text-red-400">${stats.maxStreak}</div>
                            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">🔥 Racha</div>
                        </div>
                    </div>

                    <!-- Badges/Achievements Preview -->
                    ${stats.latestAchievements && stats.latestAchievements.length > 0 ? `
                        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                <span>🏆</span>
                                <span>Últimos Logros</span>
                            </h3>
                            <div class="flex gap-2 overflow-x-auto pb-2">
                                ${stats.latestAchievements.slice(0, 5).map(achievement => `
                                    <div class="flex-shrink-0 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 px-3 py-2 rounded-lg border-2 border-yellow-300 dark:border-yellow-600 text-center min-w-[80px]">
                                        <div class="text-2xl mb-1">${achievement.icon}</div>
                                        <div class="text-xs font-semibold text-gray-800 dark:text-white">${achievement.name}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // ============================================
    // GET USER STATS
    // ============================================
    async getUserStats(userId) {
        const tripId = window.currentTripId || localStorage.getItem('currentTripId');

        try {
            // Stats from localStorage
            const mealsTracked = JSON.parse(localStorage.getItem('japanFoodTracker') || '{}');
            const bingoData = JSON.parse(localStorage.getItem('japanTravelBingo') || '{}');
            const stampsData = JSON.parse(localStorage.getItem('japanStampCollection') || '[]');
            const streaksData = JSON.parse(localStorage.getItem('japanActivityStreaks') || '{}');

            let photosUploaded = 0;
            let journalEntries = 0;
            let achievements = 0;
            let latestAchievements = [];

            if (tripId) {
                // Photos count
                const photosRef = doc(db, `trips/${tripId}/photos`);
                try {
                    const photosSnap = await getDoc(photosRef);
                    if (photosSnap.exists()) {
                        const photosData = photosSnap.data();
                        photosUploaded = Object.keys(photosData).filter(key => photosData[key]?.userId === userId).length;
                    }
                } catch (e) {
                    // Collection might not exist yet
                }

                // Journal entries count
                const journalRef = doc(db, `trips/${tripId}/journal`);
                try {
                    const journalSnap = await getDoc(journalRef);
                    if (journalSnap.exists()) {
                        const journalData = journalSnap.data();
                        journalEntries = Object.keys(journalData).filter(key => journalData[key]?.userId === userId).length;
                    }
                } catch (e) {
                    // Collection might not exist yet
                }

                // Achievements
                const achievementsRef = doc(db, `trips/${tripId}/achievements/${userId}`);
                try {
                    const achievementsSnap = await getDoc(achievementsRef);
                    if (achievementsSnap.exists()) {
                        const achievementsData = achievementsSnap.data();
                        latestAchievements = achievementsData.achievements || [];
                        achievements = latestAchievements.length;
                    }
                } catch (e) {
                    // Document might not exist yet
                }
            }

            return {
                photosUploaded,
                journalEntries,
                mealsTracked: Object.values(mealsTracked).filter(v => v).length,
                bingoCompleted: Object.values(bingoData).filter(v => v).length,
                stampsCollected: stampsData.length,
                maxStreak: Math.max(...Object.values(streaksData).map(s => s.streak || 0), 0),
                achievements,
                latestAchievements
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            return {
                photosUploaded: 0,
                journalEntries: 0,
                mealsTracked: 0,
                bingoCompleted: 0,
                stampsCollected: 0,
                maxStreak: 0,
                achievements: 0,
                latestAchievements: []
            };
        }
    },

    // ============================================
    // EDIT PROFILE
    // ============================================
    async openEditModal() {
        const modal = document.getElementById('editProfileModal');
        const content = document.getElementById('editProfileContent');

        if (!modal || !content || !auth.currentUser) return;

        const profileRef = doc(db, `users/${auth.currentUser.uid}`);
        const profileSnap = await getDoc(profileRef);
        const profile = profileSnap.exists() ? profileSnap.data() : {};

        content.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Editar Perfil</h3>
                    <button
                        onclick="UserProfile.closeEditModal()"
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div class="space-y-4">
                    <!-- Profile Photo -->
                    <div class="text-center">
                        <div class="flex justify-center mb-4">
                            <div class="relative">
                                <div id="editPhotoPreview" class="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500">
                                    ${profile.photoURL ? `
                                        <img src="${profile.photoURL}" alt="Profile" class="w-full h-full object-cover">
                                    ` : `
                                        <div class="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                                            ${(profile.displayName || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    `}
                                </div>
                                <input type="file" id="profilePhotoInput" accept="image/*" class="hidden" onchange="UserProfile.handlePhotoSelect(event)">
                                <button
                                    onclick="document.getElementById('profilePhotoInput').click()"
                                    class="absolute bottom-0 right-0 bg-white dark:bg-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                >
                                    📷
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Display Name -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
                        <input
                            type="text"
                            id="editDisplayName"
                            value="${profile.displayName || ''}"
                            class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="Tu nombre"
                        >
                    </div>

                    <!-- Bio -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                        <textarea
                            id="editBio"
                            rows="3"
                            class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 resize-none"
                            placeholder="Cuéntanos sobre ti..."
                        >${profile.bio || ''}</textarea>
                    </div>

                    <!-- Country -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">País</label>
                        <input
                            type="text"
                            id="editCountry"
                            value="${profile.country || ''}"
                            class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="Ej: Costa Rica, México, España..."
                        >
                    </div>

                    <!-- Favorite City -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ciudad Favorita en Japón</label>
                        <input
                            type="text"
                            id="editFavoriteCity"
                            value="${profile.favoriteCity || ''}"
                            class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="Tokyo, Kyoto, Osaka..."
                        >
                    </div>

                    <!-- Travel Style -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estilo de Viaje</label>
                        <select
                            id="editTravelStyle"
                            class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                            <option value="explorer" ${profile.travelStyle === 'explorer' ? 'selected' : ''}>🗺️ Explorador</option>
                            <option value="foodie" ${profile.travelStyle === 'foodie' ? 'selected' : ''}>🍜 Foodie</option>
                            <option value="photographer" ${profile.travelStyle === 'photographer' ? 'selected' : ''}>📸 Fotógrafo</option>
                            <option value="culture" ${profile.travelStyle === 'culture' ? 'selected' : ''}>🏯 Amante Cultural</option>
                            <option value="nature" ${profile.travelStyle === 'nature' ? 'selected' : ''}>🌸 Naturaleza</option>
                            <option value="urban" ${profile.travelStyle === 'urban' ? 'selected' : ''}>🏙️ Urbano</option>
                        </select>
                    </div>

                    <!-- Save Button -->
                    <div class="flex gap-3 pt-4">
                        <button
                            onclick="UserProfile.closeEditModal()"
                            class="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-3 rounded-lg font-bold transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onclick="UserProfile.saveProfile()"
                            class="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-3 rounded-lg font-bold transition shadow-lg"
                        >
                            💾 Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
    },

    selectedPhotoFile: null,

    handlePhotoSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona una imagen válida');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('La imagen es muy grande. Máximo 2MB');
            return;
        }

        this.selectedPhotoFile = file;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('editPhotoPreview');
            if (preview) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="w-full h-full object-cover">`;
            }
        };
        reader.readAsDataURL(file);
    },

    async saveProfile() {
        if (!auth.currentUser) return;

        try {
            const displayName = document.getElementById('editDisplayName')?.value.trim();
            const bio = document.getElementById('editBio')?.value.trim();
            const country = document.getElementById('editCountry')?.value.trim();
            const favoriteCity = document.getElementById('editFavoriteCity')?.value.trim();
            const travelStyle = document.getElementById('editTravelStyle')?.value;

            if (!displayName) {
                alert('El nombre es requerido');
                return;
            }

            let photoURL = auth.currentUser.photoURL;

            // Upload new photo if selected
            if (this.selectedPhotoFile) {
                const storageRef = ref(storage, `users/${auth.currentUser.uid}/profile.jpg`);
                await uploadBytes(storageRef, this.selectedPhotoFile);
                photoURL = await getDownloadURL(storageRef);

                // Update Firebase Auth profile
                await updateProfile(auth.currentUser, { photoURL });
            }

            // Update display name if changed
            if (displayName !== auth.currentUser.displayName) {
                await updateProfile(auth.currentUser, { displayName });
            }

            // Update Firestore profile
            const profileRef = doc(db, `users/${auth.currentUser.uid}`);
            await setDoc(profileRef, {
                userId: auth.currentUser.uid,
                displayName,
                email: auth.currentUser.email,
                photoURL,
                bio,
                country,
                favoriteCity,
                travelStyle,
                updatedAt: serverTimestamp()
            }, { merge: true });

            alert('¡Perfil actualizado! ✓');
            this.selectedPhotoFile = null;
            this.closeEditModal();
            this.loadProfile();

        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error al guardar el perfil: ' + error.message);
        }
    },

    closeEditModal() {
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            modal.classList.add('hidden');
            this.selectedPhotoFile = null;
        }
    },

    closeEditModalOnClick(event) {
        if (event.target.id === 'editProfileModal') {
            this.closeEditModal();
        }
    }
};

// Exportar para uso global
window.UserProfile = UserProfile;
