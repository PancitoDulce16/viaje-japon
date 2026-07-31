import { buildIntercityTransfer, formatTransferDuration } from './intercity-transfer.js';

export function analyzeRoutePressure(cityStops = [], totalDays = 0) {
  const overnightStops = cityStops.filter(stop => !stop.isDayTrip);
  const transfers = [];
  for (let index = 1; index < overnightStops.length; index++) {
    const from = overnightStops[index - 1];
    const to = overnightStops[index];
    const plan = buildIntercityTransfer({ city: from.city }, { city: to.city });
    if (plan) transfers.push(plan);
  }

  const hotelChanges = Math.max(0, overnightStops.length - 1);
  const oneNightStops = overnightStops.filter(stop => Number(stop.days) <= 1);
  const longTransfers = transfers.filter(plan => plan.durationMinutes >= 150);
  const daysPerBase = overnightStops.length ? Number(totalDays) / overnightStops.length : 0;
  const severity = hotelChanges >= 6 || daysPerBase < 1.8
    ? 'high'
    : hotelChanges >= 4 || longTransfers.length >= 2
      ? 'medium'
      : 'low';

  if (severity === 'low') return null;
  const longest = [...transfers].sort((a, b) => b.durationMinutes - a.durationMinutes)[0] || null;
  return {
    severity,
    hotelChanges,
    oneNightStops: oneNightStops.map(stop => stop.city),
    longTransfers: longTransfers.length,
    daysPerBase: Math.round(daysPerBase * 10) / 10,
    longest: longest ? {
      from: longest.from,
      to: longest.to,
      minutes: longest.durationMinutes,
      label: formatTransferDuration(longest.durationMinutes)
    } : null,
    message: severity === 'high'
      ? 'La ruta se sentirá como varios viajes encadenados. Habrá poco margen para instalarte y disfrutar cada base.'
      : 'La ruta es posible, pero varios cambios de alojamiento consumirán tiempo que ahora no aparece como visita.'
  };
}
