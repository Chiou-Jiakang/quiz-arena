/** SQLite persistence adapter. Requires Node.js >=22.13 with node:sqlite. */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function createSQLiteStore({ file = 'data/quiz-arena.sqlite' } = {}) {
  if (typeof file !== 'string' || !file.trim()) throw new TypeError('資料庫路徑不可空白');
  if (file !== ':memory:') mkdirSync(dirname(resolve(file)), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  if (file !== ':memory:') db.exec('PRAGMA journal_mode = WAL;');
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY, player TEXT NOT NULL, category TEXT NOT NULL,
      difficulty TEXT NOT NULL, current_index INTEGER NOT NULL DEFAULT 0,
      score INTEGER NOT NULL DEFAULT 0, phase TEXT NOT NULL,
      deadline_at INTEGER NOT NULL, last_seen INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS game_questions (
      game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      position INTEGER NOT NULL, question_json TEXT NOT NULL,
      PRIMARY KEY(game_id, position)
    );
    CREATE TABLE IF NOT EXISTS game_answers (
      game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      position INTEGER NOT NULL, question_id TEXT NOT NULL,
      chosen_index INTEGER, correct INTEGER NOT NULL CHECK(correct IN (0,1)),
      timed_out INTEGER NOT NULL CHECK(timed_out IN (0,1)),
      PRIMARY KEY(game_id, position)
    );
    CREATE TABLE IF NOT EXISTS results (
      game_id TEXT PRIMARY KEY, player TEXT NOT NULL, category TEXT NOT NULL,
      difficulty TEXT NOT NULL, score INTEGER NOT NULL,
      correct_count INTEGER NOT NULL, timed_out_count INTEGER NOT NULL,
      accuracy INTEGER NOT NULL, completed_at INTEGER NOT NULL,
      review_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS games_last_seen ON games(last_seen);
    CREATE INDEX IF NOT EXISTS results_completed_at ON results(completed_at DESC);
  `);
  const version = db.prepare("SELECT value FROM schema_meta WHERE key='schema_version'").get();
  if (version && version.value !== '1') { db.close(); throw new Error(`資料庫 Schema 版本不支援：${version.value}`); }
  db.prepare("INSERT OR IGNORE INTO schema_meta(key,value) VALUES('schema_version','1')").run();

  const q = {
    insertGame: db.prepare(`INSERT INTO games(id,player,category,difficulty,current_index,score,phase,deadline_at,last_seen)
      VALUES(?,?,?,?,?,?,?,?,?)`),
    updateGame: db.prepare(`UPDATE games SET current_index=?,score=?,phase=?,deadline_at=?,last_seen=? WHERE id=?`),
    insertQuestion: db.prepare('INSERT INTO game_questions(game_id,position,question_json) VALUES(?,?,?)'),
    insertAnswer: db.prepare('INSERT INTO game_answers(game_id,position,question_id,chosen_index,correct,timed_out) VALUES(?,?,?,?,?,?)'),
    game: db.prepare('SELECT * FROM games WHERE id=?'),
    questions: db.prepare('SELECT question_json FROM game_questions WHERE game_id=? ORDER BY position'),
    answers: db.prepare('SELECT question_id,chosen_index,correct,timed_out FROM game_answers WHERE game_id=? ORDER BY position'),
    deleteGame: db.prepare('DELETE FROM games WHERE id=?'),
    prune: db.prepare("DELETE FROM games WHERE phase <> 'finished' AND last_seen < ?"),
    count: db.prepare("SELECT COUNT(*) AS n FROM games WHERE phase <> 'finished'"),
    result: db.prepare('SELECT * FROM results WHERE game_id=?'),
    listResults: db.prepare('SELECT game_id,player,category,difficulty,score,correct_count,timed_out_count,accuracy,completed_at FROM results ORDER BY completed_at DESC, game_id DESC LIMIT ?'),
    insertResult: db.prepare(`INSERT OR IGNORE INTO results(game_id,player,category,difficulty,score,correct_count,timed_out_count,accuracy,completed_at,review_json)
      VALUES(?,?,?,?,?,?,?,?,?,?)`)
  };
  const runTransaction = work => {
    db.exec('BEGIN IMMEDIATE');
    try { const value = work(); db.exec('COMMIT'); return value; }
    catch (error) { db.exec('ROLLBACK'); throw error; }
  };
  const load = id => {
    const r = q.game.get(id);
    if (!r) return null;
    return { id:r.id,player:r.player,category:r.category,difficulty:r.difficulty,
      index:r.current_index,score:r.score,phase:r.phase,deadlineAt:r.deadline_at,lastSeen:r.last_seen,
      questions:q.questions.all(id).map(x=>JSON.parse(x.question_json)),
      answers:q.answers.all(id).map(x=>({questionId:x.question_id,chosenIndex:x.chosen_index,correct:!!x.correct,timedOut:!!x.timed_out})) };
  };
  const recordResult = (s, completedAt) => {
    if (s.phase !== 'finished') return;
    const correct = s.answers.filter(a=>a.correct).length;
    const timedOut = s.answers.filter(a=>a.timedOut).length;
    const review = s.questions.map((item,i)=>({id:item.id,question:item.question,options:item.options,category:item.category,difficulty:item.difficulty,correctIndex:item.correctIndex,explanation:item.explanation,...s.answers[i]}));
    q.insertResult.run(s.id,s.player,s.category,s.difficulty,s.score,correct,timedOut,Math.round(correct/s.questions.length*100),completedAt,JSON.stringify(review));
  };
  return {
    persistence:'sqlite',
    create(s) { runTransaction(()=>{
      q.insertGame.run(s.id,s.player,s.category,s.difficulty,s.index,s.score,s.phase,s.deadlineAt,s.lastSeen);
      s.questions.forEach((question,i)=>q.insertQuestion.run(s.id,i,JSON.stringify(question)));
    }); },
    get: load,
    save(s) { runTransaction(()=>{
      const changed=q.updateGame.run(s.index,s.score,s.phase,s.deadlineAt,s.lastSeen,s.id);
      if (changed.changes!==1) throw new Error('儲存場次失敗');
      // Each saved answer is idempotent; position is unique.
      const existing=q.answers.all(s.id).length;
      for(let i=existing;i<s.answers.length;i++){
        const a=s.answers[i];q.insertAnswer.run(s.id,i,a.questionId,a.chosenIndex,a.correct?1:0,a.timedOut?1:0);
      }
      recordResult(s,s.lastSeen);
    }); },
    delete(id) {return q.deleteGame.run(id).changes>0;},
    prune(cutoff) {q.prune.run(cutoff);},
    count() {return q.count.get().n;},
    listResults(limit=20) {return q.listResults.all(limit).map(row=>({id:row.game_id,player:row.player,category:row.category,difficulty:row.difficulty,score:row.score,correct:row.correct_count,timedOut:row.timed_out_count,accuracy:row.accuracy,completedAt:row.completed_at}));},
    result(id) {const row=q.result.get(id);if(!row)return null;return {id:row.game_id,player:row.player,category:row.category,difficulty:row.difficulty,score:row.score,correct:row.correct_count,timedOut:row.timed_out_count,accuracy:row.accuracy,completedAt:row.completed_at,review:JSON.parse(row.review_json)};},
    close() {db.close();}
  };
}
