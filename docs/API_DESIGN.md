# Quiz Arena v0.4.0 — Express REST API 實作

## 版本定位

本版本新增**獨立運作的 Express API**，原本 v0.3.0 的前端問答、計時器和現有題庫保持不變；**尚未將前端改用新 API**。v0.5.0 才導入 SQLite 持久化，v0.6.0 再將前端與後端正式整合。請勿將本版稱為「完整全端遊戲」。

## 目錄與啟動

新增 `package.json`、`server/index.mjs`、`server/app.mjs`、`server/game-service.mjs`、`tests/api-service.test.mjs`、`tests/api-http.test.mjs`。

在專案根目錄：

```powershell
npm install
npm test
npm start
```

啟動後瀏覽 `http://127.0.0.1:3000/api/health`；API 只綁定本機 `127.0.0.1`。可用 `Ctrl+C` 停止。`npm run dev` 可使用 Node.js watch 模式開發。

原本前端另開終端機使用：

```powershell
python -m http.server 5500 --directory public
```

前端仍在 `http://localhost:5500`，目前不會呼叫 Express；請勿將 `npm start` 誤認為前端整合已完成。

## HTTP API

成功結果均為 JSON；失敗格式 `{ "error": { "code": "...", "message": "..." } }`。

| 方法 | 路徑 | 用途 | 回應 |
| --- | --- | --- | --- |
| GET | `/api/health` | 健康檢查 | `200`；版本與記憶體模式 |
| GET | `/api/config` | 可用類別、難度、十題／20 秒／100 分設定 | `200` |
| POST | `/api/games` | 建立場次 | `201` |
| GET | `/api/games/:id` | 讀取場次與當前狀態；同步處理逾時 | `200` 或 `404` |
| POST | `/api/games/:id/answers` | 提交選項 0–3，由伺服器判定 | `200`、`400`、`404` 或 `409` |
| POST | `/api/games/:id/next` | 完成當前題目後進入下一題／結算 | `200`、`404` 或 `409` |

建立遊戲範例：

```powershell
$game = Invoke-RestMethod -Uri http://127.0.0.1:3000/api/games -Method Post -ContentType 'application/json' -Body '{"player":"測試玩家","category":"technology","difficulty":"easy"}'
$game | ConvertTo-Json -Depth 5
```

答題與前進：

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/games/$($game.id)/answers" -Method Post -ContentType 'application/json' -Body '{"chosenIndex":0}'
Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/games/$($game.id)/next" -Method Post
```

**注意：** 上例應在該題的 20 秒截止前送出；若逾時會收到 HTTP `409 QUESTION_CLOSED`。`next` 只允許在作答或逾時已產生回饋後呼叫。

## 資料安全與時間驗證

- `server/game-service.mjs` 在服務端讀取原本 JSON 題庫、抽出十題，不向**本 API** 未作答的題目輸出 `correctIndex` 或 `explanation`。
- 伺服器以自己的 `Date.now()` 判定 `deadlineAt`；到期後將答案紀錄為 `chosenIndex: null`、`timedOut: true`、0 分。成功作答之後才揭露該題正解與解析。
- 伺服器不採信客戶端自行提供的 `score`、`correct` 或 `deadlineAt`。
- 各場次以不可預測的 UUID 識別；**知道場次 ID 的人可以存取該場次，沒有登入／授權／速率限制**，僅限本機開發用途。
- 尚未將前端題庫 JSON 移出公開目錄，因此**現有純前端仍可直接讀到正解**；正式整合前必須將正解移至不可公開的後端資料來源。不能宣稱現階段已具備正式防作弊能力。

## 場次生命週期與限制

- 記憶體 Map 保存場次，最多 500 場；每次 API 操作時清除逾最後互動一小時的場次。
- 伺服器重啟後所有場次消失；未實作 SQLite、歷史成績或排行榜。
- `GET` 在截止後才會反映逾時狀態；不依賴持續背景排程。
- 未實作正式登入、權限、部署安全措施或持久化。

## 測試

```powershell
npm test
```

包含原有 24 項前端邏輯測試、11 項後端場次測試及 5 項 HTTP API 整合測試，**預期共 40 項**。在提供的執行環境，前 35 項已通過；HTTP 整合測試必須先 `npm install`，再由本機執行才能確認。請依實際測試結果更新 DEVLOG／CHANGELOG，不得預先宣稱 40 項已全部通過。

## 建議 Git 提交

通過本機全部測試與 API 請求後，先以 `feat: add standalone Express REST API and server-side game sessions` 提交程式及 API 設計文件；第二筆 `docs:` Commit 再增量更新 README／CHANGELOG／DEVLOG。
