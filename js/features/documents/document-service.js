import { auth, db, storage } from '../../core/firebase-config.js';
import { addDoc, collection, deleteDoc, doc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getBlob, ref, uploadBytesResumable } from 'firebase/storage';

export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_MIME_TYPES = Object.freeze(['application/pdf','image/jpeg','image/png','image/webp']);
export const DOCUMENT_CATEGORIES = Object.freeze(['Boletos','Pases de abordar','Confirmaciones','Facturas','Seguro','Entradas','General']);

export function validateTripDocument(file, maxBytes = DOCUMENT_MAX_BYTES) {
  if (!file || !DOCUMENT_MIME_TYPES.includes(file.type)) return { valid:false, error:'Formato no permitido. Usa PDF, JPG, PNG o WEBP.' };
  if (!file.size || file.size > maxBytes) return { valid:false, error:`El archivo supera el límite de ${Math.round(maxBytes / 1024 / 1024)} MB.` };
  return { valid:true, error:null };
}

export function safeStorageName(name = 'documento') {
  return name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').slice(-140);
}

export class TripDocumentService {
  constructor({ firestore = db, bucket = storage } = {}) { this.db=firestore;this.storage=bucket;this.activeUpload=null; }
  upload({ tripId, file, visibleName, category, reservationId=null, activityId=null, sensitive=false, onProgress=()=>{} }) {
    const validation=validateTripDocument(file);if(!validation.valid)throw new Error(validation.error);
    if(!auth.currentUser||!tripId)throw new Error('Debes iniciar sesión y seleccionar un viaje.');
    const documentRef=doc(collection(this.db,`trips/${tripId}/documents`));
    const storagePath=`trips/${tripId}/documents/${auth.currentUser.uid}/${documentRef.id}/${safeStorageName(file.name)}`;
    const task=uploadBytesResumable(ref(this.storage,storagePath),file,{contentType:file.type,customMetadata:{tripId,documentId:documentRef.id}});this.activeUpload=task;
    const promise=new Promise((resolve,reject)=>task.on('state_changed',snapshot=>onProgress(Math.round(snapshot.bytesTransferred/snapshot.totalBytes*100)),reject,async()=>{
      try{await setDoc(documentRef,{visibleName:String(visibleName||file.name).trim(),category,storagePath,mimeType:file.type,size:file.size,reservationId,activityId,sensitive:Boolean(sensitive),uploadedBy:auth.currentUser.uid,createdAt:serverTimestamp(),deletionState:null});if(reservationId)await updateDoc(doc(this.db,`trips/${tripId}/reservations/${reservationId}`),{documentCount:increment(1),updatedAt:serverTimestamp()});addDoc(collection(this.db,`trips/${tripId}/documentAudit`),{documentId:documentRef.id,action:'uploaded',actorId:auth.currentUser.uid,createdAt:serverTimestamp()}).catch(()=>{});resolve({id:documentRef.id,storagePath});}
      catch(error){await deleteDoc(documentRef).catch(()=>{});await deleteObject(ref(this.storage,storagePath)).catch(()=>{});reject(new Error('No se pudieron guardar los metadatos; la carga fue revertida.'));}
      finally{this.activeUpload=null;}
    }));
    return { promise, cancel:()=>task.cancel() };
  }
  cancel(){this.activeUpload?.cancel();}
  async open(documentData){const blob=await getBlob(ref(this.storage,documentData.storagePath),DOCUMENT_MAX_BYTES);return URL.createObjectURL(blob);}
  async remove(tripId,documentData){await deleteObject(ref(this.storage,documentData.storagePath));try{await deleteDoc(doc(this.db,`trips/${tripId}/documents/${documentData.id}`));if(documentData.reservationId)await updateDoc(doc(this.db,`trips/${tripId}/reservations/${documentData.reservationId}`),{documentCount:increment(-1),updatedAt:serverTimestamp()});}catch(error){await updateDoc(doc(this.db,`trips/${tripId}/documents/${documentData.id}`),{deletionState:'storage-deleted',deletionRequestedAt:serverTimestamp()}).catch(()=>{});throw new Error('El archivo se eliminó, pero falta limpiar sus metadatos. Reintenta.');}}
}

export const tripDocumentService=new TripDocumentService();
