// js/travel-twins-matcher.js - AI Matching de viajeros con itinerarios similares

/**
 * Travel Twins Matcher
 * Encuentra tu "gemelo de viaje" - personas con itinerarios similares
 */
export const TravelTwinsMatcher = {
  currentUser: null,
  userTrip: null,
  matches: [],

  /**
   * Inicializa el matcher
   */
  async init(userId, tripData) {
    this.currentUser = userId;
    this.userTrip = tripData;
    console.log('🔍 Travel Twins Matcher iniciado');
  },

  /**
   * Abre el sistema de matching
   */
  async open(tripData) {
    this.userTrip = tripData || window.TripsManager?.currentTrip;

    if (!this.userTrip) {
      window.Notifications?.show('❌ Necesitas un itinerario activo para encontrar Travel Twins', 'error');
      return;
    }

    window.Notifications?.show('🔍 Buscando tu Travel Twin...', 'info');

    await this.findMatches();
    this.showMatchesUI();
  },

  /**
   * Encuentra matches basado en IA
   */
  async findMatches() {
    // Simular búsqueda (en producción: query a Firestore)
    this.matches = this.generateMockMatches();

    // Ordenar por match score
    this.matches.sort((a, b) => b.matchScore - a.matchScore);
  },

  /**
   * Genera matches de prueba (mock)
   */
  generateMockMatches() {
    const mockUsers = [
      {
        id: 'user1',
        username: 'maria_traveler',
        avatar: 'M',
        avatarColor: 'from-purple-400 to-pink-400',
        trip: {
          dates: { start: '2025-02-16', end: '2025-02-24' },
          cities: ['Tokyo', 'Kyoto', 'Osaka'],
          days: 9,
          budget: 480000,
          interests: ['food', 'culture', 'photography'],
          pace: 'moderate'
        },
        preferences: {
          language: 'Spanish',
          age: 28,
          groupSize: 2
        }
      },
      {
        id: 'user2',
        username: 'juan_foodie',
        avatar: 'J',
        avatarColor: 'from-orange-400 to-red-400',
        trip: {
          dates: { start: '2025-02-18', end: '2025-02-26' },
          cities: ['Tokyo', 'Osaka'],
          days: 8,
          budget: 350000,
          interests: ['food', 'nightlife', 'shopping'],
          pace: 'packed'
        },
        preferences: {
          language: 'Spanish',
          age: 32,
          groupSize: 1
        }
      },
      {
        id: 'user3',
        username: 'ana_temples',
        avatar: 'A',
        avatarColor: 'from-green-400 to-teal-400',
        trip: {
          dates: { start: '2025-02-15', end: '2025-02-25' },
          cities: ['Kyoto', 'Nara', 'Tokyo'],
          days: 10,
          budget: 520000,
          interests: ['culture', 'nature', 'history'],
          pace: 'light'
        },
        preferences: {
          language: 'English',
          age: 45,
          groupSize: 2
        }
      },
      {
        id: 'user4',
        username: 'carlos_otaku',
        avatar: 'C',
        avatarColor: 'from-blue-400 to-indigo-400',
        trip: {
          dates: { start: '2025-02-16', end: '2025-02-23' },
          cities: ['Tokyo'],
          days: 7,
          budget: 400000,
          interests: ['anime', 'pop_culture', 'shopping'],
          pace: 'moderate'
        },
        preferences: {
          language: 'Spanish',
          age: 25,
          groupSize: 1
        }
      }
    ];

    // Calcular match score para cada usuario
    return mockUsers.map(user => ({
      ...user,
      matchScore: this.calculateMatchScore(user.trip),
      matchReasons: this.getMatchReasons(user.trip)
    }));
  },

  /**
   * Calcula el score de compatibilidad (0-100)
   */
  calculateMatchScore(otherTrip) {
    let score = 0;
    const userTrip = this.userTrip;

    // 1. Overlap de fechas (30 puntos)
    const dateOverlap = this.calculateDateOverlap(
      userTrip.days?.[0]?.date,
      userTrip.days?.[userTrip.days.length - 1]?.date,
      otherTrip.dates.start,
      otherTrip.dates.end
    );
    score += dateOverlap * 30;

    // 2. Ciudades en común (25 puntos)
    const userCities = [...new Set(userTrip.days?.map(d => d.city))];
    const commonCities = otherTrip.cities.filter(c => userCities.includes(c));
    score += (commonCities.length / Math.max(userCities.length, otherTrip.cities.length)) * 25;

    // 3. Presupuesto similar (15 puntos)
    const budgetDiff = Math.abs(userTrip.budget - otherTrip.budget) / userTrip.budget;
    score += Math.max(0, (1 - budgetDiff) * 15);

    // 4. Intereses compartidos (20 puntos)
    // Simular intereses del usuario
    const userInterests = ['food', 'culture', 'photography'];
    const commonInterests = otherTrip.interests.filter(i => userInterests.includes(i));
    score += (commonInterests.length / Math.max(userInterests.length, otherTrip.interests.length)) * 20;

    // 5. Duración similar (10 puntos)
    const durationDiff = Math.abs((userTrip.days?.length || 0) - otherTrip.days) / (userTrip.days?.length || 1);
    score += Math.max(0, (1 - durationDiff) * 10);

    return Math.round(score);
  },

  /**
   * Calcula overlap de fechas (0-1)
   */
  calculateDateOverlap(start1, end1, start2, end2) {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);

    const overlapStart = s1 > s2 ? s1 : s2;
    const overlapEnd = e1 < e2 ? e1 : e2;

    if (overlapStart > overlapEnd) return 0;

    const overlapDays = (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24);
    const totalDays = Math.max(
      (e1 - s1) / (1000 * 60 * 60 * 24),
      (e2 - s2) / (1000 * 60 * 60 * 24)
    );

    return overlapDays / totalDays;
  },

  /**
   * Genera razones del match
   */
  getMatchReasons(otherTrip) {
    const reasons = [];
    const userTrip = this.userTrip;

    // Fechas
    const dateOverlap = this.calculateDateOverlap(
      userTrip.days?.[0]?.date,
      userTrip.days?.[userTrip.days.length - 1]?.date,
      otherTrip.dates.start,
      otherTrip.dates.end
    );

    if (dateOverlap > 0.8) {
      reasons.push({ icon: '📅', text: 'Mismas fechas de viaje' });
    } else if (dateOverlap > 0.3) {
      reasons.push({ icon: '📅', text: 'Fechas similares' });
    }

    // Ciudades
    const userCities = [...new Set(userTrip.days?.map(d => d.city))];
    const commonCities = otherTrip.cities.filter(c => userCities.includes(c));

    if (commonCities.length > 0) {
      reasons.push({
        icon: '🏙️',
        text: `${commonCities.length} ciudad${commonCities.length > 1 ? 'es' : ''} en común: ${commonCities.join(', ')}`
      });
    }

    // Presupuesto
    const budgetDiff = Math.abs(userTrip.budget - otherTrip.budget) / userTrip.budget;
    if (budgetDiff < 0.2) {
      reasons.push({ icon: '💰', text: 'Presupuesto similar' });
    }

    // Intereses
    const userInterests = ['food', 'culture', 'photography'];
    const commonInterests = otherTrip.interests.filter(i => userInterests.includes(i));

    if (commonInterests.length > 0) {
      reasons.push({
        icon: '⭐',
        text: `Intereses: ${commonInterests.join(', ')}`
      });
    }

    return reasons;
  },

  /**
   * Muestra UI de matches
   */
  showMatchesUI() {
    const topMatches = this.matches.slice(0, 10);

    const modalHTML = `
      <div id="travelTwinsModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-strong flex items-center justify-center p-4 animate-fadeInUp">
        <div class="glass-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col glow-purple hover-lift">

          <!-- Header -->
          <div class="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 gradient-animated p-6 text-white relative overflow-hidden">
            <div class="shimmer absolute inset-0"></div>
            <div class="relative z-10">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-3xl font-bold mb-2">👥 Tu Travel Twin</h2>
                <p class="text-purple-100">Encontramos ${topMatches.length} viajeros compatibles</p>
              </div>
              <button onclick="window.TravelTwinsMatcher.close()" class="text-white hover:bg-white/20 rounded-lg p-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Matches List -->
          <div class="flex-1 overflow-y-auto p-6">
            ${topMatches.length > 0 ? `
              <div class="space-y-4">
                ${topMatches.map((match, i) => this.renderMatchCard(match, i)).join('')}
              </div>
            ` : `
              <div class="text-center py-12">
                <div class="text-6xl mb-4">😢</div>
                <h3 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  No encontramos matches por ahora
                </h3>
                <p class="text-gray-500 dark:text-gray-400">
                  ¡Sé el primero en compartir tu itinerario!
                </p>
              </div>
            `}
          </div>

          <!-- Footer -->
          <div class="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <p class="text-center text-sm text-gray-600 dark:text-gray-400">
              💡 Tip: Conecta con viajeros para compartir tips, hacer meetups o compartir gastos
            </p>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  /**
   * Renderiza una card de match
   */
  renderMatchCard(match, index) {
    const isTopMatch = index === 0;

    return `
      <div class="relative ${isTopMatch ? 'border-3 border-gold' : 'border-2 border-gray-200 dark:border-gray-700'} rounded-xl overflow-hidden hover:shadow-xl transition ${isTopMatch ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'bg-white dark:bg-gray-700'}">

        ${isTopMatch ? `
          <div class="absolute top-2 right-2 z-10">
            <span class="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg">
              👑 BEST MATCH
            </span>
          </div>
        ` : ''}

        <div class="p-6">
          <div class="flex items-start gap-4">

            <!-- Avatar -->
            <div class="relative">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br ${match.avatarColor} flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                ${match.avatar}
              </div>
              <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow">
                ${match.matchScore}%
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">@${match.username}</h3>
                ${match.preferences.language === 'Spanish' ? '<span class="text-sm">🇪🇸</span>' : '<span class="text-sm">🇬🇧</span>'}
              </div>

              <!-- Trip Info -->
              <div class="flex flex-wrap gap-2 mb-3">
                <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold">
                  📅 ${match.trip.dates.start} → ${match.trip.dates.end}
                </span>
                <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full text-xs font-semibold">
                  🏙️ ${match.trip.cities.join(' → ')}
                </span>
                <span class="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold">
                  💰 ¥${Math.round(match.trip.budget/1000)}K
                </span>
              </div>

              <!-- Match Reasons -->
              <div class="space-y-1 mb-4">
                ${match.matchReasons.slice(0, 3).map(reason => `
                  <div class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span>${reason.icon}</span>
                    <span>${reason.text}</span>
                  </div>
                `).join('')}
              </div>

              <!-- Actions -->
              <div class="flex gap-2">
                <button onclick="window.TravelTwinsMatcher.sendMessage('${match.id}')"
                        class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition">
                  💬 Enviar Mensaje
                </button>
                <button onclick="window.TravelTwinsMatcher.viewTrip('${match.id}')"
                        class="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold rounded-lg transition">
                  👁️ Ver Viaje
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- Progress Bar -->
        <div class="h-2 bg-gray-200 dark:bg-gray-600">
          <div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
               style="width: ${match.matchScore}%"></div>
        </div>

      </div>
    `;
  },

  /**
   * Envía mensaje a un match
   */
  sendMessage(userId) {
    window.Notifications?.show('💬 Abriendo chat...', 'info');

    // TODO: Integrar con sistema de mensajería
    setTimeout(() => {
      const messageHTML = `
        <div id="chatModal" class="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
            <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">💬 Enviar Mensaje</h3>

            <textarea id="messageText" rows="4"
                      placeholder="Hola! Vi que tenemos itinerarios similares..."
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 dark:bg-gray-700 dark:text-white"></textarea>

            <div class="flex gap-3">
              <button onclick="window.TravelTwinsMatcher.confirmSendMessage('${userId}')"
                      class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg">
                ✉️ Enviar
              </button>
              <button onclick="document.getElementById('chatModal').remove()"
                      class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }, 500);
  },

  /**
   * Confirma envío de mensaje
   */
  confirmSendMessage(userId) {
    const text = document.getElementById('messageText')?.value;

    if (!text?.trim()) {
      window.Notifications?.show('❌ Escribe un mensaje', 'error');
      return;
    }

    // TODO: Guardar mensaje en Firestore
    window.Notifications?.show('✅ Mensaje enviado!', 'success');
    document.getElementById('chatModal')?.remove();
  },

  /**
   * Ver itinerario de un match
   */
  viewTrip(userId) {
    window.Notifications?.show('👁️ Cargando itinerario...', 'info');

    // TODO: Cargar itinerario real desde Firestore
    setTimeout(() => {
      window.Notifications?.show('✅ Itinerario cargado', 'success');
    }, 1000);
  },

  /**
   * Cierra el modal
   */
  close() {
    document.getElementById('travelTwinsModal')?.remove();
  }
};

// Exportar globalmente
window.TravelTwinsMatcher = TravelTwinsMatcher;

console.log('✅ Travel Twins Matcher loaded');

export default TravelTwinsMatcher;
