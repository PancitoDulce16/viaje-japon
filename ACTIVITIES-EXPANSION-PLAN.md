# 📚 PLAN DE EXPANSIÓN DE ACTIVIDADES

## 🎯 OBJETIVO
Expandir de ~50 actividades a **500+ actividades** bien curadas en 4 semanas

---

## 📊 ESTADO ACTUAL

**Actividades actuales:** ~50 (estimado)
**Ciudades cubiertas:** Tokyo, Kyoto, Osaka, Kamakura, Hakone, Nara (parcial)
**Problema:** Usuario siente opciones muy limitadas

---

## 🚀 ESTRATEGIA DE EXPANSIÓN

### Fase 1: Base de Datos Local Curada (Semana 1)
**Objetivo:** 200+ actividades de alta calidad

#### Por Ciudad:

**TOKYO** (80 actividades)
- **Cultura** (25):
  - Templos: Sensō-ji, Meiji Jingu, Zōjō-ji, Nezu Shrine
  - Museos: Tokyo National Museum, Mori Art Museum, teamLab Borderless, teamLab Planets, Ghibli Museum
  - Históricos: Imperial Palace, Tokyo Tower, Skytree
  - Arte: Mori Art Museum, Nezu Museum, Tokyo Photographic Art Museum

- **Naturaleza** (15):
  - Parques: Yoyogi, Ueno, Shinjuku Gyoen, Rikugien Garden
  - Jardines: Hamarikyu, Koishikawa Korakuen
  - Vistas: Mt. Takao, Sumida River cruise

- **Shopping** (20):
  - Distritos: Shibuya, Harajuku, Ginza, Akihabara, Shimokitazawa
  - Mercados: Ameyoko, Tsukiji Outer Market
  - Malls: Shibuya 109, Tokyu Hands, Don Quijote

- **Food** (15):
  - Experiencias: Sushi class, Ramen museum, Depachika tours
  - Mercados: Tsukiji, Toyosu, Ameyoko
  - Street food tours

- **Entertainment** (5):
  - Experiencias: Mario Kart tour, Karaoke, Robot Restaurant
  - Nightlife: Shibuya nightlife, Golden Gai

**KYOTO** (60 actividades)
- **Cultura** (30):
  - Templos: Kinkaku-ji, Ginkaku-ji, Kiyomizu-dera, Ryoan-ji, Tofuku-ji, Nanzen-ji, Daigo-ji
  - Shrines: Fushimi Inari, Yasaka Shrine, Shimogamo Shrine
  - Castillos: Nijo Castle
  - Museos: Manga Museum, Railway Museum

- **Naturaleza** (12):
  - Bosques: Arashiyama Bamboo Grove
  - Jardines: Philosopher's Path, Maruyama Park
  - Montañas: Mt. Hiei, Mt. Kurama

- **Experiencias** (10):
  - Geisha district tours (Gion)
  - Tea ceremony
  - Kimono rental
  - Sake brewery tours
  - Pottery class (Kiyomizu-yaki)

- **Shopping** (8):
  - Nishiki Market
  - Teramachi Street
  - Gion shopping

**OSAKA** (40 actividades)
- **Cultura** (10):
  - Osaka Castle
  - Shitenno-ji
  - Sumiyoshi Taisha
  - National Museum of Art

- **Food** (15):
  - Dotonbori street food
  - Kuromon Market
  - Takoyaki class
  - Okonomiyaki restaurants
  - Kushikatsu experience

- **Entertainment** (10):
  - Universal Studios Japan
  - Osaka Aquarium Kaiyukan
  - Umeda Sky Building
  - Nightlife in Namba

- **Shopping** (5):
  - Shinsaibashi
  - Den Den Town (Akihabara de Osaka)
  - Amerikamura

**KAMAKURA** (10 actividades)
- Great Buddha (Kotoku-in)
- Hasedera Temple
- Tsurugaoka Hachimangu
- Enoshima Island
- Beach activities
- Hiking trails
- Komachi-dori shopping

**HAKONE** (8 actividades)
- Hakone Ropeway
- Owakudani volcanic valley
- Pirate ship cruise
- Open-air museum
- Hakone Shrine
- Onsen experiences
- Mt. Fuji views

**NARA** (12 actividades)
- Todai-ji Temple + Great Buddha
- Deer park interaction
- Kasuga Taisha
- Kofuku-ji
- Naramachi district
- Isuien Garden
- Mt. Yoshino (seasonal)

---

### Fase 2: Integración con Google Places API (Semana 2)
**Objetivo:** +200 actividades dinámicas

**Tipos de lugares a buscar:**
```javascript
const SEARCH_TYPES = {
    culture: [
        'museum',
        'art_gallery',
        'tourist_attraction',
        'historical_landmark',
        'place_of_worship',
        'library'
    ],
    nature: [
        'park',
        'natural_feature',
        'hiking_area',
        'garden',
        'zoo',
        'aquarium'
    ],
    shopping: [
        'shopping_mall',
        'clothing_store',
        'book_store',
        'electronics_store',
        'convenience_store',
        'souvenir_shop'
    ],
    food: [
        'restaurant',
        'cafe',
        'bakery',
        'ramen_restaurant',
        'sushi_restaurant',
        'japanese_restaurant',
        'izakaya'
    ],
    entertainment: [
        'night_club',
        'bar',
        'karaoke',
        'bowling_alley',
        'amusement_park',
        'movie_theater',
        'spa'
    ]
};
```

**Implementación:**
```javascript
// En activity-autocomplete.js - EXPANDIR
async function searchActivitiesWithGooglePlaces(query, city) {
    const results = [];

    // 1. Text search en Google Places
    const textResults = await window.GooglePlacesAPI.textSearch({
        query: `${query} ${city} Japan`,
        maxResults: 20
    });

    // 2. Convertir a formato de actividad
    textResults.forEach(place => {
        results.push({
            id: `google-${place.id}`,
            title: place.name,
            description: place.editorial_summary || place.types.join(', '),
            category: detectCategory(place.types),
            coordinates: place.geometry.location,
            rating: place.rating,
            cost: estimateCostFromPriceLevel(place.price_level),
            duration: estimateDurationFromType(place.types[0]),
            address: place.formatted_address,
            source: 'google-places'
        });
    });

    return results;
}
```

---

### Fase 3: Crowdsourcing de Usuarios (Semana 3)
**Objetivo:** +100 actividades únicas

**Features a implementar:**

1. **Formulario "Agregar Actividad Personalizada"**
```javascript
// NUEVO: user-activity-form.js
export async function showAddCustomActivityForm(day) {
    const modal = createModal({
        title: '➕ Agregar Actividad Personalizada',
        content: `
            <form id="customActivityForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium">Nombre de la actividad *</label>
                    <input type="text" name="title" required
                           class="w-full p-2 border rounded"
                           placeholder="Ej: Visita al Café de Gatos">
                </div>

                <div>
                    <label class="block text-sm font-medium">Descripción</label>
                    <textarea name="description" rows="3"
                              class="w-full p-2 border rounded"
                              placeholder="¿Qué hace especial esta actividad?"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium">Categoría *</label>
                        <select name="category" required class="w-full p-2 border rounded">
                            <option value="culture">🏛️ Cultura</option>
                            <option value="nature">🌳 Naturaleza</option>
                            <option value="food">🍜 Comida</option>
                            <option value="shopping">🛍️ Shopping</option>
                            <option value="entertainment">🎉 Entretenimiento</option>
                            <option value="other">🔮 Otro</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Duración (minutos)</label>
                        <input type="number" name="duration" value="60"
                               class="w-full p-2 border rounded">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium">Costo estimado (¥)</label>
                        <input type="number" name="cost" value="0"
                               class="w-full p-2 border rounded">
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Hora sugerida</label>
                        <input type="time" name="time"
                               class="w-full p-2 border rounded">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium">Ubicación (opcional)</label>
                    <input type="text" name="location"
                           class="w-full p-2 border rounded"
                           placeholder="Dirección o nombre del lugar">
                    <button type="button" onclick="selectOnMap()"
                            class="text-sm text-blue-600 mt-1">
                        📍 Seleccionar en mapa
                    </button>
                </div>

                <div class="flex items-center">
                    <input type="checkbox" name="shareWithCommunity" id="shareCheck">
                    <label for="shareCheck" class="ml-2 text-sm">
                        Compartir esta actividad con la comunidad (anónimo)
                    </label>
                </div>

                <div class="flex gap-3 justify-end">
                    <button type="button" onclick="closeModal()"
                            class="px-4 py-2 bg-gray-200 rounded">
                        Cancelar
                    </button>
                    <button type="submit"
                            class="px-4 py-2 bg-blue-600 text-white rounded">
                        ➕ Agregar al Día ${day}
                    </button>
                </div>
            </form>
        `
    });

    document.getElementById('customActivityForm').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const activity = {
            id: `custom-${Date.now()}`,
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            duration: parseInt(formData.get('duration')),
            cost: parseInt(formData.get('cost')),
            time: formData.get('time'),
            customCreated: true,
            createdBy: auth.currentUser.uid,
            createdAt: new Date().toISOString()
        };

        // Geocodificar ubicación si se proporcionó
        if (formData.get('location')) {
            activity.coordinates = await geocodeLocation(formData.get('location'));
        }

        // Agregar al itinerario
        await addActivityToDay(day, activity);

        // Si usuario quiere compartir, guardar en colección global
        if (formData.get('shareWithCommunity')) {
            await saveToGlobalActivities(activity);
        }

        closeModal();
        Notifications.show('✅ Actividad agregada exitosamente', 'success');
    };
}
```

2. **Colección en Firestore para actividades compartidas**
```javascript
// Firestore collection: /shared-activities/{activityId}
{
    id: string,
    title: string,
    description: string,
    category: string,
    city: string,
    coordinates: { lat, lng },
    cost: number,
    duration: number,
    rating: number, // promedio de ratings
    timesUsed: number, // cuántos usuarios la han usado
    createdBy: string (anónimo),
    createdAt: timestamp,
    tags: string[],
    verified: boolean // moderado por admin
}
```

---

### Fase 4: Scraping y Curación (Semana 4)
**Objetivo:** Completar gaps con fuentes confiables

**Fuentes:**
1. **Japan Guide** (japan-guide.com)
2. **Time Out Tokyo/Kyoto/Osaka**
3. **Lonely Planet Japan**
4. **TripAdvisor Top Attractions**
5. **Culture Trip Japan**

**Proceso:**
1. Manual: Revisar "Top 100" de cada fuente
2. Extraer: Nombre, descripción, ubicación, costo estimado
3. Agregar a base de datos con tags

---

## 🏗️ ESTRUCTURA DE DATOS

### Actividad Completa (Schema)

```javascript
{
    // BÁSICO
    id: string,
    title: string,
    description: string,

    // CLASIFICACIÓN
    category: 'culture' | 'nature' | 'food' | 'shopping' | 'entertainment',
    subcategory: string, // 'temple', 'museum', 'park', etc.
    tags: string[], // ['instagram', 'free', 'indoor', 'family-friendly']

    // UBICACIÓN
    city: string,
    coordinates: { lat: number, lng: number },
    address: string,
    neighborhood: string,

    // LOGÍSTICA
    cost: number, // en ¥
    duration: number, // en minutos
    bestTime: 'morning' | 'afternoon' | 'evening' | 'night' | 'any',
    bestSeason: string[], // ['spring', 'autumn']

    // PLANIFICACIÓN
    openingHours: {
        monday: { open: string, close: string, closed: boolean },
        // ... otros días
    },
    crowdLevel: 'low' | 'medium' | 'high' | 'very-high',
    reservationRequired: boolean,
    advanceBookingDays: number, // ej: 30 para Ghibli Museum

    // EXPERIENCIA
    difficulty: 'easy' | 'moderate' | 'challenging',
    accessibility: 'high' | 'medium' | 'low',
    weatherDependent: boolean,
    indoorOutdoor: 'indoor' | 'outdoor' | 'both',

    // SOCIAL
    rating: number, // 0-5
    reviewCount: number,
    timesAdded: number, // cuántos usuarios la han agregado

    // METADATA
    source: 'database' | 'google-places' | 'user-created',
    createdAt: timestamp,
    updatedAt: timestamp,
    verified: boolean,

    // MEDIA
    images: string[], // URLs
    website: string,

    // RELACIONES
    nearbyActivities: string[], // IDs de actividades cercanas
    combinesWith: string[], // IDs de actividades que combinan bien
    alternativeTo: string[] // IDs de alternativas similares
}
```

---

## 🎨 MEJORAS DE UI PARA ACTIVIDADES

### 1. Modal de Búsqueda Mejorado

**Features:**
- Búsqueda por texto con sugerencias en tiempo real
- Filtros avanzados (categoría, costo, duración, rating)
- Vista de mapa con marcadores
- Vista de lista con cards
- "Actividades similares" al seleccionar una
- Historial de búsquedas recientes

### 2. Cards de Actividad Enriquecidos

```html
<div class="activity-card">
    <div class="image-carousel">
        <!-- Fotos -->
    </div>
    <div class="content">
        <h3>Título de Actividad</h3>
        <div class="tags">
            <span class="tag">🏛️ Cultura</span>
            <span class="tag">📸 Instagram</span>
            <span class="tag">⭐ 4.5/5</span>
        </div>
        <p class="description">...</p>
        <div class="details">
            <span>⏱️ 90 min</span>
            <span>💴 ¥2,000</span>
            <span>🌤️ Mejor en primavera</span>
        </div>
        <div class="actions">
            <button class="add-to-day">➕ Agregar</button>
            <button class="view-map">🗺️ Ver en mapa</button>
            <button class="similar">🔍 Similar</button>
        </div>
    </div>
</div>
```

### 3. Vista de Mapa Interactivo

- Mostrar TODAS las actividades disponibles en la ciudad como marcadores
- Colores por categoría
- Cluster cuando hay muchas actividades cercanas
- Click en marcador → popup con info + botón "Agregar"
- Filtrar marcadores por categoría

---

## 📈 MÉTRICAS DE ÉXITO

**Medir el impacto:**

1. **Cantidad de actividades:**
   - Semana 1: 200 actividades
   - Semana 2: 400 actividades
   - Semana 3: 500 actividades
   - Semana 4: 600+ actividades

2. **Uso de actividades:**
   - Promedio de actividades por itinerario aumenta 50%
   - % de actividades de cada fuente usadas

3. **Satisfacción:**
   - "¿Encontraste suficientes opciones de actividades?" → 80%+ "Sí"

---

## 🚧 CHALLENGES Y SOLUCIONES

### Challenge 1: Mantener calidad con cantidad
**Solución:**
- Sistema de verificación con 3 niveles:
  - ✅ Verified (curado manualmente)
  - ⚠️ Unverified (de API o usuarios)
  - 🚫 Hidden (reportado como incorrecto)

### Challenge 2: Actividades duplicadas
**Solución:**
- Deduplicación basada en:
  - Nombre similar (Levenshtein distance)
  - Coordenadas cercanas (<50m)
  - Fusionar automáticamente y mantener mejor info

### Challenge 3: Datos desactualizados
**Solución:**
- Campo `lastVerified` en cada actividad
- Mostrar warning si >6 meses sin verificar
- Permitir a usuarios reportar "Cerrado permanentemente"

---

## 🎯 QUICK WINS (Hacer AHORA)

1. **Crear archivo base:** `data/activities-database.js`
2. **Agregar 50 actividades populares** de Tokyo, Kyoto, Osaka
3. **Integrar con UI existente** de activity-autocomplete
4. **Deploy** y pedir feedback

**Código starter:**
```javascript
// data/activities-database.js
export const ACTIVITIES = {
    tokyo: [
        {
            id: 'senso-ji',
            title: 'Templo Sensō-ji',
            description: 'El templo budista más antiguo de Tokio',
            category: 'culture',
            coordinates: { lat: 35.7148, lng: 139.7967 },
            cost: 0,
            duration: 90,
            bestTime: 'morning',
            tags: ['temple', 'free', 'photo-spot']
        },
        // ... 49 más
    ],
    kyoto: [ /* ... */ ],
    osaka: [ /* ... */ ]
};
```

---

*Última actualización: 2025-11-08*
