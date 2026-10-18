# Quiz Arena v0.5.0 — SQLite 持久化與 CRUD 設計

## 階段目標與邊界

v0.5.0 將 v0.4.0 以記憶體管理的遊戲場次轉為 **SQLite 儲存**，新增成績列表與單筆查詢、未完成場次刪除 API，並保留既有 API 契約。現有 `public/` 前端依然是獨立單機版，**尚未串接這些 API**；前端題庫仍包含正解，不能視為完整防作弊版本。排行榜的排序規則與介面於 v0.7.0 規劃。

## 技術選擇與相依條件

- 使用 Node.js 內建 `node:sqlite` 的同步 `DatabaseSync`，**需要 Node.js >= 22.13.0**；此版本不需額外安裝 `better-sqlite3` 或 `sqlite3` npm 套件。
- `npm install` 仍用於安裝 v0.4.0 已使用的 Express。`package-lock.json` 保持既有相依套件版本，除非 npm 明確要求更新。
- 資料庫預設路徑：專案根目錄下 `data/quiz-arena.sqlite`，也可透過 `QUIZ_DB_PATH` 指定。
- 專案既有 `.gitignore` 已忽略 `*.sqlite`、`*.sqlite3`，資料庫與其 WAL/SHM 檔不應提交 GitHub。

## 資料模型

- `schema_meta`：Schema 版本。
- `games`：遊戲設定、進度、分數、階段、截止時間與最後活動時間。
- `game_questions`：場次內 10 題之順序與題目 JSON 快照，避免重啟抽到不同題目。
- `game_answers`：依場次與題序保存選擇索引、正確與逾時狀態；題序唯一避免重複答案紀錄。
- `results`：完成後的永久成績摘要與逐題回顧；與活躍場次 TTL 獨立。

啟用外鍵、交易與 WAL；首次啟動自動建立 Schema。儲存場次的狀態／作答在一個 SQLite 交易內更新。使用單程序本機練習，**尚未**完成多程序並行與部署級競爭條件驗證。

## API 新增／調整

既有：`GET /api/config`、`POST /api/games`、`GET /api/games/:id`、`POST /api/games/:id/answers`、`POST /api/games/:id/next` 保持可用。

| Method | Path | 功能 | 主要回應 |
| --- | --- | --- | --- |
| GET | `/api/health` | 健康檢查 | `version: v0.5.0`, `persistence: sqlite` |
| GET | `/api/scores?limit=20` | 歷史成績摘要，`limit` 可為 1–100 | `{ "scores": [...] }` |
| GET | `/api/scores/:id` | 歷史單場成績與逐題回顧 | 成績 JSON 或 404 |
| DELETE | `/api/games/:id` | 刪除尚未完成場次 | 204；已完成則 409 |

注意：`DELETE /api/games/:id` 不等於刪除完成歷史成績。已完成的紀錄禁止透過此路由刪除。

## 時間與清理規則

- 每題期限在建立／切題時寫入 SQLite；API 請求時檢查截止時間，不會因服務重啟重新給 20 秒。
- 未完成場次超過最後互動一小時才會在後續 API 操作時清除；完成成績不隨之刪除。
- 伺服器停機期間不會執行背景逾時排程；重新存取時補判逾時。
- `Date.now()` 為系統時鐘，與 `performance.now()` 的單調時間特性不同，系統時鐘遭人工調整可能影響期限；正式部署需另評估時間策略。

## 測試

```powershell
npm install
npm test
```

預期 40 項既有測試＋10 項 SQLite 測試＋3 項 SQLite HTTP 整合測試＝**53 項**；Express HTTP 測試須先安裝依賴。重要案例包括資料庫重啟、截止時間保存、逾時冪等、結果永久保存、未完成場次刪除、查詢 limit 驗證及 HTTP 路由。

```powershell
npm start
```

以瀏覽器開啟 `http://127.0.0.1:3000/api/health`。`POST`、`DELETE` 等端點可使用 PowerShell `Invoke-RestMethod`，參閱 `INSTALL_README.txt`。

## 已知限制與後續方向

- 現有網站仍直接用前端 JSON 作答、計分。正式前後端整合預計 v0.6.0。
- `public/data/questions.json` 的題庫仍包含正解；正式防作弊需要將含正解的來源移至非公開後端目錄。
- 無認證、未實作對外服務的授權與限流；目前預設只聆聽 `127.0.0.1`。
- SQLite 為本機單程序持久化；多人競爭、大量請求、部署、備份／還原與 migration 管理仍需後續驗證。
- 本次不修改 README、CHANGELOG、DEVLOG；功能 Commit 驗收後再獨立提交累積式文件紀錄。
