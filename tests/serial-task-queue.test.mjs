import assert from 'node:assert/strict';
import { createSerialTaskQueue } from '../js/core/serial-task-queue.js';
const events=[];const queue=createSerialTaskQueue(async value=>{events.push(`start:${value}`);await new Promise(resolve=>setTimeout(resolve,value===1?20:1));events.push(`end:${value}`);if(value===2)throw new Error('expected');return value});
assert.deepEqual(await Promise.all([queue(1),queue(2).catch(error=>error.message),queue(3)]),[1,'expected',3]);
assert.deepEqual(events,['start:1','end:1','start:2','end:2','start:3','end:3']);
assert.throws(()=>createSerialTaskQueue(null),/task function/);console.log('serial task queue: ok');
