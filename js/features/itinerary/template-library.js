import { ITINERARY_TEMPLATES } from '../../../data/itinerary-templates.js';

const ALIASES = { 'japan-15-days-complete-2025': 'japan-15-days-complete', 'otaku-paradise': 'japan-15-days-complete' };
const DAY_MS = 86400000;
export const templateCatalog = ITINERARY_TEMPLATES;

export function parseCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) throw new Error('Elegí una fecha válida.');
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('Elegí una fecha válida.');
  return date;
}
export function shiftCalendarDate(start, offset) {
  const date = parseCalendarDate(start);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}
export function getTemplate(id) {
  const template = templateCatalog.find(item => item.id === (ALIASES[id] || id));
  if (!template) throw new Error('No encontramos esa plantilla. Elegí una de la biblioteca.');
  return template;
}
export function templateStartDate(template) {
  if (template.defaultStartDate) return template.defaultStartDate;
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// The catalog stays immutable. Every use gets its own days, hotels, IDs and dates.
export function instantiateTemplate(id, { dateStart, dateEnd } = {}) {
  const template = structuredClone(getTemplate(id));
  const start = dateStart || templateStartDate(template);
  parseCalendarDate(start);
  if (!template.days?.length || template.days.length !== template.duration) throw new Error('La duración de la plantilla no coincide con sus días.');
  const end = shiftCalendarDate(start, template.duration - 1);
  if (dateEnd && dateEnd !== end) throw new Error(`Esta plantilla necesita ${template.duration} días. Con este inicio termina el ${end}; ajustá las fechas antes de crear el viaje.`);
  const originalStart = template.defaultStartDate || template.days[0].date;
  const offsetOf = value => Math.round((parseCalendarDate(value) - parseCalendarDate(originalStart)) / DAY_MS);
  const hotels = (template.hotels || []).map((hotel, index) => {
    const inOffset = hotel.checkInOffset ?? offsetOf(hotel.checkIn);
    const outOffset = hotel.checkOutOffset ?? offsetOf(hotel.checkOut);
    return { ...hotel, id: hotel.id || `hotel-${index + 1}`, checkIn: shiftCalendarDate(start, inOffset), checkOut: shiftCalendarDate(start, outOffset), nights: outOffset - inOffset, status: hotel.status || 'por-confirmar' };
  });
  const days = template.days.map((day, index) => {
    const date = shiftCalendarDate(start, index);
    const hotel = hotels.find(item => item.id === day.hotelStayId) || hotels.find(item => item.city === day.city && date >= item.checkIn && (date < item.checkOut || (index === template.days.length - 1 && date === item.checkOut)));
    return {
      ...day, day: index + 1, date, cityId: day.city.toLowerCase(),
      ...(hotel ? { hotel } : {}),
      activities: (day.activities || []).map((activity, activityIndex) => ({
        ...activity, id: `tpl-${template.id}-${index + 1}-${activityIndex + 1}`,
        title: activity.title || activity.name || activity.activity || 'Actividad',
        description: activity.description || activity.notes || '',
        ...(activity.reservationRequired ? { reservationStatus: 'pending' } : {})
      }))
    };
  });
  return {
    template,
    tripData: { name: template.name, destination: 'Japón', dateStart: start, dateEnd: end, totalDays: template.duration, cities: template.cities, accommodations: hotels, templateId: template.id, useTemplate: true },
    itineraryData: {
      version: 'v3', templateId: template.id, templateVersion: template.version || '1.0.0', days,
      hotels: Object.fromEntries(hotels.map(hotel => {
        const stayDays = days.filter(day => day.hotel?.id === hotel.id);
        return [stayDays.length ? `${hotel.city}_${stayDays[0].day}-${stayDays.at(-1).day}` : hotel.id, hotel];
      })),
      templatePlanning: {
        name: template.name, originalStartDate: originalStart || null,
        datesChanged: !!originalStart && start !== originalStart,
        bookingChecklist: template.bookingChecklist || [], pendingDecisions: template.pendingDecisions || [],
        notes: template.planningNotes || [], sources: template.sources || []
      }
    }
  };
}

// Compensate only a newly created trip if its itinerary fails to save. Never touch
// an existing trip, and never report a successful template with an empty itinerary.
export async function persistTemplateTrip({ saveTrip, saveItinerary, removeNewTrip }, trip, itinerary) {
  await saveTrip(trip);
  if (!itinerary) return;
  try {
    await saveItinerary(itinerary);
  } catch (error) {
    try { await removeNewTrip(); }
    catch { throw new Error('El viaje se creó, pero la plantilla no se pudo guardar. Revisá Mis viajes antes de volver a crearlo.', { cause: error }); }
    throw new Error('No se pudo guardar la plantilla. No se creó un viaje vacío; podés intentarlo de nuevo.', { cause: error });
  }
}
