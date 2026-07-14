import React, { useState } from 'react';

export default function InteractiveCalculator({ type, lang }) {
  // Common state values
  const [amount, setAmount] = useState(() => {
    if (type === 'inflation') return 10000;
    if (type === 'comparison') return 5000;
    return 2000; // SIP default
  });
  
  const [years, setYears] = useState(15);
  const [returnRate, setReturnRate] = useState(12); // SIP standard

  const getTxt = (en, hi) => (lang === 'en' ? en : hi);

  // Math Calculations
  // 1. SIP Compounding Formula: M = P * [ ( (1 + i)^n - 1 ) / i ] * (1 + i)
  // where i = rate / 12 / 100, n = years * 12
  const calculateSIP = () => {
    const P = parseFloat(amount);
    const r = parseFloat(returnRate);
    const n = parseInt(years) * 12;
    const i = r / 12 / 100;
    
    const totalInvested = P * n;
    const futureValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const wealthGain = futureValue - totalInvested;

    return {
      invested: Math.round(totalInvested),
      wealth: Math.round(futureValue),
      gain: Math.round(wealthGain)
    };
  };

  // 2. FD vs SIP vs Savings Comparison
  // Savings: 3% compound interest, FD: 6.5% compound interest, SIP: 12% SIP compound interest
  // Assume a monthly saving plan for all three
  const calculateComparison = () => {
    const P = parseFloat(amount);
    const n = parseInt(years) * 12;
    
    // Savings at 3%
    const iSave = 3 / 12 / 100;
    const valSave = P * ((Math.pow(1 + iSave, n) - 1) / iSave) * (1 + iSave);
    
    // FD at 6.5%
    const iFD = 6.5 / 12 / 100;
    const valFD = P * ((Math.pow(1 + iFD, n) - 1) / iFD) * (1 + iFD);

    // SIP at 12%
    const iSIP = 12 / 12 / 100;
    const valSIP = P * ((Math.pow(1 + iSIP, n) - 1) / iSIP) * (1 + iSIP);

    const invested = P * n;

    return {
      invested: Math.round(invested),
      savings: Math.round(valSave),
      fd: Math.round(valFD),
      sip: Math.round(valSIP)
    };
  };

  // 3. Lifestyle Inflation Calculator
  // Inflation rate is 6% in India historically.
  // FV = PV * (1.06)^years
  // In reverse: purchasing power after years = PV / (1.06)^years
  const calculateInflation = () => {
    const PV = parseFloat(amount);
    const rate = 6 / 100;
    const futureRequirement = PV * Math.pow(1 + rate, years);
    const remainingValue = PV / Math.pow(1 + rate, years);

    return {
      requiredFuture: Math.round(futureRequirement),
      purchasingPower: Math.round(remainingValue)
    };
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // RENDER 1: SIP Compounding Calculator
  if (type === 'sip') {
    const data = calculateSIP();
    const total = data.wealth;
    const investedPct = (data.invested / total) * 100;
    const gainPct = (data.gain / total) * 100;

    return (
      <div className="ledger-card" style={{ marginTop: '20px', borderStyle: 'solid' }}>
        <div className="ledger-header" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
          <span className="ticket-label">{getTxt("SIP WEALTH ACCUMULATOR", "SIP धन संचायक कैलकुलेटर")}</span>
        </div>
        <div className="ledger-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label htmlFor="sip-amt" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                {getTxt("Monthly Savings Amount:", "मासिक निवेश राशि:")}
              </label>
              <input 
                id="sip-amt"
                type="number"
                value={amount}
                min="500"
                step="500"
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  padding: '8px 12px',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            
            <div>
              <label htmlFor="sip-years" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                {getTxt("Duration (Years):", "समय अवधि (वर्ष):")}
              </label>
              <input 
                id="sip-years"
                type="range"
                min="1"
                max="30"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-amber)', marginTop: '12px' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textAlign: 'right' }}>
                {years} {getTxt("Years", "वर्ष")}
              </span>
            </div>

            <div>
              <label htmlFor="sip-rate" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                {getTxt("Expected Annual Return (%):", "अपेक्षित वार्षिक रिटर्न (%):")}
              </label>
              <select
                id="sip-rate"
                value={returnRate}
                onChange={(e) => setReturnRate(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  padding: '8px 12px',
                  fontSize: '0.95rem'
                }}
              >
                <option value="8">8% (Conservative Debt/Hybrid)</option>
                <option value="12">12% (Balanced Large Cap Index)</option>
                <option value="15">15% (Aggressive Mid/Small Cap)</option>
              </select>
            </div>
          </div>

          {/* Results Display */}
          <div style={{
            backgroundColor: 'var(--bg-surface-light)',
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            marginTop: '8px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', marginBottom: '16px' }}>
              <div>
                <span className="ticket-label" style={{ fontSize: '0.7rem' }}>{getTxt("Total Invested", "कुल निवेश")}</span>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{formatCurrency(data.invested)}</div>
              </div>
              <div>
                <span className="ticket-label" style={{ fontSize: '0.7rem' }}>{getTxt("Est. Wealth Gain", "अनुमानित लाभ")}</span>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-green)' }}>{formatCurrency(data.gain)}</div>
              </div>
              <div>
                <span className="ticket-label" style={{ fontSize: '0.7rem', color: 'var(--color-gold)' }}>{getTxt("Total Future Wealth", "कुल भावी संपत्ति")}</span>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-gold)' }}>{formatCurrency(data.wealth)}</div>
              </div>
            </div>

            {/* Custom SVG Stacked Bar chart */}
            <div style={{ height: '24px', backgroundColor: 'var(--bg-base)', borderRadius: '4px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border-color)' }}>
              <div 
                style={{ width: `${investedPct}%`, backgroundColor: '#476380', transition: 'width 0.3s ease' }} 
                title={`${getTxt("Invested Capital", "निवेशित पूंजी")}: ${Math.round(investedPct)}%`}
              />
              <div 
                style={{ width: `${gainPct}%`, backgroundColor: 'var(--color-green)', transition: 'width 0.3s ease' }} 
                title={`${getTxt("Compounded Profits", "कंपाउंडिंग लाभ")}: ${Math.round(gainPct)}%`}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '6px', color: 'var(--text-secondary)' }}>
              <span>● {getTxt("Invested Amount", "निवेशित राशि")} ({Math.round(investedPct)}%)</span>
              <span>● {getTxt("Compounded Profits", "कंपाउंडिंग लाभ")} ({Math.round(gainPct)}%)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER 2: FD vs SIP vs Savings comparison
  if (type === 'comparison') {
    const data = calculateComparison();
    const maxVal = Math.max(data.savings, data.fd, data.sip, 1);

    return (
      <div className="ledger-card" style={{ marginTop: '20px' }}>
        <div className="ledger-header" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
          <span className="ticket-label">{getTxt("ACCUMULATION PATH COMPARISON", "निवेश माध्यम तुलना कैलकुलेटर")}</span>
        </div>
        <div className="ledger-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label htmlFor="comp-amt" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                {getTxt("Monthly Savings (Rs):", "मासिक बचत (रुपये):")}
              </label>
              <input 
                id="comp-amt"
                type="number"
                value={amount}
                min="500"
                step="500"
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  padding: '8px 12px',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <div>
              <label htmlFor="comp-years" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                {getTxt("Years Horizon:", "वर्षों की अवधि:")}
              </label>
              <input 
                id="comp-years"
                type="range"
                min="5"
                max="25"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-amber)', marginTop: '12px' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textAlign: 'right' }}>
                {years} {getTxt("Years", "वर्ष")}
              </span>
            </div>
          </div>

          {/* Bar Chart comparing savings, FD, SIP */}
          <div style={{ 
            backgroundColor: 'var(--bg-surface-light)', 
            padding: '20px', 
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            
            {/* Column 1: Savings Account */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>🏦 {getTxt("Savings Account (3% Return)", "बचत खाता (३% रिटर्न)")}</span>
                <strong>{formatCurrency(data.savings)}</strong>
              </div>
              <div style={{ height: '14px', backgroundColor: 'var(--bg-base)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(data.savings / maxVal) * 100}%`, backgroundColor: '#8FA0B5', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Column 2: Fixed Deposit */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>📜 {getTxt("Fixed Deposit (6.5% Return)", "फिक्स्ड डिपॉजिट (६.५% रिटर्न)")}</span>
                <strong>{formatCurrency(data.fd)}</strong>
              </div>
              <div style={{ height: '14px', backgroundColor: 'var(--bg-base)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(data.fd / maxVal) * 100}%`, backgroundColor: 'var(--color-amber)', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Column 3: Equity SIP */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>📈 {getTxt("Equity Mutual Fund SIP (12% Return)", "इक्विटी म्यूचुअल फंड SIP (१२% रिटर्न)")}</span>
                <strong style={{ color: 'var(--color-green)' }}>{formatCurrency(data.sip)}</strong>
              </div>
              <div style={{ height: '14px', backgroundColor: 'var(--bg-base)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(data.sip / maxVal) * 100}%`, backgroundColor: 'var(--color-green)', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <div style={{ borderTop: '1px dotted var(--border-color)', paddingTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {getTxt("Total Invested Capital over period", "अवधि के दौरान कुल निवेशित मूलधन")}: <strong>{formatCurrency(data.invested)}</strong>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // RENDER 3: Lifestyle Inflation Calculator
  if (type === 'inflation') {
    const data = calculateInflation();

    return (
      <div className="ledger-card" style={{ marginTop: '20px' }}>
        <div className="ledger-header" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
          <span className="ticket-label">{getTxt("INFLATION EROSION CALCULATOR", "मुद्रास्फीति (Inflation) क्षरण कैलकुलेटर")}</span>
        </div>
        <div className="ledger-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label htmlFor="infl-amt" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                {getTxt("Monthly Expenses Today (Rs):", "आज का मासिक घरेलू खर्च (रुपये):")}
              </label>
              <input 
                id="infl-amt"
                type="number"
                value={amount}
                min="1000"
                step="1000"
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  padding: '8px 12px',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <div>
              <label htmlFor="infl-years" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                {getTxt("Time Horizon (Years):", "भविष्य की समय सीमा (वर्ष):")}
              </label>
              <input 
                id="infl-years"
                type="range"
                min="5"
                max="25"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-amber)', marginTop: '12px' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textAlign: 'right' }}>
                {years} {getTxt("Years", "वर्ष")}
              </span>
            </div>
          </div>

          {/* Result details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            
            <div style={{
              backgroundColor: 'rgba(211, 78, 54, 0.05)',
              border: '1px solid var(--color-red)',
              borderRadius: '6px',
              padding: '16px'
            }}>
              <span className="ticket-label" style={{ color: 'var(--color-red)' }}>
                {getTxt("WHAT YOUR EXPENSES WILL COST IN FUTURE (AT 6% INFLATION)", "६% महंगाई पर भविष्य में इस खर्च की लागत")}
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-red)', marginTop: '4px' }}>
                {formatCurrency(data.requiredFuture)}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                {getTxt(
                  `You will need ${formatCurrency(data.requiredFuture)} in ${years} years just to buy the exact same goods that cost ${formatCurrency(amount)} today.`,
                  `आपको ${years} वर्षों में उसी सामान को खरीदने के लिए ${formatCurrency(data.requiredFuture)} की आवश्यकता होगी जो आज ${formatCurrency(amount)} में मिलता है।`
                )}
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(217, 142, 4, 0.05)',
              border: '1px solid var(--color-amber)',
              borderRadius: '6px',
              padding: '16px'
            }}>
              <span className="ticket-label" style={{ color: 'var(--color-amber)' }}>
                {getTxt("WHAT YOUR CASH WILL BE WORTH IN REAL PURCHASING POWER", "वास्तविक क्रय शक्ति में आपके नकद का बचा मूल्य")}
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-amber)', marginTop: '4px' }}>
                {formatCurrency(data.purchasingPower)}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                {getTxt(
                  `If you leave ${formatCurrency(amount)} cash inside a safe box, in ${years} years its real purchasing power shrinks to just ${formatCurrency(data.purchasingPower)}.`,
                  `यदि आप ${formatCurrency(amount)} नकद तिजोरी में बंद रखते हैं, तो ${years} वर्षों में इसकी वास्तविक क्रय शक्ति सिमटकर केवल ${formatCurrency(data.purchasingPower)} रह जाएगी।`
                )}
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // RENDER 4: LTCG / STCG Tax Calculator
  if (type === 'tax') {
    const [buyPrice, setBuyPrice] = useState(100);
    const [sellPrice, setSellPrice] = useState(200);
    const [qty, setQty] = useState(100);
    const [buyDate, setBuyDate] = useState('2025-01-01');
    const [sellDate, setSellDate] = useState('2026-07-01');

    // Calculate holding period in months
    const d1 = new Date(buyDate);
    const d2 = new Date(sellDate);
    const diffTime = Math.max(0, d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const holdingMonths = Math.max(0, Math.floor(diffDays / 30.43)); // Average days in month

    const isLTCG = holdingMonths >= 12;
    const totalBuy = buyPrice * qty;
    const totalSell = sellPrice * qty;
    const gain = totalSell - totalBuy;
    const isProfit = gain > 0;

    // LTCG: 12.5% on gains above ₹1,25,000 exemption (Budget 2024)
    // STCG: 20% flat on entire gain (Budget 2024)
    let taxableGain = 0;
    let taxAmt = 0;
    let taxRate = 0;

    if (isProfit) {
      if (isLTCG) {
        taxRate = 12.5;
        taxableGain = Math.max(0, gain - 125000);
        taxAmt = taxableGain * 0.125;
      } else {
        taxRate = 20;
        taxableGain = gain;
        taxAmt = gain * 0.20;
      }
    }

    const netProfit = isProfit ? gain - taxAmt : gain;

    // Visual chart percentages
    const exitVal = Math.max(totalBuy, totalSell);
    const buyPct = Math.round((totalBuy / exitVal) * 100);
    const taxPct = isProfit ? Math.round((taxAmt / exitVal) * 100) : 0;
    const profitPct = isProfit ? Math.round((netProfit / exitVal) * 100) : 0;

    return (
      <div className="ledger-card" style={{ marginTop: '20px', borderStyle: 'solid' }}>
        <div className="ledger-header" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
          <span className="ticket-label">{getTxt("LTCG / STCG TAX CALCULATOR", "LTCG / STCG कर कैलकुलेटर")}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            {getTxt("As per Union Budget 2024", "केंद्रीय बजट 2024 के अनुसार")}
          </span>
        </div>
        <div className="ledger-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Input Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            <div>
              <label htmlFor="tax-buy" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                {getTxt('Buy Price (₹/share)', 'खरीद मूल्य (₹/शेयर)')}
              </label>
              <input
                id="tax-buy"
                type="number"
                value={buyPrice}
                min="1"
                onChange={e => setBuyPrice(Math.max(1, parseFloat(e.target.value) || 1))}
                style={{
                  width: '100%', backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)', borderRadius: '6px',
                  color: 'var(--text-primary)', padding: '8px 12px', fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label htmlFor="tax-sell" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                {getTxt('Sell Price (₹/share)', 'बिक्री मूल्य (₹/शेयर)')}
              </label>
              <input
                id="tax-sell"
                type="number"
                value={sellPrice}
                min="1"
                onChange={e => setSellPrice(Math.max(1, parseFloat(e.target.value) || 1))}
                style={{
                  width: '100%', backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)', borderRadius: '6px',
                  color: 'var(--text-primary)', padding: '8px 12px', fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label htmlFor="tax-qty" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                {getTxt('Quantity (shares)', 'मात्रा (शेयर)')}
              </label>
              <input
                id="tax-qty"
                type="number"
                value={qty}
                min="1"
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '100%', backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)', borderRadius: '6px',
                  color: 'var(--text-primary)', padding: '8px 12px', fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label htmlFor="tax-buy-date" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                {getTxt('Buy Date', 'खरीद की तारीख')}
              </label>
              <input
                id="tax-buy-date"
                type="date"
                value={buyDate}
                onChange={e => setBuyDate(e.target.value)}
                style={{
                  width: '100%', backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)', borderRadius: '6px',
                  color: 'var(--text-primary)', padding: '7px 12px', fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label htmlFor="tax-sell-date" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                {getTxt('Sell Date', 'बिक्री की तारीख')}
              </label>
              <input
                id="tax-sell-date"
                type="date"
                value={sellDate}
                onChange={e => setSellDate(e.target.value)}
                style={{
                  width: '100%', backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)', borderRadius: '6px',
                  color: 'var(--text-primary)', padding: '7px 12px', fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Tax Type Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
              background: isLTCG ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              border: `1px solid ${isLTCG ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`,
              color: isLTCG ? '#34d399' : '#fbbf24',
            }}>
              {isLTCG
                ? getTxt('✅ LTCG — Long Term (>12 months)', '✅ LTCG — दीर्घकालिक (>12 महीने)')
                : getTxt('⚡ STCG — Short Term (<12 months)', '⚡ STCG — अल्पकालिक (<12 महीने)')}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {getTxt(`Holding period: ${diffDays} days (~${holdingMonths} months)`, `होल्डिंग अवधि: ${diffDays} दिन (~${holdingMonths} महीने)`)}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>
              {getTxt(`Tax Rate: ${taxRate}%`, `कर की दर: ${taxRate}%`)}
              {isLTCG && ' ' + getTxt('(₹1.25L exempt)', '(₹1.25L छूट)')}
            </span>
          </div>

          {/* VISUAL BAR CHART BREAKDOWN */}
          {isProfit && (
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                {getTxt('Visual Breakdown (Exit Value Portfolio Share):', 'विजुअल ब्रेकडाउन (एग्जिट वैल्यू पोर्टफोलियो शेयर):')}
              </span>
              <div style={{
                display: 'flex',
                height: '24px',
                width: '100%',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                marginBottom: '10px'
              }}>
                <div style={{ width: `${buyPct}%`, backgroundColor: '#3b82f6', transition: 'width 0.3s ease' }} title={`Invested: ${buyPct}%`} />
                <div style={{ width: `${profitPct}%`, backgroundColor: '#a78bfa', transition: 'width 0.3s ease' }} title={`Net Profit: ${profitPct}%`} />
                <div style={{ width: `${taxPct}%`, backgroundColor: '#f87171', transition: 'width 0.3s ease' }} title={`Tax: ${taxPct}%`} />
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
                  {getTxt(`Invested Capital (${buyPct}%)`, `निवेशित पूंजी (${buyPct}%)`)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#a78bfa', borderRadius: '2px' }} />
                  {getTxt(`Net Profit (${profitPct}%)`, `शुद्ध लाभ (${profitPct}%)`)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#f87171', borderRadius: '2px' }} />
                  {getTxt(`Tax Liability (${taxPct}%)`, `कर देयता (${taxPct}%)`)}
                </span>
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {[
              { label: getTxt('Total Invested', 'कुल निवेश'), val: formatCurrency(totalBuy), color: 'var(--text-primary)' },
              { label: getTxt('Total Sale Value', 'कुल बिक्री मूल्य'), val: formatCurrency(totalSell), color: 'var(--text-primary)' },
              { label: getTxt('Capital Gain / Loss', 'पूंजीगत लाभ / हानि'), val: formatCurrency(gain), color: isProfit ? '#34d399' : '#f87171' },
              { label: getTxt('Taxable Gain', 'कर योग्य लाभ'), val: formatCurrency(taxableGain), color: '#fbbf24' },
              { label: getTxt('Tax Liability', 'कर देयता'), val: formatCurrency(taxAmt), color: '#f87171' },
              { label: getTxt('Net Profit (after tax)', 'शुद्ध लाभ (कर के बाद)'), val: formatCurrency(netProfit), color: '#a78bfa' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                border: '1px solid var(--border-color)', padding: '12px',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Info box */}
          <div style={{
            padding: '12px 16px', borderRadius: '8px',
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
            fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6',
          }}>
            {isLTCG
              ? getTxt(
                  '📌 LTCG Rule: Equity gains above ₹1,25,000 per year are taxed at 12.5% (no indexation). Grandfathering applies for shares bought before Jan 31, 2018.',
                  '📌 LTCG नियम: प्रति वर्ष ₹1,25,000 से अधिक इक्विटी लाभ पर 12.5% कर लगता है (इंडेक्सेशन नहीं)।'
                )
              : getTxt(
                  '📌 STCG Rule: Equity gains held <12 months are taxed flat at 20% regardless of amount (Budget 2024 revised from 15%).',
                  '📌 STCG नियम: 12 महीने से कम होल्डिंग पर इक्विटी लाभ पर 20% फ्लैट कर (बजट 2024 के अनुसार 15% से बढ़ाकर 20%)।'
                )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

