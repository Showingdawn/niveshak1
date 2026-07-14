import React, { useEffect, useState } from 'react';

/**
 * SplashScreen — Phase 1, Feature 2
 * Animated entry screen with logo, tagline, particle effect (CSS only).
 * Auto-advances after 2.8s or on "Get Started" click.
 * Only shows on first visit (localStorage flag).
 */
export default function SplashScreen({ onDone, lang = 'en' }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2.5;
      });
    }, 70);

    // Auto advance after 3s
    const timer = setTimeout(() => handleDone(), 3000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  const handleDone = () => {
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
      localStorage.setItem('safalniveshak_splash_seen', 'true');
      onDone?.();
    }, 600);
  };

  if (!visible) return null;

  // Generate random particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${Math.random() * 4 + 2}px`,
    duration: `${Math.random() * 4 + 3}s`,
    delay: `${Math.random() * 3}s`,
    opacity: Math.random() * 0.6 + 0.2,
  }));

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0522 40%, #120a2e 70%, #0a1628 100%)',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.6s ease',
      overflow: 'hidden',
    }}>

      {/* Animated particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: p.left,
          top: p.top,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(139,92,246,${p.opacity}), rgba(59,130,246,0.1))`,
          animation: `splashFloat ${p.duration} ${p.delay} ease-in-out infinite alternate`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Glow rings */}
      <div style={{
        position: 'absolute',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        animation: 'splashPulse 3s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '300px', height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
        animation: 'splashPulse 2s 0.5s ease-in-out infinite',
      }} />

      {/* Main content */}
      <div style={{
        position: 'relative',
        textAlign: 'center',
        padding: '0 24px',
        animation: 'splashSlideUp 0.8s ease-out forwards',
      }}>

        {/* Logo icon */}
        <div style={{
          width: '90px', height: '90px',
          margin: '0 auto 24px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.8rem',
          boxShadow: '0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(37,99,235,0.2)',
        }}>
          📈
        </div>

        {/* App name */}
        <h1 style={{
          fontSize: 'clamp(2rem, 6vw, 3.2rem)',
          fontWeight: '900',
          margin: '0 0 8px',
          background: 'linear-gradient(135deg, #a78bfa, #60a5fa, #34d399)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}>
          SafalNiveshak
        </h1>

        {/* Hindi subtitle */}
        <p style={{
          fontSize: '1rem',
          color: 'rgba(167,139,250,0.7)',
          margin: '0 0 6px',
          fontWeight: '500',
        }}>
          सफल निवेशक बनो
        </p>

        {/* Tagline */}
        <p style={{
          fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)',
          color: 'rgba(148,163,184,0.85)',
          margin: '0 0 36px',
          maxWidth: '380px',
          lineHeight: 1.6,
        }}>
          {lang === 'en'
            ? "India's offline-first financial literacy platform for retail investors"
            : "भारतीय निवेशकों के लिए 100% ऑफलाइन वित्तीय शिक्षा मंच"}
        </p>

        {/* Feature pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '36px',
        }}>
          {['📚 Learn', '🛡️ Scam Shield', '📈 Practice Trading', '🏦 MF Simulator'].map(pill => (
            <span key={pill} style={{
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '0.78rem',
              color: 'rgba(167,139,250,0.9)',
              fontWeight: '500',
            }}>{pill}</span>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleDone}
          style={{
            padding: '14px 40px',
            fontSize: '1rem',
            fontWeight: '700',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: '#fff',
            boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 32px rgba(124,58,237,0.6)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 24px rgba(124,58,237,0.4)';
          }}
        >
          {lang === 'en' ? '🚀 Get Started' : '🚀 शुरू करें'}
        </button>

        {/* Progress bar */}
        <div style={{
          marginTop: '32px',
          width: '200px',
          height: '3px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          margin: '28px auto 0',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #7c3aed, #2563eb)',
            borderRadius: '2px',
            transition: 'width 0.07s linear',
          }} />
        </div>
        <p style={{
          fontSize: '0.7rem',
          color: 'rgba(148,163,184,0.4)',
          marginTop: '8px',
        }}>
          {lang === 'en' ? 'Auto-launching...' : 'स्वतः शुरू हो रहा है...'}
        </p>
      </div>

      {/* Offline badge */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '20px',
        padding: '5px 14px',
        fontSize: '0.72rem',
        color: 'rgba(52,211,153,0.8)',
        fontWeight: '600',
      }}>
        <span>●</span>
        {lang === 'en' ? '100% Offline Ready' : '100% ऑफलाइन तैयार'}
      </div>

      {/* CSS animations injected via style tag */}
      <style>{`
        @keyframes splashFloat {
          from { transform: translateY(0px) scale(1); opacity: 0.3; }
          to { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
        }
        @keyframes splashPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes splashSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
