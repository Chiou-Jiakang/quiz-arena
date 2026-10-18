import test from 'node:test';
import assert from 'node:assert/strict';
import {createApiClient,ApiRequestError} from '../public/js/api-client.mjs';

const response = (status, body) => ({ok: status >= 200 && status < 300,status,json:async()=>body});
test('使用同源 /api 建立場次，只傳玩家設定',async()=>{
  let captured;
  const api=createApiClient({fetchFn:async (url,options)=>{captured={url,options};return response(201,{id:'game-1'});}});
  assert.deepEqual(await api.createGame({player:'測試',category:'mixed',difficulty:'easy'}),{id:'game-1'});
  assert.equal(captured.url,'/api/games');
  assert.equal(captured.options.method,'POST');
  assert.deepEqual(JSON.parse(captured.options.body),{player:'測試',category:'mixed',difficulty:'easy'});
});
test('送出選項只包含 chosenIndex，不包含客戶端分數',async()=>{
  let body;
  const api=createApiClient({fetchFn:async (_url,options)=>{body=JSON.parse(options.body);return response(200,{phase:'feedback'});}});
  await api.answer('id with slash/',2);
  assert.deepEqual(body,{chosenIndex:2});
});
test('場次 ID URL 編碼防止路徑變更',async()=>{
  let called;
  const api=createApiClient({fetchFn:async url=>{called=url;return response(200,{phase:'answering'});}});
  await api.readGame('a/b?');assert.equal(called,'/api/games/a%2Fb%3F');
});
test('409 回傳結構化 API 錯誤',async()=>{
  const api=createApiClient({fetchFn:async()=>response(409,{error:{code:'QUESTION_CLOSED',message:'此題已結束'}})});
  await assert.rejects(api.answer('x',0),e=>e instanceof ApiRequestError&&e.status===409&&e.code==='QUESTION_CLOSED');
});
test('網路失敗轉成可理解的提示',async()=>{
  const api=createApiClient({fetchFn:async()=>{throw Error('down')}});
  await assert.rejects(api.readGame('x'),/無法連線/);
});
test('204 DELETE 空回應處理與成績 API',async()=>{
  let path;
  const api=createApiClient({fetchFn:async url=>{path=url;return response(200,{scores:[]});}});
  assert.deepEqual(await api.scores(10),{scores:[]}); assert.equal(path,'/api/scores?limit=10');
});
