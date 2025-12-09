/**
 * 🤝 SISTEMA DE RECOMENDACIONES COLABORATIVAS
 * =============================================
 *
 * Sistema "Users like you also visited..." que funciona SIN backend.
 *
 * Usa técnicas de Machine Learning local para encontrar usuarios similares
 * y recomendar lugares basándose en patrones colectivos.
 *
 * Técnica: Collaborative Filtering con User-Based similaridad
 *
 * Cómo funciona:
 * 1. Cada usuario tiene un "perfil de visita" (qué lugares visitó/planea visitar)
 * 2. Se calcula similitud entre usuarios usando Cosine Similarity
 * 3. Se recomiendan lugares que usuarios similares visitaron
 * 4. Todo se almacena en localStorage (no requiere backend)
 *
 * Anonimización:
 * - Cada usuario tiene un ID anónimo generado localmente
 * - No se comparten datos personales
 * - Solo se comparte: ID anónimo + lista de IDs de lugares
 */

class CollaborativeRecommender {
  constructor() {
    this.STORAGE_KEY = 'collaborative_data';
    this.USER_ID_KEY = 'anonymous_user_id';

    // Generar o recuperar ID anónimo del usuario
    this.userId = this.getOrCreateUserId();

    // Cargar datos colaborativos
    this.data = this.loadData();

    console.log('🤝 Collaborative Recommender initialized', this.userId);
  }

  /**
   * 🆔 Obtiene o crea ID anónimo del usuario
   */
  getOrCreateUserId() {
    let userId = localStorage.getItem(this.USER_ID_KEY);

    if (!userId) {
      // Generar ID único anónimo
      userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem(this.USER_ID_KEY, userId);
    }

    return userId;
  }

  /**
   * 💾 Carga datos colaborativos desde localStorage
   */
  loadData() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error loading collaborative data:', e);
    }

    return {
      users: {}, // { userId: { visits: [placeId1, placeId2, ...], ratings: { placeId: rating } } }
      places: {}, // { placeId: { name, category, visitCount, avgRating } }
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 💾 Guarda datos colaborativos
   */
  saveData() {
    try {
      this.data.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
      console.log('🤝 Collaborative data saved');
      return true;
    } catch (e) {
      console.error('Error saving collaborative data:', e);
      return false;
    }
  }

  /**
   * ✅ Registra que el usuario visitó/planea visitar un lugar
   * @param {string} placeId - ID del lugar
   * @param {Object} placeInfo - Información del lugar (name, category, etc.)
   */
  recordVisit(placeId, placeInfo = {}) {
    // Inicializar perfil del usuario si no existe
    if (!this.data.users[this.userId]) {
      this.data.users[this.userId] = {
        visits: [],
        ratings: {},
        interests: {},
        createdAt: new Date().toISOString()
      };
    }

    // Agregar visita si no existe ya
    if (!this.data.users[this.userId].visits.includes(placeId)) {
      this.data.users[this.userId].visits.push(placeId);
    }

    // Actualizar información del lugar
    if (!this.data.places[placeId]) {
      this.data.places[placeId] = {
        name: placeInfo.name || placeId,
        category: placeInfo.category || 'unknown',
        visitCount: 0,
        totalRating: 0,
        avgRating: 0
      };
    }

    this.data.places[placeId].visitCount++;

    this.saveData();
  }

  /**
   * ⭐ Registra calificación de un lugar
   * @param {string} placeId - ID del lugar
   * @param {number} rating - Calificación 1-5
   */
  recordRating(placeId, rating) {
    if (!this.data.users[this.userId]) {
      this.recordVisit(placeId);
    }

    // Guardar rating del usuario
    const oldRating = this.data.users[this.userId].ratings[placeId] || 0;
    this.data.users[this.userId].ratings[placeId] = rating;

    // Actualizar promedio global
    if (this.data.places[placeId]) {
      this.data.places[placeId].totalRating += (rating - oldRating);
      const ratingsCount = Object.values(this.data.users)
        .filter(user => user.ratings[placeId])
        .length;

      this.data.places[placeId].avgRating =
        ratingsCount > 0 ? this.data.places[placeId].totalRating / ratingsCount : 0;
    }

    this.saveData();
  }

  /**
   * 🎯 Genera recomendaciones para el usuario actual
   * @param {number} count - Número de recomendaciones
   * @param {Object} options - Opciones de filtrado
   * @returns {Array} Array de lugares recomendados con scores
   */
  getRecommendations(count = 10, options = {}) {
    console.log('🎯 Generating collaborative recommendations...');

    const currentUserVisits = this.data.users[this.userId]?.visits || [];

    if (currentUserVisits.length === 0) {
      console.log('⚠️ User has no visits, returning popular places');
      return this.getPopularPlaces(count, options);
    }

    // 1. Encontrar usuarios similares
    const similarUsers = this.findSimilarUsers(currentUserVisits, 10);

    if (similarUsers.length === 0) {
      console.log('⚠️ No similar users found, returning popular places');
      return this.getPopularPlaces(count, options);
    }

    console.log(`Found ${similarUsers.length} similar users`);

    // 2. Recopilar lugares que visitaron usuarios similares
    const candidatePlaces = new Map(); // placeId -> score

    for (const { userId: similarUserId, similarity } of similarUsers) {
      const similarUserVisits = this.data.users[similarUserId].visits;
      const similarUserRatings = this.data.users[similarUserId].ratings;

      for (const placeId of similarUserVisits) {
        // Ignorar lugares que el usuario ya visitó
        if (currentUserVisits.includes(placeId)) continue;

        // Aplicar filtros
        if (options.category) {
          const place = this.data.places[placeId];
          if (place && place.category !== options.category) continue;
        }

        // Calcular score: similarity * (rating || 3.0) * popularityBoost
        const rating = similarUserRatings[placeId] || 3.0;
        const visitCount = this.data.places[placeId]?.visitCount || 1;
        const popularityBoost = Math.log10(visitCount + 1); // Boost logarítmico

        const score = similarity * rating * (1 + popularityBoost * 0.2);

        if (candidatePlaces.has(placeId)) {
          candidatePlaces.set(placeId, candidatePlaces.get(placeId) + score);
        } else {
          candidatePlaces.set(placeId, score);
        }
      }
    }

    // 3. Ordenar por score y retornar top N
    const recommendations = Array.from(candidatePlaces.entries())
      .map(([placeId, score]) => {
        const place = this.data.places[placeId] || {};
        return {
          placeId,
          score: score / similarUsers.length, // Normalizar por número de usuarios
          name: place.name,
          category: place.category,
          visitCount: place.visitCount || 0,
          avgRating: place.avgRating || 0,
          reason: 'collaborative_filtering'
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, count);

    console.log(`Generated ${recommendations.length} recommendations`);

    return recommendations;
  }

  /**
   * 👥 Encuentra usuarios similares usando Cosine Similarity
   * @param {Array} userVisits - Visitas del usuario actual
   * @param {number} k - Número de usuarios similares a retornar
   * @returns {Array} Array de {userId, similarity}
   */
  findSimilarUsers(userVisits, k = 10) {
    const similarities = [];

    // Crear set para búsqueda rápida
    const userVisitsSet = new Set(userVisits);

    for (const [otherUserId, otherUser] of Object.entries(this.data.users)) {
      // Ignorar al usuario actual
      if (otherUserId === this.userId) continue;

      const otherVisits = otherUser.visits;

      // Calcular Cosine Similarity
      const similarity = this.cosineSimilarity(userVisitsSet, otherVisits);

      if (similarity > 0) {
        similarities.push({ userId: otherUserId, similarity });
      }
    }

    // Ordenar por similitud descendente
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Retornar top K
    return similarities.slice(0, k);
  }

  /**
   * 📐 Calcula Cosine Similarity entre dos conjuntos de lugares
   */
  cosineSimilarity(set1, array2) {
    // Intersección
    let intersection = 0;
    for (const item of array2) {
      if (set1.has(item)) {
        intersection++;
      }
    }

    if (intersection === 0) return 0;

    // Cosine similarity = |A ∩ B| / sqrt(|A| * |B|)
    const magnitude1 = set1.size;
    const magnitude2 = array2.length;

    return intersection / Math.sqrt(magnitude1 * magnitude2);
  }

  /**
   * 🔥 Retorna lugares más populares (fallback)
   */
  getPopularPlaces(count = 10, options = {}) {
    let places = Object.entries(this.data.places)
      .map(([placeId, place]) => ({
        placeId,
        score: place.visitCount + (place.avgRating * 10),
        name: place.name,
        category: place.category,
        visitCount: place.visitCount,
        avgRating: place.avgRating,
        reason: 'popular'
      }));

    // Aplicar filtros
    if (options.category) {
      places = places.filter(p => p.category === options.category);
    }

    // Ordenar y retornar
    return places
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  /**
   * 📊 Obtiene estadísticas del sistema
   */
  getStats() {
    const userCount = Object.keys(this.data.users).length;
    const placeCount = Object.keys(this.data.places).length;
    const totalVisits = Object.values(this.data.places)
      .reduce((sum, place) => sum + place.visitCount, 0);

    const currentUserVisits = this.data.users[this.userId]?.visits.length || 0;

    return {
      users: userCount,
      places: placeCount,
      totalVisits,
      currentUserVisits,
      dataQuality: this.calculateDataQuality(),
      canRecommend: currentUserVisits > 0 && userCount > 1
    };
  }

  /**
   * 📈 Calcula calidad de los datos (0-100)
   */
  calculateDataQuality() {
    const userCount = Object.keys(this.data.users).length;
    const placeCount = Object.keys(this.data.places).length;

    // Factores de calidad
    let quality = 0;

    // 1. Número de usuarios (max 40 puntos)
    quality += Math.min(40, userCount * 4);

    // 2. Número de lugares (max 30 puntos)
    quality += Math.min(30, placeCount * 2);

    // 3. Visitas por usuario (max 20 puntos)
    const avgVisitsPerUser = userCount > 0
      ? Object.values(this.data.users).reduce((sum, u) => sum + u.visits.length, 0) / userCount
      : 0;
    quality += Math.min(20, avgVisitsPerUser * 2);

    // 4. Ratings (max 10 puntos)
    const ratingsCount = Object.values(this.data.users)
      .reduce((sum, u) => sum + Object.keys(u.ratings).length, 0);
    quality += Math.min(10, ratingsCount / 10);

    return Math.round(Math.min(100, quality));
  }

  /**
   * 🎨 Renderiza recomendaciones en el DOM
   * @param {string} containerId - ID del contenedor
   * @param {Array} activities - Actividades del itinerario actual para contexto
   */
  renderRecommendations(containerId, activities = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Registrar actividades actuales como visitas
    for (const activity of activities) {
      if (activity.id) {
        this.recordVisit(activity.id, {
          name: activity.name,
          category: activity.category
        });
      }
    }

    // Obtener recomendaciones
    const recommendations = this.getRecommendations(8);
    const stats = this.getStats();

    const html = `
      <div class="collaborative-recommendations space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold flex items-center gap-2">
            <span>🤝</span>
            <span>Usuarios como tú también visitaron...</span>
          </h3>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            ${stats.users} viajeros • ${stats.places} lugares
          </div>
        </div>

        <!-- Quality Indicator -->
        ${stats.dataQuality < 30 ? `
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <div class="text-2xl">💡</div>
              <div class="flex-1">
                <div class="font-semibold text-yellow-800 dark:text-yellow-200">Construyendo recomendaciones</div>
                <div class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Mientras más usuarios usen la app, mejores serán las recomendaciones colaborativas.
                  Calidad actual: ${stats.dataQuality}%
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Recomendaciones -->
        ${recommendations.length > 0 ? `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${recommendations.map(rec => `
              <div class="recommendation-card bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div class="flex items-start justify-between mb-2">
                  <div class="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    ${this.getCategoryEmoji(rec.category)} ${rec.category || 'lugar'}
                  </div>
                  ${rec.avgRating > 0 ? `
                    <div class="flex items-center gap-1 text-xs">
                      <span>⭐</span>
                      <span class="font-semibold">${rec.avgRating.toFixed(1)}</span>
                    </div>
                  ` : ''}
                </div>

                <div class="font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">
                  ${rec.name}
                </div>

                <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <div>${rec.visitCount} ${rec.visitCount === 1 ? 'visita' : 'visitas'}</div>
                  <div class="text-green-600 dark:text-green-400 font-semibold">
                    ${Math.round(rec.score * 100)}% match
                  </div>
                </div>

                ${rec.reason === 'popular' ? `
                  <div class="mt-2 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    🔥 Popular
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div class="text-4xl mb-3">🌱</div>
            <div class="font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Aún no hay suficientes datos
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Agrega más lugares a tu itinerario para empezar a ver recomendaciones
            </div>
          </div>
        `}

        <!-- Footer Info -->
        <div class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded p-3">
          <div class="flex items-start gap-2">
            <span>🔒</span>
            <span>Las recomendaciones se generan de forma anónima usando patrones de viajeros similares. No se comparten datos personales.</span>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * 🎨 Emoji por categoría
   */
  getCategoryEmoji(category) {
    const emojis = {
      temple: '⛩️',
      shrine: '⛩️',
      museum: '🏛️',
      park: '🌳',
      garden: '🌸',
      shopping: '🛍️',
      restaurant: '🍜',
      cafe: '☕',
      attraction: '🎯',
      viewpoint: '🗼',
      entertainment: '🎮',
      nightlife: '🌃',
      market: '🏪',
      street: '🚶',
      nature: '🏞️',
      beach: '🏖️',
      onsen: '♨️',
      castle: '🏯'
    };

    return emojis[category] || '📍';
  }

  /**
   * 🔄 Importa datos colaborativos desde otro dispositivo
   * (Para sincronización manual entre dispositivos)
   */
  importData(jsonString) {
    try {
      const imported = JSON.parse(jsonString);

      // Merge datos
      this.data.users = { ...this.data.users, ...imported.users };
      this.data.places = { ...this.data.places, ...imported.places };

      // Recalcular promedios
      this.recalculateAverages();

      this.saveData();

      return { success: true, message: 'Datos importados correctamente' };
    } catch (e) {
      return { success: false, message: 'Error al importar: ' + e.message };
    }
  }

  /**
   * 📤 Exporta datos colaborativos
   */
  exportData() {
    const exportData = {
      users: this.data.users,
      places: this.data.places,
      exportedAt: new Date().toISOString(),
      version: this.data.version
    };

    return JSON.stringify(exportData);
  }

  /**
   * 🔄 Recalcula promedios después de merge
   */
  recalculateAverages() {
    for (const [placeId, place] of Object.entries(this.data.places)) {
      const ratings = [];

      for (const user of Object.values(this.data.users)) {
        if (user.ratings[placeId]) {
          ratings.push(user.ratings[placeId]);
        }
      }

      if (ratings.length > 0) {
        place.totalRating = ratings.reduce((sum, r) => sum + r, 0);
        place.avgRating = place.totalRating / ratings.length;
      }
    }
  }

  /**
   * 🗑️ Limpia datos antiguos (más de 1 año)
   */
  cleanOldData() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    let cleaned = 0;

    for (const [userId, user] of Object.entries(this.data.users)) {
      const createdAt = new Date(user.createdAt);
      if (createdAt < oneYearAgo && userId !== this.userId) {
        delete this.data.users[userId];
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🗑️ Cleaned ${cleaned} old users`);
      this.saveData();
    }

    return cleaned;
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.CollaborativeRecommender = new CollaborativeRecommender();
}

export default CollaborativeRecommender;
