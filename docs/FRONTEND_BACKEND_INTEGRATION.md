# Quiz Arena v0.6.0 — Frontend & Backend Integration

## 開發目標

將 v0.3.0 的前端 UI 與 v0.5.0 的 Express / SQLite 後端真正連接，**由伺服器持有答題結果、截止時間和計分狀態**。不更改既有 120 題內容、原有後端 REST API 資料契約及 SQLite Schema。

## 資料流

1. 透過 `npm start` 啟動唯一入口 `http://127.0.0.1:3000/`，Express 只提供首頁、CSS、JS 和 `/api`。
2. 玩家輸入暱稱、類別、難度；瀏覽器 `POST /api/games` 建立場次。
3. 伺服器返回場次 ID、題目與四選項、`deadlineAt` / `serverNow`；答題前**不會回傳 `correctIndex` 或解析**。
4. 前端以截止時間顯示倒數；玩家 `POST /api/games/:id/answers` 僅傳 `chosenIndex`，分數與正誤全部由伺服器判定。
5. 回饋後 `POST /api/games/:id/next` 進入下一題或結算。逾時由 `GET /api/games/:id` 觸發同步判定，20 秒期限不依賴前端計時器的準確性。
6. 十題結束後 SQLite 保存成績，重啟後可使用 `GET /api/scores/:id` 查詢。
7. 瀏覽器重新整理時以 `sessionStorage` 中的場次 ID 恢復，重新讀取 API 狀態；使用「返回首頁」會清除自動恢復標記，但伺服器上未完成的場次仍按 TTL 清理。

## 安全邊界

- 不再以瀏覽器下載 `questions.json` 作為正式題庫；Express **不提供 `/data/questions.json`**。原檔仍留在 Repository 供後端載入，這代表公開 GitHub 原始碼仍可供查看題庫，不是正式保密題庫部署方案。
- 由伺服器端依時間戳判斷逾時並拒絕重複提交；前端倒數僅作視覺提示。
- 仍**不具正式的登入、身份驗證、Rate Limiting 與安全部署能力**。這是本機全端教學版本；任何取得場次 ID 的人可能操作該場次，正式服務需進一步設計權限與風險控制。
- 若瀏覽器在 `npm start` 停止時發送請求，會顯示同步失敗；網路錯誤後以 GET 讀取狀態，而不是盲目重送可能成功的 POST。

## 安裝

將安裝包與專案並排，從原本 `quiz-arena` 根目錄執行：

```powershell
python ..\quiz-arena-v0.6.0-package\install_v0.6.py
npm install
npm test
npm start
```

在瀏覽器開啟 **http://127.0.0.1:3000/**，而不是舊的 Python 5500 伺服器。Node.js 須為 22.13.0 或更新版本。

## 驗收

- `npm test`：原有 53 項 + API 客戶端 6 項 + 同源 HTTP 1 項，預期 **60 項**；需在本機安裝 Express 後執行。
- `GET /api/health`：目前仍回傳 `version: "v0.5.0"`、`persistence: "sqlite"`（保留既有 API 契約與 53 項測試；v0.6.0 指前端整合里程碑）。
- 首頁載入、設定開始、答案鎖定、伺服器回饋、下一題及十題結算。
- 等待超過 20 秒，逾時 0 分、不可補答；每題結束可正確切換。
- 遊戲途中重新整理網頁後恢復場次，不重設伺服器截止期限。
- 重新啟動 Express，透過 `/api/scores` 查詢先前完成成績。
- `http://127.0.0.1:3000/data/questions.json` 應為 404。

## 版本控制

功能與測試可獨立 Commit；確認後再另行更新 README、CHANGELOG、DEVLOG，保留從 v0.1.0 起的完整歷史。SQLite 資料庫、`node_modules`、備份與其他私人資料不要提交。
