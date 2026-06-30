/* ========================================
   30 REGLAS ANTI-ERROR - Etiqueta Japonesa
   Sistema de recordatorios contextuales
   ======================================== */

const JAPAN_RULES = [
  {
    id: 1,
    categoria: "Transporte",
    titulo: "Silencio en el tren",
    regla: "NO hables por teléfono en trenes/metro. Pon tu móvil en silencio.",
    contexto: "train",
    emoji: "🚄",
    severidad: "alta"
  },
  {
    id: 2,
    categoria: "Comida",
    titulo: "Palillos en el arroz",
    regla: "NUNCA dejes los palillos verticales en el arroz (es ritual funerario)",
    contexto: "restaurant",
    emoji: "🍚",
    severidad: "crítica"
  },
  {
    id: 3,
    categoria: "Templos",
    titulo: "Lavar manos en templo",
    regla: "Usa el temizuya: mano izquierda, derecha, boca, después mango",
    contexto: "temple",
    emoji: "⛩️",
    severidad: "media"
  },
  {
    id: 4,
    categoria: "Onsen",
    titulo: "Ducha antes del onsen",
    regla: "SIEMPRE báñate COMPLETAMENTE antes de entrar al onsen/baño público",
    contexto: "onsen",
    emoji: "♨️",
    severidad: "crítica"
  },
  {
    id: 5,
    categoria: "Social",
    titulo: "Zapatos en casa",
    regla: "Quítate los zapatos al entrar a casas, ryokans, algunos restaurantes",
    contexto: "general",
    emoji: "👟",
    severidad: "alta"
  },
  {
    id: 6,
    categoria: "Comida",
    titulo: "Sorber ramen es OK",
    regla: "Sorber ramen/soba ES educado (demuestra que está rico)",
    contexto: "restaurant",
    emoji: "🍜",
    severidad: "baja"
  },
  {
    id: 7,
    categoria: "Transporte",
    titulo: "Fila en el tren",
    regla: "Forma fila a los lados de las puertas, deja salir primero",
    contexto: "train",
    emoji: "🚇",
    severidad: "alta"
  },
  {
    id: 8,
    categoria: "Social",
    titulo: "Propina NO se da",
    regla: "NO dejes propina. Puede ser ofensivo. El servicio ya está incluido.",
    contexto: "restaurant",
    emoji: "💴",
    severidad: "alta"
  },
  {
    id: 9,
    categoria: "Comida",
    titulo: "Di 'itadakimasu'",
    regla: "Antes de comer: いただきます (itadakimasu). Después: ごちそうさまでした (gochisousama)",
    contexto: "restaurant",
    emoji: "🙏",
    severidad: "media"
  },
  {
    id: 10,
    categoria: "Templos",
    titulo: "Reverencia al torii",
    regla: "Haz una pequeña reverencia al pasar bajo un torii",
    contexto: "temple",
    emoji: "⛩️",
    severidad: "baja"
  },
  {
    id: 11,
    categoria: "Social",
    titulo: "Hablar bajo en público",
    regla: "Mantén el volumen bajo en lugares públicos (trenes, restaurantes)",
    contexto: "general",
    emoji: "🤫",
    severidad: "alta"
  },
  {
    id: 12,
    categoria: "Transporte",
    titulo: "Asiento prioritario",
    regla: "NO uses asientos prioritarios (azules/rosas) a menos que sea necesario",
    contexto: "train",
    emoji: "💺",
    severidad: "alta"
  },
  {
    id: 13,
    categoria: "Comida",
    titulo: "Pagar en la caja",
    regla: "Paga en la caja de salida, NO en la mesa (mayoría de lugares)",
    contexto: "restaurant",
    emoji: "🧾",
    severidad: "media"
  },
  {
    id: 14,
    categoria: "Onsen",
    titulo: "Toalla fuera del agua",
    regla: "La toalla pequeña NO entra al onsen. Ponla en tu cabeza o a un lado.",
    contexto: "onsen",
    emoji: "🧖",
    severidad: "alta"
  },
  {
    id: 15,
    categoria: "Social",
    titulo: "Reverencia al saludar",
    regla: "Haz reverencia ligera al saludar/agradecer (15-30 grados)",
    contexto: "general",
    emoji: "🙇",
    severidad: "media"
  },
  {
    id: 16,
    categoria: "Compras",
    titulo: "Bandeja para dinero",
    regla: "Pon dinero/tarjeta en la bandejita, NO en la mano del cajero",
    contexto: "shopping",
    emoji: "💵",
    severidad: "media"
  },
  {
    id: 17,
    categoria: "Comida",
    titulo: "No caminar comiendo",
    regla: "NO camines mientras comes (excepto festivales). Come en el lugar.",
    contexto: "general",
    emoji: "🚶‍♂️",
    severidad: "alta"
  },
  {
    id: 18,
    categoria: "Transporte",
    titulo: "Escalera izquierda/derecha",
    regla: "Tokio: camina por la izquierda. Osaka: derecha. ¡Observa primero!",
    contexto: "train",
    emoji: "🚶",
    severidad: "media"
  },
  {
    id: 19,
    categoria: "Onsen",
    titulo: "Tatuajes en onsen",
    regla: "Muchos onsens prohíben tatuajes. Verifica antes o usa parches.",
    contexto: "onsen",
    emoji: "🚫",
    severidad: "crítica"
  },
  {
    id: 20,
    categoria: "Templos",
    titulo: "No fotos donde prohiban",
    regla: "Respeta señales 撮影禁止 (satsuekinshi = no fotos)",
    contexto: "temple",
    emoji: "📵",
    severidad: "alta"
  },
  {
    id: 21,
    categoria: "Social",
    titulo: "Puntualidad extrema",
    regla: "Llega 5-10 minutos ANTES. La impuntualidad es muy mal vista.",
    contexto: "general",
    emoji: "⏰",
    severidad: "alta"
  },
  {
    id: 22,
    categoria: "Comida",
    titulo: "Termina tu comida",
    regla: "Intenta terminar toda tu comida (dejar mucho se considera grosero)",
    contexto: "restaurant",
    emoji: "🍱",
    severidad: "media"
  },
  {
    id: 23,
    categoria: "Basura",
    titulo: "Lleva tu basura",
    regla: "HAY MUY POCOS botes. Lleva tu basura hasta encontrar uno.",
    contexto: "general",
    emoji: "🗑️",
    severidad: "alta"
  },
  {
    id: 24,
    categoria: "Transporte",
    titulo: "Mochila al frente",
    regla: "Lleva tu mochila/bolsa al FRENTE en trenes llenos",
    contexto: "train",
    emoji: "🎒",
    severidad: "alta"
  },
  {
    id: 25,
    categoria: "Social",
    titulo: "Sonarse la nariz",
    regla: "NO te suenes la nariz en público. Ve al baño o hazlo discreto.",
    contexto: "general",
    emoji: "🤧",
    severidad: "alta"
  },
  {
    id: 26,
    categoria: "Escaleras",
    titulo: "Sandalias en tatami",
    regla: "Usa las sandalias interiores en pasillos, quítalas en habitaciones tatami",
    contexto: "accommodation",
    emoji: "🥿",
    severidad: "media"
  },
  {
    id: 27,
    categoria: "Comida",
    titulo: "No mezclar wasabi",
    regla: "NO mezcles wasabi en la salsa de soja (ponlo directo en el sushi)",
    contexto: "restaurant",
    emoji: "🍣",
    severidad: "baja"
  },
  {
    id: 28,
    categoria: "Fotos",
    titulo: "Pedir permiso para fotos",
    regla: "Pide permiso antes de fotografiar personas (写真いいですか?)",
    contexto: "general",
    emoji: "📸",
    severidad: "alta"
  },
  {
    id: 29,
    categoria: "Templos",
    titulo: "Monedas en el saisen-bako",
    regla: "Tira moneda de 5 yenes (縁 = buena suerte) en la caja de ofrendas",
    contexto: "temple",
    emoji: "💰",
    severidad: "baja"
  },
  {
    id: 30,
    categoria: "Social",
    titulo: "Irasshaimase no requiere respuesta",
    regla: "Cuando dicen いらっしゃいませ (bienvenido) NO tienes que responder",
    contexto: "shopping",
    emoji: "🏪",
    severidad: "baja"
  }
];

// Mostrar reglas por contexto
function mostrarReglasContexto(contexto) {
  const reglasFiltradas = JAPAN_RULES.filter(r => r.contexto === contexto || r.contexto === 'general');

  if (reglasFiltradas.length === 0) return '';

  const criticas = reglasFiltradas.filter(r => r.severidad === 'crítica');
  const altas = reglasFiltradas.filter(r => r.severidad === 'alta');

  let html = '<div class="japan-rules-contextual">';

  if (criticas.length > 0) {
    html += '<div class="rule-critical">';
    html += '<h4>⚠️ MUY IMPORTANTE:</h4>';
    criticas.forEach(r => {
      html += `<div class="rule-item critical">
        <span class="rule-emoji">${r.emoji}</span>
        <strong>${r.titulo}:</strong> ${r.regla}
      </div>`;
    });
    html += '</div>';
  }

  if (altas.length > 0) {
    html += '<div class="rule-high">';
    html += '<h4>📌 Recuerda:</h4>';
    altas.slice(0, 3).forEach(r => {
      html += `<div class="rule-item high">
        <span class="rule-emoji">${r.emoji}</span>
        <strong>${r.titulo}:</strong> ${r.regla}
      </div>`;
    });
    html += '</div>';
  }

  html += '</div>';
  return html;
}

// Buscar reglas por palabra clave
function buscarReglas(keyword) {
  keyword = keyword.toLowerCase();
  return JAPAN_RULES.filter(r =>
    r.titulo.toLowerCase().includes(keyword) ||
    r.regla.toLowerCase().includes(keyword) ||
    r.categoria.toLowerCase().includes(keyword)
  );
}

// Regla aleatoria del día
function reglaDelDia() {
  const hoy = new Date();
  const dia = hoy.getDate();
  const index = (dia - 1) % 30; // Día 1-30 mapea a regla 0-29
  return JAPAN_RULES[index];
}

// Export
if (typeof window !== 'undefined') {
  window.JapanRules = {
    todas: JAPAN_RULES,
    porContexto: mostrarReglasContexto,
    buscar: buscarReglas,
    delDia: reglaDelDia
  };
}
