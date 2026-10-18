import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createApp} from '../server/app.mjs';
import {createGameService} from '../server/game-service.mjs';
const bank=JSON.parse(await readFile(new URL('../public/data/questions.json',import.meta.url),'utf8'));
test('排行榜 API 回傳安全的空清單並拒絕無效 limit',async()=>{
 const server=createApp(createGameService({bank})).listen(0,'127.0.0.1');
 try {
  await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});
  const base=`http://127.0.0.1:${server.address().port}`;
  const ok=await fetch(base+'/api/leaderboard?limit=10');assert.equal(ok.status,200);
  assert.deepEqual((await ok.json()).scores,[]);
  const bad=await fetch(base+'/api/leaderboard?limit=0');assert.equal(bad.status,400);
  assert.equal((await bad.json()).error.code,'INVALID_INPUT');
 } finally {await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}
});
