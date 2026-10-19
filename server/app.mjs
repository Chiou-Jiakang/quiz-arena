/** Express HTTP adapter; business rules live in game-service.mjs. */
import express from 'express';
import { fileURLToPath } from 'node:url';
import { ApiError } from './game-service.mjs';

export function createApp(service) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: 'v1.0.0', persistence: service.persistence }));
  app.get('/api/scores', (req, res) => res.json(service.listScores(req.query.limit === undefined ? 20 : Number(req.query.limit))));
  app.get('/api/leaderboard', (req, res) => res.json(service.leaderboard(req.query.limit === undefined ? 10 : Number(req.query.limit))));
  app.get('/api/scores/:id', (req, res) => res.json(service.readScore(req.params.id)));
  app.get('/api/config', (_req, res) => res.json(service.getConfig()));
  app.post('/api/games', (req, res) => res.status(201).json(service.create(req.body)));
  app.get('/api/games/:id', (req, res) => res.json(service.read(req.params.id)));
  app.post('/api/games/:id/answers', (req, res) => res.json(service.answer(req.params.id, req.body)));
  app.delete('/api/games/:id', (req, res) => { service.delete(req.params.id); res.status(204).end(); });
  app.post('/api/games/:id/next', (req, res) => res.json(service.next(req.params.id)));
  // Only approved frontend assets are served. Never expose public/data/questions.json:
  // it contains correctIndex and would bypass the server-side answer boundary.
  app.get('/', (_req, res) => res.sendFile(fileURLToPath(new URL('../public/index.html', import.meta.url))));
  app.use('/css', express.static(fileURLToPath(new URL('../public/css/', import.meta.url)), { index: false }));
  app.use('/js', express.static(fileURLToPath(new URL('../public/js/', import.meta.url)), { index: false }));
  app.use('/api', (_req, _res, next) => next(new ApiError(404, 'ROUTE_NOT_FOUND', 'API 路徑不存在。')));
  app.use((error, _req, res, _next) => {
    if (error instanceof ApiError) return res.status(error.status).json({ error: { code: error.code, message: error.message } });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: { code: 'BODY_TOO_LARGE', message: '請求內容過大。' } });
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'JSON 格式錯誤。' } });
    console.error('[Quiz Arena API]', error);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '伺服器處理失敗。' } });
  });
  return app;
}
