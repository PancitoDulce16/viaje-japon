# 🧠 CORE INTELLIGENCE - FASE 1: PLAN DE IMPLEMENTACIÓN TÉCNICA

Este documento detalla los pasos técnicos para implementar la **Fase 1: Core Intelligence** del sistema de generación de itinerarios inteligentes, basado en `SMART_ITINERARY_GENERATION.md`.

---

## 1. 🧱 Estructuras de Datos (Data Models)

Necesitamos definir modelos claros para los datos que usaremos. Sugiero empezar con archivos `JSON` o módulos de `JavaScript` que exporten estos datos.

### 1.1. `traveler-profile.js`
Representa el perfil del usuario obtenido del cuestionario.

```javascript
// js/models/traveler-profile.js

export const travelerProfile = {
  group: {
    count: 1, // 1, '2-4', '5-8', '9+'
    type: 'solo', // 'solo', 'couple', 'family', 'friends', 'large_group'
    ages: '26-35', // '18-25', '26-35', '36-50', '51-65', '66+'
  },
  budget: {
    level: 'medium', // 'ultra_low', 'backpacker', 'medium', 'comfort', 'luxury', 'unlimited'
    perDay: 15000, // en JPY
  },
  pace: 'moderate', // 'relaxed', 'moderate', 'intense'
  interests: {
    culture: 8,
    gastronomy: 9,
    nature: 5,
    pop_culture: 3,
    shopping: 6,
    nightlife: 4,
    art: 5,
    adventure: 2,
    photography: 7,
    wellness: 4,
  },
  special_preferences: {
    avoid_crowds: 'depends', // 'yes', 'no', 'depends'
    day_person: 'morning', // 'morning', 'evening'
    dietary: 'none', // 'none', 'vegetarian', 'vegan', 'halal', 'kosher'
    reduced_mobility: false,
    first_time_japan: true,
  },
  trip_details: {
    duration: 10, // en días
    dates: {
        start: '2025-10-10',
        end: '2025-10-20',
    }
  }
};
```

### 1.2. `activities-database.js`
La base de datos de actividades. Debe ser muy detallada.

```javascript
// data/activities-database.js

export const activities = {
  tokyo: [
    {
      id: 'TKY001',
      name: 'Templo Senso-ji',
      area: 'Asakusa',
      categories: ['culture', 'history', 'photography'],
      quality_rating: 4.8,
      cost: 0, // en JPY
      duration: 90, // en minutos
      opening_hours: { start: 6, end: 17 },
      crowd_level: 'high', // 'low', 'medium', 'high', 'very_high'
      best_time: ['early_morning', 'late_afternoon'],
      coordinates: { lat: 35.7147, lon: 139.7967 },
      accessibility: { reduced_mobility_friendly: true },
      tags: ['temple', 'iconic', 'must_see']
    },
    // ... más actividades de Tokyo
  ],
  kyoto: [
    {
      id: 'KYO001',
      name: 'Fushimi Inari-taisha',
      area: 'Fushimi',
      categories: ['culture', 'nature', 'photography', 'adventure'],
      quality_rating: 4.9,
      cost: 0,
      duration: 180,
      opening_hours: { start: 0, end: 24 }, // Abierto 24h
      crowd_level: 'very_high',
      best_time: ['very_early_morning', 'evening'],
      coordinates: { lat: 34.9671, lon: 135.7726 },
      accessibility: { reduced_mobility_friendly: false },
      tags: ['shrine', 'torii_gates', 'hiking']
    },
    // ... más actividades de Kyoto
  ],
  // ... más ciudades
};
```

---

## 2. 🧠 Algoritmos Clave (Pseudocódigo)

Describimos la lógica que impulsará el sistema.

### 2.1. `city-selector.js`
Decide qué ciudades visitar y por cuántos días.

```pseudocode
// js/engine/city-selector.js

function selectCities(profile) {
  const duration = profile.trip_details.duration;
  const interests = profile.interests;
  const first_time = profile.special_preferences.first_time_japan;

  let city_plan = [];

  // Regla base por duración
  if (duration <= 7) city_plan = [{city: 'Tokyo', days: 5}, {city: 'Kyoto', days: 2}];
  else if (duration <= 10) city_plan = [{city: 'Tokyo', days: 4}, {city: 'Kyoto', days: 3}, {city: 'Osaka', days: 2}];
  // ... otras reglas de duración

  // Ajuste por intereses (ejemplo simple)
  if (interests.gastronomy > 8) {
    // Aumentar días en Osaka
    const osaka = city_plan.find(c => c.city === 'Osaka');
    if (osaka) osaka.days += 1;
    // Disminuir en otro lugar si es necesario
  }

  // Ajuste para repetidores
  if (!first_time) {
    // Sugerir ciudades menos comunes como Kanazawa o Takayama
  }

  return city_plan;
}
```

### 2.2. `activity-recommender.js`
Selecciona las mejores actividades para un día específico.

```pseudocode
// js/engine/activity-recommender.js

function recommendActivitiesForDay(day, city, profile, existingActivities) {
  const all_activities = ACTIVITIES_DATABASE[city];
  const pace = profile.pace;
  const budget_per_day = profile.budget.perDay;

  // 1. Calcular "match_score" para cada actividad
  all_activities.forEach(activity => {
    let score = 0;
    for (const category in profile.interests) {
      if (activity.categories.includes(category)) {
        score += profile.interests[category]; // Ponderar por el interés del usuario
      }
    }
    activity.match_score = score;
  });

  // 2. Filtrar actividades ya usadas o que no encajan
  let candidate_activities = all_activities.filter(act => !existingActivities.includes(act.id));
  // ...otros filtros (horarios, accesibilidad, etc.)

  // 3. Ordenar por score
  candidate_activities.sort((a, b) => b.match_score - a.match_score);

  // 4. Seleccionar N actividades según el ritmo ('pace')
  const num_activities = (pace === 'relaxed') ? 2 : (pace === 'moderate') ? 4 : 6;
  let selected_activities = candidate_activities.slice(0, num_activities);

  // 5. Optimización geográfica (versión simple)
  // Agrupar actividades que estén en la misma "area"
  selected_activities = groupActivitiesByArea(selected_activities);

  // 6. Validar presupuesto
  let total_cost = selected_activities.reduce((sum, act) => sum + act.cost, 0);
  if (total_cost > budget_per_day) {
    // Reemplazar actividades caras por alternativas más baratas
    selected_activities = adjustForBudget(selected_activities, budget_per_day);
  }

  return selected_activities;
}
```

### 2.3. `day-scheduler.js`
Organiza las actividades seleccionadas en un horario realista.

```pseudocode
// js/engine/day-scheduler.js

function scheduleDay(activities, profile) {
  // Ordenar geográficamente para minimizar transporte
  const sorted_activities = optimizeRoute(activities);

  let schedule = [];
  let current_time = (profile.day_person === 'morning') ? 8 : 10; // 8:00 o 10:00

  for (const activity of sorted_activities) {
    // Validar si la actividad está abierta a la hora actual
    if (current_time < activity.opening_hours.start) {
        current_time = activity.opening_hours.start;
    }

    schedule.push({
      activity_id: activity.id,
      start_time: current_time,
      end_time: current_time + (activity.duration / 60)
    });

    // Añadir duración de la actividad
    current_time += (activity.duration / 60);

    // Añadir buffer de tiempo y transporte (simplificado)
    current_time += 0.5; // 30 mins
  }

  // Detectar conflictos
  if (isOverloaded(schedule)) {
    // Marcar el día como "intenso" o sugerir quitar una actividad
    // ...
  }

  return schedule;
}
```

---

## 3. 🚀 Pasos para el Prototipo (MVP)

1.  **Crear los archivos de estructura de datos**:
    *   `js/models/traveler-profile.js`
    *   `data/activities-database.js` (con al menos 10-15 actividades para Tokyo y Kyoto para empezar).

2.  **Implementar el `city-selector`**:
    *   Crear el archivo `js/engine/city-selector.js`.
    *   Implementar la función `selectCities` basándose en el pseudocódigo.

3.  **Implementar el `activity-recommender`**:
    *   Crear el archivo `js/engine/activity-recommender.js`.
    *   Implementar la función `recommendActivitiesForDay`. El `match_score` es la parte más importante. La optimización geográfica y de presupuesto puede ser muy básica al principio.

4.  **Implementar el `day-scheduler`**:
    *   Crear el archivo `js/engine/day-scheduler.js`.
    *   Implementar la función `scheduleDay`. La clave es manejar el `current_time` correctamente.

5.  **Crear un archivo `main-generator.js` para orquestar el proceso**:
    *   Este archivo importará los módulos anteriores.
    *   Tendrá una función principal `generateItinerary(profile)` que:
        1.  Llame a `selectCities` para obtener el plan de ciudades.
        2.  Itere por cada día del viaje.
        3.  Llame a `recommendActivitiesForDay` para obtener las actividades del día.
        4.  Llame a `scheduleDay` para obtener el horario.
        5.  Compile y devuelva el itinerario completo en formato JSON.

6.  **Crear un `test-generator.html` para probar**:
    *   Una página HTML simple con un botón "Generar Itinerario".
    *   Al hacer clic, se ejecutará la función `generateItinerary` con un perfil de prueba.
    *   Mostrará el resultado del itinerario en un `<pre>` tag para poder inspeccionarlo fácilmente.

---

Este plan establece una base sólida para desarrollar la Fase 1. Una vez que este MVP funcione, podremos refinar cada algoritmo y expandir la base de datos.
