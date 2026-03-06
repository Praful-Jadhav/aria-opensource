'use client';

import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  count?: number;
}

export default function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = '0.375rem',
  className = '',
  count = 1,
}: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={`skeleton ${className}`}
          style={{
            width,
            height,
            borderRadius,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            marginBottom: count > 1 && i < count - 1 ? '0.5rem' : undefined,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}

export function SkeletonCard() {
  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: '0.75rem',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
    }}>
      <Skeleton width="40%" height="1.25rem" />
      <div style={{ marginTop: '1rem' }}>
        <Skeleton count={3} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Skeleton height="2.5rem" />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height="3rem" />
      ))}
    </div>
  );
}
