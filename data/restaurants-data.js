// data/restaurants-data.js - Base de datos de restaurantes y opciones de comida

export const RESTAURANTS_DATABASE = {
  Tokyo: {
    breakfast: [
      {
        id: 'tokyo-tsukiji-breakfast',
        name: 'Tsukiji Outer Market',
        category: 'food',
        type: 'breakfast',
        icon: '🍱',
        duration: 60,
        cost: 1500,
        description: 'Desayuno fresco con sushi y mariscos del mercado',
        location: { lat: 35.6654, lng: 139.7707 },
        station: 'Tsukijishijo Station',
        timeOfDay: ['morning'],
        rating: 4.7,
        priceLevel: 2
      },
      {
        id: 'tokyo-convenience-breakfast',
        name: '7-Eleven / Lawson (Konbini)',
        category: 'food',
        type: 'breakfast',
        icon: '🏪',
        duration: 20,
        cost: 500,
        description: 'Desayuno rápido: onigiri, sandwich, café',
        timeOfDay: ['morning'],
        rating: 4.0,
        priceLevel: 1,
        quickOption: true
      }
    ],
    lunch: [
      {
        id: 'tokyo-ichiran-ramen',
        name: 'Ichiran Ramen',
        category: 'food',
        type: 'lunch',
        icon: '🍜',
        duration: 45,
        cost: 1200,
        description: 'Ramen tonkotsu famoso con sistema de pedido privado',
        location: { lat: 35.6586, lng: 139.7017 },
        station: 'Shibuya Station',
        timeOfDay: ['afternoon', 'evening'],
        rating: 4.8,
        priceLevel: 2
      },
      {
        id: 'tokyo-conveyor-sushi',
        name: 'Sushi Zanmai / Kura Sushi',
        category: 'food',
        type: 'lunch',
        icon: '🍣',
        duration: 50,
        cost: 2000,
        description: 'Sushi de cinta transportadora, fresco y económico',
        timeOfDay: ['afternoon'],
        rating: 4.5,
        priceLevel: 2
      },
      {
        id: 'tokyo-katsu-curry',
        name: 'CoCo Ichibanya (Curry)',
        category: 'food',
        type: 'lunch',
        icon: '🍛',
        duration: 40,
        cost: 900,
        description: 'Curry japonés personalizable, ideal para presupuesto',
        timeOfDay: ['afternoon', 'evening'],
        rating: 4.3,
        priceLevel: 1
      }
    ],
    dinner: [
      {
        id: 'tokyo-yakiniku',
        name: 'Yakiniku-M (Horumon Yakiniku)',
        category: 'food',
        type: 'dinner',
        icon: '🥩',
        duration: 90,
        cost: 4000,
        description: 'BBQ japonés, asa tu propia carne premium',
        location: { lat: 35.6938, lng: 139.7036 },
        station: 'Shinjuku Station',
        timeOfDay: ['evening'],
        rating: 4.6,
        priceLevel: 3
      },
      {
        id: 'tokyo-izakaya',
        name: 'Torikizoku (Izakaya)',
        category: 'food',
        type: 'dinner',
        icon: '🍢',
        duration: 120,
        cost: 3000,
        description: 'Izakaya estilo pub, yakitori y bebidas',
        timeOfDay: ['evening'],
        rating: 4.4,
        priceLevel: 2
      },
      {
        id: 'tokyo-gyudon',
        name: 'Yoshinoya / Sukiya (Gyudon)',
        category: 'food',
        type: 'dinner',
        icon: '🍚',
        duration: 25,
        cost: 600,
        description: 'Bowl de carne sobre arroz, rápido y barato',
        timeOfDay: ['evening'],
        rating: 4.2,
        priceLevel: 1,
        quickOption: true
      }
    ]
  },

  Kyoto: {
    breakfast: [
      {
        id: 'kyoto-traditional-breakfast',
        name: 'Inoda Coffee (Desayuno tradicional)',
        category: 'food',
        type: 'breakfast',
        icon: '☕',
        duration: 50,
        cost: 1200,
        description: 'Desayuno japonés tradicional con café',
        location: { lat: 35.0037, lng: 135.7681 },
        station: 'Kawaramachi Station',
        timeOfDay: ['morning'],
        rating: 4.5,
        priceLevel: 2
      }
    ],
    lunch: [
      {
        id: 'kyoto-kaiseki-lunch',
        name: 'Obanzai (Comida casera de Kyoto)',
        category: 'food',
        type: 'lunch',
        icon: '🍱',
        duration: 60,
        cost: 1800,
        description: 'Set meal tradicional de Kyoto con pequeños platos',
        timeOfDay: ['afternoon'],
        rating: 4.7,
        priceLevel: 2
      },
      {
        id: 'kyoto-nishiki-market',
        name: 'Nishiki Market (Street Food)',
        category: 'food',
        type: 'lunch',
        icon: '🎪',
        duration: 75,
        cost: 1500,
        description: 'Mercado con comida callejera variada',
        location: { lat: 35.0048, lng: 135.7661 },
        station: 'Karasuma Station',
        timeOfDay: ['afternoon'],
        rating: 4.6,
        priceLevel: 2
      }
    ],
    dinner: [
      {
        id: 'kyoto-kaiseki',
        name: 'Kaiseki Ryori',
        category: 'food',
        type: 'dinner',
        icon: '🍵',
        duration: 120,
        cost: 8000,
        description: 'Cena multi-curso tradicional japonesa (reserva recomendada)',
        timeOfDay: ['evening'],
        rating: 4.9,
        priceLevel: 4
      },
      {
        id: 'kyoto-ramen-alley',
        name: 'Kyoto Ramen Alley',
        category: 'food',
        type: 'dinner',
        icon: '🍜',
        duration: 45,
        cost: 1000,
        description: 'Variedad de ramen shops en un solo lugar',
        location: { lat: 34.9858, lng: 135.7578 },
        station: 'Kyoto Station',
        timeOfDay: ['evening'],
        rating: 4.4,
        priceLevel: 2
      }
    ]
  },

  Osaka: {
    breakfast: [
      {
        id: 'osaka-konbini-breakfast',
        name: 'FamilyMart / Konbini',
        category: 'food',
        type: 'breakfast',
        icon: '🏪',
        duration: 20,
        cost: 500,
        description: 'Desayuno rápido en konbini',
        timeOfDay: ['morning'],
        rating: 4.0,
        priceLevel: 1,
        quickOption: true
      }
    ],
    lunch: [
      {
        id: 'osaka-takoyaki',
        name: 'Takoyaki (Dotonbori)',
        category: 'food',
        type: 'lunch',
        icon: '🐙',
        duration: 30,
        cost: 800,
        description: 'Bolas de pulpo icónicas de Osaka',
        location: { lat: 34.6687, lng: 135.5010 },
        station: 'Namba Station',
        timeOfDay: ['afternoon', 'evening'],
        rating: 4.7,
        priceLevel: 1
      },
      {
        id: 'osaka-okonomiyaki',
        name: 'Okonomiyaki Mizuno',
        category: 'food',
        type: 'lunch',
        icon: '🥞',
        duration: 50,
        cost: 1500,
        description: 'Panqueque salado japonés estilo Osaka',
        location: { lat: 34.6709, lng: 135.5013 },
        station: 'Namba Station',
        timeOfDay: ['afternoon', 'evening'],
        rating: 4.8,
        priceLevel: 2
      }
    ],
    dinner: [
      {
        id: 'osaka-kushikatsu',
        name: 'Kushikatsu Daruma',
        category: 'food',
        type: 'dinner',
        icon: '🍢',
        duration: 75,
        cost: 3000,
        description: 'Brochetas fritas, especialidad de Osaka',
        location: { lat: 34.6524, lng: 135.5064 },
        station: 'Shinsekai',
        timeOfDay: ['evening'],
        rating: 4.6,
        priceLevel: 2
      },
      {
        id: 'osaka-crab-house',
        name: 'Kani Doraku (Cangrejo)',
        category: 'food',
        type: 'dinner',
        icon: '🦀',
        duration: 90,
        cost: 5000,
        description: 'Restaurante famoso de cangrejo gigante mecánico',
        location: { lat: 34.6687, lng: 135.5007 },
        station: 'Namba Station',
        timeOfDay: ['evening'],
        rating: 4.5,
        priceLevel: 3
      }
    ]
  }
};

export default RESTAURANTS_DATABASE;
