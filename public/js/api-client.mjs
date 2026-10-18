/** v0.6.0 same-origin API client; no correct answers are ever fetched before submission. */
export class ApiRequestError extends Error {
  constructor(message, status = 0, code = 'NETWORK_ERROR') {
    super(message); this.name = 'ApiRequestError'; this.status = status; this.code = code;
  }
}

export function createApiClient({ fetchFn = globalThis.fetch, base = '/api' } = {}) {
  if (typeof fetchFn !== 'function') throw new TypeError('fetch 必須是函式');
  const request = async (path, method = 'GET', json) => {
    let response;
    try {
      response = await fetchFn(`${base}${path}`, {
        method,
        headers: json === undefined ? {} : { 'content-type': 'application/json' },
        body: json === undefined ? undefined : JSON.stringify(json),
        cache: 'no-store'
      });
    } catch (cause) {
      throw new ApiRequestError('無法連線至遊戲伺服器，請確認已執行 npm start。');
    }
    if (response.status === 204) return null;
    let payload;
    try { payload = await response.json(); }
    catch { throw new ApiRequestError('伺服器回傳非 JSON 資料。', response.status, 'INVALID_RESPONSE'); }
    if (!response.ok) {
      throw new ApiRequestError(payload?.error?.message || `HTTP ${response.status}`, response.status, payload?.error?.code || 'API_ERROR');
    }
    return payload;
  };
  return {
    health: () => request('/health'),
    config: () => request('/config'),
    createGame: settings => request('/games', 'POST', settings),
    readGame: id => request(`/games/${encodeURIComponent(id)}`),
    answer: (id, chosenIndex) => request(`/games/${encodeURIComponent(id)}/answers`, 'POST', { chosenIndex }),
    next: id => request(`/games/${encodeURIComponent(id)}/next`, 'POST'),
    scores: (limit = 20) => request(`/scores?limit=${encodeURIComponent(limit)}`),
    leaderboard: (limit = 10) => request(`/leaderboard?limit=${encodeURIComponent(limit)}`),
    score: id => request(`/scores/${encodeURIComponent(id)}`)
  };
}
