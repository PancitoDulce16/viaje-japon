// data/attractions-data.js - Base de datos MASIVA de atracciones (200+ items)

export const ATTRACTIONS_DATA = {
  // RESTAURANTES - RAMEN
  ramenRestaurants: {
    category: "Ramen Restaurants",
    icon: "🍜",
    color: "orange",
    items: [
      {
        name: "Ichiran Ramen",
        city: "Tokyo - Multiple locations",
        price: 980,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-45 min",
        rating: 4.6,
        description: "Cadena famosa con cabinas individuales. Tonkotsu ramen personalizable. 24hrs en Shibuya.",
        tips: "Sistema de tickets. Llena formulario antes de ordenar. Mejor temprano para evitar fila."
      },
      {
        name: "Afuri Ramen",
        city: "Tokyo - Harajuku",
        price: 1100,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-40 min",
        rating: 4.7,
        description: "Yuzu shio ramen (caldo de sal con cítrico). Ligero y refrescante. Muy popular.",
        tips: "Prueba el tsukemen. Siempre hay fila pero se mueve rápido."
      },
      {
        name: "Ippudo Ramen",
        city: "Tokyo - Multiple",
        price: 1050,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-45 min",
        rating: 4.5,
        description: "Tonkotsu clásico de Hakata. Shiromaru es su especialidad.",
        tips: "Cadena internacional pero de calidad. Roppongi y Shinjuku."
      },
      {
        name: "Mutekiya",
        city: "Tokyo - Ikebukuro",
        price: 850,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "20-30 min",
        rating: 4.8,
        description: "Tonkotsu súper cremoso. Local pequeño, siempre lleno de japoneses.",
        tips: "Efectivo solamente. Fila larga pero vale la pena."
      },
      {
        name: "Tsuta (Michelin Star)",
        city: "Tokyo - Sugamo",
        price: 1200,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-40 min",
        rating: 4.9,
        description: "Primer ramen con estrella Michelin. Shoyu ramen con trufa.",
        tips: "Llegar 30-60 min antes de abrir para conseguir lugar."
      },
      {
        name: "Nakiryu (Michelin Star)",
        city: "Tokyo - Minami-Otsuka",
        price: 1000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "25-35 min",
        rating: 4.9,
        description: "Tantanmen (ramen picante) con estrella Michelin. Increíble.",
        tips: "Solo efectivo. Máquina de tickets. Fila desde temprano."
      }
    ]
  },

  // RESTAURANTES - SUSHI
  sushiRestaurants: {
    category: "Sushi Restaurants",
    icon: "🍣",
    color: "blue",
    items: [
      {
        name: "Sushi Zanmai Tsukiji",
        city: "Tokyo - Tsukiji",
        price: 3000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.7,
        description: "24 horas. Sushi fresco al lado del antiguo mercado. Set omakase accesible.",
        tips: "Abierto 24/7. Mejor horario: 5-7 AM después del mercado."
      },
      {
        name: "Uobei Shibuya Dogenzaka",
        city: "Tokyo - Shibuya",
        price: 2000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45-60 min",
        rating: 4.5,
        description: "Sushi en cinta transportadora con tablets táctiles. Moderno y económico.",
        tips: "¥100-500 por plato. Experiencia divertida y barata."
      },
      {
        name: "Sushi Dai (Tsukiji)",
        city: "Tokyo - Toyosu Market",
        price: 4000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.9,
        description: "¡El mejor sushi del mercado! Fila de 2-3 horas pero INCREÍBLE.",
        tips: "Ir a las 5 AM. La espera vale completamente la pena."
      },
      {
        name: "Genki Sushi",
        city: "Tokyo - Multiple",
        price: 1500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.4,
        description: "Kaiten-zushi (cinta transportadora). Barato y bueno. Cadena.",
        tips: "Sistema de pedido digital. Divertido para niños."
      },
      {
        name: "Kurazushi",
        city: "Tokyo/Osaka - Multiple",
        price: 1200,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "40-50 min",
        rating: 4.3,
        description: "Sushi económico. Gacha system: cada 5 platos vacíos = premio.",
        tips: "Super barato. ¥100-300 por plato. Gamificado."
      }
    ]
  },

  // RESTAURANTES - YAKINIKU & WAGYU
  yakinikuRestaurants: {
    category: "Yakiniku & Wagyu",
    icon: "🥩",
    color: "red",
    items: [
      {
        name: "Yakiniku Jumbo Shirokane",
        city: "Tokyo - Shirokane",
        price: 8000,
        currency: "JPY",
        reservationUrl: "https://yakiniku-jumbo.com/",
        reserveDays: 14,
        duration: "90-120 min",
        rating: 4.9,
        description: "A5 Wagyu omakase. INCREÍBLE. Experiencia de lujo.",
        tips: "Reserva con 2 semanas. Caro pero es el mejor wagyu que probarás."
      },
      {
        name: "Gyu-Kaku",
        city: "Tokyo - Multiple",
        price: 3500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.4,
        description: "Cadena de yakiniku. All-you-can-eat disponible. Buena relación calidad-precio.",
        tips: "Tabehoudai (buffet) por ¥3000-4000. Ubicaciones en todos lados."
      },
      {
        name: "Yoroniku",
        city: "Tokyo - Minami-Aoyama",
        price: 15000,
        currency: "JPY",
        reservationUrl: "https://yoroniku.com/",
        reserveDays: 60,
        duration: "120 min",
        rating: 5.0,
        description: "EL MEJOR yakiniku de Tokyo. Imposible de reservar pero vale cada yen.",
        tips: "Reservas 2 meses antes. Se agotan en segundos. Muy caro pero legendary."
      }
    ]
  },

  // CAFETERÍAS
  cafesAndDesserts: {
    category: "Cafes & Desserts",
    icon: "🍰",
    color: "pink",
    items: [
      {
        name: "% Arabica Kyoto",
        city: "Kyoto - Arashiyama",
        price: 600,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "20-30 min",
        rating: 4.8,
        description: "Café minimalista con vista al río. Instagram-famous. Latte art perfecto.",
        tips: "Vista increíble desde Higashiyama. Siempre hay fila pero rápida."
      },
      {
        name: "Blue Bottle Coffee",
        city: "Tokyo - Multiple",
        price: 700,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "20-30 min",
        rating: 4.6,
        description: "Cadena americana pero calidad top. Ubicaciones trendy.",
        tips: "Shinjuku, Roppongi, Kiyosumi. Menos turístico que Starbucks."
      },
      {
        name: "Harbs Cake",
        city: "Tokyo - Multiple",
        price: 900,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45-60 min",
        rating: 4.7,
        description: "Rebanadas GIGANTES de pastel. Famosos por mille crepe cake.",
        tips: "Porciones enormes. Compartir recomendado. Set de lunch con pastel incluido."
      },
      {
        name: "Pablo Cheese Tart",
        city: "Osaka - Dotonbori",
        price: 450,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "15 min",
        rating: 4.6,
        description: "Cheese tart derretido por dentro. ADICTIVO. Para llevar.",
        tips: "Comer inmediatamente mientras está caliente. Ubicaciones en todo Japón."
      },
      {
        name: "Shibuya Hikarie Cafes",
        city: "Tokyo - Shibuya",
        price: 800,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.5,
        description: "Edificio con 30+ cafés. Matcha everything, pasteles japoneses, etc.",
        tips: "Explora pisos 6-7. Bills (pancakes australianos) es popular."
      },
      {
        name: "Tsujiri Matcha Cafe",
        city: "Kyoto - Multiple",
        price: 850,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-40 min",
        rating: 4.7,
        description: "Matcha parfait legendario. Desde 1860. Auténtico matcha de Uji.",
        tips: "El parfait más famoso: ¥1200. Verde intenso y cremoso."
      }
    ]
  },

  // IZAKAYAS
  izakayas: {
    category: "Izakayas (Pub-style)",
    icon: "🍻",
    color: "orange",
    items: [
      {
        name: "Torikizoku",
        city: "Tokyo/Osaka - Multiple",
        price: 2000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90-120 min",
        rating: 4.5,
        description: "TODO a ¥350 (yakitori, cerveza, etc). SÚPER barato. Experiencia local.",
        tips: "Cash only. Sistema de menú amarillo (todo mismo precio). Llega temprano, se llena."
      },
      {
        name: "Gonpachi Nishi-Azabu",
        city: "Tokyo - Nishi-Azabu",
        price: 4000,
        currency: "JPY",
        reservationUrl: "https://gonpachi.jp/",
        reserveDays: 7,
        duration: "90-120 min",
        rating: 4.6,
        description: "Inspiró escena de Kill Bill. Yakitori y robata. Ambiente increíble.",
        tips: "Reserva recomendada. Prueba el kushiyaki (brochetas)."
      },
      {
        name: "Omoide Yokocho",
        city: "Tokyo - Shinjuku",
        price: 3000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.7,
        description: "Callejón con 60+ tiny izakayas. Post-war vibes. Piss Alley (nombre antiguo).",
        tips: "Explora y elige uno. Yakitori en todos. Cash only. Experiencia auténtica."
      }
    ]
  },

  // ACTIVIDADES GRATIS (EXPANDIDO)
  freeAttractions: {
    category: "FREE Attractions",
    icon: "🆓",
    color: "green",
    items: [
      {
        name: "Tokyo Metropolitan Government Building",
        city: "Tokyo - Shinjuku",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-45 min",
        rating: 4.7,
        description: "Observatorio gratis en piso 45. Vista de 360° de Tokyo. Ver Mt. Fuji en día claro.",
        tips: "Abierto hasta 11 PM. Mejor al atardecer. NO necesita reserva."
      },
      {
        name: "Nara Deer Park",
        city: "Nara",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.9,
        description: "1200+ venados semi-salvajes. Se inclinan pidiendo galletas (¥200). IMPERDIBLE.",
        tips: "Compra shika senbei (galletas) por ¥200. Venados son agresivos si tienes comida."
      },
      {
        name: "Shibuya Crossing",
        city: "Tokyo - Shibuya",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "20-30 min",
        rating: 4.6,
        description: "Cruce peatonal más famoso del mundo. 3000 personas cruzan a la vez.",
        tips: "Mejor vista desde Starbucks 2do piso o Shibuya Sky (gratis si solo ves el cruce)."
      },
      {
        name: "Takeshita Street",
        city: "Tokyo - Harajuku",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45-60 min",
        rating: 4.5,
        description: "Calle kawaii culture. Tiendas coloridas, crepes, cotton candy arcoíris.",
        tips: "Mejor entre semana. Fines de semana está ATASCADO. Instagram heaven."
      },
      {
        name: "Nakamise Shopping Street",
        city: "Tokyo - Asakusa",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-45 min",
        rating: 4.6,
        description: "250m de tiendas tradicionales. Souvenirs, snacks, kimonos. Camino a Senso-ji.",
        tips: "Prueba ningyo-yaki (pastel relleno). Buen lugar para souvenirs."
      },
      {
        name: "Philosopher's Path",
        city: "Kyoto",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.8,
        description: "Caminata de 2km junto a canal. 500 cerezos. Conecta templos.",
        tips: "Mejor en sakura season. Conecta Ginkaku-ji con Nanzen-ji."
      },
      {
        name: "Dotonbori",
        city: "Osaka",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.7,
        description: "Distrito de neones y comida. Glico Running Man sign icónico. Nightlife.",
        tips: "Mejor de noche con luces. Street food everywhere. Takoyaki y okonomiyaki."
      },
      {
        name: "Arashiyama Bamboo Grove",
        city: "Kyoto - Arashiyama",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-45 min",
        rating: 4.8,
        description: "Bosque de bambú gigante. Camino de 500m. Surreal y hermoso.",
        tips: "IR TEMPRANO (6-7 AM). Después de 9 AM está lleno de turistas. Gratis."
      },
      {
        name: "Yoyogi Park",
        city: "Tokyo - Harajuku",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-120 min",
        rating: 4.5,
        description: "Parque enorme. Picnics, performers, rockabilly dancers domingos.",
        tips: "Domingo en la mañana = performers y músicos. Conecta con Meiji Shrine."
      },
      {
        name: "Odaiba Beach & Statue of Liberty",
        city: "Tokyo - Odaiba",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90-120 min",
        rating: 4.4,
        description: "Playa artificial, réplica de Estatua de Libertad, Rainbow Bridge view.",
        tips: "Mejor al atardecer. teamLab está cerca. DiverCity Tokyo Plaza tiene Gundam gigante."
      },
      {
        name: "Harajuku Takeshita Street",
        city: "Tokyo - Harajuku",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.6,
        description: "Epicentro kawaii culture. Tiendas coloridas, crepes gigantes, fashion statements.",
        tips: "Mejor entre semana (fines de semana está ATASCADO). Instagram heaven."
      },
      {
        name: "Shibuya Sky (Rooftop gratis)",
        city: "Tokyo - Shibuya",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.5,
        description: "Rooftop del Shibuya Scramble Square. Vista del cruce sin pagar.",
        tips: "El observatorio cuesta, pero el rooftop del centro comercial es gratis."
      },
      {
        name: "Tokyo Station (Arquitectura)",
        city: "Tokyo",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-45 min",
        rating: 4.5,
        description: "Estación histórica restaurada. Fachada de ladrillo rojo hermosa.",
        tips: "Toma fotos desde Marunouchi South Exit. Character Street dentro."
      },
      {
        name: "Ueno Park",
        city: "Tokyo - Ueno",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.7,
        description: "Parque enorme. Santuarios, estanques, artistas callejeros. 1000 cerezos.",
        tips: "Sakura season es espectacular. Zoo está dentro (ese sí cuesta)."
      },
      {
        name: "Yasukuni Shrine",
        city: "Tokyo - Chiyoda",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45-60 min",
        rating: 4.3,
        description: "Santuario shintoista con jardines japoneses hermosos.",
        tips: "Polémico por historia. Respeta el espacio. Cherry blossoms en primavera."
      },
      {
        name: "Hama-Rikyu Gardens (Exteriores)",
        city: "Tokyo - Chuo",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.4,
        description: "Jardín tradicional con vista de Skytree. Entrada cuesta, pero alrededores gratis.",
        tips: "Camina por el perímetro. Vista hermosa del puente."
      },
      {
        name: "Tokyo International Forum",
        city: "Tokyo - Yurakucho",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.5,
        description: "Arquitectura moderna espectacular. Techo de vidrio masivo.",
        tips: "Entra a ver la estructura. Eventos gratis a veces. Cafeterías dentro."
      },
      {
        name: "Shimokitazawa District",
        city: "Tokyo",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.7,
        description: "Barrio hipster. Vintage shops, teatros, cafeterías indie. Bohemio.",
        tips: "Explora callejones. Thrift stores increíbles. Ambiente relajado."
      },
      {
        name: "Kappabashi Street (Kitchen Town)",
        city: "Tokyo - Asakusa",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.5,
        description: "Calle de utensilios de cocina. Plastic food displays famosos.",
        tips: "Compra souvenirs únicos. Mejores cuchillos japoneses. Caminar es gratis."
      },
      {
        name: "Nezu Shrine",
        city: "Tokyo - Bunkyo",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.6,
        description: "Santuario con túnel de torii rojos. Menos turistas que Fushimi Inari.",
        tips: "Festival de azaleas en abril-mayo. Muy fotogénico."
      },
      {
        name: "Kagurazaka District",
        city: "Tokyo - Shinjuku",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.5,
        description: "Barrio con vibe francés-japonés. Calles empedradas, tiendas artesanales.",
        tips: "Mejor para caminar de noche. Restaurantes románticos (esos sí cuestan)."
      },
      {
        name: "Sumida River Walk",
        city: "Tokyo - Sumida",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.4,
        description: "Paseo junto al río. Vista de Skytree, puentes, barcos.",
        tips: "Desde Asakusa hasta Skytree. Sakura trees a lo largo del camino."
      },
      {
        name: "Nakano Broadway",
        city: "Tokyo - Nakano",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90-120 min",
        rating: 4.6,
        description: "Centro comercial otaku. Manga, anime, figures, vintage toys.",
        tips: "Menos turístico que Akihabara. Mejores precios. 4 pisos de tesoros."
      },
      {
        name: "Kyu-Shiba-rikyu Gardens",
        city: "Tokyo - Minato",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.3,
        description: "Jardín tradicional con estanque. Oasis en medio de rascacielos.",
        tips: "Menos conocido que otros jardines. Más tranquilo."
      },
      {
        name: "Ginza Sony Park",
        city: "Tokyo - Ginza",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-45 min",
        rating: 4.2,
        description: "Parque urbano subterráneo. Instalaciones temporales, eventos.",
        tips: "Cambia regularmente. Revisa qué hay antes de ir."
      },
      {
        name: "Toden Arakawa Line (Sakura Tram)",
        city: "Tokyo",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "Ride completo",
        rating: 4.5,
        description: "Tranvía retro. Único streetcar en Tokyo. Atraviesa barrios locales.",
        tips: "Cuesta ¥170 por ride pero vale la pena. Sakura season es mágico."
      },
      {
        name: "Kamakura Beach",
        city: "Kamakura (1hr desde Tokyo)",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-4 horas",
        rating: 4.6,
        description: "Playa bonita con vista del Monte Fuji en días claros.",
        tips: "Combina con templos de Kamakura. Surfistas en verano."
      },
      {
        name: "Sanja Matsuri Festival (Mayo)",
        city: "Tokyo - Asakusa",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "Evento de 3 días",
        rating: 5.0,
        description: "UNO DE LOS FESTIVALES MÁS GRANDES. 2 millones de personas. Mikoshi parade.",
        tips: "Tercer fin de semana de mayo. GRATIS. Llega temprano."
      },
      {
        name: "Kyoto Imperial Palace",
        city: "Kyoto",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.7,
        description: "Palacio imperial con jardines hermosos. Tours guiados gratis.",
        tips: "Reserva online. Tours en inglés disponibles. Jardines abiertos sin reserva."
      },
      {
        name: "Fushimi Inari Night Walk",
        city: "Kyoto",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 5.0,
        description: "Caminar Fushimi Inari de NOCHE. Menos gente, mágico, iluminado.",
        tips: "Abierto 24/7. Ir después de 6 PM. Lleva linterna. EXPERIENCIA Única."
      },
      {
        name: "Kamogawa River Walk",
        city: "Kyoto",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.6,
        description: "Paseo romántico junto al río. Parejas everywhere. Cherry blossoms.",
        tips: "De día o noche. Restaurantes kawayuka en verano (esos sí cuestan)."
      },
      {
        name: "Pontocho Alley",
        city: "Kyoto",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.7,
        description: "Callejón estrecho con casas tradicionales. Distrito geisha.",
        tips: "Caminar es gratis. Restaurantes caros pero la atmósfera es increíble."
      },
      {
        name: "Yasaka Shrine",
        city: "Kyoto",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.5,
        description: "Santuario colorido. Puerta de entrada a Gion. Iluminado de noche.",
        tips: "Conecta Gion con Maruyama Park. Night lighting espectacular."
      },
      {
        name: "Nijo Castle (Exteriores)",
        city: "Kyoto",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.3,
        description: "Castillo con murallas impresionantes. Entrada cuesta pero exteriores gratis.",
        tips: "Camina alrededor. Moat con koi fish. Arquitectura hermosa."
      },
      {
        name: "Osaka Castle Park",
        city: "Osaka",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90-120 min",
        rating: 4.7,
        description: "Parque enorme alrededor del castillo. Entrar al castillo cuesta, parque gratis.",
        tips: "3000 cerezos en primavera. Vista del castillo gratis. Picnic spot."
      },
      {
        name: "Shinsekai District",
        city: "Osaka",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.5,
        description: "Barrio retro con Torre Tsutenkaku. Old-school Osaka vibes.",
        tips: "Caminar es gratis. Kushikatsu restaurants (esos sí cuestan). Fotos increíbles."
      },
      {
        name: "Amerikamura (American Village)",
        city: "Osaka",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.4,
        description: "Distrito juvenil. Street art, vintage shops, hip hop culture.",
        tips: "Estatua de Libertad pequeña. Tatuaje shops. Youth fashion."
      },
      {
        name: "Tenjinbashisuji Shopping Street",
        city: "Osaka",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.6,
        description: "Calle comercial MÁS LARGA de Japón. 2.6 km cubierto.",
        tips: "Atmosphere local. Menos turístico. Precios razonables."
      },
      {
        name: "Todaiji Temple Night Walk",
        city: "Nara",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.7,
        description: "Caminar por Nara Park de noche. Venados durmiendo, templo iluminado.",
        tips: "Entrada al templo cuesta de día. Exteriores gratis siempre. Mágico de noche."
      }
    ]
  },

  // OBSERVATORIOS
  observatories: {
    category: "Observatories & Sky Views",
    icon: "🌃",
    color: "indigo",
    items: [
      {
        name: "Tokyo Skytree",
        city: "Tokyo - Sumida",
        price: 3100,
        currency: "JPY",
        reservationUrl: "https://www.tokyo-skytree.jp/en/",
        reserveDays: 14,
        duration: "60-90 min",
        rating: 4.7,
        description: "Torre más alta de Japón (634m). Vista increíble 360°. Tembo Galleria extra.",
        tips: "Compra fast pass skip-the-line. Mejor al atardecer para ver día y noche."
      },
      {
        name: "Shibuya Sky",
        city: "Tokyo - Shibuya",
        price: 2200,
        currency: "JPY",
        reservationUrl: "https://www.shibuya-scramble-square.com/sky/",
        reserveDays: 7,
        duration: "45-60 min",
        rating: 4.8,
        description: "Rooftop abierto piso 47. Hamaca en el cielo. Vista de Shibuya Crossing.",
        tips: "Reserva online con descuento. Sunset es mágico. Menos turístico que Skytree."
      },
      {
        name: "Tokyo Tower",
        city: "Tokyo - Minato",
        price: 1200,
        currency: "JPY",
        reservationUrl: "https://www.tokyotower.co.jp/en/",
        reserveDays: 0,
        duration: "45-60 min",
        rating: 4.5,
        description: "Torre icónica inspirada en Eiffel. 150m o 250m deck. Iluminada de noche.",
        tips: "Más barato que Skytree. Retro vibes. De noche es hermosa iluminada."
      },
      {
        name: "Umeda Sky Building",
        city: "Osaka",
        price: 1500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.6,
        description: "Rooftop 360° en edificio futurista. Floating Garden Observatory.",
        tips: "Escalera mecánica atraviesa el vacío (scary cool). Sunset recomendado."
      },
      {
        name: "Kyoto Tower",
        city: "Kyoto",
        price: 800,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-45 min",
        rating: 4.3,
        description: "Vista de Kyoto desde 100m. Frente a Kyoto Station.",
        tips: "Más bajo que otras torres pero única estructura alta en Kyoto."
      }
    ]
  },

  // DISTRITOS & BARRIOS
  districts: {
    category: "Districts & Neighborhoods",
    icon: "🏙️",
    color: "purple",
    items: [
      {
        name: "Akihabara Electric Town",
        city: "Tokyo",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-4 horas",
        rating: 4.8,
        description: "Distrito otaku. Anime, manga, arcades, electrónicos, maid cafes. Paraíso geek.",
        tips: "Visita Mandarake (8 pisos manga/anime), arcades Sega, Radio Kaikan."
      },
      {
        name: "Shimokitazawa",
        city: "Tokyo",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.7,
        description: "Barrio hipster. Vintage shops, teatros, cafés indie, música en vivo.",
        tips: "Explora callejones. Thrift stores increíbles. Ambiente bohemio."
      },
      {
        name: "Gion District",
        city: "Kyoto",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "1-2 horas",
        rating: 4.9,
        description: "Distrito geisha. Calles tradicionales, casas de té, posible ver geishas al atardecer.",
        tips: "Mejor 5-7 PM para ver geishas yendo a trabajo. Respeta: no fotos directas."
      },
      {
        name: "Yanaka Ginza",
        city: "Tokyo",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.6,
        description: "Barrio old-Tokyo. Shitamachi vibes. Tiendas locales, templos, gatos everywhere.",
        tips: "Sube Yuyake Dandan stairs al atardecer. Área sobrevivió WW2."
      },
      {
        name: "Denden Town",
        city: "Osaka",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.5,
        description: "Akihabara de Osaka. Electrónicos, anime, maid cafes, arcades.",
        tips: "Menos turístico que Akihabara. Precios similares."
      }
    ]
  },

  // EXPERIENCIAS ÚNICAS
  uniqueExperiences: {
    category: "Unique Experiences",
    icon: "🎭",
    color: "pink",
    items: [
      {
        name: "Mario Kart Street Racing",
        city: "Tokyo - Shibuya/Akihabara",
        price: 8000,
        currency: "JPY",
        reservationUrl: "https://maricar.com/",
        reserveDays: 7,
        duration: "60-90 min",
        rating: 4.8,
        description: "¡Conduce go-karts disfrazado por calles de Tokyo! Cruzas Shibuya, Rainbow Bridge.",
        tips: "Licencia internacional requerida. Super divertido. Reserva anticipada."
      },
      {
        name: "Robot Restaurant",
        city: "Tokyo - Shinjuku",
        price: 8000,
        currency: "JPY",
        reservationUrl: "https://www.shinjuku-robot.com/",
        reserveDays: 14,
        duration: "90 min",
        rating: 4.5,
        description: "Show de robots, neones, y música. Experiencia LOCA. Muy japones-weird.",
        tips: "Caro pero único. No es sobre comida, es el show. Sensory overload."
      },
      {
        name: "Samurai & Ninja Experience",
        city: "Tokyo/Kyoto - Multiple",
        price: 5000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 3,
        duration: "60-90 min",
        rating: 4.6,
        description: "Aprende técnicas de samurai o ninja. Fotos con armadura. Interactivo.",
        tips: "Varias compañías. Kyoto Samurai & Ninja Museum es popular."
      },
      {
        name: "Onsen (Hot Springs)",
        city: "Hakone/Kinosaki/Multiple",
        price: 1500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-120 min",
        rating: 4.9,
        description: "Baños termales japoneses. Separados por género. Desnudos. Experiencia cultural.",
        tips: "Oedo Onsen Tokyo (temático), Hakone (tradicional). NO tatuajes visibles."
      },
      {
        name: "Kimono Rental",
        city: "Kyoto/Tokyo - Multiple",
        price: 3500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 1,
        duration: "Día completo",
        rating: 4.7,
        description: "Renta kimono/yukata todo el día. Incluye vestido y accesorios. Fotos en templos.",
        tips: "Kyoto es THE place. Yumeyakata y Okamoto populares. ¥3000-5000."
      },
      {
        name: "Karaoke (Private Room)",
        city: "Tokyo/Osaka - Multiple",
        price: 1500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90-120 min",
        rating: 4.8,
        description: "Karaoke en cuarto privado. All-you-can-drink disponible. Experiencia must.",
        tips: "Chains: Karaoke Kan, Big Echo, Shidax. Nomihoudai (bebidas ilimitadas) +¥1000."
      }
    ]
  },

  // ARCADES & ENTRETENIMIENTO
  arcadesEntertainment: {
    category: "Arcades & Entertainment",
    icon: "🎮",
    color: "blue",
    items: [
      {
        name: "Round1 Stadium",
        city: "Tokyo - Multiple",
        price: 2000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-4 horas",
        rating: 4.7,
        description: "Mega arcade: bowling, karaoke, crane games, arcade games, batting cages, basketball.",
        tips: "Múltiples pisos. Shibuya, Ikebukuro. All-in-one entretenimiento."
      },
      {
        name: "Taito Station",
        city: "Tokyo - Multiple",
        price: 1000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "1-2 horas",
        rating: 4.6,
        description: "Cadena de arcades. Crane games (UFO catcher), rhythm games, fighting games.",
        tips: "Akihabara tiene el más grande. Crane games: ¥100-200 por intento."
      },
      {
        name: "VR Zone Shinjuku",
        city: "Tokyo - Shinjuku",
        price: 4400,
        currency: "JPY",
        reservationUrl: "https://vrzone-pic.com/",
        reserveDays: 3,
        duration: "120 min",
        rating: 4.5,
        description: "VR experiences: Dragon Ball, Mario Kart, Horror, etc. High-tech.",
        tips: "Precio incluye múltiples experiencias. Reserva online."
      },
      {
        name: "Joypolis (Sega)",
        city: "Tokyo - Odaiba",
        price: 4500,
        currency: "JPY",
        reservationUrl: "https://tokyo-joypolis.com/",
        reserveDays: 0,
        duration: "3-4 horas",
        rating: 4.4,
        description: "Indoor theme park de Sega. Coasters, VR, simuladores, arcade.",
        tips: "Pass de 1 día con atracciones ilimitadas. Menos crowded que Disney."
      }
    ]
  },

  // MERCADOS
  markets: {
    category: "Markets & Food Halls",
    icon: "🏪",
    color: "orange",
    items: [
      {
        name: "Toyosu Fish Market",
        city: "Tokyo",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.6,
        description: "Nuevo mercado de pescado (reemplazó Tsukiji). Tuna auction viewing 5:30 AM.",
        tips: "Galería de observación gratis. Tuna auction requiere reserva online. Cerrado domingos."
      },
      {
        name: "Nishiki Market",
        city: "Kyoto",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90-120 min",
        rating: 4.7,
        description: "400m de callejón con 100+ tiendas de comida. 'Cocina de Kyoto'. Samples everywhere.",
        tips: "Mejor 10 AM-4 PM. Prueba tsukemono (pickles), tofu, matcha. No comer mientras caminas."
      },
      {
        name: "Kuromon Market",
        city: "Osaka",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90-120 min",
        rating: 4.6,
        description: "170 puestos. Mariscos frescos, carne Kobe, frutas, street food. 'Cocina de Osaka'.",
        tips: "Desayuna aquí. Scallops a la parrilla, uni, fugu. Precios razonables."
      },
      {
        name: "Ameya-Yokocho Market",
        city: "Tokyo - Ueno",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.5,
        description: "Mercado callejero post-WW2. Ropa, snacks, mariscos, cosméticos. Caótico.",
        tips: "Regateo aceptado. Ambiente local. Paralelo a la vía del tren."
      }
    ]
  },

  // MAID & THEMED CAFES
  maidAndThemedCafes: {
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
        description: "El maid cafe más famoso. Shows, juegos, menú kawaii.",
        tips: "No reserva necesaria. Mejor entre semana. Fotos con maids +¥500."
      },
      {
        name: "Maidreamin",
        city: "Tokyo - Multiple",
        price: 1800,
        currency: "JPY",
        reservationUrl: "https://maidreamin.com/",
        reserveDays: 0,
        duration: "60 min",
        rating: 4.3,
        description: "Cadena grande. Performances y menú temático.",
        tips: "Akihabara, Shibuya, Ikebukuro. Concepto similar a @home."
      },
      {
        name: "Butler Cafe Swallowtail",
        city: "Tokyo - Ikebukuro",
        price: 2000,
        currency: "JPY",
        reservationUrl: "https://butlers-cafe.jp/",
        reserveDays: 7,
        duration: "90 min",
        rating: 4.7,
        description: "Butler cafe (versión masculina). Para audiencia femenina principalmente.",
        tips: "Reserva recomendada. Ambiente victoriano. Servicio impecable."
      },
      {
        name: "Vampire Cafe",
        city: "Tokyo - Ginza",
        price: 3500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 3,
        duration: "90 min",
        rating: 4.4,
        description: "Themed cafe gótico. Decoración de castillo, comida en platos de sangre.",
        tips: "Experiencia única. Caro pero atmósfera increíble. Reserva recomendada."
      },
      {
        name: "Kawaii Monster Cafe",
        city: "Tokyo - Harajuku",
        price: 2000,
        currency: "JPY",
        reservationUrl: "https://kawaiimonster.jp/",
        reserveDays: 0,
        duration: "90 min",
        rating: 4.6,
        description: "Cafe psychedelic kawaii. Colores neón, shows de dancers, comida arcoíris.",
        tips: "Producido por Sebastian Masuda (diseñador de Kyary Pamyu Pamyu)."
      }
    ]
  },

  // ANIMAL CAFES
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
        description: "Erizos adorables. Puedes cargarlos. Muy popular.",
        tips: "RESERVA 1 SEMANA ANTES. Se agota rápido. Experiencia única."
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
        description: "Búhos de diferentes especies. Relajante y único.",
        tips: "Solo efectivo. Reserva 2 semanas antes. No flash en fotos."
      },
      {
        name: "Cat Cafe Mocha",
        city: "Tokyo - Multiple",
        price: 1200,
        currency: "JPY",
        reservationUrl: "https://catmocha.jp/",
        reserveDays: 0,
        duration: "Ilimitado",
        rating: 4.4,
        description: "Cadena limpia con muchos gatos. Precio por hora.",
        tips: "Shibuya, Harajuku, Akihabara. Bebidas gratis incluidas."
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
        description: "Conejos que puedes cargar y alimentar.",
        tips: "Walk-in. Mejor temprano. Conejos más activos en mañana."
      },
      {
        name: "Capybara Cafe",
        city: "Tokyo - Kichijoji",
        price: 1500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "40 min",
        rating: 4.5,
        description: "¡Capibaras! El roedor más grande y amigable.",
        tips: "Pequeño café. Máximo 6 personas. Ir temprano o reservar por teléfono."
      },
      {
        name: "Otter Cafe Harry",
        city: "Tokyo - Harajuku",
        price: 2500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 14,
        duration: "30 min",
        rating: 4.9,
        description: "Nutrias juguetonas. SUPER raro y adorable.",
        tips: "Caro pero vale la pena. Reserva MUY anticipada. Interacción estrecha."
      }
    ]
  },

  // PARQUES TEMÁTICOS
  themeParks: {
    category: "Theme Parks",
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
        description: "Parque Disney más visitado del mundo. Único con área Frozen.",
        tips: "Compra online 2 meses antes. App para FastPass digital. Mejor entre semana."
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
        description: "ÚNICO EN EL MUNDO. Parque temático del mar. Fantasy Springs nuevo 2024.",
        tips: "Mejor que Disneyland según fans. Tower of Terror, Journey to Center of Earth."
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
        description: "Super Nintendo World, Harry Potter, Minions. INCREÍBLE.",
        tips: "Express Pass RECOMENDADO (¥7000-12000). Nintendo World necesita timed entry."
      },
      {
        name: "Sanrio Puroland",
        city: "Tokyo - Tama",
        price: 3600,
        currency: "JPY",
        reservationUrl: "https://en.puroland.jp/",
        reserveDays: 7,
        duration: "4-5 horas",
        rating: 4.5,
        description: "Hello Kitty theme park INDOOR. Shows musicales kawaii.",
        tips: "Mayormente para niños pero fans adultos van. Weekdays menos crowded."
      },
      {
        name: "Fuji-Q Highland",
        city: "Yamanashi (near Mt. Fuji)",
        price: 6400,
        currency: "JPY",
        reservationUrl: "https://www.fujiq.jp/en/",
        reserveDays: 7,
        duration: "Todo el día",
        rating: 4.7,
        description: "Roller coasters EXTREMOS. Récords mundiales. Vista de Mt. Fuji.",
        tips: "Fujiyama, Takabisha (121° drop), Eejanaika. Para amantes de adrenalina."
      }
    ]
  },

  // TEMPLOS & SANTUARIOS
  templesAndShrines: {
    category: "Temples & Shrines",
    icon: "⛩️",
    color: "red",
    items: [
      {
        name: "Senso-ji Temple",
        city: "Tokyo - Asakusa",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.8,
        description: "Templo más antiguo de Tokyo (628 AD). Puerta Kaminarimon icónica con farol gigante.",
        tips: "Ir temprano (6-7 AM) sin turistas. Omikuji (fortuna) por ¥100."
      },
      {
        name: "Meiji Shrine",
        city: "Tokyo - Harajuku",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.9,
        description: "Santuario shintoista en bosque de 70 hectáreas. Dedicado al Emperador Meiji.",
        tips: "Gratis. Ver bodas shintoistas fines de semana. Barrels de sake donados."
      },
      {
        name: "Fushimi Inari Shrine",
        city: "Kyoto",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 5.0,
        description: "¡10,000 torii rojos! Caminata de 2-4 hrs a la cima. IMPERDIBLE.",
        tips: "Abierto 24/7. Ir temprano (6 AM) o tarde (después 6 PM) para evitar multitudes."
      },
      {
        name: "Kinkaku-ji (Golden Pavilion)",
        city: "Kyoto",
        price: 500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45-60 min",
        rating: 4.9,
        description: "Pabellón cubierto en oro. Reflejo en estanque es icónico. UNESCO.",
        tips: "Mejor con sol (brilla más). No se puede entrar, solo ver. Jardín hermoso."
      },
      {
        name: "Kiyomizu-dera",
        city: "Kyoto",
        price: 400,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.8,
        description: "Templo en colina con terraza de madera sin clavos. Vista espectacular de Kyoto.",
        tips: "Sube temprano. Área Higashiyama muy fotogénica. Santuario de amor Jishu."
      },
      {
        name: "Todai-ji Temple",
        city: "Nara",
        price: 600,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.9,
        description: "Gran Buda de bronce de 15m. Edificio de madera más grande del mundo. UNESCO.",
        tips: "Combina con Nara Deer Park (gratis). Pilar con agujero = buena suerte."
      },
      {
        name: "Itsukushima Shrine",
        city: "Miyajima Island",
        price: 300,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 5.0,
        description: "Torii flotante en el mar. Patrimonio UNESCO. Uno de los 3 paisajes más bellos de Japón.",
        tips: "Visita con marea alta (torii flota) Y baja (puedes caminar). Isla tiene venados también."
      },
      {
        name: "Ginkaku-ji (Silver Pavilion)",
        city: "Kyoto",
        price: 500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.7,
        description: "Jardín zen con arena rastrillada. Philosopher's Path comienza aquí.",
        tips: "Nunca fue plateado. Jardín de musgo hermoso. Menos turístico que Kinkaku-ji."
      },
      {
        name: "Hase-dera Temple",
        city: "Kamakura",
        price: 400,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.6,
        description: "Kannon dorado de 9m. Vista al mar. 2500 hydrangeas en junio.",
        tips: "Combina con Great Buddha. Vista desde terraza espectacular."
      },
      {
        name: "Zenko-ji Temple",
        city: "Nagano",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.7,
        description: "Templo budista del siglo VII. Ceremonia matutina única (6:30 AM).",
        tips: "Túnel oscuro debajo del altar (¥500). Busca la 'llave de paraíso'."
      },
      {
        name: "Tsurugaoka Hachimangu",
        city: "Kamakura",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.5,
        description: "Santuario shintoista principal de Kamakura. Escaleras con vista al mar.",
        tips: "Centro de Kamakura. Buena base para explorar la ciudad."
      },
      {
        name: "Nikko Toshogu Shrine",
        city: "Nikko",
        price: 1300,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.9,
        description: "Mausoleo elaborado del shogun Tokugawa. Oro y colores vibrantes. UNESCO.",
        tips: "Day trip desde Tokyo (2hrs). Ver los 3 monos sabios. Compra combo ticket."
      },
      {
        name: "Atsuta Shrine",
        city: "Nagoya",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.6,
        description: "Segundo santuario más importante. Guarda una de las 3 insignias imperiales.",
        tips: "Prueba kishimen (fideos planos) en el restaurante. Bosque sagrado hermoso."
      },
      {
        name: "Byodo-in Temple",
        city: "Uji (cerca Kyoto)",
        price: 600,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.8,
        description: "Aparece en moneda de ¥10. Phoenix Hall sobre estanque. UNESCO.",
        tips: "Combina con té matcha en Uji. Mejor en otoño o primavera."
      },
      {
        name: "Horyu-ji Temple",
        city: "Nara Prefecture",
        price: 1500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.7,
        description: "Estructuras de madera más antiguas del mundo (607 AD). UNESCO.",
        tips: "Lejos de Nara city pero vale la pena. Tesoros budistas increíbles."
      }
    ]
  },

  // MUSEOS
  museums: {
    category: "Museums & Art",
    icon: "🏛️",
    color: "blue",
    items: [
      {
        name: "teamLab Borderless",
        city: "Tokyo - Azabudai Hills",
        price: 4800,
        currency: "JPY",
        reservationUrl: "https://www.teamlab.art/",
        reserveDays: 30,
        duration: "2-3 horas",
        rating: 5.0,
        description: "Arte digital interactivo ALUCINANTE. Instalaciones que se mueven entre salas.",
        tips: "RESERVA CON ANTICIPACIÓN. Mejor en días de semana. Lleva calcetines."
      },
      {
        name: "teamLab Planets",
        city: "Tokyo - Toyosu",
        price: 3800,
        currency: "JPY",
        reservationUrl: "https://www.teamlab.art/",
        reserveDays: 14,
        duration: "90 min",
        rating: 4.9,
        description: "Caminas por agua. Flores digitales. Experiencia inmersiva.",
        tips: "Diferente a Borderless. Shorts o falda (te mojas). Cierra 2025."
      },
      {
        name: "Ghibli Museum",
        city: "Tokyo - Mitaka",
        price: 1000,
        currency: "JPY",
        reservationUrl: "https://www.ghibli-museum.jp/en/",
        reserveDays: 90,
        duration: "2 horas (slot asignado)",
        rating: 5.0,
        description: "Museo de Studio Ghibli. Totoro, Spirited Away, etc. MÁGICO.",
        tips: "Tickets se agotan en SEGUNDOS. Venta 3 meses antes. Lawson o sitio oficial."
      },
      {
        name: "Tokyo National Museum",
        city: "Tokyo - Ueno",
        price: 1000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.7,
        description: "Museo más grande de Japón. Arte japonés, samurai armor, cerámica.",
        tips: "En Ueno Park. Combina con zoo o otros museos. Audioguía gratis."
      },
      {
        name: "Mori Art Museum",
        city: "Tokyo - Roppongi Hills",
        price: 2000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.6,
        description: "Arte contemporáneo en piso 53. Incluye Tokyo City View observation deck.",
        tips: "Combina museo + observatorio. Abierto hasta 10 PM. Vista nocturna increíble."
      },
      {
        name: "Cup Noodles Museum",
        city: "Yokohama",
        price: 500,
        currency: "JPY",
        reservationUrl: "https://www.cupnoodles-museum.jp/en/",
        reserveDays: 0,
        duration: "90 min",
        rating: 4.7,
        description: "Historia del ramen instantáneo. ¡Crea tu propia cup noodle!",
        tips: "My Cup Noodles Factory ¥500 extra. Divertido para todas las edades."
      },
      {
        name: "Samurai Museum",
        city: "Tokyo - Shinjuku",
        price: 1900,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.5,
        description: "Armaduras, espadas, shows de samurai. Puedes probarte armadura y fotos.",
        tips: "Tours guiados en inglés incluidos. Show de espadas 4 veces al día."
      },
      {
        name: "Tokyo Trick Art Museum",
        city: "Tokyo - Odaiba",
        price: 1000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.4,
        description: "Ilusiones ópticas 3D. Instagram paradise. Interactivo.",
        tips: "Lleva cámara. Combina con Odaiba. Divertido para grupos."
      },
      {
        name: "Kyoto International Manga Museum",
        city: "Kyoto",
        price: 900,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90-120 min",
        rating: 4.6,
        description: "50,000 mangas para leer. Historia del manga. Wall of Manga.",
        tips: "Puedes leer gratis en el césped. Algunos en inglés."
      },
      {
        name: "Osaka Aquarium Kaiyukan",
        city: "Osaka",
        price: 2700,
        currency: "JPY",
        reservationUrl: "https://www.kaiyukan.com/language/eng/",
        reserveDays: 0,
        duration: "2 horas",
        rating: 4.8,
        description: "Uno de los acuarios más grandes del mundo. Tiburón ballena gigante.",
        tips: "Tanque de 9m profundidad. Mejor en días de lluvia. Compra online con descuento."
      },
      {
        name: "Edo-Tokyo Museum",
        city: "Tokyo - Ryogoku",
        price: 600,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2 horas",
        rating: 4.5,
        description: "Historia de Tokyo desde era Edo. Recreaciones a escala real.",
        tips: "Cerrado por renovación hasta 2025. Cerca del Sumo Stadium."
      },
      {
        name: "Hakone Open-Air Museum",
        city: "Hakone",
        price: 1600,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2 horas",
        rating: 4.7,
        description: "Esculturas al aire libre con vista de montañas. Picasso gallery.",
        tips: "Combina con onsen en Hakone. Kids area con estructuras escalables."
      }
    ]
  },

  // VIDA NOCTURNA
  nightlife: {
    category: "Nightlife & Bars",
    icon: "🍺",
    color: "purple",
    items: [
      {
        name: "Golden Gai",
        city: "Tokyo - Shinjuku",
        price: 2000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.8,
        description: "200+ tiny bars (4-8 personas). Cada uno único. Atmosphere único.",
        tips: "Cover charge ¥500-1000. Algunos solo regulares. Mejor después 8 PM."
      },
      {
        name: "Nonbei Yokocho",
        city: "Tokyo - Shibuya",
        price: 2500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2 horas",
        rating: 4.6,
        description: "Callejón estrecho con 40 small bars. Old-school Tokyo vibes.",
        tips: "Menos turístico que Golden Gai. Cash only. Probar varios bars."
      },
      {
        name: "Kabukicho Entertainment District",
        city: "Tokyo - Shinjuku",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.3,
        description: "Red light district. Neones, karaoke, host/hostess clubs. Tokyo nightlife central.",
        tips: "Seguro pero evita calles laterales. Robot Restaurant está aquí."
      },
      {
        name: "Roppongi Hills Nightlife",
        city: "Tokyo - Roppongi",
        price: 3000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "Toda la noche",
        rating: 4.4,
        description: "Clubs internacionales. Expatriates everywhere. Dress code.",
        tips: "V2, Muse popular. Caro. Entrada ¥3000-5000. Hasta 5 AM."
      },
      {
        name: "Hub British Pub",
        city: "Tokyo - Multiple",
        price: 2000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2 horas",
        rating: 4.2,
        description: "Cadena de pubs británicos. Internacional crowd. Sports on TV.",
        tips: "Happy hour 5-8 PM. Inglés hablado. Comida británica."
      },
      {
        name: "Pontocho Jazz Club",
        city: "Kyoto",
        price: 2500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2 horas",
        rating: 4.7,
        description: "Jazz en vivo en callejón tradicional. Intimate atmosphere.",
        tips: "Cover + drink ¥2500-3000. Reserva recomendada. Música en vivo nightly."
      },
      {
        name: "Osaka Dotonbori Nightlife",
        city: "Osaka",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-4 horas",
        rating: 4.7,
        description: "Neones, street food, karaoke bars. Energía 24/7.",
        tips: "Mejor de noche. Drunk salarymen everywhere. Seguro y divertido."
      },
      {
        name: "Bar Benfiddich",
        city: "Tokyo - Shinjuku",
        price: 2000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 7,
        duration: "90 min",
        rating: 4.9,
        description: "Cocktail bar artesanal. Hierbas frescas, mortero. Top 50 bars del mundo.",
        tips: "Reserva recomendada. Íntimo. Bartender es un artista."
      },
      {
        name: "Womb Shibuya",
        city: "Tokyo - Shibuya",
        price: 3000,
        currency: "JPY",
        reservationUrl: "https://www.womb.co.jp/",
        reserveDays: 0,
        duration: "Hasta 5 AM",
        rating: 4.6,
        description: "Mega club techno/house. DJs internacionales. 4 pisos.",
        tips: "Viernes-sábado hasta 5 AM. Dress code semi-formal. Ladies free a veces."
      }
    ]
  },

  // NATURALEZA & OUTDOORS
  natureOutdoors: {
    category: "Nature & Outdoors",
    icon: "🏔️",
    color: "green",
    items: [
      {
        name: "Mount Fuji Hiking",
        city: "Yamanashi/Shizuoka",
        price: 2000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 30,
        duration: "2 días (con overnight)",
        rating: 5.0,
        description: "Escalar Monte Fuji (3776m). Ver sunrise desde la cima. Bucket list.",
        tips: "Solo julio-septiembre. Reserva hut en advance. Bring warm clothes."
      },
      {
        name: "Hakone Ropeway",
        city: "Hakone",
        price: 1550,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min ride",
        rating: 4.7,
        description: "Teleférico sobre valle volcánico Owakudani. Vista de Mt. Fuji y azufre.",
        tips: "Parte del Hakone Free Pass. Compra huevos negros (hervidos en azufre)."
      },
      {
        name: "Jigokudani Monkey Park",
        city: "Nagano",
        price: 800,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.9,
        description: "¡Monos de nieve en onsen! Único en el mundo. ADORABLES.",
        tips: "Mejor en invierno con nieve. Caminata de 30 min desde parking. Bring snacks."
      },
      {
        name: "Shirakawa-go Village",
        city: "Gifu Prefecture",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "3-4 horas",
        rating: 4.9,
        description: "Pueblo histórico con casas gassho-zukuri (techo de paja). UNESCO. Como cuento de hadas.",
        tips: "Mejor en invierno con nieve. Stay overnight en farmhouse. Illumination en febrero."
      },
      {
        name: "Takachiho Gorge",
        city: "Miyazaki Prefecture",
        price: 4100,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.8,
        description: "Cañón con acantilados volcánicos. Remar en bote bajo cascada. Surreal.",
        tips: "Alquiler de bote ¥4100 (30 min). Ir temprano para evitar fila."
      },
      {
        name: "Kumano Kodo Pilgrimage",
        city: "Wakayama/Mie",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "1-7 días",
        rating: 4.9,
        description: "Antigua ruta de peregrinaje por montañas. Bosques sagrados, santuarios. UNESCO.",
        tips: "Nakahechi route popular (2-3 días). Stay en minshuku. Sello en cada templo."
      },
      {
        name: "Aogashima Island",
        city: "Tokyo Islands",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 7,
        duration: "2-3 días",
        rating: 4.7,
        description: "Isla volcánica remota. Población 170. Estrellas increíbles. Off the beaten path.",
        tips: "Solo ferry o helicóptero. Reservar acomodo antes. Adventure travel."
      },
      {
        name: "Kawachi Fuji Gardens",
        city: "Fukuoka",
        price: 1000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.9,
        description: "Túneles de wisteria moradas. Como Avatar. Solo finales abril-mayo.",
        tips: "SOLO en wisteria season. Advance ticket online. Fotografía espectacular."
      },
      {
        name: "Hitachi Seaside Park",
        city: "Ibaraki",
        price: 450,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.8,
        description: "Flores todo el año. Nemophila azules (mayo), kokia rojos (octubre).",
        tips: "Diferentes flores cada temporada. Alquila bici. Instagram famous."
      },
      {
        name: "Matsumoto Castle",
        city: "Nagano - Matsumoto",
        price: 700,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.7,
        description: "Castillo negro original (1590s). Uno de los 12 castillos originales. Con foso.",
        tips: "Subir es steep. Vista desde arriba hermosa. Cherry blossoms en primavera."
      }
    ]
  },

  // COMPRAS
  shopping: {
    category: "Shopping Districts",
    icon: "🛍️",
    color: "pink",
    items: [
      {
        name: "Don Quijote (Donki)",
        city: "Tokyo/Osaka - Multiple",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.7,
        description: "Mega tienda discount. TODO: snacks, electrónicos, cosméticos, disfraces. Chaotic.",
        tips: "Abierto 24/7 muchas ubicaciones. Tax-free. Música loud. Experiencia única."
      },
      {
        name: "Shibuya 109",
        city: "Tokyo - Shibuya",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2 horas",
        rating: 4.5,
        description: "Centro comercial de moda femenina. Gyaru fashion. Tendencias japonesas.",
        tips: "8 pisos. Marcas japonesas únicas. Purikura booths en piso superior."
      },
      {
        name: "Tokyu Hands",
        city: "Tokyo - Multiple",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90-120 min",
        rating: 4.6,
        description: "Todo para hobbies y crafts. Stationery, gadgets, DIY. Tesoro para nerds.",
        tips: "Shibuya tiene 7 pisos. Tax-free. Mejores souvenirs únicos."
      },
      {
        name: "Uniqlo Flagship Ginza",
        city: "Tokyo - Ginza",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.4,
        description: "Tienda flagship de 12 pisos. Todas las líneas. Precios mejores que en occidente.",
        tips: "Heat tech y ultra light down populares. Tax-free. Collaborations exclusivas."
      },
      {
        name: "Daiso (¥100 Shop)",
        city: "Tokyo/Osaka - Multiple",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.3,
        description: "TODO a ¥100 (+ tax). Gadgets, stationery, snacks, skincare. Tesoro.",
        tips: "Harajuku store tiene 4 pisos. Souvenirs baratos. Calidad sorprendentemente buena."
      },
      {
        name: "Pokémon Center Mega Tokyo",
        city: "Tokyo - Ikebukuro",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.8,
        description: "Tienda oficial Pokémon más grande. Merchandise exclusivo de Japón.",
        tips: "Fila en fines de semana. Productos limitados se agotan rápido."
      },
      {
        name: "Nintendo Tokyo",
        city: "Tokyo - Shibuya Parco",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.7,
        description: "Primera tienda oficial Nintendo. Merchandise único. Play areas.",
        tips: "En piso 6 de Shibuya Parco. Productos limitados exclusive a Japón."
      },
      {
        name: "Nakamise Shopping Street",
        city: "Tokyo - Asakusa",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-45 min",
        rating: 4.6,
        description: "250m de tiendas tradicionales. Souvenirs, kimonos, snacks. Camino a Senso-ji.",
        tips: "Regateo NO común. Prueba ningyo-yaki. Souvenirs turísticos pero bonitos."
      },
      {
        name: "Namba Parks",
        city: "Osaka",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2 horas",
        rating: 4.5,
        description: "Centro comercial con rooftop garden de 8 pisos. Arquitectura única.",
        tips: "Jardín escalonado hermoso. Buenas vistas. Combina compras y naturaleza."
      },
      {
        name: "Ginza Six",
        city: "Tokyo - Ginza",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2 horas",
        rating: 4.6,
        description: "Centro comercial de lujo. Marcas premium. Rooftop garden gratis.",
        tips: "Tax-free. Art installations rotan. Tsutaya bookstore en piso 6."
      }
    ]
  },

  // MÁS RESTAURANTES
  moreRestaurants: {
    category: "More Restaurants",
    icon: "🍱",
    color: "orange",
    items: [
      {
        name: "Butagumi Tonkatsu",
        city: "Tokyo - Nishi-Azabu",
        price: 2000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.8,
        description: "MEJOR tonkatsu de Tokyo. Cerdo grueso premium, súper jugoso.",
        tips: "Usa aceite vegetal. Menos grasoso que otros. Fila larga pero rápida."
      },
      {
        name: "Maisen Tonkatsu",
        city: "Tokyo - Aoyama",
        price: 1800,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.7,
        description: "Tonkatsu famoso en casa histórica. Crispy perfecto. Salsa especial.",
        tips: "Baños públicos históricos convertidos en restaurant. Rebanadas gruesas."
      },
      {
        name: "Tonki Tonkatsu",
        city: "Tokyo - Meguro",
        price: 1600,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.6,
        description: "Tonkatsu old-school desde 1939. Counter seating. Aceite de lardo.",
        tips: "Cash only. Tradicional atmosphere. Llega temprano."
      },
      {
        name: "Tsukiji Outer Market",
        city: "Tokyo",
        price: 2000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2 horas",
        rating: 4.8,
        description: "Aunque Tsukiji se movió, outer market sigue. Desayuno de sushi fresco.",
        tips: "Ir temprano (6-8 AM). Street food everywhere. Prueba uni, toro, tamago."
      },
      {
        name: "Okonomiyaki Mizuno",
        city: "Osaka - Dotonbori",
        price: 1300,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.7,
        description: "Okonomiyaki legendario. Desde 1945. Mix perfecto. Fila siempre.",
        tips: "Yam okonomiyaki es especial. Fila de 30-60 min. Cash only."
      },
      {
        name: "Kushikatsu Daruma",
        city: "Osaka - Shinsekai",
        price: 2000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.6,
        description: "Kushikatsu (brochetas fritas). Regla: NO double dipping en salsa.",
        tips: "Cada brocheta ¥100-200. Orden mínimo. Ambiente local."
      },
      {
        name: "Gyukatsu Motomura",
        city: "Tokyo - Multiple",
        price: 1500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-45 min",
        rating: 4.7,
        description: "Katsu de CARNE (no cerdo). Rare por dentro, crujiente afuera. Tú lo cocinas extra.",
        tips: "Shibuya y Shinjuku. Fila corta. Parrilla en mesa para cocinar más."
      },
      {
        name: "Coco Ichibanya Curry",
        city: "Tokyo/Osaka - Multiple",
        price: 800,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.4,
        description: "Curry japonés customizable. Elige nivel de picante y toppings.",
        tips: "Cadena pero delicioso. Level 10 spicy = very spicy. Porciones grandes."
      },
      {
        name: "Kichi Kichi Omurice",
        city: "Kyoto",
        price: 2500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 30,
        duration: "30 min",
        rating: 4.9,
        description: "¡Omurice viral de YouTube! Chef Motokichi. Show cooking.",
        tips: "RESERVA 1 MES ANTES. Solo 1 chef, 1 mesa. Experiencia única."
      }
    ]
  },

  // JARDINES & PARQUES ESPECIALES
  specialGardens: {
    category: "Special Gardens & Parks",
    icon: "🌸",
    color: "green",
    items: [
      {
        name: "Shinjuku Gyoen National Garden",
        city: "Tokyo - Shinjuku",
        price: 500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.9,
        description: "58 hectáreas. Jardín francés, inglés y japonés. 1000+ cerezos. Oasis urbano.",
        tips: "IMPERDIBLE en sakura season. No alcohol permitido. Cierra lunes."
      },
      {
        name: "Gotokuji Temple (Cat Temple)",
        city: "Tokyo - Setagaya",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45-60 min",
        rating: 4.8,
        description: "¡Templo con 1000+ maneki-neko (gatos de la suerte)! Origen del lucky cat.",
        tips: "GRATIS. Compra tu propio maneki-neko. Instagram heaven. Tranquilo."
      },
      {
        name: "KITTE Rooftop Garden",
        city: "Tokyo - Marunouchi",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.5,
        description: "Jardín en rooftop de KITTE. Vista perfecta de Tokyo Station. Gratis.",
        tips: "Acceso desde 6to piso. Mejor al atardecer. Centro comercial abajo."
      }
    ]
  },

  // EXPERIENCIAS HAKONE
  hakoneExperiences: {
    category: "Hakone Experiences",
    icon: "🗻",
    color: "blue",
    items: [
      {
        name: "Hakone Pirate Ship",
        city: "Hakone - Lake Ashi",
        price: 1200,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.7,
        description: "Barco pirata por Lake Ashi. Vista de Mt. Fuji. Parte del Hakone Free Pass.",
        tips: "Mejor en día claro para ver Fuji-san. 3 barcos diferentes (todos piratas)."
      },
      {
        name: "Owakudani Black Eggs",
        city: "Hakone",
        price: 500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.6,
        description: "Valle volcánico activo. Huevos hervidos en azufre (negros). Se dice que añaden 7 años de vida.",
        tips: "Compra 5 huevos por ¥500. Huelen a azufre. Vista increíble desde ropeway."
      },
      {
        name: "Hakone Shrine Torii on Water",
        city: "Hakone",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.8,
        description: "Torii rojo en Lake Ashi. Backdrop de montañas. Muy fotogénico.",
        tips: "Gratis. Camina desde el muelle del pirate ship. Temprano para fotos sin gente."
      }
    ]
  },

  // VEGETARIANO & VEGANO
  veganVegetarian: {
    category: "Vegan & Vegetarian",
    icon: "🥗",
    color: "green",
    items: [
      {
        name: "Ain Soph Journey",
        city: "Tokyo - Shinjuku",
        price: 1800,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.7,
        description: "Vegan burgers gigantes. Pancakes masivos. Instagram-worthy.",
        tips: "Cadena con varias locaciones. Ripley en Shinjuku muy popular."
      },
      {
        name: "Saido (Shojin Ryori)",
        city: "Tokyo - Minato",
        price: 3500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 3,
        duration: "90 min",
        rating: 4.8,
        description: "Comida budista vegana tradicional. Multi-course kaiseki vegetariano.",
        tips: "Reserva recomendada. Experiencia de lujo. Set courses hermosos."
      },
      {
        name: "Nagi Shokudo",
        city: "Tokyo - Shibuya",
        price: 1200,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.6,
        description: "Vegan ramen y comfort food. Barato y delicioso.",
        tips: "100% vegano. Soy meat options. Pequeño pero acogedor."
      },
      {
        name: "T's TanTan (Tokyo Station)",
        city: "Tokyo Station",
        price: 900,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.5,
        description: "¡Vegan ramen DENTRO de Tokyo Station! Tantanmen vegano delicioso.",
        tips: "Perfecto si tienes shinkansen. Pequeño. Dentro de la estación."
      },
      {
        name: "Paprika Shokudo Vegan",
        city: "Kyoto",
        price: 1400,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.7,
        description: "Buffet vegetariano/vegano. All-you-can-eat por tiempo limitado.",
        tips: "Opciones orgánicas. Popular con locales. Llega temprano."
      }
    ]
  },

  // ARCADES & CRANE GAMES
  craneGamesArcades: {
    category: "Crane Games & UFO Catchers",
    icon: "🎪",
    color: "pink",
    items: [
      {
        name: "GiGO Akihabara",
        city: "Tokyo - Akihabara",
        price: 500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.7,
        description: "7 pisos de crane games y arcades. Prizes de anime, figuras, plushies.",
        tips: "Piso 1-2 = crane games. Staff ayuda si estás cerca. ¥100-200 por intento."
      },
      {
        name: "Taito Station Shibuya",
        city: "Tokyo - Shibuya",
        price: 500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.6,
        description: "Crane games con prizes exclusivos. Purikura booths en piso superior.",
        tips: "Mejores chances en máquinas nuevas. Staff puede posicionar prizes."
      },
      {
        name: "Round1 Ikebukuro",
        city: "Tokyo - Ikebukuro",
        price: 1000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.7,
        description: "Mega centro de entretenimiento. Bowling, karaoke, crane games, batting cages.",
        tips: "Discount passes disponibles. Pisos enteros de UFO catchers."
      },
      {
        name: "namco Sunshine City",
        city: "Tokyo - Ikebukuro",
        price: 500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.5,
        description: "Arcade con themed games. Pokémon, One Piece, Demon Slayer prizes.",
        tips: "Dentro de Sunshine City mall. Combina con shopping."
      }
    ]
  },

  // TIENDAS ESPECIALES
  specialStores: {
    category: "Specialty Stores",
    icon: "🏬",
    color: "indigo",
    items: [
      {
        name: "Nintendo Store Kyoto",
        city: "Kyoto",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.8,
        description: "Segunda tienda oficial Nintendo. Merchandise exclusivo de Kyoto.",
        tips: "En downtown Kyoto. Productos regionales únicos. Menos crowded que Tokyo."
      },
      {
        name: "Pokémon Center Shibuya",
        city: "Tokyo - Shibuya",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.7,
        description: "Pokémon Center con diseño único de Shibuya. Productos exclusivos.",
        tips: "Menos grande que Ikebukuro pero productos exclusivos de la región."
      },
      {
        name: "Pokémon Center DX Tokyo",
        city: "Tokyo - Nihonbashi",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.9,
        description: "Flagship Pokémon Center. El MÁS grande. Pokémon Cafe en mismo edificio.",
        tips: "Reserva para el café con anticipación. Merchandise más amplio."
      },
      {
        name: "Jump Shop Shibuya",
        city: "Tokyo - Shibuya",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.6,
        description: "Tienda oficial Shonen Jump. One Piece, Naruto, Dragon Ball, MHA merchandise.",
        tips: "Dentro de Shibuya. Productos limitados rotan. Colaboraciones especiales."
      },
      {
        name: "Jump Shop Tokyo Station",
        city: "Tokyo Station",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.5,
        description: "Jump Shop dentro de Character Street en Tokyo Station.",
        tips: "Combina con otros character shops (Ghibli, Pokémon, etc) en mismo pasillo."
      }
    ]
  },

  // EXPERIENCIAS ESPECIALES
  uniqueVenues: {
    category: "Unique Venues & Experiences",
    icon: "✨",
    color: "purple",
    items: [
      {
        name: "Art Aquarium Museum",
        city: "Tokyo - Nihonbashi",
        price: 2400,
        currency: "JPY",
        reservationUrl: "https://artaquarium.jp/",
        reserveDays: 0,
        duration: "90 min",
        rating: 4.8,
        description: "Goldfish en acuarios artísticos con luces y proyecciones. Arte + acuario.",
        tips: "Mejor de noche. Instalación permanente. Bar dentro. Muy instagrameable."
      },
      {
        name: "Tokyo Character Street",
        city: "Tokyo Station",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.7,
        description: "Pasillo subterráneo con 30+ character shops. Ghibli, Pokémon, Snoopy, Rilakkuma, etc.",
        tips: "Dentro de Tokyo Station. Perfecto antes/después de shinkansen. Tax-free."
      },
      {
        name: "Mega Web Toyota City Showcase",
        city: "Tokyo - Odaiba",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.5,
        description: "Showroom de Toyota. Historia de carros, exhibits interactivos. Gratis.",
        tips: "Test drives disponibles (con licencia). Exhibits de carros clásicos."
      }
    ]
  }
};
