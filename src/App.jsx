import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Abhyas from './components/Abhyas';
import ScamMeter from './components/ScamMeter';
import SEBILookup from './components/SEBILookup';
import GlossaryTerm from './components/GlossaryTerm';
import SafalMitraChatbot from './components/SafalMitraChatbot';
import InteractiveCalculator from './components/InteractiveCalculator';
import SeekhoRenderer from './components/SeekhoRenderer';
import OnboardingFlow from './components/OnboardingFlow';
import { tracks, glossary, trackQuizzes } from './data/lessons';
import { stockKnowledge } from './data/stockKnowledge';
import { officialTestTemplates } from './data/scamRules';

const sebiAlerts = [
  {
    date: "25/06/2024",
    titleEn: "SEBI cautions investors against dealing with unregistered entities",
    titleHi: "सेबी ने निवेशकों को अपंजीकृत संस्थाओं के साथ लेनदेन करने के प्रति आगाह किया",
    descEn: "SEBI warns public against dealing with platforms mimicking registered advisors, offering guaranteed trading targets or fake official SEBI letters.",
    descHi: "सेबी ने जनता को उन प्लेटफार्मों के साथ लेनदेन करने के खिलाफ चेतावनी दी है जो पंजीकृत सलाहकारों की नकल करते हैं या नकली आधिकारिक पत्र दिखाते हैं।",
    link: "https://www.sebi.gov.in/media-and-press/press-releases/jun-2024/sebi-cautions-investors-against-dealing-with-unregistered-entities_84351.html"
  },
  {
    date: "10/04/2024",
    titleEn: "Advisory on entities impersonating SEBI registered intermediaries",
    titleHi: "सेबी पंजीकृत बिचौलियों का भेष धरने वाली संस्थाओं पर सुरक्षा निर्देश",
    descEn: "Warning against private Telegram channels and WhatsApp groups utilizing names of genuine research analysts to pump penny stocks.",
    descHi: "पेनी स्टॉक को बढ़ावा देने के लिए वास्तविक अनुसंधान विश्लेषकों के नामों का उपयोग करने वाले टेलीग्राम चैनलों और व्हाट्सएप समूहों के खिलाफ चेतावनी।",
    link: "https://www.sebi.gov.in/media-and-press/press-releases/apr-2024/sebi-warns-public-against-entities-impersonating-sebi-registered-advisors_82910.html"
  },
  {
    date: "02/07/2023",
    titleEn: "Warning on stock price manipulation operated via social media channels",
    titleHi: "सोशल मीडिया चैनलों के माध्यम से स्टॉक मूल्य हेरफेर के खिलाफ सख्त चेतावनी",
    descEn: "SEBI cautions public against illegal recommendations, assured return claims, and operator leaks spread on messaging groups.",
    descHi: "सेबी ने मैसेजिंग ग्रुपों पर फैलाई जाने वाली अवैध सिफारिशों, सुनिश्चित रिटर्न दावों और ऑपरेटर लीक के खिलाफ जनता को आगाह किया है।",
    link: "https://www.sebi.gov.in/media-and-press/press-releases/jul-2023/warning-on-social-media-investment-scams_73420.html"
  }
];

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('home');
  const [lang, setLang] = useState('en');
  const [scamMeterInitialText, setScamMeterInitialText] = useState('');

  // Onboarding: show once per device
  const [onboardingDone, setOnboardingDone] = useState(() => {
    return localStorage.getItem('safalniveshak_onboarded') === 'true';
  });

  const handleOnboardingComplete = (route) => {
    localStorage.setItem('safalniveshak_onboarded', 'true');
    setOnboardingDone(true);
    if (route && route !== 'home') setCurrentRoute(route);
  };
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('safalniveshak_theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    localStorage.setItem('safalniveshak_theme', theme);
  }, [theme]);
  
  // Active Track selection
  const [activeTrackId, setActiveTrackId] = useState('beginner'); // 'beginner', 'intermediate', 'safety'
  
  // Progress states — seed demo data for first-time visitors so Passbook looks populated
  const [completedLessons, setCompletedLessons] = useState(() => {
    const saved = localStorage.getItem('safalniveshak_lessons');
    if (saved) return JSON.parse(saved);
    // Demo seed: first 3 beginner lessons pre-completed
    return [1, 2, 3];
  });

  const [scanHistory, setScanHistory] = useState(() => {
    const saved = localStorage.getItem('safalniveshak_history');
    if (saved) return JSON.parse(saved);
    // Demo seed: 1 scam scan so Passbook has content
    return [{
      textSnippet: "🚀 JACKPOT CALL: 100% guaranteed profit in 10 days...",
      score: 91,
      verdict: 'HIGH',
      date: new Date().toLocaleDateString('en-IN')
    }];
  });

  const [completedTracks, setCompletedTracks] = useState(() => {
    const saved = localStorage.getItem('safalniveshak_tracks');
    return saved ? JSON.parse(saved) : [];
  });

  const [helpfulFeedback, setHelpfulFeedback] = useState(() => {
    const saved = localStorage.getItem('safalniveshak_feedback');
    return saved ? JSON.parse(saved) : {};
  });

  // Search filter for Glossary
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Crowdsourced scam feed states
  const [reportedScams, setReportedScams] = useState([]);

  // Fetch Passbook from SQLite server on mount
  useEffect(() => {
    const syncPassbookFromBackend = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/passbook/sandbox_user");
        if (response.ok) {
          const data = await response.json();
          if (data.completedLessons) setCompletedLessons(data.completedLessons);
          if (data.completedTracks) setCompletedTracks(data.completedTracks);
          if (data.scanHistory) setScanHistory(data.scanHistory);
          console.log("Synced Passbook ledger history from SQLite database");
        }
      } catch (err) {
        console.warn("SQLite API Server offline, using local localStorage fallback:", err.message);
      }
    };
    syncPassbookFromBackend();
  }, []);

  // Fetch crowdsourced reported scams feed on home page routing
  useEffect(() => {
    const fetchReportedScams = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/reported-scams");
        if (response.ok) {
          const data = await response.json();
          setReportedScams(data);
        } else {
          throw new Error("Report fetch error");
        }
      } catch (err) {
        // Fallback local seed data
        setReportedScams([
          {
            messageText: "🚀 JACKPOT CALL: Buy VIP stocks tomorrow. 100% profit double money guaranteed in 10 days. No risk, transfer Rs 5000 registration fee to Telegram link: t.me/VIP_Stock_Pumping",
            patterns: "guaranteed_returns,urgency_pressure,unregistered_solicitation,pump_dump,advance_payment",
            reportCount: 48,
            lastReported: new Date().toLocaleDateString('en-IN')
          },
          {
            messageText: "Nikhil Kamath Ambani Fund: Join WhatsApp group chat.whatsapp.com/AmbaniTrust for 5% daily returns. Valid for next 2 hours only. Limited seats left, register now!",
            patterns: "guaranteed_returns,urgency_pressure,unregistered_solicitation,celebrity_endorsement",
            reportCount: 32,
            lastReported: new Date().toLocaleDateString('en-IN')
          },
          {
            messageText: "SEBI Registered Advisory leak: Tomorrow upper circuit stock target. Earn 50% profit. We split profit 50-50 after trade is completed. Inbox me for details.",
            patterns: "fake_sebi_advisor,pump_dump,profit_sharing",
            reportCount: 14,
            lastReported: new Date().toLocaleDateString('en-IN')
          }
        ]);
      }
    };

    if (currentRoute === 'home') {
      fetchReportedScams();
    }
  }, [currentRoute]);

  useEffect(() => {
    localStorage.setItem('safalniveshak_lessons', JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem('safalniveshak_history', JSON.stringify(scanHistory));
  }, [scanHistory]);

  useEffect(() => {
    localStorage.setItem('safalniveshak_tracks', JSON.stringify(completedTracks));
  }, [completedTracks]);

  useEffect(() => {
    localStorage.setItem('safalniveshak_feedback', JSON.stringify(helpfulFeedback));
  }, [helpfulFeedback]);

  // Audio Playback states for Seekho
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [activeStockSymbol, setActiveStockSymbol] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');

  // Track Assessment Exam states
  const [examActive, setExamActive] = useState(false);
  const [examAnswers, setExamAnswers] = useState({});
  const [examSubmitted, setExamSubmitted] = useState({});
  const [examFinished, setExamFinished] = useState(false);

  useEffect(() => {
    const getVoicesList = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        const matchLang = lang === 'en' ? 'en' : 'hi';
        const defaultVoice = voices.find(v => v.lang.toLowerCase().includes(matchLang)) || voices[0];
        if (defaultVoice) {
          setSelectedVoiceName(defaultVoice.name);
        }
      }
    };

    getVoicesList();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = getVoicesList;
    }
  }, [lang]);

  // Cancel speech on context navigate
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [activeLessonId, currentRoute]);

  const handleSpeechPlay = (text) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = availableVoices.find(v => v.name === selectedVoiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
    utterance.rate = speechRate;

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleSpeechStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  const handleAddScanHistory = (record) => {
    setScanHistory(prev => [record, ...prev]);
  };

  const handleResetPassbook = () => {
    if (window.confirm("Do you want to reset your learning Passbook ledger history?")) {
      setCompletedLessons([]);
      setScanHistory([]);
      setCompletedTracks([]);
      setHelpfulFeedback({});
      localStorage.removeItem('safalniveshak_lessons');
      localStorage.removeItem('safalniveshak_history');
      localStorage.removeItem('safalniveshak_tracks');
      localStorage.removeItem('safalniveshak_feedback');
      setActiveLessonId(null);
      setExamActive(false);
      setExamFinished(false);
    }
  };

  const triggerScamFastPath = () => {
    const scamText = officialTestTemplates[0].text;
    setScamMeterInitialText(scamText);
    setCurrentRoute('bachao');
  };

  const triggerLessonFastPath = () => {
    setActiveTrackId('beginner');
    setActiveLessonId(1);
    setCurrentRoute('seekho');
  };

  const getTxt = (en, hi) => (lang === 'en' ? en : hi);

  const parseGlossaryTerms = (text) => {
    if (!text) return '';
    const terms = ["SIP", "NAV", "Expense Ratio", "AMC", "AUM", "Exit Load", "LTCG", "STCG", "SEBI", "RIA", "Folio"];
    const regex = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');
    const parts = text.split(regex);
    if (parts.length === 1) return text;
    
    return parts.map((part, idx) => {
      const isMatch = terms.some(t => t.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return <GlossaryTerm key={idx} term={part}>{part}</GlossaryTerm>;
      }
      return part;
    });
  };

  const isLessonUnlocked = (track, lesson, index) => {
    if (index === 0) return true;
    const prevLesson = track.lessons[index - 1];
    return completedLessons.includes(prevLesson.id);
  };

  const isTrackFullyRead = (track) => {
    return track.lessons.every(l => completedLessons.includes(l.id));
  };

  const handleExamSelect = (qIdx, optIdx) => {
    const key = `${activeTrackId}_${qIdx}`;
    if (examSubmitted[key]) return;
    setExamAnswers(prev => ({ ...prev, [key]: optIdx }));
  };

  const handleExamSubmitQuestion = (qIdx) => {
    const key = `${activeTrackId}_${qIdx}`;
    setExamSubmitted(prev => ({ ...prev, [key]: true }));
  };

  const handleFinishExam = async () => {
    const questions = trackQuizzes[activeTrackId];
    let allCorrect = true;
    questions.forEach((q, idx) => {
      const key = `${activeTrackId}_${idx}`;
      if (examAnswers[key] !== q.answerIndex) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      if (!completedTracks.includes(activeTrackId)) {
        const updated = [...completedTracks, activeTrackId];
        setCompletedTracks(updated);
        try {
          await fetch("http://localhost:5000/api/track-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "sandbox_user", trackId: activeTrackId })
          });
        } catch (err) {
          console.warn("Could not write track clearance to backend:", err.message);
        }
      }
    }
    setExamFinished(true);
  };

  const handleResetExam = () => {
    const questions = trackQuizzes[activeTrackId];
    setExamAnswers(prev => {
      const cleared = { ...prev };
      questions.forEach((_, idx) => {
        delete cleared[`${activeTrackId}_${idx}`];
        delete examSubmitted[`${activeTrackId}_${idx}`];
      });
      return cleared;
    });
    setExamFinished(false);
  };

  const filteredGlossary = glossary.filter(g => {
    const q = glossaryQuery.toLowerCase().trim();
    if (!q) return true;
    return g.term.toLowerCase().includes(q) || g.defEn.toLowerCase().includes(q) || g.defHi.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {!onboardingDone && (
        <OnboardingFlow lang={lang} onComplete={handleOnboardingComplete} />
      )}
      <Navbar 
        currentRoute={currentRoute} 
        setCurrentRoute={setCurrentRoute} 
        lang={lang} 
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
      />

      <main style={{ flexGrow: 1, padding: currentRoute === 'abhyas' ? '0' : '40px 0' }} className={currentRoute === 'abhyas' ? "" : "container"}>
        
        {/* Route 1: Landing/Home */}
        {currentRoute === 'home' && (
          <div>
            {/* Dashboard Welcome Header */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
                {getTxt("Namaste, Investor! 👋", "नमस्ते, निवेशक! 👋")}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.5' }}>
                {getTxt(
                  "Your secure terminal for financial safety, SEBI registry checks, and jargon-free stock market education.",
                  "वित्तीय सुरक्षा, सेबी सलाहकारों की जांच, और आसान भाषा में शेयर बाजार शिक्षा के लिए आपका सुरक्षित डैशबोर्ड।"
                )}
              </p>
            </div>

            {/* Quick Overview Widgets */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              
              {/* Card 1: Classroom Progress */}
              <div className="ledger-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
                <div>
                  <span className="ticket-label" style={{ color: 'var(--text-tertiary)' }}>{getTxt("ACADEMY STATUS", "अकादमी स्थिति")}</span>
                  <h3 style={{ fontSize: '1.35rem', marginTop: '10px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    📖 {getTxt("Seekho Classroom", "सीखो पाठशाला")}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {getTxt(
                      "Learn stocks, mutual funds, SIP power, and how to spot fraud in 12 structured lessons with bilingual narration.",
                      "सरल पाठों, अंग्रेजी/हिंदी ऑडियो स्पष्टीकरण और क्विज़ के साथ शेयर बाजार और निवेश की बुनियादी बातें सीखें।"
                    )}
                  </p>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <button 
                    onClick={triggerLessonFastPath}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px 16px', fontSize: '0.85rem', backgroundColor: 'var(--color-amber)', color: '#FFFFFF' }}
                  >
                    {getTxt("Start Learning", "पढ़ना शुरू करें")} ➔
                  </button>
                </div>
              </div>

              {/* Card 2: Scam Analyzer Shield */}
              <div className="ledger-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
                <div>
                  <span className="ticket-label" style={{ color: 'var(--text-tertiary)' }}>{getTxt("PROTECTION ENGINE", "सुरक्षा विश्लेषक")}</span>
                  <h3 style={{ fontSize: '1.35rem', marginTop: '10px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    🛡️ {getTxt("Bachao Scam Shield", "बचाओ स्कैम शील्ड")}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {getTxt(
                      "Scan chat forwards, Telegram investment tips, or pump-and-dump invitations against 15+ fraud red flags.",
                      "व्हाट्सएप/टेलीग्राम से आए संदिग्ध मुनाफे या वीआईपी स्टॉक टिप्स की जांच करें और जोखिम सूचकांकों का विश्लेषण देखें।"
                    )}
                  </p>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <button 
                    onClick={triggerScamFastPath}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px 16px', fontSize: '0.85rem', backgroundColor: 'var(--color-amber)', color: '#FFFFFF' }}
                  >
                    {getTxt("Analyze Message", "संदेश की जांच करें")} ➔
                  </button>
                </div>
              </div>

              {/* Card 3: SEBI Lookup Register */}
              <div className="ledger-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
                <div>
                  <span className="ticket-label" style={{ color: 'var(--text-tertiary)' }}>{getTxt("REGISTRATION DIRECTORY", "आधिकारिक सत्यापन")}</span>
                  <h3 style={{ fontSize: '1.35rem', marginTop: '10px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    🏛️ {getTxt("SEBI RIA Intermediaries", "सेबी सलाहकार जांच")}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {getTxt(
                      "Cross-verify license credentials instantly against the official registry directory before trusting online tips.",
                      "ऑनलाइन सलाहकारों की सेबी पंजीकरण संख्या दर्ज करके उनके लाइसेंस और प्रमाणन की आधिकारिक जांच करें।"
                    )}
                  </p>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <button 
                    onClick={() => setCurrentRoute('sebi')}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '10px 16px', fontSize: '0.85rem', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    {getTxt("Verify License", "पंजीकरण जांचें")} ➔
                  </button>
                </div>
              </div>

            </div>

            {/* SEBI & Community Threat Board */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              
              {/* Left: SEBI Ticker */}
              <div className="ledger-card" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
                <div className="ledger-header" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="ticket-label" style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                    {getTxt("OFFICIAL SEBI INVESTOR ALERT REGISTER", "आधिकारिक सेबी निवेशक चेतावनी रजिस्टर")}
                  </span>
                </div>
                <div className="ledger-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {sebiAlerts.map((alert, idx) => (
                    <div key={idx} style={{ borderBottom: idx < sebiAlerts.length - 1 ? '1px dotted var(--border-color)' : 'none', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        <span>{alert.date}</span>
                        <span style={{ fontWeight: '600' }}>Source: SEBI.gov.in</span>
                      </div>
                      <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--text-primary)' }}>{getTxt(alert.titleEn, alert.titleHi)}</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>{getTxt(alert.descEn, alert.descHi)}</p>
                      <a href={alert.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--color-amber)', textDecoration: 'underline', marginTop: '6px', display: 'inline-block' }}>
                        {getTxt("Read official press release ➔", "आधिकारिक प्रेस विज्ञप्ति पढ़ें ➔")}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Community Alert Tally Feed */}
              <div className="ledger-card" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
                <div className="ledger-header">
                  <span className="ticket-label" style={{ fontSize: '0.65rem' }}>
                    {getTxt("CROWDSOURCED COMMUNITY ALERT TICKER", "कम्युनिटी रिपोर्टेड थ्रेट अलर्ट")}
                  </span>
                </div>
                <div className="ledger-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {reportedScams.slice(0, 3).map((scam, idx) => (
                    <div key={idx} style={{ borderBottom: idx < 2 ? '1px dotted var(--border-color)' : 'none', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--color-amber)', fontWeight: 'bold' }}>
                          ⚠️ Reported {scam.reportCount} times
                        </span>
                        <span className="numeric-data">{scam.lastReported}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic', wordBreak: 'break-word', lineHeight: '1.4' }}>
                        "{scam.messageText.substring(0, 100)}{scam.messageText.length > 100 ? '...' : ''}"
                      </p>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {scam.patterns && scam.patterns.split(',').map(pat => {
                          const isHigh = pat.includes('returns') || pat.includes('payment') || pat.includes('dump') || pat.includes('sebi');
                          return (
                            <span key={pat} style={{
                              fontSize: '0.65rem',
                              backgroundColor: isHigh ? 'rgba(192, 57, 43, 0.06)' : 'rgba(184, 122, 3, 0.06)',
                              border: '1px solid transparent',
                              borderRadius: '2px',
                              padding: '2px 8px',
                              color: isHigh ? 'var(--color-red)' : 'var(--color-amber)',
                              textTransform: 'uppercase',
                              fontWeight: '600'
                            }}>
                              {pat.replace('_', ' ')}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', borderTop: '1px dotted var(--border-color)', paddingTop: '10px' }}>
                    {getTxt(
                      "🔒 Anonymity Clear: No personal profiles are logged. Reports increment tallies directly.",
                      "🔒 डेटा सुरक्षा: कोई व्यक्तिगत जानकारी दर्ज नहीं की जाती। रिपोर्ट से सीधे आंकड़े अपडेट होते हैं।"
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Route: Abhyas (Practice Trading Simulator) */}
        {currentRoute === 'abhyas' && (
          <Abhyas 
            lang={lang} 
            theme={theme}
            onNavigateToSeekho={(lessonId) => {
              let trackId = 'beginner';
              if (lessonId >= 5 && lessonId <= 8) trackId = 'intermediate';
              else if (lessonId >= 9) trackId = 'safety';
              
              setActiveTrackId(trackId);
              setActiveLessonId(lessonId);
              setExamActive(false);
              setExamFinished(false);
              setCurrentRoute('seekho');
            }}
          />
        )}

        {/* Route 2: Seekho (Unified 9-Module Gamified Classroom) */}
        {currentRoute === 'seekho' && (
          <SeekhoRenderer
            lang={lang}
            theme={theme}
            getTxt={getTxt}
            setCurrentRoute={setCurrentRoute}
            stockKnowledge={stockKnowledge}
          />
        )}

        {/* Route 3: Bachao (Scam-check) */}
        {currentRoute === 'bachao' && (
          <ScamMeter 
            lang={lang} 
            onNavigateToSebi={() => setCurrentRoute('sebi')} 
            onAddHistory={handleAddScanHistory}
            initialText={scamMeterInitialText}
            clearInitialText={() => setScamMeterInitialText('')}
          />
        )}

        {/* Route 4: SEBI Registered Advisors Lookup */}
        {currentRoute === 'sebi' && (
          <SEBILookup lang={lang} />
        )}

        {/* Route 5: Passbook */}
        {currentRoute === 'passbook' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
                {getTxt("Niveshak Passbook Ledger", "निवेशक पासबुक लेजर")}
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>
                {getTxt(
                  "Your verified educational achievements and scanned risk transactions, formatted as an official passbook record.",
                  "आपके सत्यापित शैक्षणिक रिकॉर्ड और स्कैन किए गए जोखिम लेनदेन, जो एक पासबुक लेजर के रूप में व्यवस्थित हैं।"
                )}
              </p>
            </div>

            <div className="ledger-card" style={{
              backgroundColor: 'var(--bg-surface-paper)',
              border: '2px solid var(--border-color)',
              borderRadius: '4px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px)',
              backgroundSize: '100% 12px'
            }}>
              
              <div style={{
                padding: '24px 20px',
                borderBottom: '2px dashed var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px',
                backgroundColor: 'rgba(0,0,0,0.15)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <span className="ticket-label" style={{ display: 'block', fontSize: '0.65rem' }}>{getTxt("LEDGER HOLDER NAME", "लेजर धारक का नाम")}</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{getTxt("SANDBOX INVESTOR", "सैंडबॉक्स निवेशक")}</strong>
                  </div>
                  <div>
                    <span className="ticket-label" style={{ display: 'block', fontSize: '0.65rem' }}>{getTxt("PASSBOOK ACCOUNT NO.", "पासबुक खाता संख्या")}</span>
                    <strong className="numeric-data" style={{ color: 'var(--color-amber)', fontSize: '0.95rem' }}>SN-2026-9482-OFFLINE</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
                  <div>
                    <span className="ticket-label" style={{ display: 'block', fontSize: '0.65rem' }}>{getTxt("REGULATION CREDENTIALS", "विनियामक साक्ष्य")}</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {completedTracks.length === 3 
                        ? getTxt("FULL SAFETY CERTIFIED", "पूर्ण सुरक्षा प्रमाणित") 
                        : getTxt(`AUDIT IN PROGRESS (${completedTracks.length}/3 CLEARED)`, `ऑडिट जारी (${completedTracks.length}/३ उत्तीर्ण)`)}
                    </strong>
                  </div>
                  <div>
                    <span className="ticket-label" style={{ display: 'block', fontSize: '0.65rem' }}>{getTxt("LEDGER RESET ACTION", "लेजर रीसेट कार्रवाई")}</span>
                    <button 
                      onClick={handleResetPassbook} 
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-red)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        textDecoration: 'underline',
                        padding: 0
                      }}
                    >
                      [ {getTxt("Format Passbook", "पासबुक खाली करें")} ]
                    </button>
                  </div>
                </div>
              </div>

              <div className="ledger-body" style={{ padding: 0 }}>
                <table className="ledger-table" style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                      <th style={{ padding: '12px 16px', width: '120px' }}>{getTxt("DATE / दिनांक", "DATE / दिनांक")}</th>
                      <th style={{ padding: '12px 16px', width: '100px' }}>{getTxt("CODE / कोड", "CODE / कोड")}</th>
                      <th style={{ padding: '12px 16px' }}>{getTxt("TRANSACTION DETAILS / लेजर विवरण", "TRANSACTION DETAILS / लेजर विवरण")}</th>
                      <th style={{ padding: '12px 16px', width: '120px' }}>{getTxt("VALUE / सूचकांक", "VALUE / सूचकांक")}</th>
                      <th style={{ padding: '12px 16px', width: '140px', textAlign: 'center' }}>{getTxt("LEDGER SEAL / मोहर", "LEDGER SEAL / मोहर")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedLessons.map((lId) => {
                      let lesson = null;
                      tracks.forEach(t => {
                        const l = t.lessons.find(x => x.id === lId);
                        if (l) lesson = l;
                      });
                      if (!lesson) return null;
                      return (
                        <tr key={`l-${lId}`}>
                          <td className="numeric-data" style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>09/07/2026</td>
                          <td className="numeric-data" style={{ padding: '12px 16px', color: 'var(--color-amber)' }}>EDU-LN{lId < 10 ? `0${lId}` : lId}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: '600' }}>{getTxt(lesson.titleEn, lesson.titleHi)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{getTxt("Passed offline reading checklist", "ऑफ़लाइन पठन चेकलिस्ट पूर्ण")}</div>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--color-gold)' }}>PASSED</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{
                              border: '1px solid var(--color-gold)',
                              borderRadius: '3px',
                              color: 'var(--color-gold)',
                              padding: '2px 6px',
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              textTransform: 'uppercase'
                            }}>
                              ★ Passed
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {completedTracks.map((tId) => {
                      const track = tracks.find(t => t.id === tId);
                      return (
                        <tr key={`t-${tId}`} style={{ backgroundColor: 'rgba(212, 175, 55, 0.03)' }}>
                          <td className="numeric-data" style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>09/07/2026</td>
                          <td className="numeric-data" style={{ padding: '12px 16px', color: 'var(--color-gold)' }}>
                            EXAM-{tId === 'beginner' ? 'BGR' : (tId === 'intermediate' ? 'INT' : 'SFT')}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--color-gold)' }}>
                              {getTxt(`Certification: ${track.titleEn}`, `प्रमाणन: ${track.titleHi}`)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {getTxt("Cleared SEBI compliance audit test", "सेबी अनुपालन ऑडिट परीक्षा उत्तीर्ण की")}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--color-gold)' }}>100% OK</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{
                              border: '2px double var(--color-gold)',
                              color: 'var(--color-gold)',
                              padding: '2px 8px',
                              fontSize: '0.65rem',
                              fontWeight: '900',
                              textTransform: 'uppercase',
                              backgroundColor: 'rgba(212, 175, 55, 0.05)',
                              display: 'inline-block',
                              transform: 'rotate(-2deg)'
                            }}>
                              ★ APPROVED
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {scanHistory.map((scan, idx) => {
                      const isHigh = scan.verdict === 'HIGH';
                      const isLow = scan.verdict === 'LOW';
                      return (
                        <tr key={`s-${idx}`}>
                          <td className="numeric-data" style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{scan.date}</td>
                          <td className="numeric-data" style={{ padding: '12px 16px', color: '#8FA0B5' }}>SCAM-CHK</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>"{scan.textSnippet}"</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{getTxt("Pasted solicitations pattern scan", "फॉरवर्ड संदेश सुरक्षा ऑडिट")}</div>
                          </td>
                          <td className="numeric-data" style={{ padding: '12px 16px', color: isHigh ? 'var(--color-red)' : (isLow ? 'var(--color-green)' : 'var(--color-amber)') }}>
                            Index: {scan.score}/100
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{
                              border: '1px solid',
                              borderColor: isHigh ? 'var(--color-red)' : (isLow ? 'var(--color-green)' : 'var(--color-amber)'),
                              color: isHigh ? 'var(--color-red)' : (isLow ? 'var(--color-green)' : 'var(--color-amber)'),
                              borderRadius: '3px',
                              padding: '2px 6px',
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              textTransform: 'uppercase',
                              backgroundColor: isHigh ? 'rgba(211,78,54,0.05)' : (isLow ? 'rgba(46,125,99,0.05)' : 'rgba(217,142,4,0.05)')
                            }}>
                              {isHigh ? '⚠ Blocked' : (isLow ? '✓ Secure' : '⚠ Caution')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {completedLessons.length === 0 && completedTracks.length === 0 && scanHistory.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {getTxt(
                            "No ledger logs found. Complete lessons in 'Seekho' or audit tips in 'Bachao' to print entries.",
                            "कोई लेजर प्रविष्टियां नहीं मिलीं। सीखो में पाठ पूरा करें या बचाओ में संदेश की जांच करें।"
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* Route 5.5: SafalMitra Chatbot */}
        {currentRoute === 'safalmitra' && (
          <SafalMitraChatbot lang={lang} theme={theme} />
        )}

        {/* Route 6: About page — full rewrite */}
        {currentRoute === 'about' && (
          <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* HERO CARD */}
            <div style={{ textAlign: 'center', padding: '40px 28px', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--color-amber), var(--color-green), var(--color-amber))' }} />
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛡️</div>
              <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', fontWeight: '900', marginBottom: '10px' }}>
                {getTxt('SafalNiveshak — सफल निवेशक', 'SafalNiveshak — सफल निवेशक')}
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto', lineHeight: '1.7' }}>
                {getTxt(
                  'India\'s first bilingual investor safety platform — helping first-time investors learn, spot fraud, and practice trading, all in one place.',
                  'भारत का पहला द्विभाषी निवेशक सुरक्षा मंच — पहली बार निवेश करने वाले लोगों को सीखने, धोखाधड़ी पकड़ने और अभ्यास करने में मदद।'
                )}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                {[
                  { num: '20+', label: getTxt('Stock deep-dives', 'कंपनी विश्लेषण') },
                  { num: '50+', label: getTxt('Scam patterns detected', 'धोखाधड़ी पैटर्न') },
                  { num: '3', label: getTxt('Learning tracks', 'अध्ययन मार्ग') },
                  { num: '100%', label: getTxt('Private & offline', 'पूर्णतः निजी') },
                ].map(stat => (
                  <div key={stat.num} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--color-amber)' }}>{stat.num}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* WHY WE BUILT THIS */}
            <div className="ledger-card">
              <div className="ledger-header">
                <span className="ticket-label">{getTxt('THE PROBLEM WE SOLVE', 'हमने यह क्यों बनाया')}</span>
                <h3 style={{ fontSize: '1.4rem', marginTop: '4px', color: 'var(--text-primary)' }}>
                  {getTxt('Fraud is the most expensive financial education', 'धोखाधड़ी सबसे महंगी वित्तीय शिक्षा है')}
                </h3>
              </div>
              <div className="ledger-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.95rem', lineHeight: '1.75', color: 'var(--text-secondary)' }}>
                <p>{getTxt(
                  'Every month, thousands of Indian families lose money to WhatsApp-forward stock scams, fake VIP advisory Telegram groups, and celebrity-name-dropped Ponzi schemes. The victims are almost never greedy people — they are careful, trusting people who simply didn\'t know what to look for.',
                  'हर महीने, हजारों भारतीय परिवार WhatsApp फॉरवर्ड स्टॉक स्कैम, नकली VIP सलाहकार Telegram ग्रुप और सेलिब्रिटी के नाम की पोंजी स्कीम से पैसे खो देते हैं। पीड़ित ज़्यादातर लालची नहीं, बल्कि सच्चे और भरोसेमंद लोग होते हैं — जिन्हें बस सही जानकारी नहीं थी।'
                )}</p>
                <p>{getTxt(
                  'SafalNiveshak was built to give every first-generation investor the tools a seasoned investor has: the ability to recognize fraud on sight, understand what they are buying, and practice before risking real money.',
                  'SafalNiveshak पहली पीढ़ी के हर निवेशक को वो ताकत देने के लिए बनाया गया जो एक अनुभवी निवेशक के पास होती है: धोखाधड़ी को तुरंत पहचानना, यह समझना कि वे क्या खरीद रहे हैं, और असली पैसे जोखिम में डालने से पहले अभ्यास करना।'
                )}</p>
              </div>
            </div>

            {/* WHAT IS REAL */}
            <div className="ledger-card">
              <div className="ledger-header">
                <span className="ticket-label">{getTxt('REAL DATA SOURCES', 'वास्तविक डेटा स्रोत')}</span>
                <h3 style={{ fontSize: '1.35rem', marginTop: '4px', color: 'var(--text-primary)' }}>
                  {getTxt('What is real in this app', 'इस ऐप में क्या असली है')}
                </h3>
              </div>
              <div className="ledger-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { icon: '🏛️', titleEn: 'SEBI RIA & RA Registry', titleHi: 'SEBI RIA और RA रजिस्ट्री', descEn: 'The advisor database is seeded from SEBI\'s official active corporate advisor registry. Names, registration numbers, and BASL codes are real.', descHi: 'सलाहकार डेटाबेस SEBI की आधिकारिक सक्रिय कॉर्पोरेट सलाहकार रजिस्ट्री से लिया गया है। नाम, पंजीकरण संख्या और BASL कोड वास्तविक हैं।' },
                    { icon: '📰', titleEn: 'SEBI Investor Alerts', titleHi: 'SEBI निवेशक चेतावनियां', descEn: 'The fraud warnings on the homepage are sourced directly from SEBI\'s official press release archive.', descHi: 'होमपेज पर धोखाधड़ी की चेतावनियां SEBI के आधिकारिक प्रेस रिलीज अभिलेखागार से सीधे ली गई हैं।' },
                    { icon: '🔬', titleEn: 'Scam Pattern Detection Engine', titleHi: 'स्कैम पैटर्न डिटेक्शन इंजन', descEn: 'The Bachao analyzer detects 15+ fraud fingerprints (guaranteed returns, urgency pressure, fake SEBI numbers, etc.) built from real scam message analysis.', descHi: 'बचाओ विश्लेषक 15+ धोखाधड़ी संकेतक (गारंटीड रिटर्न, दबाव, नकली SEBI नंबर आदि) पहचानता है — वास्तविक स्कैम संदेशों के विश्लेषण से बनाया गया।' },
                    { icon: '📈', titleEn: 'TradingView Live Charts', titleHi: 'TradingView लाइव चार्ट', descEn: 'The Abhyas paper trading module uses real TradingView embeds — the same professional charts used by actual traders, embedded for free.', descHi: 'अभ्यास पेपर ट्रेडिंग मॉड्यूल असली TradingView एम्बेड का उपयोग करता है — वही पेशेवर चार्ट जो असली ट्रेडर्स उपयोग करते हैं।' },
                    { icon: '💰', titleEn: 'Virtual Portfolio Only', titleHi: 'केवल वर्चुअल पोर्टफोलियो', descEn: 'The Abhyas trading simulator uses virtual ₹1,00,000 and NEVER connects to any broker or real money system. It is a sandbox — always.', descHi: 'अभ्यास सिम्युलेटर वर्चुअल ₹1,00,000 का उपयोग करता है और कभी भी किसी ब्रोकर या असली पैसे से नहीं जुड़ता। यह हमेशा एक सैंडबॉक्स है।' },
                  ].map(item => (
                    <div key={item.icon} style={{ display: 'flex', gap: '14px', padding: '14px', backgroundColor: 'var(--bg-surface-light)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '4px' }}>
                          {getTxt(item.titleEn, item.titleHi)}
                        </strong>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.55' }}>
                          {getTxt(item.descEn, item.descHi)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TEAM */}
            <div className="ledger-card">
              <div className="ledger-header">
                <span className="ticket-label">{getTxt('THE TEAM', 'टीम')}</span>
                <h3 style={{ fontSize: '1.35rem', marginTop: '4px', color: 'var(--text-primary)' }}>
                  {getTxt('Built by students who lost money learning the hard way', 'उन छात्रों द्वारा बनाया जो मुश्किल तरीके से सीखे')}
                </h3>
              </div>
              <div className="ledger-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                  {getTxt(
                    'We are a small team of engineering and design students from India who have personally received — and nearly fallen for — Telegram stock scam messages. That personal experience drove us to build a tool that makes investor safety education accessible, bilingual, and instant for anyone in India.',
                    'हम भारत के इंजीनियरिंग और डिज़ाइन छात्रों की एक छोटी टीम हैं जिन्होंने खुद Telegram स्टॉक स्कैम संदेश प्राप्त किए हैं। उस निजी अनुभव ने हमें एक ऐसा उपकरण बनाने के लिए प्रेरित किया जो भारत में किसी के लिए भी निवेशक सुरक्षा शिक्षा को सुलभ, द्विभाषी और तत्काल बनाता है।'
                  )}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  {[
                    { nameEn: 'Product & Engineering', roleEn: 'Full-stack development, scam pattern engine, SEBI data integration', emojiEn: '⚙️' },
                    { nameEn: 'Research & Content', roleEn: 'Financial literacy curriculum, Hindi translations, SEBI alert sourcing', emojiEn: '📖' },
                    { nameEn: 'UX & Design', roleEn: 'Interface design, accessibility, bilingual layout system', emojiEn: '🎨' },
                  ].map(member => (
                    <div key={member.nameEn} style={{ padding: '16px', backgroundColor: 'var(--bg-surface-light)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>{member.emojiEn}</span>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{member.nameEn}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: 'block' }}>{member.roleEn}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MANDATORY DISCLAIMER */}
            <div style={{ border: '2px double var(--color-amber)', borderRadius: '4px', backgroundColor: 'rgba(217, 142, 4, 0.03)', padding: '20px' }}>
              <h4 style={{ color: 'var(--color-amber)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                ⚠️ {getTxt('MANDATORY INVESTOR DISCLOSURE', 'आधिकारिक विनियामक अस्वीकरण')}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.7', marginBottom: '12px' }}>
                {getTxt(
                  'SafalNiveshak is an educational safety tool and sandbox simulator. We are NOT registered investment advisors (RIA) and do not offer buy/sell tips, trading targets, or broker services. All trading in Abhyas is 100% virtual. Always verify advisors on SEBI\'s official portal before investing any real money.',
                  'सफल निवेशक एक शैक्षणिक सुरक्षा और सैंडबॉक्स सिम्युलेटर है। हम SEBI पंजीकृत निवेश सलाहकार (RIA) नहीं हैं। अभ्यास में सभी ट्रेडिंग 100% वर्चुअल है। असली पैसा लगाने से पहले SEBI के आधिकारिक पोर्टल पर सलाहकारों की जांच अवश्य करें।'
                )}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '0.82rem', color: 'var(--color-amber)', textDecoration: 'underline' }}>
                  {getTxt('SEBI RIA Directory →', 'SEBI RIA सूची →')}
                </a>
                <a href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=9" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '0.82rem', color: 'var(--color-amber)', textDecoration: 'underline' }}>
                  {getTxt('SEBI Research Analyst Directory →', 'SEBI अनुसंधान विश्लेषक सूची →')}
                </a>
              </div>
            </div>

          </div>
        )}
      </main>

      <footer style={{
        backgroundColor: '#040B15',
        borderTop: '2px solid var(--border-color)',
        padding: '30px 0',
        marginTop: '60px',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <strong>SafalNiveshak सफल निवेशक</strong>
            <p style={{ marginTop: '4px', fontSize: '0.8rem' }}>
              © 2026. {getTxt("An Investor Safety & Literacy Initiative", "निवेशक सुरक्षा और साक्षरता पहल")}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem' }}>
            <button onClick={() => setCurrentRoute('about')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>
              {getTxt("Disclaimer", "अस्वीकरण")}
            </button>
            <button onClick={() => setCurrentRoute('about')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>
              {getTxt("Data Safety", "डेटा सुरक्षा")}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
