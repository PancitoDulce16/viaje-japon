/**
 * 🏆 SISTEMA DE GAMIFICACIÓN Y BADGES
 *
 * Sistema de logros, puntos y niveles para motivar a los usuarios
 * a explorar todas las funcionalidades de la app.
 *
 * Features:
 * - 20+ badges desbloqueables
 * - Sistema de puntos (XP)
 * - 6 niveles de viajero
 * - Notificaciones de logros
 * - Persistencia en Firebase
 */

class GamificationSystem {
  constructor() {
    this.userId = null;
    this.userStats = null;

    // Definición de badges
    this.badges = {
      // 🎯 Badges de Inicio
      firstTrip: {
        id: 'firstTrip',
        name: 'Primer Viaje',
        description: 'Creaste tu primer viaje',
        icon: '🎫',
        points: 50,
        condition: (stats) => stats.tripsCreated >= 1
      },

      firstItinerary: {
        id: 'firstItinerary',
        name: 'Planificador Novato',
        description: 'Generaste tu primer itinerario inteligente',
        icon: '🗺️',
        points: 100,
        condition: (stats) => stats.itinerariesGenerated >= 1
      },

      // 🎨 Badges de Personalización
      hybridCreator: {
        id: 'hybridCreator',
        name: 'Creador Híbrido',
        description: 'Creaste un itinerario híbrido personalizado',
        icon: '🎨',
        points: 150,
        condition: (stats) => stats.hybridsCreated >= 1
      },

      customizer: {
        id: 'customizer',
        name: 'Personalizador Experto',
        description: 'Editaste actividades en 5 días diferentes',
        icon: '✏️',
        points: 200,
        condition: (stats) => stats.daysEdited >= 5
      },

      // 💰 Badges de Gestión
      budgetMaster: {
        id: 'budgetMaster',
        name: 'Maestro del Presupuesto',
        description: 'Registraste gastos en 3 categorías diferentes',
        icon: '💰',
        points: 150,
        condition: (stats) => stats.expenseCategories >= 3
      },

      frugalTraveler: {
        id: 'frugalTraveler',
        name: 'Viajero Económico',
        description: 'Mantuviste el presupuesto bajo control',
        icon: '🏦',
        points: 200,
        condition: (stats) => stats.budgetKept >= 1
      },

      // 📊 Badges de Exploración
      explorer: {
        id: 'explorer',
        name: 'Explorador Curioso',
        description: 'Generaste itinerarios para 3 ciudades diferentes',
        icon: '🧭',
        points: 250,
        condition: (stats) => stats.citiesExplored >= 3
      },

      variations: {
        id: 'variations',
        name: 'Indeciso Creativo',
        description: 'Comparaste variaciones 5 veces',
        icon: '🔄',
        points: 100,
        condition: (stats) => stats.variationsCompared >= 5
      },

      // 📤 Badges de Compartir
      exporter: {
        id: 'exporter',
        name: 'Organizador Pro',
        description: 'Exportaste tu itinerario en 3 formatos diferentes',
        icon: '📤',
        points: 150,
        condition: (stats) => stats.exportFormats >= 3
      },

      sharer: {
        id: 'sharer',
        name: 'Espíritu Colaborativo',
        description: 'Compartiste un viaje con otros usuarios',
        icon: '🤝',
        points: 200,
        condition: (stats) => stats.tripsShared >= 1
      },

      // 📝 Badges de Contenido
      notekeeper: {
        id: 'notekeeper',
        name: 'Cronista Viajero',
        description: 'Agregaste notas a 10 actividades',
        icon: '📝',
        points: 150,
        condition: (stats) => stats.notesAdded >= 10
      },

      photographer: {
        id: 'photographer',
        name: 'Fotógrafo Entusiasta',
        description: 'Agregaste 20 fotos a tus viajes',
        icon: '📷',
        points: 200,
        condition: (stats) => stats.photosAdded >= 20
      },

      // 🎯 Badges Avanzados
      marathoner: {
        id: 'marathoner',
        name: 'Maratonista Cultural',
        description: 'Creaste un itinerario con más de 30 actividades',
        icon: '🏃',
        points: 300,
        condition: (stats) => stats.maxActivitiesInTrip >= 30
      },

      weekWarrior: {
        id: 'weekWarrior',
        name: 'Guerrero de la Semana',
        description: 'Planificaste un viaje de 7+ días',
        icon: '📅',
        points: 250,
        condition: (stats) => stats.maxTripDays >= 7
      },

      diversity: {
        id: 'diversity',
        name: 'Polímata Viajero',
        description: 'Visitaste 10 categorías diferentes de lugares',
        icon: '🎭',
        points: 350,
        condition: (stats) => stats.categoryDiversity >= 10
      },

      // 🔥 Badges de Streak
      consistent: {
        id: 'consistent',
        name: 'Planificador Consistente',
        description: 'Usaste la app 5 días seguidos',
        icon: '🔥',
        points: 300,
        condition: (stats) => stats.loginStreak >= 5
      },

      dedicated: {
        id: 'dedicated',
        name: 'Viajero Dedicado',
        description: 'Usaste la app 30 días en total',
        icon: '⭐',
        points: 500,
        condition: (stats) => stats.totalDaysUsed >= 30
      },

      // 🏆 Badges Maestros
      completionist: {
        id: 'completionist',
        name: 'Completista',
        description: 'Completaste todas las secciones de un viaje',
        icon: '✅',
        points: 400,
        condition: (stats) => stats.completedTrips >= 1
      },

      sensei: {
        id: 'sensei',
        name: 'Sensei del Itinerario',
        description: 'Alcanzaste el nivel máximo',
        icon: '🥋',
        points: 1000,
        condition: (stats) => stats.level >= 6
      },

      legend: {
        id: 'legend',
        name: 'Leyenda Viajera',
        description: 'Desbloqueaste todos los badges',
        icon: '👑',
        points: 2000,
        condition: (stats) => stats.badgesUnlocked >= 19 // Todos menos este
      }
    };

    // Niveles de viajero
    this.levels = [
      { level: 1, name: 'Turista Novato', minXP: 0, icon: '🌱', color: 'gray' },
      { level: 2, name: 'Viajero Curioso', minXP: 500, icon: '🗺️', color: 'blue' },
      { level: 3, name: 'Explorador Experimentado', minXP: 1500, icon: '🧭', color: 'green' },
      { level: 4, name: 'Planificador Experto', minXP: 3500, icon: '🎯', color: 'purple' },
      { level: 5, name: 'Maestro del Itinerario', minXP: 7000, icon: '⭐', color: 'yellow' },
      { level: 6, name: 'Sensei Viajero', minXP: 12000, icon: '🥋', color: 'red' }
    ];
  }

  /**
   * 🚀 Inicializa el sistema de gamificación para un usuario
   */
  async initialize(userId) {
    this.userId = userId;

    try {
      // Cargar estadísticas del usuario desde Firebase
      const statsDoc = await firebase.firestore()
        .collection('users')
        .doc(userId)
        .collection('gamification')
        .doc('stats')
        .get();

      if (statsDoc.exists) {
        this.userStats = statsDoc.data();
      } else {
        // Crear stats iniciales
        this.userStats = this.getDefaultStats();
        await this.saveStats();
      }

      console.log('🏆 Gamification initialized:', this.userStats);
      return this.userStats;

    } catch (error) {
      console.error('❌ Error initializing gamification:', error);
      this.userStats = this.getDefaultStats();
      return this.userStats;
    }
  }

  /**
   * 📊 Estadísticas por defecto para nuevos usuarios
   */
  getDefaultStats() {
    return {
      xp: 0,
      level: 1,
      badgesUnlocked: 0,
      unlockedBadges: [],

      // Contadores de acciones
      tripsCreated: 0,
      itinerariesGenerated: 0,
      hybridsCreated: 0,
      daysEdited: 0,
      expenseCategories: 0,
      budgetKept: 0,
      citiesExplored: 0,
      variationsCompared: 0,
      exportFormats: 0,
      tripsShared: 0,
      notesAdded: 0,
      photosAdded: 0,
      maxActivitiesInTrip: 0,
      maxTripDays: 0,
      categoryDiversity: 0,
      loginStreak: 0,
      totalDaysUsed: 0,
      completedTrips: 0,

      // Metadata
      lastLogin: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  /**
   * 📈 Registra una acción y otorga puntos si corresponde
   */
  async trackAction(action, value = 1) {
    if (!this.userStats) {
      console.warn('⚠️ Gamification not initialized');
      return;
    }

    console.log(`🎯 Tracking action: ${action} (${value})`);

    // Actualizar contador
    if (this.userStats.hasOwnProperty(action)) {
      if (typeof this.userStats[action] === 'number') {
        this.userStats[action] += value;
      } else {
        this.userStats[action] = value;
      }
    }

    // Actualizar último login
    this.userStats.lastLogin = Date.now();
    this.userStats.updatedAt = Date.now();

    // Verificar nuevos badges desbloqueados
    const newBadges = await this.checkBadges();

    // Guardar cambios
    await this.saveStats();

    return newBadges;
  }

  /**
   * 🏅 Verifica si se desbloquearon nuevos badges
   */
  async checkBadges() {
    const newBadges = [];

    for (const [badgeId, badge] of Object.entries(this.badges)) {
      // Ya desbloqueado?
      if (this.userStats.unlockedBadges.includes(badgeId)) {
        continue;
      }

      // Verificar condición
      if (badge.condition(this.userStats)) {
        console.log(`🎉 Badge unlocked: ${badge.name}`);

        // Desbloquear badge
        this.userStats.unlockedBadges.push(badgeId);
        this.userStats.badgesUnlocked++;

        // Otorgar puntos
        this.userStats.xp += badge.points;

        // Verificar nivel
        const levelUp = this.checkLevelUp();

        newBadges.push({
          ...badge,
          levelUp
        });

        // Mostrar notificación
        this.showBadgeNotification(badge, levelUp);
      }
    }

    return newBadges;
  }

  /**
   * 📊 Verifica si el usuario subió de nivel
   */
  checkLevelUp() {
    const currentLevel = this.userStats.level;
    const newLevel = this.getCurrentLevel();

    if (newLevel.level > currentLevel) {
      this.userStats.level = newLevel.level;
      console.log(`🎊 Level up! Now ${newLevel.name}`);
      return newLevel;
    }

    return null;
  }

  /**
   * 🎖️ Obtiene el nivel actual del usuario basado en XP
   */
  getCurrentLevel() {
    const xp = this.userStats.xp;

    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (xp >= this.levels[i].minXP) {
        return this.levels[i];
      }
    }

    return this.levels[0];
  }

  /**
   * 📈 Obtiene el progreso al siguiente nivel
   */
  getProgressToNextLevel() {
    const currentLevel = this.getCurrentLevel();
    const nextLevelIndex = this.levels.findIndex(l => l.level === currentLevel.level) + 1;

    if (nextLevelIndex >= this.levels.length) {
      return { progress: 100, xpNeeded: 0, xpToNext: 0 };
    }

    const nextLevel = this.levels[nextLevelIndex];
    const xpInCurrentLevel = this.userStats.xp - currentLevel.minXP;
    const xpNeeded = nextLevel.minXP - currentLevel.minXP;
    const progress = Math.round((xpInCurrentLevel / xpNeeded) * 100);
    const xpToNext = nextLevel.minXP - this.userStats.xp;

    return { progress, xpNeeded, xpToNext, nextLevel };
  }

  /**
   * 💾 Guarda las estadísticas en Firebase
   */
  async saveStats() {
    if (!this.userId || !this.userStats) return;

    try {
      await firebase.firestore()
        .collection('users')
        .doc(this.userId)
        .collection('gamification')
        .doc('stats')
        .set(this.userStats, { merge: true });

      console.log('💾 Stats saved');
    } catch (error) {
      console.error('❌ Error saving stats:', error);
    }
  }

  /**
   * 🎉 Muestra notificación de badge desbloqueado
   */
  showBadgeNotification(badge, levelUp) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl shadow-2xl p-6 max-w-sm transform transition-all duration-500 translate-x-full';

    notification.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="text-5xl">${badge.icon}</div>
        <div class="flex-1">
          <div class="text-xs font-bold uppercase tracking-wide mb-1">¡Badge Desbloqueado!</div>
          <div class="text-lg font-bold mb-1">${badge.name}</div>
          <div class="text-sm opacity-90 mb-2">${badge.description}</div>
          <div class="flex items-center gap-2 text-sm">
            <span class="font-bold">+${badge.points} XP</span>
            ${levelUp ? `<span class="bg-white/20 px-2 py-1 rounded">🎊 Nivel ${levelUp.level}</span>` : ''}
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animación de entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Auto-cerrar después de 6 segundos
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 500);
    }, 6000);

    // Sonido de logro (opcional)
    this.playAchievementSound();
  }

  /**
   * 🔊 Reproduce sonido de logro
   */
  playAchievementSound() {
    // Sonido simple usando Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 523.25; // C5
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;

      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Silently fail si no se puede reproducir audio
    }
  }

  /**
   * 🏆 Renderiza el panel de gamificación para el dashboard
   */
  renderGamificationPanel() {
    if (!this.userStats) return '';

    const currentLevel = this.getCurrentLevel();
    const progress = this.getProgressToNextLevel();
    const recentBadges = this.userStats.unlockedBadges.slice(-3).reverse();

    return `
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🏆 Tu Progreso
          </h3>
          <button
            onclick="window.GamificationSystem.showAllBadges()"
            class="text-sm text-purple-600 dark:text-purple-400 hover:underline font-semibold"
          >
            Ver Todos →
          </button>
        </div>

        <!-- Level Progress -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-3xl">${currentLevel.icon}</span>
              <div>
                <div class="font-bold text-gray-900 dark:text-white">${currentLevel.name}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Nivel ${currentLevel.level}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${this.userStats.xp.toLocaleString()}</div>
              <div class="text-xs text-gray-600 dark:text-gray-400">XP Total</div>
            </div>
          </div>

          <!-- Progress Bar -->
          ${progress.nextLevel ? `
            <div class="relative">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                     style="width: ${progress.progress}%"></div>
              </div>
              <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>${progress.progress}% al siguiente nivel</span>
                <span>${progress.xpToNext} XP restantes</span>
              </div>
            </div>
          ` : `
            <div class="text-center text-sm text-yellow-600 dark:text-yellow-400 font-bold">
              🎊 ¡Nivel Máximo Alcanzado!
            </div>
          `}
        </div>

        <!-- Recent Badges -->
        <div>
          <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Badges Recientes (${this.userStats.badgesUnlocked}/${Object.keys(this.badges).length})
          </div>
          ${recentBadges.length > 0 ? `
            <div class="grid grid-cols-3 gap-3">
              ${recentBadges.map(badgeId => {
                const badge = this.badges[badgeId];
                return `
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border-2 border-purple-200 dark:border-purple-700">
                    <div class="text-3xl mb-1">${badge.icon}</div>
                    <div class="text-xs font-semibold text-gray-900 dark:text-white truncate">${badge.name}</div>
                    <div class="text-xs text-purple-600 dark:text-purple-400">+${badge.points} XP</div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
              ¡Empieza a desbloquear badges!
            </div>
          `}
        </div>
      </div>
    `;
  }

  /**
   * 🎯 Muestra modal con todos los badges
   */
  showAllBadges() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    const currentLevel = this.getCurrentLevel();
    const progress = this.getProgressToNextLevel();

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold mb-2">🏆 Tus Logros</h2>
              <p class="text-purple-100">${this.userStats.badgesUnlocked}/${Object.keys(this.badges).length} badges desbloqueados • ${this.userStats.xp.toLocaleString()} XP</p>
            </div>
            <button onclick="this.closest('.fixed').remove()" class="text-white/80 hover:text-white text-2xl">
              ✕
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Level Info -->
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6 mb-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="text-5xl">${currentLevel.icon}</div>
              <div class="flex-1">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">${currentLevel.name}</div>
                <div class="text-gray-600 dark:text-gray-400">Nivel ${currentLevel.level}/6</div>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">${this.userStats.xp.toLocaleString()}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">XP Total</div>
              </div>
            </div>
            ${progress.nextLevel ? `
              <div>
                <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progreso a ${progress.nextLevel.name}</span>
                  <span>${progress.progress}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                       style="width: ${progress.progress}%"></div>
                </div>
              </div>
            ` : `
              <div class="text-center text-yellow-600 dark:text-yellow-400 font-bold">
                🎊 ¡Nivel Máximo Alcanzado!
              </div>
            `}
          </div>

          <!-- All Badges Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${Object.values(this.badges).map(badge => {
              const unlocked = this.userStats.unlockedBadges.includes(badge.id);
              return `
                <div class="relative ${unlocked ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-600' : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 opacity-50'} rounded-xl p-4 text-center">
                  ${unlocked ? '<div class="absolute top-2 right-2 text-green-500">✅</div>' : ''}
                  <div class="text-4xl mb-2 ${unlocked ? '' : 'grayscale'}">${badge.icon}</div>
                  <div class="font-bold text-sm text-gray-900 dark:text-white mb-1">${badge.name}</div>
                  <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">${badge.description}</div>
                  <div class="text-xs font-bold ${unlocked ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}">
                    +${badge.points} XP
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }
}

// Instancia global
window.GamificationSystem = new GamificationSystem();

export default GamificationSystem;
