import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,getDoc} from 'firebase/firestore';
const require=createRequire(new URL('../functions/package.json',import.meta.url));
const {initializeApp,deleteApp}=require('firebase-admin/app');
const {getFirestore,Timestamp}=require('firebase-admin/firestore');
const {restoreArchive}=require('./backup-archive.js');
if(!process.env.FIRESTORE_EMULATOR_HOST)throw new Error('backup restore tests require Firestore Emulator');
const app=initializeApp({projectId:'japitin-backup-test'},'backup-test');
const db=getFirestore(app),files=new Map();
const security=await initializeTestEnvironment({projectId:'japitin-backup-test',firestore:{rules:fs.readFileSync(new URL('../firestore.rules',import.meta.url),'utf8')}});
let failUpload=false;
const bucket={name:'test-bucket',file:path=>({save:async(bytes,options)=>{if(failUpload)throw new Error('upload failure');files.set(path,{bytes,options});},delete:async()=>{files.delete(path);}})};
const archive={metadata:{version:'2.0.0'},trips:[{id:'original',members:['owner','friend'],info:{createdBy:'owner',name:'Original',shareCode:'OLD123',dateStart:'2027-01-01',dateEnd:'2027-01-03'},collections:{
  data:[{id:'itinerary',data:{days:[{date:'2027-01-01',activities:[]}],savedAt:{__japitinType:'timestamp',seconds:123,nanoseconds:450000}}}],
  tasks:[{id:'task',data:{title:'Terminado',completed:true,createdBy:'owner',tripId:'original'}}],
  reminders:[{id:'reminder',data:{active:true,targetUserId:'friend',createdBy:'friend'}}],
  expenses:[{id:'expense',data:{createdBy:'friend',amountMinor:100,split:{enabled:true,participantIds:['owner','friend']}}}],
  settlements:[{id:'settlement',data:{payerId:'owner',receiverId:'friend',status:'confirmed',applied:true}}],
  documents:[{id:'document',data:{storagePath:'trips/original/documents/owner/document/ticket.pdf',uploadedBy:'owner',sensitive:true},file:{name:'ticket.pdf',mimeType:'application/pdf',base64:Buffer.from('%PDF-1.4 sample').toString('base64')}}]
}}]};
try{
  await db.doc('trips/original').set({members:['owner','friend'],info:{name:'Original',createdBy:'owner'}});
  const result=await restoreArchive({archive,userId:'owner',email:'owner@example.test',db,bucket});
  assert.equal(result.tripCount,1);assert.notEqual(result.tripIds[0],'original');
  const copy=db.doc(`trips/${result.tripIds[0]}`),trip=(await copy.get()).data();
  assert.deepEqual(trip.members,['owner']);assert.notEqual(trip.info.shareCode,'OLD123');
  await assertSucceeds(getDoc(doc(security.authenticatedContext('owner').firestore(),`trips/${copy.id}`)));
  await assertFails(getDoc(doc(security.authenticatedContext('friend').firestore(),`trips/${copy.id}`)));
  assert.deepEqual((await db.doc('trips/original').get()).data().members,['owner','friend']);
  const saved=(await copy.collection('data').doc('itinerary').get()).data().savedAt;assert.ok(saved instanceof Timestamp);assert.equal(saved.nanoseconds,450000);
  assert.equal((await copy.collection('tasks').doc('task').get()).data().tripId,copy.id);
  assert.equal((await copy.collection('reminders').doc('reminder').get()).data().active,false);
  assert.equal((await copy.collection('expenses').doc('expense').get()).data().split,null);
  assert.equal((await copy.collection('settlements').get()).size,0);
  assert.equal((await copy.collection('data').doc('imported-settlement-settlement').get()).data().importedHistorical,true);
  const document=(await copy.collection('documents').doc('document').get()).data();
  assert.match(document.storagePath,new RegExp(`^trips/${copy.id}/documents/owner/`));assert.equal(files.get(document.storagePath).bytes.toString(),'%PDF-1.4 sample');
  const again=await restoreArchive({archive,userId:'owner',db,bucket});assert.deepEqual(again,result);
  const before=(await db.collection('trips').get()).size;
  const failed=structuredClone(archive);failed.trips[0].info.name='Failure';failUpload=true;
  await assert.rejects(restoreArchive({archive:failed,userId:'owner',db,bucket}),/upload failure/);
  assert.equal((await db.collection('trips').get()).size,before);assert.equal(files.size,1);
  failUpload=false;const retried=await restoreArchive({archive:failed,userId:'owner',db,bucket});assert.equal(retried.tripCount,1);
  const legacy={metadata:{version:'1.0.0'},trips:[{id:'original',info:{name:'Legacy'},members:['friend']}]};
  const legacyResult=await restoreArchive({archive:legacy,userId:'owner',db,bucket});assert.equal(legacyResult.tripCount,1);
  assert.deepEqual((await db.doc('trips/original').get()).data().members,['owner','friend']);
  console.log('backup restore: private copies, original preservation, binary files, timestamps, inactive reminders, historical payments, idempotence, rollback, retry and legacy archives ok');
}finally{await db.recursiveDelete(db.collection('trips'));await db.recursiveDelete(db.collection('users'));await security.cleanup();await deleteApp(app);}
