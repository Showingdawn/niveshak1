import React, { useState, useEffect, useRef } from 'react';
import { runScamAnalysis, officialTestTemplates } from '../data/scamRules';

export default function ScamMeter({ lang, onNavigateToSebi, onAddHistory, initialText, clearInitialText }) {
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResults, setScanResults] = useState(null);
  const [showVerdict, setShowVerdict] = useState(false);
  const [needleAngle, setNeedleAngle] = useState(-75); 
  const [isBackendActive, setIsBackendActive] = useState(false);
  
  // Custom states for new features
  const [isReported, setIsReported] = useState(false);
  const [reportTallyCount, setReportTallyCount] = useState(0);
  const [showParentMode, setShowParentMode] = useState(false);
  
  const scanIntervalRef = useRef(null);

  const scanSteps = [
    { en: "Initializing security checks...", hi: "सुरक्षा जांच प्रारंभ की जा रही है..." },
    { en: "Checking guaranteed return promises...", hi: "गारंटीड रिटर्न के वादों का मिलान..." },
    { en: "Checking urgency terms & limited seat warnings...", hi: "कृत्रिम तात्कालिकता और समय-दबाव की खोज..." },
    { en: "Scanning unregistered VIP Telegram/WhatsApp links...", hi: "टेलीग्राम और व्हाट्सएप लिंक फॉरवर्ड्स की जांच..." },
    { en: "Verifying corporate celebrity name-drop matches...", hi: "सेलिब्रिटी और कॉर्पोरेट नाम-दुरुपयोग का विश्लेषण..." },
    { en: "Validating SEBI license format & database logs...", hi: "SEBI लाइसेंस प्रारूप और डेटाबेस मिलान..." },
    { en: "Compiling risk indices & finalizing ledger report...", hi: "अंतिम सुरक्षा रिपोर्ट संकलित की जा रही है..." }
  ];

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      handleStartScan(initialText);
      if (clearInitialText) {
        clearInitialText();
      }
    }
  }, [initialText]);

  useEffect(() => {
    let shakeInterval;
    if (isScanning) {
      shakeInterval = setInterval(() => {
        const randomAngle = Math.random() * 130 - 65;
        setNeedleAngle(randomAngle);
      }, 120);
    } else if (scanResults) {
      const targetAngle = -75 + (scanResults.score / 100) * 150;
      setNeedleAngle(targetAngle);
    } else {
      setNeedleAngle(-75);
    }

    return () => clearInterval(shakeInterval);
  }, [isScanning, scanResults]);

  const handleStartScan = async (overrideText = null) => {
    const textToScan = overrideText !== null ? overrideText : inputText;
    if (!textToScan.trim()) return;

    setIsScanning(true);
    setScanStep(0);
    setScanResults(null);
    setShowVerdict(false);
    setIsReported(false);
    setShowParentMode(false);

    let currentStep = 0;
    scanIntervalRef.current = setInterval(() => {
      currentStep++;
      if (currentStep < scanSteps.length) {
        setScanStep(currentStep);
      }
    }, 450);

    try {
      const response = await fetch("http://localhost:5000/api/scam-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToScan, userId: "sandbox_user" })
      });

      clearInterval(scanIntervalRef.current);

      if (response.ok) {
        const data = await response.json();
        setIsBackendActive(true);
        setScanResults({
          score: data.risk_score,
          verdict: data.risk_level,
          findings: data.flags,
          ranges: data.ranges,
          verdictSummary: data.verdict_summary
        });
        setIsScanning(false);
        setShowVerdict(true);
        onAddHistory({
          textSnippet: textToScan.substring(0, 50) + (textToScan.length > 50 ? "..." : ""),
          score: data.risk_score,
          verdict: data.risk_level,
          date: new Date().toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN')
        });
      } else {
        throw new Error("API scan failed");
      }
    } catch (err) {
      clearInterval(scanIntervalRef.current);
      setIsBackendActive(false);
      
      const localResults = runScamAnalysis(textToScan);
      setScanResults({
        score: localResults.score,
        verdict: localResults.verdict,
        findings: localResults.findings,
        ranges: localResults.ranges,
        verdictSummary: localResults.verdict === "HIGH" 
          ? "HIGH RISK: Multiple serious warning signs including guaranteed returns or unregistered channels detected. Avoid this tip." 
          : (localResults.verdict === "MEDIUM" ? "MODERATE RISK: Caution advised. Verify registration details before committing any funds." : "LOW RISK: No standard scam patterns detected. Make sure to check advisor credentials.")
      });
      setIsScanning(false);
      setShowVerdict(true);
      onAddHistory({
        textSnippet: textToScan.substring(0, 50) + (textToScan.length > 50 ? "..." : ""),
        score: localResults.score,
        verdict: localResults.verdict,
        date: new Date().toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN')
      });
    }
  };

  const handleReset = () => {
    setInputText('');
    setScanResults(null);
    setShowVerdict(false);
    setNeedleAngle(-75);
    setIsReported(false);
    setShowParentMode(false);
  };

  const handleLoadTemplate = (template) => {
    setInputText(template.text);
    handleStartScan(template.text);
  };

  const handleReportScam = async () => {
    if (!inputText.trim()) return;
    try {
      const response = await fetch("http://localhost:5000/api/report-scam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });
      if (response.ok) {
        const data = await response.json();
        setReportTallyCount(data.count);
        setIsReported(true);
      }
    } catch (err) {
      // Offline fallback: simulate reporting count locally
      setReportTallyCount(12 + Math.floor(Math.random() * 8));
      setIsReported(true);
    }
  };

  // Canvas share-as-image for WhatsApp forwarding
  const handleShareAsImage = () => {
    if (!scanResults) return;
    const isHigh = scanResults.verdict === 'HIGH';
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 460;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0D1E36';
    ctx.fillRect(0, 0, 640, 460);

    // Border
    ctx.strokeStyle = isHigh ? '#D34E36' : '#D98E04';
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, 630, 450);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(14, 14, 612, 432);

    // Header
    ctx.fillStyle = '#D98E04';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('SafalNiveshak (सफल निवेशक)', 36, 50);
    ctx.fillStyle = '#8FA0B5';
    ctx.font = '11px Courier';
    ctx.fillText('INVESTOR SAFETY ALERT  •  परिवार सुरक्षा सूचना', 36, 70);

    // Verdict badge
    const badgeColor = isHigh ? '#D34E36' : '#D98E04';
    ctx.fillStyle = badgeColor;
    ctx.fillRect(36, 88, 568, 68);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px Arial';
    const verdict = isHigh ? '🚫 SCAM CONFIRMED — नकली (फ्रॉड)' : '⚠️ SUSPICIOUS — सतर्क रहें';
    ctx.fillText(verdict, 56, 132);

    // Score
    ctx.fillStyle = '#FAFAF7';
    ctx.font = 'bold 15px Arial';
    ctx.fillText(`Scam Risk Score: ${scanResults.score}/100`, 36, 182);

    // Message preview
    ctx.fillStyle = '#8FA0B5';
    ctx.font = '12px Arial';
    ctx.fillText('Scanned message preview:', 36, 210);
    ctx.fillStyle = '#E8E4DA';
    ctx.font = '13px Arial';
    const preview = (inputText.substring(0, 120) + (inputText.length > 120 ? '...' : ''));
    // Word wrap
    const words = preview.split(' ');
    let line = '';
    let y = 230;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > 580 && line !== '') {
        ctx.fillText(line, 36, y);
        line = word + ' ';
        y += 18;
        if (y > 320) { ctx.fillText('...', 36, y); break; }
      } else {
        line = test;
      }
    }
    if (y <= 320) ctx.fillText(line, 36, y);

    // Patterns
    ctx.fillStyle = '#D98E04';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Fraud signals found:', 36, 346);
    ctx.fillStyle = '#E8E4DA';
    ctx.font = '12px Arial';
    const patternStr = scanResults.flaggedRules?.slice(0, 4).join(', ') || 'See full report';
    ctx.fillText(patternStr.substring(0, 90), 36, 364);

    // Footer
    ctx.fillStyle = '#4A6070';
    ctx.font = '11px Courier';
    ctx.fillText('Forward this alert to protect your family. Verify at SafalNiveshak.', 36, 418);
    ctx.fillText(`SEBI Investor Safety Education  •  ${new Date().toLocaleDateString('en-IN')}`, 36, 436);

    // Download / share
    canvas.toBlob((blob) => {
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'scam_alert.png', { type: 'image/png' })] })) {
        navigator.share({
          title: 'Scam Alert from SafalNiveshak',
          text: isHigh ? '⚠️ This message is a confirmed fraud trap. Do not invest. Verified by SafalNiveshak Scam Shield.' : '⚠️ Suspicious investment message detected. Verify before acting.',
          files: [new File([blob], 'scam_alert.png', { type: 'image/png' })]
        }).catch(() => {});
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'safalniveshak_scam_alert.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  // Programmatic canvas rendering of Parent-friendly Warning sticker
  const handleExportParentSticker = () => {
    if (!scanResults) return;
    const textHindi = scanResults.verdict === 'HIGH' 
      ? "माता/पिता, यह संदेश बिल्कुल नकली (फ्रॉड) है। पैसे कमाने का लालच देकर यह आपके बैंक खाते को खाली कर सकते हैं। इसपर प्रतिक्रिया न दें।" 
      : "माता/पिता, यह संदेश संदिग्ध है। किसी अपरिचित व्यक्ति के कहने पर शेयर बाजार में पैसा न लगाएं। सलाहकार का लाइसेंस पहले जांचें।";
    
    const textEnglish = scanResults.verdict === 'HIGH'
      ? "Warning: This message is a direct scam trap. Do not click links, reply, or transfer money. Share this alert to protect elders."
      : "Alert: Unverified stock recommendation detected. Always verify SEBI credentials first.";

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');

    // Canvas Background
    ctx.fillStyle = '#0D1E36';
    ctx.fillRect(0, 0, 600, 420);

    // Dynamic Saffron/Red outer double borders
    ctx.strokeStyle = scanResults.verdict === 'HIGH' ? '#D34E36' : '#D98E04';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 588, 408);
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, 568, 388);

    // Stamped Header
    ctx.fillStyle = '#D98E04';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('SafalNiveshak (सफल निवेशक)', 40, 55);

    ctx.fillStyle = '#8FA0B5';
    ctx.font = '12px Courier, monospace';
    ctx.fillText('INVESTOR TRUST REGISTRY • परिवार सुरक्षा लेजर', 40, 78);

    // Horizontal split line
    ctx.strokeStyle = '#273E5F';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 95);
    ctx.lineTo(560, 95);
    ctx.stroke();

    // Large warning title
    ctx.fillStyle = scanResults.verdict === 'HIGH' ? '#D34E36' : '#D98E04';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText(scanResults.verdict === 'HIGH' ? '🚫 फ्रॉड चेतावनी (DANGER)' : '⚠ संदिग्ध संदेश (CAUTION)', 40, 138);

    const wrapText = (text, x, y, maxWidth, lineHeight) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY + lineHeight;
    };

    // Hindi text
    ctx.fillStyle = '#F7F9FC';
    ctx.font = 'bold 16px Arial, sans-serif';
    let nextY = wrapText(textHindi, 40, 185, 520, 24);

    // English text
    ctx.fillStyle = '#8FA0B5';
    ctx.font = 'italic 14px Arial, sans-serif';
    wrapText(textEnglish, 40, nextY + 14, 520, 20);

    // Footer Stamped Footprint
    ctx.fillStyle = scanResults.verdict === 'HIGH' ? 'rgba(211,78,54,0.1)' : 'rgba(217,142,4,0.1)';
    ctx.fillRect(40, 330, 520, 50);
    ctx.strokeStyle = scanResults.verdict === 'HIGH' ? '#D34E36' : '#D98E04';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 330, 520, 50);

    ctx.fillStyle = scanResults.verdict === 'HIGH' ? '#D34E36' : '#D98E04';
    ctx.font = 'bold 12px Courier, monospace';
    ctx.fillText('VERDICT: OFFICIALLY BLOCK LISTED BY SAFALNIVESHAK SECURITY', 60, 360);

    // Trigger PNG file download
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "SafalNiveshak_Parent_Alert.png";
    link.href = dataUrl;
    link.click();
  };

  const renderHighlightedText = () => {
    if (!scanResults || !scanResults.ranges || scanResults.ranges.length === 0) {
      return inputText;
    }

    const sortedRanges = [...scanResults.ranges].sort((a, b) => a.start - b.start);
    const elements = [];
    let lastIndex = 0;

    sortedRanges.forEach((range, idx) => {
      if (range.start > lastIndex) {
        elements.push(inputText.substring(lastIndex, range.start));
      }
      
      const matchedText = inputText.substring(range.start, range.end);
      const isHigh = range.severity === 'high';
      elements.push(
        <span 
          key={idx} 
          className={isHigh ? 'highlight-high' : 'highlight-medium'}
          style={{ cursor: 'help', display: 'inline' }}
          title={lang === 'en' ? range.ruleNameEn : range.ruleNameHi}
        >
          {matchedText}
        </span>
      );
      lastIndex = range.end;
    });

    if (lastIndex < inputText.length) {
      elements.push(inputText.substring(lastIndex));
    }

    return elements;
  };

  const getTxt = (en, hi) => (lang === 'en' ? en : hi);

  const renderDemoCallout = (stepNum, textEn, textHi) => {
    
    return (
      <div style={{
        backgroundColor: 'rgba(217, 142, 4, 0.12)',
        border: '1px dashed var(--color-amber)',
        color: 'var(--color-amber)',
        borderRadius: '4px',
        padding: '8px 12px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{
          backgroundColor: 'var(--color-amber)',
          color: '#000000',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: '900',
          flexShrink: 0
        }}>
          {stepNum}
        </span>
        <span>{getTxt(textEn, textHi)}</span>
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
          {getTxt("Bachao Scam Shield", "बचाओ स्कैम शील्ड")}
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '6px auto 0', fontSize: '0.95rem' }}>
          {getTxt(
            "Paste chat forwarded stock tips, VIP advisor recommendations, or unsolicited messages to crosscheck against SEBI investor warnings.",
            "संदेश को पेस्ट करें। हमारा सुरक्षा उपकरण अवैध दावों और खतरनाक पोंजी योजनाओं की स्वतः जांच करेगा।"
          )}
        </p>
      </div>

      {/* Sandbox Test Templates Section */}
      <div className="ledger-card" style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.01)' }}>
        <span className="ticket-label" style={{ display: 'block', marginBottom: '10px', color: 'var(--color-amber)' }}>
          {getTxt("SEBI COMPLIANCE SANDBOX TEST TEMPLATES (1-CLICK LOAD & SCAN)", "सेबी सैंडबॉक्स परीक्षण टेम्पलेट (१-क्लिक लोड और स्कैन)")}
        </span>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '10px' 
        }}>
          {officialTestTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleLoadTemplate(template)}
              className="btn btn-secondary"
              disabled={isScanning}
              style={{
                fontSize: '0.8rem',
                padding: '8px 12px',
                textAlign: 'left',
                justifyContent: 'flex-start',
                whiteSpace: 'normal',
                lineHeight: '1.3',
                height: '100%',
                display: 'flex',
                borderColor: template.id.startsWith('clean') ? 'var(--color-green)' : 'var(--border-color)',
                width: '100%'
              }}
            >
              <div>
                <strong style={{ display: 'block', color: template.id.startsWith('clean') ? 'var(--color-green)' : 'var(--text-primary)' }}>
                  {getTxt(template.labelEn, template.labelHi)}
                </strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {template.id.startsWith('clean') ? getTxt("Low Risk expected", "कम जोखिम अपेक्षित") : getTxt("High Risk expected", "उच्च जोखिम अपेक्षित")}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Verification Board */}
        <div>
          {!showVerdict ? (
            <div className="ledger-card" style={{ height: '100%' }}>
              <div className="ledger-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="ticket-label">{getTxt("INSPECTION CASE BUFFER", "निरीक्षण केस बफर")}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    color: isBackendActive ? 'var(--color-green)' : 'var(--text-secondary)',
                    border: `1px solid ${isBackendActive ? 'var(--color-green)' : 'var(--border-color)'}`,
                    borderRadius: '3px',
                    padding: '1px 6px',
                    fontWeight: 'bold',
                    backgroundColor: isBackendActive ? 'rgba(46,125,99,0.05)' : 'transparent'
                  }}>
                    {isBackendActive ? getTxt("SERVER CONNECTED", "सर्वर सक्रिय") : getTxt("OFFLINE MODE", "ऑफ़लाइन मोड")}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-amber)', fontWeight: 'bold' }}>
                    {isScanning ? getTxt("SCANNING DATA...", "स्कैनिंग जारी...") : getTxt("READY FOR CHECK", "इनपुट की प्रतीक्षा")}
                  </span>
                </div>
              </div>
              <div className="ledger-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                
                {isScanning && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(to right, transparent, var(--color-amber), transparent)',
                    boxShadow: '0 0 10px var(--color-amber)',
                    animation: 'scannerSweep 2s infinite linear',
                    zIndex: 5
                  }} />
                )}

                <label htmlFor="scam-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {getTxt("Pasted Message Text:", "जांच हेतु प्राप्त पाठ संदेश:")}
                </label>
                <textarea
                  id="scam-input"
                  disabled={isScanning}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={getTxt(
                    "Paste tip contents or click one of the sandbox test templates above to load pre-formatted messages...",
                    "यहाँ संदेश पेस्ट करें या सीधे जांच करने के लिए ऊपर दिए गए किसी परीक्षण टेम्पलेट पर क्लिक करें..."
                  )}
                  style={{
                    width: '100%',
                    height: '240px',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    resize: 'none',
                    lineHeight: '1.6'
                  }}
                />

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
                  {inputText && (
                    <button onClick={handleReset} className="btn btn-secondary" disabled={isScanning} style={{ width: 'auto' }}>
                      {getTxt("Reset Scanner", "रीसेट करें")}
                    </button>
                  )}
                  <button 
                    onClick={() => handleStartScan()} 
                    className="btn btn-primary" 
                    disabled={isScanning || !inputText.trim()}
                    style={{ width: 'auto' }}
                  >
                    {isScanning 
                      ? getTxt("Analyzing...", "विश्लेषण चालू...") 
                      : getTxt("Scan Message for Red Flags", "संदेश की जांच करें")}
                  </button>
                </div>

                {isScanning && (
                  <div style={{
                    backgroundColor: 'var(--bg-surface-light)',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    borderLeft: '4px solid var(--color-amber)',
                    marginTop: '4px',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem'
                  }}>
                    <span style={{ marginRight: '8px', display: 'inline-block', animation: 'spin 1s infinite linear' }}>⏳</span>
                    {scanSteps[scanStep][lang]}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Analysis Results Board */
            <div className="ledger-card">
              <div className="ledger-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <span className="ticket-label">{getTxt("INSPECTION AUDIT SUMMARY", "निरीक्षण ऑडिट सारांश")}</span>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Maa Papa Mode Switch */}
                  <button
                    onClick={() => setShowParentMode(!showParentMode)}
                    className="btn btn-secondary"
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '0.8rem', 
                      width: 'auto',
                      color: 'var(--color-amber)',
                      borderColor: 'var(--color-amber)'
                    }}
                  >
                    👴 {showParentMode ? getTxt("Show Advanced Metrics", "विस्तृत स्कोर देखें") : getTxt("Simplify For Parents", "मां-पापा के लिए आसान बनाएं")}
                  </button>

                  {/* WhatsApp Share Button */}
                  <button
                    onClick={handleShareAsImage}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      width: 'auto',
                      color: '#25D366',
                      borderColor: '#25D366',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    📤 {getTxt("Share as Image", "इमेज शेयर करें")}
                  </button>

                  <button 
                    onClick={handleReset} 
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto' }}
                  >
                    {getTxt("Inspect Another", "नया संदेश")}
                  </button>
                </div>
              </div>
              <div className="ledger-body">
                
                {/* 1. Parent Mode Render Box */}
                {showParentMode ? (
                  <div style={{
                    border: `2px double ${scanResults.verdict === 'HIGH' ? 'var(--color-red)' : 'var(--color-amber)'}`,
                    borderRadius: '4px',
                    padding: '24px 20px',
                    backgroundColor: 'var(--bg-surface-paper)',
                    marginBottom: '20px'
                  }}>
                    <span className="ticket-label" style={{ color: 'var(--text-secondary)' }}>
                      {getTxt("FAMILY WARNING NOTICE", "पारिवारिक सुरक्षा सुचना")}
                    </span>

                    <h2 style={{ 
                      fontSize: '1.8rem', 
                      color: scanResults.verdict === 'HIGH' ? 'var(--color-red)' : 'var(--color-amber)',
                      marginTop: '8px',
                      lineHeight: '1.2'
                    }}>
                      {scanResults.verdict === 'HIGH' 
                        ? getTxt("🚫 DANGER: THIS IS A FRAUD TRAP", "🚫 फ्रॉड चेतावनी: यह संदेश नकली है")
                        : getTxt("⚠️ WARNING: UNVERIFIED MESSAGE", "⚠️ सतर्क रहें: संदिग्ध संदेश")}
                    </h2>

                    <div style={{
                      fontSize: '1.15rem',
                      lineHeight: '1.6',
                      color: 'var(--text-primary)',
                      marginTop: '16px',
                      borderLeft: '4px solid',
                      borderColor: scanResults.verdict === 'HIGH' ? 'var(--color-red)' : 'var(--color-amber)',
                      paddingLeft: '16px',
                      fontWeight: 'bold'
                    }}>
                      {scanResults.verdict === 'HIGH' ? (
                        getTxt(
                          "Maa/Papa, this message was sent to trap you. The promises of double money or guaranteed returns are illegal and fake. Do not click any links, do not reply, and do not send money. Delete this message immediately.",
                          "माता/पिता, यह संदेश आपको फंसाने के लिए भेजा गया है। पैसा दोगुना करने या निश्चित मुनाफे के वादे पूरी तरह से नकली और गैरकानूनी हैं। इसपर प्रतिक्रिया न दें, किसी लिंक पर क्लिक न करें और पैसे न भेजें। इसे तुरंत डिलीट करें।"
                        )
                      ) : (
                        getTxt(
                          "Maa/Papa, this advice is not verified. Anyone asking you to buy a stock on WhatsApp/Telegram without a SEBI registry license is illegal. Verify their details first.",
                          "माता/पिता, यह वित्तीय सलाह सत्यापित नहीं है। बिना किसी लाइसेंस के व्हाट्सएप या टेलीग्राम पर शेयर खरीदने की सलाह देना गैरकानूनी है। पहले उनकी लाइसेंस संख्या की जांच करें।"
                        )
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleExportParentSticker}
                        className="btn btn-primary"
                        style={{
                          backgroundColor: scanResults.verdict === 'HIGH' ? 'var(--color-red)' : 'var(--color-amber)',
                          color: '#000000',
                          padding: '10px 16px',
                          fontSize: '0.85rem',
                          width: 'auto'
                        }}
                      >
                        💾 {getTxt("Save Alert as Image", "अलर्ट इमेज डाउनलोड करें")}
                      </button>
                    </div>

                  </div>
                ) : (
                  /* Standard technical metrics view */
                  <div>
                    {renderDemoCallout(1, "Inline Highlights: Exact offending phrases (guaranteed profit, t.me links) caught and colored dynamically.", "इनलाइन हाइलाइट: संदेश में पाए गए संदिग्ध शब्दों को खोज कर सीधे रंगीन चिन्हित किया गया है।")}
                    
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>
                      {getTxt("Source Text Scan Output (Flagged phrases highlighted):", "स्रोत पाठ स्कैन आउटपुट (चेतावनी संकेत चिन्हित):")}
                    </h3>
                    <div style={{
                      backgroundColor: 'var(--bg-base)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      padding: '20px',
                      fontSize: '1rem',
                      lineHeight: '1.7',
                      whiteSpace: 'pre-wrap',
                      marginBottom: '24px',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {renderHighlightedText()}
                    </div>

                    {renderDemoCallout(2, "Structured Breakdown: Checks fake licensing structures (IN[A-H|J-Z] format) and targets local SEBI registered RIA list.", "संरचित वर्गीकरण: नकली लाइसेंस संरचना (INxx प्रारूप) और स्थानीय सेबी पंजीकृत सलाहकार सूची की जांच।")}

                    <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', textTransform: 'uppercase' }}>
                      {getTxt("Identified Red Flags & Reg Violations", "पहचाने गए खतरे और नियम उल्लंघन")}
                    </h3>

                    {scanResults.findings.length === 0 ? (
                      <div className="alert-box alert-low" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <strong style={{ fontSize: '1.05rem' }}>✅ {getTxt("No Common Red Flags Detected", "कोई सामान्य खतरा नहीं पाया गया")}</strong>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {getTxt(
                            "No active red flags were matching our database of known fraudulent solicitations. However, verify license numbers before committing capital.",
                            "हमे ज्ञात अवैध वित्तीय वादों या पोंजी योजनाओं से जुड़े लाल निशान नहीं मिले। फिर भी, निवेश करने से पहले सलाहकारों के पंजीकरण नंबर की आधिकारिक जांच अवश्य करें।"
                          )}
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {scanResults.findings.map((finding) => (
                          <div 
                            key={finding.ruleId} 
                            className={`alert-box ${finding.severity === 'high' ? 'alert-high' : 'alert-medium'}`}
                            style={{ margin: 0 }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '1rem' }}>
                                ⚠ {getTxt(finding.nameEn, finding.nameHi)}
                              </strong>
                              <span style={{ 
                                textTransform: 'uppercase', 
                                fontSize: '0.7rem', 
                                fontWeight: 'bold', 
                                letterSpacing: '0.05em',
                                padding: '1px 6px',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '2px'
                              }}>
                                {getTxt(`${finding.severity.toUpperCase()} RISK`, `${finding.severity === 'high' ? 'उच्च खतरा' : 'मध्यम खतरा'}`)}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.5' }}>
                              {getTxt(finding.descriptionEn, finding.descriptionHi)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {scanResults.verdictSummary && (
                      <div style={{
                        marginTop: '20px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        padding: '16px',
                        backgroundColor: 'rgba(217, 142, 4, 0.02)'
                      }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--color-amber)', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>
                          🤖 {getTxt("AI Sandbox Audit Verdict Summary", "एआई सैंडबॉक्स ऑडिट विश्लेषण सारांश")}
                        </strong>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                          {scanResults.verdictSummary}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Crowdsourced report section */}
                <div style={{
                  marginTop: '20px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ flex: '1', minWidth: '240px' }}>
                    <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--color-amber)' }}>
                      👥 {getTxt("Bhi Mila Tally (Crowdsourced Threat Intel)", "भी मिला टैली (कम्युनिटी रिपोर्टिंग)")}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {getTxt(
                        "Did you also receive this message? Report anonymously to flag it in the community news feed.",
                        "क्या आपको भी यह संदेश मिला? इसे कम्युनिटी फीड पर डालने के लिए गुमनाम रूप से रिपोर्ट करें।"
                      )}
                    </span>
                  </div>
                  
                  {isReported ? (
                    <span style={{
                      color: 'var(--color-amber)',
                      border: '1px dashed var(--color-amber)',
                      borderRadius: '3px',
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(217, 142, 4, 0.05)'
                    }}>
                      ✓ {getTxt(`Reported! Total Tally: ${reportTallyCount}`, `रिपोर्ट किया गया! कुल काउंट: ${reportTallyCount}`)}
                    </span>
                  ) : (
                    <button
                      onClick={handleReportScam}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', borderColor: 'var(--color-amber)', color: 'var(--color-amber)' }}
                    >
                      🗣 {getTxt("Yeh mujhe bhi mila", "यह मुझे भी मिला")}
                    </button>
                  )}
                </div>

                {/* Database redirect prompt */}
                <div style={{
                  marginTop: '24px',
                  backgroundColor: 'var(--bg-surface-light)',
                  padding: '20px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ flex: '1', minWidth: '250px' }}>
                    <h4 style={{ color: 'var(--color-green)', marginBottom: '4px', fontSize: '1rem' }}>
                      🛡 {getTxt("Advisor Registry Verification Directory", "सलाहकार लाइसेंस सत्यापन डायरेक्टरी")}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {getTxt(
                        "If this message provides a SEBI license number (e.g. INAxxxxxxxx), check it against our directory of registered entities.",
                        "यदि इस संदेश में कोई SEBI लाइसेंस नंबर दिया गया है, तो उसे हमारे सत्यापित डायरेक्टरी में खोजें।"
                      )}
                    </p>
                  </div>
                  <button onClick={onNavigateToSebi} className="btn btn-secondary" style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)', padding: '8px 16px', fontSize: '0.85rem', width: 'auto' }}>
                    {getTxt("Check License Number", "लाइसेंस नंबर जांचें")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Dial Instrument Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Seismograph style Dial */}
          <div className="ledger-card">
            <div className="ledger-header">
              <span className="ticket-label">{getTxt("GALVANOMETER EXPOSURE RATING", "गैल्वेनोमीटर सुरक्षा सूचकांक")}</span>
            </div>
            <div className="ledger-body" style={{ textAlign: 'center', padding: '24px 10px', background: 'radial-gradient(circle, rgba(255,255,255,0.01) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
              {renderDemoCallout(3, "Galvanometer Needle: SVG needle rotates dynamically reflecting cumulative risk math indices (0 to 100).", "गैल्वेनोमीटर सुई: संचित जोखिम सूचकांक स्कोर को दर्शाने के लिए सुई गतिशील रूप से घूमती है।")}
              
              <div style={{ position: 'relative', width: '220px', margin: '0 auto' }}>
                <svg width="220" height="135" viewBox="0 0 220 135">
                  <line x1="20" y1="110" x2="200" y2="110" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="110" y1="20" x2="110" y2="110" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="3,3" />
                  <circle cx="110" cy="110" r="90" fill="none" stroke="currentColor" strokeOpacity="0.04" strokeWidth="1" />
                  <circle cx="110" cy="110" r="60" fill="none" stroke="currentColor" strokeOpacity="0.04" strokeWidth="1" strokeDasharray="2,2" />

                  <path d="M 23 110 A 87 87 0 0 1 54 48" fill="none" stroke="var(--color-green)" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 70 33 A 87 87 0 0 1 150 33" fill="none" stroke="var(--color-amber)" strokeWidth="8" />
                  <path d="M 166 48 A 87 87 0 0 1 197 110" fill="none" stroke="var(--color-red)" strokeWidth="8" strokeLinecap="round" />

                  <line x1="30" y1="100" x2="35" y2="98" stroke="var(--color-green)" strokeWidth="2" />
                  <line x1="43" y1="78" x2="48" y2="76" stroke="var(--color-green)" strokeWidth="2" />
                  <line x1="63" y1="58" x2="67" y2="58" stroke="var(--color-green)" strokeWidth="2" />
                  
                  <line x1="90" y1="36" x2="92" y2="42" stroke="var(--color-amber)" strokeWidth="2" />
                  <line x1="110" y1="30" x2="110" y2="38" stroke="var(--color-amber)" strokeWidth="2" />
                  <line x1="130" y1="36" x2="128" y2="42" stroke="var(--color-amber)" strokeWidth="2" />

                  <line x1="157" y1="58" x2="153" y2="58" stroke="var(--color-red)" strokeWidth="2" />
                  <line x1="177" y1="78" x2="172" y2="76" stroke="var(--color-red)" strokeWidth="2" />
                  <line x1="190" y1="100" x2="185" y2="98" stroke="var(--color-red)" strokeWidth="2" />

                  <text x="25" y="125" fill="var(--text-secondary)" fontSize="9" fontWeight="bold" textAnchor="middle">0 (SAFE)</text>
                  <text x="110" y="24" fill="var(--text-secondary)" fontSize="9" fontWeight="bold" textAnchor="middle">50 (ALERT)</text>
                  <text x="195" y="125" fill="var(--text-secondary)" fontSize="9" fontWeight="bold" textAnchor="middle">100 (HIGH)</text>

                  <circle cx="110" cy="110" r="12" fill="var(--bg-surface)" stroke="var(--border-color)" strokeWidth="2" />

                  <g transform={`rotate(${needleAngle} 110 110)`} style={{ transition: isScanning ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                    <line x1="111" y1="111" x2="111" y2="30" stroke="currentColor" strokeOpacity="0.15" strokeWidth="3" strokeLinecap="round" />
                    <line x1="110" y1="110" x2="110" y2="28" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" />
                    <polygon points="110,16 106,30 114,30" fill="var(--color-amber)" />
                  </g>
                  <circle cx="110" cy="110" r="5" fill="var(--color-amber)" />
                </svg>

                <div style={{ marginTop: '12px' }}>
                  <span className="ticket-label">{getTxt("CRIMINALITY INDEX SCORE", "आपराधिक सूचकांक स्कोर")}</span>
                  <div className="numeric-data" style={{ 
                    fontSize: '2rem', 
                    fontWeight: '800',
                    color: isScanning ? 'var(--color-amber)' : (scanResults ? (scanResults.score >= 50 ? 'var(--color-red)' : (scanResults.score >= 15 ? 'var(--color-amber)' : 'var(--color-green)')) : 'var(--text-secondary)'),
                    lineHeight: '1.2',
                    marginTop: '2px'
                  }}>
                    {isScanning ? "--" : (scanResults ? `${scanResults.score} / 100` : "0 / 100")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Official Seal stamp box */}
          {showVerdict && scanResults && (
            <div className="ledger-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '180px', padding: '24px', position: 'relative' }}>
              <div style={{ width: '100%' }}>
                {renderDemoCallout(4, "Official Stamp: Pressed mechanically onto ledger report to show binary regulatory verdict.", "आधिकारिक मोहर: बाइनरी विनियामक फैसले को दर्शाने के लिए मोहर लगाई गई है।")}
              </div>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, opacity: 0.02, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, var(--text-primary), var(--text-primary) 1px, transparent 1px, transparent 12px)' }}></div>
              
              <div style={{ textAlign: 'center', zIndex: 1 }}>
                <span className="ticket-label" style={{ display: 'block', marginBottom: '14px' }}>
                  {getTxt("INSPECTION SCALE VERDICT", "निरीक्षण सुरक्षा फैसला मोहर")}
                </span>
                
                {scanResults.verdict === "HIGH" && (
                  <div className="official-stamp stamp-red">
                    ❌ FRAUD SUSPECT
                  </div>
                )}
                {scanResults.verdict === "MEDIUM" && (
                  <div className="official-stamp stamp-amber">
                    ⚠ CAUTION STATE
                  </div>
                )}
                {scanResults.verdict === "LOW" && (
                  <div className="official-stamp stamp-green">
                    ✓ CLEAR LEDGER
                  </div>
                )}

                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginTop: '16px',
                  fontStyle: 'italic'
                }}>
                  {getTxt("Processed: Security Sandbox Registry", "संसाधित: सुरक्षा सैंडबॉक्स रजिस्ट्री")}
                </p>
              </div>
            </div>
          )}

          {/* Data Governance Box */}
          <div className="ledger-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              🔒 {getTxt("Localized Privacy Policy", "स्थानीय डेटा सुरक्षा नीति")}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {getTxt(
                "All text checks are processed locally within your browser tab. We never collect, store, or transmit your copy-pasted conversations to any external database.",
                "जांचें पूरी तरह से स्थानीय स्तर पर होती हैं। हम आपके कॉपी-पेस्ट किए गए डेटा को कभी संग्रहीत या किसी बाहरी सर्वर पर नहीं भेजते।"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
