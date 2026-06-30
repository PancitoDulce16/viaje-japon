// js/image-service.js - Servicio de Imágenes Unsplash

// City Cards Kawaii locales
export const CITY_IMAGES = {
  tokyo: '/images/iconos/City cards/tokyo1.png',
  kyoto: '/images/iconos/City cards/Kyoto1.png',
  osaka: '/images/iconos/City cards/Osaka.png',
  dotonbori: '/images/iconos/City cards/Osaka.png',
  'osaka-aquarium': '/images/iconos/City cards/Osaka.png',
  nara: '/images/iconos/City cards/Nara1.png',
  hiroshima: '/images/iconos/City cards/Hiroshima.png',
  hakone: '/images/iconos/City cards/hakone1.png',
  nikko: '/images/iconos/City cards/tokyo1.png', // Fallback a Tokyo
  kamakura: '/images/iconos/City cards/Kamakura.png',
  yokohama: '/images/iconos/City cards/tokyo1.png', // Fallback a Tokyo
  kanazawa: '/images/iconos/City cards/Kyoto1.png', // Fallback a Kyoto
  nagoya: '/images/iconos/City cards/tokyo1.png', // Fallback a Tokyo
  sapporo: '/images/iconos/City cards/tokyo1.png', // Fallback a Tokyo
  fukuoka: '/images/iconos/City cards/Fukuoka.png',
  takayama: '/images/iconos/City cards/Kyoto1.png' // Fallback a Kyoto
};

// Imágenes por categoría
export const CATEGORY_IMAGES = {
  culture: [
    'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',
    'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&q=80',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80',
    'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80',
    'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80'
  ],
  food: [
    'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=800&q=80',
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80'
  ],
  nature: [
    'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80',
    'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&q=80',
    'https://images.unsplash.com/photo-1583778819769-09a7b49cc69e?w=800&q=80',
    'https://images.unsplash.com/photo-1612832021773-b28c7aed8853?w=800&q=80',
    'https://images.unsplash.com/photo-1515001635423-45e4f18f9267?w=800&q=80'
  ],
  photography: [
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80',
    'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&q=80',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    'https://images.unsplash.com/photo-1604568992515-7eb40e279dd3?w=800&q=80',
    'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80'
  ],
  shopping: [
    'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80',
    'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80',
    'https://images.unsplash.com/photo-1573883430060-3e16bc2a0ba3?w=800&q=80',
    'https://images.unsplash.com/photo-1567958451986-2de427a4a0be?w=800&q=80',
    'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80'
  ],
  nightlife: [
    'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80',
    'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80',
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80',
    'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80',
    'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&q=80'
  ],
  anime: [
    'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&q=80',
    'https://images.unsplash.com/photo-1542779283-429940ce8336?w=800&q=80',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    'https://images.unsplash.com/photo-1627894483800-5bb82dcc1fe4?w=800&q=80',
    'https://images.unsplash.com/photo-1628599946011-bb6e02748c0e?w=800&q=80'
  ],
  relaxation: [
    'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&q=80',
    'https://images.unsplash.com/photo-1573883430060-3e16bc2a0ba3?w=800&q=80',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&q=80',
    'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80'
  ],
  family: [
    'https://images.unsplash.com/photo-1564245303448-86b1c7b8e3cb?w=800&q=80',
    'https://images.unsplash.com/photo-1542779283-429940ce8336?w=800&q=80',
    'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80',
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
    'https://images.unsplash.com/photo-1471623432079-b009d30b6729?w=800&q=80'
  ]
};

// Imágenes para la landing page
export const LANDING_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80',
  features: [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
    'https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&q=80',
    'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&q=80'
  ]
};

/**
 * Obtiene una imagen para una actividad basándose en su categoría
 * @param {string} activityId - ID de la actividad
 * @param {string} category - Categoría de la actividad
 * @returns {string} URL de la imagen
 */
export function getActivityImage(activityId, category) {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.culture;

  // Usar el ID para seleccionar consistentemente la misma imagen
  const hash = activityId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const index = Math.abs(hash) % images.length;
  return images[index];
}

/**
 * Obtiene la imagen de una ciudad
 * @param {string} cityId - ID de la ciudad
 * @returns {string} URL de la imagen
 */
export function getCityImage(cityId) {
  return CITY_IMAGES[cityId.toLowerCase()] || CITY_IMAGES.tokyo;
}

/**
 * Obtiene una imagen para el día del itinerario basándose en las ciudades
 * @param {Array} cities - Lista de ciudades del día
 * @returns {string} URL de la imagen
 */
export function getDayImage(cities) {
  if (!cities || cities.length === 0) {
    return LANDING_IMAGES.hero;
  }

  const firstCity = cities[0];
  return getCityImage(firstCity.cityId || firstCity);
}

/**
 * Precarga una imagen para mejor performance
 * @param {string} url - URL de la imagen
 */
export function preloadImage(url) {
  const img = new Image();
  img.src = url;
}

/**
 * Precarga múltiples imágenes
 * @param {Array<string>} urls - Array de URLs
 */
export function preloadImages(urls) {
  urls.forEach(url => preloadImage(url));
}

// Exportar para uso global
window.ImageService = {
  getActivityImage,
  getCityImage,
  getDayImage,
  preloadImage,
  preloadImages,
  CITY_IMAGES,
  CATEGORY_IMAGES,
  LANDING_IMAGES
};

export default {
  getActivityImage,
  getCityImage,
  getDayImage,
  preloadImage,
  preloadImages,
  CITY_IMAGES,
  CATEGORY_IMAGES,
  LANDING_IMAGES
};
