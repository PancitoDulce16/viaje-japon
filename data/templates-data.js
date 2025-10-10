// data/templates-data.js - Plantillas Predeterminadas con Itinerarios Reales

import { ACTIVITIES_DATABASE } from './activities-database.js';

export const ITINERARY_TEMPLATES = {
  adventure: {
    id: 'adventure',
    name: 'Aventurero',
    icon: '🏔️',
    description: 'Para los que buscan adrenalina y experiencias únicas',
    cities: ['tokyo', 'hakone', 'osaka'],
    categories: ['nature', 'photography', 'adventure'],
    days: [
      {
        day: 1,
        title: 'Llegada a Tokyo - Exploración Urbana',
        activities: [
          { from: 'tokyo-shibuya-crossing', time: '14:00' },
          { from: 'tokyo-harajuku', time: '15:30' },
          { from: 'tokyo-meiji', time: '17:30' },
          { from: 'tokyo-robot-restaurant', time: '19:00' }
        ]
      },
      {
        day: 2,
        title: 'Tokyo - Cultura y Alturas',
        activities: [
          { from: 'tokyo-tsukiji', time: '08:00' },
          { from: 'tokyo-sensoji', time: '11:00' },
          { from: 'tokyo-skytree', time: '15:00' },
          { from: 'tokyo-akihabara', time: '18:00' }
        ]
      },
      {
        day: 3,
        title: 'Hakone - Naturaleza y Onsen',
        activities: [
          { from: 'hakone-lake-ashi', time: '10:00' },
          { from: 'hakone-onsen', time: '16:00' }
        ]
      },
      {
        day: 4,
        title: 'Osaka - Comida y Diversión',
        activities: [
          { from: 'osaka-castle', time: '09:00' },
          { from: 'osaka-kuromon', time: '12:00' },
          { from: 'osaka-dotonbori', time: '18:00' }
        ]
      },
      {
        day: 5,
        title: 'Universal Studios Japan',
        activities: [
          { from: 'osaka-usj', time: '09:00' }
        ]
      }
    ]
  },

  cultural: {
    id: 'cultural',
    name: 'Cultura y Tradición',
    icon: '⛩️',
    description: 'Sumérgete en la historia y tradiciones japonesas',
    cities: ['tokyo', 'kyoto', 'nara'],
    categories: ['culture', 'nature', 'photography'],
    days: [
      {
        day: 1,
        title: 'Tokyo - Templos y Jardines',
        activities: [
          { from: 'tokyo-sensoji', time: '09:00' },
          { from: 'tokyo-meiji', time: '12:00' },
          { from: 'tokyo-shinjuku-gyoen', time: '15:00' }
        ]
      },
      {
        day: 2,
        title: 'Kamakura - Día Completo',
        activities: [
          { from: 'kamakura-daibutsu', time: '10:00' },
          { from: 'kamakura-hasedera', time: '12:30' }
        ]
      },
      {
        day: 3,
        title: 'Kyoto - Templos Dorados',
        activities: [
          { from: 'kyoto-kinkakuji', time: '09:00' },
          { from: 'kyoto-arashiyama', time: '12:00' },
          { from: 'kyoto-gion', time: '17:00' }
        ]
      },
      {
        day: 4,
        title: 'Kyoto - Fushimi Inari y Más',
        activities: [
          { from: 'kyoto-fushimi-inari', time: '08:00' },
          { from: 'kyoto-kiyomizu', time: '12:00' },
          { from: 'kyoto-tea-ceremony', time: '15:00' }
        ]
      },
      {
        day: 5,
        title: 'Nara - Ciervos y Templos',
        activities: [
          { from: 'nara-park', time: '09:00' },
          { from: 'nara-todaiji', time: '11:30' },
          { from: 'nara-mochi', time: '14:00' }
        ]
      },
      {
        day: 6,
        title: 'Kyoto - Camino del Filósofo',
        activities: [
          { from: 'kyoto-philosopher-path', time: '09:00' },
          { from: 'kyoto-torii-gates', time: '14:00' }
        ]
      }
    ]
  },

  foodie: {
    id: 'foodie',
    name: 'Ruta Gastronómica',
    icon: '🍜',
    description: 'Un viaje para los amantes de la comida japonesa',
    cities: ['tokyo', 'osaka', 'kyoto'],
    categories: ['food', 'culture', 'nightlife'],
    days: [
      {
        day: 1,
        title: 'Tokyo - Mercados y Street Food',
        activities: [
          { from: 'tokyo-tsukiji', time: '08:00' },
          { from: 'tokyo-sensoji', time: '11:00' },
          { from: 'tokyo-harajuku', time: '14:00' },
          { from: 'tokyo-ichiran', time: '19:00' }
        ]
      },
      {
        day: 2,
        title: 'Tokyo - Experiencias Únicas',
        activities: [
          { from: 'tokyo-pokemon-cafe', time: '12:00' },
          { from: 'tokyo-kirby-cafe', time: '15:00' },
          { from: 'tokyo-shibuya-crossing', time: '18:00' }
        ]
      },
      {
        day: 3,
        title: 'Osaka - Capital Gastronómica',
        activities: [
          { from: 'osaka-kuromon', time: '09:00' },
          { from: 'osaka-takoyaki', time: '13:00' },
          { from: 'osaka-okonomiyaki', time: '16:00' },
          { from: 'osaka-dotonbori', time: '19:00' }
        ]
      },
      {
        day: 4,
        title: 'Kyoto - Tradición y Sabor',
        activities: [
          { from: 'kyoto-tea-ceremony', time: '10:00' },
          { from: 'kyoto-gion', time: '14:00' },
          { from: 'kyoto-arashiyama', time: '17:00' }
        ]
      }
    ]
  },

  otaku: {
    id: 'otaku',
    name: 'Paraíso Anime/Manga',
    icon: '🎮',
    description: 'Para fans del anime, manga y cultura pop japonesa',
    cities: ['tokyo', 'osaka'],
    categories: ['anime', 'shopping', 'food'],
    days: [
      {
        day: 1,
        title: 'Tokyo - Akihabara Total',
        activities: [
          { from: 'tokyo-akihabara', time: '10:00' },
          { from: 'tokyo-pokemon-cafe', time: '13:00' },
          { from: 'tokyo-kirby-cafe', time: '16:00' }
        ]
      },
      {
        day: 2,
        title: 'Tokyo - Harajuku y Shibuya',
        activities: [
          { from: 'tokyo-harajuku', time: '11:00' },
          { from: 'tokyo-shibuya-crossing', time: '15:00' },
          { from: 'tokyo-robot-restaurant', time: '19:00' }
        ]
      },
      {
        day: 3,
        title: 'Tokyo - Exploración Libre',
        activities: [
          { from: 'tokyo-tower', time: '14:00' },
          { from: 'tokyo-akihabara', time: '17:00' }
        ]
      },
      {
        day: 4,
        title: 'Osaka - Universal Studios',
        activities: [
          { from: 'osaka-usj', time: '09:00' }
        ]
      },
      {
        day: 5,
        title: 'Osaka - Compras y Diversión',
        activities: [
          { from: 'osaka-dotonbori', time: '14:00' },
          { from: 'osaka-kuromon', time: '17:00' }
        ]
      }
    ]
  },

  relaxation: {
    id: 'relaxation',
    name: 'Relax y Bienestar',
    icon: '♨️',
    description: 'Viaje tranquilo enfocado en descanso y naturaleza',
    cities: ['tokyo', 'hakone', 'kyoto'],
    categories: ['relaxation', 'nature', 'culture'],
    days: [
      {
        day: 1,
        title: 'Tokyo - Llegada Suave',
        activities: [
          { from: 'tokyo-shinjuku-gyoen', time: '14:00' },
          { from: 'tokyo-meiji', time: '17:00' }
        ]
      },
      {
        day: 2,
        title: 'Hakone - Onsen y Naturaleza',
        activities: [
          { from: 'hakone-lake-ashi', time: '10:00' },
          { from: 'hakone-onsen', time: '15:00' }
        ]
      },
      {
        day: 3,
        title: 'Kyoto - Jardines y Templos',
        activities: [
          { from: 'kyoto-arashiyama', time: '09:00' },
          { from: 'kyoto-tea-ceremony', time: '14:00' }
        ]
      },
      {
        day: 4,
        title: 'Kyoto - Contemplación',
        activities: [
          { from: 'kyoto-philosopher-path', time: '09:00' },
          { from: 'kyoto-kinkakuji', time: '13:00' }
        ]
      },
      {
        day: 5,
        title: 'Nara - Día con la Naturaleza',
        activities: [
          { from: 'nara-park', time: '10:00' },
          { from: 'nara-todaiji', time: '13:00' }
        ]
      },
      {
        day: 6,
        title: 'Tokyo - Onsen Urbano',
        activities: [
          { from: 'tokyo-oedo-onsen', time: '16:00' }
        ]
      }
    ]
  },

  family: {
    id: 'family',
    name: 'Viaje en Familia',
    icon: '👨‍👩‍👧‍👦',
    description: 'Actividades divertidas para toda la familia',
    cities: ['tokyo', 'osaka', 'kyoto'],
    categories: ['family', 'food', 'nature', 'anime'],
    days: [
      {
        day: 1,
        title: 'Tokyo - Diversión para Todos',
        activities: [
          { from: 'tokyo-pokemon-cafe', time: '12:00' },
          { from: 'tokyo-harajuku', time: '14:30' },
          { from: 'tokyo-shibuya-crossing', time: '17:00' }
        ]
      },
      {
        day: 2,
        title: 'Tokyo - Torres y Vistas',
        activities: [
          { from: 'tokyo-skytree', time: '10:00' },
          { from: 'tokyo-sensoji', time: '13:00' },
          { from: 'tokyo-akihabara', time: '16:00' }
        ]
      },
      {
        day: 3,
        title: 'Nara - Día con Ciervos',
        activities: [
          { from: 'nara-park', time: '09:00' },
          { from: 'nara-todaiji', time: '12:00' },
          { from: 'nara-mochi', time: '14:30' }
        ]
      },
      {
        day: 4,
        title: 'Osaka - Universal Studios',
        activities: [
          { from: 'osaka-usj', time: '09:00' }
        ]
      },
      {
        day: 5,
        title: 'Osaka - Acuario y Comida',
        activities: [
          { from: 'osaka-aquarium', time: '10:00' },
          { from: 'osaka-dotonbori', time: '18:00' }
        ]
      },
      {
        day: 6,
        title: 'Kyoto - Cultura Accesible',
        activities: [
          { from: 'kyoto-arashiyama', time: '09:00' },
          { from: 'kyoto-kinkakuji', time: '13:00' },
          { from: 'kyoto-gion', time: '17:00' }
        ]
      }
    ]
  }
};

// Función para convertir plantilla en itinerario completo
export function generateItineraryFromTemplate(template, startDate) {
  const templateData = ITINERARY_TEMPLATES[template];
  if (!templateData) return null;

  const days = [];
  const start = new Date(startDate);

  templateData.days.forEach((dayTemplate, index) => {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + index);

    const activities = dayTemplate.activities.map(activityRef => {
      // Buscar actividad en la base de datos
      let fullActivity = null;
      for (const cityId in ACTIVITIES_DATABASE) {
        const found = ACTIVITIES_DATABASE[cityId].activities.find(
          a => a.id === activityRef.from
        );
        if (found) {
          fullActivity = found;
          break;
        }
      }

      if (!fullActivity) {
        console.warn(`Actividad ${activityRef.from} no encontrada`);
        return null;
      }

      // Obtener categoría para el icono
      const categoryData = getCategoryById(fullActivity.category);

      return {
        id: fullActivity.id,
        title: fullActivity.name,
        desc: fullActivity.description,
        time: activityRef.time,
        duration: fullActivity.duration || 60,
        icon: categoryData?.icon || '📍',
        cost: fullActivity.cost || 0,
        station: fullActivity.station || '',
        category: fullActivity.category
      };
    }).filter(a => a !== null);

    days.push({
      day: index + 1,
      date: dayDate.toISOString().split('T')[0],
      title: dayTemplate.title,
      activities: activities
    });
  });

  return {
    name: templateData.name,
    cities: templateData.cities,
    categories: templateData.categories,
    days: days
  };
}

function getCategoryById(categoryId) {
  // Importar dinámicamente para evitar dependencias circulares
  const categories = [
    { id: 'culture', icon: '⛩️', name: 'Cultura' },
    { id: 'food', icon: '🍜', name: 'Gastronomía' },
    { id: 'nature', icon: '🌸', name: 'Naturaleza' },
    { id: 'shopping', icon: '🛍️', name: 'Compras' },
    { id: 'nightlife', icon: '🌃', name: 'Vida Nocturna' },
    { id: 'photography', icon: '📸', name: 'Fotografía' },
    { id: 'anime', icon: '🎌', name: 'Anime/Manga' },
    { id: 'relaxation', icon: '♨️', name: 'Relajación' },
    { id: 'adventure', icon: '🏔️', name: 'Aventura' },
    { id: 'family', icon: '👨‍👩‍👧', name: 'Familiar' }
  ];
  
  return categories.find(c => c.id === categoryId);
}
