/** v1.0.0-rc1: online-safe SQLite backup. Usage: npm run db:backup [-- output-path] */
import { backup, DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function backupDatabase(source, destination) {
  const src = resolve(source);
  const dst = resolve(destination);
  if (src === dst) throw new Error('來源與備份位置不可相同');
  if (!existsSync(src)) throw new Error(`找不到資料庫：${src}`);
  if (existsSync(dst)) throw new Error(`備份已存在，拒絕覆蓋：${dst}`);
  mkdirSync(dirname(dst), { recursive: true });
  // backup() uses SQLite online backup API, handling WAL correctly.
  const db = new DatabaseSync(src, { readOnly: true });
  try { await backup(db, dst); }
  finally { db.close(); }
  let check;
  try {
    check = new DatabaseSync(dst, { readOnly: true });
    const status = check.prepare('PRAGMA integrity_check').all();
    if (status.length !== 1 || status[0].integrity_check !== 'ok') {
      throw new Error(`備份完整性檢查失敗：${JSON.stringify(status)}`);
    }
  } finally { check?.close(); }
  return dst;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const source = process.env.QUIZ_DB_PATH ?? 'data/quiz-arena.sqlite';
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = process.argv[2] ?? `backups/quiz-arena-${stamp}.sqlite`;
  backupDatabase(source, target).then(path => console.log(`SQLite 備份成功且完整性正常：${path}`)).catch(error => {
    console.error(error.message); process.exitCode = 1;
  });
}
