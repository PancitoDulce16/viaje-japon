// data/transport-times-data.js - Tiempos de transporte entre estaciones principales

export const TRANSPORT_TIMES = {
  Tokyo: {
    // Shibuya como hub principal
    'Shibuya Station': {
      'Shinjuku Station': { time: 7, line: 'JR Yamanote Line', cost: 160 },
      'Harajuku Station': { time: 3, line: 'JR Yamanote Line', cost: 140 },
      'Tokyo Station': { time: 15, line: 'JR Yamanote Line', cost: 200 },
      'Asakusa Station': { time: 25, line: 'Ginza Line', cost: 200 },
      'Ueno Station': { time: 30, line: 'Ginza Line', cost: 200 },
      'Roppongi Station': { time: 10, line: 'Hibiya Line', cost: 170 },
      'Akihabara Station': { time: 20, line: 'JR Yamanote Line', cost: 170 },
      'Ikebukuro Station': { time: 15, line: 'JR Yamanote Line', cost: 170 }
    },
    'Shinjuku Station': {
      'Shibuya Station': { time: 7, line: 'JR Yamanote Line', cost: 160 },
      'Tokyo Station': { time: 15, line: 'JR Chuo Line', cost: 200 },
      'Harajuku Station': { time: 5, line: 'JR Yamanote Line', cost: 140 },
      'Asakusa Station': { time: 30, line: 'Oedo Line', cost: 220 },
      'Odaiba': { time: 25, line: 'Oedo Line + Yurikamome', cost: 400 },
      'Ikebukuro Station': { time: 8, line: 'JR Yamanote Line', cost: 160 }
    },
    'Tokyo Station': {
      'Shibuya Station': { time: 15, line: 'JR Yamanote Line', cost: 200 },
      'Shinjuku Station': { time: 15, line: 'JR Chuo Line', cost: 200 },
      'Asakusa Station': { time: 15, line: 'Ginza Line', cost: 170 },
      'Ueno Station': { time: 5, line: 'JR Yamanote Line', cost: 140 },
      'Tsukijishijo Station': { time: 5, line: 'Hibiya Line', cost: 170 }
    },
    'Asakusa Station': {
      'Shibuya Station': { time: 25, line: 'Ginza Line', cost: 200 },
      'Tokyo Station': { time: 15, line: 'Ginza Line', cost: 170 },
      'Ueno Station': { time: 8, line: 'Ginza Line', cost: 170 },
      'Akihabara Station': { time: 10, line: 'Tsukuba Express', cost: 160 }
    },
    'Harajuku Station': {
      'Shibuya Station': { time: 3, line: 'JR Yamanote Line', cost: 140 },
      'Shinjuku Station': { time: 5, line: 'JR Yamanote Line', cost: 140 },
      'Tokyo Station': { time: 20, line: 'JR Yamanote Line', cost: 200 }
    },
    'Ueno Station': {
      'Asakusa Station': { time: 8, line: 'Ginza Line', cost: 170 },
      'Tokyo Station': { time: 5, line: 'JR Yamanote Line', cost: 140 },
      'Akihabara Station': { time: 3, line: 'JR Yamanote Line', cost: 140 }
    }
  },

  Kyoto: {
    'Kyoto Station': {
      'Fushimi Inari Station': { time: 5, line: 'JR Nara Line', cost: 150 },
      'Arashiyama Station': { time: 15, line: 'JR Sagano Line', cost: 240 },
      'Gion-Shijo Station': { time: 10, line: 'Keihan Line', cost: 210 },
      'Kawaramachi Station': { time: 8, line: 'Karasuma Line', cost: 220 }
    },
    'Gion-Shijo Station': {
      'Kyoto Station': { time: 10, line: 'Keihan Line', cost: 210 },
      'Kiyomizu-dera': { time: 10, line: 'Bus 100/206', cost: 230 },
      'Arashiyama Station': { time: 25, line: 'Keihan + Hankyu', cost: 400 }
    },
    'Arashiyama Station': {
      'Kyoto Station': { time: 15, line: 'JR Sagano Line', cost: 240 },
      'Gion-Shijo Station': { time: 25, line: 'Hankyu + Keihan', cost: 400 }
    },
    'Kawaramachi Station': {
      'Kyoto Station': { time: 8, line: 'Karasuma Line', cost: 220 },
      'Gion-Shijo Station': { time: 5, line: 'Walking', cost: 0 }
    }
  },

  Osaka: {
    'Namba Station': {
      'Umeda Station': { time: 10, line: 'Midosuji Line', cost: 230 },
      'Osaka Station': { time: 12, line: 'Midosuji Line', cost: 230 },
      'Shinsaibashi Station': { time: 2, line: 'Midosuji Line', cost: 180 },
      'Shinsekai': { time: 8, line: 'Midosuji Line', cost: 180 },
      'Osaka Castle': { time: 20, line: 'Tanimachi Line', cost: 230 }
    },
    'Umeda Station': {
      'Namba Station': { time: 10, line: 'Midosuji Line', cost: 230 },
      'Osaka Castle': { time: 15, line: 'Tanimachi Line', cost: 230 },
      'Shinsaibashi Station': { time: 8, line: 'Midosuji Line', cost: 230 }
    },
    'Osaka Station': {
      'Namba Station': { time: 12, line: 'Midosuji Line', cost: 230 },
      'Kyoto Station': { time: 30, line: 'JR Special Rapid', cost: 560 }
    },
    'Shinsaibashi Station': {
      'Namba Station': { time: 2, line: 'Midosuji Line', cost: 180 },
      'Umeda Station': { time: 8, line: 'Midosuji Line', cost: 230 }
    }
  }
};

/**
 * Calcula el tiempo y costo de transporte entre dos estaciones
 */
export function getTransportInfo(fromStation, toStation, city) {
  // Normalize station names
  const normalizeStation = (station) => {
    if (!station) return '';
    // Add "Station" if not present
    return station.includes('Station') ? station : `${station} Station`;
  };

  const from = normalizeStation(fromStation);
  const to = normalizeStation(toStation);

  // Si es la misma estación o lugares muy cercanos
  if (from === to || !from || !to) {
    return { time: 0, line: 'Same location', cost: 0, distance: 'same' };
  }

  // Buscar en la base de datos de la ciudad
  const cityData = TRANSPORT_TIMES[city];
  if (!cityData) {
    // Ciudad no encontrada, usar estimación genérica
    return { time: 20, line: 'Metro/Train', cost: 200, distance: 'estimated' };
  }

  // Buscar ruta directa
  if (cityData[from] && cityData[from][to]) {
    return { ...cityData[from][to], distance: 'direct' };
  }

  // Buscar ruta inversa
  if (cityData[to] && cityData[to][from]) {
    return { ...cityData[to][from], distance: 'direct' };
  }

  // No hay ruta directa en la BD, usar estimación
  return { time: 25, line: 'Metro/Train', cost: 220, distance: 'estimated' };
}

/**
 * Calcula el tiempo total de transporte para un día
 */
export function calculateDayTransportTime(activities) {
  if (!activities || activities.length <= 1) return 0;

  let totalTime = 0;
  let totalCost = 0;
  const routes = [];

  for (let i = 0; i < activities.length - 1; i++) {
    const current = activities[i];
    const next = activities[i + 1];

    // Skip if it's a meal (no transport needed, usually nearby)
    if (next.isMeal) continue;

    const transport = getTransportInfo(
      current.station,
      next.station,
      current.cityName || current.city
    );

    totalTime += transport.time;
    totalCost += transport.cost;
    routes.push({
      from: current.station,
      to: next.station,
      ...transport
    });
  }

  return { totalTime, totalCost, routes };
}

export default { TRANSPORT_TIMES, getTransportInfo, calculateDayTransportTime };
