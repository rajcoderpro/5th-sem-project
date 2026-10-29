import { Link } from "react-router-dom";
import { ArrowLeft, BrainCircuit, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-12 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-violet-700/20 blur-[110px]" />
        <div className="absolute -right-20 top-10 h-96 w-96 rounded-full bg-cyan-600/10 blur-[130px]" />
        <div className="grid-overlay absolute inset-0 opacity-[.1]" />
      </div>
      <div className="relative grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div className="hidden lg:block">
          <Link to="/" className="inline-flex items-center gap-3 font-display text-xl font-semibold"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10"><BrainCircuit className="h-5 w-5 text-violet-300" /></span>WorkForce <span className="-ml-3 text-violet-400">AI</span></Link>
          <p className="mt-12 text-xs font-semibold uppercase tracking-[.25em] text-violet-300">Your workspace awaits</p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-tight">People aligned.<br /><span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">Work moving.</span></h1>
          <p className="mt-6 max-w-md text-base leading-8 text-slate-400">Sign in to manage tasks, understand workload, and keep your team moving in one connected workspace.</p>
          <div className="mt-8 inline-flex items-center gap-2 text-sm text-slate-500"><Sparkles className="h-4 w-4 text-violet-300" />Built for smarter workforce decisions</div>
        </div>

        <section className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0d1b]/90 p-7 shadow-[0_0_70px_rgba(91,33,182,.14)] backdrop-blur-xl sm:p-9">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
          <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[.22em] text-violet-300">Welcome back</p><h2 className="mt-3 font-display text-3xl font-semibold">Sign in to WorkForce AI</h2><p className="mt-3 text-sm leading-6 text-slate-400">Use the account provided by your administrator.</p></div>
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[.06] p-4 text-sm leading-6 text-amber-100/80">Login UI placeholder. The next step is connecting this form to your existing authentication API.</div>
          <div className="mt-8"><Link to="/" className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3.5 text-sm font-semibold transition hover:brightness-110">Return to landing page</Link></div>
        </section>
      </div>
    </main>
  );
}
