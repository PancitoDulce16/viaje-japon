import { auth, db } from '../../core/firebase-config.js';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { packingProgress } from '../dashboard/dashboard-summary.js';
import { enhanceDialog } from '../../ui/dialog-a11y.js';

export const PACKING_CATEGORIES=['Ropa','Higiene','Tecnología','Documentos','Medicamentos','Accesorios','Otros'];
const safe=(value='')=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

export const PackingList={
  items:[],unsubscribe:null,editingId:null,filters:{category:'',assignee:'',status:''},
  get tripId(){return window.TripsManager?.currentTrip?.id||localStorage.getItem('currentTripId');},
  notify(type, message) { window.Notifications?.[type]?.(message); },
  visibleItems() { return this.items.filter(item => (!this.filters.category || item.category === this.filters.category) && (!this.filters.assignee || String(item.assignee || '').toLowerCase().includes(this.filters.assignee.toLowerCase())) && (!this.filters.status || (this.filters.status === 'packed') === Boolean(item.packed))); },
  modalTripId() { return document.getElementById('packingListModal')?.dataset.tripId || this.tripId; },
  canWrite(tripId) { return Boolean(auth.currentUser && tripId && tripId === this.tripId); },
  async toggle(input) {
    if (input.disabled) return;
    const tripId = input.dataset.tripId || this.modalTripId(), packed = input.checked;
    input.disabled = true;
    try {
      if (!this.canWrite(tripId)) throw new Error('Trip changed');
      await updateDoc(doc(db, `trips/${tripId}/packingItems/${input.dataset.toggle}`), { packed, updatedAt: serverTimestamp() });
    } catch { input.checked = !packed; this.notify('error', 'No se pudo guardar el estado del artículo. Intenta de nuevo.'); }
    finally { input.disabled = false; }
  },
  async init(){if(auth.currentUser&&this.tripId)await this.initSync();},
  async initSync() {
    this.cleanup();
    const tripId = this.tripId, userId = auth.currentUser?.uid;
    const version = this.syncVersion;
    const modal = document.getElementById('packingListModal');
    if (modal && modal.dataset.tripId !== tripId) this.closeModal();
    this.items = [];
    if (!userId || !tripId) return;
    const current = () => version === this.syncVersion && this.tripId === tripId && auth.currentUser?.uid === userId;
    try {
      this.migrations ||= new Map();
      const key = `${userId}:${tripId}`;
      if (!this.migrations.has(key)) this.migrations.set(key, this.migrateLegacy(tripId).finally(() => this.migrations.delete(key)));
      await this.migrations.get(key);
      if (!current()) return;
      this.unsubscribe = onSnapshot(query(collection(db, `trips/${tripId}/packingItems`), orderBy('createdAt', 'desc')), snapshot => {
        if (!current()) return;
        this.items = snapshot.docs.map(item => ({ ...item.data(), id: item.id }));
        this.render();
        window.TripsManager?.loadDashboardProgressiveContent?.();
      }, () => { if (current()) this.notify('error', 'No se pudo cargar el equipaje. Vuelve a abrir la lista para reintentar.'); });
    } catch { if (current()) this.notify('error', 'No se pudo cargar el equipaje. Vuelve a abrir la lista para reintentar.'); }
  },
  async migrateLegacy(tripId = this.tripId){const userId=auth.currentUser?.uid;if(!userId)return;const target=collection(db,`trips/${tripId}/packingItems`);if(!(await getDocs(target)).empty)return;const legacy=await getDoc(doc(db,`trips/${tripId}/data/packing`));const raw=legacy.exists()?legacy.data()?.items:[];const items=Array.isArray(raw)?raw:Object.values(raw||{}).flat();if(!items.length)return;const batch=writeBatch(db);items.forEach((item,index)=>{const ref=doc(target,`legacy-${index}`);batch.set(ref,{name:String(item.name||'Artículo'),category:PACKING_CATEGORIES.includes(item.category)?item.category:'Otros',quantity:Math.max(1,Number(item.quantity)||1),packed:Boolean(item.checked),assignee:item.owner||null,notes:item.notes||'',createdBy:userId,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),migratedFrom:'data/packing'});});await batch.commit();},
  open(options={}){if(!this.tripId||!auth.currentUser)return;document.getElementById('packingListModal')?.remove();this.editingId=options.create?'new':null;const modal=document.createElement('div');modal.id='packingListModal';modal.className='budget-gallery-modal';modal.dataset.tripId=this.tripId;modal.innerHTML=`<section class="budget-gallery checklist-panel" role="dialog" aria-modal="true" aria-labelledby="packingTitle"><header><div><p class="budget-kicker">旅の荷物 · EQUIPAJE</p><h2 id="packingTitle">Lista de equipaje</h2></div><button data-close aria-label="Cerrar">×</button></header><div id="packingFormHost"></div><div class="checklist-toolbar"><button data-new>＋ Agregar artículo</button><label>Categoría<select data-filter="category"><option value="">Todas</option>${PACKING_CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select></label><label>Estado<select data-filter="status"><option value="">Todos</option><option value="pending">Pendientes</option><option value="packed">Empacados</option></select></label><label>Responsable<input data-filter="assignee" placeholder="Nombre o correo"></label></div><div id="packingSummary" class="checklist-summary"></div><div id="packingListContainer"><p class="budget-state">Cargando equipaje…</p></div></section>`;document.body.append(modal);enhanceDialog(modal.querySelector('[role="dialog"]'),{onClose:()=>this.closeModal()});modal.querySelector('[data-close]').onclick=()=>this.closeModal();modal.querySelector('[data-new]').onclick=()=>{this.editingId='new';this.renderForm();};modal.querySelectorAll('[data-filter]').forEach(field=>{field.value=this.filters[field.dataset.filter];field.oninput=()=>{this.filters[field.dataset.filter]=field.value;this.render();};});this.renderForm();this.initSync();},
  renderForm(){const host=document.getElementById('packingFormHost');if(!host)return;if(!this.editingId){host.innerHTML='';return;}const item=this.editingId==='new'?{}:this.items.find(i=>i.id===this.editingId)||{};host.innerHTML=`<form class="expense-form"><h3>${item.id?'Editar':'Nuevo'} artículo</h3><div class="expense-form__grid"><label>Nombre*<input name="name" required maxlength="120" value="${safe(item.name)}"></label><label>Categoría<select name="category">${PACKING_CATEGORIES.map(c=>`<option ${item.category===c?'selected':''}>${c}</option>`).join('')}</select></label><label>Cantidad<input name="quantity" type="number" min="1" max="99" value="${item.quantity||1}"></label><label>Responsable<input name="assignee" value="${safe(item.assignee)}"></label><label class="expense-form__wide">Notas<textarea name="notes" maxlength="400">${safe(item.notes)}</textarea></label></div><div class="expense-form__buttons"><button type="button" data-cancel>Cancelar</button><button type="submit">Guardar artículo</button></div></form>`;host.querySelector('[data-cancel]').onclick=()=>{this.editingId=null;this.renderForm();};host.querySelector('form').dataset.tripId=this.modalTripId();host.querySelector('form').onsubmit=event=>this.save(event,item);},
  render(){const host=document.getElementById('packingListContainer');if(!host)return;const progress=packingProgress(this.items);document.getElementById('packingSummary').innerHTML=`<strong>${progress.percent}% empacado</strong><span>${progress.packed} empacados · ${progress.pending} pendientes</span>`;const visible=this.visibleItems();const groups=visible.reduce((acc,item)=>{(acc[item.category]||=[]).push(item);return acc;},{});host.innerHTML=Object.keys(groups).length?Object.entries(groups).map(([category,items])=>{const all=items.every(i=>i.packed);return `<section class="packing-group"><header><h3>${safe(category)}</h3><button data-category="${safe(category)}" data-pack="${!all}">${all?'Desmarcar categoría':'Empacar categoría'}</button></header>${items.map(item=>`<article class="checklist-row ${item.packed?'is-complete':''}"><label><input type="checkbox" data-toggle="${safe(item.id)}" ${item.packed?'checked':''}><span><strong>${safe(item.name)}${item.quantity>1?` ×${item.quantity}`:''}</strong><small>${item.assignee?safe(item.assignee):'Sin responsable'}${item.notes?' · '+safe(item.notes):''}</small></span></label><div><button data-edit="${safe(item.id)}">Editar</button><button data-delete="${safe(item.id)}">Eliminar</button></div></article>`).join('')}</section>`;}).join(''):'<p class="budget-state">No hay artículos en esta vista.</p>';host.querySelectorAll('[data-toggle]').forEach(e=>{e.dataset.tripId=this.modalTripId();e.onchange=()=>this.toggle(e);});host.querySelectorAll('[data-edit]').forEach(e=>e.onclick=()=>{this.editingId=e.dataset.edit;this.renderForm();});host.querySelectorAll('[data-delete]').forEach(e=>e.onclick=()=>this.remove(e.dataset.delete));host.querySelectorAll('[data-category]').forEach(e=>e.onclick=()=>this.toggleCategory(e.dataset.category,e.dataset.pack==='true'));},
  async save(event, existing = {}) {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.saving) return;
    const tripId = form.dataset.tripId, userId = auth.currentUser?.uid;
    if (!this.canWrite(tripId)) { this.notify('error', 'Abre el equipaje del viaje actual antes de guardar.'); return; }
    const data = new FormData(form), name = String(data.get('name') || '').trim(), category = String(data.get('category')), quantity = Number(data.get('quantity'));
    if (!name || !PACKING_CATEGORIES.includes(category) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) { this.notify('error', 'Revisa el nombre, la categoría y una cantidad entera entre 1 y 99.'); return; }
    const duplicate = this.items.find(item => item.id !== existing.id && String(item.name).trim().toLowerCase() === name.toLowerCase());
    if (duplicate && !confirm(`Ya existe “${duplicate.name}”. ¿Agregarlo de todas formas?`)) return;
    const payload = { name, category, quantity, assignee: String(data.get('assignee') || '').trim() || null, notes: String(data.get('notes') || '').trim(), updatedAt: serverTimestamp() };
    const submit = form.querySelector('[type="submit"]');
    const fields = [...form.querySelectorAll('[name]')].map(field => ({ field, disabled: field.disabled }));
    form.dataset.saving = 'true';
    if (submit) submit.disabled = true;
    fields.forEach(({ field }) => { field.disabled = true; });
    form.querySelector('[data-cancel]')?.focus();
    try {
      if (existing.id) await updateDoc(doc(db, `trips/${tripId}/packingItems/${existing.id}`), payload);
      else await addDoc(collection(db, `trips/${tripId}/packingItems`), { ...payload, packed: false, createdBy: userId, createdAt: serverTimestamp() });
    } catch { this.notify('error', 'No se pudo guardar el artículo. Tus datos siguen en el formulario.'); return; }
    finally { delete form.dataset.saving; if (submit) submit.disabled = false; fields.forEach(({ field, disabled }) => { field.disabled = disabled; }); }
    if (!this.canWrite(tripId) || document.getElementById('packingFormHost')?.querySelector('form') !== form) return;
    this.editingId = null; this.renderForm(); this.notify('success', 'Artículo guardado.');
  },
  async toggleCategory(category, packed) {
    const tripId = this.modalTripId();
    if (!this.canWrite(tripId)) { this.notify('error', 'Abre el equipaje del viaje actual antes de marcar artículos.'); return; }
    const items = this.visibleItems().filter(item => item.category === category);
    if (!items.length) return;
    this.pendingCategories ||= new Set();
    const key = `${tripId}:${category}`;
    if (this.pendingCategories.has(key)) return;
    this.pendingCategories.add(key);
    try {
      // Each batch stays within Firestore's 500-write limit.
      for (let offset = 0; offset < items.length; offset += 500) {
        const batch = writeBatch(db);
        items.slice(offset, offset + 500).forEach(item => batch.update(doc(db, `trips/${tripId}/packingItems/${item.id}`), { packed, updatedAt: serverTimestamp() }));
        await batch.commit();
      }
    } catch { this.notify('error', 'No se pudieron actualizar todos los artículos. Revisa la lista antes de reintentar.'); }
    finally { this.pendingCategories.delete(key); }
  },
  async remove(id) {
    const tripId = this.modalTripId(), item = this.items.find(item => item.id === id);
    if (!item || !this.canWrite(tripId) || !confirm(`¿Eliminar “${item.name}”?`)) return;
    try { await deleteDoc(doc(db, `trips/${tripId}/packingItems/${id}`)); }
    catch { this.notify('error', 'No se pudo eliminar el artículo. Intenta de nuevo.'); }
  },
  reinitialize(){if(auth.currentUser)return this.initSync();},cleanup(){this.syncVersion=(this.syncVersion||0)+1;this.unsubscribe?.();this.unsubscribe=null;},closeModal(){document.getElementById('packingListModal')?.remove();},
  renderList(){this.render();},setFilter(key,value){this.filters[key]=value;this.render();},addCustomItem(){this.open({create:true});}
};
window.PackingList=PackingList;
