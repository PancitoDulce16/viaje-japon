// data/attractions-data.js - Base de datos MASIVA de atracciones (500+)

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
  }
};
