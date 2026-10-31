
import { LogOut, Menu, UserCircle2 } from "lucide-react";

export default function AdminTopbar({ user, onMenuClick, onLogout }) {
  const today = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const initials = (user?.name || "Admin")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[.07] bg-[#070914]/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white md:hidden"
        >
          <Menu size={20} />
        </button>

        <div>
          <p className="text-xs text-slate-500">ADMIN CONSOLE / OVERVIEW</p>
          <h1 className="mt-1 font-display text-sm font-semibold sm:text-base">
            Dashboard
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <p className="hidden text-xs text-slate-500 sm:block">
          {today}
        </p>

        <div className="hidden h-8 w-px bg-white/10 sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-xs font-bold text-violet-200">
            {initials || <UserCircle2 size={20} />}
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-32 truncate text-xs font-semibold text-slate-200">
              {user?.name || "Administrator"}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Administrator
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          title="Logout"
          aria-label="Logout"
          className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
