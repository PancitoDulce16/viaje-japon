// js/itinerary-intelligence-tier2.js - TIER 2 Advanced Intelligence Features
// Algoritmos avanzados para automatización inteligente del itinerario

import { ItineraryIntelligence } from './itinerary-intelligence.js';

/**
 * TIER 2 Intelligence System
 * Automatización avanzada y resolución inteligente de problemas
 */
export const ItineraryIntelligenceTier2 = {

  /**
   * 🤖 AUTO-RESOLVER DE CONFLICTOS
   * Resuelve automáticamente conflictos de horarios detectados
   */
  async autoResolveConflicts(day, saveCallback) {
    if (!day || !day.activities || day.activities.length < 2) {
      return { success: false, message: 'No hay suficientes actividades para resolver' };
    }

    // Detectar conflictos
    const conflicts = ItineraryIntelligence.detectConflicts(day);

    if (conflicts.length === 0) {
      return { success: false, message: 'No hay conflictos que resolver' };
    }

    const resolvedCount = {
      overlaps: 0,
      tightSchedules: 0,
      longDays: 0
    };

    // Ordenar actividades por tiempo
    const activitiesWithTime = day.activities.filter(a => a.time);
    const sorted = [...activitiesWithTime].sort((a, b) => {
      return this.parseTime(a.time) - this.parseTime(b.time);
    });

    // PASO 1: Resolver overlaps (solapamientos)
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      const currentStart = this.parseTime(current.time);
      const currentEnd = currentStart + (current.duration || 90);
      const nextStart = this.parseTime(next.time);

      // Si hay overlap, mover la siguiente actividad
      if (currentEnd > nextStart) {
        // Calcular nuevo horario: fin de actividad actual + 15 min de buffer
        const newStartMinutes = currentEnd + 15;
        next.time = this.formatTime(newStartMinutes);

        resolvedCount.overlaps++;

        console.log(`✅ Resuelto overlap: "${next.title}" movida a ${next.time}`);
      }
    }

    // PASO 2: Agregar tiempo de traslado entre actividades cercanas
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      const currentEnd = this.parseTime(current.time) + (current.duration || 90);
      const nextStart = this.parseTime(next.time);
      const gap = nextStart - currentEnd;

      // Si el gap es muy pequeño (< 15 min) y hay coordenadas
      if (gap > 0 && gap < 15 && current.coordinates && next.coordinates) {
        const travelInfo = ItineraryIntelligence.estimateTravelTime(current, next);

        if (travelInfo && travelInfo.travelMinutes > gap) {
          // Agregar tiempo de traslado necesario
          const newStartMinutes = currentEnd + Math.ceil(travelInfo.travelMinutes);
          next.time = this.formatTime(newStartMinutes);

          resolvedCount.tightSchedules++;

          console.log(`✅ Agregado tiempo de traslado: "${next.title}" movida a ${next.time}`);
        }
      }
    }

    // PASO 3: Detectar si el día quedó muy largo (> 14h)
    const sortedAfterChanges = [...sorted].sort((a, b) => {
      return this.parseTime(a.time) - this.parseTime(b.time);
    });

    if (sortedAfterChanges.length > 0) {
      const firstStart = this.parseTime(sortedAfterChanges[0].time);
      const lastActivity = sortedAfterChanges[sortedAfterChanges.length - 1];
      const lastEnd = this.parseTime(lastActivity.time) + (lastActivity.duration || 90);
      const totalHours = (lastEnd - firstStart) / 60;

      if (totalHours > 14) {
        resolvedCount.longDays++;
        console.log(`⚠️ El día sigue siendo muy largo (${totalHours.toFixed(1)}h). Considera mover actividades a otro día.`);
      }
    }

    // Guardar cambios
    if (saveCallback) {
      await saveCallback();
    }

    const totalResolved = resolvedCount.overlaps + resolvedCount.tightSchedules;

    return {
      success: totalResolved > 0,
      message: `✅ ${totalResolved} conflicto(s) resuelto(s)`,
      details: resolvedCount,
      warnings: resolvedCount.longDays > 0 ? ['El día sigue siendo muy largo'] : []
    };
  },

  /**
   * 🍽️ AUTO-INSERCIÓN INTELIGENTE DE COMIDAS
   * Analiza el día y sugiere dónde insertar comidas automáticamente
   */
  async autoInsertMeals(day, googlePlacesAPI) {
    if (!day || !day.activities) {
      return { success: false, message: 'Día inválido' };
    }

    const suggestions = [];

    // Configuración de horarios de comidas
    const mealConfigs = {
      breakfast: { start: 7, end: 10, duration: 45, label: 'Desayuno' },
      lunch: { start: 12, end: 14, duration: 60, label: 'Almuerzo' },
      dinner: { start: 18, end: 21, duration: 90, label: 'Cena' }
    };

    // Detectar qué comidas ya tiene el día
    const hasMeal = (type) => {
      return day.activities.some(a => {
        if (a.isMeal) return true;
        const title = (a.title || '').toLowerCase();
        const keywords = {
          breakfast: ['desayuno', 'breakfast', 'brunch'],
          lunch: ['almuerzo', 'lunch', 'comida'],
          dinner: ['cena', 'dinner']
        };
        return keywords[type]?.some(k => title.includes(k));
      });
    };

    // Analizar cada tipo de comida
    for (const [mealType, config] of Object.entries(mealConfigs)) {
      if (hasMeal(mealType)) {
        console.log(`ℹ️ ${config.label} ya existe en el día`);
        continue;
      }

      // Encontrar el mejor slot para esta comida
      const slot = this.findBestMealSlot(day, mealType, config);

      if (slot) {
        // Buscar restaurante cercano si hay actividades con coordenadas
        let nearbyPlace = null;

        if (slot.nearActivity && slot.nearActivity.coordinates && googlePlacesAPI) {
          const searchResult = await googlePlacesAPI.searchNearbyNew({
            lat: slot.nearActivity.coordinates.lat,
            lng: slot.nearActivity.coordinates.lng,
            radius: 500,
            includedTypes: mealType === 'breakfast' ? ['cafe', 'bakery'] : ['restaurant'],
            maxResults: 5
          });

          if (searchResult.success && searchResult.places.length > 0) {
            // Elegir el mejor rated
            nearbyPlace = searchResult.places.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
          }
        }

        suggestions.push({
          mealType,
          label: config.label,
          suggestedTime: slot.time,
          reason: slot.reason,
          nearbyPlace: nearbyPlace,
          slot: slot
        });
      }
    }

    return {
      success: suggestions.length > 0,
      suggestions: suggestions,
      message: suggestions.length > 0
        ? `Encontré ${suggestions.length} sugerencia(s) de comidas`
        : 'No encontré slots adecuados para comidas'
    };
  },

  /**
   * Encuentra el mejor slot para insertar una comida
   */
  findBestMealSlot(day, mealType, config) {
    const activitiesWithTime = day.activities.filter(a => a.time);

    if (activitiesWithTime.length === 0) {
      // Día sin actividades - sugerir horario estándar
      const standardTime = config.start + 1; // Ej: 8am para breakfast
      return {
        time: this.formatTime(standardTime * 60),
        reason: 'Horario estándar (sin actividades en el día)',
        position: 'standalone',
        nearActivity: null
      };
    }

    const sorted = [...activitiesWithTime].sort((a, b) => {
      return this.parseTime(a.time) - this.parseTime(b.time);
    });

    const configStartMinutes = config.start * 60;
    const configEndMinutes = config.end * 60;

    // ESTRATEGIA 1: Buscar gap en el rango ideal de la comida
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      const currentEnd = this.parseTime(current.time) + (current.duration || 90);
      const nextStart = this.parseTime(next.time);
      const gapMinutes = nextStart - currentEnd;

      // Si hay un gap de al menos la duración de la comida + 15 min buffer
      if (gapMinutes >= config.duration + 15) {
        const gapCenter = currentEnd + (gapMinutes / 2);

        // Verificar si el centro del gap cae en el rango ideal de la comida
        if (gapCenter >= configStartMinutes && gapCenter <= configEndMinutes) {
          return {
            time: this.formatTime(Math.floor(gapCenter)),
            reason: `Gap perfecto entre "${current.title}" y "${next.title}"`,
            position: 'between',
            nearActivity: current.coordinates ? current : (next.coordinates ? next : null)
          };
        }
      }
    }

    // ESTRATEGIA 2: Antes de la primera actividad (si está en rango)
    const firstActivity = sorted[0];
    const firstStart = this.parseTime(firstActivity.time);

    if (firstStart > configEndMinutes) {
      // Hay espacio antes de la primera actividad
      const suggestedTime = configStartMinutes + ((configEndMinutes - configStartMinutes) / 2);
      return {
        time: this.formatTime(suggestedTime),
        reason: `Antes de "${firstActivity.title}"`,
        position: 'before',
        nearActivity: firstActivity.coordinates ? firstActivity : null
      };
    }

    // ESTRATEGIA 3: Después de la última actividad (si está en rango)
    const lastActivity = sorted[sorted.length - 1];
    const lastEnd = this.parseTime(lastActivity.time) + (lastActivity.duration || 90);

    if (lastEnd < configEndMinutes) {
      const suggestedTime = Math.max(lastEnd + 15, configStartMinutes);
      if (suggestedTime <= configEndMinutes) {
        return {
          time: this.formatTime(suggestedTime),
          reason: `Después de "${lastActivity.title}"`,
          position: 'after',
          nearActivity: lastActivity.coordinates ? lastActivity : null
        };
      }
    }

    // ESTRATEGIA 4: Buscar el gap más grande, aunque no sea ideal
    let largestGap = { minutes: 0, index: -1 };
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      const currentEnd = this.parseTime(current.time) + (current.duration || 90);
      const nextStart = this.parseTime(next.time);
      const gap = nextStart - currentEnd;

      if (gap > largestGap.minutes) {
        largestGap = { minutes: gap, index: i };
      }
    }

    if (largestGap.minutes >= config.duration) {
      const current = sorted[largestGap.index];
      const next = sorted[largestGap.index + 1];
      const currentEnd = this.parseTime(current.time) + (current.duration || 90);
      const nextStart = this.parseTime(next.time);
      const suggestedTime = currentEnd + 15;

      return {
        time: this.formatTime(suggestedTime),
        reason: `Gap disponible entre actividades (no horario ideal)`,
        position: 'between',
        nearActivity: current.coordinates ? current : (next.coordinates ? next : null)
      };
    }

    return null; // No se encontró slot adecuado
  },

  /**
   * 🕳️ SMART GAP FILLER
   * Detecta huecos en el día y sugiere actividades para llenarlos
   */
  async findSmartGapFillers(day, googlePlacesAPI, options = {}) {
    if (!day || !day.activities || day.activities.length === 0) {
      return { success: false, gaps: [], message: 'No hay actividades para analizar' };
    }

    const {
      minGapMinutes = 60,  // Mínimo 1 hora para sugerir algo
      maxGapMinutes = 360, // Máximo 6 horas
      includeMeals = false // No incluir gaps de comidas
    } = options;

    const activitiesWithTime = day.activities.filter(a => a.time);

    if (activitiesWithTime.length === 0) {
      return { success: false, gaps: [], message: 'No hay actividades con horarios en este día' };
    }

    const sorted = [...activitiesWithTime].sort((a, b) => {
      return this.parseTime(a.time) - this.parseTime(b.time);
    });

    const gaps = [];

    // ============================================================================
    // PASO 1: Detectar gap ANTES de la primera actividad (ej: 9:00am - primera actividad)
    // ============================================================================
    const firstActivity = sorted[0];
    const firstStart = this.parseTime(firstActivity.time);
    const dayStartTime = 9 * 60; // Día típico empieza a las 9:00am

    if (firstStart > dayStartTime + minGapMinutes) {
      const gapMinutes = firstStart - dayStartTime;

      if (gapMinutes <= maxGapMinutes) {
        const gapStartHour = Math.floor(dayStartTime / 60);
        const isMealTime = (gapStartHour >= 7 && gapStartHour < 10) ||
                           (gapStartHour >= 12 && gapStartHour < 14) ||
                           (gapStartHour >= 18 && gapStartHour < 21);

        if (includeMeals || !isMealTime) {
          let suggestions = [];

          if (firstActivity.coordinates && googlePlacesAPI) {
            const activityTypes = gapMinutes < 120 ? ['cafe', 'park'] : ['museum', 'tourist_attraction'];
            const searchResult = await googlePlacesAPI.searchNearbyNew({
              lat: firstActivity.coordinates.lat,
              lng: firstActivity.coordinates.lng,
              radius: 1500,
              includedTypes: activityTypes,
              maxResults: 5
            });

            if (searchResult.success && searchResult.places.length > 0) {
              suggestions = searchResult.places.slice(0, 3).map(place => ({
                name: place.name,
                category: place.category,
                rating: place.rating,
                coordinates: place.coordinates,
                estimatedDuration: Math.min(gapMinutes - 30, 120),
                address: place.address
              }));
            }
          }

          gaps.push({
            startTime: this.formatTime(dayStartTime),
            endTime: firstActivity.time,
            durationMinutes: gapMinutes,
            afterActivity: 'Inicio del día',
            beforeActivity: firstActivity.title,
            suggestions: suggestions,
            type: gapMinutes < 120 ? 'short' : 'long',
            position: 'before'
          });

          console.log(`🕳️ Gap detectado ANTES de primera actividad: ${this.formatTime(dayStartTime)} - ${firstActivity.time} (${gapMinutes}min)`);
        }
      }
    }

    // ============================================================================
    // PASO 2: Analizar gaps ENTRE actividades
    // ============================================================================
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      const currentEnd = this.parseTime(current.time) + (current.duration || 90);
      const nextStart = this.parseTime(next.time);
      const gapMinutes = nextStart - currentEnd;

      // Verificar si el gap es significativo
      if (gapMinutes >= minGapMinutes && gapMinutes <= maxGapMinutes) {
        // Verificar si no es horario típico de comida (para no interferir)
        const gapStartHour = Math.floor(currentEnd / 60);
        const isMealTime = (gapStartHour >= 7 && gapStartHour < 10) ||  // Breakfast
                           (gapStartHour >= 12 && gapStartHour < 14) || // Lunch
                           (gapStartHour >= 18 && gapStartHour < 21);   // Dinner

        if (!includeMeals && isMealTime) {
          console.log(`ℹ️ Gap omitido (horario de comida): ${this.formatTime(currentEnd)} - ${this.formatTime(nextStart)}`);
          continue;
        }

        // Buscar actividades cercanas que encajen en el gap
        let suggestions = [];

        if (current.coordinates && googlePlacesAPI) {
          // Determinar tipo de actividad según el gap duration
          let activityTypes = [];
          let activityDuration = gapMinutes - 30; // Dejar 30 min de buffer

          if (gapMinutes < 120) {
            // Gap corto (< 2h): café, parque, tienda
            activityTypes = ['cafe', 'park', 'shopping_mall'];
          } else {
            // Gap largo (2-4h): museo, templo, atracción
            activityTypes = ['museum', 'tourist_attraction', 'art_gallery'];
          }

          const searchResult = await googlePlacesAPI.searchNearbyNew({
            lat: current.coordinates.lat,
            lng: current.coordinates.lng,
            radius: 1000, // 1km radius
            includedTypes: activityTypes,
            maxResults: 5
          });

          if (searchResult.success && searchResult.places.length > 0) {
            suggestions = searchResult.places.slice(0, 3).map(place => ({
              name: place.name,
              category: place.category,
              rating: place.rating,
              coordinates: place.coordinates,
              estimatedDuration: activityDuration,
              address: place.address
            }));
          }
        }

        gaps.push({
          startTime: this.formatTime(currentEnd),
          endTime: this.formatTime(nextStart),
          durationMinutes: gapMinutes,
          afterActivity: current.title,
          beforeActivity: next.title,
          suggestions: suggestions,
          type: gapMinutes < 120 ? 'short' : 'long',
          position: 'between'
        });
      }
    }

    // ============================================================================
    // PASO 3: Detectar gap DESPUÉS de la última actividad (ej: última actividad - 20:00pm)
    // ============================================================================
    const lastActivity = sorted[sorted.length - 1];
    const lastEnd = this.parseTime(lastActivity.time) + (lastActivity.duration || 90);
    const dayEndTime = 20 * 60; // Día típico termina a las 20:00 (8pm)

    if (lastEnd + minGapMinutes < dayEndTime) {
      const gapMinutes = dayEndTime - lastEnd;

      if (gapMinutes >= minGapMinutes && gapMinutes <= maxGapMinutes) {
        const gapStartHour = Math.floor(lastEnd / 60);
        const isMealTime = (gapStartHour >= 7 && gapStartHour < 10) ||
                           (gapStartHour >= 12 && gapStartHour < 14) ||
                           (gapStartHour >= 18 && gapStartHour < 21);

        if (includeMeals || !isMealTime) {
          let suggestions = [];

          if (lastActivity.coordinates && googlePlacesAPI) {
            const activityTypes = gapMinutes < 120 ? ['cafe', 'bar', 'night_club'] : ['museum', 'shopping_mall', 'tourist_attraction'];
            const searchResult = await googlePlacesAPI.searchNearbyNew({
              lat: lastActivity.coordinates.lat,
              lng: lastActivity.coordinates.lng,
              radius: 1500,
              includedTypes: activityTypes,
              maxResults: 5
            });

            if (searchResult.success && searchResult.places.length > 0) {
              suggestions = searchResult.places.slice(0, 3).map(place => ({
                name: place.name,
                category: place.category,
                rating: place.rating,
                coordinates: place.coordinates,
                estimatedDuration: Math.min(gapMinutes - 30, 120),
                address: place.address
              }));
            }
          }

          gaps.push({
            startTime: this.formatTime(lastEnd),
            endTime: this.formatTime(dayEndTime),
            durationMinutes: gapMinutes,
            afterActivity: lastActivity.title,
            beforeActivity: 'Fin del día',
            suggestions: suggestions,
            type: gapMinutes < 120 ? 'short' : 'long',
            position: 'after'
          });

          console.log(`🕳️ Gap detectado DESPUÉS de última actividad: ${this.formatTime(lastEnd)} - ${this.formatTime(dayEndTime)} (${gapMinutes}min)`);
        }
      }
    }

    console.log(`🕳️ Total de gaps encontrados: ${gaps.length}`);

    return {
      success: gaps.length > 0,
      gaps: gaps,
      message: gaps.length > 0
        ? `Encontré ${gaps.length} hueco(s) que podrías aprovechar`
        : 'No hay huecos significativos en el día'
    };
  },

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  parseTime(timeStr) {
    if (!timeStr) return 540; // Default 09:00
    const parts = String(timeStr).split(':');
    if (parts.length !== 2) return 540;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return 540;
    return hours * 60 + minutes;
  },

  formatTime(minutes) {
    if (!isFinite(minutes) || isNaN(minutes)) minutes = 540;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
};

// Exportar globalmente
window.ItineraryIntelligenceTier2 = ItineraryIntelligenceTier2;

console.log('✅ Itinerary Intelligence TIER 2 cargado - Auto-Resolver, Auto-Meals, Gap Filler');

export default ItineraryIntelligenceTier2;
