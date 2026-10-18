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

## 文件與版本治理備註（截至 2026-10-18）

- README 整合 v0.1.0 與 v0.2.0 的**仍有效內容**，作為最新專案入口；不另外保存多份主要 README。
- CHANGELOG 依版本呈現功能差異、測試摘要與歷史限制；DEVLOG 保留各 Session 的原因、方法、問題與 Commit。
- 目前稱 v0.2.0 為「完成前端單機問答里程碑」，**不是完整 MVP 或 GitHub Release**。
- 本次整理文件不更動 PRD 的 MVP 核心規格，也不修改遊戲功能程式碼。
