import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createApp } from '../server/app.mjs';
import { createGameService } from '../server/game-service.mjs';
const bank=JSON.parse(await readFile(new URL('../public/data/questions.json',import.meta.url),'utf8'));

test('Express 同源提供首頁、前端模組與 API，禁止公開 JSON 題庫',async()=>{
  const service=createGameService({bank});
  const server=createApp(service).listen(0,'127.0.0.1');
  try {
    await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});
    const base=`http://127.0.0.1:${server.address().port}`;
    const [home,js,api,data]=await Promise.all(['/', '/js/api-client.mjs','/api/health','/data/questions.json'].map(x=>fetch(base+x)));
    assert.equal(home.status,200);assert.match(await home.text(),/Quiz Arena/);
    assert.equal(js.status,200);assert.match(await js.text(),/createApiClient/);
    assert.equal(api.status,200);assert.equal(data.status,404);
  } finally {await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}
});
