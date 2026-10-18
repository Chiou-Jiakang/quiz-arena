import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuestionTimer, QUESTION_SECONDS } from '../public/js/quiz-timer.mjs';

function fakeClock(seconds = QUESTION_SECONDS) {
  let time = 0;
  let nextId = 0;
  const intervals = new Map();
  let expires = 0;
  const ticks = [];
  const timer = createQuestionTimer({
    seconds,
    now: () => time,
    setIntervalFn(fn) { const id = ++nextId; intervals.set(id, fn); return id; },
    clearIntervalFn(id) { intervals.delete(id); },
    onTick(left, ratio) { ticks.push([left, ratio]); },
    onExpire() { expires++; }
  });
  return {
    timer, ticks, intervals,
    get expires() { return expires; },
    move(ms, fire = true) { time += ms; if (fire) for (const fn of [...intervals.values()]) fn(); }
  };
}

test('預設每題 20 秒、啟動立即顯示 20', () => {
  const c = fakeClock(); c.timer.start();
  assert.equal(QUESTION_SECONDS, 20);
  assert.deepEqual(c.ticks[0], [20, 1]);
  assert.equal(c.intervals.size, 1);
});
test('實際截止時間計算，背景暫停後不會延長答題時間', () => {
  const c = fakeClock(); c.timer.start(); c.move(19900, false);
  assert.equal(c.timer.isExpired(), false);
  assert.equal(Math.ceil(c.timer.remainingMs() / 1000), 1);
  c.move(101, false);
  assert.equal(c.timer.isExpired(), true);
  c.timer.tick(); assert.equal(c.expires, 1);
  assert.equal(c.intervals.size, 0);
});
test('逾時只回呼一次，停止後舊 tick 不產生副作用', () => {
  const c = fakeClock(); c.timer.start();
  c.move(20000); c.timer.tick(); c.timer.tick();
  assert.equal(c.expires, 1);
  assert.equal(c.ticks.at(-1)[0], 0);
});
test('作答停止計時後不會再觸發逾時', () => {
  const c = fakeClock(); c.timer.start(); c.move(1000); c.timer.stop();
  c.move(30000); c.timer.tick();
  assert.equal(c.expires, 0);
  assert.equal(c.intervals.size, 0);
});
test('再次 start 只保留一個排程，截止時間重新設定', () => {
  const c = fakeClock(); c.timer.start(); c.move(19000); c.timer.start();
  assert.equal(c.intervals.size, 1);
  assert.equal(c.timer.isExpired(), false);
  c.move(19999); assert.equal(c.expires, 0);
  c.move(1); assert.equal(c.expires, 1);
});
test('時間參數與 callback 驗證', () => {
  assert.throws(() => createQuestionTimer({ seconds: 0, onTick() {}, onExpire() {} }), /正數/);
  assert.throws(() => createQuestionTimer({ onTick() {} }), /回呼/);
});
