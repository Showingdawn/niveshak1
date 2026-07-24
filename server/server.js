import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = join(__dirname, 'safalniveshak.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failure:", err.message);
  } else {
    console.log("Connected to SQLite database safalniveshak.db");
  }
});

// Setup tables
db.serialize(() => {
  // 1. SEBI Registered Advisors Whitelist
  db.run(`CREATE TABLE IF NOT EXISTS sebi_advisors (
    regNo TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    validTill TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    status TEXT NOT NULL
  )`);

  // Seed SEBI advisors
  const initialAdvisors = [
    { regNo: "INA200001041", name: "Scripbox Wealth Managers Private Limited", type: "Corporate", validTill: "Permanent", email: "compliance@scripbox.com", address: "Bengaluru, Karnataka", status: "Active" },
    { regNo: "INA100015717", name: "Wright Research & Capital Private Limited", type: "Corporate", validTill: "Permanent", email: "info@wrightresearch.in", address: "Mumbai, Maharashtra", status: "Active" },
    { regNo: "INA000011538", name: "Zerodha Broking Limited (Advisory)", type: "Corporate", validTill: "Permanent", email: "advisory@zerodha.com", address: "Bengaluru, Karnataka", status: "Active" },
    { regNo: "INA100009230", name: "Groww Invest Tech Private Limited", type: "Corporate", validTill: "Permanent", email: "advisory@groww.in", address: "Bengaluru, Karnataka", status: "Active" },
    { regNo: "INH000020086", name: "Paytm Money Limited (Research)", type: "Corporate", validTill: "Permanent", email: "compliance@paytmmoney.com", address: "Bengaluru, Karnataka", status: "Active" },
    { regNo: "INH000014003", name: "Capitalmind Research LLP (Research)", type: "Corporate", validTill: "Permanent", email: "support@capitalmind.in", address: "Bengaluru, Karnataka", status: "Active" },
    { regNo: "INA000008472", name: "Aayush Sharma (Independent RIA)", type: "Individual", validTill: "2029-12-31", email: "aayush.advisory@outlook.in", address: "New Delhi, Delhi", status: "Active" },
    { regNo: "INA000005432", name: "Manoj Kumar Financial Services", type: "Individual", validTill: "2028-06-30", email: "manoj.advisor@gmail.com", address: "Jaipur, Rajasthan", status: "Suspended" }
  ];

  const stmt = db.prepare("INSERT OR REPLACE INTO sebi_advisors VALUES (?, ?, ?, ?, ?, ?, ?)");
  initialAdvisors.forEach(a => {
    stmt.run(a.regNo, a.name, a.type, a.validTill, a.email, a.address, a.status);
  });
  stmt.finalize();
  console.log("Synchronized database with verified SEBI RIA whitelist records");

  // 2. Lesson Progress Registry
  db.run(`CREATE TABLE IF NOT EXISTS lesson_progress (
    userId TEXT NOT NULL,
    lessonId INTEGER NOT NULL,
    completedAt TEXT NOT NULL,
    PRIMARY KEY (userId, lessonId)
  )`);

  // 3. Paper trading balances
  db.run(`CREATE TABLE IF NOT EXISTS paper_balances (
    userId TEXT PRIMARY KEY,
    balance REAL NOT NULL
  )`);

  // 4. Paper trading holdings
  db.run(`CREATE TABLE IF NOT EXISTS paper_holdings (
    userId TEXT NOT NULL,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    avgBuyPrice REAL NOT NULL,
    PRIMARY KEY (userId, symbol)
  )`);

  // 5. Paper trading transactions
  db.run(`CREATE TABLE IF NOT EXISTS paper_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    timestamp TEXT NOT NULL
  )`);

  // 3. Scam Checking Inspection Logs
  db.run(`CREATE TABLE IF NOT EXISTS scam_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    textSnippet TEXT NOT NULL,
    score INTEGER NOT NULL,
    verdict TEXT NOT NULL,
    date TEXT NOT NULL
  )`);

  // 4. Completed tracks
  db.run(`CREATE TABLE IF NOT EXISTS completed_tracks (
    userId TEXT NOT NULL,
    trackId TEXT NOT NULL,
    completedAt TEXT NOT NULL,
    PRIMARY KEY (userId, trackId)
  )`);

  // 5. Community Crowdsourced Reported Scams table
  db.run(`CREATE TABLE IF NOT EXISTS reported_scams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    messageText TEXT UNIQUE,
    patterns TEXT,
    reportCount INTEGER DEFAULT 1,
    lastReported TEXT NOT NULL
  )`);

  // Seed reported scams feed if empty
  db.get("SELECT COUNT(*) as count FROM reported_scams", [], (err, row) => {
    if (err) return;
    if (row.count === 0) {
      const dateStr = new Date().toLocaleDateString('en-IN');
      const seedReports = [
        {
          text: "🚀 JACKPOT CALL: Buy VIP stocks tomorrow. 100% profit double money guaranteed in 10 days. No risk, transfer Rs 5000 registration fee to Telegram link: t.me/VIP_Stock_Pumping",
          patterns: "guaranteed_returns,urgency_pressure,unregistered_solicitation,pump_dump,advance_payment",
          count: 48
        },
        {
          text: "Nikhil Kamath Ambani Fund: Join WhatsApp group chat.whatsapp.com/AmbaniTrust for 5% daily returns. Valid for next 2 hours only. Limited seats left, register now!",
          patterns: "guaranteed_returns,urgency_pressure,unregistered_solicitation,celebrity_endorsement",
          count: 32
        },
        {
          text: "SEBI Registered Advisory leak: Tomorrow upper circuit stock target. Earn 50% profit. We split profit 50-50 after trade is completed. Inbox me for details.",
          patterns: "fake_sebi_advisor,pump_dump,profit_sharing",
          count: 14
        }
      ];

      const stmt = db.prepare("INSERT INTO reported_scams (messageText, patterns, reportCount, lastReported) VALUES (?, ?, ?, ?)");
      seedReports.forEach(r => {
        stmt.run(r.text, r.patterns, r.count, dateStr);
      });
      stmt.finalize();
      console.log("Seeded database with initial reported scams feed logs");
    }
  });

  // 6. Mutual Fund master data table
  db.run(`CREATE TABLE IF NOT EXISTS mf_funds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    base_nav REAL NOT NULL,
    current_nav REAL NOT NULL,
    expense_ratio REAL NOT NULL
  )`);

  // 7. Mutual Fund transactions table
  db.run(`CREATE TABLE IF NOT EXISTS mf_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    fund_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'BUY_LUMPSUM', 'BUY_SIP', 'SELL'
    amount REAL NOT NULL,
    units REAL NOT NULL,
    nav REAL NOT NULL,
    timestamp TEXT NOT NULL
  )`);

  // 8. Mutual Fund SIP mandates table
  db.run(`CREATE TABLE IF NOT EXISTS mf_sip_mandates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    fund_id INTEGER NOT NULL,
    monthly_amount REAL NOT NULL,
    start_date TEXT NOT NULL,
    last_executed_date TEXT,
    status TEXT NOT NULL -- 'ACTIVE', 'PAUSED'
  )`);

  // 9. Mutual Fund portfolio table
  db.run(`CREATE TABLE IF NOT EXISTS mf_portfolio (
    userId TEXT NOT NULL,
    fund_id INTEGER NOT NULL,
    total_units REAL NOT NULL,
    average_nav REAL NOT NULL,
    invested_amount REAL NOT NULL,
    PRIMARY KEY (userId, fund_id)
  )`);

  // Seed MF funds if empty
  db.get("SELECT COUNT(*) as count FROM mf_funds", [], (err, row) => {
    if (err) return;
    if (row.count === 0) {
      const seedFunds = [
        { symbol: "NIFTY50_IDX", name: "Nifty 50 Index Fund", category: "Equity Large Cap", base_nav: 100.0, current_nav: 125.5, expense_ratio: 0.20 },
        { symbol: "BHARAT_SC", name: "Bharat Small Cap Fund", category: "Equity Small Cap", base_nav: 50.0, current_nav: 72.8, expense_ratio: 0.75 },
        { symbol: "EMERGING_MC", name: "Emerging Tech MidCap", category: "Equity Mid Cap", base_nav: 75.0, current_nav: 98.4, expense_ratio: 0.60 },
        { symbol: "SAFE_LIQUID", name: "Safe-Harbor Liquid Fund", category: "Liquid", base_nav: 10.0, current_nav: 11.2, expense_ratio: 0.15 },
        { symbol: "DEBT_SAVER", name: "Debt Saver Gilt Fund", category: "Debt", base_nav: 20.0, current_nav: 24.6, expense_ratio: 0.35 }
      ];

      const stmt = db.prepare("INSERT INTO mf_funds (symbol, name, category, base_nav, current_nav, expense_ratio) VALUES (?, ?, ?, ?, ?, ?)");
      seedFunds.forEach(f => {
        stmt.run(f.symbol, f.name, f.category, f.base_nav, f.current_nav, f.expense_ratio);
      });
      stmt.finalize();
      console.log("Seeded database with initial Mutual Funds catalog");
    }
  });

  // 10. Abhyas Ultimate assets master
  db.run(`CREATE TABLE IF NOT EXISTS assets_master (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL, -- 'STOCK', 'MUTUAL_FUND', 'ETF'
    sector TEXT NOT NULL,
    base_price REAL NOT NULL,
    current_price REAL NOT NULL,
    daily_volatility REAL NOT NULL
  )`);

  // 11. Price candlesticks history
  db.run(`CREATE TABLE IF NOT EXISTS price_candlesticks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    open REAL NOT NULL,
    high REAL NOT NULL,
    low REAL NOT NULL,
    close REAL NOT NULL,
    volume INTEGER NOT NULL,
    timestamp INTEGER NOT NULL
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_candlesticks_asset ON price_candlesticks (asset_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_candlesticks_time ON price_candlesticks (timestamp)`);

  // 12. User inventory positions tracking
  db.run(`CREATE TABLE IF NOT EXISTS user_portfolio (
    userId TEXT NOT NULL,
    asset_id INTEGER NOT NULL,
    asset_type TEXT NOT NULL,
    total_quantity REAL NOT NULL,
    average_buy_price REAL NOT NULL,
    invested_amount REAL NOT NULL,
    PRIMARY KEY (userId, asset_id)
  )`);

  // 13. Systematic mandates (SIP / STOCK_SIP)
  db.run(`CREATE TABLE IF NOT EXISTS systematic_mandates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    asset_id INTEGER NOT NULL,
    mandate_type TEXT NOT NULL, -- 'SIP' (amount-based), 'STOCK_SIP' (qty-based)
    recurring_amount_or_qty REAL NOT NULL,
    interval_days INTEGER NOT NULL,
    last_executed_date TEXT,
    status TEXT NOT NULL -- 'ACTIVE', 'PAUSED'
  )`);

  // 14. Transaction Ledger with Extended Quantitative Auditing
  db.run(`CREATE TABLE IF NOT EXISTS transaction_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    asset_id INTEGER NOT NULL,
    trade_type TEXT NOT NULL, -- 'BUY_LONG', 'SELL_LONG', 'SHORT_SELL', 'COVER_SHORT'
    order_mode TEXT NOT NULL, -- 'DELIVERY', 'INTRADAY', 'SIP'
    amount REAL NOT NULL,
    quantity REAL NOT NULL,
    execution_price REAL NOT NULL,
    timestamp TEXT NOT NULL,
    pattern_origin_tag TEXT,
    slippage_charges_deducted REAL,
    realized_net_pnl REAL,
    psychology_flags TEXT,
    execution_speed_ms INTEGER
  )`);

  // Run dynamic schema extensions (safe migrations)
  db.run("ALTER TABLE transaction_ledger ADD COLUMN pattern_origin_tag TEXT", (err) => {});
  db.run("ALTER TABLE transaction_ledger ADD COLUMN slippage_charges_deducted REAL", (err) => {});
  db.run("ALTER TABLE transaction_ledger ADD COLUMN realized_net_pnl REAL", (err) => {});
  db.run("ALTER TABLE transaction_ledger ADD COLUMN psychology_flags TEXT", (err) => {});
  db.run("ALTER TABLE transaction_ledger ADD COLUMN execution_speed_ms INTEGER", (err) => {});

  // 15. Gamified Level Ups & Passbook Badges Table
  db.run(`CREATE TABLE IF NOT EXISTS user_badges (
    userId TEXT NOT NULL,
    badge_id TEXT NOT NULL,
    unlocked_at TEXT NOT NULL,
    PRIMARY KEY (userId, badge_id)
  )`);

  // 16. Customer Support Tickets Table
  db.run(`CREATE TABLE IF NOT EXISTS support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_reference TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL, -- 'SCAM_REPORT', 'PLATFORM_HELP', 'SEBI_GUIDANCE'
    subject TEXT NOT NULL,
    conversation_json TEXT NOT NULL,
    status TEXT NOT NULL, -- 'OPEN', 'RESOLVED'
    created_at TEXT NOT NULL
  )`);

  // 17. Progressive Learning Progress Table
  db.run(`DROP TABLE IF EXISTS learning_progress`, () => {
    db.run(`CREATE TABLE IF NOT EXISTS learning_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      module_id TEXT NOT NULL,
      tier_level TEXT NOT NULL, -- 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'
      assessment_score REAL,
      status TEXT NOT NULL, -- 'LOCKED', 'UNLOCKED', 'COMPLETED'
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, module_id, tier_level)
    )`);
  });

  // 18. Financial Helplines Lookup Table
  db.run(`CREATE TABLE IF NOT EXISTS financial_helplines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    details TEXT
  )`, () => {
    // Seed standard financial helplines if table is empty
    db.get("SELECT COUNT(*) as count FROM financial_helplines", [], (err, row) => {
      if (row && row.count === 0) {
        const stmt = db.prepare("INSERT INTO financial_helplines (name, contact, jurisdiction, details) VALUES (?, ?, ?, ?)");
        stmt.run("SEBI Investor Toll-Free Helpline", "1800-266-7575 / 1800-22-7575", "Pan-India", "Official investor assistance, bilingual support (English, Hindi, and regional languages) active 9:00 AM to 6:00 PM.");
        stmt.run("RBI Financial Ombudsman", "crpc@rbi.org.in / 14448", "Banking & NBFCs", "Centralized Receipt and Processing Centre for complaints regarding banking services, digital transactions, and wallet services.");
        stmt.run("National Cyber Crime Portal", "cybercrime.gov.in / 1930", "Cyber Fraud & Theft", "Immediate reporting portal and toll-free helpline (1930) for online financial fraud, identity theft, and Telegram/WhatsApp scam groups.");
        stmt.run("NSE Investor Grievance Cell", "nseplus@nse.co.in / 1800 266 0058", "Securities & Exchanges", "Dedicated grievance redressal platform (NSE NICE Plus) for complaints against trading members and brokers.");
        stmt.finalize();
      }
    });
  });

  // Helper to generate seed candlestick history
  function generateCandlestickHistory(assetId, basePrice, type, count, endTime) {
    const candles = [];
    let price = basePrice;
    const interval = type === 'MUTUAL_FUND' ? 24 * 60 * 60 * 1000 : 60 * 1000;
    const volatility = type === 'STOCK' ? 0.015 : (type === 'ETF' ? 0.008 : 0.005);

    for (let i = count - 1; i >= 0; i--) {
      const timestamp = endTime - i * interval;
      const open = price;
      const change = price * volatility * (Math.random() - 0.48);
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * price * volatility * 0.4;
      const low = Math.min(open, close) - Math.random() * price * volatility * 0.4;
      const volume = Math.floor(2000 + Math.random() * 18000);

      candles.push({
        asset_id: assetId,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume,
        timestamp
      });
      price = close;
    }
    return candles;
  }

  // Seed master assets & historical candles
  const seedAssets = [
    // STOCKS (1 - 18)
    { id: 1, symbol: "RELIANCE", name: "Reliance Industries Ltd", asset_type: "STOCK", sector: "Energy & Retail", base_price: 2450.0, current_price: 2450.0, daily_volatility: 0.015 },
    { id: 2, symbol: "TCS", name: "Tata Consultancy Services Ltd", asset_type: "STOCK", sector: "IT Services", base_price: 3850.0, current_price: 3850.0, daily_volatility: 0.012 },
    { id: 3, symbol: "TATAMOTORS", name: "Tata Motors Ltd", asset_type: "STOCK", sector: "Automobile", base_price: 960.0, current_price: 960.0, daily_volatility: 0.025 },
    { id: 4, symbol: "ZOMATO", name: "Zomato Ltd", asset_type: "STOCK", sector: "Tech/Consumer", base_price: 265.0, current_price: 265.0, daily_volatility: 0.035 },
    { id: 5, symbol: "INFY", name: "Infosys Ltd", asset_type: "STOCK", sector: "IT Services", base_price: 1540.0, current_price: 1540.0, daily_volatility: 0.018 },
    { id: 6, symbol: "SUZLON", name: "Suzlon Energy Ltd", asset_type: "STOCK", sector: "Renewable Energy", base_price: 55.0, current_price: 55.0, daily_volatility: 0.050 },
    { id: 7, symbol: "HDFCBANK", name: "HDFC Bank Ltd", asset_type: "STOCK", sector: "Financial Services", base_price: 1650.0, current_price: 1650.0, daily_volatility: 0.013 },
    { id: 8, symbol: "ICICIBANK", name: "ICICI Bank Ltd", asset_type: "STOCK", sector: "Financial Services", base_price: 1120.0, current_price: 1120.0, daily_volatility: 0.014 },
    { id: 9, symbol: "SBIN", name: "State Bank of India", asset_type: "STOCK", sector: "Financial Services", base_price: 840.0, current_price: 840.0, daily_volatility: 0.018 },
    { id: 10, symbol: "ITC", name: "ITC Ltd", asset_type: "STOCK", sector: "FMCG & Conglomerate", base_price: 430.0, current_price: 430.0, daily_volatility: 0.011 },
    { id: 11, symbol: "LT", name: "Larsen & Toubro Ltd", asset_type: "STOCK", sector: "Engineering & Construction", base_price: 3620.0, current_price: 3620.0, daily_volatility: 0.016 },
    { id: 12, symbol: "BHARTIAIRTEL", name: "Bharti Airtel Ltd", asset_type: "STOCK", sector: "Telecommunication", base_price: 1420.0, current_price: 1420.0, daily_volatility: 0.015 },
    { id: 13, symbol: "ADANIENT", name: "Adani Enterprises Ltd", asset_type: "STOCK", sector: "Conglomerate", base_price: 3120.0, current_price: 3120.0, daily_volatility: 0.038 },
    { id: 14, symbol: "ASIANPAINT", name: "Asian Paints Ltd", asset_type: "STOCK", sector: "Consumer Discretionary", base_price: 2890.0, current_price: 2890.0, daily_volatility: 0.013 },
    { id: 15, symbol: "TITAN", name: "Titan Company Ltd", asset_type: "STOCK", sector: "Consumer Goods", base_price: 3400.0, current_price: 3400.0, daily_volatility: 0.017 },
    { id: 16, symbol: "WIPRO", name: "Wipro Ltd", asset_type: "STOCK", sector: "IT Services", base_price: 470.0, current_price: 470.0, daily_volatility: 0.018 },
    { id: 17, symbol: "COALINDIA", name: "Coal India Ltd", asset_type: "STOCK", sector: "Mining & Energy", base_price: 480.0, current_price: 480.0, daily_volatility: 0.021 },
    { id: 18, symbol: "POWERGRID", name: "Power Grid Corp of India", asset_type: "STOCK", sector: "Utilities", base_price: 320.0, current_price: 320.0, daily_volatility: 0.012 },

    // ETFs (19 - 24)
    { id: 19, symbol: "NIFTYBEES", name: "Nifty 50 ETF (BeES)", asset_type: "ETF", sector: "Index ETF", base_price: 250.0, current_price: 250.0, daily_volatility: 0.010 },
    { id: 20, symbol: "GOLDBEES", name: "Gold ETF (BeES)", asset_type: "ETF", sector: "Commodity ETF", base_price: 60.0, current_price: 60.0, daily_volatility: 0.008 },
    { id: 21, symbol: "JUNIORBEES", name: "Nifty Next 50 ETF (BeES)", asset_type: "ETF", sector: "Index ETF", base_price: 620.0, current_price: 620.0, daily_volatility: 0.014 },
    { id: 22, symbol: "BANKBEES", name: "Nifty Bank ETF", asset_type: "ETF", sector: "Sectoral ETF", base_price: 480.0, current_price: 480.0, daily_volatility: 0.015 },
    { id: 23, symbol: "SILVERBEES", name: "Silver ETF (BeES)", asset_type: "ETF", sector: "Commodity ETF", base_price: 78.0, current_price: 78.0, daily_volatility: 0.012 },
    { id: 24, symbol: "ITBEES", name: "Nifty IT ETF (BeES)", asset_type: "ETF", sector: "Sectoral ETF", base_price: 36.0, current_price: 36.0, daily_volatility: 0.017 },

    // MUTUAL FUNDS (25 - 49)
    { id: 25, symbol: "SBI_BLUECHIP", name: "SBI Bluechip Fund (Direct-G)", asset_type: "MUTUAL_FUND", sector: "Equity Large Cap", base_price: 82.5, current_price: 82.5, daily_volatility: 0.009 },
    { id: 26, symbol: "HDFC_TOP100", name: "HDFC Top 100 Fund (Direct-G)", asset_type: "MUTUAL_FUND", sector: "Equity Large Cap", base_price: 95.2, current_price: 95.2, daily_volatility: 0.008 },
    { id: 27, symbol: "ICICI_BLUECHIP", name: "ICICI Prudential Bluechip (G)", asset_type: "MUTUAL_FUND", sector: "Equity Large Cap", base_price: 88.4, current_price: 88.4, daily_volatility: 0.009 },
    { id: 28, symbol: "PP_FLEXICAP", name: "Parag Parikh Flexi Cap Fund", asset_type: "MUTUAL_FUND", sector: "Equity Flexi Cap", base_price: 72.8, current_price: 72.8, daily_volatility: 0.012 },
    { id: 29, symbol: "QUANT_ACTIVE", name: "Quant Active Fund (Direct-G)", asset_type: "MUTUAL_FUND", sector: "Equity Multi Cap", base_price: 60.5, current_price: 60.5, daily_volatility: 0.018 },
    { id: 30, symbol: "MIRAE_LMID", name: "Mirae Asset Large & Midcap Fund", asset_type: "MUTUAL_FUND", sector: "Equity Large & Mid Cap", base_price: 120.4, current_price: 120.4, daily_volatility: 0.014 },
    { id: 31, symbol: "NIPPON_SMALL", name: "Nippon India Small Cap (Direct)", asset_type: "MUTUAL_FUND", sector: "Equity Small Cap", base_price: 145.2, current_price: 145.2, daily_volatility: 0.022 },
    { id: 32, symbol: "HDFC_SMALL", name: "HDFC Small Cap Fund (Direct)", asset_type: "MUTUAL_FUND", sector: "Equity Small Cap", base_price: 110.8, current_price: 110.8, daily_volatility: 0.020 },
    { id: 33, symbol: "QUANT_SMALL", name: "Quant Small Cap Fund (Direct)", asset_type: "MUTUAL_FUND", sector: "Equity Small Cap", base_price: 210.3, current_price: 210.3, daily_volatility: 0.026 },
    { id: 34, symbol: "AXIS_GROWTH", name: "Axis Growth Opportunities Fund", asset_type: "MUTUAL_FUND", sector: "Equity Large & Mid Cap", base_price: 25.4, current_price: 25.4, daily_volatility: 0.013 },
    { id: 35, symbol: "TATA_DIGITAL", name: "Tata Digital India Fund (G)", asset_type: "MUTUAL_FUND", sector: "Sectoral Technology", base_price: 42.6, current_price: 42.6, daily_volatility: 0.019 },
    { id: 36, symbol: "ICICI_TECH", name: "ICICI Prudential Tech Fund", asset_type: "MUTUAL_FUND", sector: "Sectoral Technology", base_price: 165.2, current_price: 165.2, daily_volatility: 0.018 },
    { id: 37, symbol: "SBI_HEALTH", name: "SBI Healthcare Opportunities", asset_type: "MUTUAL_FUND", sector: "Sectoral Healthcare", base_price: 325.4, current_price: 325.4, daily_volatility: 0.014 },
    { id: 38, symbol: "UTI_NIFTY50", name: "UTI Nifty 50 Index Fund (G)", asset_type: "MUTUAL_FUND", sector: "Equity Index Fund", base_price: 150.0, current_price: 150.0, daily_volatility: 0.009 },
    { id: 39, symbol: "HDFC_SENSEX", name: "HDFC Index Sensex Fund (G)", asset_type: "MUTUAL_FUND", sector: "Equity Index Fund", base_price: 180.0, current_price: 180.0, daily_volatility: 0.009 },
    { id: 40, symbol: "MO_NASDAQ", name: "Motilal Oswal Nasdaq 100 FOF", asset_type: "MUTUAL_FUND", sector: "Equity International", base_price: 32.5, current_price: 32.5, daily_volatility: 0.015 },
    { id: 41, symbol: "SBI_GILT", name: "SBI Magnum Gilt Fund (G)", asset_type: "MUTUAL_FUND", sector: "Debt Gilt Fund", base_price: 58.2, current_price: 58.2, daily_volatility: 0.004 },
    { id: 42, symbol: "HDFC_SHORT_DEBT", name: "HDFC Short Term Debt Fund (G)", asset_type: "MUTUAL_FUND", sector: "Debt Short Duration", base_price: 28.5, current_price: 28.5, daily_volatility: 0.003 },
    { id: 43, symbol: "ICICI_LIQUID", name: "ICICI Prudential Liquid Fund", asset_type: "MUTUAL_FUND", sector: "Liquid Fund", base_price: 320.5, current_price: 320.5, daily_volatility: 0.001 },
    { id: 44, symbol: "ABSL_LIQUID", name: "Aditya Birla Sun Life Liquid", asset_type: "MUTUAL_FUND", sector: "Liquid Fund", base_price: 350.2, current_price: 350.2, daily_volatility: 0.001 },
    { id: 45, symbol: "KOTAK_HYBRID", name: "Kotak Equity Hybrid Fund (G)", asset_type: "MUTUAL_FUND", sector: "Hybrid Aggressive", base_price: 48.6, current_price: 48.6, daily_volatility: 0.007 },
    { id: 46, symbol: "SBI_ARBITRAGE", name: "SBI Arbitrage Opportunities", asset_type: "MUTUAL_FUND", sector: "Hybrid Arbitrage", base_price: 31.4, current_price: 31.4, daily_volatility: 0.002 },
    { id: 47, symbol: "ICICI_EQ_DEBT", name: "ICICI Prudential Equity & Debt", asset_type: "MUTUAL_FUND", sector: "Hybrid Aggressive", base_price: 295.6, current_price: 295.6, daily_volatility: 0.010 },
    { id: 48, symbol: "AXIS_NIFTY_ETF", name: "Axis Nifty 50 ETF FOF (G)", asset_type: "MUTUAL_FUND", sector: "Equity Index Fund", base_price: 250.0, current_price: 250.0, daily_volatility: 0.009 },
    { id: 49, symbol: "HDFC_GOLD_FUND", name: "HDFC Gold Fund (Direct Growth)", asset_type: "MUTUAL_FUND", sector: "Commodity Gold", base_price: 22.8, current_price: 22.8, daily_volatility: 0.008 }
  ];

  const assetStmt = db.prepare("INSERT OR REPLACE INTO assets_master (id, symbol, name, asset_type, sector, base_price, current_price, daily_volatility) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  seedAssets.forEach(a => {
    assetStmt.run(a.id, a.symbol, a.name, a.asset_type, a.sector, a.base_price, a.current_price, a.daily_volatility, function(err) {
      if (err) return;
      const assetId = a.id;
      
      db.get("SELECT COUNT(*) as count FROM price_candlesticks WHERE asset_id = ?", [assetId], (err, row) => {
        if (err || !row || row.count > 0) return;
        
        const now = Date.now();
        const history = generateCandlestickHistory(assetId, a.base_price, a.asset_type, 30, now);
        const candleStmt = db.prepare("INSERT INTO price_candlesticks (asset_id, open, high, low, close, volume, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)");
        history.forEach(c => {
          candleStmt.run(c.asset_id, c.open, c.high, c.low, c.close, c.volume, c.timestamp);
        });
        candleStmt.finalize(() => {
          const finalClose = history[history.length - 1].close;
          db.run("UPDATE assets_master SET current_price = ? WHERE id = ?", [finalClose, assetId]);
        });
      });
    });
  });
  assetStmt.finalize(() => {
    console.log("Seeded database with 49 Abhyas Ultimate assets (Stocks, ETFs, Mutual Funds) and candlesticks");
  });
});

// Rule-based scam detection parameters matching local frontend config
const scamRules = [
  { id: "guaranteed_returns", score: 25, nameEn: "Guaranteed / Fixed Returns Promise", nameHi: "गारंटीड / निश्चित रिटर्न का वादा", patterns: [ /guaranteed\s+(?:profit|return|gain|monthly|daily|weekly)/i, /fixed\s+(?:profit|return|gain|monthly|daily)/i, /double\s+(?:your\s+)?money/i, /100%\s+(?:guaranteed|profit|safe|return|sure)/i, /zero\s+risk/i, /no\s+risk/i, /risk\s*-\s*free/i, /मुनाफ़ा\s+गारंटी/i, /पैसा\s+दोगुना/i, /बिना\s+जोखिम/i, /पक्का\s+रिटर्न/i, /daily\s+\d+%/i, /weekly\s+\d+%/i, /monthly\s+(?:return\s+)?of\s+\d+%/i, /return\s+of\s+\d+%\s+monthly/i, /dono\s+paisa\s+double/i, /double\s+investment/i, /100%\s+sure\s+shot/i ] },
  { id: "urgency_pressure", score: 15, nameEn: "Artificial Urgency & Scarcity", nameHi: "कृत्रिम तात्कालिकता और कमी", patterns: [ /limited\s+(?:seats|slots|offers?|window)/i, /only\s+\d+\s+(?:seats|slots|spots)\s+left/i, /hurry\s+up/i, /act\s+fast/i, /closing\s+(?:soon|today|in\s+\d+)/i, /last\s+chance/i, /don't\s+miss\s+out/i, /opportunity\s+ends/i, /valid\s+only\s+(?:for|till)/i, /जल्दी\s+करें/i, /सीमित\s+सीटें/i, /आखिरी\s+मौका/i, /सिर्फ\s+आज\s+के\s+लिए/i ] },
  { id: "unregistered_solicitation", score: 20, nameEn: "Unsolicited Private Group Invitation", nameHi: "अवांछित निजी समूह आमंत्रण", patterns: [ /join\s+(?:our\s+)?telegram\s+(?:channel|group|vip)/i, /telegram\s*:\s*https?:\/\//i, /whatsapp\s+(?:group|link|chat)/i, /whatsapp\s*:\s*https?:\/\//i, /link\s+in\s+bio/i, /dm\s+me/i, /direct\s+message/i, /vip\s+group/i, /vip\s+channel/i, /premium\s+group/i, /telegram\s+चैनल/i, /व्हाट्सएप\s+ग्रुप/i, /इनबॉक्स\s+में\s+मैसेज\s+करें/i, /t\.me\//i, /chat\.whatsapp\.com/i ] },
  { id: "pump_dump", score: 20, nameEn: "Pump & Dump / Target Price Shouting", nameHi: "पंप एंड डंप / लक्ष्य चिल्लाना", patterns: [ /jackpot\s+stock/i, /multibagger\s+tip/i, /insider\s+(?:tip|info|news)/i, /target\s+price\s*:\s*\d+/i, /target\s*:\s*\d+/i, /buy\s+heavy/i, /bulk\s+buy/i, /tomorrow\s+target/i, /upper\s+circuit/i, /1000%\s+return\s+stock/i, /जैकपॉट\s+शेयर/i, /मल्टीबैगर/i, /अपर\s+सर्किट/i, /टारगेट\s*:\s*\d+/i ] },
  { id: "fake_sebi_advisor", score: 10, nameEn: "Suspicious SEBI Registration Claims", nameHi: "संदिग्ध SEBI पंजीकरण दावे", patterns: [ /sebi\s+(?:approved|certified|registered)\s+advisor/i, /sebi\s+reg\s+(?:no|number)/i, /sebi-approved/i, /government\s+approved/i, /सेबी\s+रजिस्टर्ड/i, /सेबी\s+द्वारा\s+मान्यता/i ] },
  { id: "invalid_sebi_format", score: 25, nameEn: "Invalid SEBI License Number Format", nameHi: "अवैध SEBI लाइसेंस संख्या प्रारूप", patterns: [ /sebi\/reg\/\d+/i, /registration\s+no\s*:\s*(?!IN[AHZ]\d{9})\w+/i, /reg\s+no\s*:\s*(?!IN[AHZ]\d{9})\w+/i, /licence\s*:\s*(?!IN[AHZ]\d{9})\w+/i, /पंजीकरण\s+संख्या\s*:\s*(?!IN[AHZ]\d{9})\w+/i ] },
  { id: "celebrity_endorsement", score: 15, nameEn: "Stolen Celebrity / Influencer Credibility", nameHi: "प्रसिद्ध व्यक्तियों की विश्वसनीयता का दुरुपयोग", patterns: [ /rakesh\s+jhunjhunwala/i, /nikhil\s+kamath/i, /nithin\s+kamath/i, /kamath\s+recommendation/i, /ambani\s+(?:trust|fund|family)/i, /anant\s+ambani/i, /adani\s+(?:secret|group)/i, /निखिल\s+कामत/i, /राकेश\s+झुनझुनवाला/i, /अंबानी/i ] },
  { id: "operator_info", score: 20, nameEn: "Operator Leak / Insider Tip Framing", nameHi: "ऑपरेटर लीक / इनसाइडर जानकारी का दावा", patterns: [ /insider\s+(?:tip|info|news|source)/i, /operator\s+(?:leak|group|info|pump|call)/i, /leak\s+from\s+operator/i, /secret\s+operator/i, /इनसाइडर\s+टिप/i, /ऑपरेटर\s+लीक/i ] },
  { id: "advance_payment", score: 25, nameEn: "Upfront Verification / Processing Fee Request", nameHi: "अग्रिम शुल्क / प्रोसेसिंग फीस का अनुरोध", patterns: [ /refundable\s+(?:fee|security|deposit)/i, /processing\s+(?:fee|charge)/i, /advance\s+payment/i, /pay\s+first/i, /deposit\s+rs\.\s*\d+/i, /pay\s+rs\.\s*\d+/i, /registration\s+charges/i, /अग्रिम\s+भुगतान/i, /प्रोसेसिंग\s+फीस/i, /सिक्योरिटी\s+डिपॉजिट/i ] },
  { id: "profit_sharing", score: 20, nameEn: "Unregulated Profit-Sharing Proposals", nameHi: "अनधिकृत लाभ-साझेदारी प्रस्ताव", patterns: [ /profit\s+sharing\s+agreement/i, /profit\s+split/i, /share\s+your\s+profit/i, /commission\s+after\s+profit/i ] }
];

// Helper to extract clean patterns for reporting
const runScamCheckLocal = (text) => {
  const flags = [];
  scamRules.forEach(rule => {
    let matched = false;
    rule.patterns.forEach(pat => {
      if (new RegExp(pat).test(text)) {
        matched = true;
      }
    });
    if (matched) {
      flags.push(rule.id);
    }
  });
  return flags.join(',');
};

// Endpoints

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SafalNiveshak API is healthy',
    timestamp: new Date().toISOString()
  });
});

// 2. Scam checking pattern check
app.post('/api/scam-check', async (req, res) => {
  const { text, userId } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing inspection text payload." });
  }

  // Rule-based weighted scoring
  let score = 0;
  const findings = [];
  const ranges = [];

  scamRules.forEach(rule => {
    let matched = false;
    rule.patterns.forEach(pat => {
      let match;
      const regex = new RegExp(pat);
      while ((match = regex.exec(text)) !== null) {
        matched = true;
        ranges.push({
          start: match.index,
          end: match.index + match[0].length,
          severity: rule.score >= 20 ? 'high' : 'medium',
          ruleNameEn: rule.nameEn,
          ruleNameHi: rule.nameHi
        });
        if (!regex.global) break; 
      }
    });

    if (matched) {
      score += rule.score;
      findings.push({
        ruleId: rule.id,
        severity: rule.score >= 20 ? 'high' : 'medium',
        nameEn: rule.nameEn,
        nameHi: rule.nameHi,
        descriptionEn: `Offending phrases matched local security rule list: "${rule.nameEn}".`,
        descriptionHi: `संदिग्ध शब्दावली सुरक्षा नियम सूची से मेल खाती है: "${rule.nameHi}".`
      });
    }
  });

  score = Math.min(score, 100);
  let verdict = "LOW";
  if (score >= 50) verdict = "HIGH";
  else if (score >= 15) verdict = "MEDIUM";

  let aiReasoning = null;

  // Optional Free Gemini AI analysis layer
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this forwarded investment tip for fraud and scams in Indian stock market context. Text: "${text}". Provide a short, bilingual (Hinglish/English) verdict explaining the key risks in exactly 2-3 sentences. Keep it brief.`
            }]
          }]
        })
      });
      const data = await response.json();
      aiReasoning = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
      console.warn("Optional Gemini API Call failed/timed out, falling back quietly:", err.message);
    }
  }

  const responsePayload = {
    risk_level: verdict,
    risk_score: score,
    flags: findings,
    ranges,
    verdict_summary: aiReasoning || (verdict === "HIGH" 
      ? "HIGH RISK: Multiple serious warning signs including guaranteed returns or unregistered channels detected. Avoid this tip." 
      : (verdict === "MEDIUM" ? "MODERATE RISK: Caution advised. Verify registration details before committing any funds." : "LOW RISK: No standard scam patterns detected. Make sure to check advisor credentials.")),
    ai_analyzed: !!aiReasoning
  };

  // Persist scan history if userId is provided
  if (userId) {
    const textSnippet = text.substring(0, 55) + (text.length > 55 ? "..." : "");
    const dateStr = new Date().toLocaleDateString('en-IN');
    db.run(
      "INSERT INTO scam_records (userId, textSnippet, score, verdict, date) VALUES (?, ?, ?, ?, ?)",
      [userId, textSnippet, score, verdict, dateStr],
      function (err) {
        if (err) console.error("Could not write scan logs to SQLite:", err.message);
      }
    );
  }

  res.json(responsePayload);
});

// 3. Local SEBI registered advisor lookup
app.get('/api/sebi-ria-lookup', (req, res) => {
  const query = req.query.query || '';
  const searchPattern = `%${query.trim()}%`;

  db.all(
    "SELECT * FROM sebi_advisors WHERE regNo LIKE ? OR name LIKE ? OR address LIKE ? OR email LIKE ?",
    [searchPattern, searchPattern, searchPattern, searchPattern],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Failed to query advisor registry db" });
      }
      res.json(rows);
    }
  );
});

// 4. Save Lesson Progress
app.post('/api/lesson-progress', (req, res) => {
  const { userId, lessonId } = req.body;
  if (!userId || !lessonId) {
    return res.status(400).json({ error: "Missing required userId or lessonId properties." });
  }

  const completedAt = new Date().toISOString();
  db.run(
    "INSERT OR REPLACE INTO lesson_progress (userId, lessonId, completedAt) VALUES (?, ?, ?)",
    [userId, lessonId, completedAt],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to persist lesson progress" });
      }
      res.json({ success: true, completedAt });
    }
  );
});

// 5. Save Track Progress
app.post('/api/track-progress', (req, res) => {
  const { userId, trackId } = req.body;
  if (!userId || !trackId) {
    return res.status(400).json({ error: "Missing required userId or trackId." });
  }

  const completedAt = new Date().toISOString();
  db.run(
    "INSERT OR REPLACE INTO completed_tracks (userId, trackId, completedAt) VALUES (?, ?, ?)",
    [userId, trackId, completedAt],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to clear track assessment" });
      }
      res.json({ success: true, completedAt });
    }
  );
});

// 6. Fetch complete portfolio Passbook record for a userId
app.get('/api/passbook/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all("SELECT lessonId, completedAt FROM lesson_progress WHERE userId = ?", [userId], (err, lessons) => {
    if (err) return res.status(500).json({ error: "Fail to fetch lessons ledger" });

    db.all("SELECT trackId, completedAt FROM completed_tracks WHERE userId = ?", [userId], (err, tracks) => {
      if (err) return res.status(500).json({ error: "Fail to fetch tracks ledger" });

      db.all("SELECT textSnippet, score, verdict, date FROM scam_records WHERE userId = ? ORDER BY id DESC", [userId], (err, scams) => {
        if (err) return res.status(500).json({ error: "Fail to fetch scam logs" });

        res.json({
          completedLessons: lessons.map(l => l.lessonId),
          completedTracks: tracks.map(t => t.trackId),
          scanHistory: scams.map(s => ({
            textSnippet: s.textSnippet,
            score: s.score,
            verdict: s.verdict,
            date: s.date
          }))
        });
      });
    });
  });
});

// 7. Community Reporting: Increment on duplicate or insert new reported scam
app.post('/api/report-scam', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Report text payload is required" });
  }

  const cleanedText = text.trim();
  const dateStr = new Date().toLocaleDateString('en-IN');
  const matchedPatterns = runScamCheckLocal(cleanedText);

  db.get("SELECT id, reportCount FROM reported_scams WHERE messageText = ?", [cleanedText], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Failed to query reported scams database" });
    }

    if (row) {
      db.run(
        "UPDATE reported_scams SET reportCount = reportCount + 1, lastReported = ? WHERE id = ?",
        [dateStr, row.id],
        function (updateErr) {
          if (updateErr) {
            return res.status(500).json({ error: "Failed to increment scam report ledger tally" });
          }
          res.json({ success: true, count: row.reportCount + 1, action: "incremented" });
        }
      );
    } else {
      db.run(
        "INSERT INTO reported_scams (messageText, patterns, reportCount, lastReported) VALUES (?, ?, 1, ?)",
        [cleanedText, matchedPatterns, dateStr],
        function (insertErr) {
          if (insertErr) {
            return res.status(500).json({ error: "Failed to log new crowdsourced report in database" });
          }
          res.json({ success: true, count: 1, action: "inserted" });
        }
      );
    }
  });
});

// 8. Community reported scams feed list (ordered by reportCount DESC)
app.get('/api/reported-scams', (req, res) => {
  db.all(
    "SELECT messageText, patterns, reportCount, lastReported FROM reported_scams ORDER BY reportCount DESC LIMIT 5",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch crowdsourced reported scams log" });
      }
      res.json(rows);
    }
  );
});

// ==========================================
// ABHYAS (PRACTICE) PAPER TRADING ENDPOINTS
// ==========================================

const STOCK_FALLBACKS = {
  "RELIANCE.NS": { name: "Reliance Industries Ltd", price: 2450.00, change: 1.4, desc: "Reliance Industries is one of India's largest conglomerates. It runs Jio telecom, Reliance Retail stores, and has a large oil refining and petrochemicals business." },
  "TCS.NS": { name: "Tata Consultancy Services Ltd", price: 3850.00, change: -0.8, desc: "Tata Consultancy Services is India's largest IT services company, helping businesses worldwide build software and manage their technology systems." },
  "INFY.NS": { name: "Infosys Ltd", price: 1540.00, change: 0.5, desc: "Infosys is a pioneer in India's software export sector, providing business consulting, information technology, and outsourcing services globally." },
  "HDFCBANK.NS": { name: "HDFC Bank Ltd", price: 1620.00, change: -0.2, desc: "HDFC Bank is India's largest private sector bank, providing retail banking, credit cards, corporate loans, and digital financial services." },
  "ICICIBANK.NS": { name: "ICICI Bank Ltd", price: 1110.00, change: 1.1, desc: "ICICI Bank is a major Indian private sector bank offering a wide range of retail banking, investment banking, and insurance services." },
  "SBIN.NS": { name: "State Bank of India", price: 830.00, change: 2.3, desc: "State Bank of India is the nation's largest public sector bank, managing savings and loans for hundreds of millions of Indian citizens." },
  "WIPRO.NS": { name: "Wipro Ltd", price: 460.00, change: -1.2, desc: "Wipro is a leading global information technology, consulting, and business process services company headquartered in Bengaluru." },
  "BAJFINANCE.NS": { name: "Bajaj Finance Ltd", price: 6850.00, change: 0.1, desc: "Bajaj Finance is one of India's largest non-banking financial companies (NBFC), popular for consumer loans, EMI financing, and personal loans." },
  "ASIANPAINT.NS": { name: "Asian Paints Ltd", price: 2890.00, change: -0.5, desc: "Asian Paints is India's leading paint manufacturer, famous for home decor, industrial coatings, and retail wall paint brands." },
  "TITAN.NS": { name: "Titan Company Ltd", price: 3250.00, change: 0.8, desc: "Titan Company is a major Indian consumer goods brand, best known for watches, Tanishq jewellery, and Fastrack accessories." },
  "ZOMATO.NS": { name: "Zomato Ltd", price: 265.00, change: 4.2, desc: "Zomato is India's leading online food delivery platform and restaurant search directory, also running the quick-commerce app Blinkit." },
  "NAUKRI.NS": { name: "Info Edge (India) Ltd", price: 5950.00, change: -2.1, desc: "Info Edge runs Naukri.com, India's leading job recruitment portal, as well as property portal 99acres and matrimonial portal Jeevansathi." },
  "ITC.NS": { name: "ITC Ltd", price: 430.00, change: 0.3, desc: "ITC is a diversified conglomerate with businesses in consumer goods (cigarettes, Aashirvaad flour, Sunfeast), hotels, paperboards, and agriculture." },
  "MARUTI.NS": { name: "Maruti Suzuki India Ltd", price: 12100.00, change: 1.2, desc: "Maruti Suzuki is India's largest passenger car manufacturer, dominating the Indian automotive sector for over four decades." },
  "COALINDIA.NS": { name: "Coal India Ltd", price: 470.00, change: -0.4, desc: "Coal India is a state-owned coal mining corporation, producing a majority of the coal that powers India's electricity plants." },
  "TATAMOTORS.NS": { name: "Tata Motors Ltd", price: 960.00, change: 1.7, desc: "Tata Motors is a major Indian automotive manufacturer, producing cars, utility vehicles, trucks, and buses, and owning Jaguar Land Rover." },
  "JIOFIN.NS": { name: "Jio Financial Services Ltd", price: 345.00, change: 0.9, desc: "Jio Financial Services is the financial services arm spun out of Reliance, offering digital lending, payments, and insurance services." },
  "NIFTY50.MF": { name: "Nifty 50 Index Fund", price: 125.50, change: 0.4, desc: "This mutual fund tracks the Nifty 50 index, buying shares of India's top 50 largest companies in equal proportion. Low cost and highly diversified." },
  "NIFTYNEXT50.MF": { name: "Nifty Next 50 Index Fund", price: 95.20, change: 0.7, desc: "This mutual fund tracks the next 50 largest companies in India after the top 50, offering high growth potential with slightly higher risk." },
  "ELSS.MF": { name: "ELSS Tax Saver Fund", price: 155.80, change: 0.2, desc: "Equity Linked Savings Scheme (ELSS) is a mutual fund that offers tax benefits under Section 80C, with a lock-in period of 3 years." }
};

const priceCache = {};

async function getOrFetchPrice(symbol) {
  const fallback = STOCK_FALLBACKS[symbol];
  if (!fallback) return null;

  const now = Date.now();
  const cached = priceCache[symbol];
  
  // 15 mins cache
  if (cached && (now - cached.timestamp < 900000)) {
    return {
      price: cached.price,
      change: cached.change,
      name: fallback.name,
      desc: fallback.desc,
      isLive: true,
      asOf: "Live (Yahoo Finance)"
    };
  }

  if (symbol.endsWith('.MF')) {
    return {
      price: fallback.price,
      change: fallback.change,
      name: fallback.name,
      desc: fallback.desc,
      isLive: false,
      asOf: "NAV seeded data"
    };
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!res.ok) throw new Error("Yahoo API error");
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (meta && typeof meta.regularMarketPrice === 'number') {
      const price = parseFloat(meta.regularMarketPrice.toFixed(2));
      const prevClose = meta.chartPreviousClose || price;
      const change = parseFloat(((price - prevClose) / prevClose * 100).toFixed(2));
      
      priceCache[symbol] = { price, change, timestamp: now };
      return {
        price,
        change,
        name: fallback.name,
        desc: fallback.desc,
        isLive: true,
        asOf: "Live (Yahoo Finance)"
      };
    }
  } catch (err) {
    // Graceful fallback printed in console
  }

  return {
    price: fallback.price,
    change: fallback.change,
    name: fallback.name,
    desc: fallback.desc,
    isLive: false,
    asOf: "Prices as of July 9, 2026 (Fallback)"
  };
}

// 1. Fetch available stock catalog
app.get('/api/abhyas/stocks', async (req, res) => {
  try {
    const symbols = Object.keys(STOCK_FALLBACKS);
    const results = [];
    for (const sym of symbols) {
      const info = await getOrFetchPrice(sym);
      if (info) {
        results.push({ symbol: sym, ...info });
      }
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to load stocks list" });
  }
});

// 2. Fetch portfolio holdings and transactions
app.get('/api/abhyas/portfolio/:userId', (req, res) => {
  const userId = req.params.userId;
  
  db.get("SELECT balance FROM paper_balances WHERE userId = ?", [userId], (err, balanceRow) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const balance = balanceRow ? balanceRow.balance : 100000;
    
    if (!balanceRow) {
      db.run("INSERT INTO paper_balances (userId, balance) VALUES (?, 100000)", [userId]);
    }

    db.all("SELECT symbol, name, quantity, avgBuyPrice FROM paper_holdings WHERE userId = ?", [userId], (holdingsErr, holdings) => {
      if (holdingsErr) return res.status(500).json({ error: holdingsErr.message });

      db.all("SELECT id, symbol, name, type, quantity, price, timestamp FROM paper_transactions WHERE userId = ? ORDER BY id DESC", [userId], (txErr, transactions) => {
        if (txErr) return res.status(500).json({ error: txErr.message });

        res.json({
          balance,
          holdings: holdings || [],
          transactions: transactions || []
        });
      });
    });
  });
});

// 3. Trade Action execution (Virtual Practice BUY/SELL)
app.post('/api/abhyas/trade', async (req, res) => {
  const { userId, symbol, type, quantity, price } = req.body;
  const fallback = STOCK_FALLBACKS[symbol];
  if (!fallback) return res.status(400).json({ error: "Invalid stock symbol" });

  const qtyInt = parseInt(quantity);
  if (isNaN(qtyInt) || qtyInt <= 0) {
    return res.status(400).json({ error: "Invalid quantity specifier" });
  }

  const priceInfo = await getOrFetchPrice(symbol);
  const priceToUse = priceInfo ? priceInfo.price : fallback.price;
  const totalCost = priceToUse * qtyInt;

  db.get("SELECT balance FROM paper_balances WHERE userId = ?", [userId], (err, balanceRow) => {
    if (err) return res.status(500).json({ error: err.message });
    const currentBalance = balanceRow ? balanceRow.balance : 100000;

    if (type === 'BUY') {
      if (currentBalance < totalCost) {
        return res.status(400).json({ error: "Tumhare Abhyas balance mein itna nahi hai. Try a smaller quantity." });
      }

      const newBalance = currentBalance - totalCost;

      db.get("SELECT quantity, avgBuyPrice FROM paper_holdings WHERE userId = ? AND symbol = ?", [userId, symbol], (holdingErr, holding) => {
        if (holdingErr) return res.status(500).json({ error: holdingErr.message });

        let newQty = qtyInt;
        let newAvg = priceToUse;

        if (holding) {
          newQty = holding.quantity + qtyInt;
          newAvg = ((holding.quantity * holding.avgBuyPrice) + totalCost) / newQty;

          db.run(
            "UPDATE paper_holdings SET quantity = ?, avgBuyPrice = ? WHERE userId = ? AND symbol = ?",
            [newQty, newAvg, userId, symbol]
          );
        } else {
          db.run(
            "INSERT INTO paper_holdings (userId, symbol, name, quantity, avgBuyPrice) VALUES (?, ?, ?, ?, ?)",
            [userId, symbol, fallback.name, qtyInt, priceToUse]
          );
        }

        db.run("INSERT OR REPLACE INTO paper_balances (userId, balance) VALUES (?, ?)", [userId, newBalance]);

        const dateStr = new Date().toLocaleString();
        db.run(
          "INSERT INTO paper_transactions (userId, symbol, name, type, quantity, price, timestamp) VALUES (?, ?, ?, 'BUY', ?, ?, ?)",
          [userId, symbol, fallback.name, qtyInt, priceToUse, dateStr]
        );

        res.json({ success: true, balance: newBalance });
      });

    } else if (type === 'SELL') {
      db.get("SELECT quantity, avgBuyPrice FROM paper_holdings WHERE userId = ? AND symbol = ?", [userId, symbol], (holdingErr, holding) => {
        if (holdingErr) return res.status(500).json({ error: holdingErr.message });

        if (!holding || holding.quantity < qtyInt) {
          return res.status(400).json({ error: "Holdings balance mismatch for SELL action." });
        }

        const newQty = holding.quantity - qtyInt;
        const proceeds = priceToUse * qtyInt;
        const newBalance = currentBalance + proceeds;

        if (newQty === 0) {
          db.run("DELETE FROM paper_holdings WHERE userId = ? AND symbol = ?", [userId, symbol]);
        } else {
          db.run(
            "UPDATE paper_holdings SET quantity = ? WHERE userId = ? AND symbol = ?",
            [newQty, symbol, userId]
          );
        }

        db.run("INSERT OR REPLACE INTO paper_balances (userId, balance) VALUES (?, ?)", [userId, newBalance]);

        const dateStr = new Date().toLocaleString();
        db.run(
          "INSERT INTO paper_transactions (userId, symbol, name, type, quantity, price, timestamp) VALUES (?, ?, ?, 'SELL', ?, ?, ?)",
          [userId, symbol, fallback.name, qtyInt, priceToUse, dateStr]
        );

        res.json({ success: true, balance: newBalance });
      });
    }
  });
});

// 4. Reset Abhyas practice portfolio state
app.post('/api/abhyas/reset', (req, res) => {
  const { userId } = req.body;
  db.serialize(() => {
    db.run("DELETE FROM paper_holdings WHERE userId = ?", [userId]);
    db.run("DELETE FROM paper_transactions WHERE userId = ?", [userId]);
    db.run("DELETE FROM mf_portfolio WHERE userId = ?", [userId]);
    db.run("DELETE FROM mf_transactions WHERE userId = ?", [userId]);
    db.run("DELETE FROM mf_sip_mandates WHERE userId = ?", [userId]);
    db.run("DELETE FROM user_portfolio WHERE userId = ?", [userId]);
    db.run("DELETE FROM systematic_mandates WHERE userId = ?", [userId]);
    db.run("DELETE FROM transaction_ledger WHERE userId = ?", [userId]);
    db.run("INSERT OR REPLACE INTO paper_balances (userId, balance) VALUES (?, 100000)", [userId]);
    res.json({ success: true, balance: 100000 });
  });
});

// ==========================================
// MUTUAL FUND & SIP SIMULATOR BACKEND
// ==========================================

// Simulated NAV generation based on system timestamp
function getSimulatedNAV(fund, timestamp) {
  const timeFactor = (timestamp % 604800000) / 604800000; // weekly cycle
  const hourlyFactor = (timestamp % 86400000) / 86400000; // daily cycle
  
  const category = fund.category || fund.sector || '';
  const base_nav = fund.base_nav || fund.base_price || 10.0;
  
  let variance = 0.15; // default
  if (category.includes("Small Cap")) variance = 0.35;
  else if (category.includes("Mid Cap")) variance = 0.25;
  else if (category.includes("Large Cap")) variance = 0.15;
  else if (category.includes("Debt")) variance = 0.05;
  else if (category.includes("Liquid")) variance = 0.01;

  const change = Math.sin(timeFactor * Math.PI * 2) * 0.7 + Math.cos(hourlyFactor * Math.PI * 4) * 0.3;
  const currentNav = base_nav * (1 + change * variance);
  return parseFloat(currentNav.toFixed(4));
}

// XIRR Calculation Newton-Raphson Solver
function calculateXIRR(cashflows) {
  if (!cashflows || cashflows.length < 2) return 0;

  // Sort cashflows by date
  const sorted = [...cashflows].sort((a, b) => new Date(a.date) - new Date(b.date));

  // We need at least one positive and one negative cashflow
  let hasPositive = false;
  let hasNegative = false;
  let totalInflow = 0;
  let totalOutflow = 0;

  sorted.forEach(cf => {
    if (cf.amount > 0) {
      hasPositive = true;
      totalInflow += cf.amount;
    }
    if (cf.amount < 0) {
      hasNegative = true;
      totalOutflow += Math.abs(cf.amount);
    }
  });

  if (!hasPositive || !hasNegative) return 0;

  const t0 = new Date(sorted[0].date).getTime();
  const tEnd = new Date(sorted[sorted.length - 1].date).getTime();
  const totalDays = (tEnd - t0) / (1000 * 60 * 60 * 24);

  // If time period is under 1 day (e.g. trades executed today),
  // annualization mathematically explodes. Return simple percentage ROI instead.
  if (totalDays < 1.0) {
    if (totalOutflow === 0) return 0;
    const simpleRoi = ((totalInflow - totalOutflow) / totalOutflow) * 100;
    return isNaN(simpleRoi) || !isFinite(simpleRoi) ? 0 : parseFloat(simpleRoi.toFixed(2));
  }

  const f = (r) => {
    let sum = 0;
    for (let i = 0; i < sorted.length; i++) {
      const days = (new Date(sorted[i].date).getTime() - t0) / (1000 * 60 * 60 * 24);
      sum += sorted[i].amount / Math.pow(1 + r, days / 365);
    }
    return sum;
  };

  const df = (r) => {
    let sum = 0;
    for (let i = 0; i < sorted.length; i++) {
      const days = (new Date(sorted[i].date).getTime() - t0) / (1000 * 60 * 60 * 24);
      sum -= (days / 365) * sorted[i].amount / Math.pow(1 + r, (days / 365) + 1);
    }
    return sum;
  };

  // Newton-Raphson method
  let r = 0.1; // initial guess: 10%
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    const y = f(r);
    const dy = df(r);
    if (Math.abs(dy) < 1e-12) break;
    const rNext = r - y / dy;
    if (Math.abs(rNext - r) < tolerance) {
      const pct = rNext * 100;
      if (!isFinite(pct) || isNaN(pct) || Math.abs(pct) > 999) {
        return totalOutflow > 0 ? parseFloat((((totalInflow - totalOutflow) / totalOutflow) * 100).toFixed(2)) : 0;
      }
      return parseFloat(pct.toFixed(2));
    }
    r = rNext;
  }
  
  const finalPct = r * 100;
  if (!isFinite(finalPct) || isNaN(finalPct) || Math.abs(finalPct) > 999) {
    return totalOutflow > 0 ? parseFloat((((totalInflow - totalOutflow) / totalOutflow) * 100).toFixed(2)) : 0;
  }
  return parseFloat(finalPct.toFixed(2));
}

// SIP Mandates background processor
function executeDueSIPs(userId, callback) {
  // Finds active mandates for this user
  db.all("SELECT m.*, f.base_nav, f.category, f.symbol, f.name FROM mf_sip_mandates m JOIN mf_funds f ON m.fund_id = f.id WHERE m.userId = ? AND m.status = 'ACTIVE'", [userId], (err, mandates) => {
    if (err || !mandates || mandates.length === 0) {
      return callback();
    }

    const now = Date.now();
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    
    // We will process each mandate sequentially
    let processedCount = 0;
    
    const nextMandate = () => {
      if (processedCount >= mandates.length) {
        return callback();
      }
      
      const m = mandates[processedCount];
      const lastExecution = m.last_executed_date ? new Date(m.last_executed_date).getTime() : new Date(m.start_date).getTime() - oneMonthMs;
      const timeElapsed = now - lastExecution;
      const cyclesDue = Math.floor(timeElapsed / oneMonthMs);
      
      if (cyclesDue <= 0) {
        processedCount++;
        return nextMandate();
      }
      
      let executedCycles = 0;
      
      const nextCycle = () => {
        if (executedCycles >= cyclesDue) {
          const finalExecDate = new Date(lastExecution + cyclesDue * oneMonthMs).toISOString();
          db.run("UPDATE mf_sip_mandates SET last_executed_date = ? WHERE id = ?", [finalExecDate, m.id], (err) => {
            processedCount++;
            nextMandate();
          });
          return;
        }
        
        const cycleTime = lastExecution + (executedCycles + 1) * oneMonthMs;
        const nav = getSimulatedNAV(m, cycleTime);
        const buyAmount = m.monthly_amount;
        
        db.get("SELECT balance FROM paper_balances WHERE userId = ?", [userId], (err, balanceRow) => {
          const balance = balanceRow ? balanceRow.balance : 100000.0;
          
          if (balance < buyAmount) {
            db.run("UPDATE mf_sip_mandates SET status = 'PAUSED' WHERE id = ?", [m.id], () => {
              processedCount++;
              nextMandate();
            });
            return;
          }
          
          const allocatedUnits = parseFloat((buyAmount / nav).toFixed(4));
          const newBalance = balance - buyAmount;
          const timestamp = new Date(cycleTime).toLocaleString('en-IN');
          
          db.serialize(() => {
            db.run("INSERT OR REPLACE INTO paper_balances (userId, balance) VALUES (?, ?)", [userId, newBalance]);
            db.run("INSERT INTO mf_transactions (userId, fund_id, type, amount, units, nav, timestamp) VALUES (?, ?, 'BUY_SIP', ?, ?, ?, ?)",
              [userId, m.fund_id, buyAmount, allocatedUnits, nav, timestamp]);
              
            db.get("SELECT * FROM mf_portfolio WHERE userId = ? AND fund_id = ?", [userId, m.fund_id], (err, holding) => {
              if (holding) {
                const newUnits = holding.total_units + allocatedUnits;
                const newInvested = holding.invested_amount + buyAmount;
                const newAvgNav = parseFloat((newInvested / newUnits).toFixed(4));
                db.run("UPDATE mf_portfolio SET total_units = ?, average_nav = ?, invested_amount = ? WHERE userId = ? AND fund_id = ?",
                  [newUnits, newAvgNav, newInvested, userId, m.fund_id], () => {
                    executedCycles++;
                    nextCycle();
                  });
              } else {
                db.run("INSERT INTO mf_portfolio (userId, fund_id, total_units, average_nav, invested_amount) VALUES (?, ?, ?, ?, ?)",
                  [userId, m.fund_id, allocatedUnits, nav, buyAmount], () => {
                    executedCycles++;
                    nextCycle();
                  });
              }
            });
          });
        });
      };
      
      nextCycle();
    };
    
    nextMandate();
  });
}

// 1. Fetch Mutual Funds list with simulated NAV and history
app.get('/api/mf/funds', (req, res) => {
  db.all("SELECT * FROM assets_master WHERE asset_type = 'MUTUAL_FUND'", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch mutual funds" });
    
    const now = Date.now();
    const results = rows.map(fund => {
      const current_nav = fund.current_price;
      
      const history = [];
      const oneDayMs = 24 * 60 * 60 * 1000;
      for (let i = 29; i >= 0; i--) {
        const time = now - i * oneDayMs;
        history.push({
          date: new Date(time).toLocaleDateString('en-IN'),
          nav: getSimulatedNAV(fund, time)
        });
      }
      
      const nav30DaysAgo = getSimulatedNAV(fund, now - 30 * oneDayMs);
      const monthly_growth = parseFloat(((current_nav - nav30DaysAgo) / nav30DaysAgo * 100).toFixed(2));
      
      let expense_ratio = 0.35;
      if (fund.sector.includes("Small Cap")) expense_ratio = 0.75;
      else if (fund.sector.includes("Mid Cap")) expense_ratio = 0.60;
      else if (fund.sector.includes("Large Cap")) expense_ratio = 0.20;
      else if (fund.sector.includes("Liquid")) expense_ratio = 0.15;

      return {
        id: fund.id,
        symbol: fund.symbol,
        name: fund.name,
        category: fund.sector,
        base_nav: fund.base_price,
        current_nav: current_nav,
        expense_ratio: expense_ratio,
        monthly_growth: monthly_growth,
        nav_history: history
      };
    });
    res.json(results);
  });
});

// 2. Execute Lumpsum BUY / SELL order
app.post('/api/mf/transact', (req, res) => {
  const { userId, fundId, type, amount, units } = req.body;
  if (!userId || !fundId || !type) {
    return res.status(400).json({ error: "Missing required transaction fields" });
  }
  
  db.get("SELECT * FROM assets_master WHERE id = ? AND asset_type = 'MUTUAL_FUND'", [fundId], (err, fund) => {
    if (err || !fund) return res.status(404).json({ error: "Mutual fund not found" });
    
    const now = Date.now();
    const nav = fund.current_price;
    
    db.get("SELECT balance FROM paper_balances WHERE userId = ?", [userId], (err, balanceRow) => {
      if (err) return res.status(500).json({ error: "Balance lookup failed" });
      const balance = balanceRow ? balanceRow.balance : 100000.0;
      
      if (type === 'BUY_LUMPSUM') {
        const buyAmount = parseFloat(amount);
        if (isNaN(buyAmount) || buyAmount <= 0) {
          return res.status(400).json({ error: "Invalid transaction amount" });
        }
        if (balance < buyAmount) {
          return res.status(400).json({ error: "Insufficient balance in virtual wallet" });
        }
        
        const allocatedUnits = parseFloat((buyAmount / nav).toFixed(4));
        const newBalance = balance - buyAmount;
        const timestamp = new Date().toLocaleString();
        
        db.serialize(() => {
          db.run("INSERT OR REPLACE INTO paper_balances (userId, balance) VALUES (?, ?)", [userId, newBalance]);
          db.run("INSERT INTO mf_transactions (userId, fund_id, type, amount, units, nav, timestamp) VALUES (?, ?, 'BUY_LUMPSUM', ?, ?, ?, ?)",
            [userId, fundId, buyAmount, allocatedUnits, nav, timestamp]);
            
          db.get("SELECT * FROM mf_portfolio WHERE userId = ? AND fund_id = ?", [userId, fundId], (err, holding) => {
            if (holding) {
              const newUnits = holding.total_units + allocatedUnits;
              const newInvested = holding.invested_amount + buyAmount;
              const newAvgNav = parseFloat((newInvested / newUnits).toFixed(4));
              
              db.run("UPDATE mf_portfolio SET total_units = ?, average_nav = ?, invested_amount = ? WHERE userId = ? AND fund_id = ?",
                [newUnits, newAvgNav, newInvested, userId, fundId]);
            } else {
              db.run("INSERT INTO mf_portfolio (userId, fund_id, total_units, average_nav, invested_amount) VALUES (?, ?, ?, ?, ?)",
                [userId, fundId, allocatedUnits, nav, buyAmount]);
            }
          });
        });
        
        return res.json({ success: true, balance: newBalance });
      } else if (type === 'SELL') {
        db.get("SELECT * FROM mf_portfolio WHERE userId = ? AND fund_id = ?", [userId, fundId], (err, holding) => {
          if (err || !holding || holding.total_units <= 0) {
            return res.status(400).json({ error: "You do not hold any units of this mutual fund" });
          }
          
          let sellUnits = 0;
          let sellAmount = 0;
          
          if (units !== undefined) {
            sellUnits = parseFloat(units);
            sellAmount = parseFloat((sellUnits * nav).toFixed(2));
          } else if (amount !== undefined) {
            sellAmount = parseFloat(amount);
            sellUnits = parseFloat((sellAmount / nav).toFixed(4));
          } else {
            return res.status(400).json({ error: "Must specify amount or units to sell" });
          }
          
          if (isNaN(sellUnits) || sellUnits <= 0) {
            return res.status(400).json({ error: "Invalid units or amount value" });
          }
          
          if (holding.total_units < sellUnits - 0.0001) {
            return res.status(400).json({ error: `Insufficient units in portfolio. You hold ${holding.total_units} units.` });
          }
          
          const isFullRedemption = Math.abs(holding.total_units - sellUnits) < 0.005;
          const finalSellUnits = isFullRedemption ? holding.total_units : sellUnits;
          const finalSellAmount = isFullRedemption ? parseFloat((holding.total_units * nav).toFixed(2)) : sellAmount;
          
          const newBalance = balance + finalSellAmount;
          const timestamp = new Date().toLocaleString();
          
          db.serialize(() => {
            db.run("INSERT OR REPLACE INTO paper_balances (userId, balance) VALUES (?, ?)", [userId, newBalance]);
            db.run("INSERT INTO mf_transactions (userId, fund_id, type, amount, units, nav, timestamp) VALUES (?, ?, 'SELL', ?, ?, ?, ?)",
              [userId, fundId, finalSellAmount, finalSellUnits, nav, timestamp]);
              
            if (isFullRedemption) {
              db.run("DELETE FROM mf_portfolio WHERE userId = ? AND fund_id = ?", [userId, fundId]);
            } else {
              const newUnits = holding.total_units - finalSellUnits;
              const newInvested = Math.max(0, holding.invested_amount - (finalSellUnits * holding.average_nav));
              
              db.run("UPDATE mf_portfolio SET total_units = ?, invested_amount = ? WHERE userId = ? AND fund_id = ?",
                [newUnits, newInvested, userId, fundId]);
            }
          });
          
          return res.json({ success: true, balance: newBalance });
        });
      } else {
        return res.status(400).json({ error: "Unsupported transaction type" });
      }
    });
  });
});

// 3. Create a recurring monthly SIP mandate
app.post('/api/mf/sip/schedule', (req, res) => {
  const { userId, fundId, monthly_amount } = req.body;
  if (!userId || !fundId || !monthly_amount) {
    return res.status(400).json({ error: "Missing SIP schedule parameters" });
  }
  
  const amount = parseFloat(monthly_amount);
  if (isNaN(amount) || amount < 500) {
    return res.status(400).json({ error: "Minimum monthly SIP amount is ₹500" });
  }
  
  db.get("SELECT id FROM assets_master WHERE id = ? AND asset_type = 'MUTUAL_FUND'", [fundId], (err, fund) => {
    if (err || !fund) return res.status(404).json({ error: "Mutual fund not found" });
    
    const startDate = new Date().toISOString();
    
    db.run(
      "INSERT INTO mf_sip_mandates (userId, fund_id, monthly_amount, start_date, last_executed_date, status) VALUES (?, ?, ?, ?, NULL, 'ACTIVE')",
      [userId, fundId, amount, startDate],
      function(err) {
        if (err) return res.status(500).json({ error: "Failed to schedule SIP mandate" });
        res.json({ success: true, mandateId: this.lastID });
      }
    );
  });
});

// 4. Force execute an active SIP cycle (Fast-Forward demo capability)
app.post('/api/mf/sip/trigger', (req, res) => {
  const { userId, mandateId } = req.body;
  if (!userId || !mandateId) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  db.get(`
    SELECT m.*, f.base_price as base_nav, f.sector as category, f.symbol, f.name 
    FROM mf_sip_mandates m 
    JOIN assets_master f ON m.fund_id = f.id 
    WHERE m.id = ? AND m.userId = ? AND m.status = 'ACTIVE'
  `, [mandateId, userId], (err, m) => {
    if (err || !m) return res.status(404).json({ error: "Active SIP mandate not found" });

    const now = Date.now();
    const nav = getSimulatedNAV(m, now);
    const buyAmount = m.monthly_amount;

    db.get("SELECT balance FROM paper_balances WHERE userId = ?", [userId], (err, balanceRow) => {
      const balance = balanceRow ? balanceRow.balance : 100000.0;
      if (balance < buyAmount) {
        return res.status(400).json({ error: "Insufficient virtual balance to execute this SIP cycle" });
      }

      const allocatedUnits = parseFloat((buyAmount / nav).toFixed(4));
      const newBalance = balance - buyAmount;
      const timestamp = new Date().toLocaleString();

      db.serialize(() => {
        db.run("INSERT OR REPLACE INTO paper_balances (userId, balance) VALUES (?, ?)", [userId, newBalance]);
        db.run("INSERT INTO mf_transactions (userId, fund_id, type, amount, units, nav, timestamp) VALUES (?, ?, 'BUY_SIP', ?, ?, ?, ?)",
          [userId, m.fund_id, buyAmount, allocatedUnits, nav, timestamp]);
        db.run("UPDATE mf_sip_mandates SET last_executed_date = ? WHERE id = ?", [new Date().toISOString(), mandateId]);

        db.get("SELECT * FROM mf_portfolio WHERE userId = ? AND fund_id = ?", [userId, m.fund_id], (err, holding) => {
          if (holding) {
            const newUnits = holding.total_units + allocatedUnits;
            const newInvested = holding.invested_amount + buyAmount;
            const newAvgNav = parseFloat((newInvested / newUnits).toFixed(4));
            db.run("UPDATE mf_portfolio SET total_units = ?, average_nav = ?, invested_amount = ? WHERE userId = ? AND fund_id = ?",
              [newUnits, newAvgNav, newInvested, userId, m.fund_id], () => {
                res.json({ success: true, balance: newBalance });
              });
          } else {
            db.run("INSERT INTO mf_portfolio (userId, fund_id, total_units, average_nav, invested_amount) VALUES (?, ?, ?, ?, ?)",
              [userId, m.fund_id, allocatedUnits, nav, buyAmount], () => {
                res.json({ success: true, balance: newBalance });
              });
          }
        });
      });
    });
  });
});

// 5. Get portfolio metrics, history, XIRR indices
app.get('/api/mf/portfolio/:userId', (req, res) => {
  const { userId } = req.params;
  
  executeDueSIPs(userId, () => {
    db.all(`
      SELECT p.*, f.symbol, f.name, f.sector as category, f.base_price as base_nav 
      FROM mf_portfolio p 
      JOIN assets_master f ON p.fund_id = f.id 
      WHERE p.userId = ?
    `, [userId], (err, holdings) => {
      if (err) return res.status(500).json({ error: "Failed to load portfolio holdings" });
      
      db.all(`
        SELECT m.*, f.name as fund_name, f.symbol as fund_symbol 
        FROM mf_sip_mandates m 
        JOIN assets_master f ON m.fund_id = f.id 
        WHERE m.userId = ?
      `, [userId], (err, mandates) => {
        if (err) return res.status(500).json({ error: "Failed to load SIP mandates" });
        
        db.all(`
          SELECT t.*, f.name as fund_name, f.symbol as fund_symbol 
          FROM mf_transactions t 
          JOIN assets_master f ON t.fund_id = f.id 
          WHERE t.userId = ? 
          ORDER BY t.id DESC
        `, [userId], (err, txs) => {
          if (err) return res.status(500).json({ error: "Failed to load transaction logs" });
          
          db.get("SELECT balance FROM paper_balances WHERE userId = ?", [userId], (err, balanceRow) => {
            const balance = balanceRow ? balanceRow.balance : 100000.0;
            
            const now = Date.now();
            let totalInvested = 0;
            let totalCurrentValue = 0;
            
            const processedHoldings = holdings.map(h => {
              const currentNav = getSimulatedNAV(h, now);
              const currentValue = parseFloat((h.total_units * currentNav).toFixed(2));
              
              totalInvested += h.invested_amount;
              totalCurrentValue += currentValue;
              
              const absoluteReturn = parseFloat((currentValue - h.invested_amount).toFixed(2));
              const absoluteReturnPct = h.invested_amount > 0 ? parseFloat((absoluteReturn / h.invested_amount * 100).toFixed(2)) : 0;
              
              const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
              const nav30DaysAgo = getSimulatedNAV(h, now - oneMonthMs);
              const monthlyGrowth = parseFloat(((currentNav - nav30DaysAgo) / nav30DaysAgo * 100).toFixed(2));
              
              const fundCashflows = [];
              txs.filter(t => t.fund_id === h.fund_id).forEach(t => {
                const sign = t.type.startsWith('BUY') ? -1 : 1;
                fundCashflows.push({
                  amount: sign * t.amount,
                  date: new Date(t.timestamp)
                });
              });
              if (currentValue > 0) {
                fundCashflows.push({
                  amount: currentValue,
                  date: new Date(now)
                });
              }
              const fundXIRR = parseFloat(calculateXIRR(fundCashflows).toFixed(2));
              
              let expense_ratio = 0.35;
              if (h.category.includes("Small Cap")) expense_ratio = 0.75;
              else if (h.category.includes("Mid Cap")) expense_ratio = 0.60;
              else if (h.category.includes("Large Cap")) expense_ratio = 0.20;
              else if (h.category.includes("Liquid")) expense_ratio = 0.15;

              return {
                fund_id: h.fund_id,
                symbol: h.symbol,
                name: h.name,
                category: h.category,
                total_units: h.total_units,
                average_nav: h.average_nav,
                current_nav: currentNav,
                invested_amount: h.invested_amount,
                current_value: currentValue,
                absolute_return: absoluteReturn,
                absolute_return_pct: absoluteReturnPct,
                monthly_growth: monthlyGrowth,
                xirr: fundXIRR,
                expense_ratio
              };
            });
            
            const portfolioCashflows = [];
            txs.forEach(t => {
              const sign = t.type.startsWith('BUY') ? -1 : 1;
              portfolioCashflows.push({
                amount: sign * t.amount,
                date: new Date(t.timestamp)
              });
            });
            if (totalCurrentValue > 0) {
              portfolioCashflows.push({
                amount: totalCurrentValue,
                date: new Date(now)
              });
            }
            const portfolioXIRR = parseFloat(calculateXIRR(portfolioCashflows).toFixed(2));
            
            const totalAbsoluteReturn = parseFloat((totalCurrentValue - totalInvested).toFixed(2));
            const totalAbsoluteReturnPct = totalInvested > 0 ? parseFloat((totalAbsoluteReturn / totalInvested * 100).toFixed(2)) : 0;
            
            res.json({
              balance: balance,
              total_invested: totalInvested,
              total_current_value: totalCurrentValue,
              total_absolute_return: totalAbsoluteReturn,
              total_absolute_return_pct: totalAbsoluteReturnPct,
              portfolio_xirr: portfolioXIRR,
              holdings: processedHoldings,
              mandates: mandates,
              transactions: txs
            });
          });
        });
      });
    });
  });
});

// ==========================================
// ABHYAS ULTIMATE SIMULATOR BACKEND
// ==========================================

// Incremental simulation price catch-up.
// Checks last candle for each asset and catch-up any elapsed time intervals.
function catchUpMarketPrices(callback) {
  const now = Date.now();
  db.all("SELECT * FROM assets_master", [], (err, assets) => {
    if (err || !assets || assets.length === 0) return callback();
    
    let processed = 0;
    const finish = () => {
      processed++;
      if (processed >= assets.length) {
        callback();
      }
    };
    
    assets.forEach(asset => {
      db.get("SELECT * FROM price_candlesticks WHERE asset_id = ? ORDER BY timestamp DESC LIMIT 1", [asset.id], (err, lastCandle) => {
        if (err || !lastCandle) {
          // If no history, seed it now
          const history = generateCandlestickHistory(asset.id, asset.base_price, asset.asset_type, 30, now);
          const candleStmt = db.prepare("INSERT INTO price_candlesticks (asset_id, open, high, low, close, volume, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)");
          history.forEach(c => candleStmt.run(c.asset_id, c.open, c.high, c.low, c.close, c.volume, c.timestamp));
          candleStmt.finalize(() => {
            const finalClose = history[history.length - 1].close;
            db.run("UPDATE assets_master SET current_price = ? WHERE id = ?", [finalClose, asset.id], () => finish());
          });
          return;
        }
        
        const interval = asset.asset_type === 'MUTUAL_FUND' ? 24 * 60 * 60 * 1000 : 60 * 1000;
        const timeDiff = now - lastCandle.timestamp;
        const missingCandlesCount = Math.floor(timeDiff / interval);
        
        if (missingCandlesCount <= 0) {
          // No missing full intervals, but let's simulate minor real-time tick volatility around latest close
          const volatility = asset.asset_type === 'STOCK' ? 0.003 : (asset.asset_type === 'ETF' ? 0.001 : 0.0005);
          const change = lastCandle.close * volatility * (Math.random() - 0.5);
          const tickPrice = parseFloat((lastCandle.close + change).toFixed(2));
          db.run("UPDATE assets_master SET current_price = ? WHERE id = ?", [tickPrice, asset.id], () => finish());
          return;
        }
        
        const count = Math.min(missingCandlesCount, 200);
        const candles = [];
        let price = lastCandle.close;
        const volFactor = asset.asset_type === 'STOCK' ? 0.015 : (asset.asset_type === 'ETF' ? 0.008 : 0.005);
        
        for (let i = count - 1; i >= 0; i--) {
          const timestamp = now - i * interval;
          const open = price;
          const change = price * volFactor * (Math.random() - 0.48);
          const close = price + change;
          const high = Math.max(open, close) + Math.random() * price * volFactor * 0.4;
          const low = Math.min(open, close) - Math.random() * price * volFactor * 0.4;
          const volume = Math.floor(2000 + Math.random() * 18000);
          
          candles.push({
            asset_id: asset.id,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume,
            timestamp
          });
          price = close;
        }
        
        const stmt = db.prepare("INSERT INTO price_candlesticks (asset_id, open, high, low, close, volume, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)");
        candles.forEach(c => {
          stmt.run(c.asset_id, c.open, c.high, c.low, c.close, c.volume, c.timestamp);
        });
        stmt.finalize(() => {
          const finalClose = candles[candles.length - 1].close;
          db.run("UPDATE assets_master SET current_price = ? WHERE id = ?", [finalClose, asset.id], () => finish());
        });
      });
    });
  });
}

// FVG (Fair Value Gap) Scanner
function identifyFVG(candles) {
  // candles sorted chronologically (index 0, 1, 2)
  if (!candles || candles.length < 3) return null;
  const c1 = candles[0]; // oldest
  const c2 = candles[1]; // middle
  const c3 = candles[2]; // latest
  
  if (c3.low > c1.high) {
    return {
      type: "BULLISH",
      top: c3.low,
      bottom: c1.high,
      size: parseFloat((((c3.low - c1.high) / c1.high) * 100).toFixed(2))
    };
  } else if (c3.high < c1.low) {
    return {
      type: "BEARISH",
      top: c1.low,
      bottom: c3.high,
      size: parseFloat((((c1.low - c3.high) / c1.low) * 100).toFixed(2))
    };
  }
  return null;
}

// Systematic mandates catch-up worker
function executeSystematicMandates(userId, callback) {
  db.all("SELECT m.*, a.symbol, a.name, a.asset_type, a.current_price FROM systematic_mandates m JOIN assets_master a ON m.asset_id = a.id WHERE m.userId = ? AND m.status = 'ACTIVE'", [userId], (err, mandates) => {
    if (err || !mandates || mandates.length === 0) return callback();
    
    const now = Date.now();
    let processedCount = 0;
    
    const nextMandate = () => {
      if (processedCount >= mandates.length) return callback();
      
      const m = mandates[processedCount];
      const intervalMs = m.interval_days * 24 * 60 * 60 * 1000;
      const lastExecution = m.last_executed_date ? new Date(m.last_executed_date).getTime() : new Date().getTime() - intervalMs; // due now if never run
      const timeElapsed = now - lastExecution;
      const cyclesDue = Math.floor(timeElapsed / intervalMs);
      
      if (cyclesDue <= 0) {
        processedCount++;
        return nextMandate();
      }
      
      let executedCycles = 0;
      
      const nextCycle = () => {
        if (executedCycles >= cyclesDue) {
          const finalExecDate = new Date(lastExecution + cyclesDue * intervalMs).toISOString();
          db.run("UPDATE systematic_mandates SET last_executed_date = ? WHERE id = ?", [finalExecDate, m.id], () => {
            processedCount++;
            nextMandate();
          });
          return;
        }
        
        const cycleTime = lastExecution + (executedCycles + 1) * intervalMs;
        const price = m.current_price;
        let buyAmt = 0;
        let buyQty = 0;
        
        if (m.mandate_type === 'SIP') {
          // Amount-based MF SIP
          buyAmt = m.recurring_amount_or_qty;
          buyQty = parseFloat((buyAmt / price).toFixed(4));
        } else {
          // Qty-based stock SIP
          buyQty = m.recurring_amount_or_qty;
          buyAmt = parseFloat((buyQty * price).toFixed(2));
        }
        
        db.get("SELECT balance FROM paper_balances WHERE userId = ?", [userId], (err, balanceRow) => {
          const balance = balanceRow ? balanceRow.balance : 100000.0;
          if (balance < buyAmt) {
            db.run("UPDATE systematic_mandates SET status = 'PAUSED' WHERE id = ?", [m.id], () => {
              processedCount++;
              nextMandate();
            });
            return;
          }
          
          const newBalance = balance - buyAmt;
          const timestamp = new Date(cycleTime).toLocaleString('en-IN');
          
          db.serialize(() => {
            db.run("INSERT OR REPLACE INTO paper_balances (userId, balance) VALUES (?, ?)", [userId, newBalance]);
            db.run("INSERT INTO transaction_ledger (userId, asset_id, trade_type, order_mode, amount, quantity, execution_price, timestamp) VALUES (?, ?, 'BUY_LONG', 'SIP', ?, ?, ?, ?)",
              [userId, m.asset_id, buyAmt, buyQty, price, timestamp]);
              
            db.get("SELECT * FROM user_portfolio WHERE userId = ? AND asset_id = ?", [userId, m.asset_id], (err, holding) => {
              if (holding) {
                const newQty = holding.total_quantity + buyQty;
                const newInvested = holding.invested_amount + buyAmt;
                const newAvgPrice = parseFloat((newInvested / newQty).toFixed(2));
                db.run("UPDATE user_portfolio SET total_quantity = ?, average_buy_price = ?, invested_amount = ? WHERE userId = ? AND asset_id = ?",
                  [newQty, newAvgPrice, newInvested, userId, m.asset_id], () => {
                    executedCycles++;
                    nextCycle();
                  });
              } else {
                db.run("INSERT INTO user_portfolio (userId, asset_id, asset_type, total_quantity, average_buy_price, invested_amount) VALUES (?, ?, ?, ?, ?, ?)",
                  [userId, m.asset_id, m.asset_type, buyQty, price, buyAmt], () => {
                    executedCycles++;
                    nextCycle();
                  });
              }
            });
          });
        });
      };
      
      nextCycle();
    };
    
    nextMandate();
  });
}

// 1. Fetch live quotes, history, and FVG status
app.get('/api/market/quotes', (req, res) => {
  catchUpMarketPrices(() => {
    db.all("SELECT * FROM assets_master", [], (err, assets) => {
      if (err) return res.status(500).json({ error: "Failed to load quotes" });
      
      let processed = 0;
      const results = [];
      
      assets.forEach(asset => {
        // Fetch last 30 candlesticks
        db.all("SELECT open, high, low, close, volume, timestamp FROM price_candlesticks WHERE asset_id = ? ORDER BY timestamp DESC LIMIT 30", [asset.id], (err, candles) => {
          if (err) return res.status(500).json({ error: "Failed to load history" });
          
          const sortedCandles = [...candles].reverse();
          const fvg = identifyFVG(sortedCandles.slice(-3));
          
          results.push({
            id: asset.id,
            symbol: asset.symbol,
            name: asset.name,
            asset_type: asset.asset_type,
            sector: asset.sector,
            base_price: asset.base_price,
            current_price: asset.current_price,
            daily_volatility: asset.daily_volatility,
            fvg: fvg,
            history: sortedCandles
          });
          
          processed++;
          if (processed === assets.length) {
            res.json(results);
          }
        });
      });
    });
  });
});

// 2. Execute universal trade order (Delivery, Intraday, Short Sell, Cover)
app.post('/api/market/execute-order', (req, res) => {
  const { userId, assetId, tradeType, orderMode, quantity, amount, patternOriginTag, slippageChargesDeducted, realizedNetPnl, psychologyFlags, executionSpeedMs } = req.body;
  if (!userId || !assetId || !tradeType || !orderMode) {
    return res.status(400).json({ error: "Missing required order parameters" });
  }

  db.get("SELECT * FROM assets_master WHERE id = ?", [assetId], (err, asset) => {
    if (err || !asset) return res.status(404).json({ error: "Asset not found" });

    const price = asset.current_price;
    let finalQty = 0;
    let finalAmt = 0;

    if (asset.asset_type === 'MUTUAL_FUND') {
      finalAmt = parseFloat(amount);
      if (isNaN(finalAmt) || finalAmt <= 0) return res.status(400).json({ error: "Invalid investment amount" });
      finalQty = parseFloat((finalAmt / price).toFixed(4));
    } else {
      finalQty = parseFloat(quantity);
      if (isNaN(finalQty) || finalQty <= 0) return res.status(400).json({ error: "Invalid order quantity" });
      finalAmt = parseFloat((finalQty * price).toFixed(2));
    }

    db.get("SELECT balance FROM paper_balances WHERE userId = ?", [userId], (err, balanceRow) => {
      const balance = balanceRow ? balanceRow.balance : 100000.0;

      db.get("SELECT * FROM user_portfolio WHERE userId = ? AND asset_id = ?", [userId, assetId], (err, position) => {
        let newBalance = balance;
        let dbOps = [];

        if (tradeType === 'BUY_LONG') {
          if (balance < finalAmt) return res.status(400).json({ error: "Insufficient balance to place this BUY order" });
          newBalance = balance - finalAmt;

          if (position) {
            if (position.total_quantity < 0) {
              return res.status(400).json({ error: "You hold a SHORT position. Please cover it instead." });
            }
            const newQty = position.total_quantity + finalQty;
            const newInvested = position.invested_amount + finalAmt;
            const newAvg = parseFloat((newInvested / newQty).toFixed(2));
            dbOps.push(["UPDATE user_portfolio SET total_quantity = ?, average_buy_price = ?, invested_amount = ? WHERE userId = ? AND asset_id = ?",
              [newQty, newAvg, newInvested, userId, assetId]]);
          } else {
            dbOps.push(["INSERT INTO user_portfolio (userId, asset_id, asset_type, total_quantity, average_buy_price, invested_amount) VALUES (?, ?, ?, ?, ?, ?)",
              [userId, assetId, asset.asset_type, finalQty, price, finalAmt]]);
          }
        } 
        
        else if (tradeType === 'SELL_LONG') {
          if (!position || position.total_quantity <= 0) {
            return res.status(400).json({ error: "You do not hold any long inventory to SELL" });
          }
          if (position.total_quantity < finalQty - 0.0001) {
            return res.status(400).json({ error: `Insufficient inventory. You hold ${position.total_quantity} units.` });
          }

          const isFullRedemption = Math.abs(position.total_quantity - finalQty) < 0.005;
          const redeemQty = isFullRedemption ? position.total_quantity : finalQty;
          const redeemAmt = isFullRedemption ? parseFloat((position.total_quantity * price).toFixed(2)) : finalAmt;
          
          newBalance = balance + redeemAmt;

          if (isFullRedemption) {
            dbOps.push(["DELETE FROM user_portfolio WHERE userId = ? AND asset_id = ?", [userId, assetId]]);
          } else {
            const newQty = position.total_quantity - redeemQty;
            const newInvested = Math.max(0, position.invested_amount - (redeemQty * position.average_buy_price));
            dbOps.push(["UPDATE user_portfolio SET total_quantity = ?, invested_amount = ? WHERE userId = ? AND asset_id = ?",
              [newQty, newInvested, userId, assetId]]);
          }
        } 
        
        else if (tradeType === 'SHORT_SELL') {
          if (asset.asset_type === 'MUTUAL_FUND') return res.status(400).json({ error: "Short selling is not allowed on Mutual Funds" });
          if (balance < finalAmt) return res.status(400).json({ error: "Insufficient collateral margin to SHORT sell" });
          
          newBalance = balance + finalAmt;

          if (position) {
            if (position.total_quantity > 0) {
              return res.status(400).json({ error: "You hold a LONG position. Please sell it first." });
            }
            const newQty = position.total_quantity - finalQty;
            const newInvested = position.invested_amount + finalAmt;
            const newAvg = parseFloat((newInvested / Math.abs(newQty)).toFixed(2));
            dbOps.push(["UPDATE user_portfolio SET total_quantity = ?, average_buy_price = ?, invested_amount = ? WHERE userId = ? AND asset_id = ?",
              [newQty, newAvg, newInvested, userId, assetId]]);
          } else {
            dbOps.push(["INSERT INTO user_portfolio (userId, asset_id, asset_type, total_quantity, average_buy_price, invested_amount) VALUES (?, ?, ?, ?, ?, ?)",
              [userId, assetId, asset.asset_type, -finalQty, price, finalAmt]]);
          }
        } 
        
        else if (tradeType === 'COVER_SHORT') {
          if (!position || position.total_quantity >= 0) {
            return res.status(400).json({ error: "You do not hold a SHORT position to cover" });
          }
          const shortQty = Math.abs(position.total_quantity);
          if (shortQty < finalQty - 0.0001) {
            return res.status(400).json({ error: `Cover quantity exceeds short position size. Short size: ${shortQty} units.` });
          }

          const isFullCover = Math.abs(shortQty - finalQty) < 0.005;
          const coverQty = isFullCover ? shortQty : finalQty;
          const coverAmt = isFullCover ? parseFloat((shortQty * price).toFixed(2)) : finalAmt;

          newBalance = balance - coverAmt;

          if (isFullCover) {
            dbOps.push(["DELETE FROM user_portfolio WHERE userId = ? AND asset_id = ?", [userId, assetId]]);
          } else {
            const newQty = position.total_quantity + coverQty;
            const newInvested = Math.max(0, position.invested_amount - (coverQty * position.average_buy_price));
            dbOps.push(["UPDATE user_portfolio SET total_quantity = ?, invested_amount = ? WHERE userId = ? AND asset_id = ?",
              [newQty, newInvested, userId, assetId]]);
          }
        }

        db.serialize(() => {
          db.run("INSERT OR REPLACE INTO paper_balances (userId, balance) VALUES (?, ?)", [userId, newBalance]);
          db.run(`
            INSERT INTO transaction_ledger (
              userId, asset_id, trade_type, order_mode, amount, quantity, execution_price, timestamp,
              pattern_origin_tag, slippage_charges_deducted, realized_net_pnl, psychology_flags, execution_speed_ms
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            userId, assetId, tradeType, orderMode, finalAmt, finalQty, price, new Date().toLocaleString(),
            patternOriginTag || null, slippageChargesDeducted || 0, realizedNetPnl || 0, psychologyFlags || null, executionSpeedMs || 0
          ]);
          
          dbOps.forEach(op => {
            db.run(op[0], op[1]);
          });
          
          res.json({ success: true, balance: newBalance });
        });
      });
    });
  });
});

// 3. Create recurring systematic SIP mandate
app.post('/api/market/systematic-schedule', (req, res) => {
  const { userId, assetId, mandateType, recurringValue, intervalDays } = req.body;
  if (!userId || !assetId || !mandateType || !recurringValue) {
    return res.status(400).json({ error: "Missing systematic parameters" });
  }

  const val = parseFloat(recurringValue);
  if (isNaN(val) || val <= 0) return res.status(400).json({ error: "Invalid recurring mandate value" });

  db.get("SELECT * FROM assets_master WHERE id = ?", [assetId], (err, asset) => {
    if (err || !asset) return res.status(404).json({ error: "Asset not found" });

    if (mandateType === 'SIP' && val < 500) {
      return res.status(400).json({ error: "Minimum Mutual Fund SIP amount is ₹500" });
    }

    db.run(
      "INSERT INTO systematic_mandates (userId, asset_id, mandate_type, recurring_amount_or_qty, interval_days, last_executed_date, status) VALUES (?, ?, ?, ?, ?, NULL, 'ACTIVE')",
      [userId, assetId, mandateType, val, parseInt(intervalDays || 30)],
      function(err) {
        if (err) return res.status(500).json({ error: "Failed to schedule systematic mandate" });
        res.json({ success: true, mandateId: this.lastID });
      }
    );
  });
});

// 4. Force trigger systematic mandate (Fast-Forward demo cycle)
app.post('/api/market/systematic-trigger', (req, res) => {
  const { userId, mandateId } = req.body;
  if (!userId || !mandateId) return res.status(400).json({ error: "Missing params" });

  db.get(`
    SELECT m.*, a.symbol, a.name, a.asset_type, a.current_price 
    FROM systematic_mandates m 
    JOIN assets_master a ON m.asset_id = a.id 
    WHERE m.id = ? AND m.userId = ? AND m.status = 'ACTIVE'
  `, [mandateId, userId], (err, m) => {
    if (err || !m) return res.status(404).json({ error: "Mandate not found" });

    const price = m.current_price;
    let buyAmt = 0;
    let buyQty = 0;

    if (m.mandate_type === 'SIP') {
      buyAmt = m.recurring_amount_or_qty;
      buyQty = parseFloat((buyAmt / price).toFixed(4));
    } else {
      buyQty = m.recurring_amount_or_qty;
      buyAmt = parseFloat((buyQty * price).toFixed(2));
    }

    db.get("SELECT balance FROM paper_balances WHERE userId = ?", [userId], (err, balanceRow) => {
      const balance = balanceRow ? balanceRow.balance : 100000.0;
      if (balance < buyAmt) return res.status(400).json({ error: "Insufficient balance to execute mandate" });

      const newBalance = balance - buyAmt;
      const timestamp = new Date().toLocaleString();

      db.serialize(() => {
        db.run("INSERT OR REPLACE INTO paper_balances (userId, balance) VALUES (?, ?)", [userId, newBalance]);
        db.run("INSERT INTO transaction_ledger (userId, asset_id, trade_type, order_mode, amount, quantity, execution_price, timestamp) VALUES (?, ?, 'BUY_LONG', 'SIP', ?, ?, ?, ?)",
          [userId, m.asset_id, buyAmt, buyQty, price, timestamp]);
        db.run("UPDATE systematic_mandates SET last_executed_date = ? WHERE id = ?", [new Date().toISOString(), mandateId]);

        db.get("SELECT * FROM user_portfolio WHERE userId = ? AND asset_id = ?", [userId, m.asset_id], (err, holding) => {
          if (holding) {
            const newQty = holding.total_quantity + buyQty;
            const newInvested = holding.invested_amount + buyAmt;
            const newAvgPrice = parseFloat((newInvested / newQty).toFixed(2));
            db.run("UPDATE user_portfolio SET total_quantity = ?, average_buy_price = ?, invested_amount = ? WHERE userId = ? AND asset_id = ?",
              [newQty, newAvgPrice, newInvested, userId, m.asset_id], () => {
                res.json({ success: true, balance: newBalance });
              });
          } else {
            db.run("INSERT INTO user_portfolio (userId, asset_id, asset_type, total_quantity, average_buy_price, invested_amount) VALUES (?, ?, ?, ?, ?, ?)",
              [userId, m.asset_id, m.asset_type, buyQty, price, buyAmt], () => {
                res.json({ success: true, balance: newBalance });
              });
          }
        });
      });
    });
  });
});

// 5. Fetch complete user portfolio dashboard state, compute cashflows, XIRR
app.get('/api/market/portfolio-summary/:userId', (req, res) => {
  const { userId } = req.params;

  executeSystematicMandates(userId, () => {
    db.all(`
      SELECT p.*, a.symbol, a.name, a.sector, a.current_price, a.base_price, a.daily_volatility
      FROM user_portfolio p
      JOIN assets_master a ON p.asset_id = a.id
      WHERE p.userId = ?
    `, [userId], (err, holdings) => {
      if (err) return res.status(500).json({ error: "Failed to fetch holdings" });

      db.all(`
        SELECT m.*, a.symbol as asset_symbol, a.name as asset_name
        FROM systematic_mandates m
        JOIN assets_master a ON m.asset_id = a.id
        WHERE m.userId = ?
      `, [userId], (err, mandates) => {
        if (err) return res.status(500).json({ error: "Failed to fetch mandates" });

        db.all(`
          SELECT l.*, a.symbol as asset_symbol, a.name as asset_name
          FROM transaction_ledger l
          JOIN assets_master a ON l.asset_id = a.id
          WHERE l.userId = ?
          ORDER BY l.id DESC
        `, [userId], (err, ledger) => {
          if (err) return res.status(500).json({ error: "Failed to load ledger history" });

          db.get("SELECT balance FROM paper_balances WHERE userId = ?", [userId], (err, balanceRow) => {
            const balance = balanceRow ? balanceRow.balance : 100000.0;
            const now = Date.now();

            let totalInvested = 0;
            let totalCurrentValue = 0;

            const processedHoldings = holdings.map(h => {
              const currentPrice = h.current_price;
              const isLong = h.total_quantity >= 0;
              const qtyAbs = Math.abs(h.total_quantity);
              
              let currentValue = 0;
              let pnl = 0;

              if (isLong) {
                currentValue = parseFloat((qtyAbs * currentPrice).toFixed(2));
                pnl = currentValue - h.invested_amount;
                totalInvested += h.invested_amount;
                totalCurrentValue += currentValue;
              } else {
                pnl = (h.average_buy_price - currentPrice) * qtyAbs;
                currentValue = parseFloat((h.invested_amount + pnl).toFixed(2));
                totalInvested += h.invested_amount;
                totalCurrentValue += currentValue;
              }

              const pnlPct = h.invested_amount > 0 ? parseFloat((pnl / h.invested_amount * 100).toFixed(2)) : 0;

              const assetCashflows = [];
              ledger.filter(l => l.asset_id === h.asset_id).forEach(l => {
                const isBuy = l.trade_type === 'BUY_LONG' || l.trade_type === 'COVER_SHORT';
                const sign = isBuy ? -1 : 1;
                assetCashflows.push({
                  amount: sign * l.amount,
                  date: new Date(l.timestamp)
                });
              });
              if (currentValue > 0) {
                assetCashflows.push({
                  amount: currentValue,
                  date: new Date(now)
                });
              }
              const assetXIRR = parseFloat(calculateXIRR(assetCashflows).toFixed(2));

              return {
                asset_id: h.asset_id,
                symbol: h.symbol,
                name: h.name,
                asset_type: h.asset_type,
                sector: h.sector,
                total_quantity: h.total_quantity,
                average_buy_price: h.average_buy_price,
                current_price: currentPrice,
                invested_amount: h.invested_amount,
                current_value: currentValue,
                absolute_return: parseFloat(pnl.toFixed(2)),
                absolute_return_pct: pnlPct,
                xirr: assetXIRR
              };
            });

            const portfolioCashflows = [];
            ledger.forEach(l => {
              const isBuy = l.trade_type === 'BUY_LONG' || l.trade_type === 'COVER_SHORT';
              const sign = isBuy ? -1 : 1;
              portfolioCashflows.push({
                amount: sign * l.amount,
                date: new Date(l.timestamp)
              });
            });
            if (totalCurrentValue > 0) {
              portfolioCashflows.push({
                amount: totalCurrentValue,
                date: new Date(now)
              });
            }
            const portfolioXIRR = parseFloat(calculateXIRR(portfolioCashflows).toFixed(2));
            const totalAbsoluteReturn = parseFloat((totalCurrentValue - totalInvested).toFixed(2));
            const totalAbsoluteReturnPct = totalInvested > 0 ? parseFloat((totalAbsoluteReturn / totalInvested * 100).toFixed(2)) : 0;

            res.json({
              balance,
              total_invested: totalInvested,
              total_current_value: totalCurrentValue,
              total_absolute_return: totalAbsoluteReturn,
              total_absolute_return_pct: totalAbsoluteReturnPct,
              portfolio_xirr: portfolioXIRR,
              holdings: processedHoldings,
              mandates: mandates,
              transactions: ledger
            });
          });
        });
      });
    });
  });
});

// Cryptographic XOR Helper for offline-portable data security
function encryptLedgerHex(dataStr, key) {
  let result = '';
  for (let i = 0; i < dataStr.length; i++) {
    result += String.fromCharCode(dataStr.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return Buffer.from(result, 'binary').toString('hex');
}

// 6. Export encrypted transaction ledger JSON packet
app.get('/api/market/export-ledger', (req, res) => {
  const userId = req.query.userId || "sandbox_user";
  
  db.all(`
    SELECT l.*, a.symbol as asset_symbol, a.name as asset_name 
    FROM transaction_ledger l
    JOIN assets_master a ON l.asset_id = a.id
    WHERE l.userId = ?
    ORDER BY l.id DESC
  `, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to export ledger" });
    
    const payload = JSON.stringify({
      userId,
      exportTimestamp: new Date().toISOString(),
      recordCount: rows.length,
      ledger: rows
    });
    
    // Encrypt locally using key
    const encryptedHex = encryptLedgerHex(payload, "MicrosoftEdgeAIHackathonKey");
    
    res.json({
      success: true,
      filename: `safalniveshak_ledger_${userId}.enc`,
      packet: encryptedHex
    });
  });
});

// 7. Get unlocked progression badges
app.get('/api/abhyas/badges/:userId', (req, res) => {
  const { userId } = req.params;
  db.all("SELECT badge_id, unlocked_at FROM user_badges WHERE userId = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to load badges" });
    res.json(rows);
  });
});

// 8. Unlock progression badge
app.post('/api/abhyas/badges/unlock', (req, res) => {
  const { userId, badgeId } = req.body;
  if (!userId || !badgeId) return res.status(400).json({ error: "Missing badge attributes" });
  
  const timestamp = new Date().toISOString();
  db.run("INSERT OR IGNORE INTO user_badges (userId, badge_id, unlocked_at) VALUES (?, ?, ?)", [userId, badgeId, timestamp], function(err) {
    if (err) return res.status(500).json({ error: "Failed to unlock badge" });
    res.json({ success: true, badgeId, unlockedAt: timestamp });
  });
});

// 9. Get financial helplines list
app.get('/api/support/helplines', (req, res) => {
  db.all("SELECT * FROM financial_helplines ORDER BY name ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to load helplines" });
    res.json(rows);
  });
});

// 10. Get all support tickets
app.get('/api/support/tickets', (req, res) => {
  db.all("SELECT * FROM support_tickets ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to load tickets" });
    res.json(rows.map(r => ({
      ...r,
      conversation: JSON.parse(r.conversation_json)
    })));
  });
});

// 11. Create support ticket manually
app.post('/api/support/tickets/create', (req, res) => {
  const { category, subject, conversation } = req.body;
  const ref = `SN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const created = new Date().toLocaleString();
  db.run(
    "INSERT INTO support_tickets (ticket_reference, category, subject, conversation_json, status, created_at) VALUES (?, ?, ?, ?, 'OPEN', ?)",
    [ref, category || 'PLATFORM_HELP', subject || 'User Inquiry', JSON.stringify(conversation || []), created],
    function(err) {
      if (err) return res.status(500).json({ error: "Failed to create ticket" });
      res.json({ success: true, ticketId: this.lastID, reference: ref, createdAt: created });
    }
  );
});

// 12. SafalMitra Sovereign Quantum AI multi-intent chatbot router
app.post('/api/chat/sovereign-quantum', (req, res) => {
  const { userId, message, baseTimeframe } = req.body;
  const normalizedMsg = (message || "").toLowerCase().trim();

  // Intent A: Cyber Fraud Triage & Scam Grievance Compiler
  const isScamQuery = normalizedMsg.includes("scam") || normalizedMsg.includes("fraud") || 
                      normalizedMsg.includes("telegram") || normalizedMsg.includes("whatsapp") || 
                      normalizedMsg.includes("tip") || normalizedMsg.includes("lost") || 
                      normalizedMsg.includes("stuck") || normalizedMsg.includes("advisory") ||
                      normalizedMsg.includes("money");

  if (isScamQuery) {
    // Extract metadata values via standard regex fallback filters
    let groupName = "WhatsApp/Telegram Channel";
    const groupMatch = message.match(/(?:group|channel|name|titled)(?:\s+is\s+|\s*:\s*)([^\n,.]+)/i);
    if (groupMatch) groupName = groupMatch[1].trim();

    let upiHandle = "Not provided";
    const upiMatch = message.match(/([a-zA-Z0-9.\-_]+@[a-zA-Z]{3,})/);
    if (upiMatch) upiHandle = upiMatch[0].trim();

    let txnId = "Not provided";
    const txnMatch = message.match(/(?:txn|transaction|ref|reference)(?:\s+id|\s*:\s*)([a-zA-Z0-9]+)/i);
    if (txnMatch) txnId = txnMatch[1].trim();

    const ref = `SN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const created = new Date().toLocaleString();

    const complaintDraft = `REGULATORY COMPLAINT FILING MATRIX (SEBI SCORES & NATIONAL CYBER CELL)
---------------------------------------------------------------------------------
COMPLAINT SOURCE: SafalMitra Sovereign Quantum AI Triage
TICKET REFERENCE: ${ref}
INCIDENT TIMESTAMP: 13-07-2026 (Local time)
REPORTED ENTITY: ${groupName}
ADMIN PAYMENT DETAILS (UPI): ${upiHandle}
TRANSACTION EVIDENCE REFERENCE: ${txnId}

LEGAL COMPLAINT TEXT:
"Under SEBI (Investment Advisers) Regulations, 2013, I am formally lodging a complaint against the unregistered advisory entities operating the channel/group '${groupName}'. They have induced retail users to execute trades using unregistered advisory tips, celebrity name-dropping, and guaranteed return claims. A transaction payment of Rs. [Amount] was directed to UPI handle '${upiHandle}' with transaction ID '${txnId}'. Please investigate their banking channels, freeze the associated assets, and initiate regulatory enforcement under Section 11B of the SEBI Act, 1992."
---------------------------------------------------------------------------------
REGULATORY FILING INSTRUCTIONS:
1. Cyber Cell Helpline: Immediately call 1930 or submit online at cybercrime.gov.in.
2. SEBI Grievances: Register an account at scores.sebi.gov.in and paste the text block above.`;

    const officerReply = `Hello. This is SafalNiveshak Support Officer Avatar. I have successfully triaged your scam incident. Support ticket Reference: ${ref} is officially opened. Please copy-paste the regulatory grievance complaint draft generated below directly into the SEBI SCORES portal. We will track compliance offline.`;
    
    const newConv = [
      { sender: "USER", text: message },
      { sender: "SUPPORT_OFFICER", text: officerReply },
      { sender: "SUPPORT_OFFICER", text: complaintDraft }
    ];

    db.run(
      "INSERT INTO support_tickets (ticket_reference, category, subject, conversation_json, status, created_at) VALUES (?, 'SCAM_REPORT', ?, ?, 'OPEN', ?)",
      [ref, `Cyber Scam Grievance: ${groupName}`, JSON.stringify(newConv), created],
      function(err) {
        if (err) return res.status(500).json({ error: "Failed to log grievance ticket" });
        res.json({
          success: true,
          intent: "SCAM_GRIEVANCE",
          response: `${officerReply}\n\n${complaintDraft}`,
          ticketReference: ref,
          ticketStatus: "OPEN"
        });
      }
    );
    return;
  }

  // Intent B: Multi-Timeframe Confluence & Anomaly Engine
  const isConfluenceQuery = normalizedMsg.includes("confluence") || normalizedMsg.includes("opportunity") || 
                            normalizedMsg.includes("scan") || normalizedMsg.includes("signal") || 
                            normalizedMsg.includes("microstructure") || normalizedMsg.includes("alpha") ||
                            normalizedMsg.includes("retracement") || normalizedMsg.includes("rsi") || 
                            normalizedMsg.includes("indicator") || normalizedMsg.includes("signals");

  if (isConfluenceQuery) {
    db.all("SELECT * FROM assets_master", [], (err, assets) => {
      if (err || !assets || assets.length === 0) {
        return res.json({ success: true, response: "Local market database is currently offline." });
      }

      // Detect which asset user might be inquiring about
      let asset = assets[0];
      for (const a of assets) {
        if (normalizedMsg.includes(a.symbol.toLowerCase()) || normalizedMsg.includes(a.name.toLowerCase())) {
          asset = a;
          break;
        }
      }

      db.all("SELECT open, high, low, close, volume FROM price_candlesticks WHERE asset_id = ? ORDER BY timestamp DESC LIMIT 30", [asset.id], (err, candles) => {
        if (err || !candles || candles.length === 0) {
          return res.json({ success: true, response: `Unable to read historical wicks for ${asset.symbol}.` });
        }

        const sorted = [...candles].reverse();
        const lastCandle = sorted[sorted.length - 1];
        const lastVolume = lastCandle.volume;

        // 1. Intraday Scalping check (Volume imbalance spike > 1.7x of 10-candle average)
        const sliceVol = sorted.slice(-10);
        const avgVol = sliceVol.reduce((sum, c) => sum + c.volume, 0) / (sliceVol.length || 1);
        const volumeSpike = lastVolume > avgVol * 1.7;

        // 2. Swing Structuring check (Fibonacci Retracement pockets 38.2% - 61.8%)
        const highs = sorted.map(c => c.high);
        const lows = sorted.map(c => c.low);
        const hMax = Math.max(...highs);
        const lMin = Math.min(...lows);
        const fibDiff = hMax - lMin;
        const fib382 = hMax - fibDiff * 0.382;
        const fib50 = hMax - fibDiff * 0.50;
        const fib618 = hMax - fibDiff * 0.618;
        const currentPrice = asset.current_price;
        const fibIntersection = currentPrice >= fib618 && currentPrice <= fib382;

        // 3. Macro Reversals (Triple candle patterns scan)
        const isBullishReversal = lastCandle.close > lastCandle.open && (lastCandle.close - lastCandle.open) > (hMax - lMin) * 0.05;

        // 4. Cross-Timeframe Confluence Validator & emergency circuit breaker warning
        const macroAvg = sorted.reduce((sum, c) => sum + c.close, 0) / sorted.length;
        const isMacroBearish = currentPrice < macroAvg;
        const isIntradayBullish = lastCandle.close > lastCandle.open;
        const trapAlert = isMacroBearish && isIntradayBullish;

        const responseText = `MULTI-TIMEFRAME QUANT CONFLUENCE FOR ${asset.name} (${asset.symbol})
---------------------------------------------------------------------------------
[1-Min/5-Min] Intraday Velocity: Volume Spike: ${volumeSpike ? '✅ DETECTED' : '❌ NORMAL'} (Last Vol: ${lastVolume} vs Average: ${Math.round(avgVol)})
[15-Min/1-Hour] Swing Pockets: Inside Fibonacci Golden Zone (38.2% - 61.8%): ${fibIntersection ? '✅ YES' : '❌ NO'} (Range: ₹${fib618.toFixed(2)} - ₹${fib382.toFixed(2)})
[1-Day] Macro Reversal Pattern: Bullish Reversal: ${isBullishReversal ? '✅ CONFIRMED' : '❌ NO'}

CONFLUENCE VERDICT:
${trapAlert ? `🚨 EMERGENCY WARNING: Counter-Trend Institutional Trap!
The asset macro trend is deeply bearish (trading below 30-period average of ₹${macroAvg.toFixed(2)}). Intraday is showing minor buying. This is likely an institutional trap targeting retail liquidity. Long allocations NOT advised!` : `✅ CONVERGENT ALIGNMENT: Intraday and macro vectors are fully aligned. Long setups validated inside support bounds.`}
---------------------------------------------------------------------------------`;
        res.json({
          success: true,
          intent: "CONFLUENCE_SCAN",
          response: responseText
        });
      });
    });
    return;
  }

  // Intent C: Dynamic Ledger Performance & Friction Leakage Audit
  const isAuditQuery = normalizedMsg.includes("audit") || normalizedMsg.includes("ledger") || 
                       normalizedMsg.includes("leakage") || normalizedMsg.includes("friction") || 
                       normalizedMsg.includes("pnl") || normalizedMsg.includes("xirr") || 
                       normalizedMsg.includes("performance") || normalizedMsg.includes("charges") ||
                       normalizedMsg.includes("hidden");

  if (isAuditQuery) {
    db.all(`
      SELECT l.*, a.symbol as asset_symbol, a.name as asset_name 
      FROM transaction_ledger l
      JOIN assets_master a ON l.asset_id = a.id
      WHERE l.userId = 'sandbox_user'
      ORDER BY l.id DESC
    `, [], (err, rows) => {
      if (err || !rows) {
        return res.json({ success: true, response: "Unable to load transaction ledger registry." });
      }

      let totalInvested = 0;
      let frictionCharges = 0;
      let revengeTrades = 0;
      
      for (let i = 0; i < rows.length; i++) {
        totalInvested += rows[i].amount;
        frictionCharges += rows[i].slippage_charges_deducted || 0;
        
        if (i > 0) {
          const tCurrent = new Date(rows[i].timestamp).getTime();
          const tPrev = new Date(rows[i-1].timestamp).getTime();
          if (Math.abs(tCurrent - tPrev) < 60000) {
            revengeTrades++;
          }
        }
      }

      db.get("SELECT balance FROM paper_balances WHERE userId = 'sandbox_user'", [], (err, balRow) => {
        const balance = balRow ? balRow.balance : 100000;
        
        db.all("SELECT p.*, a.current_price FROM user_portfolio p JOIN assets_master a ON p.asset_id = a.id WHERE p.userId = 'sandbox_user'", [], (err, holdings) => {
          let totalCurrentValue = 0;
          holdings.forEach(h => {
            totalCurrentValue += Math.abs(h.total_quantity) * h.current_price;
          });

          const netVal = totalCurrentValue + balance;
          const absoluteReturn = netVal - 100000; // Starting capital 1L
          
          // Construct cashflows
          const cashflows = [{ amount: -100000, date: new Date(rows[rows.length - 1]?.timestamp || Date.now()) }];
          rows.forEach(r => {
            const isBuy = r.trade_type === 'BUY_LONG' || r.trade_type === 'COVER_SHORT';
            const sign = isBuy ? -1 : 1;
            cashflows.push({ amount: sign * r.amount, date: new Date(r.timestamp) });
          });
          cashflows.push({ amount: netVal, date: new Date() });
          
          const calculatedYield = parseFloat(calculateXIRR(cashflows).toFixed(2));

          const auditText = `QUANTITATIVE PORTFOLIO PERFORMANCE AUDIT REPORT
---------------------------------------------------------------------------------
CONSOLIDATED ACCOUNT PORTFOLIO YIELD (XIRR): ${calculatedYield}%
NET PORTFOLIO VALUE: ₹${netVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
ABSOLUTE CAPITAL GROWTH: ₹${absoluteReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}

MARKET FRICTION LEAKAGE METRICS:
Total Transaction Leakage (GST, STT, Brokerage): ₹${frictionCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
Frictional Leakage % of capital: ${((frictionCharges / 100000) * 100).toFixed(4)}%

BEHAVIORAL OVERTRADING DIAGNOSTICS:
Detected Revenge/Fatigue Trades (inside 60s): ${revengeTrades} cycles
Stability Index Recommendation: ${revengeTrades > 2 ? '⚠️ CRITICAL WARNING: Active revenge trading loops detected. Restrict speculative trading size immediately.' : '✅ OBJECTIVE STABILITY: Clean trading speed intervals. Objective execution confirmed.'}
---------------------------------------------------------------------------------`;
          res.json({
            success: true,
            intent: "LEDGER_AUDIT",
            response: auditText
          });
        });
      });
    });
    return;
  }

  // Intent D: Default bilingual protection advisory chat
  const fallbackResponse = `Hello! I am SafalMitra Sovereign Quantum AI, your 100% offline-resilient investor safety advisor.

How can I assist you today?
- Ask me for a "confluence scan" to evaluate high-velocity trade opportunities.
- Ask for an "audit" to verify transaction leakage, XIRR yields, and frictional STT/GST charges.
- Report any active Telegram or WhatsApp scams to instantly generate a SEBI complaint draft.`;

  // Check if standard help inquiry to auto-open support tickets
  const isHelpQuery = normalizedMsg.includes("help") || normalizedMsg.includes("support") || 
                      normalizedMsg.includes("executive") || normalizedMsg.includes("error");

  if (isHelpQuery) {
    const ref = `SN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const created = new Date().toLocaleString();
    const newConv = [
      { sender: "USER", text: message },
      { sender: "SUPPORT_OFFICER", text: `Platform inquiry ticket ${ref} opened. A support executive avatar is online.` }
    ];

    db.run(
      "INSERT INTO support_tickets (ticket_reference, category, subject, conversation_json, status, created_at) VALUES (?, 'PLATFORM_HELP', ?, ?, 'OPEN', ?)",
      [ref, "User Assistance Request", JSON.stringify(newConv), created],
      function(err) {
        res.json({
          success: true,
          intent: "HELP_TICKET",
          response: `Ticket opened successfully! Reference: ${ref}. Let us know your issue, and we will assist you.`,
          ticketReference: ref,
          ticketStatus: "OPEN"
        });
      }
    );
    return;
  }

  res.json({
    success: true,
    intent: "GENERAL",
    response: fallbackResponse
  });
});

// 13. Nexus Sovereign Command Center Apex Engine
app.post('/api/nexus/global-execution', (req, res) => {
  const { userId, intent, payload, message, baseTimeframe } = req.body;
  const now = new Date().toISOString();

  if (intent === 'CONFLUENCE_SCAN') {
    db.all("SELECT * FROM assets_master", [], (err, assets) => {
      if (err || !assets || assets.length === 0) {
        return res.status(500).json({ error: "Assets registry offline." });
      }

      // Check mentioned asset or pick Reliance
      let asset = assets.find(a => message && (message.toUpperCase().includes(a.symbol) || message.toUpperCase().includes(a.name.toUpperCase()))) || assets[0];

      db.all("SELECT open, high, low, close, volume FROM price_candlesticks WHERE asset_id = ? ORDER BY timestamp DESC LIMIT 30", [asset.id], (err, candles) => {
        if (err || !candles || candles.length === 0) {
          return res.json({ response: `Insufficient timeframe data for ${asset.symbol}.` });
        }

        const sorted = [...candles].reverse();
        const lastCandle = sorted[sorted.length - 1];

        // Intraday Volume Imbalance (Average of 10 volume * 2.0)
        const sliceVol = sorted.slice(-10);
        const avgVol = sliceVol.reduce((sum, c) => sum + c.volume, 0) / (sliceVol.length || 1);
        const volumeImbalance = lastCandle.volume > avgVol * 2.0;

        // Fibonacci zones
        const highs = sorted.map(c => c.high);
        const lows = sorted.map(c => c.low);
        const hMax = Math.max(...highs);
        const lMin = Math.min(...lows);
        const fibDiff = hMax - lMin;
        const fib382 = hMax - fibDiff * 0.382;
        const fib618 = hMax - fibDiff * 0.618;
        const currentPrice = asset.current_price;
        const fibZone = currentPrice >= fib618 && currentPrice <= fib382;

        // Macro EMA check
        const macroAvg = sorted.reduce((sum, c) => sum + c.close, 0) / sorted.length;
        const isMacroBearish = currentPrice < macroAvg;
        const isIntradayBullish = lastCandle.close > lastCandle.open;
        const stopHuntWarning = isMacroBearish && isIntradayBullish;

        const report = `NEXUS GLOBAL MULTI-TIMEFRAME ANALYSIS REPORT
---------------------------------------------------------------------------------
ASSET: ${asset.name} (${asset.symbol}) | DOMAIN: GLOBAL EQUITIES
TIME FRAME: ${baseTimeframe || '1-Min'} vs 1-Day Macro Trend
VOLUME SPIKE: ${volumeImbalance ? '🚨 HIGH VELOCITY SPIKE (2.0x+ AVG)' : 'NORMAL VOLUME'}
FIB RETRACEMENT INTERSECT: ${fibZone ? '✅ YES (38.2% - 61.8% Golden pocket)' : '❌ NO'}

ORDER FLOW INTEGRITY VERDICT:
${stopHuntWarning ? `⚠️ WARNING: INSTITUTIONAL STOP-HUNT & LIQUIDITY GRAB!
Institutional flow shows heavy macro selling (below 30-day average ₹${macroAvg.toFixed(2)}). Intraday is showing minor buying to lure retail breakout buyers. This is a classic retail liquidity grab trap!` : `✅ CONVERGENT ALIGNMENT: Intraday breakouts are supported by consistent macro trend lines.`}
---------------------------------------------------------------------------------`;

        res.json({
          success: true,
          intent: "CONFLUENCE_SCAN",
          response: report,
          stopHuntWarning: stopHuntWarning
        });
      });
    });
    return;
  }

  if (intent === 'REGULATORY_GRIEVANCE') {
    const { entityName, adminHandle, transactionId, date, jurisdiction } = payload || {};
    const ref = `NEXUS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    
    let legalText = '';
    if (jurisdiction === 'SEC') {
      legalText = `SEC/CFTC REGULATORY COMPLAINT FILING TRANSCRIPT
---------------------------------------------------------
TARGET ENTITY: ${entityName || 'Unregistered Broker'}
UPI/PAYMENT NODE: ${adminHandle || 'Unknown'}
TRANSACTION ID: ${transactionId || 'Not provided'}
COMPLAINT CODE: SEC Rules 10b-5 Advisory Fraud

I am lodging a formal complaint under Section 10(b) of the Securities Exchange Act of 1934 and Rule 10b-5. The target entity has solicited capital for unregistered pools offering guaranteed returns, resulting in the loss of funds. We request an enforcement audit of the payment nodes.`;
    } else if (jurisdiction === 'FCA') {
      legalText = `FCA UK REGULATORY COMPLAINT FILING TRANSCRIPT
---------------------------------------------------------
TARGET ENTITY: ${entityName || 'Offshore VIP Scheme'}
COMPLAINT CODE: FSMA General Prohibition breach

I hereby report a breach of the general prohibition under Section 19 of the Financial Services and Markets Act 2000 (FSMA). The entity has engaged in regulated activities (investment advising) without FCA authorization.`;
    } else {
      legalText = `SEBI SCORES COMPLAINT FILING TRANSCRIPT
---------------------------------------------------------
TARGET ENTITY: ${entityName || 'Telegram Advisory Group'}
COMPLAINT CODE: SEBI IA Regulations 2013 Breach

Sollicitation of trades without SEBI registration, violating SEBI (Investment Advisers) Regulations, 2013. Requesting action under Section 11B of the SEBI Act, 1992.`;
    }

    const conversation = [
      { sender: "USER", text: `Reported scam: ${entityName}. Jurisdiction: ${jurisdiction}` },
      { sender: "SUPPORT_OFFICER", text: `Your formal grievance ${ref} has been compiled.` }
    ];

    db.run(
      "INSERT INTO support_tickets (ticket_reference, category, subject, conversation_json, status, created_at) VALUES (?, 'SCAM_REPORT', ?, ?, 'OPEN', ?)",
      [ref, `Nexus Scam Grievance (${jurisdiction})`, legalText, JSON.stringify(conversation), now],
      function(err) {
        if (err) return res.status(500).json({ error: "Failed to open Nexus ticket" });
        res.json({
          success: true,
          intent: "REGULATORY_GRIEVANCE",
          response: legalText,
          ticketReference: ref
        });
      }
    );
    return;
  }

  if (intent === 'RISK_AUDIT') {
    db.all(`
      SELECT l.*, a.symbol as asset_symbol, a.name as asset_name 
      FROM transaction_ledger l
      JOIN assets_master a ON l.asset_id = a.id
      WHERE l.userId = 'sandbox_user'
      ORDER BY l.id DESC
    `, [], (err, rows) => {
      if (err || !rows) return res.status(500).json({ error: "Ledger read error" });

      let wins = 0;
      let losses = 0;
      let totalPnl = 0;
      let friction = 0;

      rows.forEach(r => {
        friction += r.slippage_charges_deducted || 0;
        const pnl = r.realized_net_pnl || 0;
        if (pnl > 0) {
          wins++;
          totalPnl += pnl;
        } else if (pnl < 0) {
          losses++;
          totalPnl += pnl;
        }
      });

      const winRate = (wins + losses) > 0 ? wins / (wins + losses) : 0.55;
      const R = 2.0; // Assume 2:1 risk-reward
      const kelly = Math.max(0, winRate - (1 - winRate) / R);
      const edge = 2.0 * winRate - 1.0;
      const ror = edge > 0 ? Math.pow((1.0 - edge) / (1.0 + edge), 10) * 100 : 100.0;

      const reportText = `NEXUS INSTITUTIONAL RISK & FRICTIONAL AUDIT
---------------------------------------------------------------------------------
HISTORICAL WIN RATIO: ${(winRate * 100).toFixed(2)}% | RISK-REWARD RATIO: ${R}:1
KELLY CRITERION POSITION SIZE: ${(kelly * 100).toFixed(2)}% of total capital
MATHEMATICAL RISK OF RUIN (10 cycles): ${ror.toFixed(2)}%
TOTAL FRICTIONAL LEAKAGE (STT/GST/Exchange): ₹${friction.toFixed(2)}

RISK MITIGATION DIRECTIVE:
${ror > 30 ? `⚠️ CRITICAL: Risk of ruin exceeds safety limits. Reduce position size below ${(kelly * 100).toFixed(2)}% immediately.` : `✅ SECURE: Portfolio risk metrics are inside optimal hedge parameters.`}
---------------------------------------------------------------------------------`;

      res.json({
        success: true,
        intent: "RISK_AUDIT",
        response: reportText
      });
    });
    return;
  }

  res.json({ success: false, error: "Unknown Nexus intent." });
});

// --- PROGRESSIVE LEARNING API MATRIX ---

// 1. Get all learning progress for user
app.get("/api/learning/progress", (req, res) => {
  const userId = req.query.userId || "sandbox_user";
  
  db.all("SELECT * FROM learning_progress WHERE user_id = ?", [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to query learning progress ledger." });
    }
    res.json(rows);
  });
});

// 2. Mark specific tier progress as UNLOCKED or COMPLETED with strict validation
app.post("/api/learning/complete", (req, res) => {
  const { userId, moduleId, tierLevel, status, score } = req.body;
  const targetUser = userId || "sandbox_user";
  
  if (!moduleId || !tierLevel || !status) {
    return res.status(400).json({ error: "Missing required parameters: moduleId, tierLevel, status." });
  }

  // Strictly enforce gatekeeper rule:
  // Cannot query/complete/unlock INTERMEDIATE unless BEGINNER evaluations are COMPLETED inside local DB.
  // Cannot query/complete/unlock ADVANCED unless INTERMEDIATE evaluations are COMPLETED.
  if (tierLevel === 'INTERMEDIATE') {
    db.get(
      "SELECT status FROM learning_progress WHERE user_id = ? AND module_id = ? AND tier_level = 'BEGINNER'",
      [targetUser, moduleId],
      (err, row) => {
        if (err) return res.status(500).json({ error: "Database error." });
        if (!row || row.status !== 'COMPLETED') {
          return res.status(400).json({
            error: "ILLEGAL_STATE_BYPASS",
            message: `Progressive Lock Bypass Alert: Beginner tier for ${moduleId} must be COMPLETED before unlocking Intermediate.`
          });
        }
        upsertProgress();
      }
    );
  } else if (tierLevel === 'ADVANCED') {
    db.get(
      "SELECT status FROM learning_progress WHERE user_id = ? AND module_id = ? AND tier_level = 'INTERMEDIATE'",
      [targetUser, moduleId],
      (err, row) => {
        if (err) return res.status(500).json({ error: "Database error." });
        if (!row || row.status !== 'COMPLETED') {
          return res.status(400).json({
            error: "ILLEGAL_STATE_BYPASS",
            message: `Progressive Lock Bypass Alert: Intermediate tier for ${moduleId} must be COMPLETED before unlocking Advanced.`
          });
        }
        upsertProgress();
      }
    );
  } else {
    // BEGINNER can always be unlocked/completed
    upsertProgress();
  }

  function upsertProgress() {
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO learning_progress (user_id, module_id, tier_level, assessment_score, status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, module_id, tier_level) 
       DO UPDATE SET status = excluded.status, assessment_score = excluded.assessment_score, updated_at = excluded.updated_at`,
      [targetUser, moduleId, tierLevel, score || 0, status, now],
      function (err) {
        if (err) {
          return res.status(500).json({ error: "Failed to persist learning progression state." });
        }
        res.json({ success: true, message: `Progression state updated successfully: ${moduleId} [${tierLevel}] = ${status}` });
      }
    );
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`SafalNiveshak local API server listening on http://localhost:${PORT}`);
});
