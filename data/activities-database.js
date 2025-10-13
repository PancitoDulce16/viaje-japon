// data/activities-database.js - Base de Datos de Actividades por Ciudad

export const ACTIVITIES_DATABASE = {
  tokyo: {
    city: 'Tokyo',
    activities: [
      // CULTURA
      {
        id: 'tokyo-sensoji',
        name: 'Templo Senso-ji',
        category: 'culture',
        duration: 120,
        cost: 0,
        description: 'El templo más antiguo de Tokyo con la famosa calle Nakamise',
        location: { lat: 35.7148, lng: 139.7967 },
        station: 'Asakusa Station',
        rating: 4.8,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'tokyo-meiji',
        name: 'Santuario Meiji',
        category: 'culture',
        duration: 90,
        cost: 0,
        description: 'Santuario sintoísta en un bosque urbano',
        location: { lat: 35.6764, lng: 139.6993 },
        station: 'Harajuku Station',
        rating: 4.7,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      
      // GASTRONOMÍA
      {
        id: 'tokyo-tsukiji',
        name: 'Mercado Tsukiji Outer Market',
        category: 'food',
        duration: 180,
        cost: 3000,
        description: 'Mejor mercado de pescado y street food',
        location: { lat: 35.6654, lng: 139.7707 },
        station: 'Tsukijishijo Station',
        rating: 4.6,
        timeOfDay: ['morning'],
        bestSeason: 'all'
      },
      {
        id: 'tokyo-ichiran',
        name: 'Ichiran Ramen Shibuya',
        category: 'food',
        duration: 60,
        cost: 1000,
        description: 'Famoso ramen en cabinas individuales',
        location: { lat: 35.6595, lng: 139.7004 },
        station: 'Shibuya Station',
        rating: 4.5,
        timeOfDay: ['lunch', 'dinner'],
        bestSeason: 'all'
      },
      {
        id: 'tokyo-robot-restaurant',
        name: 'Robot Restaurant',
        category: 'nightlife',
        duration: 120,
        cost: 8000,
        description: 'Show espectacular con robots gigantes',
        location: { lat: 35.6938, lng: 139.7035 },
        station: 'Shinjuku Station',
        rating: 4.3,
        timeOfDay: ['evening'],
        bestSeason: 'all'
      },
      
      // FOTOGRAFÍA
      {
        id: 'tokyo-shibuya-crossing',
        name: 'Shibuya Crossing',
        category: 'photography',
        duration: 60,
        cost: 0,
        description: 'El cruce peatonal más famoso del mundo',
        location: { lat: 35.6595, lng: 139.7004 },
        station: 'Shibuya Station',
        rating: 4.7,
        timeOfDay: ['afternoon', 'evening'],
        bestSeason: 'all'
      },
      {
        id: 'tokyo-skytree',
        name: 'Tokyo Skytree',
        category: 'photography',
        duration: 120,
        cost: 2100,
        description: 'Torre más alta de Japón con vistas 360°',
        location: { lat: 35.7101, lng: 139.8107 },
        station: 'Tokyo Skytree Station',
        rating: 4.5,
        timeOfDay: ['afternoon', 'evening'],
        bestSeason: 'all'
      },
      {
        id: 'tokyo-tower',
        name: 'Torre de Tokyo',
        category: 'photography',
        duration: 90,
        cost: 1200,
        description: 'Torre icónica inspirada en la Torre Eiffel',
        location: { lat: 35.6586, lng: 139.7454 },
        station: 'Akabanebashi Station',
        rating: 4.4,
        timeOfDay: ['afternoon', 'evening'],
        bestSeason: 'all'
      },
      
      // NATURALEZA
      {
        id: 'tokyo-shinjuku-gyoen',
        name: 'Jardín Shinjuku Gyoen',
        category: 'nature',
        duration: 120,
        cost: 500,
        description: 'Jardín tradicional japonés con cerezos',
        location: { lat: 35.6852, lng: 139.7100 },
        station: 'Shinjuku-Gyoemmae Station',
        rating: 4.7,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'spring'
      },
      
      // COMPRAS
      {
        id: 'tokyo-harajuku',
        name: 'Takeshita Street Harajuku',
        category: 'shopping',
        duration: 120,
        cost: 5000,
        description: 'Calle de moda kawaii y cultura juvenil',
        location: { lat: 35.6702, lng: 139.7026 },
        station: 'Harajuku Station',
        rating: 4.6,
        timeOfDay: ['afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'tokyo-akihabara',
        name: 'Akihabara Electric Town',
        category: 'anime',
        duration: 180,
        cost: 0,
        description: 'Paraíso de la electrónica, anime y manga',
        location: { lat: 35.7022, lng: 139.7744 },
        station: 'Akihabara Station',
        rating: 4.7,
        timeOfDay: ['afternoon', 'evening'],
        bestSeason: 'all'
      },
      
      // ANIME/OTAKU
      {
        id: 'tokyo-pokemon-cafe',
        name: 'Pokemon Cafe',
        category: 'anime',
        duration: 90,
        cost: 2000,
        description: 'Café temático de Pokemon (requiere reserva)',
        location: { lat: 35.6812, lng: 139.7671 },
        station: 'Nihonbashi Station',
        rating: 4.8,
        timeOfDay: ['lunch', 'afternoon'],
        bestSeason: 'all',
        requiresReservation: true
      },
      {
        id: 'tokyo-kirby-cafe',
        name: 'Kirby Cafe',
        category: 'anime',
        duration: 90,
        cost: 1500,
        description: 'Café adorable de Kirby',
        location: { lat: 35.6812, lng: 139.7671 },
        station: 'Tokyo Station',
        rating: 4.7,
        timeOfDay: ['lunch', 'afternoon'],
        bestSeason: 'all',
        requiresReservation: true
      },
      
      // RELAJACIÓN
      {
        id: 'tokyo-oedo-onsen',
        name: 'Oedo Onsen Monogatari',
        category: 'relaxation',
        duration: 180,
        cost: 2900,
        description: 'Complejo de baños termales estilo Edo',
        location: { lat: 35.6269, lng: 139.7864 },
        station: 'Telecom Center Station',
        rating: 4.4,
        timeOfDay: ['evening'],
        bestSeason: 'all'
      }
    ]
  },
  
  kyoto: {
    city: 'Kyoto',
    activities: [
      // CULTURA
      {
        id: 'kyoto-fushimi-inari',
        name: 'Fushimi Inari Shrine',
        category: 'culture',
        duration: 180,
        cost: 0,
        description: 'Miles de puertas torii rojas en la montaña',
        location: { lat: 34.9671, lng: 135.7727 },
        station: 'Inari Station',
        rating: 4.8,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'kyoto-kinkakuji',
        name: 'Templo Kinkaku-ji (Pabellón Dorado)',
        category: 'culture',
        duration: 90,
        cost: 400,
        description: 'Templo cubierto en pan de oro',
        location: { lat: 35.0394, lng: 135.7292 },
        station: 'Kinkakuji-michi Bus Stop',
        rating: 4.7,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'kyoto-kiyomizu',
        name: 'Kiyomizu-dera Temple',
        category: 'culture',
        duration: 120,
        cost: 400,
        description: 'Templo con terraza de madera y vistas panorámicas',
        location: { lat: 34.9949, lng: 135.7850 },
        station: 'Gojo Station',
        rating: 4.6,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'spring'
      },
      {
        id: 'kyoto-gion',
        name: 'Distrito Gion',
        category: 'culture',
        duration: 120,
        cost: 0,
        description: 'Barrio de geishas con arquitectura tradicional',
        location: { lat: 35.0036, lng: 135.7753 },
        station: 'Gion-Shijo Station',
        rating: 4.7,
        timeOfDay: ['afternoon', 'evening'],
        bestSeason: 'all'
      },
      {
        id: 'kyoto-tea-ceremony',
        name: 'Ceremonia del Té',
        category: 'culture',
        duration: 90,
        cost: 3500,
        description: 'Experiencia auténtica de ceremonia del té',
        location: { lat: 35.0116, lng: 135.7681 },
        station: 'Arashiyama Station',
        rating: 4.8,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all',
        requiresReservation: true
      },
      
      // NATURALEZA
      {
        id: 'kyoto-arashiyama',
        name: 'Bosque de Bambú Arashiyama',
        category: 'nature',
        duration: 60,
        cost: 0,
        description: 'Sendero mágico entre bambúes gigantes',
        location: { lat: 35.0170, lng: 135.6726 },
        station: 'Saga-Arashiyama Station',
        rating: 4.7,
        timeOfDay: ['morning'],
        bestSeason: 'all'
      },
      {
        id: 'kyoto-philosopher-path',
        name: 'Camino del Filósofo',
        category: 'nature',
        duration: 90,
        cost: 0,
        description: 'Sendero junto al canal con cerezos',
        location: { lat: 35.0262, lng: 135.7946 },
        station: 'Ginkakuji-michi Bus Stop',
        rating: 4.6,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'spring'
      },
      
      // FOTOGRAFÍA
      {
        id: 'kyoto-torii-gates',
        name: 'Puertas Torii de Fushimi Inari',
        category: 'photography',
        duration: 180,
        cost: 0,
        description: 'Spot fotográfico más icónico de Kyoto',
        location: { lat: 34.9671, lng: 135.7727 },
        station: 'Inari Station',
        rating: 4.9,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      }
    ]
  },
  
  osaka: {
    city: 'Osaka',
    activities: [
      // CULTURA
      {
        id: 'osaka-castle',
        name: 'Castillo de Osaka',
        category: 'culture',
        duration: 120,
        cost: 600,
        description: 'Castillo histórico con museo y jardines',
        location: { lat: 34.6873, lng: 135.5262 },
        station: 'Osakajokoen Station',
        rating: 4.5,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'spring'
      },
      
      // GASTRONOMÍA
      {
        id: 'osaka-dotonbori',
        name: 'Dotonbori',
        category: 'food',
        duration: 180,
        cost: 4000,
        description: 'Calle de comida con el famoso Glico Man',
        location: { lat: 34.6686, lng: 135.5004 },
        station: 'Namba Station',
        rating: 4.7,
        timeOfDay: ['evening'],
        bestSeason: 'all'
      },
      {
        id: 'osaka-takoyaki',
        name: 'Takoyaki en Wanaka',
        category: 'food',
        duration: 60,
        cost: 600,
        description: 'Mejor takoyaki de Osaka',
        location: { lat: 34.6686, lng: 135.5004 },
        station: 'Namba Station',
        rating: 4.5,
        timeOfDay: ['lunch', 'dinner'],
        bestSeason: 'all'
      },
      {
        id: 'osaka-okonomiyaki',
        name: 'Okonomiyaki en Chibo',
        category: 'food',
        duration: 90,
        cost: 1000,
        description: 'Okonomiyaki tradicional de Osaka',
        location: { lat: 34.6686, lng: 135.5004 },
        station: 'Namba Station',
        rating: 4.5,
        timeOfDay: ['lunch', 'dinner'],
        bestSeason: 'all'
      },
      {
        id: 'osaka-kuromon',
        name: 'Kuromon Ichiba Market',
        category: 'food',
        duration: 120,
        cost: 2500,
        description: 'Mercado de comida fresca y street food',
        location: { lat: 34.6666, lng: 135.5064 },
        station: 'Nippombashi Station',
        rating: 4.6,
        timeOfDay: ['morning', 'lunch'],
        bestSeason: 'all'
      },
      
      // AVENTURA/FAMILIA
      {
        id: 'osaka-usj',
        name: 'Universal Studios Japan',
        category: 'family',
        duration: 480,
        cost: 8200,
        description: 'Parque temático con mundo de Harry Potter',
        location: { lat: 34.6658, lng: 135.4321 },
        station: 'Universal City Station',
        rating: 4.7,
        timeOfDay: ['morning'],
        bestSeason: 'all',
        requiresReservation: true
      },
      {
        id: 'osaka-aquarium',
        name: 'Osaka Aquarium Kaiyukan',
        category: 'family',
        duration: 180,
        cost: 2700,
        description: 'Uno de los acuarios más grandes del mundo',
        location: { lat: 34.6547, lng: 135.4293 },
        station: 'Osakako Station',
        rating: 4.6,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      }
    ]
  },
  
  nara: {
    city: 'Nara',
    activities: [
      {
        id: 'nara-park',
        name: 'Nara Park (Ciervos)',
        category: 'nature',
        duration: 150,
        cost: 150,
        description: 'Parque con más de 1000 ciervos amigables',
        location: { lat: 34.6851, lng: 135.8431 },
        station: 'Nara Station',
        rating: 4.8,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'nara-todaiji',
        name: 'Todai-ji Temple',
        category: 'culture',
        duration: 120,
        cost: 600,
        description: 'Templo con el Gran Buda de bronce',
        location: { lat: 34.6890, lng: 135.8398 },
        station: 'Nara Station',
        rating: 4.7,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'nara-mochi',
        name: 'Mochi Pounding Show',
        category: 'food',
        duration: 30,
        cost: 150,
        description: 'Show de preparación rápida de mochi',
        location: { lat: 34.6825, lng: 135.8311 },
        station: 'Kintetsu Nara Station',
        rating: 4.7,
        timeOfDay: ['afternoon'],
        bestSeason: 'all'
      }
    ]
  },
  
  kamakura: {
    city: 'Kamakura',
    activities: [
      {
        id: 'kamakura-daibutsu',
        name: 'Gran Buda de Kamakura',
        category: 'culture',
        duration: 90,
        cost: 300,
        description: 'Estatua monumental de bronce al aire libre',
        location: { lat: 35.3167, lng: 139.5361 },
        station: 'Hase Station',
        rating: 4.6,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'kamakura-hasedera',
        name: 'Templo Hase-dera',
        category: 'culture',
        duration: 90,
        cost: 400,
        description: 'Templo con vistas al mar y cuevas',
        location: { lat: 35.3125, lng: 139.5347 },
        station: 'Hase Station',
        rating: 4.7,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      }
    ]
  },
  
  hakone: {
    city: 'Hakone',
    activities: [
      {
        id: 'hakone-lake-ashi',
        name: 'Lake Ashi Cruise',
        category: 'nature',
        duration: 120,
        cost: 1000,
        description: 'Crucero en lago con vistas al Monte Fuji',
        location: { lat: 35.2047, lng: 139.0252 },
        station: 'Hakone-machi Port',
        rating: 4.6,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'hakone-onsen',
        name: 'Onsen Tradicional',
        category: 'relaxation',
        duration: 120,
        cost: 1500,
        description: 'Baños termales con vistas al Monte Fuji',
        location: { lat: 35.2325, lng: 139.1072 },
        station: 'Gora Station',
        rating: 4.8,
        timeOfDay: ['afternoon', 'evening'],
        bestSeason: 'all'
      }
    ]
  },

  hiroshima: {
    city: 'Hiroshima',
    activities: [
      {
        id: 'hiroshima-peace-park',
        name: 'Parque Memorial de la Paz',
        category: 'culture',
        duration: 180,
        cost: 0,
        description: 'Parque conmemorativo con el Domo de la Bomba Atómica',
        location: { lat: 34.3953, lng: 132.4536 },
        station: 'Genbaku Dome-mae Station',
        rating: 4.7,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'hiroshima-museum',
        name: 'Museo Memorial de la Paz',
        category: 'culture',
        duration: 120,
        cost: 200,
        description: 'Museo sobre la historia de Hiroshima',
        location: { lat: 34.3916, lng: 132.4530 },
        station: 'Genbaku Dome-mae Station',
        rating: 4.8,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'hiroshima-miyajima',
        name: 'Isla Miyajima (Itsukushima)',
        category: 'nature',
        duration: 300,
        cost: 360,
        description: 'Isla sagrada con torii flotante icónico',
        location: { lat: 34.2959, lng: 132.3197 },
        station: 'Miyajima-guchi Station + Ferry',
        rating: 4.9,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'hiroshima-okonomiyaki',
        name: 'Okonomimura (Torre de Okonomiyaki)',
        category: 'food',
        duration: 90,
        cost: 1200,
        description: 'Edificio dedicado al okonomiyaki estilo Hiroshima',
        location: { lat: 34.3925, lng: 132.4587 },
        station: 'Hatchobori Station',
        rating: 4.5,
        timeOfDay: ['lunch', 'dinner'],
        bestSeason: 'all'
      }
    ]
  },

  takayama: {
    city: 'Takayama',
    activities: [
      {
        id: 'takayama-old-town',
        name: 'San-machi (Ciudad Antigua)',
        category: 'culture',
        duration: 180,
        cost: 0,
        description: 'Barrio histórico con casas tradicionales de madera',
        location: { lat: 36.1456, lng: 137.2518 },
        station: 'Takayama Station',
        rating: 4.7,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'takayama-morning-market',
        name: 'Mercado Matutino Miyagawa',
        category: 'shopping',
        duration: 90,
        cost: 1000,
        description: 'Mercado tradicional con artesanías y comida local',
        location: { lat: 36.1463, lng: 137.2513 },
        station: 'Takayama Station',
        rating: 4.6,
        timeOfDay: ['morning'],
        bestSeason: 'all'
      },
      {
        id: 'takayama-hida-beef',
        name: 'Hida Beef',
        category: 'food',
        duration: 60,
        cost: 3000,
        description: 'Carne de Hida famosa, similar al Wagyu de Kobe',
        location: { lat: 36.1462, lng: 137.2521 },
        station: 'Takayama Station',
        rating: 4.8,
        timeOfDay: ['lunch', 'dinner'],
        bestSeason: 'all'
      },
      {
        id: 'takayama-festival-floats',
        name: 'Yatai Kaikan (Museo de Carrozas)',
        category: 'culture',
        duration: 60,
        cost: 1000,
        description: 'Museo con las carrozas del festival de Takayama',
        location: { lat: 36.1472, lng: 137.2535 },
        station: 'Takayama Station',
        rating: 4.5,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      }
    ]
  },

  kanazawa: {
    city: 'Kanazawa',
    activities: [
      {
        id: 'kanazawa-kenrokuen',
        name: 'Jardín Kenrokuen',
        category: 'nature',
        duration: 120,
        cost: 320,
        description: 'Uno de los 3 jardines más hermosos de Japón',
        location: { lat: 36.5616, lng: 136.6623 },
        station: 'Kanazawa Station',
        rating: 4.8,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'kanazawa-castle',
        name: 'Castillo de Kanazawa',
        category: 'culture',
        duration: 90,
        cost: 320,
        description: 'Castillo histórico con arquitectura única',
        location: { lat: 36.5652, lng: 136.6589 },
        station: 'Kanazawa Station',
        rating: 4.5,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'kanazawa-geisha-district',
        name: 'Distrito Higashi Chaya',
        category: 'culture',
        duration: 120,
        cost: 0,
        description: 'Barrio de casas de té tradicionales y geishas',
        location: { lat: 36.5698, lng: 136.6612 },
        station: 'Kanazawa Station',
        rating: 4.7,
        timeOfDay: ['afternoon', 'evening'],
        bestSeason: 'all'
      },
      {
        id: 'kanazawa-gold-leaf',
        name: 'Taller de Hoja de Oro',
        category: 'shopping',
        duration: 60,
        cost: 1000,
        description: 'Kanazawa produce el 99% de la hoja de oro de Japón',
        location: { lat: 36.5694, lng: 136.6616 },
        station: 'Kanazawa Station',
        rating: 4.6,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'kanazawa-omicho-market',
        name: 'Mercado Omicho',
        category: 'food',
        duration: 90,
        cost: 2500,
        description: 'Mercado de mariscos frescos y street food',
        location: { lat: 36.5693, lng: 136.6576 },
        station: 'Kanazawa Station',
        rating: 4.7,
        timeOfDay: ['morning', 'lunch'],
        bestSeason: 'all'
      }
    ]
  },

  nagoya: {
    city: 'Nagoya',
    activities: [
      {
        id: 'nagoya-castle',
        name: 'Castillo de Nagoya',
        category: 'culture',
        duration: 120,
        cost: 500,
        description: 'Castillo histórico con delfines dorados en el techo',
        location: { lat: 35.1854, lng: 136.8991 },
        station: 'Shiyakusho Station',
        rating: 4.5,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'spring'
      },
      {
        id: 'nagoya-atsuta-shrine',
        name: 'Santuario Atsuta',
        category: 'culture',
        duration: 90,
        cost: 0,
        description: 'Santuario sintoísta con la espada sagrada de Japón',
        location: { lat: 35.1277, lng: 136.9086 },
        station: 'Jingu-Mae Station',
        rating: 4.6,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'nagoya-miso-katsu',
        name: 'Miso Katsu',
        category: 'food',
        duration: 60,
        cost: 1000,
        description: 'Especialidad de Nagoya: tonkatsu con salsa miso',
        location: { lat: 35.1709, lng: 136.8816 },
        station: 'Nagoya Station',
        rating: 4.5,
        timeOfDay: ['lunch', 'dinner'],
        bestSeason: 'all'
      },
      {
        id: 'nagoya-osu',
        name: 'Osu Shopping District',
        category: 'shopping',
        duration: 120,
        cost: 3000,
        description: 'Distrito de compras con cultura otaku',
        location: { lat: 35.1598, lng: 136.9023 },
        station: 'Osu Kannon Station',
        rating: 4.4,
        timeOfDay: ['afternoon'],
        bestSeason: 'all'
      }
    ]
  },

  yokohama: {
    city: 'Yokohama',
    activities: [
      {
        id: 'yokohama-chinatown',
        name: 'Yokohama Chinatown',
        category: 'food',
        duration: 180,
        cost: 2500,
        description: 'El barrio chino más grande de Japón',
        location: { lat: 35.4434, lng: 139.6452 },
        station: 'Motomachi-Chukagai Station',
        rating: 4.6,
        timeOfDay: ['lunch', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'yokohama-minato-mirai',
        name: 'Minato Mirai 21',
        category: 'photography',
        duration: 120,
        cost: 0,
        description: 'Distrito moderno con rascacielos y vistas al mar',
        location: { lat: 35.4556, lng: 139.6347 },
        station: 'Minatomirai Station',
        rating: 4.7,
        timeOfDay: ['afternoon', 'evening'],
        bestSeason: 'all'
      },
      {
        id: 'yokohama-ramen-museum',
        name: 'Shin-Yokohama Ramen Museum',
        category: 'food',
        duration: 120,
        cost: 800,
        description: 'Museo con 9 tiendas de ramen de diferentes regiones',
        location: { lat: 35.5085, lng: 139.6175 },
        station: 'Shin-Yokohama Station',
        rating: 4.5,
        timeOfDay: ['lunch', 'dinner'],
        bestSeason: 'all'
      },
      {
        id: 'yokohama-cup-noodle-museum',
        name: 'Cup Noodles Museum',
        category: 'family',
        duration: 120,
        cost: 500,
        description: 'Museo interactivo sobre la historia del ramen instantáneo',
        location: { lat: 35.4556, lng: 139.6349 },
        station: 'Minatomirai Station',
        rating: 4.7,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      }
    ]
  },

  nikko: {
    city: 'Nikko',
    activities: [
      {
        id: 'nikko-toshogu',
        name: 'Santuario Toshogu',
        category: 'culture',
        duration: 180,
        cost: 1300,
        description: 'Santuario lujoso y patrimonio de la humanidad',
        location: { lat: 36.7580, lng: 139.5994 },
        station: 'Nikko Station',
        rating: 4.8,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'nikko-lake-chuzenji',
        name: 'Lago Chuzenji',
        category: 'nature',
        duration: 150,
        cost: 0,
        description: 'Lago de montaña con cascadas espectaculares',
        location: { lat: 36.7388, lng: 139.4837 },
        station: 'Nikko Station + Bus',
        rating: 4.7,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'autumn'
      },
      {
        id: 'nikko-kegon-falls',
        name: 'Cascada Kegon',
        category: 'nature',
        duration: 60,
        cost: 570,
        description: 'Cascada de 97 metros, una de las más hermosas de Japón',
        location: { lat: 36.7385, lng: 139.4956 },
        station: 'Nikko Station + Bus',
        rating: 4.6,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      }
    ]
  },

  sapporo: {
    city: 'Sapporo',
    activities: [
      {
        id: 'sapporo-beer-museum',
        name: 'Museo de la Cerveza Sapporo',
        category: 'food',
        duration: 90,
        cost: 500,
        description: 'Historia de la cerveza con degustación gratuita',
        location: { lat: 43.0784, lng: 141.3639 },
        station: 'Sapporo Station',
        rating: 4.5,
        timeOfDay: ['afternoon'],
        bestSeason: 'all'
      },
      {
        id: 'sapporo-ramen-yokocho',
        name: 'Ramen Yokocho',
        category: 'food',
        duration: 60,
        cost: 1000,
        description: 'Callejón con 17 tiendas de ramen de Sapporo',
        location: { lat: 43.0552, lng: 141.3497 },
        station: 'Susukino Station',
        rating: 4.6,
        timeOfDay: ['lunch', 'dinner'],
        bestSeason: 'all'
      },
      {
        id: 'sapporo-odori-park',
        name: 'Parque Odori',
        category: 'nature',
        duration: 120,
        cost: 0,
        description: 'Parque central donde se celebra el Festival de Nieve',
        location: { lat: 43.0596, lng: 141.3478 },
        station: 'Odori Station',
        rating: 4.5,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'winter'
      },
      {
        id: 'sapporo-clock-tower',
        name: 'Torre del Reloj',
        category: 'photography',
        duration: 30,
        cost: 200,
        description: 'Edificio histórico símbolo de Sapporo',
        location: { lat: 43.0633, lng: 141.3537 },
        station: 'Sapporo Station',
        rating: 4.0,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      }
    ]
  },

  fukuoka: {
    city: 'Fukuoka',
    activities: [
      {
        id: 'fukuoka-yatai',
        name: 'Yatai (Puestos Callejeros)',
        category: 'food',
        duration: 120,
        cost: 2000,
        description: 'Famosos puestos de comida callejera',
        location: { lat: 33.5927, lng: 130.4017 },
        station: 'Nakasu-Kawabata Station',
        rating: 4.7,
        timeOfDay: ['evening'],
        bestSeason: 'all'
      },
      {
        id: 'fukuoka-hakata-ramen',
        name: 'Ichiran Ramen Original',
        category: 'food',
        duration: 60,
        cost: 980,
        description: 'Tonkotsu ramen original de Fukuoka',
        location: { lat: 33.5902, lng: 130.4012 },
        station: 'Tenjin Station',
        rating: 4.6,
        timeOfDay: ['lunch', 'dinner'],
        bestSeason: 'all'
      },
      {
        id: 'fukuoka-canal-city',
        name: 'Canal City Hakata',
        category: 'shopping',
        duration: 180,
        cost: 3000,
        description: 'Centro comercial con canal y espectáculos',
        location: { lat: 33.5899, lng: 130.4069 },
        station: 'Nakasu-Kawabata Station',
        rating: 4.5,
        timeOfDay: ['afternoon', 'evening'],
        bestSeason: 'all'
      },
      {
        id: 'fukuoka-dazaifu',
        name: 'Santuario Dazaifu Tenmangu',
        category: 'culture',
        duration: 150,
        cost: 0,
        description: 'Santuario dedicado al dios del aprendizaje',
        location: { lat: 33.5204, lng: 130.5339 },
        station: 'Dazaifu Station',
        rating: 4.7,
        timeOfDay: ['morning', 'afternoon'],
        bestSeason: 'all'
      }
    ]
  }
};

// Función helper para buscar actividades por ciudad y categoría
export function getActivitiesByCity(cityId) {
  return ACTIVITIES_DATABASE[cityId]?.activities || [];
}

export function getActivitiesByCategory(cityId, categories) {
  const activities = getActivitiesByCity(cityId);
  if (!categories || categories.length === 0) return activities;
  
  return activities.filter(activity => 
    categories.includes(activity.category)
  );
}

export function searchActivities(query) {
  const results = [];
  
  for (const cityId in ACTIVITIES_DATABASE) {
    const cityActivities = ACTIVITIES_DATABASE[cityId].activities.filter(activity =>
      activity.name.toLowerCase().includes(query.toLowerCase()) ||
      activity.description.toLowerCase().includes(query.toLowerCase())
    );
    results.push(...cityActivities);
  }
  
  return results;
}
