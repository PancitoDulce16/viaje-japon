// data/japan-cities.js - Lista Expandida de Ciudades de Japón

export const JAPAN_CITIES = [
  // Región de Kanto
  {
    id: 'tokyo',
    name: 'Tokyo',
    nameJP: '東京',
    region: 'Kanto',
    prefecture: 'Tokyo',
    description: 'Capital de Japón, mezcla de tradición y modernidad',
    population: 14000000,
    coordinates: { lat: 35.6762, lng: 139.6503 },
    airport: 'NRT/HND',
    highlights: ['Shibuya', 'Shinjuku', 'Asakusa', 'Akihabara', 'Harajuku'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },
  {
    id: 'yokohama',
    name: 'Yokohama',
    nameJP: '横浜',
    region: 'Kanto',
    prefecture: 'Kanagawa',
    description: 'Segunda ciudad más grande, puerto histórico',
    population: 3750000,
    coordinates: { lat: 35.4437, lng: 139.6380 },
    airport: 'NRT/HND',
    highlights: ['Minato Mirai', 'Chinatown', 'Sankeien Garden'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },
  {
    id: 'kamakura',
    name: 'Kamakura',
    nameJP: '鎌倉',
    region: 'Kanto',
    prefecture: 'Kanagawa',
    description: 'Antigua capital con templos históricos',
    population: 174000,
    coordinates: { lat: 35.3192, lng: 139.5469 },
    airport: 'NRT/HND',
    highlights: ['Gran Buda', 'Hase-dera', 'Tsurugaoka Hachimangu'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },
  {
    id: 'nikko',
    name: 'Nikko',
    nameJP: '日光',
    region: 'Kanto',
    prefecture: 'Tochigi',
    description: 'Montañas sagradas y santuarios patrimonio UNESCO',
    population: 80000,
    coordinates: { lat: 36.7199, lng: 139.6982 },
    airport: 'NRT',
    highlights: ['Toshogu Shrine', 'Lake Chuzenji', 'Kegon Falls'],
    bestMonths: [5, 6, 9, 10, 11]
  },
  {
    id: 'hakone',
    name: 'Hakone',
    nameJP: '箱根',
    region: 'Kanto',
    prefecture: 'Kanagawa',
    description: 'Resort de montaña con onsen y vistas del Monte Fuji',
    population: 11000,
    coordinates: { lat: 35.2325, lng: 139.1072 },
    airport: 'NRT/HND',
    highlights: ['Lake Ashi', 'Owakudani', 'Open-Air Museum'],
    bestMonths: [4, 5, 9, 10, 11]
  },

  // Región de Kansai
  {
    id: 'kyoto',
    name: 'Kyoto',
    nameJP: '京都',
    region: 'Kansai',
    prefecture: 'Kyoto',
    description: 'Antigua capital imperial, corazón cultural de Japón',
    population: 1475000,
    coordinates: { lat: 35.0116, lng: 135.7681 },
    airport: 'KIX/ITM',
    highlights: ['Fushimi Inari', 'Kinkaku-ji', 'Arashiyama', 'Gion'],
    bestMonths: [3, 4, 5, 10, 11]
  },
  {
    id: 'osaka',
    name: 'Osaka',
    nameJP: '大阪',
    region: 'Kansai',
    prefecture: 'Osaka',
    description: 'Ciudad vibrante conocida por su gastronomía',
    population: 2725000,
    coordinates: { lat: 34.6937, lng: 135.5023 },
    airport: 'KIX/ITM',
    highlights: ['Dotonbori', 'Osaka Castle', 'Universal Studios'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },
  {
    id: 'nara',
    name: 'Nara',
    nameJP: '奈良',
    region: 'Kansai',
    prefecture: 'Nara',
    description: 'Antigua capital con ciervos sagrados',
    population: 360000,
    coordinates: { lat: 34.6851, lng: 135.8048 },
    airport: 'KIX/ITM',
    highlights: ['Nara Park', 'Todai-ji', 'Kasuga Taisha'],
    bestMonths: [3, 4, 5, 10, 11]
  },
  {
    id: 'kobe',
    name: 'Kobe',
    nameJP: '神戸',
    region: 'Kansai',
    prefecture: 'Hyogo',
    description: 'Ciudad portuaria famosa por su carne de res',
    population: 1544000,
    coordinates: { lat: 34.6901, lng: 135.1955 },
    airport: 'KIX/ITM',
    highlights: ['Kobe Beef', 'Mount Rokko', 'Chinatown'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },
  {
    id: 'himeji',
    name: 'Himeji',
    nameJP: '姫路',
    region: 'Kansai',
    prefecture: 'Hyogo',
    description: 'Hogar del castillo más hermoso de Japón',
    population: 530000,
    coordinates: { lat: 34.8394, lng: 134.6939 },
    airport: 'KIX/ITM',
    highlights: ['Himeji Castle', 'Kokoen Garden'],
    bestMonths: [3, 4, 5, 10, 11]
  },

  // Región de Chubu
  {
    id: 'nagoya',
    name: 'Nagoya',
    nameJP: '名古屋',
    region: 'Chubu',
    prefecture: 'Aichi',
    description: 'Cuarta ciudad más grande, centro industrial',
    population: 2320000,
    coordinates: { lat: 35.1815, lng: 136.9066 },
    airport: 'NGO',
    highlights: ['Nagoya Castle', 'Atsuta Shrine', 'Toyota Museum'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },
  {
    id: 'takayama',
    name: 'Takayama',
    nameJP: '高山',
    region: 'Chubu',
    prefecture: 'Gifu',
    description: 'Pueblo tradicional en los Alpes Japoneses',
    population: 88000,
    coordinates: { lat: 36.1465, lng: 137.2521 },
    airport: 'NGO',
    highlights: ['Old Town', 'Morning Markets', 'Hida Folk Village'],
    bestMonths: [4, 5, 6, 9, 10]
  },
  {
    id: 'kanazawa',
    name: 'Kanazawa',
    nameJP: '金沢',
    region: 'Chubu',
    prefecture: 'Ishikawa',
    description: 'Ciudad de arte y cultura tradicional',
    population: 466000,
    coordinates: { lat: 36.5618, lng: 136.6562 },
    airport: 'KMQ',
    highlights: ['Kenrokuen Garden', 'Geisha District', '21st Century Museum'],
    bestMonths: [4, 5, 9, 10, 11]
  },
  {
    id: 'matsumoto',
    name: 'Matsumoto',
    nameJP: '松本',
    region: 'Chubu',
    prefecture: 'Nagano',
    description: 'Castillo negro y entrada a los Alpes Japoneses',
    population: 240000,
    coordinates: { lat: 36.2380, lng: 137.9719 },
    airport: 'MMJ',
    highlights: ['Matsumoto Castle', 'Nawate Street', 'Kamikochi'],
    bestMonths: [5, 6, 7, 8, 9, 10]
  },

  // Región de Tohoku
  {
    id: 'sendai',
    name: 'Sendai',
    nameJP: '仙台',
    region: 'Tohoku',
    prefecture: 'Miyagi',
    description: 'Ciudad más grande del norte de Honshu',
    population: 1096000,
    coordinates: { lat: 38.2682, lng: 140.8694 },
    airport: 'SDJ',
    highlights: ['Zuihoden', 'Aoba Castle', 'Matsushima'],
    bestMonths: [5, 6, 7, 8, 9, 10]
  },
  {
    id: 'aomori',
    name: 'Aomori',
    nameJP: '青森',
    region: 'Tohoku',
    prefecture: 'Aomori',
    description: 'Puerto del norte con famoso festival Nebuta',
    population: 278000,
    coordinates: { lat: 40.8244, lng: 140.7400 },
    airport: 'AOJ',
    highlights: ['Nebuta Museum', 'Hakkoda Mountains', 'Apple Orchards'],
    bestMonths: [5, 6, 7, 8, 9]
  },

  // Región de Chugoku
  {
    id: 'hiroshima',
    name: 'Hiroshima',
    nameJP: '広島',
    region: 'Chugoku',
    prefecture: 'Hiroshima',
    description: 'Ciudad de paz con historia conmovedora',
    population: 1200000,
    coordinates: { lat: 34.3853, lng: 132.4553 },
    airport: 'HIJ',
    highlights: ['Peace Memorial', 'Miyajima', 'Itsukushima Shrine'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },
  {
    id: 'miyajima',
    name: 'Miyajima',
    nameJP: '宮島',
    region: 'Chugoku',
    prefecture: 'Hiroshima',
    description: 'Isla sagrada con torii flotante',
    population: 1800,
    coordinates: { lat: 34.2959, lng: 132.3198 },
    airport: 'HIJ',
    highlights: ['Floating Torii', 'Itsukushima Shrine', 'Mount Misen'],
    bestMonths: [3, 4, 5, 10, 11]
  },
  {
    id: 'okayama',
    name: 'Okayama',
    nameJP: '岡山',
    region: 'Chugoku',
    prefecture: 'Okayama',
    description: 'Ciudad jardín con uno de los tres grandes jardines de Japón',
    population: 720000,
    coordinates: { lat: 34.6551, lng: 133.9195 },
    airport: 'OKJ',
    highlights: ['Korakuen Garden', 'Okayama Castle', 'Kurashiki'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },

  // Región de Kyushu
  {
    id: 'fukuoka',
    name: 'Fukuoka',
    nameJP: '福岡',
    region: 'Kyushu',
    prefecture: 'Fukuoka',
    description: 'Puerta a Kyushu, famosa por su ramen',
    population: 1613000,
    coordinates: { lat: 33.5904, lng: 130.4017 },
    airport: 'FUK',
    highlights: ['Hakata Ramen', 'Canal City', 'Dazaifu Tenmangu'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },
  {
    id: 'nagasaki',
    name: 'Nagasaki',
    nameJP: '長崎',
    region: 'Kyushu',
    prefecture: 'Nagasaki',
    description: 'Ciudad portuaria con influencia europea',
    population: 410000,
    coordinates: { lat: 32.7503, lng: 129.8779 },
    airport: 'NGS',
    highlights: ['Peace Park', 'Glover Garden', 'Gunkanjima'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },
  {
    id: 'kagoshima',
    name: 'Kagoshima',
    nameJP: '鹿児島',
    region: 'Kyushu',
    prefecture: 'Kagoshima',
    description: 'Ciudad del sur con volcán activo Sakurajima',
    population: 599000,
    coordinates: { lat: 31.5966, lng: 130.5571 },
    airport: 'KOJ',
    highlights: ['Sakurajima', 'Sengan-en Garden', 'Sand Baths'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },
  {
    id: 'kumamoto',
    name: 'Kumamoto',
    nameJP: '熊本',
    region: 'Kyushu',
    prefecture: 'Kumamoto',
    description: 'Hogar del imponente castillo de Kumamoto',
    population: 740000,
    coordinates: { lat: 32.8031, lng: 130.7079 },
    airport: 'KMJ',
    highlights: ['Kumamoto Castle', 'Suizenji Garden', 'Mount Aso'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },
  {
    id: 'beppu',
    name: 'Beppu',
    nameJP: '別府',
    region: 'Kyushu',
    prefecture: 'Oita',
    description: 'Capital de los onsen de Japón',
    population: 122000,
    coordinates: { lat: 33.2845, lng: 131.4912 },
    airport: 'OIT',
    highlights: ['Hell Tour', 'Sand Baths', 'Jigoku Meguri'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },

  // Región de Shikoku
  {
    id: 'matsuyama',
    name: 'Matsuyama',
    nameJP: '松山',
    region: 'Shikoku',
    prefecture: 'Ehime',
    description: 'Ciudad onsen con castillo histórico',
    population: 514000,
    coordinates: { lat: 33.8391, lng: 132.7661 },
    airport: 'MYJ',
    highlights: ['Dogo Onsen', 'Matsuyama Castle', 'Ishiteji Temple'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },
  {
    id: 'takamatsu',
    name: 'Takamatsu',
    nameJP: '高松',
    region: 'Shikoku',
    prefecture: 'Kagawa',
    description: 'Puerta a Shikoku, famosa por udon',
    population: 420000,
    coordinates: { lat: 34.3403, lng: 134.0433 },
    airport: 'TAK',
    highlights: ['Ritsurin Garden', 'Kotohira Shrine', 'Sanuki Udon'],
    bestMonths: [3, 4, 5, 9, 10, 11]
  },

  // Hokkaido
  {
    id: 'sapporo',
    name: 'Sapporo',
    nameJP: '札幌',
    region: 'Hokkaido',
    prefecture: 'Hokkaido',
    description: 'Ciudad más grande del norte, famosa por nieve y cerveza',
    population: 1973000,
    coordinates: { lat: 43.0642, lng: 141.3469 },
    airport: 'CTS',
    highlights: ['Snow Festival', 'Ramen Yokocho', 'Mount Moiwa'],
    bestMonths: [2, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'hakodate',
    name: 'Hakodate',
    nameJP: '函館',
    region: 'Hokkaido',
    prefecture: 'Hokkaido',
    description: 'Puerto histórico con vista nocturna famosa',
    population: 265000,
    coordinates: { lat: 41.7688, lng: 140.7288 },
    airport: 'HKD',
    highlights: ['Mount Hakodate', 'Morning Market', 'Fort Goryokaku'],
    bestMonths: [5, 6, 7, 8, 9, 10]
  },
  {
    id: 'furano',
    name: 'Furano',
    nameJP: '富良野',
    region: 'Hokkaido',
    prefecture: 'Hokkaido',
    description: 'Campos de lavanda y resort de ski',
    population: 22000,
    coordinates: { lat: 43.3417, lng: 142.3833 },
    airport: 'CTS',
    highlights: ['Lavender Fields', 'Furano Ski Resort', 'Farm Tomita'],
    bestMonths: [1, 2, 7, 8]
  },
  {
    id: 'otaru',
    name: 'Otaru',
    nameJP: '小樽',
    region: 'Hokkaido',
    prefecture: 'Hokkaido',
    description: 'Ciudad portuaria con canal romántico',
    population: 116000,
    coordinates: { lat: 43.1907, lng: 140.9947 },
    airport: 'CTS',
    highlights: ['Canal', 'Glass Works', 'Music Box Museum'],
    bestMonths: [2, 5, 6, 7, 8, 9]
  },

  // Okinawa
  {
    id: 'naha',
    name: 'Naha',
    nameJP: '那覇',
    region: 'Okinawa',
    prefecture: 'Okinawa',
    description: 'Capital tropical con cultura única Ryukyu',
    population: 321000,
    coordinates: { lat: 26.2124, lng: 127.6809 },
    airport: 'OKA',
    highlights: ['Shuri Castle', 'Kokusai Street', 'Beaches'],
    bestMonths: [4, 5, 6, 10, 11]
  },
  {
    id: 'ishigaki',
    name: 'Ishigaki',
    nameJP: '石垣',
    region: 'Okinawa',
    prefecture: 'Okinawa',
    description: 'Isla paradisíaca con playas pristinas',
    population: 49000,
    coordinates: { lat: 24.3397, lng: 124.1557 },
    airport: 'ISG',
    highlights: ['Kabira Bay', 'Beaches', 'Snorkeling'],
    bestMonths: [4, 5, 6, 10, 11]
  }
];

// Función para obtener ciudades por región
export function getCitiesByRegion(region) {
  return JAPAN_CITIES.filter(city => city.region === region);
}

// Función para obtener ciudad por ID
export function getCityById(cityId) {
  return JAPAN_CITIES.find(city => city.id === cityId);
}

// Función para buscar ciudades
export function searchCities(query) {
  const lowerQuery = query.toLowerCase();
  return JAPAN_CITIES.filter(city => 
    city.name.toLowerCase().includes(lowerQuery) ||
    city.nameJP.includes(query) ||
    city.region.toLowerCase().includes(lowerQuery)
  );
}

// Obtener regiones únicas
export function getRegions() {
  return [...new Set(JAPAN_CITIES.map(city => city.region))];
}

// Exportar para uso global
window.JAPAN_CITIES = JAPAN_CITIES;
window.getCitiesByRegion = getCitiesByRegion;
window.getCityById = getCityById;
window.searchCities = searchCities;
window.getRegions = getRegions;
