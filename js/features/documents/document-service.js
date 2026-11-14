import { auth, db, storage } from '../../core/firebase-config.js';
import { addDoc, collection, doc, increment, runTransaction, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
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
    if (this.activeUpload) throw new Error('Ya hay una carga en curso. Espera a que termine o cancélala.');
    const userId = auth.currentUser.uid;
    const documentRef=doc(collection(this.db,`trips/${tripId}/documents`));
    const storagePath=`trips/${tripId}/documents/${userId}/${documentRef.id}/${safeStorageName(file.name)}`;
    const task=uploadBytesResumable(ref(this.storage,storagePath),file,{contentType:file.type,customMetadata:{tripId,documentId:documentRef.id}});this.activeUpload=task;
    const release = () => { if (this.activeUpload === task) this.activeUpload = null; };
    const promise=new Promise((resolve,reject)=>task.on('state_changed',snapshot=>onProgress(Math.round(snapshot.bytesTransferred/snapshot.totalBytes*100)),error=>{release();reject(error);},async()=>{
      try {
        const batch = writeBatch(this.db);
        batch.set(documentRef,{visibleName:String(visibleName||file.name).trim(),category,storagePath,mimeType:file.type,size:file.size,reservationId,activityId,sensitive:Boolean(sensitive),uploadedBy:userId,createdAt:serverTimestamp(),deletionState:null});
        if(reservationId) batch.update(doc(this.db,`trips/${tripId}/reservations/${reservationId}`),{documentCount:increment(1),updatedAt:serverTimestamp()});
        await batch.commit();
        addDoc(collection(this.db,`trips/${tripId}/documentAudit`),{documentId:documentRef.id,action:'uploaded',actorId:userId,createdAt:serverTimestamp()}).catch(()=>{});
        resolve({id:documentRef.id,storagePath});
      }
      catch(error){
        try {
          await deleteObject(ref(this.storage,storagePath));
          reject(new Error('No se pudieron guardar los metadatos; la carga fue revertida.'));
        } catch {
          reject(new Error('No se pudo completar la carga ni retirar el archivo subido. Revisa tu conexión antes de reintentar.'));
        }
      }
      finally{release();}
    }));
    return { promise, cancel:()=>{const cancelled=task.cancel();if(cancelled)release();return cancelled;} };
  }
  cancel(){this.activeUpload?.cancel();}
  async open(documentData){const blob=await getBlob(ref(this.storage,documentData.storagePath),DOCUMENT_MAX_BYTES);return URL.createObjectURL(blob);}
  async remove(tripId,documentData){
    try { await deleteObject(ref(this.storage,documentData.storagePath)); }
    catch(error) { if(error.code !== 'storage/object-not-found') throw error; }
    try {
      await runTransaction(this.db, async transaction => {
        const documentRef = doc(this.db,`trips/${tripId}/documents/${documentData.id}`);
        const snapshot = await transaction.get(documentRef);
        if (!snapshot.exists()) return;
        transaction.delete(documentRef);
        const reservationId = snapshot.data().reservationId;
        if(reservationId) transaction.update(doc(this.db,`trips/${tripId}/reservations/${reservationId}`),{documentCount:increment(-1),updatedAt:serverTimestamp()});
      });
    } catch(error) {
      await updateDoc(doc(this.db,`trips/${tripId}/documents/${documentData.id}`),{deletionState:'storage-deleted',deletionRequestedAt:serverTimestamp()}).catch(()=>{});
      throw new Error('El archivo se eliminó, pero falta limpiar sus metadatos. Reintenta.');
    }
  }
}

export const tripDocumentService=new TripDocumentService();
