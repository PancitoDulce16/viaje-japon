import { auth, db } from '../../core/firebase-config.js';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { classifyTasks } from '../dashboard/dashboard-summary.js';

export const TASK_CATEGORIES = ['Vuelos','Hospedaje','Documentos','Reservaciones','Pagos','Transporte','Actividades','Otros'];
export const TASK_PRIORITIES = ['Baja','Media','Alta'];
const safe = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));

export const TravelTasks = {
  tasks: [], unsubscribe: null, editingId: null,
  filters: { status:'pending', category:'', priority:'', assignee:'' },
  get tripId() { return window.TripsManager?.currentTrip?.id || localStorage.getItem('currentTripId'); },
  notify(type, text) { window.Notifications?.[type]?.(text); },
  open(options = {}) {
    if (!this.tripId || !auth.currentUser) return;
    this.close(); this.editingId = options.create ? 'new' : null;
    const modal = document.createElement('div'); modal.id = 'travelTasksModal'; modal.className = 'budget-gallery-modal';
    modal.innerHTML = `<section class="budget-gallery checklist-panel" role="dialog" aria-modal="true" aria-labelledby="tasksTitle"><header><div><p class="budget-kicker">旅の準備 · POR HACER</p><h2 id="tasksTitle">Pendientes del viaje</h2></div><button data-close aria-label="Cerrar">×</button></header><div id="taskFormHost"></div><div class="checklist-toolbar"><button data-new>＋ Nueva tarea</button><label>Estado<select data-filter="status"><option value="pending">Pendientes</option><option value="completed">Completadas</option><option value="all">Todas</option></select></label><label>Categoría<select data-filter="category"><option value="">Todas</option>${TASK_CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select></label><label>Prioridad<select data-filter="priority"><option value="">Todas</option>${TASK_PRIORITIES.map(c=>`<option>${c}</option>`).join('')}</select></label><label>Responsable<input data-filter="assignee" placeholder="Nombre o correo"></label></div><div id="taskSummary" class="checklist-summary"></div><div id="travelTasksList" role="status"><p class="budget-state">Cargando pendientes…</p></div></section>`;
    document.body.append(modal); modal.querySelector('[data-close]').onclick = () => this.close(); modal.querySelector('[data-new]').onclick = () => { this.editingId='new'; this.renderForm(); };
    modal.querySelectorAll('[data-filter]').forEach((field) => { field.value=this.filters[field.dataset.filter]; field.oninput=()=>{this.filters[field.dataset.filter]=field.value;this.render();}; });
    this.renderForm();
    this.unsubscribe = onSnapshot(query(collection(db,`trips/${this.tripId}/tasks`), orderBy('createdAt','desc')), (snapshot) => { this.tasks=snapshot.docs.map(d=>({id:d.id,...d.data()}));this.render();window.TripsManager?.loadDashboardProgressiveContent?.(); }, (error)=>{ document.getElementById('travelTasksList').innerHTML=`<p class="budget-state budget-state--error">${safe(error.message)}</p>`; });
  },
  renderForm() {
    const host=document.getElementById('taskFormHost'); if(!host)return;
    if(!this.editingId){host.innerHTML='';return;} const item=this.editingId==='new'?{}:this.tasks.find(t=>t.id===this.editingId)||{};
    host.innerHTML=`<form id="travelTaskForm" class="expense-form"><h3>${item.id?'Editar':'Nueva'} tarea</h3><div class="expense-form__grid"><label>Título*<input name="title" required maxlength="140" value="${safe(item.title)}"></label><label>Categoría<select name="category">${TASK_CATEGORIES.map(c=>`<option ${item.category===c?'selected':''}>${c}</option>`).join('')}</select></label><label>Prioridad<select name="priority">${TASK_PRIORITIES.map(c=>`<option ${item.priority===c?'selected':''}>${c}</option>`).join('')}</select></label><label>Fecha límite<input name="dueDate" type="date" value="${safe(item.dueDate)}"></label><label>Responsable<input name="assignee" value="${safe(item.assignee)}"></label><label class="expense-form__wide">Descripción<textarea name="description" maxlength="500">${safe(item.description)}</textarea></label></div><div class="expense-form__buttons"><button type="button" data-cancel>Cancelar</button><button type="submit">Guardar tarea</button></div></form>`;
    host.querySelector('[data-cancel]').onclick=()=>{this.editingId=null;this.renderForm();}; host.querySelector('form').onsubmit=(event)=>this.save(event,item);
  },
  render() {
    const host=document.getElementById('travelTasksList'); if(!host)return; const classified=classifyTasks(this.tasks);
    document.getElementById('taskSummary').innerHTML=`<strong>${classified.pending.length} pendientes</strong><span>${classified.overdue.length} atrasadas · ${classified.upcoming.length} próximas</span>`;
    const list=this.tasks.filter(t=>(this.filters.status==='all'||(this.filters.status==='completed')===Boolean(t.completed))&&(!this.filters.category||t.category===this.filters.category)&&(!this.filters.priority||t.priority===this.filters.priority)&&(!this.filters.assignee||String(t.assignee||'').toLowerCase().includes(this.filters.assignee.toLowerCase()))).sort((a,b)=>String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999')));
    const overdueIds=new Set(classified.overdue.map(t=>t.id)), upcomingIds=new Set(classified.upcoming.map(t=>t.id));
    host.innerHTML=list.length?list.map(t=>`<article class="checklist-row ${t.completed?'is-complete':''}"><label><input type="checkbox" data-toggle="${t.id}" ${t.completed?'checked':''}><span><strong>${safe(t.title)}</strong><small>${safe(t.category)} · ${safe(t.priority)}${t.assignee?' · '+safe(t.assignee):''}</small></span></label><div>${t.dueDate?`<time class="${overdueIds.has(t.id)?'is-overdue':upcomingIds.has(t.id)?'is-upcoming':''}">${overdueIds.has(t.id)?'Atrasada · ':upcomingIds.has(t.id)?'Próxima · ':''}${safe(t.dueDate)}</time>`:''}<button data-edit="${t.id}">Editar</button><button data-delete="${t.id}">Eliminar</button></div></article>`).join(''):'<p class="budget-state">No hay tareas en esta vista.</p>';
    host.querySelectorAll('[data-toggle]').forEach(e=>e.onchange=()=>updateDoc(doc(db,`trips/${this.tripId}/tasks/${e.dataset.toggle}`),{completed:e.checked,completedAt:e.checked?serverTimestamp():null,updatedAt:serverTimestamp()}));
    host.querySelectorAll('[data-edit]').forEach(e=>e.onclick=()=>{this.editingId=e.dataset.edit;this.renderForm();}); host.querySelectorAll('[data-delete]').forEach(e=>e.onclick=()=>this.remove(e.dataset.delete));
  },
  async save(event, existing) { event.preventDefault(); const data=new FormData(event.currentTarget), title=String(data.get('title')||'').trim(); if(!title)return; const payload={title,description:String(data.get('description')||'').trim(),category:String(data.get('category')),priority:String(data.get('priority')),dueDate:String(data.get('dueDate')||'')||null,assignee:String(data.get('assignee')||'').trim()||null,updatedAt:serverTimestamp(),notification:{enabled:false,sentAt:null}}; if(existing.id)await updateDoc(doc(db,`trips/${this.tripId}/tasks/${existing.id}`),payload);else await addDoc(collection(db,`trips/${this.tripId}/tasks`),{...payload,completed:false,createdBy:auth.currentUser.uid,createdAt:serverTimestamp()});this.editingId=null;this.renderForm();this.notify('success','Tarea guardada.');window.TripsManager?.loadDashboardProgressiveContent?.(); },
  async remove(id){if(!confirm('¿Eliminar esta tarea?'))return;await deleteDoc(doc(db,`trips/${this.tripId}/tasks/${id}`));this.notify('success','Tarea eliminada.');},
  close(){this.unsubscribe?.();this.unsubscribe=null;document.getElementById('travelTasksModal')?.remove();}
};
window.TravelTasks=TravelTasks;
