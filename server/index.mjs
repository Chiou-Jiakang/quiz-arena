import { readFile } from 'node:fs/promises';
import { createSQLiteStore } from './sqlite-store.mjs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.mjs';
import { createGameService } from './game-service.mjs';

const bank = JSON.parse(await readFile(fileURLToPath(new URL('../public/data/questions.json', import.meta.url)), 'utf8'));
const store = createSQLiteStore({file:resolve(process.env.QUIZ_DB_PATH ?? 'data/quiz-arena.sqlite')});
const service = createGameService({ bank,store });
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new RangeError('PORT 必須介於 1–65535');
const app = createApp(service);
app.listen(port, '127.0.0.1', () => {
  console.log(`Quiz Arena v1.0.0 API: http://127.0.0.1:${port}/api/health`);
  console.log(`Quiz Arena v1.0.0 遊戲：http://127.0.0.1:${port}/`);
  console.log('僅供本機練習；場次與完成成績保存在 SQLite。');
});
