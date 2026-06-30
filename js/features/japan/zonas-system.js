/* ========================================
   SISTEMA DE ZONAS - Regiones de Japón
   Información geográfica y cultural
   ======================================== */

const ZONAS_JAPON = {
  kanto: {
    nombre: "Kanto (関東)",
    icono: "🗼",
    color: "#ef4444",
    descripcion: "Región del este que incluye Tokio. Moderna, rápida y cosmopolita.",
    prefecturas: ["Tokio", "Kanagawa (Yokohama)", "Chiba", "Saitama", "Gunma", "Tochigi", "Ibaraki"],
    ciudadesImportantes: [
      { nombre: "Tokio", descripcion: "Capital de Japón, centro tecnológico y cultural" },
      { nombre: "Yokohama", descripcion: "Puerto internacional, Chinatown más grande de Japón" },
      { nombre: "Kamakura", descripcion: "Ciudad histórica con templos y el Gran Buda" },
      { nombre: "Nikko", descripcion: "Santuarios UNESCO, naturaleza y cascadas" }
    ],
    caracteristicas: [
      "Dialecto: acento estándar de Tokio",
      "Escaleras mecánicas: camina por la IZQUIERDA",
      "Comida: monja-yaki, chanko-nabe",
      "Personalidad: directa, rápida, ocupada"
    ],
    clima: "Veranos calurosos y húmedos. Inviernos fríos pero secos. Posibilidad de nieve.",
    mejorEpoca: "Primavera (marzo-mayo) y Otoño (septiembre-noviembre)"
  },

  kansai: {
    nombre: "Kansai (関西)",
    icono: "🏯",
    color: "#f59e0b",
    descripcion: "Región del oeste con Osaka y Kioto. Rica historia, comida increíble y cultura tradicional.",
    prefecturas: ["Osaka", "Kioto", "Hyogo (Kobe)", "Nara", "Shiga", "Wakayama", "Mie"],
    ciudadesImportantes: [
      { nombre: "Osaka", descripcion: "Capital gastronómica, friendly, divertida" },
      { nombre: "Kioto", descripcion: "Antigua capital imperial, templos y geishas" },
      { nombre: "Nara", descripcion: "Ciervos sagrados y templo Todai-ji" },
      { nombre: "Kobe", descripcion: "Puerto cosmopolita, famoso por su carne wagyu" }
    ],
    caracteristicas: [
      "Dialecto: Kansai-ben (más informal y cómico)",
      "Escaleras mecánicas: camina por la DERECHA",
      "Comida: okonomiyaki, takoyaki, kushikatsu",
      "Personalidad: amigable, graciosa, relajada"
    ],
    clima: "Similar a Kanto. Veranos calurosos. Inviernos moderados.",
    mejorEpoca: "Primavera para sakura en Kioto. Otoño para momiji (hojas rojas)"
  },

  chubu: {
    nombre: "Chubu (中部)",
    icono: "🗻",
    color: "#8b5cf6",
    descripcion: "Región central montañosa con los Alpes Japoneses y el Monte Fuji.",
    prefecturas: ["Aichi (Nagoya)", "Shizuoka", "Gifu", "Nagano", "Yamanashi", "Toyama", "Ishikawa", "Fukui", "Niigata"],
    ciudadesImportantes: [
      { nombre: "Nagoya", descripcion: "Tercera ciudad más grande, castillo y Toyota" },
      { nombre: "Takayama", descripcion: "Pueblo tradicional en las montañas" },
      { nombre: "Kanazawa", descripcion: "Jardín Kenrokuen, distrito samurái y geishas" },
      { nombre: "Matsumoto", descripcion: "Castillo negro (cuervo) y portal a los Alpes" }
    ],
    caracteristicas: [
      "Geografía: montañas, nieve, onsen",
      "Comida: hida-gyu (wagyu), miso katsu, hoba miso",
      "Cultura: preservación de tradiciones",
      "Actividades: ski, hiking, onsen"
    ],
    clima: "Montañoso. Inviernos con MUCHA nieve. Veranos frescos en altura.",
    mejorEpoca: "Invierno para ski. Verano para escapar del calor. Primavera/otoño para trekking"
  },

  tohoku: {
    nombre: "Tohoku (東北)",
    icono: "🏔️",
    color: "#06b6d4",
    descripcion: "Región noreste rural y montañosa. Naturaleza virgen y onsens remotos.",
    prefecturas: ["Miyagi (Sendai)", "Fukushima", "Yamagata", "Iwate", "Akita", "Aomori"],
    ciudadesImportantes: [
      { nombre: "Sendai", descripcion: "Ciudad más grande del norte, date masamune" },
      { nombre: "Aomori", descripcion: "Festival Nebuta, manzanas" },
      { nombre: "Yamadera", descripcion: "Templo en montaña con 1000+ escalones" },
      { nombre: "Matsushima", descripcion: "Una de las 3 vistas más bellas de Japón" }
    ],
    caracteristicas: [
      "Naturaleza: montañas, lagos, costas",
      "Comida: gyutan (lengua de res), kiritanpo",
      "Festivales: Nebuta, Kanto Matsuri",
      "Onsens: Nyuto Onsen, Ginzan Onsen"
    ],
    clima: "Inviernos FRÍOS con mucha nieve. Veranos moderados.",
    mejorEpoca: "Verano para festivales. Otoño para colores. Invierno para onsen y nieve"
  },

  chugoku: {
    nombre: "Chugoku (中国)",
    icono: "⛩️",
    color: "#ec4899",
    descripcion: "Región oeste entre Kansai y Kyushu. Hiroshima y el torii flotante de Miyajima.",
    prefecturas: ["Hiroshima", "Okayama", "Shimane", "Tottori", "Yamaguchi"],
    ciudadesImportantes: [
      { nombre: "Hiroshima", descripcion: "Memorial de paz, okonomiyaki, isla Miyajima" },
      { nombre: "Miyajima", descripcion: "Torii flotante icónico y ciervos" },
      { nombre: "Okayama", descripcion: "Jardín Korakuen, castillo negro" },
      { nombre: "Tottori", descripcion: "Dunas de arena únicas en Japón" }
    ],
    caracteristicas: [
      "Historia: castillos, jardines tradicionales",
      "Comida: okonomiyaki estilo Hiroshima, fugu",
      "Naturaleza: costa del Mar Interior de Seto",
      "Cultura: menos turístico, más auténtico"
    ],
    clima: "Moderado. Costa más cálida que montañas interiores.",
    mejorEpoca: "Primavera y otoño. Menos afectado por tifones que Kyushu"
  },

  shikoku: {
    nombre: "Shikoku (四国)",
    icono: "🚶",
    color: "#10b981",
    descripcion: "Isla más pequeña de las 4 principales. Famosa por peregrinación de 88 templos.",
    prefecturas: ["Kagawa", "Tokushima", "Ehime", "Kochi"],
    ciudadesImportantes: [
      { nombre: "Matsuyama", descripcion: "Dogo Onsen (inspiración de Spirited Away)" },
      { nombre: "Takamatsu", descripcion: "Udon capital, jardín Ritsurin" },
      { nombre: "Naruto", descripcion: "Remolinos marinos, puente Onaruto" },
      { nombre: "Kochi", descripcion: "Castillo original, playa Katsurahama" }
    ],
    caracteristicas: [
      "Peregrinación: 88 templos (1200km a pie)",
      "Comida: udon de Sanuki, yuzu, bonito katsuo",
      "Naturaleza: montañas, ríos, costa",
      "Turismo: menos visitado, más tranquilo"
    ],
    clima: "Subtropical. Veranos calurosos. Inviernos suaves.",
    mejorEpoca: "Primavera y otoño para peregrinación. Verano para playas"
  },

  kyushu: {
    nombre: "Kyushu (九州)",
    icono: "🌋",
    color: "#f97316",
    descripcion: "Isla sur con volcanes activos, onsens increíbles y puerta a Asia.",
    prefecturas: ["Fukuoka", "Nagasaki", "Kumamoto", "Kagoshima", "Miyazaki", "Oita", "Saga"],
    ciudadesImportantes: [
      { nombre: "Fukuoka", descripcion: "Ramen capital, yatais, vida nocturna" },
      { nombre: "Nagasaki", descripcion: "Historia, castillo Glover, cultura holandesa" },
      { nombre: "Kumamoto", descripcion: "Castillo impresionante, Aso volcán" },
      { nombre: "Beppu", descripcion: "Capital de onsens, 'infiernos' geotérmicos" }
    ],
    caracteristicas: [
      "Volcanes: Monte Aso, Sakurajima activo",
      "Onsens: los mejores de Japón (Beppu, Yufuin)",
      "Comida: tonkotsu ramen, mentaiko, wagyu",
      "Clima: subtropical, más cálido"
    ],
    clima: "Cálido y húmedo. Tifones en verano/otoño. Inviernos suaves.",
    mejorEpoca: "Primavera y principios de verano (pre-tifones)"
  },

  hokkaido: {
    nombre: "Hokkaido (北海道)",
    icono: "❄️",
    color: "#3b82f6",
    descripcion: "Isla del norte. Naturaleza salvaje, ski de clase mundial, mariscos frescos.",
    prefecturas: ["Sapporo", "Hakodate", "Asahikawa", "Otaru", "Furano", "Niseko"],
    ciudadesImportantes: [
      { nombre: "Sapporo", descripcion: "Capital, cerveza, festival de nieve en febrero" },
      { nombre: "Hakodate", descripcion: "Puerto histórico, mercado de mariscos" },
      { nombre: "Otaru", descripcion: "Canales románticos, cajas musicales" },
      { nombre: "Niseko", descripcion: "Ski resort internacional, powder snow" }
    ],
    caracteristicas: [
      "Naturaleza: parques nacionales, lagos, lavanda",
      "Ski: Niseko, Furano, Rusutsu (mejor nieve)",
      "Comida: uni, cangrejo, maíz, lácteos, sopa curry",
      "Cultura: influencia Ainu (indígena)",
      "Menos templos, más wilderness"
    ],
    clima: "FRÍO. Inviernos con MUCHA nieve. Veranos frescos y agradables.",
    mejorEpoca: "Febrero para Snow Festival. Julio para lavanda. Invierno para ski"
  },

  okinawa: {
    nombre: "Okinawa (沖縄)",
    icono: "🏝️",
    color: "#14b8a6",
    descripcion: "Islas subtropicales del sur. Playas paradisíacas, cultura ryukyu única.",
    prefecturas: ["Naha", "Ishigaki", "Miyako", "Kerama"],
    ciudadesImportantes: [
      { nombre: "Naha", descripcion: "Capital, calle Kokusai-dori, castillo Shuri" },
      { nombre: "Ishigaki", descripcion: "Base para islas remotas, snorkeling" },
      { nombre: "Miyako", descripcion: "Playas vírgenes, aguas cristalinas" }
    ],
    caracteristicas: [
      "Playas: arena blanca, coral, buceo",
      "Cultura: Reino Ryukyu (diferente a Japón)",
      "Música: sanshin, música tradicional",
      "Comida: goya champuru, Okinawa soba, awamori",
      "Longevidad: zona azul, gente más longeva"
    ],
    clima: "Subtropical. Cálido todo el año. Tifones en verano.",
    mejorEpoca: "Abril-junio (pre-tifones). Octubre-noviembre (post-tifones)"
  }
};

// Comparador de zonas
function compararZonas(zona1Key, zona2Key) {
  const zona1 = ZONAS_JAPON[zona1Key];
  const zona2 = ZONAS_JAPON[zona2Key];

  if (!zona1 || !zona2) return null;

  return {
    zona1: zona1.nombre,
    zona2: zona2.nombre,
    diferencias: {
      clima: `${zona1.nombre}: ${zona1.clima} | ${zona2.nombre}: ${zona2.clima}`,
      cultura: `${zona1.nombre}: ${zona1.descripcion} | ${zona2.nombre}: ${zona2.descripcion}`,
      mejorEpoca: `${zona1.nombre}: ${zona1.mejorEpoca} | ${zona2.nombre}: ${zona2.mejorEpoca}`
    }
  };
}

// Recomendar zona según preferencias
function recomendarZona(preferencias) {
  const recomendaciones = [];

  if (preferencias.includes('moderna')) {
    recomendaciones.push({ zona: 'kanto', razon: 'Tokio es la ciudad más moderna y tecnológica' });
  }

  if (preferencias.includes('tradicional')) {
    recomendaciones.push({ zona: 'kansai', razon: 'Kioto es el corazón de la cultura tradicional japonesa' });
  }

  if (preferencias.includes('naturaleza')) {
    recomendaciones.push({ zona: 'hokkaido', razon: 'Naturaleza salvaje y parques nacionales' });
    recomendaciones.push({ zona: 'tohoku', razon: 'Montañas, lagos y onsens remotos' });
  }

  if (preferencias.includes('playa')) {
    recomendaciones.push({ zona: 'okinawa', razon: 'Playas paradisíacas y aguas cristalinas' });
  }

  if (preferencias.includes('ski')) {
    recomendaciones.push({ zona: 'hokkaido', razon: 'Mejor powder snow del mundo en Niseko' });
    recomendaciones.push({ zona: 'chubu', razon: 'Alpes Japoneses con excelentes ski resorts' });
  }

  if (preferencias.includes('comida')) {
    recomendaciones.push({ zona: 'kansai', razon: 'Osaka es la capital gastronómica de Japón' });
    recomendaciones.push({ zona: 'kyushu', razon: 'Tonkotsu ramen y los mejores onsens' });
  }

  if (preferencias.includes('historia')) {
    recomendaciones.push({ zona: 'kansai', razon: 'Kioto y Nara: templos históricos UNESCO' });
    recomendaciones.push({ zona: 'chugoku', razon: 'Hiroshima y su historia importante' });
  }

  if (preferencias.includes('onsen')) {
    recomendaciones.push({ zona: 'kyushu', razon: 'Beppu y Yufuin: capitales de onsen' });
    recomendaciones.push({ zona: 'tohoku', razon: 'Onsens tradicionales y remotos' });
  }

  return recomendaciones;
}

// Export
if (typeof window !== 'undefined') {
  window.ZonasSystem = {
    zonas: ZONAS_JAPON,
    comparar: compararZonas,
    recomendar: recomendarZona
  };
}
