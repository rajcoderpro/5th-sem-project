
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";

import {
  Clock3,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Timer,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { apiGet, apiRequest } from "../../services/api.js";

const LIMIT = 10;

function getISTDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = {};

  parts.forEach((part) => {
    values[part.type] = part.value;
  });

  return `${values.year}-${values.month}-${values.day}`;
}

function formatTime(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatMinutes(minutes) {
  const safeMinutes = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(safeMinutes / 60);
  const remaining = safeMinutes % 60;

  return `${hours}h ${remaining}m`;
}

function StatusBadge({ status }) {
  const styles = {
    PRESENT: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    LATE: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    HALF_DAY: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    ABSENT: "border-red-400/20 bg-red-400/10 text-red-300",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-medium ${
        styles[status] || "border-white/10 bg-white/5 text-slate-400"
      }`}
    >
      {(status || "NOT MARKED").replaceAll("_", " ")}
    </span>
  );
}

function MetricCard({ icon: Icon, title, value, description, color }) {
  return (
    <div className="attendance-reveal group rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 transition hover:-translate-y-1 hover:border-violet-400/25">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500">{title}</p>

          <h3 className="mt-4 font-display text-2xl font-semibold">
            {value}
          </h3>

          <p className="mt-2 text-[10px] text-slate-600">
            {description}
          </p>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.06] ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function EmployeeAttendancePage() {
  const rootRef = useRef(null);

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [clockNow, setClockNow] = useState(Date.now());
  const [todayData, setTodayData] = useState(null);
  const [history, setHistory] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    status: "ALL",
    fromDate: "",
    toDate: "",
  });

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setError("");

    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
    });

    if (filters.status !== "ALL") {
      params.set("status", filters.status);
    }

    if (filters.fromDate) {
      params.set("fromDate", filters.fromDate);
    }

    if (filters.toDate) {
      params.set("toDate", filters.toDate);
    }

    try {
      const [todayResponse, historyResponse] = await Promise.all([
        apiGet("/api/attendance/today"),
        apiGet(`/api/attendance/me?${params.toString()}`),
      ]);

      setTodayData(todayResponse);

      setHistory(historyResponse.attendance || []);

      setPagination({
        page: historyResponse.pagination?.page || page,
        total: historyResponse.pagination?.total || 0,
        totalPages: Math.max(
          1,
          historyResponse.pagination?.totalPages || 1
        ),
      });
    } catch (err) {
      console.error("Employee attendance loading error:", err);

      setError(err.message || "Unable to load attendance information.");
    }
  }, [page, filters]);

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setLoading(true);
      await loadData();

      if (mounted) {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [loadData]);

  useEffect(() => {
    if (loading || !rootRef.current) return;

    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap.fromTo(
        ".attendance-intro",
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );

      gsap.fromTo(
        ".attendance-reveal",
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.07,
          delay: 0.1,
        }
      );
    }, rootRef);

    return () => context.revert();
  }, [loading]);

  const attendance = todayData?.attendance || null;

  const checkedIn = Boolean(attendance?.checkInAt);
  const checkedOut = Boolean(attendance?.checkOutAt);
    useEffect(() => {
    if (!checkedIn || checkedOut) return;

    const timer = setInterval(() => {
        setClockNow(Date.now());
    }, 30000);

    return () => clearInterval(timer);
    }, [checkedIn, checkedOut]);
  const workedMinutes = useMemo(() => {
    if (!attendance?.checkInAt) return 0;

    if (attendance.checkOutAt) {
      return attendance.workedMinutes || 0;
    }

    return Math.max(
      0,
      Math.floor(
        (clockNow - new Date(attendance.checkInAt).getTime()) / 60000
      )
    );
  }, [attendance , clockNow]);

  const todayStatus = attendance?.status || "NOT MARKED";

  const handleAttendanceAction = async (action) => {
    setActionLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await apiRequest(
        `/api/attendance/${action}`,
        {
          method: action === "check-in" ? "POST" : "PATCH",
        }
      );

      setNotice(response.message || "Attendance updated successfully.");

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to update attendance.");
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "ALL",
      fromDate: "",
      toDate: "",
    });

    setPage(1);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const today = getISTDate();

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070914] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-24 animate-pulse rounded-2xl bg-white/[.03]" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-2xl bg-white/[.03]" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-white/[.03]" />
        </div>
      </main>
    );
  }

  return (
    <main ref={rootRef} className="min-h-screen overflow-hidden bg-[#070914] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-700/[.09] blur-[130px]" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-cyan-600/[.06] blur-[130px]" />
        <div className="grid-overlay absolute inset-0 opacity-[.10]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex h-[76px] items-center justify-between border-b border-white/[.07] bg-[#090b18]/80 px-5 backdrop-blur-xl sm:px-8">
        <Link to="/employee/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
            <Clock3 className="h-5 w-5 text-violet-300" />
          </span>

          <span className="font-display text-base font-bold">
            WorkForce<span className="text-violet-400"> AI</span>
            <span className="mt-0.5 block text-[9px] font-normal tracking-[.2em] text-slate-500">
              EMPLOYEE WORKSPACE
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/employee/leaves" className="hidden items-center gap-2 rounded-xl border border-amber-400/15 bg-amber-400/[.05] px-3 py-2.5 text-xs text-amber-200 transition hover:bg-amber-400/[.1] sm:inline-flex">
            <CalendarDays size={14} /> Leave
          </Link>

          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
            <p className="mt-1 text-[10px] text-slate-500">Employee</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl space-y-7 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        {/* Heading */}
        <div className="attendance-intro flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Link
              to="/employee/dashboard"
              className="mb-5 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              Employee dashboard
            </Link>

            <p className="text-xs font-semibold tracking-[.2em] text-violet-300">
              EMPLOYEE / ATTENDANCE
            </p>

            <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Your attendance<span className="text-violet-300">.</span>
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Track your working day and review your attendance history.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Feedback */}
        {notice && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[.07] px-4 py-3 text-xs text-emerald-300">
            {notice}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/[.07] px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Today's attendance */}
        <section className="attendance-reveal relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-[#17112b] via-[#101426] to-[#091b25] p-6 sm:p-9">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-[100px]" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-[10px] tracking-wider text-slate-300">
                <CalendarDays size={14} className="text-violet-300" />
                {new Intl.DateTimeFormat("en-IN", {
                  timeZone: "Asia/Kolkata",
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date())}
              </div>

              <h2 className="mt-6 font-display text-3xl font-semibold">
                {checkedOut
                  ? "Your workday is complete."
                  : checkedIn
                    ? "You're checked in."
                    : "Ready to start your day?"}
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-7 text-slate-400">
                {checkedOut
                  ? "Your check-out has been recorded successfully. Have a great day!"
                  : checkedIn
                    ? "Your attendance is active. Remember to check out when your workday ends."
                    : "Mark your attendance when you arrive. Your check-in time will be recorded automatically."}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <StatusBadge status={todayStatus} />

                <span className="text-[10px] text-slate-500">
                  Shift starts at 09:30 IST · 15-minute grace period
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-center">
              {!checkedIn ? (
                <button
                  type="button"
                  onClick={() => handleAttendanceAction("check-in")}
                  disabled={actionLoading}
                  className="inline-flex min-w-52 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-5 text-sm font-semibold text-white shadow-[0_0_45px_rgba(124,58,237,.25)] transition hover:-translate-y-1 hover:shadow-[0_0_55px_rgba(124,58,237,.4)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogIn size={20} />
                  {actionLoading ? "Please wait..." : "Check in"}
                </button>
              ) : !checkedOut ? (
                <button
                  type="button"
                  onClick={() => handleAttendanceAction("check-out")}
                  disabled={actionLoading}
                  className="inline-flex min-w-52 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-7 py-5 text-sm font-semibold text-white shadow-[0_0_45px_rgba(8,145,178,.2)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut size={20} />
                  {actionLoading ? "Please wait..." : "Check out"}
                </button>
              ) : (
                <div className="inline-flex min-w-52 items-center justify-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[.08] px-7 py-5 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 size={20} />
                  Workday completed
                </div>
              )}

              <p className="text-[10px] text-slate-500">
                Attendance timezone: Asia/Kolkata
              </p>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            icon={Clock3}
            title="Check-in time"
            value={formatTime(attendance?.checkInAt)}
            description="Today's recorded arrival"
            color="bg-violet-400/10 text-violet-300"
          />

          <MetricCard
            icon={LogOut}
            title="Check-out time"
            value={formatTime(attendance?.checkOutAt)}
            description="Today's recorded departure"
            color="bg-cyan-400/10 text-cyan-300"
          />

          <MetricCard
            icon={Timer}
            title="Working time"
            value={formatMinutes(workedMinutes)}
            description={checkedOut ? "Final recorded duration" : checkedIn ? "Elapsed time since check-in" : "Not started"}
            color="bg-emerald-400/10 text-emerald-300"
          />
        </div>

        {/* History filters */}
        <section className="attendance-reveal rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5">
          <div className="mb-4 flex items-center gap-2">
            <CircleDot size={16} className="text-violet-300" />
            <h2 className="text-sm font-semibold">Attendance history</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, status: e.target.value }));
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-[#090c19] px-4 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
            >
              <option value="ALL">All statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="HALF_DAY">Half day</option>
              <option value="ABSENT">Absent</option>
            </select>

            <input
              type="date"
              value={filters.fromDate}
              max={today}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, fromDate: e.target.value }));
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-[#090c19] px-4 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
            />

            <input
              type="date"
              value={filters.toDate}
              max={today}
              min={filters.fromDate || undefined}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, toDate: e.target.value }));
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-[#090c19] px-4 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
            />
          </div>

          <div className="mt-3 flex justify-between text-[10px] text-slate-500">
            <span>{pagination.total} total attendance records</span>

            <button
              type="button"
              onClick={clearFilters}
              className="text-violet-300 hover:text-white"
            >
              Clear filters
            </button>
          </div>
        </section>

        {/* History table */}
        <section className="attendance-reveal overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90">
          <div className="border-b border-white/[.06] px-5 py-5 sm:px-6">
            <h2 className="font-display text-base font-semibold">
              Your attendance records
            </h2>

            <p className="mt-1 text-[10px] text-slate-500">
              Your personal attendance history.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b border-white/[.06] text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-4 py-4 font-medium">Check-in</th>
                  <th className="px-4 py-4 font-medium">Check-out</th>
                  <th className="px-4 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {history.map((record) => (
                  <tr key={record._id} className="border-b border-white/[.04] hover:bg-white/[.025]">
                    <td className="px-6 py-4 text-xs text-slate-300">
                      {formatDate(record.attendanceDate)}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-400">
                      {formatTime(record.checkInAt)}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-400">
                      {formatTime(record.checkOutAt)}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-300">
                      {formatMinutes(record.workedMinutes)}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={record.status} />
                      {record.isLate && (
                        <span className="ml-2 text-[9px] text-amber-300">
                          Late arrival
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {history.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <Clock3 className="mx-auto h-8 w-8 text-slate-600" />
                      <p className="mt-3 text-sm text-slate-300">
                        No attendance records found.
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Your attendance history will appear here.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between border-t border-white/[.06] px-5 py-4">
            <p className="text-[10px] text-slate-500">
              Page {page} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 disabled:opacity-30"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((value) => value + 1)}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center gap-2 border-t border-white/[.06] pt-5 text-[10px] text-slate-600">
          <ShieldCheck size={14} />
          Attendance timestamps are recorded by the server.
        </div>
      </div>
    </main>
    
  );
}
