/**
 * 🎏 SISTEMA DE LOGROS (ACHIEVEMENTS)
 *
 * Marca los momentos de un viaje que valen la pena recordar.
 * Un logro es un recuerdo, no una recompensa — no hay puntos, no hay
 * niveles, no hay rachas que romper. Ver SOUL.md ("Memories, not
 * productivity") y OBJECT_BIBLE.md (objeto Achievement).
 *
 * Deprecation note (ver DEPRECATION_LOG.md): esta clase antes otorgaba
 * XP por cada badge y calculaba 6 "niveles de viajero" a partir del XP
 * acumulado. Todo eso se eliminó. Los datos de `unlockedBadges` de
 * usuarios existentes se preservan tal cual — solo cambió qué se
 * calcula/muestra a partir de ellos, nunca se borró nada en Firestore.
 */

import { db } from '../../core/firebase-config.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

class GamificationSystem {
  constructor() {
    this.userId = null;
    this.userStats = null;

    // Definición de logros — cada uno es un momento real de un viaje,
    // no un peldaño hacia el siguiente. Ninguno depende de "nivel" ni
    // de rachas de días consecutivos.
    this.badges = {
      // 🎯 Primeros pasos
      firstTrip: {
        id: 'firstTrip',
        name: 'Primer Viaje',
        description: 'Creaste tu primer viaje',
        icon: '🎫',
        condition: (stats) => stats.tripsCreated >= 1
      },

      firstItinerary: {
        id: 'firstItinerary',
        name: 'Planificador Novato',
        description: 'Generaste tu primer itinerario inteligente',
        icon: '🗺️',
        condition: (stats) => stats.itinerariesGenerated >= 1
      },

      // 🎨 Personalización
      hybridCreator: {
        id: 'hybridCreator',
        name: 'Creador Híbrido',
        description: 'Creaste un itinerario híbrido personalizado',
        icon: '🎨',
        condition: (stats) => stats.hybridsCreated >= 1
      },

      customizer: {
        id: 'customizer',
        name: 'Personalizador Experto',
        description: 'Editaste actividades en 5 días diferentes',
        icon: '✏️',
        condition: (stats) => stats.daysEdited >= 5
      },

      // 💰 Gestión del presupuesto
      budgetMaster: {
        id: 'budgetMaster',
        name: 'Maestro del Presupuesto',
        description: 'Registraste gastos en 3 categorías diferentes',
        icon: '💰',
        condition: (stats) => stats.expenseCategories >= 3
      },

      frugalTraveler: {
        id: 'frugalTraveler',
        name: 'Viajero Económico',
        description: 'Mantuviste el presupuesto bajo control',
        icon: '🏦',
        condition: (stats) => stats.budgetKept >= 1
      },

      // 📊 Exploración
      explorer: {
        id: 'explorer',
        name: 'Explorador Curioso',
        description: 'Generaste itinerarios para 3 ciudades diferentes',
        icon: '🧭',
        condition: (stats) => stats.citiesExplored >= 3
      },

      variations: {
        id: 'variations',
        name: 'Indeciso Creativo',
        description: 'Comparaste variaciones 5 veces',
        icon: '🔄',
        condition: (stats) => stats.variationsCompared >= 5
      },

      // 📤 Compartir
      exporter: {
        id: 'exporter',
        name: 'Organizador Pro',
        description: 'Exportaste tu itinerario en 3 formatos diferentes',
        icon: '📤',
        condition: (stats) => stats.exportFormats >= 3
      },

      sharer: {
        id: 'sharer',
        name: 'Espíritu Colaborativo',
        description: 'Compartiste un viaje con otros usuarios',
        icon: '🤝',
        condition: (stats) => stats.tripsShared >= 1
      },

      // 📝 Contenido
      notekeeper: {
        id: 'notekeeper',
        name: 'Cronista Viajero',
        description: 'Agregaste notas a 10 actividades',
        icon: '📝',
        condition: (stats) => stats.notesAdded >= 10
      },

      photographer: {
        id: 'photographer',
        name: 'Fotógrafo Entusiasta',
        description: 'Agregaste 20 fotos a tus viajes',
        icon: '📷',
        condition: (stats) => stats.photosAdded >= 20
      },

      // 🎯 Momentos memorables
      marathoner: {
        id: 'marathoner',
        name: 'Maratonista Cultural',
        description: 'Creaste un itinerario con más de 30 actividades',
        icon: '🏃',
        condition: (stats) => stats.maxActivitiesInTrip >= 30
      },

      weekWarrior: {
        id: 'weekWarrior',
        name: 'Guerrero de la Semana',
        description: 'Planificaste un viaje de 7+ días',
        icon: '📅',
        condition: (stats) => stats.maxTripDays >= 7
      },

      diversity: {
        id: 'diversity',
        name: 'Polímata Viajero',
        description: 'Visitaste 10 categorías diferentes de lugares',
        icon: '🎭',
        condition: (stats) => stats.categoryDiversity >= 10
      },

      // ⭐ De vuelta, una y otra vez (total acumulado, nunca una racha)
      dedicated: {
        id: 'dedicated',
        name: 'Viajero Dedicado',
        description: 'Usaste la app 30 días en total',
        icon: '⭐',
        condition: (stats) => stats.totalDaysUsed >= 30
      },

      // 🏆 Logros mayores
      completionist: {
        id: 'completionist',
        name: 'Completista',
        description: 'Completaste todas las secciones de un viaje',
        icon: '✅',
        condition: (stats) => stats.completedTrips >= 1
      },

      legend: {
        id: 'legend',
        name: 'Leyenda Viajera',
        description: 'Desbloqueaste todos los demás logros',
        icon: '👑',
        condition: (stats) => stats.badgesUnlocked >= 17 // todos menos este
      }
    };
  }

  /**
   * 🚀 Inicializa el sistema de logros para un usuario
   */
  async initialize(userId) {
    this.userId = userId;

    try {
      // Verificar que Firebase esté disponible
      if (!db) {
        console.warn('⚠️ Firebase not available, using local stats only');
        this.userStats = this.getDefaultStats();
        return this.userStats;
      }

      // Cargar estadísticas del usuario desde Firebase
      const statsRef = doc(db, 'users', userId, 'gamification', 'stats');
      const statsDoc = await getDoc(statsRef);

      if (statsDoc.exists()) {
        // Puede incluir campos heredados (xp, level, loginStreak) de antes
        // de este cambio — se preservan tal cual en Firestore, simplemente
        // ya no se leen ni se usan para nada.
        this.userStats = statsDoc.data();
      } else {
        // Crear stats iniciales
        this.userStats = this.getDefaultStats();
        await this.saveStats();
      }

      console.log('🎏 Achievements initialized:', this.userStats);
      return this.userStats;

    } catch (error) {
      console.error('❌ Error initializing achievements:', error);
      this.userStats = this.getDefaultStats();
      return this.userStats;
    }
  }

  /**
   * 📊 Estadísticas por defecto para nuevos usuarios
   */
  getDefaultStats() {
    return {
      badgesUnlocked: 0,
      unlockedBadges: [],

      // Contadores de acciones — reflejan lo que realmente pasó en el
      // viaje, nunca puntos.
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
      totalDaysUsed: 0,
      completedTrips: 0,

      // Metadata
      lastLogin: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  /**
   * 📈 Registra una acción del viaje y revisa si desbloquea un logro
   */
  async trackAction(action, value = 1) {
    if (!this.userStats) {
      console.warn('⚠️ Achievements not initialized');
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

    // Verificar nuevos logros desbloqueados
    const newBadges = await this.checkBadges();

    // Guardar cambios
    await this.saveStats();

    return newBadges;
  }

  /**
   * 🎏 Verifica si se desbloquearon nuevos logros
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
        console.log(`🎉 Achievement unlocked: ${badge.name}`);

        this.userStats.unlockedBadges.push(badgeId);
        this.userStats.badgesUnlocked++;

        newBadges.push(badge);
        this.showBadgeNotification(badge);
      }
    }

    return newBadges;
  }

  /**
   * 💾 Guarda las estadísticas en Firebase
   */
  async saveStats() {
    if (!this.userId || !this.userStats) return;

    try {
      // Verificar que Firebase esté disponible
      if (!db) {
        console.warn('⚠️ Firebase not available, using local stats only');
        return;
      }

      const statsRef = doc(db, 'users', this.userId, 'gamification', 'stats');
      await setDoc(statsRef, this.userStats, { merge: true });

      console.log('💾 Stats saved');
    } catch (error) {
      console.error('❌ Error saving stats:', error);
    }
  }

  /**
   * 🎉 Muestra notificación de logro desbloqueado — un recuerdo nuevo,
   * no una recompensa. Sin XP, sin "subiste de nivel".
   */
  showBadgeNotification(badge) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl shadow-2xl p-6 max-w-sm transform transition-all duration-500 translate-x-full';

    notification.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="text-5xl">${badge.icon}</div>
        <div class="flex-1">
          <div class="text-xs font-bold uppercase tracking-wide mb-1">Nuevo recuerdo</div>
          <div class="text-lg font-bold mb-1">${badge.name}</div>
          <div class="text-sm opacity-90">${badge.description}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 500);
    }, 6000);

    this.playAchievementSound();
  }

  /**
   * 🔊 Reproduce un sonido suave al desbloquear un logro
   */
  playAchievementSound() {
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
   * 🎏 Renderiza el panel de logros para el dashboard — sin nivel, sin XP,
   * solo los momentos que ya pasaron.
   */
  renderGamificationPanel() {
    if (!this.userStats) return '';

    const totalBadges = Object.keys(this.badges).length;
    const recentBadges = this.userStats.unlockedBadges
      .slice(-3)
      .reverse()
      .filter(badgeId => this.badges[badgeId]); // ignora ids de logros ya retirados

    return `
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🎏 Tus Recuerdos
          </h3>
          <button
            onclick="window.GamificationSystem.showAllBadges()"
            class="text-sm text-purple-600 dark:text-purple-400 hover:underline font-semibold"
          >
            Ver Todos →
          </button>
        </div>

        <div class="mb-6 text-sm text-gray-600 dark:text-gray-400">
          ${this.userStats.badgesUnlocked} de ${totalBadges} momentos capturados en este viaje
        </div>

        <!-- Recent Achievements -->
        <div>
          <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Últimos recuerdos
          </div>
          ${recentBadges.length > 0 ? `
            <div class="grid grid-cols-3 gap-3">
              ${recentBadges.map(badgeId => {
                const badge = this.badges[badgeId];
                return `
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border-2 border-purple-200 dark:border-purple-700">
                    <div class="text-3xl mb-1">${badge.icon}</div>
                    <div class="text-xs font-semibold text-gray-900 dark:text-white truncate">${badge.name}</div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
              Tu primer recuerdo está a un viaje de distancia.
            </div>
          `}
        </div>
      </div>
    `;
  }

  /**
   * 🎏 Muestra modal con todos los logros — un álbum, no una tabla de puntajes
   */
  showAllBadges() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    const totalBadges = Object.keys(this.badges).length;

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold mb-2">🎏 Tus Recuerdos</h2>
              <p class="text-purple-100">${this.userStats.badgesUnlocked}/${totalBadges} momentos capturados</p>
            </div>
            <button onclick="this.closest('.fixed').remove()" class="text-white/80 hover:text-white text-2xl">
              ✕
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${Object.values(this.badges).map(badge => {
              const unlocked = this.userStats.unlockedBadges.includes(badge.id);
              return `
                <div class="relative ${unlocked ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-600' : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 opacity-50'} rounded-xl p-4 text-center">
                  ${unlocked ? '<div class="absolute top-2 right-2 text-green-500">✅</div>' : ''}
                  <div class="text-4xl mb-2 ${unlocked ? '' : 'grayscale'}">${badge.icon}</div>
                  <div class="font-bold text-sm text-gray-900 dark:text-white mb-1">${badge.name}</div>
                  <div class="text-xs text-gray-600 dark:text-gray-400">${badge.description}</div>
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
