# 🔌 GUÍA COMPLETA DE APIS - Ejemplos Prácticos

## 📋 Resumen de APIs Disponibles

1. **✈️ AviationStack** - Información de vuelos en tiempo real
2. **🏨 LiteAPI** - Búsqueda y reserva de hoteles
3. **📍 Foursquare** - Restaurantes, bares y atracciones
4. **🗺️ LocationIQ** - Geocoding (dirección ↔ coordenadas)
5. **🗺️ Geoapify** - Mapas estáticos y rutas
6. **🆓 Nominatim** - Backup gratuito para geocoding

---

## 🚀 CÓMO USAR LAS APIS

### Todas las funciones están disponibles en `window.APIsIntegration`

Puedes probarlas directamente en la consola del navegador (F12):

```javascript
// Ver funciones disponibles
console.log(window.APIsIntegration);

// Probar todas las APIs
await window.APIsIntegration.testAllAPIs();
```

---

## ✈️ VUELOS (AviationStack)

### 1. Buscar información de un vuelo

```javascript
// Buscar vuelo AM58 (Aeroméxico a Japón)
const vuelo = await APIsIntegration.searchFlights('AM58');

console.log(vuelo);
// Resultado:
// {
//   success: true,
//   data: [
//     {
//       flight_date: "2026-02-16",
//       flight_status: "scheduled",
//       departure: {
//         airport: "Monterrey",
//         iata: "MTY",
//         scheduled: "2026-02-16T10:30:00+00:00"
//       },
//       arrival: {
//         airport: "Narita",
//         iata: "NRT",
//         scheduled: "2026-02-17T15:30:00+00:00"
//       },
//       airline: { name: "Aeromexico" }
//     }
//   ]
// }
```

### 2. Buscar vuelo en una fecha específica

```javascript
// Buscar AM58 el 16 de febrero de 2026
const vuelo = await APIsIntegration.searchFlights('AM58', '2026-02-16');
```

### 3. Obtener información de aeropuerto

```javascript
// Información del aeropuerto de Narita (Tokyo)
const aeropuerto = await APIsIntegration.getAirportInfo('NRT');

console.log(aeropuerto.data);
// Resultado incluye: nombre, código IATA, ciudad, país, coordenadas, timezone
```

### 4. Verificar estado de vuelo en tiempo real

```javascript
// Ver si el vuelo está a tiempo
const status = await APIsIntegration.getFlightStatus('AM58', '2026-02-16');

console.log(status.status); // "scheduled", "on_time", "delayed", "cancelled"
console.log(status.departure); // Info de salida
console.log(status.arrival); // Info de llegada
```

---

## 🏨 HOTELES (LiteAPI)

### 1. Buscar hoteles en Tokyo

```javascript
// Buscar hoteles en Tokyo del 16 al 20 de febrero
const hoteles = await APIsIntegration.searchHotels(
  'TYO',          // Código IATA de Tokyo
  '2026-02-16',   // Check-in
  '2026-02-20',   // Check-out
  2               // Número de huéspedes
);

console.log(hoteles);
// {
//   success: true,
//   hotels: [...],  // Lista de hoteles disponibles
//   searchId: "..." // ID para continuar la búsqueda
// }

// Iterar sobre hoteles encontrados
hoteles.hotels.forEach(hotel => {
  console.log(`🏨 ${hotel.name}`);
  console.log(`   💰 ${hotel.rate.totalAmount} USD`);
  console.log(`   📍 ${hotel.address}`);
  console.log(`   ⭐ ${hotel.starRating} estrellas`);
});
```

### 2. Ver detalles de un hotel específico

```javascript
// Obtener detalles completos de un hotel
const detalles = await APIsIntegration.getHotelDetails('hotel_123456');

console.log(detalles.hotel);
// Incluye: fotos, amenidades, políticas, descripciones, ubicación exacta
```

### 3. Obtener ciudades disponibles en Japón

```javascript
// Listar todas las ciudades donde puedes buscar hoteles
const ciudades = await APIsIntegration.getCitiesByCountry('JP');

console.log(ciudades.cities);
// Resultado: lista con Tokyo (TYO), Kyoto (KYO), Osaka (OSA), etc.
```

---

## 📍 LUGARES Y RESTAURANTES (Foursquare)

### 1. Buscar restaurantes cercanos

```javascript
// Coordenadas de Tokyo Tower
const lat = 35.6586;
const lng = 139.7454;

// Buscar restaurantes en un radio de 2km
const restaurantes = await APIsIntegration.searchNearbyPlaces(
  lat,
  lng,
  'restaurant',  // Categoría
  2000          // Radio en metros
);

console.log(restaurantes);
// {
//   success: true,
//   places: [
//     {
//       id: "fsq_id_123",
//       name: "Sushi Dai",
//       category: "Sushi Restaurant",
//       address: "5-2-1 Tsukiji, Chuo-ku, Tokyo",
//       distance: 450, // metros
//       lat: 35.6655,
//       lng: 139.7706,
//       rating: 9.2
//     },
//     ...
//   ]
// }
```

### 2. Buscar diferentes tipos de lugares

```javascript
// Cafés
const cafes = await APIsIntegration.searchNearbyPlaces(lat, lng, 'cafe', 1000);

// Templos
const templos = await APIsIntegration.searchNearbyPlaces(lat, lng, 'temple', 5000);

// Museos
const museos = await APIsIntegration.searchNearbyPlaces(lat, lng, 'museum', 3000);

// Parques
const parques = await APIsIntegration.searchNearbyPlaces(lat, lng, 'park', 2000);

// Bares
const bares = await APIsIntegration.searchNearbyPlaces(lat, lng, 'bar', 1500);

// Atracciones
const atracciones = await APIsIntegration.searchNearbyPlaces(lat, lng, 'attraction', 5000);
```

### 3. Buscar por nombre específico

```javascript
// Buscar "ramen" cerca de Shibuya
const shibuya = { lat: 35.6595, lng: 139.7004 };

const ramen = await APIsIntegration.searchPlacesByQuery(
  shibuya.lat,
  shibuya.lng,
  'ramen',
  1000
);

console.log(`Encontrados ${ramen.places.length} lugares de ramen`);
```

### 4. Ver detalles completos de un lugar

```javascript
// Obtener información detallada
const detalles = await APIsIntegration.getPlaceDetails('fsq_id_123');

console.log(detalles.place);
// Incluye: horarios, fotos, tips, menú, contacto, website, redes sociales
```

---

## 🗺️ GEOCODING (Convertir Direcciones ↔ Coordenadas)

### 1. Convertir dirección a coordenadas

```javascript
// Encontrar coordenadas de Tokyo Tower
const resultado = await APIsIntegration.geocodeAddress('Tokyo Tower, Japan');

console.log(resultado);
// {
//   success: true,
//   lat: 35.6586,
//   lng: 139.7454,
//   displayName: "Tokyo Tower, 4-2-8 Shibakoen, Minato-ku, Tokyo, Japan"
// }

// Probar con tu hotel
const hotel = await APIsIntegration.geocodeAddress('APA Hotel Shinjuku, Tokyo');
console.log(`Coordenadas: ${hotel.lat}, ${hotel.lng}`);
```

### 2. Convertir coordenadas a dirección

```javascript
// ¿Qué hay en estas coordenadas?
const direccion = await APIsIntegration.reverseGeocode(35.6586, 139.7454);

console.log(direccion.address);
// "Tokyo Tower, 4-2-8 Shibakoen, Minato-ku, Tokyo 105-0011, Japan"

console.log(direccion.details);
// {
//   road: "Shibakoen",
//   suburb: "Minato",
//   city: "Tokyo",
//   country: "Japan",
//   postcode: "105-0011"
// }
```

### 3. Autocompletar direcciones mientras escribes

```javascript
// Sugerencias mientras el usuario escribe
const sugerencias = await APIsIntegration.autocompleteAddress('Shibuya');

console.log(sugerencias.suggestions);
// [
//   { displayName: "Shibuya, Tokyo, Japan", lat: ..., lng: ... },
//   { displayName: "Shibuya Station, Tokyo, Japan", lat: ..., lng: ... },
//   { displayName: "Shibuya Crossing, Tokyo, Japan", lat: ..., lng: ... }
// ]
```

---

## 🗺️ MAPAS Y RUTAS (Geoapify)

### 1. Generar mapa estático

```javascript
// Obtener URL de imagen de mapa
const mapaUrl = APIsIntegration.getStaticMapUrl(
  35.6586,  // lat Tokyo Tower
  139.7454, // lng Tokyo Tower
  15        // zoom level
);

// Usar en HTML
document.getElementById('mapa').innerHTML = `
  <img src="${mapaUrl}" alt="Mapa de Tokyo Tower">
`;
```

### 2. Calcular ruta caminando

```javascript
// Desde Shibuya Station hasta Tokyo Tower
const shibuya = { lat: 35.6595, lng: 139.7004 };
const tokyoTower = { lat: 35.6586, lng: 139.7454 };

const ruta = await APIsIntegration.calculateRoute(
  shibuya,
  tokyoTower,
  'walk'  // Opciones: 'walk', 'drive', 'transit'
);

console.log(`Distancia: ${(ruta.distance / 1000).toFixed(2)} km`);
console.log(`Tiempo: ${Math.round(ruta.duration / 60)} minutos`);

// Ver pasos detallados
ruta.steps.forEach((step, i) => {
  console.log(`${i+1}. ${step.instruction} (${step.distance}m)`);
});
```

### 3. Calcular múltiples rutas

```javascript
// Itinerario del día
const lugares = [
  { nombre: 'Hotel', lat: 35.6619, lng: 139.7040 },
  { nombre: 'Tsukiji Market', lat: 35.6655, lng: 139.7706 },
  { nombre: 'Tokyo Tower', lat: 35.6586, lng: 139.7454 },
  { nombre: 'Hotel', lat: 35.6619, lng: 139.7040 }
];

// Calcular rutas entre cada punto
for (let i = 0; i < lugares.length - 1; i++) {
  const ruta = await APIsIntegration.calculateRoute(
    lugares[i],
    lugares[i + 1],
    'walk'
  );
  
  console.log(`\n🚶 ${lugares[i].nombre} → ${lugares[i + 1].nombre}`);
  console.log(`   📏 ${(ruta.distance / 1000).toFixed(2)} km`);
  console.log(`   ⏱️  ${Math.round(ruta.duration / 60)} minutos`);
}
```

---

## 🛠️ EJEMPLOS PRÁCTICOS COMBINADOS

### Ejemplo 1: Planificar un día completo

```javascript
async function planificarDia() {
  // 1. Obtener coordenadas del hotel
  const hotel = await APIsIntegration.geocodeAddress('Shibuya Excel Hotel Tokyu');
  console.log(`🏨 Hotel: ${hotel.displayName}`);
  
  // 2. Buscar restaurantes cercanos para desayuno
  const desayuno = await APIsIntegration.searchNearbyPlaces(
    hotel.lat,
    hotel.lng,
    'cafe',
    500 // 500m del hotel
  );
  console.log(`☕ ${desayuno.places.length} cafés cerca del hotel`);
  
  // 3. Buscar atracciones principales
  const atracciones = await APIsIntegration.searchNearbyPlaces(
    hotel.lat,
    hotel.lng,
    'attraction',
    5000 // 5km del hotel
  );
  console.log(`🎯 ${atracciones.places.length} atracciones encontradas`);
  
  // 4. Calcular ruta a la primera atracción
  if (atracciones.places.length > 0) {
    const primera = atracciones.places[0];
    const ruta = await APIsIntegration.calculateRoute(
      { lat: hotel.lat, lng: hotel.lng },
      { lat: primera.lat, lng: primera.lng },
      'walk'
    );
    console.log(`\n🚶 Ruta a ${primera.name}:`);
    console.log(`   📏 ${(ruta.distance / 1000).toFixed(2)} km`);
    console.log(`   ⏱️  ${Math.round(ruta.duration / 60)} minutos`);
  }
}

// Ejecutar
await planificarDia();
```

### Ejemplo 2: Buscar hoteles y restaurantes cerca

```javascript
async function buscarAlojamientoYComida() {
  // 1. Buscar hoteles en Shibuya
  const hoteles = await APIsIntegration.searchHotels(
    'TYO',
    '2026-02-16',
    '2026-02-20',
    2
  );
  
  console.log(`🏨 Hoteles encontrados: ${hoteles.hotels.length}`);
  
  // 2. Para cada hotel, buscar restaurantes cercanos
  for (const hotel of hoteles.hotels.slice(0, 3)) {
    // Obtener coordenadas del hotel
    const coords = await APIsIntegration.geocodeAddress(hotel.address);
    
    // Buscar restaurantes
    const restaurantes = await APIsIntegration.searchNearbyPlaces(
      coords.lat,
      coords.lng,
      'restaurant',
      500
    );
    
    console.log(`\n🏨 ${hotel.name}`);
    console.log(`   📍 ${restaurantes.places.length} restaurantes a 500m`);
  }
}

await buscarAlojamientoYComida();
```

### Ejemplo 3: Verificar vuelo y buscar hotel

```javascript
async function prepararViaje() {
  // 1. Verificar vuelo
  console.log('✈️ Verificando vuelo...');
  const vuelo = await APIsIntegration.searchFlights('AM58', '2026-02-16');
  
  if (vuelo.success) {
    const info = vuelo.data[0];
    console.log(`✅ Vuelo ${info.flight.iata} confirmado`);
    console.log(`   📅 Salida: ${info.departure.scheduled}`);
    console.log(`   📍 ${info.departure.airport} → ${info.arrival.airport}`);
    
    // 2. Obtener info del aeropuerto de llegada
    const aeropuerto = await APIsIntegration.getAirportInfo(info.arrival.iata);
    console.log(`\n🛬 Aeropuerto de llegada: ${aeropuerto.data[0].airport_name}`);
    
    // 3. Buscar hoteles cerca del aeropuerto
    const coords = {
      lat: aeropuerto.data[0].latitude,
      lng: aeropuerto.data[0].longitude
    };
    
    const hotelesNearby = await APIsIntegration.findNearbyPlacesGeoapify(
      coords.lat,
      coords.lng,
      'accommodation',
      10000 // 10km del aeropuerto
    );
    
    console.log(`\n🏨 ${hotelesNearby.places.length} hoteles cerca del aeropuerto`);
  }
}

await prepararViaje();
```

---

## 🧪 PROBAR TODAS LAS APIS

### Test completo de todas las APIs

```javascript
// Ejecutar test automático
const results = await APIsIntegration.testAllAPIs();

console.log('\n📊 Resultados:');
console.log(`✈️ Vuelos: ${results.flights ? '✅' : '❌'}`);
console.log(`🏨 Hoteles: ${results.hotels ? '✅' : '❌'}`);
console.log(`📍 Lugares: ${results.places ? '✅' : '❌'}`);
console.log(`🗺️ Geocoding: ${results.geocoding ? '✅' : '❌'}`);
console.log(`🗺️ Mapas: ${results.maps ? '✅' : '❌'}`);
```

---

## 📍 COORDENADAS DE CIUDADES DE JAPÓN

```javascript
// Obtener coordenadas pre-configuradas
const ciudades = APIsIntegration.getJapanCityCoordinates();

console.log(ciudades);
// {
//   tokyo: { lat: 35.6762, lng: 139.6503 },
//   kyoto: { lat: 35.0116, lng: 135.7681 },
//   osaka: { lat: 34.6937, lng: 135.5023 },
//   hakone: { lat: 35.2324, lng: 139.1069 },
//   nara: { lat: 34.6851, lng: 135.8048 },
//   ...
// }

// Usar en búsquedas
const restaurantesTokyo = await APIsIntegration.searchNearbyPlaces(
  ciudades.tokyo.lat,
  ciudades.tokyo.lng,
  'restaurant',
  2000
);
```

---

## ⚠️ NOTAS IMPORTANTES

### Límites de las APIs

- **AviationStack**: 500 requests/mes (plan gratuito)
- **LiteAPI**: Sin límite en sandbox mode
- **Foursquare**: 99,000 requests/día (plan developer)
- **LocationIQ**: 5,000 requests/día
- **Geoapify**: 3,000 requests/día
- **Nominatim**: Sin límite (pero rate limited, 1 req/segundo)

### Buenas Prácticas

1. **Cachear resultados** cuando sea posible
2. **Usar Nominatim como backup** si LocationIQ falla
3. **Verificar `success`** antes de usar los datos
4. **Manejar errores** con try/catch
5. **Respetar rate limits**

### Ejemplo de manejo de errores

```javascript
async function buscarSeguro(address) {
  try {
    const result = await APIsIntegration.geocodeAddress(address);
    
    if (result.success) {
      console.log('✅ Encontrado:', result.displayName);
      return result;
    } else {
      console.log('❌ No encontrado:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}
```

---

## 🎯 PRÓXIMOS PASOS

1. **Integrar en el Itinerary Builder**
   - Autocompletar vuelos al escribir número
   - Buscar hoteles por ciudad y fechas
   - Agregar lugares desde Foursquare

2. **Mejorar el Mapa**
   - Mostrar rutas entre actividades
   - Calcular tiempo de traslado
   - Sugerir lugares cercanos

3. **Crear recomendaciones inteligentes**
   - "Hoteles cerca de tus actividades"
   - "Restaurantes en tu ruta"
   - "Alternativas si hay retrasos"

---

## 💡 ¿NECESITAS AYUDA?

Todas estas funciones están disponibles en la consola del navegador. Solo abre la consola (F12) y escribe:

```javascript
// Ver todas las funciones disponibles
console.dir(APIsIntegration);

// Probar cualquier función
await APIsIntegration.searchFlights('AM58');
```

¡Experimenta y crea funcionalidades increíbles! 🚀
