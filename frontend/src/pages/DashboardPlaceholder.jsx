
import { Link } from "react-router-dom";
import { LayoutDashboard, Sparkles } from "lucide-react";

export default function DashboardPlaceholder({ role }) {
  const isAdmin = role === "ADMIN";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070711] px-5 text-white">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-violet-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-[130px]" />

      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#11111e]/80 p-10 text-center shadow-[0_0_80px_rgba(124,58,237,0.12)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
          <LayoutDashboard className="h-7 w-7 text-violet-300" />
        </div>

        <div className="mt-7 flex items-center justify-center gap-2 text-xs font-semibold tracking-[.2em] text-violet-300">
          <Sparkles size={14} />
          WORKFORCE AI
        </div>

        <h1 className="mt-4 text-3xl font-bold">
          {isAdmin ? "Admin Dashboard" : "Employee Dashboard"}
        </h1>

        <p className="mt-4 leading-7 text-gray-400">
          Login redirect is working. Your {isAdmin ? "admin" : "employee"}{" "}
          dashboard UI will be built here next.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
