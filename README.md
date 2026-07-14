# SafalNiveshak (सफल निवेशक)
> **100% Offline-Capable, Bilingual Financial Safety & Trading Simulator for Indian Retail Investors**

[![Build Status](https://github.com/Showingdawn/niveshak1/actions/workflows/build.yml/badge.svg)](https://github.com/Showingdawn/niveshak1/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Offline Capability](https://img.shields.io/badge/Offline-100%25-green.svg)](#)
[![Bilingual](https://img.shields.io/badge/Language-English%20%7C%20Hindi-blue.svg)](#)
[![Vite](https://img.shields.io/badge/Vite-v6-purple.svg)](#)
[![PWA](https://img.shields.io/badge/PWA-Installable-blueviolet.svg)](#)

---

## 🇮🇳 Project Overview (परियोजना विवरण)

**SafalNiveshak** is a comprehensive offline-first stock market education platform designed for first-time retail investors in India. Built for the **Build With Bharat 2026** national hackathon, it protects capital against unregistered "VIP tips" scams, WhatsApp pump-and-dump channels, and deceptive financial marketing traps.

**सफल निवेशक** भारतीय रिटेल निवेशकों के लिए एक ऑफलाइन-सक्षम द्विभाषी शेयर बाजार शिक्षा मंच है। यह निवेशकों को धोखाधड़ी वाले व्हाट्सऐप टिप्स और भ्रामक वित्तीय विज्ञापनों से बचाने के लिए बनाया गया है।

---

## ✨ Premium Features (मुख्य विशेषताएं)

1. **Strategy Backtester**: Backtest **Buy & Hold** or **5/15 SMA Crossover** against historical candle data with dynamic equity curves and complete ledgers.
2. **Local Leaderboard**: Rank local profiles offline by XP competitor bot profiles to make hackathon audits highly interactive.
3. **Data Backup & Restore**: Download profile progress, simulated portfolio balances, trade history, and settings as a JSON file, or restore them.
4. **Multi-Profile Support**: Switch between multiple user profiles stored in local storage without losing data.
5. **Keyboard Shortcuts**: Power-user keyboard inputs (`B`=Buy, `S`=Sell, `Esc`=Reset, `Arrows`=Watchlist) in the virtual trading terminal with on-screen HUD hints.
6. **Bilingual Audio Narration**: Native text-to-speech engine using Web Speech API that reads lessons offline in Hindi and English.
7. **Offline Status LED**: Glowing Navbar indicator reflecting dynamic browser network state (Online vs Offline Mode).
8. **Print-Friendly Certificates**: Physical print-media overrides and physical print buttons alongside standard jsPDF certificate downloads.

---

## 🛠️ Tech Stack (तकनीकी संरचना)

| Component | Technologies | Description |
| :--- | :--- | :--- |
| **Frontend Core** | React 18, Vite | Light-speed, reactive UI components. |
| **Styles** | Vanilla CSS | Custom dark mode glassmorphism theme, premium navy grid. |
| **Offline Engine** | Service Workers (Vite PWA) | Direct precaching for 100% offline uptime. |
| **Simulations** | LocalStorage Fallback | Runs simulator systems offline without backend databases. |
| **Backend Server** | Node.js, Express.js | Optional server for API endpoints and persistent SQLite. |
| **Database** | SQLite 3 | Embedded whitelists and persistent inspection tables. |

---

## 🚀 Quick Start (तुरंत शुरू करें)

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation & Local Dev
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local client server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

### Optional Backend Setup
If you want to run the Express backend + SQLite database:
1. Navigate to server folder and install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Start the database server:
   ```bash
   npm start
   ```

---

## 📊 Database Schema Details (`safalniveshak.db`)
1. **`sebi_advisors`**: Whitelists of registered advisory units (`regNo`, `name`, `type`, `validTill`, `email`, `address`, `status`).
2. **`lesson_progress`**: Clear logs of lesson completion (`userId`, `lessonId`, `completedAt`).
3. **`scam_records`**: Inspected records of checked messages (`userId`, `textSnippet`, `score`, `verdict`, `date`).

---

## 📄 License & Credits
Licensed under the [MIT License](LICENSE). Created for the "Build With Bharat 2026" National Hackathon.
