import React from 'react';

type BadgeVariant = 'Connected' | 'Expired' | 'Error' | 'Pending';

interface BadgeProps {
  variant: BadgeVariant;
}

export function Badge({ variant }: BadgeProps) {
  const styles: Record<BadgeVariant, React.CSSProperties> = {
    Connected: { background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' },
    Expired: { background: '#FEF9C3', color: '#D97706', border: '1px solid #FEF08A' },
    Error: { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
    Pending: { background: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.125rem 0.5rem',
        borderRadius: '999px',
        fontSize: 'var(--size-xs, 11px)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        fontFamily: 'var(--font)',
        ...styles[variant],
      }}
    >
      {variant}
    </span>
  );
}
