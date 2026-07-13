import React, { useState } from 'react';

const PERSONAS = [
  { id: 'student', emojiEn: '🎓', labelEn: 'Student / Young Professional', labelHi: 'छात्र / युवा कर्मचारी', descEn: 'Learning investing from scratch', descHi: 'शुरू से निवेश सीखना चाहता हूं' },
  { id: 'working', emojiEn: '💼', labelEn: 'Working Professional', labelHi: 'नौकरीपेशा व्यक्ति', descEn: 'Want to grow my savings wisely', descHi: 'बचत को सही तरीके से बढ़ाना चाहता हूं' },
  { id: 'parent', emojiEn: '👨‍👩‍👧', labelEn: 'Parent / Guardian', labelHi: 'माता-पिता / अभिभावक', descEn: 'Protect family from financial scams', descHi: 'परिवार को फ्रॉड से बचाना है' },
  { id: 'retired', emojiEn: '🧓', labelEn: 'Retired / Senior', labelHi: 'सेवानिवृत्त / वरिष्ठ', descEn: 'Safeguard my life savings', descHi: 'अपनी जमा-पूंजी को सुरक्षित रखना है' },
];

const GOALS = [
  { id: 'learn', emojiEn: '📚', labelEn: 'Learn Investing Basics', labelHi: 'निवेश की बुनियादी जानकारी लें', descEn: 'Structured lessons from zero to smart investor', descHi: 'शून्य से सही निवेशक बनने का रास्ता', route: 'seekho' },
  { id: 'check', emojiEn: '🔍', labelEn: 'Check a Suspicious Message', labelHi: 'संदिग्ध संदेश जांचें', descEn: 'Paste any tip to scan for fraud instantly', descHi: 'कोई भी संदेश पेस्ट करें, धोखाधड़ी की जांच हो', route: 'bachao' },
  { id: 'practice', emojiEn: '📈', labelEn: 'Practice Paper Trading', labelHi: 'वर्चुअल ट्रेडिंग करें', descEn: 'Trade with virtual ₹1L — zero real money', descHi: '₹1 लाख से अभ्यास करें — असली पैसे नहीं', route: 'abhyas' },
  { id: 'advisor', emojiEn: '🪪', labelEn: 'Verify My Advisor is Real', labelHi: 'सलाहकार असली है या नहीं', descEn: 'Look up SEBI registration instantly', descHi: 'SEBI पंजीकरण तुरंत जांचें', route: 'sebi' },
];

export default function OnboardingFlow({ lang, onComplete }) {
  const [step, setStep] = useState(1);
  const [persona, setPersona] = useState(null);
  const [goal, setGoal] = useState(null);
  const [exiting, setExiting] = useState(false);

  const getTxt = (en, hi) => lang === 'en' ? en : hi;

  const handleComplete = (selectedGoal) => {
    setGoal(selectedGoal);
    setStep(3);
  };

  const handleFinish = () => {
    setExiting(true);
    setTimeout(() => {
      onComplete(goal?.route || 'home');
    }, 400);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.4s ease'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '20px 24px 0' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: s === step ? '32px' : '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: s <= step ? 'var(--color-amber)' : 'var(--border-color)',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>

        <div style={{ padding: '24px 28px 32px' }}>

          {/* STEP 1: Who are you */}
          {step === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🙏</span>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                  {getTxt('Welcome to SafalNiveshak', 'सफल निवेशक में आपका स्वागत है')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.9rem' }}>
                  {getTxt("Tell us who you are — we'll personalize your experience.", "बताइए आप कौन हैं — हम अनुभव को आपके अनुसार बनाएंगे।")}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setPersona(p); setStep(2); }}
                    style={{
                      border: `2px solid ${persona?.id === p.id ? 'var(--color-amber)' : 'var(--border-color)'}`,
                      borderRadius: '10px',
                      backgroundColor: persona?.id === p.id ? 'rgba(217,142,4,0.05)' : 'var(--bg-surface-light)',
                      padding: '16px 14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '6px' }}>{p.emojiEn}</span>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                      {getTxt(p.labelEn, p.labelHi)}
                    </strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.3' }}>
                      {getTxt(p.descEn, p.descHi)}
                    </span>
                  </button>
                ))}
              </div>

              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                {getTxt('No account needed. Nothing saved to any server.', 'कोई खाता नहीं। कोई डेटा सर्वर पर नहीं जाता।')}
              </p>
            </div>
          )}

          {/* STEP 2: What is your goal */}
          {step === 2 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>{persona?.emojiEn}</span>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                  {getTxt(`Great! What do you want to do today?`, `बढ़िया! आज क्या करना है?`)}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.85rem' }}>
                  {getTxt("You can always switch sections from the menu.", "आप मेन्यू से कभी भी सेक्शन बदल सकते हैं।")}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {GOALS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleComplete(g)}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-surface-light)',
                      padding: '14px 16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-amber)'; e.currentTarget.style.backgroundColor = 'rgba(217,142,4,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'var(--bg-surface-light)'; }}
                  >
                    <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{g.emojiEn}</span>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {getTxt(g.labelEn, g.labelHi)}
                      </strong>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {getTxt(g.descEn, g.descHi)}
                      </span>
                    </div>
                    <span style={{ marginLeft: 'auto', color: 'var(--color-amber)', fontSize: '1.1rem', flexShrink: 0 }}>→</span>
                  </button>
                ))}
              </div>

              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem', marginTop: '14px', display: 'block', textDecoration: 'underline' }}>
                ← {getTxt('Back', 'वापस जाएं')}
              </button>
            </div>
          )}

          {/* STEP 3: Personalized landing card */}
          {step === 3 && goal && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '12px' }}>✅</span>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: '800', marginBottom: '10px' }}>
                {getTxt("You're all set!", "तैयार हैं आप!")}
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto 20px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {getTxt(
                  `Based on your goal, we're taking you to the "${goal.labelEn}" section. You can explore everything from the menu.`,
                  `आपके लक्ष्य के आधार पर, हम आपको "${goal.labelHi}" सेक्शन में ले जा रहे हैं। मेन्यू से सब कुछ देख सकते हैं।`
                )}
              </p>

              <div style={{ backgroundColor: 'var(--bg-surface-light)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '2.5rem' }}>{goal.emojiEn}</span>
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ display: 'block', color: 'var(--color-amber)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {getTxt('Your destination', 'आपकी मंज़िल')}
                  </strong>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                    {getTxt(goal.labelEn, goal.labelHi)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--color-amber)', color: '#000', fontWeight: '800', fontSize: '1rem', padding: '14px 32px', borderRadius: '8px', width: '100%' }}
              >
                {getTxt(`Let's Go! →`, `चलते हैं! →`)}
              </button>

              <p style={{ marginTop: '14px', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                {getTxt('This preference is saved locally on your device only.', 'यह जानकारी केवल आपके डिवाइस में सेव होती है।')}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
