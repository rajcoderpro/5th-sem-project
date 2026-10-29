import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Menu, X, Zap } from "lucide-react";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="relative z-30 border-b border-white/[0.07] bg-ink/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10 shadow-[0_0_25px_rgba(139,92,246,.15)]">
            <Zap className="h-5 w-5 text-violet-300" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            WorkForce<span className="text-violet-400"> AI</span>
            <span className="mt-0.5 block font-sans text-[9px] font-normal tracking-[.17em] text-slate-500">
              SMARTER TEAMS. HIGHER IMPACT.
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="text-sm text-slate-400 transition hover:text-white">
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="rounded-xl px-5 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
            Sign in
          </Link>
          <Link to="/login" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-medium shadow-neon transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(109,40,217,.4)]">
            Get started
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="rounded-xl border border-white/10 p-2 text-slate-300 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/[0.07] bg-[#080a18] px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={closeMenu} className="text-sm text-slate-300">
                {item.label}
              </a>
            ))}
            <Link to="/login" onClick={closeMenu} className="rounded-xl bg-violet-600 px-4 py-3 text-center text-sm font-medium">
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
