import { auth, db, storage } from '../../core/firebase-config.js';
import { collection, doc, getDocFromServer, query, onSnapshot, orderBy, setDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove, runTransaction } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const galleryText=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function galleryImageUrl(value){try{const url=new URL(String(value),window.location.origin);return ['https:','http:'].includes(url.protocol)?url.href:'';}catch{return '';}}
export const commentIdentity=row=>typeof row?.id==='string'?row.id:JSON.stringify([row?.userId,row?.createdAt,row?.text,row?.userName]);

export const galleryState={
  cleanupQueue(uid){if(this.cleanupQueues?.has(uid))return this.cleanupQueues.get(uid);try{const rows=JSON.parse(localStorage.getItem(`japitin_photo_cleanup_${uid}`)||'[]');return Array.isArray(rows)?rows:[];}catch{return [];}},
  storeCleanupQueue(uid,rows){this.cleanupQueues ||= new Map();this.cleanupQueues.set(uid,rows);try{localStorage.setItem(`japitin_photo_cleanup_${uid}`,JSON.stringify(rows));}catch{/* Still retained for this tab when storage is unavailable. */}},
  queuePhotoCleanup(scope,path,id){const rows=this.cleanupQueue(scope.uid);if(!rows.some(row=>row.path===path))rows.push({uid:scope.uid,tripId:scope.tripId,path,id});this.storeCleanupQueue(scope.uid,rows);},
  async retryPhotoCleanup(scope){
    const remaining=[];
    for(const row of this.cleanupQueue(scope.uid)){
      if(!this.isGalleryCurrent(scope)||row.uid!==scope.uid||row.tripId!==scope.tripId||typeof row.id!=='string'||typeof row.path!=='string'||!row.path.startsWith(`trips/${scope.tripId}/photos/${scope.uid}_`)){remaining.push(row);continue;}
      try{const record=await getDocFromServer(doc(db,'trips',scope.tripId,'photos',row.id));if(!this.isGalleryCurrent(scope)){remaining.push(row);continue;}if(!record.exists()||record.data().storagePath!==row.path)await deleteObject(ref(storage,row.path));}
      catch(error){if(error.code!=='storage/object-not-found')remaining.push(row);}
    }
    this.storeCleanupQueue(scope.uid,remaining);
  },
  galleryScope(){return {tripId:window.TripsManager?.currentTrip?.id||null,uid:auth.currentUser?.uid||null,version:this.galleryVersion||0};},
  isGalleryCurrent(scope){const now=this.galleryScope();return Boolean(scope.uid&&scope.tripId&&scope.uid===now.uid&&scope.tripId===now.tripId&&scope.version===now.version);},
  normalizePhoto(row){return {...row,userName:typeof row.userName==='string'?row.userName:'Viajero',caption:typeof row.caption==='string'?row.caption:'',likes:Array.isArray(row.likes)?row.likes.filter(id=>typeof id==='string'):[],comments:Array.isArray(row.comments)?row.comments.filter(item=>item&&typeof item.text==='string').map(item=>({...item,userName:typeof item.userName==='string'?item.userName:'Viajero'})):[]};},
  async loadGallery(){
    const container=document.getElementById('photoGalleryGrid');if(!container)return;
    const selected=this.galleryScope();
    if(this.currentTripId!==selected.tripId||this.boundUid!==selected.uid){this.cleanup();this.currentTripId=selected.tripId;this.boundUid=selected.uid;}
    this.galleryUnsubscribe?.();this.galleryUnsubscribe=null;
    const scope=this.galleryScope(),request=this.galleryRequest=(this.galleryRequest||0)+1;
    if(!scope.uid||!scope.tripId){container.innerHTML='<p role="status">Selecciona un viaje e inicia sesi\u00f3n para ver sus fotos.</p>';return;}
    container.innerHTML='<p role="status">Cargando fotos...</p>';
    const current=()=>this.isGalleryCurrent(scope)&&request===this.galleryRequest&&document.getElementById('photoGalleryGrid')===container;
    const failed=()=>{if(!current())return;container.innerHTML='<p role="alert">No se pudieron cargar las fotos.</p><button data-gallery-retry>Reintentar</button>';container.querySelector('[data-gallery-retry]').onclick=()=>this.loadGallery();};
    try{
      this.galleryUnsubscribe=onSnapshot(query(collection(db,'trips',scope.tripId,'photos'),orderBy('uploadedAt','desc')),snapshot=>{
        if(!current())return;
        this.lastPhotos=snapshot.docs.map(record=>this.normalizePhoto({...record.data(),id:record.id}));this.renderGallery(this.lastPhotos,scope.tripId);
      },failed);
    }catch{failed();}
  },
  clearPreview(){
    this.selectionVersion=(this.selectionVersion||0)+1;this.selectedFile=null;
    document.getElementById('photoPreview')?.classList.add('hidden');
    const button=document.getElementById('uploadBtn');if(button)button.disabled=true;
    const input=document.getElementById('photoInput');if(input)input.value='';
    document.getElementById('previewImage')?.removeAttribute('src');
  },
  async uploadPhoto(){
    const scope=this.galleryScope(),file=this.selectedFile;
    if(!this.isGalleryCurrent(scope)||!file||this.uploadPending)return false;
    const captionInput=document.getElementById('photoCaption'),caption=captionInput?.value||'',selection=this.selectionVersion||0;
    const button=document.getElementById('uploadBtn'),progress=document.getElementById('uploadProgress'),bar=document.getElementById('progressBar'),status=document.getElementById('progressText');
    this.uploadPending=true;if(button)button.disabled=true;progress?.classList.remove('hidden');
    const id=crypto.randomUUID(),path=`trips/${scope.tripId}/photos/${scope.uid}_${id}_${encodeURIComponent(file.name).slice(0,160)}`;
    const storageRef=ref(storage,path);let uploaded=false,confirmed=false;
    const target=doc(db,'trips',scope.tripId,'photos',id);
    try{
      await this.retryPhotoCleanup(scope);
      if(!this.isGalleryCurrent(scope))throw new Error('El viaje o la cuenta cambi\u00f3.');
      if(status)status.textContent='Subiendo foto...';if(bar)bar.style.width='30%';
      await uploadBytes(storageRef,file);uploaded=true;
      if(!this.isGalleryCurrent(scope))throw new Error('El viaje o la cuenta cambi\u00f3.');
      const photoURL=await getDownloadURL(storageRef);
      if(!this.isGalleryCurrent(scope))throw new Error('El viaje o la cuenta cambi\u00f3.');
      if(status)status.textContent='Guardando foto...';if(bar)bar.style.width='70%';
      await setDoc(target,{photoURL,storagePath:path,caption:caption.trim(),userId:scope.uid,userName:auth.currentUser?.displayName||'Viajero',userPhoto:auth.currentUser?.photoURL||null,uploadedAt:serverTimestamp(),likes:[],comments:[]});
      confirmed=true;
    }catch(error){
      if(uploaded&&!confirmed){
        // Check an ambiguous write result before deleting its file. A network
        // failure can occur after the server has already accepted the metadata.
        let verified=false;
        try{const record=await getDocFromServer(target);verified=true;confirmed=record.exists()&&record.data().storagePath===path;}catch{/* Never delete a possibly confirmed photo while offline. */}
        if(!confirmed){
          let pending=!verified;
          if(verified){try{await deleteObject(storageRef);}catch(cleanupError){pending=cleanupError.code!=='storage/object-not-found';}}
          if(pending){this.queuePhotoCleanup(scope,path,id);if(this.isGalleryCurrent(scope))window.Notifications?.error('Falta verificar o limpiar el archivo. Se reintentar\u00e1 en tu pr\u00f3xima subida.');}
        }
      }
      if(!confirmed&&this.isGalleryCurrent(scope))window.Notifications?.error(error.message||'No se pudo subir la foto. Puedes reintentar.');
    }finally{
      this.uploadPending=false;
      if(this.isGalleryCurrent(scope)&&document.getElementById('uploadBtn')===button){
        if(confirmed){
          if(this.selectedFile===file&&(this.selectionVersion||0)===selection&&captionInput?.value===caption){this.clearPreview();captionInput.value='';}
          window.Notifications?.show('Foto guardada','success');
        }
        progress?.classList.add('hidden');if(button)button.disabled=!this.selectedFile;if(bar)bar.style.width='0%';
      }
    }
    return confirmed;
  },
  async toggleLike(tripId,photoId){
    const scope=this.galleryScope();if(tripId!==scope.tripId||!this.isGalleryCurrent(scope))return false;
    return this.galleryMutation(`like:${photoId}`,scope,async()=>{
      const photo=this.detailPhoto?.id===photoId?this.detailPhoto:this.lastPhotos?.find(row=>row.id===photoId);
      if(!photo)throw new Error('Vuelve a abrir la foto.');
      await updateDoc(doc(db,'trips',tripId,'photos',photoId),{likes:photo.likes.includes(scope.uid)?arrayRemove(scope.uid):arrayUnion(scope.uid)});
    },photoId);
  },
  async addComment(tripId,photoId){
    const scope=this.galleryScope(),input=document.getElementById('galleryCommentInput'),text=input?.value.trim();
    if(!text||tripId!==scope.tripId||!this.isGalleryCurrent(scope))return false;
    if(text.length>2000){window.Notifications?.error('Usa hasta 2000 caracteres.');return false;}
    const original=input.value;
    const comment={id:crypto.randomUUID(),userId:scope.uid,userName:auth.currentUser?.displayName||'Viajero',text,createdAt:new Date().toISOString()};
    return this.galleryMutation(`comment:${photoId}`,scope,async()=>{
      await updateDoc(doc(db,'trips',tripId,'photos',photoId),{comments:arrayUnion(comment)});
      if(this.isGalleryCurrent(scope)&&input.isConnected&&input.value===original)input.value='';
    },photoId);
  },
  async deleteComment(tripId,photoId,id){
    const scope=this.galleryScope();if(!this.isGalleryCurrent(scope)||tripId!==scope.tripId||!confirm('\u00bfEliminar este comentario?'))return false;
    return this.galleryMutation(`delete-comment:${photoId}:${id}`,scope,async()=>{
      const target=doc(db,'trips',tripId,'photos',photoId);
      await runTransaction(db,async transaction=>{
        const snapshot=await transaction.get(target);if(!this.isGalleryCurrent(scope))throw new Error('El viaje cambi\u00f3.');
        if(!snapshot.exists())throw new Error('La foto ya no existe.');
        const comments=snapshot.data().comments||[];if(!Array.isArray(comments))throw new Error('Comentarios no v\u00e1lidos.');
        const index=comments.findIndex(row=>commentIdentity(row)===id&&row?.userId===scope.uid);
        if(index<0)throw new Error('El comentario ya no est\u00e1 disponible.');
        transaction.update(target,{comments:comments.filter((_,position)=>position!==index)});
      });
    },photoId);
  },
  async galleryMutation(key,scope,operation,photoId){
    this.pendingGallery ||= new Set();const lock=JSON.stringify([scope.uid,scope.tripId,key]);if(this.pendingGallery.has(lock))return false;this.pendingGallery.add(lock);
    try{if(!this.isGalleryCurrent(scope))return false;await operation();if(this.isGalleryCurrent(scope)&&this.detailPhotoId===photoId&&!document.getElementById('photoDetailModal')?.classList.contains('hidden'))await this.showDetail(photoId,scope.tripId);return true;}
    catch(error){if(this.isGalleryCurrent(scope))window.Notifications?.error(error.message||'No se pudo guardar el cambio.');return false;}
    finally{this.pendingGallery.delete(lock);}
  },
  cleanup(){this.galleryVersion=(this.galleryVersion||0)+1;this.galleryRequest=(this.galleryRequest||0)+1;this.galleryUnsubscribe?.();this.galleryUnsubscribe=null;this.unsubscribers?.forEach(unsubscribe=>unsubscribe());this.unsubscribers=[];this.lastPhotos=[];this.detailPhoto=null;this.detailPhotoId=null;this.detailRequest=(this.detailRequest||0)+1;this.currentTripId=null;this.boundUid=null;this.clearPreview();this.closeDetailModal();}
};
