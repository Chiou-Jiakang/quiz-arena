import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createGameService, ApiError, QUESTION_LIMIT_MS } from '../server/game-service.mjs';
const bank = JSON.parse(await readFile(new URL('../public/data/questions.json', import.meta.url), 'utf8'));
function fixture(options = {}) {
  let clock = 100_000, idNum = 0;
  const service = createGameService({ bank, now: () => clock, newId: () => `session-${++idNum}`, ...options });
  return { service, move: ms => { clock += ms; }, time: () => clock,
    start: (patch = {}) => service.create({ player: '玩家', category: 'technology', difficulty: 'easy', ...patch }) };
}
function assertApi(status, code) { return e => e instanceof ApiError && e.status === status && e.code === code; }
test('健康設定：五類、三難度、十題、每題 20 秒、每題 100 分', () => {
  const {service} = fixture(); const conf = service.getConfig();
  assert.equal(conf.categories.length, 5); assert.equal(conf.difficulties.length, 3);
  assert.equal(conf.questionsPerGame, 10); assert.equal(conf.secondsPerQuestion, 20);
  assert.equal(conf.pointsPerCorrect, 100);
});
test('建立場次：不公開正確索引與解析，ID 每次不同', () => {
  const f = fixture(); const x = f.start(), y = f.start();
  assert.notEqual(x.id, y.id); assert.equal(x.phase, 'answering');
  assert.equal(x.question.options.length, 4); assert.ok(!('correctIndex' in x.question));
  assert.ok(!('explanation' in x.question)); assert.ok(!JSON.stringify(x).includes('correctIndex'));
});
test('無效玩家、類別、難度及空 body 皆拒絕', () => {
  const f = fixture();
  for (const x of [{player:''},{player:'a'.repeat(21)},{category:'x'},{difficulty:'x'}])
    assert.throws(()=>f.start(x),assertApi(400,'INVALID_INPUT'));
  assert.throws(()=>f.service.create(null),assertApi(400,'INVALID_INPUT'));
});
test('作答後才公開正確答案；不可再次提交', () => {
  const f = fixture(); const x = f.start();
  const a = f.service.answer(x.id,{chosenIndex:2});
  assert.equal(a.phase,'feedback'); assert.equal(typeof a.feedback.correctIndex,'number');
  assert.equal(typeof a.feedback.explanation,'string');
  assert.throws(()=>f.service.answer(x.id,{chosenIndex:2}),assertApi(409,'QUESTION_CLOSED'));
});
test('答對 +100、答錯 0、同題不得計分兩次', () => {
  const f=fixture(); const x=f.start();
  const first=f.service.answer(x.id,{chosenIndex:0});
  assert.equal(first.score,[0,100].includes(first.score)?first.score:-1);
  assert.equal(first.score,first.feedback.correct?100:0);
  assert.throws(()=>f.service.answer(x.id,{chosenIndex:1}),assertApi(409,'QUESTION_CLOSED'));
});
test('不能未作答直接進入下一題；下一題有全新截止時間', () => {
  const f=fixture(); const x=f.start();
  assert.throws(()=>f.service.next(x.id),assertApi(409,'INVALID_GAME_PHASE'));
  f.service.answer(x.id,{chosenIndex:1}); f.move(4000);
  const next=f.service.next(x.id);
  assert.equal(next.number,2);assert.equal(next.deadlineAt,f.time()+QUESTION_LIMIT_MS);
});
test('逾時：伺服器截止時自動記錄 0 分，不能補交答案', () => {
  const f=fixture(); const x=f.start(); f.move(20_001);
  const y=f.service.read(x.id);
  assert.equal(y.phase,'feedback');assert.equal(y.feedback.timedOut,true);
  assert.equal(y.feedback.chosenIndex,null);assert.equal(y.score,0);
  assert.throws(()=>f.service.answer(x.id,{chosenIndex:1}),assertApi(409,'QUESTION_CLOSED'));
});
test('剛好截止時也不得答題；GET 不重複建立逾時紀錄', () => {
  const f=fixture();const x=f.start();f.move(20_000);
  assert.throws(()=>f.service.answer(x.id,{chosenIndex:0}),assertApi(409,'QUESTION_CLOSED'));
  assert.equal(f.service.read(x.id).answeredCount,1);
  assert.equal(f.service.read(x.id).answeredCount,1);
});
test('非法答案不能破壞目前狀態，之後仍可正常作答', () => {
  const f=fixture();const x=f.start();
  for(const bad of [{chosenIndex:'0'},{chosenIndex:4},{chosenIndex:1.5},{},null])
    assert.throws(()=>f.service.answer(x.id,bad),assertApi(400,'INVALID_INPUT'));
  assert.equal(f.service.read(x.id).phase,'answering');
  assert.equal(f.service.answer(x.id,{chosenIndex:1}).answeredCount,1);
});
test('完成十題：結果有正確率、逐題回顧，不可再次前進',()=>{
  const f=fixture(); let s=f.start();
  for(let i=0;i<10;i++){
    f.service.answer(s.id,{chosenIndex:1});s=f.service.next(s.id);
  }
  assert.equal(s.phase,'finished'); assert.equal(s.answeredCount,10);
  assert.equal(s.result.review.length,10);
  assert.equal(s.result.score,s.result.correct*100);
  assert.equal(s.result.accuracy,s.result.correct*10);
  assert.throws(()=>f.service.next(s.id),assertApi(409,'INVALID_GAME_PHASE'));
});
test('場次數量限制、過期與未知 ID',()=>{
  const f=fixture({maxSessions:1}); const s=f.start();
  assert.throws(()=>f.start(),assertApi(503,'CAPACITY_REACHED'));
  assert.throws(()=>f.service.read('unknown'),assertApi(404,'GAME_NOT_FOUND'));
  f.move(3_600_001);
  assert.throws(()=>f.service.read(s.id),assertApi(404,'GAME_NOT_FOUND'));
  assert.equal(f.service.count(),0);
  assert.ok(f.start().id);
});
