import { distanceKm, transportFor } from './day-route-flow.js';
function coords(hotel){return hotel?.coordinates||hotel}
export function buildHotelTransition(previousStay,currentStay){
  if(!previousStay?.hotel||!currentStay?.hotel||previousStay.stayId===currentStay.stayId)return null;
  const from=previousStay.hotel,to=currentStay.hotel;
  if((from.name||'').trim().toLowerCase()===(to.name||'').trim().toLowerCase())return null;
  const distance=distanceKm(coords(from),coords(to));const transport=transportFor(distance);
  return{city:currentStay.city,fromHotel:from.name||'Hotel anterior',toHotel:to.name||'Hotel nuevo',distanceKm:distance==null?null:Math.round(distance*10)/10,
    transport:{...transport,cost:transport.mode==='walk'?0:transport.mode==='metro'?220:800},
    steps:[{icon:'🧳',label:`Check-out · ${from.name||'hotel anterior'}`,time:'10:00'},{icon:'🚕',label:'Traslado con maletas',minutes:transport.minutes},{icon:'🎒',label:`Dejar equipaje · ${to.name||'hotel nuevo'}`,time:'11:00'},{icon:'🏨',label:'Check-in',time:'15:00'}],
    explanation:'Reorganizamos el día alrededor del nuevo alojamiento para que no cargues las maletas durante las visitas.'};
}
