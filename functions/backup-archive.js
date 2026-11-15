'use strict';
const { createHash, randomUUID } = require('node:crypto');
const { Timestamp, GeoPoint } = require('firebase-admin/firestore');
const MAX_BYTES = 50 * 1024 * 1024;
const COLLECTIONS = ['data','expenses','budget','tasks','packingItems','reservations','documents','reminders','images','activities','modules','itinerary','chat','timeline','journal','photos','polls','achievements','settlements','documentAudit'];
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const validId = value => typeof value === 'string' && value.length > 0 && value.length <= 500 && !value.includes('/') && !['.','..'].includes(value) && !/^__.*__$/.test(value);

function validateArchive(archive) {
  if (!record(archive) || !record(archive.metadata) || !['1.0.0','2.0.0'].includes(archive.metadata.version)) throw new Error('Versión de respaldo inválida.');
  if (JSON.stringify(archive).length > MAX_BYTES) throw new Error('El respaldo supera 50 MB.');
  const inspect = (value, depth=0) => {
    if (depth > 40) throw new Error('El archivo tiene demasiados niveles.');
    if (Array.isArray(value)) return value.forEach(item=>inspect(item,depth+1));
    if (!record(value)) return;
    for (const [key,item] of Object.entries(value)) {
      if (['__proto__','constructor','prototype'].includes(key)) throw new Error('El archivo contiene claves no permitidas.');
      inspect(item,depth+1);
    }
  };
  inspect(archive);
  for (const name of ['settings','gamification','mlHistory','userProfile','localStorage']) if (archive[name] != null && !record(archive[name])) throw new Error(`Sección inválida: ${name}`);
  if (archive.trips != null && (!Array.isArray(archive.trips) || archive.trips.length > 100)) throw new Error('Lista de viajes inválida.');
  let count=0;
  for (const trip of archive.trips || []) {
    if (!record(trip) || !validId(trip.id) || !record(trip.info) || typeof trip.info.name !== 'string' || !trip.info.name.trim() || trip.info.name.length > 120) throw new Error('Datos del viaje inválidos.');
    for(const key of ['dateStart','dateEnd'])if(trip.info[key]!=null && (!/^\d{4}-\d\d-\d\d$/.test(trip.info[key]) || new Date(`${trip.info[key]}T12:00:00Z`).toISOString().slice(0,10)!==trip.info[key]))throw new Error('Fechas de viaje inválidas.');
    if(trip.info.dateStart && trip.info.dateEnd && trip.info.dateEnd<trip.info.dateStart)throw new Error('Rango de fechas inválido.');
    if(trip.info.timeZone) new Intl.DateTimeFormat('es',{timeZone:trip.info.timeZone});
    if (trip.collections != null && !record(trip.collections)) throw new Error('Colecciones inválidas.');
    for (const [name, rows] of Object.entries(trip.collections || {})) {
      if (!COLLECTIONS.includes(name) || !Array.isArray(rows)) throw new Error('Colección no permitida.');
      const ids=new Set();
      for(const row of rows) {
        if (++count > 10000 || !record(row) || !validId(row.id) || ids.has(row.id) || !record(row.data)) throw new Error('Registro inválido o repetido.');
        ids.add(row.id);
        if (row.file) {
          if (!['documents','images'].includes(name) || !record(row.file) || typeof row.file.base64 !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(row.file.base64)) throw new Error('Archivo adjunto inválido.');
          const bytes=Buffer.from(row.file.base64,'base64');
          const allowed=['image/jpeg','image/png','image/webp',...(name==='documents'?['application/pdf']:[])];
          if (!bytes.length || bytes.length > (name==='documents'?10:5)*1024*1024 || !allowed.includes(row.file.mimeType)) throw new Error('Archivo adjunto no permitido.');
        } else if (['documents','images'].includes(name) && row.data.storagePath) throw new Error('Faltan los bytes de un archivo adjunto.');
      }
    }
  }
  return archive;
}

function decode(value, oldId, newId, db) {
  if(Array.isArray(value)) return value.map(item=>decode(item,oldId,newId,db));
  if(!record(value)) return value;
  if(value.__japitinType==='timestamp') return new Timestamp(value.seconds,value.nanoseconds);
  if(value.__japitinType==='geo') return new GeoPoint(value.latitude,value.longitude);
  if(value.__japitinType==='bytes') return Buffer.from(value.base64,'base64');
  if(value.__japitinType==='reference') {
    const path=String(value.path || '');
    if (!path.startsWith(`trips/${oldId}/`)) throw new Error('Referencia fuera del viaje.');
    return db.doc(`trips/${newId}/${path.slice(`trips/${oldId}/`.length)}`);
  }
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,key==='tripId'&&item===oldId?newId:decode(item,oldId,newId,db)]));
}

async function restoreArchive({ archive, raw, userId, email='', db, bucket }) {
  validateArchive(archive);
  // The same file is idempotent even if the browser loses the completion response.
  const hash=createHash('sha256').update(raw || JSON.stringify(archive)).digest('hex');
  const job=db.doc(`users/${userId}/backupImports/${hash}`);
  const claim=await db.runTransaction(async tx=>{
    const snap=await tx.get(job);
    if(snap.exists && snap.data().status==='complete') return {result:snap.data().result};
    if(snap.exists && snap.data().status==='cleanup-required') throw new Error('Hay una restauración incompleta pendiente de limpieza. Tus originales están intactos.');
    if(snap.exists && snap.data().status==='running' && Date.now()-snap.data().startedAt.toMillis()<15*60*1000) throw new Error('Este respaldo ya se está restaurando.');
    const abandoned=snap.exists && snap.data().status==='running'?snap.data():null;
    tx.set(job,{status:'running',startedAt:Timestamp.now(),createdTripIds:abandoned?.createdTripIds || [],createdFiles:abandoned?.createdFiles || []});return {abandoned};
  });
  if(claim.result) return claim.result;
  const created=[],files=[];
  try {
    if(claim.abandoned){
      created.push(...(claim.abandoned.createdTripIds || []));files.push(...(claim.abandoned.createdFiles || []));
      await Promise.all([...created.map(id=>db.recursiveDelete(db.doc(`trips/${id}`))),...files.map(path=>bucket.file(path).delete({ignoreNotFound:true}))]);
      created.length=0;files.length=0;
      await job.update({createdTripIds:[],createdFiles:[]});
    }
    for(const source of archive.trips || []) {
      const target=db.collection('trips').doc();
      const { id:oldId, collections, ...trip }=source;
      const data=decode(trip,oldId,target.id,db);
      // Never restore access grants, scheduled deliveries or a shared invitation code.
      data.info={...data.info,createdBy:userId,creatorEmail:email || null,shareCode:randomUUID().replaceAll('-','').slice(0,6).toUpperCase(),importedAt:new Date().toISOString(),importedFrom:oldId};
      data.members=[userId];data.memberEmails=email?[email]:[];
      data.restoreState='importing';
      delete data.memberRoles; delete data.roles; delete data.userId;
      created.push(target.id);await job.update({createdTripIds:created});await target.create(data);
      let batch=db.batch(),size=0;
      const flush=async()=>{if(size){await batch.commit();batch=db.batch();size=0;}};
      for(const [name,rows] of Object.entries(collections || {})) for(const row of rows) {
        // Audit/typing/pins are history or ephemeral state, never live permissions.
        if(name==='data' && row.id.startsWith('typing_')) continue;
        const entry=decode(row.data,oldId,target.id,db);
        if(name==='documentAudit')entry.importedHistorical=true;
        if(name==='settlements') {
          // Preserve the historical entry away from live settlement triggers.
          batch.create(target.collection('data').doc(`imported-settlement-${row.id}`),{historicalSettlement:entry,importedHistorical:true});
          if(++size===400)await flush();
          continue;
        }
        if(['expenses','tasks','packingItems','reservations','budget','reminders'].includes(name)) {entry.originalCreatedBy=entry.createdBy || null;entry.createdBy=userId;}
        if(name==='budget') entry.updatedBy=userId;
        if(name==='reminders') {entry.active=false;entry.targetUserId=userId;}
        if(name==='expenses' && entry.split?.enabled) {entry.originalSplit=entry.split;entry.split=null;}
        if(row.file) {
          const filename=String(row.file.name || 'archivo').replace(/[^a-zA-Z0-9._-]/g,'_').slice(-140) || 'archivo';
          const path=name==='documents'?`trips/${target.id}/documents/${userId}/${row.id}/${filename}`:`trips/${target.id}/images/${randomUUID()}-${filename}`;
          const token=randomUUID();
          const file=bucket.file(path);files.push(path);await job.update({createdFiles:files});
          await file.save(Buffer.from(row.file.base64,'base64'),{resumable:false,metadata:{contentType:row.file.mimeType,metadata:name==='images'?{firebaseStorageDownloadTokens:token}:{}}});
          entry.storagePath=path;entry.size=Buffer.from(row.file.base64,'base64').length;
          if(name==='documents') {entry.uploadedBy=userId;entry.deletionState=null;delete entry.url;}
          else {entry.userId=userId;entry.tripId=target.id;entry.url=`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;}
        }
        batch.create(target.collection(name).doc(row.id),entry);
        if(++size===400) await flush();
      }
      await flush();
      if(created.length===1 && archive.gamification?.achievementsState && !collections?.achievements?.length)await target.collection('achievements').doc(userId).create(decode(archive.gamification.achievementsState,oldId,target.id,db));
    }
    const result={tripIds:created,tripCount:created.length};
    const completion=db.batch();
    for(const id of created)completion.update(db.doc(`trips/${id}`),{restoreState:'complete'});
    completion.set(job,{status:'complete',result,completedAt:Timestamp.now()});await completion.commit();return result;
  } catch(error) {
    // Originals are untouched; remove only the copies and objects created by this operation.
    const cleanup=await Promise.allSettled([...created.map(id=>db.recursiveDelete(db.doc(`trips/${id}`))),...files.map(path=>bucket.file(path).delete({ignoreNotFound:true}))]);
    await job.set({status:cleanup.some(item=>item.status==='rejected')?'cleanup-required':'failed',createdTripIds:created,createdFiles:files,failedAt:Timestamp.now()});
    if(cleanup.some(item=>item.status==='rejected')) throw new Error('La restauración falló y quedan copias incompletas por limpiar. Tus viajes originales siguen intactos.');
    throw error;
  }
}
module.exports={MAX_BYTES,COLLECTIONS,validateArchive,restoreArchive};
