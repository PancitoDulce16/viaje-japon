/* ===================================
   DATOS DEL ITINERARIO - 15 DÍAS EN JAPÓN (16 Feb - 2 Mar 2025)
   ===================================
   Presupuesto libre: ~$100 (~7000 JPY para 2 personas, ~700 JPY/día total).
   Hoteles: APA Hotel Shinjuku Gyoemmae (16-19 Feb), Hotel Kyoto Tune Stay (19-21 Feb),
   Toyoko Inn Osaka Namba (21-24 Feb), APA Hotel Yamanote Otsuka Eki Mae (24 Feb - 2 Mar).
   Rutas: Optimizadas con JR Pass (Tokyo-Kyoto: 2h20m, Kyoto-Osaka: 30min, Osaka-Tokyo: 2h40m).
   Comida: Ichiran (ramen), Nemuro Hanamaru (kaiten sushi), Mai:lish (Steins;Gate maid cafe),
   Wanaka (takoyaki), Chibo (okonomiyaki), Naruto Taiyaki, Gekko (mochi), Suzukien (matcha ice cream),
   Gyukaku (yakiniku). Reservas: Kirby/Pokemon/Square Enix cafes (1 mes antes).
*/

export const ITINERARY_DATA = [
  {
    day: 1,
    date: '2025-02-16',
    title: 'Llegada a Tokyo',
    location: 'Shinjuku, Tokyo',
    budget: 700, // JPY total para 2
    hotel: 'APA Hotel Shinjuku Gyoemmae',
    activities: [
      {
        id: '1-0',
        icon: '✈️',
        time: '6:30 AM',
        title: 'Llegada a Narita',
        desc: 'Vuelo AM58 desde Monterrey. Comprar Welcome Suica Card (~2000 JPY para metro).',
        cost: 0,
        station: 'Narita Airport Terminal 1'
      },
      {
        id: '1-1',
        icon: '🚆',
        time: '8:00 AM',
        title: 'Narita Express → Shinjuku',
        desc: 'Tren cubierto por JR Pass. Check-in en hotel (5min caminata desde Shinjuku Station).',
        cost: 0,
        train: {
          from: 'Narita Airport Terminal 1',
          to: 'Shinjuku Station',
          line: 'Narita Express (N\'EX)',
          duration: '90min'
        }
      },
      {
        id: '1-2',
        icon: '🍜',
        time: '1:00 PM',
        title: 'Almuerzo en Ichiran Ramen',
        desc: 'Ramen auténtico (reviews 4.5/5, ~1000 JPY). Cerca del hotel.',
        cost: 2000,
        station: 'Shinjuku Station'
      },
      {
        id: '1-3',
        icon: '🍢',
        time: '6:00 PM',
        title: 'Cena en Omoide Yokocho',
        desc: 'Yakitori en callejón nostálgico (reviews 4.6/5, ~700 JPY). 5min caminata.',
        cost: 1400,
        station: 'Shinjuku West Exit'
      }
    ]
  },
  {
    day: 2,
    date: '2025-02-17',
    title: 'Shibuya y Kamakura',
    location: 'Tokyo/Kamakura',
    budget: 700,
    hotel: 'APA Hotel Shinjuku Gyoemmae',
    activities: [
      {
        id: '2-0',
        icon: '🌆',
        time: '9:00 AM',
        title: 'Shibuya Sky',
        desc: 'Observatorio 360° (reviews 4.5/5, ~2000 JPY, reserva online). Ruta: 10min metro.',
        cost: 4000,
        station: 'Shibuya Station (Hachiko Exit)'
      },
      {
        id: '2-1',
        icon: '🚶',
        time: '11:00 AM',
        title: 'Shibuya Crossing',
        desc: 'Cruce peatonal icónico. Fotos gratis.',
        cost: 0,
        station: 'Shibuya Station'
      },
      {
        id: '2-2',
        icon: '🚆',
        time: '1:00 PM',
        title: 'JR Line → Kamakura',
        desc: 'Day trip a Kamakura (JR Pass). Visitar Gran Buda (~300 JPY).',
        cost: 600,
        train: {
          from: 'Shinjuku Station',
          to: 'Kamakura Station',
          line: 'JR Shonan-Shinjuku Line',
          duration: '57min'
        }
      },
      {
        id: '2-3',
        icon: '🥪',
        time: '4:00 PM',
        title: 'Almuerzo en Age.3 Ginza',
        desc: 'Sándwiches fritos virales (reviews 4.8/5, ~800 JPY). Ruta: volver via Ginza.',
        cost: 1600,
        station: 'Ginza Station'
      }
    ]
  },
  {
    day: 3,
    date: '2025-02-18',
    title: 'Akihabara y Cafés Temáticos',
    location: 'Tokyo',
    budget: 700,
    hotel: 'APA Hotel Shinjuku Gyoemmae',
    activities: [
      {
        id: '3-0',
        icon: '🎮',
        time: '10:00 AM',
        title: 'Akihabara',
        desc: 'Distrito de anime/electrónica. Tiendas gratis (ej. Yodobashi Camera).',
        cost: 0,
        station: 'Akihabara Station (Electric Town Exit)'
      },
      {
        id: '3-1',
        icon: '☕',
        time: '11:30 AM',
        title: 'Cafe Mai:lish (Steins;Gate)',
        desc: 'Maid cafe temático (reviews 4.5/5, ~1500 JPY). 5min caminata.',
        cost: 3000,
        station: 'Akihabara'
      },
      {
        id: '3-2',
        icon: '🎮',
        time: '2:00 PM',
        title: 'Square Enix Cafe',
        desc: 'Café de Final Fantasy (reserva online, reviews 4.6/5, ~1200 JPY).',
        cost: 2400,
        station: 'Shinjuku East Side Square'
      }
    ]
  },
  {
    day: 4,
    date: '2025-02-19',
    title: 'Tokyo a Kyoto',
    location: 'Kyoto',
    budget: 700,
    hotel: 'Hotel Kyoto Tune Stay',
    activities: [
      {
        id: '4-0',
        icon: '🚄',
        time: '9:00 AM',
        title: 'Shinkansen → Kyoto',
        desc: 'Tren bala con JR Pass. Check-in en hotel (5min caminata desde Kyoto Station).',
        cost: 0,
        train: {
          from: 'Tokyo Station',
          to: 'Kyoto Station',
          line: 'Tokaido Shinkansen (Hikari)',
          duration: '2h 20min'
        }
      },
      {
        id: '4-1',
        icon: '⛩️',
        time: '1:00 PM',
        title: 'Fushimi Inari Shrine',
        desc: 'Mil puertas torii (gratis, reviews 4.8/5). Ruta: 5min tren JR desde Kyoto.',
        cost: 0,
        station: 'Inari Station'
      },
      {
        id: '4-2',
        icon: '🍜',
        time: '6:00 PM',
        title: 'Cena en Kyoto Ramen Street',
        desc: 'Ramen variado (reviews 4.5/5, ~1000 JPY). En Kyoto Station.',
        cost: 2000,
        station: 'Kyoto Station (10F)'
      }
    ]
  },
  {
    day: 5,
    date: '2025-02-20',
    title: 'Nara y Arashiyama',
    location: 'Kyoto/Nara',
    budget: 700,
    hotel: 'Hotel Kyoto Tune Stay',
    activities: [
      {
        id: '5-0',
        icon: '🚆',
        time: '8:15 AM',
        title: 'JR Nara Line → Nara',
        desc: 'Day trip con JR Pass. Visitar Nara Park (ciervos, ~150 JPY galletas).',
        cost: 300,
        train: {
          from: 'Kyoto Station',
          to: 'Nara Station',
          line: 'JR Miyakoji Rapid',
          duration: '45min'
        }
      },
      {
        id: '5-1',
        icon: '🏯',
        time: '10:00 AM',
        title: 'Todai-ji Temple',
        desc: 'Gran Buda (reviews 4.7/5, ~600 JPY). Dentro de Nara Park.',
        cost: 1200,
        station: 'Nara Park'
      },
      {
        id: '5-2',
        icon: '🍡',
        time: '1:00 PM',
        title: 'Mochi en Nakatanidou',
        desc: 'Show de mochi golpeado (reviews 4.7/5, ~150 JPY). Cerca de Kintetsu Nara.',
        cost: 300,
        station: 'Kintetsu Nara Station'
      },
      {
        id: '5-3',
        icon: '🎋',
        time: '4:00 PM',
        title: 'Arashiyama Bamboo Grove',
        desc: 'Bosque de bambú (gratis, llegar tarde para menos gente). Ruta: 15min tren JR desde Kyoto.',
        cost: 0,
        station: 'Saga-Arashiyama Station'
      }
    ]
  },
  {
    day: 6,
    date: '2025-02-21',
    title: 'Kyoto a Osaka',
    location: 'Osaka',
    budget: 700,
    hotel: 'Toyoko Inn Osaka Namba',
    activities: [
      {
        id: '6-0',
        icon: '⛩️',
        time: '9:00 AM',
        title: 'Kiyomizu-dera Temple',
        desc: 'Templo con vistas (reviews 4.6/5, ~400 JPY). Ruta: 15min bus desde hotel.',
        cost: 800,
        station: 'Kyoto Station'
      },
      {
        id: '6-1',
        icon: '🚆',
        time: '2:00 PM',
        title: 'Tren → Osaka',
        desc: 'JR Pass, check-in en Toyoko Inn (5min caminata desde Namba Station).',
        cost: 0,
        train: {
          from: 'Kyoto Station',
          to: 'Osaka Station',
          line: 'JR Kyoto Line (Special Rapid)',
          duration: '30min'
        }
      },
      {
        id: '6-2',
        icon: '🌃',
        time: '6:00 PM',
        title: 'Dotonbori',
        desc: 'Paseo nocturno, Glico Running Man (gratis).',
        cost: 0,
        station: 'Namba Station'
      },
      {
        id: '6-3',
        icon: '🐙',
        time: '7:00 PM',
        title: 'Takoyaki en Wanaka',
        desc: 'Mejor takoyaki (reviews 4.5/5, ~600 JPY). Cerca de Dotonbori.',
        cost: 1200,
        station: 'Dotonbori'
      }
    ]
  },
  {
    day: 7,
    date: '2025-02-22',
    title: 'Osaka Aquarium y Food',
    location: 'Osaka',
    budget: 700,
    hotel: 'Toyoko Inn Osaka Namba',
    activities: [
      {
        id: '7-0',
        icon: '🐳',
        time: '9:30 AM',
        title: 'Osaka Aquarium Kaiyukan',
        desc: 'Tiburones ballena (reviews 4.6/5, ~2700 JPY, reserva online). Ruta: 20min metro.',
        cost: 5400,
        station: 'Osakako Station'
      },
      {
        id: '7-1',
        icon: '🥞',
        time: '2:00 PM',
        title: 'Okonomiyaki en Chibo',
        desc: 'Mejor okonomiyaki (reviews 4.5/5, ~1000 JPY). Cerca del acuario.',
        cost: 2000,
        station: 'Namba Station'
      }
    ]
  },
  {
    day: 8,
    date: '2025-02-23',
    title: 'Osaka Food y Regreso a Tokyo',
    location: 'Osaka/Tokyo',
    budget: 700,
    hotel: 'APA Hotel Yamanote Otsuka Eki Mae',
    activities: [
      {
        id: '8-0',
        icon: '🍦',
        time: '10:00 AM',
        title: 'Matcha Ice Cream en Nanaya',
        desc: '7 niveles de intensidad (reviews 4.7/5, ~500 JPY). Ruta: 10min caminata.',
        cost: 1000,
        station: 'Namba Station'
      },
      {
        id: '8-1',
        icon: '🚄',
        time: '1:00 PM',
        title: 'Shinkansen → Tokyo',
        desc: 'JR Pass, check-in en hotel (frente a Otsuka Station).',
        cost: 0,
        train: {
          from: 'Shin-Osaka Station',
          to: 'Tokyo Station',
          line: 'Tokaido Shinkansen (Hikari)',
          duration: '2h 40min'
        }
      },
      {
        id: '8-2',
        icon: '🌆',
        time: '5:00 PM',
        title: 'Sunshine City Observatory',
        desc: 'Vistas desde Ikebukuro (reviews 4.3/5, ~700 JPY). Ruta: 2min tren desde Otsuka.',
        cost: 1400,
        station: 'Ikebukuro Station'
      }
    ]
  },
  {
    day: 9,
    date: '2025-02-24',
    title: 'Cafés Temáticos en Tokyo',
    location: 'Tokyo',
    budget: 700,
    hotel: 'APA Hotel Yamanote Otsuka Eki Mae',
    activities: [
      {
        id: '9-0',
        icon: '🎮',
        time: '11:00 AM',
        title: 'Pokemon Cafe',
        desc: 'Café temático (reserva 31 días antes, reviews 4.8/5, ~2000 JPY). Ruta: 20min metro.',
        cost: 4000,
        station: 'Nihonbashi Station'
      },
      {
        id: '9-1',
        icon: '🎮',
        time: '2:00 PM',
        title: 'Kirby Cafe',
        desc: 'Café adorable (reserva 1 mes antes, reviews 4.7/5, ~1500 JPY). Cerca de Tokyo Station.',
        cost: 3000,
        station: 'Tokyo Station'
      }
    ]
  },
  {
    day: 10,
    date: '2025-02-25',
    title: 'Tokyo Skytree y Asakusa',
    location: 'Tokyo',
    budget: 700,
    hotel: 'APA Hotel Yamanote Otsuka Eki Mae',
    activities: [
      {
        id: '10-0',
        icon: '🏯',
        time: '10:00 AM',
        title: 'Tokyo Skytree',
        desc: 'Torre más alta (reviews 4.5/5, ~2100 JPY, reserva online). Ruta: 25min metro.',
        cost: 4200,
        station: 'Tokyo Skytree Station'
      },
      {
        id: '10-1',
        icon: '🍦',
        time: '2:00 PM',
        title: 'Matcha Ice Cream en Suzukien',
        desc: 'Mejor matcha gelato (reviews 4.6/5, ~600 JPY). Cerca de Skytree.',
        cost: 1200,
        station: 'Asakusa Station'
      },
      {
        id: '10-2',
        icon: '⛩️',
        time: '3:30 PM',
        title: 'Sensoji Temple',
        desc: 'Templo más antiguo y Nakamise Street (gratis).',
        cost: 0,
        station: 'Asakusa Station'
      }
    ]
  },
  {
    day: 11,
    date: '2025-02-26',
    title: 'Harajuku y Shinjuku',
    location: 'Tokyo',
    budget: 700,
    hotel: 'APA Hotel Yamanote Otsuka Eki Mae',
    activities: [
      {
        id: '11-0',
        icon: '👗',
        time: '10:00 AM',
        title: 'Harajuku Takeshita Street',
        desc: 'Moda kawaii y tiendas (gratis). Ruta: 10min metro desde Otsuka.',
        cost: 0,
        station: 'Harajuku Station'
      },
      {
        id: '11-1',
        icon: '⛩️',
        time: '11:30 AM',
        title: 'Meiji Shrine',
        desc: 'Santuario en el bosque (gratis). 5min caminata desde Harajuku.',
        cost: 0,
        station: 'Harajuku Station'
      },
      {
        id: '11-2',
        icon: '🐟',
        time: '1:00 PM',
        title: 'Taiyaki en Naniwaya Sohonten',
        desc: 'Taiyaki tradicional (reviews 4.5/5, ~200 JPY). Ruta: 15min metro.',
        cost: 400,
        station: 'Azabu-juban Station'
      },
      {
        id: '11-3',
        icon: '🌸',
        time: '3:00 PM',
        title: 'Shinjuku Gyoen National Garden',
        desc: 'Jardín con flores tempranas (reviews 4.7/5, ~500 JPY).',
        cost: 1000,
        station: 'Shinjuku-Gyoemmae Station'
      }
    ]
  },
  {
    day: 12,
    date: '2025-02-27',
    title: 'Tokyo Station y Yakiniku',
    location: 'Tokyo',
    budget: 700,
    hotel: 'APA Hotel Yamanote Otsuka Eki Mae',
    activities: [
      {
        id: '12-0',
        icon: '🏮',
        time: '10:00 AM',
        title: 'Tokyo Station Character Street',
        desc: 'Tiendas de Pokemon, Kirby, Ghibli (gratis). Ruta: 10min metro.',
        cost: 0,
        station: 'Tokyo Station (B1F First Avenue)'
      },
      {
        id: '12-1',
        icon: '🍣',
        time: '12:00 PM',
        title: 'Kaiten Sushi en Nemuro Hanamaru',
        desc: 'Mejor conveyor belt sushi (reviews 4.5/5, ~1500 JPY). En Tokyo Station.',
        cost: 3000,
        station: 'Tokyo Station'
      },
      {
        id: '12-2',
        icon: '🍖',
        time: '6:00 PM',
        title: 'Yakiniku en Gyukaku',
        desc: 'BBQ asequible (reviews 4.4/5, ~1500 JPY). Cerca de Otsuka.',
        cost: 3000,
        station: 'Otsuka Station'
      }
    ]
  },
  {
    day: 13,
    date: '2025-02-28',
    title: 'Observatorios y Mochi',
    location: 'Tokyo',
    budget: 700,
    hotel: 'APA Hotel Yamanote Otsuka Eki Mae',
    activities: [
      {
        id: '13-0',
        icon: '🌆',
        time: '10:00 AM',
        title: 'Tokyo Metropolitan Govt Building',
        desc: 'Vistas panorámicas gratis (reviews 4.4/5). Ruta: 15min metro.',
        cost: 0,
        station: 'Tochomae Station'
      },
      {
        id: '13-1',
        icon: '🍡',
        time: '2:00 PM',
        title: 'Mochi en Gekko',
        desc: 'Mejor mochi shop (reviews 4.7/5, ~500 JPY). Ruta: 20min metro a Ueno.',
        cost: 1000,
        station: 'Ueno Station'
      },
      {
        id: '13-2',
        icon: '🍜',
        time: '6:00 PM',
        title: 'Cena en Ichiran Ramen',
        desc: 'Último ramen del viaje (reviews 4.5/5, ~1000 JPY).',
        cost: 2000,
        station: 'Shinjuku Station'
      }
    ]
  },
  {
    day: 14,
    date: '2025-03-01',
    title: 'Compras y Preparación',
    location: 'Tokyo',
    budget: 700,
    hotel: 'APA Hotel Yamanote Otsuka Eki Mae',
    activities: [
      {
        id: '14-0',
        icon: '🛍️',
        time: '10:00 AM',
        title: 'Compras de Souvenirs',
        desc: 'Últimas compras en Akihabara o Shibuya (ej. Don Quijote, ~1000 JPY).',
        cost: 2000,
        station: 'Akihabara Station'
      },
      {
        id: '14-1',
        icon: '📦',
        time: '2:00 PM',
        title: 'Empacar y Relajarse',
        desc: 'Organizar maletas en el hotel.',
        cost: 0,
        station: 'Otsuka Station'
      },
      {
        id: '14-2',
        icon: '🍢',
        time: '6:00 PM',
        title: 'Cena en Omoide Yokocho',
        desc: 'Última visita al callejón (reviews 4.6/5, ~1500 JPY).',
        cost: 3000,
        station: 'Shinjuku Station'
      }
    ]
  },
  {
    day: 15,
    date: '2025-03-02',
    title: 'Regreso a Casa',
    location: 'Tokyo/Narita',
    budget: 700,
    hotel: 'APA Hotel Yamanote Otsuka Eki Mae',
    activities: [
      {
        id: '15-0',
        icon: '⏰',
        time: '4:30 AM',
        title: 'Wake Up',
        desc: 'Verificar equipaje y pasaportes.',
        cost: 0,
        station: 'Otsuka Station'
      },
      {
        id: '15-1',
        icon: '🚆',
        time: '5:30 AM',
        title: 'Narita Express → Narita',
        desc: 'Tren con JR Pass (~90min total).',
        cost: 0,
        train: {
          from: 'Otsuka Station',
          to: 'Narita Airport Terminal 1',
          line: 'JR Yamanote Line + Narita Express',
          duration: '90min'
        }
      },
      {
        id: '15-2',
        icon: '✈️',
        time: '9:30 AM',
        title: 'Vuelo AM58 a Monterrey',
        desc: '¡Sayonara Japón! 🇯🇵',
        cost: 0,
        station: 'Narita Airport'
      }
    ]
  }
];
