import Link from 'next/link';

export default function SecurityPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#09090b', fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #18181b' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.25rem' }}>⬡</span>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fafafa' }}>Control Platform</span>
        </Link>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '4rem 2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa', margin: '0 0 2rem' }}>Security</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#e4e4e7', margin: '0 0 0.5rem' }}>Encryption</h2>
            <p style={{ color: '#71717a', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
              All sensitive data is encrypted at rest using AES-256-GCM. OAuth tokens, API keys, and external credentials are encrypted before storage. Decryption occurs only in-memory during request execution.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#e4e4e7', margin: '0 0 0.5rem' }}>Session Management</h2>
            <p style={{ color: '#71717a', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
              Sessions use JWT tokens stored in httpOnly, secure cookies with SameSite protection. Sessions are server-validated with device tracking. Tokens expire after 7 days and can be invalidated immediately via logout.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#e4e4e7', margin: '0 0 0.5rem' }}>Authentication</h2>
            <p style={{ color: '#71717a', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
              Authentication supports Google OAuth 2.0, GitHub OAuth, email OTP, and phone OTP. No passwords are stored. OTP codes are bcrypt-hashed, expire in 5 minutes, and are rate-limited to 3 attempts per 10-minute window.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#e4e4e7', margin: '0 0 0.5rem' }}>CSRF Protection</h2>
            <p style={{ color: '#71717a', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
              All mutating API requests are protected against cross-origin forgery by validating the Origin header against the Host header.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#e4e4e7', margin: '0 0 0.5rem' }}>Error Handling</h2>
            <p style={{ color: '#71717a', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
              Internal errors are logged server-side with structured context. Users receive generic error messages. Stack traces and internal details are never exposed.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
