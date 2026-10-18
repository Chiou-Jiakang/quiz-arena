/** Non-mutating SQLite database integrity and schema check. */
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function checkDatabase(path) {
  const dbPath = resolve(path);
  if (!existsSync(dbPath)) throw new Error(`找不到資料庫：${dbPath}`);
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    const integrity = db.prepare('PRAGMA integrity_check').all();
    if (integrity.length !== 1 || integrity[0].integrity_check !== 'ok') {
      throw new Error(`SQLite 完整性檢查失敗：${JSON.stringify(integrity)}`);
    }
    const version = db.prepare("SELECT value FROM schema_meta WHERE key='schema_version'").get()?.value;
    if (version !== '1') throw new Error(`不支援的 Schema：${version}`);
    const required = ['games', 'game_questions', 'game_answers', 'results', 'schema_meta'];
    const found = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(row => row.name));
    for (const table of required) if (!found.has(table)) throw new Error(`缺少資料表：${table}`);
    const stats = {};
    for (const table of ['games', 'results']) stats[table] = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count;
    return { valid: true, schemaVersion: version, ...stats };
  } finally { db.close(); }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  try { console.log(JSON.stringify(checkDatabase(process.argv[2] ?? process.env.QUIZ_DB_PATH ?? 'data/quiz-arena.sqlite'), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
