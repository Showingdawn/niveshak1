import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * LandingScreen — Premium Aurora Gradient Landing Page
 * Highly polished, GPU-accelerated entry screen with parallax blurred blobs,
 * spring-based magnetic mouse-following bloom, noise overlay, and bilingual controls.
 */
export default function LandingScreen({ onDone, lang = 'en', setLang }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [localLang, setLocalLang] = useState(lang);
  const [isMoving, setIsMoving] = useState(false);

  const moveTimeoutRef = useRef(null);

  // Framer Motion spring physics configurations for magnetic lag
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 80, mass: 0.8 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Map motion values for smooth parallax transformations
  const blob1X = useTransform(springX, (x) => (isMobile ? 0 : x * 0.08));
  const blob1Y = useTransform(springY, (y) => (isMobile ? 0 : y * 0.08));

  const blob2X = useTransform(springX, (x) => (isMobile ? 0 : x * -0.06));
  const blob2Y = useTransform(springY, (y) => (isMobile ? 0 : y * -0.06));

  const blob3X = useTransform(springX, (x) => (isMobile ? 0 : x * 0.05));
  const blob3Y = useTransform(springY, (y) => (isMobile ? 0 : y * 0.05));

  const blob4X = useTransform(springX, (x) => (isMobile ? 0 : x * -0.04));
  const blob4Y = useTransform(springY, (y) => (isMobile ? 0 : y * -0.04));

  // Check mobile device size and optimize performance
  useEffect(() => {
    const checkSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Track mouse coordinates for desktop interaction
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      // Offset cursor to center of screen coordinates for cleaner transform math
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      mouseX.set(x);
      mouseY.set(y);

      setIsMoving(true);
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
      
      // Mark as stationary after 600ms of no movement to scale down bloom
      moveTimeoutRef.current = setTimeout(() => {
        setIsMoving(false);
      }, 600);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    };
  }, [isMobile, mouseX, mouseY]);

  // Auto-advance after 5 seconds if not clicked (for kiosk/demo flow)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleStart();
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setFadeOut(true);
    setTimeout(() => {
      localStorage.setItem('safalniveshak_splash_seen', 'true');
      onDone?.();
    }, 800);
  };

  const toggleLanguage = () => {
    const newLang = localLang === 'en' ? 'hi' : 'en';
    setLocalLang(newLang);
    setLang?.(newLang);
  };

  const getTxt = (en, hi) => (localLang === 'en' ? en : hi);

  // Float keyframe rules added via custom stylesheet
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#030812',
      color: '#fff',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* 1. ANIMATED NOISE & GRAIN OVERLAY */}
      <svg style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.035,
        pointerEvents: 'none',
        zIndex: 5
      }}>
        <filter id="noise-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)" />
      </svg>

      {/* 2. AURORA GRADIENT BLOB LAYERS */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {/* Blob 1: Purple (Left Side, Slow Parallax) */}
        <motion.div
          animate={isMobile ? {} : {
            y: [0, 40, -30, 0],
            x: [0, -30, 40, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 18,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: isMobile ? '250px' : '450px',
            height: isMobile ? '250px' : '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.28) 0%, rgba(124, 58, 237, 0.05) 50%, transparent 70%)',
            left: '10%',
            top: '20%',
            filter: isMobile ? 'blur(40px)' : 'blur(80px)',
            mixBlendMode: 'screen',
            x: isMobile ? 0 : blob1X,
            y: isMobile ? 0 : blob1Y,
            willChange: 'transform'
          }}
        />

        {/* Blob 2: Cyan/Blue (Right Side, Medium Parallax) */}
        <motion.div
          animate={isMobile ? {} : {
            y: [0, -50, 40, 0],
            x: [0, 50, -40, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 22,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: isMobile ? '280px' : '500px',
            height: isMobile ? '280px' : '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.24) 0%, rgba(59, 130, 246, 0.05) 60%, transparent 80%)',
            right: '10%',
            top: '15%',
            filter: isMobile ? 'blur(45px)' : 'blur(90px)',
            mixBlendMode: 'screen',
            x: isMobile ? 0 : blob2X,
            y: isMobile ? 0 : blob2Y,
            willChange: 'transform'
          }}
        />

        {/* Blob 3: Emerald Accent (Bottom Right) */}
        <motion.div
          animate={isMobile ? {} : {
            y: [0, 30, -40, 0],
            x: [0, -40, 20, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: isMobile ? '220px' : '400px',
            height: isMobile ? '220px' : '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.02) 50%, transparent 70%)',
            right: '20%',
            bottom: '10%',
            filter: isMobile ? 'blur(40px)' : 'blur(80px)',
            mixBlendMode: 'screen',
            x: isMobile ? 0 : blob3X,
            y: isMobile ? 0 : blob3Y,
            willChange: 'transform'
          }}
        />

        {/* Blobs 4 & 5 rendered on Desktop only to keep mobile lightweight */}
        {!isMobile && (
          <>
            {/* Blob 4: Pink/Magenta (Bottom Left) */}
            <motion.div
              animate={{
                y: [0, -35, 35, 0],
                x: [0, 30, -30, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 20,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                width: '380px',
                height: '380px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.18) 0%, rgba(236, 72, 153, 0.02) 50%, transparent 70%)',
                left: '25%',
                bottom: '15%',
                filter: 'blur(75px)',
                mixBlendMode: 'screen',
                x: blob4X,
                y: blob4Y,
                willChange: 'transform'
              }}
            />

            {/* Blob 5: Interactive Cursor-Following Bloom */}
            <motion.div
              style={{
                position: 'absolute',
                width: '450px',
                height: '450px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(59, 130, 246, 0.08) 35%, transparent 70%)',
                filter: 'blur(70px)',
                mixBlendMode: 'screen',
                x: springX,
                y: springY,
                translateX: '-50%',
                translateY: '-50%',
                left: '50%',
                top: '50%',
                scale: isMoving ? 1.25 : 1.00,
                opacity: isMoving ? 0.9 : 0.6,
                transition: 'scale 0.5s ease-out, opacity 0.5s ease-out',
                willChange: 'transform'
              }}
            />
          </>
        )}
      </div>

      {/* 3. CENTER GLASSMORPHISM CARD */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '90%',
        maxWidth: '440px',
        textAlign: 'center',
        padding: '40px 30px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(7, 14, 26, 0.45)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        animation: 'slideUpFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}>
        {/* Bilingual Switch Button */}
        <button
          onClick={toggleLanguage}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#D98E04',
            padding: '4px 10px',
            fontSize: '0.72rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
        >
          🌐 {localLang === 'en' ? 'हिन्दी' : 'English'}
        </button>

        {/* Animated Brand Logo Icon */}
        <div style={{
          width: '74px',
          height: '74px',
          margin: '12px auto 20px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.3rem',
          boxShadow: '0 10px 30px rgba(124,58,237,0.4), 0 0 60px rgba(37,99,235,0.15)',
          animation: 'logoPulse 2.8s ease-in-out infinite alternate'
        }}>
          📈
        </div>

        {/* App Title (Bilingual) */}
        <h1 style={{
          fontSize: '2.1rem',
          fontWeight: '900',
          margin: '0 0 6px 0',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #f3e8ff, #93c5fd, #6ee7b7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.15
        }}>
          SafalNiveshak
        </h1>
        <p style={{
          fontSize: '0.98rem',
          color: 'rgba(167, 139, 250, 0.85)',
          margin: '0 0 16px 0',
          fontWeight: '600',
          letterSpacing: '0.04em'
        }}>
          सफल निवेशक बनो
        </p>

        <div style={{
          width: '40px',
          height: '2px',
          backgroundColor: '#D98E04',
          margin: '0 auto 16px auto',
          borderRadius: '1px'
        }} />

        {/* Tagline description */}
        <p style={{
          fontSize: '0.85rem',
          color: '#8FA0B5',
          lineHeight: 1.6,
          margin: '0 0 32px 0',
          padding: '0 10px'
        }}>
          {getTxt(
            "Learn to trade simulator portfolios, verify SEBI licenses, and protect your capital from fraudulent chat tips completely offline.",
            "सिम्युलेटर पोर्टफोलियो ट्रेड करें, सेबी लाइसेंस सत्यापित करें और व्हाट्सऐप/टेलीग्राम के फेक टिप्स से अपने पैसे सुरक्षित रखें।"
          )}
        </p>

        {/* CTA Get Started Button */}
        <button
          onClick={handleStart}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '14px 24px',
            fontSize: '0.95rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
            outline: 'none'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(124, 58, 237, 0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.3)';
          }}
        >
          🚀 {getTxt("Get Started", "शुरू करें")}
        </button>

        {/* Secure Badging tag */}
        <span style={{
          display: 'block',
          marginTop: '16px',
          fontSize: '0.65rem',
          color: '#5b708a',
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          🛡️ {getTxt("100% Offline Sandbox Security", "१००% ऑफलाइन सैंडबॉक्स सुरक्षा")}
        </span>
      </div>

      {/* INLINE CSS KEYFRAME DECLARATIONS */}
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes logoPulse {
          0% {
            transform: scale(1) rotate(0deg);
            box-shadow: 0 10px 30px rgba(124,58,237,0.4);
          }
          100% {
            transform: scale(1.06) rotate(3deg);
            box-shadow: 0 15px 35px rgba(124,58,237,0.55), 0 0 60px rgba(37,99,235,0.25);
          }
        }
      `}</style>
    </div>
  );
}
