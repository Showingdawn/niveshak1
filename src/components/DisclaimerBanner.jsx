import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DisclaimerBanner — Overhauled 3D Holographic Status Ribbon
 * Centered top viewport capsule utilizing Saturation Cosmic Navy recipe,
 * spring-based slide-down entrance, and rotateX horizontal fold dismissal.
 */
export default function DisclaimerBanner({ lang = 'en' }) {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('safalniveshak_disclaimer_dismissed') === 'true';
  });
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('safalniveshak_disclaimer_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  const textEn = "⚠️ Educational Tool Only — SafalNiveshak is NOT a SEBI-registered investment advisor. All content is for learning purposes only. Please consult a certified financial advisor before investing.";
  const textHi = "⚠️ केवल शैक्षिक उपकरण — SafalNiveshak एक SEBI-पंजीकृत निवेश सलाहकार नहीं है। सभी सामग्री केवल सीखने के उद्देश्य से है। निवेश से पहले किसी प्रमाणित वित्तीय सलाहकार से परामर्श लें।";

  return (
    <AnimatePresence>
      {isMounted && !dismissed && (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'sticky', top: '12px', zIndex: 9999, perspective: '1200px' }}>
          <motion.div
            initial={{ opacity: 0, y: -60, rotateX: -20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: 90, scaleY: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
            className="holographic-glass glow-breathe"
            style={{
              width: '94%',
              maxWidth: '1160px',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              transformOrigin: 'top center',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              borderRadius: '16px',
            }}
          >
            {/* Left side info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <span style={{ fontSize: '1.2rem', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))' }}>🛡️</span>
              <p style={{
                margin: 0,
                fontSize: '0.78rem',
                lineHeight: '1.5',
                color: '#c084fc',
                fontWeight: '600',
                letterSpacing: '0.01em',
              }}>
                {lang === 'en' ? textEn : textHi}
              </p>
            </div>

            {/* Right side controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
              <span style={{
                fontSize: '0.65rem',
                color: '#06b6d4',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'rgba(6, 182, 212, 0.1)',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>
                {lang === 'en' ? 'Sandbox Secure' : 'सैंडबॉक्स सुरक्षित'}
              </span>

              <button
                onClick={handleDismiss}
                aria-label="Dismiss disclaimer"
                className="btn-3d"
                style={{
                  fontSize: '0.7rem',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                  whiteSpace: 'nowrap',
                  fontWeight: '800'
                }}
              >
                {lang === 'en' ? 'Got it ✕' : 'समझ गया ✕'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
