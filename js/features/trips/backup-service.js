import { app, auth, db, storage } from '../../core/firebase-config.js';
import { collection, query, where, getDocsFromServer } from 'firebase/firestore';
import { ref, getBlob, uploadBytes, deleteObject } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const BACKUP_MAX_BYTES=50*1024*1024;
export const BACKUP_COLLECTIONS=['data','expenses','budget','tasks','packingItems','reservations','documents','reminders','images','activities','modules','itinerary','chat','timeline','journal','photos','polls','achievements','settlements','documentAudit'];
const LOCAL_KEYS=['theme-preference','japitin_a11y_settings'];
const ML_KEYS={preferences:'ml_learned_preferences',patterns:'ml_user_patterns',recommendations:'collaborative_recommendations',anomalies:'detected_anomalies',insights:'ml_insights'};
const SETTINGS_KEYS=['basicInfo','appConfig','notifications','aiConfig','itineraryConfig','sync','travelPreferences','privacy','metadata'];
const record=value=>value!==null && typeof value==='object' && !Array.isArray(value);
const notice=(text,type='error')=>{const status=document.querySelector('[data-backup-status]');if(status)status.textContent=text;window.Notifications?.show(text,type);};
const utf8Size=value=>new Blob([JSON.stringify(value)]).size;
export function encodeBackupValue(value) {
  if(value instanceof Date) return {__japitinType:'timestamp',seconds:Math.floor(value.getTime()/1000),nanoseconds:value.getMilliseconds()*1000000};
  if(value?.toDate && Number.isInteger(value.seconds)) return {__japitinType:'timestamp',seconds:value.seconds,nanoseconds:value.nanoseconds};
  if(value?.toBase64) return {__japitinType:'bytes',base64:value.toBase64()};
  if(value?.firestore && typeof value.path==='string') return {__japitinType:'reference',path:value.path};
  if(typeof value?.latitude==='number' && typeof value?.longitude==='number' && typeof value?.isEqual==='function') return {__japitinType:'geo',latitude:value.latitude,longitude:value.longitude};
  if(Array.isArray(value)) return value.map(encodeBackupValue);
  if(record(value)) return Object.fromEntries(Object.entries(value).filter(([,item])=>item!==undefined).map(([key,item])=>[key,encodeBackupValue(item)]));
  return value;
}
function safeSettings(value) {return Object.fromEntries(SETTINGS_KEYS.filter(key=>Object.hasOwn(value || {},key)).map(key=>[key,value[key]]));}
function mergeSettings(current,incoming){const result={...current};for(const [key,value]of Object.entries(incoming))result[key]=record(value)?mergeSettings(record(current?.[key])?current[key]:{},value):value;return result;}
async function fileContents(blob) {
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('No se pudo leer un archivo adjunto.'));reader.readAsDataURL(blob);});
}

export class BackupService {
  constructor(){this.exportVersion='2.0.0';this.busy=false;}
  currentUser(){const user=auth.currentUser;if(!user)throw new Error('Iniciá sesión para respaldar o restaurar.');return user;}
  assertUser(user){if(auth.currentUser?.uid!==user.uid)throw new Error('La cuenta cambió. Volvé a iniciar la operación.');}
  async run(operation){
    if(this.busy){notice('Ya hay una operación de respaldo en curso.','warning');return {success:false,error:'Operación en curso'};}
    this.busy=true;
    const controls=[...document.querySelectorAll('[data-backup-ui] button, [data-backup-ui] input')].map(node=>[node,node.disabled]);
    controls.forEach(([node])=>{node.disabled=true;});document.querySelector('[data-backup-ui]')?.setAttribute('aria-busy','true');
    notice('Procesando respaldo… Puede tardar según el tamaño de tus archivos.','info');
    try{return await operation();}catch(error){notice(error.message || 'No se pudo completar el respaldo.');return {success:false,error:error.message};}finally{this.busy=false;controls.forEach(([node,disabled])=>{if(node.isConnected)node.disabled=disabled;});document.querySelector('[data-backup-ui]')?.setAttribute('aria-busy','false');}
  }
  async collectBackup(user=this.currentUser()) {
    const trips=await this.exportTrips(user);this.assertUser(user);
    const data={metadata:{version:this.exportVersion,exportedAt:new Date().toISOString(),exportedBy:user.uid,scope:'viajes y preferencias; documentos privados de otras personas excluidos',restoration:'copias privadas; recordatorios desactivados; pagos compartidos como historial'},trips,
      settings:safeSettings(window.UserSettings?.settings || JSON.parse(localStorage.getItem('user_settings') || '{}')),localStorage:this.exportLocalStorage(),mlHistory:{}};
    for(const [name,key]of Object.entries(ML_KEYS)){const value=localStorage.getItem(key);if(value!==null){try{data.mlHistory[name]=JSON.parse(value);}catch{data.mlHistory[name]=value;}}}
    if(utf8Size(data)>BACKUP_MAX_BYTES)throw new Error('El respaldo supera 50 MB. No se generó una copia incompleta.');
    if(!this.validateImportData(data))throw new Error('No se pudo validar el respaldo. No se generó un archivo incompleto.');
    return data;
  }
  async exportTrips(user=this.currentUser()) {
    const snapshot=await getDocsFromServer(query(collection(db,'trips'),where('members','array-contains',user.uid)));
    if(snapshot.docs.length>100)throw new Error('El respaldo admite hasta 100 viajes por archivo.');
    const trips=[];
    let records=0;
    for(const source of snapshot.docs) {
      this.assertUser(user);
      const trip={...encodeBackupValue(source.data()),id:source.id,collections:{}};
      if(trip.restoreState==='importing')throw new Error('Hay una restauración en curso. Esperá a que termine antes de crear otro respaldo.');
      const owner=trip.info?.createdBy===user.uid;
      for(const name of BACKUP_COLLECTIONS) {
        if(name==='documentAudit'&&!owner)continue;
        const base=collection(db,`trips/${source.id}/${name}`);
        const queries=name==='documents'&&!owner?[query(base,where('sensitive','==',false)),query(base,where('uploadedBy','==',user.uid))]:[name==='reminders'?query(base,where('targetUserId','==',user.uid)):base];
        const rows=new Map();
        for(const q of queries)for(const row of (await getDocsFromServer(q)).docs)rows.set(row.id,{id:row.id,data:encodeBackupValue(row.data())});
        records+=rows.size;if(records>10000)throw new Error('El respaldo supera 10.000 registros.');
        for(const entry of rows.values())if(['documents','images'].includes(name)&&entry.data.storagePath) {
          const path=entry.data.storagePath;
          if(!path.startsWith(`trips/${source.id}/${name}/`))throw new Error('Un archivo apunta fuera del viaje.');
          const blob=await getBlob(ref(storage,path),name==='documents'?10*1024*1024:5*1024*1024);
          this.assertUser(user);
          entry.file={name:path.split('/').at(-1),mimeType:entry.data.mimeType || entry.data.type || blob.type,base64:await fileContents(blob)};
        }
        trip.collections[name]=[...rows.values()];
      }
      trips.push(trip);
      if(utf8Size(trips)>BACKUP_MAX_BYTES)throw new Error('El respaldo supera 50 MB.');
    }
    return trips;
  }
  exportLocalStorage(){return Object.fromEntries(LOCAL_KEYS.map(key=>[key,localStorage.getItem(key)]).filter(([,value])=>value!==null));}
  async exportAll(){return this.run(async()=>{const user=this.currentUser(),data=await this.collectBackup(user);this.assertUser(user);this.downloadJSON(data,`japitin-backup-${Date.now()}.json`);notice('Respaldo descargado. Incluye los viajes y archivos a los que tenés acceso.','success');return {success:true,data};});}
  async uploadArchive(data,path,user){this.assertUser(user);const blob=new Blob([JSON.stringify(data)],{type:'application/json'});if(blob.size>BACKUP_MAX_BYTES)throw new Error('El respaldo supera 50 MB.');await uploadBytes(ref(storage,path),blob,{contentType:'application/json'});this.assertUser(user);}
  async backupToCloud(){return this.run(async()=>{const user=this.currentUser(),data=await this.collectBackup(user);await this.uploadArchive(data,`backups/${user.uid}/latest.json`,user);notice('Respaldo privado guardado en la nube.','success');return {success:true};});}
  async restoreFromCloud(previous=false){return this.run(async()=>{const user=this.currentUser();const blob=await getBlob(ref(storage,`backups/${user.uid}/${previous?'before-import':'latest'}.json`),BACKUP_MAX_BYTES);this.assertUser(user);const data=JSON.parse(await blob.text());return this.restoreData(data,user);});}
  async importAll(file){return this.run(async()=>{const user=this.currentUser(),data=await this.readJSONFile(file);this.assertUser(user);return this.restoreData(data,user);});}
  async importAllFromData(data){return this.run(()=>this.restoreData(data,this.currentUser()));}
  validateImportData(data){
    if(!record(data)||!record(data.metadata)||!['1.0.0','2.0.0'].includes(data.metadata.version))return false;
    if(!['settings','trips','gamification','mlHistory','userProfile','localStorage'].some(key=>data[key]!=null))return false;
    const inspect=(value,depth=0)=>{if(depth>40)throw new Error('Archivo demasiado anidado.');if(record(value))for(const [key,item]of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(key))throw new Error('Claves no permitidas.');inspect(item,depth+1);}else if(Array.isArray(value))value.forEach(item=>inspect(item,depth+1));};
    try{inspect(data);if(utf8Size(data)>BACKUP_MAX_BYTES)return false;
      for(const name of ['settings','gamification','mlHistory','userProfile','localStorage'])if(data[name]!=null&&!record(data[name]))return false;
      for(const key of SETTINGS_KEYS)if(data.settings?.[key]!=null&&!record(data.settings[key]))return false;
      for(const key of ['basicInfo','travelPreferences'])if(data.userProfile?.[key]!=null&&!record(data.userProfile[key]))return false;
      if(data.trips!=null&&(!Array.isArray(data.trips)||data.trips.length>100||data.trips.some(trip=>!record(trip)||typeof trip.id!=='string'||trip.id.includes('/')||!record(trip.info)||typeof trip.info.name!=='string')))return false;
      return true;
    }catch{return false;}
  }
  async restoreData(data,user){
    if(!this.validateImportData(data))throw new Error('Archivo de respaldo inválido o incompatible. No se modificó ningún viaje.');
    const legacy=data.metadata.version==='1.0.0';
    const confirmed=await this.showImportConfirmation(data,legacy);this.assertUser(user);
    if(!confirmed){notice('Restauración cancelada. No se modificaron datos.','info');return {success:false,cancelled:true};}
    // Confirm the destination can persist preferences before creating any trips.
    const key=`japitin_import_check_${user.uid}`;localStorage.setItem(key,'1');localStorage.removeItem(key);
    const before=await this.collectBackup(user);
    await this.uploadArchive(before,`backups/${user.uid}/before-import.json`,user);
    const path=`backups/${user.uid}/import-${crypto.randomUUID()}.json`;
    let result;
    try {
      await this.uploadArchive(data,path,user);
      const restore=httpsCallable(getFunctions(app,'us-central1'),'restoreUserBackup',{timeout:540000});
      result=(await restore({backupPath:path})).data;this.assertUser(user);
      this.applyLocalData(data,user);
    } finally {await deleteObject(ref(storage,path)).catch(()=>{});}
    notice(`Restauración completada: ${result.tripCount} copias privadas. Tus viajes anteriores se conservaron.`,'success');
    // No forced reload: active forms and drafts remain intact.
    window.dispatchEvent(new CustomEvent('backupRestored',{detail:result}));
    return {success:true,...result};
  }
  applyLocalData(data,user){
    this.assertUser(user);
    const values=new Map();
    for(const key of LOCAL_KEYS)if(typeof data.localStorage?.[key]==='string')values.set(key,data.localStorage[key]);
    for(const [name,key]of Object.entries(ML_KEYS))if(data.mlHistory?.[name]!=null)values.set(key,JSON.stringify(data.mlHistory[name]));
    const settings=safeSettings(data.settings || {});
    if(record(data.userProfile?.basicInfo))settings.basicInfo=data.userProfile.basicInfo;
    if(record(data.userProfile?.travelPreferences))settings.travelPreferences=data.userProfile.travelPreferences;
    let merged;
    if(Object.keys(settings).length){const current=window.UserSettings?.settings || JSON.parse(localStorage.getItem('user_settings') || '{}');merged=mergeSettings(current,settings);merged.metadata={...current.metadata,...settings.metadata,updatedAt:new Date().toISOString()};values.set('user_settings',JSON.stringify(merged));}
    const previous=new Map([...values.keys()].map(key=>[key,localStorage.getItem(key)]));
    try{for(const [key,value]of values)localStorage.setItem(key,value);}catch(error){for(const [key,value]of previous){try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}catch{ /* report original storage failure */ }}throw new Error('Las copias de los viajes se crearon, pero no se pudieron aplicar las preferencias. Podés reintentar sin duplicar los viajes.');}
    if(merged&&window.UserSettings){window.UserSettings.settings=merged;window.dispatchEvent(new CustomEvent('settingsUpdated',{detail:merged}));}
  }
  showImportConfirmation(data,legacy){return window.Dialogs?.confirm?window.Dialogs.confirm({title:'Restaurar respaldo',message:`Se crearán ${data.trips?.length || 0} copias privadas sin reemplazar tus viajes. Los recordatorios se restauran desactivados y los pagos compartidos como historial. Se guardará una copia previa en la nube.${legacy?' Este archivo antiguo puede no incluir itinerarios ni adjuntos.':''}`,okText:'Restaurar copias'}):window.confirm('¿Restaurar como copias privadas y guardar antes un respaldo? No se reemplazarán tus viajes actuales.');}
  async readJSONFile(file){if(!file||file.size>BACKUP_MAX_BYTES)throw new Error('Elegí un archivo JSON de hasta 50 MB.');try{return JSON.parse(await file.text());}catch{throw new Error('El archivo no contiene JSON válido.');}}
  downloadJSON(data,filename){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
}
