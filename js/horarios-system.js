/* ========================================
   CONTROL HORARIOS APERTURA/CIERRE
   Sistema para gestionar horarios de lugares
   ======================================== */

const HORARIOS_TIPICOS = {
  // Templos y Santuarios
  templos: {
    nombre: "Templos/Santuarios",
    apertura: "06:00",
    cierre: "17:00",
    notas: "Algunos cierran más temprano en invierno (16:00-16:30)",
    icono: "⛩️"
  },

  // Museos
  museos: {
    nombre: "Museos",
    apertura: "09:00",
    cierre: "17:00",
    diaDescanso: "Lunes",
    notas: "Última entrada 30 min antes del cierre",
    icono: "🏛️"
  },

  // Tiendas departamentales
  depato: {
    nombre: "Tiendas Departamentales (Depato)",
    apertura: "10:00",
    cierre: "20:00",
    notas: "Algunos hasta las 21:00. Domingos mismo horario",
    icono: "🏬"
  },

  // Restaurantes
  restaurantes: {
    nombre: "Restaurantes",
    desayuno: "07:00-10:00",
    almuerzo: "11:30-14:00",
    cena: "17:30-22:00",
    notas: "Muchos cierran entre 14:30-17:00. Last order 30 min antes",
    icono: "🍜"
  },

  // Izakayas
  izakaya: {
    nombre: "Izakayas",
    apertura: "17:00",
    cierre: "23:00",
    notas: "Algunos hasta medianoche o 1:00 AM",
    icono: "🏮"
  },

  // Konbini (24/7)
  konbini: {
    nombre: "Konbini (7-Eleven, FamilyMart, Lawson)",
    horario: "24 horas",
    notas: "¡Abiertos siempre! Tu salvación nocturna",
    icono: "🏪"
  },

  // Supermercados
  supermercados: {
    nombre: "Supermercados",
    apertura: "09:00",
    cierre: "21:00",
    notas: "Algunos 24h. Ofertas después de las 19:00",
    icono: "🛒"
  },

  // Atracciones (parques temáticos)
  parques: {
    nombre: "Parques Temáticos",
    apertura: "08:00-09:00",
    cierre: "20:00-22:00",
    notas: "Varía por temporada. Revisar calendario oficial",
    icono: "🎢"
  },

  // Onsens públicos
  onsen: {
    nombre: "Onsens Públicos (Sento)",
    apertura: "15:00",
    cierre: "23:00",
    notas: "Algunos desde las 6:00 AM. Ryokans tienen horarios propios",
    icono: "♨️"
  },

  // Oficinas de gobierno
  oficinas: {
    nombre: "Oficinas Gobierno/Correos",
    apertura: "09:00",
    cierre: "17:00",
    diaDescanso: "Sábado y Domingo",
    notas: "Cerrado en días festivos nacionales",
    icono: "🏢"
  },

  // Bancos
  bancos: {
    nombre: "Bancos",
    apertura: "09:00",
    cierre: "15:00",
    diaDescanso: "Sábado y Domingo",
    notas: "ATMs 24/7 en konbinis. Algunos bancos cobran fee después de 18:00",
    icono: "🏦"
  },

  // Mercados (Tsukiji, etc.)
  mercados: {
    nombre: "Mercados de Pescado",
    apertura: "05:00",
    cierre: "14:00",
    notas: "¡Madrugón! Lo mejor es llegar antes de las 8:00 AM",
    icono: "🐟"
  }
};

// Días festivos importantes (cierre general)
const DIAS_FESTIVOS_JAPON = [
  { fecha: "01-01", nombre: "Año Nuevo (Shogatsu)", duracion: "1-3 de enero", nota: "Muchos lugares cerrados" },
  { fecha: "01-02", nombre: "Año Nuevo", duracion: "1-3 de enero", nota: "Muchos lugares cerrados" },
  { fecha: "01-03", nombre: "Año Nuevo", duracion: "1-3 de enero", nota: "Muchos lugares cerrados" },
  { fecha: "02-11", nombre: "Día de la Fundación Nacional" },
  { fecha: "02-23", nombre: "Cumpleaños del Emperador" },
  { fecha: "03-20", nombre: "Equinoccio de Primavera (aprox)" },
  { fecha: "04-29", nombre: "Showa Day" },
  { fecha: "05-03", nombre: "Día de la Constitución" },
  { fecha: "05-04", nombre: "Día Verde (Midori no Hi)" },
  { fecha: "05-05", nombre: "Día de los Niños" },
  { fecha: "07-15", nombre: "Día del Mar (tercer lunes)" },
  { fecha: "08-11", nombre: "Día de la Montaña" },
  { fecha: "09-15", nombre: "Día del Respeto a los Ancianos (tercer lunes)" },
  { fecha: "09-23", nombre: "Equinoccio de Otoño (aprox)" },
  { fecha: "10-14", nombre: "Día del Deporte (segundo lunes)" },
  { fecha: "11-03", nombre: "Día de la Cultura" },
  { fecha: "11-23", nombre: "Día de Acción de Gracias del Trabajo" },
  { fecha: "12-31", nombre: "Nochevieja (Omisoka)", nota: "Muchos cierran temprano" }
];

// Golden Week (semana de vacaciones masivas)
const GOLDEN_WEEK = {
  inicio: "04-29",
  fin: "05-05",
  nombre: "Golden Week",
  advertencia: "⚠️ MUCHÍSIMA gente viajando. Reserva con MESES de anticipación",
  icono: "👥"
};

// Obon (vacaciones de verano)
const OBON = {
  periodo: "mediados de agosto (13-16 aprox)",
  advertencia: "⚠️ Muchos japoneses viajan a su ciudad natal. Trenes/hoteles llenos",
  icono: "🏮"
};

// Función para verificar si una fecha es festivo
function esDiaFestivo(fecha) {
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();
  const fechaStr = `${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;

  return DIAS_FESTIVOS_JAPON.find(festivo => festivo.fecha === fechaStr);
}

// Función para verificar si estás en Golden Week
function esGoldenWeek(fecha) {
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();
  return mes === 4 && dia >= 29 || mes === 5 && dia <= 5;
}

// Función para verificar si estás en Obon
function esObon(fecha) {
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();
  return mes === 8 && dia >= 13 && dia <= 16;
}

// Función para obtener advertencias de la fecha
function obtenerAdvertenciasFecha(fecha) {
  const advertencias = [];

  const festivo = esDiaFestivo(fecha);
  if (festivo) {
    advertencias.push({
      tipo: "festivo",
      titulo: festivo.nombre,
      mensaje: festivo.nota || "Muchos lugares pueden estar cerrados o tener horario reducido",
      icono: "🎌"
    });
  }

  if (esGoldenWeek(fecha)) {
    advertencias.push({
      tipo: "golden-week",
      titulo: GOLDEN_WEEK.nombre,
      mensaje: GOLDEN_WEEK.advertencia,
      icono: GOLDEN_WEEK.icono
    });
  }

  if (esObon(fecha)) {
    advertencias.push({
      tipo: "obon",
      titulo: "Obon (vacaciones de verano)",
      mensaje: OBON.advertencia,
      icono: OBON.icono
    });
  }

  // Verificar si es domingo (muchos museos cierran los lunes)
  if (fecha.getDay() === 0) {
    advertencias.push({
      tipo: "info",
      titulo: "Es domingo",
      mensaje: "💡 Recuerda: muchos museos cierran los LUNES. Si vas a museos mañana, verifica antes",
      icono: "📅"
    });
  }

  return advertencias;
}

// Función para calcular si un lugar está abierto AHORA
function estaAbierto(tipoLugar, horaActual = new Date()) {
  const horario = HORARIOS_TIPICOS[tipoLugar];
  if (!horario) return { abierto: null, mensaje: "Tipo de lugar desconocido" };

  // Konbinis siempre abiertos
  if (tipoLugar === 'konbini') {
    return { abierto: true, mensaje: "¡Abierto 24/7!" };
  }

  const hora = horaActual.getHours();
  const minutos = horaActual.getMinutes();
  const horaActualNum = hora + (minutos / 60);

  // Verificar día de descanso
  const diaSemana = horaActual.getDay();
  if (horario.diaDescanso) {
    if (horario.diaDescanso === "Lunes" && diaSemana === 1) {
      return { abierto: false, mensaje: `Cerrado los lunes` };
    }
    if (horario.diaDescanso === "Sábado y Domingo" && (diaSemana === 0 || diaSemana === 6)) {
      return { abierto: false, mensaje: `Cerrado fines de semana` };
    }
  }

  // Convertir horarios a número
  if (horario.apertura && horario.cierre) {
    const [aperturaH, aperturaM] = horario.apertura.split(':').map(Number);
    const [cierreH, cierreM] = horario.cierre.split(':').map(Number);

    const aperturaNum = aperturaH + (aperturaM / 60);
    const cierreNum = cierreH + (cierreM / 60);

    if (horaActualNum >= aperturaNum && horaActualNum < cierreNum) {
      return { abierto: true, mensaje: `Abierto hasta las ${horario.cierre}` };
    } else if (horaActualNum < aperturaNum) {
      return { abierto: false, mensaje: `Abre a las ${horario.apertura}` };
    } else {
      return { abierto: false, mensaje: `Cerrado (abre mañana a las ${horario.apertura})` };
    }
  }

  return { abierto: null, mensaje: "Horario variable" };
}

// Export
if (typeof window !== 'undefined') {
  window.HorariosSystem = {
    horarios: HORARIOS_TIPICOS,
    festivos: DIAS_FESTIVOS_JAPON,
    goldenWeek: GOLDEN_WEEK,
    obon: OBON,
    esDiaFestivo,
    esGoldenWeek,
    esObon,
    obtenerAdvertenciasFecha,
    estaAbierto
  };
}
