// data/routes-database.js - Base de Datos de Rutas Detalladas

// Sistema de rutas inteligentes con direcciones paso a paso
export const ROUTES_DATABASE = {
  // Rutas desde estaciones principales a atracciones en Tokyo
  'shibuya-station-to-shibuya-crossing': {
    from: 'Shibuya Station',
    to: 'Shibuya Crossing',
    steps: [
      {
        type: 'walk',
        description: 'Sal por la salida Hachiko',
        duration: 1,
        icon: '🚶'
      },
      {
        type: 'landmark',
        description: 'Verás la estatua de Hachiko a tu izquierda',
        icon: '🐕'
      },
      {
        type: 'arrive',
        description: '¡El cruce está justo enfrente!',
        duration: 0,
        icon: '📍'
      }
    ],
    totalTime: '1 min a pie',
    cost: 0,
    jrPassCovered: false
  },

  'shibuya-station-to-ichiran-ramen': {
    from: 'Shibuya Station',
    to: 'Ichiran Ramen Shibuya',
    steps: [
      {
        type: 'walk',
        description: 'Sal por la salida Hachiko',
        duration: 2,
        icon: '🚶'
      },
      {
        type: 'direction',
        description: 'Gira a la derecha y camina por Dogenzaka Street',
        duration: 3,
        icon: '➡️'
      },
      {
        type: 'landmark',
        description: 'Verás el letrero rojo de Ichiran a 100m',
        icon: '🍜'
      },
      {
        type: 'arrive',
        description: 'Ichiran está en el segundo piso del edificio',
        icon: '📍'
      }
    ],
    totalTime: '5 min a pie',
    cost: 0,
    jrPassCovered: false
  },

  'asakusa-station-to-sensoji': {
    from: 'Asakusa Station',
    to: 'Templo Senso-ji',
    steps: [
      {
        type: 'walk',
        description: 'Sal por la salida 1',
        duration: 1,
        icon: '🚶'
      },
      {
        type: 'landmark',
        description: 'Verás la gran puerta roja Kaminarimon enfrente',
        icon: '⛩️'
      },
      {
        type: 'direction',
        description: 'Cruza la puerta y camina por Nakamise-dori (calle comercial)',
        duration: 3,
        icon: '🚶'
      },
      {
        type: 'arrive',
        description: 'El templo principal está al final de Nakamise-dori',
        icon: '📍'
      }
    ],
    totalTime: '5 min a pie',
    cost: 0,
    jrPassCovered: false
  },

  'harajuku-station-to-meiji-shrine': {
    from: 'Harajuku Station',
    to: 'Santuario Meiji',
    steps: [
      {
        type: 'walk',
        description: 'Sal por la salida Omotesando (salida oeste)',
        duration: 1,
        icon: '🚶'
      },
      {
        type: 'landmark',
        description: 'Verás el gran torii (puerta) del bosque enfrente',
        icon: '⛩️'
      },
      {
        type: 'direction',
        description: 'Camina por el sendero arbolado (muy bonito)',
        duration: 8,
        icon: '🌳'
      },
      {
        type: 'arrive',
        description: 'El santuario principal está al final del sendero',
        icon: '📍'
      }
    ],
    totalTime: '10 min a pie por bosque',
    cost: 0,
    jrPassCovered: false
  },

  // Rutas en Kyoto
  'kyoto-station-to-fushimi-inari': {
    from: 'Kyoto Station',
    to: 'Fushimi Inari Shrine',
    steps: [
      {
        type: 'train',
        description: 'Toma JR Nara Line (línea naranja)',
        line: 'JR Nara Line',
        platform: 'Plataforma 8-9',
        direction: 'Dirección Nara',
        duration: 5,
        icon: '🚆'
      },
      {
        type: 'station',
        description: 'Baja en Inari Station (2 estaciones)',
        icon: '🚉'
      },
      {
        type: 'walk',
        description: 'Sal de la estación, gira a la derecha',
        duration: 2,
        icon: '🚶'
      },
      {
        type: 'arrive',
        description: 'La entrada del santuario está a 100m',
        icon: '📍'
      }
    ],
    totalTime: '10 min total (5 min tren + 2 min a pie)',
    cost: 150,
    costCurrency: 'JPY',
    jrPassCovered: true,
    suicaCovered: true
  },

  'kyoto-station-to-kinkakuji': {
    from: 'Kyoto Station',
    to: 'Kinkaku-ji (Pabellón Dorado)',
    steps: [
      {
        type: 'bus',
        description: 'Toma el bus 101 o 205 desde Kyoto Station Bus Terminal',
        busNumber: '101 o 205',
        platform: 'Parada B2 o B3',
        direction: 'Dirección Kinkakuji-michi',
        duration: 35,
        icon: '🚌'
      },
      {
        type: 'station',
        description: 'Baja en parada "Kinkakuji-michi"',
        icon: '🚏'
      },
      {
        type: 'walk',
        description: 'Camina 5 minutos hacia el norte',
        duration: 5,
        icon: '🚶'
      },
      {
        type: 'arrive',
        description: 'La entrada del templo está señalizada',
        icon: '📍'
      }
    ],
    totalTime: '45 min total (35 min bus + 5 min a pie)',
    cost: 230,
    costCurrency: 'JPY',
    jrPassCovered: false,
    suicaCovered: true
  },

  // Rutas en Osaka
  'namba-station-to-dotonbori': {
    from: 'Namba Station',
    to: 'Dotonbori',
    steps: [
      {
        type: 'walk',
        description: 'Sal por la salida 14 (Namba Walk)',
        duration: 1,
        icon: '🚶'
      },
      {
        type: 'landmark',
        description: 'Sigue las señales hacia Dotonbori River',
        icon: '🏮'
      },
      {
        type: 'walk',
        description: 'Camina 5 minutos hacia el río',
        duration: 5,
        icon: '🚶'
      },
      {
        type: 'arrive',
        description: '¡Verás el famoso Glico Running Man!',
        icon: '🏃'
      }
    ],
    totalTime: '7 min a pie',
    cost: 0,
    jrPassCovered: false
  },

  'osakako-station-to-kaiyukan': {
    from: 'Osakako Station',
    to: 'Osaka Aquarium Kaiyukan',
    steps: [
      {
        type: 'walk',
        description: 'Sal por la salida 1',
        duration: 2,
        icon: '🚶'
      },
      {
        type: 'landmark',
        description: 'Verás la noria gigante (Tempozan Ferris Wheel) enfrente',
        icon: '🎡'
      },
      {
        type: 'walk',
        description: 'Camina hacia la noria, el acuario está al lado',
        duration: 3,
        icon: '🚶'
      },
      {
        type: 'arrive',
        description: 'Entrada del acuario con el letrero azul grande',
        icon: '🐠'
      }
    ],
    totalTime: '5 min a pie',
    cost: 0,
    jrPassCovered: false
  },

  // Rutas en Nara
  'nara-station-to-nara-park': {
    from: 'Nara Station (JR)',
    to: 'Nara Park',
    steps: [
      {
        type: 'walk',
        description: 'Sal por la salida este',
        duration: 2,
        icon: '🚶'
      },
      {
        type: 'direction',
        description: 'Camina hacia el este por Sanjo-dori Street',
        duration: 15,
        icon: '🚶'
      },
      {
        type: 'landmark',
        description: '¡Empezarás a ver ciervos caminando libremente!',
        icon: '🦌'
      },
      {
        type: 'arrive',
        description: 'El parque principal comienza en la intersección',
        icon: '🌳'
      }
    ],
    totalTime: '20 min a pie',
    cost: 0,
    jrPassCovered: false
  }
};

// Función helper para obtener ruta entre dos lugares
export function getRoute(fromId, toId) {
  const routeKey = `${fromId}-to-${toId}`;
  return ROUTES_DATABASE[routeKey] || null;
}

// Función para buscar rutas por origen
export function getRoutesFrom(fromId) {
  return Object.entries(ROUTES_DATABASE)
    .filter(([key]) => key.startsWith(fromId))
    .map(([key, route]) => ({ key, ...route }));
}

// Función para renderizar direcciones en HTML
export function renderDirections(route) {
  if (!route) return '<p class="text-sm text-gray-500">No hay direcciones disponibles</p>';

  const costText = route.cost > 0
    ? `<span class="text-green-600 dark:text-green-400 font-semibold">¥${route.cost}</span> ${route.suicaCovered ? '(usar Suica)' : ''} ${route.jrPassCovered ? '(cubierto por JR Pass)' : ''}`
    : '<span class="text-green-600 dark:text-green-400 font-semibold">Gratis (a pie)</span>';

  return `
    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-3 border-l-4 border-blue-500">
      <div class="flex items-center justify-between mb-3">
        <h5 class="font-bold text-blue-900 dark:text-blue-300">🧭 Cómo llegar</h5>
        <div class="text-right text-sm">
          <div class="font-semibold text-gray-700 dark:text-gray-300">⏱️ ${route.totalTime}</div>
          <div class="text-xs">${costText}</div>
        </div>
      </div>

      <div class="space-y-3">
        ${route.steps.map((step, index) => `
          <div class="flex items-start gap-3">
            <span class="text-2xl flex-shrink-0">${step.icon}</span>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                  ${index + 1}
                </span>
                <p class="font-semibold text-gray-800 dark:text-gray-200">${step.description}</p>
              </div>
              ${step.line ? `<p class="text-xs text-gray-600 dark:text-gray-400 mt-1 ml-8">Línea: ${step.line}</p>` : ''}
              ${step.platform ? `<p class="text-xs text-gray-600 dark:text-gray-400 ml-8">${step.platform}</p>` : ''}
              ${step.direction ? `<p class="text-xs text-gray-600 dark:text-gray-400 ml-8">${step.direction}</p>` : ''}
              ${step.duration ? `<p class="text-xs text-blue-600 dark:text-blue-400 ml-8">⏱️ ${step.duration} min</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
        <a href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(route.from)}&destination=${encodeURIComponent(route.to)}&travelmode=transit"
           target="_blank"
           class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          📱 Abrir en Google Maps →
        </a>
      </div>
    </div>
  `;
}

export default {
  ROUTES_DATABASE,
  getRoute,
  getRoutesFrom,
  renderDirections
};
