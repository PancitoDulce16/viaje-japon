// data/japan-cities.js

export const JAPAN_CITIES = [
  { id: 'tokyo', name: 'Tokyo', region: 'Kanto' },
  { id: 'kyoto', name: 'Kyoto', region: 'Kansai' },
  { id: 'osaka', name: 'Osaka', region: 'Kansai' },
  { id: 'hiroshima', name: 'Hiroshima', region: 'Chugoku' },
  { id: 'nara', name: 'Nara', region: 'Kansai' },
  { id: 'sapporo', name: 'Sapporo', region: 'Hokkaido' },
  { id: 'fukuoka', name: 'Fukuoka', region: 'Kyushu' },
  { id: 'nagoya', name: 'Nagoya', region: 'Chubu' },
  { id: 'yokohama', name: 'Yokohama', region: 'Kanto' },
  { id: 'kobe', name: 'Kobe', region: 'Kansai' },
  { id: 'hakone', name: 'Hakone', region: 'Kanto' },
  { id: 'nikko', name: 'Nikko', region: 'Kanto' },
  { id: 'kamakura', name: 'Kamakura', region: 'Kanto' },
  { id: 'kanazawa', name: 'Kanazawa', region: 'Chubu' },
  { id: 'takayama', name: 'Takayama', region: 'Chubu' },
  { id: 'matsumoto', name: 'Matsumoto', region: 'Chubu' },
  { id: 'nagasaki', name: 'Nagasaki', region: 'Kyushu' },
  { id: 'okinawa', name: 'Okinawa', region: 'Okinawa' }
];

/**
 * Busca ciudades por nombre.
 * @param {string} query - El término de búsqueda.
 * @returns {Array<Object>} - Un array de ciudades que coinciden.
 */
export function searchCities(query) {
  if (!query) {
    return [];
  }
  const lowerCaseQuery = query.toLowerCase();
  return JAPAN_CITIES.filter(city =>
    city.name.toLowerCase().includes(lowerCaseQuery) ||
    city.id.toLowerCase().includes(lowerCaseQuery)
  );
}

/**
 * Obtiene una ciudad por su ID.
 * @param {string} cityId - El ID de la ciudad.
 * @returns {Object|null} - El objeto de la ciudad o null si no se encuentra.
 */
export function getCityById(cityId) {
    if (!cityId) return null;
    return JAPAN_CITIES.find(city => city.id.toLowerCase() === cityId.toLowerCase()) || null;
}

export default JAPAN_CITIES;