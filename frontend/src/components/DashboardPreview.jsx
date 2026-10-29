import { BarChart3, Check, CheckCircle2, CircleDot, Sparkles, Users, Zap } from "lucide-react";
import { demoTasks } from "../data/landingContent.js";

const stats = [
  { label: "Team members", value: "24", icon: Users, color: "text-cyan-300" },
  { label: "Active tasks", value: "18", icon: CircleDot, color: "text-violet-300" },
  { label: "Departments", value: "05", icon: BarChart3, color: "text-blue-300" },
];

const progress = [
  { label: "Completed", value: 68, color: "bg-cyan-400" },
  { label: "In progress", value: 48, color: "bg-violet-400" },
  { label: "Needs attention", value: 24, color: "bg-amber-400" },
];

export default function DashboardPreview() {
  return (
    <div className="hero-visual relative mx-auto w-full max-w-2xl">
      <div className="absolute -inset-8 rounded-full bg-violet-600/20 blur-[85px]" />
      <div className="absolute -right-5 top-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-[70px]" />

      <div className="relative rounded-2xl border border-violet-300/20 bg-[#0a0d1d]/95 p-3 shadow-[0_0_70px_rgba(91,33,182,.16)] backdrop-blur-xl sm:p-5">
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
          <div className="flex items-center gap-2" aria-label="Window controls">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
          </div>
          <span className="text-[9px] tracking-[.18em] text-slate-500 sm:text-[10px]">WORKSPACE OVERVIEW</span>
        </div>

        <div className="flex items-center justify-between gap-3 py-5">
          <div>
            <p className="text-xs text-slate-500">Good morning, Admin</p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">Team overview</h2>
          </div>
          <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/[.07] px-2 py-2 text-[10px] text-cyan-200 sm:px-3 sm:text-xs">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300" />Demo preview
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl border border-white/[.08] bg-white/[.025] p-3 sm:p-4">
                <Icon className={`mb-3 h-4 w-4 ${stat.color}`} />
                <p className="font-display text-xl font-semibold sm:text-2xl">{stat.value}</p>
                <p className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-xs">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr_.9fr] sm:gap-4">
          <div className="rounded-xl border border-white/[.08] bg-white/[.025] p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-200">Productivity trend</span>
              <span className="text-[9px] text-slate-500">Illustrative</span>
            </div>
            <svg viewBox="0 0 300 120" className="h-28 w-full sm:h-32" role="img" aria-label="Illustrative productivity trend">
              <defs>
                <linearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".26" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[25, 50, 75, 100].map((y) => <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="rgba(148,163,184,.12)" strokeDasharray="4 5" />)}
              <path d="M0 95 C28 88 35 64 66 73 S102 83 127 51 S172 68 195 43 S239 54 263 22 S288 31 300 14 L300 120 L0 120 Z" fill="url(#chartFill)" />
              <path d="M0 95 C28 88 35 64 66 73 S102 83 127 51 S172 68 195 43 S239 54 263 22 S288 31 300 14" fill="none" stroke="url(#chartLine)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="263" cy="22" r="4" fill="#67e8f9" />
            </svg>
            <div className="flex justify-between text-[9px] text-slate-600"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span></div>
          </div>

          <div className="rounded-xl border border-white/[.08] bg-white/[.025] p-3 sm:p-4">
            <span className="text-xs font-medium text-slate-200">Task snapshot</span>
            <div className="mt-4 space-y-4">
              {progress.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between gap-2 text-[9px]"><span className="text-slate-400">{item.label}</span><span className="text-slate-300">{item.value}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-violet-400/15 bg-violet-400/[.06] p-2.5 sm:mt-5 sm:p-3">
              <Sparkles className="h-4 w-4 shrink-0 text-violet-300" />
              <span className="text-[9px] leading-4 text-slate-300 sm:text-[10px]">Structured data for smarter decisions.</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/[.08] bg-white/[.025] p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-200">Recent tasks</span>
            <span className="text-[9px] text-slate-500">Preview only</span>
          </div>
          <div className="space-y-3">
            {demoTasks.map((task) => (
              <div key={task.name} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3"><span className={`h-2 w-2 shrink-0 rounded-full ${task.dot}`} /><span className="truncate text-[10px] text-slate-300 sm:text-xs">{task.name}</span></div>
                <span className="shrink-0 text-[9px] text-slate-500 sm:text-[10px]">{task.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="floating-card absolute -left-5 top-24 hidden rounded-xl border border-cyan-300/20 bg-[#0c1224]/95 p-4 shadow-[0_0_35px_rgba(34,211,238,.1)] backdrop-blur-xl sm:block">
        <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10"><Check className="h-5 w-5 text-cyan-300" /></span><div><p className="text-xs font-medium">Work, organized.</p><p className="mt-1 text-[10px] text-slate-500">One connected workspace</p></div></div>
      </div>
      <div className="floating-card absolute -right-4 bottom-20 hidden rounded-xl border border-violet-300/20 bg-[#101027]/95 p-4 shadow-[0_0_40px_rgba(139,92,246,.18)] backdrop-blur-xl sm:block">
        <div className="flex items-center gap-3"><Zap className="h-5 w-5 text-violet-300" /><div><p className="text-xs font-medium">AI-ready workflows</p><p className="mt-1 text-[10px] text-slate-500">Built for smarter decisions</p></div></div>
      </div>
    </div>
  );
}
