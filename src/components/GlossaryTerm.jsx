import React, { useState } from 'react';
import { glossary } from '../data/lessons';

export default function GlossaryTerm({ term, children }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const matched = glossary.find(g => g.term.toLowerCase() === term.toLowerCase());
  if (!matched) {
    return <span>{children || term}</span>;
  }

  return (
    <span 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        style={{
          background: 'none',
          border: 'none',
          borderBottom: '1px dotted var(--color-amber)',
          color: 'var(--text-primary)',
          cursor: 'help',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontWeight: '600',
          padding: '0 2px',
          display: 'inline'
        }}
        aria-label={`Glossary definition for ${term}`}
      >
        {children || term}
      </button>

      {showTooltip && (
        <span style={{
          position: 'absolute',
          bottom: '125%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--bg-surface-light)',
          border: '1px solid var(--color-amber)',
          borderRadius: '4px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          color: 'var(--text-primary)',
          padding: '12px',
          width: '240px',
          zIndex: 10,
          fontSize: '0.8rem',
          lineHeight: '1.4',
          textAlign: 'left',
          pointerEvents: 'none'
        }}>
          {/* Tooltip triangle */}
          <span style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            marginLeft: '-5px',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: 'var(--color-amber) transparent transparent transparent'
          }}></span>
          
          <strong style={{ display: 'block', color: 'var(--color-amber)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
            {matched.term}
          </strong>
          <span style={{ display: 'block', marginBottom: '6px' }}>
            {matched.defEn}
          </span>
          <span style={{ display: 'block', borderTop: '1px dotted var(--border-color)', paddingTop: '4px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            {matched.defHi}
          </span>
        </span>
      )}
    </span>
  );
}
