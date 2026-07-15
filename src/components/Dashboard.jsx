import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

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
function TiltCard({ children, className = '', style = {}, onClick }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 100, mass: 0.7 };
  const rXSpring = useSpring(rotateX, springConfig);
  const rYSpring = useSpring(rotateY, springConfig);

  const handleMouseMove = (e) => {
    if (!cardRef.current || window.matchMedia('(hover: none)').matches) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    const angleX = -(mouseY / (height / 2)) * 6; // Max 6 deg rotation
    const angleY = (mouseX / (width / 2)) * 6;

    rotateX.set(angleX);
    rotateY.set(angleY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        rotateX: rXSpring,
        rotateY: rYSpring,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        scale: isHovered ? 1.015 : 1
      }}
      className={`glass-card ${className}`}
      whileTap={{ scale: 0.98 }}
      transition={{ scale: { duration: 0.2 } }}
    >
      <div style={{ transform: 'translateZ(10px)', width: '100%', height: '100%' }}>
        {children}
      </div>
    </motion.div>
  );
}
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
        gap: '20px',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Progress Ring Widget */}
        <TiltCard style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
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
              <CountUp end={totalXP} /> XP
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
              {getTxt(`${xpPerLevel - xpInCurrentLevel} XP to Level ${level + 1}`, `स्तर ${level + 1} के लिए ${xpPerLevel - xpInCurrentLevel} XP चाहिए`)}
            </p>
          </div>
        </TiltCard>

        {/* Portfolio Snapshot Widget */}
        <TiltCard style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {getTxt('Virtual Net Worth (Abhyas)', 'आभासी कुल मूल्य (अभ्यास)')}
            </span>
            <h4 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)', margin: '4px 0 2px' }}>
              <CountUp end={portfolioValue} prefix="₹" />
            </h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            {portfolioReturn >= 0 ? (
              <span style={{ color: 'var(--color-green)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                ▲ +<CountUp end={portfolioReturn.toFixed(2)} />%
              </span>
            ) : (
              <span style={{ color: 'var(--color-red)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                ▼ <CountUp end={portfolioReturn.toFixed(2)} />%
              </span>
            )}
            <span style={{ color: 'var(--text-tertiary)' }}>{getTxt('all-time simulated returns', 'सभी समय का डमी रिटर्न')}</span>
          </div>
        </TiltCard>

        {/* Continue Learning Card */}
        <TiltCard 
          className="glass-card-shimmer"
          style={{ 
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)',
            borderColor: 'rgba(124, 58, 237, 0.3)'
          }}
        >
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
              className="btn-3d btn-3d-primary"
              style={{
                alignSelf: 'flex-start',
                marginTop: '12px',
                padding: '6px 14px',
                fontSize: '0.75rem'
              }}
            >
              {getTxt('Resume Course', 'पाठ पर जाएं')} <ArrowRight size={12} style={{ marginLeft: '4px' }} />
            </button>
          )}
        </TiltCard>
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
              <TiltCard
                key={item.id}
                onClick={() => setCurrentRoute(item.id)}
                className="btn-3d"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  width: '100%',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-glass)',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '44px', height: '44px', borderRadius: '10px',
                  backgroundColor: `${item.color}20`, color: item.color,
                  filter: `drop-shadow(0 2px 8px ${item.color}35)`
                }}>
                  <Icon size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {item.label}
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    {item.desc}
                  </p>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>

      {/* DATA MANAGEMENT & BACKUP SETTINGS CARD */}
      {/* AMBIENT BACKGROUND ORBS FOR DEPTH */}
      <div className="ambient-orb" style={{
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
        top: '10%',
        left: '-50px',
      }} />
      <div className="ambient-orb" style={{
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)',
        bottom: '20%',
        right: '-100px',
      }} />

      {/* DATA MANAGEMENT & BACKUP SETTINGS CARD */}
      <div className="glass-card" style={{
        marginTop: '28px',
        padding: '24px 20px',
        border: '1px solid var(--border-glass)',
        background: 'var(--bg-glass)',
        position: 'relative',
        zIndex: 2
      }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--color-amber)', fontWeight: '900', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚙️ {getTxt("Offline Data Management", "ऑफलाइन डेटा प्रबंधन")}
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
          {getTxt(
            "Export or import your user profile, learning progress, simulated portfolios, and settings to a local JSON file.",
            "अपने यूज़र प्रोफ़ाइल, सीखने की प्रगति, सिमुलेटेड पोर्टफोलियो और सेटिंग्स को स्थानीय JSON फ़ाइल में एक्सपोर्ट या इम्पोर्ट करें।"
          )}
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleExportData}
            className="btn-3d btn-3d-primary"
            style={{
              padding: '9px 18px',
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
                padding: '9px 18px',
                fontSize: '0.85rem',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)',
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
              borderColor: notifyEnabled ? '#22c55e' : 'var(--btn-border)',
              backgroundColor: notifyEnabled ? 'rgba(34,197,94,0.1)' : 'var(--btn-bg)',
              color: notifyEnabled ? '#22c55e' : 'var(--text-secondary)',
              padding: '9px 18px',
              fontSize: '0.85rem',
            }}
          >
            🔔 {notifyEnabled ? getTxt("Daily Alerts: ON", "डेली अलर्ट: चालू") : getTxt("Enable Daily Alerts", "डेली अलर्ट चालू करें")}
          </button>
        </div>

        {/* Profile Switcher Section */}
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '16px' }}>
          <h4 style={{ fontSize: '0.92rem', color: 'var(--color-amber)', fontWeight: '800', margin: '0 0 10px 0' }}>
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
                    backgroundColor: isActive ? 'rgba(217,142,4,0.15)' : 'var(--btn-bg)',
                    borderColor: isActive ? 'var(--color-amber)' : 'var(--border-glass)',
                    color: isActive ? 'var(--color-amber)' : 'var(--text-secondary)',
                    padding: '6px 14px',
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
                backgroundColor: 'rgba(34,197,94,0.1)',
                borderColor: '#22c55e',
                color: '#22c55e',
                padding: '6px 14px',
                fontSize: '0.8rem',
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
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                className="btn-3d btn-3d-primary"
                style={{
                  padding: '8px 16px',
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
