import React, { useState, useEffect } from 'react';
import { sebiAdvisors } from '../data/sebiAdvisors';

export default function SEBILookup({ lang }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [advisors, setAdvisors] = useState(sebiAdvisors);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendActive, setIsBackendActive] = useState(false);
  
  const getTxt = (en, hi) => (lang === 'en' ? en : hi);

  // Search effect to query backend with local fallback
  useEffect(() => {
    const fetchAdvisors = async () => {
      setIsLoading(true);
      try {
        const q = searchQuery.trim();
        const response = await fetch(`http://localhost:5000/api/sebi-ria-lookup?query=${encodeURIComponent(q)}`);
        if (response.ok) {
          const data = await response.json();
          setAdvisors(data);
          setIsBackendActive(true);
        } else {
          throw new Error("Backend response error");
        }
      } catch (err) {
        // Quiet local fallback
        setIsBackendActive(false);
        const q = searchQuery.toLowerCase().trim();
        if (!q) {
          setAdvisors(sebiAdvisors);
        } else {
          const filtered = sebiAdvisors.filter((advisor) => (
            advisor.name.toLowerCase().includes(q) ||
            advisor.regNo.toLowerCase().includes(q) ||
            advisor.address.toLowerCase().includes(q) ||
            advisor.email.toLowerCase().includes(q)
          ));
          setAdvisors(filtered);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchAdvisors, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
          {getTxt("SEBI Advisor Verification Registry", "SEBI सलाहकार सत्यापन रजिस्टर")}
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>
          {getTxt(
            "Verify if your advisor is genuinely registered with SEBI (Securities and Exchange Board of India). Search by name, license number, or corporate entity.",
            "सत्यापित करें कि क्या आपका वित्तीय सलाहकार वास्तव में SEBI के साथ पंजीकृत है। नाम, लाइसेंस नंबर या कॉर्पोरेट नाम से खोजें।"
          )}
        </p>
      </div>

      <div className="ledger-card" style={{ marginBottom: '24px' }}>
        <div className="ledger-header" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="registry-search" className="ticket-label">
              {getTxt("SEARCH REGISTERED ADVISORY DIRECTORY", "पंजीकृत सलाहकार निर्देशिका खोजें")}
            </label>
            <span style={{
              fontSize: '0.7rem',
              color: isBackendActive ? 'var(--color-green)' : 'var(--text-secondary)',
              fontWeight: 'bold',
              border: `1px solid ${isBackendActive ? 'var(--color-green)' : 'var(--border-color)'}`,
              borderRadius: '3px',
              padding: '1px 6px',
              backgroundColor: isBackendActive ? 'rgba(46,125,99,0.05)' : 'transparent'
            }}>
              {isBackendActive ? getTxt("SQLITE ACTIVE", "SQLITE सक्रिय") : getTxt("LOCAL FALLBACK", "ऑफ़लाइन बैकअप")}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              id="registry-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getTxt("Try: 'Zerodha', 'Groww', 'INA000008472', 'Bengaluru'...", "खोजें: 'Zerodha', 'Groww', 'INA000008472', 'Bengaluru'...")}
              style={{
                flexGrow: 1,
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '12px 16px',
                fontSize: '1rem',
                fontFamily: 'var(--font-body)'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="btn btn-secondary"
                style={{ padding: '0 16px', width: 'auto' }}
              >
                {getTxt("Clear", "साफ करें")}
              </button>
            )}
          </div>
        </div>

        <div className="ledger-body" style={{ padding: 0, overflowX: 'auto' }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              ⏳ {getTxt("Searching regulatory registers...", "विनियामक रजिस्टर खोजे जा रहे हैं...")}
            </div>
          ) : advisors.length > 0 ? (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.95rem'
            }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid var(--border-color)',
                  backgroundColor: 'rgba(255,255,255,0.01)'
                }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{getTxt("REGISTRATION NO.", "पंजीकरण संख्या")}</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{getTxt("ENTITY NAME / ADVISOR", "सलाहकार / संस्था का नाम")}</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{getTxt("TYPE", "प्रकार")}</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{getTxt("LOCATION", "स्थान")}</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{getTxt("REGISTRY STATUS", "पंजीकरण स्थिति")}</th>
                </tr>
              </thead>
              <tbody>
                {advisors.map((advisor) => {
                  const isActive = advisor.status === 'Active';
                  return (
                    <tr key={advisor.regNo} style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.15s ease'
                    }}>
                      <td className="numeric-data" style={{ padding: '16px 20px', color: 'var(--text-primary)' }}>
                        {advisor.regNo}
                      </td>
                      
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{advisor.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{advisor.email}</div>
                      </td>

                      <td style={{ padding: '16px 20px', fontSize: '0.85rem' }}>
                        {advisor.type}
                      </td>

                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {advisor.address}
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          backgroundColor: isActive ? 'rgba(46, 125, 99, 0.15)' : 'rgba(211, 78, 54, 0.15)',
                          color: isActive ? 'var(--color-green)' : 'var(--color-red)',
                          border: `1px solid ${isActive ? 'var(--color-green)' : 'var(--color-red)'}`,
                          borderRadius: '3px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          display: 'inline-block'
                        }}>
                          {isActive ? getTxt("ACTIVE / VERIFIED", "सक्रिय / सत्यापित") : getTxt("SUSPENDED", "निलंबित")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{
                color: 'var(--color-red)',
                fontSize: '2.5rem',
                marginBottom: '12px'
              }}>
                ⚠️
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
                {getTxt("No Registered Advisory Matched Your Search", "आपके खोज से मेल खाता कोई पंजीकृत सलाहकार नहीं मिला")}
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                maxWidth: '500px',
                margin: '0 auto',
                fontSize: '0.9rem',
                lineHeight: '1.6'
              }}>
                {getTxt(
                  "Verify that the spelling or license registration format matches exactly. If the tip sender claimed to be registered, they may be lying or using a stolen registration number.",
                  "जांचें कि क्या स्पेलिंग या लाइसेंस नंबर का प्रारूप बिल्कुल सही है। यदि टिप भेजने वाले ने खुद को पंजीकृत बताया है, तो वह झूठ बोल सकता है।"
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Advisory Warnings / Action Panel */}
      <div className="ledger-card" style={{ borderColor: 'var(--color-amber)', background: 'rgba(217, 142, 4, 0.02)' }}>
        <div className="ledger-header" style={{ borderColor: 'var(--color-amber)' }}>
          <h3 style={{ color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
            🚨 {getTxt("Critical Protection Rules For Investors", "निवेशकों के लिए महत्वपूर्ण सुरक्षा नियम")}
          </h3>
        </div>
        <div className="ledger-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
          <p>
            <strong>1. {getTxt("Registration is Mandatory", "पंजीकरण अनिवार्य है")}</strong>: {getTxt(
              "Under SEBI (Investment Advisers) Regulations, 2013, no person or entity is allowed to offer customized investment advice or stock recommendations without securing an official SEBI registration license.",
              "SEBI (निवेश सलाहकार) विनियम, 2013 के तहत, कोई भी व्यक्ति या संस्था आधिकारिक SEBI पंजीकरण लाइसेंस प्राप्त किए बिना व्यक्तिगत निवेश सलाह या स्टॉक सिफारिशें नहीं दे सकता है।"
            )}
          </p>
          <p>
            <strong>2. {getTxt("Identity Theft Warning", "पहचान की चोरी की चेतावनी")}</strong>: {getTxt(
              "Scammers often photocopy authentic SEBI certificates or copy registration numbers of genuine advisors to create fake channels. Always verify advisor contact coordinates (email/website domains) against the official register data.",
              "घोटालेबाज अक्सर असली SEBI प्रमाण पत्र की फोटोकॉपी करते हैं या वास्तविक सलाहकारों के पंजीकरण नंबर की चोरी करते हैं। हमेशा आधिकारिक डेटाबेस के ईमेल/वेबसाइट विवरण से उनके संपर्क विवरण का मिलान करें।"
            )}
          </p>
          <p>
            <strong>3. {getTxt("No Profit Sharing", "कोई लाभ साझेदारी नहीं")}</strong>: {getTxt(
              "SEBI-registered advisors are strictly prohibited from entering into profit-sharing agreements or promising guaranteed returns. Anyone asking for a percentage of your portfolio profits is violating regulatory codes.",
              "SEBI-पंजीकृत सलाहकारों को लाभ-साझेदारी समझौतों (Profit-sharing) में प्रवेश करने या गारंटीड रिटर्न का वादा करने की सख्त मनाही है। कोई भी जो आपसे मुनाफे का हिस्सा मांग रहा है, वह नियमों का उल्लंघन कर रहा है।"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
