// data/yamanote-line.js - Estaciones de la línea JR Yamanote (Tokio)
//
// Las 30 estaciones reales en orden de loop (sentido antihorario en el mapa,
// empezando en Tokyo Station y subiendo por el lado este: Tokyo → Kanda →
// Akihabara → ... → Shinagawa → Shimbashi → Tokyo).
//
// `recommended: true` = zona que un turista primerizo realmente considera para
// hospedarse; esas llevan descripción completa. El resto muestra solo el nombre.

export const YAMANOTE_STATIONS = [
  {
    id: 'tokyo',
    name: 'Tokyo',
    recommended: true,
    vibe: 'Elegante y ultra conectado',
    description: 'La estación central: Shinkansen a todo Japón y Narita Express directo. Zona de hoteles elegantes (Marunouchi), cerca del Palacio Imperial y Ginza. Ideal si harás excursiones a Kioto/Osaka.',
    goodFor: ['Shinkansen', 'Excursiones', 'Hoteles premium'],
    priceLevel: '¥¥¥'
  },
  { id: 'kanda', name: 'Kanda', recommended: false },
  {
    id: 'akihabara',
    name: 'Akihabara',
    recommended: true,
    vibe: 'Anime, gaming y electrónica',
    description: 'El paraíso otaku: tiendas de anime/manga, arcades, maid cafés y electrónica. Hoteles de precio medio. De noche es más tranquilo de lo que parece.',
    goodFor: ['Anime/Manga', 'Gaming', 'Electrónica'],
    priceLevel: '¥¥'
  },
  { id: 'okachimachi', name: 'Okachimachi', recommended: false },
  {
    id: 'ueno',
    name: 'Ueno',
    recommended: true,
    vibe: 'Museos, parque y ambiente local',
    description: 'Parque de Ueno con los mejores museos de la ciudad, el zoo y el mercado callejero Ameyoko. Skyliner directo a Narita. Hoteles más económicos que el lado oeste.',
    goodFor: ['Museos', 'Presupuesto', 'Acceso a Narita'],
    priceLevel: '¥¥'
  },
  { id: 'uguisudani', name: 'Uguisudani', recommended: false },
  {
    id: 'nippori',
    name: 'Nippori',
    recommended: true,
    vibe: 'Tokio antiguo y tranquilo',
    description: 'Puerta al barrio tradicional de Yanaka (templos, gatos, calles de la posguerra). Skyliner a Narita en 36 min. Muy tranquilo de noche.',
    goodFor: ['Tokio tradicional', 'Acceso a Narita', 'Tranquilidad'],
    priceLevel: '¥'
  },
  { id: 'nishi-nippori', name: 'Nishi-Nippori', recommended: false },
  { id: 'tabata', name: 'Tabata', recommended: false },
  { id: 'komagome', name: 'Komagome', recommended: false },
  { id: 'sugamo', name: 'Sugamo', recommended: false },
  {
    id: 'otsuka',
    name: 'Otsuka',
    recommended: true,
    vibe: 'Local y económico',
    description: 'Barrio residencial con ambiente de "Tokio real": izakayas locales, el tranvía Toden Arakawa y hoteles notablemente más baratos a solo 2 paradas de Ikebukuro.',
    goodFor: ['Presupuesto', 'Ambiente local'],
    priceLevel: '¥'
  },
  {
    id: 'ikebukuro',
    name: 'Ikebukuro',
    recommended: true,
    vibe: 'Entretenimiento sin las multitudes de Shinjuku',
    description: 'Enorme zona comercial y de entretenimiento (Sunshine City, anime en Otome Road). Hoteles más baratos que Shinjuku/Shibuya con conexiones casi igual de buenas.',
    goodFor: ['Compras', 'Anime', 'Precio/ubicación'],
    priceLevel: '¥¥'
  },
  { id: 'mejiro', name: 'Mejiro', recommended: false },
  { id: 'takadanobaba', name: 'Takadanobaba', recommended: false },
  {
    id: 'shin-okubo',
    name: 'Shin-Okubo',
    recommended: true,
    vibe: 'Koreatown de Tokio',
    description: 'El barrio coreano: K-pop, BBQ coreano y street food hasta tarde. Hoteles económicos a una parada de Shinjuku.',
    goodFor: ['K-culture', 'Comida', 'Presupuesto'],
    priceLevel: '¥'
  },
  {
    id: 'shinjuku',
    name: 'Shinjuku',
    recommended: true,
    vibe: 'La ciudad que nunca duerme',
    description: 'El hub más grande: neones, Kabukicho, Golden Gai, Omoide Yokocho y el jardín Gyoen. Conexión directa a Hakone y al aeropuerto (NEX/bus). Todo tipo de hoteles. Si es tu primera vez y dudas, Shinjuku rara vez falla.',
    goodFor: ['Primera vez', 'Vida nocturna', 'Conexiones'],
    priceLevel: '¥¥-¥¥¥'
  },
  { id: 'yoyogi', name: 'Yoyogi', recommended: false },
  {
    id: 'harajuku',
    name: 'Harajuku',
    recommended: true,
    vibe: 'Moda joven y kawaii',
    description: 'Takeshita Street, moda kawaii y el santuario Meiji con su bosque. Pocos hoteles (mejor visitar que dormir aquí), pero la zona de Omotesando tiene opciones elegantes.',
    goodFor: ['Moda', 'Fotos', 'Santuario Meiji'],
    priceLevel: '¥¥¥'
  },
  {
    id: 'shibuya',
    name: 'Shibuya',
    recommended: true,
    vibe: 'El cruce más famoso del mundo',
    description: 'Épicentro joven: el cruce, Hachiko, Shibuya Sky y mil restaurantes. Hoteles de gama media-alta. Ruidoso pero emocionante — segunda mejor opción para primerizos después de Shinjuku.',
    goodFor: ['Primera vez', 'Compras', 'Nightlife'],
    priceLevel: '¥¥¥'
  },
  {
    id: 'ebisu',
    name: 'Ebisu',
    recommended: true,
    vibe: 'Gastronómico y sofisticado',
    description: 'Barrio adulto y relajado: excelentes restaurantes e izakayas, cerca de Daikanyama y Nakameguro (el canal de los cerezos). Para viajeros que ya no buscan neones.',
    goodFor: ['Gastronomía', 'Ambiente relajado'],
    priceLevel: '¥¥¥'
  },
  { id: 'meguro', name: 'Meguro', recommended: false },
  { id: 'gotanda', name: 'Gotanda', recommended: false },
  { id: 'osaki', name: 'Osaki', recommended: false },
  {
    id: 'shinagawa',
    name: 'Shinagawa',
    recommended: true,
    vibe: 'Práctico para vuelos y Shinkansen',
    description: 'Parada de Shinkansen y acceso rápido a Haneda (Keikyu, ~20 min). Muchos hoteles de cadena. No es el barrio más divertido, pero logísticamente imbatible si sales temprano.',
    goodFor: ['Acceso a Haneda', 'Shinkansen', 'Hoteles de cadena'],
    priceLevel: '¥¥'
  },
  { id: 'takanawa-gateway', name: 'Takanawa Gateway', recommended: false },
  { id: 'tamachi', name: 'Tamachi', recommended: false },
  {
    id: 'hamamatsucho',
    name: 'Hamamatsucho',
    recommended: true,
    vibe: 'Vistas de la Torre y monorriel a Haneda',
    description: 'Monorriel directo a Haneda, junto a la Torre de Tokio y el jardín Hamarikyu. Zona de oficinas tranquila de noche con hoteles de buen precio.',
    goodFor: ['Acceso a Haneda', 'Torre de Tokio'],
    priceLevel: '¥¥'
  },
  {
    id: 'shimbashi',
    name: 'Shimbashi',
    recommended: true,
    vibe: 'Izakayas de salaryman',
    description: 'El barrio clásico de oficinistas: izakayas bajo las vías del tren y ambiente Showa. A un paso de Ginza y del mercado exterior de Tsukiji. Muy buena relación precio/ubicación.',
    goodFor: ['Izakayas', 'Cerca de Ginza', 'Precio/ubicación'],
    priceLevel: '¥¥'
  },
  {
    id: 'yurakucho',
    name: 'Yurakucho',
    recommended: true,
    vibe: 'Entre Ginza y el Palacio',
    description: 'Pegado a Ginza: compras de lujo de día, yakitori bajo las vías de noche. Hoteles de gama alta con el Palacio Imperial al lado.',
    goodFor: ['Ginza', 'Gastronomía', 'Lujo'],
    priceLevel: '¥¥¥'
  }
];

export function getRecommendedStations() {
  return YAMANOTE_STATIONS.filter(s => s.recommended);
}

export function getStationById(id) {
  return YAMANOTE_STATIONS.find(s => s.id === id) || null;
}

if (typeof window !== 'undefined') {
  window.YAMANOTE_STATIONS = YAMANOTE_STATIONS;
}
