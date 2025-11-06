// js/location-autocomplete.js - Sistema de autocompletado de ubicaciones con coordenadas

/**
 * Base de datos de lugares populares en Japón con coordenadas
 */
const JAPAN_LOCATIONS = [
  // Tokyo
  { name: 'Tokyo Tower', city: 'Tokyo', lat: 35.6586, lng: 139.7454, keywords: ['tower', 'tokyo'] },
  { name: 'Tokyo Skytree', city: 'Tokyo', lat: 35.7101, lng: 139.8107, keywords: ['skytree', 'tokyo'] },
  { name: 'Shibuya Crossing', city: 'Tokyo', lat: 35.6595, lng: 139.7004, keywords: ['shibuya', 'crossing'] },
  { name: 'Senso-ji Temple (Asakusa)', city: 'Tokyo', lat: 35.7148, lng: 139.7967, keywords: ['sensoji', 'asakusa', 'temple'] },
  { name: 'Meiji Shrine', city: 'Tokyo', lat: 35.6764, lng: 139.6993, keywords: ['meiji', 'shrine', 'harajuku'] },
  { name: 'Shinjuku Station', city: 'Tokyo', lat: 35.6896, lng: 139.7006, keywords: ['shinjuku', 'station'] },
  { name: 'Harajuku Takeshita Street', city: 'Tokyo', lat: 35.6702, lng: 139.7027, keywords: ['harajuku', 'takeshita'] },
  { name: 'Tsukiji Outer Market', city: 'Tokyo', lat: 35.6654, lng: 139.7707, keywords: ['tsukiji', 'market'] },
  { name: 'Akihabara Electric Town', city: 'Tokyo', lat: 35.6982, lng: 139.7731, keywords: ['akihabara', 'electric'] },
  { name: 'Ueno Park', city: 'Tokyo', lat: 35.7148, lng: 139.7739, keywords: ['ueno', 'park'] },
  { name: 'Imperial Palace', city: 'Tokyo', lat: 35.6852, lng: 139.7528, keywords: ['imperial', 'palace'] },
  { name: 'Roppongi Hills', city: 'Tokyo', lat: 35.6605, lng: 139.7292, keywords: ['roppongi', 'hills'] },
  { name: 'Odaiba Seaside Park', city: 'Tokyo', lat: 35.6301, lng: 139.7742, keywords: ['odaiba', 'seaside'] },
  { name: 'Tokyo Disneyland', city: 'Tokyo', lat: 35.6329, lng: 139.8804, keywords: ['disneyland', 'disney'] },
  { name: 'Tokyo DisneySea', city: 'Tokyo', lat: 35.6267, lng: 139.8890, keywords: ['disneysea', 'disney'] },
  { name: 'Ginza Shopping District', city: 'Tokyo', lat: 35.6717, lng: 139.7650, keywords: ['ginza', 'shopping'] },
  { name: 'teamLab Borderless', city: 'Tokyo', lat: 35.6243, lng: 139.7750, keywords: ['teamlab', 'borderless'] },

  // Kyoto
  { name: 'Fushimi Inari Shrine', city: 'Kyoto', lat: 34.9671, lng: 135.7727, keywords: ['fushimi', 'inari', 'shrine'] },
  { name: 'Kinkaku-ji (Golden Pavilion)', city: 'Kyoto', lat: 35.0394, lng: 135.7292, keywords: ['kinkakuji', 'golden', 'pavilion'] },
  { name: 'Kiyomizu-dera Temple', city: 'Kyoto', lat: 34.9949, lng: 135.7850, keywords: ['kiyomizu', 'temple'] },
  { name: 'Arashiyama Bamboo Grove', city: 'Kyoto', lat: 35.0171, lng: 135.6719, keywords: ['arashiyama', 'bamboo'] },
  { name: 'Gion District', city: 'Kyoto', lat: 35.0036, lng: 135.7781, keywords: ['gion', 'geisha'] },
  { name: 'Nijo Castle', city: 'Kyoto', lat: 35.0142, lng: 135.7481, keywords: ['nijo', 'castle'] },
  { name: 'Philosopher\'s Path', city: 'Kyoto', lat: 35.0267, lng: 135.7947, keywords: ['philosopher', 'path'] },
  { name: 'Kyoto Station', city: 'Kyoto', lat: 34.9859, lng: 135.7581, keywords: ['kyoto', 'station'] },
  { name: 'Ginkaku-ji (Silver Pavilion)', city: 'Kyoto', lat: 35.0270, lng: 135.7983, keywords: ['ginkakuji', 'silver', 'pavilion'] },

  // Osaka
  { name: 'Osaka Castle', city: 'Osaka', lat: 34.6873, lng: 135.5262, keywords: ['osaka', 'castle'] },
  { name: 'Dotonbori', city: 'Osaka', lat: 34.6686, lng: 135.5010, keywords: ['dotonbori', 'namba'] },
  { name: 'Universal Studios Japan', city: 'Osaka', lat: 34.6654, lng: 135.4321, keywords: ['universal', 'usj'] },
  { name: 'Shinsekai', city: 'Osaka', lat: 34.6524, lng: 135.5065, keywords: ['shinsekai', 'tsutenkaku'] },
  { name: 'Umeda Sky Building', city: 'Osaka', lat: 34.7054, lng: 135.4903, keywords: ['umeda', 'sky'] },
  { name: 'Kuromon Market', city: 'Osaka', lat: 34.6663, lng: 135.5063, keywords: ['kuromon', 'market'] },

  // Nara
  { name: 'Nara Park', city: 'Nara', lat: 34.6851, lng: 135.8431, keywords: ['nara', 'park', 'deer'] },
  { name: 'Todai-ji Temple', city: 'Nara', lat: 34.6890, lng: 135.8398, keywords: ['todaiji', 'temple', 'nara'] },

  // Hiroshima
  { name: 'Hiroshima Peace Memorial Park', city: 'Hiroshima', lat: 34.3955, lng: 132.4536, keywords: ['hiroshima', 'peace', 'memorial'] },
  { name: 'Itsukushima Shrine (Miyajima)', city: 'Hiroshima', lat: 34.2958, lng: 132.3197, keywords: ['miyajima', 'itsukushima', 'shrine'] },

  // Hakone
  { name: 'Hakone Shrine', city: 'Hakone', lat: 35.2055, lng: 139.0237, keywords: ['hakone', 'shrine'] },
  { name: 'Lake Ashi', city: 'Hakone', lat: 35.1997, lng: 139.0251, keywords: ['ashi', 'lake', 'hakone'] },

  // Mount Fuji
  { name: 'Mount Fuji 5th Station', city: 'Fujiyoshida', lat: 35.3606, lng: 138.7278, keywords: ['fuji', 'mount', 'station'] },

  // Nikko
  { name: 'Toshogu Shrine', city: 'Nikko', lat: 36.7580, lng: 139.5989, keywords: ['toshogu', 'nikko', 'shrine'] },

  // Yokohama
  { name: 'Yokohama Chinatown', city: 'Yokohama', lat: 35.4437, lng: 139.6455, keywords: ['yokohama', 'chinatown'] },
  { name: 'Yokohama Red Brick Warehouse', city: 'Yokohama', lat: 35.4529, lng: 139.6425, keywords: ['yokohama', 'red', 'brick'] },

  // Kamakura
  { name: 'Great Buddha of Kamakura', city: 'Kamakura', lat: 35.3166, lng: 139.5364, keywords: ['kamakura', 'buddha', 'daibutsu'] }
];

/**
 * Busca ubicaciones que coincidan con el query
 */
function searchLocations(query) {
  if (!query || query.length < 2) return [];

  const queryLower = query.toLowerCase();
  const matches = [];

  for (const location of JAPAN_LOCATIONS) {
    const score = calculateMatchScore(location, queryLower);
    if (score > 0) {
      matches.push({ ...location, score });
    }
  }

  // Ordenar por score (mayor primero)
  matches.sort((a, b) => b.score - a.score);

  // Retornar top 5
  return matches.slice(0, 5);
}

/**
 * Calcula un score de coincidencia (mayor = mejor match)
 */
function calculateMatchScore(location, query) {
  let score = 0;

  // Coincidencia exacta en nombre
  if (location.name.toLowerCase().includes(query)) {
    score += 100;
    // Bonus si empieza con el query
    if (location.name.toLowerCase().startsWith(query)) {
      score += 50;
    }
  }

  // Coincidencia en keywords
  for (const keyword of location.keywords) {
    if (keyword.includes(query)) {
      score += 30;
    }
    if (keyword.startsWith(query)) {
      score += 20;
    }
  }

  // Coincidencia en ciudad
  if (location.city.toLowerCase().includes(query)) {
    score += 10;
  }

  return score;
}

/**
 * Inicializa el autocompletado de ubicaciones en el modal de actividad
 */
function initLocationAutocomplete() {
  const titleInput = document.getElementById('activityTitle');
  const latInput = document.getElementById('activityLat');
  const lngInput = document.getElementById('activityLng');

  if (!titleInput || !latInput || !lngInput) {
    console.warn('⚠️ Location autocomplete inputs not found');
    return;
  }

  // Crear dropdown si no existe
  let dropdown = document.getElementById('locationAutocompleteDropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'locationAutocompleteDropdown';
    dropdown.className = 'hidden absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-lg shadow-xl max-h-60 overflow-y-auto';

    // Insertar después del campo de título
    titleInput.parentElement.appendChild(dropdown);
  }

  // Event listener para el input
  titleInput.addEventListener('input', (e) => {
    const query = e.target.value;
    const matches = searchLocations(query);

    if (matches.length === 0) {
      dropdown.classList.add('hidden');
      return;
    }

    // Construir HTML del dropdown
    dropdown.innerHTML = matches.map(location => `
      <div class="location-suggestion p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
           data-lat="${location.lat}"
           data-lng="${location.lng}"
           data-name="${location.name}">
        <div class="flex items-center gap-2">
          <span class="text-lg">📍</span>
          <div>
            <div class="font-semibold text-gray-900 dark:text-white">${location.name}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">${location.city} • ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</div>
          </div>
        </div>
      </div>
    `).join('');

    // Event listeners para las sugerencias
    dropdown.querySelectorAll('.location-suggestion').forEach(item => {
      item.addEventListener('click', () => {
        const lat = parseFloat(item.dataset.lat);
        const lng = parseFloat(item.dataset.lng);
        const name = item.dataset.name;

        // Autocompletar título si está vacío o es muy corto
        if (titleInput.value.length < 3) {
          titleInput.value = name;
        }

        // Rellenar coordenadas
        latInput.value = lat;
        lngInput.value = lng;

        // Ocultar dropdown
        dropdown.classList.add('hidden');

        // Mostrar feedback
        const feedback = document.createElement('div');
        feedback.className = 'mt-2 p-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs';
        feedback.textContent = `✅ Ubicación agregada: ${name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        latInput.parentElement.parentElement.appendChild(feedback);

        setTimeout(() => feedback.remove(), 3000);
      });
    });

    dropdown.classList.remove('hidden');
  });

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!titleInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  console.log('✅ Location autocomplete initialized');
}

// Exportar funciones
export const LocationAutocomplete = {
  init: initLocationAutocomplete,
  search: searchLocations,
  locations: JAPAN_LOCATIONS
};

// También exponer globalmente
if (typeof window !== 'undefined') {
  window.LocationAutocomplete = LocationAutocomplete;
}
