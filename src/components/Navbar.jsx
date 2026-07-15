import React from 'react';

export default function Navbar({ currentRoute, setCurrentRoute, lang, setLang, theme, setTheme }) {
  const toggleLang = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { id: 'home', labelEn: 'Home', labelHi: 'मुख्य पृष्ठ' },
    { id: 'seekho', labelEn: 'Seekho (Learn)', labelHi: 'सीखो (पाठशाला)' },
    { id: 'abhyas', labelEn: 'Abhyas (Practice)', labelHi: 'अभ्यास (प्रैक्टिस)' },
    { id: 'bachao', labelEn: 'Bachao (Scam Shield)', labelHi: 'बचाओ (स्कैम शील्ड)' },
    { id: 'sebi', labelEn: 'SEBI RIA Verifier', labelHi: 'सलाहकार जांच' },
    { id: 'passbook', labelEn: 'Passbook', labelHi: 'पासबुक' },
    { id: 'safalmitra', labelEn: 'SafalMitra AI', labelHi: 'सफलमित्र AI' },
    { id: 'leaderboard', labelEn: 'Leaderboard 🏆', labelHi: 'लीडरबोर्ड 🏆' },
    { id: 'about', labelEn: 'About', labelHi: 'विवरण' },
  ];

  const getTxt = (en, hi) => (lang === 'en' ? en : hi);

  return (
    <header style={{
      borderBottom: '1px solid var(--border-glass)',
      backgroundColor: 'var(--bg-glass)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'inset 0 1px 0 0 var(--highlight-glass), 0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 'calc(14px + env(safe-area-inset-top, 0px))',
        paddingBottom: '14px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Logo Brand */}
        <button 
          onClick={() => setCurrentRoute('home')}
          className="btn-3d"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            textAlign: 'left',
            padding: '4px 10px',
            boxShadow: 'none',
            transform: 'none'
          }}
          aria-label="SafalNiveshak Home"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '22px',
              backgroundColor: 'var(--color-amber)',
              borderRadius: '2px'
            }}></div>
            <div>
              <h1 style={{ fontSize: '1.15rem', margin: 0, lineHeight: 1.1, color: 'var(--text-primary)', fontWeight: '800' }}>
                SafalNiveshak
              </h1>
              <span style={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '0.65rem', 
                color: 'var(--text-secondary)',
                letterSpacing: '0.03em',
                fontWeight: '600'
              }}>
                सफल निवेशक • Financial Safety & Literacy
              </span>
            </div>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }} aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentRoute(item.id)}
                className={`btn-3d ${isActive ? 'btn-3d-primary' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? '800' : '600',
                  margin: '2px'
                }}
              >
                {lang === 'en' ? item.labelEn : item.labelHi}
              </button>
            );
          })}
        </nav>

        {/* Control Box: Lang Toggle & persistent Demo switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Online/Offline Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '4px 10px',
            fontSize: '0.72rem',
            fontWeight: '600'
          }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isOnline ? '#22c55e' : '#f97316',
              boxShadow: isOnline ? '0 0 8px #22c55e' : '0 0 8px #f97316'
            }} />
            <span style={{ color: isOnline ? '#22c55e' : '#f97316' }}>
              {isOnline ? getTxt("Online", "ऑनलाइन") : getTxt("Offline Mode", "ऑफलाइन मोड")}
            </span>
          </div>

          {/* Bilingual Toggle stamp */}
          <button
            onClick={toggleLang}
            className="btn-3d"
            style={{
              borderColor: 'var(--color-amber)',
              color: 'var(--color-amber)',
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: '800'
            }}
            aria-label={lang === 'en' ? 'Switch language to Hindi' : 'Switch language to English'}
          >
            {lang === 'en' ? 'EN ➔ हि' : 'हि ➔ EN'}
          </button>

          {/* Theme Toggle Switch */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="btn-3d"
            style={{
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: '700'
            }}
            aria-label={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
          >
            <span style={{ marginRight: '4px' }}>{theme === 'light' ? '🌙' : '☀️'}</span>
            {theme === 'light' ? getTxt("Dark", "डार्क") : getTxt("Light", "लाइट")}
          </button>

        </div>
      </div>
    </header>
  );
}
