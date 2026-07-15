import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  RefreshCw
} from 'lucide-react';
import { tracks } from '../data/lessons';

// --- Reusable CountUp Component (Part A, Feature 6) ---
function CountUp({ end, duration = 1200, suffix = '', prefix = '' }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const cleaned = typeof end === 'string' ? end.replace(/[^0-9.-]/g, '') : end;
    const endValue = parseFloat(cleaned);
    
    if (isNaN(endValue) || endValue === 0) {
      setValue(end);
      return;
    }
    
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * endValue);
      setValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setValue(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  const formatVal = () => {
    if (typeof end === 'string' && end.includes('₹')) {
      return `₹${value.toLocaleString('en-IN')}`;
    }
    return prefix + value.toLocaleString('en-IN') + suffix;
  };

  return <span className="numeric-data">{formatVal()}</span>;
}

// --- Reusable 3D TiltCard Component (Part A, Feature 2) ---
function TiltCard({ children, className, style }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), { stiffness: 300, damping: 30 });

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 800, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

export default function Dashboard({ lang, setLang, completedLessons = [], completedTracks = [], scanHistory = [], setCurrentRoute, getTxt }) {
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

  const portalRef = useRef(null);

  const handlePortalMouseMove = (e) => {
    if (!portalRef.current) return;
    const rect = portalRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    portalRef.current.style.setProperty('--mouse-x', `${x}px`);
    portalRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  useEffect(() => {
    // Load local storage values
    const storedName = localStorage.getItem('safalniveshak_username') || getTxt('Investor', 'निवेशक');
    setUserName(storedName);

    try {
      const storedStreak = localStorage.getItem('safalniveshak_streak');
      if (storedStreak) setStreak(parseInt(storedStreak, 10));
    } catch (e) {}

    // Load active simulated portfolio metrics (if they exist in localStorage)
    try {
      const storedPortfolio = localStorage.getItem('abhyas_portfolio_v2');
      if (storedPortfolio) {
        const parsed = JSON.parse(storedPortfolio);
        if (parsed && parsed.balance !== undefined) {
          const totalHoldingsValue = (parsed.holdings || []).reduce((sum, item) => {
            const livePrice = item.avgBuyPrice * (1 + (Math.random() * 0.1 - 0.04));
            return sum + item.quantity * livePrice;
          }, 0);
          const currentNetWorth = parsed.balance + totalHoldingsValue;
          setPortfolioValue(currentNetWorth);
          const initialCapital = 1000000;
          const ret = ((currentNetWorth - initialCapital) / initialCapital) * 100;
          setPortfolioReturn(ret);
        }
      }
    } catch (err) {}

    // Load profiles switcher
    try {
      const savedProfiles = localStorage.getItem('safalniveshak_profiles');
      const activeId = localStorage.getItem('safalniveshak_active_profile_id') || 'default_profile';
      setActiveProfileId(activeId);
      if (savedProfiles) {
        setProfiles(JSON.parse(savedProfiles));
      } else {
        const initialProfiles = [{
          id: 'default_profile',
          name: storedName,
          xp: 150,
          created_at: new Date().toLocaleDateString('en-IN'),
          data: {}
        }];
        setProfiles(initialProfiles);
        localStorage.setItem('safalniveshak_profiles', JSON.stringify(initialProfiles));
      }
    } catch (err) {}

    // Load notification setting status
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
    const tracksList = JSON.parse(profileData.safalniveshak_tracks);
    const history = JSON.parse(profileData.safalniveshak_history);
    const xp = (lessons.length * 50) + (tracksList.length * 200) + (history.length * 25);

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
    { id: 'seekho', label: getTxt('Seekho Classroom', 'सीखो पाठशाला'), icon: BookOpen, desc: getTxt('Bilingual lessons', 'द्विभाषी पाठ'), color: '#a855f7' },
    { id: 'abhyas', label: getTxt('Abhyas Arena', 'अभ्यास सिमुलेटर'), icon: TrendingUp, desc: getTxt('Virtual trading', 'वर्चुअल ट्रेडिंग'), color: '#3b82f6' },
    { id: 'hisab', label: getTxt('Hisab Calculator', 'हिसाब कैलकुलेटर'), icon: Calculator, desc: getTxt('SIP & Tax options', 'एसआईपी व टैक्स'), color: '#06b6d4' },
    { id: 'bachao', label: getTxt('Scam Shield', 'बचाओ स्कैम शील्ड'), icon: ShieldAlert, desc: getTxt('Verify tips & links', 'टिप्स की जांच करें'), color: '#ef4444' },
    { id: 'sebi', label: getTxt('SEBI Verification', 'सेबी सत्यापन'), icon: Search, desc: getTxt('Search registered RIAs', 'सत्यापित सलाहकार'), color: '#fb923c' },
    { id: 'safalmitra', label: getTxt('SafalMitra AI', 'सफल मित्र चैट'), icon: MessageSquare, desc: getTxt('Offline support bot', 'सपोर्ट बोट'), color: '#10b981' }
  ];

  const renderLangSelectorHUD = () => {
    return (
      <div style={{
        position: 'relative',
        display: 'inline-flex',
        background: 'rgba(6, 11, 40, 0.6)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        borderRadius: '30px',
        padding: '3px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
        alignItems: 'center',
        userSelect: 'none',
        perspective: '400px'
      }}>
        {/* Sliding Indicator background */}
        <div style={{
          position: 'absolute',
          top: '3px',
          bottom: '3px',
          left: lang === 'en' ? '3px' : 'calc(50% + 1px)',
          width: 'calc(50% - 4px)',
          background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
          borderRadius: '30px',
          boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 1,
          transform: 'translateZ(6px)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }} />
        
        {/* Buttons */}
        <button
          onClick={() => setLang && setLang('en')}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            padding: '6px 18px',
            fontSize: '0.78rem',
            fontWeight: '800',
            color: lang === 'en' ? '#fff' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            zIndex: 2,
            transition: 'color 0.25s',
            position: 'relative',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          English
        </button>
        <button
          onClick={() => setLang && setLang('hi')}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            padding: '6px 18px',
            fontSize: '0.78rem',
            fontWeight: '800',
            color: lang === 'hi' ? '#fff' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            zIndex: 2,
            transition: 'color 0.25s',
            position: 'relative',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          हिन्दी
        </button>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="perspective-container">
      
      {/* HEADER COCKPIT SECTION */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(168, 85, 247, 0.15)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', marginBottom: '4px', textShadow: '0 0 12px rgba(168, 85, 247, 0.45)' }}>
            {getTxt(`Namaste, ${userName}! 👋`, `नमस्ते, ${userName}! 👋`)}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', margin: 0 }}>
            {getTxt('Welcome back to your sovereign financial headquarters.', 'आपके वित्तीय सुरक्षा और शिक्षा मुख्यालय में आपका स्वागत है।')}
          </p>
        </div>

        {/* HUD Switcher & badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Bilingual Switch HUD */}
          {renderLangSelectorHUD()}

          {/* Daily Streak */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1.5px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '8px 18px',
            color: '#f87171',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
          }}>
            <Flame size={18} fill="#f87171" style={{ animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '800' }}>
              {streak} {getTxt('Days', 'दिन')}
            </span>
          </div>
        </div>
      </div>

      {/* CORE STATS WIDGETS ROW */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Progress Circular Telemetry Dial */}
        <TiltCard className="holographic-glass glow-breathe" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px 20px' }}>
          <div style={{
            position: 'relative', 
            width: '90px', 
            height: '90px', 
            flexShrink: 0,
            transform: 'translateZ(10px)',
            filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.45))'
          }}>
            <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle 
                cx="45" cy="45" r="38" 
                stroke="rgba(6, 11, 40, 0.6)" strokeWidth="6" fill="transparent" 
              />
              <circle 
                cx="45" cy="45" r="38" 
                stroke="url(#dialGrad)" strokeWidth="6" fill="transparent" 
                strokeDasharray="238.7"
                strokeDashoffset={238.7 - (238.7 * progressPercent) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
              <defs>
                <linearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute', inset: 0, 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', textShadow: '0 0 8px rgba(6, 182, 212, 0.8)' }}>
                {progressPercent}%
              </span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '700' }}>
                {getTxt('XP Accumulation', 'अनुभव संचय')}
              </span>
              <span style={{
                fontSize: '0.62rem',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc',
                padding: '2px 8px',
                borderRadius: '8px',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                fontWeight: '800'
              }}>
                Lvl {level}
              </span>
            </div>
            <h4 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff', margin: '2px 0 4px' }}>
              <CountUp end={totalXP} /> XP
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
              {getTxt(`${xpPerLevel - xpInCurrentLevel} XP to Level ${level + 1}`, `स्तर ${level + 1} के लिए ${xpPerLevel - xpInCurrentLevel} XP चाहिए`)}
            </p>
          </div>
        </TiltCard>

        {/* Portfolio Snapshot Widget */}
        <TiltCard className="holographic-glass glow-breathe" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 20px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '700' }}>
              {getTxt('Virtual Net Worth (Abhyas)', 'आभासी कुल मूल्य (अभ्यास)')}
            </span>
            <h4 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', margin: '4px 0 2px', textShadow: '0 0 10px rgba(6, 182, 212, 0.2)' }}>
              <CountUp end={portfolioValue} prefix="₹" />
            </h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            {portfolioReturn >= 0 ? (
              <span style={{ color: '#22c55e', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '2px', textShadow: '0 0 6px rgba(34,197,94,0.3)' }}>
                ▲ +<CountUp end={portfolioReturn.toFixed(2)} />%
              </span>
            ) : (
              <span style={{ color: '#ef4444', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '2px', textShadow: '0 0 6px rgba(239,68,68,0.3)' }}>
                ▼ <CountUp end={portfolioReturn.toFixed(2)} />%
              </span>
            )}
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{getTxt('simulated returns', 'सभी समय का डमी रिटर्न')}</span>
          </div>
        </TiltCard>

        {/* Sovereign Portal Card (Continue Learning) */}
        <TiltCard 
          className="holographic-glass glow-breathe"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', 
            padding: '24px 20px',
            background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(217, 119, 6, 0.22) 0%, transparent 70%), rgba(6, 11, 40, 0.45)',
          }}
        >
          <div 
            ref={portalRef}
            onMouseMove={handlePortalMouseMove}
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}
          >
            <div>
              {/* Sovereign Portal Header Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '800' }}>
                  {getTxt('SOVEREIGN PORTAL', 'सॉवरेन पोर्टल')}
                </span>
                <span style={{ 
                  fontSize: '0.62rem', 
                  color: '#fb923c', 
                  background: 'rgba(251, 146, 60, 0.1)', 
                  border: '1.5px solid rgba(251, 146, 60, 0.35)', 
                  padding: '2px 8px', 
                  borderRadius: '10px',
                  fontWeight: '900',
                  textShadow: '0 0 4px rgba(251, 146, 60, 0.5)'
                }}>
                  {getTxt('GOLD CLASS', 'स्वर्ण श्रेणी')}
                </span>
              </div>

              {nextLesson ? (
                <>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff', margin: '4px 0 2px' }}>
                    {getTxt(nextLesson.titleEn, nextLesson.titleHi)}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
                    {getTxt(`Next target in ${nextLesson.trackName}`, `${nextLesson.trackName} में अगला पाठ`)}
                  </p>
                </>
              ) : (
                <>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff', margin: '4px 0 2px' }}>
                    🎉 {getTxt('Curriculum Completed!', 'पाठ्यक्रम पूर्ण!')}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
                    {getTxt('Congratulations! You completed all standard modules.', 'बधाई हो! आपने सभी मानक मॉड्यूल पूरे कर लिए हैं।')}
                  </p>
                </>
              )}
            </div>

            {/* Dynamic Progress indicator */}
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                <span>{getTxt('MISSION CHECKPOINT', 'मिशन चेकपॉइंट')}</span>
                <span>{completedLessons.length} / 9</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${(completedLessons.length / 9) * 100}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #a855f7, #06b6d4)',
                  boxShadow: '0 0 8px #06b6d4'
                }} />
              </div>
            </div>

            {nextLesson && (
              <button 
                onClick={() => {
                  setCurrentRoute('seekho');
                }}
                className="btn-3d"
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '14px'
                }}
              >
                {getTxt('Resume Course', 'पाठ पर जाएं')} <ArrowRight size={12} style={{ marginLeft: '4px' }} />
              </button>
            )}
          </div>
        </TiltCard>
      </div>

      {/* QUICK ACCESS ACTION GRID */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', marginBottom: '16px', textShadow: '0 0 8px rgba(168, 85, 247, 0.3)' }}>
          {getTxt('Interactive Hub Terminal', 'इंटरएक्टिव हब टर्मिनल')}
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
                className="icon-tile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '18px 20px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  outline: 'none',
                  border: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '46px', height: '46px', borderRadius: '12px',
                  backgroundColor: `${item.color}20`, color: item.color,
                  filter: `drop-shadow(0 2px 10px ${item.color}45)`,
                  border: `1px solid ${item.color}40`,
                  flexShrink: 0
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: '900', color: '#fff', margin: 0 }}>
                    {item.label}
                  </h4>
                  <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DATA MANAGEMENT & BACKUP SETTINGS CARD */}
      <div className="holographic-glass glow-breathe" style={{
        marginTop: '12px',
        padding: '24px 20px',
        zIndex: 2
      }}>
        <h3 style={{ fontSize: '1.2rem', color: '#fb923c', fontWeight: '900', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 0 6px rgba(251, 146, 60, 0.4)' }}>
          ⚙️ {getTxt("Offline Data Management", "ऑफलाइन डेटा प्रबंधन")}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', margin: '0 0 20px 0', lineHeight: '1.5' }}>
          {getTxt(
            "Export or import your user profile, learning progress, simulated portfolios, and settings to a local JSON file.",
            "अपने यूज़र प्रोफ़ाइल, सीखने की प्रगति, सिमुलेटेड पोर्टफोलियो और सेटिंग्स को स्थानीय JSON फ़ाइल में एक्सपोर्ट या इम्पोर्ट करें।"
          )}
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleExportData}
            className="btn-3d"
            style={{
              padding: '10px 20px',
              fontSize: '0.85rem',
            }}
          >
            📥 {getTxt("Export My Data", "डेटा एक्सपोर्ट करें")}
          </button>

          <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
            <button
              type="button"
              className="btn-3d"
              style={{
                padding: '10px 20px',
                fontSize: '0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.8)',
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
            className="btn-3d"
            style={{
              borderColor: notifyEnabled ? '#22c55e' : 'rgba(255,255,255,0.1)',
              background: notifyEnabled ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
              color: notifyEnabled ? '#22c55e' : 'rgba(255,255,255,0.8)',
              padding: '10px 20px',
              fontSize: '0.85rem',
            }}
          >
            🔔 {notifyEnabled ? getTxt("Daily Alerts: ON", "डेली अलर्ट: चालू") : getTxt("Enable Daily Alerts", "डेली अलर्ट चालू करें")}
          </button>
        </div>

        {/* Profile Switcher Section */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px', marginTop: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#fb923c', fontWeight: '900', margin: '0 0 12px 0' }}>
            👤 {getTxt("User Profile Switcher", "यूज़र प्रोफ़ाइल स्विच करें")}
          </h4>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {profiles.map(p => {
              const isActive = p.id === activeProfileId || (activeProfileId === 'default_profile' && p.id === 'active_user');
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSwitchProfile(p.id)}
                  className="btn-3d"
                  style={{
                    background: isActive ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.04)',
                    borderColor: isActive ? '#fb923c' : 'rgba(255,255,255,0.1)',
                    color: isActive ? '#fb923c' : 'rgba(255,255,255,0.8)',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                  }}
                >
                  {p.name} ({p.xp} XP)
                </button>
              );
            })}
            
            <button
              type="button"
              onClick={() => setShowCreateProfile(!showCreateProfile)}
              className="btn-3d"
              style={{
                background: 'rgba(34,197,94,0.15)',
                borderColor: '#22c55e',
                color: '#22c55e',
                padding: '8px 16px',
                fontSize: '0.8rem',
              }}
            >
              ➕ {getTxt("New Profile", "नया प्रोफाइल")}
            </button>
          </div>

          {showCreateProfile && (
            <form onSubmit={handleCreateProfile} style={{ display: 'flex', gap: '10px', maxWidth: '400px', marginTop: '12px' }}>
              <input
                type="text"
                placeholder={getTxt("Enter profile name...", "प्रोफ़ाइल नाम दर्ज करें...")}
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(6, 11, 40, 0.6)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  borderRadius: '12px',
                  color: '#fff',
                  padding: '10px 16px',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                className="btn-3d"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.82rem',
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
