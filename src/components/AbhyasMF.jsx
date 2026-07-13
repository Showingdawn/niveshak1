import React, { useState, useEffect } from 'react';

export default function AbhyasMF({ lang, theme }) {
  const getTxt = (en, hi) => (lang === 'en' ? en : hi);

  // ---- State ----
  const [funds, setFunds] = useState([]);
  const [portfolio, setPortfolio] = useState({
    balance: 100000.0,
    total_invested: 0,
    total_current_value: 0,
    total_absolute_return: 0,
    total_absolute_return_pct: 0,
    portfolio_xirr: 0,
    holdings: [],
    mandates: [],
    transactions: []
  });

  const [selectedFund, setSelectedFund] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [activeTab, setActiveTab] = useState('holdings'); // 'holdings' | 'mandates' | 'orders'
  const [amountInput, setAmountInput] = useState('');
  const [investType, setInvestType] = useState('LUMPSUM'); // 'LUMPSUM' | 'SIP'
  
  const [showTransactModal, setShowTransactModal] = useState(null); // { type: 'BUY' | 'SELL', fund: obj }
  const [sellMode, setSellMode] = useState('AMOUNT'); // 'AMOUNT' | 'UNITS'
  const [sellValue, setSellValue] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null); // { type: 'success' | 'error', text }

  // ---- Fetch Data ----
  const fetchFunds = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/mf/funds");
      if (res.ok) {
        const data = await res.json();
        setFunds(data);
        if (!selectedFund && data.length > 0) {
          setSelectedFund(data[0]);
        }
      }
    } catch (err) {
      showToast('error', 'Failed to connect to API server.');
    }
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/mf/portfolio/sandbox_user");
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
      }
    } catch (err) {
      showToast('error', 'Failed to load portfolio statistics.');
    }
  };

  useEffect(() => {
    fetchFunds();
    fetchPortfolio();
  }, []);

  // ---- Toast Trigger ----
  const showToast = (type, text) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // ---- Lumpsum Buy / SIP Mandate Placement ----
  const handleBuy = async (e) => {
    e.preventDefault();
    if (!selectedFund) return;
    
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) {
      showToast('error', getTxt('Please enter a valid investment amount', 'कृपया एक सही निवेश राशि दर्ज करें'));
      return;
    }

    if (investType === 'SIP' && amt < 500) {
      showToast('error', getTxt('Minimum monthly SIP amount is ₹500', 'न्यूनतम मासिक एसआईपी राशि ₹500 है'));
      return;
    }

    if (portfolio.balance < amt) {
      showToast('error', getTxt('Insufficient virtual cash balance', 'अपर्याप्त वर्चुअल कैश बैलेंस'));
      return;
    }

    setLoading(true);
    try {
      if (investType === 'LUMPSUM') {
        const res = await fetch("http://localhost:5000/api/mf/transact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "sandbox_user",
            fundId: selectedFund.id,
            type: "BUY_LUMPSUM",
            amount: amt
          })
        });
        
        const data = await res.json();
        if (res.ok) {
          showToast('success', getTxt(`Lumpsum of ₹${amt.toLocaleString('en-IN')} successfully invested!`, `₹${amt.toLocaleString('en-IN')} का एकमुश्त निवेश सफल!`));
          setAmountInput('');
          setShowTransactModal(null);
          fetchPortfolio();
        } else {
          showToast('error', data.error || 'Investment failed');
        }
      } else {
        // SIP Mandate
        const res = await fetch("http://localhost:5000/api/mf/sip/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "sandbox_user",
            fundId: selectedFund.id,
            monthly_amount: amt
          })
        });
        
        const data = await res.json();
        if (res.ok) {
          showToast('success', getTxt(`Monthly SIP of ₹${amt.toLocaleString('en-IN')} scheduled successfully!`, `₹${amt.toLocaleString('en-IN')} की मासिक एसआईपी सफलतापूर्वक शुरू!`));
          setAmountInput('');
          setShowTransactModal(null);
          fetchPortfolio();
        } else {
          showToast('error', data.error || 'SIP schedule failed');
        }
      }
    } catch (err) {
      showToast('error', 'Server error placing investment.');
    } finally {
      setLoading(false);
    }
  };

  // ---- Sell Redemption ----
  const handleSell = async (e) => {
    e.preventDefault();
    if (!showTransactModal || !showTransactModal.fund) return;
    const fund = showTransactModal.fund;
    
    const val = parseFloat(sellValue);
    if (isNaN(val) || val <= 0) {
      showToast('error', getTxt('Please enter a valid value to redeem', 'कृपया निकासी के लिए सही मूल्य दर्ज करें'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: "sandbox_user",
        fundId: fund.fund_id || fund.id,
        type: "SELL"
      };
      
      if (sellMode === 'AMOUNT') {
        payload.amount = val;
      } else {
        payload.units = val;
      }

      const res = await fetch("http://localhost:5000/api/mf/transact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast('success', getTxt('Redemption successful!', 'निकासी सफल!'));
        setSellValue('');
        setShowTransactModal(null);
        fetchPortfolio();
      } else {
        showToast('error', data.error || 'Redemption failed');
      }
    } catch (err) {
      showToast('error', 'Server error redeeming units.');
    } finally {
      setLoading(false);
    }
  };

  // ---- Fast-Forward SIP Cycle Trigger ----
  const triggerSipCycle = async (mandateId) => {
    showToast('success', getTxt('Fast-forwarding 1 Month SIP cycle...', 'एसआईपी चक्र को १ महीना आगे बढ़ाया जा रहा है...'));
    try {
      const res = await fetch("http://localhost:5000/api/mf/sip/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "sandbox_user",
          mandateId: mandateId
        })
      });
      
      if (res.ok) {
        showToast('success', getTxt('SIP debit cycle executed successfully!', 'एसआईपी भुगतान चक्र सफलतापूर्वक पूरा!'));
        fetchPortfolio();
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Execution failed');
      }
    } catch (err) {
      showToast('error', 'Could not execute due SIP mandate.');
    }
  };

  // ---- Reset MF portfolio ----
  const handleResetPortfolio = async () => {
    if (!window.confirm(getTxt('Are you sure you want to reset your Mutual Fund portfolio to ₹1,00,000?', 'क्या आप अपने म्यूचुअल फंड पोर्टफोलियो को ₹1,00,000 पर रीसेट करना चाहते हैं?'))) {
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/abhyas/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "sandbox_user" })
      });
      if (res.ok) {
        showToast('success', getTxt('Portfolio reset successfully!', 'पोर्टफोलियो सफलतापूर्वक रीसेट!'));
        fetchPortfolio();
      }
    } catch (err) {
      showToast('error', 'Reset action failed.');
    }
  };

  // ---- Sparkline graph renderer ----
  const renderSparkline = (history) => {
    if (!history || history.length === 0) return null;
    const navs = history.map(h => h.nav);
    const min = Math.min(...navs);
    const max = Math.max(...navs);
    const range = max - min || 1;
    
    const width = 120;
    const height = 30;
    const padding = 2;
    
    const points = history.map((h, i) => {
      const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((h.nav - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    const trendColor = navs[navs.length - 1] >= navs[0] ? '#22c55e' : '#ef4444';
    
    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <polyline
          fill="none"
          stroke={trendColor}
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div style={{
      backgroundColor: '#070E1A',
      minHeight: 'calc(100vh - 160px)',
      color: '#E8E4DA',
      fontFamily: "'Inter', 'SF Pro Display', sans-serif",
      padding: '24px'
    }}>
      
      {/* HEADER SECTION */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid #1a2840',
        paddingBottom: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#D98E04', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {getTxt("MUTUAL FUND & SIP INVESTING TERMINAL", "म्यूचुअल फंड और एसआईपी सिम्युलेटर")}
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#E8E4DA', marginTop: '4px' }}>
            📈 {getTxt("Unified Abhyas Sandbox", "अभ्यास वर्चुअल म्यूचुअल फंड")}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleResetPortfolio} 
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #2a3f5f',
              borderRadius: '6px',
              color: '#8FA0B5',
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔄 {getTxt("Reset Simulator", "सिम्युलेटर रीसेट")}
          </button>
        </div>
      </div>

      {/* METRICS DASHBOARD CARD */}
      <div className="ledger-card" style={{
        backgroundColor: '#0A1628',
        borderColor: '#1a2840',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        backgroundImage: 'linear-gradient(135deg, rgba(10,22,40,0.6) 0%, rgba(13,27,47,0.8) 100%)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '24px'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {getTxt("VIRTUAL WALLET", "वर्चुअल कैश बैलेंस")}
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#22c55e', marginTop: '6px', fontFamily: 'monospace' }}>
              ₹{portfolio.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#8FA0B5' }}>
              {getTxt("Shared with stock terminal", "शेयर मार्केट सिम्युलेटर के साथ संयुक्त")}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {getTxt("TOTAL INVESTED", "कुल निवेशित राशि")}
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#E8E4DA', marginTop: '6px', fontFamily: 'monospace' }}>
              ₹{portfolio.total_invested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {getTxt("CURRENT PORTFOLIO VALUE", "पोर्टफोलियो का वर्तमान मूल्य")}
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#D98E04', marginTop: '6px', fontFamily: 'monospace' }}>
              ₹{portfolio.total_current_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {getTxt("ABSOLUTE RETURN", "कुल रिटर्न (लाभ/हानि)")}
            </span>
            <div style={{
              fontSize: '1.6rem',
              fontWeight: '900',
              color: portfolio.total_absolute_return >= 0 ? '#22c55e' : '#ef4444',
              marginTop: '6px',
              fontFamily: 'monospace'
            }}>
              {portfolio.total_absolute_return >= 0 ? '+' : ''}₹{portfolio.total_absolute_return.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              <span style={{ fontSize: '0.9rem', marginLeft: '6px', fontWeight: 'bold' }}>
                ({portfolio.total_absolute_return_pct >= 0 ? '+' : ''}{portfolio.total_absolute_return_pct}%)
              </span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {getTxt("PORTFOLIO XIRR", "कुल पोर्टफोलियो XIRR")}
            </span>
            <div style={{
              fontSize: '1.6rem',
              fontWeight: '900',
              color: portfolio.portfolio_xirr >= 0 ? '#22c55e' : '#ef4444',
              marginTop: '6px',
              fontFamily: 'monospace'
            }}>
              {portfolio.portfolio_xirr >= 0 ? '+' : ''}{portfolio.portfolio_xirr}%
            </div>
            <span style={{ fontSize: '0.7rem', color: '#8FA0B5' }}>
              {getTxt("IRR Newton-Raphson solved", "अनियमित कैशफ्लो इंटरनल रिटर्न")}
            </span>
          </div>
        </div>
      </div>

      {/* CORE INTERACTIVE GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '28px',
        alignItems: 'start'
      }}>
        
        {/* LEFT COLUMN: MUTUAL FUNDS CATALOG */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="ledger-card" style={{ padding: '20px', backgroundColor: '#0A1628', borderColor: '#1a2840' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#E8E4DA', marginBottom: '16px', fontWeight: '800' }}>
              🏦 {getTxt("Mutual Fund Explorer", "म्यूचुअल फंड डायरेक्टरी")}
            </h3>
            
            <input
              type="text"
              placeholder={getTxt("Search mutual fund...", "म्यूचुअल फंड खोजें...")}
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#070E1A',
                border: '1px solid #2a3f5f',
                borderRadius: '6px',
                color: '#E8E4DA',
                padding: '8px 12px',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '16px'
              }}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
              {funds.filter(fund => {
                const q = searchQ.toLowerCase().trim();
                return fund.name.toLowerCase().includes(q) || fund.symbol.toLowerCase().includes(q) || fund.category.toLowerCase().includes(q);
              }).map((fund) => {
                const isSelected = selectedFund && selectedFund.id === fund.id;
                return (
                  <div
                    key={fund.id}
                    onClick={() => setSelectedFund(fund)}
                    style={{
                      padding: '14px',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid var(--color-amber)' : '1px solid #1a2840',
                      backgroundColor: isSelected ? 'rgba(217, 142, 4, 0.04)' : '#070E1A',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: '#E8E4DA', display: 'block' }}>{fund.name}</strong>
                        <span style={{
                          fontSize: '0.68rem',
                          backgroundColor: '#0f2038',
                          color: '#4a9eff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          marginTop: '4px',
                          textTransform: 'uppercase',
                          fontWeight: '700'
                        }}>
                          {fund.category}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#E8E4DA', fontFamily: 'monospace' }}>
                          ₹{fund.current_nav.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: fund.monthly_growth >= 0 ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                          {fund.monthly_growth >= 0 ? '▲' : '▼'} {Math.abs(fund.monthly_growth)}% {getTxt("this month", "इस माह")}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px dotted #1a2840' }}>
                      <div style={{ fontSize: '0.72rem', color: '#8FA0B5' }}>
                        {getTxt("Expense Ratio: ", "व्यय अनुपात: ")}<strong style={{ color: '#E8E4DA' }}>{fund.expense_ratio}%</strong>
                      </div>
                      <div>
                        {renderSparkline(fund.nav_history)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TRANSACTION CONTROLS & SELECTED FUND INFORMATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {selectedFund && (
            <div className="ledger-card" style={{ padding: '20px', backgroundColor: '#0A1628', borderColor: '#1a2840' }}>
              <div style={{ borderBottom: '1px solid #1a2840', paddingBottom: '12px', marginBottom: '16px' }}>
                <span className="ticket-label" style={{ fontSize: '0.65rem' }}>{getTxt("INVESTMENT SCHEME DETAILS", "योजना का विवरण")}</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-amber)', marginTop: '4px' }}>
                  {selectedFund.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#8FA0B5' }}>{selectedFund.category}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#070E1A', padding: '10px', borderRadius: '4px', border: '1px solid #1a2840' }}>
                  <div style={{ fontSize: '0.65rem', color: '#8FA0B5' }}>{getTxt("CURRENT NAV", "वर्तमान एनएवी (इकाई मूल्य)")}</div>
                  <strong style={{ fontSize: '1.15rem', color: '#E8E4DA', fontFamily: 'monospace' }}>₹{selectedFund.current_nav.toFixed(4)}</strong>
                </div>
                <div style={{ backgroundColor: '#070E1A', padding: '10px', borderRadius: '4px', border: '1px solid #1a2840' }}>
                  <div style={{ fontSize: '0.65rem', color: '#8FA0B5' }}>{getTxt("EXPENSE RATIO", "वार्षिक व्यय अनुपात")}</div>
                  <strong style={{ fontSize: '1.15rem', color: '#E8E4DA', fontFamily: 'monospace' }}>{selectedFund.expense_ratio}%</strong>
                </div>
              </div>

              {/* BUY FORM */}
              <form onSubmit={handleBuy} style={{ borderTop: '1px dashed #1a2840', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#E8E4DA', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {getTxt("Configure Investment", "निवेश विन्यास")}
                </h4>
                
                {/* Lumpsum vs SIP selector */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setInvestType('LUMPSUM')}
                    style={{
                      flex: 1,
                      backgroundColor: investType === 'LUMPSUM' ? 'rgba(217,142,4,0.1)' : 'transparent',
                      border: `1.5px solid ${investType === 'LUMPSUM' ? 'var(--color-amber)' : '#2a3f5f'}`,
                      color: investType === 'LUMPSUM' ? 'var(--color-amber)' : '#8FA0B5',
                      padding: '8px 0',
                      borderRadius: '6px',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    💰 {getTxt("One-Time Lumpsum", "एकमुश्त (Lumpsum)")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvestType('SIP')}
                    style={{
                      flex: 1,
                      backgroundColor: investType === 'SIP' ? 'rgba(217,142,4,0.1)' : 'transparent',
                      border: `1.5px solid ${investType === 'SIP' ? 'var(--color-amber)' : '#2a3f5f'}`,
                      color: investType === 'SIP' ? 'var(--color-amber)' : '#8FA0B5',
                      padding: '8px 0',
                      borderRadius: '6px',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ⏳ {getTxt("Monthly SIP", "मासिक एसआईपी (SIP)")}
                  </button>
                </div>

                {/* Amount input */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.72rem', color: '#8FA0B5', display: 'block', marginBottom: '6px' }}>
                    {investType === 'LUMPSUM' 
                      ? getTxt("ONE-TIME INVESTMENT AMOUNT (₹)", "एकमुश्त निवेश राशि (₹)")
                      : getTxt("MONTHLY SIP INSTALMENT (₹)", "मासिक एसआईपी किस्त राशि (₹)")}
                  </label>
                  <input
                    type="number"
                    value={amountInput}
                    onChange={e => setAmountInput(e.target.value)}
                    placeholder="e.g. 5000"
                    min={investType === 'SIP' ? 500 : 100}
                    style={{
                      width: '100%',
                      backgroundColor: '#070E1A',
                      border: '1px solid #2a3f5f',
                      borderRadius: '6px',
                      color: '#E8E4DA',
                      padding: '12px',
                      fontSize: '1rem',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#8FA0B5', marginTop: '4px', display: 'block' }}>
                    {investType === 'SIP' 
                      ? getTxt("Minimum: ₹500/month. Debited automatically every month.", "न्यूनतम: ₹500/माह। हर महीने स्वतः डेबिट होगा।")
                      : getTxt("Minimum: ₹100. Allocated instantly at current NAV.", "न्यूनतम: ₹100। वर्तमान एनएवी पर तुरंत इकाइयाँ आबंटित होंगी।")}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !amountInput}
                  style={{
                    width: '100%',
                    backgroundColor: '#22c55e',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#000',
                    padding: '14px',
                    fontSize: '0.95rem',
                    fontWeight: '900',
                    cursor: loading || !amountInput ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading 
                    ? getTxt("Processing...", "प्रक्रिया जारी...") 
                    : (investType === 'LUMPSUM' 
                        ? getTxt(`Invest Lumpsum ₹${amountInput || '0'} ➔`, `एकमुश्त ₹${amountInput || '0'} निवेश करें ➔`)
                        : getTxt(`Setup Monthly SIP ₹${amountInput || '0'} ➔`, `मासिक एसआईपी ₹${amountInput || '0'} शुरू करें ➔`))}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* LOWER TABBED PERFORMANCE LEDGER PANEL */}
      <div className="ledger-card" style={{
        marginTop: '32px',
        backgroundColor: '#0A1628',
        borderColor: '#1a2840'
      }}>
        {/* Tab Headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1a2840', backgroundColor: '#070E1A' }}>
          {[
            { key: 'holdings', label: getTxt('Active MF Holdings', 'सक्रिय फंड पोर्टफोलियो') },
            { key: 'mandates', label: getTxt('Active SIP Mandates', 'सक्रिय एसआईपी योजनाएं') },
            { key: 'orders', label: getTxt('MF Transaction History', 'लेनदेन लेजर विवरण') },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #D98E04' : '2px solid transparent',
                color: activeTab === tab.key ? '#D98E04' : '#8FA0B5',
                padding: '12px 20px',
                fontSize: '0.85rem',
                fontWeight: activeTab === tab.key ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              {tab.label}
              {tab.key === 'holdings' && portfolio.holdings.length > 0 && (
                <span style={{ marginLeft: '6px', backgroundColor: '#D98E04', color: '#000', borderRadius: '10px', padding: '1px 5px', fontSize: '0.68rem', fontWeight: '900' }}>
                  {portfolio.holdings.length}
                </span>
              )}
              {tab.key === 'mandates' && portfolio.mandates.length > 0 && (
                <span style={{ marginLeft: '6px', backgroundColor: '#4a9eff', color: '#fff', borderRadius: '10px', padding: '1px 5px', fontSize: '0.68rem', fontWeight: '900' }}>
                  {portfolio.mandates.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ overflowX: 'auto' }}>
          
          {activeTab === 'holdings' && (
            <table className="ledger-table" style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px' }}>{getTxt("Mutual Fund Scheme", "म्यूचुअल फंड योजना")}</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>{getTxt("Units Held", "धारित इकाइयां")}</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>{getTxt("Average NAV", "औसत एनएवी")}</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>{getTxt("Current NAV", "वर्तमान एनएवी")}</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>{getTxt("Invested Amount", "निवेशित राशि")}</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>{getTxt("Current Value", "वर्तमान मूल्य")}</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>{getTxt("Absolute P&L", "कुल लाभ/हानि")}</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>{getTxt("Fund XIRR", "फंड XIRR")}</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', width: '120px' }}>{getTxt("Action", "कार्रवाई")}</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '32px', textAlign: 'center', color: '#8FA0B5' }}>
                      {getTxt("No mutual fund assets held in this sandbox profile.", "इस पोर्टफोलियो में कोई म्यूचुअल फंड एसेट उपलब्ध नहीं है।")}
                    </td>
                  </tr>
                ) : portfolio.holdings.map(h => {
                  const pnl = h.current_value - h.invested_amount;
                  const pnlPct = h.invested_amount > 0 ? (pnl / h.invested_amount * 100).toFixed(2) : 0;
                  return (
                    <tr key={h.fund_id}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                        <div>{h.name}</div>
                        <span style={{ fontSize: '0.65rem', color: '#4a9eff', textTransform: 'uppercase' }}>{h.category}</span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace' }}>{h.total_units.toFixed(4)}</td>
                      <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', color: '#8FA0B5' }}>₹{h.average_nav.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace' }}>₹{h.current_nav.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', color: '#8FA0B5' }}>₹{h.invested_amount.toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontWeight: 'bold' }}>₹{h.current_value.toLocaleString('en-IN')}</td>
                      <td style={{
                        textAlign: 'right',
                        padding: '12px 16px',
                        fontFamily: 'monospace',
                        color: pnl >= 0 ? '#22c55e' : '#ef4444',
                        fontWeight: '700'
                      }}>
                        {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString('en-IN')} ({pnl >= 0 ? '+' : ''}{pnlPct}%)
                      </td>
                      <td style={{
                        textAlign: 'right',
                        padding: '12px 16px',
                        fontFamily: 'monospace',
                        color: h.xirr >= 0 ? '#22c55e' : '#ef4444',
                        fontWeight: '700'
                      }}>
                        {h.xirr >= 0 ? '+' : ''}{h.xirr}%
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                        <button
                          onClick={() => {
                            setSellValue('');
                            setShowTransactModal({ type: 'SELL', fund: h });
                          }}
                          style={{
                            backgroundColor: '#2a0a0a',
                            border: '1px solid #ef4444',
                            borderRadius: '4px',
                            color: '#ef4444',
                            padding: '4px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          {getTxt("REDEEM", "निकासी")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === 'mandates' && (
            <table className="ledger-table" style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px' }}>{getTxt("Mutual Fund Scheme", "म्यूचुअल फंड योजना")}</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>{getTxt("Monthly Amount", "मासिक निवेश राशि")}</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px' }}>{getTxt("Start Date", "प्रारंभ तिथि")}</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px' }}>{getTxt("Last Execution Date", "अंतिम भुगतान तिथि")}</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px' }}>{getTxt("Status", "स्थिति")}</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', width: '200px' }}>{getTxt("Interactive Controls", "इंटरैक्टिव टूल्स")}</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.mandates.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#8FA0B5' }}>
                      {getTxt("No active recurring SIP mandates found.", "कोई सक्रिय एसआईपी योजना पंजीकृत नहीं है।")}
                    </td>
                  </tr>
                ) : portfolio.mandates.map(m => {
                  return (
                    <tr key={m.id}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                        <div>{m.fund_name}</div>
                        <span style={{ fontSize: '0.65rem', color: '#8FA0B5' }}>{m.fund_symbol}</span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace', fontWeight: 'bold', color: '#E8E4DA' }}>
                        ₹{m.monthly_amount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#8FA0B5' }}>{new Date(m.start_date).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '12px 16px', color: '#8FA0B5' }}>
                        {m.last_executed_date ? new Date(m.last_executed_date).toLocaleString('en-IN') : getTxt('Pending First Cycle', 'प्रथम चक्र लंबित')}
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: m.status === 'ACTIVE' ? '#1a3a1a' : '#2a1a0a',
                          color: m.status === 'ACTIVE' ? '#22c55e' : '#D98E04',
                          border: `1.5px solid ${m.status === 'ACTIVE' ? '#22c55e' : '#D98E04'}`,
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '0.68rem',
                          fontWeight: '800'
                        }}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                        <button
                          onClick={() => triggerSipCycle(m.id)}
                          style={{
                            backgroundColor: '#0f243c',
                            border: '1px solid #4a9eff',
                            borderRadius: '4px',
                            color: '#4a9eff',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          ⚡ {getTxt("Simulate 1 Month", "१ माह आगे बढ़ाएं")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === 'orders' && (
            <table className="ledger-table" style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px' }}>{getTxt("Date & Time", "दिनांक और समय")}</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px' }}>{getTxt("Scheme Name", "फंड योजना")}</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px' }}>{getTxt("Order Type", "लेनदेन प्रकार")}</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>{getTxt("NAV Applied", "लागू एनएवी")}</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>{getTxt("Units Allotted", "आबंटित इकाइयां")}</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px' }}>{getTxt("Total Cash Flow", "कुल नकदी प्रवाह")}</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#8FA0B5' }}>
                      {getTxt("No transactions recorded on this passbook ledger.", "इस लेजर में कोई लेनदेन प्रविष्टि दर्ज नहीं है।")}
                    </td>
                  </tr>
                ) : portfolio.transactions.map((t, idx) => {
                  const isBuy = t.type.startsWith('BUY');
                  return (
                    <tr key={t.id || idx}>
                      <td style={{ padding: '12px 16px', color: '#8FA0B5' }}>{t.timestamp}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                        <div>{t.fund_name}</div>
                        <span style={{ fontSize: '0.65rem', color: '#8FA0B5' }}>{t.fund_symbol}</span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: t.type === 'BUY_LUMPSUM' ? '#1a3a1a' : (t.type === 'BUY_SIP' ? '#0f2a2f' : '#2a0a0a'),
                          color: t.type === 'BUY_LUMPSUM' ? '#22c55e' : (t.type === 'BUY_SIP' ? '#00e1ff' : '#ef4444'),
                          border: `1.5px solid ${t.type === 'BUY_LUMPSUM' ? '#22c55e' : (t.type === 'BUY_SIP' ? '#00e1ff' : '#ef4444')}`,
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '0.68rem',
                          fontWeight: '800'
                        }}>
                          {t.type}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace' }}>₹{t.nav.toFixed(4)}</td>
                      <td style={{ textAlign: 'right', padding: '12px 16px', fontFamily: 'monospace' }}>{t.units.toFixed(4)}</td>
                      <td style={{
                        textAlign: 'right',
                        padding: '12px 16px',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        color: isBuy ? '#ef4444' : '#22c55e'
                      }}>
                        {isBuy ? '-' : '+'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

        </div>
      </div>

      {/* REDEEM / SELL MODAL */}
      {showTransactModal && showTransactModal.type === 'SELL' && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#0d1b2e', border: '2px solid #ef4444',
            borderRadius: '12px', padding: '28px', width: '380px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.8)'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#8FA0B5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
              {getTxt("MUTUAL FUND REDEMPTION", "म्यूचुअल फंड रिडेम्पशन")}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ef4444', marginBottom: '16px' }}>
              ↘ {getTxt("Redeem Scheme Units", "फंड इकाइयां बेचें")}
            </div>

            <div style={{ backgroundColor: '#0A1628', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
              <strong style={{ fontSize: '0.92rem', color: '#E8E4DA', display: 'block' }}>{showTransactModal.fund.name}</strong>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.78rem', color: '#8FA0B5' }}>
                <span>{getTxt("Units Held:", "धारित इकाइयां:")}</span>
                <strong style={{ color: '#E8E4DA', fontFamily: 'monospace' }}>{showTransactModal.fund.total_units.toFixed(4)} units</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.78rem', color: '#8FA0B5' }}>
                <span>{getTxt("Current NAV:", "वर्तमान एनएवी:")}</span>
                <strong style={{ color: '#E8E4DA', fontFamily: 'monospace' }}>₹{showTransactModal.fund.current_nav.toFixed(4)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.78rem', color: '#8FA0B5' }}>
                <span>{getTxt("Total Current Value:", "वर्तमान मूल्य:")}</span>
                <strong style={{ color: 'var(--color-amber)', fontFamily: 'monospace' }}>₹{showTransactModal.fund.current_value.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Redeem Mode Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setSellMode('AMOUNT'); setSellValue(''); }}
                style={{
                  flex: 1,
                  backgroundColor: sellMode === 'AMOUNT' ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                  border: `1.5px solid ${sellMode === 'AMOUNT' ? '#ef4444' : '#2a3f5f'}`,
                  color: sellMode === 'AMOUNT' ? '#ef4444' : '#8FA0B5',
                  padding: '6px 0',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ₹ {getTxt("Redeem Amount", "निकासी राशि (₹)")}
              </button>
              <button
                type="button"
                onClick={() => { setSellMode('UNITS'); setSellValue(''); }}
                style={{
                  flex: 1,
                  backgroundColor: sellMode === 'UNITS' ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                  border: `1.5px solid ${sellMode === 'UNITS' ? '#ef4444' : '#2a3f5f'}`,
                  color: sellMode === 'UNITS' ? '#ef4444' : '#8FA0B5',
                  padding: '6px 0',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🔢 {getTxt("Redeem Units", "निकासी इकाइयां")}
              </button>
            </div>

            <form onSubmit={handleSell}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.72rem', color: '#8FA0B5', display: 'block', marginBottom: '6px' }}>
                  {sellMode === 'AMOUNT' 
                    ? getTxt("ENTER AMOUNT TO WITHDRAW (₹)", "निकासी की राशि दर्ज करें (₹)")
                    : getTxt("ENTER NUMBER OF UNITS TO REDEEM", "बेचे जाने वाली इकाइयों की संख्या")}
                </label>
                <input
                  type="number"
                  step="any"
                  value={sellValue}
                  onChange={e => setSellValue(e.target.value)}
                  placeholder={sellMode === 'AMOUNT' ? "e.g. 1000" : "e.g. 15.421"}
                  style={{
                    width: '100%',
                    backgroundColor: '#070E1A',
                    border: '1px solid #ef4444',
                    borderRadius: '6px',
                    color: '#E8E4DA',
                    padding: '12px',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowTransactModal(null)}
                  style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid #2a3f5f', borderRadius: '6px', color: '#8FA0B5', padding: '12px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !sellValue}
                  style={{
                    flex: 1.5,
                    backgroundColor: '#ef4444',
                    border: 'none', borderRadius: '6px', color: '#FFF', padding: '12px',
                    cursor: loading || !sellValue ? 'not-allowed' : 'pointer', fontSize: '0.95rem', fontWeight: '900'
                  }}
                >
                  {loading ? getTxt("Redeeming...", "प्रोसेसिंग...") : getTxt("Confirm Redeem ➔", "निकासी की पुष्टि करें ➔")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION CONTAINER */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: toastMsg.type === 'success' ? '#14532d' : '#450a0a',
          border: `1px solid ${toastMsg.type === 'success' ? '#22c55e' : '#ef4444'}`,
          borderRadius: '8px', padding: '12px 24px',
          color: toastMsg.type === 'success' ? '#22c55e' : '#ef4444',
          fontWeight: '700', fontSize: '0.88rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          zIndex: 2000, display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'fade-in 0.25s ease',
          maxWidth: '90vw'
        }}>
          <span>{toastMsg.type === 'success' ? '✅' : '❌'}</span>
          {toastMsg.text}
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
