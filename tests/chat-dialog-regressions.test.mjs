import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const writes=[],notices=[];
const context={console:{log(){},warn(){},error(){}},URL,db:{},auth:{currentUser:{uid:'me',email:null}},
  window:{addEventListener(){},TripsManager:{currentTrip:{id:'A'}},Dialogs:{},Notifications:{show:text=>notices.push(text),error:text=>notices.push(text),warning:text=>notices.push(text)}},
  collection:(_,path)=>path,doc:(_,path,id)=>`${path}/${id}`,serverTimestamp:()=>1,
  addDoc:async(path,data)=>{writes.push({path,data});},updateDoc:async(path,data)=>writes.push({path,data}),deleteDoc:async path=>writes.push({path})};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../js/features/social/group-chat.js',import.meta.url),'utf8').replace(/^import[\s\S]*?;\r?\n/gm,'').replace('export const GroupChat','const GroupChat'),context);
const chat=context.window.GroupChat;
function reset(){writes.length=0;notices.length=0;context.auth.currentUser={uid:'me',email:null};context.window.TripsManager.currentTrip={id:'A'};}

// A dialog opened for A must never send to B after switching trips.
for(const [method,answers] of [['sharePhoto',['https://example.com/photo.jpg','Recuerdo']],['shareAttachment',['archivo','https://example.com/reserva.pdf','Reserva']],['createQuickPoll',['¿Dónde?','Ramen, Sushi']]]){
  reset();let index=0;
  context.window.Dialogs.prompt=async()=>{const answer=answers[index++];if(index===answers.length)context.window.TripsManager.currentTrip={id:'B'};return answer;};
  await chat[method]();assert.equal(writes.length,0,method);
}

// Cancellation of the final prompt must not publish a photo/file/poll.
for(const [method,answers] of [['sharePhoto',['https://example.com/photo.jpg',null]],['shareAttachment',['archivo','https://example.com/file.pdf',null]],['createQuickPoll',['Pregunta',null]]]){
  reset();context.window.Dialogs.prompt=async()=>answers.shift();await chat[method]();assert.equal(writes.length,0,method);
}

reset();let answers=['https://example.com/photo.jpg',''];context.window.Dialogs.prompt=async()=>answers.shift();
await chat.sharePhoto();assert.equal(writes[0].path,'trips/A/chat');assert.equal(writes[0].data.userEmail,'');assert.equal(writes[0].data.userName,'Viajero');

reset();context.window.Dialogs.confirm=async()=>{context.window.TripsManager.currentTrip={id:'B'};return true;};
await chat.deleteMessage('original');assert.equal(writes.length,0);
reset();chat.messages=[{id:'original',userId:'me',message:'Original'}];
context.window.Dialogs.prompt=async()=>{context.auth.currentUser={uid:'someone-else'};return 'Cambio';};
await chat.editMessage('original');assert.equal(writes.length,0);

// Duplicate submits stay blocked until the original operation finishes; late notifications stay scoped.
reset();let finish;
context.addDoc=(path,data)=>{writes.push({path,data});return new Promise(resolve=>{finish=resolve;});};
const pending=chat.sendStructuredMessage({message:'Adjunto'});
assert.equal(await chat.sendStructuredMessage({message:'Adjunto'}),false);assert.equal(writes.length,1);
context.window.TripsManager.currentTrip={id:'B'};finish();assert.equal(await pending,true);assert.equal(notices.length,0);

reset();context.addDoc=async()=>{throw new Error('offline');};assert.equal(await chat.sendStructuredMessage({message:'Adjunto'}),false);
context.addDoc=async(path,data)=>writes.push({path,data});assert.equal(await chat.sendStructuredMessage({message:'Adjunto'}),true);
assert.equal(writes.length,1);
console.log('chat dialogs: trip/user scope, cancelled prompts, nullable email, duplicates, late results and retries ok');
