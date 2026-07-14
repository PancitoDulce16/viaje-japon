/**
 * 🎏 SISTEMA CANÓNICO DE LOGROS (ACHIEVEMENTS)
 *
 * Implementación única de OBJECT_BIBLE.md → objeto Achievement.
 * Ver ARCHITECTURE_PRINCIPLES.md — "every reusable object has one
 * canonical implementation." Esta clase reemplaza por completo:
 *   - js/features/gamification/gamification-system.js (retirado)
 *   - la sección de logros/desafíos de js/features/social/social-features.js (retirada)
 *   - la copia independiente de stats en js/ui/user-profile.js (retirada)
 * Ver DEPRECATION_LOG.md para el detalle de la migración.
 *
 * Decisión de arquitectura: los logros son POR VIAJE, no por cuenta.
 * Un logro es un recuerdo de un viaje específico — igual que Passport
 * (OBJECT_BIBLE.md: "One Passport per trip, not per user"). Antes,
 * gamification-system.js guardaba todo en users/{uid}/gamification/stats
 * (global, entre todos los viajes); ahora vive en
 * trips/{tripId}/achievements/{uid} (el mismo lugar donde ya vivían
 * los logros de social-features.js).
 *
 * Modelo de datos híbrido, y por qué: algunos logros dependen de
 * contadores que solo pueden llevarse manualmente (ediciones de
 * itinerario, categorías de presupuesto usadas — no hay un log de
 * cambios consultable). Esos viven en `stats` dentro del doc de
 * Firestore de este objeto. Otros logros (comidas probadas, bingo,
 * sellos, entradas de diario) se pueden derivar en vivo desde
 * localStorage/Firestore existentes sin duplicar esos datos — esos
 * se calculan on-demand en getLiveStats() y nunca se persisten aquí,
 * para no crear una segunda fuente de verdad sobre datos que ya
 * viven en otro lado.
 */

import { auth, db } from '../../core/firebase-config.js';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

class Achievements {
  constructor() {
    this.tripId = null;
    this.userId = null;
    this.state = null; // { unlocked: [{id, unlockedAt}], stats: {...contadores manuales...} }

    // Única lista de definiciones. Cada logro es un momento real de
    // viaje — no una métrica de uso de la app. Se retiraron 6 del
    // sistema anterior por ser mecánicas de juego/producto sin
    // contenido de viaje real (crear un itinerario híbrido, comparar
    // variaciones, exportar en N formatos, "level >= 6", "30 días de
    // uso de la app", "desbloqueaste todo") — ver DEPRECATION_LOG.md.
    this.definitions = {
      // 🎫 Planeando el viaje
      firstTrip: {
        id: 'firstTrip', name: 'Primer Viaje', icon: '🎫',
        description: 'Creaste tu primer viaje a Japón',
        condition: (s) => s.tripsCreated >= 1
      },
      firstItinerary: {
        id: 'firstItinerary', name: 'Ruta Trazada', icon: '🗺️',
        description: 'Generaste tu primer itinerario',
        condition: (s) => s.itinerariesGenerated >= 1
      },
      budgetTracked: {
        id: 'budgetTracked', name: 'Cuentas Claras', icon: '💰',
        description: 'Registraste tus primeros gastos del viaje',
        condition: (s) => s.expenseCategories >= 1
      },
      frugalTraveler: {
        id: 'frugalTraveler', name: 'Presupuesto Bajo Control', icon: '🏦',
        description: 'Mantuviste tu presupuesto bajo control',
        condition: (s) => s.budgetKept >= 1
      },
      explorer: {
        id: 'explorer', name: 'Explorador Multi-ciudad', icon: '🧭',
        description: 'Planeaste actividades en 3 ciudades distintas',
        condition: (s) => s.citiesExplored >= 3
      },
      sharer: {
        id: 'sharer', name: 'Espíritu Colaborativo', icon: '🤝',
        description: 'Compartiste tu viaje con otros viajeros',
        condition: (s) => s.tripsShared >= 1
      },
      notekeeper: {
        id: 'notekeeper', name: 'Cronista del Viaje', icon: '📝',
        description: 'Agregaste notas a 10 actividades',
        condition: (s) => s.notesAdded >= 10
      },
      photographer: {
        id: 'photographer', name: 'Ojo Fotográfico', icon: '📷',
        description: 'Agregaste 20 fotos a tu viaje',
        condition: (s) => s.photosAdded >= 20
      },
      marathoner: {
        id: 'marathoner', name: 'Itinerario Ambicioso', icon: '🏃',
        description: 'Planeaste un viaje con más de 30 actividades',
        condition: (s) => s.maxActivitiesInTrip >= 30
      },
      weekAdventure: {
        id: 'weekAdventure', name: 'Una Semana en Japón', icon: '📅',
        description: 'Planeaste un viaje de 7 días o más',
        condition: (s) => s.maxTripDays >= 7
      },
      diversity: {
        id: 'diversity', name: 'Explorador Versátil', icon: '🎭',
        description: 'Incluiste 10 categorías distintas de lugares',
        condition: (s) => s.categoryDiversity >= 10
      },
      completionist: {
        id: 'completionist', name: 'Viaje Completo', icon: '✅',
        description: 'Completaste todas las secciones de tu viaje',
        condition: (s) => s.completedTrips >= 1
      },

      // 🍜 Viviendo el viaje
      firstMeal: {
        id: 'firstMeal', name: 'Primera Comida', icon: '🍱',
        description: 'Probaste tu primera comida japonesa',
        condition: (s) => s.mealsTracked >= 1
      },
      foodieFive: {
        id: 'foodieFive', name: 'Ruta Gastronómica', icon: '🍜',
        description: 'Probaste 5 comidas diferentes',
        condition: (s) => s.mealsTracked >= 5
      },
      foodieTen: {
        id: 'foodieTen', name: 'Explorador Culinario', icon: '🍣',
        description: 'Probaste 10 comidas diferentes',
        condition: (s) => s.mealsTracked >= 10
      },
      firstExperience: {
        id: 'firstExperience', name: 'Primera Experiencia', icon: '🎯',
        description: 'Completaste tu primera experiencia del bingo de viaje',
        condition: (s) => s.bingoCompleted >= 1
      },
      adventurer: {
        id: 'adventurer', name: 'Aventurero', icon: '🗾',
        description: 'Completaste 5 experiencias del bingo de viaje',
        condition: (s) => s.bingoCompleted >= 5
      },
      deepExplorer: {
        id: 'deepExplorer', name: 'Explorador a Fondo', icon: '🏯',
        description: 'Completaste 10 experiencias del bingo de viaje',
        condition: (s) => s.bingoCompleted >= 10
      },
      stampCollector: {
        id: 'stampCollector', name: 'Coleccionista de Sellos', icon: '🎫',
        description: 'Coleccionaste 5 sellos de templos y santuarios',
        condition: (s) => s.stampsCollected >= 5
      },
      tripBegins: {
        id: 'tripBegins', name: 'La Aventura Comienza', icon: '🌅',
        description: 'Iniciaste tu viaje a Japón',
        condition: (s) => s.tripStarted === true
      },

      // 📔 Recordando el viaje
      firstJournalEntry: {
        id: 'firstJournalEntry', name: 'Primera Página', icon: '📔',
        description: 'Escribiste tu primera entrada en el diario',
        condition: (s) => s.journalEntries >= 1
      },
      dedicatedWriter: {
        id: 'dedicatedWriter', name: 'Diario Detallado', icon: '✍️',
        description: 'Escribiste 5 entradas en tu diario',
        condition: (s) => s.journalEntries >= 5
      }
    };
  }

  /**
   * 🚀 Inicializa los logros para el viaje activo. Se re-llama cada
   * vez que cambia el viaje activo (los logros son por viaje).
   */
  async initialize(tripId) {
    if (!tripId || !auth.currentUser) {
      console.warn('⚠️ Achievements: falta tripId o sesión de usuario');
      return null;
    }

    this.tripId = tripId;
    this.userId = auth.currentUser.uid;

    try {
      if (!db) {
        this.state = this.getDefaultState();
        return this.state;
      }

      const stateRef = doc(db, `trips/${tripId}/achievements/${this.userId}`);
      const stateDoc = await getDoc(stateRef);

      if (stateDoc.exists()) {
        const raw = stateDoc.data();
        // Doc del sistema viejo de social-features.js: { achievements: [{id, unlockedAt}] },
        // sin campo `unlocked` ni `stats`. Migrar ids a los nuevos, una sola vez.
        if (!raw.unlocked && Array.isArray(raw.achievements)) {
          this.state = this.migrateLegacyTripDoc(raw);
          await this.save();
        } else {
          this.state = { ...this.getDefaultState(), ...raw };
        }
      } else {
        this.state = this.getDefaultState();
        await this.migrateLegacyUserDoc(); // ver nota en el método
        await this.save();
      }

      console.log('🎏 Achievements initialized for trip', tripId, this.state);
      return this.state;
    } catch (error) {
      console.error('❌ Error initializing achievements:', error);
      this.state = this.getDefaultState();
      return this.state;
    }
  }

  /**
   * 🔁 Migra un doc del sistema viejo de social-features.js
   * (`{ achievements: [{id, unlockedAt}] }`, ya vivía en esta misma ruta
   * trip-scoped) al formato nuevo. Los ids que ya no tienen equivalente
   * (streak_3/streak_7, retirados en la limpieza de gamificación previa)
   * simplemente se descartan — no representan ningún logro del sistema
   * actual. Ver DEPRECATION_LOG.md.
   */
  migrateLegacyTripDoc(raw) {
    const idMap = {
      first_meal: 'firstMeal', foodie_5: 'foodieFive', foodie_10: 'foodieTen',
      bingo_first: 'firstExperience', bingo_5: 'adventurer', bingo_10: 'deepExplorer',
      stamps_5: 'stampCollector', early_bird: 'tripBegins',
      social: 'firstJournalEntry', writer: 'dedicatedWriter'
    };

    const migrated = this.getDefaultState();
    migrated.unlocked = (raw.achievements || [])
      .map(a => ({ id: idMap[a.id], unlockedAt: a.unlockedAt || new Date().toISOString() }))
      .filter(a => a.id);

    console.log(`🔁 Migrados ${migrated.unlocked.length} recuerdos del formato anterior (social-features.js)`);
    return migrated;
  }

  /**
   * 🔁 Migración única desde el sistema viejo de gamification-system.js
   * (`users/{uid}/gamification/stats`, por CUENTA, no por viaje). Como
   * ese sistema nunca supo a qué viaje pertenecía cada logro, se adopta
   * todo dentro del primer viaje que el usuario abre después de este
   * cambio — imperfecto si el usuario tenía logros de varios viajes
   * distintos, pero preserva el recuerdo en vez de borrarlo. Ver
   * DEPRECATION_LOG.md para el detalle completo de esta decisión.
   */
  async migrateLegacyUserDoc() {
    if (!db) return;

    const idMap = {
      firstTrip: 'firstTrip', firstItinerary: 'firstItinerary',
      budgetMaster: 'budgetTracked', frugalTraveler: 'frugalTraveler',
      explorer: 'explorer', sharer: 'sharer', notekeeper: 'notekeeper',
      photographer: 'photographer', marathoner: 'marathoner',
      weekWarrior: 'weekAdventure', diversity: 'diversity',
      completionist: 'completionist'
      // hybridCreator, customizer, variations, exporter, dedicated,
      // legend, sensei, consistent: sin equivalente nuevo, no se migran.
    };
    const counterKeys = [
      'tripsCreated', 'itinerariesGenerated', 'expenseCategories', 'budgetKept',
      'citiesExplored', 'tripsShared', 'notesAdded', 'photosAdded',
      'maxActivitiesInTrip', 'maxTripDays', 'categoryDiversity', 'completedTrips'
    ];

    try {
      const legacyRef = doc(db, 'users', this.userId, 'gamification', 'stats');
      const legacySnap = await getDoc(legacyRef);
      if (!legacySnap.exists()) return;

      const legacy = legacySnap.data();

      (legacy.unlockedBadges || []).forEach(oldId => {
        const newId = idMap[oldId];
        if (newId && !this.state.unlocked.some(u => u.id === newId)) {
          this.state.unlocked.push({ id: newId, unlockedAt: new Date().toISOString() });
        }
      });

      counterKeys.forEach(key => {
        if (typeof legacy[key] === 'number') {
          this.state.stats[key] = legacy[key];
        }
      });

      console.log(`🔁 Migrados ${this.state.unlocked.length} recuerdos y contadores desde el sistema anterior (gamification-system.js)`);
    } catch (error) {
      console.error('❌ Error migrando datos heredados de gamification:', error);
    }
  }

  /**
   * 🔍 Lee el estado de logros de CUALQUIER usuario en un viaje dado,
   * sin tocar el estado de la sesión activa (this.state/tripId/userId).
   * Único punto de lectura para casos como "ver el perfil de otro
   * viajero" — evita que cada pantalla reimplemente su propia consulta
   * a trips/{tripId}/achievements/{userId}.
   */
  async getStateFor(tripId, targetUserId) {
    if (!tripId || !targetUserId || !db) return this.getDefaultState();

    try {
      const stateRef = doc(db, `trips/${tripId}/achievements/${targetUserId}`);
      const stateDoc = await getDoc(stateRef);
      return stateDoc.exists()
        ? { ...this.getDefaultState(), ...stateDoc.data() }
        : this.getDefaultState();
    } catch (error) {
      console.error('❌ Error fetching achievements for user:', error);
      return this.getDefaultState();
    }
  }

  getDefaultState() {
    return {
      unlocked: [],
      stats: {
        tripsCreated: 0,
        itinerariesGenerated: 0,
        expenseCategories: 0,
        budgetKept: 0,
        citiesExplored: 0,
        tripsShared: 0,
        notesAdded: 0,
        photosAdded: 0,
        maxActivitiesInTrip: 0,
        maxTripDays: 0,
        categoryDiversity: 0,
        completedTrips: 0
      }
    };
  }

  /**
   * 📈 Registra una acción real del viaje y revisa si desbloquea un logro.
   * Mismo nombre/firma que el sistema anterior (`trackAction(action, value)`)
   * para que los call-sites existentes solo necesiten apuntar a este
   * objeto en vez de reescribirse.
   */
  async trackAction(action, value = 1) {
    if (!this.state) {
      console.warn('⚠️ Achievements not initialized — llama a initialize(tripId) primero');
      return [];
    }

    if (this.state.stats.hasOwnProperty(action)) {
      this.state.stats[action] += value;
    }

    const newlyUnlocked = await this.checkNew();
    await this.save();
    return newlyUnlocked;
  }

  /**
   * 🔎 Combina los contadores manuales con los datos ya existentes en
   * localStorage/Firestore (comida, bingo, sellos, diario) — nunca
   * duplica esos datos, solo los lee.
   */
  async getLiveStats() {
    const mealsTracked = JSON.parse(localStorage.getItem('japanFoodTracker') || '{}');
    const bingoData = JSON.parse(localStorage.getItem('japanTravelBingo') || '{}');
    const stampsData = JSON.parse(localStorage.getItem('japanStampCollection') || '[]');

    let journalEntries = 0;
    if (this.tripId && this.userId && db) {
      try {
        const journalQuery = query(
          collection(db, 'trips', this.tripId, 'journal'),
          where('userId', '==', this.userId)
        );
        const journalSnap = await getDocs(journalQuery);
        journalEntries = journalSnap.size;
      } catch (e) {
        // La colección puede no existir todavía
      }
    }

    return {
      ...this.state.stats,
      mealsTracked: Object.values(mealsTracked).filter(v => v).length,
      bingoCompleted: Object.values(bingoData).filter(v => v).length,
      stampsCollected: stampsData.length,
      journalEntries,
      tripStarted: true
    };
  }

  /**
   * 🎏 Revisa todas las definiciones contra el estado combinado y
   * desbloquea las nuevas.
   */
  async checkNew() {
    const fullStats = await this.getLiveStats();
    const newlyUnlocked = [];

    for (const def of Object.values(this.definitions)) {
      const alreadyUnlocked = this.state.unlocked.some(u => u.id === def.id);
      if (alreadyUnlocked) continue;

      if (def.condition(fullStats)) {
        this.state.unlocked.push({ id: def.id, unlockedAt: new Date().toISOString() });
        newlyUnlocked.push(def);
        this.showUnlockedNotification(def);
      }
    }

    return newlyUnlocked;
  }

  /**
   * 💾 Persiste el estado en Firestore — único punto de escritura.
   */
  async save() {
    if (!this.tripId || !this.userId || !this.state || !db) return;

    try {
      const stateRef = doc(db, `trips/${this.tripId}/achievements/${this.userId}`);
      await setDoc(stateRef, this.state, { merge: true });
    } catch (error) {
      console.error('❌ Error saving achievements:', error);
    }
  }

  /**
   * 🎉 Único punto de notificación — un recuerdo nuevo, no una
   * recompensa. Sin XP, sin "subiste de nivel".
   */
  showUnlockedNotification(def) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl shadow-2xl p-6 max-w-sm transform transition-all duration-500 translate-x-full';

    notification.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="text-5xl">${def.icon}</div>
        <div class="flex-1">
          <div class="text-xs font-bold uppercase tracking-wide mb-1">Nuevo recuerdo</div>
          <div class="text-lg font-bold mb-1">${def.name}</div>
          <div class="text-sm opacity-90">${def.description}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white/80 hover:text-white">✕</button>
      </div>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 500);
    }, 6000);

    this.playSound();
  }

  playSound() {
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
   * 🎏 Único punto de render — panel compacto (dashboard/perfil).
   */
  renderPanel() {
    if (!this.state) {
      return `
        <div class="text-center py-8">
          <div class="text-4xl mb-3">🎏</div>
          <p class="text-gray-600 dark:text-gray-400">Selecciona un viaje para ver tus recuerdos.</p>
        </div>
      `;
    }

    const total = Object.keys(this.definitions).length;
    const recent = [...this.state.unlocked]
      .reverse()
      .slice(0, 3)
      .filter(u => this.definitions[u.id]);

    return `
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">🎏 Tus Recuerdos</h3>
          <button onclick="window.Achievements.renderAllModal()" class="text-sm text-purple-600 dark:text-purple-400 hover:underline font-semibold">Ver Todos →</button>
        </div>
        <div class="mb-6 text-sm text-gray-600 dark:text-gray-400">
          ${this.state.unlocked.length} de ${total} momentos capturados en este viaje
        </div>
        <div>
          <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Últimos recuerdos</div>
          ${recent.length > 0 ? `
            <div class="grid grid-cols-3 gap-3">
              ${recent.map(u => {
                const def = this.definitions[u.id];
                return `
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border-2 border-purple-200 dark:border-purple-700">
                    <div class="text-3xl mb-1">${def.icon}</div>
                    <div class="text-xs font-semibold text-gray-900 dark:text-white truncate">${def.name}</div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="text-center text-sm text-gray-500 dark:text-gray-400 py-4">Tu primer recuerdo está a un viaje de distancia.</div>
          `}
        </div>
      </div>
    `;
  }

  /**
   * 🎏 Teaser silencioso para superficies que no son una pantalla de
   * logros por sí mismas (ej. el Dashboard) — un recuerdo quietamente
   * guardado, no un panel. Deliberadamente más callado que
   * renderPanel(): usa el objeto Journal (cálido, papel) en vez del
   * tratamiento morado del panel completo, muestra como máximo un
   * recuerdo, y no tiene título propio tipo "Logros" — el llamador
   * decide el label de la sección (ver dash-section__label). Misma
   * fuente de datos que renderPanel()/renderAllModal(), nunca una
   * copia — ver ARCHITECTURE_PRINCIPLES.md.
   */
  renderMemoryTeaser() {
    if (!this.state || this.state.unlocked.length === 0) return '';

    const latest = [...this.state.unlocked].reverse().find(u => this.definitions[u.id]);
    if (!latest) return '';

    const def = this.definitions[latest.id];

    return `
      <button type="button" class="journal-card" onclick="window.Achievements.renderAllModal()" style="cursor:pointer; text-align:left; width:100%; border:0; font:inherit; display:block;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-size:1.8rem;">${def.icon}</div>
          <div>
            <div class="journal-card__title" style="margin-top:0;">${def.name}</div>
            <div class="journal-card__sub" style="margin-top:0;">${this.state.unlocked.length} recuerdo${this.state.unlocked.length === 1 ? '' : 's'} de este viaje, guardados en silencio</div>
          </div>
        </div>
      </button>
    `;
  }

  /**
   * 🎏 Único punto de render — galería completa (modal).
   */
  renderAllModal() {
    if (!this.state) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    const total = Object.keys(this.definitions).length;

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold mb-2">🎏 Tus Recuerdos</h2>
              <p class="text-purple-100">${this.state.unlocked.length}/${total} momentos capturados en este viaje</p>
            </div>
            <button onclick="this.closest('.fixed').remove()" class="text-white/80 hover:text-white text-2xl">✕</button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${Object.values(this.definitions).map(def => {
              const unlocked = this.state.unlocked.some(u => u.id === def.id);
              return `
                <div class="relative ${unlocked ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-600' : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 opacity-50'} rounded-xl p-4 text-center">
                  ${unlocked ? '<div class="absolute top-2 right-2 text-green-500">✅</div>' : ''}
                  <div class="text-4xl mb-2 ${unlocked ? '' : 'grayscale'}">${def.icon}</div>
                  <div class="font-bold text-sm text-gray-900 dark:text-white mb-1">${def.name}</div>
                  <div class="text-xs text-gray-600 dark:text-gray-400">${def.description}</div>
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

// Instancia global — único punto de acceso público
window.Achievements = new Achievements();

// Exporta la INSTANCIA, no la clase — cualquier import ES module de
// este archivo debe recibir el mismo singleton que window.Achievements,
// nunca un segundo objeto independiente.
export default window.Achievements;
