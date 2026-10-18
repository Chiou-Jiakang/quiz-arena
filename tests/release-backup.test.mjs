import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createSQLiteStore } from '../server/sqlite-store.mjs';
import { checkDatabase } from '../scripts/check-db.mjs';
import { backupDatabase } from '../scripts/backup-db.mjs';

test('SQLite 線上備份可驗證、復原讀取、不覆蓋既有備份', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'quiz-arena-rc-backup-'));
  const source = join(dir, 'source.sqlite'), target = join(dir, 'backup.sqlite');
  const store = createSQLiteStore({ file: source });
  try {
    const info = checkDatabase(source);
    assert.equal(info.valid, true);
    assert.equal(info.schemaVersion, '1');
    assert.equal(await backupDatabase(source, target), target);
    assert.deepEqual(checkDatabase(target), info);
    await assert.rejects(() => backupDatabase(source, target), /拒絕覆蓋/);
  } finally { store.close(); rmSync(dir, { recursive: true, force: true }); }
});
