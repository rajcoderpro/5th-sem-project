import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight, Sparkles, ShieldCheck, Users, GitBranch } from "lucide-react";
import gsap from "gsap";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import DashboardPreview from "../components/DashboardPreview.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { features, workflowSteps } from "../data/landingContent.js";

export default function LandingPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo(".hero-kicker", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55 })
        .fromTo(".hero-title", { autoAlpha: 0, y: 35 }, { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.25")
        .fromTo(".hero-copy", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.55 }, "-=0.4")
        .fromTo(".hero-actions", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.25")
        .fromTo(".hero-proof", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, "-=0.1")
        .fromTo(".hero-visual", { autoAlpha: 0, scale: 0.95, x: 18 }, { autoAlpha: 1, scale: 1, x: 0, duration: 0.9 }, "-=0.7");

      gsap.to(".floating-card", {
        y: -9,
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.3,
      });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <main ref={rootRef} className="min-h-screen overflow-hidden bg-ink text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-40 h-96 w-96 rounded-full bg-violet-700/10 blur-[130px]" />
        <div className="absolute -right-40 top-20 h-[32rem] w-[32rem] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="grid-overlay absolute inset-0 opacity-[.12]" />
      </div>

      <Navbar />

      <section id="home" className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[.94fr_1.06fr] lg:px-12 lg:pb-32 lg:pt-28">
        <div className="relative z-10">
          <div className="hero-kicker mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/[.08] px-4 py-2 text-xs text-violet-200">
            <Sparkles className="h-4 w-4" /> Intelligent workforce management <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
          </div>
          <h1 className="hero-title max-w-2xl font-display text-5xl font-semibold leading-[1.08] tracking-[-.055em] sm:text-6xl lg:text-[4.65rem]">
            Smarter<br />workforce.<br /><span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">Higher impact.</span>
          </h1>
          <p className="hero-copy mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
            Bring your people, tasks, and priorities together. Build a more organized workforce today—and a smarter one for tomorrow.
          </p>
          <div className="hero-actions mt-9 flex flex-col gap-4 sm:flex-row">
            <Link to="/login" className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 via-violet-600 to-blue-600 px-6 py-4 text-sm font-semibold shadow-neon transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(124,58,237,.4)]">
              Enter your workspace <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <a href="#features" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.025] px-6 py-4 text-sm text-slate-300 transition hover:border-violet-400/40 hover:bg-white/[.05]">
              Explore features <ArrowDownRight className="h-4 w-4" />
            </a>
          </div>
          <div className="hero-proof mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-500">
            {["Role-based access", "Clear task ownership", "Workload visibility"].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" />{item}</span>)}
          </div>
        </div>
        <DashboardPreview />
      </section>

      <section className="relative border-y border-white/[.07] bg-white/[.015]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-12">
          {[
            { icon: ShieldCheck, title: "Secure by design", text: "Role-based access and controlled workflows." },
            { icon: Users, title: "People first", text: "Clear ownership, teams, and responsibilities." },
            { icon: GitBranch, title: "Built for intelligence", text: "Structured data ready for future AI insights." },
          ].map((item) => {
            const Icon = item.icon;
            return <div key={item.title} className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/[.07]"><Icon className="h-5 w-5 text-violet-300" /></span><div><h3 className="text-sm font-medium">{item.title}</h3><p className="mt-1 text-xs leading-6 text-slate-500">{item.text}</p></div></div>;
          })}
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <SectionHeading eyebrow="A better way to work" title="Your workforce." accent="One connected system." description="Everything starts with organized people, clear responsibilities, and a transparent view of the work that matters." />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const glow = feature.glow === "cyan" ? "from-cyan-400 to-blue-500" : feature.glow === "blue" ? "from-blue-500 to-violet-500" : "from-violet-500 to-fuchsia-500";
            return <motion.article key={feature.number} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: index * 0.12 }} whileHover={{ y: -6 }} className="group relative overflow-hidden rounded-2xl border border-white/[.09] bg-panel/80 p-7 transition-colors hover:border-violet-400/30">
              <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${glow} opacity-[.08] blur-3xl transition-opacity group-hover:opacity-20`} />
              <div className="relative"><div className="flex items-center justify-between"><span className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${glow} bg-opacity-10`}><Icon className="h-5 w-5" /></span><span className="font-mono text-xs text-slate-600">{feature.number}</span></div><h3 className="mt-8 font-display text-lg font-semibold">{feature.title}</h3><p className="mt-3 min-h-20 text-sm leading-7 text-slate-400">{feature.description}</p><a href="#how-it-works" className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-violet-300 transition-all group-hover:gap-3">Discover more <ArrowRight className="h-4 w-4" /></a></div>
            </motion.article>;
          })}
        </div>
      </section>

      <section id="how-it-works" className="relative border-y border-white/[.07] bg-[#080a17]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-12 lg:py-28">
          <div id="about"><p className="mb-4 text-xs font-semibold uppercase tracking-[.25em] text-cyan-300">The workflow</p><h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">Less chaos.<br /><span className="text-slate-500">More clarity.</span></h2><p className="mt-6 max-w-md text-sm leading-7 text-slate-400">Create a central place for your team to manage people, assign work, and understand progress without jumping between scattered tools.</p><Link to="/login" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-white">Enter the workspace <ChevronRight className="h-4 w-4" /></Link></div>
          <div className="space-y-4">{workflowSteps.map((step, index) => <motion.div key={step.number} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: index * 0.12 }} className="flex gap-5 rounded-2xl border border-white/[.08] bg-white/[.02] p-5 sm:p-6"><span className="font-mono text-sm text-violet-300">{step.number}</span><div><h3 className="font-medium">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p></div><ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-slate-600" /></motion.div>)}</div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-950/50 via-[#111027] to-blue-950/40 p-8 text-center sm:p-14">
          <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[100px]" />
          <div className="relative mx-auto max-w-2xl"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10"><Sparkles className="h-5 w-5 text-violet-300" /></div><h2 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-5xl">Ready to bring your<span className="block bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">workforce together?</span></h2><p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-slate-400">Build better visibility, stronger ownership, and a more organized way of working.</p><Link to="/login" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-4 text-sm font-semibold shadow-neon transition hover:-translate-y-0.5">Get started <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
