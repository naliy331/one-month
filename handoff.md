# 《一個月的你》開發交接文件
## 截至 2026-06-28

---

## 一、遊戲概念

互動小說遊戲，玩家在校園世界自由互動（三欄輸入：心裡想的／可見動作／說出口的話）。
角色有自己的行程，不讀心，不保證喜歡玩家，世界繼續運轉。
目標用戶：玩過乙女遊戲但覺得太假、有社交焦慮想搞懂它的人。

---

## 二、目前的檔案

### 設計文件（已上傳）
- `PRD_complete_v3.md` — 完整產品規格
- `characters_v2.md` — 陸予安＋沈知衡完整人設
- `gemini_prompts_v2.md` — 所有Gemini prompt
- `weekly_report_prompts_v2.md` — 週報/系統觀測設計
- `ending_prompt_v2.md` — 結局設計
- `CHANGELOG_v3.md` — 本輪設計決策摘要

### 遊戲本體
**當前最新版本：`one_month_v3_fixed10.html`**
（已輸出，直接用這個）

---

## 三、角色行程時間表

來源：`event_table.json`（在 `one_month_clean_mvp_bundle.zip` 裡）

```
陸予安：
  D1  健身房  14:30–16:00  (分鐘: 870–960)
  D2  咖啡廳  16:35–17:35  (分鐘: 995–1055)
  D3  不出現

沈知衡：
  D1  不出現
  D2  咖啡廳  16:35–17:35  (分鐘: 995–1055)
  D3  中庭    18:00–18:35  (分鐘: 1080–1115)
```

---

## 四、已修復的Bug清單（fixed1–10）

1. 模型名稱：gemini-3.5-flash → gemini-2.5-flash
2. 角色完整人設加入Gemini system prompt（含資訊可見性規則）
3. 角色行程時間表加入gameState，時間制離場邏輯（不是回合數制）
4. D2咖啡廳陸予安離場台詞加入
5. resume() 修好：設定頁改完API後回到正確畫面不跳封面
6. API key存入localStorage持久化（不再每次重填）
7. nextDay() D3結束後跳observation()不卡住
8. P2 chip分兩組分別填對應欄位
9. saveApi()套用後直接回遊戲不再叫重新測試
10. 封面加入「⚙ API設定」按鈕，顯示key狀態
11. selectTarget不再重新渲染整個場景（換對話對象時保留對話記錄）
12. maxOutputTokens 500→2000（對話截斷問題）

---

## 五、當前已知問題／待確認

- API quota問題：台灣地區Gemini free tier今日quota用盡，明天（台灣時間早上8點）重置後可正常使用
- 可用的key格式是AQ.開頭（新版Google格式），存在localStorage的`one_month_apikey`
- 可用模型：`gemini-2.5-flash`（已驗證）

---

## 六、技術環境

- Windows + VS Code + Live Server（Port 5500）
- 網址：`http://127.0.0.1:5500/one_month_v3_fixed10.html`
- Gemini API key存在localStorage的`one_month_apikey`
- 遊戲進度存在localStorage的`one_month_you_d1d3_v1`
- 模型：gemini-2.5-flash

---

## 七、遊戲流程（已跑通的部分）

```
封面 → ⚙API設定（先設定key）→ 開始這個月
→ 設定P1-P4（基本資料）
→ Day轉場 → 今日新聞 → 行程規劃
→ 場景互動（三欄輸入＋熱點選擇＋Gemini回應）
→ 日結（Gemini生成觀察句）
→ D1→D2→D3
→ 系統觀測回信（S6，hardcoded版本）
→ 試玩章回信（S7，hardcoded版本）
→ 角色視角揭露（S8）
→ 黑屏「這個月，還有二十七天。」
```

---

## 八、下一步待做的事

### 優先（影響核心體驗）
1. **S6/S7/S8改為Gemini動態生成** — 目前是hardcoded，要改成根據玩家真實行為生成
2. **測試完整D1-D3流程** — API通了之後需要完整跑一遍確認

### 次要
3. 第四面牆時刻實作（目前只有D1未遇陸予安的那一個）
4. 社交波紋系統（陸予安把玩家資訊傳給沈知衡）
5. 人物檔案觀察句每日更新（目前靜態）

### 設計文件已完成但未實作
- 週報完整對話式設計（weekly_report_prompts_v2.md）
- 結局完整設計（ending_prompt_v2.md）
- 第四面牆四種時刻（PRD_complete_v3.md 第七章）

---

## 九、給下一個對話的指示

請先閱讀以下文件建立context：
1. `PRD_complete_v3.md`
2. `characters_v2.md`
3. `CHANGELOG_v3.md`

當前最新HTML是 `one_month_v3_fixed10.html`，
所有修改都應該基於這個版本。

修改檔案時請用python直接讀取上傳的HTML，
用str.replace()修改，輸出新版本。
版本號繼續從 fixed11 往上疊。

