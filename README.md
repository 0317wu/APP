# 物聯網智慧監控系統（IoT Smart Monitoring System）

本專題為一套結合 **物聯網（IoT）三層式架構** 與 **行動應用程式（App）** 的智慧監控系統，  
透過感測設備蒐集環境／設備狀態資料，經由網路層傳輸後，在應用層進行即時顯示、歷史紀錄與管理設定。

本系統以「**系統整合與實務應用**」為核心，符合課程與競賽對於物聯網系統整合題目的要求。

---

## 📌 專題目標

- 建立完整的 **物聯網三層式架構（感知層／網路層／應用層）**
- 即時接收與顯示設備感測資料
- 提供使用者友善的行動 App 操作介面
- 支援歷史資料查詢、系統設定與管理員模式
- 強化實務性與可擴充性，作為實際 IoT 應用範例

---

## 🏗 系統整體架構（IoT 三層）

### 1️⃣ 感知層（Perception Layer）
- 感測設備（實體 Raspberry Pi 或模擬設備）
- 負責蒐集設備狀態或環境資料（如異常狀態、事件紀錄等）
- 將資料送往網路層進行傳輸

### 2️⃣ 網路層（Network Layer）
- 負責資料傳輸與整合
- 將感測資料傳送至應用層後端或 App
- 為系統資料流通的核心橋樑

### 3️⃣ 應用層（Application Layer）
- 以 **React Native（Expo）** 開發行動應用程式
- 提供使用者操作介面（UI/UX）
- 顯示即時狀態、歷史資料與系統設定功能

---

## 📱 App 功能介紹（目前已完成）

### 🏠 首頁（Home）
- 顯示系統基本狀態資訊
- 提供主要功能入口
- 採用統一主題風格（支援深色／淺色模式架構）

---

### 📊 歷史紀錄（History）
- 使用 `SectionList` 顯示歷史事件資料
- 依日期或類型進行分組顯示
- 可快速瀏覽過往設備狀態與事件紀錄

---

### 📈 統計資訊（Statistics）
- 顯示系統資料統計結果
- 作為後續資料分析與視覺化的基礎
- 已完成畫面與資料結構設計（後續可擴充圖表）

---

### ⚙️ 設定（Settings）
- 系統基本設定管理
- 深色模式／淺色模式切換（ThemeContext）
- 異常警告顯示開關
- 管理員模式入口

---

### 🔐 管理員模式（Admin Mode）
- 透過管理員密碼進入
- 提供進階設定權限
- 作為一般使用者與管理者的角色區分機制

---

## 🧩 技術架構與使用技術

### 前端（App）
- React Native
- Expo
- Context API
  - ThemeContext（主題管理）
  - DataContext（資料狀態管理）
- Functional Components + Hooks

### 架構設計
- Component-based 架構
- Screen 與 Component 分離
- 共用樣式（Global Styles）
- 可維護、可擴充的專案結構

---

## 📂 專案資料夾結構（簡述）

```text
src/
├─ components/      # 共用元件（BaseScreen 等）
├─ screens/         # 各功能頁面（Home、History、Settings...）
├─ data/            # 資料狀態管理（DataContext）
├─ theme/           # 主題與色彩管理（ThemeContext）
├─ styles.js        # 全域樣式
