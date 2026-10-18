/** v0.7.0 — Read-only leaderboard & history presenter; DOM content is text-only. */
const NAMES = {mixed:'綜合知識',technology:'科技',science:'科學',history:'歷史',geography:'地理'};
const LEVELS = {easy:'簡單',medium:'中等',hard:'困難'};
export const formatScoreDate = stamp => Number.isFinite(stamp) ? new Date(stamp).toLocaleString('zh-TW') : '未知時間';
export function createScoresController({api, root, back}) {
  if (!api || !root || typeof back !== 'function') throw new TypeError('缺少排行榜必要參數');
  const $ = selector => root.querySelector(selector);
  const leaderboard = $('#leaderboard-list'), history = $('#history-list'), status = $('#scores-status');
  let requestNumber = 0;
  const td = value => {const el = document.createElement('td');el.textContent=String(value);return el;};
  const empty = (target, columns, message) => {
    const tr=document.createElement('tr');const cell=td(message);cell.colSpan=columns;tr.append(cell);target.append(tr);
  };
  const errorMessage = e => e instanceof Error ? e.message : '未知錯誤';
  async function load() {
    const ticket = ++requestNumber;
    status.textContent='正在讀取成績…';
    leaderboard.replaceChildren();history.replaceChildren();
    try {
      const [ranks, recent] = await Promise.all([api.leaderboard(10), api.scores(20)]);
      if (ticket !== requestNumber) return;
      for (const [i, item] of ranks.scores.entries()) {
        const tr=document.createElement('tr');
        tr.append(td(i+1),td(item.player),td(NAMES[item.category]??item.category),td(LEVELS[item.difficulty]??item.difficulty),td(`${item.score} 分`),td(`${item.accuracy}%`));
        leaderboard.append(tr);
      }
      for (const item of recent.scores) {
        const tr=document.createElement('tr');
        tr.append(td(item.player),td(`${item.score} 分`),td(formatScoreDate(item.completedAt)));
        const cell=document.createElement('td');const button=document.createElement('button');
        button.type='button';button.className='back-link';button.textContent='查看回顧';
        button.addEventListener('click',()=>{void showDetail(item.id);});
        cell.append(button);tr.append(cell);history.append(tr);
      }
      if (!ranks.scores.length) empty(leaderboard,6,'尚無已完成的挑戰，先玩一場吧！');
      if (!recent.scores.length) empty(history,4,'尚無歷史成績。');
      status.textContent=`已載入 ${ranks.scores.length} 筆排行榜及 ${recent.scores.length} 筆最近成績。`;
    } catch (error) {
      if (ticket !== requestNumber) return;
      status.textContent=`讀取失敗：${errorMessage(error)}。請點「重新整理」再試。`;
    }
  }
  async function showDetail(id) {
    const ticket=++requestNumber;
    status.textContent='正在讀取逐題結果…';
    try {
      const item=await api.score(id);
      if (ticket !== requestNumber) return;
      const dialog=$('#score-detail');const list=$('#score-detail-review');list.replaceChildren();
      $('#score-detail-heading').textContent=`${item.player}｜${item.score} 分｜${item.accuracy}%`;
      for(const [i,q] of item.review.entries()){
        const li=document.createElement('li');
        li.textContent=`第 ${i+1} 題：${q.question}｜${q.timedOut?'逾時':q.correct?'答對':'答錯'}｜正解：${q.options[q.correctIndex]}`;
        list.append(li);
      }
      dialog.hidden=false;
      status.textContent='已載入歷史成績。';
    } catch(error){if(ticket===requestNumber)status.textContent=`讀取失敗：${errorMessage(error)}`;}
  }
  $('#scores-refresh').addEventListener('click',()=>{void load();});
  $('#scores-back').addEventListener('click',()=>{requestNumber++;back();});
  $('#score-detail-close').addEventListener('click',()=>{$('#score-detail').hidden=true;});
  return {open(){ $('#score-detail').hidden=true;void load();},close(){requestNumber++;}};
}
