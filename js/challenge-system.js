/**
 * #MyJapanIn60Seconds Challenge System
 * Sistema de desafíos virales donde usuarios crean videos de 60 segundos sobre su viaje
 */

class ChallengeSystem {
  constructor() {
    this.currentUser = null;
    this.activeChallenges = [];
    this.submissions = [];
    this.userSubmissions = [];

    // Categorías de challenges
    this.CATEGORIES = {
      funny: { name: 'Divertido', icon: '😂', color: 'yellow' },
      emotional: { name: 'Emocional', icon: '❤️', color: 'red' },
      foodie: { name: 'Foodie', icon: '🍜', color: 'orange' },
      adventure: { name: 'Aventura', icon: '⛰️', color: 'green' },
      culture: { name: 'Cultural', icon: '⛩️', color: 'purple' },
      aesthetic: { name: 'Aesthetic', icon: '🌸', color: 'pink' },
      hidden: { name: 'Hidden Gems', icon: '💎', color: 'blue' },
      timelapse: { name: 'Time-lapse', icon: '⏱️', color: 'indigo' }
    };

    // Badges/premios
    this.BADGES = {
      first_submission: { name: 'Primera Vez', icon: '🎬', description: 'Primera submission' },
      viral_video: { name: 'Viral', icon: '🔥', description: '+1000 votos' },
      weekly_winner: { name: 'Ganador Semanal', icon: '🏆', description: 'Ganaste un challenge semanal' },
      creative: { name: 'Creativo', icon: '🎨', description: 'Video con +500 votos' },
      consistent: { name: 'Consistente', icon: '⭐', description: '5+ submissions' },
      trending: { name: 'Trending', icon: '📈', description: 'En top 10 trending' }
    };

    this.initMockData();
  }

  /**
   * Inicializa datos mock para desarrollo
   */
  initMockData() {
    // Challenges activos
    this.activeChallenges = [
      {
        id: 'ch1',
        title: 'Tu primer vending machine experience',
        description: 'Muéstranos la reacción al probar algo de un vending machine japonés',
        category: 'funny',
        startDate: '2025-01-27',
        endDate: '2025-02-03',
        prize: '50€ Amazon Gift Card',
        participants: 342,
        submissions: 156,
        status: 'active',
        trending: true,
        prompt: 'Graba tu reacción probando algo random de un vending machine',
        hashtags: ['#MyJapanIn60Seconds', '#VendingMachine', '#JapanTrip'],
        rules: [
          'Máximo 60 segundos',
          'Contenido original',
          'Debe ser en Japón',
          'Sin música con copyright'
        ]
      },
      {
        id: 'ch2',
        title: 'El momento que te enamoraste de Japón',
        description: 'Ese momento específico donde dijiste "wow, amo este país"',
        category: 'emotional',
        startDate: '2025-01-25',
        endDate: '2025-02-01',
        prize: 'Featured en Instagram oficial',
        participants: 523,
        submissions: 289,
        status: 'active',
        trending: true,
        prompt: 'Captura el momento exacto que te enamoraste de Japón',
        hashtags: ['#MyJapanIn60Seconds', '#JapanLove', '#TravelMagic'],
        rules: [
          'Máximo 60 segundos',
          'Voz en off opcional',
          'Música japonesa recomendada'
        ]
      },
      {
        id: 'ch3',
        title: 'Ramen crawl en 60 segundos',
        description: 'Muestra 5+ ramen shops diferentes en un minuto',
        category: 'foodie',
        startDate: '2025-01-20',
        endDate: '2025-01-27',
        prize: '30€ Ramen voucher',
        participants: 198,
        submissions: 87,
        status: 'ending_soon',
        trending: false,
        prompt: 'Speed-run de ramen shops con tus ratings',
        hashtags: ['#MyJapanIn60Seconds', '#RamenCrawl', '#Foodie'],
        rules: [
          'Mínimo 5 ramen shops',
          'Muestra el ramen de cada uno',
          'Rating opcional'
        ]
      },
      {
        id: 'ch4',
        title: 'Hidden Tokyo: lugares que no están en Google',
        description: 'Muestra esos lugares secretos que descubriste por accidente',
        category: 'hidden',
        startDate: '2025-01-28',
        endDate: '2025-02-04',
        prize: 'Travel guidebook personalizado',
        participants: 156,
        submissions: 45,
        status: 'new',
        trending: true,
        prompt: 'Esos hidden spots que no encontrarías en Google Maps',
        hashtags: ['#MyJapanIn60Seconds', '#HiddenTokyo', '#SecretSpots'],
        rules: [
          'Solo lugares no-turísticos',
          'Incluye ubicación aproximada',
          'Explica cómo lo encontraste'
        ]
      }
    ];

    // Submissions de ejemplo
    this.submissions = [
      {
        id: 'sub1',
        challengeId: 'ch2',
        userId: 'user1',
        username: 'maria_traveler',
        avatar: 'M',
        avatarColor: 'from-purple-400 to-pink-400',
        title: 'Atardecer en Fushimi Inari',
        description: 'Estaba sola en el camino de toriis al atardecer... silencio absoluto',
        videoUrl: '', // Placeholder
        thumbnailEmoji: '⛩️🌅',
        uploadDate: '2025-01-26',
        votes: 1247,
        views: 8934,
        comments: 156,
        isUserVoted: false,
        trending: true,
        badges: ['viral_video'],
        duration: 58,
        location: 'Kyoto, Fushimi Inari',
        tags: ['sunset', 'peaceful', 'spiritual']
      },
      {
        id: 'sub2',
        challengeId: 'ch1',
        userId: 'user2',
        username: 'carlos_adventures',
        avatar: 'C',
        avatarColor: 'from-blue-400 to-cyan-400',
        title: 'Hot ramen can??? 🤯',
        description: 'No sabía que existían latas de ramen CALIENTE en vending machines',
        videoUrl: '',
        thumbnailEmoji: '🍜🤖',
        uploadDate: '2025-01-27',
        votes: 892,
        views: 5621,
        comments: 89,
        isUserVoted: true,
        trending: true,
        badges: ['creative'],
        duration: 45,
        location: 'Tokyo, Akihabara',
        tags: ['funny', 'surprise', 'food']
      },
      {
        id: 'sub3',
        challengeId: 'ch3',
        userId: 'user3',
        username: 'ramen_hunter',
        avatar: 'R',
        avatarColor: 'from-orange-400 to-red-400',
        title: '7 ramens en 60 segundos',
        description: 'Mi ramen marathon por Shibuya',
        videoUrl: '',
        thumbnailEmoji: '🍜💨',
        uploadDate: '2025-01-25',
        votes: 2103,
        views: 15420,
        comments: 234,
        isUserVoted: false,
        trending: true,
        badges: ['viral_video', 'creative'],
        duration: 60,
        location: 'Tokyo, Shibuya',
        tags: ['foodie', 'ramen', 'speedrun']
      },
      {
        id: 'sub4',
        challengeId: 'ch4',
        userId: 'user4',
        username: 'exploradora_japan',
        avatar: 'E',
        avatarColor: 'from-green-400 to-teal-400',
        title: 'Callejón de gatos en Yanaka',
        description: 'Este callejón lleno de gatos que encontré perdida en Yanaka',
        videoUrl: '',
        thumbnailEmoji: '🐱🏮',
        uploadDate: '2025-01-28',
        votes: 456,
        views: 2341,
        comments: 67,
        isUserVoted: false,
        trending: false,
        badges: [],
        duration: 52,
        location: 'Tokyo, Yanaka',
        tags: ['cats', 'hidden', 'local']
      }
    ];

    // Usuario actual mock
    this.currentUser = {
      id: 'currentUser',
      username: 'tu_viaje',
      avatar: 'T',
      avatarColor: 'from-pink-400 to-purple-400',
      submissions: 2,
      totalVotes: 345,
      badges: ['first_submission', 'consistent']
    };

    // Submissions del usuario actual
    this.userSubmissions = [
      {
        id: 'mySubmission1',
        challengeId: 'ch1',
        title: 'Probando hot coffee del futuro',
        votes: 234,
        status: 'active',
        uploadDate: '2025-01-26'
      },
      {
        id: 'mySubmission2',
        challengeId: 'ch2',
        title: 'Mi primer onsen experience',
        votes: 111,
        status: 'active',
        uploadDate: '2025-01-24'
      }
    ];
  }

  /**
   * Abre el sistema de challenges
   */
  open() {
    const modal = document.createElement('div');
    modal.id = 'challengeSystemModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4';

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold mb-2">#MyJapanIn60Seconds</h2>
              <p class="text-white/90">Comparte tu viaje en videos de 60 segundos 🎬</p>
            </div>
            <button onclick="window.challengeSystem?.close()" class="text-white hover:bg-white/20 rounded-lg p-2 transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- User Stats -->
          <div class="mt-4 flex gap-4">
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.currentUser.submissions}</div>
              <div class="text-sm text-white/80">Videos</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.currentUser.totalVotes}</div>
              <div class="text-sm text-white/80">Votos</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div class="text-2xl font-bold">${this.currentUser.badges.length}</div>
              <div class="text-sm text-white/80">Badges</div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700">
          <div class="flex">
            <button onclick="window.challengeSystem?.showTab('challenges')"
                    id="tab-challenges"
                    class="px-6 py-3 font-medium border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 tab-button">
              🏆 Challenges Activos
            </button>
            <button onclick="window.challengeSystem?.showTab('trending')"
                    id="tab-trending"
                    class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button">
              🔥 Trending
            </button>
            <button onclick="window.challengeSystem?.showTab('myvideos')"
                    id="tab-myvideos"
                    class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button">
              📹 Mis Videos
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6" id="challengeContent">
          ${this.renderChallengesTab()}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Renderiza tab de challenges activos
   */
  renderChallengesTab() {
    return `
      <div class="space-y-6">
        <!-- Filter by category -->
        <div class="flex gap-2 flex-wrap">
          <button onclick="window.challengeSystem?.filterByCategory('all')"
                  class="px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium text-sm">
            Todos
          </button>
          ${Object.entries(this.CATEGORIES).map(([key, cat]) => `
            <button onclick="window.challengeSystem?.filterByCategory('${key}')"
                    class="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium text-sm transition-all">
              ${cat.icon} ${cat.name}
            </button>
          `).join('')}
        </div>

        <!-- Challenges Grid -->
        <div class="grid md:grid-cols-2 gap-6" id="challengesGrid">
          ${this.activeChallenges.map(challenge => this.renderChallengeCard(challenge)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Renderiza una card de challenge
   */
  renderChallengeCard(challenge) {
    const category = this.CATEGORIES[challenge.category];
    const daysLeft = Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24));

    let statusBadge = '';
    if (challenge.status === 'new') {
      statusBadge = '<span class="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">🆕 Nuevo</span>';
    } else if (challenge.status === 'ending_soon') {
      statusBadge = '<span class="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">⏰ Termina pronto</span>';
    }

    return `
      <div class="bg-gradient-to-br from-${category.color}-50 to-white dark:from-${category.color}-900/20 dark:to-gray-800 rounded-xl p-6 border-2 border-${category.color}-200 dark:border-${category.color}-800 hover:shadow-xl transition-all cursor-pointer"
           onclick="window.challengeSystem?.openChallenge('${challenge.id}')">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="text-3xl">${category.icon}</div>
            <div>
              <div class="font-bold text-gray-900 dark:text-white">${challenge.title}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">${category.name}</div>
            </div>
          </div>
          ${challenge.trending ? '<div class="text-2xl">🔥</div>' : ''}
        </div>

        <!-- Status badges -->
        <div class="flex gap-2 mb-4">
          ${statusBadge}
          ${challenge.trending ? '<span class="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">📈 Trending</span>' : ''}
        </div>

        <!-- Description -->
        <p class="text-gray-700 dark:text-gray-300 mb-4">${challenge.description}</p>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <div class="font-bold text-lg text-${category.color}-600 dark:text-${category.color}-400">${challenge.participants}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Participantes</div>
          </div>
          <div class="text-center">
            <div class="font-bold text-lg text-${category.color}-600 dark:text-${category.color}-400">${challenge.submissions}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Videos</div>
          </div>
          <div class="text-center">
            <div class="font-bold text-lg text-${category.color}-600 dark:text-${category.color}-400">${daysLeft}d</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Restantes</div>
          </div>
        </div>

        <!-- Prize -->
        <div class="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <div class="flex items-center gap-2">
            <span class="text-xl">🏆</span>
            <div>
              <div class="text-xs text-yellow-700 dark:text-yellow-400 font-medium">Premio</div>
              <div class="text-sm font-bold text-yellow-900 dark:text-yellow-300">${challenge.prize}</div>
            </div>
          </div>
        </div>

        <!-- CTA Button -->
        <button onclick="window.challengeSystem?.openChallenge('${challenge.id}'); event.stopPropagation();"
                class="w-full bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 hover:from-${category.color}-600 hover:to-${category.color}-700 text-white font-medium py-3 rounded-lg transition-all">
          Ver Challenge →
        </button>
      </div>
    `;
  }

  /**
   * Renderiza tab de trending videos
   */
  renderTrendingTab() {
    const trendingSubmissions = this.submissions
      .filter(s => s.trending)
      .sort((a, b) => b.votes - a.votes);

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">🔥 Videos Trending</h3>
          <div class="flex gap-2">
            <button class="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg font-medium text-sm">
              Hoy
            </button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm">
              Esta semana
            </button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm">
              Todo el tiempo
            </button>
          </div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${trendingSubmissions.map((sub, index) => this.renderSubmissionCard(sub, index + 1)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Renderiza una card de submission
   */
  renderSubmissionCard(submission, rank = null) {
    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700"
           onclick="window.challengeSystem?.viewSubmission('${submission.id}')">
        <!-- Video thumbnail -->
        <div class="relative bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 aspect-video flex items-center justify-center">
          <div class="text-6xl">${submission.thumbnailEmoji}</div>
          ${rank ? `<div class="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full font-bold text-sm">#${rank}</div>` : ''}
          <div class="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">${submission.duration}s</div>
          ${submission.trending ? '<div class="absolute top-2 right-2 text-2xl">🔥</div>' : ''}

          <!-- Play button overlay -->
          <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div class="bg-white rounded-full p-4">
              <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <!-- User info -->
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br ${submission.avatarColor} flex items-center justify-center text-white font-bold text-sm">
              ${submission.avatar}
            </div>
            <div class="flex-1">
              <div class="font-medium text-gray-900 dark:text-white text-sm">@${submission.username}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">${submission.location}</div>
            </div>
          </div>

          <!-- Title -->
          <h4 class="font-bold text-gray-900 dark:text-white mb-2">${submission.title}</h4>

          <!-- Description -->
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">${submission.description}</p>

          <!-- Tags -->
          <div class="flex gap-1 flex-wrap mb-3">
            ${submission.tags.slice(0, 3).map(tag => `
              <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                #${tag}
              </span>
            `).join('')}
          </div>

          <!-- Stats -->
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-4">
              <button onclick="window.challengeSystem?.voteSubmission('${submission.id}'); event.stopPropagation();"
                      class="flex items-center gap-1 ${submission.isUserVoted ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'} hover:text-purple-600 transition-colors">
                <svg class="w-5 h-5" fill="${submission.isUserVoted ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                <span class="font-medium">${submission.votes}</span>
              </button>

              <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <span class="font-medium">${submission.views}</span>
              </div>

              <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                </svg>
                <span class="font-medium">${submission.comments}</span>
              </div>
            </div>

            ${submission.badges.length > 0 ? `
              <div class="flex gap-1">
                ${submission.badges.map(badgeId => `
                  <span class="text-lg" title="${this.BADGES[badgeId]?.name}">${this.BADGES[badgeId]?.icon}</span>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza tab de mis videos
   */
  renderMyVideosTab() {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">📹 Mis Videos</h3>
          <button onclick="window.challengeSystem?.uploadVideo()"
                  class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all shadow-lg">
            ➕ Subir nuevo video
          </button>
        </div>

        <!-- Badges -->
        <div class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-800">
          <h4 class="font-bold text-gray-900 dark:text-white mb-4">🏆 Tus Badges</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            ${this.currentUser.badges.map(badgeId => {
              const badge = this.BADGES[badgeId];
              return `
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border-2 border-yellow-300 dark:border-yellow-700">
                  <div class="text-4xl mb-2">${badge.icon}</div>
                  <div class="font-medium text-gray-900 dark:text-white text-sm">${badge.name}</div>
                  <div class="text-xs text-gray-600 dark:text-gray-400">${badge.description}</div>
                </div>
              `;
            }).join('')}

            <!-- Locked badges -->
            ${Object.entries(this.BADGES)
              .filter(([id]) => !this.currentUser.badges.includes(id))
              .slice(0, 3)
              .map(([id, badge]) => `
                <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center opacity-50">
                  <div class="text-4xl mb-2 filter grayscale">🔒</div>
                  <div class="font-medium text-gray-900 dark:text-white text-sm">${badge.name}</div>
                  <div class="text-xs text-gray-600 dark:text-gray-400">${badge.description}</div>
                </div>
              `).join('')}
          </div>
        </div>

        <!-- User's submissions -->
        <div class="space-y-4">
          <h4 class="font-bold text-gray-900 dark:text-white">Tus Submissions</h4>
          ${this.userSubmissions.length > 0 ? `
            <div class="grid md:grid-cols-2 gap-4">
              ${this.userSubmissions.map(sub => `
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <h5 class="font-bold text-gray-900 dark:text-white mb-1">${sub.title}</h5>
                      <div class="text-sm text-gray-600 dark:text-gray-400">
                        Challenge: ${this.activeChallenges.find(c => c.id === sub.challengeId)?.title}
                      </div>
                    </div>
                    <span class="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                      ${sub.status === 'active' ? '✓ Activo' : ''}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="text-center bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${sub.votes}</div>
                      <div class="text-xs text-gray-600 dark:text-gray-400">Votos</div>
                    </div>
                    <div class="text-center bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3">
                      <div class="text-sm text-gray-600 dark:text-gray-400">${sub.uploadDate}</div>
                      <div class="text-xs text-gray-600 dark:text-gray-400">Subido</div>
                    </div>
                  </div>

                  <div class="flex gap-2">
                    <button onclick="window.challengeSystem?.viewSubmission('${sub.id}')"
                            class="flex-1 px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg font-medium text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-all">
                      👁️ Ver
                    </button>
                    <button onclick="window.challengeSystem?.shareSubmission('${sub.id}')"
                            class="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg font-medium text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-all">
                      📤 Compartir
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div class="text-6xl mb-4">🎬</div>
              <p class="text-gray-600 dark:text-gray-400 mb-4">Aún no has subido ningún video</p>
              <button onclick="window.challengeSystem?.uploadVideo()"
                      class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all">
                Subir tu primer video
              </button>
            </div>
          `}
        </div>
      </div>
    `;
  }

  /**
   * Cambia de tab
   */
  showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.className = 'px-6 py-3 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 tab-button';
    });

    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
      activeTab.className = 'px-6 py-3 font-medium border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 tab-button';
    }

    // Update content
    const content = document.getElementById('challengeContent');
    if (!content) return;

    switch(tabName) {
      case 'challenges':
        content.innerHTML = this.renderChallengesTab();
        break;
      case 'trending':
        content.innerHTML = this.renderTrendingTab();
        break;
      case 'myvideos':
        content.innerHTML = this.renderMyVideosTab();
        break;
    }
  }

  /**
   * Filtra challenges por categoría
   */
  filterByCategory(category) {
    // TODO: Implementar filtro
    console.log('Filter by category:', category);
  }

  /**
   * Abre detalle de un challenge
   */
  openChallenge(challengeId) {
    const challenge = this.activeChallenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const category = this.CATEGORIES[challenge.category];
    const daysLeft = Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    const submissions = this.submissions.filter(s => s.challengeId === challengeId);

    const modal = document.createElement('div');
    modal.id = 'challengeDetailModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4';

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 text-white p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="text-5xl">${category.icon}</div>
              <div>
                <h2 class="text-3xl font-bold mb-1">${challenge.title}</h2>
                <p class="text-white/90">${challenge.description}</p>
              </div>
            </div>
            <button onclick="document.getElementById('challengeDetailModal')?.remove()"
                    class="text-white hover:bg-white/20 rounded-lg p-2 transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-4 gap-4">
            <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div class="text-2xl font-bold">${challenge.participants}</div>
              <div class="text-sm text-white/80">Participantes</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div class="text-2xl font-bold">${challenge.submissions}</div>
              <div class="text-sm text-white/80">Videos</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div class="text-2xl font-bold">${daysLeft}</div>
              <div class="text-sm text-white/80">Días restantes</div>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div class="text-lg font-bold">🏆</div>
              <div class="text-xs text-white/80">Premio</div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Prize -->
          <div class="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <div class="flex items-center gap-4">
              <div class="text-5xl">🏆</div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-yellow-900 dark:text-yellow-300 mb-1">Premio</h3>
                <p class="text-yellow-800 dark:text-yellow-400 text-lg">${challenge.prize}</p>
              </div>
            </div>
          </div>

          <!-- Prompt -->
          <div class="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">💡 Prompt del Challenge</h3>
            <p class="text-gray-700 dark:text-gray-300">${challenge.prompt}</p>
          </div>

          <!-- Rules -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 class="font-bold text-gray-900 dark:text-white mb-3">📋 Reglas</h3>
            <ul class="space-y-2">
              ${challenge.rules.map(rule => `
                <li class="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span class="text-blue-500 mt-1">✓</span>
                  <span>${rule}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Hashtags -->
          <div class="bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-xl p-6">
            <h3 class="font-bold text-gray-900 dark:text-white mb-3">🏷️ Hashtags Recomendados</h3>
            <div class="flex flex-wrap gap-2">
              ${challenge.hashtags.map(tag => `
                <span class="px-4 py-2 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 rounded-full font-medium">
                  ${tag}
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Top Submissions -->
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-4">🔥 Top Submissions</h3>
            <div class="grid md:grid-cols-2 gap-4">
              ${submissions.slice(0, 4).map(sub => this.renderSubmissionCard(sub)).join('')}
            </div>
          </div>
        </div>

        <!-- Footer CTA -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-6">
          <button onclick="window.challengeSystem?.participateInChallenge('${challengeId}')"
                  class="w-full bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 hover:from-${category.color}-600 hover:to-${category.color}-700 text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg">
            🎬 Participar en este Challenge
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Participar en un challenge (subir video)
   */
  participateInChallenge(challengeId) {
    const challenge = this.activeChallenges.find(c => c.id === challengeId);
    if (!challenge) return;

    // Close detail modal
    document.getElementById('challengeDetailModal')?.remove();

    // Open upload form
    this.uploadVideo(challengeId);
  }

  /**
   * Formulario para subir video
   */
  uploadVideo(challengeId = null) {
    const modal = document.createElement('div');
    modal.id = 'uploadVideoModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4';

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold mb-1">🎬 Subir Video</h2>
              <p class="text-white/90">Comparte tu Japan moment en 60 segundos</p>
            </div>
            <button onclick="document.getElementById('uploadVideoModal')?.remove()"
                    class="text-white hover:bg-white/20 rounded-lg p-2 transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Form -->
        <div class="flex-1 overflow-y-auto p-6">
          <form class="space-y-4" onsubmit="window.challengeSystem?.submitVideo(event, '${challengeId || ''}')">
            <!-- Challenge selection -->
            ${!challengeId ? `
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Challenge *
                </label>
                <select required
                        class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 dark:text-white">
                  <option value="">Selecciona un challenge...</option>
                  ${this.activeChallenges.filter(c => c.status !== 'ended').map(c => `
                    <option value="${c.id}">${c.title}</option>
                  `).join('')}
                </select>
              </div>
            ` : `
              <div class="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div class="text-sm text-purple-700 dark:text-purple-400 font-medium">Challenge seleccionado:</div>
                <div class="font-bold text-gray-900 dark:text-white">${this.activeChallenges.find(c => c.id === challengeId)?.title}</div>
              </div>
            `}

            <!-- Video upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video (max 60 segundos) *
              </label>
              <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-all cursor-pointer">
                <input type="file" accept="video/*" required class="hidden" id="videoInput">
                <label for="videoInput" class="cursor-pointer">
                  <div class="text-5xl mb-2">📹</div>
                  <div class="text-gray-700 dark:text-gray-300 font-medium">Click para subir video</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">MP4, MOV hasta 100MB</div>
                </label>
              </div>
            </div>

            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título *
              </label>
              <input type="text"
                     required
                     placeholder="Dale un título pegajoso a tu video..."
                     class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 dark:text-white">
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción *
              </label>
              <textarea required
                        rows="3"
                        placeholder="Cuenta la historia detrás del video..."
                        class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 dark:text-white"></textarea>
            </div>

            <!-- Location -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ubicación *
              </label>
              <input type="text"
                     required
                     placeholder="Tokyo, Shibuya"
                     class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 dark:text-white">
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (separados por coma)
              </label>
              <input type="text"
                     placeholder="ramen, adventure, tokyo..."
                     class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 dark:text-white">
            </div>

            <!-- Submit -->
            <button type="submit"
                    class="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg">
              🚀 Publicar Video
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Envía el video
   */
  submitVideo(event, challengeId) {
    event.preventDefault();

    // TODO: Implementar upload a Firebase Storage + crear documento en Firestore

    alert('🎉 Video subido exitosamente!\n\n¡Buena suerte en el challenge!');
    document.getElementById('uploadVideoModal')?.remove();

    // Refresh tab
    this.showTab('myvideos');
  }

  /**
   * Vota por una submission
   */
  voteSubmission(submissionId) {
    const submission = this.submissions.find(s => s.id === submissionId);
    if (!submission) return;

    submission.isUserVoted = !submission.isUserVoted;
    submission.votes += submission.isUserVoted ? 1 : -1;

    // TODO: Guardar voto en Firestore

    // Re-render current tab
    const activeTab = document.querySelector('.tab-button.border-purple-500');
    if (activeTab) {
      const tabId = activeTab.id.replace('tab-', '');
      this.showTab(tabId);
    }
  }

  /**
   * Ver detalle de una submission
   */
  viewSubmission(submissionId) {
    // TODO: Implementar modal con video player
    console.log('View submission:', submissionId);
    alert('Video player coming soon! 🎬');
  }

  /**
   * Compartir submission
   */
  shareSubmission(submissionId) {
    const submission = this.submissions.find(s => s.id === submissionId) ||
                      this.userSubmissions.find(s => s.id === submissionId);
    if (!submission) return;

    const shareText = `🎬 Check out my #MyJapanIn60Seconds video: "${submission.title}"!\n\n`;
    const shareUrl = `${window.location.origin}/challenge/${submissionId}`;

    if (navigator.share) {
      navigator.share({
        title: submission.title,
        text: shareText,
        url: shareUrl
      }).catch(err => console.log('Share cancelled'));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText + shareUrl);
      alert('✓ Link copiado al portapapeles!');
    }
  }

  /**
   * Cierra el sistema
   */
  close() {
    document.getElementById('challengeSystemModal')?.remove();
    document.getElementById('challengeDetailModal')?.remove();
    document.getElementById('uploadVideoModal')?.remove();
  }
}

// Exportar globalmente
window.ChallengeSystem = ChallengeSystem;

console.log('✅ Challenge System loaded');

export default ChallengeSystem;
