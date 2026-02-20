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
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
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
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
}) {
  const { ref, visible } = useReveal();

  const transforms: Record<string, string> = {
    up: "translate3d(0,60px,0)",
    left: "translate3d(-60px,0,0)",
    right: "translate3d(60px,0,0)",
    scale: "scale(0.9)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0) scale(1)" : transforms[direction],
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Stat card with animated counter ───────────────────────────────── */
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
      <p className="text-4xl md:text-5xl font-bold text-yellow-400 tabular-nums tracking-tight transition-transform duration-300 group-hover:scale-110">
        {prefix}
        {count}
        {suffix}
      </p>
      <p className="text-sm text-neutral-500 mt-2 tracking-wide">{label}</p>
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

  /* smooth scroll for anchor links */
  const scrollTo = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white overflow-hidden">
      {/* ── Navigation ──────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-neutral-950/90 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-black text-sm shadow-lg shadow-yellow-500/20 group-hover:shadow-yellow-500/40 transition-shadow duration-300">
              R
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Retro<span className="text-yellow-500">Grade</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
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
                className="relative hover:text-white transition-colors duration-200 py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-yellow-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
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
              className="cta-primary bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-5 py-2 rounded-lg text-sm font-semibold hover:from-yellow-400 hover:to-amber-400 transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:-translate-y-px"
            >
              Get Report
            </a>

            {/* mobile hamburger */}
            <button
              className="md:hidden ml-1 p-2 text-neutral-400 hover:text-white"
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

        {/* mobile nav dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileNavOpen ? "max-h-64 border-b border-white/5" : "max-h-0"
          }`}
        >
          <div className="px-6 py-4 flex flex-col gap-3 bg-neutral-950/95 backdrop-blur-2xl">
            {["how-it-works", "features", "preview", "testimonials"].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => scrollTo(e, id)}
                className="text-neutral-400 hover:text-white transition-colors text-sm capitalize py-1"
              >
                {id.replace(/-/g, " ")}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="hero-gradient absolute inset-0 pointer-events-none" />
        <div className="bg-grid-pattern absolute inset-0 pointer-events-none opacity-40" />

        {/* Floating orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-yellow-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-40 right-[5%] w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute bottom-0 left-[40%] w-80 h-80 bg-yellow-600/3 rounded-full blur-[100px] animate-float-slow" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-5 py-2 mb-8 hover:bg-yellow-500/15 transition-colors duration-300 cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500" />
            </span>
            <span className="text-sm text-yellow-400 font-medium tracking-wide">
              AI-Powered Competitive Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up animation-delay-100 text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-7">
            Know Your Competition
            <br />
            <span className="gradient-text-animated">Before They Know You</span>
          </h1>

          {/* Sub-headline */}
          <p className="animate-fade-in-up animation-delay-200 text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Get an AI-generated competitive intelligence report for your restaurant
            in minutes. Analyze threats, uncover SEO opportunities, and receive
            actionable strategies to outperform every competitor nearby.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up animation-delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/analyze"
              className="cta-hero group bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-10 py-4 rounded-xl font-bold text-lg hover:from-yellow-400 hover:to-amber-400 transition-all duration-300 inline-flex items-center justify-center gap-2.5 shadow-2xl shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:-translate-y-0.5"
            >
              <span>Get Your Free Report</span>
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="/demo"
              className="group border border-neutral-700 text-neutral-300 px-10 py-4 rounded-xl font-semibold text-lg hover:border-neutral-500 hover:text-white hover:bg-white/[0.03] transition-all duration-300 inline-flex items-center justify-center gap-2.5"
            >
              <svg
                className="w-5 h-5 text-yellow-500 transition-transform duration-300 group-hover:scale-110"
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
          <p className="animate-fade-in animation-delay-500 mt-10 text-sm text-neutral-600">
            No sign-up required &bull; No credit card &bull; Results in under 2 minutes
          </p>
        </div>

        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none" />
      </section>

      {/* ── Trusted By Logos Strip ──────────────────────────────────── */}
      <section className="border-y border-white/[0.04] bg-neutral-900/30 py-10">
        <Reveal>
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-neutral-600 mb-8 font-medium">
              Trusted by restaurant owners across India
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
              {["Zomato Partner", "Google Maps", "GPT-4 Powered", "Swiggy Listed", "TripAdvisor"].map((name, i) => (
                <span key={i} className="text-sm md:text-base font-semibold text-neutral-400 tracking-wider whitespace-nowrap">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Stats Strip ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          <StatCard value={500} suffix="+" label="Restaurants Analyzed" delay={0} />
          <StatCard value={15} suffix="K+" label="Competitors Tracked" delay={100} />
          <StatCard value={4} suffix=".8/5" label="Avg Report Rating" delay={200} />
          <StatCard prefix="<" value={2} suffix=" min" label="Report Generation" delay={300} />
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-32 relative">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-20">
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-500 font-semibold mb-4">
              Simple Process
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Three Steps to <span className="gradient-text">Market Dominance</span>
            </h2>
            <p className="text-neutral-400 mt-5 max-w-xl mx-auto">
              From input to insight in under 2 minutes. No data science degree required.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />

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
              <Reveal key={i} delay={i * 150}>
                <div className="glass-card rounded-2xl p-8 hover:border-yellow-500/20 transition-all duration-500 group relative hover:-translate-y-1 hover:shadow-2xl hover:shadow-yellow-500/5">
                  {/* Step number circle */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500/20 group-hover:border-yellow-500/30 transition-all duration-500 group-hover:scale-110">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-[0.15em]">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-yellow-400 transition-colors duration-300">{item.title}</h3>
                  <p className="text-neutral-400 leading-relaxed text-sm">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Inline CTA */}
          <Reveal delay={450} className="text-center mt-14">
            <a
              href="/analyze"
              className="inline-flex items-center gap-2 text-yellow-500 font-semibold hover:text-yellow-400 transition-colors duration-200 group"
            >
              <span>Start your analysis now</span>
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-32 bg-neutral-900/30 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-500 font-semibold mb-4">
              What You Get
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Everything You Need to <span className="gradient-text">Win</span>
            </h2>
            <p className="text-neutral-400 mt-5 max-w-xl mx-auto leading-relaxed">
              Every report is packed with data-driven insights specifically tailored
              to your restaurant and local market.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "Threat Score Index",
                description:
                  "Each competitor gets a 0-100 threat score based on rating, review volume, and proximity to your location.",
                color: "text-red-400",
                bgColor: "bg-red-500/10 border-red-500/20",
                hoverBorder: "hover:border-red-500/30",
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
                hoverBorder: "hover:border-blue-500/30",
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
                hoverBorder: "hover:border-emerald-500/30",
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
                hoverBorder: "hover:border-purple-500/30",
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
                hoverBorder: "hover:border-yellow-500/30",
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
                hoverBorder: "hover:border-orange-500/30",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                ),
              },
            ].map((feature, i) => (
              <Reveal key={i} delay={i * 100}>
                <div
                  className={`glass-card rounded-2xl p-7 ${feature.hoverBorder} transition-all duration-500 group hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 h-full`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.bgColor} border flex items-center justify-center ${feature.color} mb-5 transition-all duration-500 group-hover:scale-110`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors duration-300">{feature.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Report Preview ──────────────────────────────────────────── */}
      <section id="preview" className="py-20 md:py-32 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-500 font-semibold mb-4">
              Sample Output
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              See What a Report <span className="gradient-text">Looks Like</span>
            </h2>
            <p className="text-neutral-400 mt-5 max-w-xl mx-auto">
              Here&apos;s a snapshot from a demo report for &quot;Spice Garden&quot; in Bandra
              West, Mumbai.
            </p>
          </Reveal>

          {/* Mock report preview */}
          <Reveal>
            <div className="glass-card rounded-2xl p-1.5 max-w-4xl mx-auto shadow-2xl shadow-black/40">
              <div className="rounded-xl bg-neutral-950 p-6 md:p-10 space-y-6">
                {/* Mock header */}
                <div className="flex items-end justify-between border-b border-neutral-800/80 pb-6">
                  <div>
                    <p className="text-xs text-yellow-500 font-semibold uppercase tracking-[0.15em] mb-1.5">
                      Competitive Intelligence Report
                    </p>
                    <h3 className="text-2xl md:text-3xl font-bold">Spice Garden</h3>
                    <p className="text-neutral-500 text-sm mt-1">Bandra West, Mumbai</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-neutral-500 mb-1">Overall Threat Level</p>
                    <p className="text-xl font-semibold text-yellow-400">Moderate-High</p>
                  </div>
                </div>

                {/* Mock KPIs */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-neutral-900/80 border border-neutral-800/60 rounded-xl p-4 hover:border-yellow-500/20 transition-colors duration-300">
                    <p className="text-xs text-neutral-500 mb-1">Threat Index</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      71<span className="text-sm text-neutral-600">/100</span>
                    </p>
                  </div>
                  <div className="bg-red-950/20 border border-red-800/20 rounded-xl p-4 hover:border-red-500/30 transition-colors duration-300">
                    <p className="text-xs text-neutral-500 mb-1">Revenue at Risk</p>
                    <p className="text-2xl font-bold text-red-400">$48K</p>
                  </div>
                  <div className="bg-emerald-950/20 border border-emerald-800/20 rounded-xl p-4 hover:border-emerald-500/30 transition-colors duration-300">
                    <p className="text-xs text-neutral-500 mb-1">Recovery Opp.</p>
                    <p className="text-2xl font-bold text-emerald-400">$85K</p>
                  </div>
                </div>

                {/* Mock competitor bars */}
                <PreviewBars />

                {/* Blur overlay with CTA */}
                <div className="relative pt-4">
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent z-10 flex items-end justify-center pb-6">
                    <a
                      href="/demo"
                      className="group bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-8 py-3.5 rounded-xl font-semibold hover:from-yellow-400 hover:to-amber-400 transition-all duration-300 text-sm shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:-translate-y-px inline-flex items-center gap-2"
                    >
                      <span>View Full Demo Report</span>
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
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
          </Reveal>
        </div>
      </section>

      {/* ── Testimonials / Social Proof ─────────────────────────────── */}
      <section id="testimonials" className="py-20 md:py-32 bg-neutral-900/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-500 font-semibold mb-4">
              Trusted by Restaurateurs
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              What Restaurant Owners <span className="gradient-text">Say</span>
            </h2>
          </Reveal>

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
              <Reveal key={i} delay={i * 150}>
                <div className="glass-card rounded-2xl p-8 hover:border-white/10 transition-all duration-500 group hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 h-full flex flex-col">
                  <div className="flex gap-1 mb-5">
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
                  <p className="text-neutral-300 text-sm leading-relaxed mb-6 flex-grow">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/20 flex items-center justify-center text-yellow-500 font-semibold text-sm">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-neutral-500">
                        {testimonial.role} &mdash; {testimonial.city}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section className="py-24 md:py-36 relative overflow-hidden">
        <div className="hero-gradient absolute inset-0 pointer-events-none" />
        <div className="bg-grid-pattern absolute inset-0 pointer-events-none opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <Reveal className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            Ready to Outsmart
            <br />
            <span className="gradient-text-animated">Your Competition?</span>
          </h2>
          <p className="text-neutral-400 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Get a detailed competitive intelligence report for your restaurant.
            No sign-up, no credit card. Just enter your restaurant name.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/analyze"
              className="cta-hero group bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-10 py-4 rounded-xl font-bold text-lg hover:from-yellow-400 hover:to-amber-400 transition-all duration-300 shadow-2xl shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
            >
              <span>Generate My Report</span>
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="/demo"
              className="group border border-neutral-700 text-neutral-300 px-10 py-4 rounded-xl font-semibold text-lg hover:border-neutral-500 hover:text-white hover:bg-white/[0.03] transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <span>See Demo First</span>
            </a>
          </div>
          <p className="mt-8 text-sm text-neutral-600">
            Join 500+ restaurant owners already using RetroGrade
          </p>
        </Reveal>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-14 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-black text-sm">
                  R
                </div>
                <span className="font-semibold text-lg tracking-tight">
                  Retro<span className="text-yellow-500">Grade</span>
                </span>
              </div>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
                AI-powered competitive intelligence for restaurants. Know your
                market, outperform your competitors, and grow your business.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-sm font-semibold mb-4 text-neutral-300">Product</p>
              <div className="flex flex-col gap-2.5">
                <a href="/analyze" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                  Get Report
                </a>
                <a href="/demo" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                  Demo
                </a>
                <a href="#features" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                  How It Works
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-4 text-neutral-300">Company</p>
              <div className="flex flex-col gap-2.5">
                <a href="#testimonials" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                  Testimonials
                </a>
                <a href="#" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-600">
              &copy; 2026 RetroGrade AI. All rights reserved.
            </p>
            <p className="text-xs text-neutral-700">
              Powered by GPT-4 &bull; Google Maps API &bull; Built with Next.js
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ─── Animated Preview Bars (separate component for IntersectionObserver) ── */
function PreviewBars() {
  const { ref, visible } = useReveal(0.3);

  const competitors = [
    { name: "The Bombay Canteen", score: 88, color: "from-red-500 to-red-600" },
    { name: "Bastian", score: 83, color: "from-red-500 to-red-600" },
    { name: "Pali Village Cafe", score: 74, color: "from-yellow-500 to-amber-500" },
    { name: "Smoke House Deli", score: 63, color: "from-yellow-500 to-amber-500" },
    { name: "Sequel", score: 58, color: "from-green-500 to-emerald-500" },
  ];

  return (
    <div ref={ref}>
      <p className="text-sm font-semibold mb-4 text-neutral-300">Top Competitors by Threat</p>
      <div className="space-y-3">
        {competitors.map((comp, i) => (
          <div key={i} className="flex items-center gap-3 group">
            <span className="text-xs text-neutral-400 w-40 truncate group-hover:text-neutral-200 transition-colors">{comp.name}</span>
            <div className="flex-1 h-3.5 bg-neutral-800/80 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${comp.color} rounded-full transition-all duration-1000 ease-out`}
                style={{
                  width: visible ? `${comp.score}%` : "0%",
                  transitionDelay: `${i * 150 + 300}ms`,
                }}
              />
            </div>
            <span className="text-xs font-bold text-neutral-300 w-8 text-right tabular-nums">
              {comp.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
