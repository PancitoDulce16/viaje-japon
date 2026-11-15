'use strict';
const {FieldValue}=require('firebase-admin/firestore');
function createExpenseNotificationHandler({db,messaging}) {
  return async event=>{
    const expense=event.data?.data();if(!expense)return;
    const tripId=event.params.tripId,tripSnap=await db.doc(`trips/${tripId}`).get();
    if(!tripSnap.exists || tripSnap.data().restoreState==='importing')return;
    const trip=tripSnap.data(),targets=new Map();
    for(const userId of trip.members || []) {
      if(userId===(expense.createdBy || expense.userId))continue;
      const userRef=db.doc(`users/${userId}`);
      const [user,prefs,devices]=await Promise.all([userRef.get(),db.doc(`users/${userId}/notificationPreferences/default`).get(),db.collection(`users/${userId}/devices`).where('pushEnabled','==',true).get()]);
      if(prefs.exists && prefs.data().push===false)continue;
      if(user.exists && expense.addedBy && user.data().email===expense.addedBy)continue;
      const add=(token,target)=>{if(typeof token!=='string'||!token)return;if(!targets.has(token))targets.set(token,[]);targets.get(token).push(target);};
      if(user.exists)for(const token of user.data().fcmTokens || [])add(token,{userRef});
      for(const device of devices.docs)add(device.data().token,{deviceRef:device.ref});
    }
    const tokens=[...targets.keys()];
    for(let offset=0;offset<tokens.length;offset+=500){
      const batch=tokens.slice(offset,offset+500);
      const response=await messaging.sendEachForMulticast({tokens:batch,notification:{title:`Nuevo gasto en ${trip.info?.name || 'tu viaje'}`,body:'Abre Japitin para consultar los detalles del gasto.'},data:{actionPath:'/dashboard#budget',tripId}});
      for(let i=0;i<response.responses.length;i++)if(/registration-token-not-registered|invalid-registration-token/.test(response.responses[i].error?.code || '')){
        for(const target of targets.get(batch[i]))if(target.deviceRef)await target.deviceRef.delete();else await target.userRef.update({fcmTokens:FieldValue.arrayRemove(batch[i])});
      }
    }
  };
}
module.exports={createExpenseNotificationHandler};
