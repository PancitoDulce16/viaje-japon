/** Canonical registry for generated Japitin illustrations. */
const BASE = '/images/illustrations/generated';

export const JAPITIN_ILLUSTRATIONS = Object.freeze({
  empty: Object.freeze({
    favorites: `${BASE}/empty-states/favorites.webp`, notes: `${BASE}/empty-states/notes.webp`,
    itinerary: `${BASE}/empty-states/itinerary.webp`, expenses: `${BASE}/empty-states/expenses.webp`,
    search: `${BASE}/empty-states/search-no-results.webp`, packing: `${BASE}/empty-states/packing.webp`,
    chat: `${BASE}/empty-states/chat.webp`
  }),
  loading: Object.freeze({
    generic: `${BASE}/loading/paper-plane.webp`, route: `${BASE}/loading/train-route.webp`
  }),
  food: Object.freeze({
    ramen: `${BASE}/food/tonkotsu-ramen.webp`, sushi: `${BASE}/food/sushi-set.webp`,
    matcha: `${BASE}/food/matcha-dessert.webp`, konbini: `${BASE}/food/konbini-snacks.webp`
  }),
  nature: Object.freeze({ bamboo: `${BASE}/nature/arashiyama-bamboo.webp` }),
  transport: Object.freeze({
    train: `${BASE}/transportation/local-train.webp`, shinkansen: `${BASE}/transportation/shinkansen.webp`,
    bus: `${BASE}/transportation/city-bus.webp`, ferry: `${BASE}/transportation/ferry.webp`
  }),
  places: Object.freeze({
    shopping: `${BASE}/shopping/nakamise-market.webp`, konbini: `${BASE}/shopping/konbini-interior.webp`,
    shrine: `${BASE}/shrines/shrine-grounds.webp`, torii: `${BASE}/shrines/torii-gate.webp`,
    airportArrival: `${BASE}/airport/arrival.webp`, airportDeparture: `${BASE}/airport/departure.webp`
  }),
  maps: Object.freeze({
    japan: `${BASE}/maps/japan-overview.webp`, kyoto: `${BASE}/maps/kyoto-district.webp`
  }),
  weather: Object.freeze({
    sunnyDay: `${BASE}/weather/sunny-day.webp`, cloudyDay: `${BASE}/weather/cloudy-day.webp`,
    rainyDay: `${BASE}/weather/rainy-day.webp`, snowyDay: `${BASE}/weather/snowy-day.webp`,
    clearNight: `${BASE}/weather/clear-night.webp`, cloudyNight: `${BASE}/weather/cloudy-night.webp`,
    rainyNight: `${BASE}/weather/rainy-night.webp`, snowyNight: `${BASE}/weather/snowy-night.webp`
  })
});

export function weatherIllustration(weather = {}) {
  const night = String(weather.icon || '').endsWith('n');
  const main = String(weather.main || '').toLowerCase();
  const rainy = weather.isRainy || /rain|drizzle|thunder/.test(main);
  if (rainy) return night ? JAPITIN_ILLUSTRATIONS.weather.rainyNight : JAPITIN_ILLUSTRATIONS.weather.rainyDay;
  if (main === 'snow') return night ? JAPITIN_ILLUSTRATIONS.weather.snowyNight : JAPITIN_ILLUSTRATIONS.weather.snowyDay;
  if (/cloud|mist|fog|haze/.test(main)) return night ? JAPITIN_ILLUSTRATIONS.weather.cloudyNight : JAPITIN_ILLUSTRATIONS.weather.cloudyDay;
  return night ? JAPITIN_ILLUSTRATIONS.weather.clearNight : JAPITIN_ILLUSTRATIONS.weather.sunnyDay;
}

export function activityIllustration(activity = {}) {
  const hay = `${activity.category || ''} ${activity.categoryName || ''} ${activity.icon || activity.categoryIcon || ''} ${activity.title || activity.name || ''}`.toLowerCase();
  if (/shinkansen|bullet train|tren bala/.test(hay)) return JAPITIN_ILLUSTRATIONS.transport.shinkansen;
  if (/ferry|ferri|barco/.test(hay)) return JAPITIN_ILLUSTRATIONS.transport.ferry;
  if (/bus|autobús|autobus/.test(hay)) return JAPITIN_ILLUSTRATIONS.transport.bus;
  if (/metro|train|tren|ferrocarril/.test(hay)) return JAPITIN_ILLUSTRATIONS.transport.train;
  if (/ramen/.test(hay)) return JAPITIN_ILLUSTRATIONS.food.ramen;
  if (/sushi/.test(hay)) return JAPITIN_ILLUSTRATIONS.food.sushi;
  if (/matcha|wagashi|postre|dessert/.test(hay)) return JAPITIN_ILLUSTRATIONS.food.matcha;
  if (/konbini|convenience/.test(hay)) return JAPITIN_ILLUSTRATIONS.food.konbini;
  if (/bambú|bambu|arashiyama/.test(hay)) return JAPITIN_ILLUSTRATIONS.nature.bamboo;
  if (/torii|fushimi/.test(hay)) return JAPITIN_ILLUSTRATIONS.places.torii;
  if (/shrine|santuario|templo|temple/.test(hay)) return JAPITIN_ILLUSTRATIONS.places.shrine;
  if (/shopping|compras|mercado|market/.test(hay)) return JAPITIN_ILLUSTRATIONS.places.shopping;
  return null;
}

if (typeof window !== 'undefined') window.JapitinIllustrations = JAPITIN_ILLUSTRATIONS;
