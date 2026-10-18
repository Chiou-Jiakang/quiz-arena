# Quiz Arena｜版本變更紀錄（CHANGELOG）

本文件依**開發里程碑**記錄真正已發生的變更，而非每次編輯的流水帳。具體工作流程、測試操作及問題追蹤詳見 [DEVLOG](docs/DEVLOG.md)。日期採專案實際開發紀錄；版本標題**不代表已建立 GitHub Release 或 Git Tag**。

## [Unreleased] — 後續規劃

### Planned
- v0.4.0：建立 Node.js / Express REST API，確立遊戲場次與 API 資料契約。
- v0.5.0 及後續：SQLite、後端答案與截止時間驗證、排行榜及完整 MVP 驗收。

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
