export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white overflow-hidden">
      {/* ── Navigation ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center font-bold text-black text-sm">
              R
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Retro<span className="text-yellow-500">Grade</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-white transition-colors">
              Preview
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/demo"
              className="text-sm text-neutral-400 hover:text-white transition-colors hidden sm:block"
            >
              Try Demo
            </a>
            <a
              href="/analyze"
              className="bg-yellow-500 text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-colors"
            >
              Get Report
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 radial-gradient-overlay">
        <div className="bg-grid-pattern absolute inset-0 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-sm text-yellow-400 font-medium">
              AI-Powered Competitive Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up animation-delay-100 text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Know Your Competition
            <br />
            <span className="gradient-text">Before They Know You</span>
          </h1>

          {/* Sub-headline */}
          <p className="animate-fade-in-up animation-delay-200 text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Get an AI-generated competitive intelligence report for your restaurant
            in minutes. Analyze threats, uncover SEO opportunities, and receive
            actionable strategies to outperform your competition.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up animation-delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/analyze"
              className="animate-pulse-glow bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Get Your Report</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="/demo"
              className="border border-neutral-700 text-neutral-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-neutral-500 hover:text-white transition-colors inline-flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>View Demo Report</span>
            </a>
          </div>

          {/* Trust signal */}
          <p className="animate-fade-in animation-delay-500 mt-8 text-sm text-neutral-500">
            No sign-up required. Enter your restaurant name and get results.
          </p>
        </div>
      </section>

      {/* ── Stats Strip ─────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-neutral-900/50">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "500+", label: "Restaurants Analyzed" },
            { value: "15K+", label: "Competitors Tracked" },
            { value: "4.8/5", label: "Avg Report Rating" },
            { value: "<2 min", label: "Report Generation" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-yellow-400">{stat.value}</p>
              <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-yellow-500 font-semibold mb-3">
              Simple Process
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Three Steps to Market Dominance
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Enter Your Restaurant",
                description:
                  "Provide your restaurant name and city. Our AI locates your business and identifies all competitors within a 7km radius.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "AI Analyzes Everything",
                description:
                  "We pull Google Maps data, calculate threat scores, analyze sentiment, and generate SEO keyword clusters using GPT-4.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Get Actionable Report",
                description:
                  "Receive a comprehensive dashboard with threat maps, competitor breakdowns, keyword strategy, and a strategic verdict.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-8 hover:border-yellow-500/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500/20 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">
                    Step {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-neutral-400 leading-relaxed text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28 bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-yellow-500 font-semibold mb-3">
              What You Get
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything You Need to Win
            </h2>
            <p className="text-neutral-400 mt-4 max-w-xl mx-auto">
              Every report is packed with data-driven insights specifically tailored
              to your restaurant and local market.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "Threat Score Index",
                description:
                  "Each competitor gets a 0-100 threat score based on rating, review volume, and proximity to your location.",
                color: "text-red-400",
                bgColor: "bg-red-500/10 border-red-500/20",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ),
              },
              {
                title: "Competitor Deep Dive",
                description:
                  "Strengths, weaknesses, sentiment analysis, and keyword clusters for your top 5 competitors.",
                color: "text-blue-400",
                bgColor: "bg-blue-500/10 border-blue-500/20",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
              },
              {
                title: "SEO Keyword Strategy",
                description:
                  "AI-generated keyword clusters to help you dominate local search and drive organic discovery.",
                color: "text-emerald-400",
                bgColor: "bg-emerald-500/10 border-emerald-500/20",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                  </svg>
                ),
              },
              {
                title: "Threat Radar Map",
                description:
                  "Visual radar chart plotting all competitors by threat level so you can see the landscape at a glance.",
                color: "text-purple-400",
                bgColor: "bg-purple-500/10 border-purple-500/20",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                ),
              },
              {
                title: "Revenue Impact Analysis",
                description:
                  "Estimated monthly revenue at risk and recovery opportunity based on your competitive position.",
                color: "text-yellow-400",
                bgColor: "bg-yellow-500/10 border-yellow-500/20",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                ),
              },
              {
                title: "Strategic Verdict",
                description:
                  "A final executive-level strategic verdict with specific, actionable recommendations for your restaurant.",
                color: "text-orange-400",
                bgColor: "bg-orange-500/10 border-orange-500/20",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                ),
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-7 hover:border-white/10 transition-all duration-300 group"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${feature.bgColor} border flex items-center justify-center ${feature.color} mb-5`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Report Preview ──────────────────────────────────────────── */}
      <section id="preview" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-yellow-500 font-semibold mb-3">
              Sample Output
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              See What a Report Looks Like
            </h2>
            <p className="text-neutral-400 mt-4 max-w-xl mx-auto">
              Here&apos;s a snapshot from a demo report for &quot;Spice Garden&quot; in Bandra
              West, Mumbai.
            </p>
          </div>

          {/* Mock report preview */}
          <div className="glass-card rounded-2xl p-1 max-w-4xl mx-auto">
            <div className="rounded-xl bg-neutral-950 p-6 md:p-10 space-y-6">
              {/* Mock header */}
              <div className="flex items-end justify-between border-b border-neutral-800 pb-6">
                <div>
                  <p className="text-xs text-yellow-500 font-semibold uppercase tracking-widest mb-1">
                    Competitive Intelligence Report
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold">Spice Garden</h3>
                  <p className="text-neutral-500 text-sm mt-1">Bandra West, Mumbai</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-neutral-500">Overall Threat Level</p>
                  <p className="text-xl font-semibold text-yellow-400">Moderate-High</p>
                </div>
              </div>

              {/* Mock KPIs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <p className="text-xs text-neutral-500 mb-1">Threat Index</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    71<span className="text-sm text-neutral-600">/100</span>
                  </p>
                </div>
                <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-4">
                  <p className="text-xs text-neutral-500 mb-1">Revenue at Risk</p>
                  <p className="text-2xl font-bold text-red-400">$48K</p>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-xl p-4">
                  <p className="text-xs text-neutral-500 mb-1">Recovery Opp.</p>
                  <p className="text-2xl font-bold text-emerald-400">$85K</p>
                </div>
              </div>

              {/* Mock competitor bars */}
              <div>
                <p className="text-sm font-semibold mb-3 text-neutral-300">Top Competitors by Threat</p>
                <div className="space-y-2.5">
                  {[
                    { name: "The Bombay Canteen", score: 88, color: "bg-red-500" },
                    { name: "Bastian", score: 83, color: "bg-red-500" },
                    { name: "Pali Village Cafe", score: 74, color: "bg-yellow-500" },
                    { name: "Smoke House Deli", score: 63, color: "bg-yellow-500" },
                    { name: "Sequel", score: 58, color: "bg-green-500" },
                  ].map((comp, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-neutral-400 w-40 truncate">{comp.name}</span>
                      <div className="flex-1 h-3 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${comp.color} rounded-full`}
                          style={{ width: `${comp.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-neutral-300 w-8 text-right">
                        {comp.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blur overlay with CTA */}
              <div className="relative pt-4">
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent z-10 flex items-end justify-center pb-6">
                  <a
                    href="/demo"
                    className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors text-sm"
                  >
                    View Full Demo Report
                  </a>
                </div>
                <div className="opacity-30 blur-[2px] space-y-3 pointer-events-none">
                  <div className="h-4 bg-neutral-800 rounded w-3/4" />
                  <div className="h-4 bg-neutral-800 rounded w-full" />
                  <div className="h-4 bg-neutral-800 rounded w-5/6" />
                  <div className="h-4 bg-neutral-800 rounded w-2/3" />
                  <div className="h-4 bg-neutral-800 rounded w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials / Social Proof ─────────────────────────────── */}
      <section className="py-20 md:py-28 bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-yellow-500 font-semibold mb-3">
              Trusted by Restaurateurs
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              What Restaurant Owners Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "We had no idea two new competitors opened within 2km of us. RetroGrade's report helped us react before we lost customers.",
                name: "Priya M.",
                role: "Owner, Tandoor Tales",
                city: "Koramangala, Bangalore",
              },
              {
                quote:
                  "The SEO keyword clusters alone were worth it. We started ranking for 'best biryani near me' within weeks of optimizing our profile.",
                name: "Arjun S.",
                role: "Co-founder, Biryani Blues",
                city: "Indiranagar, Bangalore",
              },
              {
                quote:
                  "The threat score system is brilliant. It quantifies what we always felt intuitively about our competition.",
                name: "Meera K.",
                role: "Manager, The Coastal Kitchen",
                city: "Bandra, Mumbai",
              },
            ].map((testimonial, i) => (
              <div key={i} className="glass-card rounded-2xl p-7">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg
                      key={j}
                      className="w-4 h-4 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-neutral-300 text-sm leading-relaxed mb-5">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-neutral-500">
                    {testimonial.role} &mdash; {testimonial.city}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 radial-gradient-overlay relative">
        <div className="bg-grid-pattern absolute inset-0 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to Outsmart
            <br />
            <span className="gradient-text">Your Competition?</span>
          </h2>
          <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
            Get a detailed competitive intelligence report for your restaurant.
            No sign-up, no credit card. Just enter your restaurant name.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/analyze"
              className="animate-pulse-glow bg-yellow-500 text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors"
            >
              Generate My Report
            </a>
            <a
              href="/demo"
              className="border border-neutral-700 text-neutral-300 px-10 py-4 rounded-xl font-semibold text-lg hover:border-neutral-500 hover:text-white transition-colors"
            >
              See Demo First
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-yellow-500 flex items-center justify-center font-bold text-black text-xs">
                R
              </div>
              <span className="font-semibold tracking-tight">
                Retro<span className="text-yellow-500">Grade</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <a href="/analyze" className="hover:text-neutral-300 transition-colors">
                Get Report
              </a>
              <a href="/demo" className="hover:text-neutral-300 transition-colors">
                Demo
              </a>
            </div>
            <p className="text-xs text-neutral-600">
              &copy; 2026 RetroGrade AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
