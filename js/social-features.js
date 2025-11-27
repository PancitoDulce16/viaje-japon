// js/social-features.js - Funcionalidades sociales y colaborativas

import { auth, db } from './firebase-config.js';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, onSnapshot, orderBy, serverTimestamp, increment } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const SocialFeatures = {
    currentTripId: null,
    unsubscribers: [],

    // ============================================
    // SISTEMA DE LOGROS
    // ============================================
    async checkAndUpdateAchievements(tripId) {
        if (!auth.currentUser) return;

        try {
            const userId = auth.currentUser.uid;
            const userAchievementsRef = doc(db, `trips/${tripId}/achievements/${userId}`);

            // Obtener estadísticas del usuario
            const stats = await this.getUserStats(tripId, userId);

            // Definir logros disponibles
            const achievements = [
                { id: 'first_meal', name: 'Primera Comida', icon: '🍱', condition: stats.mealsTracked >= 1, description: 'Probaste tu primera comida japonesa' },
                { id: 'foodie_5', name: 'Foodie Principiante', icon: '🍜', condition: stats.mealsTracked >= 5, description: 'Probaste 5 comidas diferentes' },
                { id: 'foodie_10', name: 'Foodie Experto', icon: '🍣', condition: stats.mealsTracked >= 10, description: 'Probaste 10 comidas diferentes' },
                { id: 'bingo_first', name: 'Primera Experiencia', icon: '🎯', condition: stats.bingoCompleted >= 1, description: 'Completaste tu primera experiencia de bingo' },
                { id: 'bingo_5', name: 'Aventurero', icon: '🗾', condition: stats.bingoCompleted >= 5, description: 'Completaste 5 experiencias' },
                { id: 'bingo_10', name: 'Explorador Maestro', icon: '🏯', condition: stats.bingoCompleted >= 10, description: 'Completaste 10 experiencias' },
                { id: 'stamps_5', name: 'Coleccionista', icon: '🎫', condition: stats.stampsCollected >= 5, description: 'Coleccionaste 5 sellos' },
                { id: 'streak_3', name: 'Constante', icon: '🔥', condition: stats.maxStreak >= 3, description: 'Mantuviste una racha de 3 días' },
                { id: 'streak_7', name: 'Dedicado', icon: '💪', condition: stats.maxStreak >= 7, description: 'Mantuviste una racha de 7 días' },
                { id: 'early_bird', name: 'Madrugador', icon: '🌅', condition: stats.tripStarted, description: 'Iniciaste tu viaje a Japón' },
                { id: 'social', name: 'Social', icon: '👥', condition: stats.journalEntries >= 1, description: 'Escribiste tu primera entrada en el diario' },
                { id: 'writer', name: 'Escritor', icon: '📝', condition: stats.journalEntries >= 5, description: 'Escribiste 5 entradas en el diario' },
            ];

            // Verificar logros desbloqueados
            const unlockedAchievements = achievements.filter(a => a.condition);

            // Guardar en Firebase
            await setDoc(userAchievementsRef, {
                userId,
                achievements: unlockedAchievements.map(a => ({ id: a.id, unlockedAt: new Date().toISOString() })),
                updatedAt: serverTimestamp()
            }, { merge: true });

            return unlockedAchievements;
        } catch (error) {
            console.error('Error checking achievements:', error);
            return [];
        }
    },

    async getUserStats(tripId, userId) {
        // Obtener datos de localStorage y Firebase
        const mealsTracked = JSON.parse(localStorage.getItem('japanFoodTracker') || '{}');
        const bingoData = JSON.parse(localStorage.getItem('japanTravelBingo') || '{}');
        const stampsData = JSON.parse(localStorage.getItem('japanStampCollection') || '[]');
        const streaksData = JSON.parse(localStorage.getItem('japanActivityStreaks') || '{}');

        // Obtener entradas del diario
        const journalRef = collection(db, `trips/${tripId}/journal`);
        const journalQuery = query(journalRef, where('userId', '==', userId));
        const journalSnap = await getDocs(journalQuery);

        return {
            mealsTracked: Object.values(mealsTracked).filter(v => v).length,
            bingoCompleted: Object.values(bingoData).filter(v => v).length,
            stampsCollected: stampsData.length,
            maxStreak: Math.max(...Object.values(streaksData).map(s => s.streak || 0), 0),
            journalEntries: journalSnap.size,
            tripStarted: true
        };
    },

    renderAchievements() {
        return `
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-600">
                    <h4 class="text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                        <span>🏆</span>
                        <span>Mis Logros</span>
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Completa actividades para desbloquear logros y badges especiales
                    </p>
                </div>

                <button
                    onclick="SocialFeatures.loadAchievements()"
                    class="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg font-bold transition shadow-lg"
                >
                    🔄 Actualizar Logros
                </button>

                <div id="achievementsGrid" class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div class="text-center text-gray-400 dark:text-gray-500 col-span-full py-8">
                        Cargando logros...
                    </div>
                </div>
            </div>
        `;
    },

    async loadAchievements() {
        const tripId = window.currentTripId || localStorage.getItem('currentTripId');
        const grid = document.getElementById('achievementsGrid');
        if (!grid) return;

        if (!auth.currentUser) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-4xl mb-3">🔒</p>
                    <p class="text-gray-600 dark:text-gray-400">Debes estar autenticado</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Inicia sesión para ver tus logros</p>
                </div>
            `;
            return;
        }

        if (!tripId) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-4xl mb-3">✈️</p>
                    <p class="text-gray-600 dark:text-gray-400">No hay viaje activo</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Selecciona o crea un viaje primero</p>
                </div>
            `;
            return;
        }

        const achievements = await this.checkAndUpdateAchievements(tripId);

        if (achievements.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-4xl mb-3">🎯</p>
                    <p class="text-gray-600 dark:text-gray-400">¡Aún no tienes logros!</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Completa actividades para desbloquear badges</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = achievements.map(achievement => `
            <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-yellow-300 dark:border-yellow-600 shadow-lg text-center transform hover:scale-105 transition">
                <div class="text-4xl mb-2">${achievement.icon}</div>
                <h5 class="font-bold text-sm text-gray-800 dark:text-white mb-1">${achievement.name}</h5>
                <p class="text-xs text-gray-600 dark:text-gray-400">${achievement.description}</p>
            </div>
        `).join('');
    },

    // ============================================
    // DESAFÍOS DIARIOS
    // ============================================
    renderDailyChallenges() {
        return `
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-600">
                    <h4 class="text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                        <span>⚡</span>
                        <span>Desafío del Día</span>
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Un nuevo reto cada día para todos los miembros del grupo
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        ⏰ Se renueva a medianoche (hora de Japón)
                    </p>
                </div>

                <div id="dailyChallengeCard" class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-2 border-purple-400 dark:border-purple-600">
                    <div class="text-center text-gray-400 py-8">
                        Cargando desafío...
                    </div>
                </div>

                <div id="challengeParticipants" class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <!-- Participantes que completaron el desafío -->
                </div>
            </div>
        `;
    },

    async loadDailyChallenge() {
        const tripId = window.currentTripId || localStorage.getItem('currentTripId');
        const card = document.getElementById('dailyChallengeCard');

        if (!card) return;

        if (!auth.currentUser) {
            card.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-4xl mb-3">🔒</p>
                    <p class="text-gray-600 dark:text-gray-400">Debes estar autenticado</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Inicia sesión para ver el desafío del día</p>
                </div>
            `;
            return;
        }

        if (!tripId) {
            card.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-4xl mb-3">✈️</p>
                    <p class="text-gray-600 dark:text-gray-400">No hay viaje activo</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Selecciona o crea un viaje primero</p>
                </div>
            `;
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0];
            const challengeRef = doc(db, `trips/${tripId}/challenges/${today}`);
            const challengeSnap = await getDoc(challengeRef);

            let challengeData;
            if (!challengeSnap.exists()) {
                // Crear desafío del día
                const challenges = [
                    { icon: '📸', title: 'Fotógrafo del Día', description: 'Toma una foto de un templo o santuario', category: 'cultural' },
                    { icon: '🍜', title: 'Aventura Culinaria', description: 'Prueba una comida que nunca has comido', category: 'food' },
                    { icon: '🗣️', title: 'Practicando Japonés', description: 'Usa 5 frases en japonés hoy', category: 'language' },
                    { icon: '🚶', title: 'Explorador', description: 'Camina 10,000 pasos', category: 'activity' },
                    { icon: '🏯', title: 'Cazador de Cultura', description: 'Visita un lugar histórico o cultural', category: 'cultural' },
                    { icon: '🎌', title: 'Coleccionista', description: 'Consigue un sello o stamp nuevo', category: 'collection' },
                    { icon: '🍵', title: 'Momento Zen', description: 'Toma té en un lugar tranquilo', category: 'relaxation' },
                    { icon: '🛍️', title: 'Shopping Local', description: 'Compra algo en una tienda local (no cadena)', category: 'shopping' },
                    { icon: '🌸', title: 'Naturaleza', description: 'Encuentra un jardín o parque', category: 'nature' },
                    { icon: '👘', title: 'Experiencia Tradicional', description: 'Prueba algo tradicionalmente japonés', category: 'cultural' },
                ];

                const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
                challengeData = {
                    ...randomChallenge,
                    date: today,
                    participants: [],
                    createdAt: serverTimestamp()
                };

                await setDoc(challengeRef, challengeData);
            } else {
                challengeData = challengeSnap.data();
            }

            this.renderChallengeCard(challengeData, tripId, today);
        } catch (error) {
            console.error('Error loading daily challenge:', error);
        }
    },

    renderChallengeCard(challenge, tripId, date) {
        const card = document.getElementById('dailyChallengeCard');
        if (!card) return;

        const userId = auth.currentUser?.uid;
        const hasCompleted = challenge.participants?.includes(userId);

        card.innerHTML = `
            <div class="text-center">
                <div class="text-6xl mb-4">${challenge.icon}</div>
                <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">${challenge.title}</h3>
                <p class="text-gray-600 dark:text-gray-300 mb-4">${challenge.description}</p>

                ${hasCompleted ? `
                    <div class="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg font-bold">
                        ✅ ¡Completado!
                    </div>
                ` : `
                    <button
                        onclick="SocialFeatures.completeChallenge('${tripId}', '${date}')"
                        class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-bold transition shadow-lg"
                    >
                        ✓ Marcar como Completado
                    </button>
                `}
            </div>
        `;

        // Mostrar participantes
        const participantsDiv = document.getElementById('challengeParticipants');
        if (participantsDiv && challenge.participants?.length > 0) {
            participantsDiv.innerHTML = `
                <h5 class="font-bold text-sm text-gray-700 dark:text-gray-300 mb-2">
                    👥 Completado por ${challenge.participants.length} persona(s)
                </h5>
                <div class="flex gap-2 flex-wrap">
                    ${challenge.participants.map(() => '<span class="text-2xl">✅</span>').join('')}
                </div>
            `;
        }
    },

    async completeChallenge(tripId, date) {
        if (!auth.currentUser) {
            alert('Debes estar autenticado');
            return;
        }

        try {
            const userId = auth.currentUser.uid;
            const challengeRef = doc(db, `trips/${tripId}/challenges/${date}`);

            const challengeSnap = await getDoc(challengeRef);
            const currentParticipants = challengeSnap.data()?.participants || [];

            if (currentParticipants.includes(userId)) {
                alert('Ya completaste este desafío');
                return;
            }

            await updateDoc(challengeRef, {
                participants: [...currentParticipants, userId]
            });

            alert('¡Desafío completado! 🎉');
            this.loadDailyChallenge();

            // Actualizar logros
            this.checkAndUpdateAchievements(tripId);
        } catch (error) {
            console.error('Error completing challenge:', error);
            alert('Error al completar el desafío');
        }
    },

    // ============================================
    // SISTEMA DE VOTACIONES
    // ============================================
    renderVotingSystem() {
        return `
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600">
                    <h4 class="text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                        <span>🗳️</span>
                        <span>Sistema de Votaciones</span>
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                        Crea encuestas para decidir en grupo: restaurantes, actividades, horarios, etc.
                    </p>
                </div>

                <!-- Crear nueva votación -->
                <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h5 class="font-bold mb-3 text-gray-800 dark:text-white">➕ Nueva Votación</h5>
                    <input
                        id="pollQuestion"
                        type="text"
                        placeholder="¿Qué quieres decidir?"
                        class="w-full p-3 border rounded-lg mb-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                    <div id="pollOptions" class="space-y-2 mb-3">
                        <input type="text" placeholder="Opción 1" class="poll-option w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        <input type="text" placeholder="Opción 2" class="poll-option w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    </div>
                    <div class="flex gap-2">
                        <button
                            onclick="SocialFeatures.addPollOption()"
                            class="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-bold transition"
                        >
                            + Agregar Opción
                        </button>
                        <button
                            onclick="SocialFeatures.createPoll()"
                            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-bold transition shadow-lg"
                        >
                            🗳️ Crear Votación
                        </button>
                    </div>
                </div>

                <!-- Lista de votaciones activas -->
                <div id="activePollsList" class="space-y-3">
                    <div class="text-center text-gray-400 py-8">
                        Cargando votaciones...
                    </div>
                </div>
            </div>
        `;
    },

    addPollOption() {
        const container = document.getElementById('pollOptions');
        if (!container) return;

        const optionCount = container.querySelectorAll('.poll-option').length + 1;
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Opción ${optionCount}`;
        input.className = 'poll-option w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600';
        container.appendChild(input);
    },

    async createPoll() {
        const tripId = window.currentTripId || localStorage.getItem('currentTripId');
        if (!tripId || !auth.currentUser) {
            alert('Debes estar autenticado y tener un viaje activo');
            return;
        }

        const questionInput = document.getElementById('pollQuestion');
        const question = questionInput?.value.trim();

        if (!question) {
            alert('Debes escribir una pregunta');
            return;
        }

        const optionInputs = document.querySelectorAll('.poll-option');
        const options = Array.from(optionInputs)
            .map(input => input.value.trim())
            .filter(opt => opt.length > 0);

        if (options.length < 2) {
            alert('Debes agregar al menos 2 opciones');
            return;
        }

        try {
            const pollId = Date.now().toString();
            const pollRef = doc(db, `trips/${tripId}/polls/${pollId}`);

            await setDoc(pollRef, {
                question,
                options: options.map(opt => ({ text: opt, votes: [] })),
                createdBy: auth.currentUser.uid,
                createdByName: auth.currentUser.displayName || 'Usuario',
                createdAt: serverTimestamp(),
                active: true
            });

            // Log to timeline
            if (window.logTimelineActivity) {
                window.logTimelineActivity('poll', {
                    description: 'creó una votación',
                    question,
                    optionsCount: options.length,
                    votesCount: 0
                });
            }

            alert('¡Votación creada! 🗳️');

            // Limpiar formulario
            questionInput.value = '';
            document.querySelectorAll('.poll-option').forEach((input, idx) => {
                if (idx < 2) input.value = '';
                else input.remove();
            });

            this.loadPolls();
        } catch (error) {
            console.error('Error creating poll:', error);
            alert('Error al crear la votación');
        }
    },

    async loadPolls() {
        const tripId = window.currentTripId || localStorage.getItem('currentTripId');
        const container = document.getElementById('activePollsList');

        if (!container) return;

        if (!auth.currentUser) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-4xl mb-3">🔒</p>
                    <p class="text-gray-600 dark:text-gray-400">Debes estar autenticado</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Inicia sesión para ver y crear votaciones</p>
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
            const pollsRef = collection(db, `trips/${tripId}/polls`);
            const pollsQuery = query(pollsRef, where('active', '==', true), orderBy('createdAt', 'desc'));

            // Real-time listener
            const unsubscribe = onSnapshot(pollsQuery, (snapshot) => {
                const polls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                this.renderPolls(polls, tripId);
            });

            this.unsubscribers.push(unsubscribe);
        } catch (error) {
            console.error('Error loading polls:', error);
        }
    },

    renderPolls(polls, tripId) {
        const container = document.getElementById('activePollsList');
        if (!container) return;

        if (polls.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-4xl mb-3">🗳️</p>
                    <p class="text-gray-600 dark:text-gray-400">No hay votaciones activas</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Crea una para empezar a decidir en grupo</p>
                </div>
            `;
            return;
        }

        const userId = auth.currentUser?.uid;

        container.innerHTML = polls.map(poll => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
            const userVoted = poll.options.some(opt => opt.votes.includes(userId));

            return `
                <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-start mb-3">
                        <h5 class="font-bold text-gray-800 dark:text-white">${poll.question}</h5>
                        ${poll.createdBy === userId ? `
                            <button
                                onclick="SocialFeatures.closePoll('${tripId}', '${poll.id}')"
                                class="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                title="Cerrar votación"
                            >
                                ✕
                            </button>
                        ` : ''}
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Por ${poll.createdByName} • ${totalVotes} voto(s)
                    </p>

                    <div class="space-y-2">
                        ${poll.options.map((option, idx) => {
                            const percentage = totalVotes > 0 ? (option.votes.length / totalVotes * 100).toFixed(0) : 0;
                            const hasUserVote = option.votes.includes(userId);

                            return `
                                <div class="relative">
                                    <button
                                        onclick="SocialFeatures.voteOption('${tripId}', '${poll.id}', ${idx})"
                                        class="w-full text-left p-3 rounded-lg border-2 transition ${hasUserVote ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40' : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'}"
                                        ${userVoted ? 'disabled' : ''}
                                    >
                                        <div class="flex justify-between items-center relative z-10">
                                            <span class="font-semibold dark:text-white">
                                                ${hasUserVote ? '✓ ' : ''}${option.text}
                                            </span>
                                            <span class="text-sm text-gray-600 dark:text-gray-300">
                                                ${option.votes.length} (${percentage}%)
                                            </span>
                                        </div>
                                    </button>
                                    <div
                                        class="absolute inset-0 bg-blue-200 dark:bg-blue-800 rounded-lg opacity-30 pointer-events-none"
                                        style="width: ${percentage}%"
                                    ></div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    async voteOption(tripId, pollId, optionIndex) {
        if (!auth.currentUser) {
            alert('Debes estar autenticado');
            return;
        }

        try {
            const userId = auth.currentUser.uid;
            const pollRef = doc(db, `trips/${tripId}/polls/${pollId}`);
            const pollSnap = await getDoc(pollRef);

            if (!pollSnap.exists()) return;

            const pollData = pollSnap.data();
            const options = pollData.options;

            // Verificar si ya votó
            const alreadyVoted = options.some(opt => opt.votes.includes(userId));
            if (alreadyVoted) {
                alert('Ya votaste en esta encuesta');
                return;
            }

            // Agregar voto
            options[optionIndex].votes.push(userId);

            await updateDoc(pollRef, { options });
        } catch (error) {
            console.error('Error voting:', error);
            alert('Error al votar');
        }
    },

    async closePoll(tripId, pollId) {
        if (!confirm('¿Cerrar esta votación?')) return;

        try {
            const pollRef = doc(db, `trips/${tripId}/polls/${pollId}`);
            await updateDoc(pollRef, { active: false });
        } catch (error) {
            console.error('Error closing poll:', error);
        }
    },

    // ============================================
    // DIARIO DE VIAJE COLABORATIVO
    // ============================================
    renderJournal() {
        return `
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg border-2 border-green-300 dark:border-green-600">
                    <h4 class="text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                        <span>📔</span>
                        <span>Diario de Viaje Colaborativo</span>
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                        Comparte tus experiencias diarias con el grupo. Cada día, cada persona puede escribir lo que vivió.
                    </p>
                </div>

                <!-- Escribir nueva entrada -->
                <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h5 class="font-bold mb-3 text-gray-800 dark:text-white">✏️ Nueva Entrada</h5>
                    <input
                        id="journalDate"
                        type="date"
                        class="w-full p-3 border rounded-lg mb-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        value="${new Date().toISOString().split('T')[0]}"
                    >
                    <textarea
                        id="journalContent"
                        placeholder="¿Qué hiciste hoy? ¿Qué comiste? ¿Qué fue lo más memorable?"
                        rows="5"
                        class="w-full p-3 border rounded-lg mb-3 dark:bg-gray-700 dark:text-white dark:border-gray-600 resize-none"
                    ></textarea>
                    <button
                        onclick="SocialFeatures.addJournalEntry()"
                        class="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-bold transition shadow-lg"
                    >
                        📝 Guardar Entrada
                    </button>
                </div>

                <!-- Filtros -->
                <div class="flex gap-2 overflow-x-auto">
                    <button
                        onclick="SocialFeatures.filterJournal('all')"
                        class="journal-filter-btn px-4 py-2 rounded-lg font-semibold bg-green-500 text-white"
                        data-filter="all"
                    >
                        Todas
                    </button>
                    <button
                        onclick="SocialFeatures.filterJournal('mine')"
                        class="journal-filter-btn px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        data-filter="mine"
                    >
                        Mis Entradas
                    </button>
                </div>

                <!-- Entradas del diario -->
                <div id="journalEntries" class="space-y-3">
                    <div class="text-center text-gray-400 py-8">
                        Cargando entradas...
                    </div>
                </div>
            </div>
        `;
    },

    currentJournalFilter: 'all',

    async addJournalEntry() {
        const tripId = window.currentTripId || localStorage.getItem('currentTripId');
        if (!tripId || !auth.currentUser) {
            alert('Debes estar autenticado y tener un viaje activo');
            return;
        }

        const dateInput = document.getElementById('journalDate');
        const contentInput = document.getElementById('journalContent');

        const date = dateInput?.value;
        const content = contentInput?.value.trim();

        if (!date || !content) {
            alert('Debes completar la fecha y el contenido');
            return;
        }

        try {
            const entryId = Date.now().toString();
            const entryRef = doc(db, `trips/${tripId}/journal/${entryId}`);

            await setDoc(entryRef, {
                date,
                content,
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName || 'Usuario',
                userPhoto: auth.currentUser.photoURL || null,
                createdAt: serverTimestamp(),
                likes: []
            });

            // Log to timeline
            if (window.logTimelineActivity) {
                window.logTimelineActivity('journal', {
                    description: 'escribió en el diario',
                    preview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
                });
            }

            alert('¡Entrada guardada! 📝');
            contentInput.value = '';

            this.loadJournal();

            // Actualizar logros
            this.checkAndUpdateAchievements(tripId);
        } catch (error) {
            console.error('Error adding journal entry:', error);
            alert('Error al guardar la entrada');
        }
    },

    async loadJournal() {
        const tripId = window.currentTripId || localStorage.getItem('currentTripId');
        const container = document.getElementById('journalEntries');

        if (!container) return;

        if (!auth.currentUser) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-4xl mb-3">🔒</p>
                    <p class="text-gray-600 dark:text-gray-400">Debes estar autenticado</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Inicia sesión para ver y escribir en el diario</p>
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
            const journalRef = collection(db, `trips/${tripId}/journal`);
            const journalQuery = query(journalRef, orderBy('date', 'desc'), orderBy('createdAt', 'desc'));

            // Real-time listener
            const unsubscribe = onSnapshot(journalQuery, (snapshot) => {
                const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                this.renderJournalEntries(entries, tripId);
            });

            this.unsubscribers.push(unsubscribe);
        } catch (error) {
            console.error('Error loading journal:', error);
        }
    },

    renderJournalEntries(entries, tripId) {
        const container = document.getElementById('journalEntries');
        if (!container) return;

        const userId = auth.currentUser?.uid;

        // Filtrar entradas
        let filteredEntries = entries;
        if (this.currentJournalFilter === 'mine') {
            filteredEntries = entries.filter(entry => entry.userId === userId);
        }

        if (filteredEntries.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-4xl mb-3">📔</p>
                    <p class="text-gray-600 dark:text-gray-400">No hay entradas aún</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">¡Sé el primero en escribir!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredEntries.map(entry => {
            const hasLiked = entry.likes?.includes(userId);
            const likeCount = entry.likes?.length || 0;

            return `
                <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div class="flex items-start gap-3 mb-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold">
                            ${entry.userName.charAt(0).toUpperCase()}
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h5 class="font-bold text-gray-800 dark:text-white">${entry.userName}</h5>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">📅 ${entry.date}</p>
                                </div>
                                ${entry.userId === userId ? `
                                    <button
                                        onclick="SocialFeatures.deleteJournalEntry('${tripId}', '${entry.id}')"
                                        class="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                        title="Eliminar entrada"
                                    >
                                        🗑️
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <p class="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">${entry.content}</p>

                    <div class="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <button
                            onclick="SocialFeatures.toggleJournalLike('${tripId}', '${entry.id}')"
                            class="flex items-center gap-1 px-3 py-2 rounded-lg transition ${hasLiked ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}"
                        >
                            <span>${hasLiked ? '❤️' : '🤍'}</span>
                            <span class="text-sm font-semibold">${likeCount}</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    async toggleJournalLike(tripId, entryId) {
        if (!auth.currentUser) {
            alert('Debes estar autenticado');
            return;
        }

        try {
            const userId = auth.currentUser.uid;
            const entryRef = doc(db, `trips/${tripId}/journal/${entryId}`);
            const entrySnap = await getDoc(entryRef);

            if (!entrySnap.exists()) return;

            const currentLikes = entrySnap.data().likes || [];
            const hasLiked = currentLikes.includes(userId);

            if (hasLiked) {
                await updateDoc(entryRef, {
                    likes: currentLikes.filter(id => id !== userId)
                });
            } else {
                await updateDoc(entryRef, {
                    likes: [...currentLikes, userId]
                });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    },

    async deleteJournalEntry(tripId, entryId) {
        if (!confirm('¿Eliminar esta entrada?')) return;

        try {
            const entryRef = doc(db, `trips/${tripId}/journal/${entryId}`);
            await deleteDoc(entryRef);
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Error al eliminar la entrada');
        }
    },

    filterJournal(filter) {
        this.currentJournalFilter = filter;

        // Update button styles
        document.querySelectorAll('.journal-filter-btn').forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.className = 'journal-filter-btn px-4 py-2 rounded-lg font-semibold bg-green-500 text-white';
            } else {
                btn.className = 'journal-filter-btn px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
            }
        });

        this.loadJournal();
    },

    // ============================================
    // Cleanup
    // ============================================
    cleanup() {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
    }
};

// Exportar para uso global
window.SocialFeatures = SocialFeatures;
