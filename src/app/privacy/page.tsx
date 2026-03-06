import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0b0e] text-white">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-sky-500 rounded-md flex items-center justify-center">
              <span className="text-xs font-bold text-white font-mono">A</span>
            </div>
            <span className="font-semibold tracking-tight">ARIA</span>
          </Link>
          <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 text-white/80">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-white/40 mb-12">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Data We Collect</h2>
            <p className="mb-4">We collect the minimal amount of data necessary to provide the ARIA Control Platform:</p>
            <ul className="list-disc pl-5 space-y-2 text-white/60">
              <li><strong>Account Information:</strong> Email addresses and basic profile information provided during sign-up.</li>
              <li><strong>Credentials:</strong> API keys and OAuth tokens you explicitly connect to the platform.</li>
              <li><strong>Usage Logs:</strong> Metadata about API requests routed through ARIA (timestamps, response codes, latencies). We do NOT log the payload bodies of your proxy requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Zero-Knowledge Encryption</h2>
            <p className="text-white/60">
              ARIA uses AES-256-GCM encryption for all secrets at rest. The raw credentials never leave the secure vault and are only decrypted in memory at the exact moment a proxy request is dispatched. Our infrastructure team cannot read your connected credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Third-Party Sharing</h2>
            <p className="text-white/60">
              We do not sell, rent, or share your data with third parties for marketing purposes. Data is only shared with infrastructure providers (e.g., cloud hosting, email delivery) strictly to operate the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Self-Hosted Data</h2>
            <p className="text-white/60">
              If you use the self-hosted ARIA Core version, all data is stored entirely on your own infrastructure. No telemetry or usage data is sent back to our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Contact</h2>
            <p className="text-white/60">
              For security disclosures or privacy inquiries, contact the founder directly at <strong>hello@aria.dev</strong>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
