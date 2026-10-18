import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { createSQLiteStore } from '../server/sqlite-store.mjs';
import { createGameService } from '../server/game-service.mjs';
import { createApp } from '../server/app.mjs';

const bank = JSON.parse(await readFile(new URL('../public/data/questions.json', import.meta.url), 'utf8'));

async function withServer(action) {
  const dir = mkdtempSync(join(tmpdir(), 'quiz-arena-http-sqlite-'));
  const store = createSQLiteStore({file: join(dir, 'games.sqlite')});
  let clock = 1_000_000;
  const service = createGameService({bank, store, now:()=>clock});
  const server = createApp(service).listen(0, '127.0.0.1');
  try {
    await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = async (path, {method='GET', data}={}) => {
      const res = await fetch(base+path,{method,headers:data===undefined?{}:{'content-type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});
      return {status:res.status,body:res.status===204?null:await res.json()};
    };
    await action({request, service, move:ms=>clock+=ms});
  } finally {
    await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
    store.close();
    rmSync(dir,{recursive:true,force:true});
  }
}

test('SQLite HTTP 健康檢查回傳版本與持久化狀態',()=>withServer(async ({request})=>{
  const r=await request('/api/health');assert.equal(r.status,200);assert.equal(r.body.version,'v1.0.0-rc.1');assert.equal(r.body.persistence,'sqlite');
}));

test('SQLite HTTP DELETE 移除未完成場次；後續 GET 回 404',()=>withServer(async ({request})=>{
  const start=await request('/api/games',{method:'POST',data:{player:'玩家',category:'science',difficulty:'easy'}});
  assert.equal(start.status,201);
  const deleted=await request(`/api/games/${start.body.id}`,{method:'DELETE'});
  assert.equal(deleted.status,204);
  const missing=await request(`/api/games/${start.body.id}`);
  assert.equal(missing.status,404);
}));

test('SQLite HTTP 成績列表及單場查詢；limit 防呆',()=>withServer(async ({request,service})=>{
  const created=await request('/api/games',{method:'POST',data:{player:'玩家',category:'technology',difficulty:'easy'}});
  for(let i=0;i<10;i++){
    const answered=await request(`/api/games/${created.body.id}/answers`,{method:'POST',data:{chosenIndex:0}});
    assert.equal(answered.status,200);
    const next=await request(`/api/games/${created.body.id}/next`,{method:'POST'});
    assert.equal(next.status,200);
  }
  const list=await request('/api/scores?limit=10');assert.equal(list.status,200);assert.equal(list.body.scores.length,1);
  assert.equal(list.body.scores[0].id,created.body.id);
  const detail=await request(`/api/scores/${created.body.id}`);
  assert.equal(detail.status,200);assert.equal(detail.body.review.length,10);
  const bad=await request('/api/scores?limit=999');assert.equal(bad.status,400);
  assert.equal(bad.body.error.code,'INVALID_INPUT');
  const missing=await request('/api/scores/missing');assert.equal(missing.status,404);
  assert.equal(missing.body.error.code,'SCORE_NOT_FOUND');
}));
