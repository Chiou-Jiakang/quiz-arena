/** v0.2.0 題庫驗證及不重複抽題模組；此階段未接入 UI。 */
export const CATEGORIES = Object.freeze(['mixed','technology','science','history','geography']);
export const DIFFICULTIES = Object.freeze(['easy','medium','hard']);
export const QUESTIONS_PER_GAME = 10;

export function validateQuestionBank(bank) {
  if (!Array.isArray(bank)) throw new TypeError('題庫必須為陣列');
  const ids = new Set(), prompts = new Set();
  for (const [index, q] of bank.entries()) {
    if (!q || typeof q !== 'object' || Array.isArray(q)) throw new Error(`題目 ${index} 格式錯誤`);
    if (typeof q.id !== 'string' || !q.id.trim() || ids.has(q.id)) throw new Error(`題目 ${index} ID 為空或重複`);
    ids.add(q.id);
    if (!CATEGORIES.slice(1).includes(q.category)) throw new Error(`${q.id} 類別無效`);
    if (!DIFFICULTIES.includes(q.difficulty)) throw new Error(`${q.id} 難度無效`);
    if (typeof q.question !== 'string' || !q.question.trim() || prompts.has(q.question.trim())) throw new Error(`${q.id} 題幹為空或重複`);
    prompts.add(q.question.trim());
    if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some(v => typeof v !== 'string' || !v.trim()) || new Set(q.options.map(v => v.trim())).size !== 4) throw new Error(`${q.id} 必須有四個不重複且非空的選項`);
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) throw new Error(`${q.id} 正解索引無效`);
    if (typeof q.explanation !== 'string' || !q.explanation.trim()) throw new Error(`${q.id} 缺少解析`);
    if (typeof q.enabled !== 'boolean') throw new Error(`${q.id} enabled 格式無效`);
  }
  return true;
}

export function drawQuestions(bank, {category, difficulty, count = QUESTIONS_PER_GAME}, random = Math.random) {
  if (!CATEGORIES.includes(category)) throw new RangeError('無效類別');
  if (!DIFFICULTIES.includes(difficulty)) throw new RangeError('無效難度');
  if (!Number.isSafeInteger(count) || count < 1) throw new RangeError('數量須為正整數');
  if (typeof random !== 'function') throw new TypeError('random 必須是函式');
  validateQuestionBank(bank);
  const pool = bank.filter(q => q.enabled && q.difficulty === difficulty && (category === 'mixed' || q.category === category));
  if (pool.length < count) throw new RangeError(`題庫不足：${category}/${difficulty} 要求 ${count} 題，但只有 ${pool.length} 題`);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const r = random();
    if (typeof r !== 'number' || !Number.isFinite(r) || r < 0 || r >= 1) throw new RangeError('隨機函式需回傳 [0,1)');
    const j = Math.floor(r * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
