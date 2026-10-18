/** v0.4.0: HTTP-independent, server-authoritative session engine. */
import { randomUUID } from 'node:crypto';
import { createMemoryStore } from './memory-store.mjs';
import { CATEGORIES, DIFFICULTIES, QUESTIONS_PER_GAME, drawQuestions, validateQuestionBank } from '../public/js/quiz-data.mjs';

export const QUESTION_LIMIT_MS = 20_000;
export const MAX_SESSIONS = 500;
export const SESSION_TTL_MS = 60 * 60 * 1000;

export class ApiError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

const invalid = message => new ApiError(400, 'INVALID_INPUT', message);

export function createGameService({ bank, now = Date.now, random = Math.random, newId = randomUUID, maxSessions = MAX_SESSIONS, store = createMemoryStore() } = {}) {
  validateQuestionBank(bank);
  if (typeof now !== 'function' || typeof newId !== 'function' || !Number.isInteger(maxSessions) || maxSessions < 1) {
    throw new TypeError('伺服器設定無效');
  }
  // Persistent adapter owns state; never expose raw question answers through an API snapshot.
  const exposeQuestion = q => ({ id: q.id, question: q.question, options: [...q.options], category: q.category, difficulty: q.difficulty });
  const prune = () => {
    const time = now();
    store.prune(time - SESSION_TTL_MS);
  };
  const get = id => {
    prune();
    const s = store.get(id);
    if (!s) throw new ApiError(404, 'GAME_NOT_FOUND', '找不到場次，可能已過期或伺服器已重新啟動。');
    s.lastSeen = now();
    store.save(s);
    return s;
  };
  const settleDeadline = s => {
    if (s.phase !== 'answering' || now() < s.deadlineAt) return;
    const q = s.questions[s.index];
    s.answers.push({ questionId: q.id, chosenIndex: null, correct: false, timedOut: true });
    s.phase = 'feedback';
    store.save(s);
  };
  const snapshot = s => {
    settleDeadline(s);
    const base = {
      id: s.id, player: s.player, category: s.category, difficulty: s.difficulty,
      phase: s.phase, number: s.index + 1, total: s.questions.length,
      score: s.score, correctCount: s.answers.filter(a => a.correct).length,
      answeredCount: s.answers.length
    };
    if (s.phase === 'answering') {
      return { ...base, deadlineAt: s.deadlineAt, serverNow: now(), question: exposeQuestion(s.questions[s.index]) };
    }
    if (s.phase === 'feedback') {
      const q = s.questions[s.index], a = s.answers.at(-1);
      return { ...base, question: exposeQuestion(q), feedback: {
        chosenIndex: a.chosenIndex, correct: a.correct, timedOut: a.timedOut,
        correctIndex: q.correctIndex, explanation: q.explanation
      }};
    }
    return { ...base, result: {
      score: s.score, total: s.questions.length,
      correct: s.answers.filter(a => a.correct).length,
      timedOut: s.answers.filter(a => a.timedOut).length,
      accuracy: Math.round(s.answers.filter(a => a.correct).length / s.questions.length * 100),
      review: s.questions.map((q, i) => ({ ...exposeQuestion(q), correctIndex: q.correctIndex,
        explanation: q.explanation, ...s.answers[i] }))
    }};
  };
  return {
    persistence:store.persistence,
    getConfig() { return { categories: [...CATEGORIES], difficulties: [...DIFFICULTIES], questionsPerGame: QUESTIONS_PER_GAME, secondsPerQuestion: QUESTION_LIMIT_MS / 1000, pointsPerCorrect: 100 }; },
    create(body) {
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw invalid('請提供遊戲設定物件。');
      const { player, category, difficulty } = body;
      if (typeof player !== 'string' || !player.trim() || [...player.trim()].length > 20) throw invalid('暱稱須為 1–20 個字元。');
      if (!CATEGORIES.includes(category) || !DIFFICULTIES.includes(difficulty)) throw invalid('類別或難度不合法。');
      prune();
      if (store.count() >= maxSessions) throw new ApiError(503, 'CAPACITY_REACHED', '場次已達上限，請稍後再試。');
      let questions;
      try { questions = drawQuestions(bank, { category, difficulty }, random); }
      catch (error) { throw new ApiError(422, 'QUESTION_BANK_UNAVAILABLE', error.message); }
      const id = newId();
      if (typeof id !== 'string' || !id || store.get(id)) throw new Error('場次 ID 產生失敗');
      const time = now();
      const session = { id, player: player.trim(), category, difficulty, questions,
        index: 0, answers: [], score: 0, phase: 'answering', deadlineAt: time + QUESTION_LIMIT_MS, lastSeen: time };
      store.create(session);
      return snapshot(session);
    },
    read(id) { return snapshot(get(id)); },
    answer(id, body) {
      const s = get(id);
      settleDeadline(s);
      if (s.phase !== 'answering') throw new ApiError(409, 'QUESTION_CLOSED', '此題已結束，不接受重複作答。');
      if (!body || typeof body !== 'object' || Array.isArray(body) || !Number.isInteger(body.chosenIndex) || body.chosenIndex < 0 || body.chosenIndex > 3) {
        throw invalid('chosenIndex 必須是 0–3 的整數。');
      }
      const q = s.questions[s.index];
      const correct = body.chosenIndex === q.correctIndex;
      s.answers.push({ questionId: q.id, chosenIndex: body.chosenIndex, correct, timedOut: false });
      if (correct) s.score += 100;
      s.phase = 'feedback';
      store.save(s);
      return snapshot(s);
    },
    next(id) {
      const s = get(id);
      settleDeadline(s);
      if (s.phase !== 'feedback') throw new ApiError(409, 'INVALID_GAME_PHASE', '必須先完成目前題目才能進入下一題。');
      if (s.answers.length === s.questions.length) s.phase = 'finished';
      else {
        s.index += 1;
        s.phase = 'answering';
        s.deadlineAt = now() + QUESTION_LIMIT_MS;
      }
      store.save(s);
      return snapshot(s);
    },
    delete(id) { const s=get(id); if (s.phase==='finished') throw new ApiError(409,'GAME_FINISHED','已完成場次的成績應保留，不能刪除。'); return store.delete(id); },
    listScores(limit=20) {if (!Number.isInteger(limit)||limit<1||limit>100) throw invalid('limit 須為 1–100。');return {scores:store.listResults(limit)};},
    leaderboard(limit=10) {if (!Number.isInteger(limit)||limit<1||limit>100) throw invalid('limit 須為 1–100。');return {scores:store.leaderboard(limit)};},
    readScore(id) {const result=store.result(id);if (!result) throw new ApiError(404,'SCORE_NOT_FOUND','查無歷史成績。');return result;},
    count() { prune(); return store.count(); }
  };
}
