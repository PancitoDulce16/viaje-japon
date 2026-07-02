// data/osaka-loop-line.js - Estaciones de la línea JR Osaka Loop (Kanjō-sen)
//
// Las 19 estaciones reales en orden de loop (sentido antihorario en el mapa,
// empezando en Osaka/Umeda arriba y bajando por el lado oeste: Osaka →
// Fukushima → Nishikujo → ... → Tennoji → ... → Kyobashi → Osaka).
//
// Nota honesta para el viajero: Namba/Dotonbori/Shinsaibashi NO están sobre
// el loop (están dentro, sobre la línea Midosuji) — el helper lo explica.

export const OSAKA_LOOP_STATIONS = [
  {
    id: 'osaka',
    name: 'Osaka (Umeda)',
    recommended: true,
    vibe: 'El gran hub del norte',
    description: 'La zona de Umeda: rascacielos, Grand Front, el Umeda Sky Building y conexión directa a Kioto/Kobe y al aeropuerto ITM. Hoteles de todas las gamas. La opción más práctica si te mueves mucho en tren.',
    goodFor: ['Primera vez', 'Conexiones', 'Compras'],
    priceLevel: '¥¥-¥¥¥'
  },
  { id: 'fukushima', name: 'Fukushima', recommended: true,
    vibe: 'Foodie local, a un paso de Umeda',
    description: 'Callejones llenos de izakayas y restaurantes pequeños que los locales aman. A una estación de Umeda pero mucho más tranquilo y barato para dormir.',
    goodFor: ['Gastronomía', 'Ambiente local', 'Precio/ubicación'],
    priceLevel: '¥¥'
  },
  { id: 'noda', name: 'Noda', recommended: false },
  {
    id: 'nishikujo',
    name: 'Nishikujō',
    recommended: true,
    vibe: 'La puerta a Universal Studios',
    description: 'Transbordo directo a Universal Studios Japan (línea Yumesaki, 5 min). Si USJ es prioridad — sobre todo con niños — dormir aquí ahorra madrugones.',
    goodFor: ['USJ', 'Familias'],
    priceLevel: '¥¥'
  },
  { id: 'bentencho', name: 'Bentenchō', recommended: false },
  { id: 'taisho', name: 'Taishō', recommended: false },
  { id: 'ashiharabashi', name: 'Ashiharabashi', recommended: false },
  { id: 'imamiya', name: 'Imamiya', recommended: false },
  {
    id: 'shin-imamiya',
    name: 'Shin-Imamiya',
    recommended: true,
    vibe: 'El más barato, con matices',
    description: 'Los hoteles más económicos de Osaka y acceso directo al aeropuerto KIX (línea Nankai). El barrio (Nishinari) es seguro pero visiblemente humilde — mochileros lo aman, familias quizás prefieran otra zona.',
    goodFor: ['Presupuesto', 'Acceso a KIX', 'Mochileros'],
    priceLevel: '¥'
  },
  {
    id: 'tennoji',
    name: 'Tennōji',
    recommended: true,
    vibe: 'Práctico y renovado',
    description: 'Abeno Harukas (el rascacielos con mirador), el zoo, el templo Shitennoji y acceso directo a KIX y Nara. Zona renovada con hoteles de buen precio — el "Shinagawa de Osaka".',
    goodFor: ['Acceso a KIX', 'Excursión a Nara', 'Precio/ubicación'],
    priceLevel: '¥¥'
  },
  { id: 'teradacho', name: 'Teradachō', recommended: false },
  { id: 'momodani', name: 'Momodani', recommended: false },
  {
    id: 'tsuruhashi',
    name: 'Tsuruhashi',
    recommended: true,
    vibe: 'Koreatown y el mejor yakiniku',
    description: 'El barrio coreano de Osaka: mercado laberíntico y el yakiniku más famoso de la ciudad. Más para comer que para dormir, pero hay opciones económicas.',
    goodFor: ['Yakiniku', 'K-culture', 'Mercados'],
    priceLevel: '¥'
  },
  { id: 'tamatsukuri', name: 'Tamatsukuri', recommended: false },
  { id: 'morinomiya', name: 'Morinomiya', recommended: false },
  {
    id: 'osakajokoen',
    name: 'Osakajōkōen',
    recommended: true,
    vibe: 'Junto al Castillo de Osaka',
    description: 'Literalmente el parque del Castillo de Osaka: verde, tranquilo y fotogénico. Pocos hoteles pero con vista al castillo — despertar así vale la pena.',
    goodFor: ['Castillo', 'Fotos', 'Tranquilidad'],
    priceLevel: '¥¥¥'
  },
  {
    id: 'kyobashi',
    name: 'Kyōbashi',
    recommended: true,
    vibe: 'Nightlife de salaryman',
    description: 'Izakayas baratas, ambiente Showa y cero turistas. Gran conexión de trenes (Keihan a Kioto). Para quien quiere el Osaka de verdad de noche.',
    goodFor: ['Izakayas', 'Ambiente local', 'Conexión a Kioto'],
    priceLevel: '¥¥'
  },
  { id: 'sakuranomiya', name: 'Sakuranomiya', recommended: false },
  { id: 'temma', name: 'Temma', recommended: true,
    vibe: 'La calle de izakayas más larga de Japón',
    description: 'Tenjinbashisuji: 2.6 km de arcada comercial, y alrededor de la estación cientos de izakayas diminutas. Barato, delicioso y muy local.',
    goodFor: ['Gastronomía', 'Presupuesto', 'Ambiente local'],
    priceLevel: '¥'
  }
];

export function getOsakaStationById(id) {
  return OSAKA_LOOP_STATIONS.find(s => s.id === id) || null;
}

if (typeof window !== 'undefined') {
  window.OSAKA_LOOP_STATIONS = OSAKA_LOOP_STATIONS;
}
