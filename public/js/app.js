import { createApiClient } from './api-client.mjs';
import { createQuestionTimer } from './quiz-timer.mjs';

const api = createApiClient();
const $ = selector => document.querySelector(selector);
const views = { home: $('#home-view'), setup: $('#setup-view'), play: $('#play-view'), result: $('#result-view') };
const form = $('#setup-form');
const message = $('#form-message');
const STORAGE_KEY = 'quiz-arena-active-game-v0.6';
const categoryNames = { mixed:'綜合知識', technology:'科技', science:'科學', history:'歷史', geography:'地理' };
const difficultyNames = { easy:'簡單', medium:'中等', hard:'困難' };
let game = null;
let timer = null;
let generation = 0;
let busy = false;

$('#current-year').textContent = String(new Date().getFullYear());

function showView(name) {
  for (const [key, element] of Object.entries(views)) {
    const active = key === name;
    element.hidden = !active;
    element.classList.toggle('view--active', active);
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function stopTimer() { if (timer) { timer.stop(); timer = null; } }
function paintTimer(seconds, ratio) {
  const bounded = Math.max(0, Math.min(1, ratio));
  $('#timer-seconds').textContent = `${seconds} 秒`;
  $('#timer-seconds').setAttribute('aria-label', `剩餘 ${seconds} 秒`);
  $('#timer-progress-bar').style.width = `${bounded * 100}%`;
  $('#timer-progress').setAttribute('aria-valuenow', String(Math.round(bounded * 100)));
  $('#quiz-timer').classList.toggle('is-urgent', seconds <= 5);
  if ([10,5,0].includes(seconds)) $('#timer-announcement').textContent = `剩餘 ${seconds} 秒`;
}

function startClock(snapshot) {
  stopTimer();
  $('#quiz-timer').classList.remove('is-frozen');
  $('#timer-announcement').textContent = '';
  // Anchor at the time the response arrives; server is always authoritative on deadline.
  // This cannot grant extra time: late submissions are rejected by the API.
  const leftMs = Math.max(0, snapshot.deadlineAt - snapshot.serverNow);
  if (leftMs <= 0) { paintTimer(0, 0); setTimeout(() => { void synchronize(); }, 0); return; }
  timer = createQuestionTimer({
    seconds: leftMs / 1000,
    onTick: (seconds, ratio) => paintTimer(seconds, ratio),
    onExpire: () => { paintTimer(0,0); void synchronize(); }
  });
  timer.start();
}

function clearGame() {
  generation++;
  stopTimer();
  game = null;
  busy = false;
  sessionStorage.removeItem(STORAGE_KEY);
}
function goHome() { clearGame(); message.textContent = ''; showView('home'); }
$('#start-btn').addEventListener('click', () => { showView('setup'); $('#nickname').focus(); });
$('#back-btn').addEventListener('click', goHome);
$('#brand-link').addEventListener('click', event => {
  event.preventDefault();
  if (game && game.phase !== 'finished' && !window.confirm('確定離開挑戰嗎？場次可保留於伺服器，但此瀏覽器將不再自動恢復。')) return;
  goHome();
});
$('#quit-btn').addEventListener('click', () => {
  if (window.confirm('確定離開目前的挑戰嗎？')) goHome();
});
$('#result-home-btn').addEventListener('click', goHome);

function errorText(error) { return error instanceof Error ? error.message : '未知連線錯誤'; }
function notifyError(error) {
  $('#answer-feedback').hidden = false;
  $('#answer-feedback-title').textContent = `同步失敗：${errorText(error)}`;
  $('#answer-explanation').textContent = '請按「重新同步」恢復當前場次，不會重複送出答案。';
  $('#next-btn').textContent = '重新同步 ↻';
  $('#next-btn').hidden = false;
  $('#next-btn').dataset.action = 'sync';
}

function paintSnapshot(snapshot) {
  if (!snapshot || !['answering','feedback','finished'].includes(snapshot.phase)) throw new Error('伺服器傳回未知遊戲狀態');
  stopTimer();
  game = snapshot;
  sessionStorage.setItem(STORAGE_KEY, snapshot.id);
  if (snapshot.phase === 'finished') { renderResults(snapshot.result); return; }
  showView('play');
  $('#play-player').textContent = `${snapshot.player} · ${categoryNames[snapshot.category] ?? snapshot.category}`;
  $('#play-score').textContent = `${snapshot.score} 分`;
  $('#play-progress-text').textContent = `第 ${snapshot.number} / ${snapshot.total} 題`;
  $('#play-category').textContent = difficultyNames[snapshot.difficulty] ?? snapshot.difficulty;
  $('#play-difficulty').textContent = `QUESTION ${String(snapshot.number).padStart(2,'0')}`;
  $('#play-title').textContent = snapshot.question.question;
  $('#play-progress').setAttribute('aria-valuenow', String(snapshot.answeredCount));
  $('#play-progress-bar').style.width = `${snapshot.answeredCount / snapshot.total * 100}%`;
  const options = $('#answer-options');
  options.replaceChildren();
  snapshot.question.options.forEach((optionText, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-option';
    button.disabled = snapshot.phase !== 'answering';
    const letter = document.createElement('span');
    letter.className = 'option-letter';
    letter.textContent = `${'ABCD'[index]}.`;
    const text = document.createElement('span');
    text.textContent = optionText;
    button.append(letter, text);
    button.addEventListener('click', () => { void chooseAnswer(index); });
    options.append(button);
  });
  $('#answer-feedback').hidden = true;
  $('#next-btn').hidden = true;
  $('#next-btn').dataset.action = 'next';
  if (snapshot.phase === 'answering') {
    $('#play-title').focus();
    startClock(snapshot);
  } else {
    paintTimer(0,0);
    $('#quiz-timer').classList.add('is-frozen');
    const f = snapshot.feedback;
    for (const [index, option] of [...options.children].entries()) {
      if (index === f.correctIndex) option.classList.add('is-correct');
      else if (index === f.chosenIndex) option.classList.add('is-wrong');
    }
    $('#answer-feedback-title').textContent = f.timedOut
      ? `⌛ 時間到！本題 0 分。正確答案：${snapshot.question.options[f.correctIndex]}`
      : f.correct ? '✓ 回答正確！+100 分' : `✕ 回答錯誤。正確答案：${snapshot.question.options[f.correctIndex]}`;
    $('#answer-explanation').textContent = f.explanation;
    $('#answer-feedback').hidden = false;
    $('#next-btn').hidden = false;
    $('#next-btn').textContent = snapshot.answeredCount === snapshot.total ? '查看結算結果 →' : '下一題 →';
    $('#next-btn').focus();
  }
}

async function updateFromServer(operation, ticket = generation) {
  if (busy) return;
  busy = true;
  try {
    const snapshot = await operation();
    if (ticket !== generation) return;
    paintSnapshot(snapshot);
  } catch (error) {
    if (ticket === generation) {
      stopTimer();
      if (game) notifyError(error);
      else message.textContent = `無法開始：${errorText(error)}`;
    }
  } finally {
    busy = false;
  }
}

async function synchronize() {
  if (!game || busy) return;
  const ticket = generation;
  stopTimer();
  // Read-only synchronization resolves late answers and timeouts without double submissions.
  await updateFromServer(() => api.readGame(game.id), ticket);
}

async function chooseAnswer(index) {
  if (!game || game.phase !== 'answering' || busy) return;
  stopTimer();
  const id = game.id;
  const ticket = generation;
  $('#answer-options').querySelectorAll('button').forEach(button => { button.disabled = true; });
  busy = true;
  try {
    const snapshot = await api.answer(id, index);
    if (ticket === generation) paintSnapshot(snapshot);
  } catch (error) {
    if (ticket !== generation) return;
    // Deadline races or ambiguous network failures must be resolved with GET, not a retry POST.
    try { const latest = await api.readGame(id); if (ticket === generation) paintSnapshot(latest); }
    catch (syncError) { notifyError(syncError); }
  } finally { busy = false; }
}

const settings = () => ({player: $('#nickname').value.trim(), category: $('#category').value, difficulty: $('#difficulty').value});
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity() || busy) return;
  const config = settings();
  if (!config.player || [...config.player].length > 20) { message.textContent = '請輸入 1–20 個字元的暱稱。'; return; }
  clearGame();
  message.textContent = '正在向伺服器建立遊戲…';
  void updateFromServer(() => api.createGame(config));
});
$('#next-btn').addEventListener('click', () => {
  if (busy || !game) return;
  if ($('#next-btn').dataset.action === 'sync') { void synchronize(); return; }
  if (game.phase !== 'feedback') return;
  const id = game.id;
  void updateFromServer(() => api.next(id));
});
$('#retry-btn').addEventListener('click', () => {
  if (!game || game.phase !== 'finished' || busy) return;
  const config = {player: game.player, category: game.category, difficulty: game.difficulty};
  clearGame();
  showView('setup');
  message.textContent = '正在建立新的挑戰…';
  void updateFromServer(() => api.createGame(config));
});

function renderResults(result) {
  $('#result-player').textContent = `${game.player}，你完成了本次挑戰。成績已保存在伺服器 SQLite。`;
  $('#result-score').replaceChildren(document.createTextNode(`${result.score} `));
  const small = document.createElement('small');
  small.textContent = `/ ${result.total * 100} 分`;
  $('#result-score').append(small);
  $('#result-correct').textContent = `${result.correct} / ${result.total}`;
  $('#result-accuracy').textContent = `${result.accuracy}%`;
  const list = $('#review-list');
  list.replaceChildren();
  result.review.forEach((item,index) => {
    const li = document.createElement('li');
    const status = document.createElement('p');
    status.className = 'review-label';
    status.textContent = `第 ${index+1} 題 · ${item.timedOut?'逾時':item.correct?'答對':'答錯'}`;
    const title = document.createElement('strong'); title.textContent = item.question;
    const chosen = document.createElement('p'); chosen.textContent = `你的答案：${item.timedOut?'未作答（時間到）':item.options[item.chosenIndex]}`;
    const correct = document.createElement('p'); correct.textContent = `正確答案：${item.options[item.correctIndex]}`;
    const explanation = document.createElement('p'); explanation.textContent = `解析：${item.explanation}`;
    li.append(status,title,chosen,correct,explanation);
    list.append(li);
  });
  sessionStorage.removeItem(STORAGE_KEY);
  showView('result');
}

// Restores sessions after reload; server decides whether the 20-second deadline has passed.
const saved = sessionStorage.getItem(STORAGE_KEY);
if (saved) {
  void updateFromServer(() => api.readGame(saved));
}

document.addEventListener('visibilitychange', () => { if (!document.hidden && game?.phase === 'answering') void synchronize(); });
