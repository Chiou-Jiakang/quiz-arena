import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CATEGORIES, DIFFICULTIES, drawQuestions, validateQuestionBank } from '../public/js/quiz-data.mjs';
const bank = JSON.parse(await readFile(new URL('../public/data/questions.json', import.meta.url), 'utf8'));

test('120 題符合完整結構，所有 ID / 題幹不重複', () => {
  assert.equal(bank.length, 120);
  assert.equal(validateQuestionBank(bank), true);
});

test('四大類 × 三難度，每個組合恰有 10 題；綜合模式每難度 40 題', () => {
  for (const difficulty of DIFFICULTIES) {
    for (const category of CATEGORIES) {
      const pool = bank.filter(q => q.enabled && q.difficulty === difficulty && (category === 'mixed' || q.category === category));
      assert.equal(pool.length, category === 'mixed' ? 40 : 10);
    }
  }
});

test('15 種選單組合都能抽出 10 題、無重複、符合難度', () => {
  for (const difficulty of DIFFICULTIES) for (const category of CATEGORIES) {
    const result = drawQuestions(bank, { category, difficulty });
    assert.equal(result.length, 10);
    assert.equal(new Set(result.map(q => q.id)).size, 10);
    assert.ok(result.every(q => q.difficulty === difficulty && (category === 'mixed' || q.category === category)));
  }
});

test('原始題庫排序不被洗牌操作修改', () => {
  const before = bank.map(q => q.id);
  drawQuestions(bank, { category: 'mixed', difficulty: 'easy' });
  assert.deepEqual(bank.map(q => q.id), before);
});

test('題庫不足時拒絕抽題，不複用題目', () => {
  assert.throws(() => drawQuestions(bank.slice(0, 3), { category: 'technology', difficulty: 'easy' }), /題庫不足/);
});

test('無效類別、難度、數量與隨機值都被拒絕', () => {
  assert.throws(() => drawQuestions(bank, { category: 'unknown', difficulty: 'easy' }), /類別/);
  assert.throws(() => drawQuestions(bank, { category: 'mixed', difficulty: 'invalid' }), /難度/);
  assert.throws(() => drawQuestions(bank, { category: 'mixed', difficulty: 'easy', count: 0 }), /正整數/);
  assert.throws(() => drawQuestions(bank, { category: 'mixed', difficulty: 'easy' }, () => 1), /隨機函式/);
});

test('題目驗證能攔截重複 ID、四選項錯誤與無效索引', () => {
  const clone = structuredClone(bank);
  clone[1].id = clone[0].id;
  assert.throws(() => validateQuestionBank(clone), /ID/);
  clone[1].id = bank[1].id;
  clone[0].options = ['A', 'B', 'B', 'D'];
  assert.throws(() => validateQuestionBank(clone), /選項/);
  clone[0].options = bank[0].options;
  clone[0].correctIndex = 4;
  assert.throws(() => validateQuestionBank(clone), /正解/);
});
