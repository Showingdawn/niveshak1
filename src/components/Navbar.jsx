import React from 'react';

export default function Navbar({ currentRoute, setCurrentRoute, lang, setLang, theme, setTheme }) {
  const toggleLang = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  const navItems = [
    { id: 'home', labelEn: 'Home', labelHi: 'मुख्य पृष्ठ' },
    { id: 'seekho', labelEn: 'Seekho (Learn)', labelHi: 'सीखो (पाठशाला)' },
    { id: 'abhyas', labelEn: 'Abhyas (Practice)', labelHi: 'अभ्यास (प्रैक्टिस)' },
    { id: 'bachao', labelEn: 'Bachao (Scam Shield)', labelHi: 'बचाओ (स्कैम शील्ड)' },
    { id: 'sebi', labelEn: 'SEBI RIA Verifier', labelHi: 'सलाहकार जांच' },
    { id: 'passbook', labelEn: 'Passbook', labelHi: 'पासबुक' },
    { id: 'safalmitra', labelEn: 'SafalMitra AI', labelHi: 'सफलमित्र AI' },
    { id: 'about', labelEn: 'About', labelHi: 'विवरण' },
  ];

  const getTxt = (en, hi) => (lang === 'en' ? en : hi);

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(16,24,40,0.05)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '14px',
        paddingBottom: '14px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Logo Brand */}
        <button 
          onClick={() => setCurrentRoute('home')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            textAlign: 'left',
            padding: 0
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
              <h1 style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1.1, color: 'var(--text-primary)', fontWeight: '800' }}>
                SafalNiveshak
              </h1>
              <span style={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '0.68rem', 
                color: 'var(--text-secondary)',
                letterSpacing: '0.05em',
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
                className="nav-link"
                aria-current={isActive ? 'page' : undefined}
                style={{
                  background: isActive ? 'rgba(184, 122, 3, 0.05)' : 'transparent',
                  color: isActive ? 'var(--color-amber)' : 'var(--text-primary)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--color-amber)' : 'transparent',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.85rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {lang === 'en' ? item.labelEn : item.labelHi}
              </button>
            );
          })}
        </nav>

        {/* Control Box: Lang Toggle & persistent Demo switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          


          {/* Bilingual Toggle stamp */}
          <button
            onClick={toggleLang}
            style={{
              backgroundColor: 'transparent',
              border: '1.5px solid var(--color-amber)',
              borderRadius: '4px',
              color: 'var(--color-amber)',
              padding: '4px 10px',
              fontSize: '0.8rem',
              fontWeight: '800',
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              textTransform: 'uppercase'
            }}
            aria-label={lang === 'en' ? 'Switch language to Hindi' : 'Switch language to English'}
          >
            <span style={{
              display: 'inline-block',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-amber)'
            }}></span>
            {lang === 'en' ? 'EN ➔ हि' : 'हि ➔ EN'}
          </button>

          {/* Theme Toggle Switch */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              backgroundColor: 'transparent',
              border: '1.5px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              padding: '4px 10px',
              fontSize: '0.8rem',
              fontWeight: '700',
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            aria-label={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
          >
            <span>{theme === 'light' ? '🌙' : '☀️'}</span>
            {theme === 'light' ? getTxt("Dark", "डार्क") : getTxt("Light", "लाइट")}
          </button>

        </div>
      </div>
    </header>
  );
}
