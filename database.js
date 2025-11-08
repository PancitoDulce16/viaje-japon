// data/database.js - Fuente Única de Verdad (Single Source of Truth)
// Contiene todas las atracciones, restaurantes y actividades con un esquema unificado.

/*
  Esquema Unificado de Puntos de Interés (POI):
  {
    id: String, // Identificador único (ej: 'tokyo-sensoji')
    name: String, // Nombre del lugar (ej: 'Templo Senso-ji')
    city: String, // Ciudad principal (ej: 'Tokyo')
    area: String, // Barrio o zona específica (ej: 'Asakusa')
    category: String, // Categoría principal (ej: 'culture', 'food', 'nature')
    subCategory: String, // Subcategoría más específica (ej: 'temple', 'ramen', 'park')
    
    description: String, // Descripción del lugar
    tips: String, // Consejos útiles
    
    cost: Number, // Costo en la moneda local (0 si es gratis)
    currency: String, // Moneda (ej: 'JPY')
    
    duration: Number, // Duración recomendada en minutos
    
    location: { lat: Number, lng: Number }, // Coordenadas
    station: String, // Estación de transporte más cercana
    
    rating: Number, // Puntuación (de 1 a 5)
    
    openingHours: { // Horarios de apertura estructurados
      open: String, // Hora de apertura (ej: '09:00')
      close: String, // Hora de cierre (ej: '17:00')
      notes: String, // Notas adicionales (ej: 'Los terrenos siempre están abiertos')
    },
    
    timeOfDay: [String], // Parte del día recomendada (ej: ['morning', 'evening'])
    bestSeason: [String], // Mejor estación del año (ej: ['spring', 'autumn'])
    
    requiresReservation: Boolean,
    reservationUrl: String, // URL para reservar
    
    image: String // URL de una imagen representativa
  }
*/

export const UNIFIED_DATABASE = {
  'tokyo-sensoji': {
    id: 'tokyo-sensoji',
    name: 'Templo Senso-ji',
    city: 'Tokyo',
    area: 'Asakusa',
    category: 'culture',
    subCategory: 'temple',
    description: 'El templo budista más antiguo y significativo de Tokyo, famoso por su puerta Kaminarimon y la calle comercial Nakamise-dori.',
    tips: 'Visítalo muy temprano por la mañana (6-7 AM) para evitar las multitudes. El omikuji (papel de la fortuna) cuesta ¥100. De noche, la iluminación es espectacular y hay muy poca gente.',
    cost: 0,
    currency: 'JPY',
    duration: 90,
    location: { lat: 35.7148, lng: 139.7967 },
    station: 'Asakusa Station',
    rating: 4.8,
    openingHours: {
      open: '06:00',
      close: '17:00',
      notes: 'El salón principal tiene este horario. Los terrenos del templo están abiertos 24/7.'
    },
    timeOfDay: ['morning', 'afternoon', 'evening'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80'
  },
  'tokyo-ichiran-shibuya': {
    id: 'tokyo-ichiran-shibuya',
    name: 'Ichiran Ramen (Shibuya)',
    city: 'Tokyo',
    area: 'Shibuya',
    category: 'food',
    subCategory: 'ramen',
    description: 'Famosa cadena de ramen tonkotsu, conocida por sus cabinas de concentración individuales y su caldo personalizable. Una experiencia icónica de ramen en Japón.',
    tips: 'Utiliza la máquina de tickets para ordenar. Rellena el formulario para personalizar tu ramen (dureza de los fideos, nivel de picante, etc.). Las sucursales de Shibuya y Shinjuku suelen estar abiertas 24 horas.',
    cost: 1000,
    currency: 'JPY',
    duration: 45,
    location: { lat: 35.6617, lng: 139.7006 },
    station: 'Shibuya Station',
    rating: 4.6,
    openingHours: {
      open: '00:00',
      close: '23:59',
      notes: 'La sucursal de Shibuya suele operar 24 horas, pero siempre es bueno verificar por si hay cambios.'
    },
    timeOfDay: ['lunch', 'dinner', 'night'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80'
  },
  'tokyo-afuri-ramen': {
    id: 'tokyo-afuri-ramen',
    name: 'Afuri Ramen',
    city: 'Tokyo',
    area: 'Harajuku',
    category: 'food',
    subCategory: 'ramen',
    description: 'Yuzu shio ramen (caldo de sal con cítrico). Ligero y refrescante. Muy popular.',
    tips: 'Prueba el tsukemen. Siempre hay fila pero se mueve rápido.',
    cost: 1100,
    currency: 'JPY',
    duration: 35,
    location: { lat: 35.6718, lng: 139.7066 },
    station: 'Harajuku Station',
    rating: 4.7,
    openingHours: { open: '11:00', close: '22:00', notes: 'Horario estimado, verificar antes de ir.' },
    timeOfDay: ['lunch', 'dinner'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: null
  },
  'tokyo-ippudo-roppongi': {
    id: 'tokyo-ippudo-roppongi',
    name: 'Ippudo Ramen (Roppongi)',
    city: 'Tokyo',
    area: 'Roppongi',
    category: 'food',
    subCategory: 'ramen',
    description: 'Tonkotsu clásico de Hakata. Shiromaru es su especialidad.',
    tips: 'Cadena internacional pero de calidad. Roppongi y Shinjuku.',
    cost: 1050,
    currency: 'JPY',
    duration: 40,
    location: { lat: 35.662, lng: 139.731 },
    station: 'Roppongi Station',
    rating: 4.5,
    openingHours: { open: '11:00', close: '23:00', notes: 'Horario estimado, verificar antes de ir.' },
    timeOfDay: ['lunch', 'dinner', 'night'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: null
  },
  'tokyo-mutekiya': {
    id: 'tokyo-mutekiya',
    name: 'Mutekiya',
    city: 'Tokyo',
    area: 'Ikebukuro',
    category: 'food',
    subCategory: 'ramen',
    description: 'Tonkotsu súper cremoso. Local pequeño, siempre lleno de japoneses.',
    tips: 'Efectivo solamente. Fila larga pero vale la pena.',
    cost: 850,
    currency: 'JPY',
    duration: 25,
    location: { lat: 35.731, lng: 139.716 },
    station: 'Ikebukuro Station',
    rating: 4.8,
    openingHours: { open: '11:00', close: '22:00', notes: 'Horario estimado, verificar antes de ir.' },
    timeOfDay: ['lunch', 'dinner'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: null
  },
  'tokyo-tsuta': {
    id: 'tokyo-tsuta',
    name: 'Tsuta (Michelin Star)',
    city: 'Tokyo',
    area: 'Sugamo',
    category: 'food',
    subCategory: 'ramen',
    description: 'Primer ramen con estrella Michelin. Shoyu ramen con trufa.',
    tips: 'Llegar 30-60 min antes de abrir para conseguir lugar.',
    cost: 1200,
    currency: 'JPY',
    duration: 35,
    location: { lat: 35.738, lng: 139.749 },
    station: 'Sugamo Station',
    rating: 4.9,
    openingHours: { open: '11:00', close: '16:00', notes: 'Cierran si se acaba el caldo. Verificar.' },
    timeOfDay: ['lunch'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: null
  },
  'tokyo-nakiryu': {
    id: 'tokyo-nakiryu',
    name: 'Nakiryu (Michelin Star)',
    city: 'Tokyo',
    area: 'Minami-Otsuka',
    category: 'food',
    subCategory: 'ramen',
    description: 'Tantanmen (ramen picante) con estrella Michelin. Increíble.',
    tips: 'Solo efectivo. Máquina de tickets. Fila desde temprano.',
    cost: 1000,
    currency: 'JPY',
    duration: 30,
    location: { lat: 35.732, lng: 139.729 },
    station: 'Otsuka Station',
    rating: 4.9,
    openingHours: { open: '11:30', close: '15:00', notes: 'Cierran si se acaba el caldo. Verificar.' },
    timeOfDay: ['lunch'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: null
  },
  'tokyo-sushi-zanmai-tsukiji': {
    id: 'tokyo-sushi-zanmai-tsukiji',
    name: 'Sushi Zanmai Tsukiji',
    city: 'Tokyo',
    area: 'Tsukiji',
    category: 'food',
    subCategory: 'sushi',
    description: '24 horas. Sushi fresco al lado del antiguo mercado. Set omakase accesible.',
    tips: 'Abierto 24/7. Mejor horario: 5-7 AM después del mercado.',
    cost: 3000,
    currency: 'JPY',
    duration: 60,
    location: { lat: 35.665, lng: 139.77 },
    station: 'Tsukiji Station',
    rating: 4.7,
    openingHours: { open: '00:00', close: '23:59', notes: 'Abierto 24/7' },
    timeOfDay: ['morning', 'lunch', 'dinner', 'night'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: null
  },
  'tokyo-uobei-shibuya': {
    id: 'tokyo-uobei-shibuya',
    name: 'Uobei Shibuya Dogenzaka',
    city: 'Tokyo',
    area: 'Shibuya',
    category: 'food',
    subCategory: 'sushi',
    description: 'Sushi en cinta transportadora con tablets táctiles. Moderno y económico.',
    tips: '¥100-500 por plato. Experiencia divertida y barata.',
    cost: 2000,
    currency: 'JPY',
    duration: 53,
    location: { lat: 35.658, lng: 139.698 },
    station: 'Shibuya Station',
    rating: 4.5,
    openingHours: { open: '11:00', close: '23:00', notes: 'Horario estimado, verificar.' },
    timeOfDay: ['lunch', 'dinner'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: null
  },
  'tokyo-sushi-dai': {
    id: 'tokyo-sushi-dai',
    name: 'Sushi Dai',
    city: 'Tokyo',
    area: 'Toyosu Market',
    category: 'food',
    subCategory: 'sushi',
    description: '¡El mejor sushi del mercado! Fila de 2-3 horas pero INCREÍBLE.',
    tips: 'Ir a las 5 AM. La espera vale completamente la pena.',
    cost: 4000,
    currency: 'JPY',
    duration: 30,
    location: { lat: 35.644, lng: 139.787 },
    station: 'Shijo-mae Station',
    rating: 4.9,
    openingHours: { open: '05:30', close: '14:00', notes: 'Cierran cuando se acaba el pescado. Fila empieza mucho antes.' },
    timeOfDay: ['morning'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: null
  },
  'tokyo-genki-sushi-shibuya': {
    id: 'tokyo-genki-sushi-shibuya',
    name: 'Genki Sushi (Shibuya)',
    city: 'Tokyo',
    area: 'Shibuya',
    category: 'food',
    subCategory: 'sushi',
    description: 'Kaiten-zushi (cinta transportadora). Barato y bueno. Cadena.',
    tips: 'Sistema de pedido digital. Divertido para niños.',
    cost: 1500,
    currency: 'JPY',
    duration: 45,
    location: { lat: 35.659, lng: 139.702 },
    station: 'Shibuya Station',
    rating: 4.4,
    openingHours: { open: '11:00', close: '22:00', notes: 'Horario estimado, verificar.' },
    timeOfDay: ['lunch', 'dinner'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: null
  },
  'tokyo-kurazushi-shinjuku': {
    id: 'tokyo-kurazushi-shinjuku',
    name: 'Kurazushi (Shinjuku)',
    city: 'Tokyo',
    area: 'Shinjuku',
    category: 'food',
    subCategory: 'sushi',
    description: 'Sushi económico. Gacha system: cada 5 platos vacíos = premio.',
    tips: 'Super barato. ¥100-300 por plato. Gamificado.',
    cost: 1200,
    currency: 'JPY',
    duration: 45,
    location: { lat: 35.693, lng: 139.704 },
    station: 'Shinjuku Station',
    rating: 4.3,
    openingHours: { open: '11:00', close: '23:00', notes: 'Horario estimado, verificar.' },
    timeOfDay: ['lunch', 'dinner'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: null
  },
  'tokyo-shibuya-crossing': {
    id: 'tokyo-shibuya-crossing',
    name: 'Cruce de Shibuya',
    city: 'Tokyo',
    area: 'Shibuya',
    category: 'sightseeing',
    subCategory: 'urban',
    description: 'El cruce peatonal más famoso y transitado del mundo. Un espectáculo de caos organizado, especialmente por la noche con todas las luces de neón.',
    tips: 'Las mejores vistas se obtienen desde el Starbucks en el segundo piso del edificio Tsutaya o desde el mirador gratuito "Shibuya Sky" en el centro comercial Hikarie.',
    cost: 0,
    currency: 'JPY',
    duration: 30,
    location: { lat: 35.6595, lng: 139.7005 },
    station: 'Shibuya Station',
    rating: 4.7,
    openingHours: {
      open: '00:00',
      close: '23:59',
      notes: 'Es un cruce público, siempre accesible. Más impresionante durante las horas pico y por la noche.'
    },
    timeOfDay: ['afternoon', 'evening', 'night'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: 'https://images.unsplash.com/photo-1532223433144-574A4a4a4393?w=800&q=80'
  },
  'tokyo-meiji-shrine': {
    id: 'tokyo-meiji-shrine',
    name: 'Santuario Meiji',
    city: 'Tokyo',
    area: 'Shibuya',
    category: 'culture',
    subCategory: 'shrine',
    description: 'Un oasis de paz dedicado al Emperador Meiji y la Emperatriz Shoken. Rodeado por un frondoso bosque en medio de la bulliciosa Tokyo.',
    tips: 'Ideal para una caminata tranquila. Si tienes suerte, puedes ver una boda tradicional sintoísta durante el fin de semana. Muestra respeto al entrar por el torii haciendo una reverencia.',
    cost: 0,
    currency: 'JPY',
    duration: 75,
    location: { lat: 35.6764, lng: 139.6993 },
    station: 'Harajuku Station',
    rating: 4.8,
    openingHours: {
      open: '05:00',
      close: '18:00',
      notes: 'El horario varía según la época del año (amanecer al atardecer). Consultar el sitio web oficial.'
    },
    timeOfDay: ['morning', 'afternoon'],
    bestSeason: ['all'],
    requiresReservation: false,
    reservationUrl: null,
    image: 'https://images.unsplash.com/photo-1526481280643-3b94b2459823?w=800&q=80'
  },
  'tokyo-skytree': {
    id: 'tokyo-skytree',
    name: 'Tokyo Skytree',
    city: 'Tokyo',
    area: 'Sumida',
    category: 'sightseeing',
    subCategory: 'observation-deck',
    description: 'Impresionante torre de radiodifusión con dos miradores que ofrecen vistas panorámicas de 360 grados de Tokyo y sus alrededores.',
    tips: 'Compra las entradas online con antelación para evitar largas colas. Las vistas al atardecer y por la noche son especialmente espectaculares. En días despejados se puede ver el Monte Fuji.',
    cost: 2100,
    currency: 'JPY',
    duration: 120,
    location: { lat: 35.7101, lng: 139.8107 },
    station: 'Tokyo Skytree Station',
    rating: 4.6,
    openingHours: {
      open: '10:00',
      close: '21:00',
      notes: 'La última admisión es a las 20:00. Los horarios pueden cambiar.'
    },
    timeOfDay: ['afternoon', 'evening'],
    bestSeason: ['winter', 'autumn'],
    requiresReservation: true,
    reservationUrl: 'https://www.tokyo-skytree.jp/en/ticket/individual/',
    image: 'https://images.unsplash.com/photo-1540998145393-7943b5e4de00?w=800&q=80'
  },
  'tokyo-ghibli-museum': {
    id: 'tokyo-ghibli-museum',
    name: 'Museo Ghibli',
    city: 'Tokyo',
    area: 'Mitaka',
    category: 'entertainment',
    subCategory: 'museum',
    description: 'Un museo mágico dedicado al trabajo del Studio Ghibli. Exhibe el arte y la técnica de la animación, con un cortometraje exclusivo que solo se puede ver allí.',
    tips: 'Las entradas son extremadamente difíciles de conseguir. Deben comprarse online con un mes de antelación el día 10 a las 10:00 AM (hora de Japón). ¡No se venden en la puerta!',
    cost: 1000,
    currency: 'JPY',
    duration: 150,
    location: { lat: 35.7061, lng: 139.5701 },
    station: 'Mitaka Station',
    rating: 4.9,
    openingHours: { open: '10:00', close: '18:00', notes: 'Cerrado los martes. Se entra por turnos horarios.' },
    timeOfDay: ['morning', 'afternoon'],
    bestSeason: ['all'],
    requiresReservation: true,
    reservationUrl: 'https://www.ghibli-museum.jp/en/tickets/',
    image: 'https://images.unsplash.com/photo-1605375679944-37a3a267b8bd?w=800&q=80'
  }
};

// --- FUNCIONES AUXILIARES ADAPTADAS ---

// Cacheamos la conversión a array para no repetirla en cada llamada.
const ALL_POIS = Object.values(UNIFIED_DATABASE);

// Devuelve un array de todos los POIs (Points of Interest)
export function getAllPois() {
  return ALL_POIS;
}

// Devuelve POIs filtrados por ciudad
export function getPoisByCity(city) {
  const lowerCaseCity = city.toLowerCase();
  // Usamos el array cacheado para mejorar el rendimiento.
  return ALL_POIS.filter(poi => poi.city.toLowerCase() === lowerCaseCity);
}

// Devuelve POIs filtrados por ciudad y categorías
export function getPoisByCategory(city, categories) {
  const cityPois = getPoisByCity(city);
  if (!categories || categories.length === 0) {
    return cityPois;
  }
  
  // Usamos un Set para una búsqueda de categorías más rápida (O(1) en lugar de O(n)).
  const categorySet = new Set(categories.map(c => c.toLowerCase()));
  
  return cityPois.filter(poi => 
    categorySet.has(poi.category.toLowerCase()) ||
    categorySet.has(poi.subCategory.toLowerCase())
  );
}

// Busca POIs por texto en nombre, descripción o tips
export function searchPois(query) {
  const lowerCaseQuery = query.toLowerCase();
  if (!lowerCaseQuery) {
    return [];
  }
  
  return ALL_POIS.filter(poi =>
    poi.name.toLowerCase().includes(lowerCaseQuery) ||
    poi.description.toLowerCase().includes(lowerCaseQuery) ||
    (poi.tips && poi.tips.toLowerCase().includes(lowerCaseQuery))
  );
}
