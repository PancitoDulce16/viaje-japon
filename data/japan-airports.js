// data/japan-airports.js - Aeropuertos principales de Japón
//
// Mapea cada aeropuerto a su ciudad del ACTIVITIES_DATABASE (cityKey) y a las
// ciudades de la región alcanzables razonablemente el mismo día de llegada
// (nearbyCities). usage: 'international' = puerta de entrada típica desde el
// extranjero, 'domestic' = principalmente vuelos internos, 'both' = ambos.

export const JAPAN_AIRPORTS = [
  {
    code: 'NRT',
    name: 'Narita International',
    label: 'Tokio – Narita (NRT)',
    cityKey: 'tokyo',
    usage: 'international',
    note: 'Principal puerta internacional de Tokio. 60-90 min al centro (Narita Express / Skyliner).',
    nearbyCities: ['tokyo', 'yokohama', 'kamakura', 'nikko', 'hakone']
  },
  {
    code: 'HND',
    name: 'Haneda',
    label: 'Tokio – Haneda (HND)',
    cityKey: 'tokyo',
    usage: 'both',
    note: 'El más cercano al centro de Tokio (~30 min en monorriel/tren). Cada vez más vuelos internacionales.',
    nearbyCities: ['tokyo', 'yokohama', 'kamakura', 'nikko', 'hakone']
  },
  {
    code: 'KIX',
    name: 'Kansai International',
    label: 'Osaka – Kansai (KIX)',
    cityKey: 'osaka',
    usage: 'international',
    note: 'Puerta internacional de la región de Kansai (Osaka, Kioto, Nara, Kobe).',
    nearbyCities: ['osaka', 'kyoto', 'nara', 'kobe', 'himeji']
  },
  {
    code: 'ITM',
    name: 'Osaka Itami',
    label: 'Osaka – Itami (ITM)',
    cityKey: 'osaka',
    usage: 'domestic',
    note: 'Solo vuelos domésticos. Más cerca del centro de Osaka que KIX.',
    nearbyCities: ['osaka', 'kyoto', 'nara', 'kobe', 'himeji']
  },
  {
    code: 'UKB',
    name: 'Kobe',
    label: 'Kobe (UKB)',
    cityKey: 'kobe',
    usage: 'domestic',
    note: 'Solo vuelos domésticos.',
    nearbyCities: ['kobe', 'osaka', 'himeji']
  },
  {
    code: 'NGO',
    name: 'Chubu Centrair',
    label: 'Nagoya – Chubu Centrair (NGO)',
    cityKey: 'nagoya',
    usage: 'international',
    note: 'Puerta internacional de la región de Chubu.',
    nearbyCities: ['nagoya', 'takayama', 'matsumoto']
  },
  {
    code: 'CTS',
    name: 'New Chitose',
    label: 'Sapporo – New Chitose (CTS)',
    cityKey: 'sapporo',
    usage: 'both',
    note: 'Principal aeropuerto de Hokkaido, ~40 min de Sapporo en tren.',
    nearbyCities: ['sapporo']
  },
  {
    code: 'FUK',
    name: 'Fukuoka',
    label: 'Fukuoka (FUK)',
    cityKey: 'fukuoka',
    usage: 'both',
    note: 'A solo 2 paradas de metro del centro — el aeropuerto más conveniente de Japón.',
    nearbyCities: ['fukuoka']
  },
  {
    code: 'HIJ',
    name: 'Hiroshima',
    label: 'Hiroshima (HIJ)',
    cityKey: 'hiroshima',
    usage: 'domestic',
    note: 'Principalmente vuelos domésticos. ~50 min al centro en bus.',
    nearbyCities: ['hiroshima']
  },
  {
    code: 'SDJ',
    name: 'Sendai',
    label: 'Sendai (SDJ)',
    cityKey: 'sendai',
    usage: 'domestic',
    note: 'Principalmente domésticos (algunos vuelos a Asia).',
    nearbyCities: ['sendai']
  },
  {
    code: 'KMQ',
    name: 'Komatsu',
    label: 'Kanazawa – Komatsu (KMQ)',
    cityKey: 'kanazawa',
    usage: 'domestic',
    note: 'Sirve a Kanazawa (~40 min en bus). Principalmente domésticos.',
    nearbyCities: ['kanazawa', 'takayama', 'shirakawago']
  },
  {
    code: 'OKA',
    name: 'Naha',
    label: 'Okinawa – Naha (OKA)',
    cityKey: null, // Okinawa no está (aún) en la base de actividades
    usage: 'both',
    note: 'Puerta de entrada a Okinawa.',
    nearbyCities: []
  }
];

export function getAirportByCode(code) {
  if (!code) return null;
  return JAPAN_AIRPORTS.find(a => a.code === code.toUpperCase()) || null;
}

/**
 * Opciones para un <select>, con los internacionales típicos primero
 * (lo que un turista que llega del extranjero realmente busca)
 */
export function getAirportSelectOptions() {
  const intl = JAPAN_AIRPORTS.filter(a => a.usage !== 'domestic');
  const domestic = JAPAN_AIRPORTS.filter(a => a.usage === 'domestic');
  return { international: intl, domestic };
}

// Disponible también para módulos que no importan (patrón del proyecto)
if (typeof window !== 'undefined') {
  window.JAPAN_AIRPORTS = JAPAN_AIRPORTS;
}
