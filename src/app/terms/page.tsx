import Link from 'next/link';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-white/40 mb-12">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-white/60">
              By accessing the ARIA Control Platform (the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-white/60">
              ARIA is a centralized control plane for managing API keys, OAuth connections, and proxying HTTP requests securely. We provide both a managed cloud service and a self-hosted open-source version.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Account Responsibilities</h2>
            <p className="mb-4 text-white/60">
              You are entirely responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/60">
              <li>Maintaining the security of your account, including OTP codes.</li>
              <li>All activities that occur under your account and the usage of your proxy endpoints.</li>
              <li>Ensuring the credentials you store belong to you and their usage complies with the respective third-party terms of service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Acceptable Use</h2>
            <p className="text-white/60">
              You agree not to use the Service to route malicious traffic, conduct denial-of-service attacks, bypass third-party rate limits illegitimately, or violate the API terms of the services you connect. Abuse of the proxy infrastructure will result in immediate termination of your account without a refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Payments and Refunds</h2>
            <p className="text-white/60">
              Paid plans are billed monthly via UPI. We offer a 14-day no-questions-asked refund policy for your first payment. If you cancel your subscription, you will retain access to the paid features until the end of your billing cycle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Disclaimer of Warranties</h2>
            <p className="text-white/60">
              The Service is provided &quot;AS IS&quot; without warranties of any kind. While we guarantee 99.5% uptime for Scale plan customers, the underlying third-party APIs you connect may experience their own outages, which are outside our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Governing Law</h2>
            <p className="text-white/60">
              These Terms shall be governed by the laws of India, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Contact</h2>
            <p className="text-white/60">
              Questions about the Terms of Service should be sent to <strong>hello@aria.dev</strong>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
