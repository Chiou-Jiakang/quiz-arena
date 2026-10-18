# Quiz Arena｜版本變更紀錄（CHANGELOG）

本文件依**開發里程碑**記錄真正已發生的變更，而非每次編輯的流水帳。具體工作流程、測試操作及問題追蹤詳見 [DEVLOG](docs/DEVLOG.md)。日期採專案實際開發紀錄；版本標題**不代表已建立 GitHub Release 或 Git Tag**。

## [Unreleased] — 後續規劃

### Planned
- v0.5.0：建立 SQLite Schema、題庫／場次／成績持久化及資料操作測試。
- v0.6.0：前後端正式串接 API，將公開前端正解移至受保護後端來源。
- v0.7.0 與 v1.0.0：排行榜、品質改善與 MVP 整合驗收。

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
