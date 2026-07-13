import React, { useState, useEffect, useRef, useCallback } from 'react';
import { abhyasContextData } from '../data/contextualLearning';
import AbhyasMF from './AbhyasMF';
import AbhyasUltimate from './AbhyasUltimate';

// ==========================================
// TRADINGVIEW ADVANCED CHART WIDGET
// ==========================================
function TradingViewChart({ symbol, theme }) {
  const containerId = useRef(`tv_${Math.random().toString(36).substr(2, 9)}`);
  const widgetRef = useRef(null);

  useEffect(() => {
    const id = containerId.current;
    const container = document.getElementById(id);
    
    const init = () => {
      if (!window.TradingView) return;
      try {
        if (container) container.innerHTML = "";
        
        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: 'D',
          timezone: 'Asia/Kolkata',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#0A1628',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          hide_legend: false,
          save_image: false,
          container_id: id,
          hide_volume: false,
          no_referral_id: true,
          studies: [],
          overrides: {
            'paneProperties.background': '#0A1628',
            'paneProperties.backgroundType': 'solid',
          }
        });
      } catch (e) { console.warn('TV widget error', e); }
    };

    let script = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => setTimeout(init, 200);
      document.head.appendChild(script);
    } else if (window.TradingView) {
      setTimeout(init, 100);
    } else {
      script.addEventListener('load', () => setTimeout(init, 200));
    }
  }, [symbol]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div id={containerId.current} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ==========================================
// TICKER BAR (scrolling news)
// ==========================================
const NEWS_ITEMS = [
  '🔴 SEBI ALERT: Unregistered investment advisors using Telegram groups to solicit clients — Report at sebi.gov.in',
  '📊 NSE:NIFTY 50 hits 24,800 — IT and Banking sectors lead rally',
  '🚨 SEBI orders attachment of assets of 3 Ponzi scheme operators — ₹47 crore frozen',
  '📈 NSE:RELIANCE up 1.4% after Q1 results beat estimates — Jio subscriber growth drives revenue',
  '⚠️ INVESTOR WARNING: "Guaranteed 50% returns in 30 days" scheme reported as fraud — file complaint at scores.sebi.gov.in',
  '📉 NSE:HDFCBANK -0.3% ahead of RBI monetary policy committee meet',
  '🛡️ SafalNiveshak — यह सिर्फ अभ्यास है | ALL TRADES ARE VIRTUAL — ₹ Zero Real Money Risk',
  '🟢 NSE:INFY gains on strong deal wins — quarterly revenue up 7.4% YoY',
  '📢 SEBI bans 21 entities for front-running trades — ₹21 crore disgorgement ordered',
];

function TickerBar() {
  return (
    <div style={{
      backgroundColor: '#070E1A',
      borderBottom: '1px solid #1a2840',
      height: '28px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      position: 'relative'
    }}>
      <div style={{
        display: 'flex',
        gap: '60px',
        animation: 'ticker-scroll 80s linear infinite',
        whiteSpace: 'nowrap',
        fontSize: '0.72rem',
        color: '#8FA0B5'
      }}>
        {[...NEWS_ITEMS, ...NEWS_ITEMS].map((item, i) => (
          <span key={i} style={{ color: item.includes('SEBI ALERT') || item.includes('WARNING') || item.includes('bans') ? '#D34E36' : item.includes('SafalNiveshak') ? '#D98E04' : '#8FA0B5' }}>
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ==========================================
// STATIC STOCK CATALOG
// ==========================================
const STOCK_CATALOG = [
  { symbol: 'BSE:RELIANCE', ns: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Energy/Retail', price: 2450.00, change: 1.4, mktCap: '₹16.6L Cr' },
  { symbol: 'BSE:TCS', ns: 'TCS.NS', name: 'TCS', sector: 'IT Services', price: 3850.00, change: -0.8, mktCap: '₹13.9L Cr' },
  { symbol: 'BSE:HDFCBANK', ns: 'HDFCBANK.NS', name: 'HDFC Bank', sector: 'Banking', price: 1620.00, change: -0.3, mktCap: '₹12.3L Cr' },
  { symbol: 'BSE:INFY', ns: 'INFY.NS', name: 'Infosys', sector: 'IT Services', price: 1540.00, change: 0.5, mktCap: '₹6.4L Cr' },
  { symbol: 'BSE:ICICIBANK', ns: 'ICICIBANK.NS', name: 'ICICI Bank', sector: 'Banking', price: 1110.00, change: 1.1, mktCap: '₹7.8L Cr' },
  { symbol: 'BSE:SBIN', ns: 'SBIN.NS', name: 'State Bank of India', sector: 'Banking', price: 830.00, change: 2.3, mktCap: '₹7.4L Cr' },
  { symbol: 'BSE:BAJFINANCE', ns: 'BAJFINANCE.NS', name: 'Bajaj Finance', sector: 'NBFC', price: 6850.00, change: 0.1, mktCap: '₹4.2L Cr' },
  { symbol: 'BSE:ASIANPAINT', ns: 'ASIANPAINT.NS', name: 'Asian Paints', sector: 'Consumer', price: 2890.00, change: -0.5, mktCap: '₹2.8L Cr' },
  { symbol: 'BSE:TITAN', ns: 'TITAN.NS', name: 'Titan Company', sector: 'Consumer', price: 3250.00, change: 0.8, mktCap: '₹2.9L Cr' },
  { symbol: 'BSE:ZOMATO', ns: 'ZOMATO.NS', name: 'Zomato', sector: 'Tech/Food', price: 265.00, change: 4.2, mktCap: '₹2.4L Cr' },
  { symbol: 'BSE:ITC', ns: 'ITC.NS', name: 'ITC Ltd', sector: 'FMCG', price: 430.00, change: 0.3, mktCap: '₹5.4L Cr' },
  { symbol: 'BSE:MARUTI', ns: 'MARUTI.NS', name: 'Maruti Suzuki', sector: 'Auto', price: 12100.00, change: 1.2, mktCap: '₹3.7L Cr' },
  { symbol: 'BSE:TATAMOTORS', ns: 'TATAMOTORS.NS', name: 'Tata Motors', sector: 'Auto', price: 960.00, change: 1.7, mktCap: '₹3.5L Cr' },
  { symbol: 'BSE:WIPRO', ns: 'WIPRO.NS', name: 'Wipro Ltd', sector: 'IT Services', price: 460.00, change: -1.2, mktCap: '₹2.4L Cr' },
  { symbol: 'BSE:COALINDIA', ns: 'COALINDIA.NS', name: 'Coal India', sector: 'Mining', price: 470.00, change: -0.4, mktCap: '₹2.9L Cr' },
  { symbol: 'BSE:SENSEX', ns: 'SENSEX.BS', name: 'Sensex Index', sector: 'Index', price: 81300.00, change: 0.4, mktCap: 'Index' },
];

// ==========================================
// MAIN ABHYAS TERMINAL
// ==========================================
export default function Abhyas({ lang, theme, onNavigateToSeekho }) {
  const getTxt = (en, hi) => lang === 'en' ? en : hi;

  // ---- State ----
  const [subTab, setSubTab] = useState('ultimate'); // 'ultimate' | 'stocks' | 'mf'
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('abhyas_portfolio_v2');
    return saved ? JSON.parse(saved) : { balance: 100000, holdings: [], transactions: [] };
  });

  const [selectedSymbol, setSelectedSymbol] = useState(STOCK_CATALOG[0]);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('positions'); // 'positions' | 'orders' | 'pnl'
  const [searchQ, setSearchQ] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [tradeMsg, setTradeMsg] = useState(null); // { type: 'success'|'error', text }
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addFundsAmt, setAddFundsAmt] = useState('');
  const [showConfirm, setShowConfirm] = useState(null); // { type: 'BUY'|'SELL' }
  const [timeframe, setTimeframe] = useState('15');
  const [learningContext, setLearningContext] = useState('CHART_BASICS');
  const [showLearning, setShowLearning] = useState(true);
  const searchRef = useRef(null);

  const savePortfolio = useCallback((p) => {
    setPortfolio(p);
    localStorage.setItem('abhyas_portfolio_v2', JSON.stringify(p));
  }, []);

  // ---- Derived ----
  const stockPrice = selectedSymbol?.price || 0;
  const currentHolding = portfolio.holdings.find(h => h.symbol === selectedSymbol?.ns);
  const holdingQty = currentHolding?.quantity || 0;
  const holdingAvg = currentHolding?.avgBuyPrice || 0;
  const holdingPL = holdingQty > 0 ? (stockPrice - holdingAvg) * holdingQty : 0;
  const totalCost = stockPrice * qty;

  // Total portfolio value
  const totalPortfolioValue = portfolio.holdings.reduce((acc, h) => {
    const s = STOCK_CATALOG.find(s => s.ns === h.symbol);
    return acc + (s ? s.price * h.quantity : h.avgBuyPrice * h.quantity);
  }, portfolio.balance);

  // ---- Trade ----
  const placeTrade = (type) => {
    setTradeMsg(null);
    const qtyN = parseInt(qty);
    if (isNaN(qtyN) || qtyN <= 0) {
      setTradeMsg({ type: 'error', text: 'Enter a valid quantity (minimum 1)' });
      return;
    }

    const stock = selectedSymbol;
    const total = stock.price * qtyN;

    if (type === 'BUY' && portfolio.balance < total) {
      setTradeMsg({ type: 'error', text: `Insufficient virtual balance. Need ₹${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })} — have ₹${portfolio.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` });
      return;
    }
    if (type === 'SELL') {
      const h = portfolio.holdings.find(h => h.symbol === stock.ns);
      if (!h || h.quantity < qtyN) {
        setTradeMsg({ type: 'error', text: `You only hold ${h?.quantity || 0} shares. Cannot sell ${qtyN}.` });
        return;
      }
    }

    const p = JSON.parse(JSON.stringify(portfolio));
    if (type === 'BUY') {
      p.balance -= total;
      const idx = p.holdings.findIndex(h => h.symbol === stock.ns);
      if (idx !== -1) {
        const prev = p.holdings[idx];
        const newQty = prev.quantity + qtyN;
        prev.avgBuyPrice = ((prev.avgBuyPrice * prev.quantity) + total) / newQty;
        prev.quantity = newQty;
      } else {
        p.holdings.push({ symbol: stock.ns, name: stock.name, quantity: qtyN, avgBuyPrice: stock.price });
      }
    } else {
      p.balance += total;
      const idx = p.holdings.findIndex(h => h.symbol === stock.ns);
      p.holdings[idx].quantity -= qtyN;
      if (p.holdings[idx].quantity === 0) p.holdings.splice(idx, 1);
    }
    p.transactions.unshift({
      id: Date.now(), symbol: stock.symbol, ns: stock.ns, name: stock.name,
      type, quantity: qtyN, price: stock.price, total,
      ts: new Date().toLocaleString('en-IN')
    });
    savePortfolio(p);
    setTradeMsg({ type: 'success', text: `${type} executed: ${qtyN} × ${stock.name} @ ₹${stock.price.toLocaleString('en-IN')}` });
    setShowConfirm(null);
    setTimeout(() => setTradeMsg(null), 4000);
  };

  // ---- Add Funds ----
  const handleAddFunds = () => {
    const amt = parseFloat(addFundsAmt);
    if (isNaN(amt) || amt <= 0 || amt > 10000000) {
      setTradeMsg({ type: 'error', text: 'Enter a valid amount (max ₹1 Crore)' });
      return;
    }
    const p = JSON.parse(JSON.stringify(portfolio));
    p.balance += amt;
    p.transactions.unshift({
      id: Date.now(), symbol: '—', name: 'Virtual Fund Deposit', type: 'DEPOSIT',
      quantity: 1, price: amt, total: amt, ts: new Date().toLocaleString('en-IN')
    });
    savePortfolio(p);
    setAddFundsAmt('');
    setShowAddFunds(false);
    setTradeMsg({ type: 'success', text: `₹${amt.toLocaleString('en-IN')} added to virtual account` });
    setTimeout(() => setTradeMsg(null), 3000);
  };

  // ---- Reset ----
  const handleReset = () => {
    if (!window.confirm('Reset Abhyas portfolio to ₹1,00,000 virtual balance?')) return;
    const fresh = { balance: 100000, holdings: [], transactions: [] };
    savePortfolio(fresh);
  };

  // ---- Search ----
  const filteredStocks = STOCK_CATALOG.filter(s =>
    s.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    s.symbol.toLowerCase().includes(searchQ.toLowerCase()) ||
    s.sector.toLowerCase().includes(searchQ.toLowerCase())
  );

  // ---- Timeframes ----
  const TIMEFRAMES = [
    { label: '1m', value: '1' },
    { label: '5m', value: '5' },
    { label: '15m', value: '15' },
    { label: '1h', value: '60' },
    { label: '4h', value: '240' },
    { label: '1D', value: 'D' },
  ];

  return (
    <div style={{
      backgroundColor: '#070E1A',
      height: 'calc(100vh - 65px)',
      overflow: 'hidden',
      color: '#E8E4DA',
      fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* VIRTUAL DISCLAIMER BANNER */}
      <div style={{
        backgroundColor: '#1a0a00',
        borderBottom: '1px solid #D98E04',
        padding: '5px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        fontSize: '0.72rem',
        color: '#D98E04',
        fontWeight: '700',
        letterSpacing: '0.05em'
      }}>
        <span>⚠️</span>
        <span>
          {getTxt(
            'ABHYAS PAPER TRADING — 100% VIRTUAL MONEY • ZERO REAL RISK • यह सिर्फ अभ्यास है — असली पैसे की कोई जरूरत नहीं',
            'अभ्यास पेपर ट्रेडिंग — 100% वर्चुअल पैसा • कोई वास्तविक जोखिम नहीं'
          )}
        </span>
        <span>⚠️</span>
      </div>

      {/* TICKER BAR */}
      <TickerBar />

      {/* SUB-NAVIGATION TABS */}
      <div style={{
        display: 'flex',
        backgroundColor: '#0A1628',
        borderBottom: '1px solid #1a2840',
        padding: '0 16px',
        gap: '12px',
        flexShrink: 0
      }}>
        <button
          onClick={() => setSubTab('ultimate')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: subTab === 'ultimate' ? '3px solid #D98E04' : '3px solid transparent',
            color: subTab === 'ultimate' ? '#D98E04' : '#8FA0B5',
            padding: '12px 18px',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            letterSpacing: '0.03em',
            outline: 'none'
          }}
        >
          🚀 {getTxt('Abhyas Ultimate', 'अभ्यास अल्टीमेट (ऑल-इन-वन)')}
        </button>
        <button
          onClick={() => setSubTab('stocks')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: subTab === 'stocks' ? '3px solid #D98E04' : '3px solid transparent',
            color: subTab === 'stocks' ? '#D98E04' : '#8FA0B5',
            padding: '12px 18px',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            letterSpacing: '0.03em',
            outline: 'none'
          }}
        >
          📊 {getTxt('Stock Trading (Classic)', 'क्लासिक स्टॉक ट्रेडिंग')}
        </button>
        <button
          onClick={() => setSubTab('mf')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: subTab === 'mf' ? '3px solid #D98E04' : '3px solid transparent',
            color: subTab === 'mf' ? '#D98E04' : '#8FA0B5',
            padding: '12px 18px',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            letterSpacing: '0.03em',
            outline: 'none'
          }}
        >
          📈 {getTxt('Mutual Funds (Classic)', 'क्लासिक म्यूचुअल फंड')}
        </button>
      </div>

      {subTab === 'ultimate' ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <AbhyasUltimate lang={lang} theme={theme} />
        </div>
      ) : subTab === 'stocks' ? (
        <>
          {/* SYMBOL SEARCH BAR */}
          <div style={{
        backgroundColor: '#0A1628',
        borderBottom: '1px solid #1a2840',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'relative',
        zIndex: 100
      }}>
        {/* Symbol selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSearch(!showSearch)}
            style={{
              backgroundColor: '#0f1e35',
              border: '1px solid #2a3f5f',
              borderRadius: '6px',
              color: '#E8E4DA',
              padding: '6px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              minWidth: '200px'
            }}
          >
            <span style={{ color: '#4a9eff', fontSize: '0.75rem', fontWeight: 'bold' }}>{selectedSymbol?.symbol?.split(':')[0]}:</span>
            <span>{selectedSymbol?.symbol?.split(':')[1] || selectedSymbol?.symbol}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#8FA0B5' }}>▼</span>
          </button>

          {showSearch && (
            <div style={{
              position: 'absolute',
              top: '38px',
              left: 0,
              width: '340px',
              backgroundColor: '#0d1b2e',
              border: '1px solid #2a3f5f',
              borderRadius: '8px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
              zIndex: 200
            }}>
              <div style={{ padding: '10px' }}>
                <input
                  ref={searchRef}
                  autoFocus
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search symbol, name, sector..."
                  style={{
                    width: '100%',
                    backgroundColor: '#0A1628',
                    border: '1px solid #2a3f5f',
                    borderRadius: '6px',
                    color: '#E8E4DA',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {filteredStocks.map(s => (
                  <div
                    key={s.symbol}
                    onClick={() => { setSelectedSymbol(s); setShowSearch(false); setSearchQ(''); }}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #1a2840',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: selectedSymbol?.symbol === s.symbol ? '#1a2840' : 'transparent',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a2840'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = selectedSymbol?.symbol === s.symbol ? '#1a2840' : 'transparent'}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#E8E4DA' }}>{s.symbol}</div>
                      <div style={{ fontSize: '0.72rem', color: '#8FA0B5' }}>{s.name} • {s.sector}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>₹{s.price.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.72rem', color: s.change >= 0 ? '#22c55e' : '#ef4444' }}>
                        {s.change >= 0 ? '+' : ''}{s.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>



        {/* Live price ticker in header */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#E8E4DA' }}>
              ₹{selectedSymbol?.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span style={{
              marginLeft: '8px',
              fontSize: '0.82rem',
              color: (selectedSymbol?.change || 0) >= 0 ? '#22c55e' : '#ef4444',
              fontWeight: '600'
            }}>
              {(selectedSymbol?.change || 0) >= 0 ? '▲' : '▼'} {Math.abs(selectedSymbol?.change || 0)}%
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8FA0B5' }}>
            {selectedSymbol?.mktCap && <span>MCap: {selectedSymbol.mktCap}</span>}
          </div>

          {/* Add Funds button */}
          <button
            onClick={() => setShowAddFunds(true)}
            style={{
              backgroundColor: '#1a3a1a',
              border: '1px solid #22c55e',
              borderRadius: '6px',
              color: '#22c55e',
              padding: '6px 14px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            onMouseEnter={() => setLearningContext('ADD_FUNDS')}
          >
            + {getTxt('Add Funds', 'फंड जोड़ें')}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 160px)', minHeight: '500px' }}>

        {/* LEARNING ASSISTANT SIDEBAR */}
        {showLearning && (
          <div style={{
            width: '280px',
            backgroundColor: '#0a1628',
            borderRight: '1px solid #1a2840',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#D98E04', letterSpacing: '0.05em' }}>
                💡 {getTxt('LIVE INSIGHT', 'सीखो लाइव')}
              </span>
              <button onClick={() => setShowLearning(false)} style={{ background: 'none', border: 'none', color: '#8FA0B5', cursor: 'pointer' }}>✖</button>
            </div>
            
            <div style={{
              backgroundColor: '#112138',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #2a3f5f'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                {abhyasContextData[learningContext]?.icon}
              </div>
              <h4 style={{ fontSize: '1rem', color: '#E8E4DA', marginBottom: '8px', fontWeight: '700' }}>
                {getTxt(abhyasContextData[learningContext]?.titleEn, abhyasContextData[learningContext]?.titleHi)}
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#8FA0B5', lineHeight: '1.5' }}>
                {getTxt(abhyasContextData[learningContext]?.descEn, abhyasContextData[learningContext]?.descHi)}
              </p>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '20px', fontSize: '0.7rem', color: '#4D648D', textAlign: 'center' }}>
              {getTxt('Insights change automatically as you trade.', 'जैसे-जैसे आप ट्रेडिंग करेंगे, जानकारी बदलती रहेगी।')}
            </div>
          </div>
        )}

        {/* CHART AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} onMouseEnter={() => setLearningContext('CHART_BASICS')}>
          <div style={{ flex: 1, position: 'relative', minHeight: '380px' }}>
            <TradingViewChart symbol={selectedSymbol?.symbol || 'BSE:RELIANCE'} theme="dark" />
          </div>

          {/* POSITIONS / ORDERS TABLE */}
          <div style={{
            backgroundColor: '#0A1628',
            borderTop: '1px solid #1a2840',
            minHeight: '160px',
            maxHeight: '240px'
          }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid #1a2840', backgroundColor: '#070E1A' }}>
              {[
                { key: 'positions', label: getTxt('Active Positions', 'सक्रिय होल्डिंग्स') },
                { key: 'orders', label: getTxt('Order History', 'ऑर्डर इतिहास') },
                { key: 'pnl', label: getTxt('P&L Summary', 'लाभ/हानि') },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setLearningContext('PORTFOLIO_PNL'); }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.key ? '2px solid #D98E04' : '2px solid transparent',
                    color: activeTab === tab.key ? '#D98E04' : '#8FA0B5',
                    padding: '8px 18px',
                    fontSize: '0.8rem',
                    fontWeight: activeTab === tab.key ? '700' : '400',
                    cursor: 'pointer',
                    letterSpacing: '0.03em'
                  }}
                >
                  {tab.label}
                  {tab.key === 'positions' && portfolio.holdings.length > 0 && (
                    <span style={{ marginLeft: '6px', backgroundColor: '#D98E04', color: '#000', borderRadius: '10px', padding: '0 5px', fontSize: '0.65rem', fontWeight: '900' }}>
                      {portfolio.holdings.length}
                    </span>
                  )}
                </button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px' }}>
                <button onClick={handleReset} style={{ background: 'none', border: '1px solid #2a3f5f', borderRadius: '4px', color: '#8FA0B5', padding: '3px 10px', fontSize: '0.72rem', cursor: 'pointer' }}>
                  Reset Portfolio
                </button>
              </div>
            </div>

            {/* Table content */}
            <div style={{ overflowY: 'auto', maxHeight: '190px' }}>
              {activeTab === 'positions' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#070E1A', color: '#8FA0B5', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.06em' }}>
                      <th style={{ padding: '6px 12px', textAlign: 'left' }}>Asset</th>
                      <th style={{ padding: '6px 12px', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '6px 12px', textAlign: 'right' }}>Qty</th>
                      <th style={{ padding: '6px 12px', textAlign: 'right' }}>Avg Entry</th>
                      <th style={{ padding: '6px 12px', textAlign: 'right' }}>LTP</th>
                      <th style={{ padding: '6px 12px', textAlign: 'right' }}>Live P&L</th>
                      <th style={{ padding: '6px 12px', textAlign: 'center' }}>Close</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.holdings.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#8FA0B5', fontSize: '0.82rem' }}>
                          No active positions. Select a stock and place your first virtual trade →
                        </td>
                      </tr>
                    ) : portfolio.holdings.map(h => {
                      const s = STOCK_CATALOG.find(x => x.ns === h.symbol);
                      const ltp = s?.price || h.avgBuyPrice;
                      const pl = (ltp - h.avgBuyPrice) * h.quantity;
                      const plPct = ((ltp - h.avgBuyPrice) / h.avgBuyPrice * 100);
                      return (
                        <tr key={h.symbol} style={{ borderBottom: '1px solid #1a2840' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0d1b2e'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ fontWeight: '700', color: '#E8E4DA' }}>{h.symbol?.replace('.NS', '')}</div>
                            <div style={{ fontSize: '0.65rem', color: '#8FA0B5' }}>{h.name}</div>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{ backgroundColor: '#1a3a1a', color: '#22c55e', border: '1px solid #22c55e', borderRadius: '4px', padding: '2px 6px', fontSize: '0.65rem', fontWeight: '800' }}>BUY</span>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#E8E4DA' }}>{h.quantity}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#8FA0B5' }}>₹{h.avgBuyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#E8E4DA' }}>₹{ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: pl >= 0 ? '#22c55e' : '#ef4444', fontWeight: '700' }}>
                            {pl >= 0 ? '+' : ''}₹{pl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span style={{ marginLeft: '4px', fontSize: '0.65rem' }}>({plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%)</span>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <button
                              onClick={() => { setSelectedSymbol(s || selectedSymbol); setQty(h.quantity); setShowConfirm({ type: 'SELL' }); }}
                              style={{
                                backgroundColor: '#2a0a0a', border: '1px solid #ef4444', borderRadius: '4px',
                                color: '#ef4444', padding: '3px 10px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: '700'
                              }}
                            >
                              CLOSE
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {activeTab === 'orders' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#070E1A', color: '#8FA0B5', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.06em' }}>
                      <th style={{ padding: '6px 12px', textAlign: 'left' }}>Time</th>
                      <th style={{ padding: '6px 12px', textAlign: 'left' }}>Symbol</th>
                      <th style={{ padding: '6px 12px', textAlign: 'center' }}>Type</th>
                      <th style={{ padding: '6px 12px', textAlign: 'right' }}>Qty</th>
                      <th style={{ padding: '6px 12px', textAlign: 'right' }}>Price</th>
                      <th style={{ padding: '6px 12px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.transactions.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#8FA0B5', fontSize: '0.82rem' }}>No orders yet</td></tr>
                    ) : portfolio.transactions.slice(0, 30).map((t, i) => (
                      <tr key={t.id || i} style={{ borderBottom: '1px solid #1a2840' }}>
                        <td style={{ padding: '6px 12px', color: '#8FA0B5', fontSize: '0.72rem' }}>{t.ts}</td>
                        <td style={{ padding: '6px 12px', fontWeight: '600', color: '#E8E4DA' }}>{t.symbol?.replace('NSE:', '')}</td>
                        <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                          <span style={{
                            backgroundColor: t.type === 'BUY' ? '#1a3a1a' : t.type === 'SELL' ? '#2a0a0a' : '#1a2a0a',
                            color: t.type === 'BUY' ? '#22c55e' : t.type === 'SELL' ? '#ef4444' : '#D98E04',
                            border: `1px solid ${t.type === 'BUY' ? '#22c55e' : t.type === 'SELL' ? '#ef4444' : '#D98E04'}`,
                            borderRadius: '4px', padding: '1px 6px', fontSize: '0.65rem', fontWeight: '800'
                          }}>
                            {t.type}
                          </span>
                        </td>
                        <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{t.quantity}</td>
                        <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#8FA0B5' }}>₹{t.price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#E8E4DA', fontWeight: '600' }}>₹{t.total?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'pnl' && (() => {
                const totalInvested = portfolio.holdings.reduce((acc, h) => acc + h.avgBuyPrice * h.quantity, 0);
                const totalCurrentVal = portfolio.holdings.reduce((acc, h) => {
                  const s = STOCK_CATALOG.find(x => x.ns === h.symbol);
                  return acc + (s?.price || h.avgBuyPrice) * h.quantity;
                }, 0);
                const unrealizedPL = totalCurrentVal - totalInvested;
                return (
                  <div style={{ padding: '16px 20px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                    {[
                      { label: 'Available Cash', val: `₹${portfolio.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#E8E4DA' },
                      { label: 'Invested Value', val: `₹${totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#8FA0B5' },
                      { label: 'Current Value', val: `₹${totalCurrentVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#E8E4DA' },
                      { label: 'Unrealized P&L', val: `${unrealizedPL >= 0 ? '+' : ''}₹${unrealizedPL.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: unrealizedPL >= 0 ? '#22c55e' : '#ef4444' },
                      { label: 'Total Portfolio', val: `₹${totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#D98E04' },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ fontSize: '0.65rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{item.label}</div>
                        <div style={{ fontSize: '1rem', fontWeight: '800', color: item.color, fontFamily: 'monospace' }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* RIGHT: EXECUTION TERMINAL */}
        <div style={{
          width: '280px',
          flexShrink: 0,
          backgroundColor: '#0A1628',
          borderLeft: '1px solid #1a2840',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}>
          {/* Terminal header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a2840' }}>
            <div style={{ fontSize: '0.65rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
              EXECUTION TERMINAL
            </div>
            <div style={{ fontSize: '0.72rem', color: '#D98E04', fontWeight: '700' }}>
              SafalNiveshak Abhyas v2.0
            </div>
          </div>

          {/* Account balance */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a2840' }}>
            <div style={{ fontSize: '0.65rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>
              VIRTUAL BALANCE
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#22c55e', fontFamily: 'monospace' }}>
              ₹{portfolio.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8FA0B5', marginTop: '2px' }}>
              Portfolio: ₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <button
              onClick={() => setShowAddFunds(true)}
              style={{
                marginTop: '8px', width: '100%', backgroundColor: '#0f2a0f',
                border: '1px solid #22c55e', borderRadius: '6px', color: '#22c55e',
                padding: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '700'
              }}
            >
              + {getTxt('Add Virtual Funds', 'वर्चुअल फंड जोड़ें')}
            </button>
          </div>

          {/* Selected stock */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a2840' }}>
            <div style={{ fontSize: '0.65rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>
              SELECTED INSTRUMENT
            </div>
            <div style={{ fontWeight: '800', color: '#E8E4DA', fontSize: '0.95rem' }}>
              {selectedSymbol?.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8FA0B5' }}>{selectedSymbol?.sector}</div>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#8FA0B5' }}>MARKET PRICE</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '900', fontFamily: 'monospace', color: '#E8E4DA' }}>
                  ₹{selectedSymbol?.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: (selectedSymbol?.change || 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                  {(selectedSymbol?.change || 0) >= 0 ? '▲' : '▼'} {Math.abs(selectedSymbol?.change || 0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Current holding */}
          {holdingQty > 0 && (
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #1a2840', backgroundColor: '#0d1b2e' }}>
              <div style={{ fontSize: '0.65rem', color: '#8FA0B5', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>YOUR POSITION</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#8FA0B5' }}>{holdingQty} shares @ ₹{holdingAvg.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span style={{ color: holdingPL >= 0 ? '#22c55e' : '#ef4444', fontWeight: '700' }}>
                  {holdingPL >= 0 ? '+' : ''}₹{holdingPL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          )}

          {/* Order entry */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a2840' }}>
            <div style={{ fontSize: '0.65rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
              ORDER ENTRY
            </div>

            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: '#8FA0B5', marginBottom: '4px' }}>QUANTITY</div>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={e => setQty(e.target.value)}
                onFocus={() => setLearningContext('ORDER_QUANTITY')}
                style={{
                  width: '100%',
                  backgroundColor: '#0f1e35',
                  border: '1px solid #2a3f5f',
                  borderRadius: '6px',
                  color: '#E8E4DA',
                  padding: '8px 10px',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  fontWeight: '700',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.72rem' }}>
              <span style={{ color: '#8FA0B5' }}>Order Value:</span>
              <span style={{ color: '#D98E04', fontFamily: 'monospace', fontWeight: '700' }}>
                ₹{(stockPrice * (parseInt(qty) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Quick qty shortcuts */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
              {[1, 5, 10, 25].map(n => (
                <button
                  key={n}
                  onClick={() => setQty(n)}
                  style={{
                    flex: 1, backgroundColor: '#0f1e35', border: '1px solid #2a3f5f', borderRadius: '4px',
                    color: '#8FA0B5', padding: '3px 0', fontSize: '0.7rem', cursor: 'pointer'
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* BUY / SELL buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setShowConfirm({ type: 'BUY' })}
                style={{
                  flex: 1, backgroundColor: '#14532d', border: '2px solid #22c55e',
                  borderRadius: '8px', color: '#22c55e', padding: '14px 0',
                  fontSize: '1rem', fontWeight: '900', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { setLearningContext('BUY_ORDER'); e.currentTarget.style.backgroundColor = '#22c55e'; e.currentTarget.style.color = '#000'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#14532d'; e.currentTarget.style.color = '#22c55e'; }}
              >
                <span style={{ fontSize: '1.1rem' }}>↗</span>
                <span>BUY</span>
                <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>LONG</span>
              </button>
              <button
                onClick={() => setShowConfirm({ type: 'SELL' })}
                style={{
                  flex: 1, backgroundColor: '#450a0a', border: '2px solid #ef4444',
                  borderRadius: '8px', color: '#ef4444', padding: '14px 0',
                  fontSize: '1rem', fontWeight: '900', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { setLearningContext('SELL_ORDER'); e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#000'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#450a0a'; e.currentTarget.style.color = '#ef4444'; }}
              >
                <span style={{ fontSize: '1.1rem' }}>↘</span>
                <span>SELL</span>
                <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>CLOSE</span>
              </button>
            </div>
          </div>

          {/* Virtual disclaimer */}
          <div style={{ padding: '10px 14px', backgroundColor: '#1a0a00', borderBottom: '1px solid #D98E04' }}>
            <div style={{ fontSize: '0.65rem', color: '#D98E04', lineHeight: '1.5', textAlign: 'center' }}>
              ⚠️ {getTxt(
                'VIRTUAL MONEY ONLY — No real trades executed. For learning purposes.',
                'केवल वर्चुअल पैसा — कोई असली ट्रेड नहीं। सीखने के लिए।'
              )}
            </div>
          </div>

          {/* Stock watchlist */}
          <div style={{ padding: '10px 14px', flex: 1 }}>
            <div style={{ fontSize: '0.65rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
              WATCHLIST
            </div>
            {STOCK_CATALOG.slice(0, 8).map(s => (
              <div
                key={s.symbol}
                onClick={() => setSelectedSymbol(s)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 4px',
                  borderBottom: '1px solid #1a2840',
                  cursor: 'pointer',
                  backgroundColor: selectedSymbol?.symbol === s.symbol ? '#1a2840' : 'transparent',
                  borderRadius: '4px'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a2840'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = selectedSymbol?.symbol === s.symbol ? '#1a2840' : 'transparent'}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#E8E4DA' }}>{s.symbol.replace('NSE:', '')}</div>
                  <div style={{ fontSize: '0.62rem', color: '#8FA0B5' }}>{s.sector}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#E8E4DA' }}>₹{s.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                  <div style={{ fontSize: '0.65rem', color: s.change >= 0 ? '#22c55e' : '#ef4444' }}>
                    {s.change >= 0 ? '+' : ''}{s.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <AbhyasMF lang={lang} theme={theme} />
        </div>
      )}

      {/* TRADE CONFIRMATION MODAL */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#0d1b2e', border: `2px solid ${showConfirm.type === 'BUY' ? '#22c55e' : '#ef4444'}`,
            borderRadius: '12px', padding: '28px', width: '360px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.8)'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
              CONFIRM {showConfirm.type} ORDER
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: showConfirm.type === 'BUY' ? '#22c55e' : '#ef4444', marginBottom: '16px' }}>
              {showConfirm.type === 'BUY' ? '↗ BUY (LONG)' : '↘ SELL (CLOSE)'}
            </div>

            <div style={{ backgroundColor: '#0A1628', borderRadius: '8px', padding: '14px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Symbol', val: selectedSymbol?.symbol },
                { label: 'Quantity', val: `${qty} shares` },
                { label: 'Price', val: `₹${stockPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
                { label: 'Total Value', val: `₹${(stockPrice * (parseInt(qty) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#8FA0B5' }}>{row.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#E8E4DA', fontFamily: 'monospace' }}>{row.val}</span>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#1a0a00', border: '1px solid #D98E04', borderRadius: '6px', padding: '8px 12px', marginBottom: '16px', fontSize: '0.72rem', color: '#D98E04', textAlign: 'center' }}>
              ⚠️ Virtual trade only — no real money involved
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowConfirm(null)}
                style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid #2a3f5f', borderRadius: '8px', color: '#8FA0B5', padding: '12px', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => placeTrade(showConfirm.type)}
                style={{
                  flex: 1.5,
                  backgroundColor: showConfirm.type === 'BUY' ? '#22c55e' : '#ef4444',
                  border: 'none', borderRadius: '8px', color: '#000', padding: '12px',
                  cursor: 'pointer', fontSize: '0.95rem', fontWeight: '900'
                }}
              >
                Confirm {showConfirm.type}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD FUNDS MODAL */}
      {showAddFunds && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#0d1b2e', border: '1px solid #22c55e',
            borderRadius: '12px', padding: '28px', width: '360px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.8)'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>ADD VIRTUAL FUNDS</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#22c55e', marginBottom: '4px' }}>💳 Fund Your Account</div>
            <div style={{ fontSize: '0.8rem', color: '#8FA0B5', marginBottom: '20px' }}>
              {getTxt(
                'Add virtual money to practice more trades. Current balance: ₹' + portfolio.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
                'अभ्यास के लिए वर्चुअल पैसे जोड़ें। मौजूदा बैलेंस: ₹' + portfolio.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {[25000, 50000, 100000, 500000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setAddFundsAmt(String(amt))}
                  style={{
                    backgroundColor: addFundsAmt === String(amt) ? '#22c55e' : '#0f1e35',
                    border: `1px solid ${addFundsAmt === String(amt) ? '#22c55e' : '#2a3f5f'}`,
                    borderRadius: '6px', color: addFundsAmt === String(amt) ? '#000' : '#8FA0B5',
                    padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '700'
                  }}
                >
                  ₹{(amt / 1000)}K
                </button>
              ))}
            </div>

            <input
              type="number"
              value={addFundsAmt}
              onChange={e => setAddFundsAmt(e.target.value)}
              placeholder="Enter custom amount..."
              style={{
                width: '100%', backgroundColor: '#0A1628', border: '1px solid #2a3f5f',
                borderRadius: '6px', color: '#E8E4DA', padding: '10px 12px',
                fontSize: '1rem', fontFamily: 'monospace', outline: 'none',
                boxSizing: 'border-box', marginBottom: '16px'
              }}
            />

            <div style={{ backgroundColor: '#1a0a00', border: '1px solid #D98E04', borderRadius: '6px', padding: '8px 12px', marginBottom: '16px', fontSize: '0.72rem', color: '#D98E04', textAlign: 'center' }}>
              ⚠️ {getTxt('This is virtual money only — no real payment required', 'यह केवल वर्चुअल पैसा है — कोई असली भुगतान नहीं')}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setShowAddFunds(false); setAddFundsAmt(''); }}
                style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid #2a3f5f', borderRadius: '8px', color: '#8FA0B5', padding: '12px', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddFunds}
                style={{
                  flex: 1.5, backgroundColor: '#22c55e', border: 'none', borderRadius: '8px',
                  color: '#000', padding: '12px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '900'
                }}
              >
                Add ₹{addFundsAmt ? parseInt(addFundsAmt).toLocaleString('en-IN') : '—'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRADE STATUS TOAST */}
      {tradeMsg && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: tradeMsg.type === 'success' ? '#14532d' : '#450a0a',
          border: `1px solid ${tradeMsg.type === 'success' ? '#22c55e' : '#ef4444'}`,
          borderRadius: '8px', padding: '12px 20px',
          color: tradeMsg.type === 'success' ? '#22c55e' : '#ef4444',
          fontWeight: '700', fontSize: '0.85rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          zIndex: 2000, display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'fade-in 0.2s ease',
          maxWidth: '90vw'
        }}>
          <span>{tradeMsg.type === 'success' ? '✅' : '❌'}</span>
          {tradeMsg.text}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
