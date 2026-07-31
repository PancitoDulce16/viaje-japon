function parseLocalISO(value) {
  const [year, month, day] = String(value || '').split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
}

export function dateForTripDay(startISO, dayNumber) {
  const date = parseLocalISO(startISO);
  if (!date) return { date: null, iso: '' };
  date.setDate(date.getDate() + Math.max(0, Number(dayNumber || 1) - 1));
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return { date, iso };
}

export function detectDaySeason(startISO, dayNumber, city = '') {
  const { date, iso } = dateForTripDay(startISO, dayNumber);
  if (!date) return null;
  const month = date.getMonth() + 1, day = date.getDate();
  const cityKey = String(city).toLowerCase();

  if ((month === 12 && day >= 31) || (month === 1 && day <= 3)) {
    return { key: 'new-year', name: 'Año Nuevo · お正月', icon: '🎍', art: 'snowflakes.webp', inPeak: true, bonus: 24,
      recommendations: ['Meiji Shrine', 'Senso-ji', 'Fushimi Inari', 'Santuario', 'Templo'],
      tips: 'Priorizamos hatsumōde y espacios abiertos; muchas tiendas y museos reducen horarios.', iso };
  }
  if (month === 12 && day >= 20 && day <= 25) {
    return { key: 'christmas', name: 'Navidad en Japón', icon: '✨', art: 'snowflakes.webp', inPeak: true, bonus: 18,
      recommendations: ['Roppongi', 'Tokyo Station', 'Shibuya', 'Illumination', 'Mirador'],
      tips: 'Reservamos la tarde para iluminaciones y recomendamos reservar la cena.', iso };
  }
  const sakuraStart = ['kyoto', 'osaka', 'nara'].includes(cityKey) ? 27 : 23;
  if ((month === 3 && day >= sakuraStart) || (month === 4 && day <= 12)) {
    return { key: 'sakura', name: 'Sakura · 桜', icon: '🌸', art: 'sakura-petals.webp', inPeak: month === 4 && day <= 7, bonus: 22,
      recommendations: ['Ueno', 'Shinjuku Gyoen', 'Maruyama', 'Arashiyama', 'Park', 'Garden', 'Parque', 'Jardín'],
      tips: 'Los parques entran temprano y dejamos margen para hanami sin prisas.', iso };
  }
  if (month === 11 && day >= 10) {
    return { key: 'momiji', name: 'Momiji · 紅葉', icon: '🍁', art: 'momiji-leaves.webp', inPeak: day >= 18, bonus: 20,
      recommendations: ['Arashiyama', 'Tofuku-ji', 'Eikando', 'Garden', 'Temple', 'Jardín', 'Templo'],
      tips: 'Priorizamos jardines y templos con follaje antes de las horas más concurridas.', iso };
  }
  if (month === 6 || (month === 7 && day <= 15)) {
    return { key: 'rainy-season', name: 'Temporada de lluvia · 梅雨', icon: '☔', art: null, inPeak: month === 6, bonus: 8,
      recommendations: ['Museum', 'Market', 'Aquarium', 'Shopping', 'Museo', 'Mercado'],
      tips: 'Alternamos interiores con paseos cortos y dejamos traslados flexibles.', iso };
  }
  if ([1, 2].includes(month) && ['sapporo', 'nagano', 'kanazawa', 'takayama'].includes(cityKey)) {
    return { key: 'snow', name: 'Nieve · 雪', icon: '❄️', art: 'snowflakes.webp', inPeak: true, bonus: 15,
      recommendations: ['Onsen', 'Illumination', 'Market'],
      tips: 'Añadimos margen por nieve y evitamos encadenar demasiados trayectos exteriores.', iso };
  }
  return null;
}
