import { auth, db } from '../../core/firebase-config.js';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
export const shoppingText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=(value,fallback=0)=>Number.isFinite(Number(value))&&Number(value)>=0?Number(value):fallback;
export const shoppingState={
  context(){return {tripId:this.currentTripId,uid:auth.currentUser?.uid,version:this.loadVersion};},
  isCurrent(context){return Boolean(context&&context.tripId&&context.tripId===this.currentTripId&&context.tripId===window.TripsManager?.currentTrip?.id&&context.uid===auth.currentUser?.uid&&context.version===this.loadVersion);},
  normalizeItem(value){
    if(!value||typeof value!=='object'||typeof value.id!=='string'||!value.id||typeof value.name!=='string')return null;
    return {...value,name:value.name,category:Object.hasOwn(this.CATEGORIES,value.category)?value.category:'other',priority:['low','medium','high'].includes(value.priority)?value.priority:'medium',status:['pending','purchased','skipped'].includes(value.status)?value.status:'pending',quantity:Number.isSafeInteger(Number(value.quantity))&&Number(value.quantity)>0?Number(value.quantity):1,estimatedPrice:number(value.estimatedPrice),actualPrice:value.actualPrice!=null&&value.actualPrice!==''&&Number.isFinite(Number(value.actualPrice))&&Number(value.actualPrice)>=0?Number(value.actualPrice):null,weight:number(value.weight),notes:typeof value.notes==='string'?value.notes:'',store:typeof value.store==='string'?value.store:null};
  },
  validateItem(value){
    if(!value||typeof value.name!=='string'||!value.name.trim()||value.name.trim().length>160)throw new Error('Escribí un nombre de hasta 160 caracteres.');
    const quantity=Number(value.quantity??1),estimatedPrice=Number(value.estimatedPrice??0),weight=Number(value.weight??0);
    if(!Number.isSafeInteger(quantity)||quantity<1||quantity>999)throw new Error('La cantidad debe ser un entero entre 1 y 999.');
    if(!Number.isSafeInteger(estimatedPrice)||estimatedPrice<0||!Number.isSafeInteger(estimatedPrice*quantity))throw new Error('El precio debe ser un importe entero válido en JPY.');
    if(!Number.isFinite(weight)||weight<0||!Number.isFinite(weight*quantity))throw new Error('El peso debe ser un número positivo o cero.');
    if(!Object.hasOwn(this.CATEGORIES,value.category??'other')||!['low','medium','high'].includes(value.priority??'medium'))throw new Error('Categoría o prioridad inválida.');
    return {name:value.name.trim(),category:value.category??'other',store:value.store||null,estimatedPrice,quantity,weight,priority:value.priority??'medium',notes:String(value.notes??'').slice(0,2000),plannedDay:value.plannedDay??null};
  },
  async init(tripId){
    this.currentTripId=tripId;this.loadVersion=(this.loadVersion||0)+1;this.shoppingList=[];this.loadState='loading';
    document.getElementById('addItemForm')?.remove();document.getElementById('purchaseDialog')?.remove();
    if(!tripId){this.close();return;}
    return this.loadShoppingList();
  },
  async loadShoppingList(){
    const context=this.context(),request=this.shoppingReadVersion=(this.shoppingReadVersion||0)+1;if(!context.tripId||!context.uid){this.loadState='error';this.refreshShopping();return false;}
    this.loadState='loading';this.refreshShopping();
    try{
      const snapshot=await getDoc(doc(db,'trips',context.tripId,'data','shopping'));
      if(!this.isCurrent(context)||request!==this.shoppingReadVersion)return false;
      const items=snapshot.exists()?snapshot.data().items:[];
      if(items!=null&&!Array.isArray(items))throw new Error('La lista guardada tiene un formato inválido.');
      this.shoppingList=(items||[]).map(item=>this.normalizeItem(item)).filter(Boolean);this.loadState='ready';this.refreshShopping();return true;
    }catch(error){if(this.isCurrent(context)&&request===this.shoppingReadVersion){this.loadState='error';this.refreshShopping();}return false;}
  },
  refreshShopping(){if(document.getElementById('shoppingTrackerModal'))this.renderShoppingTracker();},
  async changeShopping(change,key,context=this.context()){
    if(!this.isCurrent(context)||!context.uid){window.Notifications?.show('El viaje o la cuenta cambió. Volvé a abrir el formulario.','error');return false;}
    this.pendingShopping||=new Set();const pending=`${context.uid}:${context.tripId}:${key}`;
    if(this.pendingShopping.has(pending))return false;this.pendingShopping.add(pending);
    try{
      const target=doc(db,'trips',context.tripId,'data','shopping');
      const result=await runTransaction(db,async transaction=>{
        if(!this.isCurrent(context))throw new Error('El viaje o la cuenta cambió.');
        const snapshot=await transaction.get(target);
        if(!this.isCurrent(context))throw new Error('El viaje o la cuenta cambió.');
        const items=snapshot.exists()?snapshot.data().items??[]:[];
        if(!Array.isArray(items))throw new Error('La lista guardada tiene un formato inválido.');
        const next=change(items.map(item=>item&&typeof item==='object'?{...item}:item));
        transaction.set(target,{items:next,lastUpdated:new Date().toISOString()},{merge:true});return next;
      });
      if(!this.isCurrent(context))return false;
      this.shoppingReadVersion=(this.shoppingReadVersion||0)+1;
      this.shoppingList=result.map(item=>this.normalizeItem(item)).filter(Boolean);this.loadState='ready';this.refreshShopping();return true;
    }catch(error){if(this.isCurrent(context))window.Notifications?.show(`${error.message} Tus datos no se dieron por guardados; podés reintentar.`,'error');return false;}finally{this.pendingShopping.delete(pending);}
  },
  async addItem(value,context=this.context()){
    try{const item={...this.validateItem(value),id:`shop_${crypto.randomUUID()}`,actualPrice:null,status:'pending',purchasedDate:null,createdAt:new Date().toISOString()};
      if(!await this.changeShopping(items=>[...items,item],'add',context))return false;
      window.Notifications?.show('Artículo agregado.','success');return item.id;
    }catch(error){window.Notifications?.show(error.message,'error');return false;}
  },
  async markAsPurchased(id,price,context=this.context()){
    if(!Number.isSafeInteger(Number(price))||Number(price)<0){window.Notifications?.show('Ingresá un precio entero válido en JPY.','error');return false;}
    const result=await this.changeShopping(items=>{const item=items.find(item=>item?.id===id);if(!item)throw new Error('El artículo ya no existe.');if(!Number.isSafeInteger(Number(price)*(this.normalizeItem(item)?.quantity||1)))throw new Error('Importe fuera de rango.');item.actualPrice=Number(price);item.status='purchased';item.purchasedDate=new Date().toISOString();return items;},id,context);
    if(result)window.Notifications?.show('Compra guardada.','success');return result;
  },
  async deleteItem(id){const result=await this.changeShopping(items=>items.filter(item=>item?.id!==id),id);if(result)window.Notifications?.show('Artículo eliminado.','success');return result;},
  async editItem(id,changes,context=this.context()){
    if(changes===undefined){this.showAddItemForm(id);return;}
    const result=await this.changeShopping(items=>{const item=items.find(item=>item?.id===id);if(!item)throw new Error('El artículo ya no existe.');const patch=Object.fromEntries(['name','category','store','estimatedPrice','priority','notes','plannedDay','weight','quantity'].filter(key=>Object.hasOwn(changes,key)).map(key=>[key,changes[key]]));Object.assign(item,this.validateItem({...this.normalizeItem(item),...patch}));return items;},id,context);
    if(result)window.Notifications?.show('Artículo actualizado.','success');return result;
  },
  getStats(){const items=this.shoppingList.map(item=>this.normalizeItem(item)).filter(Boolean);return {total:items.length,pending:items.filter(item=>item.status==='pending').length,purchased:items.filter(item=>item.status==='purchased').length,skipped:items.filter(item=>item.status==='skipped').length,totalEstimated:items.reduce((sum,item)=>sum+item.estimatedPrice*item.quantity,0),totalActual:items.filter(item=>item.status==='purchased').reduce((sum,item)=>sum+(item.actualPrice??0)*item.quantity,0),totalWeight:items.filter(item=>item.status==='purchased').reduce((sum,item)=>sum+item.weight*item.quantity,0),missingActual:items.filter(item=>item.status==='purchased'&&item.actualPrice===null).length};},
  async saveNewItem(){
    const form=document.getElementById('addItemForm');if(!form||form.saving)return false;
    const field=id=>form.querySelector(`#${id}`)?.value??'';
    const value={name:field('itemName'),category:field('itemCategory'),store:field('itemStore')||null,estimatedPrice:Number(field('itemPrice')),quantity:Number(field('itemQuantity')),priority:field('itemPriority'),weight:Number(field('itemWeight')),notes:field('itemNotes')};
    try{this.validateItem(value);}catch(error){window.Notifications?.show(error.message,'error');return false;}
    form.saving=true;const controls=[...form.querySelectorAll('input,select,textarea,button')];controls.forEach(node=>node.disabled=true);
    try{const delta=form.shoppingItem?Object.fromEntries(Object.entries(value).filter(([key,item])=>item!==form.shoppingItem[key])):value;
      const saved=form.shoppingItem?await this.editItem(form.shoppingItem.id,delta,form.shoppingContext):await this.addItem(value,form.shoppingContext);
      if(saved)form.remove();return Boolean(saved);
    }finally{form.saving=false;controls.forEach(node=>node.disabled=false);}
  },
  async confirmPurchase(id){
    const form=document.getElementById('purchaseDialog');if(!form||form.saving)return false;
    const raw=form.querySelector('#actualPrice')?.value??'';if(!raw.trim()){window.Notifications?.show('Ingresá el precio real por unidad.','error');return false;}
    form.saving=true;const controls=[...form.querySelectorAll('button,input')];controls.forEach(node=>node.disabled=true);
    try{const saved=await this.markAsPurchased(id,Number(raw),form.shoppingContext);if(saved)form.remove();return saved;}finally{form.saving=false;controls.forEach(node=>node.disabled=false);}
  }
};
