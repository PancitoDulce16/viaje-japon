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
        tips: "Sistema de tickets. Llena formulario antes de ordenar. Mejor temprano para evitar fila.",
        coordinates: { lat: 35.6617, lng: 139.7006 },
        nearestStation: "Shibuya Station",
        transportLines: ["JR Yamanote Line", "Tokyo Metro Ginza Line"],
        hours: "24 hours (Shibuya branch)"
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
      },
      {
        name: "Ganso Ramen Yokocho (Sapporo Ramen Alley)",
        city: "Sapporo - Susukino",
        price: 900,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30-40 min",
        rating: 4.5,
        coordinates: { lat: 43.0554, lng: 141.3536 },
        description: "Callejón histórico con ~17 puestos de ramen miso, el estilo que nació en Sapporo.",
        tips: "Prueba el miso ramen con mantequilla y maíz, típico de Hokkaido."
      },
      {
        name: "Ichiran Ramen Sapporo",
        city: "Sapporo",
        price: 1000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.5,
        coordinates: { lat: 43.0618, lng: 141.3545 },
        description: "Misma cadena de Tokyo con cabinas individuales, versión Hokkaido con toque local.",
        tips: "Ideal si viajas solo. Personaliza intensidad del caldo."
      },
      {
        name: "Ichiran Ramen Fukuoka (Original)",
        city: "Fukuoka - Tenjin",
        price: 980,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "25-30 min",
        rating: 4.7,
        coordinates: { lat: 33.5904, lng: 130.4017 },
        description: "La sucursal ORIGINAL de la famosa cadena de tonkotsu ramen - Fukuoka es su ciudad natal.",
        tips: "Caldo tonkotsu clásico de Hakata. Fideos finos, se puede pedir 'kaedama' (porción extra)."
      },
      {
        name: "Hakata Issou",
        city: "Fukuoka - Hakata",
        price: 850,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "20-30 min",
        rating: 4.6,
        coordinates: { lat: 33.5902, lng: 130.4207 },
        description: "Tonkotsu ramen local, muy querido por residentes de Fukuoka. Caldo intenso y cremoso.",
        tips: "Menos turístico que Ichiran, experiencia más auténtica."
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
      },
      {
        name: "Steakland Kobe",
        city: "Kobe - Sannomiya",
        price: 6000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.5,
        coordinates: { lat: 34.6913, lng: 135.1955 },
        description: "Teppanyaki de Kobe beef auténtico a precio relativamente accesible, cortado y cocinado frente a ti.",
        tips: "Sin reserva, aceptan walk-ins. Pide el filete A5 para la experiencia completa."
      },
      {
        name: "Wakkoqu",
        city: "Kobe - Kitano",
        price: 15000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 3,
        duration: "90-120 min",
        rating: 4.8,
        coordinates: { lat: 34.7025, lng: 135.1955 },
        description: "Uno de los restaurantes de Kobe beef más prestigiosos, teppanyaki de alta gama con carne certificada.",
        tips: "Reserva con unos días de anticipación. Splurge que vale la pena para probar el Kobe beef real."
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
      },
      {
        name: "Nakatanidou (Mochi Pounding Show)",
        city: "Nara",
        price: 200,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "20-30 min",
        rating: 4.6,
        coordinates: { lat: 34.6812, lng: 135.8280 },
        description: "Famosa tienda de mochi con show de machacado ultra-rápido (récord Guinness). El mochi recién hecho es delicioso.",
        tips: "El show ocurre varias veces al día, sin horario fijo - si lo ves, detente a mirar."
      },
      {
        name: "Hakuza Kanazawa (Gold Leaf Soft Cream)",
        city: "Kanazawa - Higashi Chaya",
        price: 900,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "20-30 min",
        rating: 4.4,
        coordinates: { lat: 36.5705, lng: 136.6700 },
        description: "Helado suave cubierto con una hoja entera de oro comestible - Kanazawa produce el 99% del oro laminado de Japón.",
        tips: "Foto icónica de Kanazawa. Cómelo con cuidado, la hoja de oro es delicada."
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
      },
      {
        name: "Sekai no Yamachan (Tebasaki)",
        city: "Nagoya - Sakae",
        price: 2500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.5,
        coordinates: { lat: 35.1709, lng: 136.9084 },
        description: "Cadena famosa por tebasaki (alitas de pollo picantes estilo Nagoya), especialidad local imprescindible.",
        tips: "Pide las alitas 'extra' si te gusta más picante. Ambiente ruidoso y divertido."
      },
      {
        name: "Yakitori Ippei",
        city: "Osaka - Namba",
        price: 2500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.5,
        coordinates: { lat: 34.6656, lng: 135.5013 },
        description: "Izakaya local con excelente yakitori y ambiente auténtico cerca de Dotonbori.",
        tips: "Pide el 'omakase' de brochetas para probar variedad. Cash-friendly."
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
        name: "Ryoan-ji Temple",
        city: "Kyoto",
        price: 500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.8,
        description: "Jardín zen de rocas MÁS FAMOSO del mundo. 15 rocas, solo ves 14 desde cualquier ángulo.",
        tips: "Ir temprano para contemplación tranquila. UNESCO. Jardín de estanque también hermoso."
      },
      {
        name: "Sanjusangendo Temple",
        city: "Kyoto",
        price: 600,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45-60 min",
        rating: 4.9,
        description: "1,001 estatuas doradas de Kannon. Hall de madera más largo de Japón (120m). Alucinante.",
        tips: "Cada estatua tiene expresión única. Busca tu rostro entre las 1,001. No fotos adentro."
      },
      {
        name: "Nanzen-ji Temple",
        city: "Kyoto",
        price: 500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.7,
        description: "Templo zen con acueducto de ladrillos. Jardín de rocas Leaping Tiger. Bosque tranquilo.",
        tips: "Acueducto gratis. Jardines internos cuestan. Área Higashiyama cerca. Autumn colors increíbles."
      },
      {
        name: "Tofuku-ji Temple",
        city: "Kyoto",
        price: 600,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.8,
        description: "MEJOR templo para autumn leaves. Puente Tsutenkyo sobre mar de maples. 4 jardines zen.",
        tips: "Noviembre = peak foliage (y multitudes). 4 jardines distintos incluidos. Ir temprano."
      },
      {
        name: "Tenryu-ji Temple",
        city: "Kyoto - Arashiyama",
        price: 500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.7,
        description: "Jardín zen con estanque. Vista de montañas Arashiyama. UNESCO.",
        tips: "Combina con bamboo grove (5 min caminando). Jardín norte gratis, principal cuesta."
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
      },
      {
        name: "Omicho Market",
        city: "Kanazawa",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90-120 min",
        rating: 4.6,
        coordinates: { lat: 36.5680, lng: 136.6547 },
        description: "El mercado de mariscos más grande de Kanazawa, con 300+ años de historia. Puestos de sushi y kaisendon (bowl de mariscos crudos).",
        tips: "Prueba el kaisendon para desayuno/almuerzo. Los cangrejos de Kanazawa son famosos en invierno."
      },
      {
        name: "Nijo Market (Nijo Ichiba)",
        city: "Sapporo",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.4,
        coordinates: { lat: 43.0592, lng: 141.3564 },
        description: "Mercado de mariscos histórico en el centro de Sapporo. Erizo de mar, salmón e ikura (huevas) fresquísimos.",
        tips: "Muchos puestos ofrecen desayuno de mariscos. Mejor visitarlo por la mañana."
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
        name: "Creo-ru Takoyaki (Creole)",
        city: "Osaka - Dotonbori",
        price: 600,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "15-20 min",
        rating: 4.8,
        description: "Takoyaki LEGENDARIO de Osaka. Cremoso por dentro, crujiente afuera. Mejor que Gindaco.",
        tips: "Múltiples locales en Dotonbori. Pedido para llevar popular. 8 bolas ¥600. Prueba original flavor primero."
      },
      {
        name: "Ajinoya Okonomiyaki",
        city: "Osaka - Namba",
        price: 1200,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.7,
        description: "Okonomiyaki estilo Osaka auténtico. Tú lo cocinas en la plancha de tu mesa.",
        tips: "Mix-yaki (mezclado de varios ingredientes) es popular. Staff ayuda si es tu primera vez. Cash only."
      },
      {
        name: "Kani Doraku Dotonbori",
        city: "Osaka - Dotonbori",
        price: 3500,
        currency: "JPY",
        reservationUrl: "https://douraku.co.jp/",
        reserveDays: 3,
        duration: "90 min",
        rating: 4.6,
        description: "Restaurante de cangrejo icónico. Cangrejo gigante mecánico afuera. Multi-cursos de cangrejo.",
        tips: "El cangrejo es LA foto de Dotonbori. Reserva recomendada. Menú set es mejor valor. English menu disponible."
      },
      {
        name: "Ichiran Ramen Dotonbori",
        city: "Osaka - Dotonbori",
        price: 980,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.5,
        description: "Tonkotsu ramen en cabinas individuales. Customiza todo (picante, firmeza, toppings).",
        tips: "24/7 open. Sistema de tickets. Privacidad total. Extra noodles (kaedama) ¥190."
      },
      {
        name: "Yakiniku M Hozenji",
        city: "Osaka - Namba",
        price: 5000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 7,
        duration: "90 min",
        rating: 4.8,
        description: "Yakiniku premium. Wagyu A5 increíble. Calidad Michelin sin el precio Michelin.",
        tips: "Reserva muy recomendada. Omakase course es worth it. Cerca de Hozenji Yokocho (callejón tradicional)."
      },
      {
        name: "Hariju Curry",
        city: "Osaka - Namba",
        price: 900,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.6,
        description: "Curry local de Osaka desde 1973. Espeso, especiado, adictivo. Comfort food japonés.",
        tips: "Beef curry es signature. Porciones generosas. Solo lunch y early dinner. Cash only."
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
      },
      {
        name: "Okonomimura (Okonomiyaki Village)",
        city: "Hiroshima",
        price: 1200,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.6,
        coordinates: { lat: 34.3941, lng: 132.4597 },
        description: "Edificio de 4 pisos con ~25 puestos de okonomiyaki estilo Hiroshima (con fideos yakisoba en capas).",
        tips: "Cada puesto tiene su estilo propio. Pisos 2-4 tienen los locales más auténticos."
      },
      {
        name: "Hassei (Ostras de Miyajima)",
        city: "Hiroshima - Miyajima",
        price: 2000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45-60 min",
        rating: 4.5,
        coordinates: { lat: 34.2977, lng: 132.3200 },
        description: "Especialista en ostras de Miyajima (una de las mejores zonas ostrícolas de Japón) a la parrilla y fritas.",
        tips: "Prueba el kaki-fry (ostra empanizada) y las ostras a la parrilla directo del carbón."
      },
      {
        name: "Atsuta Horaiken (Hitsumabushi)",
        city: "Nagoya",
        price: 4000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.7,
        coordinates: { lat: 35.1280, lng: 136.9082 },
        description: "El restaurante original de hitsumabushi (anguila a la parrilla sobre arroz, servida en 3 estilos), especialidad icónica de Nagoya desde 1873.",
        tips: "Sigue las instrucciones para comerlo en 3 formas distintas - simple, con condimentos, y como ochazuke."
      },
      {
        name: "Komachi-dokoro Shirasuya (Shirasu de Kamakura)",
        city: "Kamakura",
        price: 1800,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45-60 min",
        rating: 4.4,
        coordinates: { lat: 35.3097, lng: 139.5469 },
        description: "Restaurante especializado en shirasu (whitebait), la especialidad marina de Kamakura, cruda o hervida sobre arroz.",
        tips: "Kama-age shirasu-don (recién hervido) es la versión más tradicional y fresca."
      },
      {
        name: "Hatsuhana Soba",
        city: "Hakone - Yumoto",
        price: 1500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45-60 min",
        rating: 4.5,
        coordinates: { lat: 35.2323, lng: 139.1069 },
        description: "Soba (fideos de trigo sarraceno) hecho a mano, ideal después de un día en los onsen de Hakone.",
        tips: "El zaru soba frío es refrescante en verano; el soba caliente en invierno."
      },
      {
        name: "Kamameshi Musashino",
        city: "Nara",
        price: 1800,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45-60 min",
        rating: 4.4,
        coordinates: { lat: 34.6851, lng: 135.8048 },
        description: "Kamameshi (arroz cocido en olla individual con toppings de temporada), plato reconfortante cerca del Parque de Nara.",
        tips: "El arroz se sirve en la misma olla de hierro donde se cocinó - déjalo reposar unos minutos."
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
      },
      {
        name: "Sega Akihabara Building 1",
        city: "Tokyo - Akihabara",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.7,
        description: "Tienda oficial Sega de 5 pisos. Merchandise de Sonic, Persona, Yakuza, Hatsune Miku. Arcade en último piso.",
        tips: "Productos exclusivos de Sega. Crane games con premios oficiales. Tax-free disponible."
      },
      {
        name: "Capcom Store Tokyo",
        city: "Tokyo - Shibuya",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.6,
        description: "Tienda oficial Capcom. Merchandise de Monster Hunter, Resident Evil, Street Fighter, Mega Man.",
        tips: "Productos limitados y exclusivos. Colaboraciones especiales. Dentro de Shibuya PARCO."
      },
      {
        name: "Pokémon Center Mega Tokyo",
        city: "Tokyo - Ikebukuro",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.9,
        description: "Flagship Pokémon Center. El MÁS grande de Japón. Pokémon Cafe en mismo edificio.",
        tips: "Reserva para el café con anticipación. Merchandise exclusivo de Tokyo. Tax-free."
      },
      {
        name: "Anakuma Café",
        city: "Tokyo - Harajuku",
        price: 1500,
        currency: "JPY",
        reservationUrl: "https://anakuma.jp",
        reserveDays: 7,
        duration: "90 min",
        rating: 4.8,
        description: "Café temático de Rilakkuma y San-X characters. Comida kawaii, bebidas decoradas.",
        tips: "REQUIERE RESERVA con anticipación. Límite de tiempo 90min. Menú seasonal."
      },
      {
        name: "Nintendo Store Tokyo",
        city: "Tokyo - Shibuya",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.9,
        description: "Tienda oficial Nintendo en Shibuya PARCO. Merchandise de Mario, Zelda, Animal Crossing, Splatoon. Área de demos de juegos.",
        tips: "Productos exclusivos de Japón. Demo stations para probar juegos nuevos. Tax-free disponible. Suele haber fila los fines de semana."
      },
      {
        name: "Gundam Base Tokyo",
        city: "Tokyo - Odaiba",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.8,
        description: "Tienda oficial Gundam con 7 pisos. Gunpla exclusivos, dioramas gigantes, área de construcción de modelos.",
        tips: "Modelos exclusivos Tokyo limited. Área de construcción gratuita. Estatua Gundam real size afuera (18m). En DiverCity Tokyo Plaza."
      },
      {
        name: "Square Enix Cafe",
        city: "Tokyo - Akihabara",
        price: 2000,
        currency: "JPY",
        reservationUrl: "https://www.jp.square-enix.com/cafe/",
        reserveDays: 14,
        duration: "90 min",
        rating: 4.7,
        description: "Café temático oficial de Square Enix. Menús de Final Fantasy, Dragon Quest, Kingdom Hearts, NieR.",
        tips: "REQUIERE RESERVA online obligatoria. Menú cambia cada temporada. Merchandise exclusivo. Ubicado en Akihabara UDX."
      },
      {
        name: "Kirby Cafe Tokyo",
        city: "Tokyo - Skytree",
        price: 2500,
        currency: "JPY",
        reservationUrl: "https://kirbycafe.jp/",
        reserveDays: 30,
        duration: "90 min",
        rating: 4.9,
        description: "Café oficial de Kirby. Comida ultra kawaii con forma de Kirby. Bebidas, pasteles y menús temáticos.",
        tips: "RESERVA DIFÍCIL - se agotan rápido (1 mes antes). En Tokyo Skytree. Sistema de turnos de 90min. Merchandise exclusivo."
      },
      {
        name: "Nakano Broadway",
        city: "Tokyo - Nakano",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "120-180 min",
        rating: 4.7,
        description: "Centro comercial otaku alternativo a Akihabara. 4 pisos con 20+ tiendas Mandarake. Figuras vintage, manga usado, coleccionables.",
        tips: "Más auténtico que Akihabara. Precios mejores en figuras usadas. Muchas Mandarake especializadas (manga, figuras, cosplay). 5 min de Shinjuku."
      },
      {
        name: "Animate Ikebukuro",
        city: "Tokyo - Ikebukuro",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.6,
        description: "Tienda de anime/manga MÁS GRANDE de Japón. 9 pisos. Anime goods, manga, light novels, doujinshi, CDs.",
        tips: "Flagship store. Piso completo de doujinshi. Eventos de autógrafos frecuentes. Tax-free. Cerca de Pokémon Center Mega Tokyo."
      },
      {
        name: "Mandarake Complex Akihabara",
        city: "Tokyo - Akihabara",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90-120 min",
        rating: 4.7,
        description: "8 pisos de manga, figuras, doujinshi y coleccionables usados. Precios increíbles. Tesoros vintage.",
        tips: "Cada piso tiene especialidad (figuras, manga, retro games, cosplay). Condition rating en productos. Acepta cash y tarjeta."
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
  },

  // HIROSHIMA
  hiroshima: {
    category: "Hiroshima",
    icon: "🕊️",
    color: "gray",
    items: [
      {
        name: "Hiroshima Peace Memorial Park",
        city: "Hiroshima",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 5.0,
        description: "Parque conmemorativo con A-Bomb Dome (UNESCO). Museo de la Paz (¥200). Profundamente conmovedor.",
        tips: "Llega temprano. Museo toma 2hrs. Emocional pero esencial. Gratis excepto museo."
      },
      {
        name: "Miyajima Island Day Trip",
        city: "Hiroshima - Miyajima",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "4-6 horas",
        rating: 5.0,
        description: "Torii flotante icónico. Isla sagrada con templos y venados. UNESCO. Uno de los 3 paisajes más bellos de Japón.",
        tips: "Ferry desde Hiroshima (JR Pass cubre). Ver torii con marea alta Y baja. Oysters frescos increíbles."
      },
      {
        name: "Okonomimura",
        city: "Hiroshima",
        price: 1000,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.7,
        description: "Edificio de 4 pisos con 25 puestos de okonomiyaki estilo Hiroshima. Heaven de comida.",
        tips: "Okonomiyaki Hiroshima = con yakisoba. Piso 2-4 tienen puestos. Cada uno diferente."
      }
    ]
  },

  // FUKUOKA
  fukuoka: {
    category: "Fukuoka",
    icon: "🏮",
    color: "orange",
    items: [
      {
        name: "Yatai Food Stalls",
        city: "Fukuoka",
        price: 1500,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90-120 min",
        rating: 4.9,
        description: "Food stalls callejeros ÚNICOS de Fukuoka. Ramen, yakitori, oden. Experiencia local auténtica.",
        tips: "Nakasu y Tenjin areas. Mejor de noche (7PM-2AM). Hakata ramen es must-try. Asientos limitados."
      },
      {
        name: "Dazaifu Tenmangu Shrine",
        city: "Fukuoka - Dazaifu",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.8,
        description: "Santuario dedicado al dios del aprendizaje. 6000 ciruelos. Arquitectura hermosa.",
        tips: "Umegae mochi (dulce de arroz) en camino. Tren desde Fukuoka 30min. Estudiantes vienen a rezar antes exámenes."
      },
      {
        name: "Canal City Hakata",
        city: "Fukuoka",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.6,
        description: "Shopping mall con canal interior. Shows de fuentes, tiendas, restaurantes, cine. Arquitectura única.",
        tips: "Gratis entrar. Water fountain shows cada hora. Ramen Stadium dentro con 8 famosos ramen shops."
      }
    ]
  },

  // TIENDAS DE ROPA - Con enfoque en temporada/clima
  clothingStores: {
    category: "Clothing & Fashion Stores",
    icon: "👔",
    color: "purple",
    items: [
      // ===== TIENDAS PARA INVIERNO (Ideal para viajes en Febrero) =====
      {
        name: "Uniqlo Flagship Ginza",
        city: "Tokyo - Ginza",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.7,
        description: "Tienda flagship de 12 pisos. ESPECIALIDAD INVIERNO: HeatTech (ropa interior térmica), Ultra Light Down (chamarra ligera y cálida), fleece. Esencial para febrero.",
        tips: "HeatTech Extra Warm es perfecto para febrero. Ultra Light Down se puede comprimir en bolsa pequeña. Precios mejores que en el extranjero. Tax-free disponible.",
        season: "winter",
        bestMonths: ["November", "December", "January", "February", "March"],
        winterProducts: ["HeatTech innerwear", "Ultra Light Down jackets", "Fleece", "Wool sweaters", "Warm leggings"],
        coordinates: { lat: 35.6714, lng: 139.7631 },
        nearestStation: "Ginza Station",
        transportLines: ["Tokyo Metro Ginza Line", "Tokyo Metro Hibiya Line", "Tokyo Metro Marunouchi Line"],
        hours: "11:00 - 21:00"
      },
      {
        name: "GU Harajuku",
        city: "Tokyo - Harajuku",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.5,
        description: "Hermana más barata de Uniqlo. Ropa trendy a precios increíbles. En invierno: Warm Padded (chamarras acolchadas), fleece, sudaderas.",
        tips: "Precios 30-40% más baratos que Uniqlo. Calidad buena para el precio. Stock limitado de tallas populares. 4 pisos de ropa moderna.",
        season: "all-seasons",
        bestMonths: ["All year"],
        winterProducts: ["Warm Padded coats", "Fleece hoodies", "Thermal tights", "Knit sweaters"],
        nearestStation: "Harajuku Station",
        transportLines: ["JR Yamanote Line"],
        hours: "10:00 - 21:00"
      },
      {
        name: "Muji Yurakucho Flagship",
        city: "Tokyo - Yurakucho",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.6,
        description: "Minimalismo japonés. Ropa de alta calidad en materiales naturales. INVIERNO: Lana merino, down jackets, organic cotton inners. Diseño atemporal.",
        tips: "Ropa dura mucho tiempo. Estilo minimalista combina con todo. También venden stationery, muebles, snacks. Tax-free. Flagship tiene 3 pisos.",
        season: "all-seasons",
        bestMonths: ["All year"],
        winterProducts: ["Merino wool sweaters", "Down jackets", "Organic cotton thermals", "Cashmere scarves"],
        coordinates: { lat: 35.6752, lng: 139.7631 },
        nearestStation: "Yurakucho Station",
        transportLines: ["JR Yamanote Line", "Tokyo Metro Yurakucho Line"],
        hours: "10:00 - 21:00"
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
        description: "Icono de moda juvenil femenina. 8 pisos de tendencias japonesas. INVIERNO: Abrigos oversize, botas, accesorios de moda. Estilo kawaii/gyaru.",
        tips: "Solo para chicas. Marcas japonesas únicas no disponibles fuera de Japón. Purikura booths en piso superior. Puede ser abrumador.",
        season: "all-seasons",
        bestMonths: ["All year"],
        winterProducts: ["Oversized coats", "Fashion boots", "Cute scarves", "Kawaii accessories"],
        coordinates: { lat: 35.6617, lng: 139.7006 },
        nearestStation: "Shibuya Station",
        transportLines: ["JR Yamanote Line", "Tokyo Metro Ginza Line"],
        hours: "10:00 - 21:00"
      },
      {
        name: "Beams Harajuku",
        city: "Tokyo - Harajuku",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.6,
        description: "Select shop japonés premium. Mix de marcas internacionales y japonesas. Streetwear sofisticado. Colecciones de temporada curadas.",
        tips: "Varios pisos por género. Precios mid-to-high. Exclusivas japonesas. Staff muy estiloso. Bueno para inspiración de moda.",
        season: "all-seasons",
        bestMonths: ["All year"],
        winterProducts: ["Designer coats", "Streetwear hoodies", "Fashion sneakers", "Premium accessories"],
        nearestStation: "Harajuku Station",
        transportLines: ["JR Yamanote Line"],
        hours: "11:00 - 20:00"
      },
      {
        name: "Workman Plus",
        city: "Multiple locations",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.8,
        description: "¡SECRETO JAPONÉS! Ropa de trabajo técnica a precios increíbles. INVIERNO: Chamarras ultra cálidas, pants impermeables, ropa térmica. Funcional y barato.",
        tips: "MUY popular con locales. Calidad profesional a ¥2000-3000. FieldCore line es trendy. No todos hablan inglés pero no importa.",
        season: "winter",
        bestMonths: ["October", "November", "December", "January", "February", "March"],
        winterProducts: ["Insulated work jackets", "Waterproof pants", "Heat insulation wear", "Winter gloves"],
        nearestStation: "Varies by location",
        hours: "Varies (typically 9:00 - 20:00)"
      },

      // ===== TIENDAS PARA VERANO =====
      {
        name: "Uniqlo AIRism Collection",
        city: "Tokyo - Multiple",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "45 min",
        rating: 4.7,
        description: "Mismas Uniqlo stores, pero en VERANO busca: AIRism (ropa interior que absorbe sudor), UV cut wear, lino. Esencial para calor/humedad japonesa.",
        tips: "AIRism underwear salva vidas en verano. UV cut jackets livianas protegen del sol. Telas breathable. Mayo-Septiembre.",
        season: "summer",
        bestMonths: ["May", "June", "July", "August", "September"],
        summerProducts: ["AIRism underwear", "UV cut jackets", "Linen shirts", "Dry-EX sportswear", "Cooling innerwear"],
        hours: "11:00 - 21:00"
      },
      {
        name: "WEGO Harajuku",
        city: "Tokyo - Harajuku",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.4,
        description: "Fast fashion japonés súper barato. Estilo trendy y colorido. VERANO: Crop tops, shorts, sandalias. INVIERNO: Oversized hoodies, jeans.",
        tips: "Precios desde ¥500. Calidad básica pero fashion. Popular con estudiantes. Muchas ubicaciones en Harajuku.",
        season: "all-seasons",
        bestMonths: ["All year"],
        summerProducts: ["Crop tops", "Denim shorts", "Sandals", "Light dresses"],
        winterProducts: ["Oversized hoodies", "Vintage jeans", "Sneakers"],
        nearestStation: "Harajuku Station",
        hours: "10:00 - 21:00"
      },

      // ===== TIENDAS DE SEGUNDA MANO (¡Tesoros de todas las temporadas!) =====
      {
        name: "2nd Street",
        city: "Multiple cities",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.6,
        description: "Cadena ENORME de segunda mano. Ropa vintage, streetwear, designer usado. Cualquier temporada. Calidad excelente, precios bajos.",
        tips: "Busca Supreme, Nike, Adidas a fracción del precio. Shimokitazawa tiene varias ubicaciones. Condición casi nueva. Tax-free en algunas.",
        season: "all-seasons",
        bestMonths: ["All year"],
        winterProducts: ["Vintage coats", "Designer sweaters", "Retro boots"],
        summerProducts: ["Vintage tees", "Denim", "Sneakers"],
        nearestStation: "Varies by location",
        hours: "11:00 - 21:00 (varies)"
      },
      {
        name: "Bookoff/Mode Off",
        city: "Multiple cities",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60-90 min",
        rating: 4.5,
        description: "Segunda mano organizado como retail. Mode Off sección tiene ropa/accesorios. Precios etiquetados claros. Limpio y ordenado.",
        tips: "Combina con comprar manga/games en Bookoff. Encuentra marcas japonesas baratas. Condición verificada. Sin regateo.",
        season: "all-seasons",
        bestMonths: ["All year"],
        hours: "10:00 - 22:00 (varies)"
      },
      {
        name: "Shimokitazawa Vintage Shops",
        city: "Tokyo - Shimokitazawa",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2-3 horas",
        rating: 4.8,
        description: "DISTRITO COMPLETO de vintage. 100+ tiendas pequeñas. Tesoros únicos. Americano vintage, europeo, japonés retro. TODAS las temporadas.",
        tips: "Dedica medio día. Explora callejones. Chicago, Flamingo, New York Joe Exchange recomendados. Regateo posible en algunas. Cash preferido.",
        season: "all-seasons",
        bestMonths: ["All year"],
        winterProducts: ["Vintage leather jackets", "Wool coats", "Retro sweaters"],
        summerProducts: ["Vintage band tees", "Denim", "Hawaiian shirts"],
        coordinates: { lat: 35.6611, lng: 139.6683 },
        nearestStation: "Shimokitazawa Station",
        transportLines: ["Keio Inokashira Line", "Odakyu Odawara Line"],
        hours: "12:00 - 20:00 (varies by shop)"
      },

      // ===== TIENDAS DE LUJO (Si hay presupuesto) =====
      {
        name: "Isetan Shinjuku",
        city: "Tokyo - Shinjuku",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "2 horas",
        rating: 4.7,
        description: "Department store legendario. Sección de moda es arte. Marcas japonesas premium y diseñadores internacionales. Ropa de calidad suprema.",
        tips: "Tax-free counter en piso 1. Basement food hall (depachika) increíble. Personal servicio impecable. Precios altos pero calidad.",
        season: "all-seasons",
        bestMonths: ["All year"],
        coordinates: { lat: 35.6910, lng: 139.7048 },
        nearestStation: "Shinjuku-sanchome Station",
        transportLines: ["Tokyo Metro Marunouchi Line", "Tokyo Metro Fukutoshin Line"],
        hours: "10:00 - 20:00"
      },
      {
        name: "Dover Street Market Ginza",
        city: "Tokyo - Ginza",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "90 min",
        rating: 4.8,
        description: "Concept store de Comme des Garçons. Avant-garde fashion. Instalaciones artísticas. Para amantes de moda conceptual.",
        tips: "6 pisos de designer fashion. Rei Kawakubo's vision. Precios luxury. Gratis mirar y apreciar el arte. Rose Bakery en piso 6.",
        season: "all-seasons",
        bestMonths: ["All year"],
        coordinates: { lat: 35.6719, lng: 139.7648 },
        nearestStation: "Ginza Station",
        hours: "11:00 - 20:00"
      },

      // ===== TIENDAS ESPECIALIZADAS =====
      {
        name: "Montbell",
        city: "Multiple locations",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.7,
        description: "Outdoor gear japonés. EXCELENTE para invierno: down jackets ultralight, capas base, impermeables. Mejor relación calidad-precio que North Face.",
        tips: "Marca japonesa, mejores precios que en el extranjero. Superior Light Down packs tiny. Garantía lifetime. Shibuya y Shinjuku tienen flagship stores.",
        season: "winter",
        bestMonths: ["October", "November", "December", "January", "February", "March"],
        winterProducts: ["Superior Down jackets", "Base layers", "Waterproof shells", "Insulated gloves", "Fleece"],
        nearestStation: "Varies by location",
        hours: "11:00 - 20:00"
      },
      {
        name: "Tabio Socks",
        city: "Multiple locations",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "30 min",
        rating: 4.6,
        description: "Tienda especializada en CALCETINES. Calidad japonesa increíble. INVIERNO: Wool socks, heat retention. VERANO: Five-finger socks, cooling.",
        tips: "Souvenir único y útil. Made in Japan. Duran años. Muchos estilos. ¥500-2000. Ubicaciones en todos los malls.",
        season: "all-seasons",
        bestMonths: ["All year"],
        winterProducts: ["Merino wool socks", "Heat retention socks", "Tabi socks"],
        summerProducts: ["Five-finger socks", "Cooling socks", "No-show socks"],
        hours: "10:00 - 21:00 (varies)"
      },
      {
        name: "Right-On",
        city: "Multiple locations",
        price: 0,
        currency: "JPY",
        reservationUrl: null,
        reserveDays: 0,
        duration: "60 min",
        rating: 4.4,
        description: "Cadena de jeans y casual wear. Americana casual style. Buenos jeans a precios razonables (¥3000-8000). Todas las temporadas.",
        tips: "Tallas asiáticas más pequeñas. Edwin, Lee, Levi's japonés. Alteraciones gratis. Tax-free disponible.",
        season: "all-seasons",
        bestMonths: ["All year"],
        hours: "10:00 - 21:00"
      }
    ]
  }
};
