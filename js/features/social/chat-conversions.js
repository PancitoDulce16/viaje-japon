import { db } from '../../core/firebase-config.js';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { parseMoneyToMinor, isSupportedCurrency, RATE_SCALE } from '../budget/money.js';

export async function convertChatMessage(messageId,type,text){
  const context=this.captureMessageContext();
  if(!context)return false;
  this.pendingConversions ||= new Set();
  const key=JSON.stringify([context.user.uid,context.tripId,messageId,type]);
  if(this.pendingConversions.has(key))return false;
  this.pendingConversions.add(key);
  try{
    if(type==='activity'){
      const handler=window.ItineraryHandler;
      const day=handler?.__getCurrentDay?.()||handler?.currentItinerary?.days?.[0]?.day;
      if(!handler||!day)return false;
      this.close();window.DashboardApp?.switchTab('itinerary');
      return await new Promise((resolve,reject)=>setTimeout(()=>{
        try{
        if(!this.isMessageContextCurrent(context)||window.ItineraryHandler!==handler)return resolve(false);
        handler.showActivityModal(null,day);
        const title=document.getElementById('activityTitle'),description=document.getElementById('activityDesc');
        if(title)title.value=text.slice(0,90);
        if(description)description.value=`Creado desde el chat \u00b7 ${text}`;
        resolve(Boolean(title));
        }catch(error){reject(error);}
      },120));
    }
    const candidate=window.BudgetTracker?.baseCurrency||window.TripsManager?.currentTrip?.budget?.currency||'CRC';
    const currency=isSupportedCurrency(candidate)?candidate:'CRC';
    const value=await window.Dialogs?.prompt({title:`Convertir en gasto (${currency})`,message:this.escapeHtml(text),placeholder:currency==='USD'?'Ej: 2,50':'Monto entero'});
    if(value==null||!this.isMessageContextCurrent(context))return false;
    const amountMinor=parseMoneyToMinor(value,currency);
    if(!amountMinor)throw new Error(`Ingresa un monto positivo v\u00e1lido en ${currency}, sin separadores de miles.`);
    const now=new Date();
    const payload={description:text.slice(0,160),desc:text.slice(0,160),amountMinor,amount:amountMinor,originalCurrency:currency,baseCurrency:currency,convertedAmountMinor:amountMinor,exchangeRate:1,exchangeRateScaled:RATE_SCALE,exchangeRateFetchedAt:now.toISOString(),exchangeRateSource:'same-currency',conversionManual:false,category:'Otros',date:now.toISOString().slice(0,10),timestamp:now.getTime(),createdBy:context.user.uid,addedBy:context.user.email||'',paidBy:context.user.uid,movementType:'expense',sourceMessageId:messageId,createdAt:serverTimestamp()};
    const target=doc(db,'trips',context.tripId,'expenses',`chat_${encodeURIComponent(messageId)}`);
    const created=await runTransaction(db,async transaction=>{
      if(!this.isMessageContextCurrent(context))throw new Error('El viaje o la cuenta cambi\u00f3.');
      const snapshot=await transaction.get(target);
      if(!this.isMessageContextCurrent(context))throw new Error('El viaje o la cuenta cambi\u00f3.');
      if(snapshot.exists())return false;
      transaction.set(target,payload);return true;
    });
    if(this.isMessageContextCurrent(context))window.Notifications?.show(created?'Gasto creado desde el chat':'Este mensaje ya tiene un gasto asociado',created?'success':'info');
    return true;
  }catch(error){if(this.isMessageContextCurrent(context))window.Notifications?.error(error.message||'No se pudo convertir el mensaje');return false;}
  finally{this.pendingConversions.delete(key);}
}
