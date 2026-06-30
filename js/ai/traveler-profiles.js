/**
 * 👤 TRAVELER PROFILES SYSTEM
 * ============================
 *
 * Detailed traveler archetypes with personalized recommendations:
 * - Foodie (Food lover)
 * - Otaku (Anime/Manga enthusiast)
 * - Nature Lover (Outdoor explorer)
 * - History Buff (Cultural heritage)
 * - Shopaholic (Shopping enthusiast)
 * - Photography (Photo opportunities)
 * - Nightlife (Bars, clubs, entertainment)
 * - Spiritual (Temples, meditation)
 * - Adventure (Thrills and experiences)
 * - Relaxation (Onsen, calm experiences)
 */

class TravelerProfiles {
  constructor() {
    this.initialized = false;

    // Detailed traveler profiles
    this.profiles = {
      foodie: {
        name: 'Foodie Gourmet',
        icon: '🍜',
        emoji: '🍱',
        description: 'Tu viaje gira alrededor de la comida. Ramen, sushi, kaiseki, street food... ¡lo quieres probar TODO!',
        color: '#ef4444',
        traits: ['Aventurero culinario', 'No teme probar cosas raras', 'Busca autenticidad', 'Ama los mercados'],

        priorities: {
          food: 10,
          culture: 7,
          shopping: 5,
          nature: 4,
          nightlife: 6
        },

        mustVisit: [
          { name: 'Tsukiji Outer Market', city: 'Tokyo', reason: 'Mejor sushi fresco del mundo' },
          { name: 'Dotonbori', city: 'Osaka', reason: 'Street food heaven: takoyaki, okonomiyaki' },
          { name: 'Nishiki Market', city: 'Kyoto', reason: 'Mercado tradicional, ingredientes únicos' },
          { name: 'Ramen Yokocho', city: 'Sapporo', reason: 'Callejón con 17 ramen shops icónicos' },
          { name: 'Depachika', city: 'Anywhere', reason: 'Food halls en sótanos de department stores' }
        ],

        recommendations: {
          restaurants: [
            'Busca restaurantes con cola de locales',
            'Prueba los sets de almuerzo (定食 teishoku) - mejor valor',
            'Visita izakayas para experiencia social japonesa',
            'Reserva kaiseki con anticipación (caro pero inolvidable)',
            'No te pierdas conveyor belt sushi (kaiten-zushi)'
          ],
          experiences: [
            'Cooking class de ramen o sushi',
            'Food tour por Tsukiji o Nishiki',
            'Prueba cada tipo de ramen: shoyu, miso, tonkotsu, shio',
            'Desayuno en mercado de pescado (5am)',
            'Colecciona sellos en tu Ramen Passport'
          ],
          tips: [
            'Descarga apps: Tabelog (mejor que Google), Gurunavi',
            'Di "omakase" para que el chef elija por ti',
            'Konbini (7-Eleven) tiene comida sorprendentemente buena',
            'Depachika = food court de lujo en sótanos',
            'Reserva restaurantes Michelin con 1-2 meses de anticipación'
          ]
        },

        budget: {
          daily: 5000, // JPY más alto para foodies
          breakdown: {
            food: 0.60, // 60% en comida
            activities: 0.20,
            shopping: 0.15,
            misc: 0.05
          }
        }
      },

      otaku: {
        name: 'Otaku Culture',
        icon: '🎌',
        emoji: '⚡',
        description: 'Anime, manga, gaming, maid cafes... Japón es tu meca cultural. ¡A vivir el sueño otaku!',
        color: '#f59e0b',
        traits: ['Fan de anime/manga', 'Coleccionista', 'Gamer', 'Busca merchandising único'],

        priorities: {
          shopping: 10,
          culture: 9,
          food: 6,
          nightlife: 7,
          nature: 3
        },

        mustVisit: [
          { name: 'Akihabara', city: 'Tokyo', reason: 'Meca del anime, manga, electronics' },
          { name: 'Nakano Broadway', city: 'Tokyo', reason: 'Vintage toys, retro games, manga raro' },
          { name: 'Animate Ikebukuro', city: 'Tokyo', reason: 'Tienda de anime más grande del mundo' },
          { name: 'Pokémon Center Mega Tokyo', city: 'Tokyo', reason: 'Merchandising exclusivo de Pokémon' },
          { name: 'Nintendo Store Kyoto', city: 'Kyoto', reason: 'Tienda oficial de Nintendo' },
          { name: 'Denden Town', city: 'Osaka', reason: 'Akihabara de Osaka' }
        ],

        recommendations: {
          activities: [
            'Maid cafe en Akihabara (experiencia única)',
            'Visita estudios: Ghibli Museum (reserva con MESES)',
            'Arcades: Round1, Taito Station, Sega',
            'Karaoke all-night (ネカフェ)',
            'Cosplay shopping en Harajuku'
          ],
          shopping: [
            'Mandarake para manga/anime vintage',
            'Book-Off para manga usado barato',
            'Surugaya para figuras de segunda mano',
            'Kotobukiya, Good Smile para figuras nuevas',
            'Comiket (agosto/diciembre) si coincide tu viaje'
          ],
          experiences: [
            'Robot Restaurant en Shinjuku (show loco)',
            'TeamLab Borderless (arte digital interactivo)',
            'VR Zone Shinjuku',
            'Owl Cafe, Cat Cafe, Hedgehog Cafe',
            'Anime pilgrimage (聖地巡礼) a locations reales'
          ],
          tips: [
            'Duty-free en Akihabara ahorra 10% tax',
            'Compara precios: Yodobashi vs Bic Camera',
            'Lleva maleta extra para merchandising',
            'Apps: Animate, Mandarake, Surugaya',
            'Aprende a decir "gentei" (限定) = edición limitada'
          ]
        },

        budget: {
          daily: 6000, // Alto por shopping
          breakdown: {
            shopping: 0.50,
            food: 0.25,
            activities: 0.20,
            misc: 0.05
          }
        }
      },

      nature: {
        name: 'Nature Explorer',
        icon: '🏔️',
        emoji: '🌲',
        description: 'Montañas, bosques, onsen naturales... Buscas la tranquilidad y belleza de la naturaleza japonesa.',
        color: '#10b981',
        traits: ['Ama el aire libre', 'Busca tranquilidad', 'Fotógrafo de paisajes', 'Aventurero moderado'],

        priorities: {
          nature: 10,
          culture: 6,
          food: 5,
          shopping: 3,
          relaxation: 9
        },

        mustVisit: [
          { name: 'Arashiyama Bamboo Grove', city: 'Kyoto', reason: 'Bosque de bambú icónico' },
          { name: 'Mount Fuji (5th Station)', city: 'Fuji', reason: 'Vista del monte sagrado' },
          { name: 'Hakone National Park', city: 'Hakone', reason: 'Montañas, lagos, onsen' },
          { name: 'Kamikochi', city: 'Nagano', reason: 'Valle alpino pristino' },
          { name: 'Fushimi Inari Trails', city: 'Kyoto', reason: 'Hiking entre 10,000 torii gates' },
          { name: 'Shirakawa-go', city: 'Gifu', reason: 'Pueblo tradicional en montañas' }
        ],

        recommendations: {
          activities: [
            'Hiking en Japan Alps (primavera/otoño)',
            'Onsen hopping en Hakone',
            'Sunrise desde Mount Fuji (verano)',
            'Kayaking en Miyajima',
            'Forest bathing (shinrin-yoku) en Yakushima'
          ],
          seasons: [
            'Primavera: Hanami en parques (no solo Tokyo)',
            'Verano: Hiking en altitud, festivales rurales',
            'Otoño: Koyo (hojas rojas) en Nikko, Kamikochi',
            'Invierno: Nieve en Hokkaido, onsen en montañas'
          ],
          accommodation: [
            'Ryokan tradicional con onsen privado',
            'Mountain huts (山小屋) para multi-day hikes',
            'Glamping en Fuji area',
            'Temple stay (shukubo) en Koyasan',
            'Farmstays en zonas rurales'
          ],
          tips: [
            'JR Pass vale más para rutas rurales',
            'Alquila carro para zonas remotas (IDP requerido)',
            'Lleva cash - pueblos pequeños no aceptan tarjeta',
            'Apps: Hyperdia (trenes), YAMAP (hiking trails)',
            'Respeta la naturaleza: lleva tu basura siempre'
          ]
        },

        budget: {
          daily: 4500,
          breakdown: {
            accommodation: 0.35, // Ryokans más caros
            transport: 0.25,
            food: 0.25,
            activities: 0.15
          }
        }
      },

      history: {
        name: 'History Buff',
        icon: '🏯',
        emoji: '⛩️',
        description: 'Castillos, templos, museos... Te fascina la historia samurai, la era Edo y el patrimonio cultural.',
        color: '#8b5cf6',
        traits: ['Curioso histórico', 'Ama arquitectura antigua', 'Lee placas informativas', 'Colecciona conocimiento'],

        priorities: {
          culture: 10,
          history: 10,
          food: 6,
          shopping: 5,
          nature: 5
        },

        mustVisit: [
          { name: 'Himeji Castle', city: 'Himeji', reason: 'Castillo original, UNESCO, el más bello' },
          { name: 'Nara (Todaiji, Kasuga)', city: 'Nara', reason: 'Primera capital, templos antiguos' },
          { name: 'Hiroshima Peace Memorial', city: 'Hiroshima', reason: 'Historia WWII, imprescindible' },
          { name: 'Kinkakuji & Ginkakuji', city: 'Kyoto', reason: 'Pabellones dorado y plateado' },
          { name: 'Nikko Toshogu', city: 'Nikko', reason: 'Mausoleo de Tokugawa, ultra ornamentado' },
          { name: 'Takayama Old Town', city: 'Takayama', reason: 'Arquitectura Edo preservada' }
        ],

        recommendations: {
          experiences: [
            'Samurai museum con demostración de katana',
            'Tea ceremony en templo tradicional',
            'Guided tour de Kyoto histórico',
            'Ninja experience en Iga o Koka',
            'Sumo tournament (enero, mayo, septiembre en Tokyo)'
          ],
          museums: [
            'Tokyo National Museum (arte samurai)',
            'Kyoto National Museum',
            'Edo-Tokyo Museum (historia de Tokyo)',
            'Osaka Castle Museum',
            'Hiroshima Peace Memorial Museum (必見)'
          ],
          routes: [
            'Golden Route: Tokyo → Kyoto → Osaka → Hiroshima',
            'Nakasendo Trail (post towns entre montañas)',
            'Kumano Kodo (rutas de peregrinación)',
            'Castles tour: Himeji, Osaka, Matsumoto, Kumamoto',
            'UNESCO sites hunting (23 en total)'
          ],
          tips: [
            'Muchos templos cierran 4-5pm, ve temprano',
            'Compra Kyoto bus pass (1 day = ¥700, vale la pena)',
            'Audio guides disponibles en mayoría de museos',
            'Goshuin (sellos de templos) = recuerdo cultural único',
            'Respeta reglas: no fotos donde prohibido, silencio'
          ]
        },

        budget: {
          daily: 4000,
          breakdown: {
            culture: 0.40, // Entradas a castillos, templos
            transport: 0.25,
            food: 0.25,
            shopping: 0.10
          }
        }
      },

      shopaholic: {
        name: 'Shopaholic',
        icon: '🛍️',
        emoji: '💳',
        description: 'Fashion, gadgets, cosméticos, souvenirs... Si se vende en Japón, tú lo quieres comprar.',
        color: '#ec4899',
        traits: ['Busca gangas', 'Ama marcas japonesas', 'Tax-free hunter', 'Necesita maleta extra'],

        priorities: {
          shopping: 10,
          food: 6,
          culture: 5,
          nightlife: 7,
          nature: 3
        },

        mustVisit: [
          { name: 'Shibuya 109', city: 'Tokyo', reason: 'Fashion para chicas, tendencias japonesas' },
          { name: 'Ginza', city: 'Tokyo', reason: 'Luxury brands, department stores' },
          { name: 'Harajuku/Takeshita Street', city: 'Tokyo', reason: 'Street fashion, kawaii culture' },
          { name: 'Shinsaibashi', city: 'Osaka', reason: 'Shopping arcade gigante' },
          { name: 'Namba Parks', city: 'Osaka', reason: 'Mall moderno con rooftop garden' },
          { name: 'Teramachi', city: 'Kyoto', reason: 'Shopping street tradicional cubierta' }
        ],

        recommendations: {
          shopping: [
            'Uniqlo flagship stores (mejores que en tu país)',
            'Don Quijote (驚安の殿堂) - todo 24/7, caótico',
            'Daiso, Seria (100 yen shops) - souvenirs baratos',
            'Loft, Tokyu Hands - diseño japonés único',
            'Bic Camera, Yodobashi - electronics tax-free'
          ],
          taxFree: [
            'Gasta >¥5000 en una tienda para tax-free (10% off)',
            'Lleva pasaporte SIEMPRE cuando compres',
            'Tax-free counter usualmente en piso alto',
            'No puedes usar productos hasta salir de Japón',
            'Algunos lugares hacen tax-free inmediato, otros reembolso'
          ],
          brands: [
            'Cosméticos: Shiseido, SK-II, Hada Labo',
            'Fashion: Comme des Garçons, Issey Miyake, Uniqlo',
            'Stationery: Muji, Midori, Pilot',
            'Snacks: Kit Kats exclusivos, Tokyo Banana, Royce Chocolate',
            'Tech: Sony, Panasonic, Nintendo (ediciones JP)'
          ],
          tips: [
            'Outlets: Gotemba (cerca Fuji), Rinku (Osaka)',
            'Timing: Sales en enero y julio',
            'Amazon JP entrega al hotel (si tienen JP credit card)',
            'Yamato delivery para enviar maletas entre ciudades',
            'Guarda recibos para posible reembolso de tax'
          ]
        },

        budget: {
          daily: 8000, // El más alto - shopaholic
          breakdown: {
            shopping: 0.60,
            food: 0.20,
            transport: 0.10,
            activities: 0.10
          }
        }
      },

      photography: {
        name: 'Photography Pro',
        icon: '📸',
        emoji: '🎞️',
        description: 'Golden hour, composiciones perfectas, luces de neón... Cada rincón de Japón es tu shot perfecto.',
        color: '#3b82f6',
        traits: ['Madrugador (sunrise shots)', 'Paciente', 'Busca ángulos únicos', 'Weather-dependent'],

        priorities: {
          culture: 8,
          nature: 9,
          food: 5,
          nightlife: 7,
          shopping: 4
        },

        mustVisit: [
          { name: 'Fushimi Inari at dawn', city: 'Kyoto', reason: 'Torii gates sin turistas, luz mágica' },
          { name: 'Shibuya Crossing from above', city: 'Tokyo', reason: 'Iconic urban shot, mejor desde Starbucks' },
          { name: 'TeamLab Borderless', city: 'Tokyo', reason: 'Digital art, luces increíbles' },
          { name: 'Arashiyama at sunrise', city: 'Kyoto', reason: 'Bamboo grove vacío' },
          { name: 'Tokyo Tower at night', city: 'Tokyo', reason: 'Cityscape clásico' },
          { name: 'Chureito Pagoda + Fuji', city: 'Fujiyoshida', reason: 'Vista postal de Japón' }
        ],

        recommendations: {
          goldHours: [
            'Sunrise en templos (5-6am) = sin turistas',
            'Blue hour para neon/cityscape (7-8pm)',
            'Golden hour para street photography',
            'Night shots: Dotonbori, Shibuya, Tokyo Tower',
            'Rainy days = mejores reflejos en pavimento'
          ],
          locations: [
            'Rooftops: Tokyo Metropolitan Building (gratis)',
            'Street level: Nakameguro, Yanaka Ginza',
            'Neon: Kabukicho, Dotonbori',
            'Traditional: Gion, Higashiyama',
            'Nature: Hakone, Kawaguchiko (Fuji views)'
          ],
          gear: [
            'Lleva extra batteries (mucho caminar)',
            'Trípode compacto para long exposures',
            'Wide angle para temples/cityscape',
            'Telephoto para Mt. Fuji shots',
            'ND filter para daytime long exposures'
          ],
          tips: [
            'Pide permiso antes de fotografiar personas',
            'Muchos templos prohíben fotos interiores',
            'Google "撮影スポット" (satsue spot) + ciudad',
            'Apps: Photopills (sun/moon tracker), Google Maps reviews',
            'Madruga = menos turistas en shots icónicos'
          ]
        },

        budget: {
          daily: 4500,
          breakdown: {
            transport: 0.30, // Moverse a locations
            food: 0.30,
            activities: 0.25,
            misc: 0.15
          }
        }
      },

      relaxation: {
        name: 'Zen Seeker',
        icon: '♨️',
        emoji: '🧘',
        description: 'Onsen, meditación, jardines zen... Buscas paz, descanso y experiencias relajantes.',
        color: '#06b6d4',
        traits: ['Ritmo lento', 'Busca tranquilidad', 'Ama onsens', 'Mindful traveler'],

        priorities: {
          relaxation: 10,
          nature: 8,
          culture: 7,
          food: 6,
          shopping: 3
        },

        mustVisit: [
          { name: 'Hakone Onsen', city: 'Hakone', reason: 'Múltiples ryokans con onsen privado' },
          { name: 'Ryoanji Rock Garden', city: 'Kyoto', reason: 'Jardín zen más famoso del mundo' },
          { name: 'Koyasan', city: 'Wakayama', reason: 'Temple stay, meditación budista' },
          { name: 'Kurama Onsen', city: 'Kyoto', reason: 'Onsen outdoor en montañas' },
          { name: 'Kenrokuen Garden', city: 'Kanazawa', reason: 'Uno de los 3 jardines más bellos' },
          { name: 'Kinosaki Onsen', city: 'Hyogo', reason: 'Pueblo onsen tradicional, 7 baños públicos' }
        ],

        recommendations: {
          experiences: [
            'Multi-day ryokan stay con kaiseki',
            'Morning meditation en templo Zen',
            'Tea ceremony privada',
            'Forest bathing (shinrin-yoku)',
            'Rotenburo (outdoor onsen) bajo estrellas'
          ],
          onsen: [
            'Hakone: acceso fácil desde Tokyo',
            'Kusatsu: uno de los mejores de Japón',
            'Beppu: ciudad onsen con 8 "hells"',
            'Kinosaki: onsen hopping entre 7 baños',
            'Dogo Onsen (Matsuyama): el más antiguo'
          ],
          temples: [
            'Kinkakuji early morning (silencio)',
            'Koyasan temple stay (shukubo)',
            'Eiheiji (templo Zen, meditación)',
            'Engakuji (Kamakura, menos turistas)',
            'Hasedera con vista al mar'
          ],
          tips: [
            'Ryokans = caro pero vale cada yen',
            'Onsen etiquette: lávate completamente primero',
            'Muchos onsen prohíben tatuajes (busca tattoo-OK)',
            'Check-in ryokan temprano para disfrutar',
            'Yukata provided - úsalo para pasear pueblo onsen'
          ]
        },

        budget: {
          daily: 5500, // Ryokans caros
          breakdown: {
            accommodation: 0.50, // Ryokan con kaiseki
            food: 0.20,
            activities: 0.20,
            transport: 0.10
          }
        }
      }
    };

    console.log('👤 Traveler Profiles System initialized');
  }

  /**
   * Get profile by key
   */
  getProfile(profileKey) {
    return this.profiles[profileKey] || null;
  }

  /**
   * Get all profiles
   */
  getAllProfiles() {
    return this.profiles;
  }

  /**
   * Get recommendations for a profile
   */
  getRecommendations(profileKey) {
    const profile = this.profiles[profileKey];
    return profile ? profile.recommendations : null;
  }

  /**
   * Calculate daily budget for profile
   */
  getDailyBudget(profileKey) {
    const profile = this.profiles[profileKey];
    return profile ? profile.budget.daily : 4000;
  }

  /**
   * Match activities to profile
   */
  matchActivitiesToProfile(activities, profileKey) {
    const profile = this.profiles[profileKey];
    if (!profile) return activities;

    // Score each activity based on profile priorities
    return activities.map(activity => {
      let score = 0;
      const category = activity.category || 'misc';

      // Match category to profile priorities
      if (profile.priorities[category]) {
        score = profile.priorities[category];
      }

      return {
        ...activity,
        profileScore: score,
        matchReason: this.getMatchReason(activity, profile)
      };
    }).sort((a, b) => b.profileScore - a.profileScore);
  }

  /**
   * Get match reason
   */
  getMatchReason(activity, profile) {
    const reasons = {
      foodie: 'Perfect para experimentar la gastronomía japonesa',
      otaku: 'Imperdible para fans del anime y la cultura pop',
      nature: 'Experiencia natural única en Japón',
      history: 'Rica en historia y patrimonio cultural',
      shopaholic: 'Excelente para shopping y souvenirs',
      photography: 'Location fotográfica espectacular',
      relaxation: 'Ideal para relajarte y desconectar'
    };

    return reasons[profile.name] || 'Recomendado para tu perfil';
  }

  /**
   * Suggest profile based on preferences
   */
  suggestProfile(preferences) {
    let bestMatch = null;
    let bestScore = 0;

    Object.entries(this.profiles).forEach(([key, profile]) => {
      let score = 0;

      // Match preferences with profile priorities
      Object.keys(preferences).forEach(pref => {
        if (profile.priorities[pref]) {
          score += profile.priorities[pref] * preferences[pref];
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = key;
      }
    });

    return bestMatch;
  }

  /**
   * Get hybrid profile (multiple profiles)
   */
  getHybridProfile(profileKeys) {
    const hybrid = {
      name: 'Multi-Interest Traveler',
      profiles: [],
      mustVisit: [],
      recommendations: {},
      avgBudget: 0
    };

    let budgetSum = 0;

    profileKeys.forEach(key => {
      const profile = this.profiles[key];
      if (profile) {
        hybrid.profiles.push(profile);
        hybrid.mustVisit.push(...profile.mustVisit.slice(0, 2)); // Top 2 from each
        budgetSum += profile.budget.daily;
      }
    });

    hybrid.avgBudget = Math.round(budgetSum / profileKeys.length);

    return hybrid;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.TravelerProfiles = new TravelerProfiles();
  console.log('👤 Traveler Profiles System loaded!');
}
