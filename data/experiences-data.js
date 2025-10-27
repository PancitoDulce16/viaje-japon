// data/experiences-data.js - Experiencias japonesas únicas

export const JAPANESE_EXPERIENCES = {
  cultural: {
    name: "Experiencias Culturales",
    icon: "🎎",
    experiences: [
      {
        id: "kimono-rental",
        name: "Kimono Rental",
        category: "cultural",
        description: "Alquila un kimono auténtico y pasea por áreas históricas. Incluye vestimenta completa y accesorios.",
        priceRange: "¥3000-8000",
        duration: "4-8 horas",
        bestFor: ["Fotos", "Experiencia cultural", "Explorar templos"],
        difficulty: "Fácil",
        rating: 5,
        tips: [
          "Reserva con anticipación en temporada alta",
          "Llega temprano (8-9am) para evitar multitudes",
          "Usa ropa interior cómoda",
          "Lleva calcetines tabi o compra ahí (¥300)",
          "Algunos incluyen peinado y maquillaje (+¥2000)",
          "Devuelve antes del cierre (usualmente 17:30)"
        ],
        locations: {
          Kyoto: [
            {
              shop: "Yumeyakata",
              area: "Gion, Arashiyama",
              price: "¥3000-5000",
              includes: ["Kimono", "Obi", "Accesorios", "Bolso"],
              extras: { hair: "¥1500", couple: "¥6000" },
              hours: "9:00-18:00",
              reservation: "Recomendada",
              english: true
            },
            {
              shop: "Wargo",
              area: "Múltiples ubicaciones",
              price: "¥2900-6000",
              includes: ["Kimono completo", "Fotos gratis"],
              extras: { premium: "+¥3000" },
              popular: true
            }
          ],
          Tokyo: [
            {
              shop: "Sakura Photo Studio",
              area: "Asakusa",
              price: "¥4000-7000",
              includes: ["Kimono", "Foto profesional", "Paseo"],
              bestFor: "Zona de Sensoji Temple"
            }
          ],
          Osaka: [
            {
              shop: "Kimono Rental Wargo",
              area: "Dotonbori",
              price: "¥2900-5000",
              modern: "También tienen yukatas"
            }
          ]
        },
        seasonalNote: "En verano, considera Yukata (más ligero) en lugar de Kimono"
      },
      {
        id: "tea-ceremony",
        name: "Ceremonia del Té",
        category: "cultural",
        description: "Aprende sobre la ceremonia tradicional del té japonés. Incluye preparación y degustación de matcha.",
        priceRange: "¥2000-5000",
        duration: "45-90 minutos",
        difficulty: "Fácil",
        rating: 4,
        tips: [
          "Siéntate en seiza (de rodillas) - puede ser incómodo",
          "Gira el bol 2 veces antes de beber",
          "Algunos lugares permiten sentarse normal si pides",
          "Incluye dulce wagashi tradicional"
        ],
        locations: {
          Kyoto: ["Camellia Tea Ceremony", "En-An", "Tea Ceremony Koto"],
          Tokyo: ["Maikoya", "Happo-en Garden"]
        }
      },
      {
        id: "calligraphy",
        name: "Caligrafía Japonesa (Shodo)",
        category: "cultural",
        description: "Aprende el arte de la caligrafía japonesa. Crea tu propia obra de arte con pincel y tinta.",
        priceRange: "¥3000-6000",
        duration: "1-2 horas",
        difficulty: "Medio",
        rating: 4,
        tips: [
          "Te llevas tu creación a casa",
          "Algunos lugares ofrecen scroll profesional (+¥1000)",
          "Buena actividad en día lluvioso"
        ]
      }
    ]
  },

  onsen: {
    name: "Onsen & Baños Públicos",
    icon: "♨️",
    experiences: [
      {
        id: "onsen-public",
        name: "Onsen Público",
        category: "onsen",
        description: "Baño termal tradicional japonés. Aguas naturales con minerales beneficiosos.",
        priceRange: "¥500-1500",
        duration: "1-3 horas",
        difficulty: "Medio (desnudez completa)",
        rating: 5,
        rules: [
          "🚫 SIN tatuajes visibles (cubre con parches o toalla pequeña)",
          "🧼 LÁVATE completamente ANTES de entrar al onsen",
          "👙 Completamente desnudo (sin traje de baño)",
          "🧴 Deja toalla grande en locker, lleva toalla pequeña",
          "📱 NO fotos ni teléfonos",
          "💧 NO metas toalla en el agua",
          "🤫 Hablar en voz baja"
        ],
        tips: [
          "Ve por la noche (menos gente)",
          "Prueba diferentes temperaturas (hay 3-5 pools)",
          "Hidrata bien después",
          "Algunos ofrecen rotenburo (baño al aire libre)"
        ],
        locations: {
          Tokyo: [
            {
              name: "Oedo Onsen Monogatari",
              area: "Odaiba",
              price: "¥2900",
              special: "Tema Edo, yukata incluido",
              english: true,
              tattooFriendly: "Parcialmente (parches disponibles)"
            },
            {
              name: "Thermae-Yu",
              area: "Shinjuku",
              price: "¥2000",
              hours: "11:00-9:00 AM (23 horas)"
            }
          ],
          Hakone: [
            {
              name: "Tenzan Onsen",
              price: "¥1300",
              special: "Vista montañas, rotenburo",
              rating: 5
            }
          ],
          Osaka: [
            {
              name: "Spa World",
              area: "Shinsekai",
              price: "¥1500",
              special: "Onsens temáticos de diferentes países"
            }
          ]
        }
      },
      {
        id: "sento",
        name: "Sento (Baño Público)",
        category: "onsen",
        description: "Baño público de barrio. Más casual y económico que onsen.",
        priceRange: "¥450-500",
        duration: "30-60 minutos",
        difficulty: "Medio",
        rating: 4,
        tips: [
          "Más local, menos turístico",
          "Mismas reglas que onsen",
          "Algunos tienen sauna",
          "Trae tu propio shampoo/jabón (o compra ahí ¥50)"
        ]
      }
    ]
  },

  entertainment: {
    name: "Entretenimiento",
    icon: "🎮",
    experiences: [
      {
        id: "karaoke",
        name: "Karaoke",
        category: "entertainment",
        description: "Cuartos privados para cantar. Experiencia social japonesa icónica.",
        priceRange: "¥300-600/hora/persona",
        duration: "1-3 horas (tú eliges)",
        difficulty: "Fácil",
        rating: 5,
        tips: [
          "Hay opciones de bebidas all-you-can-drink (+¥1000-1500)",
          "Nomihoudai = bebidas ilimitadas",
          "Tabehoudai = comida ilimitada",
          "Más barato antes de 6pm (early bird)",
          "Pide el control en inglés",
          "Sistema DAM tiene más canciones en inglés"
        ],
        chains: [
          {
            name: "Karaoke Kan",
            price: "¥400-600/hora",
            popular: "Shinjuku",
            famous: "Lost in Translation fue filmado aquí"
          },
          {
            name: "Big Echo",
            price: "¥300-500/hora",
            special: "Muchas promociones",
            rooms: "Desde 1 persona"
          },
          {
            name: "Shidax",
            price: "¥400-600/hora",
            special: "Mejor comida"
          },
          {
            name: "Koshitsu (Booth style)",
            price: "¥300-400/hora",
            note: "Más económico, espacios pequeños"
          }
        ],
        locations: {
          Tokyo: ["Shinjuku", "Shibuya", "Roppongi"],
          Osaka: ["Dotonbori", "Namba", "Umeda"]
        },
        packages: {
          "3 horas + nomihoudai": "¥2500-3500",
          "5 horas nocturnas (10pm-5am)": "¥1500-2500",
          "Free time (ilimitado)": "¥2500-4000"
        }
      },
      {
        id: "arcade",
        name: "Arcades",
        category: "entertainment",
        description: "Salones de videojuegos japoneses. Desde rhythm games hasta UFO catchers.",
        priceRange: "¥100-500 por juego",
        duration: "1-3 horas",
        difficulty: "Varía",
        rating: 5,
        types: [
          {
            game: "UFO Catcher (Crane games)",
            price: "¥100-200/intento",
            tip: "Pide ayuda al staff si estás cerca de ganar",
            difficulty: "Difícil"
          },
          {
            game: "Purikura (Photo booth)",
            price: "¥300-500",
            tip: "Edita las fotos (ojos grandes, piel perfecta)",
            mustDo: true
          },
          {
            game: "Rhythm games (Taiko, Dance, Guitar)",
            price: "¥100-200",
            popular: ["Taiko no Tatsujin", "Dance Dance Revolution", "MaiMai"]
          },
          {
            game: "Fighting games",
            price: "¥100",
            tip: "Nivel MUY alto en Japón"
          }
        ],
        chains: [
          {
            name: "Round1",
            special: "Multicomplejo (karaoke, bolos, arcades)",
            price: "¥100-300/juego",
            hours: "Muchos 24 horas"
          },
          {
            name: "Taito Station",
            special: "Clásico, muchos UFO catchers",
            locations: "Por todo Japón"
          },
          {
            name: "Sega",
            special: "Rhythm games y fighting",
            locations: "Akihabara, Ikebukuro"
          }
        ],
        tips: [
          "Cambia yenes a monedas de ¥100 en máquina",
          "Muchos juegos solo aceptan ¥100",
          "Purikura = experiencia obligatoria",
          "Round1 tiene paquetes de tiempo ilimitado"
        ]
      },
      {
        id: "purikura",
        name: "Purikura",
        category: "entertainment",
        description: "Photo booths japoneses con edición crazy. Te hacen ojos enormes y piel perfecta.",
        priceRange: "¥300-500",
        duration: "15-20 minutos",
        difficulty: "Fácil",
        rating: 5,
        tips: [
          "Los hombres solos a veces tienen restricciones (por privacidad)",
          "Edita las fotos después de tomar",
          "Agrega texto, stickers, efectos",
          "Recibes fotos físicas Y digitales (QR code)",
          "Experiencia muy kawaii"
        ],
        locations: "En todos los arcades"
      }
    ]
  },

  unique: {
    name: "Experiencias Únicas",
    icon: "⭐",
    experiences: [
      {
        id: "maid-cafe",
        name: "Maid Café",
        category: "unique",
        description: "Café temático donde las meseras van vestidas de maids y te tratan como 'master'.",
        priceRange: "¥1000-2000 (cover) + bebidas/comida",
        duration: "60-90 minutos (tiempo limitado)",
        difficulty: "Fácil (puede ser incómodo al inicio)",
        rating: 4,
        location: "Akihabara (mayoría)",
        tips: [
          "Cover charge obligatorio",
          "Las maids cantan y hacen 'magia' a tu comida",
          "Fotos con las maids cuestan extra (¥500-1000)",
          "Experiencia 100% japonesa, muy kawaii",
          "Algunos tienen menú en inglés"
        ],
        popular: [
          "@home café",
          "Maidreamin",
          "Cure Maid Café"
        ]
      },
      {
        id: "owl-cafe",
        name: "Animal Café (Owl, Cat, Hedgehog)",
        category: "unique",
        description: "Cafés donde interactúas con animales.",
        priceRange: "¥1000-2000/hora",
        duration: "60 minutos",
        types: [
          { animal: "Owl Café", location: "Harajuku, Osaka" },
          { animal: "Cat Café", location: "Por todo Japón" },
          { animal: "Hedgehog Café", location: "Harajuku" },
          { animal: "Otter Café", location: "Ikebukuro" }
        ],
        tips: [
          "Reserva con anticipación",
          "Tiempo limitado (60 min usualmente)",
          "Algunos animales solo observación",
          "Considera bienestar animal"
        ],
        rating: 4
      },
      {
        id: "robot-restaurant",
        name: "Robot Restaurant",
        category: "unique",
        description: "Show de luces, robots gigantes, música a todo volumen. Experiencia LOCA.",
        priceRange: "¥4000-8000",
        duration: "90 minutos",
        location: "Shinjuku, Tokyo",
        rating: 4,
        tips: [
          "Reserva online (más barato)",
          "Es un SHOW, no un restaurante real",
          "Súper kitsch y over-the-top",
          "Bebidas y bento box básico incluidos",
          "Experiencia inolvidable (buena o mala)"
        ],
        note: "Love it or hate it - no hay punto medio"
      }
    ]
  }
};

export default JAPANESE_EXPERIENCES;
