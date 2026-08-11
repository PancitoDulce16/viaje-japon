export const RESERVATION_TYPES=Object.freeze(['Vuelo','Hospedaje','Transporte','Restaurante','Actividad','Seguro','Entrada','Otro']);
export const RESERVATION_STATES=Object.freeze(['Pendiente','Confirmada','Cancelada','Completada']);

export function maskConfirmation(value='') {
  const text=String(value).trim();if(!text)return '';
  return text.length<=4?'••••':`${'•'.repeat(Math.min(6,text.length-4))}${text.slice(-4)}`;
}

export function validateReservation(data) {
  const errors=[];
  if(!String(data.title||'').trim())errors.push('El título es obligatorio.');
  if(!RESERVATION_TYPES.includes(data.type))errors.push('Selecciona un tipo válido.');
  if(!RESERVATION_STATES.includes(data.status))errors.push('Selecciona un estado válido.');
  if(!data.startAt||Number.isNaN(new Date(data.startAt).getTime()))errors.push('Indica fecha y hora de inicio.');
  if(data.endAt&&new Date(data.endAt)<new Date(data.startAt))errors.push('La finalización debe ser posterior al inicio.');
  if(data.costMinor!=null&&(!Number.isSafeInteger(data.costMinor)||data.costMinor<=0))errors.push('El costo debe ser positivo.');
  if(data.type==='Vuelo'&&!String(data.details?.flightNumber||'').trim())errors.push('Indica el número de vuelo.');
  if(data.type==='Restaurante'&&data.details?.partySize!=null&&data.details.partySize<1)errors.push('La cantidad de personas no es válida.');
  return errors;
}

export function canCreateReservationExpense(reservation) {
  return Boolean(reservation?.costMinor>0&&reservation?.currency&&!reservation?.expenseId);
}

export function relatedActivity(days=[],activityId) {
  if(!activityId)return null;for(const day of days)for(const activity of day.activities||[])if(String(activity.id)===String(activityId))return{day,activity};return null;
}

export function groupReservations(items=[],nowValue=new Date()) {
  const now=new Date(nowValue);const sorted=[...items].sort((a,b)=>new Date(a.startAt)-new Date(b.startAt));
  return { upcoming:sorted.filter(item=>new Date(item.startAt)>=now), past:sorted.filter(item=>new Date(item.startAt)<now).reverse() };
}
