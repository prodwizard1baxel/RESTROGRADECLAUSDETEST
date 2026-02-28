import Link from "next/link";

export const metadata = {
  title: "Contact Us – RetroGrade",
  description: "Get in touch with the RetroGrade team.",
};

export default function ContactUs() {
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Contact Us</h1>
        <p className="text-sm text-slate-400 mb-12">We&apos;d love to hear from you. Reach out with any questions, feedback, or support requests.</p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Get in Touch</h2>
              <p className="text-sm text-slate-600 leading-relaxed">Whether you have a question about our reports, need help with your account, or want to explore partnership opportunities, our team is here to help.</p>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Email</p>
                  <a href="mailto:support@retrograde.app" className="text-sm text-emerald-600 hover:underline">support@retrograde.app</a>
                  <p className="text-xs text-slate-400 mt-1">We typically respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Business Hours</p>
                  <p className="text-sm text-slate-600">Monday – Friday: 9:00 AM – 6:00 PM IST</p>
                  <p className="text-xs text-slate-400 mt-1">Excluding public holidays</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Location</p>
                  <p className="text-sm text-slate-600">Mumbai, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Topics */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">How Can We Help?</h2>

            <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-sm transition-all">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">General Inquiries</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Questions about our platform, features, or how RetroGrade can help your restaurant business.</p>
              <a href="mailto:support@retrograde.app?subject=General%20Inquiry" className="text-xs text-emerald-600 hover:underline mt-2 inline-block">Send an email &rarr;</a>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-sm transition-all">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Technical Support</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Having trouble with your report, account, or a technical issue? We&apos;re here to help.</p>
              <a href="mailto:support@retrograde.app?subject=Technical%20Support" className="text-xs text-emerald-600 hover:underline mt-2 inline-block">Get support &rarr;</a>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-sm transition-all">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Billing &amp; Subscriptions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Questions about your subscription plan, payments, invoices, or refund requests.</p>
              <a href="mailto:support@retrograde.app?subject=Billing%20Inquiry" className="text-xs text-emerald-600 hover:underline mt-2 inline-block">Billing help &rarr;</a>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-sm transition-all">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Partnerships &amp; Business</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Interested in partnering with RetroGrade or exploring enterprise solutions?</p>
              <a href="mailto:support@retrograde.app?subject=Partnership%20Inquiry" className="text-xs text-emerald-600 hover:underline mt-2 inline-block">Let&apos;s talk &rarr;</a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">&copy; 2026 RetroGrade. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-slate-400 hover:text-emerald-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-slate-400 hover:text-emerald-600 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="text-xs text-slate-400 hover:text-emerald-600 transition-colors font-semibold">Contact Us</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
