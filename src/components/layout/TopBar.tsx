import React from 'react';

export function TopBar({ title }: { title: string }) {
  return (
    <header style={{
      height: '64px',
      background: 'var(--surface, #FFFFFF)',
      borderBottom: '1px solid var(--border, #E5E7EB)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem',
      fontFamily: 'var(--font)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <h2 style={{ 
        margin: 0, 
        fontSize: 'var(--size-lg, 20px)', 
        fontWeight: 600, 
        color: 'var(--text, #111827)' 
      }}>
        {title}
      </h2>
    </header>
  );
}
