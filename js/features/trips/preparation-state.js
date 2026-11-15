import { auth, db } from '../../core/firebase-config.js';
import { doc, onSnapshot, runTransaction } from 'firebase/firestore';

const categories=['documents','clothing','electronics','health','money','misc'];
export const preparationState={
  packingScope(){return {uid:auth.currentUser?.uid||null,tripId:auth.currentUser?this.getCurrentTripId():null,version:this.syncVersion};},
  samePackingScope(scope){const now=this.packingScope();return scope.uid===now.uid&&scope.tripId===now.tripId&&scope.version===now.version;},
  packingCacheKey(scope){return `japitin_packing_${JSON.stringify([scope.uid,scope.tripId])}`;},
  normalizePacking(value){
    if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Formato de equipaje no v\u00e1lido.');
    return Object.fromEntries(categories.map(category=>{
      if(value[category]!=null&&!Array.isArray(value[category]))throw new Error('Formato de categor\u00eda no v\u00e1lido.');
      const occurrences=new Map();
      return [category,(value[category]||[]).filter(item=>item&&typeof item.name==='string').map(item=>{
        const key=JSON.stringify(Object.keys(item).sort().map(key=>[key,item[key]])),count=occurrences.get(key)||0;occurrences.set(key,count+1);
        return {...item,id:typeof item.id==='string'&&item.id?item.id:`legacy:${category}:${key}:${count}`,checked:Boolean(item.checked),owner:typeof item.owner==='string'?item.owner:null};
      })];
    }));
  },
  packingRef(scope){return scope.tripId?doc(db,'trips',scope.tripId,'data','packing'):doc(db,'users',scope.uid,'packing','list');},
  cachePacking(scope,items){try{localStorage.setItem(this.packingCacheKey(scope),JSON.stringify(items));}catch{/* Cloud confirmation is authoritative. */}},
  readPackingCache(scope){try{const saved=localStorage.getItem(this.packingCacheKey(scope));return this.normalizePacking(saved?JSON.parse(saved):this.getDefaultPackingList());}catch{return this.normalizePacking(this.getDefaultPackingList());}},
  async initRealtimeSync(){
    this.unsubscribe?.();this.unsubscribe=null;this.syncVersion=(this.syncVersion||0)+1;
    const scope=this.packingScope();this.packingList=this.readPackingCache(scope);this.packingLoadState=scope.uid?'loading':'ready';this.renderPreparation();
    if(!scope.uid)return;
    this.unsubscribe=onSnapshot(this.packingRef(scope),snapshot=>{
      if(!this.samePackingScope(scope))return;
      try{this.packingList=this.normalizePacking(snapshot.exists()?snapshot.data().items:this.getDefaultPackingList());this.packingLoadState='ready';this.cachePacking(scope,this.packingList);}
      catch{this.packingLoadState='error';}
      this.renderPreparation();
    },()=>{if(!this.samePackingScope(scope))return;this.packingLoadState='error';this.renderPreparation();});
  },
  async changePacking(scope,change,message='Lista guardada'){
    try{
      if(!this.samePackingScope(scope))throw new Error('El viaje o la cuenta cambi\u00f3. Volv\u00e9 a intentarlo.');
      let result;
      if(!scope.uid){
        result=change(this.readPackingCache(scope));
        localStorage.setItem(this.packingCacheKey(scope),JSON.stringify(result));
      }else{
        const target=this.packingRef(scope);
        result=await runTransaction(db,async transaction=>{
          if(!this.samePackingScope(scope))throw new Error('El viaje o la cuenta cambi\u00f3.');
          const snapshot=await transaction.get(target);
          if(!this.samePackingScope(scope))throw new Error('El viaje o la cuenta cambi\u00f3.');
          const original=snapshot.exists()?snapshot.data().items:this.getDefaultPackingList();
          const next=change(this.normalizePacking(original));
          transaction.set(target,{items:{...original,...next},lastUpdated:new Date().toISOString(),updatedBy:auth.currentUser?.email||null},{merge:true});return next;
        });
      }
      if(!this.samePackingScope(scope))return false;
      this.packingList=result;this.packingLoadState='ready';this.cachePacking(scope,result);this.renderPreparation();window.Notifications?.show(message,'success');return true;
    }catch(error){if(this.samePackingScope(scope)){this.renderPreparation();window.Notifications?.show(`${error.message} No se confirm\u00f3 el guardado.`,'error');}return false;}
  },
  packingItem(category,index){return this.packingList[category]?.[index];},
  async toggleItem(category,index){
    const item=this.packingItem(category,index);if(!item)return false;
    const scope=this.packingScope(),id=item.id,checked=!item.checked;
    return this.changePacking(scope,list=>{const target=list[category]?.find(row=>row.id===id);if(!target)throw new Error('El art\u00edculo ya no existe.');target.checked=checked;return list;});
  },
  async assignItem(category,index,owner){
    const item=this.packingItem(category,index);if(!item)return false;
    const scope=this.packingScope(),id=item.id;
    return this.changePacking(scope,list=>{const target=list[category]?.find(row=>row.id===id);if(!target)throw new Error('El art\u00edculo ya no existe.');target.owner=owner||null;return list;},'Responsable actualizado');
  },
  async addCustomItem(category){
    if(!categories.includes(category)||this.addingPacking)return false;
    this.addingPacking=true;const scope=this.packingScope();
    try{
      const name=await window.Dialogs.prompt({title:'Agregar art\u00edculo',message:'Nombre del art\u00edculo',placeholder:'Ej: Bater\u00eda extra',defaultValue:this.packingDraft?.category===category?this.packingDraft.name:''});
      if(!name||!name.trim())return false;
      if(name.trim().length>160){window.Notifications?.show('Us\u00e1 hasta 160 caracteres.','error');return false;}
      const item={id:crypto.randomUUID(),name:name.trim(),checked:false,isDefault:false};
      const saved=await this.changePacking(scope,list=>{list[category].push(item);return list;},'Art\u00edculo agregado');
      if(saved)this.packingDraft=null;
      if(!saved&&this.samePackingScope(scope)){this.packingDraft={category,name:name.trim()};window.Notifications?.show('El nombre se conservar\u00e1 al reintentar.','info');}
      return saved;
    }finally{this.addingPacking=false;}
  },
  async deleteCustomItem(category,index){
    const item=this.packingItem(category,index);if(!item||item.isDefault)return false;
    const id=item.id,scope=this.packingScope();
    const confirmed=await window.Dialogs.confirm({title:'Eliminar art\u00edculo',message:'\u00bfEliminar este art\u00edculo?' ,okText:'Eliminar',isDestructive:true});
    if(!confirmed)return false;
    return this.changePacking(scope,list=>{const target=list[category]?.find(row=>row.id===id);if(!target||target.isDefault)throw new Error('El art\u00edculo ya no est\u00e1 disponible.');list[category]=list[category].filter(row=>row.id!==id);return list;},'Art\u00edculo eliminado');
  },
  reinitialize(){this.packingDraft=null;return this.initRealtimeSync();},
  cleanup(){this.unsubscribe?.();this.unsubscribe=null;this.syncVersion=(this.syncVersion||0)+1;this.packingDraft=null;this.packingList=this.normalizePacking(this.getDefaultPackingList());this.renderPreparation();}
};
