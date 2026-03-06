import Link from 'next/link';

const integrations = [
  {
    name: 'Google Workspace',
    type: 'OAuth 2.0',
    scopes: 'Gmail, Calendar, Drive (read-only)',
    status: 'Supported',
  },
  {
    name: 'GitHub',
    type: 'OAuth 2.0',
    scopes: 'Repositories, Organizations',
    status: 'Supported',
  },
  {
    name: 'OpenAI',
    type: 'API Key',
    scopes: 'All endpoints',
    status: 'Supported',
  },
  {
    name: 'Google Gemini',
    type: 'API Key',
    scopes: 'All endpoints',
    status: 'Supported',
  },
  {
    name: 'Anthropic Claude',
    type: 'API Key',
    scopes: 'All endpoints',
    status: 'Supported',
  },
  {
    name: 'DeepSeek',
    type: 'API Key',
    scopes: 'All endpoints',
    status: 'Supported',
  },
  {
    name: 'Grok',
    type: 'API Key',
    scopes: 'All endpoints',
    status: 'Supported',
  },
  {
    name: 'Custom Provider',
    type: 'API Key',
    scopes: 'Configurable',
    status: 'Supported',
  },
];

export default function IntegrationsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#09090b', fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #18181b' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.25rem' }}>⬡</span>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fafafa' }}>Control Platform</span>
        </Link>
      </header>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '4rem 2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa', margin: '0 0 0.5rem' }}>Integrations</h1>
        <p style={{ color: '#71717a', fontSize: '0.8125rem', margin: '0 0 2rem' }}>
          Supported OAuth connections and API key providers.
        </p>

        <div style={{ borderRadius: '0.75rem', border: '1px solid #27272a', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 0.75fr',
            padding: '0.75rem 1.25rem', background: '#0a0a0c',
            borderBottom: '1px solid #27272a',
          }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Provider</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scopes</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
          </div>

          {/* Rows */}
          {integrations.map((item, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 0.75fr',
              padding: '0.75rem 1.25rem',
              borderBottom: i < integrations.length - 1 ? '1px solid #1a1a1e' : 'none',
            }}>
              <span style={{ fontSize: '0.8125rem', color: '#fafafa', fontWeight: 500 }}>{item.name}</span>
              <span style={{ fontSize: '0.8125rem', color: '#a1a1aa' }}>{item.type}</span>
              <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{item.scopes}</span>
              <span style={{
                fontSize: '0.6875rem', fontWeight: 600, color: '#86efac',
                background: 'rgba(34, 197, 94, 0.1)',
                padding: '0.125rem 0.5rem', borderRadius: '9999px',
                display: 'inline-block', textAlign: 'center',
                width: 'fit-content',
              }}>{item.status}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
