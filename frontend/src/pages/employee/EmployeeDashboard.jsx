import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Cloud,
  FileClock,
  LogOut,
  RefreshCw,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { apiGet, apiRequest } from "../../services/api.js";

const EMPTY_DASHBOARD = {
  employee: null,
  tasks: [],
  leaves: [],
  todayAttendance: null,
  attendanceHistory: [],
};

const TASK_STATUS_STYLES = {
  TODO: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  IN_PROGRESS: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  BLOCKED: "border-red-400/20 bg-red-400/10 text-red-300",
  IN_REVIEW: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  COMPLETED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  CANCELLED: "border-slate-500/20 bg-slate-500/10 text-slate-500",
};

const PRIORITY_STYLES = {
  LOW: "text-slate-400",
  MEDIUM: "text-cyan-300",
  HIGH: "text-amber-300",
  URGENT: "text-red-300",
};

const LEAVE_STATUS_STYLES = {
  PENDING: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  APPROVED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  REJECTED: "border-red-400/20 bg-red-400/10 text-red-300",
  CANCELLED: "border-slate-500/20 bg-slate-500/10 text-slate-400",
};

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

function formatDate(value, options = {}) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    ...options,
  }).format(date);
}

function formatStatus(value) {
  return String(value || "UNKNOWN").replaceAll("_", " ");
}

function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date())
  );

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function StatCard({ icon: Icon, label, value, note, tone }) {
  return (
    <article className="group rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-white">
            {value}
          </p>
          <p className="mt-2 text-[11px] text-slate-600">{note}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[.06] ${tone}`}>
          <Icon size={20} />
        </div>
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="text-[10px] font-semibold tracking-[.18em] text-violet-300">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 font-display text-lg font-semibold text-white">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function StatusPill({ status, styles = TASK_STATUS_STYLES }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-wide ${styles[status] || "border-white/10 bg-white/5 text-slate-400"}`}>
      {formatStatus(status)}
    </span>
  );
}

function LeaveRequestModal({ onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({
    leaveType: "CASUAL",
    startDate: getISTDate(),
    endDate: getISTDate(),
    reason: "",
  });
  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.endDate < form.startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    if (!form.reason.trim()) {
      setError("Please provide a reason for your leave.");
      return;
    }

    try {
      await onSubmit({ ...form, reason: form.reason.trim() });
    } catch (submitError) {
      setError(submitError.message || "Unable to submit leave request.");
    }
  };

  const inputClass = "mt-2 w-full rounded-xl border border-white/10 bg-[#090c19] px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-modal-title"
        className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#101323] p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[.18em] text-violet-300">LEAVE MANAGEMENT</p>
            <h2 id="leave-modal-title" className="mt-2 font-display text-xl font-semibold">Request time off</h2>
            <p className="mt-1 text-xs text-slate-500">Your request will be sent to an administrator for review.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="leaveType" className="text-xs font-medium text-slate-300">Leave type</label>
            <select id="leaveType" name="leaveType" value={form.leaveType} onChange={updateField} className={inputClass}>
              <option value="CASUAL">Casual leave</option>
              <option value="SICK">Sick leave</option>
              <option value="EARNED">Earned leave</option>
              <option value="UNPAID">Unpaid leave</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="text-xs font-medium text-slate-300">Start date</label>
              <input id="startDate" name="startDate" type="date" min={getISTDate()} value={form.startDate} onChange={updateField} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="endDate" className="text-xs font-medium text-slate-300">End date</label>
              <input id="endDate" name="endDate" type="date" min={form.startDate || getISTDate()} value={form.endDate} onChange={updateField} required className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="text-xs font-medium text-slate-300">Reason</label>
            <textarea id="reason" name="reason" rows={4} maxLength={1000} value={form.reason} onChange={updateField} placeholder="Briefly explain your leave request..." required className={`${inputClass} resize-y`} />
            <p className="mt-1 text-right text-[10px] text-slate-600">{form.reason.length}/1000</p>
          </div>

          {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-xl border border-white/10 px-5 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              <CalendarPlus size={15} />
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadWarnings, setLoadWarnings] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const loadDashboard = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);

    setError("");
    setLoadWarnings([]);

    const requests = [
      { label: "employee profile", request: apiGet("/api/employees/me") },
      { label: "tasks", request: apiGet("/api/tasks/me?page=1&limit=100") },
      { label: "today's attendance", request: apiGet("/api/attendance/today") },
      { label: "attendance history", request: apiGet("/api/attendance/me?page=1&limit=100") },
      { label: "leave requests", request: apiGet("/api/leaves/me?page=1&limit=5") },
    ];

    try {
      const results = await Promise.allSettled(requests.map((item) => item.request));
      const next = { ...EMPTY_DASHBOARD };
      const warnings = [];

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          warnings.push(`${requests[index].label}: ${result.reason?.message || "request failed"}`);
          return;
        }

        const data = result.value;
        switch (index) {
          case 0:
            next.employee = data.employee || null;
            break;
          case 1:
            next.tasks = data.tasks || [];
            break;
          case 2:
            next.todayAttendance = data.attendance || null;
            break;
          case 3:
            next.attendanceHistory = data.attendance || [];
            break;
          case 4:
            next.leaves = data.leaves || [];
            break;
          default:
            break;
        }
      });

      setDashboard(next);
      setLoadWarnings(warnings);

      if (!next.employee && warnings.some((warning) => warning.startsWith("employee profile:"))) {
        setError("We couldn't load your employee profile. Please sign in again or contact your administrator.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  const employee = dashboard.employee;
  const employeeName = employee?.userId?.name || user?.name || "there";
  const departmentName = employee?.departmentId?.name || "Department not assigned";
  const designation = employee?.designation || "Employee";
  const tasks = dashboard.tasks;
  const leaves = dashboard.leaves;
  const attendance = dashboard.todayAttendance;

  const taskSummary = useMemo(() => {
    const active = tasks.filter((task) => !["COMPLETED", "CANCELLED"].includes(task.status));
    const completed = tasks.filter((task) => task.status === "COMPLETED").length;
    const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
    const remainingHours = active.reduce((total, task) => {
      return total + Math.max(0, Number(task.estimatedHours || 0) - Number(task.actualHours || 0));
    }, 0);

    return { active, completed, inProgress, remainingHours };
  }, [tasks]);

  const attendanceSummary = useMemo(() => {
    const month = getISTDate().slice(0, 7);
    const currentMonth = dashboard.attendanceHistory.filter((record) => {
      return String(record.attendanceDate || "").slice(0, 7) === month;
    });
    const presentDays = currentMonth.filter((record) => ["PRESENT", "LATE"].includes(record.status)).length;
    const lateDays = currentMonth.filter((record) => record.status === "LATE").length;
    return { presentDays, lateDays, recordedDays: currentMonth.length };
  }, [dashboard.attendanceHistory]);

  const weeklyCapacity = Number(employee?.capacity?.weeklyHours || 40);
  const workloadPercent = weeklyCapacity > 0
    ? Math.min(100, Math.round((taskSummary.remainingHours / weeklyCapacity) * 100))
    : 0;

  const sortedTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => !["COMPLETED", "CANCELLED"].includes(task.status))
      .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
      .slice(0, 5);
  }, [tasks]);

  const handleRefresh = async () => {
    setNotice("");
    await loadDashboard(false);
  };

  const handleLeaveSubmit = async (formData) => {
    setSubmittingLeave(true);
    try {
      const response = await apiRequest("/api/leaves", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setNotice(response.message || "Leave request submitted successfully.");
      setLeaveModalOpen(false);
      await loadDashboard(false);
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (logoutError) {
      console.error("Logout request failed:", logoutError);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070914] px-5 py-8 text-white sm:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-20 animate-pulse rounded-2xl bg-white/[.04]" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white/[.04]" />)}
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <div className="h-80 animate-pulse rounded-2xl bg-white/[.04]" />
            <div className="h-80 animate-pulse rounded-2xl bg-white/[.04]" />
          </div>
        </div>
      </main>
    );
  }

  const todayLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const todayStatus = attendance?.status || "NOT MARKED";
  const todayCheckIn = attendance?.checkInAt
    ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(attendance.checkInAt))
    : "Not checked in";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070914] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-700/[.09] blur-[130px]" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-cyan-600/[.06] blur-[130px]" />
        <div className="grid-overlay absolute inset-0 opacity-[.10]" />
      </div>

      <header className="relative z-10 flex min-h-[76px] items-center justify-between border-b border-white/[.07] bg-[#090b18]/85 px-5 backdrop-blur-xl sm:px-8">
        <Link to="/employee/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
            <Sparkles className="h-5 w-5 text-violet-300" />
          </span>
          <span className="font-display text-base font-bold">
            WorkForce<span className="text-violet-400"> AI</span>
            <span className="mt-0.5 block text-[9px] font-normal tracking-[.2em] text-slate-500">EMPLOYEE WORKSPACE</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden text-xs text-slate-500 md:block">{todayLabel}</span>
          <div className="hidden h-8 w-px bg-white/10 md:block" />
          <div className="hidden text-right sm:block">
            <p className="max-w-40 truncate text-xs font-semibold text-slate-200">{employeeName}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Employee</p>
          </div>
          <button type="button" onClick={handleRefresh} disabled={refreshing} aria-label="Refresh dashboard" className="rounded-xl border border-white/10 p-2.5 text-slate-400 transition hover:border-violet-400/30 hover:text-violet-200 disabled:opacity-50">
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-400 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300">
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl space-y-7 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[.2em] text-violet-300">EMPLOYEE / OVERVIEW</p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {getGreeting()}, {employeeName.split(" ")[0]}<span className="text-violet-300">.</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500">Here's your workday at a glance.</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[.08] bg-white/[.03] px-3 py-1.5"><BriefcaseBusiness size={12} className="text-violet-300" />{designation}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[.08] bg-white/[.03] px-3 py-1.5"><Users size={12} className="text-cyan-300" />{departmentName}</span>
              {employee?.employeeCode && <span className="rounded-full border border-white/[.08] bg-white/[.03] px-3 py-1.5">{employee.employeeCode}</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/employee/tasks" className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/[.08] px-4 py-3 text-xs font-semibold text-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-400/[.14]">
              <ClipboardList size={15} /> My tasks
            </Link>
            <Link to="/employee/attendance" className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[.07] px-4 py-3 text-xs font-semibold text-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-400/[.12]">
              <Clock3 size={15} /> Attendance
            </Link>
            <Link to="/employee/leaves" className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[.07] px-4 py-3 text-xs font-semibold text-amber-200 transition hover:-translate-y-0.5 hover:bg-amber-400/[.12]">
              <FileClock size={15} /> Leave history
            </Link>
            <button type="button" onClick={() => setLeaveModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-[0_0_35px_rgba(124,58,237,.18)] transition hover:-translate-y-0.5">
              <CalendarPlus size={15} /> Request leave
            </button>
          </div>
        </section>

        {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[.08] px-4 py-3 text-xs text-red-300">{error}</div>}
        {loadWarnings.length > 0 && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[.07] px-4 py-3 text-xs text-amber-200">
            Some dashboard information could not be loaded: {loadWarnings.join("; ")}
          </div>
        )}
        {notice && <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[.08] px-4 py-3 text-xs text-emerald-300"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={14} /></button></div>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={ClipboardList} label="Open tasks" value={taskSummary.active.length} note="Tasks assigned to you" tone="bg-violet-400/10 text-violet-300" />
          <StatCard icon={Activity} label="In progress" value={taskSummary.inProgress} note="Tasks currently underway" tone="bg-blue-400/10 text-blue-300" />
          <StatCard icon={CheckCircle2} label="Completed tasks" value={taskSummary.completed} note="All-time completed tasks" tone="bg-emerald-400/10 text-emerald-300" />
          <StatCard icon={CalendarDays} label="Present this month" value={attendanceSummary.presentDays} note={`${attendanceSummary.lateDays} late day${attendanceSummary.lateDays === 1 ? "" : "s"} · ${attendanceSummary.recordedDays} records`} tone="bg-cyan-400/10 text-cyan-300" />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
          <div className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
            <SectionHeading eyebrow="YOUR WORKLOAD" title="Task overview" action={<Link to="/employee/tasks" className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-300 transition hover:text-violet-200">View all tasks <ArrowRight size={12} /></Link>} />

            <div className="rounded-xl border border-white/[.06] bg-[#090c19]/80 p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">Estimated remaining effort</p>
                  <p className="mt-1 font-display text-2xl font-semibold">{taskSummary.remainingHours.toFixed(1)} <span className="text-sm font-medium text-slate-500">hrs</span></p>
                </div>
                <p className="text-right text-[10px] text-slate-500">Weekly capacity<br /><span className="text-sm font-semibold text-slate-300">{weeklyCapacity} hrs</span></p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[.06]">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style={{ width: `${workloadPercent}%` }} />
              </div>
              <p className="mt-2 text-[10px] text-slate-600">Indicative workload compared with your configured weekly capacity.</p>
            </div>

            <div className="mt-5 space-y-3">
              {sortedTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
                  <ClipboardList className="mx-auto text-slate-600" size={23} />
                  <p className="mt-3 text-sm font-medium text-slate-300">No open tasks</p>
                  <p className="mt-1 text-xs text-slate-600">New assignments will appear here.</p>
                </div>
              ) : sortedTasks.map((task) => (
                <article key={task._id} className="rounded-xl border border-white/[.06] bg-white/[.02] p-4 transition hover:border-violet-400/20">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-semibold text-slate-200">{task.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{task.description || "No description provided."}</p>
                    </div>
                    <span className={`shrink-0 text-[9px] font-bold tracking-[.12em] ${PRIORITY_STYLES[task.priority] || "text-slate-400"}`}>{task.priority || "MEDIUM"}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusPill status={task.status} />
                    <span className="text-[10px] text-slate-500">Due {formatDate(task.dueDate, { year: "numeric" })}</span>
                    <span className="ml-auto text-[10px] tabular-nums text-slate-500">{Number(task.progressPercentage || 0)}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400" style={{ width: `${Math.max(0, Math.min(100, Number(task.progressPercentage || 0)))}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
              <SectionHeading eyebrow="TODAY" title="Attendance" action={<Link to="/employee/attendance" className="text-[10px] font-semibold text-cyan-300 hover:text-cyan-200">View history <ArrowRight size={12} className="ml-1 inline" /></Link>} />
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[.06] bg-[#090c19]/80 p-4">
                <div>
                  <p className="text-[10px] text-slate-500">Current status</p>
                  <p className="mt-1 font-display text-lg font-semibold">{formatStatus(todayStatus)}</p>
                  <p className="mt-1 text-[10px] text-slate-500">Check-in: {todayCheckIn}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[.08] text-cyan-300">
                  <Clock3 size={20} />
                </div>
              </div>
              <Link to="/employee/attendance" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[.06] px-4 py-3 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/[.1]">
                Manage attendance <ArrowRight size={14} />
              </Link>
            </section>

            <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
              <SectionHeading eyebrow="PROFILE" title="Your details" />
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[.08] text-violet-200"><UserRound size={19} /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-200">{employeeName}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{employee?.userId?.email || user?.email || "—"}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[.025] p-3"><p className="text-[10px] text-slate-600">Work mode</p><p className="mt-1 text-xs font-medium text-slate-300">{formatStatus(employee?.workMode || "ONSITE")}</p></div>
                <div className="rounded-xl bg-white/[.025] p-3"><p className="text-[10px] text-slate-600">Joined</p><p className="mt-1 text-xs font-medium text-slate-300">{formatDate(employee?.joiningDate, { year: "numeric" })}</p></div>
              </div>
              {employee?.skills?.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-[10px] font-semibold tracking-wide text-slate-500">SKILLS</p>
                  <div className="flex flex-wrap gap-2">
                    {employee.skills.slice(0, 6).map((skill) => <span key={skill._id || skill.name} className="rounded-lg border border-white/[.07] bg-white/[.03] px-2.5 py-1.5 text-[10px] text-slate-400">{skill.name} <span className="text-violet-300">· {skill.proficiencyLevel}/5</span></span>)}
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>

        <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
          <SectionHeading
            eyebrow="TIME OFF"
            title="Recent leave requests"
            action={<div className="flex items-center gap-3"><Link to="/employee/leaves" className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-300 transition hover:text-cyan-200">Manage all <ArrowRight size={12} /></Link><button type="button" onClick={() => setLeaveModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/20 bg-violet-400/[.07] px-3 py-2 text-[10px] font-semibold text-violet-200 transition hover:bg-violet-400/[.12]"><CalendarPlus size={13} /> New request</button></div>}
          />
          {leaves.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
              <FileClock className="mx-auto text-slate-600" size={23} />
              <p className="mt-3 text-sm font-medium text-slate-300">No leave requests yet</p>
              <p className="mt-1 text-xs text-slate-600">Your leave applications and their review status will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-white/[.07] text-[10px] uppercase tracking-wider text-slate-600">
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Dates</th>
                    <th className="pb-3 pr-4 font-medium">Reason</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id} className="border-b border-white/[.04] last:border-0">
                      <td className="py-4 pr-4 text-xs font-semibold text-slate-300">{formatStatus(leave.leaveType)}</td>
                      <td className="py-4 pr-4 text-xs text-slate-400">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</td>
                      <td className="max-w-56 truncate py-4 pr-4 text-xs text-slate-500" title={leave.reason}>{leave.reason}</td>
                      <td className="py-4"><StatusPill status={leave.status} styles={LEAVE_STATUS_STYLES} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="flex flex-col items-center justify-between gap-2 border-t border-white/[.06] pt-5 text-[10px] text-slate-600 sm:flex-row">
          <span>WorkForce AI · Employee workspace</span>
          <span className="inline-flex items-center gap-1.5"><Cloud size={12} /> Your information is synced with the workforce system</span>
        </footer>
      </div>

      {leaveModalOpen && (
        <LeaveRequestModal
          onClose={() => setLeaveModalOpen(false)}
          onSubmit={handleLeaveSubmit}
          submitting={submittingLeave}
        />
      )}
    </main>
  );
}
