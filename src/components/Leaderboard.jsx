import React, { useState, useEffect } from 'react';

export default function Leaderboard({ lang }) {
  const [profiles, setProfiles] = useState([]);
  const getTxt = (en, hi) => (lang === 'en' ? en : hi);

  useEffect(() => {
    // Load local profiles
    const saved = localStorage.getItem('safalniveshak_profiles');
    let loadedProfiles = [];
    if (saved) {
      try {
        loadedProfiles = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse profiles:", e);
      }
    }

    // Fallback/Seed mock profiles if empty, to look populated and demo-ready for judges
    if (loadedProfiles.length === 0) {
      const activeName = localStorage.getItem('safalniveshak_username') || 'Guest';
      const activeLessons = JSON.parse(localStorage.getItem('safalniveshak_lessons') || '[]');
      const activeTracks = JSON.parse(localStorage.getItem('safalniveshak_tracks') || '[]');
      const activeHistory = JSON.parse(localStorage.getItem('safalniveshak_history') || '[]');
      const activeXP = (activeLessons.length * 50) + (activeTracks.length * 200) + (activeHistory.length * 25);
      
      loadedProfiles = [
        { id: 'active_user', name: activeName, xp: Math.max(activeXP, 150), created_at: new Date().toLocaleDateString('en-IN'), isSelf: true },
        { id: 'bot_1', name: 'Rohan Mehta (Expert)', xp: 1200, created_at: '01/06/2026' },
        { id: 'bot_2', name: 'Priya Patel (Mentor)', xp: 850, created_at: '15/06/2026' },
        { id: 'bot_3', name: 'Amit Singh (Saver)', xp: 450, created_at: '10/07/2026' },
        { id: 'bot_4', name: 'Sunita Rao (Novice)', xp: 100, created_at: '12/07/2026' }
      ];
      localStorage.setItem('safalniveshak_profiles', JSON.stringify(loadedProfiles));
    }

    // Sort by XP descending
    loadedProfiles.sort((a, b) => b.xp - a.xp);
    setProfiles(loadedProfiles);
  }, []);

  const getRankBadge = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `🎖️ ${index + 1}`;
  };

  const getRankColor = (index) => {
    if (index === 0) return '#D98E04'; // Gold
    if (index === 1) return '#CBD5E1'; // Silver
    if (index === 2) return '#B45309'; // Bronze
    return '#8FA0B5'; // Normal
  };

  return (
    <div style={{
      backgroundColor: '#070E1A',
      color: '#E8E4DA',
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #1a2840',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      backgroundImage: 'linear-gradient(135deg, rgba(10,22,40,0.7) 0%, rgba(7,14,26,0.9) 100%)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#D98E04', fontWeight: '900', margin: '0 0 8px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          🏆 {getTxt("Local Leaderboard", "स्थानीय लीडरबोर्ड")}
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#8FA0B5', margin: 0 }}>
          {getTxt("Compare your learning progress against offline simulated profiles and other users on this device.", "इस डिवाइस पर अपने सीखने की प्रगति की तुलना अन्य प्रोफाइलों के साथ करें।")}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {profiles.map((p, idx) => {
          const rankColor = getRankColor(idx);
          const level = Math.floor(p.xp / 300) + 1;
          
          return (
            <div 
              key={p.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                backgroundColor: p.isSelf || p.id === 'active_user' ? 'rgba(217, 142, 4, 0.1)' : 'rgba(10, 22, 40, 0.5)',
                border: p.isSelf || p.id === 'active_user' ? '1.5px solid #D98E04' : '1px solid #1a2840',
                borderRadius: '8px',
                transition: 'transform 0.2s ease',
                cursor: 'default'
              }}
            >
              {/* Left Side Rank & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: rankColor, minWidth: '40px' }}>
                  {getRankBadge(idx)}
                </span>
                <div>
                  <div style={{ fontWeight: 'bold', color: p.isSelf || p.id === 'active_user' ? '#D98E04' : '#E8E4DA', fontSize: '0.95rem' }}>
                    {p.name} {(p.isSelf || p.id === 'active_user') && <span style={{ fontSize: '0.72rem', backgroundColor: '#D98E04', color: '#000', padding: '1px 5px', borderRadius: '3px', marginLeft: '6px', fontWeight: 'bold' }}>{getTxt("YOU", "आप")}</span>}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#8FA0B5' }}>
                    {getTxt(`Joined: ${p.created_at}`, `शामिल हुए: ${p.created_at}`)}
                  </span>
                </div>
              </div>

              {/* Right Side XP & Level */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#22c55e', fontFamily: 'monospace' }}>
                  {p.xp} XP
                </div>
                <div style={{ fontSize: '0.72rem', color: '#D98E04', fontWeight: 'bold' }}>
                  Lvl {level}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '20px', borderTop: '1px solid #1a2840', paddingTop: '14px', fontSize: '0.75rem', color: '#8FA0B5', textAlign: 'center' }}>
        💡 {getTxt("Earn 50 XP per Lesson, 200 XP per Chapter Quiz, and 25 XP for Scam Checks!", "प्रत्येक पाठ पर ५० XP, क्विज़ पर २०० XP और स्कैम चेक करने पर २५ XP कमाएं!")}
      </div>
    </div>
  );
}
