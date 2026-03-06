import React from 'react';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      fontFamily: 'var(--font)',
      background: 'var(--bg, #F9FAFB)',
      minHeight: '100vh',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {children}
      </div>
    </div>
  );
}
