import { drawQuestions, validateQuestionBank } from './quiz-data.mjs';
import { createGame, submitAnswer, submitTimeout, advanceGame, summarizeGame } from './quiz-engine.mjs';
import { createQuestionTimer, QUESTION_SECONDS } from './quiz-timer.mjs';

const $ = selector => document.querySelector(selector);
const views = { home: $('#home-view'), setup: $('#setup-view'), play: $('#play-view'), result: $('#result-view') };
const form = $('#setup-form');
const message = $('#form-message');
const bankUrl = new URL('../data/questions.json', import.meta.url);
let bankPromise;
let game = null;
let timer = null;
// Generation guards prevent an old async fetch/retry from reviving an abandoned game.
let gameGeneration = 0;

function stopTimer() {
  if (timer) { timer.stop(); timer = null; }
}

function paintTimer(seconds, ratio) {
  $('#timer-seconds').textContent = `${seconds} 秒`;
  $('#timer-seconds').setAttribute('aria-label', `剩餘 ${seconds} 秒`);
  $('#timer-progress-bar').style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  $('#timer-progress').setAttribute('aria-valuenow', String(Math.round(Math.max(0, Math.min(1, ratio)) * 100)));
  $('#quiz-timer').classList.toggle('is-urgent', seconds <= 5);
  if (seconds === 10 || seconds === 5 || seconds === 0) $('#timer-announcement').textContent = `剩餘 ${seconds} 秒`;
}

function beginTimer() {
  stopTimer();
  $('#timer-announcement').textContent = '';
  $('#quiz-timer').classList.remove('is-frozen');
  timer = createQuestionTimer({
    seconds: QUESTION_SECONDS,
    onTick: paintTimer,
    onExpire: () => chooseTimeout()
  });
  timer.start();
}

function freezeTimer() {
  stopTimer();
  $('#quiz-timer').classList.add('is-frozen');
}

$('#current-year').textContent = String(new Date().getFullYear());

function showView(name) {
  for (const [key, element] of Object.entries(views)) {
    const active = key === name;
    element.hidden = !active;
    element.classList.toggle('view--active', active);
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function goHome() {
  gameGeneration++;
  stopTimer();
  game = null;
  message.textContent = '';
  showView('home');
}

$('#start-btn').addEventListener('click', () => { showView('setup'); $('#nickname').focus(); });
$('#back-btn').addEventListener('click', goHome);
$('#brand-link').addEventListener('click', event => { event.preventDefault(); if (game && !window.confirm('確定離開目前的挑戰嗎？進度不會儲存。')) return; goHome(); });
$('#quit-btn').addEventListener('click', () => { if (window.confirm('確定結束挑戰嗎？本次進度不會儲存。')) goHome(); });
$('#result-home-btn').addEventListener('click', goHome);

async function loadBank() {
  // Cache only successful loads: a network failure should remain retryable.
  if (!bankPromise) {
    bankPromise = fetch(bankUrl).then(response => {
      if (!response.ok) throw new Error(`載入題庫失敗（HTTP ${response.status}）`);
      return response.json();
    }).then(data => { validateQuestionBank(data); return data; }).catch(error => {
      bankPromise = null;
      throw error;
    });
  }
  return bankPromise;
}

const settings = () => ({
  player: $('#nickname').value.trim(),
  category: $('#category').value,
  difficulty: $('#difficulty').value
});

const categoryLabel = () => $('#category').selectedOptions[0].textContent;
const difficultyLabel = () => $('#difficulty').selectedOptions[0].textContent;

async function startGame({player, category, difficulty}) {
  const generation = ++gameGeneration;
  stopTimer();
  const button = form.querySelector('button[type="submit"]');
  if (button.disabled) return;
  button.disabled = true;
  message.textContent = '正在載入題庫…';
  try {
    const bank = await loadBank();
    if (generation !== gameGeneration) return;
    const selected = drawQuestions(bank, { category, difficulty });
    game = createGame(selected, player, category, difficulty);
    message.textContent = '';
    showView('play');
    renderQuestion();
  } catch (error) {
    if (generation === gameGeneration) message.textContent = `無法開始：${error instanceof Error ? error.message : '未知錯誤'}。請稍後重試。`;
  } finally {
    button.disabled = false;
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const config = settings();
  if (!config.player || [...config.player].length > 20) {
    message.textContent = '請輸入 1–20 個字元的暱稱。';
    return;
  }
  void startGame(config);
});

function renderQuestion() {
  if (!game || game.phase !== 'answering') return;
  const question = game.questions[game.index];
  $('#play-player').textContent = `${game.player} · ${categoryLabel()}`;
  $('#play-score').textContent = `${game.score} 分`;
  $('#play-progress-text').textContent = `第 ${game.index + 1} / ${game.questions.length} 題`;
  $('#play-category').textContent = difficultyLabel();
  $('#play-difficulty').textContent = `QUESTION ${String(game.index + 1).padStart(2, '0')}`;
  $('#play-title').textContent = question.question;
  $('#play-progress').setAttribute('aria-valuenow', String(game.answers.length));
  $('#play-progress-bar').style.width = `${game.answers.length / game.questions.length * 100}%`;
  const options = $('#answer-options');
  options.replaceChildren();
  question.options.forEach((value, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-option';
    const letter = document.createElement('span');
    letter.className = 'option-letter';
    letter.textContent = `${'ABCD'[index]}.`;
    const label = document.createElement('span');
    label.textContent = value;
    button.append(letter, label);
    button.addEventListener('click', () => chooseAnswer(index));
    options.append(button);
  });
  $('#answer-feedback').hidden = true;
  $('#next-btn').hidden = true;
  $('#play-title').focus();
  beginTimer();
}

function chooseAnswer(index) {
  if (!game || game.phase !== 'answering') return;
  // Even if an interval callback was delayed, a click after the deadline is a timeout.
  if (!timer || timer.isExpired()) { chooseTimeout(); return; }
  freezeTimer();
  game = submitAnswer(game, index);
  showFeedback(index, false);
}

function chooseTimeout() {
  if (!game || game.phase !== 'answering') return;
  freezeTimer();
  paintTimer(0, 0);
  game = submitTimeout(game);
  showFeedback(null, true);
}

function showFeedback(index, timedOut) {
  const q = game.questions[game.index];
  for (const [i, option] of [...$('#answer-options').children].entries()) {
    option.disabled = true;
    if (i === q.correctIndex) option.classList.add('is-correct');
    else if (i === index) option.classList.add('is-wrong');
  }
  const correct = !timedOut && index === q.correctIndex;
  $('#answer-feedback-title').textContent = timedOut
    ? `⌛ 時間到！本題 0 分。正確答案：${q.options[q.correctIndex]}`
    : correct ? '✓ 回答正確！+100 分' : `✕ 回答錯誤。正確答案：${q.options[q.correctIndex]}`;
  $('#answer-explanation').textContent = q.explanation;
  $('#answer-feedback').hidden = false;
  $('#next-btn').hidden = false;
  $('#next-btn').textContent = game.answers.length === game.questions.length ? '查看結算結果 →' : '下一題 →';
  $('#play-score').textContent = `${game.score} 分`;
  $('#play-progress').setAttribute('aria-valuenow', String(game.answers.length));
  $('#play-progress-bar').style.width = `${game.answers.length / game.questions.length * 100}%`;
  $('#next-btn').focus();
}

$('#next-btn').addEventListener('click', () => {
  if (!game || game.phase !== 'feedback') return;
  game = advanceGame(game);
  if (game.phase === 'finished') renderResults();
  else renderQuestion();
});

function renderResults() {
  stopTimer();
  const result = summarizeGame(game);
  $('#result-player').textContent = `${result.player}，你完成了本次挑戰。`;
  $('#result-score').replaceChildren(document.createTextNode(`${result.score} `));
  const small = document.createElement('small');
  small.textContent = `/ ${result.total * 100} 分`;
  $('#result-score').append(small);
  $('#result-correct').textContent = `${result.correct} / ${result.total}`;
  $('#result-accuracy').textContent = `${result.accuracy}%`;
  const list = $('#review-list');
  list.replaceChildren();
  result.review.forEach((item, index) => {
    const li = document.createElement('li');
    const status = document.createElement('p');
    status.className = 'review-label';
    status.textContent = `第 ${index + 1} 題 · ${item.timedOut ? '逾時' : item.correct ? '答對' : '答錯'}`;
    const title = document.createElement('strong');
    title.textContent = item.question;
    const chosen = document.createElement('p');
    chosen.textContent = `你的答案：${item.timedOut ? '未作答（時間到）' : item.options[item.chosenIndex]}`;
    const correct = document.createElement('p');
    correct.textContent = `正確答案：${item.options[item.correctIndex]}`;
    const explanation = document.createElement('p');
    explanation.textContent = `解析：${item.explanation}`;
    li.append(status, title, chosen, correct, explanation);
    list.append(li);
  });
  showView('result');
  $('#result-title').focus?.();
}

document.addEventListener('visibilitychange', () => { if (!document.hidden) timer?.tick(); });

$('#retry-btn').addEventListener('click', () => {
  if (!game || game.phase !== 'finished') return;
  void startGame({ player: game.player, category: game.category, difficulty: game.difficulty });
});
