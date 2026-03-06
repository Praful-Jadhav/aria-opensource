import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0e] text-white selection:bg-sky-500/30 font-sans flex flex-col items-center">
      {/* 1. Navigation */}
      <nav className="w-full border-b border-white/[0.04] px-6 py-4 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-sky-500 rounded-md flex items-center justify-center">
            <span className="text-xs font-bold text-white font-mono">A</span>
          </div>
          <span className="font-semibold tracking-tight">ARIA</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm text-white/50">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="https://github.com/AriaPlatform/aria-core" className="hover:text-white transition-colors">GitHub</Link>
          </div>
          <Link href="/login" className="text-sm px-4 py-1.5 rounded-md border border-white/10 hover:border-white/20 transition-all text-white/80 hover:text-white">
            Sign In
          </Link>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl px-6">
        {/* 2. Hero Section */}
        <section className="pt-32 pb-24 flex flex-col items-center text-center relative">
          {/* Subtle gradient mesh background */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/5 text-sky-400 text-xs font-mono mb-8 animate-fade-in-delay-1" style={{ animationDelay: '0.1s' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Open source · MIT License
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-white/90 animate-fade-in-delay-1" style={{ animationDelay: '0.2s' }}>
            One hub for all your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-600">tool connections.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mb-10 leading-relaxed animate-fade-in-delay-1" style={{ animationDelay: '0.3s' }}>
            Connect GitHub, Google Workspace, and any REST API through a single encrypted proxy. 
            Every credential sealed. Every request logged.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-delay-1" style={{ animationDelay: '0.4s' }}>
            <Link href="https://github.com/AriaPlatform/aria-core" className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-all hover:-translate-y-0.5 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              Deploy Free →
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-white/10 hover:border-white/20 text-white/80 font-medium transition-colors">
              See pricing
            </Link>
          </div>
          
          {/* Terminal snippet */}
          <div className="mt-16 w-full max-w-2xl rounded-xl border border-white/[0.06] bg-[#0d1117] overflow-hidden text-left animate-fade-in-delay-1 shadow-2xl" style={{ animationDelay: '0.5s' }}>
            <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.04] flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="ml-2 text-[10px] font-mono text-white/30">bash</div>
            </div>
            <div className="p-4 font-mono text-xs md:text-sm text-white/70 leading-relaxed overflow-x-auto">
              <div><span className="text-sky-400">git clone</span> https://github.com/AriaPlatform/aria-core.git aria</div>
              <div><span className="text-sky-400">cd</span> aria && <span className="text-sky-400">cp</span> .env.template .env</div>
              <div><span className="text-sky-400">npm</span> install && <span className="text-sky-400">npm</span> run dev</div>
            </div>
          </div>
        </section>

        {/* 3. Problem Section */}
        <section className="py-24 border-t border-white/[0.04]">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-white/90 mb-3">Credentials everywhere</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                API keys scattered in .env files across multiple repos. OAuth refresh tokens sitting in separate databases.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-white/90 mb-3">No unified audit trail</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                When an integration breaks, you don&apos;t know what called what, when, and with which specific credentials.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-white/90 mb-3">Different auth per tool</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Every external service requires its own unique authentication logic, error handling, and manual retry mechanisms.
              </p>
            </div>
          </div>
        </section>

        {/* 4. How it works */}
        <section className="py-24 border-t border-white/[0.04]">
          <h2 className="text-3xl font-bold tracking-tight mb-16 text-center text-white/90">How ARIA solves this</h2>
          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="grid md:grid-cols-3 gap-12 text-center relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#0a0b0e] border border-white/20 flex items-center justify-center text-white/80 font-mono mb-6">01</div>
                <h3 className="text-lg font-semibold text-white/90 mb-3">Connect</h3>
                <p className="text-sm text-white/50 leading-relaxed max-w-xs px-4">
                  Add OAuth tools or API keys once. They are encrypted at rest with AES-256-GCM in the secure vault.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#0a0b0e] border border-sky-500/40 text-sky-400 flex items-center justify-center font-mono mb-6 shadow-[0_0_15px_rgba(14,165,233,0.15)]">02</div>
                <h3 className="text-lg font-semibold text-white/90 mb-3">Route</h3>
                <p className="text-sm text-white/50 leading-relaxed max-w-xs px-4">
                  Call the ARIA proxy endpoint. We handle injecting the right credentials, refreshing tokens, and rate limits.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#0a0b0e] border border-white/20 flex items-center justify-center text-white/80 font-mono mb-6">03</div>
                <h3 className="text-lg font-semibold text-white/90 mb-3">Monitor</h3>
                <p className="text-sm text-white/50 leading-relaxed max-w-xs px-4">
                  See every request, error, and timeout across all your services in a single unified dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Features Grid */}
        <section id="features" className="py-24 border-t border-white/[0.04]">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'AES-256-GCM Encryption', desc: 'Enterprise-grade encryption for all secrets at rest. Raw credentials never leave the vault.' },
              { title: 'OAuth 2.0 Support', desc: 'Native OAuth flows for Google Workspace, GitHub, and other major platforms built-in.' },
              { title: 'JWT Sessions', desc: 'Stateless, secure session management for your users with automatic rotation.' },
              { title: 'Automatic Token Refresh', desc: 'ARIA handles OAuth token expiration behind the scenes before your requests fail.' },
              { title: 'Rate Limiting', desc: 'Protect your downstream APIs with configurable rate limits per credential.' },
              { title: 'Full Audit Logging', desc: 'Granular logs of who accessed what, when, and the HTTP status of every proxy call.' }
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] hover:-translate-y-0.5 transition-all">
                <h3 className="text-[15px] font-medium text-white/80 mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Pricing Teaser */}
        <section className="py-24 border-t border-white/[0.04] text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-6 text-white/90">Ready for production</h2>
          <p className="text-white/50 max-w-xl mx-auto mb-8">
            Start free, upgrade when your team grows. Self-hosted is always free.
          </p>
          <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 font-medium hover:bg-sky-500/20 transition-colors">
            View Pricing Plans →
          </Link>
        </section>

        {/* 7. OSS Callout */}
        <section className="py-24 border-t border-white/[0.04] flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-white/[0.02] border border-white/[0.05] mb-6">
            <svg className="w-8 h-8 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Built in the open.</h2>
          <p className="text-white/50 max-w-md mb-8">
            The core engine is MIT licensed. Self-host with 3 commands. No vendor lock-in, ever.
          </p>
          <a href="https://github.com/AriaPlatform/aria-core" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 text-sm font-medium transition-colors font-mono inline-flex items-center gap-2">
            View on GitHub <span className="opacity-50">↗</span>
          </a>
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="w-full border-t border-white/[0.04] py-8 px-6 mt-16 text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Praful Jadhav · ARIA Control Platform</p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-white/40">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="https://github.com/AriaPlatform/aria-core" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
