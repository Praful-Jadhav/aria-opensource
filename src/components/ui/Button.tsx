import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, disabled, style, ...props }, ref) => {
    
    // Base styles
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      borderRadius: 'var(--radius-md, 8px)',
      fontSize: 'var(--size-sm, 13px)',
      fontWeight: 500,
      padding: '0.625rem 1rem',
      transition: 'all 0.15s ease',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.7 : 1,
      fontFamily: 'var(--font)',
      border: 'none',
      ...style,
    };

    // Variant styles mapping
    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        background: 'var(--accent, #111827)',
        color: '#FFFFFF',
      },
      secondary: {
        background: 'var(--surface, #FFFFFF)',
        border: '1px solid var(--border, #E5E7EB)',
        color: 'var(--text, #111827)',
      },
      danger: {
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        color: 'var(--error, #DC2626)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--text-muted, #6B7280)',
      },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{ ...baseStyle, ...variantStyles[variant] }}
        {...props}
      >
        {isLoading && (
          <span style={{ 
            width: '14px', height: '14px', 
            border: '2px solid currentColor', 
            borderRightColor: 'transparent', 
            borderRadius: '50%', 
            animation: 'spin 0.75s linear infinite' 
          }} />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
