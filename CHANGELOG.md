# Quiz Arena｜版本變更紀錄（CHANGELOG）

本文件依**開發里程碑**記錄真正已發生的變更，而非每次編輯的流水帳。具體工作流程、測試操作及問題追蹤詳見 [DEVLOG](docs/DEVLOG.md)。日期採專案實際開發紀錄；版本標題**不代表已建立 GitHub Release 或 Git Tag**。

## [Unreleased] — 正式 v1.0.0 驗收與發行準備

### Planned
- 依 `docs/RELEASE_CANDIDATE_CHECKLIST.md` 完成候選版人工驗收：限時、離線同步、排行榜、手機／鍵盤操作與題庫 HTTP 隔離。
- 進行備份檔獨立還原與資料一致性演練；確認 Git 工作樹、資料庫排除規則及正式發行文件。
- 正式驗收通過後才更新至 `v1.0.0`、建立 Git Tag／Release；公開網路部署尚需認證、濫用防護與資安審查。

## [1.0.0-rc.1] — 2026-10-19（正式版候選／品質驗收里程碑）

### Added
- 新增 `scripts/check-db.mjs` 與 `npm run db:check`：唯讀檢查 SQLite 完整性、Schema 版本、必要資料表與場次／成績數量；可指定資料庫路徑以檢查備份。
- 新增 `scripts/backup-db.mjs` 與 `npm run db:backup`：透過 SQLite Online Backup API 產生獨立備份，並檢查備份資料庫完整性，適用於 WAL 模式。
- 增加 `tests/release-health.test.mjs`、`tests/release-backup.test.mjs`，並建立 `docs/RELEASE_CANDIDATE_CHECKLIST.md` 作為人工驗收依據。

### Changed
- 將 `package.json`／`package-lock.json`、前端版本文字、啟動訊息及 `/api/health` 統一為 `v1.0.0-rc.1`。
- 修改 `tests/api-sqlite-http.test.mjs` 中 SQLite 健康檢查的舊版預期；修正「程式已是新版本，健康檢查仍顯示 v0.5.0」的歷史問題。
- 擴充 `.gitignore` 以排除本機 `data/` 與 `backups/`，保護執行資料及備份，避免意外加入 Git。
- 本次僅修改發布品質相關程式、工具與文件；保留 v0.7.0 的答題、排行榜、歷史成績 API 與 SQLite 資料結構。

### Tested
- 2026-10-19 開發者提供 Windows 本機輸出：**`tests 65`、`pass 65`、`fail 0`、`skipped 0`**（約 727.94 ms）。
- `npm run db:check`：`valid: true`、`schemaVersion: "1"`、`games: 2`、`results: 2`；`npm run db:backup` 已產生備份且工具回報完整性正常。
- `npm start` 成功顯示 `v1.0.0-rc.1` 伺服器本機入口；開發者確認瀏覽器遊戲操作沒有發現問題。
- Git 檢查與推送：第十八筆功能 Commit `bcaf0b3` 已推送 `origin/main`；剩餘未追蹤的 `STAGE2_README.txt` 未納入版本控管。

### Known Limitations
- 候選版測試及備份成功，不等於備份已完成實際還原演練；獨立還原、跨裝置、鍵盤無障礙、壓力與併發操作尚待逐項確認。
- 尚無使用者認證、對外服務濫用防護、正式授權或完整資安稽核。本版適用本機練習，不應宣稱可直接安全公開部署。
- 目前**尚未**建立正式 `v1.0.0` Git Tag 或 GitHub Release。

### Related Commit
- [`bcaf0b3`](https://github.com/Chiou-Jiakang/quiz-arena/commit/bcaf0b3) — `feat: prepare v1.0.0 release candidate with database validation and backup`（第十八筆）。
- 第十九筆文件更新待使用者建立並推送；未產生前不預先記錄 SHA。

## [0.7.0] — 2026-10-19（排行榜與歷史成績里程碑）

### Added
- 首頁新增排行榜與歷史成績入口及對應介面，沿用原本深色設計與響應式樣式。
- 增加 `public/js/scores-view.mjs`：顯示前十名排行榜、最近 20 筆完成成績及歷史場次逐題回顧；處理載入、空清單、網路異常與回到首頁。
- 新增 `GET /api/leaderboard?limit=10`，回應 `{ "scores": [...] }`，允許 `limit` 為 1–100；前端 API Client 新增排行榜查詢方法。
- 在記憶體與 SQLite 儲存層加入獨立排行榜存取，SQLite 直接針對 `results` 進行資料庫排序後才 LIMIT，避免僅對最近成績排序造成排名錯誤。
- 新增 `docs/LEADERBOARD_DESIGN.md`、`tests/leaderboard.test.mjs`（記憶體與 SQLite 各一例）、`tests/leaderboard-http.test.mjs`（一例）。

### Changed
- 排名規則：**分數降序 → 正確率降序 → 完成時間升序 → 場次 ID 字典序**；最近成績仍獨立依完成時間降序顯示。
- 以 DOM 文字節點呈現使用者暱稱與題目資訊，避免將不可信字串拼接為 HTML。
- 原有 SQLite 資料表及 Schema 版本不變，舊有結果可沿用；既有 v0.6.0 限時問答與結算流程不受影響。

### Tested
- v0.6.0 累計 60 項回歸測試保留；v0.7.0 新增 3 項排行榜自動化測試，**預期完整測試總數 63 項**。此前使用者提供的截圖未完整呈現 `tests/pass/fail` 總數，因此不把 63 / 63 寫成已獨立核實的結果。
- 開發者已回報 v0.7.0 瀏覽器功能操作正常；Git 暫存區檢查無行尾空白錯誤，功能 Commit 已推送遠端。

### Known Limitations
- 目前排行榜以「完成場次」為紀錄，不是玩家去重排名；未實作會員識別、暱稱唯一性、公開服務的授權或防刷榜。
- 仍未驗證大量歷史紀錄效能、跨裝置自動化 E2E、完整資安稽核及 SQLite 備份還原。
- `/api/health` 在 SQLite 模式下沿用 v0.5.0 版本字串，即使 v0.7.0 功能已安裝；屬已知版本標示問題，留待 v1.0.0 修正。

### Related Commit
- [`09e06da`](https://github.com/Chiou-Jiakang/quiz-arena/commit/09e06da) — `feat: implement leaderboard and score history UI`（第十六筆）。
- 本次文件更新預計作為第十七筆 Commit，尚未建立之前不記錄 SHA。

## [0.6.0] — 2026-10-18（前後端正式整合里程碑）

### Added
- 新增 `public/js/api-client.mjs`，統一前端呼叫 Express 的遊戲建立、狀態同步、提交答案及進入下一題操作。
- 網頁改用 API 場次快照呈現題目、回饋及總分；後端負責截止時間、正確答案判定與 SQLite 持久化。
- Express 伺服器提供首頁及核准的 `/css`、`/js` 靜態資源；正式網頁從 `http://127.0.0.1:3000/` 操作，不再使用 5500 靜態服務作為整合入口。
- 瀏覽器保留場次 ID，重新載入時向 API 查詢未完成的遊戲；加入請求錯誤與狀態重新同步處理。
- 新增 `tests/api-client.test.mjs`、`tests/frontend-http.test.mjs`、`docs/FRONTEND_BACKEND_INTEGRATION.md`。

### Changed
- `public/js/app.js` 從前端 JSON 抽題／自行計分轉向伺服器權威遊戲流程；保留舊模組以供回歸測試與理解演進。
- `server/app.mjs` 只公開核准的靜態資源路徑，不直接提供含有正解的 `public/data/questions.json`。
- `server/index.mjs` 啟動時列出 v0.6.0 遊戲與 API 本機入口。

### Tested
- v0.5.0 累計 53 項測試持續保留；新增 API Client 6 項、HTTP 前端整合 1 項。
- 2026-10-18 使用者 Windows 本機執行 `npm test`：**60 passed、0 failed、0 skipped**；並回報瀏覽器遊戲功能正常。
- 測試通過不代表已完成跨瀏覽器、部署級端到端、安全或效能驗證。

### Known Limitations
- `/api/health` 目前 SQLite 模式仍回傳 `version: v0.5.0`，與 `server/index.mjs` 的 v0.6.0 啟動訊息不一致；後續應修正版本資訊。
- 尚無排行榜頁面、會員登入、跨裝置同步、完整部署安全及權限管理。
- 題庫 JSON 仍存在原始碼／Git 歷史；Express 不公開該路徑，不等於已具正式防作弊保護。

### Related Commit
- [`fb97364`](https://github.com/Chiou-Jiakang/quiz-arena/commit/fb9736406e753d1845f1737c9ccba9a7d15aec71) — `feat: integrate frontend with Express API and SQLite`

## [0.5.0] — 2026-10-18（SQLite 資料庫、持久化及 CRUD API 里程碑）

### Added
- 使用 Node.js 內建 `node:sqlite`（Node.js >= 22.13.0），新增 `server/sqlite-store.mjs` 及 `server/memory-store.mjs`，分離場次邏輯與底層儲存。
- SQLite 建立 `schema_meta`、`games`、`game_questions`、`game_answers`、`results` 資料表，記錄 Schema 版本、場次、題序快照、作答和永久成績。
- 支援遊戲場次、截止時間、計分和題序跨 Express 重啟讀取；完成成績與逐題回顧獨立保留。
- 新增交易、外鍵與 WAL 支援，避免單次操作的部分更新破壞資料一致性。
- 新增 `GET /api/scores?limit=20`、`GET /api/scores/:id` 及 `DELETE /api/games/:id`；維持既有 v0.4.0 API 端點。
- 成績列表限制 1–100 筆；只允許刪除未完成場次，歷史完成成績不得透過此路由刪除。
- 新增 `docs/SQLITE_DESIGN.md`、`tests/sqlite-store.test.mjs` 和 `tests/api-sqlite-http.test.mjs`。

### Changed
- 本機後端預設改為 SQLite 持久化：`data/quiz-arena.sqlite`（可用 `QUIZ_DB_PATH` 覆寫）；伺服器啟動前檢查並初始化 Schema。
- `/api/health` 目前回傳 `version: v0.5.0`、`persistence: sqlite`。
- 將仍存於 v0.4.0 記憶體模式的限制視為歷史狀態，不再當成 v0.5.0 現況。

### Tested
- Windows／Node.js v24.15.0：`npm install` 成功，`npm test` **53 passed、0 failed**；包括舊有 40 項、10 項 SQLite 儲存測試與 3 項 SQLite HTTP 測試。
- `npm start` 可啟動 Express，瀏覽器 `/api/health` 已實際回傳 `status: ok`、`version: v0.5.0`、`persistence: sqlite`。
- 曾在 Express 已停止時手動請求 `/api/config` 而遇到 `ERR_CONNECTION_REFUSED`；額外人工 `/api/config` 及跨重啟取回同一場次 ID 的測試未完成。資料跨重啟能力已由自動化測試覆蓋。

### Known Limitations
- 現有前端仍是獨立單機遊戲，未經 API 將答題或分數送往 SQLite；公開 JSON 題庫仍有正解，尚非整體防作弊版本。
- 無登入與授權、正式排行榜、對外部署安全、資料庫備份／還原及多程序併發驗收。
- 未完成場次採最後活動 1 小時 TTL 並於 API 存取時清理；完成成績保留，需建立正式資料保護及刪除政策。
- `server/index.mjs` 的啟動文字仍顯示 `v0.4.0 API`，與實際 `/api/health` 回傳 v0.5.0 不一致；這是待修正的顯示問題，不應誤認為 API 仍是 v0.4.0。

### Related Commit
- [`eb5cb6a`](https://github.com/Chiou-Jiakang/quiz-arena/commit/eb5cb6a) — `feat: implement SQLite persistence and CRUD APIs`

## [0.4.0] — 2026-10-18（獨立 Express REST API 里程碑）

### Added
- 引入 Node.js / Express 5，新增 `package.json`、`package-lock.json` 與 `server/`，提供 `npm start`、`npm run dev`、`npm test`。
- 新增六個 REST 端點：健康檢查、遊戲設定、建立場次、查詢場次、提交答案、前進下一題。
- 新增 `game-service.mjs`，集中驗證玩家設定、十題抽取、唯一場次 ID、20 秒截止時間、答題與結算。
- 伺服器在作答前不回傳 `correctIndex` 或解析；作答後才提供正確答案與回饋。接受選項索引而不是客戶端自訂分數。
- 新增防重複提交、期限到達後記錄逾時 0 分、進度階段驗證與 HTTP 結構化錯誤回傳。
- 記憶體內場次上限預設 500，按互動逾期一小時清理；JSON Body 大小限制為 16 KB。
- 新增 `tests/api-service.test.mjs`（11 項）、`tests/api-http.test.mjs`（5 項）與 `docs/API_DESIGN.md`。

### Tested
- 在原有 24 項測試基礎上新增 16 項，開發者於 Windows／VS Code 執行 `npm test`，結果 **40 passed、0 failed**。
- 在本機執行 `npm start`，並實際以瀏覽器開啟 `/api/health`，收到 `status: ok`、`version: v0.4.0`、`persistence: memory`。
- 端點交互有 HTTP 自動化測試；尚無整套瀏覽器 UI ↔ API 的端到端驗收，因前端尚未整合。

### Known Limitations
- 既有前端仍使用公開的 `public/data/questions.json` 與瀏覽器計分；**未連線至本階段 API**。
- API 在尚未作答時隱藏正解，但靜態前端題庫仍包含正解；因此整個專案**不具正式防作弊能力**。
- 伺服器場次儲存在記憶體，重啟會消失；SQLite、歷史成績、排行榜及資料庫 CRUD 未完成。
- API 目前只監聽本機位址；未建立正式身分驗證、部署強化與效能保證。題庫敘述仍待逐題內容審校。

### Related Commit
- [`3506200`](https://github.com/Chiou-Jiakang/quiz-arena/commit/3506200) — `feat: implement Express REST API and server-side game sessions`

## [0.3.0] — 2026-10-18（前端限時問答里程碑）

### Added
- 每題 20 秒倒數、剩餘時間進度條，以及最後 5 秒的視覺警示。
- 新增獨立 `quiz-timer.mjs`，使用 `performance.now()` 與實際截止時間計算剩餘時間，避免背景排程延遲造成倒數失準。
- 逾時自動結束當題並計 0 分，記錄 `chosenIndex: null`、`timedOut: true`；保留正解、解析及「未作答（時間到）」逐題回顧。
- 點擊答案時重新檢查截止期限；與原有答案鎖定共同防止同題重複加分。
- 作答、逾時、切換下一題、離開、結算與重新挑戰的計時器停止與重新啟動機制。
- 題庫非同步載入期間離開後，避免已過時的載入結果覆蓋目前畫面。
- 新增 `tests/quiz-timer.test.mjs`、`tests/quiz-timeout.test.mjs` 與 `docs/TIMER_DESIGN.md`。

### Tested
- 原有題庫測試 7 項與遊戲邏輯測試 7 項保持通過。
- 新增計時器測試 6 項、逾時狀態測試 4 項；**合計 24 passed、0 failed**（2026-10-18 開發者本機終端機測試）。
- 開發者回報瀏覽器實際操作、計時及逾時流程正常；尚未執行完整跨瀏覽器／多裝置自動化測試。

### Known Limitations
- 計時與答題判定目前在瀏覽器執行，不具正式防作弊能力；未來由 Express 伺服器獨立管理截止時間與正解。
- 分頁凍結／裝置休眠期間無法更新畫面，恢復 JavaScript 執行時才補判逾時。
- 成績不持久化，尚無 SQLite、Express API、正式排行榜；題庫內容仍待逐題事實審核。

### Related Commit
- [`78e6ecf`](https://github.com/Chiou-Jiakang/quiz-arena/commit/78e6ecf) — `feat: implement 20-second quiz timer and timeout handling`

## [0.2.0] — 2026-10-18（前端單機問答里程碑）

### Added — Stage 1：題庫系統（2026-10-17）
- 建立 120 題 JSON 題庫，四類知識 × 三種難度 × 每組十題，支援「綜合知識」跨類別模式。
- 加入題目 ID、格式、四選項、正解索引與解析等資料欄位的驗證。
- 實作篩選及 Fisher–Yates 不重複隨機抽題，題量不足時明確拒絕抽題。
- 新增 `quiz-data.mjs`、題庫設計文件與 7 項 Node.js 自動化測試。

### Added — Stage 2：單機問答系統（2026-10-18）
- 確認遊戲設定後載入題庫，實際進入十題問答流程。
- 新增四選一互動、答題進度、正誤與解析、答對 100 分／答錯 0 分、作答鎖定及下一題切換。
- 完成十題結算、正確率、逐題回顧與相同設定重新挑戰。
- 新增獨立遊戲狀態及計分模組 `quiz-engine.mjs`、7 項邏輯測試及技術文件。
- 將深色科技介面延伸到問答、回饋及結算畫面。

### Tested
- Stage 1 題庫測試：7 / 7 通過。
- Stage 2 遊戲邏輯測試：7 / 7 通過；合計 **14 / 14**，0 failed。
- 開發者已回報瀏覽器實際遊戲流程正常；尚未宣稱完成跨裝置、跨瀏覽器與端到端自動化測試。

### Known Limitations
- v0.2.0 尚未加入每題 20 秒倒數或逾時判定。
- 成績與進度只存在前端記憶體，重新整理後不保留。
- 正確答案存在可讀取的前端 JSON，不能當作防作弊或正式排名依據。
- 尚無 Express API、SQLite 持久化、正式排行榜與會員登入。
- 題庫結構完成驗證，但題目內容尚待逐題事實審核；單一類別／難度目前僅十題，重玩性有限。

### Related Commits
- [`5abee22`](https://github.com/Chiou-Jiakang/quiz-arena/commit/5abee22) — `feat: add validated multi-category question bank`
- [`7cc94e2`](https://github.com/Chiou-Jiakang/quiz-arena/commit/7cc94e2) — `feat: implement single-player quiz gameplay`

## [0.1.0] — 2026-10-17（首頁與遊戲設定原型）

### Added
- 建立 Quiz Arena 首頁、品牌視覺、深色科技風格、遊戲規則與三步驟說明。
- 加入「開始挑戰」、「遊戲規則」入口及基本響應式版面。
- 建立暱稱輸入／必填檢查、知識類別與難度選擇、規則摘要與返回首頁。
- 使用原生 JavaScript DOM 與事件監聽完成基本畫面切換、表單提交及設定回饋。

### Tested
- 本機 HTTP 伺服器及靜態資源載入正常；人工檢查首頁、設定、返回功能與基本版面，未回報阻礙操作問題。

### Known Limitations at This Milestone
- 當時確認設定僅顯示文字訊息，正式答題與結算尚未實作（已由 v0.2.0 補齊）。
- 當時沒有計時、後端、資料庫、排行榜；favicon 尚待補充。

### Related Commits
- [`a26df7d`](https://github.com/Chiou-Jiakang/quiz-arena/commit/a26df7d) — `feat: implement Quiz Arena homepage and game setup`
- [`7e5f0f0`](https://github.com/Chiou-Jiakang/quiz-arena/commit/7e5f0f0) — `docs: document v0.1.0 features and test results`

## [Planning / Initialization] — 2026-10-15 至 2026-10-17

- 確認 MVP 規格、驗收條件、前後端技術路線與分階段交付方式。
- 建立 Repository、PRD、README、CHANGELOG、DEVLOG 與 Git 忽略規則。
- 對應 Git 歷史：`cda2d3a`（Initial commit）、`5c1af5a`（需求文件初始化）。
