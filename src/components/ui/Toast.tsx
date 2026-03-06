'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const styles: Record<ToastType, React.CSSProperties> = {
    success: { background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' },
    error: { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
    info: { background: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' },
  };

  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md, 8px)',
        fontSize: 'var(--size-sm, 13px)',
        fontWeight: 500,
        pointerEvents: 'auto',
        fontFamily: 'var(--font)',
        boxShadow: 'var(--shadow-md, 0 4px 6px rgba(0,0,0,0.07))',
        animation: 'slideIn 0.3s ease forwards',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        minWidth: '280px',
        ...styles[toast.type],
      }}
    >
      <span>{toast.message}</span>
      <button
        onClick={onRemove}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          opacity: 0.7,
        }}
      >
        &times;
      </button>

      {/* Slide-in animation style */}
      <style suppressHydrationWarning>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
