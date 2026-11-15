import { auth, db } from '../../core/firebase-config.js';
import { collection, doc, getDocs, query, orderBy, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export const journalState={
  journalScope(){return {uid:auth.currentUser?.uid||null,tripId:auth.currentUser?window.TripsManager?.currentTrip?.id||null:null,version:this.contextVersion||0};},
  isJournalCurrent(scope){const now=this.journalScope();return scope.uid===now.uid&&scope.tripId===now.tripId&&scope.version===now.version;},
  journalCacheKey(scope){return `japitin_journal_${JSON.stringify([scope.uid,scope.tripId])}`;},
  normalizeEntries(value){
    if(!Array.isArray(value))return [];
    return value.filter(row=>row&&typeof row==='object'&&typeof row.id==='string'&&typeof row.title==='string'&&typeof row.content==='string').map(row=>({...row,tags:Array.isArray(row.tags)?row.tags.filter(tag=>typeof tag==='string'):[],photos:Array.isArray(row.photos)?row.photos:[],location:typeof row.location==='string'?row.location:'',date:typeof row.date==='string'?row.date:'',timestamp:Number.isFinite(row.timestamp)?row.timestamp:0,wordCount:row.content.trim().split(/\s+/).filter(Boolean).length}));
  },
  loadFromLocalStorage(scope=this.journalScope()){try{return this.normalizeEntries(JSON.parse(localStorage.getItem(this.journalCacheKey(scope))||'[]'));}catch{return [];}},
  cacheEntries(scope,entries,cloudConfirmed=false){try{localStorage.setItem(this.journalCacheKey(scope),JSON.stringify(entries));return true;}catch(error){if(!cloudConfirmed)throw error;return false;}},
  async initialize(){
    const selected=this.journalScope();
    if(this.initialized&&this.boundUid===selected.uid&&this.currentTripId===selected.tripId)return this.loading;
    this.cleanup();this.initialized=true;this.currentTripId=selected.tripId;this.boundUid=selected.uid;
    const scope=this.journalScope();this.entries=this.loadFromLocalStorage(scope);this.loadState='loading';this.setupUI();
    this.loading=(async()=>{await this.loadEntries(scope);if(this.isJournalCurrent(scope)&&scope.uid&&scope.tripId)this.setupRealtimeSync(scope);})();
    return this.loading;
  },
  async loadEntries(scope=this.journalScope()){
    const request=this.readVersion=(this.readVersion||0)+1;
    try{
      let entries;
      if(scope.uid&&scope.tripId){const snapshot=await getDocs(query(collection(db,'trips',scope.tripId,'journal'),orderBy('timestamp','desc')));entries=[];snapshot.forEach(record=>entries.push({...record.data(),id:record.id}));}
      else entries=this.loadFromLocalStorage(scope);
      if(!this.isJournalCurrent(scope)||request!==this.readVersion)return false;
      this.entries=this.normalizeEntries(entries);this.loadState='ready';this.cacheEntries(scope,this.entries,true);this.renderEntries();return true;
    }catch(error){if(this.isJournalCurrent(scope)&&request===this.readVersion){this.loadState='error';this.renderEntries();}return false;}
  },
  setupRealtimeSync(scope=this.journalScope()){
    this.unsubscribe?.();
    this.unsubscribe=onSnapshot(query(collection(db,'trips',scope.tripId,'journal'),orderBy('timestamp','desc')),snapshot=>{
      if(!this.isJournalCurrent(scope))return;
      const entries=[];snapshot.forEach(record=>entries.push({...record.data(),id:record.id}));
      this.readVersion=(this.readVersion||0)+1;this.entries=this.normalizeEntries(entries);this.loadState='ready';this.cacheEntries(scope,this.entries,true);this.renderEntries();
    },()=>{if(this.isJournalCurrent(scope)){this.loadState='error';this.renderEntries();}});
  },
  async changeJournal(kind,id,value,scope){
    this.pendingEntries ||= new Set();const key=JSON.stringify([scope.uid,scope.tripId,id]);
    if(this.pendingEntries.has(key))return false;
    this.pendingEntries.add(key);
    try{
      if(!this.isJournalCurrent(scope))throw new Error('El viaje o la cuenta cambi\u00f3.');
      if(kind!=='delete'&&(!value.title?.trim()||!value.content?.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(value.date)||!Number.isFinite(Date.parse(value.date))))throw new Error('Completa t\u00edtulo, contenido y fecha v\u00e1lida.');
      const cloud=Boolean(scope.uid&&scope.tripId&&!id.startsWith('local_'));
      if(cloud){
        const target=doc(db,'trips',scope.tripId,'journal',id);
        if(kind==='delete')await deleteDoc(target);
        else if(kind==='update')await updateDoc(target,value);
        else await setDoc(target,value);
      }
      if(!this.isJournalCurrent(scope))return false;
      const next=kind==='delete'?this.entries.filter(row=>row.id!==id):[{...(this.entries.find(row=>row.id===id)||{}),...value,id},...this.entries.filter(row=>row.id!==id)];
      this.cacheEntries(scope,next,cloud);this.entries=this.normalizeEntries(next);this.readVersion=(this.readVersion||0)+1;this.renderEntries();return true;
    }catch(error){if(this.isJournalCurrent(scope))window.Notifications?.error?.(`${error.message} Tu texto sigue en el formulario.`);return false;}
    finally{this.pendingEntries.delete(key);}
  },
  addEntry(value,scope=this.journalScope(),id=crypto.randomUUID()){return this.changeJournal('add',scope.uid&&scope.tripId?id:`local_${id}`,value,scope);},
  updateEntry(id,value,scope=this.journalScope()){return this.changeJournal('update',id,value,scope);},
  async deleteEntry(id){const scope=this.journalScope();if(!confirm('\u00bfEliminar esta entrada?'))return false;return this.changeJournal('delete',id,null,scope);},
  cleanup(){this.contextVersion=(this.contextVersion||0)+1;this.unsubscribe?.();this.unsubscribe=null;this.initialized=false;this.entries=[];this.currentTripId=null;this.boundUid=null;this.entryModals?.forEach(modal=>modal.remove());this.entryModals=new Set();this.renderEntries();},
  async reinitialize(){const active=this.initialized;this.cleanup();if(active)return this.initialize();}
};
