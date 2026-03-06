import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, style, ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
        {label && (
          <label style={{ 
            fontSize: 'var(--size-sm, 13px)', 
            fontWeight: 500, 
            color: 'var(--text, #111827)' 
          }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          style={{
            padding: '0.625rem 0.75rem',
            borderRadius: 'var(--radius-md, 8px)',
            border: `1px solid ${error ? 'var(--error, #DC2626)' : 'var(--border, #E5E7EB)'}`,
            background: 'var(--surface, #FFFFFF)',
            fontSize: 'var(--size-base, 14px)',
            color: 'var(--text, #111827)',
            outline: 'none',
            fontFamily: 'var(--font)',
            transition: 'border-color 0.15s ease',
            ...style
          }}
          onFocus={(e) => {
            if (!error) e.target.style.borderColor = 'var(--border-focus, #6B7280)';
          }}
          onBlur={(e) => {
            if (!error) e.target.style.borderColor = 'var(--border, #E5E7EB)';
          }}
          {...props}
        />
        {error && (
          <span style={{ fontSize: 'var(--size-xs, 11px)', color: 'var(--error, #DC2626)' }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
