import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {ref,uploadBytes,getBytes,deleteObject} from 'firebase/storage';
if(!process.env.FIREBASE_STORAGE_EMULATOR_HOST)throw new Error('backup storage rules require Storage Emulator');
const testEnv=await initializeTestEnvironment({projectId:'japitin-backup-storage-test',storage:{rules:fs.readFileSync(new URL('../storage.rules',import.meta.url),'utf8')}});
try{
  const own=testEnv.authenticatedContext('owner').storage(),other=testEnv.authenticatedContext('other').storage(),anon=testEnv.unauthenticatedContext().storage();
  const path='backups/owner/latest.json',bytes=new TextEncoder().encode('{"metadata":{"version":"2.0.0"}}');
  await assertSucceeds(uploadBytes(ref(own,path),bytes,{contentType:'application/json'}));
  assert.ok((await assertSucceeds(getBytes(ref(own,path)))).byteLength>0);
  await assertFails(getBytes(ref(other,path)));await assertFails(getBytes(ref(anon,path)));
  await assertFails(uploadBytes(ref(other,path),bytes,{contentType:'application/json'}));
  await assertFails(uploadBytes(ref(own,'backups/owner/bad.txt'),bytes,{contentType:'text/plain'}));
  await assertFails(deleteObject(ref(other,path)));await assertSucceeds(deleteObject(ref(own,path)));
  console.log('backup storage rules: private owner access, anonymous denial, path and content type validation ok');
}finally{await testEnv.cleanup();}
