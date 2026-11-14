import { auth, db } from '../../core/firebase-config.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { DOCUMENT_CATEGORIES, DOCUMENT_MAX_BYTES, tripDocumentService } from './document-service.js';
import { enhanceDialog } from '../../ui/dialog-a11y.js';

const safe=(value='')=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const size=bytes=>bytes<1048576?`${Math.round(bytes/1024)} KB`:`${(bytes/1048576).toFixed(1)} MB`;

export const TripDocuments={documents:[],context:{},objectUrl:null,previewUrl:null,
  get tripId(){return window.TripsManager?.currentTrip?.id||localStorage.getItem('currentTripId');},
  isCurrent(session) { return Boolean(session && this.session === session && this.tripId === session.tripId && auth.currentUser?.uid === session.userId && document.getElementById('tripDocumentsModal') === session.modal); },
  async open(context={}){
    if(!auth.currentUser||!this.tripId)return;this.close();this.context={...context};
    const modal=document.createElement('div');modal.id='tripDocumentsModal';modal.className='budget-gallery-modal';
    this.session = { tripId: this.tripId, userId: auth.currentUser.uid, context: this.context, modal, deleting: new Set() };
    modal.innerHTML=`<section class="budget-gallery document-vault" role="dialog" aria-modal="true" aria-labelledby="documentsTitle"><header><div><p class="budget-kicker">旅の書類 · ARCHIVO PRIVADO</p><h2 id="documentsTitle">Documentos del viaje</h2></div><button data-close aria-label="Cerrar">×</button></header><form class="document-upload"><div class="document-drop" tabindex="0"><label>Archivo*<input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" required></label><p>Selecciona o arrastra un PDF o imagen · máximo ${DOCUMENT_MAX_BYTES/1048576} MB</p><img data-preview alt="Vista previa del archivo seleccionado" hidden></div><label>Nombre visible<input name="visibleName" maxlength="160"></label><label>Categoría<select name="category">${DOCUMENT_CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select></label><label class="document-sensitive"><input name="sensitive" type="checkbox"> Documento sensible</label><p class="document-warning" hidden>Solo tú y el propietario podrán verlo. Los archivos de identidad o médicos son opcionales; evita subirlos salvo que sea necesario.</p><div class="document-upload__actions"><button type="button" data-cancel disabled>Cancelar subida</button><button type="submit">Confirmar y subir</button></div><progress value="0" max="100" hidden></progress><p data-status role="status"></p></form><div id="tripDocumentsList"><p class="budget-state">Cargando documentos…</p></div></section>`;
    document.body.append(modal);enhanceDialog(modal.querySelector('[role="dialog"]'),{onClose:()=>this.close()});modal.querySelector('[data-close]').onclick=()=>this.close();modal.querySelector('[name="sensitive"]').onchange=e=>modal.querySelector('.document-warning').hidden=!e.target.checked;
    const input=modal.querySelector('[name="file"]'),drop=modal.querySelector('.document-drop'),preview=modal.querySelector('[data-preview]');
    const selected=()=>{const file=input.files[0];if(!modal.querySelector('[name="visibleName"]').value)modal.querySelector('[name="visibleName"]').value=file?.name||'';if(this.previewUrl)URL.revokeObjectURL(this.previewUrl);this.previewUrl=file?.type.startsWith('image/')?URL.createObjectURL(file):null;preview.hidden=!this.previewUrl;if(this.previewUrl)preview.src=this.previewUrl;};input.onchange=selected;
    ['dragenter','dragover'].forEach(type=>drop.addEventListener(type,event=>{event.preventDefault();drop.classList.add('is-dragging');}));['dragleave','drop'].forEach(type=>drop.addEventListener(type,event=>{event.preventDefault();drop.classList.remove('is-dragging');}));drop.addEventListener('drop',event=>{if(event.dataTransfer?.files?.length){input.files=event.dataTransfer.files;selected();}});
    modal.querySelector('form').onsubmit=e=>this.upload(e);modal.querySelector('[data-cancel]').onclick=()=>this.uploadOperation?.cancel();await this.load();
  },
  async load(){
    const session = this.session;
    if (!this.isCurrent(session)) return;
    const version = this.loadVersion = (this.loadVersion || 0) + 1;
    const current = () => this.isCurrent(session) && version === this.loadVersion;
    const ref = collection(db,`trips/${session.tripId}/documents`);
    const owner = window.TripsManager?.currentTrip?.info?.createdBy === session.userId;
    try {
      let docs;
      if(owner) docs=(await getDocs(ref)).docs;
      else {
        const [shared,own]=await Promise.all([getDocs(query(ref,where('sensitive','==',false))),getDocs(query(ref,where('sensitive','==',true),where('uploadedBy','==',session.userId)))]);
        docs=[...shared.docs,...own.docs];
      }
      if (!current()) return;
      this.documents=[...new Map(docs.map(item=>[item.id,{...item.data(),id:item.id}])).values()].filter(item=>(!session.context.reservationId||item.reservationId===session.context.reservationId)&&(!session.context.activityId||item.activityId===session.context.activityId)).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
      this.render();
    } catch {
      if (!current()) return;
      const host = document.getElementById('tripDocumentsList');
      if(host) host.innerHTML='<p class="budget-state budget-state--error">No se pudieron cargar los documentos.</p>';
    }
  },
  render(){const host=document.getElementById('tripDocumentsList');if(!host)return;host.innerHTML=this.documents.length?`<div class="document-list">${this.documents.map(item=>`<article class="document-row"><span>${item.mimeType==='application/pdf'?'PDF':'IMG'}</span><div><strong title="${safe(item.visibleName)}">${safe(item.visibleName)}</strong><small>${safe(item.category)} · ${size(item.size)}${item.sensitive?' · Sensible':''}</small></div><div><button data-open="${item.id}">Abrir</button><button data-download="${item.id}">Descargar</button><button data-delete="${item.id}">Eliminar</button></div></article>`).join('')}</div>`:'<p class="budget-state">No hay documentos en esta vista.</p>';host.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>this.view(b.dataset.open,false));host.querySelectorAll('[data-download]').forEach(b=>b.onclick=()=>this.view(b.dataset.download,true));host.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>this.remove(b.dataset.delete));},
  async upload(event){
    event.preventDefault();
    const form=event.currentTarget, session=this.session;
    if (form.dataset.uploading) return;
    const status=form.querySelector('[data-status]');
    if (!this.isCurrent(session) || form.closest('#tripDocumentsModal') !== session.modal) { status.textContent='Abre los documentos del viaje actual antes de subir un archivo.'; return; }
    const data=new FormData(form),progress=form.querySelector('progress'),cancel=form.querySelector('[data-cancel]'),submit=form.querySelector('[type="submit"]');
    const fields=[...form.querySelectorAll('[name]')].map(field=>({field,disabled:field.disabled}));
    let operation;
    form.dataset.uploading='true';
    try {
      fields.forEach(({field})=>{field.disabled=true;});
      submit.disabled=true;submit.textContent='Subiendo…';cancel.disabled=false;progress.hidden=false;
      cancel.focus?.();
      operation=tripDocumentService.upload({tripId:session.tripId,file:data.get('file'),visibleName:data.get('visibleName'),category:String(data.get('category')),reservationId:session.context.reservationId||null,activityId:session.context.activityId||null,sensitive:data.get('sensitive')==='on',onProgress:value=>{if(this.isCurrent(session)){progress.value=value;status.textContent=`Subiendo: ${value}%`;}}});
      this.uploadOperation=operation;
      await operation.promise;
      if (!this.isCurrent(session)) return;
      status.textContent='Documento guardado.';submit.textContent='Confirmar y subir';form.reset();
      if(this.previewUrl) URL.revokeObjectURL(this.previewUrl);
      this.previewUrl=null;
      const preview=form.querySelector('[data-preview]');if(preview){preview.hidden=true;preview.removeAttribute('src');}
      await this.load();
    } catch(error) {
      if(this.isCurrent(session)){status.textContent=error.code==='storage/canceled'?'Subida cancelada.':error.message;submit.textContent='Reintentar';}
    } finally {
      delete form.dataset.uploading;
      fields.forEach(({field,disabled})=>{field.disabled=disabled;});
      submit.disabled=false;cancel.disabled=true;progress.hidden=true;
      if(this.isCurrent(session)&&document.activeElement===cancel)submit.focus?.();
      if(this.uploadOperation===operation)this.uploadOperation=null;
    }
  },
  async view(id,download){
    const session=this.session,item=this.documents.find(doc=>doc.id===id),host=document.getElementById('tripDocumentsList');
    if(!item||!host||!this.isCurrent(session))return;
    const version=this.viewVersion=(this.viewVersion||0)+1;
    try {
      host.setAttribute('aria-busy','true');
      const url=await tripDocumentService.open(item);
      if(!this.isCurrent(session)||version!==this.viewVersion){URL.revokeObjectURL(url);return;}
      if(this.objectUrl)URL.revokeObjectURL(this.objectUrl);
      this.objectUrl=url;
      if(download)Object.assign(document.createElement('a'),{href:url,download:item.visibleName}).click();else window.open(url,'_blank','noopener');
    }catch{if(this.isCurrent(session))alert('No se pudo abrir el documento. Verifica tus permisos y conexión.');}
    finally{if(version===this.viewVersion)host.removeAttribute('aria-busy');}
  },
  async remove(id){
    const session=this.session,item=this.documents.find(doc=>doc.id===id);
    if(!item||!this.isCurrent(session)||session.deleting.has(id)||!confirm(`¿Eliminar “${item.visibleName}” definitivamente?`))return;
    session.deleting.add(id);
    try{await tripDocumentService.remove(session.tripId,item);if(this.isCurrent(session))await this.load();}
    catch(error){if(this.isCurrent(session))alert(error.message);}
    finally{session.deleting.delete(id);}
  },
  close(){
    this.session=null;this.documents=[];
    const operation=this.uploadOperation;this.uploadOperation=null;operation?.cancel();
    this.objectUrl&&URL.revokeObjectURL(this.objectUrl);this.previewUrl&&URL.revokeObjectURL(this.previewUrl);this.objectUrl=null;this.previewUrl=null;document.getElementById('tripDocumentsModal')?.remove();
  }
};
window.TripDocuments=TripDocuments;
