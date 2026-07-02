/* ========================================
   JR PASS CALCULATOR
   Calcula si vale la pena comprar JR Pass
   ======================================== */

// Precios de JR Pass (2024)
const JR_PASS_PRICES = {
  ordinary: {
    7: { price: 50000, name: "7 días Ordinario" },
    14: { price: 80000, name: "14 días Ordinario" },
    21: { price: 100000, name: "21 días Ordinario" }
  },
  green: {
    7: { price: 70000, name: "7 días Green Car" },
    14: { price: 111000, name: "14 días Green Car" },
    21: { price: 144000, name: "21 días Green Car" }
  }
};

// Rutas populares con precios (precios aproximados en yenes)
const RUTAS_POPULARES = {
  "Tokyo-Kyoto": { precio: 13320, duracion: "2h 15min", tipo: "Shinkansen Nozomi/Hikari" },
  "Tokyo-Osaka": { precio: 13870, duracion: "2h 30min", tipo: "Shinkansen Nozomi" },
  "Kyoto-Osaka": { precio: 560, duracion: "30min", tipo: "JR Kyoto Line" },
  "Tokyo-Hiroshima": { precio: 19440, duracion: "4h", tipo: "Shinkansen Nozomi" },
  "Osaka-Hiroshima": { precio: 10580, duracion: "1h 30min", tipo: "Shinkansen Sakura" },
  "Tokyo-Nagoya": { precio: 10360, duracion: "1h 40min", tipo: "Shinkansen Nozomi" },
  "Tokyo-Nikko": { precio: 5480, duracion: "2h", tipo: "JR Tobu Line" },
  "Tokyo-Hakone": { precio: 4190, duracion: "1h 30min", tipo: "JR Tokaido Line" },
  "Osaka-Nara": { precio: 820, duracion: "50min", tipo: "JR Yamatoji Rapid" },
  "Kyoto-Nara": { precio: 720, duracion: "45min", tipo: "JR Nara Line" },
  "Tokyo-Kanazawa": { precio: 14380, duracion: "2h 30min", tipo: "Shinkansen Kagayaki" },
  "Tokyo-Sendai": { precio: 11410, duracion: "1h 30min", tipo: "Shinkansen Hayabusa" },
  "Tokyo-Takayama": { precio: 14070, duracion: "4h 30min", tipo: "JR Hida Limited Express" },
  "Osaka-Kanazawa": { precio: 7650, duracion: "2h 30min", tipo: "Shinkansen Thunderbird" },
  "Tokyo-Hakodate": { precio: 23430, duracion: "4h", tipo: "Shinkansen Hayabusa" },
  "Tokyo-Narita Airport": { precio: 3070, duracion: "1h", tipo: "Narita Express" },
  "Osaka-Kansai Airport": { precio: 1710, duracion: "50min", tipo: "JR Haruka" }
};

// Ciudades disponibles para el selector
const CIUDADES = [
  "Tokyo", "Kyoto", "Osaka", "Hiroshima", "Nara", "Nagoya",
  "Nikko", "Hakone", "Kanazawa", "Sendai", "Takayama",
  "Hakodate", "Narita Airport", "Kansai Airport"
];

// Función para calcular precio de ruta
function calcularPrecioRuta(origen, destino) {
  const rutaDirecta = `${origen}-${destino}`;
  const rutaInversa = `${destino}-${origen}`;

  if (RUTAS_POPULARES[rutaDirecta]) {
    return RUTAS_POPULARES[rutaDirecta];
  } else if (RUTAS_POPULARES[rutaInversa]) {
    return RUTAS_POPULARES[rutaInversa];
  }

  // Si no hay ruta directa, estimar
  return { precio: 8000, duracion: "Variable", tipo: "Estimado" };
}

// Calcular si vale la pena el JR Pass
function calcularValorJRPass(viajes, dias) {
  let costoTotal = 0;

  viajes.forEach(viaje => {
    const ruta = calcularPrecioRuta(viaje.origen, viaje.destino);
    const vecesPorRuta = viaje.veces || 1;
    costoTotal += ruta.precio * vecesPorRuta;
  });

  const passOrdinario = JR_PASS_PRICES.ordinary[dias];
  const ahorro = costoTotal - passOrdinario.price;
  const valeLaPena = ahorro > 0;

  return {
    costoTotal,
    precioPass: passOrdinario.price,
    ahorro,
    valeLaPena,
    porcentajeAhorro: ((ahorro / passOrdinario.price) * 100).toFixed(1)
  };
}

// Recomendaciones basadas en itinerario
function generarRecomendaciones(viajes, resultado) {
  const recomendaciones = [];

  if (resultado.valeLaPena) {
    recomendaciones.push({
      tipo: 'success',
      mensaje: `¡SÍ COMPRA EL JR PASS! Te ahorrarás ¥${resultado.ahorro.toLocaleString()} (${resultado.porcentajeAhorro}%)`,
      icono: '✅'
    });
  } else {
    const diferencia = Math.abs(resultado.ahorro);
    recomendaciones.push({
      tipo: 'warning',
      mensaje: `No vale la pena. Gastarías ¥${diferencia.toLocaleString()} más con el JR Pass`,
      icono: '⚠️'
    });
    recomendaciones.push({
      tipo: 'info',
      mensaje: 'Considera comprar tickets individuales o usar IC cards (Suica/Pasmo)',
      icono: '💡'
    });
  }

  // Verificar si hay rutas con Nozomi
  const tieneNozomi = viajes.some(v => {
    const ruta = calcularPrecioRuta(v.origen, v.destino);
    return ruta.tipo.includes('Nozomi');
  });

  if (tieneNozomi && resultado.valeLaPena) {
    recomendaciones.push({
      tipo: 'warning',
      mensaje: '⚠️ ATENCIÓN: El JR Pass NO cubre Shinkansen Nozomi. Usa Hikari o Sakura en su lugar',
      icono: '🚄'
    });
  }

  // Consejo sobre Green Car
  if (resultado.costoTotal > JR_PASS_PRICES.green[7].price * 0.8) {
    recomendaciones.push({
      tipo: 'info',
      mensaje: 'Considera el Green Car Pass si quieres más espacio y comodidad',
      icono: '🌟'
    });
  }

  return recomendaciones;
}

// Itinerarios de ejemplo pre-definidos
const ITINERARIOS_EJEMPLO = {
  clasico: {
    nombre: "Ruta Clásica (Tokyo-Kyoto-Osaka)",
    dias: 7,
    viajes: [
      { origen: "Tokyo", destino: "Kyoto", veces: 1 },
      { origen: "Kyoto", destino: "Osaka", veces: 2 },
      { origen: "Kyoto", destino: "Nara", veces: 1 },
      { origen: "Osaka", destino: "Tokyo", veces: 1 }
    ]
  },

  completo: {
    nombre: "Gran Tour (14 días)",
    dias: 14,
    viajes: [
      { origen: "Tokyo", destino: "Nikko", veces: 1 },
      { origen: "Tokyo", destino: "Kyoto", veces: 1 },
      { origen: "Kyoto", destino: "Osaka", veces: 2 },
      { origen: "Kyoto", destino: "Nara", veces: 1 },
      { origen: "Osaka", destino: "Hiroshima", veces: 1 },
      { origen: "Hiroshima", destino: "Tokyo", veces: 1 }
    ]
  },

  kanto: {
    nombre: "Solo Kanto (Tokyo y alrededores)",
    dias: 7,
    viajes: [
      { origen: "Tokyo", destino: "Nikko", veces: 1 },
      { origen: "Tokyo", destino: "Hakone", veces: 1 },
      { origen: "Tokyo", destino: "Narita Airport", veces: 2 }
    ]
  },

  oeste: {
    nombre: "Kansai & Hiroshima",
    dias: 7,
    viajes: [
      { origen: "Osaka", destino: "Kyoto", veces: 2 },
      { origen: "Kyoto", destino: "Nara", veces: 1 },
      { origen: "Osaka", destino: "Hiroshima", veces: 1 },
      { origen: "Hiroshima", destino: "Osaka", veces: 1 }
    ]
  }
};

/**
 * 🆕 Deriva los "viajes" (traslados entre ciudades) directamente del
 * itinerario REAL del usuario, en vez de obligarlo a re-escribir su ruta a
 * mano o elegir uno de los 4 itinerarios de ejemplo genéricos. Recorre los
 * días en orden y registra un viaje cada vez que la ciudad cambia de un día
 * al siguiente (incluye los day trips: is DayTrip también cuenta como un
 * traslado ida-y-vuelta real en tren, aunque no cambie de hotel).
 * @param {Object} itinerary - el itinerario actual (itinerary.days)
 * @returns {{ viajes: Array, dias: number } | null}
 */
function derivarViajesDeItinerario(itinerary) {
  if (!itinerary?.days || itinerary.days.length < 2) return null;

  const normalizarCiudad = (rawCity) => {
    if (!rawCity) return null;
    // Días de transición pueden venir como "Tokyo/Kyoto" - usar la ciudad del día en sí
    const clean = String(rawCity).split(/[/\-→]/)[0].trim();
    const match = CIUDADES.find(c => c.toLowerCase() === clean.toLowerCase());
    return match || clean; // si no está en la lista, se usa tal cual (calcularPrecioRuta estima)
  };

  const legCounts = new Map(); // "origen|destino" -> veces

  for (let i = 0; i < itinerary.days.length - 1; i++) {
    const desde = normalizarCiudad(itinerary.days[i].city);
    const hacia = normalizarCiudad(itinerary.days[i + 1].city);
    if (!desde || !hacia || desde === hacia) continue;

    const key = `${desde}|${hacia}`;
    legCounts.set(key, (legCounts.get(key) || 0) + 1);
  }

  const viajes = Array.from(legCounts.entries()).map(([key, veces]) => {
    const [origen, destino] = key.split('|');
    return { origen, destino, veces };
  });

  if (viajes.length === 0) return null;

  return { viajes, dias: itinerary.days.length };
}

// Export
if (typeof window !== 'undefined') {
  window.JRPassCalculator = {
    prices: JR_PASS_PRICES,
    rutas: RUTAS_POPULARES,
    ciudades: CIUDADES,
    ejemplos: ITINERARIOS_EJEMPLO,
    calcularPrecio: calcularPrecioRuta,
    calcularValor: calcularValorJRPass,
    generarRecomendaciones,
    derivarViajesDeItinerario
  };
}
