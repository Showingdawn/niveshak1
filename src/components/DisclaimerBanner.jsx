import React, { useState, useEffect } from 'react';

/**
 * DisclaimerBanner — Phase 1, Feature 1
 * Sticky dismissible educational disclaimer strip.
 * Bilingual (Hindi/English). Saves dismissal to localStorage.
 */
export default function DisclaimerBanner({ lang = 'en' }) {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('safalniveshak_disclaimer_dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('safalniveshak_disclaimer_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  const textEn = "⚠️ Educational Tool Only — SafalNiveshak is NOT a SEBI-registered investment advisor. All content is for learning purposes only. Please consult a certified financial advisor before investing.";
  const textHi = "⚠️ केवल शैक्षिक उपकरण — SafalNiveshak एक SEBI-पंजीकृत निवेश सलाहकार नहीं है। सभी सामग्री केवल सीखने के उद्देश्य से है। निवेश से पहले किसी प्रमाणित वित्तीय सलाहकार से परामर्श लें।";

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 9999,
      background: 'linear-gradient(135deg, rgba(20,10,40,0.97) 0%, rgba(40,10,20,0.97) 100%)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 160, 60, 0.4)',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      boxShadow: '0 2px 20px rgba(255,100,0,0.15)',
    }}>
      {/* Icon */}
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🛡️</span>

      {/* Text */}
      <p style={{
        flex: 1,
        margin: 0,
        fontSize: '0.78rem',
        lineHeight: '1.5',
        color: 'rgba(255, 200, 120, 0.95)',
        fontWeight: '500',
        letterSpacing: '0.01em',
      }}>
        {lang === 'en' ? textEn : textHi}
      </p>

      {/* Toggle lang hint */}
      <span style={{
        fontSize: '0.7rem',
        color: 'rgba(255,200,120,0.5)',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        display: 'none', // shown via media query on wider screens
      }}>
        {lang === 'en' ? 'Not financial advice' : 'वित्तीय सलाह नहीं'}
      </span>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss disclaimer"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,160,60,0.3)',
          borderRadius: '6px',
          color: 'rgba(255,200,120,0.8)',
          cursor: 'pointer',
          fontSize: '0.75rem',
          padding: '4px 12px',
          flexShrink: 0,
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease',
          fontWeight: '600',
        }}
        onMouseEnter={e => {
          e.target.style.background = 'rgba(255,160,60,0.2)';
          e.target.style.color = '#fff';
        }}
        onMouseLeave={e => {
          e.target.style.background = 'rgba(255,255,255,0.08)';
          e.target.style.color = 'rgba(255,200,120,0.8)';
        }}
      >
        {lang === 'en' ? 'Got it ✕' : 'समझ गया ✕'}
      </button>
    </div>
  );
}
