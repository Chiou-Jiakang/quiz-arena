/** Quiz Arena v0.3.0: pure single-player game state functions. */
export const POINTS_PER_CORRECT = 100;

export function createGame(questions, player, category, difficulty) {
  if (!Array.isArray(questions) || questions.length !== 10 || new Set(questions.map(q => q.id)).size !== 10) {
    throw new Error('每局必須有十道不重複題目');
  }
  if (typeof player !== 'string' || !player.trim() || [...player.trim()].length > 20) throw new Error('暱稱須為 1–20 個字元');
  return { questions: [...questions], player: player.trim(), category, difficulty, index: 0, score: 0, answers: [], phase: 'answering' };
}

export function submitAnswer(state, chosenIndex) {
  if (state.phase !== 'answering') throw new Error('此題已提交或遊戲已結束');
  if (!Number.isInteger(chosenIndex) || chosenIndex < 0 || chosenIndex > 3) throw new RangeError('選項索引必須介於 0–3');
  const q = state.questions[state.index];
  const correct = chosenIndex === q.correctIndex;
  return {
    ...state,
    phase: 'feedback',
    score: state.score + (correct ? POINTS_PER_CORRECT : 0),
    answers: [...state.answers, { questionId: q.id, chosenIndex, correct, timedOut: false }]
  };
}

/** Records a timeout as an unanswered question. It can only happen once per question. */
export function submitTimeout(state) {
  if (state.phase !== 'answering') throw new Error('此題已提交或遊戲已結束');
  const q = state.questions[state.index];
  return {
    ...state,
    phase: 'feedback',
    answers: [...state.answers, { questionId: q.id, chosenIndex: null, correct: false, timedOut: true }]
  };
}

export function advanceGame(state) {
  if (state.phase !== 'feedback') throw new Error('請先完成當前題目');
  if (state.answers.length === state.questions.length) return { ...state, phase: 'finished' };
  return { ...state, index: state.index + 1, phase: 'answering' };
}

export function summarizeGame(state) {
  if (state.phase !== 'finished') throw new Error('遊戲尚未結束');
  const correct = state.answers.filter(a => a.correct).length;
  const timedOut = state.answers.filter(a => a.timedOut).length;
  return { player: state.player, score: state.score, correct, timedOut, total: state.questions.length,
    accuracy: Math.round(correct / state.questions.length * 100),
    review: state.questions.map((q, i) => ({ question: q.question, options: q.options,
      correctIndex: q.correctIndex, chosenIndex: state.answers[i].chosenIndex,
      correct: state.answers[i].correct, timedOut: state.answers[i].timedOut,
      explanation: q.explanation })) };
}
