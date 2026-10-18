# Quiz Arena｜知識競技場

> **目前開發里程碑：v0.6.0 — Frontend & Backend Integration**
> **狀態：瀏覽器已透過 Express API 進行正式答題並由 SQLite 保存場次與成績；排行榜、品質強化及最終 MVP 驗收仍待完成**
> **最後文件更新：2026-10-18**

Quiz Arena 是一款以多元知識問答為主題的網頁競技遊戲。玩家輸入暱稱、選擇知識類別與難度後，即可進行十題四選一挑戰，查看答題回饋、得分和逐題結果。介面採深色科技競技場風格，並以響應式設計兼顧桌面與手機操作。

本專案採用 **AI-Assisted Development × Iterative Development**：由 AI 協助產生與調整程式碼，再進行本機執行、功能測試、問題修正、Code Review 與 Git 版本紀錄。每個里程碑保留對應的程式碼、測試與中文開發文件。

**重要區別：** v0.6.0 已將瀏覽器畫面、Express REST API 與 SQLite 場次紀錄串接。正式作答由後端判定答案、分數與 20 秒截止時間；瀏覽器可從伺服器恢復未完成場次。這是**可在本機操作的全端原型**，尚未完成排行榜、公開部署、認證授權及系統化資安與跨裝置驗收，不應宣稱已達正式營運品質。

---

## 1. 專案目標與範圍

- **產品目標：** 完成從首頁、挑戰設定、作答、結算、重新挑戰，到成績保存與排行的完整單人問答流程。
- **前端目標：** 使用原生 HTML、CSS、JavaScript 實作介面、DOM 事件、狀態與錯誤提示，不以框架掩蓋基礎運作方式。
- **後端目標：** 使用 Node.js / Express 建立 REST API，將正式抽題、答案驗證、計時與計分責任移至伺服器。
- **資料目標：** 使用 SQLite 儲存題庫、遊戲場次、答題與歷史成績，練習 CRUD 與資料一致性。
- **工程目標：** 透過 GitHub 的實際 Commit、文件、測試與迭代歷程展示可維護的開發習慣。

目標使用者是喜歡知識問答的學生與一般玩家。MVP 以**輸入暱稱、免註冊**為原則；會員登入與即時多人連線不包含在 MVP 內。

## 2. 遊戲規則：目標規格與目前狀態

| 項目 | MVP 規格 | v0.6.0 現況 |
| --- | --- | --- |
| 遊戲模式 | 單人問答、免註冊暱稱 | 已實作 |
| 題目數量 | 每局 10 題且不可重複 | 已實作 |
| 題目形式 | 每題四選一 | 已實作 |
| 類別 | 綜合知識、科技、科學、歷史、地理 | 已實作 |
| 難度 | 簡單、中等、困難 | 已實作 |
| 每題限時 | 20 秒，逾時視為答錯 | **已整合**：伺服器決定實際截止期限，前端依其時間提示倒數 |
| 計分 | 答對 +100；答錯或逾時 +0 | **已整合**：瀏覽器顯示後端回傳的分數及正誤 |
| 滿分 | 1,000 分 | 已實作 |
| 作答回饋 | 正誤、正解及解析 | 已實作 |
| 完成結算 | 總分、答對率、逐題回顧 | 已由後端產生結果，SQLite 保存完成成績 |
| 歷史成績 | SQLite 儲存，重啟可查 | 完成成績已持久化；後端提供歷史成績 API，但獨立歷史成績 UI 尚未完成 |
| 排行榜 | 已完成場次前 10 名 | 後端可查詢歷史成績；正式排名規則與介面尚未實作 |
| 後端 API | 建立遊戲／提交作答／查詢狀態 | **已整合前端**：建立場次、作答、進入下一題、恢復狀態及結算皆經 API |
| 場次資料 | 可跨伺服器重啟保存的正式紀錄 | **SQLite 持久化已啟用**，前端透過本機場次 ID 恢復；仍受場次 TTL 限制 |

完整功能及驗收基準以 [PRD](docs/PRD.md) 為準；本表描述實作進度，不代表 PRD 所有驗收條件已通過。

## 3. 功能發展歷程

### v0.1.0 — 首頁與遊戲設定（2026-10-17）

**首頁 UI**
- 建立 Quiz Arena 品牌標題、介紹文字、視覺裝飾與深色科技風格。
- 顯示每場 10 題、每題 20 秒、答對 100 分的**目標遊戲規則**。
- 提供「開始挑戰」與「遊戲規則」入口，加入三步驟玩法說明及基本響應式排版。

**遊戲設定 UI**
- 玩家暱稱輸入、必填驗證，以及類別與難度選單。
- 顯示遊戲規則摘要、設定確認結果與返回首頁功能。

**前端互動**
- 以 DOM 操作切換首頁與設定畫面。
- 以事件監聽器處理點擊與表單提交，動態回報玩家設定。

**當時的限制與改善：** v0.1.0 按下「確認遊戲設定」只顯示一行回饋，尚無真正的答題頁，因此容易讓玩家以為沒有反應。v0.2.0 已將此流程接入問答畫面；favicon 未建立則仍是非關鍵待改善項目。

### v0.2.0 Stage 1 — 題庫及抽題模組（2026-10-17）

- 新增 `public/data/questions.json`，共 **120 題**：科技、科學、歷史、地理四類，每類三種難度各十題。
- 每題儲存唯一 ID、類別、難度、題幹、四個選項、正解索引、解析與啟用狀態。
- `mixed`（綜合知識）是跨四個類別抽題的模式，不會另存一份重複題庫。
- 新增 `public/js/quiz-data.mjs`，驗證題庫結構、篩選條件並採 **Fisher–Yates Shuffle** 不重複抽出十題；不足十題時回報錯誤。
- 新增七項自動化測試，詳見[題庫設計文件](docs/QUESTION_BANK_DESIGN.md)。

**目前題庫限制：** 單一類別／難度恰有十題，所以重玩時可能只改變題目順序；題庫結構通過測試，不表示所有知識敘述已經過外部權威來源逐題審校。

### v0.2.0 Stage 2 — 問答、計分與結算（2026-10-18）

- 設定確認後以 `fetch()` 載入題庫，進入十題單人問答畫面。
- 顯示四個答案選項、題目進度與當前得分；作答後鎖定選項，顯示正誤、正解和解析。
- 依答對 +100、答錯 +0 計分，防止同一題重複作答與重複加分。
- 完成十題後顯示分數、正確率、逐題回顧，支援相同設定重新挑戰與返回首頁。
- 新增 `quiz-engine.mjs` 將遊戲狀態／計分邏輯與 DOM 操作分離，增加七項邏輯測試。
- 延續原首頁的配色與排版設計至遊戲、作答回饋、結算頁面。

**v0.2.0 當時的限制（歷史狀態）：** 本階段尚無倒數計時（已於 v0.3.0 加入前端計時）；答題紀錄只保留在瀏覽器記憶體，重新整理後不保留；正解位於前端 JSON，**不具防作弊能力**。詳細設計見[Stage 2 實作文件](docs/STAGE2_IMPLEMENTATION.md)。

### v0.3.0 — 每題 20 秒計時及逾時處理（2026-10-18）

**計時機制及畫面**
- 每題進入作答狀態後顯示 **20 秒倒數**與時間進度條；剩餘最後五秒提供醒目的警示狀態。
- 新增 `public/js/quiz-timer.mjs`，以 `performance.now()` 計算實際截止時間，而不是假設 `setInterval()` 每次都準時執行；瀏覽器分頁背景執行延遲不會讓答題期限無限延長。
- 玩家在截止期限之後才點選答案時，應以逾時判定，而不是因計時器回呼延遲仍接受作答。

**答案狀態及遊戲流程**
- 新增 `submitTimeout()`；逾時記錄為 `chosenIndex: null`、`timedOut: true`，不增加分數，並鎖定選項、顯示正解與解析。
- 答對、答錯和逾時互斥，同一題不會重複提交或重複加分；結算逐題回顧顯示「未作答（時間到）」等逾時資訊。
- 作答、逾時、換題、離開、結算及重新挑戰時清理或重設計時器；每題均取得新的 20 秒期限，回饋期間不倒數。
- 處理題庫載入中的非同步離開情況，降低舊回應晚到後覆蓋目前畫面的風險。

**測試與限制**
- 新增 6 項計時器測試及 4 項遊戲逾時狀態測試，與先前 14 項合計 **24 項自動化測試通過（0 failed）**；開發者另回報 v0.3.0 瀏覽器操作未見主要異常。
- 仍是純前端計時。若分頁凍結或裝置休眠，畫面無法在停機期間即時更新，恢復執行時才會補判逾時。使用者也能操作瀏覽器程式繞過驗證，因此不能作為正式競賽的防作弊依據。

詳細技術取捨與人工驗收項目請參閱 [計時系統設計](docs/TIMER_DESIGN.md)。

### v0.4.0 — 獨立 Express REST API 與伺服器端場次（2026-10-18）

**後端架構與資料契約**
- 新增 Node.js／Express 5 後端，以 `server/index.mjs` 啟動本機 HTTP 服務、`server/app.mjs` 定義路由及統一 JSON 錯誤格式、`server/game-service.mjs` 實作不依賴 HTTP 的場次核心邏輯。
- 新增 `package.json` 與 `package-lock.json` 以管理依賴與可重現安裝；支援 `npm install`、`npm test`、`npm start` 及 `npm run dev`（Node.js >= 20）。
- 提供 `GET /api/health`、`GET /api/config`、`POST /api/games`、`GET /api/games/:id`、`POST /api/games/:id/answers`、`POST /api/games/:id/next`，共六個端點。
- 正式作答前的 API 題目只包含題幹、選項、題目 ID、類別和難度，不含正確索引及解析；送出答案後才回傳回饋。

**伺服器端規則與保護**
- 使用 UUID 建立場次 ID，十題不重複；每題在伺服器端設定 20,000 毫秒截止時間，作答時以伺服器時鐘驗證。逾時未答計 0 分，正確作答加 100 分，禁止重複提交或跳過未完成題目。
- HTTP 錯誤以 `{ "error": { "code", "message" } }` 回傳，區分不合法輸入、場次不存在、重複提交、題庫不可用及容量限制等狀況；JSON Body 限制 16 KB。
- 場次暫存在後端 `Map`，預設最多 500 場，依最後互動時間進行 1 小時逾期清理；**當時不持久化**、重新啟動即遺失（v0.5.0 已改為 SQLite）。
- API 綁定 `127.0.0.1`，定位為本機練習環境，尚未提供部署安全、登入、資料庫或排行榜。

**本機驗收與工程邊界**
- 在既有 24 項測試之外，新增 11 項伺服器場次服務測試及 5 項 HTTP 合約測試，開發者於 Windows／VS Code 執行 `npm test`，**40 項通過、0 項失敗**。
- 開發者執行 `npm start` 並於瀏覽器開啟 `http://127.0.0.1:3000/api/health`，收到 `status: ok`、`version: v0.4.0`、`persistence: memory`。
- **v0.4.0 當時**尚未把前端 `app.js` 接到 API，前端遊戲繼續透過公開 JSON 運作；此限制已在 v0.6.0 整合時改善，但不能宣稱整體遊戲已具備正式防作弊能力。

更多端點、JSON 欄位、HTTP 狀態與限制參閱 [API 設計文件](docs/API_DESIGN.md)。

### v0.5.0 — SQLite 持久化與 CRUD API（2026-10-18）

**資料庫及資料模型**
- 使用 Node.js 內建 `node:sqlite`／`DatabaseSync`（**Node.js >= 22.13.0**），由 `server/sqlite-store.mjs` 管理本機資料庫；預設儲存在 `data/quiz-arena.sqlite`，可使用 `QUIZ_DB_PATH` 更改位置。
- 首次啟動建立 `schema_meta`、`games`、`game_questions`、`game_answers`、`results` 五組資料表，管理 Schema 版本、遊戲狀態、十題順序與快照、答題及永久結果。
- 使用 SQLite 外鍵、交易與 WAL；資料更新以單次交易協調，降低部分寫入造成的狀態不一致。後端透過儲存介面管理場次，另保留 `server/memory-store.mjs` 作為測試與相容用途。
- 將場次的題序、作答、分數與截止時間寫入資料庫：**重啟 Express 後可繼續讀取**，不會因重啟重新給當題 20 秒；已完成的成績及逐題回顧獨立保存。

**API 與資料生命週期**
- 延續 v0.4.0 原有六個端點及主要資料契約，新增 `GET /api/scores`、`GET /api/scores/:id`、`DELETE /api/games/:id`，目前合計 **9 個 API 端點**。
- 成績列表可使用 `?limit=20` 查詢，範圍限制為 1–100；單筆成績查詢可取得已完成場次的詳細回顧。`DELETE /api/games/:id` 僅允許刪除**未完成**場次，不能用來刪除歷史成績。
- 未完成場次依最後活動時間設有 1 小時 TTL，在後續 API 操作時執行清理；完成成績不會跟著活躍場次 TTL 被刪除。SQLite 實作的伺服器截止時間以 `Date.now()` 為基準，與前端單調時鐘 `performance.now()` 不同。

**驗收、限制及下一步**
- 新增 10 項 SQLite 儲存／重啟測試及 3 項 SQLite HTTP 測試，與既有 40 項合計 **53 項自動化測試通過、0 項失敗**；Windows／Node.js v24.15.0 執行 `npm install`、`npm test`，瀏覽器開啟 `/api/health` 得到 `version: v0.5.0`、`persistence: sqlite`。
- 曾因 Express 未持續執行而在手動呼叫 `/api/config` 時遇到連線拒絕；已說明需保持 `npm start` 運作。**額外手動的 `/api/config`／跨重啟存取場次測試並未完成**，不能寫成已人工驗收通過；相關持久化案例則已由自動化測試覆蓋。
- **v0.5.0 當時**尚未完成前後端串接：瀏覽器仍可直接從公開 JSON 取得正解；v0.6.0 已改為由 Express 限制靜態公開路徑及後端判題，但完整的 SQLite 備份／還原、多程序併發、存取權限及排行榜仍待後續處理。

詳細資料表及 API 規則見 [SQLite 設計文件](docs/SQLITE_DESIGN.md)。

### v0.6.0 — 網頁前後端串接與伺服器權威答題（2026-10-18）

**主要成果及資料流**
- 前端 `public/js/app.js` 由原先直接讀取題庫、在本機判題，改為使用新增的 `public/js/api-client.mjs` 呼叫 Express REST API；原有 v0.2.0、v0.3.0 模組仍保留供歷史與回歸測試。
- 瀏覽器流程：設定玩家／類別／難度 → `POST /api/games` 建立 SQLite 場次 → API 回傳題目與四選一選項 → `POST /api/games/:id/answers` 由後端判題及記分 → `POST /api/games/:id/next` 進入下一題／完成結算。
- 前端以 API 的 `phase`、`question`、`feedback`、`result` 決定畫面，避免在正式遊戲流程直接持有答題前的 `correctIndex`。後端仍是分數、截止期限與答案判定的主要資料來源。
- 題目計時由伺服器以 `deadlineAt` 決定是否逾時；前端倒數只是使用者介面的視覺提示。若 HTTP 回應延遲、分頁切換或截止時間與畫面不同步，需依後端場次快照重新校正。
- 目前正式本機遊戲由 Express 同時提供網頁、CSS、JavaScript 與 API，入口為 **`http://127.0.0.1:3000/`**；不要再以 5500 靜態服務器作為正式全端模式入口。

**續玩與錯誤處理**
- 使用瀏覽器 `localStorage` 保存場次識別資訊，重新整理後可呼叫 `GET /api/games/:id` 恢復現有狀態；**遊戲正式資料仍在 SQLite**，localStorage 不代表已登入帳戶或跨裝置同步。
- 當 API 連線失敗或回應不確定時，由前端重新讀取伺服器場次，避免在網路狀況不佳時完全依賴瀏覽器的舊分數及階段。
- `server/app.mjs` 只提供核准的首頁、`/css`、`/js` 與 API 路由，不提供 `public/data/questions.json` 的靜態路由；正式網頁流程不再直接請求該題庫檔。**但原始題庫仍存在 Repository 的公開版本歷史**，不得宣稱已達防作弊或生產環境安全標準。

**測試與現況界線**
- 新增 6 項 API Client 測試及 1 項 Express 前端 HTTP 測試；與舊版 53 項合計，開發者在 Windows 本機執行 **`npm test`：60 passed、0 failed**，並回報遊戲瀏覽器操作正常。
- 本階段尚未增加排行榜、跨裝置使用者識別、正式登入權限、部署安全、完整 E2E 自動化、負載測試或題庫逐題事實審查。
- **已知顯示差異：** `server/index.mjs` 啟動訊息標示 v0.6.0，但現行 `server/app.mjs` 的 `/api/health` 仍依儲存模式回傳 `version: v0.5.0`；這是待修正的版本字串，不代表前端整合功能沒有部署。

技術細節、API 同步與人工驗收項目見 [前後端整合設計](docs/FRONTEND_BACKEND_INTEGRATION.md)。

## 4. 技術架構與模組責任

| 層級／工具 | 技術 | 目前狀態與責任 |
| --- | --- | --- |
| 網頁結構 | HTML5 | 已使用；首頁、設定、問答與結算 |
| 樣式及 RWD | CSS3 | 已使用；深色主題、狀態視覺、不同裝置寬度 |
| 前端互動 | JavaScript (ES Modules) | 已使用；DOM、事件、API Client、遊戲畫面與狀態同步 |
| API Client | `public/js/api-client.mjs` | 已使用；統一 HTTP 請求及錯誤處理 |
| 題庫及抽題 | JSON + `quiz-data.mjs` | 已使用；資料驗證、類別難度篩選、洗牌 |
| 遊戲邏輯 | `quiz-engine.mjs` | v0.2.0／v0.3.0 本機原型及回歸測試仍保留；v0.6.0 正式判題由後端負責 |
| 題目計時 | `quiz-timer.mjs` 與伺服器截止時間 | 前端顯示倒數；正式截止時間以後端 `deadlineAt` 為準 |
| 自動化測試 | Node.js `node:test` | 已使用；前端、伺服器端場次與 HTTP 合約測試 |
| 後端 | Node.js / Express 5 | **已串接瀏覽器**；管理場次、答案、期限、計分與靜態資源路由 |
| 資料庫 | Node.js `node:sqlite` / SQLite | 已使用；後端場次、題目快照、答題、完成成績持久化；題庫目前仍讀取 JSON |
| 儲存抽象層 | `sqlite-store.mjs`、`memory-store.mjs` | 已使用；SQLite 為預設持久化實作，記憶體版本保留供測試與比較 |
| 版本與文件 | VS Code / Git / GitHub | 已使用；提交、測試與迭代紀錄 |

**v0.5.0 時期的前端資料流（歷史狀態）：** 設定表單 → `fetch()` 讀取公開 JSON → 前端抽題 → 瀏覽器計時／判分 → 畫面更新與記憶體結算。

**v0.4.0 當時獨立 API 資料流（歷史狀態）：** HTTP JSON 請求 → Express 路由 → `game-service.mjs` 驗證及管理 `Map` 場次 → 回傳題目或結果；未提供瀏覽器介面串接。

**v0.6.0 已整合資料流：** 瀏覽器 → `api-client.mjs` → HTTP / JSON → Express 路由 → Game Service → SQLite Store → SQLite；前端讀取後端回傳的題目、判題、截止時間及完成結果。

## 5. 專案目錄

```text
quiz-arena/
├── public/
│   ├── index.html                 # 首頁、遊戲設定、問答、結算
│   ├── css/
│   │   └── style.css             # 視覺與響應式樣式
│   ├── data/
│   │   └── questions.json        # 120 題前端題庫
│   └── js/
│       ├── app.js                # UI、事件與 API 場次流程串接
│       ├── api-client.mjs        # API 封裝、請求與錯誤處理
│       ├── quiz-data.mjs         # 題庫驗證與隨機抽題
│       ├── quiz-engine.mjs       # 進度、答案、逾時與計分邏輯
│       └── quiz-timer.mjs        # 20 秒題目計時與清理
├── tests/
│   ├── quiz-data.test.mjs        # 題庫及抽題測試
│   ├── quiz-engine.test.mjs      # 單機遊戲邏輯測試
│   ├── quiz-timer.test.mjs       # 題目計時器測試
│   ├── api-client.test.mjs       # API Client 單元測試
│   ├── frontend-http.test.mjs    # 前端靜態資源／HTTP 整合測試
│   ├── quiz-timeout.test.mjs     # 遊戲逾時狀態測試
│   ├── api-service.test.mjs      # 後端場次與規則測試
│   └── api-http.test.mjs         # Express HTTP 合約測試
├── docs/
│   ├── PRD.md                    # MVP 需求與驗收標準
│   ├── DEVLOG.md                 # 逐次開發日誌
│   ├── QUESTION_BANK_DESIGN.md   # 題庫格式與限制
│   ├── STAGE2_IMPLEMENTATION.md  # Stage 2 技術說明
│   ├── TIMER_DESIGN.md           # v0.3.0 計時設計
│   └── API_DESIGN.md             # v0.4.0 API 路由、資料契約與限制
├── server/
│   ├── index.mjs                 # 啟動 API、載入題庫及監聽本機埠
│   ├── app.mjs                   # Express 路由與 JSON 錯誤處理
│   └── game-service.mjs          # 場次生命週期、伺服器計時、答題計分
├── package.json                # Express 依賴、啟動與測試指令
├── package-lock.json           # npm 鎖定依賴版本
├── README.md
├── CHANGELOG.md
└── .gitignore
```

**v0.5.0 目錄增量：** `server/memory-store.mjs`、`server/sqlite-store.mjs`、`tests/sqlite-store.test.mjs`、`tests/api-sqlite-http.test.mjs`、`docs/SQLITE_DESIGN.md`；`data/quiz-arena.sqlite` 為執行時資料檔，不屬於 Git 追蹤的原始碼。上方目錄樹呈現 v0.4.0 基底，這些為 v0.5.0 新增的正式檔案。

## 6. 安裝與本機執行

### 環境需求

- Windows、macOS 或 Linux；建議使用最新穩定版 Edge 或 Chrome。
- Python 3：用於啟動靜態 HTTP 伺服器。
- Node.js **22.13.0 以上版本**及 npm：安裝／執行 Express、內建 SQLite、測試與後端服務。
- VS Code 與 Git：建議用於開發及版本管理。

### v0.6.0 最新啟動方式（正式本機全端遊戲）

從 GitHub Clone 最新版本或在專案根目錄啟動：

```powershell
node -v
npm ci
npm test
npm start
```

Node.js 須為 **22.13.0 或更新**。保持伺服器在終端機執行，瀏覽器開啟 **http://127.0.0.1:3000/**，即可從首頁設定、十題限時問答至 SQLite 持久化結算。健康檢查路徑為 `/api/health`，目前回傳的版本可能仍是 v0.5.0（已知字串待修正）。

**重要：** 以下的 5500 靜態伺服器方式與 v0.4.0／v0.5.0「前後端分開操作」說明是歷史開發方法，不可拿來當作 v0.6.0 正式全端入口。重新整理恢復場次取決於瀏覽器本地保存的場次 ID 與伺服器 SQLite 中該場次是否仍有效。

### 啟動網站（v0.1.0～v0.5.0 前端示範的歷史方式）

1. 將 Repository Clone 至電腦，以 VS Code 開啟 `quiz-arena` 根目錄。
2. 在根目錄的終端機執行：

   ```powershell
   python -m http.server 5500 --directory public
   ```

3. 在瀏覽器開啟 **http://localhost:5500**。
4. 點擊「開始挑戰」，輸入暱稱、選擇類別和難度，進入十題問答；每題自動倒數 20 秒，逾時記為 0 分。完成後可查看結果並重玩。
5. 以 `Ctrl + C` 停止伺服器。

**注意：** 使用 HTTP 伺服器而非直接開啟 `index.html` 的 `file://` 路徑，因為前端使用 ES Modules 與 `fetch()` 讀取 JSON。若 5500 埠被佔用，可改用其他埠。**本節啟動的是前端示範遊戲，與下方 Express API 分開，並不會自動串接。**

### v0.4.0 Express 後端啟動流程（歷史方式；目前版本請參閱 v0.5.0）

在專案根目錄執行（首次使用或更新依賴後）：

```powershell
npm ci
npm test
npm start
```

- 使用瀏覽器測試健康檢查：`http://127.0.0.1:3000/api/health`。
- 預期 JSON：`{"status":"ok","version":"v0.4.0","persistence":"memory"}`。
- 其他 API 端點須使用合適的 HTTP 方法與 JSON Body；**不能只用網址列測試 POST**。詳細範例與回傳資料見 [API_DESIGN.md](docs/API_DESIGN.md)。
- 可使用 `npm run dev` 啟動 watch 模式；依設定，伺服器只監聽本機 `127.0.0.1:3000`（可透過環境變數 `PORT` 調整）。
- **v0.4.0 當時**按 `Ctrl + C` 停止服務後，重新啟動會遺失記憶體場次；**v0.5.0 已改為 SQLite 持久化**，新版本請依下一節操作。

### v0.4.0 API 速查

| 方法 | 端點 | 用途 |
| --- | --- | --- |
| `GET` | `/api/health` | 健康檢查、版本與儲存模式 |
| `GET` | `/api/config` | 公開類別、難度、題數、時間與分數設定 |
| `POST` | `/api/games` | 依暱稱、類別、難度建立場次，取得第一題 |
| `GET` | `/api/games/:id` | 讀取場次目前狀態與可公開題目／回饋 |
| `POST` | `/api/games/:id/answers` | 提交選項索引，伺服器驗證期限與正確性 |
| `POST` | `/api/games/:id/next` | 作答／逾時後進入下一題，或完成結算 |

建立場次的 Body 例如：`{"player":"玩家","category":"technology","difficulty":"easy"}`；提交答案的 Body 例如：`{"chosenIndex":1}`。成功建立場次回傳 `201`，其餘主要成功查詢與操作回傳 `200`；錯誤由 HTTP 狀態與 `error.code` 辨識。

### v0.5.0 SQLite 後端啟動與資料檔

- **需求：Node.js >= 22.13.0**（專案本機測試為 v24.15.0）、npm 及 Express 依賴。從專案根目錄執行：

  ```powershell
  npm ci
  npm test
  npm start
  ```

- 開啟 `http://127.0.0.1:3000/api/health`，預期回傳 `{"status":"ok","version":"v0.5.0","persistence":"sqlite"}`。`npm start` 需要保持執行；發送 `Invoke-RestMethod` 請求時請使用**另一個終端機**，不能在同一終端機停止服務後再測試。
- 預設資料庫：`data/quiz-arena.sqlite`；若需改位置，啟動前設定 `QUIZ_DB_PATH`。**不要把實際 `.sqlite` 資料庫、`node_modules/` 或 `data/` 的使用者資料提交至 GitHub**；也不要隨意刪除可能含有效紀錄的資料檔。
- `node:sqlite` 隨 Node.js 提供，無需另行安裝 `better-sqlite3` 或 `sqlite3` 套件；`npm ci` 仍負責安裝 Express 等 npm 依賴。若啟動主控台仍出現「Quiz Arena v0.4.0 API」字樣，那是 `server/index.mjs` 的**舊版文字標示**；以 `/api/health` 回傳的版本與儲存模式辨識正在執行的服務。
- **v0.5.0 當時**可以用 `python -m http.server 5500 --directory public` 單獨執行前端，當時不會把遊戲成績寫入 SQLite；**v0.6.0 已改為由 Express 提供前端頁面及 API，正式遊戲入口是 3000 埠**。

### v0.5.0 CRUD 與歷史成績端點

| HTTP 方法 | 端點 | 結果／限制 |
| --- | --- | --- |
| `GET` | `/api/health` | 回傳版本 `v0.5.0`、儲存模式 `sqlite` |
| `GET` | `/api/config` | 遊戲類別、難度、題數、時間、分數設定 |
| `POST` | `/api/games` | 建立遊戲並持久化場次，回傳 `201` |
| `GET` | `/api/games/:id` | 讀取持久化場次 |
| `POST` | `/api/games/:id/answers` | 伺服器驗證後保存作答 |
| `POST` | `/api/games/:id/next` | 更新題目進度，完成後保存成績 |
| `DELETE` | `/api/games/:id` | 刪除未完成場次，成功回傳 `204`；已完成場次不可刪除 |
| `GET` | `/api/scores?limit=20` | 讀取歷史成績列表，`limit` 為 1–100 |
| `GET` | `/api/scores/:id` | 讀取指定完成場次的結果與回顧 |

以上為 API 介面與主要用途；詳細資料模型、例外及測試邊界請參閱 `docs/SQLITE_DESIGN.md`。

### 執行自動化測試

在專案根目錄執行：

```powershell
node --test tests/*.test.mjs
```

分開執行：

```powershell
node --test tests/quiz-data.test.mjs
node --test tests/quiz-engine.test.mjs
node --test tests/quiz-timer.test.mjs
node --test tests/quiz-timeout.test.mjs
node --test tests/api-service.test.mjs
node --test tests/api-http.test.mjs
```

v0.3.0 的歷史驗收為 **24/24**；v0.4.0 累計 **40/40**；v0.5.0 累計 **53/53**；v0.6.0 新增 API Client 6 項與 HTTP 整合 1 項，開發者於 Windows 本機執行 `npm test` 得到 **`tests 60`、`pass 60`、`fail 0`**。HTTP 整合測試需要先安裝 Express 依賴；單元／整合測試不等於完整的多裝置、資安或實際資料備份驗收。

## 7. 測試與品質狀態

| 階段 | 已執行的驗證 | 結果／界線 |
| --- | --- | --- |
| v0.1.0 | 網站載入、靜態資源、首頁與設定互動、返回、基本 RWD 人工檢查 | 開發者回報沒有阻礙操作的問題 |
| v0.2.0 Stage 1 | 題庫完整性、類別／難度、唯一性、參數防護、抽題等 7 項 Node.js 測試 | 7 / 7 通過；不代表題目內容已逐題查證 |
| v0.2.0 Stage 2 | 遊戲進度、計分、防重複提交與結算等 7 項 Node.js 測試 | 7 / 7 通過；合計 14 / 14 |
| v0.2.0 瀏覽器 | 開發者回報完成單人問答及結果頁面操作驗收 | 未發現主要異常；尚非跨瀏覽器全覆蓋測試 |
| v0.3.0 計時器 | 6 項截止時間、背景延遲、停止與重啟等單元測試 | 6 / 6 通過 |
| v0.3.0 逾時流程 | 4 項未作答、重複提交、分數與結果混合測試 | 4 / 4 通過；全專案合計 24 / 24 |
| v0.3.0 瀏覽器 | 開發者回報倒數、逾時、換題與重玩操作正常 | 人工驗收回報；尚非跨瀏覽器或安全測試 |
| v0.4.0 場次服務 | 11 項伺服器端場次、逾時、驗證、限制與結算測試 | 11 / 11 通過 |
| v0.4.0 HTTP API | 5 項路由合約、狀態碼與錯誤回應整合測試 | 5 / 5 通過；累計 **40 / 40** |
| v0.4.0 本機手動 | `npm start` 及 `/api/health` | 當時實際回傳 `status: ok`、`version: v0.4.0`、`persistence: memory` |
| v0.5.0 SQLite 儲存 | 10 項持久化、重啟、逾時、成績及資料生命週期測試 | 10 / 10 通過 |
| v0.5.0 SQLite HTTP | 3 項 API 合約及錯誤處理測試 | 3 / 3 通過；累計 **53 / 53** |
| v0.5.0 本機手動 | `npm start` 及瀏覽器 `/api/health` | 回傳 `status: ok`、`version: v0.5.0`、`persistence: sqlite`；額外手動 `/api/config` 與跨重啟驗收未完成 |
| v0.6.0 API Client | 6 項 HTTP 封裝／回應與錯誤處理測試 | 6 / 6 通過 |
| v0.6.0 HTTP 整合 | 1 項 Express 前端路由／受控資源測試 | 1 / 1 通過；全專案累計 **60 / 60** |
| v0.6.0 本機遊戲 | 使用者回報整合後的瀏覽器遊戲操作正常 | 已有人工回報；未提供跨瀏覽器、自動化完整 E2E 或效能證據 |

**仍待驗證／改善：** 排行榜、完整題庫資料隔離與資安審查、SQLite 備份／還原及多程序併發、登入權限與公開部署安全、跨瀏覽器／裝置驗收、完整 E2E 測試，以及 `/api/health` 版本字串修正。60 項測試通過不等於「100% 無 Bug」。

## 8. Roadmap（漸進式里程碑）

| 版本 | 開發目標 | 狀態 |
| --- | --- | --- |
| v0.1.0 | 首頁、遊戲設定及基本 RWD | 已完成 |
| v0.2.0 Stage 1 | 120 題題庫、驗證與抽題 | 已完成 |
| v0.2.0 Stage 2 | 單人十題問答、計分及結算 | 已完成 |
| v0.3.0 | 20 秒倒數、逾時判定與計時狀態清理 | 已完成（前端） |
| v0.4.0 | Node.js / Express REST API、伺服器端場次、期限及計分 | 已完成（獨立 API；尚未整合前端） |
| v0.5.0 | SQLite 場次／答題／歷史成績持久化及 CRUD API | 已完成（獨立後端；前端尚未整合） |
| v0.6.0 | 後端驗證、API 與前端正式整合 | **已完成（本機全端原型）** |
| v0.7.0 | 排行榜、錯誤處理與品質強化 | 待開發 |
| v1.0.0 | MVP 整合驗收及發布 | 待開發 |

**版本標籤說明：** 以上版本表示程式開發里程碑；目前不代表每個版本已建立 GitHub Release 或 Git Tag。

## 9. 版本管理與開發紀錄原則

每個可驗證的功能增量遵循「需求 → AI 輔助實作 → 本機測試／除錯 → Code Review → Git Commit → GitHub Push → 文件更新」流程。功能與文件可拆成獨立、有意義的 Commit，但不為湊次數而建立空白變更。

- **README.md：** 展示最新可執行方式、實作狀態、主要版本的功能積累及入口。
- **CHANGELOG.md：** 集中整理各版本「新增、調整、驗證、限制」，不複製完整測試過程。
- **docs/DEVLOG.md：** 按實際開發日期詳細紀錄目標、檔案、除錯、驗收與對應 Commit。
- **Git History：** 提供每次 Commit 的真正檔案版本與時間；不需要建立多個 `README_vX.md`。

建議採 Conventional Commits，例如 `feat:`、`fix:`、`test:`、`docs:`、`refactor:`；日期與測試結果以實際紀錄為準。

## 10. 文件導覽

- [MVP 產品需求與驗收標準](docs/PRD.md)
- [開發日誌（DEVLOG）](docs/DEVLOG.md)
- [版本變更紀錄（CHANGELOG）](CHANGELOG.md)
- [題庫設計及抽題規則](docs/QUESTION_BANK_DESIGN.md)
- [v0.2.0 Stage 2 技術實作](docs/STAGE2_IMPLEMENTATION.md)
- [v0.3.0 計時器與逾時設計](docs/TIMER_DESIGN.md)
- [v0.4.0 REST API 契約與場次設計](docs/API_DESIGN.md)
- [v0.5.0 SQLite Schema、CRUD 與持久化設計](docs/SQLITE_DESIGN.md)
- [v0.6.0 前後端整合設計](docs/FRONTEND_BACKEND_INTEGRATION.md)

## 11. 最近開發更新

| 日期 | 開發工作 | 相關 Git Commit |
| --- | --- | --- |
| 2026-10-15 | 規劃 MVP 產品需求與驗收基準 | 後續文件初始化提交 |
| 2026-10-17 | 建立 GitHub Repository 與 PRD、README 等文件 | [`5c1af5a`](https://github.com/Chiou-Jiakang/quiz-arena/commit/5c1af5a) |
| 2026-10-17 | v0.1.0 首頁與設定、人工驗收及文件更新 | [`a26df7d`](https://github.com/Chiou-Jiakang/quiz-arena/commit/a26df7d)、[`7e5f0f0`](https://github.com/Chiou-Jiakang/quiz-arena/commit/7e5f0f0) |
| 2026-10-17 | v0.2.0 Stage 1：題庫與抽題模組 | [`5abee22`](https://github.com/Chiou-Jiakang/quiz-arena/commit/5abee22) |
| 2026-10-18 | v0.2.0 Stage 2：遊戲流程、計分、結算及測試 | [`7cc94e2`](https://github.com/Chiou-Jiakang/quiz-arena/commit/7cc94e2) |
| 2026-10-18 | 合併 v0.1.0–v0.2.0 中文文件歷程 | [`9288af8`](https://github.com/Chiou-Jiakang/quiz-arena/commit/9288af8) |
| 2026-10-18 | v0.3.0 20 秒計時、逾時處理與 24 項測試 | [`78e6ecf`](https://github.com/Chiou-Jiakang/quiz-arena/commit/78e6ecf) |
| 2026-10-18 | v0.3.0 文件累積更新 | [`2c01fd9`](https://github.com/Chiou-Jiakang/quiz-arena/commit/2c01fd9) |
| 2026-10-18 | v0.4.0 獨立 Express API、伺服器場次、40 項測試 | [`3506200`](https://github.com/Chiou-Jiakang/quiz-arena/commit/3506200) |
| 2026-10-18 | v0.4.0 累積式文件更新 | [`316b7f8`](https://github.com/Chiou-Jiakang/quiz-arena/commit/316b7f8) |
| 2026-10-18 | v0.5.0 SQLite 場次／成績持久化、CRUD API、53 項測試 | [`eb5cb6a`](https://github.com/Chiou-Jiakang/quiz-arena/commit/eb5cb6a) |
| 2026-10-18 | v0.5.0 累積式文件更新 | [`425acd6`](https://github.com/Chiou-Jiakang/quiz-arena/commit/425acd6) |
| 2026-10-18 | v0.6.0 前端 API Client、Express 靜態入口、60 項測試 | [`fb97364`](https://github.com/Chiou-Jiakang/quiz-arena/commit/fb9736406e753d1845f1737c9ccba9a7d15aec71) |

最新文件更新的 Commit 將於成功提交後出現在 Git 歷史中；本文件不預先填寫尚未產生的 SHA。

## 12. 下一階段：v0.7.0

下一階段 **v0.7.0** 將建立排行榜與必要的分數排序規則，改善 API 例外／重試提示、可及性、題庫資料保護與測試覆蓋，並修正健康檢查版本字串。之後 **v1.0.0** 再依 PRD 執行完整 MVP 驗收、部署及安全檢查；在此之前不可將目前本機原型稱作正式營運版本。

---

**Repository：** https://github.com/Chiou-Jiakang/quiz-arena

**Current Milestone：** v0.6.0（Frontend + Express API + SQLite Integrated Prototype）
**Project Status：** Active Development

**Last Updated：** 2026-10-18
