// data/itinerary-templates.js - Plantillas de Itinerarios Completos

/**
 * PLANTILLAS DE ITINERARIOS COMPLETOS
 * ====================================
 *
 * Itinerarios pre-diseñados y optimizados para diferentes tipos de viajes a Japón.
 * Los usuarios pueden cargar estas plantillas y personalizarlas según sus necesidades.
 */

export const ITINERARY_TEMPLATES = [
  {
    id: 'japan-15-days-complete',
    name: '🇯🇵 Japón 15 Días - Experiencia Completa',
    description: 'Itinerario optimizado para 15 días visitando Tokyo, Kyoto, Osaka y Nara. Incluye cultura, shopping, naturaleza y experiencias únicas.',
    duration: 15,
    cities: ['Tokyo', 'Kyoto', 'Osaka', 'Nara', 'Kamakura', 'Hakone'],
    categories: ['culture', 'shopping', 'nature', 'food', 'anime'],
    budget: {
      total: 490000, // JPY
      accommodation: 162000,
      transport: 56000,
      food: 104000,
      activities: 32000,
      shopping: 120000,
      other: 16000
    },
    hotels: [
      {
        name: 'APA Hotel Shinjuku Gyoenmae',
        city: 'Tokyo',
        checkIn: '2025-02-16',
        checkOut: '2025-02-19',
        nights: 3
      },
      {
        name: 'Kyoto Tune Stay',
        city: 'Kyoto',
        checkIn: '2025-02-19',
        checkOut: '2025-02-21',
        nights: 2
      },
      {
        name: 'Toyoko Inn Osaka Namba',
        city: 'Osaka',
        checkIn: '2025-02-21',
        checkOut: '2025-02-24',
        nights: 3
      },
      {
        name: 'APA Hotel Otsuka Ekimae',
        city: 'Tokyo',
        checkIn: '2025-02-24',
        checkOut: '2025-03-02',
        nights: 6
      }
    ],
    highlights: [
      '🗻 Hakone - Mt. Fuji + Valle volcánico + Lake Ashi',
      '🐋 Acuario de Osaka (Kaiyukan) - Tiburón ballena',
      '🤖 EVA-01 en Toei Kyoto Studio Park',
      '📚 Museo del Manga de Kyoto - 50,000 mangas',
      '🎋 Arashiyama - Bosque de bambú + monos',
      '🥢 Nakatanidou en Nara - Mochi pounding show',
      '🧸 Anakuma Café en Harajuku',
      '🛍️ 3 días de shopping en Tokyo'
    ],
    days: [
      // DÍA 1
      {
        day: 1,
        date: '2025-02-16',
        city: 'Tokyo',
        title: 'Llegada + Shibuya/Shinjuku',
        theme: 'Llegada y primera impresión de Tokyo',
        activities: [
          {
            time: '14:00',
            title: 'Aterrizaje en Aeropuerto Narita/Haneda',
            category: 'transport',
            duration: 60,
            notes: 'Comprar Suica/Pasmo Card (¥2,000 + ¥500 depósito)'
          },
          {
            time: '16:00',
            title: 'Traslado a APA Hotel Shinjuku Gyoenmae',
            category: 'transport',
            duration: 90,
            notes: 'Narita Express o Keisei Skyliner'
          },
          {
            time: '17:30',
            title: 'Shibuya Crossing',
            category: 'sightseeing',
            duration: 30,
            location: 'Shibuya',
            notes: 'El cruce más famoso del mundo. Foto con Hachiko'
          },
          {
            time: '18:30',
            title: 'Shibuya Center Gai',
            category: 'shopping',
            duration: 60,
            location: 'Shibuya'
          },
          {
            time: '19:30',
            title: 'Cena: Ichiran Ramen',
            category: 'food',
            duration: 60,
            location: 'Shibuya',
            cost: 1000
          },
          {
            time: '21:00',
            title: 'Shinjuku de noche',
            category: 'nightlife',
            duration: 120,
            location: 'Shinjuku',
            notes: 'Golden Gai, Kabukicho, Omoide Yokocho'
          }
        ]
      },

      // DÍA 2
      {
        day: 2,
        date: '2025-02-17',
        city: 'Tokyo',
        title: 'Tokyo Imperial + Asakusa',
        theme: 'Tokyo Tradicional',
        activities: [
          {
            time: '09:00',
            title: 'Palacio Imperial - East Gardens',
            category: 'culture',
            duration: 90,
            location: 'Tokyo Station',
            cost: 0,
            notes: 'GRATIS'
          },
          {
            time: '11:00',
            title: 'Tokyo Station Character Street',
            category: 'shopping',
            duration: 30,
            location: 'Tokyo Station'
          },
          {
            time: '13:00',
            title: 'Sensoji Temple',
            category: 'culture',
            duration: 90,
            location: 'Asakusa',
            cost: 0,
            notes: 'El templo más antiguo de Tokyo. Nakamise Shopping Street'
          },
          {
            time: '15:00',
            title: 'Vista del Tokyo Skytree',
            category: 'sightseeing',
            duration: 30,
            location: 'Asakusa',
            notes: 'Foto desde lejos'
          },
          {
            time: '15:30',
            title: 'Merienda: Melon pan y dango',
            category: 'food',
            duration: 30,
            location: 'Nakamise'
          },
          {
            time: '19:00',
            title: 'Cena: Tempura',
            category: 'food',
            duration: 90,
            location: 'Asakusa'
          },
          {
            time: '21:00',
            title: 'Paseo nocturno por Sumida River',
            category: 'sightseeing',
            duration: 60,
            location: 'Asakusa'
          }
        ]
      },

      // DÍA 3
      {
        day: 3,
        date: '2025-02-18',
        city: 'Tokyo',
        title: 'Akihabara + Harajuku',
        theme: 'Cultura Pop y Moda',
        activities: [
          {
            time: '10:00',
            title: 'Akihabara Electric Town',
            category: 'shopping',
            duration: 240,
            location: 'Akihabara',
            notes: 'Yodobashi Camera, Mandarake, Super Potato, Arcades'
          },
          {
            time: '12:00',
            title: 'Maid Café',
            category: 'entertainment',
            duration: 60,
            location: 'Akihabara',
            cost: 1500
          },
          {
            time: '14:00',
            title: 'Almuerzo: Curry japonés CoCo Ichibanya',
            category: 'food',
            duration: 45,
            location: 'Akihabara'
          },
          {
            time: '15:30',
            title: 'Meiji Shrine',
            category: 'culture',
            duration: 60,
            location: 'Harajuku',
            cost: 0,
            notes: 'Santuario en el bosque - GRATIS'
          },
          {
            time: '16:45',
            title: 'Takeshita Street',
            category: 'shopping',
            duration: 90,
            location: 'Harajuku',
            notes: 'Moda kawaii y crepes'
          },
          {
            time: '18:15',
            title: 'Anakuma Café ⭐',
            category: 'food',
            duration: 45,
            location: 'Harajuku',
            cost: 1500,
            highlight: true,
            notes: 'Café temático kawaii con osos - ¡Experiencia única!'
          },
          {
            time: '19:30',
            title: 'Omotesando',
            category: 'shopping',
            duration: 60,
            location: 'Harajuku',
            notes: 'Avenue de marcas de lujo. Tokyu Plaza rooftop'
          },
          {
            time: '20:30',
            title: 'Cena: Sushi',
            category: 'food',
            duration: 90,
            location: 'Shibuya',
            cost: 2500
          }
        ]
      },

      // DÍA 4
      {
        day: 4,
        date: '2025-02-19',
        city: 'Tokyo → Kyoto',
        title: 'Última mañana en Tokyo + Traslado a Kyoto',
        theme: 'Compras finales y viaje a Kyoto',
        activities: [
          {
            time: '09:00',
            title: 'Shopping en Shinjuku',
            category: 'shopping',
            duration: 180,
            location: 'Shinjuku',
            notes: 'Don Quijote, Yodobashi Camera'
          },
          {
            time: '12:00',
            title: 'Check-out APA Hotel Shinjuku',
            category: 'hotel',
            duration: 30
          },
          {
            time: '14:00',
            title: 'Shinkansen Tokyo → Kyoto',
            category: 'transport',
            duration: 135,
            cost: 13320,
            notes: 'Reservar asiento ventana lado derecho para ver Mt. Fuji'
          },
          {
            time: '16:30',
            title: 'Check-in Kyoto Tune Stay',
            category: 'hotel',
            duration: 30,
            location: 'Kyoto'
          },
          {
            time: '19:00',
            title: 'Cena: Ramen Koji',
            category: 'food',
            duration: 60,
            location: 'Kyoto Station'
          },
          {
            time: '20:30',
            title: 'Paseo nocturno por Gion',
            category: 'sightseeing',
            duration: 60,
            location: 'Kyoto',
            notes: 'Barrio de geishas'
          }
        ]
      },

      // DÍA 5
      {
        day: 5,
        date: '2025-02-20',
        city: 'Kyoto',
        title: 'Arashiyama & Toei Studio Park',
        theme: 'Bosque de Bambú, Monos y EVANGELION',
        activities: [
          {
            time: '08:00',
            title: 'Bosque de Bambú de Arashiyama ⭐',
            category: 'nature',
            duration: 60,
            location: 'Arashiyama',
            cost: 0,
            highlight: true,
            notes: 'Llegar temprano para evitar multitudes - GRATIS'
          },
          {
            time: '09:30',
            title: 'Puente Togetsukyo',
            category: 'sightseeing',
            duration: 30,
            location: 'Arashiyama'
          },
          {
            time: '10:00',
            title: 'Monkey Park Iwatayama',
            category: 'nature',
            duration: 90,
            location: 'Arashiyama',
            cost: 550,
            notes: 'Monos con vista de Kyoto'
          },
          {
            time: '12:00',
            title: 'Almuerzo: Yudofu (tofu hervido)',
            category: 'food',
            duration: 60,
            location: 'Arashiyama'
          },
          {
            time: '14:00',
            title: 'Toei Kyoto Studio Park - EVA-01 ⭐',
            category: 'entertainment',
            duration: 180,
            location: 'Uzumasa',
            cost: 2400,
            highlight: true,
            notes: '¡Foto con EVA-01 a tamaño real! Shows de ninjas'
          },
          {
            time: '19:00',
            title: 'Cena: Pontocho Alley',
            category: 'food',
            duration: 120,
            location: 'Kyoto',
            notes: 'Kaiseki o Okonomiyaki'
          }
        ]
      },

      // DÍA 6
      {
        day: 6,
        date: '2025-02-21',
        city: 'Kyoto',
        title: 'Templos & Museo del Manga',
        theme: 'Templo Dorado, Cultura y Manga',
        activities: [
          {
            time: '09:00',
            title: 'Kinkaku-ji (Pabellón Dorado)',
            category: 'culture',
            duration: 60,
            location: 'Kyoto',
            cost: 500,
            notes: 'Templo cubierto de oro'
          },
          {
            time: '10:30',
            title: 'Ryoan-ji - Jardín de rocas zen',
            category: 'culture',
            duration: 30,
            location: 'Kyoto',
            cost: 500,
            notes: 'A 10 min a pie de Kinkaku-ji'
          },
          {
            time: '13:00',
            title: 'Almuerzo: Obanzai (comida casera Kyoto)',
            category: 'food',
            duration: 60,
            location: 'Kyoto'
          },
          {
            time: '14:00',
            title: 'Kyoto International Manga Museum ⭐',
            category: 'culture',
            duration: 150,
            location: 'Karasuma-Oike',
            cost: 900,
            highlight: true,
            notes: '¡50,000+ mangas para leer! Puedes sentarte en el jardín'
          },
          {
            time: '17:30',
            title: 'Gion District',
            category: 'culture',
            duration: 120,
            location: 'Kyoto',
            notes: 'Hanami-koji Street, Yasaka Shrine. Si hay suerte, ver geisha'
          },
          {
            time: '19:30',
            title: 'Matcha y wagashi',
            category: 'food',
            duration: 30,
            location: 'Gion',
            cost: 800
          }
        ]
      },

      // DÍA 7
      {
        day: 7,
        date: '2025-02-21',
        city: 'Kyoto → Osaka',
        title: 'Fushimi Inari + Traslado a Osaka',
        theme: 'Torii Rojos & Traslado',
        activities: [
          {
            time: '08:00',
            title: 'Fushimi Inari Taisha',
            category: 'culture',
            duration: 180,
            location: 'Fushimi',
            cost: 0,
            notes: 'Miles de torii rojos. Subir hasta el mirador - GRATIS'
          },
          {
            time: '11:00',
            title: 'Snack: Inari sushi',
            category: 'food',
            duration: 15,
            location: 'Fushimi'
          },
          {
            time: '11:30',
            title: 'Nijo Castle',
            category: 'culture',
            duration: 90,
            location: 'Kyoto',
            cost: 800,
            notes: 'Castillo con "pisos ruiseñor"'
          },
          {
            time: '14:00',
            title: 'Check-out Kyoto Tune Stay',
            category: 'hotel',
            duration: 30
          },
          {
            time: '15:00',
            title: 'JR Kyoto Line a Osaka',
            category: 'transport',
            duration: 30,
            cost: 570
          },
          {
            time: '16:00',
            title: 'Check-in Toyoko Inn Osaka Namba',
            category: 'hotel',
            duration: 30,
            location: 'Osaka'
          },
          {
            time: '19:00',
            title: 'Cena: Dotonbori - Takoyaki y Okonomiyaki',
            category: 'food',
            duration: 120,
            location: 'Dotonbori',
            notes: 'Glico Running Man - foto icónica'
          }
        ]
      },

      // DÍA 8
      {
        day: 8,
        date: '2025-02-23',
        city: 'Nara (day trip)',
        title: 'NARA DAY TRIP',
        theme: 'Ciervos Sagrados, Buda Gigante y Mochi Show',
        activities: [
          {
            time: '08:00',
            title: 'Kintetsu Nara Line desde Osaka',
            category: 'transport',
            duration: 45,
            cost: 570
          },
          {
            time: '09:00',
            title: 'Nara Park - Alimentar ciervos',
            category: 'nature',
            duration: 60,
            location: 'Nara',
            cost: 200,
            notes: 'Comprar shika senbei (galletas para ciervos) - GRATIS entrada'
          },
          {
            time: '10:00',
            title: 'Todai-ji Temple - Gran Buda de bronce',
            category: 'culture',
            duration: 90,
            location: 'Nara',
            cost: 600,
            notes: 'El edificio de madera más grande del mundo'
          },
          {
            time: '11:45',
            title: 'NAKATANIDOU - Mochi Pounding Show ⭐⭐⭐',
            category: 'food',
            duration: 30,
            location: 'Nara',
            cost: 200,
            highlight: true,
            notes: '¡Ver cómo golpean mochi a SUPER VELOCIDAD! ¡IMPERDIBLE!'
          },
          {
            time: '13:00',
            title: 'Almuerzo: Kakinoha sushi',
            category: 'food',
            duration: 60,
            location: 'Nara'
          },
          {
            time: '14:30',
            title: 'Kasuga Taisha Shrine',
            category: 'culture',
            duration: 60,
            location: 'Nara',
            cost: 500,
            notes: 'Santuario con 3,000 linternas'
          },
          {
            time: '16:00',
            title: 'Naramachi',
            category: 'shopping',
            duration: 60,
            location: 'Nara',
            notes: 'Barrio tradicional con tiendas'
          },
          {
            time: '17:30',
            title: 'Regreso a Osaka',
            category: 'transport',
            duration: 45
          },
          {
            time: '19:00',
            title: 'Cena: Kushikatsu en Shinsekai',
            category: 'food',
            duration: 90,
            location: 'Osaka',
            notes: 'Brochetas fritas'
          }
        ]
      },

      // DÍA 9
      {
        day: 9,
        date: '2025-02-24',
        city: 'Osaka → Tokyo',
        title: 'Osaka Castle + Acuario + Regreso a Tokyo',
        theme: 'Castillo, Acuario y Traslado',
        activities: [
          {
            time: '09:00',
            title: 'Osaka Castle - Jardines exteriores',
            category: 'culture',
            duration: 120,
            location: 'Osaka',
            cost: 0,
            notes: 'Ver castillo desde jardines - No entramos al museo - GRATIS'
          },
          {
            time: '12:30',
            title: 'Kaiyukan - Acuario de Osaka ⭐⭐⭐',
            category: 'nature',
            duration: 180,
            location: 'Osakako',
            cost: 2700,
            highlight: true,
            notes: '¡Tanque GIGANTE con tiburón ballena! Uno de los mejores del mundo'
          },
          {
            time: '16:00',
            title: 'Merienda rápida',
            category: 'food',
            duration: 30,
            location: 'Tempozan'
          },
          {
            time: '17:00',
            title: 'Check-out Toyoko Inn Osaka Namba',
            category: 'hotel',
            duration: 30
          },
          {
            time: '18:00',
            title: 'Shinkansen Osaka → Tokyo',
            category: 'transport',
            duration: 160,
            cost: 13870
          },
          {
            time: '21:00',
            title: 'Check-in APA Hotel Otsuka Ekimae',
            category: 'hotel',
            duration: 30,
            location: 'Tokyo'
          },
          {
            time: '21:30',
            title: 'Cena ligera cerca del hotel',
            category: 'food',
            duration: 45,
            location: 'Otsuka'
          }
        ]
      },

      // DÍA 10
      {
        day: 10,
        date: '2025-02-25',
        city: 'Tokyo',
        title: 'SHOPPING DAY 1 - Electrónica y Anime',
        theme: 'Compras intensivas',
        activities: [
          {
            time: '10:00',
            title: 'Akihabara - Compras electrónica',
            category: 'shopping',
            duration: 180,
            location: 'Akihabara',
            notes: 'Yodobashi, Bic Camera, Mandarake, Super Potato - Tax-free'
          },
          {
            time: '14:00',
            title: 'Almuerzo: Curry CoCo Ichibanya',
            category: 'food',
            duration: 45,
            location: 'Akihabara'
          },
          {
            time: '15:00',
            title: 'Ikebukuro - Pokemon Center & Anime',
            category: 'shopping',
            duration: 180,
            location: 'Ikebukuro',
            notes: 'Pokemon Center Mega Tokyo, Animate, Tokyu Hands'
          },
          {
            time: '19:30',
            title: 'Cena: Yakiniku (BBQ japonés)',
            category: 'food',
            duration: 90,
            location: 'Ikebukuro',
            cost: 3000
          },
          {
            time: '21:00',
            title: 'Organizar compras en hotel',
            category: 'other',
            duration: 60
          }
        ]
      },

      // DÍA 11
      {
        day: 11,
        date: '2025-02-26',
        city: 'Kamakura (day trip)',
        title: 'KAMAKURA DAY TRIP',
        theme: 'Gran Buda y Playa',
        activities: [
          {
            time: '07:30',
            title: 'JR Yokosuka Line a Kamakura',
            category: 'transport',
            duration: 60,
            cost: 950
          },
          {
            time: '09:00',
            title: 'Great Buddha (Kotoku-in)',
            category: 'culture',
            duration: 60,
            location: 'Kamakura',
            cost: 300,
            notes: 'Buda gigante de bronce. Entrar dentro +¥50'
          },
          {
            time: '10:30',
            title: 'Hasedera Temple',
            category: 'culture',
            duration: 60,
            location: 'Kamakura',
            cost: 400,
            notes: 'Templo con vista al mar'
          },
          {
            time: '12:00',
            title: 'Almuerzo: Shirasu-don',
            category: 'food',
            duration: 60,
            location: 'Kamakura',
            notes: 'Bowl de pescaditos local'
          },
          {
            time: '13:30',
            title: 'Yuigahama Beach',
            category: 'nature',
            duration: 60,
            location: 'Kamakura',
            notes: 'Playa tranquila, paseo por la costa'
          },
          {
            time: '15:00',
            title: 'Komachi-dori Street',
            category: 'shopping',
            duration: 60,
            location: 'Kamakura',
            notes: 'Calle comercial - souvenirs locales'
          },
          {
            time: '16:30',
            title: 'Tsurugaoka Hachimangu Shrine',
            category: 'culture',
            duration: 60,
            location: 'Kamakura',
            cost: 200
          },
          {
            time: '18:30',
            title: 'Regreso a Tokyo',
            category: 'transport',
            duration: 60
          },
          {
            time: '20:00',
            title: 'Cena ligera en Tokyo',
            category: 'food',
            duration: 60
          }
        ]
      },

      // DÍA 12
      {
        day: 12,
        date: '2025-02-27',
        city: 'Hakone (day trip)',
        title: 'HAKONE DAY TRIP',
        theme: 'Monte Fuji y Naturaleza',
        activities: [
          {
            time: '07:00',
            title: 'Romance Car a Hakone-Yumoto',
            category: 'transport',
            duration: 90,
            cost: 2500,
            notes: 'Reservar asiento con ventana. O Hakone Free Pass ¥6,100'
          },
          {
            time: '09:00',
            title: 'Hakone-Tozan Railway',
            category: 'transport',
            duration: 40,
            location: 'Hakone',
            notes: 'Tren de montaña zigzagueante'
          },
          {
            time: '10:00',
            title: 'Hakone Ropeway',
            category: 'sightseeing',
            duration: 40,
            location: 'Hakone',
            notes: 'Teleférico con vista a Mt. Fuji'
          },
          {
            time: '11:00',
            title: 'Owakudani Valle Volcánico ⭐',
            category: 'nature',
            duration: 90,
            location: 'Hakone',
            highlight: true,
            notes: 'Probar huevo negro (kuro-tamago) ¥500 - da 7 años de vida!'
          },
          {
            time: '13:00',
            title: 'Almuerzo: Comida local',
            category: 'food',
            duration: 60,
            location: 'Hakone-Yumoto'
          },
          {
            time: '14:30',
            title: 'Lake Ashi Cruise',
            category: 'sightseeing',
            duration: 60,
            location: 'Hakone',
            notes: 'Crucero pirata con vista a Mt. Fuji'
          },
          {
            time: '16:00',
            title: 'Hakone Shrine - Torii flotante',
            category: 'culture',
            duration: 60,
            location: 'Hakone',
            notes: 'Foto icónica del torii en el lago'
          },
          {
            time: '19:30',
            title: 'Regreso a Tokyo',
            category: 'transport',
            duration: 90
          },
          {
            time: '21:00',
            title: 'Cena ligera',
            category: 'food',
            duration: 45
          }
        ]
      },

      // DÍA 13
      {
        day: 13,
        date: '2025-02-28',
        city: 'Tokyo',
        title: 'SHOPPING DAY 2 - Moda y Estilo',
        theme: 'Compras de ropa y accesorios',
        activities: [
          {
            time: '10:00',
            title: 'Harajuku - Shopping moda',
            category: 'shopping',
            duration: 180,
            location: 'Harajuku',
            notes: 'Takeshita Street, 6% DOKIDOKI, WEGO, vintage shops'
          },
          {
            time: '14:00',
            title: 'Almuerzo: Crepes de Harajuku',
            category: 'food',
            duration: 45,
            location: 'Harajuku'
          },
          {
            time: '15:00',
            title: 'Shibuya - Shopping moda',
            category: 'shopping',
            duration: 180,
            location: 'Shibuya',
            notes: 'Shibuya 109, Parco, Loft, Tokyu Hands'
          },
          {
            time: '19:30',
            title: 'Cena: Sushi en Shibuya',
            category: 'food',
            duration: 90,
            location: 'Shibuya'
          },
          {
            time: '21:00',
            title: 'Organizar compras en hotel',
            category: 'other',
            duration: 60
          }
        ]
      },

      // DÍA 14
      {
        day: 14,
        date: '2025-03-01',
        city: 'Tokyo',
        title: 'SHOPPING DAY 3 - Últimas compras',
        theme: 'Compras finales y souvenirs',
        activities: [
          {
            time: '09:00',
            title: 'Ginza - Compras de calidad',
            category: 'shopping',
            duration: 180,
            location: 'Ginza',
            notes: 'Uniqlo Flagship, Muji, Itoya papelería, Ginza Six'
          },
          {
            time: '13:00',
            title: 'Almuerzo: Depachika en Mitsukoshi',
            category: 'food',
            duration: 60,
            location: 'Ginza',
            notes: 'Basement food halls'
          },
          {
            time: '14:00',
            title: 'Daiso/Seria - Tiendas ¥100',
            category: 'shopping',
            duration: 60,
            notes: 'Souvenirs baratos en cantidad'
          },
          {
            time: '15:30',
            title: 'Don Quijote - Última parada',
            category: 'shopping',
            duration: 120,
            notes: 'Snacks, cosméticos, últimos souvenirs'
          },
          {
            time: '18:00',
            title: 'Tokyo Character Street',
            category: 'shopping',
            duration: 60,
            location: 'Tokyo Station',
            notes: 'Pokémon, Ghibli, Sanrio'
          },
          {
            time: '19:00',
            title: 'Cena especial: Wagyu beef o tonkatsu',
            category: 'food',
            duration: 90,
            cost: 5000
          },
          {
            time: '21:00',
            title: 'Organizar maletas finales',
            category: 'other',
            duration: 120,
            notes: 'Preparar todo para mañana'
          }
        ]
      },

      // DÍA 15
      {
        day: 15,
        date: '2025-03-02',
        city: 'Tokyo',
        title: 'Última mañana + Despedida',
        theme: 'Preparativos finales y regreso',
        activities: [
          {
            time: '08:00',
            title: 'Check-out APA Hotel Otsuka Ekimae',
            category: 'hotel',
            duration: 30
          },
          {
            time: '09:00',
            title: 'Desayuno ligero en konbini',
            category: 'food',
            duration: 30
          },
          {
            time: '10:00',
            title: 'Traslado al aeropuerto',
            category: 'transport',
            duration: 90,
            notes: 'Narita Express (¥3,250) o Keisei Skyliner (¥2,570)'
          },
          {
            time: '12:00',
            title: 'Aeropuerto - Devolver Suica Card',
            category: 'other',
            duration: 15,
            notes: 'Recuperar depósito ¥500'
          },
          {
            time: '12:30',
            title: 'Duty-free - Última compra',
            category: 'shopping',
            duration: 90,
            notes: 'Kit-Kats, Whisky japonés, cosméticos'
          },
          {
            time: '15:00',
            title: 'Vuelo de regreso',
            category: 'transport',
            notes: 'Sayonara, Japón! 🇯🇵✨'
          }
        ]
      }
    ],

    tips: [
      '🎫 NO necesitas JR Pass - tickets individuales son más baratos',
      '💴 Usa Suica/Pasmo Card para todo el transporte local',
      '📱 Descarga Google Maps offline antes del viaje',
      '🏪 Konbini (7-Eleven, Lawson, FamilyMart) son tus mejores amigos',
      '🚆 Reserva asientos de Shinkansen con anticipación',
      '🗻 En Hakone, verifica el clima - Mt. Fuji solo se ve si está despejado',
      '🛍️ Segunda ronda de Tokyo está optimizada para shopping',
      '📦 Compra una maleta extra o envía paquetes por correo',
      '🧳 Los hoteles guardan maletas si llegas antes del check-in',
      '⏰ Llega 3 horas antes al aeropuerto para vuelo internacional'
    ],

    notes: `
Este itinerario está optimizado para maximizar tu tiempo en Japón sin estresarte.

PUNTOS CLAVE:
- Hoteles estratégicamente ubicados para minimizar traslados
- Segunda ronda en Tokyo enfocada en SHOPPING (días 10, 13, 14)
- Sin onsen en Hakone pero con todas las experiencias naturales
- Solo vemos Osaka Castle desde afuera (jardines gratis)
- No entramos a TeamLab ni Tokyo Skytree
- 3 traslados de ciudad: Tokyo → Kyoto → Osaka → Tokyo
- 2 viajes en Shinkansen (cubiertos si tienes JR Pass)
- 2 day trips desde Tokyo: Kamakura y Hakone

PRESUPUESTO: ~¥490,000 ($3,270 USD) sin incluir vuelo internacional
    `,

    version: '1.0.0',
    createdAt: '2025-12-30',
    author: 'Generated with Claude Code',
    tags: ['complete', 'shopping', 'culture', 'nature', 'anime', 'family-friendly']
  }
];

// Export default
export default ITINERARY_TEMPLATES;

console.log('✅ Itinerary Templates loaded:', ITINERARY_TEMPLATES.length);
