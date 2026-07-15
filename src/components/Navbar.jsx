import React from 'react';

/**
 * Premium Holographic Navbar with Compact Capsule Navigation Dock
 */
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
    { id: 'home', labelEn: 'Home', labelHi: 'होम', icon: '🏠' },
    { id: 'seekho', labelEn: 'Seekho', labelHi: 'सीखो', icon: '🎓' },
    { id: 'abhyas', labelEn: 'Abhyas', labelHi: 'अभ्यास', icon: '📈' },
    { id: 'bachao', labelEn: 'Scam Shield', labelHi: 'स्कैम शील्ड', icon: '🛡️' },
    { id: 'sebi', labelEn: 'SEBI Lookup', labelHi: 'सेबी जांच', icon: '🔍' },
    { id: 'passbook', labelEn: 'Passbook', labelHi: 'पासबुक', icon: '📖' },
    { id: 'safalmitra', labelEn: 'SafalMitra AI', labelHi: 'सफलमित्र AI', icon: '💬' },
    { id: 'leaderboard', labelEn: 'Leaderboard', labelHi: 'लीडरबोर्ड', icon: '🏆' },
    { id: 'about', labelEn: 'About', labelHi: 'विवरण', icon: 'ℹ️' },
  ];

  const getTxt = (en, hi) => (lang === 'en' ? en : hi);

  return (
    <header style={{
      borderBottom: '1px solid rgba(168, 85, 247, 0.25)',
      backgroundColor: 'rgba(6, 11, 40, 0.55)',
      backdropFilter: 'blur(20px) saturate(210%)',
      WebkitBackdropFilter: 'blur(20px) saturate(210%)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
        paddingBottom: '10px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Logo Brand */}
        <button 
          onClick={() => setCurrentRoute('home')}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            padding: '4px 10px',
            transform: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          aria-label="SafalNiveshak Home"
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            color: '#fff',
            fontWeight: '900',
            border: '1.5px solid rgba(255, 255, 255, 0.15)'
          }}>
            🛡️
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', margin: 0, lineHeight: 1.1, color: '#fff', fontWeight: '900', textShadow: '0 0 8px rgba(168, 85, 247, 0.45)' }}>
              SafalNiveshak
            </h1>
            <span style={{ 
              fontFamily: 'var(--font-body)', 
              fontSize: '0.62rem', 
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '0.04em',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              सफल निवेशक • Financial Trust Shield
            </span>
          </div>
        </button>

        {/* Navigation Tabs Capsule */}
        <nav style={{ 
          display: 'flex', 
          gap: '2px', 
          background: 'rgba(6, 11, 40, 0.6)', 
          padding: '4px', 
          borderRadius: '30px', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1.5px 3px rgba(0,0,0,0.5)',
          flexWrap: 'wrap'
        }} aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentRoute(item.id)}
                className={`btn-3d ${isActive ? 'nav-tab-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  borderRadius: '30px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                  boxShadow: isActive ? '0 4px 12px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                  textShadow: isActive ? '0 0 6px rgba(6, 182, 212, 0.5)' : 'none',
                  transition: 'all 0.25s',
                  margin: '1px'
                }}
              >
                <span style={{ marginRight: '4px' }}>{item.icon}</span>
                {lang === 'en' ? item.labelEn : item.labelHi}
              </button>
            );
          })}
        </nav>

        {/* Control Box: Lang Toggle & persistent Demo switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Online/Offline Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(6, 11, 40, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '30px',
            padding: '6px 14px',
            fontSize: '0.72rem',
            fontWeight: '800',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
            color: isOnline ? '#22c55e' : '#f97316'
          }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isOnline ? '#22c55e' : '#f97316',
              boxShadow: isOnline ? '0 0 10px #22c55e' : '0 0 10px #f97316',
              animation: 'pulse 1.5s infinite'
            }} />
            <span>
              {isOnline ? getTxt("Online", "ऑनलाइन") : getTxt("Offline", "ऑफलाइन")}
            </span>
          </div>

          {/* Bilingual Toggle */}
          <button
            onClick={toggleLang}
            className="btn-3d"
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: '900',
              borderRadius: '30px',
              background: 'rgba(6, 11, 40, 0.6)',
              border: '1.5px solid rgba(251, 146, 60, 0.4)',
              color: '#fb923c',
            }}
          >
            {lang === 'en' ? 'EN ➔ हि' : 'हि ➔ EN'}
          </button>

          {/* Theme Toggle Switch */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="btn-3d"
            style={{
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: '900',
              borderRadius: '30px',
              background: 'rgba(6, 11, 40, 0.6)',
              border: '1.5px solid rgba(168, 85, 247, 0.4)',
              color: '#a78bfa',
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

        </div>
      </div>
    </header>
  );
}
