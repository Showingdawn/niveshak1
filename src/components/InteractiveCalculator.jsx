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

  return null;
}
