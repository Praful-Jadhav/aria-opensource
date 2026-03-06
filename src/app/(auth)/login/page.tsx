'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { OTPInput } from '@/components/ui/OTPInput';

type AuthStep = 'email' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email'); return; }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/email-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to send code');
      }
      if (data.data?.devOtp) setDevOtp(data.data.devOtp);
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/email-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Invalid code');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/email-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || 'Failed to resend');
      if (data.data?.devOtp) setDevOtp(data.data.devOtp);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background, #09090b)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">⬡</span>
            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground, #fafafa)' }}>
              Control Platform
            </span>
          </div>
          <p style={{ color: 'var(--muted-foreground, #a1a1aa)', fontSize: '0.875rem' }}>
            {step === 'email'
              ? 'Sign in to manage your connected tools'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {/* Card */}
        <div className="glass animate-fade-in-delay-1" style={{
          borderRadius: '12px',
          padding: '2rem',
        }}>
          {step === 'email' ? (
            <form onSubmit={handleSendOtp}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--muted-foreground, #a1a1aa)',
                  marginBottom: '0.5rem',
                }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                autoComplete="email"
                disabled={loading}
              />

              {error && (
                <p style={{ color: 'var(--danger, #ef4444)', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center' }}
              >
                {loading ? (
                  <span style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                ) : 'Send Login Code'}
              </button>
            </form>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <OTPInput length={6} onComplete={handleVerifyOtp} disabled={loading} />
              </div>

              {devOtp && (
                <div style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Dev Mode OTP
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary, #6366f1)', letterSpacing: '0.3em', marginTop: '0.25rem' }}>
                    {devOtp}
                  </div>
                </div>
              )}

              {error && (
                <p style={{ color: 'var(--danger, #ef4444)', fontSize: '0.8125rem', textAlign: 'center', marginBottom: '1rem' }}>
                  {error}
                </p>
              )}

              {loading && (
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <span style={{
                    width: 20, height: 20,
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderTopColor: 'var(--primary, #6366f1)',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => { setStep('email'); setError(null); setDevOtp(null); }}
                  className="btn-outline"
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                  type="button"
                >
                  ← Change email
                </button>
                <button
                  onClick={handleResend}
                  disabled={loading}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary, #6366f1)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                  }}
                  type="button"
                >
                  Resend code
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer links */}
        <div className="animate-fade-in-delay-2" style={{
          textAlign: 'center',
          marginTop: '2rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
        }}>
          <a href="/privacy" style={{ color: 'var(--muted, #71717a)', fontSize: '0.75rem', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ color: 'var(--muted, #71717a)', fontSize: '0.75rem', textDecoration: 'none' }}>Terms</a>
          <a href="/security" style={{ color: 'var(--muted, #71717a)', fontSize: '0.75rem', textDecoration: 'none' }}>Security</a>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
