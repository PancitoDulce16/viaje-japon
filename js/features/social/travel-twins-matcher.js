// js/travel-twins-matcher.js - Matching real de viajeros con itinerarios similares
//
// Los viajes son privados por defecto (solo miembros pueden leerlos vía
// firestore.rules). Para hacer matching real sin exponer itinerarios
// privados, un viaje debe optar por publicar un RESUMEN (ciudades, fechas,
// presupuesto aproximado, intereses, ritmo) en la colección pública
// 'travelTwinsPool' - nunca el itinerario completo. Los mensajes entre
// matches viven en 'travelTwinsThreads', accesibles solo a los 2 participantes.

import { db, auth } from '../../core/firebase-config.js';
import {
  doc, getDoc, setDoc, deleteDoc,
  collection, getDocs, addDoc, serverTimestamp
} from 'firebase/firestore';

const AVATAR_COLORS = [
  'from-purple-400 to-pink-400',
  'from-orange-400 to-red-400',
  'from-green-400 to-teal-400',
  'from-blue-400 to-indigo-400',
  'from-yellow-400 to-orange-400',
  'from-pink-400 to-rose-400'
];

/**
 * Travel Twins Matcher
 * Encuentra tu "gemelo de viaje" - personas con itinerarios similares
 */
export const TravelTwinsMatcher = {
  currentUser: null,
  userTrip: null,
  tripId: null,
  myProfile: null,
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
    this.tripId = this.userTrip?.id || window.TripsManager?.currentTrip?.id;

    if (!this.userTrip || !this.tripId) {
      window.Notifications?.show('❌ Necesitas un itinerario activo para encontrar Travel Twins', 'error');
      return;
    }

    const poolSnap = await getDoc(doc(db, 'travelTwinsPool', this.tripId));

    if (!poolSnap.exists()) {
      this.showOptInModal();
      return;
    }

    this.myProfile = poolSnap.data();
    window.Notifications?.show('🔍 Buscando tu Travel Twin...', 'info');
    await this.findMatches();
    this.showMatchesUI();
  },

  /**
   * Modal de opt-in: explica qué se comparte y deja completar/editar el
   * resumen (intereses/ritmo/presupuesto no viven en el documento del viaje,
   * así que se piden aquí una sola vez).
   */
  showOptInModal() {
    const info = this.userTrip.info || {};
    const suggestedUsername = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Viajero';
    const cities = (this.userTrip.cities || []).join(', ');

    const modalHTML = `
      <div id="travelTwinsOptInModal" class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <h2 class="text-2xl font-bold mb-1">👥 Encuentra tu Travel Twin</h2>
            <p class="text-purple-100 text-sm">
              Para buscar viajeros compatibles, compartimos un resumen básico de tu viaje
              (ciudades, fechas, intereses) con otros usuarios - nunca tu itinerario completo
              ni tus notas. Puedes desactivarlo cuando quieras.
            </p>
          </div>
          <form id="travelTwinsOptInForm" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tu nombre (visible para otros)</label>
              <input type="text" name="username" required value="${suggestedUsername}"
                     class="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              📅 ${info.dateStart || '?'} → ${info.dateEnd || '?'}<br/>
              🏙️ ${cities || 'Sin ciudades definidas'}
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tus intereses (elige los que apliquen)</label>
              <div class="grid grid-cols-2 gap-2">
                ${['food', 'culture', 'nature', 'nightlife', 'shopping', 'photography', 'anime', 'history'].map(i => `
                  <label class="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="interests" value="${i}" class="rounded" />
                    ${i}
                  </label>
                `).join('')}
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ritmo del viaje</label>
              <select name="pace" class="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="light">Relajado</option>
                <option value="moderate" selected>Moderado</option>
                <option value="packed">Intenso</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Presupuesto aproximado (¥, opcional)</label>
              <input type="number" name="budget" min="0" step="1000"
                     class="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" class="flex-1 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold" onclick="this.closest('.fixed').remove()">
                Cancelar
              </button>
              <button type="submit" class="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold">
                ✅ Activar y buscar
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('travelTwinsOptInForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.enableMatching(new FormData(e.target));
      document.getElementById('travelTwinsOptInModal')?.remove();
      window.Notifications?.show('🔍 Buscando tu Travel Twin...', 'info');
      await this.findMatches();
      this.showMatchesUI();
    });
  },

  /**
   * Publica el resumen del viaje en el pool de matching (opt-in)
   */
  async enableMatching(formData) {
    const info = this.userTrip.info || {};
    const interests = formData.getAll('interests');
    const budget = Number(formData.get('budget')) || null;
    const username = formData.get('username')?.trim() || 'Viajero';
    const colorIndex = Math.abs(this.tripId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_COLORS.length;

    const profile = {
      ownerId: auth.currentUser.uid,
      username,
      avatar: username.charAt(0).toUpperCase(),
      avatarColor: AVATAR_COLORS[colorIndex],
      dates: { start: info.dateStart || null, end: info.dateEnd || null },
      cities: this.userTrip.cities || [],
      days: (window.TimeUtils && info.dateStart && info.dateEnd)
        ? window.TimeUtils.daysBetween(info.dateStart, info.dateEnd) + 1
        : null,
      budget,
      interests,
      pace: formData.get('pace') || 'moderate'
    };

    await setDoc(doc(db, 'travelTwinsPool', this.tripId), {
      ...profile,
      updatedAt: serverTimestamp()
    });

    this.myProfile = profile;
  },

  /**
   * Desactiva el matching (retira el resumen del viaje del pool público)
   */
  async disableMatching() {
    if (!this.tripId) return;
    await deleteDoc(doc(db, 'travelTwinsPool', this.tripId));
    window.Notifications?.show('👋 Tu viaje ya no es visible para Travel Twins', 'info');
    this.close();
  },

  /**
   * Encuentra matches reales consultando el pool de viajes que optaron por
   * ser visibles (excluye el propio viaje)
   */
  async findMatches() {
    const snap = await getDocs(collection(db, 'travelTwinsPool'));
    const candidates = [];

    snap.forEach(docSnap => {
      if (docSnap.id === this.tripId) return; // no matchear contra uno mismo
      const data = docSnap.data();
      candidates.push({
        id: docSnap.id,
        ownerId: data.ownerId,
        username: data.username,
        avatar: data.avatar,
        avatarColor: data.avatarColor,
        trip: {
          dates: data.dates || {},
          cities: data.cities || [],
          days: data.days || 0,
          budget: data.budget,
          interests: data.interests || [],
          pace: data.pace
        },
        preferences: { language: 'Spanish' }
      });
    });

    this.matches = candidates.map(match => ({
      ...match,
      matchScore: this.calculateMatchScore(match.trip),
      matchReasons: this.getMatchReasons(match.trip)
    }));

    // Ordenar por match score
    this.matches.sort((a, b) => b.matchScore - a.matchScore);
  },

  /**
   * Calcula el score de compatibilidad (0-100)
   */
  calculateMatchScore(otherTrip) {
    let score = 0;
    const mine = this.myProfile;
    if (!mine) return 0;

    // 1. Overlap de fechas (30 puntos)
    const dateOverlap = this.calculateDateOverlap(
      mine.dates?.start,
      mine.dates?.end,
      otherTrip.dates.start,
      otherTrip.dates.end
    );
    score += dateOverlap * 30;

    // 2. Ciudades en común (25 puntos)
    const myCities = mine.cities || [];
    if (myCities.length && otherTrip.cities.length) {
      const commonCities = otherTrip.cities.filter(c => myCities.includes(c));
      score += (commonCities.length / Math.max(myCities.length, otherTrip.cities.length)) * 25;
    }

    // 3. Presupuesto similar (15 puntos) - solo si ambos lo compartieron
    if (mine.budget && otherTrip.budget) {
      const budgetDiff = Math.abs(mine.budget - otherTrip.budget) / mine.budget;
      score += Math.max(0, (1 - budgetDiff) * 15);
    }

    // 4. Intereses compartidos (20 puntos)
    const myInterests = mine.interests || [];
    if (myInterests.length && otherTrip.interests.length) {
      const commonInterests = otherTrip.interests.filter(i => myInterests.includes(i));
      score += (commonInterests.length / Math.max(myInterests.length, otherTrip.interests.length)) * 20;
    }

    // 5. Duración similar (10 puntos)
    if (mine.days && otherTrip.days) {
      const durationDiff = Math.abs(mine.days - otherTrip.days) / mine.days;
      score += Math.max(0, (1 - durationDiff) * 10);
    }

    return Math.round(score);
  },

  /**
   * Calcula overlap de fechas (0-1)
   */
  calculateDateOverlap(start1, end1, start2, end2) {
    if (!start1 || !end1 || !start2 || !end2) return 0;

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

    return totalDays > 0 ? overlapDays / totalDays : 0;
  },

  /**
   * Genera razones del match
   */
  getMatchReasons(otherTrip) {
    const reasons = [];
    const mine = this.myProfile;
    if (!mine) return reasons;

    // Fechas
    const dateOverlap = this.calculateDateOverlap(
      mine.dates?.start,
      mine.dates?.end,
      otherTrip.dates.start,
      otherTrip.dates.end
    );

    if (dateOverlap > 0.8) {
      reasons.push({ icon: '📅', text: 'Mismas fechas de viaje' });
    } else if (dateOverlap > 0.3) {
      reasons.push({ icon: '📅', text: 'Fechas similares' });
    }

    // Ciudades
    const myCities = mine.cities || [];
    const commonCities = otherTrip.cities.filter(c => myCities.includes(c));

    if (commonCities.length > 0) {
      reasons.push({
        icon: '🏙️',
        text: `${commonCities.length} ciudad${commonCities.length > 1 ? 'es' : ''} en común: ${commonCities.join(', ')}`
      });
    }

    // Presupuesto
    if (mine.budget && otherTrip.budget) {
      const budgetDiff = Math.abs(mine.budget - otherTrip.budget) / mine.budget;
      if (budgetDiff < 0.2) {
        reasons.push({ icon: '💰', text: 'Presupuesto similar' });
      }
    }

    // Intereses
    const myInterests = mine.interests || [];
    const commonInterests = otherTrip.interests.filter(i => myInterests.includes(i));

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
          <div class="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <p class="text-center text-sm text-gray-600 dark:text-gray-400">
              💡 Tip: Conecta con viajeros para compartir tips, hacer meetups o compartir gastos
            </p>
            <p class="text-center text-xs">
              <button onclick="window.TravelTwinsMatcher.disableMatching()" class="text-gray-400 hover:text-red-500 underline">
                Dejar de ser visible en Travel Twins
              </button>
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
                  🏙️ ${match.trip.cities.join(' → ') || 'Sin ciudades'}
                </span>
                ${match.trip.budget ? `
                  <span class="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold">
                    💰 ¥${Math.round(match.trip.budget / 1000)}K
                  </span>
                ` : ''}
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
                <button onclick="window.TravelTwinsMatcher.sendMessage('${match.ownerId}', '${match.username}')"
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
   * ID determinístico del thread de DM entre dos usuarios (orden alfabético
   * para que ambos lados calculen el mismo ID sin necesidad de buscarlo)
   */
  threadIdFor(otherUid) {
    return [auth.currentUser.uid, otherUid].sort().join('_');
  },

  /**
   * Envía mensaje a un match (abre el compositor)
   */
  sendMessage(recipientUid, username) {
    const messageHTML = `
      <div id="chatModal" class="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
          <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">💬 Mensaje para @${username}</h3>

          <textarea id="messageText" rows="4"
                    placeholder="Hola! Vi que tenemos itinerarios similares..."
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 dark:bg-gray-700 dark:text-white"></textarea>

          <div class="flex gap-3">
            <button onclick="window.TravelTwinsMatcher.confirmSendMessage('${recipientUid}')"
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

    document.body.insertAdjacentHTML('beforeend', messageHTML);
  },

  /**
   * Confirma envío de mensaje: crea (si hace falta) el thread y escribe el
   * mensaje real en Firestore
   */
  async confirmSendMessage(recipientUid) {
    const text = document.getElementById('messageText')?.value;

    // Validar con InputValidator
    if (window.InputValidator) {
      const validation = window.InputValidator.validate(text, { required: true, minLength: 10 });
      if (!validation.isValid) {
        window.Notifications?.show('❌ Escribe un mensaje de al menos 10 caracteres', 'error');
        return;
      }
    } else if (!text?.trim()) {
      window.Notifications?.show('❌ Escribe un mensaje', 'error');
      return;
    }

    const threadId = this.threadIdFor(recipientUid);

    try {
      await setDoc(doc(db, 'travelTwinsThreads', threadId), {
        participants: [auth.currentUser.uid, recipientUid],
        updatedAt: serverTimestamp()
      }, { merge: true });

      await addDoc(collection(db, 'travelTwinsThreads', threadId, 'messages'), {
        senderId: auth.currentUser.uid,
        text: text.trim(),
        createdAt: serverTimestamp()
      });

      window.Notifications?.show('✅ Mensaje enviado!', 'success');
    } catch (error) {
      console.error('❌ Error enviando mensaje de Travel Twins:', error);
      window.Notifications?.show('❌ No se pudo enviar el mensaje', 'error');
      return;
    }

    if (window.ModalManager) {
      window.ModalManager.closeModal('chatModal');
    } else {
      document.getElementById('chatModal')?.remove();
    }
  },

  /**
   * Ver el resumen de viaje de un match (los itinerarios son privados - solo
   * mostramos lo que ese usuario decidió compartir para el matching)
   */
  viewTrip(matchId) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) {
      window.Notifications?.show('❌ No se encontró ese viaje', 'error');
      return;
    }

    const html = `
      <div id="travelTwinTripModal" class="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br ${match.avatarColor} flex items-center justify-center text-white text-2xl font-bold">
              ${match.avatar}
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">@${match.username}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">${match.matchScore}% compatible</p>
            </div>
          </div>
          <div class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div>📅 ${match.trip.dates.start || '?'} → ${match.trip.dates.end || '?'}</div>
            <div>🏙️ ${match.trip.cities.join(', ') || 'Sin ciudades'}</div>
            ${match.trip.days ? `<div>🗓️ ${match.trip.days} días</div>` : ''}
            ${match.trip.budget ? `<div>💰 Presupuesto aprox: ¥${match.trip.budget.toLocaleString()}</div>` : ''}
            ${match.trip.interests?.length ? `<div>⭐ Intereses: ${match.trip.interests.join(', ')}</div>` : ''}
            ${match.trip.pace ? `<div>🚶 Ritmo: ${match.trip.pace}</div>` : ''}
          </div>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-4 italic">
            Este es el resumen que @${match.username} compartió para Travel Twins - el itinerario completo es privado.
          </p>
          <button class="w-full mt-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold" onclick="this.closest('.fixed').remove()">
            Cerrar
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  },

  /**
   * Cierra el modal
   */
  close() {
    // Usar ModalManager si está disponible
    if (window.ModalManager) {
      window.ModalManager.closeModal('travelTwinsModal');
    } else {
      document.getElementById('travelTwinsModal')?.remove();
    }
  }
};

// Exportar globalmente
window.TravelTwinsMatcher = TravelTwinsMatcher;

console.log('✅ Travel Twins Matcher loaded');

export default TravelTwinsMatcher;
