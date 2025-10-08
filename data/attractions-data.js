// data/attractions-data.js - Base de datos de atracciones

export const ATTRACTIONS_DATA = {
  maidCafes: {
    category: "Maid & Themed Cafes",
    icon: "☕",
    color: "pink",
    items: [
      {
        name: "@home cafe",
        city: "Tokyo - Akihabara",
        price: 1500,
        currency: "JPY",
        reservationUrl: "https://www.cafe-athome.com/",
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.5,
        description: "El maid cafe más famoso de Akihabara. Shows en vivo, juegos, y la experiencia completa.",
        tips: "No necesita reserva. Mejor ir entre semana para evitar filas."
      },
      {
        name: "Maidreamin",
        city: "Tokyo - Akihabara",
        price: 1800,
        currency: "JPY",
        reservationUrl: "https://maidreamin.com/",
        reserveDays: 0,
        duration: "60 min",
        rating: 4.3,
        description: "Cadena popular con múltiples ubicaciones. Menú kawaii y performances.",
        tips: "Tienen ubicaciones en Shibuya y Harajuku también."
      },
      {
        name: "Mai:lish (Steins;Gate)",
        city: "Tokyo - Akihabara",
        price: 1500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.6,
        description: "Maid cafe temático de Steins;Gate. Para fans del anime.",
        tips: "Pequeño y acogedor. Puede tener fila en fines de semana."
      }
    ]
  },

  animalCafes: {
    category: "Animal Cafes",
    icon: "🐱",
    color: "orange",
    items: [
      {
        name: "Hedgehog Cafe HARRY",
        city: "Tokyo - Roppongi",
        price: 1500,
        currency: "JPY",
        reservationUrl: "https://www.harinezumi-cafe.com/",
        reserveDays: 7,
        duration: "30 min",
        rating: 4.8,
        description: "¡Interactúa con erizos adorables! Uno de los más populares.",
        tips: "RESERVA CON ANTICIPACIÓN. Se llena rápido."
      },
      {
        name: "Owl Cafe Akiba Fukurou",
        city: "Tokyo - Akihabara",
        price: 2000,
        currency: "JPY",
        reservationUrl: "https://akiba2960.com/",
        reserveDays: 14,
        duration: "60 min",
        rating: 4.7,
        description: "Café con búhos. Experiencia única y relajante.",
        tips: "Solo efectivo. Reserva 2 semanas antes."
      },
      {
        name: "Cat Cafe Mocha",
        city: "Tokyo - Multiple locations",
        price: 1200,
        currency: "JPY",
        reservationUrl: "https://catmocha.jp/",
        reserveDays: 0,
        duration: "Ilimitado",
        rating: 4.4,
        description: "Cadena de cat cafes. Ambiente limpio y muchos gatos.",
        tips: "Precio por hora. Ubicaciones en Shibuya, Harajuku, Akihabara."
      },
      {
        name: "Rabbit Cafe Mimi",
        city: "Tokyo - Harajuku",
        price: 1800,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.6,
        description: "Café con conejos. Puedes cargarlos y alimentarlos.",
        tips: "Sin reserva necesaria. Mejor ir temprano."
      }
    ]
  },

  themeParksMajor: {
    category: "Theme Parks (Major)",
    icon: "🎢",
    color: "purple",
    items: [
      {
        name: "Tokyo Disneyland",
        city: "Tokyo - Urayasu",
        price: 8900,
        currency: "JPY",
        reservationUrl: "https://www.tokyodisneyresort.jp/en/",
        reserveDays: 60,
        duration: "Todo el día",
        rating: 4.9,
        description: "El parque Disney más visitado del mundo. Único con área de Frozen.",
        tips: "Compra tickets online 2 meses antes. Usa app para FastPass."
      },
      {
        name: "Tokyo DisneySea",
        city: "Tokyo - Urayasu",
        price: 8900,
        currency: "JPY",
        reservationUrl: "https://www.tokyodisneyresort.jp/en/",
        reserveDays: 60,
        duration: "Todo el día",
        rating: 5.0,
        description: "¡ÚNICO EN EL MUNDO! Parque temático del mar. Imperdible.",
        tips: "Mejor que Disneyland según muchos. Reserva con mucha anticipación."
      },
      {
        name: "Universal Studios Japan",
        city: "Osaka",
        price: 8600,
        currency: "JPY",
        reservationUrl: "https://www.usj.co.jp/web/en/us",
        reserveDays: 30,
        duration: "Todo el día",
        rating: 4.8,
        description: "Super Nintendo World, Harry Potter, y más. Increíble.",
        tips: "Compra Express Pass para evitar filas. Super Nintendo World requiere entrada programada."
      }
    ]
  },

  aquariums: {
    category: "Aquariums",
    icon: "🐋",
    color: "blue",
    items: [
      {
        name: "Osaka Aquarium Kaiyukan",
        city: "Osaka",
        price: 2700,
        currency: "JPY",
        reservationUrl: "https://www.kaiyukan.com/language/english/",
        reserveDays: 7,
        duration: "2-3 horas",
        rating: 4.6,
        description: "Uno de los mejores del mundo. Tiburones ballena gigantes.",
        tips: "Compra tickets online con descuento. Ir temprano para ver alimentación."
      },
      {
        name: "Sumida Aquarium",
        city: "Tokyo - Skytree",
        price: 2300,
        currency: "JPY",
        reservationUrl: "https://www.sumida-aquarium.com/en/",
        reserveDays: 0,
        duration: "1-2 horas",
        rating: 4.3,
        description: "Dentro de Tokyo Skytree. Medusas hermosas y pingüinos.",
        tips: "Combo con Skytree. Iluminación nocturna espectacular."
      },
      {
        name: "Kyoto Aquarium",
        city: "Kyoto",
        price: 2400,
        currency: "JPY",
        reservationUrl: "https://www.kyoto-aquarium.com/en/",
        reserveDays: 0,
        duration: "1.5-2 horas",
        rating: 4.2,
        description: "Moderno acuario cerca de Kyoto Station. Delfines y focas.",
        tips: "Shows de delfines 3 veces al día."
      }
    ]
  },

  museums: {
    category: "Museums",
    icon: "🎨",
    color: "green",
    items: [
      {
        name: "teamLab Borderless",
        city: "Tokyo - Odaiba",
        price: 3800,
        currency: "JPY",
        reservationUrl: "https://www.teamlab.art/e/borderless/",
        reserveDays: 30,
        duration: "2-3 horas",
        rating: 5.0,
        description: "IMPERDIBLE. Museo de arte digital interactivo. Alucinante.",
        tips: "VENDE OUT RÁPIDO. Reserva 1 mes antes. Mejor de noche."
      },
      {
        name: "teamLab Planets",
        city: "Tokyo - Toyosu",
        price: 3200,
        currency: "JPY",
        reservationUrl: "https://planets.teamlab.art/tokyo/",
        reserveDays: 21,
        duration: "1.5-2 horas",
        rating: 4.9,
        description: "Caminas descalzo por agua. Experiencia inmersiva única.",
        tips: "Lleva shorts. Te mojarás los pies."
      },
      {
        name: "Ghibli Museum",
        city: "Tokyo - Mitaka",
        price: 1000,
        currency: "JPY",
        reservationUrl: "https://www.ghibli-museum.jp/en/",
        reserveDays: 90,
        duration: "2 horas",
        rating: 4.9,
        description: "Museo de Studio Ghibli. Totoro, Spirited Away, etc.",
        tips: "SÚPER DIFÍCIL conseguir tickets. Reserva 3 meses antes a las 10 AM JST del día 10."
      },
      {
        name: "Tokyo National Museum",
        city: "Tokyo - Ueno",
        price: 1000,
        currency: "JPY",
        reservationUrl: "https://www.tnm.jp/",
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.5,
        description: "Museo más antiguo de Japón. Arte y artefactos históricos.",
        tips: "Gratis el primer domingo del mes."
      },
      {
        name: "Cup Noodles Museum",
        city: "Osaka / Yokohama",
        price: 500,
        currency: "JPY",
        reservationUrl: "https://www.cupnoodles-museum.jp/en/",
        reserveDays: 0,
        duration: "1.5-2 horas",
        rating: 4.4,
        description: "Museo interactivo del ramen instantáneo. ¡Crea tu propio cup noodle!",
        tips: "Súper barato y divertido. Ubicaciones en Yokohama y Osaka."
      }
    ]
  },

  gardensAndCastles: {
    category: "Gardens & Castles",
    icon: "🏯",
    color: "emerald",
    items: [
      {
        name: "Shinjuku Gyoen National Garden",
        city: "Tokyo - Shinjuku",
        price: 500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "1-2 horas",
        rating: 4.7,
        description: "Jardín enorme con jardín japonés, francés e inglés. Perfecto para picnic.",
        tips: "Sakura en primavera. En febrero hay ciruelos floreciendo."
      },
      {
        name: "Osaka Castle",
        city: "Osaka",
        price: 600,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "1-2 horas",
        rating: 4.5,
        description: "Castillo icónico con museo interior y vistas panorámicas.",
        tips: "Sube al piso 8 para la vista. Parque alrededor gratis."
      },
      {
        name: "Himeji Castle",
        city: "Himeji (1h desde Osaka)",
        price: 1000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.9,
        description: "EL castillo más bonito de Japón. UNESCO. Totalmente original.",
        tips: "Combina con Kobe. Vale la pena el viaje."
      },
      {
        name: "Kenrokuen Garden",
        city: "Kanazawa",
        price: 320,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "1-2 horas",
        rating: 4.8,
        description: "Uno de los 3 jardines más bellos de Japón.",
        tips: "En invierno tienen yukitsuri (cuerdas protectoras de nieve)."
      }
    ]
  },

  temples: {
    category: "Major Temples & Shrines",
    icon: "⛩️",
    color: "red",
    items: [
      {
        name: "Fushimi Inari Shrine",
        city: "Kyoto",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 5.0,
        description: "10,000 puertas torii naranjas. IMPERDIBLE. 24/7 abierto.",
        tips: "Ir muy temprano (6-7 AM) o de noche para evitar turistas. Gratis."
      },
      {
        name: "Senso-ji Temple",
        city: "Tokyo - Asakusa",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "1-2 horas",
        rating: 4.7,
        description: "Templo más antiguo de Tokyo. Nakamise Shopping Street.",
        tips: "Mejor temprano en la mañana. Gratis."
      },
      {
        name: "Meiji Shrine",
        city: "Tokyo - Harajuku",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "1 hora",
        rating: 4.6,
        description: "Santuario shintoísta en bosque. Oasis de paz en Tokyo.",
        tips: "Si tienes suerte verás una boda tradicional. Gratis."
      },
      {
        name: "Kiyomizu-dera Temple",
        city: "Kyoto",
        price: 400,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "1-2 horas",
        rating: 4.8,
        description: "Templo en la montaña con plataforma de madera icónica. UNESCO.",
        tips: "Mejor al atardecer. Sannenzaka street es hermosa."
      },
      {
        name: "Todai-ji Temple",
        city: "Nara",
        price: 600,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "1 hora",
        rating: 4.9,
        description: "Gran Buda de 15 metros. ¡ENORME! UNESCO.",
        tips: "Combina con alimentar venados en Nara Park."
      },
      {
        name: "Kinkaku-ji (Golden Pavilion)",
        city: "Kyoto",
        price: 500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.7,
        description: "Templo dorado reflejándose en el lago. Postal de Kyoto.",
        tips: "Mejor con cielo azul. No se puede entrar, solo ver desde afuera."
      }
    ]
  },

  characterCafes: {
    category: "Character & Anime Cafes",
    icon: "🎮",
    color: "indigo",
    items: [
      {
        name: "Pokemon Cafe",
        city: "Tokyo - Nihonbashi",
        price: 2000,
        currency: "JPY",
        reservationUrl: "https://www.pokemoncenter-online.com/cafe/",
        reserveDays: 31,
        duration: "90 min",
        rating: 4.9,
        description: "Café oficial de Pokemon. ¡SÚPER DIFÍCIL conseguir reserva!",
        tips: "Reservas abren 31 días antes a las 6 PM JST. Se agotan en MINUTOS. Estar listo."
      },
      {
        name: "Kirby Cafe",
        city: "Tokyo - Tokyo Station",
        price: 1500,
        currency: "JPY",
        reservationUrl: "https://kirbycafe.jp/",
        reserveDays: 30,
        duration: "70 min",
        rating: 4.8,
        description: "Café adorable de Kirby. Comida kawaii nivel 1000.",
        tips: "Reservas el día 10 de cada mes para el mes siguiente. También se agotan en segundos."
      },
      {
        name: "Square Enix Cafe (Artnia)",
        city: "Tokyo - Shinjuku",
        price: 1200,
        currency: "JPY",
        reservationUrl: "https://www.jp.square-enix.com/artnia/",
        reserveDays: 7,
        duration: "90 min",
        rating: 4.6,
        description: "Final Fantasy, Kingdom Hearts, Dragon Quest. Para gamers.",
        tips: "Más fácil de reservar que Pokemon/Kirby. Tienda al lado."
      },
      {
        name: "Gundam Cafe",
        city: "Tokyo - Akihabara",
        price: 1000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.3,
        description: "Café de Gundam con bebidas temáticas.",
        tips: "Sin reserva. Ubicación frente a la estatua de Gundam."
      }
    ]
  }
};
