import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { instantiateTemplate } from '../js/features/itinerary/template-library.js';

const id = process.argv[2] || 'japan-february-2027';
if (!/^[a-z0-9-]+$/.test(id)) throw new Error('ID de plantilla no válido.');
const { template, tripData, itineraryData } = instantiateTemplate(id);
const date = value => new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
const cell = value => String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const lines = [
  `# ${template.name}`, '',
  `**${date(tripData.dateStart)} – ${date(tripData.dateEnd)} · ${template.duration} días y ${template.duration - 1} noches.**`, '',
  'Para usarlo: **Crear viaje → formulario simple → elegir esta plantilla**, o **generador → Ver plantillas**. Revisá la ruta antes de crear el viaje. Después, cada actividad se puede editar.', '',
  'Los horarios son sugerencias, no reservas ni horarios de tren confirmados. Hoteles, precios y entradas quedan por confirmar. La plantilla crea un viaje nuevo y no reemplaza uno existente.', '',
  '## Tus hoteles', '', '| Estancia | Hotel | Entrada | Salida | Noches |', '| --- | --- | --- | --- | --- |',
  ...tripData.accommodations.map((hotel, index) => `| ${index + 1} · ${hotel.city} | ${cell(hotel.name)} | ${hotel.checkIn} | ${hotel.checkOut} | ${hotel.nights} |`), '',
  '## Ruta por día', '', '| Día | Fecha | Base para dormir | Plan |', '| --- | --- | --- | --- |',
  ...itineraryData.days.map(day => `| ${day.day} | ${date(day.date)} | ${day.isDepartureDay ? 'Salida' : day.city} | **${cell(day.title)}**. ${cell(day.activities.map(activity => activity.title).join(' → '))} |`), '',
  '## Reservas y preparativos', '',
  ...(template.bookingChecklist || []).map(item => `- **${item.title}**${item.dueDate ? `: ${item.dueDate}, ${item.deadlineLocalTime} (${item.timeZone})` : ''}. ${item.notes}${item.url ? ` [Fuente](${item.url}).` : ''}`), '',
  '## Ideas y criterios para acomodarlo', '', ...(template.planningNotes || []).map(note => `- ${note}`), '',
  'Mi recomendación para Hiroshima/Miyajima es priorizar uno si preferís ir con calma. La versión guardada conserva ambos como tu idea original, explica la carga y deja libre el día siguiente. No presupone cambiar tus reservas para hacer dos días.', '',
  '## Por confirmar con vos', '', ...(template.pendingDecisions || []).map(item => `- **${item.original}**: ${item.notes}`), '',
  '## Detalle editable por día', '',
  ...itineraryData.days.flatMap(day => [
    `### Día ${day.day} · ${date(day.date)} · ${day.title}`, '', ...(day.notes ? [day.notes, ''] : []),
    ...day.activities.map(activity => `- **${activity.time}** · ${activity.title} · ${activity.duration} min · ${activity.area || day.city}${activity.optional ? ' · opcional' : ''}${activity.reservationRequired ? ' · reserva pendiente' : ''}. ${activity.notes || ''}`), ''
  ]),
  '## Fuentes consultadas', '', ...(template.sources || []).map(source => `- [${source.title}](${source.url}) · consultado ${source.checkedAt}.`), '',
  'Los horarios y calendarios pueden cambiar. Volver a comprobar antes de reservar y antes de la visita. Al reutilizar la plantilla con otras fechas, se mueven días y hoteles, pero los plazos reales de reservas se mantienen y la app muestra una advertencia.', ''
];
const directory = fileURLToPath(new URL('../docs/trips/', import.meta.url));
fs.mkdirSync(directory, { recursive: true });
const destination = path.join(directory, id === 'japan-february-2027' ? 'JAPON_FEBRERO_2027.md' : `${id}.md`);
fs.writeFileSync(destination, lines.join('\n'), 'utf8');
console.log(destination);
