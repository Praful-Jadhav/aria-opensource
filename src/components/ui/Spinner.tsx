import React from 'react';

export function Spinner({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid ${color}`,
        borderRightColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
      }}
    />
  );
}

// Ensure the animation is available globally
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.id = 'spinner-animation';
  style.innerHTML = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  if (!document.getElementById('spinner-animation')) {
    document.head.appendChild(style);
  }
}
