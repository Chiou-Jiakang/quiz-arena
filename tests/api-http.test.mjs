/** HTTP contract tests; requires npm install (Express). */
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createApp } from '../server/app.mjs';
import { createGameService } from '../server/game-service.mjs';

const bank = JSON.parse(await readFile(new URL('../public/data/questions.json', import.meta.url), 'utf8'));
let server, root;
let counter = 0;
let clock = 100_000;
const service = createGameService({ bank, now: () => clock, newId: () => `http-${++counter}` });

before(async () => {
  server = createApp(service).listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  root = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); });
async function request(path, {method = 'GET', json, raw, headers = {}} = {}) {
  const body = raw ?? (json === undefined ? undefined : JSON.stringify(json));
  const response = await fetch(root + path, {method, headers: body === undefined ? headers : {'content-type': 'application/json', ...headers}, body});
  return {status: response.status, body: await response.json()};
}
async function start() { const r = await request('/api/games', {method:'POST', json:{player:'玩家',category:'technology',difficulty:'easy'}}); assert.equal(r.status, 201); return r.body; }

test('HTTP 健康檢查與公開設定', async () => {
  const a = await request('/api/health'); assert.equal(a.status,200); assert.equal(a.body.persistence,'memory');
  const b = await request('/api/config'); assert.equal(b.status,200); assert.equal(b.body.secondsPerQuestion,20);
});
test('HTTP 建立場次 → 答題 → 進入下一題，答題前不洩漏正解', async () => {
  const first = await start();
  assert.equal(first.phase,'answering'); assert.equal('correctIndex' in first.question,false);
  const answered = await request(`/api/games/${first.id}/answers`,{method:'POST',json:{chosenIndex:0}});
  assert.equal(answered.status,200); assert.equal(answered.body.phase,'feedback');
  assert.equal(typeof answered.body.feedback.correctIndex,'number');
  const duplicate = await request(`/api/games/${first.id}/answers`,{method:'POST',json:{chosenIndex:1}});
  assert.equal(duplicate.status,409);
  const next = await request(`/api/games/${first.id}/next`,{method:'POST'});
  assert.equal(next.status,200); assert.equal(next.body.number,2);
  assert.equal('correctIndex' in next.body.question,false);
});
test('HTTP 逾時後拒絕補答、回饋顯示 timedOut', async () => {
  const first = await start(); clock += 20_001;
  const closed = await request(`/api/games/${first.id}/answers`,{method:'POST',json:{chosenIndex:0}});
  assert.equal(closed.status,409); assert.equal(closed.body.error.code,'QUESTION_CLOSED');
  const check = await request(`/api/games/${first.id}`);
  assert.equal(check.body.feedback.timedOut,true); assert.equal(check.body.score,0);
});
test('HTTP 非法 JSON、非法設定、無效選項有穩定錯誤格式', async () => {
  const badJson = await request('/api/games',{method:'POST',raw:'{broken'});
  assert.equal(badJson.status,400); assert.equal(badJson.body.error.code,'INVALID_JSON');
  const badSetting = await request('/api/games',{method:'POST',json:{player:'',category:'mixed',difficulty:'easy'}});
  assert.equal(badSetting.status,400); assert.equal(badSetting.body.error.code,'INVALID_INPUT');
  const first = await start();
  const invalid = await request(`/api/games/${first.id}/answers`,{method:'POST',json:{chosenIndex:4}});
  assert.equal(invalid.status,400); assert.equal(invalid.body.error.code,'INVALID_INPUT');
});
test('HTTP 未知場次與未知 API 路徑回應 404', async () => {
  const missing = await request('/api/games/not-found'); assert.equal(missing.status,404);
  assert.equal(missing.body.error.code,'GAME_NOT_FOUND');
  const route = await request('/api/not-a-route'); assert.equal(route.status,404);
  assert.equal(route.body.error.code,'ROUTE_NOT_FOUND');
});
