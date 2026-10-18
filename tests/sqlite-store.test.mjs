import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { createSQLiteStore } from '../server/sqlite-store.mjs';
import { createGameService } from '../server/game-service.mjs';
const bank = JSON.parse(await readFile(new URL('../public/data/questions.json', import.meta.url), 'utf8'));
function fixture() {
 const dir=mkdtempSync(join(tmpdir(),'qa-db-'));
 const file=join(dir,'quiz.sqlite'); let now=100_000;
 const open=()=>{const store=createSQLiteStore({file});const service=createGameService({bank,store,now:()=>now});return {store,service};};
 const context={dir,file,open,move(ms){now+=ms;},start(service){return service.create({player:'測試',category:'science',difficulty:'easy'});},cleanup(){rmSync(dir,{recursive:true,force:true});}};
 return context;
}
test('SQLite 建表、版本、資料庫檔建立與重啟讀取',()=>{
 const f=fixture();try{let x=f.open();const game=f.start(x.service);assert.equal(x.store.persistence,'sqlite');x.store.close();x=f.open();assert.equal(x.service.read(game.id).id,game.id);assert.equal(x.service.read(game.id).phase,'answering');x.store.close();}finally{f.cleanup();}
});
test('重新啟動不重設 20 秒截止期限',()=>{
 const f=fixture();try{let x=f.open();const g=f.start(x.service);const deadline=g.deadlineAt;x.store.close();f.move(10_000);x=f.open();const reread=x.service.read(g.id);assert.equal(reread.deadlineAt,deadline);assert.equal(reread.serverNow,110_000);x.store.close();}finally{f.cleanup();}
});
test('SQLite 作答、計分與下一題更新能跨重啟',()=>{
 const f=fixture();try{let x=f.open();const g=f.start(x.service);x.service.answer(g.id,{chosenIndex:1});const next=x.service.next(g.id);x.store.close();x=f.open();const again=x.service.read(g.id);assert.equal(again.number,2);assert.equal(again.score,next.score);assert.equal(again.answeredCount,1);x.store.close();}finally{f.cleanup();}
});
test('SQLite 逾時持久化，不會重複建立答案紀錄',()=>{
 const f=fixture();try{let x=f.open();const g=f.start(x.service);f.move(20_001);assert.equal(x.service.read(g.id).feedback.timedOut,true);x.store.close();x=f.open();const again=x.service.read(g.id);assert.equal(again.answeredCount,1);assert.equal(again.feedback.timedOut,true);x.store.close();}finally{f.cleanup();}
});
test('完成十題產生永久成績與逐題回顧',()=>{
 const f=fixture();try{let x=f.open();const game=f.start(x.service);for(let i=0;i<10;i++){x.service.answer(game.id,{chosenIndex:0});x.service.next(game.id);}const completed=x.service.read(game.id);assert.equal(completed.phase,'finished');assert.equal(x.service.listScores().scores.length,1);x.store.close();x=f.open();const score=x.service.readScore(game.id);assert.equal(score.score,completed.score);assert.equal(score.review.length,10);assert.equal(x.service.listScores().scores[0].id,game.id);x.store.close();}finally{f.cleanup();}
});
test('刪除未完成場次持久生效，已完成場次禁止刪除',()=>{
 const f=fixture();try{let x=f.open();const g=f.start(x.service);assert.equal(x.service.delete(g.id),true);assert.throws(()=>x.service.read(g.id),/找不到場次/);x.store.close();x=f.open();assert.throws(()=>x.service.read(g.id),/找不到場次/);x.store.close();}finally{f.cleanup();}
});
test('已完成成績在活躍場次 TTL 後仍留存',()=>{
 const f=fixture();try{let x=f.open();const game=f.start(x.service);for(let i=0;i<10;i++){x.service.answer(game.id,{chosenIndex:0});x.service.next(game.id);}f.move(3_600_001);assert.equal(x.service.count(),0);assert.ok(x.service.readScore(game.id));assert.throws(()=>x.service.delete(game.id),/已完成/);x.store.close();}finally{f.cleanup();}
});
test('建立未完成場次後到期會清除，且成功釋放配額',()=>{
 const f=fixture();try{const x=f.open();const g=f.start(x.service);f.move(3_600_001);assert.equal(x.service.count(),0);assert.throws(()=>x.service.read(g.id),/找不到場次/);x.store.close();}finally{f.cleanup();}
});
test('結果查詢 limit 驗證與不存在 ID 的錯誤',()=>{
 const f=fixture();try{const x=f.open();assert.throws(()=>x.service.listScores(0),/limit/);assert.throws(()=>x.service.listScores(101),/limit/);assert.throws(()=>x.service.readScore('missing'),/查無歷史/);x.store.close();}finally{f.cleanup();}
});
test('資料庫參數及重複啟動 Schema 安全',()=>{
 assert.throws(()=>createSQLiteStore({file:''}),/路徑/);
 const x=createSQLiteStore({file:':memory:'});assert.deepEqual(x.listResults(),[]);x.close();
});
