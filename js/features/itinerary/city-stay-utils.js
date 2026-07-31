// Identifica cada aparición de una ciudad como una estancia distinta.
export function annotateCityStays(cityDistribution) {
  const stops = cityDistribution || [];
  const totals = stops.reduce((counts, stop) => {
    const key = String(stop.city || '').toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const counters = {};
  stops.forEach((stop, stopIndex) => {
    const key = String(stop.city || '').toLowerCase();
    counters[key] = (counters[key] || 0) + 1;
    stop.stopIndex = stopIndex;
    stop.cityVisitIndex = counters[key];
    stop.cityVisitCount = totals[key];
    stop.stayId = stop.stayId || `${key}-stay-${stop.cityVisitIndex}`;
  });
  return stops;
}
