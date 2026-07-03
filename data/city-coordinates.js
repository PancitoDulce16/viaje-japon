// data/city-coordinates.js
// Fuente única de coordenadas reales e iconos por ciudad. Usado por js/map/map.js
// (mapa Leaflet) y js/features/itinerary/city-route-map.js (mapa de selección del
// wizard) - antes vivían duplicadas/parciales en cada archivo por separado.

export const CITY_COORDINATES = {
  tokyo: [35.6762, 139.6503],
  kyoto: [35.0116, 135.7681],
  osaka: [34.6937, 135.5023],
  nara: [34.6851, 135.8048],
  hiroshima: [34.3853, 132.4553],
  hakone: [35.2324, 139.1070],
  nikko: [36.7564, 139.6054],
  kamakura: [35.3192, 139.5466],
  yokohama: [35.4437, 139.6380],
  kanazawa: [36.5947, 136.6256],
  nagoya: [35.1815, 136.9066],
  sapporo: [43.0642, 141.3469],
  fukuoka: [33.5904, 130.4017],
  takayama: [36.1408, 137.2526],
  // 🆕 Agregadas para paridad completa con ACTIVITIES_DATABASE (antes solo
  // vivían 14 de las 19 ciudades en el mapa Leaflet)
  kobe: [34.6901, 135.1955],
  sendai: [38.2682, 140.8694],
  matsumoto: [36.2380, 137.9720],
  shirakawago: [36.2578, 136.9066],
  himeji: [34.8394, 134.6939],
};

// Icono representativo por ciudad (clave = key en ACTIVITIES_DATABASE)
export const CITY_ICONS = {
  tokyo: '🗼', kyoto: '⛩️', osaka: '🏯', hiroshima: '🕊️', nara: '🦌',
  hakone: '♨️', kamakura: '🗿', yokohama: '⚓', sapporo: '❄️', nagoya: '🏯',
  kobe: '🐄', nikko: '🌲', takayama: '🏘️', kanazawa: '🎋', fukuoka: '🍜',
  sendai: '🌳', matsumoto: '🐦', shirakawago: '🏔️', himeji: '🦅',
};
