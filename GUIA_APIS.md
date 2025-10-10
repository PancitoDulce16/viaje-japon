# 🔌 GUÍA DE INTEGRACIÓN DE APIs

## 📋 APIs Disponibles

1. **Aviation Stack** - Información de vuelos en tiempo real
2. **Lite API** - Búsqueda y reserva de hoteles
3. **Geoapify** - Mapas, rutas y lugares
4. **Foursquare** - Restaurantes, bares y atracciones

---

## ✈️ AVIATION STACK - Vuelos

### Buscar Información de Vuelo

```javascript
// Buscar por número de vuelo
const vuelo = await APIsIntegration.searchFlights('AM58');

// Resultado:
{
  flight_date: "2026-02-16",
  flight_status: "scheduled",
  departure: {
    airport: "Monterrey",
    iata: "MTY",
    terminal: "A",
    gate: "12",
    scheduled: "2026-02-16T10:30:00+00:00"
  },
  arrival: {
    airport: "Narita International",
    iata: "NRT",
    terminal: "1",
    gate: "45",
    scheduled: "2026-02-17T15:30:00+00:00"
  },
  airline: {
    name: "Aeromexico",
    iata: "AM"
  },
  flight: {
    number: "58",
    iata: "AM58"
  }
}
```

### Verificar Estado de Vuelo

```javascript
// Verificar si un vuelo está a tiempo
const status = await APIsIntegration.getFlightStatus('AM58', '2026-02-16');

console.log(status.flight_status); // "on_time", "delayed", "cancelled"
```

### Uso en el Wizard

```javascript
// Cuando el usuario ingresa un número de vuelo, autocompletar info
document.getElementById('outboundFlightNumber').addEventListener('blur', async function() {
  const flightNumber = this.value;
  
  if (flightNumber) {
    const info = await APIsIntegration.searchFlights(flightNumber);
    
    if (info && info.data && info.data.length > 0) {
      const flight = info.data[0];
      
      // Autocompletar campos
      document.getElementById('outboundOrigin').value = flight.departure.iata;
      document.getElementById('outboundDestination').value = flight.arrival.iata;
      
      // Mostrar notificación
      Notifications.success(`✈️ Vuelo ${flightNumber} encontrado!`);
    }
  }
});
```

---

## 🏨 LITE API - Hoteles

### Buscar Hoteles

```javascript
// Buscar hoteles en Tokyo
const hoteles = await APIsIntegration.searchHotels(
  'TYO',           // Código de ciudad
  '2026-02-16',    // Check-in
  '2026-02-20',    // Check-out
  2                // Número de huéspedes
);

// Resultado:
{
  hotels: [
    {
      id: "hotel_123",
      name: "APA Hotel Shinjuku",
      address: "3-10-3 Shinjuku, Tokyo",
      rating: 4.5,
      price: {
        amount: 15000,
        currency: "JPY"
      },
      amenities: ["WiFi", "Breakfast", "Parking"],
      photos: ["url1", "url2"]
    },
    // ... más hoteles
  ]
}
```

### Ver Detalles de Hotel

```javascript
const detalles = await APIsIntegration.getHotelDetails('hotel_123');

console.log(detalles.name);        // "APA Hotel Shinjuku"
console.log(detalles.description); // Descripción completa
console.log(detalles.facilities);  // Instalaciones
console.log(detalles.location);    // Coordenadas GPS
```

### Ver Reviews

```javascript
const reviews = await APIsIntegration.getHotelReviews('hotel_123');

reviews.forEach(review => {
  console.log(`⭐ ${review.rating}/5 - ${review.comment}`);
});
```

### Integrar en el Sistema

```javascript
// Agregar botón de buscar hoteles en cada día del itinerario
function renderDayWithHotels(day) {
  return `
    <div class="day-container">
      <h3>Día ${day.day}</h3>
      
      <button onclick="buscarHotelesCerca('${day.location}', '${day.date}')">
        🏨 Buscar Hoteles
      </button>
      
      <!-- Actividades del día -->
    </div>
  `;
}

async function buscarHotelesCerca(location, date) {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  const hoteles = await APIsIntegration.searchHotels(
    location,
    date,
    nextDay.toISOString().split('T')[0],
    2
  );
  
  // Mostrar resultados en modal
  mostrarModalHoteles(hoteles);
}
```

---

## 📍 GEOAPIFY - Mapas y Lugares

### Buscar Lugares

```javascript
// Buscar templos cerca de Tokyo
const lugares = await APIsIntegration.searchPlaces(
  'temple',                      // Búsqueda
  { lat: 35.6762, lng: 139.6503 }, // Tokyo
  5000                           // Radio en metros
);

// Resultado:
{
  features: [
    {
      properties: {
        name: "Senso-ji Temple",
        address_line1: "2-3-1 Asakusa",
        categories: ["building.place_of_worship"],
        distance: 245,
        rating: 4.8
      },
      geometry: {
        coordinates: [139.7967, 35.7148]
      }
    },
    // ... más lugares
  ]
}
```

### Calcular Ruta entre Actividades

```javascript
// Calcular ruta entre dos actividades
const start = { lat: 35.7148, lng: 139.7967 }; // Senso-ji
const end = { lat: 35.6595, lng: 139.7004 };   // Shibuya

const ruta = await APIsIntegration.getRoute(start, end, 'transit');

console.log(ruta.features[0].properties.distance); // Distancia en metros
console.log(ruta.features[0].properties.time);     // Tiempo en segundos
console.log(ruta.features[0].properties.mode);     // Modo de transporte
```

### Optimizar Itinerario por Distancia

```javascript
async function optimizarDia(actividades) {
  // Calcular matriz de distancias
  const distancias = [];
  
  for (let i = 0; i < actividades.length; i++) {
    distancias[i] = [];
    for (let j = 0; j < actividades.length; j++) {
      if (i !== j) {
        const ruta = await APIsIntegration.getRoute(
          actividades[i].location,
          actividades[j].location,
          'transit'
        );
        distancias[i][j] = ruta.features[0].properties.distance;
      }
    }
  }
  
  // Algoritmo simple de optimización (nearest neighbor)
  let ordenOptimo = [0];
  let visitados = new Set([0]);
  
  while (ordenOptimo.length < actividades.length) {
    const ultimo = ordenOptimo[ordenOptimo.length - 1];
    let minDist = Infinity;
    let siguiente = -1;
    
    for (let i = 0; i < actividades.length; i++) {
      if (!visitados.has(i) && distancias[ultimo][i] < minDist) {
        minDist = distancias[ultimo][i];
        siguiente = i;
      }
    }
    
    ordenOptimo.push(siguiente);
    visitados.add(siguiente);
  }
  
  // Reordenar actividades
  return ordenOptimo.map(i => actividades[i]);
}
```

---

## 🍽️ FOURSQUARE - Restaurantes y Lugares

### Buscar Restaurantes

```javascript
// Buscar ramen shops cerca
const restaurantes = await APIsIntegration.searchVenues(
  'ramen',
  { lat: 35.6762, lng: 139.6503 },
  1000
);

// Resultado:
{
  results: [
    {
      fsq_id: "venue_123",
      name: "Ichiran Ramen Shibuya",
      location: {
        address: "1-22-7 Jinnan",
        locality: "Shibuya",
        formatted_address: "1-22-7 Jinnan, Shibuya, Tokyo"
      },
      categories: [
        {
          id: 13145,
          name: "Ramen Restaurant"
        }
      ],
      distance: 245,
      rating: 8.9,
      price: 2,
      hours: {
        display: "Open 24 hours"
      }
    },
    // ... más restaurantes
  ]
}
```

### Ver Detalles de Restaurante

```javascript
const detalles = await APIsIntegration.getVenueDetails('venue_123');

console.log(detalles.name);           // Nombre
console.log(detalles.rating);         // Rating 0-10
console.log(detalles.price);          // 1-4 ($-$$$$)
console.log(detalles.hours);          // Horarios
console.log(detalles.tips);           // Tips de usuarios
console.log(detalles.popular_hours);  // Horas más concurridas
```

### Ver Fotos

```javascript
const fotos = await APIsIntegration.getVenuePhotos('venue_123');

fotos.forEach(foto => {
  console.log(foto.prefix + '300x300' + foto.suffix);
});
```

### Sugerir Restaurantes Automáticamente

```javascript
async function sugerirRestaurantesParaDia(dia, actividades) {
  // Calcular ubicación promedio de actividades del día
  const latPromedio = actividades.reduce((sum, act) => sum + act.location.lat, 0) / actividades.length;
  const lngPromedio = actividades.reduce((sum, act) => sum + act.location.lng, 0) / actividades.length;
  
  // Buscar restaurantes cerca
  const restaurantes = await APIsIntegration.findNearbyRestaurants(
    { lat: latPromedio, lng: lngPromedio },
    1000
  );
  
  // Filtrar por rating alto
  const topRestaurantes = restaurantes.results
    .filter(r => r.rating >= 8.0)
    .slice(0, 5);
  
  return topRestaurantes;
}
```

### Encontrar Atracciones Cercanas

```javascript
const atracciones = await APIsIntegration.findNearbyAttractions(
  { lat: 35.6762, lng: 139.6503 },
  2000
);

// Filtrar por categoría
const museos = atracciones.results.filter(a => 
  a.categories.some(c => c.name.includes('Museum'))
);
```

---

## 🔄 INTEGRACIÓN COMPLETA - Ejemplo

### Crear Actividad con Datos Reales

```javascript
async function crearActividadCompleta(nombre, ubicacion) {
  // 1. Buscar en Foursquare
  const venues = await APIsIntegration.searchVenues(nombre, ubicacion);
  
  if (!venues || !venues.results || venues.results.length === 0) {
    Notifications.warning('No se encontró el lugar');
    return null;
  }
  
  const venue = venues.results[0];
  
  // 2. Obtener detalles
  const detalles = await APIsIntegration.getVenueDetails(venue.fsq_id);
  
  // 3. Obtener fotos
  const fotos = await APIsIntegration.getVenuePhotos(venue.fsq_id);
  
  // 4. Crear actividad completa
  const actividad = {
    id: `activity_${Date.now()}`,
    name: venue.name,
    description: detalles.description || '',
    location: {
      lat: venue.geocodes.main.latitude,
      lng: venue.geocodes.main.longitude
    },
    address: venue.location.formatted_address,
    category: mapearCategoria(venue.categories[0].name),
    duration: estimarDuracion(venue.categories[0].name),
    cost: venue.price ? venue.price * 1000 : 0, // Convertir a JPY
    rating: venue.rating / 2, // Convertir de 0-10 a 0-5
    hours: detalles.hours?.display,
    photos: fotos.slice(0, 3).map(f => f.prefix + '300x300' + f.suffix),
    tips: detalles.tips?.slice(0, 3),
    foursquareId: venue.fsq_id
  };
  
  return actividad;
}

function mapearCategoria(foursquareCategory) {
  const mapa = {
    'Ramen Restaurant': 'food',
    'Temple': 'culture',
    'Museum': 'culture',
    'Park': 'nature',
    'Shopping Mall': 'shopping',
    'Bar': 'nightlife'
  };
  
  return mapa[foursquareCategory] || 'culture';
}

function estimarDuracion(categoria) {
  const duraciones = {
    'Restaurant': 90,
    'Temple': 60,
    'Museum': 120,
    'Park': 90,
    'Shopping Mall': 180
  };
  
  return duraciones[categoria] || 60;
}
```

### Botón de "Buscar en Foursquare"

```javascript
// Agregar a itinerary-builder-part2.js
async function buscarEnFoursquare() {
  const nombre = document.getElementById('customActivityName').value;
  const ciudad = document.getElementById('customActivityCity').value;
  
  if (!nombre || !ciudad) {
    Notifications.warning('Ingresa nombre y ciudad primero');
    return;
  }
  
  // Obtener coordenadas de la ciudad
  const coordenadas = {
    'tokyo': { lat: 35.6762, lng: 139.6503 },
    'kyoto': { lat: 35.0116, lng: 135.7681 },
    'osaka': { lat: 34.6937, lng: 135.5023 }
  };
  
  const ubicacion = coordenadas[ciudad];
  
  if (!ubicacion) {
    Notifications.warning('Ciudad no soportada');
    return;
  }
  
  Notifications.info('🔍 Buscando en Foursquare...');
  
  const actividad = await crearActividadCompleta(nombre, ubicacion);
  
  if (actividad) {
    // Autocompletar formulario
    document.getElementById('customActivityDescription').value = actividad.description;
    document.getElementById('customActivityDuration').value = actividad.duration;
    document.getElementById('customActivityCost').value = actividad.cost;
    document.getElementById('customActivityLocation').value = actividad.address;
    
    // Seleccionar categoría
    document.getElementById('customActivityCategory').value = actividad.category;
    
    Notifications.success('✅ Información autocompleta desde Foursquare!');
  }
}
```

---

## 🎯 CASOS DE USO COMPLETOS

### Caso 1: Planificar Día Completo

```javascript
async function planificarDiaCompleto(ciudad, fecha) {
  const ubicacion = obtenerCoordenadasCiudad(ciudad);
  
  // 1. Buscar atracciones principales
  const atracciones = await APIsIntegration.findNearbyAttractions(ubicacion, 5000);
  
  // 2. Buscar restaurantes para almuerzo
  const restaurantesAlmuerzo = await APIsIntegration.findNearbyRestaurants(ubicacion, 2000);
  
  // 3. Buscar lugares para cena
  const restaurantesCena = await APIsIntegration.findNearbyRestaurants(ubicacion, 3000);
  
  // 4. Crear itinerario
  const itinerario = [
    {
      time: '09:00',
      activity: atracciones.results[0], // Principal atracción
      type: 'attraction'
    },
    {
      time: '12:00',
      activity: restaurantesAlmuerzo.results[0], // Almuerzo
      type: 'restaurant'
    },
    {
      time: '14:00',
      activity: atracciones.results[1], // Segunda atracción
      type: 'attraction'
    },
    {
      time: '18:00',
      activity: restaurantesCena.results[0], // Cena
      type: 'restaurant'
    }
  ];
  
  // 5. Calcular rutas entre actividades
  for (let i = 0; i < itinerario.length - 1; i++) {
    const ruta = await APIsIntegration.getRoute(
      itinerario[i].activity.geocodes.main,
      itinerario[i+1].activity.geocodes.main,
      'transit'
    );
    
    itinerario[i].nextRoute = {
      distance: ruta.features[0].properties.distance,
      time: ruta.features[0].properties.time,
      mode: 'transit'
    };
  }
  
  return itinerario;
}
```

### Caso 2: Búsqueda Inteligente

```javascript
async function busquedaInteligente(query, categoria, ciudad) {
  const ubicacion = obtenerCoordenadasCiudad(ciudad);
  
  // Buscar en ambas APIs
  const [foursquare, geoapify] = await Promise.all([
    APIsIntegration.searchVenues(query, ubicacion),
    APIsIntegration.searchPlaces(query, ubicacion)
  ]);
  
  // Combinar resultados
  const resultadosCombinados = [
    ...foursquare.results.map(r => ({ ...r, source: 'foursquare' })),
    ...geoapify.features.map(r => ({ ...r.properties, source: 'geoapify' }))
  ];
  
  // Filtrar por categoría si se especificó
  const resultadosFiltrados = categoria 
    ? resultadosCombinados.filter(r => matchCategoria(r, categoria))
    : resultadosCombinados;
  
  // Ordenar por relevancia
  resultadosFiltrados.sort((a, b) => {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    return ratingB - ratingA;
  });
  
  return resultadosFiltrados;
}
```

---

## 🚀 SIGUIENTE NIVEL

### Implementar estas integraciones en el sistema:

1. **En el Wizard**: Autocompletar vuelos con Aviation Stack
2. **En Actividades**: Buscar con Foursquare al escribir
3. **En el Mapa**: Mostrar lugares de Geoapify
4. **En Hotels**: Integrar búsqueda de Lite API
5. **En Optimización**: Usar rutas de Geoapify

**¡Las APIs están listas para usar! Solo necesitas conectarlas con la UI!** 🎉
