import React from 'react';

export function Card({ children, style, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--surface, #FFFFFF)',
        border: '1px solid var(--border, #E5E7EB)',
        borderRadius: 'var(--radius-md, 8px)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
        fontFamily: 'var(--font)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
