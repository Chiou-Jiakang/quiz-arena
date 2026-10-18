# Quiz Arena｜開發日誌（DEVLOG）

此文件保留**開發過程**，以日期／Session 為單位記錄目標、實際檔案、測試、發現問題、處理方式與 Git Commit。不同於 README 的目前產品概況，也不同於 CHANGELOG 的版本差異摘要。

**紀錄原則：** 使用真實日期、實際測試與有效 Git SHA；「預計完成」不能寫成「已通過」，GitHub Commit 只在真正提交成功後填入。回顧舊版時保留當時狀態，並註明後續何時改善，避免用新版結果覆蓋開發過程。

---

## 2026-10-15｜Session 00：MVP 需求與規格制定

### 目標
先定義 Quiz Arena 的產品範圍與驗收基準，避免開發過程中功能任意擴張。

### 決策與成果
- 產品定位：免註冊、暱稱遊玩的單人知識競技 Web Game。
- 視覺風格：深色科技競技場，桌面及手機響應式介面。
- MVP 規則：每場十題、每題 20 秒、四選一、答對 +100、答錯／逾時 +0。
- 題目領域：綜合、科技、科學、歷史、地理；三種難度。
- 系統路線：HTML / CSS / JavaScript → Node.js / Express → SQLite。
- 工程方式：AI 協助生成、人工執行與驗證、定期 Git 提交、中文文件。
- 建立 `docs/PRD.md`，作為未來功能及品質驗收基準。

### 驗證與限制
此 Session 為**規格制定**，未進行遊戲功能測試，也未實作程式碼。後續是否達成 MVP，以 PRD 的驗收標準及實際測試為準。

---

## 2026-10-17｜Session 01：GitHub 與專案初始化

### 目標
在正式開發前建立可追溯的版本歷史與文件結構。

### 實作／操作
- 建立公開 GitHub Repository：`Chiou-Jiakang/quiz-arena`，預設分支 `main`。
- 使用 VS Code 的 Git Clone 將遠端 Repository 複製到本機並加入原有多資料夾工作區。
- 驗證 `git status`、`git remote -v`、`git log`、`pwd`，確認 Repository 路徑與遠端設定。
- 新增／整理 `README.md`、`CHANGELOG.md`、`docs/PRD.md`、`docs/DEVLOG.md` 與 `.gitignore`。
- 完成 Git Commit、Push 與遠端檔案查看，確認遠端歷史更新。

### 測試／問題
- 確認本機分支為 `main`，遠端為正確的 GitHub Repository。
- 曾釐清 VS Code 多資料夾工作區與實際檔案路徑並非同一概念；避免在其他專案的終端機操作 Git。
- 專案當時位於 OneDrive 同步桌面下；尚未發生已確認的同步損壞，但未來若有 SQLite 或 `node_modules` 同步衝突，需考慮移至非同步路徑。

### Git 紀錄
- [`cda2d3a`](https://github.com/Chiou-Jiakang/quiz-arena/commit/cda2d3a) — `Initial commit`（遠端初始版本）。
- [`5c1af5a`](https://github.com/Chiou-Jiakang/quiz-arena/commit/5c1af5a) — `docs: initialize Quiz Arena MVP requirements`。

---

## 2026-10-17｜Session 02：v0.1.0 首頁與遊戲設定

### 一、本次開發目標
完成 Quiz Arena 第一版前端互動原型，包含深色科技風格首頁、規則資訊與玩家設定畫面，作為之後單機問答的基礎。

### 二、實作內容

**1. 首頁 UI**
- 建立 `public/index.html` 定義語意化版面。
- 建立 `public/css/style.css`，設計品牌視覺、深色背景、卡片、按鈕及基本響應式樣式。
- 加入 Quiz Arena 主標題、介紹、遊戲規則與三步驟操作流程。
- 加入「開始挑戰」與「遊戲規則」入口。

**2. 遊戲設定**
- 提供玩家暱稱（必填、1–20 字元）輸入。
- 提供綜合知識、科技、科學、歷史、地理選單，以及簡單、中等、困難難度選單。
- 顯示每局 10 題、每題 20 秒、答對 100 分等**目標規格**；當時尚未實作計時器。
- 提供設定確認與返回首頁功能。

**3. JavaScript 互動**
- 建立 `public/js/app.js`，以 DOM 操作及事件監聽器切換首頁／設定頁。
- 表單提交後，顯示玩家暱稱、類別與難度的設定結果。

### 三、測試與驗收
**測試環境：** Windows、VS Code、PowerShell、Python HTTP Server 及瀏覽器。

- `python -m http.server 5500 --directory public` 可正常提供網站。
- HTML、CSS、JavaScript 靜態檔案載入成功；首頁視覺正常顯示。
- 「開始挑戰」能進入設定，暱稱與選單可操作。
- 確認設定後正確顯示選擇結果，返回首頁正常。
- 開發者回報基本響應式檢查未發現明顯跑版。

**驗收結論：** v0.1.0 核心互動通過人工驗收；這不代表已經有正式遊戲系統或完整自動化測試。

### 四、發現問題與改善

**問題 A：確認設定後回饋不明顯。** 當時只在按鈕下方顯示一行訊息，容易被誤認為未執行。原因是 v0.1.0 尚無問答頁；**於 v0.2.0 Stage 2 改為進入真正的問答流程**。

**問題 B：缺少 favicon。** 本機曾出現 `/favicon.ico` HTTP 404；不影響頁面主要功能，仍是後續可補強的 UI 細節。

**工具操作：** 曾因 `git diff` 開啟分頁檢視器出現 `(END)`，後確認以 `q` 離開；另外 Windows 的 LF/CRLF 提示屬換行格式提醒，當時並非功能錯誤。

### 五、GitHub 紀錄
- [`a26df7d`](https://github.com/Chiou-Jiakang/quiz-arena/commit/a26df7d) — `feat: implement Quiz Arena homepage and game setup`。
- [`7e5f0f0`](https://github.com/Chiou-Jiakang/quiz-arena/commit/7e5f0f0) — `docs: document v0.1.0 features and test results`。
- 功能與文件分成兩筆 Commit，便於檢視實作和測試文件的不同目的。

### 六、下一步（當時規劃）
先完成題庫與抽題，再接入十題單人問答；此規劃已在下列 v0.2.0 Session 實作。

---

## 2026-10-17｜Session 03：v0.2.0 Stage 1 題庫及抽題模組

### 一、本次目標
建立可獨立驗證的題庫資料與抽題函式，避免直接將 UI、題目內容及遊戲狀態寫在同一個檔案。

### 二、修改檔案及設計決策
- `public/data/questions.json`：建立 120 道題目，四類別 × 三難度 × 每組十題。
- `public/js/quiz-data.mjs`：新增格式檢查、類別難度篩選、Fisher–Yates Shuffle、不重複抽取。
- `tests/quiz-data.test.mjs`：加入題庫結構、資料量、抽題、邊界案例的七組單元測試。
- `docs/QUESTION_BANK_DESIGN.md`：說明題目 Schema、抽題方式、設計限制與後端遷移方向。

**關鍵設計：** `mixed` 是跨四類的篩選模式，不儲存重複的「綜合題庫」；`correctIndex` 以 0–3 表示四個答案。題庫不足十題時拒絕抽題，不重複使用同題湊滿。

### 三、測試
在 Quiz Arena 根目錄執行：

```powershell
node --test tests/quiz-data.test.mjs
```

結果為 **7 tests、7 passed、0 failed**。測試涵蓋 120 題結構、15 種類別／難度組合、抽題唯一性、洗牌不修改原題庫、數量不足、無效參數與資料格式錯誤。

### 四、限制與後續改進
- 每種單一類別／難度目前只有十題，順序可隨機但題目集合相同；後續可逐步擴充題量。
- 題庫 Schema 通過測試，不等於 120 題事實內容已完成外部權威來源審校。
- 此階段尚未接入前端遊戲畫面，因此 Stage 1 不能單獨宣告「完整遊戲已完成」。

### 五、GitHub 紀錄
- [`5abee22`](https://github.com/Chiou-Jiakang/quiz-arena/commit/5abee22) — `feat: add validated multi-category question bank`。
- `main` 分支已推送並確認可於遠端查看。

### 六、下一步（當時規劃）
將題庫模組連至 v0.1.0 的選單和問答畫面；此步驟已由 Stage 2 完成。

---

## 2026-10-18｜Session 04：v0.2.0 Stage 2 單人問答、計分與結算

### 一、本次目標
將既有首頁、設定與 Stage 1 題庫串成可以完成一場十題遊戲的前端流程，同時將核心計分邏輯獨立成可測試的模組。

### 二、變更檔案
- 修改 `public/index.html`：加入問答進度、四個選項、作答回饋、結算及逐題回顧區塊，使用 ES Modules。
- 修改 `public/css/style.css`：加入問答、選項狀態、得分、進度與結算畫面的響應式樣式。
- 修改 `public/js/app.js`：以 `fetch()` 取得題庫資料，整合設定、題目呈現、答題、下一題與完成畫面。
- 新增 `public/js/quiz-engine.mjs`：管理遊戲狀態、得分、完成判定與防止重複計分。
- 新增 `tests/quiz-engine.test.mjs`：七項遊戲邏輯測試。
- 新增 `docs/STAGE2_IMPLEMENTATION.md`：設計範圍、限制及驗收要點。

### 三、主要功能成果
- 設定暱稱、類別與難度後可進入十題問答。
- 題目顯示四個選項；答對 +100、答錯 +0，作答後鎖定並顯示正解與解析。
- 顯示進度、分數及下一題操作；第十題結束後顯示總分、正確率和逐題回顧。
- 支援相同設定重新挑戰及返回首頁。

### 四、自動化與人工測試
在本機執行：

```powershell
node --test tests/*.test.mjs
```

結果為 **14 tests、14 passed、0 failed**（包含 Stage 1 題庫七項與 Stage 2 遊戲邏輯七項）。

開發者另回報已於瀏覽器完成遊戲操作，暫未發現阻礙核心流程的問題；已提交畫面與終端機測試結果供檢查。這不等於跨瀏覽器完整測試，也未執行伺服器整合或正式安全驗證。

### 五、已知限制及風險
- **計時尚未實作：** PRD 規定每題 20 秒，v0.2.0 暫時不限時；逾時得 0 分尚待 v0.3.0。
- **無持久化：** 成績與進度僅在網頁記憶體，重新整理或離開後不保留。
- **無正式防作弊：** 正確答案包含於前端 JSON；之後需改為後端持有答案並計分。
- **資料與範圍：** SQLite、Express API、正式排行榜、登入皆未完成；題庫文字仍須逐題審校。

### 六、GitHub 紀錄
- [`7cc94e2`](https://github.com/Chiou-Jiakang/quiz-arena/commit/7cc94e2) — `feat: implement single-player quiz gameplay`。
- 功能程式與測試已 Push 至 `main`；本次 README／CHANGELOG／DEVLOG 更新將另以 `docs:` Commit 提交。**其 SHA 需待實際提交完成後再補充，不應預填。**

### 七、下一階段
v0.3.0 目標是加入每題 20 秒倒數、逾時判定、切題與重新挑戰的計時器清理機制，並補充計時邊界測試；伺服器端截止時間驗證將留待 Express 整合階段。

---

## 2026-10-18｜Session 05：v0.3.0 計時系統、逾時處理與瀏覽器驗收

### 一、開發目標
在 v0.2.0 十題單人問答基礎上，落實 PRD 規定的「每題 20 秒，時間到視為答錯且不計分」，並確保作答後、下一題、離開與重新挑戰不會有舊計時器干擾遊戲狀態。此階段仍限前端單機功能，不預先宣稱具備伺服器防作弊能力。

### 二、安裝流程與版本基線
- 開發時以 `main` 上的第七筆 Commit `9288af8` 為 v0.2.0 基線；安裝前確認既有 Git 追蹤檔案沒有未提交變更。
- 將 `quiz-arena-v0.3.0` 安裝包放在原本 `quiz-arena` 專案**同層**，由原專案根目錄執行：

  ```powershell
  python ..\quiz-arena-v0.3.0\install_v0.3.py
  ```

- 安裝程式回報成功，並在專案同層建立 `quiz-arena-v0.3.0-before-upgrade` 原始檔案備份。
- 安裝未更動 README、CHANGELOG、DEVLOG；保留功能／測試 Commit 與文件 Commit 的分工。

### 三、程式修改與模組責任
- `public/index.html`：補充計時器數字、視覺計時區與對應提示，版本標示更新。
- `public/css/style.css`：新增倒數進度、最後五秒警示及問答畫面的相關顯示樣式。
- `public/js/quiz-timer.mjs`（新增）：以 `performance.now()` 建立單調截止時間；支援 `start()`、`stop()`、`tick()`、`remainingMs()`、`isExpired()`，並允許注入時鐘及排程回呼以利測試。
- `public/js/quiz-engine.mjs`：保留原本 `submitAnswer()`，新增 `submitTimeout()`，逾時記錄 `chosenIndex: null`、`timedOut: true`、`correct: false`，不加分；結算提供逾時數量及逐題標記。
- `public/js/app.js`：整合每題計時器、答題前截止時間檢查、作答鎖定、逾時回饋、下一題重設及退出／重玩時清理，同時處理舊題庫載入結果晚到的風險。
- `tests/quiz-timer.test.mjs`（新增 6 項）：開始倒數、截止時間、背景延遲、只觸發一次、停止及重啟等測試。
- `tests/quiz-timeout.test.mjs`（新增 4 項）：逾時 0 分、禁止重複提交、作答後不得被逾時覆寫、混合結果結算等測試。
- `docs/TIMER_DESIGN.md`（新增）：說明時間模型、流程、設計邊界和人工驗收項目。

### 四、重要設計決策
**為什麼不直接每秒減一？** 瀏覽器分頁背景執行時 `setInterval()` 可能被延遲，如果只依回呼次數扣秒，實際已過 20 秒仍可能顯示剩餘時間。新模組將截止時間設為「開始時的單調時間 + 20,000 ms」，每次更新和作答操作重新計算剩餘時間。

**為什麼獨立模組？** 題目狀態與計時排程具有不同責任。遊戲引擎純函式負責「正確、錯誤、逾時、分數」，計時器負責「時間與單次逾時通知」，UI 負責畫面更新和生命週期，便於單獨測試、避免互相覆寫。

**逾時回饋規則：** 時間到後鎖定四個選項、顯示正解與解析，該題 0 分；回饋頁不再倒數，按下一題才重新給 20 秒。第十題後顯示逐題結算，逾時與主動答錯可以區分。

### 五、測試證據與驗收結論
**測試環境：** Windows、VS Code、PowerShell、Node.js、Python 靜態 HTTP Server 與網頁瀏覽器。

執行全部測試：

```powershell
node --test tests/*.test.mjs
```

**實際結果（2026-10-18）：** `tests 24`、`pass 24`、`fail 0`、`cancelled 0`、`skipped 0`、`todo 0`；終端機回報執行時間約 **121.64 ms**。

| 測試群組 | 測試數 | 結果 |
| --- | ---: | --- |
| 原題庫驗證與抽題 | 7 | 通過 |
| 原單機答題、計分與結算 | 7 | 通過 |
| 新增題目計時器 | 6 | 通過 |
| 新增遊戲逾時狀態 | 4 | 通過 |
| **合計** | **24** | **24 通過、0 失敗** |

開發者另於瀏覽器完成實際計時遊玩測試，回報目前操作正常，並決定進入 GitHub 提交階段。這屬於本機人工驗收結果，不代表已完成完整跨瀏覽器、自動化端到端測試或安全稽核。

### 六、已知限制與後續改善
- 前端判定可由開發者工具修改，不具有正式防作弊能力。完整 MVP 須在 Express 後端建立可信截止時間、答案驗證與分數計算。
- 瀏覽器睡眠、分頁凍結時，JavaScript 無法即時更新 UI；恢復時進行補判。
- 重新整理或離開會丟失未儲存進度，SQLite 題庫／場次／成績資料持久化仍待後續版本。
- 尚需更廣泛的跨瀏覽器、手機窄版、無障礙、例外路徑與資料內容審校測試。

### 七、GitHub Commit 與狀態
- [`78e6ecf`](https://github.com/Chiou-Jiakang/quiz-arena/commit/78e6ecf) — `feat: implement 20-second quiz timer and timeout handling`。
- 該筆已由使用者執行 `git push origin main`，並以 `git status`、`git log -3 --oneline` 及 GitHub 網頁的 **8 Commits** 驗證遠端同步。
- 本次 v0.3.0 文件整合預定為**第九筆** `docs:` Commit；在實際成功提交前不填寫其 SHA。
- 本機先前仍有未追蹤 `STAGE2_README.txt` 臨時安裝說明；它未包含在功能 Commit 中，也不應混入文件 Commit。

### 八、下一階段
進入 v0.4.0：規劃並建立 Node.js / Express REST API、統一輸入驗證與錯誤回傳；後續將 SQLite 與伺服器端限時答案驗證分階段整合。為兼顧回歸測試，應保留現有題庫與計分單元測試，並逐步加入 API 測試。

---

## 2026-10-18｜Session 06：v0.4.0 Express REST API 與伺服器端場次驗收

### 一、開發目標與版本邊界
由 v0.3.0 的純前端限時問答逐步過渡到真正的全端系統。本階段優先建立**可獨立啟動及測試的後端 API**，把場次狀態、答題截止時間和計分規則移入服務層；為降低回歸風險，暫時不修改現有可運作的前端遊戲。

**里程碑範圍：** v0.4.0 建立 Express REST API 與暫存於記憶體的場次；v0.5.0 導入 SQLite，v0.6.0 才正式將網頁切換成透過 API 遊玩。因此本階段不能宣稱「已完成前後端整合」或「已具完整防作弊」。

### 二、程式碼與目錄變更

| 檔案／目錄 | 本次用途 |
| --- | --- |
| `package.json` | 設定 ES Modules、Node.js >= 20、Express 依賴及 `start`、`dev`、`test` 腳本 |
| `package-lock.json` | 記錄套件解析與鎖定依賴，利於日後重新安裝 |
| `server/index.mjs` | 讀取題庫、建立服務，並監聽本機 `127.0.0.1:3000` |
| `server/app.mjs` | 設定 Express JSON 路由、狀態碼、錯誤格式與 16 KB Body 上限 |
| `server/game-service.mjs` | 不依賴 HTTP 的場次管理、題目抽取、截止時間、答案驗證與計分 |
| `tests/api-service.test.mjs` | 11 項伺服器核心邏輯及邊界測試 |
| `tests/api-http.test.mjs` | 5 項實際 HTTP 請求／回應合約測試 |
| `docs/API_DESIGN.md` | 記錄端點、場次階段、JSON 契約與限制 |

原有 `public/` 前端、四種前端測試及 v0.1.0–v0.3.0 歷史文件在功能 Commit 中未更改，繼續作為回歸基準。

### 三、API 設計與伺服器端遊戲流程

**HTTP 端點**

| HTTP | 路徑 | 功能 |
| --- | --- | --- |
| `GET` | `/api/health` | 回傳 `status`、版本與儲存方式 |
| `GET` | `/api/config` | 公開類別、難度、題數、時限與計分規則 |
| `POST` | `/api/games` | 驗證 `{player, category, difficulty}`，建立 UUID 場次及第一題 |
| `GET` | `/api/games/:id` | 查看場次狀態，依階段提供當前題目、回饋或結算 |
| `POST` | `/api/games/:id/answers` | 接收 `{chosenIndex}`（0–3），檢查期限及判分 |
| `POST` | `/api/games/:id/next` | 僅於回饋階段進入下一題；第十題後返回完成結果 |

`game-service.mjs` 以 `Map` 保存場次，具備 `answering`、`feedback`、`finished` 三個階段。建立時依類別與難度抽十道不重複題目，使用 `randomUUID()` 產生場次 ID，設定每題 `deadlineAt = now() + 20_000`。在作答或讀取狀態時檢查伺服器時間；逾時則記錄 `chosenIndex: null`、`timedOut: true`、得分不變，進入回饋狀態。正常答對加 100，答錯加 0，不接受重複提交。

在 `answering` 階段的 API 回應，題目只公開 `id`、`question`、`options`、`category`、`difficulty`，不附正解索引或解析；提交之後的 `feedback` 才回傳正解及解析。完整十題後，`result` 包含總分、答對題數、逾時題數、正確率及逐題回顧。

**錯誤處理及暫存策略**
- 非法設定或選項使用 `400`；未知場次使用 `404`；階段不符、重複提交或逾時補交使用 `409`；題庫不足可回傳 `422`；容量達上限可回傳 `503`。
- API 使用統一格式 `{"error":{"code":"...","message":"..."}}`，對格式錯誤 JSON 和過大請求也有對應回應。
- 預設最多 500 個記憶體場次；最後互動超過 1 小時的場次，於後續服務操作時被清理。**不是定時背景清除，也不是資料庫。**

### 四、本機安裝與驗證證據

**工作環境：** Windows、VS Code、PowerShell、Node.js/npm；使用先前可正常運作的 v0.3.0 專案作為升級基底。新增程式透過 v0.4.0 安裝包加入，原有前端未被覆蓋。

先於專案根目錄執行 `npm install`，再執行：

```powershell
npm test
```

**開發者提供的測試畫面結果：** `tests 40`、`pass 40`、`fail 0`、`cancelled 0`、`skipped 0`。組成如下：原有題庫／單機遊戲 14 項、計時／逾時 10 項、API 場次服務 11 項、HTTP 路由整合 5 項。測試使用 Node.js 內建 `node:test`，HTTP 整合測試需 Express 安裝成功。

再執行：

```powershell
npm start
```

終端機顯示 `Quiz Arena v0.4.0 API: http://127.0.0.1:3000/api/health`，並提示資料只存於記憶體。瀏覽器實際開啟該端點，得到：

```json
{"status":"ok","version":"v0.4.0","persistence":"memory"}
```

**驗收界線：** 40 項既定測試與健康檢查通過，支持本機獨立 API 運作；尚不能證明部署安全、實際多人同時使用性能，或瀏覽器遊戲已經改走後端 API。

### 五、設計上的取捨與待解問題
- **前後端暫時分離：** `npm start` 提供後端 HTTP API，既有頁面仍由 Python HTTP Server 提供並在瀏覽器判分。這是分階段交付，不是遺漏啟動步驟。
- **公開題庫風險：** API 回應在作答前不洩漏正解，但 `public/data/questions.json` 本身仍可公開下載；v0.6.0 正式串接前應重新設計題庫來源與前端資料流。
- **持久化不足：** 記憶體 `Map` 的場次在伺服器重啟後消失；須於 v0.5.0 引入 SQLite Schema、約束、初始化與儲存層測試。
- **錯誤與安全：** 尚未完成正式部署權限、負載限制、跨來源整合及可用性評估；題庫內容亦須後續逐題審校。
- **進度指標：** v0.1.0、v0.2.0、v0.3.0、v0.4.0 四個功能里程碑已完成；後續 v0.5.0–v1.0.0 尚待開發，里程碑數量不是工時完成比例。

### 六、GitHub 與版本管理
- 本階段功能 Commit：[`3506200`](https://github.com/Chiou-Jiakang/quiz-arena/commit/3506200) — `feat: implement Express REST API and server-side game sessions`。
- 開發者已於 GitHub 主頁確認 Repo 顯示 **10 Commits**，並看到 `server/`、`tests/`、`package.json`、`package-lock.json` 及 API 文件更新。
- 本次 README、CHANGELOG、DEVLOG 的 v0.4.0 文件增補預定作為**第十一筆** `docs:` Commit，實際 SHA 在提交成功前不預填。
- 本機原有 `STAGE2_README.txt` 屬未追蹤的舊安裝說明，不應加入正式 v0.4.0 文件 Commit；`node_modules/` 不納入 Git，而 `package-lock.json` 已隨功能 Commit 提交。

### 七、下次開發安排
進入 **v0.5.0 SQLite 與 CRUD**：制定資料表 Schema 與索引、匯入／驗證題庫、設計後端儲存層、處理連續寫入與狀態一致性，並補充資料庫初始化、持久化、重啟及錯誤情境測試。完成後進入 v0.6.0，將前端遊戲與受伺服器控制的場次及答案驗證正式串接。

---

## 2026-10-18｜Session 07：v0.5.0 SQLite Database、CRUD 與持久化驗收

### 一、本次目標與前置狀態
- 承接 v0.4.0 已有的獨立 Express API。v0.4.0 的遊戲資料僅存於伺服器 `Map`，重新啟動會遺失；本階段要將場次、題目快照、作答及結果轉為 SQLite 持久化，且保留原有 HTTP 契約。
- 以「獨立後端可持久化」作為 v0.5.0 驗收邊界；**不宣稱前端已透過 API 操作資料庫**。前後端整合屬 v0.6.0。
- 不改動先前 v0.1.0～v0.4.0 的歷史測試成果與開發日誌。本階段功能程式與中文文件採不同 Commit 提交。

### 二、使用技術與資料模型
- Node.js 內建 `node:sqlite` 的同步資料庫介面 `DatabaseSync`，要求 Node.js >= 22.13.0；開發者本機為 `v24.15.0`，符合需求。採用內建模組避免額外安裝 Windows 原生 SQLite npm 套件。
- 以資料庫儲存介面分離場次管理邏輯與實際存取，保留記憶體儲存實作供測試或比較；預設 SQLite 檔為 `data/quiz-arena.sqlite`，可用 `QUIZ_DB_PATH` 指定。
- `schema_meta`：管理 Schema 版本；`games`：場次、玩家設定、進度、分數、階段、截止時間等；`game_questions`：十題順序與 JSON 快照；`game_answers`：作答索引、正確與逾時狀態；`results`：完成成績及逐題回顧。
- 啟用外鍵、交易及 WAL，以交易保證一組場次與答案更新的原子性；Schema 自動初始化。儲存時間戳使用伺服器 `Date.now()`，因此系統時鐘變動仍是待評估風險。

### 三、本次程式變更
- 修改 `package.json` 與 `package-lock.json`：更新里程碑版本與相依／工具相關資訊。
- 修改 `server/index.mjs`：建立 SQLite Store 並注入場次服務，讀取既有題庫，啟動本機 API。**已知啟動訊息仍含 `v0.4.0 API` 字樣**，但健康檢查回傳 v0.5.0／sqlite。
- 修改 `server/game-service.mjs`：使用持久化 Store 管理場次及結果，保留後端 20 秒限制、答題判定與原有 API 契約。
- 修改 `server/app.mjs`：加入歷史成績查詢及未完成場次刪除路由，並調整健康檢查儲存模式。
- 新增 `server/sqlite-store.mjs` 與 `server/memory-store.mjs`；新增 `tests/sqlite-store.test.mjs`、`tests/api-sqlite-http.test.mjs`；新增 `docs/SQLITE_DESIGN.md`。
- `.gitignore` 已涵蓋 `*.sqlite`／`*.db` 等資料庫檔案模式，資料檔及使用者資料不納入功能 Commit。

### 四、API 擴充及資料生命週期
- 維持既有六個 API 端點，增加 `GET /api/scores?limit=20`、`GET /api/scores/:id`、`DELETE /api/games/:id`，總計九個。
- `GET /api/scores` 提供完成成績摘要，`limit` 允許 1–100；`GET /api/scores/:id` 讀取指定完成場次回顧。
- `DELETE /api/games/:id` 僅刪除未完成場次，完成成績不允許透過這個 API 刪除。
- 場次和題序保存後，重啟不會重新洗牌，也不會重設該題的 20 秒截止時間；沒有回報請求的停機期間不會執行背景計時，但下一次請求會補判逾時。
- 未完成場次依最後活動時間設 1 小時 TTL，清理由後續 API 存取觸發；已完成的歷史成績獨立保留。

### 五、實際安裝與測試紀錄
**環境：** Windows／VS Code PowerShell，Node.js v24.15.0。

1. 安裝包與原本 `quiz-arena` 專案並排放置，以 `install_v0.5.py` 執行升級；安裝程式回報成功，並在專案同層建立升級前的後端備份。
2. 執行 `npm install`，回報相依套件已安裝且 `0 vulnerabilities`（屬當次 npm 稽核輸出，不代表未來永遠沒有安全漏洞）。
3. 執行 `npm test`：**53 tests、53 passed、0 failed**，執行時間約 641 ms；相較 v0.4.0 的 40 項，增加 10 項 SQLite 儲存測試與 3 項 SQLite HTTP 測試。
4. 測試涵蓋首次建表、資料庫重開、截止時間保持、作答／分數／下一題跨重啟、逾時冪等、結果與回顧永久保存、未完成場次刪除、完成成績保留、TTL 及 limit／未知 ID 的錯誤處理。
5. 執行 `npm start` 後，瀏覽器 `/api/health` 實際顯示 `{"status":"ok","version":"v0.5.0","persistence":"sqlite"}`；因此可確認獨立 API 的健康檢查與 SQLite 模式已正常啟動。

**測試邊界：** 額外手動呼叫 `/api/config` 時曾出現「無法連接至遠端伺服器」，當時 Express 已不在監聽；後續說明需要保留執行 `npm start` 的終端機，再用另一個終端機送請求。該手動呼叫與跨重啟取回同一場次的手動流程未完成，**不能紀錄為手動通過**。跨重啟的資料一致性有自動化測試證據。

### 六、GitHub Commit、工作目錄及資料保護
- 功能、測試與 API 技術文件以 [`eb5cb6a`](https://github.com/Chiou-Jiakang/quiz-arena/commit/eb5cb6a) — `feat: implement SQLite persistence and CRUD APIs` 提交至 `main`，開發者截圖確認 `HEAD`、`main`、`origin/main` 同步。
- 本次準備獨立的第十三筆文件 Commit：更新 README、CHANGELOG、DEVLOG；**新 SHA 必須等實際提交成功後才確認**。
- Git 曾顯示未追蹤的 `data/` 與 `STAGE2_README.txt`。其中 `data/` 可能包含真實 SQLite 執行資料，**不要 `git add data/`、不要整個刪除，也不要上傳至 GitHub**；需要先檢查內含資料及 `.gitignore`，再考慮整理。
- `STAGE2_README.txt` 是早期暫存說明，不屬於正式程式或歷史文件，可保留在本機或確認內容後移出儲存庫。

### 七、已知限制與後續階段
- 雖然 SQLite 會保存後端遊戲場次及歷史成績，但 v0.5.0 的原生網頁遊戲仍直接從公開 JSON 抽題與判定答案，操作前端不會自動產生 SQLite 成績。v0.6.0 才進行真正前後端整合及題庫正解隔離。
- 未實作正式登入、存取授權、限流、對外服務部署級防護、資料備份／還原、多人並行測試及正式排行榜。
- 開發者已通過 53 項自動化測試，不能將其延伸解讀為完整端到端驗收或保證程式沒有 Bug。

---

## 文件與版本治理備註（截至 2026-10-18）

- README 整合 v0.1.0 與 v0.2.0 的**仍有效內容**，作為最新專案入口；不另外保存多份主要 README。
- CHANGELOG 依版本呈現功能差異、測試摘要與歷史限制；DEVLOG 保留各 Session 的原因、方法、問題與 Commit。
- v0.2.0 當時稱為「完成前端單機問答里程碑」；目前已進入 v0.3.0 的「前端限時問答里程碑」。這些均**不是完整 MVP 或 GitHub Release**。
- 本次整理文件不更動 PRD 的 MVP 核心規格，也不修改遊戲功能程式碼。
- v0.3.0 README／CHANGELOG／DEVLOG 以此原始日誌為基底累積；不刪除 Session 00–04 的實際紀錄。

- v0.4.0 已完成獨立 Express REST API 與 40 項測試，但與現有前端尚未整合；第十筆功能 Commit 為 `3506200`。這筆文檔更新只增加 Session 06 與上述版本說明，前面的 Session 00–05 仍完整保留。

### v0.5.0 文件更新說明（2026-10-18）
- 前述 Session 00–06 保留其原始紀錄及當時限制；本次只新增 Session 07、補齊現行 README 的 SQLite 操作說明，並在 CHANGELOG 插入獨立 v0.5.0 變更章節。
- v0.5.0 的場次持久化僅代表**後端已實作**，不應被解讀為前端已經串接資料庫或具備正式防作弊。
- 第十三筆文件 Commit 在 GitHub 真正確認以前，不預填 SHA 或宣稱已上傳。
