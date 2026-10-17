# Quiz Arena — v0.2.0 題庫設計（子階段 01）

## 範圍

本次僅新增**可供下個子階段整合的題庫與抽題模組**，**不會改動** `public/index.html`、`public/css/style.css`、`public/js/app.js`。現有 v0.1.0 首頁及設定功能保持不變。

## 格式

題庫檔案：`public/data/questions.json`（120 題，UTF-8）。

```json
{
  "id": "tec-e-01",
  "category": "technology",
  "difficulty": "easy",
  "question": "題幹文字",
  "options": ["選項 A", "選項 B", "選項 C", "選項 D"],
  "correctIndex": 0,
  "explanation": "正解說明",
  "enabled": true
}
```

`correctIndex` 是 **0 到 3**，對應 A 到 D；`id` 不隨題目排列變動。`mixed` 是篩選虛擬類別，**沒有獨立存放一份綜合題目**。

| 知識類別             | easy | medium | hard |
| -------------------- | ---: | -----: | ---: |
| technology 科技      |   10 |     10 |   10 |
| science 科學         |   10 |     10 |   10 |
| history 歷史         |   10 |     10 |   10 |
| geography 地理       |   10 |     10 |   10 |
| mixed 綜合（跨四類） |   40 |     40 |   40 |

## 抽題規則

`drawQuestions(bank, { category, difficulty, count: 10 })`：

1. 驗證題庫結構、選單參數、資料唯一性。
2. 只保留 `enabled === true` 且符合難度的題目。
3. 單一類別只抽該類；`mixed` 從四類共同抽取。
4. 若題數不足 **直接拋出錯誤**，不重複題目、不降低題數。
5. 使用 Fisher–Yates 洗牌，以亂數選出 10 題，原始題庫不變。

## 如何測試

在 Repository 根目錄執行（需要 Node.js 版本支援 `node:test`）：

```powershell
node --test tests/quiz-data.test.mjs
```

這裡有七組自動測試：題庫完整性、題量、15 種遊戲設定、不可重複、不可修改原資料、資料不足、輸入與格式防護。

## 安全邊界

本子階段是**前端遊戲開發用的暫存題庫**，JSON 檔內有正確答案，可被瀏覽器看到。因此**不得把它當成可防作弊的正式排行榜系統**。後續改為 Express + SQLite 時，答案必須留在後端，API 僅傳尚未作答題目的題幹與選項；作答由伺服器驗證。

## 品質與限制

自動測試能證實結構、題量及抽題邏輯，但**不等於每題的歷史、科學、地理敘述已完成逐題權威資料來源查核**。正式上線前仍須安排內容審校。由於每個單一類別／難度目前恰好 10 題，該組合雖可洗牌但每局仍會遇到相同十題；後續應擴充至每組 20–30 題以改善重玩性。

## 建議 Commit

`feat: add validated multi-category question bank`

請先本機執行測試、確認內容後再 Commit，這次先不要更新 README 為「v0.2.0 已完成」。
