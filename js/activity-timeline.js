// js/activity-timeline.js - Timeline/Feed de actividad grupal en tiempo real

import { auth, db } from './firebase-config.js';
import { collection, doc, addDoc, query, where, onSnapshot, orderBy, limit, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const ActivityTimeline = {
    unsubscriber: null,
    currentFilter: 'all',

    // ============================================
    // RENDER TIMELINE
    // ============================================
    render() {
        return `
            <div class="space-y-4">
                <!-- Header -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600">
                    <h4 class="text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                        <span>📱</span>
                        <span>Timeline Compartido</span>
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                        Feed en tiempo real de todas las actividades del grupo
                    </p>
                </div>

                <!-- Filters -->
                <div class="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onclick="ActivityTimeline.setFilter('all')"
                        class="timeline-filter-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap bg-blue-500 text-white"
                        data-filter="all"
                    >
                        🌟 Todas
                    </button>
                    <button
                        onclick="ActivityTimeline.setFilter('photo')"
                        class="timeline-filter-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        data-filter="photo"
                    >
                        📸 Fotos
                    </button>
                    <button
                        onclick="ActivityTimeline.setFilter('journal')"
                        class="timeline-filter-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        data-filter="journal"
                    >
                        📔 Diario
                    </button>
                    <button
                        onclick="ActivityTimeline.setFilter('achievement')"
                        class="timeline-filter-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        data-filter="achievement"
                    >
                        🏆 Logros
                    </button>
                    <button
                        onclick="ActivityTimeline.setFilter('poll')"
                        class="timeline-filter-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        data-filter="poll"
                    >
                        🗳️ Votaciones
                    </button>
                    <button
                        onclick="ActivityTimeline.setFilter('challenge')"
                        class="timeline-filter-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        data-filter="challenge"
                    >
                        ⚡ Desafíos
                    </button>
                </div>

                <!-- Timeline Feed -->
                <div id="timelineFeed" class="space-y-3">
                    <div class="text-center text-gray-400 py-8">
                        Cargando actividades...
                    </div>
                </div>

                <!-- Load More -->
                <div id="loadMoreContainer" class="hidden text-center">
                    <button
                        onclick="ActivityTimeline.loadMore()"
                        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                        Ver más actividades
                    </button>
                </div>
            </div>
        `;
    },

    // ============================================
    // LOAD TIMELINE
    // ============================================
    async loadTimeline() {
        const tripId = window.currentTripId || localStorage.getItem('currentTripId');
        const container = document.getElementById('timelineFeed');

        if (!container) return;

        if (!auth.currentUser) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-4xl mb-3">🔒</p>
                    <p class="text-gray-600 dark:text-gray-400">Debes estar autenticado</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Inicia sesión para ver el timeline</p>
                </div>
            `;
            return;
        }

        if (!tripId) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-4xl mb-3">✈️</p>
                    <p class="text-gray-600 dark:text-gray-400">No hay viaje activo</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Selecciona o crea un viaje primero</p>
                </div>
            `;
            return;
        }

        try {
            const activitiesRef = collection(db, `trips/${tripId}/timeline`);
            let activitiesQuery = query(
                activitiesRef,
                orderBy('timestamp', 'desc'),
                limit(20)
            );

            // Aplicar filtro si no es 'all'
            if (this.currentFilter !== 'all') {
                activitiesQuery = query(
                    activitiesRef,
                    where('type', '==', this.currentFilter),
                    orderBy('timestamp', 'desc'),
                    limit(20)
                );
            }

            // Real-time listener
            if (this.unsubscriber) {
                this.unsubscriber();
            }

            this.unsubscriber = onSnapshot(activitiesQuery, (snapshot) => {
                const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                this.renderTimeline(activities);
            });

        } catch (error) {
            console.error('Error loading timeline:', error);
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-4xl mb-3">⚠️</p>
                    <p class="text-gray-600 dark:text-gray-400">Error al cargar timeline</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">${error.message}</p>
                </div>
            `;
        }
    },

    // ============================================
    // RENDER TIMELINE
    // ============================================
    renderTimeline(activities) {
        const container = document.getElementById('timelineFeed');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-4xl mb-3">📱</p>
                    <p class="text-gray-600 dark:text-gray-400">No hay actividades aún</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Las acciones del grupo aparecerán aquí</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(activity => this.renderActivity(activity)).join('');
    },

    // ============================================
    // RENDER SINGLE ACTIVITY
    // ============================================
    renderActivity(activity) {
        const timeAgo = this.getTimeAgo(activity.timestamp);

        // Activity type configs
        const configs = {
            photo: {
                icon: '📸',
                color: 'from-pink-500 to-rose-500',
                bgColor: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
                borderColor: 'border-pink-200 dark:border-pink-800'
            },
            journal: {
                icon: '📔',
                color: 'from-green-500 to-emerald-500',
                bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                borderColor: 'border-green-200 dark:border-green-800'
            },
            achievement: {
                icon: '🏆',
                color: 'from-yellow-500 to-orange-500',
                bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
                borderColor: 'border-yellow-200 dark:border-yellow-800'
            },
            poll: {
                icon: '🗳️',
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
                borderColor: 'border-blue-200 dark:border-blue-800'
            },
            challenge: {
                icon: '⚡',
                color: 'from-purple-500 to-pink-500',
                bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
                borderColor: 'border-purple-200 dark:border-purple-800'
            },
            meal: {
                icon: '🍱',
                color: 'from-orange-500 to-red-500',
                bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
                borderColor: 'border-orange-200 dark:border-orange-800'
            },
            bingo: {
                icon: '🎯',
                color: 'from-indigo-500 to-purple-500',
                bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                borderColor: 'border-indigo-200 dark:border-indigo-800'
            }
        };

        const config = configs[activity.type] || configs.photo;

        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border ${config.borderColor} hover:shadow-lg transition">
                <!-- Activity Header -->
                <div class="p-4">
                    <div class="flex items-start gap-3">
                        <!-- User Avatar -->
                        <div class="flex-shrink-0">
                            <div class="w-12 h-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                ${activity.userName ? activity.userName.charAt(0).toUpperCase() : '?'}
                            </div>
                        </div>

                        <!-- Activity Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-1">
                                    <p class="font-bold text-gray-800 dark:text-white">
                                        ${activity.userName || 'Usuario'}
                                    </p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        ${config.icon} ${activity.description}
                                    </p>
                                </div>
                                <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    ${timeAgo}
                                </span>
                            </div>

                            <!-- Activity Details -->
                            ${this.renderActivityDetails(activity, config)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ============================================
    // RENDER ACTIVITY DETAILS
    // ============================================
    renderActivityDetails(activity, config) {
        switch(activity.type) {
            case 'photo':
                return activity.photoURL ? `
                    <div class="mt-3 rounded-lg overflow-hidden">
                        <img src="${activity.photoURL}" alt="Photo" class="w-full max-h-64 object-cover">
                        ${activity.caption ? `<p class="mt-2 text-sm text-gray-700 dark:text-gray-300">${activity.caption}</p>` : ''}
                    </div>
                ` : '';

            case 'journal':
                return activity.preview ? `
                    <div class="mt-3 bg-gradient-to-r ${config.bgColor} p-3 rounded-lg border ${config.borderColor}">
                        <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                            ${activity.preview}
                        </p>
                    </div>
                ` : '';

            case 'achievement':
                return activity.achievements ? `
                    <div class="mt-3 flex gap-2 flex-wrap">
                        ${activity.achievements.slice(0, 3).map(ach => `
                            <div class="bg-gradient-to-r ${config.bgColor} px-3 py-2 rounded-lg border-2 ${config.borderColor}">
                                <span class="text-lg">${ach.icon}</span>
                                <span class="text-xs font-semibold text-gray-800 dark:text-white ml-1">${ach.name}</span>
                            </div>
                        `).join('')}
                        ${activity.achievements.length > 3 ? `
                            <div class="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                                <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">+${activity.achievements.length - 3} más</span>
                            </div>
                        ` : ''}
                    </div>
                ` : '';

            case 'poll':
                return activity.question ? `
                    <div class="mt-3 bg-gradient-to-r ${config.bgColor} p-3 rounded-lg border ${config.borderColor}">
                        <p class="text-sm font-semibold text-gray-800 dark:text-white">
                            ${activity.question}
                        </p>
                        ${activity.optionsCount ? `
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                ${activity.optionsCount} opciones • ${activity.votesCount || 0} votos
                            </p>
                        ` : ''}
                    </div>
                ` : '';

            case 'challenge':
                return activity.challengeTitle ? `
                    <div class="mt-3 bg-gradient-to-r ${config.bgColor} p-3 rounded-lg border ${config.borderColor}">
                        <p class="text-sm font-semibold text-gray-800 dark:text-white">
                            ${activity.challengeIcon || '⚡'} ${activity.challengeTitle}
                        </p>
                        ${activity.participantsCount ? `
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                ${activity.participantsCount} persona(s) completaron
                            </p>
                        ` : ''}
                    </div>
                ` : '';

            case 'meal':
                return `
                    <div class="mt-3 bg-gradient-to-r ${config.bgColor} p-3 rounded-lg border ${config.borderColor}">
                        <p class="text-sm font-semibold text-gray-800 dark:text-white">
                            ${activity.mealName || 'Comida nueva'}
                        </p>
                    </div>
                `;

            case 'bingo':
                return `
                    <div class="mt-3 bg-gradient-to-r ${config.bgColor} p-3 rounded-lg border ${config.borderColor}">
                        <p class="text-sm font-semibold text-gray-800 dark:text-white">
                            ${activity.experienceName || 'Experiencia nueva'}
                        </p>
                    </div>
                `;

            default:
                return '';
        }
    },

    // ============================================
    // TIME AGO HELPER
    // ============================================
    getTimeAgo(timestamp) {
        if (!timestamp) return 'Ahora';

        const now = Date.now();
        const activityTime = timestamp.seconds ? timestamp.seconds * 1000 : timestamp;
        const diff = now - activityTime;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Ahora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;

        return new Date(activityTime).toLocaleDateString();
    },

    // ============================================
    // FILTER
    // ============================================
    setFilter(filter) {
        this.currentFilter = filter;

        // Update button styles
        document.querySelectorAll('.timeline-filter-btn').forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.className = 'timeline-filter-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap bg-blue-500 text-white';
            } else {
                btn.className = 'timeline-filter-btn px-4 py-2 rounded-lg font-semibold whitespace-nowrap bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
            }
        });

        this.loadTimeline();
    },

    // ============================================
    // LOG ACTIVITY (Helper function)
    // ============================================
    async logActivity(tripId, activityData) {
        if (!auth.currentUser || !tripId) return;

        try {
            const activitiesRef = collection(db, `trips/${tripId}/timeline`);

            await addDoc(activitiesRef, {
                ...activityData,
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName || 'Usuario',
                userPhoto: auth.currentUser.photoURL || null,
                timestamp: serverTimestamp()
            });

            console.log('✓ Activity logged:', activityData.type);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    },

    // ============================================
    // Cleanup
    // ============================================
    cleanup() {
        if (this.unsubscriber) {
            this.unsubscriber();
            this.unsubscriber = null;
        }
    }
};

// Exportar para uso global
window.ActivityTimeline = ActivityTimeline;

// ============================================
// HELPER FUNCTIONS para integrar con otras features
// ============================================

// Helper para que otros módulos registren actividades
window.logTimelineActivity = async (type, data) => {
    const tripId = window.currentTripId || localStorage.getItem('currentTripId');
    if (!tripId) return;

    await ActivityTimeline.logActivity(tripId, {
        type,
        ...data
    });
};
