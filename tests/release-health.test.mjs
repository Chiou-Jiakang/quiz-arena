import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createGameService } from '../server/game-service.mjs';
import { createApp } from '../server/app.mjs';
import { createMemoryStore } from '../server/memory-store.mjs';
const bank = JSON.parse(await readFile(new URL('../public/data/questions.json', import.meta.url), 'utf8'));

test('正式版健康檢查與 package.json 版本一致', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(packageJson.version, '1.0.0');
  const server = createApp(createGameService({ bank, store: createMemoryStore() })).listen(0, '127.0.0.1');
  try {
    await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
    const res = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: 'ok', version: 'v1.0.0', persistence: 'memory' });
  } finally { await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve())); }
});
