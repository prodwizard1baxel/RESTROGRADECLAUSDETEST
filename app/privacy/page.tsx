import Link from "next/link";

export const metadata = {
  title: "Privacy Policy – RetroGrade",
  description: "Privacy Policy for the RetroGrade platform.",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">R</div>
            <span className="font-semibold text-lg tracking-tight text-slate-800">Retro<span className="text-emerald-600">Grade</span></span>
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-emerald-600 transition-colors">&larr; Back to Home</Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-12">Last updated: February 27, 2026</p>

        <div className="space-y-10 text-slate-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Introduction</h2>
            <p>RetroGrade (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our competitive intelligence platform for restaurants (&quot;the Service&quot;).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">2. Information We Collect</h2>
            <h3 className="font-semibold text-slate-700 mb-2 mt-4">2.1 Information You Provide</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Information:</strong> When you sign in via Google authentication, we receive your name, email address, and profile picture.</li>
              <li><strong>Restaurant Data:</strong> The restaurant name and location you submit for analysis.</li>
              <li><strong>Payment Information:</strong> Billing details processed securely by Stripe. We do not store your full credit card information on our servers.</li>
            </ul>

            <h3 className="font-semibold text-slate-700 mb-2 mt-4">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform, and interaction patterns.</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device type, and screen resolution.</li>
              <li><strong>Cookies:</strong> We use essential cookies for authentication and session management.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and maintain the Service, including generating competitive analysis reports.</li>
              <li>To process transactions and manage your subscription.</li>
              <li>To authenticate your identity and secure your account.</li>
              <li>To communicate with you about updates, features, and support.</li>
              <li>To improve and optimize the Service based on usage patterns.</li>
              <li>To comply with legal obligations and enforce our Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">4. Data Sources</h2>
            <p>Our reports are generated using publicly available data from sources including:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Google Maps and Google Places API (reviews, ratings, business information).</li>
              <li>Other publicly accessible restaurant data and review platforms.</li>
            </ul>
            <p className="mt-2">We analyze up to 2 years of historic data to provide competitive intelligence insights.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">5. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Service Providers:</strong> Third-party services that help us operate the platform (e.g., Stripe for payments, Google for authentication, hosting providers).</li>
              <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">6. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your data, including:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Encrypted data transmission (HTTPS/TLS).</li>
              <li>Secure authentication via NextAuth.js and Google OAuth.</li>
              <li>Regular security reviews and updates.</li>
              <li>Access controls limiting data access to authorized personnel only.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">7. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide the Service. Generated reports are stored for your continued access. You may request deletion of your account and associated data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">8. Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data.</li>
              <li><strong>Portability:</strong> Request your data in a structured, machine-readable format.</li>
              <li><strong>Objection:</strong> Object to certain processing of your personal data.</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, please contact us through our <Link href="/contact" className="text-emerald-600 hover:underline">Contact Page</Link>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">9. Cookies</h2>
            <p>We use the following types of cookies:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Essential Cookies:</strong> Required for authentication and core platform functionality.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service to improve it.</li>
            </ul>
            <p className="mt-2">You can control cookie preferences through your browser settings. Disabling essential cookies may affect the functionality of the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">10. Third-Party Services</h2>
            <p>The Service integrates with third-party services that have their own privacy policies:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Google:</strong> For authentication and Maps/Places API data.</li>
              <li><strong>Stripe:</strong> For payment processing.</li>
              <li><strong>Vercel:</strong> For hosting and infrastructure.</li>
            </ul>
            <p className="mt-2">We encourage you to review the privacy policies of these third-party services.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">11. Children&apos;s Privacy</h2>
            <p>The Service is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we learn that we have collected data from a child, we will take steps to delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">12. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by updating the &quot;Last updated&quot; date and, where appropriate, providing additional notice. Your continued use of the Service after changes are posted constitutes your acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">13. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:</p>
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="font-semibold text-slate-700">RetroGrade</p>
              <p>Email: <a href="mailto:support@retrograde.app" className="text-emerald-600 hover:underline">support@retrograde.app</a></p>
              <p>Visit our <Link href="/contact" className="text-emerald-600 hover:underline">Contact Page</Link></p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">&copy; 2026 RetroGrade. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-slate-400 hover:text-emerald-600 transition-colors font-semibold">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-slate-400 hover:text-emerald-600 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="text-xs text-slate-400 hover:text-emerald-600 transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
