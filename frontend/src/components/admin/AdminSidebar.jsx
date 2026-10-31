
import { Link, useLocation } from "react-router-dom";

import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  Users,
  X,
  Zap,
  ChevronRight,
  LockKeyhole,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    available: true,
  },
  {
    label: "Employees",
    href: "/admin/employees",
    icon: Users,
    available: true,
  },
  {
    label: "Departments",
    href: "/admin/departments",
    icon: Building2,
    available: true,
  },
  {
    label: "Tasks",
    href: "/admin/tasks",
    icon: ClipboardList,
    available: true,
  },
];

export default function AdminSidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/[.07] bg-[#090b18] transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/[.07] px-6">
          <Link
            to="/admin/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 to-cyan-500/10">
              <Zap className="h-5 w-5 text-violet-300" />
            </div>

            <div>
              <h2 className="font-display text-base font-bold tracking-tight">
                WorkForce<span className="text-violet-400"> AI</span>
              </h2>

              <p className="mt-0.5 text-[9px] tracking-[.2em] text-slate-500">
                ADMIN CONSOLE
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="text-slate-500 hover:text-white md:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-5 pt-8">
          <p className="mb-4 px-3 text-[10px] font-semibold tracking-[.2em] text-slate-600">
            WORKSPACE
          </p>

          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.href;

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={onClose}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    active
                      ? "border border-violet-400/15 bg-violet-500/[.12] text-violet-200"
                      : "text-slate-400 hover:bg-white/[.04] hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      active ? "text-violet-300" : "text-slate-500"
                    }
                  />

                  <span className="flex-1">{item.label}</span>

                  {active && (
                    <ChevronRight
                      size={15}
                      className="text-violet-400"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto p-5">
          <div className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[.12] to-blue-500/[.04] p-4">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/20 blur-2xl" />

            <div className="relative">
              <Zap size={19} className="text-violet-300" />

              <p className="mt-3 text-sm font-semibold">
                Smarter workforce
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Manage people, tasks and teams from one workspace.
              </p>

              <div className="mt-4 flex items-center gap-2 text-[10px] text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                System workspace
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-[10px] text-slate-600">
            WORKFORCE AI © {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  );
}
