# >à PLAN COMPLETO: MINI IA PARA JAPAN ITINERARY PLANNER

## <¯ OBJETIVO
Crear una inteligencia artificial **propia** sin usar APIs externas (no ChatGPT, no Gemini).
Todo el aprendizaje y decisiones se hacen DENTRO de la app.

---

## =Ê NIVEL 1: MACHINE LEARNING BÁSICO (YA TENEMOS ALGO)

###  1. Sistema de Aprendizaje por Refuerzo Simple
**Qué hace:** La app aprende de las acciones del usuario
**Cómo funciona:**
- Usuario completa/salta/edita actividades ’ App guarda en localStorage
- App calcula pesos para cada categoría/interés
- Próximo itinerario usa esos pesos para mejorar recomendaciones

**Ya implementado en:** `smart-itinerary-generator.js:1460-1621`

### <• 2. Predictor de Preferencias (NUEVO)
**Qué hace:** Predice qué le gustará al usuario ANTES de que lo haga
**Algoritmo:**
```javascript
// Análisis de patrones
if (usuario completó 8/10 templos) {
  confianza_templos = 80%
  próximo_itinerario += más templos
}

if (usuario skipeó 3/3 actividades nocturnas) {
  confianza_nightlife = 0%
  próximo_itinerario -= nightlife
}
```

**Implementación:**
- Matriz de preferencias: `{ temples: 0.8, nightlife: 0.1, food: 0.9 }`
- Se actualiza cada acción del usuario
- Se usa para scoring de actividades

---

## >ê NIVEL 2: ALGORITMOS DE OPTIMIZACIÓN

### <• 3. Algoritmo Genético para Rutas Óptimas
**Qué hace:** Encuentra la MEJOR ruta entre actividades (menos tiempo de viaje)
**Cómo funciona:**
```
Generación 1: 100 rutas aleatorias
“
Evaluar: ¿Cuál minimiza tiempo de transporte?
“
Seleccionar: Top 20 mejores rutas
“
"Reproducir": Combinar las mejores rutas
“
Mutación: Cambiar orden de 1-2 actividades
“
Generación 2: 100 nuevas rutas (70% mejores, 30% mutadas)
“
Repetir 50 generaciones
“
Resultado: MEJOR RUTA POSIBLE
```

**Ventajas:**
- Encuentra rutas que un humano no vería
- Se ejecuta en 2-3 segundos
- Mejora con cada generación

### <• 4. Sistema de Recomendación Colaborativo (Sin Backend)
**Qué hace:** "Usuarios como tú también visitaron..."
**Cómo funciona SIN servidor:**
```javascript
// 1. Crear "perfil" del usuario
userProfile = {
  interests: ['culture', 'food'],
  visitedPlaces: ['Senso-ji', 'Tsukiji'],
  age_range: '25-35',
  budget_level: 'moderate'
}

// 2. Comparar con perfiles "sintéticos" pre-calculados
syntheticProfiles = {
  cultural_foodie: { similarity: 0.9, recommends: ['Fushimi Inari', 'Dotonbori'] },
  tech_enthusiast: { similarity: 0.3, recommends: ['Akihabara', 'TeamLab'] },
  ...
}

// 3. Recomendar basado en perfil más similar
if (similarity > 0.7) {
  suggest = syntheticProfiles[bestMatch].recommends
}
```

---

## <¨ NIVEL 3: PROCESAMIENTO DE LENGUAJE NATURAL SIMPLE

### <• 5. Parser de Intención (NLP Básico)
**Qué hace:** Entender comandos del usuario en lenguaje natural
**Sin usar API externa:**
```javascript
// Banco de patrones
patterns = {
  add_cultural: /agrega.*templo|más.*cultura|quiero.*santuario/i,
  make_cheaper: /más.*barato|reduce.*precio|económico/i,
  less_walking: /menos.*caminar|cansado|más.*cerca/i,
  more_food: /más.*comida|hambre|restaurante/i
}

// Analizar input del usuario
userInput = "Agrega más templos al día 3"
“
Match: add_cultural
“
Action: filterActivities(day: 3, category: 'cultural', type: 'temple')
```

**Comandos soportados:**
- "Hazlo más económico"
- "Agrega más tiempo para comida"
- "Reduce las caminatas"
- "Más actividades culturales"
- "Quita actividades nocturnas"

### <• 6. Generador de Descripciones Inteligentes
**Qué hace:** Crea descripciones únicas para cada día
**Sin IA externa:**
```javascript
// Análisis del día
day = {
  activities: [senso_ji, ueno_park, akihabara],
  categories: [cultural: 2, technology: 1],
  budget: 8500,
  distance: 12km
}

// Plantillas inteligentes
templates = {
  cultural_heavy: "Día lleno de historia y tradición en {area}. Visitarás {count} lugares culturales.",
  mixed: "Día equilibrado combinando {cat1} y {cat2}.",
  food_focused: "¡Día gastronómico! Explorarás la escena culinaria de {area}."
}

// Seleccionar template según análisis
if (categories.cultural > 60%) {
  description = templates.cultural_heavy
    .replace('{area}', dominantArea)
    .replace('{count}', countCultural)
}
```

---

## =. NIVEL 4: PREDICCIÓN Y ANÁLISIS

### <• 7. Predictor de Energía y Burnout
**Qué hace:** Predice cuándo el usuario se cansará
**Algoritmo:**
```javascript
energyModel = {
  day1: 100%, // Jetlag, fresh start
  day2: 85%,  // Recuperando
  day3: 95%,  // Peak energy
  day4: 80%,  // Empezando fatiga
  day5: 65%,  // Mid-trip fatiga
  day6: 70%,  // Segundo aire
  day7: 50%   // Cansancio acumulado
}

// Factores adicionales
if (activitiesPerDay > 6) energyLevel -= 10%
if (walking > 15km) energyLevel -= 15%
if (hasRestDay) energyLevel += 20%

// Ajustar itinerario basado en predicción
if (predictedEnergy < 60%) {
  suggestLighterDay()
  addRestTime()
  reduceWalking()
}
```

### <• 8. Detector de Anomalías
**Qué hace:** Detecta itinerarios "raros" o poco realistas
**Ejemplos:**
```javascript
anomalies = {
  too_much_walking: distance_per_day > 20km,
  too_expensive: daily_budget > user_budget * 1.5,
  bad_timing: arrives_after_closing,
  impossible_transit: travel_time > 2_hours,
  over_packed: activities > 8 per day
}

// Auto-corregir
if (anomalies.too_much_walking) {
  removeDistantActivities()
  addTransitBetweenFarPlaces()
}
```

---

## <¯ NIVEL 5: SISTEMA EXPERTO (REGLAS INTELIGENTES)

### <• 9. Motor de Decisiones Basado en Reglas
**Qué hace:** Toma decisiones complejas como un experto
**Reglas:**
```javascript
rules = [
  // Regla 1: Día lluvioso
  {
    if: weather.rain > 70%,
    then: [
      prioritize: ['museums', 'indoor shopping', 'arcades'],
      avoid: ['parks', 'gardens', 'outdoor markets']
    ]
  },

  // Regla 2: Grupo con niños
  {
    if: travelerAges.includes(age < 12),
    then: [
      add: ['aquarium', 'zoo', 'ghibli museum'],
      reduce: activity_duration to 90min,
      increase: rest_breaks by 50%
    ]
  },

  // Regla 3: Budget bajo
  {
    if: dailyBudget < 8000,
    then: [
      prioritize: ['free temples', 'parks', 'walking tours'],
      suggest: '¥100 shops, convenience store meals',
      avoid: ['premium restaurants', 'paid attractions > 2000']
    ]
  },

  // Regla 4: Primera vez en Japón
  {
    if: userProfile.trips_to_japan == 0,
    then: [
      must_include: ['Senso-ji', 'Shibuya Crossing', 'Fushimi Inari'],
      add_tips: ['Get IC card', 'Download Google Translate', 'Bring cash']
    ]
  }
]
```

### <• 10. Análisis de Compatibilidad de Actividades
**Qué hace:** Determina qué actividades funcionan bien juntas
**Matriz de compatibilidad:**
```javascript
compatibility = {
  'temple + garden': 0.9,      // Alta compatibilidad
  'temple + nightlife': 0.2,   // Baja compatibilidad
  'museum + museum': 0.4,      // Puede ser aburrido
  'food market + restaurant': 0.3, // Muy similar
  'shopping + shopping': 0.6,  // OK si son áreas diferentes
  'cultural + nature': 0.8     // Buena variedad
}

// Usar para construir días balanceados
day_activities = selectActivities()
“
checkCompatibility()
“
if (compatibility_score < 0.5) {
  replaceActivity(lowest_scoring)
}
```

---

## =€ NIVEL 6: FUNCIONES AVANZADAS SIN IA

###  11. Sistema de Exportación Multi-Formato
- **YA IMPLEMENTADO** 
- PDF, Google Calendar, Maps, Checklist

###  12. Preview de Presupuesto Real-Time
- **YA IMPLEMENTADO** 
- Cálculo automático + comparación con promedio

### <• 13. Regenerar Solo Un Día
**Qué hace:** Permite regenerar un día específico sin perder el resto
**Flujo:**
```
Usuario: "No me gusta el Día 3"
“
Botón: "= Regenerar este día"
“
Opciones: "Más cultural", "Más económico", "Menos caminata"
“
Regenerar SOLO día 3 con nuevos parámetros
“
Mantener días 1,2,4,5,6,7 intactos
```

### <• 14. Integración de Clima en Tiempo Real
**API:** OpenWeatherMap (gratuita)
**Qué hace:**
- Muestra pronóstico para fechas del viaje
- Alerta: "  Lluvia día 3-4, considera actividades indoor"
- Auto-ajusta: Si lluvia > 70%, cambia outdoor ’ indoor

### <• 15. Modo Colaborativo con Votación
**Sin backend real-time:**
```javascript
// Firebase Realtime Database (gratis)
tripVotes = {
  day1_activity2: {
    votes_yes: 3,
    votes_no: 1,
    voters: ['user1', 'user2', 'user3', 'user4']
  }
}

// UI
[=M 3] [=N 1] Visitar TeamLab Borderless
```

### <• 16. Tracking de Viaje en Vivo
**Qué hace:** Durante el viaje, hacer check-in en actividades
**Flujo:**
```
Durante el viaje:
   "¿Completaste Senso-ji?"
    ’ SÍ: +3 puntos a 'cultural'
    ’ NO: ¿Por qué? (muy lejos, muy caro, no interesante)

  P "¿Te gustó?" (1-5 estrellas)
    ’ 5 estrellas: aumentar peso de categoría
    ’ 1-2 estrellas: reducir peso

  =P "¿Cuánto tiempo te tomó?"
    ’ Actualizar estimaciones para futuros viajeros

Después del viaje:
  ’ Mini IA aprende de TODA la experiencia
  ’ Próximo itinerario será 50% mejor
```

### <• 17. Simulador de Ritmo Visual
**Qué hace:** Muestra gráfico de intensidad hora por hora
**Visualización:**
```
Día 3:
9am  ˆˆˆˆˆˆˆˆ‘‘ (80% intensidad - Templo)
11am ˆˆˆˆˆ‘‘‘‘‘ (50% - Jardín relajado)
1pm  ˆˆˆˆˆˆˆˆˆˆ (100% - Rush hour en Shibuya)
3pm  ˆˆˆˆˆˆ‘‘‘‘ (60% - Shopping)
6pm  ˆˆˆˆˆˆˆˆ‘‘ (80% - Cena en izakaya)
9pm  ˆˆˆ‘‘‘‘‘‘‘ (30% - Regreso al hotel)

Total walking: 8.5km
Energy needed: 75%
Rest time: 2 hours
```

### <• 18. Comparador Side-by-Side de Variaciones
**Qué hace:** Ver las 3 variaciones lado a lado
**UI:**
```
                 ,                  ,                 
  Variación A      Variación B       Variación C    
  <­ Cultural      <\ Foodie         – Balanced   
                 <                  <                 $
 Día 1:           Día 1:            Día 1:          
 " Senso-ji       " Tsukiji Market  " Meiji Shrine  
 " Ueno Park      " Ramen Tour      " Harajuku      
 " Museum         " Izakaya         " Shibuya       
                                                    
 Presupuesto:     Presupuesto:      Presupuesto:    
 ¥9,000           ¥12,500           ¥10,200         
                                                    
 Caminata:        Caminata:         Caminata:       
 12km             8km               10km            
                 4                  4                 

[Seleccionar A]  [Seleccionar B]   [Seleccionar C]

       O crear híbrido:

[Día 1 de A] + [Día 2 de B] + [Día 3 de C] = Variación Personalizada
```

### <• 19. Sistema de Badges y Gamificación
**Qué hace:** Premios por completar objetivos
**Badges:**
```javascript
badges = {
  temple_hunter: {
    name: "=Õ Temple Hunter",
    description: "Visitaste 10+ templos",
    unlocked: user.temples_visited >= 10
  },

  foodie_master: {
    name: "<\ Foodie Master",
    description: "Probaste 15+ restaurantes diferentes",
    unlocked: user.unique_restaurants >= 15
  },

  early_bird: {
    name: "< Early Bird",
    description: "Empezaste antes de las 8am todos los días",
    unlocked: user.avg_start_time < 8
  },

  budget_master: {
    name: "=° Budget Master",
    description: "Completaste el viaje 20% bajo presupuesto",
    unlocked: user.actual_spent < user.budget * 0.8
  },

  explorer: {
    name: "=ú Explorer",
    description: "Visitaste 3+ ciudades",
    unlocked: user.cities_visited >= 3
  }
}
```

### <• 20. Detector de Multitudes (Google Places API)
**Qué hace:** Evita lugares muy llenos
**API:** Google Places Popular Times (gratis)
**Flujo:**
```javascript
// Consultar Popular Times para Senso-ji
popularTimes = googlePlaces.getPopularTimes('Senso-ji')

// Resultado:
{
  monday: {
    9am: 80%,  // MUY LLENO
    10am: 90%, // PEAK
    11am: 85%,
    3pm: 40%,  // TRANQUILO 
    5pm: 60%
  }
}

// Recomendación inteligente
if (current_plan.senso_ji_time == '10am') {
  alert("  Senso-ji muy lleno a las 10am (90% capacidad)")
  suggest("=¡ Mejor visitar a las 3pm (40% capacidad)")

  // Auto-ajuste
  if (user_accepts) {
    reorderDay(move_senso_ji_to_3pm)
  }
}
```

---

## =È ROADMAP DE IMPLEMENTACIÓN

### FASE 1 (Ya completado )
- [x] Sistema de Exportación
- [x] Preview de Presupuesto Real-Time

### FASE 2 (Core Mini IA)
- [ ] Predictor de Preferencias (ML básico)
- [ ] Motor de Decisiones (Sistema Experto)
- [ ] Detector de Anomalías
- [ ] Análisis de Compatibilidad

### FASE 3 (Optimización)
- [ ] Algoritmo Genético para Rutas
- [ ] Predictor de Energía/Burnout
- [ ] Sistema de Recomendación Colaborativo

### FASE 4 (UX Avanzado)
- [ ] Regenerar Solo Un Día
- [ ] Clima en Tiempo Real
- [ ] Simulador de Ritmo Visual
- [ ] Comparador Side-by-Side

### FASE 5 (Social & Tracking)
- [ ] Modo Colaborativo
- [ ] Tracking de Viaje en Vivo
- [ ] Badges y Gamificación

### FASE 6 (NLP Básico)
- [ ] Parser de Intención
- [ ] Generador de Descripciones
- [ ] Detector de Multitudes

---

## <“ TECNOLOGÍAS REQUERIDAS (Todo Gratis/Local)

### Machine Learning Local
- **TensorFlow.js** - ML en el navegador
- **Brain.js** - Redes neuronales simples en JS
- **LocalStorage** - Guardar modelos entrenados

### Algoritmos
- JavaScript puro (no necesita librerías)
- Algoritmo Genético: implementación propia
- Sistema Experto: if/else inteligentes

### APIs Gratuitas
- OpenWeatherMap: Clima (1000 calls/día gratis)
- Google Places: Popular Times (sin costo en basic)

### Storage
- Firebase Realtime Database (free tier)
- LocalStorage (ilimitado, local)

---

## =¡ RESULTADO FINAL

Una app que:
1. **Aprende** de cada usuario
2. **Predice** lo que le gustará
3. **Optimiza** rutas automáticamente
4. **Detecta** problemas antes de que pasen
5. **Se adapta** en tiempo real
6. **Mejora** con cada viaje

Todo sin usar ChatGPT, Gemini, o cualquier IA externa.

**Es TU Mini IA, corriendo 100% en TU código** =€
