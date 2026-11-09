// Personal route. Times are planning suggestions, never bookings or train timetables.
const activity = (time, title, category, duration, area, notes = '', extra = {}) => ({
  time, title, category, duration, area, notes, cost: null, costStatus: 'unpriced', ...extra
});
const day = (city, title, activities, extra = {}) => ({ city, title, activities, ...extra });

export const JAPAN_FEBRUARY_2027 = {
  id: 'japan-february-2027', schemaVersion: 2, version: '1.0.0',
  name: 'Febrero en Japón · cafés y tesoros',
  description: 'Tu viaje del 15 de febrero al 6 de marzo de 2027: Tokyo, Kyoto, Osaka y regreso a Otsuka. Museos, cafés, compras de segunda mano y excursiones con margen.',
  duration: 20, defaultStartDate: '2027-02-15', defaultEndDate: '2027-03-06',
  cities: ['Tokyo', 'Kyoto', 'Osaka'],
  categories: ['culture', 'shopping', 'food', 'nature', 'anime'],
  budget: null,
  tags: ['invierno', 'cafés', 'segunda mano', 'museos', 'personalizable'],
  highlights: ['4 estancias · 19 noches', 'Nintendo Museum y paseo por Uji', 'Cafés de Kyoto y Shinjuku', 'Nipponbashi, Nakano y Shimokitazawa', 'Hakone y Kamakura desde Tokyo', 'Hiroshima y Miyajima · día largo con alternativa'],
  cityStops: [{ city: 'Tokyo', days: 4 }, { city: 'Kyoto', days: 5 }, { city: 'Osaka', days: 4 }, { city: 'Tokyo', days: 7 }],
  hotels: [
    { id: 'otsuka-first', city: 'Tokyo', name: 'Toyoko Inn Tokyo Yamanote-sen Otsuka-eki Kita-guchi No. 2', checkInOffset: 0, checkOutOffset: 4, nights: 4, status: 'por-confirmar' },
    { id: 'kyoto', city: 'Kyoto', name: 'TUNE STAY KYOTO', checkInOffset: 4, checkOutOffset: 9, nights: 5, status: 'por-confirmar' },
    { id: 'osaka', city: 'Osaka', name: 'APA Hotel & Resort Osaka Namba Ekimae Tower', checkInOffset: 9, checkOutOffset: 13, nights: 4, status: 'por-confirmar' },
    { id: 'otsuka-return', city: 'Tokyo', name: 'APA Hotel Yamanote Otsuka Ekimae Tower', checkInOffset: 13, checkOutOffset: 19, nights: 6, status: 'por-confirmar' }
  ],
  bookingChecklist: [
    { id: 'nintendo', title: 'Solicitar sorteo de Nintendo Museum', dueDate: '2026-11-30', timeZone: 'Asia/Tokyo', deadlineLocalTime: '23:59', fixedDate: true, notes: 'Para febrero de 2027. Preferencia 22 de febrero; el resultado del sorteo decide el día definitivo.', url: 'https://museum.nintendo.com/en/index.html' },
    { id: 'teamlab', title: 'Elegir teamLab Planets o Borderless y reservar', notes: 'La plantilla reserva el bloque, pero no da por elegido un recinto.', url: 'https://www.teamlab.art/e/tokyo/' },
    { id: 'kichi', title: 'Revisar la modalidad vigente de reservas de Kichi Kichi', notes: 'Objetivo: 23 de febrero; cambiar la cena según disponibilidad.', url: 'https://kichikichi.com/reservation-guides/' },
    { id: 'toei', title: 'Confirmar calendario y atracciones de Toei/Uzumasa', notes: 'Visita prevista 20 de febrero. La renovación se hace por fases; no asumir que todas las atracciones estarán abiertas.', url: 'https://www.toei-eigamura.com/' },
    { id: 'trains', title: 'Comparar billetes y pase regional para Hiroshima', notes: 'Comparar precio total y cobertura real; no comprar un JR Pass nacional por defecto.', url: 'https://www.westjr.co.jp/travel-information/en/tickets-passes/jrwest-rail-pass/kansai_hiroshima/' },
    { id: 'flights', title: 'Añadir aeropuertos y horarios de vuelos', notes: 'Llegada y salida quedan ligeras hasta tener los vuelos.' }
  ],
  pendingDecisions: [
    { id: 'cherm-side', original: 'Cherm Side', notes: 'Lugar de Osaka pendiente de identificar. No se inventa dirección ni se sustituye por otro sitio.' },
    { id: 'teamlab-venue', original: 'Team Labs Tokyo', notes: 'Elegir Planets (Toyosu) o Borderless (Azabudai). Se ajustará el resto de ese día al recinto.' },
    { id: 'ebisu', original: 'Hana Ebisu Garden Place Shibuya', notes: 'Interpretado provisionalmente como Yebisu Garden Place y Shibuya. Confirmar si Hana es otro local.' },
    { id: 'cafes', original: 'Aliya Café / Coffee to cannelle', notes: 'Interpretados como cafe AALIYA (Shinjuku) y Coffee to Canelé (Kyoto); confirmar nombres antes de reservar.' }
  ],
  planningNotes: [
    '20 días de calendario y 19 noches. Los días de cambio de ciudad se cuentan una sola vez.',
    'Los hoteles son los indicados por la viajera; no se consideran reservas confirmadas.',
    'Todos los horarios son orientativos y los precios están por confirmar. No se inventa un presupuesto total.',
    '23 de febrero: festivo nacional en Japón. Evitar cargar el día y reservar con margen.',
    'Nintendo Museum cierra normalmente los martes, con excepción de festivos; se propone lunes 22.',
    'Sen no Kaze indica cierre martes y miércoles: se propone viernes 19.',
    'El Museo del Manga cierra habitualmente los miércoles: se propone martes 23, sujeto al calendario.',
    'Hakone depende del clima y del funcionamiento del transporte. Intercambiar con el día flexible del 4 de marzo si conviene.',
    'Hiroshima y Miyajima juntos son una excursión exigente desde Osaka. Alternativa: elegir uno; dos días exigirían revisar hoteles y disponibilidad.',
    'No se cambia ninguna reserva de hotel para aplicar sugerencias. Compras y cafés admiten recortes sin perder los imprescindibles.'
  ],
  sources: [
    { title: 'Nintendo Museum · reservas y calendario', url: 'https://museum.nintendo.com/en/index.html', checkedAt: '2026-11-09' },
    { title: 'Museo del Manga · calendario', url: 'https://kyotomm.jp/calendar/', checkedAt: '2026-11-09' },
    { title: 'Sen no Kaze · web oficial', url: 'https://ramensennokazekyoto.com/?lang=en', checkedAt: '2026-11-09' },
    { title: 'Kichi Kichi · reservas', url: 'https://kichikichi.com/reservation-guides/', checkedAt: '2026-11-09' },
    { title: 'Festivos de Japón · Cabinet Office', url: 'https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html', checkedAt: '2026-11-09' },
    { title: 'JR West · Kansai-Hiroshima Area Pass', url: 'https://www.westjr.co.jp/travel-information/en/tickets-passes/jrwest-rail-pass/kansai_hiroshima/', checkedAt: '2026-11-09' },
    { title: 'Hakone · transporte y avisos oficiales', url: 'https://www.hakonenavi.jp/international/en/', checkedAt: '2026-11-09' }
  ],
  days: [
    day('Tokyo', 'Llegada suave a Otsuka', [
      activity('15:00', 'Llegada y traslado a Otsuka', 'transport', 180, 'Aeropuerto → Otsuka', 'Bloque provisional. Ajustar al vuelo, inmigración y equipaje; no es una hora de aterrizaje confirmada.', { scheduleFlexible: true }),
      activity('18:30', 'Paseo de barrio y cena cerca del hotel', 'food', 75, 'Otsuka', 'Comer y descansar. Si el vuelo llega tarde, saltar el paseo.', { optional: true })
    ], { hotelStayId: 'otsuka-first', pace: 'light' }),
    day('Tokyo', 'Sunshine City y Ueno sin prisa', [
      activity('10:00', 'Sunshine City', 'shopping', 150, 'Ikebukuro', 'Primera exploración sin compras voluminosas.'),
      activity('12:30', 'Almuerzo y traslado a Ueno', 'food', 90, 'Ikebukuro → Ueno'),
      activity('14:00', 'Ueno Park', 'nature', 120, 'Ueno', 'Paseo de invierno. No asumir floración de sakura en estas fechas.'),
      activity('17:00', 'Tanpopo House Otsuka', 'shopping', 60, 'Otsuka', 'Confirmar horario y sucursal; visita fácil de mover a otro día.', { optional: true })
    ], { hotelStayId: 'otsuka-first' }),
    day('Tokyo', 'teamLab y tarde abierta', [
      activity('10:00', 'teamLab Tokyo · recinto por elegir', 'art', 180, 'Toyosu o Azabudai · pendiente', 'Reservar Planets o Borderless. No son intercambiables. La zona del almuerzo depende de la elección.', { reservationRequired: true, reservationStatus: 'pending', venuePending: true }),
      activity('13:30', 'Almuerzo y paseo cerca del recinto', 'food', 120, 'Según teamLab elegido', 'Si elegís Planets, paseo por Toyosu; si elegís Borderless, zona de Azabudai. No recorrer ambos barrios por obligación.', { optional: true })
    ], { hotelStayId: 'otsuka-first', pace: 'light' }),
    day('Tokyo', 'AALIYA, Shibuya y Ebisu', [
      activity('10:00', 'cafe AALIYA · tostadas francesas', 'food', 90, 'Shinjuku-sanchome', 'Interpretación de «Aliya Café». Confirmar nombre y horario.'),
      activity('12:00', 'Shibuya y pausa de almuerzo', 'shopping', 180, 'Shibuya', 'Pasear sin acumular todas las tiendas antes de los traslados.'),
      activity('16:00', 'Yebisu Garden Place', 'sightseeing', 90, 'Ebisu', 'Interpretación provisional de «Hana Ebisu Garden Place Shibuya». Ebisu y Shibuya son zonas distintas.', { optional: true })
    ], { hotelStayId: 'otsuka-first' }),
    day('Kyoto', 'Tokyo → Kyoto · Nishiki y ramen', [
      activity('09:00', 'Traslado Tokyo → Kyoto y dejar equipaje', 'transport', 240, 'Otsuka → Kyoto Station', 'Reservar tren según horario elegido. Bloque puerta a puerta, no horario ferroviario.'),
      activity('13:30', 'Nishiki Market', 'food', 90, 'Centro de Kyoto', 'Almuerzo y paseo antes del cierre de los puestos.'),
      activity('15:30', 'Janpara Kyoto', 'shopping', 60, 'Centro de Kyoto', 'Confirmar la sucursal deseada. Check-in antes o después según energía.'),
      activity('18:00', 'Sen no Kaze Kyoto', 'food', 90, 'Shijo-Kawaramachi', 'La web oficial indica cierre martes y miércoles, efectivo y sin reservas. Prever fila o alternativa cercana.')
    ], { hotelStayId: 'kyoto', isTransferDay: true }),
    day('Kyoto', 'Kyoto oeste · Kinkakuji y Toei', [
      activity('09:00', 'Kinkakuji', 'culture', 90, 'Noroeste de Kyoto'),
      activity('10:30', 'Traslado y almuerzo hacia Uzumasa', 'transport', 120, 'Kinkakuji → Uzumasa', 'Margen para buses o taxi y comida.'),
      activity('12:30', 'Toei Kyoto Studio Park / Uzumasa', 'culture', 240, 'Uzumasa', 'Revisar calendario y atracciones durante la renovación. Plan B: paseo corto por Arashiyama, sin sumar ambos programas completos.', { reservationRequired: true, reservationStatus: 'pending' })
    ], { hotelStayId: 'kyoto' }),
    day('Kyoto', 'Ginkakuji, Gion y algo dulce', [
      activity('09:00', 'Ginkakuji', 'culture', 90, 'Higashiyama norte'),
      activity('11:00', 'Paseo corto y almuerzo', 'food', 120, 'Higashiyama', 'Parte del Camino del Filósofo si apetece; sin esperar cerezos en flor.', { optional: true }),
      activity('14:00', 'Gion Komori · postre', 'food', 90, 'Gion', 'Confirmar horario del local y esperar posible fila.'),
      activity('16:00', 'Gion al atardecer', 'culture', 90, 'Gion', 'Respetar calles privadas, señalización y normas de fotografía.', { optional: true })
    ], { hotelStayId: 'kyoto' }),
    day('Kyoto', 'Nintendo Museum y Uji', [
      activity('08:30', 'Traslado a Uji / Ogura', 'transport', 90, 'Kyoto → Ogura'),
      activity('10:00', 'Nintendo Museum', 'culture', 180, 'Uji · Ogura', 'Fecha y hora supeditadas al sorteo. Si no hay entrada, sustituir por paseo por Uji y té; no marcar como reservado.', { reservationRequired: true, reservationStatus: 'pending' }),
      activity('13:30', 'Almuerzo, té y paseo por Uji', 'food', 150, 'Uji', 'Visita adicional a Byodo-in solo si hay energía y horario.', { optional: true }),
      activity('17:00', 'Regreso tranquilo a Kyoto', 'transport', 90, 'Uji → Kyoto')
    ], { hotelStayId: 'kyoto', isDayTrip: true, baseCity: 'Kyoto' }),
    day('Kyoto', 'Manga, canelé y Kichi Kichi', [
      activity('10:30', 'Kyoto International Manga Museum', 'culture', 150, 'Karasuma Oike', 'Evita el miércoles 24, su cierre habitual. Confirmar calendario del festivo.'),
      activity('13:00', 'Almuerzo libre', 'food', 60, 'Centro de Kyoto'),
      activity('14:30', 'Coffee to Canelé Kyoto', 'food', 60, 'Gokomachi / centro de Kyoto', 'Interpretación de «Coffee to cannelle». Reconfirmar horario; normalmente cierra lunes.'),
      activity('17:30', 'Kichi Kichi Omurice', 'food', 90, 'Pontocho', 'Horario sugerido, no reservado. Seguir el sistema vigente de reservas y mantener una alternativa.', { reservationRequired: true, reservationStatus: 'pending' })
    ], { hotelStayId: 'kyoto', notes: '23 de febrero: festivo nacional. Llevar margen para filas; no sumar otra excursión.' }),
    day('Osaka', 'Kyoto → Osaka · Kuromon y Namba', [
      activity('09:30', 'Traslado Kyoto → Namba y dejar equipaje', 'transport', 150, 'Kyoto → Osaka Namba'),
      activity('12:00', 'Kuromon Market', 'food', 120, 'Nipponbashi', 'Almorzar mientras los puestos están abiertos.'),
      activity('15:00', 'Check-in y descanso', 'hotel', 90, 'Namba'),
      activity('18:00', 'Dotonbori · paseo y cena', 'food', 90, 'Namba', 'Idea adicional cercana al hotel; opcional.', { optional: true })
    ], { hotelStayId: 'osaka', isTransferDay: true, pace: 'light' }),
    day('Osaka', 'Nipponbashi · Volks y maid café', [
      activity('11:00', 'Volks Osaka', 'shopping', 120, 'Nipponbashi / Den Den Town'),
      activity('13:30', 'at-home cafe Osaka Nipponbashi', 'food', 120, 'Nipponbashi', 'Revisar sucursal, espera, reglas de fotos y cargos por tiempo/consumo.'),
      activity('16:00', 'Den Den Town a tu ritmo', 'shopping', 90, 'Nipponbashi', 'Surugaya u otras tiendas cercanas si quedan ganas.', { optional: true })
    ], { hotelStayId: 'osaka' }),
    day('Osaka', 'Hiroshima y Miyajima · excursión larga', [
      activity('07:00', 'Namba → Shin-Osaka → Hiroshima', 'transport', 180, 'Osaka → Hiroshima', 'Reservar ida y vuelta. Tiempo orientativo puerta a puerta.'),
      activity('10:00', 'Parque Memorial de la Paz', 'culture', 90, 'Hiroshima', 'Museo solo si se prioriza Hiroshima; no comprimir una visita sensible entre trenes.'),
      activity('11:30', 'Almuerzo y traslado a Miyajima', 'transport', 120, 'Hiroshima → Miyajimaguchi → Miyajima', 'Incluye margen para comida, tren, espera y ferry.'),
      activity('13:30', 'Miyajima e Itsukushima', 'culture', 150, 'Miyajima', 'Consultar mareas, ferry y último acceso. Sin Monte Misen en este programa.'),
      activity('16:00', 'Regreso Miyajima → Hiroshima → Namba', 'transport', 300, 'Miyajima → Osaka', 'Margen de seguridad antes del tren. Llegada prevista orientativa hacia las 21:00.')
    ], { hotelStayId: 'osaka', isDayTrip: true, baseCity: 'Osaka', pace: 'intense', notes: 'Unas 14 horas fuera. Mi recomendación es elegir Hiroshima o Miyajima si querés una jornada más tranquila. Mantener el hotel de Osaka.' }),
    day('Osaka', 'Día de recuperación y pendientes', [
      activity('11:00', 'Mañana libre y brunch', 'food', 120, 'Namba', 'Descansar después de la excursión.'),
      activity('14:00', 'Compras pendientes o paseo cercano', 'shopping', 120, 'Namba / Shinsaibashi', 'Hueco para «Cherm Side» cuando confirmes qué lugar es. No hay dirección asumida.', { optional: true })
    ], { hotelStayId: 'osaka', pace: 'light', notes: 'Si se descarta parte de Hiroshima/Miyajima, este día sigue siendo flexible. No se cambia automáticamente ningún hotel.' }),
    day('Tokyo', 'Osaka → Tokyo · regreso a Otsuka', [
      activity('10:00', 'Traslado Osaka → Tokyo → Otsuka', 'transport', 300, 'Namba → Shin-Osaka → Tokyo → Otsuka', 'Check-out, tren y equipaje sin prisas.'),
      activity('15:30', 'Check-in en APA Otsuka y descanso', 'hotel', 90, 'Otsuka'),
      activity('18:00', 'Cena de barrio', 'food', 60, 'Otsuka', 'Día de traslado: no agregar excursiones.', { optional: true })
    ], { hotelStayId: 'otsuka-return', isTransferDay: true, pace: 'light' }),
    day('Tokyo', 'Hakone · naturaleza según el clima', [
      activity('07:30', 'Otsuka → Hakone', 'transport', 180, 'Tokyo → Hakone', 'Elegir ruta y billetes después de revisar operación y pronóstico.'),
      activity('10:30', 'Hakone · recorrido corto adaptable', 'nature', 240, 'Hakone', 'Elegir dos zonas, por ejemplo Gora y lago Ashi, según transporte. Pausa de almuerzo incluida. No prometer vistas del Fuji.', { scheduleFlexible: true }),
      activity('15:00', 'Margen y regreso a Otsuka', 'transport', 240, 'Hakone → Tokyo', 'Plan B con mal clima: Museo al Aire Libre y regreso temprano, o cambiar con el 4 de marzo.')
    ], { hotelStayId: 'otsuka-return', isDayTrip: true, baseCity: 'Tokyo', weatherDependent: true }),
    day('Tokyo', 'Kamakura · templos y costa', [
      activity('08:30', 'Traslado a Kamakura', 'transport', 120, 'Otsuka → Kamakura'),
      activity('10:30', 'Kamakura · paseo y almuerzo', 'culture', 150, 'Kamakura', 'Elegir el centro y un templo; evitar correr por todos.'),
      activity('13:30', 'Hase o costa según energía', 'nature', 120, 'Hase / Kamakura', 'Idea: Hasedera o Gran Buda; decidir según clima y movilidad.', { optional: true }),
      activity('16:00', 'Regreso a Otsuka', 'transport', 120, 'Kamakura → Tokyo')
    ], { hotelStayId: 'otsuka-return', isDayTrip: true, baseCity: 'Tokyo' }),
    day('Tokyo', 'Nakano Broadway y tiendas de Shinjuku', [
      activity('12:00', 'Nakano Broadway y Mandarake', 'shopping', 180, 'Nakano', 'Muchas tiendas abren cerca del mediodía; verificar la sucursal.'),
      activity('15:30', 'Bic Camera y Book Off', 'shopping', 150, 'Shinjuku', 'Elegir sucursales próximas y comparar antes de comprar. No buscar todas las tiendas de la cadena.')
    ], { hotelStayId: 'otsuka-return' }),
    day('Tokyo', 'Shimokitazawa · segunda mano y cafés', [
      activity('11:00', 'Shimokitazawa y Mode Off', 'shopping', 180, 'Shimokitazawa', 'Comprobar sucursal. Dejar pausas y margen para probar ropa.'),
      activity('14:30', 'Café, paseo o Surugaya pendiente', 'shopping', 120, 'Tokyo · elegir una zona', 'Surugaya se puede adelantar a Nipponbashi o agrupar con las compras del día anterior.', { optional: true })
    ], { hotelStayId: 'otsuka-return', pace: 'light', notes: 'Día intercambiable con Hakone si el pronóstico lo aconseja. No se intercambian reservas confirmadas automáticamente.' }),
    day('Tokyo', 'Otsuka · últimas compras y maletas', [
      activity('10:00', 'Daiso Otsuka y pendientes de barrio', 'shopping', 90, 'Otsuka', 'Confirmar sucursal. Reservar espacio y peso en la maleta.'),
      activity('12:00', 'Don Quijote · sucursal cercana por elegir', 'shopping', 90, 'Otsuka / Ikebukuro', 'Visita opcional, sin compras voluminosas si no hay franquicia de equipaje.', { optional: true }),
      activity('15:00', 'Preparar equipaje y confirmar salida', 'other', 120, 'Otsuka', 'Guardar documentos, confirmar transporte al aeropuerto y revisar líquidos/equipaje.')
    ], { hotelStayId: 'otsuka-return', pace: 'light' }),
    day('Tokyo', 'Despedida y vuelo de regreso', [
      activity('09:00', 'Check-out y traslado al aeropuerto', 'transport', 240, 'Otsuka → aeropuerto por confirmar', 'Hora provisional. Calcular hacia atrás desde el vuelo y el margen que indique la aerolínea; sin compras ni excursiones antes del vuelo.', { scheduleFlexible: true })
    ], { hotelStayId: 'otsuka-return', isDepartureDay: true, pace: 'light' })
  ]
};
