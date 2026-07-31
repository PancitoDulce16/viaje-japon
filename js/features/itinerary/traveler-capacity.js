export function buildTravelerCapacity(ages = [], mobilityNeeds = null) {
  const normalized = ages.map(Number).filter(Number.isFinite);
  const hasToddler = normalized.some(age => age < 6);
  const hasChild = normalized.some(age => age >= 6 && age < 12);
  const hasSenior = normalized.some(age => age >= 65);
  let multiplier = 1, maxEnergyCost = 8;
  let label = 'Ritmo general';
  let note = 'Ritmo calculado para viajeros sin necesidades físicas indicadas.';

  if (hasToddler) {
    multiplier = .65; maxEnergyCost = 4; label = 'Familia con peque';
    note = 'Menos visitas largas, pausas frecuentes y regreso sencillo al hotel.';
  } else if (hasSenior) {
    multiplier = .75; maxEnergyCost = 5; label = 'Ritmo senior';
    note = 'Alternamos caminatas con descansos y evitamos encadenar pendientes.';
  } else if (hasChild) {
    multiplier = .85; maxEnergyCost = 6; label = 'Ritmo familiar';
    note = 'Bloques más cortos y una pausa amplia a mitad del día.';
  }
  if (mobilityNeeds === 'limited') {
    multiplier = Math.min(multiplier, .7); maxEnergyCost = Math.min(maxEnergyCost, 4); label = 'Movilidad tranquila';
    note = 'Priorizamos accesos sencillos, transporte y pausas sentadas.';
  } else if (mobilityNeeds === 'wheelchair') {
    multiplier = Math.min(multiplier, .6); maxEnergyCost = Math.min(maxEnergyCost, 3); label = 'Ruta accesible';
    note = 'Priorizamos accesibilidad verificada y traslados con margen.';
  }
  return {
    label, note, activityMultiplier: multiplier, maxEnergyCost,
    exertionMultiplier: multiplier < .7 ? 1.35 : multiplier < .85 ? 1.2 : multiplier < 1 ? 1.1 : 1,
    needsAdaptation: multiplier < 1
  };
}
