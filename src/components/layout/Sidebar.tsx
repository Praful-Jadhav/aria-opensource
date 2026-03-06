'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Connected Tools', href: '/dashboard#tools' }, // Handled via scroll/anchor or active state
    { label: 'API Keys', href: '/api-keys' },
    { label: 'Activity Log', href: '/logs' },
    { label: 'Settings', href: '/settings' },
  ];

  return (
    <aside style={{
      width: '220px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: 'var(--surface, #FFFFFF)',
      borderRight: '1px solid var(--border, #E5E7EB)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font)'
    }}>
      {/* Logo Area */}
      <div style={{ padding: '1.5rem' }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: 'var(--size-md, 16px)', 
          fontWeight: 700, 
          color: 'var(--text, #111827)' 
        }}>
          Control Platform
        </h1>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 1rem' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            // Simplified active check since tools is on dashboard
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/dashboard');
            
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  style={{
                    display: 'block',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm, 4px)',
                    fontSize: 'var(--size-sm, 13px)',
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    color: isActive ? 'var(--text, #111827)' : 'var(--text-muted, #6B7280)',
                    background: isActive ? '#F3F4F6' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--text, #111827)' : '3px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Area */}
      <div style={{ 
        padding: '1.5rem 1rem', 
        borderTop: '1px solid var(--border, #E5E7EB)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {userEmail && (
          <span style={{ 
            fontSize: 'var(--size-xs, 11px)', 
            color: 'var(--text-muted, #6B7280)',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {userEmail}
          </span>
        )}
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            style={{
              width: '100%',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              padding: '0.4rem 0',
              fontSize: 'var(--size-sm, 13px)',
              fontWeight: 500,
              color: 'var(--error, #DC2626)',
              cursor: 'pointer',
              opacity: 0.8,
              transition: 'opacity 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
          >
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
