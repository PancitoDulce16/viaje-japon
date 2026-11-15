'use strict';
const { onCall, HttpsError }=require('firebase-functions/v2/https');
const { getFirestore }=require('firebase-admin/firestore');
const { getStorage }=require('firebase-admin/storage');
const { MAX_BYTES, restoreArchive }=require('./backup-archive');

exports.restoreUserBackup=onCall({region:'us-central1',timeoutSeconds:540,memory:'512MiB',maxInstances:2,concurrency:1},async request=>{
  if(!request.auth) throw new HttpsError('unauthenticated','Iniciá sesión para restaurar.');
  const userId=request.auth.uid,path=request.data?.backupPath;
  if(typeof path!=='string' || !path.startsWith(`backups/${userId}/`) || !/^[a-zA-Z0-9-]+\.json$/.test(path.slice(`backups/${userId}/`.length))) throw new HttpsError('invalid-argument','Ruta de respaldo inválida.');
  const bucket=getStorage().bucket(process.env.BACKUP_STORAGE_BUCKET || 'japan-itin-dev.firebasestorage.app'),file=bucket.file(path);
  try {
    const [metadata]=await file.getMetadata();
    if(Number(metadata.size)>MAX_BYTES || metadata.contentType!=='application/json') throw new Error('Tamaño o formato de respaldo inválido.');
    const [bytes]=await file.download();
    const raw=bytes.toString('utf8'),archive=JSON.parse(raw);
    return await restoreArchive({archive,raw,userId,email:request.auth.token.email || '',db:getFirestore(),bucket});
  } catch(error) {
    console.error('Backup restore failed:',{userId,message:error.message});
    throw new HttpsError('failed-precondition',error.message || 'No se pudo restaurar el respaldo.');
  }
});
