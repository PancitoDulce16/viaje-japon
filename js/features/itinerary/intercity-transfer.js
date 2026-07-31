import { distanceKm } from './day-route-flow.js';

const CITY_COORDINATES = {
  tokyo:{lat:35.6762,lng:139.6503},kyoto:{lat:35.0116,lng:135.7681},osaka:{lat:34.6937,lng:135.5023},
  hiroshima:{lat:34.3853,lng:132.4553},nara:{lat:34.6851,lng:135.8048},hakone:{lat:35.2323,lng:139.1069},
  nagoya:{lat:35.1815,lng:136.9066},kanazawa:{lat:36.5613,lng:136.6562},takayama:{lat:36.1461,lng:137.2521},
  nagano:{lat:36.6486,lng:138.1948},fukuoka:{lat:33.5904,lng:130.4017},sapporo:{lat:43.0618,lng:141.3545},
  miyajima:{lat:34.2959,lng:132.3198}
};

const KNOWN_ROUTES = {
  'kyoto|tokyo':{minutes:140,line:'Tokaido Shinkansen',mode:'shinkansen',cost:13320},
  'osaka|tokyo':{minutes:160,line:'Tokaido Shinkansen',mode:'shinkansen',cost:13870},
  'hiroshima|tokyo':{minutes:240,line:'Tokaido + Sanyo Shinkansen',mode:'shinkansen',cost:19440},
  'kyoto|osaka':{minutes:30,line:'JR Kyoto Line',mode:'local-rail',cost:570},
  'kyoto|nara':{minutes:45,line:'JR Nara Line',mode:'local-rail',cost:720},
  'nara|osaka':{minutes:45,line:'Yamatoji Line',mode:'local-rail',cost:580},
  'hiroshima|osaka':{minutes:90,line:'Sanyo Shinkansen',mode:'shinkansen',cost:9890},
  'hiroshima|kyoto':{minutes:105,line:'Tokaido + Sanyo Shinkansen',mode:'shinkansen',cost:11300},
  'nagoya|tokyo':{minutes:100,line:'Tokaido Shinkansen',mode:'shinkansen',cost:10560},
  'kanazawa|tokyo':{minutes:150,line:'Hokuriku Shinkansen',mode:'shinkansen',cost:14380},
  'nagano|tokyo':{minutes:90,line:'Hokuriku Shinkansen',mode:'shinkansen',cost:8340},
  'kanazawa|nagano':{minutes:65,line:'Hokuriku Shinkansen',mode:'shinkansen',cost:8920},
  'kanazawa|takayama':{minutes:135,line:'Nohi Bus',mode:'highway-bus',cost:4200},
  'kyoto|takayama':{minutes:190,line:'Hida Limited Express + Tokaido Shinkansen',mode:'limited-express',cost:11200},
  'hiroshima|miyajima':{minutes:50,line:'JR Sanyo Line + JR Ferry',mode:'multimodal',cost:720,segments:[
    {type:'rail',icon:'🚆',label:'JR Sanyo Line',minutes:28,cost:420,eligibleForPass:true},
    {type:'ferry',icon:'⛴️',label:'JR Ferry a Miyajima',minutes:10,cost:200,eligibleForPass:true},
    {type:'tax',icon:'🎫',label:'Miyajima Visitor Tax',minutes:0,cost:100,eligibleForPass:false}
  ]}
};

function normalized(city){return String(city||'').trim().toLowerCase()}
function routeKey(from,to){return [normalized(from),normalized(to)].sort().join('|')}

export function buildIntercityTransfer(fromStay, toStay) {
  if (!fromStay?.city || !toStay?.city || normalized(fromStay.city) === normalized(toStay.city)) return null;
  const fromKey=normalized(fromStay.city),toKey=normalized(toStay.city);
  const direct=KNOWN_ROUTES[routeKey(fromKey,toKey)];
  const distance=Math.round(distanceKm(CITY_COORDINATES[fromKey],CITY_COORDINATES[toKey])||0);
  const estimated=direct||{
    minutes:distance>500?Math.ceil(distance*.52+45):distance>80?Math.ceil(distance*.38+35):Math.ceil(distance*.9+20),
    line:distance>80?'JR interurbano':'Tren local / bus',mode:distance>80?'limited-express':'local-rail',
    cost:Math.max(600,Math.round((distance*28)/10)*10)
  };
  const classification=estimated.minutes>=240?'very-long':estimated.minutes>=150?'long':estimated.minutes<=60?'short':'standard';
  const originHotel=fromStay.hotel?.name||'Hotel de origen';
  const destinationHotel=toStay.hotel?.name||'Hotel de destino';
  const segments=estimated.segments||[{type:estimated.mode==='highway-bus'?'bus':'rail',icon:estimated.mode==='shinkansen'?'🚄':estimated.mode==='highway-bus'?'🚌':'🚆',label:estimated.line,minutes:estimated.minutes,cost:estimated.cost,eligibleForPass:['shinkansen','limited-express','local-rail'].includes(estimated.mode)}];
  return {
    from:fromStay.city,to:toStay.city,fromStayId:fromStay.stayId||null,toStayId:toStay.stayId||null,
    distanceKm:distance,durationMinutes:estimated.minutes,line:estimated.line,mode:estimated.mode,cost:estimated.cost,segments,
    classification,isTravelDay:estimated.minutes>=180,
    steps:[
      {type:'checkout',icon:'🧳',label:`Check-out · ${originHotel}`,minutes:20},
      {type:'station',icon:'🚉',label:`Traslado a la estación`,minutes:30},
      ...segments,
      {type:'checkin',icon:'🏨',label:`Check-in · ${destinationHotel}`,minutes:30}
    ],
    warnings:classification==='very-long'?[{type:'very-long-transfer',message:'Este traslado ocupará prácticamente todo el día.'}]:[],
    explanation:`Reservamos margen para salir de ${fromStay.city}, viajar y dejar el equipaje antes de explorar ${toStay.city}.`
  };
}

export function formatTransferDuration(minutes){const hours=Math.floor(minutes/60),rest=minutes%60;return hours?`${hours}h${rest?` ${rest}min`:''}`:`${rest} min`}

export function analyzeJourneyTransfers(days) {
  const warnings=[];
  const transfers=(days||[]).filter(day=>day.transferPlan).map(day=>({day:day.day,plan:day.transferPlan}));
  if(transfers.length>=5) warnings.push({type:'many-hotel-changes',severity:'warning',message:`Tu viaje incluye ${transfers.length} cambios de alojamiento. Considera usar alguna ciudad como base.`});
  for(let index=1;index<transfers.length;index++){
    const previous=transfers[index-1],current=transfers[index];
    if(current.day===previous.day+1&&previous.plan.durationMinutes>=150&&current.plan.durationMinutes>=150){
      const warning={type:'consecutive-long-transfers',severity:'warning',days:[previous.day,current.day],message:`Los días ${previous.day} y ${current.day} tienen traslados largos consecutivos.`};
      warnings.push(warning);previous.plan.warnings.push(warning);current.plan.warnings.push(warning);
    }
  }
  return warnings;
}

export { CITY_COORDINATES, KNOWN_ROUTES };
