import React, { useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        padding: '1rem',
        fontFamily: 'var(--font)',
      }}
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border, #E5E7EB)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{ margin: 0, fontSize: 'var(--size-md, 16px)', fontWeight: 600, color: 'var(--text, #111827)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted, #6B7280)', fontSize: '1.2rem',
                lineHeight: 1, padding: '0.25rem',
              }}
            >
              &times;
            </button>
          </div>
          
          {/* Body */}
          <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div style={{
              padding: '1rem 1.5rem',
              background: '#F9FAFB',
              borderTop: '1px solid var(--border, #E5E7EB)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}>
              {footer}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
