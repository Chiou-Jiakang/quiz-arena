import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createSQLiteStore} from '../server/sqlite-store.mjs';
import {createMemoryStore} from '../server/memory-store.mjs';
import {createGameService} from '../server/game-service.mjs';
import {readFile} from 'node:fs/promises';
const bank=JSON.parse(await readFile(new URL('../public/data/questions.json',import.meta.url),'utf8'));
function scoreSession(store, id, correct, clock){
 const svc=createGameService({bank,store,now:()=>clock,newId:()=>id});
 let game=svc.create({player:`玩家${id}`,category:'technology',difficulty:'easy'});
 for(let i=0;i<10;i++){
   // Access the prepared question via store only in this isolated test.
   const current=store.get(id).questions[i];
   const chosenIndex=i<correct?current.correctIndex:(current.correctIndex+1)%4;
   svc.answer(id,{chosenIndex});game=svc.next(id);
 }
 assert.equal(game.phase,'finished');
}
for (const kind of ['memory','sqlite']) {
 test(`${kind} 排行榜依分數降序，而非完成日期排序`,()=>{
   const dir=mkdtempSync(join(tmpdir(),'qa-rank-'));
   const store=kind==='sqlite'?createSQLiteStore({file:join(dir,'ranking.sqlite')}):createMemoryStore();
   try {
     scoreSession(store,'low',2,1000);
     scoreSession(store,'high',9,2000);
     scoreSession(store,'mid',5,3000);
     const svc=createGameService({bank,store});
     assert.deepEqual(svc.leaderboard(3).scores.map(s=>s.score),[900,500,200]);
     assert.equal(svc.leaderboard(2).scores.length,2);
     assert.throws(()=>svc.leaderboard(101),/limit/);
   } finally {store.close();rmSync(dir,{recursive:true,force:true});}
 });
}
