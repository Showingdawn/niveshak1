import React, { useState } from 'react';

/**
 * CertificateGenerator — Phase 1, Feature 6
 * jsPDF-based PDF completion certificate.
 * Dark/premium design with module name, date, XP, and SafalNiveshak branding.
 */
export default function CertificateGenerator({ lang = 'en', moduleName = '', moduleNameHi = '', xp = 0, tier = 'Beginner', userName = 'Learner' }) {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setGenerating(true);
    setDone(false);

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const W = 297, H = 210;

      // === BACKGROUND ===
      // Dark gradient base
      doc.setFillColor(10, 10, 26);
      doc.rect(0, 0, W, H, 'F');

      // Gradient overlay (simulate with rectangles)
      for (let i = 0; i < 30; i++) {
        const alpha = (30 - i) / 30 * 0.3;
        doc.setFillColor(124, 58, 237);
        doc.setGState(doc.GState({ opacity: alpha * 0.05 }));
        doc.rect(0, 0, W * (i / 30), H, 'F');
      }
      doc.setGState(doc.GState({ opacity: 1 }));

      // === BORDER ===
      // Outer gold border
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(1.5);
      doc.rect(8, 8, W - 16, H - 16);

      // Inner purple border
      doc.setDrawColor(124, 58, 237);
      doc.setLineWidth(0.5);
      doc.rect(11, 11, W - 22, H - 22);

      // Corner decorations
      const corners = [[14, 14], [W - 14, 14], [14, H - 14], [W - 14, H - 14]];
      corners.forEach(([x, y]) => {
        doc.setDrawColor(212, 175, 55);
        doc.setLineWidth(0.8);
        doc.circle(x, y, 3, 'S');
        doc.circle(x, y, 1.5, 'S');
      });

      // === HEADER STRIP ===
      doc.setFillColor(20, 10, 50);
      doc.rect(11, 11, W - 22, 28, 'F');

      // Header text: SafalNiveshak
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(167, 139, 250);
      doc.text('SafalNiveshak', W / 2, 26, { align: 'center' });

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text('FINANCIAL LITERACY PLATFORM  |  सफल निवेशक बनो', W / 2, 34, { align: 'center' });

      // === CERTIFICATE TITLE ===
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(212, 175, 55);
      doc.text('CERTIFICATE OF COMPLETION', W / 2, 62, { align: 'center' });

      // Underline
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.4);
      doc.line(60, 65, W - 60, 65);

      // === AWARDED TO ===
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('This is proudly awarded to', W / 2, 76, { align: 'center' });

      // Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(255, 255, 255);
      doc.text(userName || 'Learner', W / 2, 92, { align: 'center' });

      // === MODULE DETAILS ===
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('for successfully completing', W / 2, 104, { align: 'center' });

      // Module name box
      doc.setFillColor(30, 15, 60);
      doc.setDrawColor(124, 58, 237);
      doc.setLineWidth(0.5);
      doc.roundedRect(W / 2 - 80, 107, 160, 18, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(167, 139, 250);
      const displayName = lang === 'en' ? moduleName : (moduleNameHi || moduleName);
      doc.text(displayName || 'SafalNiveshak Module', W / 2, 118, { align: 'center' });

      // Tier badge
      doc.setFontSize(9);
      doc.setTextColor(52, 211, 153);
      doc.setFont('helvetica', 'normal');
      doc.text(`Level: ${tier}  •  XP Earned: ${xp}  •  100% Offline Verified`, W / 2, 132, { align: 'center' });

      // === DATE & DIVIDER ===
      doc.setDrawColor(50, 40, 80);
      doc.setLineWidth(0.3);
      doc.line(20, 140, W - 20, 140);

      const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 130);
      doc.text(`Date of Completion: ${today}`, W / 2, 148, { align: 'center' });

      // === FOOTER SIGNATURES ===
      // Left
      doc.setDrawColor(70, 60, 100);
      doc.setLineWidth(0.3);
      doc.line(40, 173, 100, 173);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('SafalNiveshak Platform', 70, 179, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 130);
      doc.text('Educational Certification Authority', 70, 184, { align: 'center' });

      // Right
      doc.line(197, 173, 257, 173);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Build With Bharat 2026', 227, 179, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 130);
      doc.text('National Hackathon — Digital India Initiative', 227, 184, { align: 'center' });

      // === QR PLACEHOLDER (static box) ===
      doc.setFillColor(20, 15, 40);
      doc.setDrawColor(80, 60, 120);
      doc.setLineWidth(0.4);
      doc.roundedRect(W / 2 - 14, 152, 28, 28, 2, 2, 'FD');

      // QR pattern (simple grid for visual)
      doc.setFillColor(167, 139, 250);
      const qrPx = 2.2;
      const qrPattern = [
        [1,1,1,1,1,1,1], [1,0,0,0,0,0,1], [1,0,1,1,1,0,1],
        [1,0,1,0,1,0,1], [1,0,1,1,1,0,1], [1,0,0,0,0,0,1], [1,1,1,1,1,1,1]
      ];
      qrPattern.forEach((row, ri) => {
        row.forEach((cell, ci) => {
          if (cell) {
            doc.rect(W / 2 - 13 + ci * qrPx, 153 + ri * qrPx, qrPx - 0.3, qrPx - 0.3, 'F');
          }
        });
      });

      doc.setFontSize(5.5);
      doc.setTextColor(100, 100, 130);
      doc.text('Scan to Verify', W / 2, 183, { align: 'center' });

      // === SEAL watermark ===
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.3);
      doc.circle(W / 2, H / 2, 55, 'S');
      doc.circle(W / 2, H / 2, 53, 'S');
      doc.setGState(doc.GState({ opacity: 0.04 }));
      doc.setFillColor(212, 175, 55);
      doc.circle(W / 2, H / 2, 52, 'F');
      doc.setGState(doc.GState({ opacity: 1 }));

      // Save
      const safeName = (displayName || 'Module').replace(/[^a-z0-9]/gi, '_').substring(0, 30);
      doc.save(`SafalNiveshak_Certificate_${safeName}.pdf`);

      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      console.error('Certificate generation error:', err);
      alert('Could not generate PDF. Please try again.');
    }
    setGenerating(false);
  };

  return (
    <div style={{ display: 'inline-flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
      <button
        onClick={handleDownload}
        disabled={generating}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '10px',
          border: done ? '1px solid rgba(52,211,153,0.5)' : '1px solid rgba(212,175,55,0.4)',
          background: done
            ? 'rgba(16,185,129,0.15)'
            : generating
              ? 'rgba(124,58,237,0.1)'
              : 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(124,58,237,0.15))',
          color: done ? 'rgba(52,211,153,0.9)' : 'rgba(212,175,55,0.9)',
          cursor: generating ? 'wait' : 'pointer',
          fontSize: '0.85rem',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={e => {
          if (!generating) {
            e.currentTarget.style.background = 'rgba(212,175,55,0.25)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(212,175,55,0.2)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = done ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(124,58,237,0.15))';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {generating ? '⏳' : done ? '✅' : '🎓'}
        {generating
          ? (lang === 'en' ? 'Generating...' : 'बन रहा है...')
          : done
            ? (lang === 'en' ? 'Downloaded!' : 'डाउनलोड हो गया!')
            : (lang === 'en' ? 'Download PDF' : 'पीडीएफ डाउनलोड')}
      </button>

      <button
        onClick={handlePrint}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '10px',
          border: '1px solid rgba(74,158,255,0.4)',
          background: 'linear-gradient(135deg, rgba(74,158,255,0.15), rgba(124,58,237,0.15))',
          color: 'rgba(74,158,255,0.9)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(74,158,255,0.25)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(74,158,255,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74,158,255,0.15), rgba(124,58,237,0.15))';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        🖨️ {lang === 'en' ? 'Print Certificate' : 'प्रमाणपत्र प्रिंट करें'}
      </button>

      {/* HIDDEN PRINT CONTAINER */}
      <div className="printable-certificate" style={{ display: 'none' }}>
        <div style={{
          width: '297mm',
          height: '210mm',
          backgroundColor: '#0a0a1a',
          color: '#fff',
          boxSizing: 'border-box',
          padding: '20px',
          border: '15px solid #d4af37',
          borderRadius: '4px',
          position: 'relative',
          fontFamily: 'sans-serif',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ position: 'absolute', top: '15px', left: '15px', border: '2px solid #d4af37', width: '20px', height: '20px', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '15px', right: '15px', border: '2px solid #d4af37', width: '20px', height: '20px', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '15px', left: '15px', border: '2px solid #d4af37', width: '20px', height: '20px', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '15px', right: '15px', border: '2px solid #d4af37', width: '20px', height: '20px', borderRadius: '50%' }} />

          <h1 style={{ color: '#a78bfa', fontSize: '28px', margin: '0 0 5px 0', letterSpacing: '2px' }}>SafalNiveshak</h1>
          <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '3px' }}>FINANCIAL LITERACY PLATFORM</span>
          
          <h2 style={{ color: '#d4af37', fontSize: '36px', margin: '30px 0 10px 0', fontWeight: 'bold' }}>CERTIFICATE OF COMPLETION</h2>
          <div style={{ width: '60%', height: '1px', backgroundColor: '#d4af37', margin: '0 auto 30px' }} />
          
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 10px 0' }}>This is proudly awarded to</p>
          <h3 style={{ fontSize: '32px', color: '#fff', margin: '0 0 20px 0', fontWeight: 'bold' }}>{userName}</h3>
          
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 10px 0' }}>for successfully completing the learning track module</p>
          <h4 style={{ fontSize: '20px', color: '#a78bfa', margin: '0 0 30px 0', fontWeight: 'bold' }}>{lang === 'en' ? moduleName : moduleNameHi} ({tier})</h4>

          <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', marginTop: '20px', fontSize: '12px', color: '#94a3b8' }}>
            <div>
              <span style={{ display: 'block', color: '#d4af37', fontWeight: 'bold' }}>{xp} XP</span>
              <span>SCORE EARNED</span>
            </div>
            <div>
              <span style={{ display: 'block', color: '#fff', fontWeight: 'bold' }}>{new Date().toLocaleDateString('en-IN')}</span>
              <span>DATE OF COMPLETION</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            display: none !important;
          }
          html, body {
            background-color: #0a0a1a !important;
            color: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .printable-certificate, .printable-certificate * {
            display: flex !important;
          }
          .printable-certificate {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            justify-content: center !important;
            align-items: center !important;
            box-sizing: border-box !important;
            background-color: #0a0a1a !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
