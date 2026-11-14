import { auth, db } from '../../core/firebase-config.js';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { currencyScale, parseMoneyToMinor, SUPPORTED_CURRENCIES } from '../budget/money.js';
import { groupReservations, maskConfirmation, RESERVATION_STATES, RESERVATION_TYPES, validateReservation } from '../reservations/reservation-utils.js';
import { enhanceDialog } from '../../ui/dialog-a11y.js';

const safe=(value='')=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const toLocalInput=value=>value?String(value).slice(0,16):'';

export const ReservationsManager={reservations:[],unsubscribe:null,currentTrip:null,filters:{type:'',status:'',from:'',search:''},itinerary:[],
  async openReservation(id) {
    const tripId = window.TripsManager?.currentTrip?.id || localStorage.getItem('currentTripId');
    if (!tripId || !auth.currentUser || !id || String(id).includes('/')) return;
    const userId = auth.currentUser.uid;
    const version = this.openVersion = (this.openVersion || 0) + 1;
    const isCurrent = () => version === this.openVersion && auth.currentUser?.uid === userId && tripId === (window.TripsManager?.currentTrip?.id || localStorage.getItem('currentTripId'));
    try {
      const snapshot = await getDoc(doc(db, `trips/${tripId}/reservations/${id}`));
      if (!isCurrent()) return;
      if (!snapshot.exists()) {
        window.Notifications?.error?.('Esta reservación ya no está disponible. Abre la lista para revisar tus reservas.');
        return;
      }
      const itinerary = await this.loadItinerary(tripId);
      if (!isCurrent()) return;
      this.currentTrip = tripId;
      this.itinerary = itinerary;
      this.showReservationModal({ ...snapshot.data(), id: snapshot.id });
    } catch (error) {
      if (!isCurrent()) return;
      console.error('No se pudo abrir la reservación', error);
      window.Notifications?.error?.('No se pudo abrir la reservación. Revisa tu conexión e intenta de nuevo.');
    }
  },
  async init(tripId) {
    const selected = tripId || window.TripsManager?.currentTrip?.id || localStorage.getItem('currentTripId');
    const version = this.initVersion = (this.initVersion || 0) + 1;
    this.unsubscribe?.(); this.unsubscribe = null;
    this.currentTrip = selected;
    this.reservations = []; this.itinerary = [];
    if (!selected || !auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const isCurrent = () => version === this.initVersion && this.currentTrip === selected && auth.currentUser?.uid === userId && selected === (window.TripsManager?.currentTrip?.id || localStorage.getItem('currentTripId'));
    try {
      this.migrations ||= new Map();
      const key = `${userId}:${selected}`;
      if (!this.migrations.has(key)) this.migrations.set(key, this.migrateLegacy(selected).finally(() => this.migrations.delete(key)));
      await this.migrations.get(key);
      if (!isCurrent()) return;
      await this.loadItinerary(selected);
      if (!isCurrent()) return;
      this.unsubscribe = onSnapshot(query(collection(db, `trips/${selected}/reservations`), orderBy('startAt', 'asc')), snapshot => {
        if (!isCurrent()) return;
        this.reservations = snapshot.docs.map(item => ({ ...item.data(), id: item.id }));
        this.render();
        window.dispatchEvent(new CustomEvent('reservations:updated'));
      }, () => { if (isCurrent()) this.renderError(); });
    } catch { if (isCurrent()) this.renderError(); }
  },
  async migrateLegacy(tripId = this.currentTrip){const userId=auth.currentUser?.uid;if(!userId)return;const target=collection(db,`trips/${tripId}/reservations`);if(!(await getDocs(target)).empty)return;const legacy=await getDoc(doc(db,`trips/${tripId}/data/reservations`));const items=legacy.exists()?legacy.data()?.reservations||[]:[];if(!items.length)return;const batch=writeBatch(db);items.forEach(item=>{const ref=doc(target);batch.set(ref,{title:item.name||'Reservación',type:({hotel:'Hospedaje',restaurant:'Restaurante',activity:'Actividad',transport:'Transporte'}[item.type]||'Otro'),provider:item.provider||'',confirmationCode:item.confirmationNumber||'',startAt:`${item.date||new Date().toISOString().slice(0,10)}T${item.time||'12:00'}`,endAt:null,location:item.location||'',locationUrl:item.url||'',costMinor:null,currency:'CRC',status:'Confirmada',notes:item.notes||'',contact:'',activityId:item.activityId||null,activityTitleLegacy:item.name||'',documentCount:0,requiresDocument:false,expenseId:null,details:{},createdBy:userId,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),migratedFrom:'data/reservations'});});await batch.commit();},
  async loadItinerary(tripId = this.currentTrip) {
    const snapshot = await getDoc(doc(db, `trips/${tripId}/data/itinerary`));
    const days = snapshot.exists() ? snapshot.data()?.days || [] : [];
    if (this.currentTrip === tripId && tripId === (window.TripsManager?.currentTrip?.id || localStorage.getItem('currentTripId'))) this.itinerary = days;
    return days;
  },
  render(){const container=document.getElementById('reservationsContent');if(!container)return;const search=this.filters.search.toLowerCase();const items=this.reservations.filter(item=>(!this.filters.type||item.type===this.filters.type)&&(!this.filters.status||item.status===this.filters.status)&&(!this.filters.from||item.startAt>=this.filters.from)&&(!search||`${item.title} ${item.provider}`.toLowerCase().includes(search)));const groups=groupReservations(items);container.innerHTML=`<section class="reservation-panel"><header><div><p class="budget-kicker">旅の予約 · AGENDA CONFIRMADA</p><h2>Reservaciones</h2></div><div><button data-documents>Documentos</button><button data-new>＋ Agregar reservación</button></div></header><form class="reservation-filters"><label>Buscar<input name="search" value="${safe(this.filters.search)}" placeholder="Título o proveedor"></label><label>Tipo<select name="type"><option value="">Todos</option>${RESERVATION_TYPES.map(value=>`<option ${this.filters.type===value?'selected':''}>${value}</option>`).join('')}</select></label><label>Estado<select name="status"><option value="">Todos</option>${RESERVATION_STATES.map(value=>`<option ${this.filters.status===value?'selected':''}>${value}</option>`).join('')}</select></label><label>Desde<input name="from" type="date" value="${safe(this.filters.from)}"></label></form>${this.renderGroup('Próximas',groups.upcoming)}${this.renderGroup('Pasadas',groups.past)}</section>`;container.querySelector('[data-new]').onclick=()=>this.showReservationModal();container.querySelector('[data-documents]').onclick=()=>window.TripDocuments?.open();container.querySelectorAll('.reservation-filters [name]').forEach(field=>field.oninput=()=>{const start=field.selectionStart,end=field.selectionEnd;this.filters[field.name]=field.value;this.render();const replacement=document.querySelector('.reservation-filters [name="'+field.name+'"]');replacement?.focus();if(start!==null&&replacement?.setSelectionRange)replacement.setSelectionRange(start,end);});container.querySelectorAll('[data-edit]').forEach(button=>button.onclick=()=>this.showReservationModal(this.reservations.find(item=>item.id===button.dataset.edit)));container.querySelectorAll('[data-delete]').forEach(button=>button.onclick=()=>this.remove(button.dataset.delete));container.querySelectorAll('[data-attachments]').forEach(button=>button.onclick=()=>window.TripDocuments?.open({reservationId:button.dataset.attachments}));container.querySelectorAll('[data-activity]').forEach(button=>button.onclick=()=>this.navigateActivity(button.dataset.activity));},
  renderGroup(title,items){return `<section class="reservation-group"><h3>${title}</h3>${items.length?items.map(item=>this.card(item)).join(''):'<p class="budget-state">No hay reservaciones en esta sección.</p>'}</section>`;},
  card(item){return `<article class="reservation-row"><div class="reservation-row__date"><time>${safe(item.startAt?.slice(0,10))}</time><strong>${safe(item.startAt?.slice(11,16))}</strong></div><div><span class="reservation-status reservation-status--${safe(item.status).toLowerCase()}">${safe(item.status)}</span><h4>${safe(item.title)}</h4><p>${safe(item.type)}${item.provider?' · '+safe(item.provider):''}${item.location?' · '+safe(item.location):''}</p>${item.confirmationCode?`<code title="Código enmascarado">${safe(maskConfirmation(item.confirmationCode))}</code>`:''}${item.requiresDocument&&!item.documentCount?'<small class="reservation-attention">Falta documentación</small>':''}</div><div class="reservation-row__actions">${item.activityId?`<button data-activity="${safe(item.activityId)}">Ver actividad</button>`:''}<button data-attachments="${safe(item.id)}">Documentos (${item.documentCount||0})</button><button data-edit="${safe(item.id)}">Editar</button><button data-delete="${safe(item.id)}">Eliminar</button></div></article>`;},
  showReservationModal(item=null,preset={}){document.getElementById('reservationModal')?.remove();const modal=document.createElement('div');modal.id='reservationModal';modal.className='budget-gallery-modal';const activities=this.itinerary.flatMap(day=>(day.activities||[]).map(activity=>({id:activity.id,title:activity.title||activity.name,day:day.date||`Día ${day.day}`})));modal.innerHTML=`<section class="budget-gallery reservation-editor" role="dialog" aria-modal="true" aria-labelledby="reservationEditorTitle"><header><div><p class="budget-kicker">予約票 · FICHA DE RESERVA</p><h2 id="reservationEditorTitle">${item?'Editar':'Nueva'} reservación</h2></div><button data-close aria-label="Cerrar">×</button></header><form class="expense-form"><div class="expense-form__grid"><label>Título*<input name="title" required maxlength="160" value="${safe(item?.title||preset.title)}"></label><label>Tipo<select name="type">${RESERVATION_TYPES.map(value=>`<option ${value===(item?.type||'Actividad')?'selected':''}>${value}</option>`).join('')}</select></label><label>Estado<select name="status">${RESERVATION_STATES.map(value=>`<option ${value===(item?.status||'Pendiente')?'selected':''}>${value}</option>`).join('')}</select></label><label>Proveedor<input name="provider" maxlength="120" value="${safe(item?.provider)}"></label><label>Código de confirmación<input name="confirmationCode" maxlength="100" value="${safe(item?.confirmationCode)}"></label><label>Inicio*<input name="startAt" type="datetime-local" required value="${toLocalInput(item?.startAt)}"></label><label>Finalización<input name="endAt" type="datetime-local" value="${toLocalInput(item?.endAt)}"></label><label>Ubicación<input name="location" maxlength="220" value="${safe(item?.location)}"></label><label>Enlace de ubicación<input name="locationUrl" type="url" value="${safe(item?.locationUrl)}"></label><label>Costo<input name="cost" type="number" min="0" step="any" value="${item?.costMinor?item.costMinor/currencyScale(item.currency):''}"></label><label>Moneda<select name="currency">${SUPPORTED_CURRENCIES.map(value=>`<option ${value===(item?.currency||'CRC')?'selected':''}>${value}</option>`).join('')}</select></label><label>Contacto<input name="contact" maxlength="160" value="${safe(item?.contact)}"></label><label>Actividad relacionada<select name="activityId"><option value="">Ninguna</option>${activities.map(activity=>`<option value="${safe(activity.id)}" ${(item?.activityId||preset.activityId)===activity.id?'selected':''}>${safe(activity.day)} · ${safe(activity.title)}</option>`).join('')}</select></label><label class="expense-form__wide">Notas<textarea name="notes" maxlength="700">${safe(item?.notes)}</textarea></label></div><section id="reservationConditionalFields" class="reservation-conditional"></section><div class="reservation-options"><label><input name="requiresDocument" type="checkbox" ${item?.requiresDocument?'checked':''}> Requiere documento</label><label><input name="createExpense" type="checkbox" ${item?.expenseId?'disabled':''}> ${item?.expenseId?'Gasto ya vinculado':'Crear gasto relacionado al guardar'}</label></div><p data-error role="alert" class="error-message" hidden></p><div class="expense-form__buttons"><button type="button" data-close>Cancelar</button><button type="submit">Guardar reservación</button></div></form></section>`;document.body.append(modal);enhanceDialog(modal.querySelector('[role="dialog"]'),{onClose:()=>modal.remove()});const form=modal.querySelector('form'),type=form.elements.type;form.dataset.tripId=this.currentTrip||window.TripsManager?.currentTrip?.id||localStorage.getItem('currentTripId')||'';const renderConditional=()=>{modal.querySelector('#reservationConditionalFields').innerHTML=this.conditionalFields(type.value,item?.details||{});};renderConditional();type.onchange=renderConditional;modal.querySelectorAll('[data-close]').forEach(button=>button.onclick=()=>modal.remove());form.onsubmit=event=>this.save(event,item);},
  conditionalFields(type,details){if(type==='Vuelo')return `<div class="reservation-conditional__grid"><label>Aerolínea<input name="airline" value="${safe(details.airline)}"></label><label>Número de vuelo*<input name="flightNumber" value="${safe(details.flightNumber)}"></label><label>Aeropuerto origen<input name="originAirport" value="${safe(details.originAirport)}"></label><label>Terminal origen<input name="originTerminal" value="${safe(details.originTerminal)}"></label><label>Aeropuerto destino<input name="destinationAirport" value="${safe(details.destinationAirport)}"></label><label>Terminal destino<input name="destinationTerminal" value="${safe(details.destinationTerminal)}"></label></div>`;if(type==='Hospedaje')return `<div class="reservation-conditional__grid"><label>Check-in<input name="checkIn" type="datetime-local" value="${toLocalInput(details.checkIn)}"></label><label>Check-out<input name="checkOut" type="datetime-local" value="${toLocalInput(details.checkOut)}"></label></div>`;if(type==='Restaurante')return `<div class="reservation-conditional__grid"><label>Personas<input name="partySize" type="number" min="1" value="${details.partySize||1}"></label></div>`;if(type==='Transporte')return `<div class="reservation-conditional__grid"><label>Origen<input name="origin" value="${safe(details.origin)}"></label><label>Destino<input name="destination" value="${safe(details.destination)}"></label><label>Operador<input name="operator" value="${safe(details.operator)}"></label></div>`;return ''},
  async save(event, existing = null) {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.saving) return;
    const errorHost = form.querySelector('[data-error]');
    const report = message => { if (errorHost) { errorHost.hidden = false; errorHost.textContent = message; } };
    const tripId = form.dataset.tripId;
    const activeTripId = () => window.TripsManager?.currentTrip?.id || localStorage.getItem('currentTripId');
    if (!auth.currentUser || !tripId || tripId !== activeTripId() || tripId !== this.currentTrip) { report('Abre la reserva desde el viaje actual antes de guardar.'); return; }
    const userId = auth.currentUser.uid;
    const data = new FormData(form), currency = String(data.get('currency')), costText = String(data.get('cost') || '').trim();
    let payload;
    try {
      if (!SUPPORTED_CURRENCIES.includes(currency)) throw new Error('Selecciona una moneda válida.');
      const details={};['airline','flightNumber','originAirport','originTerminal','destinationAirport','destinationTerminal','checkIn','checkOut','partySize','origin','destination','operator'].forEach(key=>{if(data.has(key)&&data.get(key)!=='')details[key]=key==='partySize'?Number(data.get(key)):String(data.get(key));});payload={title:String(data.get('title')||'').trim(),type:String(data.get('type')),provider:String(data.get('provider')||'').trim(),confirmationCode:String(data.get('confirmationCode')||'').trim(),startAt:String(data.get('startAt')||''),endAt:String(data.get('endAt')||'')||null,location:String(data.get('location')||'').trim(),locationUrl:String(data.get('locationUrl')||'').trim(),costMinor:costText?parseMoneyToMinor(costText,currency):null,currency,status:String(data.get('status')),notes:String(data.get('notes')||'').trim(),contact:String(data.get('contact')||'').trim(),activityId:String(data.get('activityId')||'')||null,requiresDocument:data.get('requiresDocument')==='on',details,updatedAt:serverTimestamp()};
      if (costText && payload.costMinor === null) throw new Error('Indica un costo positivo con los decimales permitidos para esa moneda.');
      const errors = validateReservation(payload);
      if (errors.length) { report(errors.join(' ')); return; }
    } catch (error) { report(error.message || 'Revisa el costo y la moneda.'); return; }
    if (errorHost) errorHost.hidden = true;
    const submit = form.querySelector('[type="submit"]');
    const fields = [...form.querySelectorAll('[name]')].map(field => ({ field, disabled: field.disabled }));
    form.dataset.saving = 'true';
    if (submit) submit.disabled = true;
    fields.forEach(({ field }) => { field.disabled = true; });
    form.querySelector('[data-close]')?.focus();
    let reservationId = existing?.id || form.dataset.reservationId;
    try {
      if (reservationId) await updateDoc(doc(db, `trips/${tripId}/reservations/${reservationId}`), payload);
      else {
        const created = await addDoc(collection(db, `trips/${tripId}/reservations`), { ...payload, documentCount: 0, expenseId: null, createdBy: userId, createdAt: serverTimestamp() });
        reservationId = created.id;
        form.dataset.reservationId = reservationId;
      }
      if (data.get('createExpense') === 'on' && payload.costMinor) {
        try {
          if (activeTripId() !== tripId || auth.currentUser?.uid !== userId) throw new Error('El viaje activo cambió.');
          const current = await getDoc(doc(db, `trips/${tripId}/reservations/${reservationId}`));
          if (!current.exists()) throw new Error('La reserva ya no existe.');
          if (!current.data().expenseId) {
            if (!window.BudgetTracker?.createExpenseForReservation) throw new Error('El presupuesto no está disponible.');
            await window.BudgetTracker.createExpenseForReservation({ ...payload, id: reservationId, tripId });
          }
        } catch {
          report('La reserva se guardó, pero no se pudo completar el gasto relacionado. Puedes reintentar sin crear otra reserva.');
          return;
        }
      }
      if (activeTripId() === tripId && form.closest('#reservationModal') === document.getElementById('reservationModal')) {
        form.closest('#reservationModal')?.remove();
        window.Notifications?.success?.('Reservación guardada.');
      }
    } catch {
      report('No se pudo guardar la reserva. Tus datos siguen en el formulario; intenta de nuevo.');
    } finally {
      delete form.dataset.saving;
      if (submit) submit.disabled = false;
      fields.forEach(({ field, disabled }) => { field.disabled = disabled; });
    }
  },
  async remove(id) {
    const tripId = this.currentTrip;
    const activeTripId = window.TripsManager?.currentTrip?.id || localStorage.getItem('currentTripId');
    const item = this.reservations.find(reservation => reservation.id === id);
    this.deleting ||= new Set();
    const key = `${tripId}:${id}`;
    if (!item || !auth.currentUser || !tripId || tripId !== activeTripId || this.deleting.has(key)) return;
    if (item.expenseId && !confirm('Esta reserva tiene un gasto confirmado. ¿Eliminar la reserva y conservar el gasto?')) return;
    if (item.documentCount > 0) { alert('Elimina primero los documentos adjuntos para evitar archivos sin relación.'); return; }
    if (!confirm(`¿Eliminar “${item.title}”?`)) return;
    this.deleting.add(key);
    try { await deleteDoc(doc(db, `trips/${tripId}/reservations/${id}`)); }
    catch { window.Notifications?.error?.('No se pudo eliminar la reserva. Revisa sus documentos y tu conexión antes de reintentar.'); }
    finally { this.deleting.delete(key); }
  },
  openForActivity(day,activityId,title){const existing=this.forActivity(activityId,title)[0];if(existing)this.showReservationModal(existing);else this.showReservationModal(null,{activityId,title});},forActivity(activityId,title=''){return this.reservations.filter(item=>String(item.activityId||'')===String(activityId)||(!item.activityId&&item.activityTitleLegacy&&item.activityTitleLegacy.toLowerCase()===String(title).toLowerCase()));},
  navigateActivity(activityId){document.getElementById('reservationModal')?.remove();window.DashboardApp?.switchTab('itinerary');setTimeout(()=>document.querySelector(`[data-activity-id="${CSS.escape(activityId)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),150);},
  renderError(){const container=document.getElementById('reservationsContent');if(container)container.innerHTML='<p class="budget-state budget-state--error">No se pudieron cargar las reservaciones.</p>';},cleanup(){this.initVersion=(this.initVersion||0)+1;this.openVersion=(this.openVersion||0)+1;this.unsubscribe?.();this.unsubscribe=null;this.currentTrip=null;this.reservations=[];this.itinerary=[];}
};
window.ReservationsManager=ReservationsManager;
window.addEventListener('tripChanged',event=>ReservationsManager.init(event.detail?.trip?.id));
