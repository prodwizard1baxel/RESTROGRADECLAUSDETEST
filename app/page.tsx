"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Scroll-reveal hook ────────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ─── Animated counter hook ─────────────────────────────────────────── */
function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return count;
}

/* ─── Reveal wrapper ────────────────────────────────────────────────── */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0)" : "translate3d(0,40px,0)",
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────── */
function StatCard({
  value,
  suffix,
  prefix,
  label,
  delay,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  delay: number;
}) {
  const { ref, visible } = useReveal();
  const count = useCounter(value, 2000, visible);

  return (
    <div ref={ref} className="text-center group" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-4xl md:text-5xl font-bold text-slate-900 tabular-nums tracking-tight transition-transform duration-300 group-hover:scale-110">
        {prefix}
        {count}
        {suffix}
      </p>
      <p className="text-sm text-slate-400 mt-2 tracking-wide">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-800 overflow-hidden">
      {/* ── Navigation ──────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-2xl border-b border-slate-200 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-green-200 group-hover:shadow-green-300 transition-shadow duration-300">
              R
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-800">
              Retro<span className="text-green-600">Grade</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-500">
            {[
              { label: "How It Works", id: "how-it-works" },
              { label: "Features", id: "features" },
              { label: "Preview", id: "preview" },
              { label: "Testimonials", id: "testimonials" },
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollTo(e, link.id)}
                className="relative hover:text-slate-800 transition-colors duration-200 py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/demo"
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block"
            >
              Try Demo
            </a>
            <a
              href="/analyze"
              className="cta-primary bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-px"
            >
              Get Report
            </a>

            <button
              className="md:hidden ml-1 p-2 text-slate-500 hover:text-slate-800"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileNavOpen ? "max-h-64 border-b border-slate-200" : "max-h-0"
          }`}
        >
          <div className="px-6 py-4 flex flex-col gap-3 bg-white/95 backdrop-blur-2xl">
            {["how-it-works", "features", "preview", "testimonials"].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => scrollTo(e, id)}
                className="text-slate-500 hover:text-slate-800 transition-colors text-sm capitalize py-1"
              >
                {id.replace(/-/g, " ")}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />

        <div className="absolute top-20 left-[10%] w-72 h-72 bg-green-100/60 rounded-full blur-[100px] animate-float pointer-events-none" />
        <div className="absolute top-40 right-[5%] w-96 h-96 bg-teal-100/40 rounded-full blur-[120px] animate-float-delayed pointer-events-none" />
        <div className="absolute bottom-0 left-[40%] w-80 h-80 bg-slate-100/50 rounded-full blur-[100px] animate-float-slow pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="animate-fade-in-up inline-flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-full px-5 py-2 mb-8 hover:bg-green-100 transition-colors duration-300 cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-sm text-green-700 font-medium tracking-wide">
              AI Restaurant Growth Engine
            </span>
          </div>

          <h1 className="animate-fade-in-up animation-delay-100 text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-7 text-slate-900">
            Know Your Competition
            <br />
            <span className="gradient-text-animated">Before They Know You</span>
          </h1>

          <p className="animate-fade-in-up animation-delay-200 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Get an AI-generated competitive intelligence report for your restaurant
            in minutes. Analyze threats, uncover SEO opportunities, and receive
            actionable strategies to outperform every competitor nearby.
          </p>

          <div className="animate-fade-in-up animation-delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/analyze"
              className="cta-hero group cta-gradient text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all duration-300 inline-flex items-center justify-center gap-2.5 shadow-2xl shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5"
            >
              <span>Get Your Free Report</span>
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="/demo"
              className="group border border-slate-300 text-slate-600 px-10 py-4 rounded-xl font-semibold text-lg hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-all duration-300 inline-flex items-center justify-center gap-2.5"
            >
              <svg className="w-5 h-5 text-green-500 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>View Demo Report</span>
            </a>
          </div>

          <p className="animate-fade-in animation-delay-500 mt-10 text-sm text-slate-400">
            No sign-up required &bull; No credit card &bull; Results in under 2 minutes
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* ── Trusted By ──────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50 py-10">
        <Reveal>
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-400 mb-8 font-medium">
              Trusted by restaurant owners across India
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-50">
              {["Zomato Partner", "Google Maps", "GPT-4 Powered", "Swiggy Listed", "TripAdvisor"].map((name, i) => (
                <span key={i} className="text-sm md:text-base font-semibold text-slate-500 tracking-wider whitespace-nowrap hover:text-green-500 transition-colors duration-500">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          <StatCard value={500} suffix="+" label="Restaurants Analyzed" delay={0} />
          <StatCard value={15} suffix="K+" label="Competitors Tracked" delay={100} />
          <StatCard value={4} suffix=".8/5" label="Avg Report Rating" delay={200} />
          <StatCard prefix="<" value={2} suffix=" min" label="Report Generation" delay={300} />
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-32 bg-slate-50 relative">
        <div className="max-w-6xl mx-auto px-6 relative">
          <Reveal className="text-center mb-20">
            <p className="text-sm uppercase tracking-[0.2em] text-green-600 font-semibold mb-4">Simple Process</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
              Three Steps to <span className="gradient-text">Market Dominance</span>
            </h2>
            <p className="text-slate-500 mt-5 max-w-xl mx-auto">From input to insight in under 2 minutes.</p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-green-200 to-transparent" />
            {[
              { step: "01", title: "Enter Your Restaurant", description: "Provide your restaurant name and city. Our AI locates your business and identifies all competitors within a 7km radius.", icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> },
              { step: "02", title: "AI Analyzes Everything", description: "We pull Google Maps data, calculate threat scores, analyze sentiment, and generate SEO keyword clusters using GPT-4.", icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg> },
              { step: "03", title: "Get Actionable Report", description: "Receive a comprehensive dashboard with threat maps, competitor breakdowns, keyword strategy, and a strategic verdict.", icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="bg-white rounded-2xl border border-slate-200 p-8 group relative hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-all duration-500 group-hover:scale-110">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Step {item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800 group-hover:text-green-700 transition-colors duration-300">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={450} className="text-center mt-14">
            <a href="/analyze" className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-800 transition-colors duration-200 group">
              <span>Start your analysis now</span>
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-32 bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-green-600 font-semibold mb-4">What You Get</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
              Everything You Need to <span className="gradient-text">Win</span>
            </h2>
            <p className="text-slate-500 mt-5 max-w-xl mx-auto leading-relaxed">Every report is packed with data-driven insights specifically tailored to your restaurant.</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "Overall Rank & Metrics", description: "Get your overall ranking with breakdown of reviews, rating percentile, and competitive position.", color: "text-red-500", bgColor: "bg-red-50 border-red-100", hoverBorder: "hover:border-red-300", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg> },
              { title: "Competitor Deep Dive", description: "Strengths, weaknesses, sentiment analysis, and keyword clusters for your top 5 competitors.", color: "text-green-600", bgColor: "bg-green-50 border-green-100", hoverBorder: "hover:border-green-300", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg> },
              { title: "Google Profile Audit", description: "Checklist audit of your Google Business presence — website, photos, timings, SEO, and reviews.", color: "text-green-600", bgColor: "bg-green-50 border-green-100", hoverBorder: "hover:border-green-300", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg> },
              { title: "SEO Keyword Strategy", description: "AI-generated keyword clusters to dominate local search and drive organic discovery.", color: "text-violet-600", bgColor: "bg-violet-50 border-violet-100", hoverBorder: "hover:border-violet-300", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" /></svg> },
              { title: "Threat Radar Map", description: "Visual chart plotting all competitors by threat level so you can see the landscape at a glance.", color: "text-amber-600", bgColor: "bg-amber-50 border-amber-100", hoverBorder: "hover:border-amber-300", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg> },
              { title: "Strategic Verdict", description: "A final executive-level verdict with specific, actionable recommendations.", color: "text-slate-700", bgColor: "bg-slate-100 border-slate-200", hoverBorder: "hover:border-slate-300", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg> },
            ].map((feature, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className={`bg-white rounded-2xl border border-slate-200 p-7 ${feature.hoverBorder} transition-all duration-500 group hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-100 h-full`}>
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} border flex items-center justify-center ${feature.color} mb-5 transition-all duration-500 group-hover:scale-110`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-800 group-hover:text-green-700 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Report Preview ──────────────────────────────────────────── */}
      <section id="preview" className="py-20 md:py-32 bg-slate-50 relative">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-green-600 font-semibold mb-4">Sample Output</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
              See What a Report <span className="gradient-text">Looks Like</span>
            </h2>
            <p className="text-slate-500 mt-5 max-w-xl mx-auto">Here&apos;s a snapshot from a demo report for &quot;Spice Garden&quot; in Bandra West, Mumbai.</p>
          </Reveal>

          <Reveal>
            <div className="bg-white rounded-2xl border border-slate-200 p-1.5 max-w-4xl mx-auto shadow-xl shadow-slate-200/50">
              <div className="rounded-xl bg-slate-50 p-6 md:p-10 space-y-6">
                <div className="flex items-end justify-between border-b border-slate-200 pb-6">
                  <div>
                    <p className="text-xs text-green-600 font-semibold uppercase tracking-[0.15em] mb-1.5">Competitive Intelligence Report</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Spice Garden</h3>
                    <p className="text-slate-400 text-sm mt-1">Bandra West, Mumbai</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-400 mb-1">Overall Rank</p>
                    <p className="text-xl font-semibold text-amber-600">Doing Well</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1">Total Reviews</p><p className="text-2xl font-bold text-slate-900">1,240</p></div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1">Review Percentile</p><p className="text-2xl font-bold text-amber-600">72%</p></div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1">Profile Score</p><p className="text-2xl font-bold text-green-600">6/8</p></div>
                </div>

                <PreviewBars />

                <div className="relative pt-4">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent z-10 flex items-end justify-center pb-6">
                    <a href="/demo" className="group bg-green-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 text-sm shadow-xl shadow-green-200 inline-flex items-center gap-2">
                      <span>View Full Demo Report</span>
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </a>
                  </div>
                  <div className="opacity-30 blur-[2px] space-y-3 pointer-events-none">
                    <div className="h-4 bg-slate-200 rounded w-3/4" /><div className="h-4 bg-slate-200 rounded w-full" /><div className="h-4 bg-slate-200 rounded w-5/6" /><div className="h-4 bg-slate-200 rounded w-2/3" /><div className="h-4 bg-slate-200 rounded w-full" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section id="testimonials" className="py-20 md:py-32 bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-green-600 font-semibold mb-4">Trusted by Restaurateurs</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">What Restaurant Owners <span className="gradient-text">Say</span></h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "We had no idea two new competitors opened within 2km of us. RetroGrade's report helped us react before we lost customers.", name: "Priya M.", role: "Owner, Tandoor Tales", city: "Koramangala, Bangalore" },
              { quote: "The SEO keyword clusters alone were worth it. We started ranking for 'best biryani near me' within weeks of optimizing our profile.", name: "Arjun S.", role: "Co-founder, Biryani Blues", city: "Indiranagar, Bangalore" },
              { quote: "The Google profile audit was eye-opening. We fixed 4 things and saw our profile views jump 40% in a month.", name: "Meera K.", role: "Manager, The Coastal Kitchen", city: "Bandra, Mumbai" },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 group hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-100 h-full flex flex-col transition-all duration-300">
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">&quot;{t.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-600 font-semibold text-sm">{t.name[0]}</div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.role} &mdash; {t.city}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section className="py-24 md:py-36 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-100/40 rounded-full blur-[120px] pointer-events-none" />

        <Reveal className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight text-slate-900">
            Ready to Outsmart<br /><span className="gradient-text-animated">Your Competition?</span>
          </h2>
          <p className="text-slate-500 text-lg mb-12 max-w-xl mx-auto leading-relaxed">Get a detailed competitive intelligence report for your restaurant. No sign-up, no credit card.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/analyze" className="cta-hero group cta-gradient text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all duration-300 shadow-2xl shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2">
              <span>Generate My Report</span>
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
            <a href="/demo" className="group border border-slate-300 text-slate-600 px-10 py-4 rounded-xl font-semibold text-lg hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-all duration-300 inline-flex items-center justify-center gap-2">
              <span>See Demo First</span>
            </a>
          </div>
          <p className="mt-8 text-sm text-slate-400">Join 500+ restaurant owners already using RetroGrade</p>
        </Reveal>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 py-14 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center font-bold text-white text-sm">R</div>
                <span className="font-semibold text-lg tracking-tight text-slate-800">Retro<span className="text-green-600">Grade</span></span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">AI-powered competitive intelligence for restaurants. Know your market, outperform your competitors, and grow your business.</p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-4 text-slate-700">Product</p>
              <div className="flex flex-col gap-2.5">
                <a href="/analyze" className="text-sm text-slate-400 hover:text-green-600 transition-colors">Get Report</a>
                <a href="/demo" className="text-sm text-slate-400 hover:text-green-600 transition-colors">Demo</a>
                <a href="#features" className="text-sm text-slate-400 hover:text-green-600 transition-colors">Features</a>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-4 text-slate-700">Company</p>
              <div className="flex flex-col gap-2.5">
                <a href="#testimonials" className="text-sm text-slate-400 hover:text-green-600 transition-colors">Testimonials</a>
                <a href="#" className="text-sm text-slate-400 hover:text-green-600 transition-colors">Privacy Policy</a>
                <a href="#" className="text-sm text-slate-400 hover:text-green-600 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">&copy; 2026 RetroGrade AI. All rights reserved.</p>
            <p className="text-xs text-slate-300">Powered by GPT-4 &bull; Google Maps API &bull; Built with Next.js</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ─── Preview Bars ─────────────────────────────────────────────────── */
function PreviewBars() {
  const { ref, visible } = useReveal(0.3);
  const competitors = [
    { name: "The Bombay Canteen", score: 88, color: "from-red-500 to-red-400" },
    { name: "Bastian", score: 83, color: "from-red-500 to-red-400" },
    { name: "Pali Village Cafe", score: 74, color: "from-amber-500 to-amber-400" },
    { name: "Smoke House Deli", score: 63, color: "from-amber-500 to-amber-400" },
    { name: "Sequel", score: 58, color: "from-green-500 to-green-400" },
  ];

  return (
    <div ref={ref}>
      <p className="text-sm font-semibold mb-4 text-slate-700">Top Competitors by Threat</p>
      <div className="space-y-3">
        {competitors.map((comp, i) => (
          <div key={i} className="flex items-center gap-3 group">
            <span className="text-xs text-slate-500 w-40 truncate group-hover:text-slate-700 transition-colors">{comp.name}</span>
            <div className="flex-1 h-3.5 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${comp.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: visible ? `${comp.score}%` : "0%", transitionDelay: `${i * 150 + 300}ms` }} />
            </div>
            <span className="text-xs font-bold text-slate-600 w-8 text-right tabular-nums">{comp.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
