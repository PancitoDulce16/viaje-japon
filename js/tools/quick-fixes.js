/* ========================================
   QUICK FIXES - Auto-reparación de Problemas
   Funciones para resolver automáticamente issues del Health Calculator
   ======================================== */

import { ACTIVITIES_DATABASE } from '/data/activities-database.js';
import { db, auth } from '/js/firebase-config.js';
import { doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { Notifications } from '/js/notifications.js';

export class QuickFixes {
  constructor(itinerary, tripId) {
    this.itinerary = itinerary;
    this.tripId = tripId;
  }

  /**
   * QUICK FIX 1: Llenar día vacío
   */
  async fillDay(issue) {
    console.log('🔧 Fixing empty day:', issue.day);

    const day = this.itinerary.days.find(d => d.day === issue.day);
    if (!day) return false;

    // Obtener ciudad del día
    const cityAssignment = this.itinerary.cityDayAssignments?.find(a => a.day === issue.day);
    if (!cityAssignment || !cityAssignment.cities || cityAssignment.cities.length === 0) {
      Notifications.error('No se puede llenar el día: no hay ciudad asignada');
      return false;
    }

    const cityId = cityAssignment.cities[0].cityId;
    const cityData = ACTIVITIES_DATABASE[cityId];

    if (!cityData) {
      Notifications.error('No hay actividades disponibles para esta ciudad');
      return false;
    }

    // Generar 4-5 actividades básicas
    const newActivities = this.generateBasicActivities(cityData, day.day, 4);

    // Agregar al día
    day.activities = newActivities;

    // Guardar cambios
    await this.saveItinerary();

    Notifications.success(`✨ Día ${issue.day} llenado con ${newActivities.length} actividades`);
    return true;
  }

  /**
   * QUICK FIX 2: Resolver conflictos de horarios (overlaps)
   */
  async resolveOverlap(issue) {
    console.log('🔧 Resolving schedule overlap:', issue);

    const day = this.itinerary.days.find(d => d.day === issue.day);
    if (!day || !day.activities) return false;

    const activities = day.activities;

    // Estrategia: reajustar todos los horarios del día secuencialmente
    let currentTime = '09:00';

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const duration = activity.duration || 2; // Default 2 horas

      activity.timeStart = currentTime;
      activity.timeEnd = this.addHoursToTime(currentTime, duration);

      // Siguiente actividad: tiempo actual + duración + 30min buffer
      currentTime = this.addHoursToTime(activity.timeEnd, 0.5);
    }

    await this.saveItinerary();

    Notifications.success('⏰ Horarios reajustados - conflicto resuelto');
    return true;
  }

  /**
   * QUICK FIX 3: Ajustar tiempo de transporte
   */
  async adjustTransportTime(issue) {
    console.log('🔧 Adjusting transport time:', issue);

    const day = this.itinerary.days.find(d => d.day === issue.day);
    if (!day || !day.activities) return false;

    const activities = day.activities;
    const [currentIndex, nextIndex] = issue.activities;

    const current = activities[currentIndex];
    const next = activities[nextIndex];

    if (!current || !next) return false;

    // Calcular distancia
    const distance = this.calculateDistance(
      current.lat, current.lng,
      next.lat, next.lng
    );

    // Estimar tiempo necesario (30 km/h promedio + 10 min buffer)
    const requiredTimeMinutes = Math.ceil((distance / 30) * 60) + 10;
    const requiredHours = requiredTimeMinutes / 60;

    // Ajustar hora de inicio de la siguiente actividad
    next.timeStart = this.addHoursToTime(current.timeEnd, requiredHours);

    // Reajustar las actividades siguientes
    let currentTime = this.addHoursToTime(next.timeEnd, 0.5);

    for (let i = nextIndex + 1; i < activities.length; i++) {
      const act = activities[i];
      act.timeStart = currentTime;
      act.timeEnd = this.addHoursToTime(currentTime, act.duration || 2);
      currentTime = this.addHoursToTime(act.timeEnd, 0.5);
    }

    await this.saveItinerary();

    Notifications.success('🚆 Tiempo de transporte ajustado correctamente');
    return true;
  }

  /**
   * QUICK FIX 4: Balancear día sobrecargado
   */
  async balanceDay(issue) {
    console.log('🔧 Balancing overloaded day:', issue.day);

    const day = this.itinerary.days.find(d => d.day === issue.day);
    if (!day || !day.activities) return false;

    const activities = day.activities;
    const targetCount = 6; // Máximo recomendado

    if (activities.length <= targetCount) return true;

    // Estrategia: remover actividades de menor prioridad
    // Prioridad: Comidas > Actividades icónicas > Resto

    const sortedByPriority = activities.map((act, index) => ({
      ...act,
      originalIndex: index,
      priority: this.calculateActivityPriority(act)
    })).sort((a, b) => b.priority - a.priority);

    // Mantener solo las mejores 6
    const toKeep = sortedByPriority.slice(0, targetCount);

    // Actualizar actividades del día
    day.activities = toKeep.sort((a, b) =>
      this.parseTime(a.timeStart) - this.parseTime(b.timeStart)
    );

    await this.saveItinerary();

    const removed = activities.length - targetCount;
    Notifications.success(`⚖️ Día balanceado: ${removed} actividades removidas`);
    return true;
  }

  /**
   * QUICK FIX 5: Llenar gap largo entre actividades
   */
  async fillGap(issue) {
    console.log('🔧 Filling gap:', issue);

    const day = this.itinerary.days.find(d => d.day === issue.day);
    if (!day || !day.activities) return false;

    const activities = day.activities;
    const gapStartIndex = issue.gapStart;

    const currentActivity = activities[gapStartIndex];
    const nextActivity = activities[gapStartIndex + 1];

    if (!currentActivity || !nextActivity) return false;

    // Obtener ciudad del día
    const cityAssignment = this.itinerary.cityDayAssignments?.find(a => a.day === issue.day);
    if (!cityAssignment || !cityAssignment.cities) return false;

    const cityId = cityAssignment.cities[0].cityId;
    const cityData = ACTIVITIES_DATABASE[cityId];

    if (!cityData) return false;

    // Buscar actividad cercana que encaje en el gap
    const midLat = (currentActivity.lat + nextActivity.lat) / 2;
    const midLng = (currentActivity.lng + nextActivity.lng) / 2;

    const candidateActivity = this.findNearbyActivity(cityData, midLat, midLng);

    if (candidateActivity) {
      // Calcular tiempo de inicio (30 min después de la actividad anterior)
      const newTimeStart = this.addHoursToTime(currentActivity.timeEnd, 0.5);

      const fillerActivity = {
        ...candidateActivity,
        id: `filler-${Date.now()}`,
        day: day.day,
        timeStart: newTimeStart,
        timeEnd: this.addHoursToTime(newTimeStart, candidateActivity.duration || 1.5)
      };

      // Insertar en el gap
      activities.splice(gapStartIndex + 1, 0, fillerActivity);

      await this.saveItinerary();

      Notifications.success('⏱️ Gap llenado con nueva actividad');
      return true;
    }

    Notifications.info('No se encontró actividad adecuada para el gap');
    return false;
  }

  /**
   * QUICK FIX 6: Reducir presupuesto (sugerir alternativas económicas)
   */
  async reduceBudget(issue) {
    console.log('🔧 Reducing budget:', issue);

    // Estrategia: identificar actividades más caras y sugerir alternativas
    let totalSaved = 0;

    for (const day of this.itinerary.days) {
      if (!day.activities) continue;

      for (let i = 0; i < day.activities.length; i++) {
        const activity = day.activities[i];
        const cost = activity.estimatedCost || activity.price || 0;

        // Si la actividad cuesta más de 5000 yen, buscar alternativa
        if (cost > 5000) {
          const cityAssignment = this.itinerary.cityDayAssignments?.find(a => a.day === day.day);
          if (cityAssignment?.cities) {
            const cityId = cityAssignment.cities[0].cityId;
            const cityData = ACTIVITIES_DATABASE[cityId];

            if (cityData) {
              // Buscar actividad similar pero más barata
              const cheaperAlternative = this.findCheaperAlternative(
                cityData,
                activity,
                cost
              );

              if (cheaperAlternative) {
                totalSaved += (cost - (cheaperAlternative.estimatedCost || 0));

                // Reemplazar actividad
                day.activities[i] = {
                  ...cheaperAlternative,
                  day: day.day,
                  timeStart: activity.timeStart,
                  timeEnd: activity.timeEnd
                };
              }
            }
          }
        }
      }
    }

    if (totalSaved > 0) {
      await this.saveItinerary();
      Notifications.success(`💰 Presupuesto optimizado: ¥${totalSaved.toLocaleString()} ahorrados`);
      return true;
    }

    Notifications.info('No se encontraron optimizaciones de presupuesto');
    return false;
  }

  /**
   * QUICK FIX 7: Agregar comida faltante
   */
  async addMeal(issue) {
    console.log('🔧 Adding missing meal:', issue.mealType);

    const day = this.itinerary.days.find(d => d.day === issue.day);
    if (!day) return false;

    // Obtener ciudad del día
    const cityAssignment = this.itinerary.cityDayAssignments?.find(a => a.day === issue.day);
    if (!cityAssignment || !cityAssignment.cities) return false;

    const cityId = cityAssignment.cities[0].cityId;
    const cityData = ACTIVITIES_DATABASE[cityId];

    if (!cityData) return false;

    // Buscar restaurante en la base de datos
    const foodActivities = [];
    Object.values(cityData.categories || {}).forEach(category => {
      if (category.name === 'Food' || category.name === 'Gastronomía') {
        foodActivities.push(...(category.activities || []));
      }
    });

    if (foodActivities.length === 0) {
      Notifications.error('No hay restaurantes disponibles en la base de datos');
      return false;
    }

    // Seleccionar restaurante aleatorio
    const restaurant = foodActivities[Math.floor(Math.random() * foodActivities.length)];

    // Determinar horario según tipo de comida
    const mealTimes = {
      breakfast: '08:00',
      lunch: '13:00',
      dinner: '19:00'
    };

    const timeStart = mealTimes[issue.mealType] || '13:00';
    const timeEnd = this.addHoursToTime(timeStart, 1.5); // 1.5 horas para comer

    const mealActivity = {
      ...restaurant,
      id: `meal-${issue.mealType}-${Date.now()}`,
      day: day.day,
      timeStart,
      timeEnd,
      category: 'Food',
      isMeal: true,
      mealType: issue.mealType
    };

    // Insertar en el orden correcto según horario
    const activities = day.activities || [];
    const insertIndex = activities.findIndex(act =>
      this.parseTime(act.timeStart) > this.parseTime(timeStart)
    );

    if (insertIndex === -1) {
      activities.push(mealActivity);
    } else {
      activities.splice(insertIndex, 0, mealActivity);
    }

    day.activities = activities;

    await this.saveItinerary();

    const mealNames = {
      breakfast: 'Desayuno',
      lunch: 'Almuerzo',
      dinner: 'Cena'
    };

    Notifications.success(`🍱 ${mealNames[issue.mealType]} agregado al Día ${issue.day}`);
    return true;
  }

  /* ========================================
     UTILITY FUNCTIONS
     ======================================== */

  /**
   * Generar actividades básicas para un día vacío
   */
  generateBasicActivities(cityData, dayNumber, count) {
    const allActivities = [];

    // Recopilar todas las actividades de la ciudad
    Object.values(cityData.categories || {}).forEach(category => {
      if (Array.isArray(category.activities)) {
        allActivities.push(...category.activities);
      }
    });

    // Seleccionar actividades al azar
    const shuffled = allActivities.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    // Asignar horarios
    let currentTime = '09:00';
    return selected.map((act, index) => {
      const duration = act.duration || 2;
      const timeStart = currentTime;
      const timeEnd = this.addHoursToTime(currentTime, duration);

      currentTime = this.addHoursToTime(timeEnd, 0.5);

      return {
        ...act,
        id: `${act.id || act.name}-${dayNumber}-${index}`,
        day: dayNumber,
        timeStart,
        timeEnd
      };
    });
  }

  /**
   * Buscar actividad cercana a coordenadas
   */
  findNearbyActivity(cityData, lat, lng) {
    const allActivities = [];

    Object.values(cityData.categories || {}).forEach(category => {
      if (Array.isArray(category.activities)) {
        allActivities.push(...category.activities);
      }
    });

    // Calcular distancias y ordenar por cercanía
    const withDistances = allActivities
      .filter(act => act.lat && act.lng)
      .map(act => ({
        ...act,
        distance: this.calculateDistance(lat, lng, act.lat, act.lng)
      }))
      .sort((a, b) => a.distance - b.distance);

    return withDistances[0];
  }

  /**
   * Buscar alternativa más barata para una actividad
   */
  findCheaperAlternative(cityData, originalActivity, maxCost) {
    const allActivities = [];

    Object.values(cityData.categories || {}).forEach(category => {
      if (Array.isArray(category.activities)) {
        allActivities.push(...category.activities);
      }
    });

    // Buscar actividades de la misma categoría pero más baratas
    const alternatives = allActivities.filter(act => {
      const cost = act.estimatedCost || act.price || 0;
      const sameCategory = act.category === originalActivity.category;
      return sameCategory && cost < maxCost * 0.7; // Al menos 30% más barata
    });

    return alternatives[0];
  }

  /**
   * Calcular prioridad de actividad (para balanceo)
   */
  calculateActivityPriority(activity) {
    let priority = 0;

    // Comidas tienen alta prioridad
    if (activity.category?.includes('Food') || activity.isMeal) {
      priority += 10;
    }

    // Actividades icónicas
    if (activity.iconic || activity.mustSee) {
      priority += 8;
    }

    // Actividades caras (probablemente importantes)
    const cost = activity.estimatedCost || activity.price || 0;
    if (cost > 5000) {
      priority += 3;
    }

    // Actividades con rating alto
    if (activity.rating >= 4.5) {
      priority += 2;
    }

    return priority;
  }

  /**
   * Calcular distancia entre dos puntos (Haversine)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Parse time string to minutes
   */
  parseTime(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Add hours to time string
   */
  addHoursToTime(timeStr, hours) {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = h * 60 + m + (hours * 60);
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  }

  /**
   * Guardar itinerario actualizado en Firebase
   */
  async saveItinerary() {
    try {
      const itineraryRef = doc(db, `trips/${this.tripId}/data`, 'itinerary');
      await updateDoc(itineraryRef, {
        days: this.itinerary.days,
        lastModified: new Date().toISOString(),
        modifiedBy: auth.currentUser.email
      });
      return true;
    } catch (error) {
      console.error('Error saving itinerary:', error);
      Notifications.error('Error al guardar cambios');
      return false;
    }
  }
}

export default QuickFixes;
