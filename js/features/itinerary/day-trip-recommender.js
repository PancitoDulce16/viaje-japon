const DAY_TRIPS = {
  tokyo: [
    { city: 'Kamakura', minutes: 55, icon: '🌊', note: 'templos, costa y calles históricas' },
    { city: 'Nikko', minutes: 120, icon: '🌲', note: 'santuarios entre cedros y montaña' },
    { city: 'Hakone', minutes: 90, icon: '♨️', note: 'onsen, lago y vistas del Fuji' },
    { city: 'Yokohama', minutes: 35, icon: '⚓', note: 'puerto, jardines y cena frente al mar' }
  ],
  kyoto: [
    { city: 'Nara', minutes: 45, icon: '🦌', note: 'parque, templos y un ritmo más pausado' },
    { city: 'Osaka', minutes: 30, icon: '🏮', note: 'barrios eléctricos y cocina callejera' },
    { city: 'Himeji', minutes: 55, icon: '🏯', note: 'el gran castillo blanco de Japón' }
  ],
  osaka: [
    { city: 'Nara', minutes: 45, icon: '🦌', note: 'parque, templos y senderos históricos' },
    { city: 'Kyoto', minutes: 30, icon: '⛩️', note: 'santuarios y jardines clásicos' },
    { city: 'Kobe', minutes: 30, icon: '⚓', note: 'puerto, arquitectura y gastronomía' }
  ],
  kanazawa: [
    { city: 'Shirakawago', minutes: 85, icon: '🏔️', note: 'aldeas gassho-zukuri entre montañas' },
    { city: 'Takayama', minutes: 130, icon: '🏘️', note: 'casco antiguo y cultura de los Alpes' }
  ]
};

const keyOf = value => String(value || '').trim().toLowerCase();

export function getDayTripSuggestions(cityStops = [], totalDays = 0) {
  const overnightStops = cityStops.filter(stop => !stop.isDayTrip);
  if (Number(totalDays) < 5 || overnightStops.length !== 1) return [];

  const base = overnightStops[0];
  const existing = new Set(cityStops.filter(stop => stop.isDayTrip).map(stop => keyOf(stop.city)));
  const limit = Number(totalDays) >= 9 ? 3 : 2;
  return (DAY_TRIPS[keyOf(base.city)] || []).slice(0, limit).map(trip => ({
    ...trip,
    baseCity: base.city,
    added: existing.has(keyOf(trip.city))
  }));
}
