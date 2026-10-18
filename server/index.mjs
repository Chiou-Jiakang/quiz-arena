import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.mjs';
import { createGameService } from './game-service.mjs';

const bank = JSON.parse(await readFile(fileURLToPath(new URL('../public/data/questions.json', import.meta.url)), 'utf8'));
const service = createGameService({ bank });
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new RangeError('PORT 必須介於 1–65535');
const app = createApp(service);
app.listen(port, '127.0.0.1', () => {
  console.log(`Quiz Arena v0.4.0 API: http://127.0.0.1:${port}/api/health`);
  console.log('目前僅供本機練習；資料存於記憶體，停止服務後不保留。');
});
