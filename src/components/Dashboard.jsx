import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  ShieldAlert, 
  Calculator, 
  Search, 
  MessageSquare, 
  TrendingUp, 
  Flame, 
  Award, 
  ArrowRight,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { tracks } from '../data/lessons';

export default function Dashboard({ lang, completedLessons = [], completedTracks = [], scanHistory = [], setCurrentRoute, getTxt }) {
  const [userName, setUserName] = useState('');
  const [streak, setStreak] = useState(1);
  const [portfolioValue, setPortfolioValue] = useState(1000000);
  const [portfolioReturn, setPortfolioReturn] = useState(0);

  // Profile Switcher States
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState('default_profile');
  const [newProfileName, setNewProfileName] = useState('');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  useEffect(() => {
    // Load local storage values
    const storedName = localStorage.getItem('safalniveshak_username') || getTxt('Investor', 'निवेशक');
    setUserName(storedName);

    const storedStreak = parseInt(localStorage.getItem('safalniveshak_streak') || '1', 10);
    setStreak(storedStreak);

    // Calculate simulated portfolio value from Abhyas virtual account
    const storedBalance = parseFloat(localStorage.getItem('abhyas_cash') || '1000000');
    const storedHoldings = JSON.parse(localStorage.getItem('abhyas_holdings') || '[]');
    
    // We can fetch live/mock prices to calculate holdings value or just sum them
    let holdingsValue = 0;
    storedHoldings.forEach(h => {
      // Use average price as mock current price for simple display
      holdingsValue += h.qty * h.avgPrice;
    });

    const totalVal = storedBalance + holdingsValue;
    setPortfolioValue(totalVal);
    
    // Calculate total returns % (starting capital is ₹10L)
    const returnsPct = ((totalVal - 1000000) / 1000000) * 100;
    setPortfolioReturn(returnsPct);

    // Load profiles switcher values
    const activeId = localStorage.getItem('safalniveshak_active_profile_id') || 'default_profile';
    setActiveProfileId(activeId);
    try {
      const savedProfiles = localStorage.getItem('safalniveshak_profiles');
      if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
    } catch (e) {}

    // Load notification setting
    const notifySaved = localStorage.getItem('safalniveshak_notifications_enabled') === 'true';
    setNotifyEnabled(notifySaved);
  }, [getTxt]);

  // ---- Data Backup & Restore Operations ----
  const handleExportData = () => {
    const keys = [
      'safalniveshak_username',
      'safalniveshak_lessons',
      'safalniveshak_tracks',
      'safalniveshak_history',
      'safalniveshak_feedback',
      'safalniveshak_portfolio',
      'safalniveshak_mf_portfolio',
      'safalniveshak_profiles',
      'safalniveshak_active_profile_id',
      'safalniveshak_splash_seen',
      'safalniveshak_onboarded',
      'safalniveshak_learning_progress'
    ];
    
    const backup = {};
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val !== null) backup[k] = val;
    });

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SafalNiveshak_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, data[key]);
        });
        alert(lang === 'en' ? 'Data imported successfully! Reloading...' : 'डेटा सफलतापूर्वक इम्पोर्ट किया गया! रीलोड हो रहा है...');
        window.location.reload();
      } catch (err) {
        alert(lang === 'en' ? 'Failed to parse backup JSON.' : 'बैकअप फ़ाइल लोड करने में असमर्थ।');
      }
    };
    reader.readAsText(file);
  };

  // ---- Multi-Profile Management Operations ----
  const saveCurrentProfileData = (profilesList, activeId) => {
    const profileData = {
      safalniveshak_username: localStorage.getItem('safalniveshak_username') || 'Guest',
      safalniveshak_lessons: localStorage.getItem('safalniveshak_lessons') || '[]',
      safalniveshak_tracks: localStorage.getItem('safalniveshak_tracks') || '[]',
      safalniveshak_history: localStorage.getItem('safalniveshak_history') || '[]',
      safalniveshak_feedback: localStorage.getItem('safalniveshak_feedback') || '[]',
      abhyas_portfolio_v2: localStorage.getItem('abhyas_portfolio_v2') || null,
      safalniveshak_mf_portfolio: localStorage.getItem('safalniveshak_mf_portfolio') || null
    };

    const lessons = JSON.parse(profileData.safalniveshak_lessons);
    const tracks = JSON.parse(profileData.safalniveshak_tracks);
    const history = JSON.parse(profileData.safalniveshak_history);
    const xp = (lessons.length * 50) + (tracks.length * 200) + (history.length * 25);

    let updated = [...profilesList];
    const existingIdx = updated.findIndex(p => p.id === activeId);
    if (existingIdx !== -1) {
      updated[existingIdx].xp = xp;
      updated[existingIdx].name = profileData.safalniveshak_username;
      updated[existingIdx].data = profileData;
    } else {
      updated.push({
        id: activeId,
        name: profileData.safalniveshak_username,
        xp,
        created_at: new Date().toLocaleDateString('en-IN'),
        data: profileData
      });
    }
    localStorage.setItem('safalniveshak_profiles', JSON.stringify(updated));
    return updated;
  };

  const handleSwitchProfile = (targetId) => {
    if (targetId === activeProfileId) return;
    const updatedProfiles = saveCurrentProfileData(profiles, activeProfileId);
    const targetProf = updatedProfiles.find(p => p.id === targetId);
    if (targetProf && targetProf.data) {
      Object.keys(targetProf.data).forEach(key => {
        if (targetProf.data[key] !== null) {
          localStorage.setItem(key, targetProf.data[key]);
        } else {
          localStorage.removeItem(key);
        }
      });
    }
    localStorage.setItem('safalniveshak_active_profile_id', targetId);
    alert(lang === 'en' ? `Switched profile to ${targetProf?.name || 'Guest'}! Reloading...` : `${targetProf?.name || 'Guest'} प्रोफाइल पर स्विच किया गया! रीलोड हो रहा है...`);
    window.location.reload();
  };

  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    saveCurrentProfileData(profiles, activeProfileId);
    const newId = 'profile_' + Date.now();
    const freshData = {
      safalniveshak_username: newProfileName.trim(),
      safalniveshak_lessons: '[]',
      safalniveshak_tracks: '[]',
      safalniveshak_history: '[]',
      safalniveshak_feedback: '[]',
      abhyas_portfolio_v2: null,
      safalniveshak_mf_portfolio: null
    };

    let updatedProfiles = [];
    try {
      const saved = localStorage.getItem('safalniveshak_profiles');
      updatedProfiles = saved ? JSON.parse(saved) : [];
    } catch (err) {}

    updatedProfiles.push({
      id: newId,
      name: newProfileName.trim(),
      xp: 0,
      created_at: new Date().toLocaleDateString('en-IN'),
      data: freshData
    });

    localStorage.setItem('safalniveshak_profiles', JSON.stringify(updatedProfiles));
    localStorage.setItem('safalniveshak_active_profile_id', newId);

    Object.keys(freshData).forEach(key => {
      if (freshData[key] !== null) {
        localStorage.setItem(key, freshData[key]);
      } else {
        localStorage.removeItem(key);
      }
    });

    alert(lang === 'en' ? `New profile "${newProfileName}" created successfully! Reloading...` : `नया प्रोफ़ाइल "${newProfileName}" सफलतापूर्वक बनाया गया! रीलोड हो रहा है...`);
    window.location.reload();
  };

  // ---- Reminder/Notification System Operations ----
  const handleToggleNotifications = async () => {
    if (notifyEnabled) {
      setNotifyEnabled(false);
      localStorage.setItem('safalniveshak_notifications_enabled', 'false');
      return;
    }

    if (!('Notification' in window)) {
      alert(lang === 'en' ? 'Desktop notifications are not supported in this browser.' : 'इस ब्राउज़र में नोटिफिकेशन सपोर्टेड नहीं है।');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotifyEnabled(true);
      localStorage.setItem('safalniveshak_notifications_enabled', 'true');
      
      // Trigger instant daily quiz alert
      setTimeout(() => {
        new Notification(getTxt("SafalNiveshak Quiz Alert! 🛡️", "सफल निवेशक क्विज़ अलर्ट! 🛡️"), {
          body: getTxt(
            "Ready for your daily 5-minute financial safety quiz? Tap to open!",
            "क्या आप अपने दैनिक ५ मिनट के वित्तीय सुरक्षा क्विज़ के लिए तैयार हैं? खोलने के लिए क्लिक करें!"
          ),
          icon: "/favicon.ico"
        });
      }, 2500);

      // Trigger instant SIP reminder
      setTimeout(() => {
        new Notification(getTxt("SafalNiveshak: SIP Due Alert! 📈", "सफल निवेशक: एसआईपी ड्यू अलर्ट! 📈"), {
          body: getTxt(
            "Your monthly virtual SIP payment in Equity Index Fund is due. Keep practicing!",
            "इक्विटी इंडेक्स फंड में आपका मासिक आवर्ती निवेश (SIP) का समय हो गया है। अभ्यास जारी रखें!"
          ),
          icon: "/favicon.ico"
        });
      }, 8000);

    } else {
      alert(lang === 'en' ? 'Notification permission was denied.' : 'नोटिफिकेशन अनुमति अस्वीकार कर दी गई थी।');
    }
  };

  // Calculate XP and Levels
  // 50 XP per lesson, 200 XP per track quiz exam, 25 XP per scam shield check
  const lessonsXP = completedLessons.length * 50;
  const tracksXP = completedTracks.length * 200;
  const scansXP = scanHistory.length * 25;
  const totalXP = lessonsXP + tracksXP + scansXP;
  
  const xpPerLevel = 300;
  const level = Math.floor(totalXP / xpPerLevel) + 1;
  const xpInCurrentLevel = totalXP % xpPerLevel;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpPerLevel) * 100));

  // Determine next lesson/module to learn
  const getContinueLesson = () => {
    let nextL = null;
    for (let t of tracks) {
      for (let l of t.lessons) {
        if (!completedLessons.includes(l.id)) {
          nextL = { trackId: t.id, lessonId: l.id, titleEn: l.titleEn, titleHi: l.titleHi, trackName: t.titleEn };
          break;
        }
      }
      if (nextL) break;
    }
    return nextL;
  };

  const nextLesson = getContinueLesson();

  const quickAccessItems = [
    { id: 'seekho', label: getTxt('Seekho Classroom', 'सीखो पाठशाला'), icon: BookOpen, desc: getTxt('Bilingual lessons', 'द्विभाषी पाठ'), color: '#8b5cf6' },
    { id: 'abhyas', label: getTxt('Abhyas Arena', 'अभ्यास सिमुलेटर'), icon: TrendingUp, desc: getTxt('Virtual trading', 'वर्चुअल ट्रेडिंग'), color: '#3b82f6' },
    { id: 'hisab', label: getTxt('Hisab Calculator', 'हिसाब कैलकुलेटर'), icon: Calculator, desc: getTxt('SIP & Tax options', 'एसआईपी व टैक्स'), color: '#06b6d4' },
    { id: 'bachao', label: getTxt('Scam Shield', 'बचाओ स्कैम शील्ड'), icon: ShieldAlert, desc: getTxt('Verify tips & links', 'टिप्स की जांच करें'), color: '#ef4444' },
    { id: 'sebi', label: getTxt('SEBI Verification', 'सेबी सत्यापन'), icon: Search, desc: getTxt('Search registered RIAs', 'सत्यापित सलाहकार'), color: '#f59e0b' },
    { id: 'safalmitra', label: getTxt('SafalMitra AI', 'सफल मित्र चैट'), icon: MessageSquare, desc: getTxt('Offline support bot', 'सपोर्ट बोट'), color: '#10b981' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER SECTION */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '8px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {getTxt(`Namaste, ${userName}! 👋`, `नमस्ते, ${userName}! 👋`)}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {getTxt('Welcome back to your sovereign financial headquarters.', 'आपके वित्तीय सुरक्षा और शिक्षा मुख्यालय में आपका स्वागत है।')}
          </p>
        </div>

        {/* Streak & Level Badges */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Daily Streak */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '8px 16px',
            color: '#f87171'
          }}>
            <Flame size={20} fill="#f87171" style={{ animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: '800' }}>
              {streak} {getTxt('Day Streak', 'दिन का सिलसिला')}
            </span>
          </div>

          {/* Level Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(167, 139, 250, 0.1)',
            border: '1px solid rgba(167, 139, 250, 0.3)',
            borderRadius: '12px',
            padding: '8px 16px',
            color: '#a78bfa'
          }}>
            <Award size={20} />
            <span style={{ fontSize: '0.95rem', fontWeight: '800' }}>
              {getTxt(`Lvl ${level}`, `स्तर ${level}`)}
            </span>
          </div>
        </div>
      </div>

      {/* CORE STATS WIDGETS ROW */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {/* Progress Ring Widget */}
        <div className="ledger-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
          {/* Progress Circular Ring SVG */}
          <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
            <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle 
                cx="40" cy="40" r="34" 
                stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" 
              />
              <circle 
                cx="40" cy="40" r="34" 
                stroke="url(#purpleGrad)" strokeWidth="6" fill="transparent" 
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * progressPercent) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
              <defs>
                <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute', inset: 0, 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>{progressPercent}%</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {getTxt('XP Accumulation', 'अनुभव संचय')}
            </span>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: '2px 0 4px' }}>
              {totalXP} XP
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
              {getTxt(`${xpPerLevel - xpInCurrentLevel} XP to Level ${level + 1}`, `स्तर ${level + 1} के लिए ${xpPerLevel - xpInCurrentLevel} XP चाहिए`)}
            </p>
          </div>
        </div>

        {/* Portfolio Snapshot Widget */}
        <div className="ledger-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {getTxt('Virtual Net Worth (Abhyas)', 'आभासी कुल मूल्य (अभ्यास)')}
            </span>
            <h4 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)', margin: '4px 0 2px' }}>
              ₹{portfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            {portfolioReturn >= 0 ? (
              <span style={{ color: 'var(--color-green)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                ▲ +{portfolioReturn.toFixed(2)}%
              </span>
            ) : (
              <span style={{ color: 'var(--color-red)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                ▼ {portfolioReturn.toFixed(2)}%
              </span>
            )}
            <span style={{ color: 'var(--text-tertiary)' }}>{getTxt('all-time simulated returns', 'सभी समय का डमी रिटर्न')}</span>
          </div>
        </div>

        {/* Continue Learning Card */}
        <div className="ledger-card" style={{ 
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)',
          border: '1px solid rgba(124, 58, 237, 0.3)'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {getTxt('Continue Learning', 'अध्ययन जारी रखें')}
            </span>
            {nextLesson ? (
              <>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 2px' }}>
                  {getTxt(nextLesson.titleEn, nextLesson.titleHi)}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {getTxt(`Next up in ${nextLesson.trackName}`, `${nextLesson.trackName} में अगला पाठ`)}
                </p>
              </>
            ) : (
              <>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 2px' }}>
                  🎉 {getTxt('Curriculum Completed!', 'पाठ्यक्रम पूर्ण!')}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {getTxt('Congratulations! You completed all standard modules.', 'बधाई हो! आपने सभी मानक मॉड्यूल पूरे कर लिए हैं।')}
                </p>
              </>
            )}
          </div>
          {nextLesson && (
            <button 
              onClick={() => {
                setCurrentRoute('seekho');
              }}
              style={{
                background: 'none', border: 'none', color: 'var(--color-amber)', 
                display: 'inline-flex', alignItems: 'center', gap: '4px', 
                fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', padding: 0,
                alignSelf: 'flex-start', marginTop: '10px'
              }}
            >
              {getTxt('Resume Course', 'पाठ पर जाएं')} <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* QUICK ACCESS ACTION GRID */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
          {getTxt('Interactive Hub', 'इंटरएक्टिव हब')}
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          {quickAccessItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentRoute(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-light)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-light)';
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '44px', height: '44px', borderRadius: '10px',
                  backgroundColor: `${item.color}15`, color: item.color
                }}>
                  <Icon size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {item.label}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DATA MANAGEMENT & BACKUP SETTINGS CARD */}
      <div className="ledger-card" style={{
        marginTop: '28px',
        backgroundColor: '#0A1628',
        borderColor: '#1a2840',
        padding: '20px',
        borderRadius: '12px',
        backgroundImage: 'linear-gradient(135deg, rgba(10,22,40,0.6) 0%, rgba(13,27,47,0.8) 100%)',
        borderWidth: '1px',
        borderStyle: 'solid'
      }}>
        <h3 style={{ fontSize: '1.15rem', color: '#D98E04', fontWeight: '900', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚙️ {getTxt("Offline Data Management", "ऑफलाइन डेटा प्रबंधन")}
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#8FA0B5', margin: '0 0 16px 0' }}>
          {getTxt(
            "Export or import your user profile, learning progress, simulated portfolios, and settings to a local JSON file.",
            "अपने यूज़र प्रोफ़ाइल, सीखने की प्रगति, सिमुलेटेड पोर्टफोलियो और सेटिंग्स को स्थानीय JSON फ़ाइल में एक्सपोर्ट या इम्पोर्ट करें।"
          )}
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleExportData}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              padding: '10px 18px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            📥 {getTxt("Export My Data", "डेटा एक्सपोर्ट करें")}
          </button>

          <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
            <button
              type="button"
              style={{
                backgroundColor: 'transparent',
                border: '1.5px solid #2a3f5f',
                borderRadius: '6px',
                color: '#8FA0B5',
                padding: '9px 18px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              📤 {getTxt("Import Data", "डेटा इम्पोर्ट करें")}
            </button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                opacity: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer'
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleToggleNotifications}
            style={{
              backgroundColor: notifyEnabled ? 'rgba(34,197,94,0.1)' : 'transparent',
              border: `1.5px solid ${notifyEnabled ? '#22c55e' : '#2a3f5f'}`,
              borderRadius: '6px',
              color: notifyEnabled ? '#22c55e' : '#8FA0B5',
              padding: '9px 18px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🔔 {notifyEnabled ? getTxt("Daily Alerts: ON", "डेली अलर्ट: चालू") : getTxt("Enable Daily Alerts", "डेली अलर्ट चालू करें")}
          </button>
        </div>

        {/* Profile Switcher Section */}
        <div style={{ borderTop: '1px solid #1a2840', paddingTop: '16px', marginTop: '16px' }}>
          <h4 style={{ fontSize: '0.92rem', color: '#D98E04', fontWeight: '800', margin: '0 0 10px 0' }}>
            👤 {getTxt("User Profile Switcher", "यूज़र प्रोफ़ाइल स्विच करें")}
          </h4>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {profiles.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSwitchProfile(p.id)}
                style={{
                  backgroundColor: p.id === activeProfileId || (activeProfileId === 'default_profile' && p.id === 'active_user') ? 'rgba(217,142,4,0.2)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${p.id === activeProfileId || (activeProfileId === 'default_profile' && p.id === 'active_user') ? '#D98E04' : '#2a3f5f'}`,
                  color: p.id === activeProfileId || (activeProfileId === 'default_profile' && p.id === 'active_user') ? '#D98E04' : '#8FA0B5',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {p.name} ({p.xp} XP)
              </button>
            ))}
            
            <button
              type="button"
              onClick={() => setShowCreateProfile(!showCreateProfile)}
              style={{
                backgroundColor: 'rgba(34,197,94,0.1)',
                border: '1.5px dashed #22c55e',
                color: '#22c55e',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              ➕ {getTxt("New Profile", "नया प्रोफाइल")}
            </button>
          </div>

          {showCreateProfile && (
            <form onSubmit={handleCreateProfile} style={{ display: 'flex', gap: '10px', maxWidth: '400px', marginTop: '10px' }}>
              <input
                type="text"
                placeholder={getTxt("Enter profile name...", "प्रोफ़ाइल नाम दर्ज करें...")}
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: '#070E1A',
                  border: '1px solid #2a3f5f',
                  borderRadius: '6px',
                  color: '#E8E4DA',
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#22c55e',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#000',
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {getTxt("Create", "बनाएं")}
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* CSS Animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
