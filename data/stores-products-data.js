// data/stores-products-data.js - Tiendas y productos esenciales para Japón

// 🏪 TIENDAS ESENCIALES
export const ESSENTIAL_STORES = {
  discount: {
    name: "Tiendas de Descuento",
    icon: "🏪",
    stores: [
      {
        id: "donki",
        name: "Don Quijote (ドン・キホーテ)",
        nickname: "Donki",
        description: "El paraíso del shopping. Todo bajo un techo: souvenirs, electrónicos, comida, ropa, cosméticos. Muchas sucursales 24 horas.",
        priceRange: "¥100 - ¥10,000",
        hours: "Mayoría 24h, algunos 10:00-2:00",
        bestFor: ["Souvenirs baratos", "Productos únicos", "Compras nocturnas", "Tax-free shopping"],
        tips: [
          "Precios bajan después de las 11pm",
          "Lleva pasaporte para tax-free (8% descuento)",
          "Busca la canción 'Miracle Shopping' - sabrás que llegaste",
          "App Majica para cupones adicionales"
        ],
        locations: {
          Tokyo: ["Shibuya", "Shinjuku", "Akihabara", "Roppongi", "Asakusa"],
          Osaka: ["Dotonbori", "Namba", "Umeda", "Shinsaibashi"],
          Kyoto: ["Kawaramachi", "Kyoto Station"]
        },
        mustBuy: [
          { item: "Kit Kat sabores raros", price: "¥300-500", why: "Exclusivos de Japón" },
          { item: "Omiyage (souvenirs)", price: "¥500-2000", why: "Variedad enorme" },
          { item: "Cosméticos japoneses", price: "¥800-3000", why: "Más baratos que duty-free" }
        ]
      },
      {
        id: "daiso",
        name: "Daiso (ダイソー)",
        description: "Todo a ¥100 (algunos ¥300-500). Calidad sorprendente para el precio. Perfecto para regalos baratos y artículos prácticos.",
        priceRange: "¥100 - ¥500",
        hours: "10:00-20:00 (varía)",
        bestFor: ["Souvenirs económicos", "Artículos de viaje", "Snacks", "Papelería kawaii"],
        tips: [
          "Sucursales grandes tienen 3-4 pisos",
          "Productos de ¥100 = calidad increíble",
          "No todo es ¥100, revisa etiquetas",
          "Daiso Harajuku = 4 pisos de tesoros"
        ],
        locations: {
          Tokyo: ["Harajuku (4 pisos)", "Shibuya", "Shinjuku", "Ikebukuro"],
          Osaka: ["Namba", "Umeda", "Shinsaibashi"],
          Kyoto: ["Kawaramachi", "Kyoto Station"]
        },
        mustBuy: [
          { item: "Tenugui (toallas decorativas)", price: "¥100", why: "Souvenirs perfectos" },
          { item: "Origami papers", price: "¥100", why: "Diseños japoneses únicos" },
          { item: "Travel size products", price: "¥100", why: "Ahorras espacio en maleta" },
          { item: "Snacks surtidos", price: "¥100", why: "Probar muchos por poco" }
        ]
      },
      {
        id: "3coins",
        name: "3 Coins",
        description: "Todo a ¥300 (algunos ¥500-1000). Productos cute y de buen diseño. Más aesthetic que Daiso.",
        priceRange: "¥300 - ¥1000",
        hours: "10:00-21:00",
        bestFor: ["Regalos bonitos", "Decoración", "Accesorios", "Productos de diseño"],
        tips: [
          "Colaboraciones con personajes populares",
          "Stock limitado en productos populares",
          "Calidad superior a Daiso"
        ],
        locations: {
          Tokyo: ["Harajuku", "Shibuya", "Shinjuku"],
          Osaka: ["Umeda", "Namba"]
        }
      }
    ]
  },

  konbini: {
    name: "Konbini (Convenience Stores)",
    icon: "🏪",
    description: "Tu salvavidas en Japón. Comida 24h, baños limpios, ATM, servicios.",
    stores: [
      {
        id: "7eleven",
        name: "7-Eleven (セブンイレブン)",
        description: "El más común. Excelente comida y café. Gold Standard de konbinis.",
        hours: "24 horas",
        specialty: "Onigiri y bento boxes",
        bestFor: ["Desayuno rápido", "Café decente", "ATM internacional", "Bill payments"],
        mustTry: [
          { item: "Onigiri Tuna Mayo", price: "¥120", rating: 5, desc: "El clásico" },
          { item: "Tamago Sando", price: "¥198", rating: 5, desc: "Sandwich de huevo cremoso" },
          { item: "Chicken Nanban Bento", price: "¥498", rating: 5, desc: "Comida completa" },
          { item: "Melon Pan", price: "¥128", rating: 4, desc: "Pan dulce icónico" },
          { item: "Seven Café", price: "¥100", rating: 4, desc: "Café sorprendentemente bueno" }
        ]
      },
      {
        id: "lawson",
        name: "Lawson (ローソン)",
        description: "Famoso por su pollo frito (Karaage-kun) y postres premium. Lawson 100 = todo ¥100.",
        hours: "24 horas",
        specialty: "Karaage-kun y postres Uchi Café",
        bestFor: ["Fried chicken", "Postres premium", "Lawson 100 (productos ¥100)"],
        mustTry: [
          { item: "Karaage-kun", price: "¥216", rating: 5, desc: "¡IMPERDIBLE! Mejor pollo frito" },
          { item: "Uchi Café Sweets", price: "¥250-350", rating: 5, desc: "Postres nivel pastelería" },
          { item: "Machi Café Latte", price: "¥150", rating: 4, desc: "Competidor de Starbucks" },
          { item: "L-Chiki (pollo)", price: "¥180", rating: 4, desc: "Alternativa a Karaage-kun" },
          { item: "Premium Roll Cake", price: "¥150", rating: 5, desc: "Suave y delicioso" }
        ]
      },
      {
        id: "familymart",
        name: "FamilyMart (ファミリーマート)",
        description: "El más amigable para turistas. Famichiki es legendario. Muchos tienen asientos.",
        hours: "24 horas",
        specialty: "Famichiki (pollo frito)",
        bestFor: ["Comer en el lugar", "Fried chicken", "Variedad internacional"],
        mustTry: [
          { item: "Famichiki", price: "¥180", rating: 5, desc: "Mejor pollo frito de konbini según muchos" },
          { item: "Hashed Beef Rice", price: "¥398", rating: 4, desc: "Comfort food" },
          { item: "FamiChoco (helado)", price: "¥130", rating: 4, desc: "Helado cremoso" },
          { item: "Butter Chicken Curry", price: "¥350", rating: 4, desc: "Curry decente" }
        ]
      },
      {
        id: "ministop",
        name: "Ministop (ミニストップ)",
        description: "Menos común pero tienen los MEJORES soft-serve ice creams.",
        hours: "24 horas (mayoría)",
        specialty: "Belgian Chocolate Soft Cream",
        bestFor: ["Helados premium", "Postres"],
        mustTry: [
          { item: "Belgian Chocolate Soft", price: "¥250", rating: 5, desc: "Mejor helado de konbini" },
          { item: "Halo-Halo", price: "¥350", rating: 5, desc: "Postre filipino-japonés" }
        ]
      }
    ]
  }
};

// 💊 PRODUCTOS ESENCIALES POR SITUACIÓN
export const ESSENTIAL_PRODUCTS = {
  health: {
    name: "Salud y Farmacia",
    icon: "💊",
    categories: {
      jetlag: {
        name: "Jetlag / Cansancio",
        products: [
          {
            name: "Arinamin V",
            type: "Bebida energizante",
            price: "¥150",
            where: "Konbini, Farmacias",
            description: "Vitamina B. Perfecto para jetlag y días largos de turismo.",
            usage: "Tomar por la mañana",
            rating: 5
          },
          {
            name: "Lipovitan D",
            type: "Bebida energizante",
            price: "¥150",
            where: "Konbini, Farmacias",
            description: "Clásico japonés. Menos fuerte que Red Bull pero efectivo.",
            usage: "No tomar después de 6pm",
            rating: 4
          },
          {
            name: "Yunker",
            type: "Bebida tónica",
            price: "¥300-1000",
            where: "Farmacias, Donki",
            description: "Para cansancio extremo. Varios niveles de potencia.",
            usage: "Elige según nivel de cansancio",
            rating: 5
          }
        ]
      },
      stomach: {
        name: "Problemas Estomacales",
        products: [
          {
            name: "Seirogan (征露丸)",
            icon: "🐘",
            type: "Anti-diarrea",
            price: "¥800",
            where: "Farmacias, Donki",
            description: "EL remedio japonés por excelencia. Huele fuerte pero funciona increíble.",
            usage: "Después de comidas. Efectivo en 30-60 min",
            rating: 5,
            tip: "Logo de elefante negro. Inconfundible."
          },
          {
            name: "Pocari Sweat",
            type: "Bebida isotónica",
            price: "¥120-150",
            where: "Konbini, máquinas expendedoras",
            description: "Hidratación. Esencial si tienes diarrea o resaca.",
            usage: "Beber despacio",
            rating: 5
          },
          {
            name: "Ohta's Isan",
            type: "Antiácido",
            price: "¥700",
            where: "Farmacias, Donki",
            description: "Para indigestión. Después de comer demasiado ramen.",
            usage: "Después de comidas pesadas",
            rating: 4
          }
        ]
      },
      cold: {
        name: "Gripe / Resfriado",
        products: [
          {
            name: "Pabron Gold A",
            type: "Antigripal completo",
            price: "¥1200",
            where: "Farmacias, Donki",
            description: "El mejor para resfriado completo. Cubre todos los síntomas.",
            usage: "3 veces al día después de comidas",
            rating: 5,
            tip: "Trae versión día (sin sueño) y noche"
          },
          {
            name: "Lulu",
            type: "Antigripal",
            price: "¥800",
            where: "Farmacias",
            description: "Más suave que Pabron. Bueno para síntomas leves.",
            rating: 4
          },
          {
            name: "Nodo Nuru Spray",
            type: "Spray para garganta",
            price: "¥700",
            where: "Farmacias, Donki",
            description: "Anestesia local para dolor de garganta.",
            rating: 4
          }
        ]
      },
      pain: {
        name: "Dolor (Cabeza, Cuerpo)",
        products: [
          {
            name: "Eve Quick DX",
            type: "Analgésico (Ibuprofeno)",
            price: "¥600-800",
            where: "Farmacias, Donki",
            description: "Acción rápida. Ideal para dolor de cabeza o menstrual.",
            usage: "Máximo 3 veces al día",
            rating: 5
          },
          {
            name: "Bufferin",
            type: "Analgésico (Aspirina)",
            price: "¥500",
            where: "Konbini, Farmacias",
            description: "Más suave para el estómago.",
            rating: 4
          },
          {
            name: "Salonpas",
            type: "Parches para dolor",
            price: "¥400",
            where: "Farmacias, Donki, Konbini",
            description: "Para dolor muscular después de caminar todo el día.",
            usage: "Pegar en área adolorida",
            rating: 5,
            tip: "Versión caliente para músculos, fría para inflamación"
          }
        ]
      }
    }
  },

  snacks: {
    name: "Snacks y Bebidas",
    icon: "🍜",
    categories: {
      iconic: {
        name: "Snacks Icónicos",
        products: [
          {
            name: "Kit Kat sabores especiales",
            flavors: ["Matcha", "Sake", "Wasabi", "Sweet Potato", "Sakura"],
            price: "¥300-800",
            where: "Donki, aeropuerto, konbini",
            description: "Souvenirs perfectos. Sabores exclusivos de Japón.",
            tip: "Aeropuerto tiene pack de varios sabores"
          },
          {
            name: "Pocky",
            flavors: ["Matcha", "Strawberry", "Almond Crush", "Chocolate Mint"],
            price: "¥120-300",
            where: "Konbini, Donki",
            description: "Clásico. Ediciones limitadas por temporada.",
            tip: "Giant Pocky en Donki = ¥500"
          },
          {
            name: "Hi-Chew",
            flavors: ["Grape", "Mango", "Lychee", "Yuzu"],
            price: "¥150",
            where: "Konbini",
            description: "Masticable frutal. Adictivo.",
            rating: 5
          },
          {
            name: "Jagariko",
            type: "Potato sticks",
            flavors: ["Salad", "Cheese", "Tarako (cod roe)"],
            price: "¥150",
            where: "Konbini",
            description: "Papas en palitos. Perfectos para viaje.",
            rating: 4
          }
        ]
      },
      drinks: {
        name: "Bebidas Únicas",
        products: [
          {
            name: "Calpis (Calpico)",
            type: "Bebida láctea",
            price: "¥120",
            where: "Konbini, máquinas",
            description: "Refrescante y dulce. Sabor único japonés.",
            rating: 5
          },
          {
            name: "Boss Coffee",
            type: "Café enlatado",
            flavors: ["Black", "Latte", "Caramel"],
            price: "¥120-150",
            where: "Máquinas expendedoras, konbini",
            description: "Café frío o caliente en lata. Sorprendentemente bueno.",
            tip: "Máquinas ROJAS = caliente, AZULES = frío",
            rating: 4
          },
          {
            name: "Ramune",
            type: "Soda",
            price: "¥100-150",
            where: "Konbini, Donki",
            description: "Botella con canica. Experiencia japonesa.",
            rating: 4
          }
        ]
      }
    }
  },

  souvenirs: {
    name: "Souvenirs por Presupuesto",
    icon: "🎁",
    categories: {
      cheap: {
        name: "Económicos (¥100-500)",
        items: [
          { name: "Kit Kat sabores", price: "¥300", where: "Donki, Konbini" },
          { name: "Tenugui (toallas)", price: "¥100-500", where: "Daiso, Donki" },
          { name: "Origami papers", price: "¥100", where: "Daiso" },
          { name: "Pocky edición especial", price: "¥200-300", where: "Konbini" },
          { name: "Daruma pequeño", price: "¥300-500", where: "Daiso, templos" },
          { name: "Maneki Neko pequeño", price: "¥300", where: "Daiso, Donki" },
          { name: "Furoshiki (tela envolvente)", price: "¥500", where: "Daiso, Donki" }
        ]
      },
      medium: {
        name: "Rango Medio (¥500-2000)",
        items: [
          { name: "Set de té japonés", price: "¥1000-1500", where: "Donki, tiendas de té" },
          { name: "Yukata ligero", price: "¥1500-2000", where: "Donki, Uniqlo" },
          { name: "Set de sake cups", price: "¥1000-1500", where: "Donki" },
          { name: "Kokeshi doll", price: "¥800-2000", where: "Donki, tiendas souvenirs" },
          { name: "Bento box", price: "¥1000-2000", where: "Donki, Loft, Tokyu Hands" },
          { name: "Goshuin-cho (libro de sellos)", price: "¥1500", where: "Templos" }
        ]
      }
    }
  }
};

export default { ESSENTIAL_STORES, ESSENTIAL_PRODUCTS };
