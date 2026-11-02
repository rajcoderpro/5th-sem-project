import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  FileClock,
  Filter,
  LogOut,
  MessageSquareText,
  RefreshCw,
  Search,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { apiGet, apiRequest } from "../../services/api.js";

const LEAVE_TYPES = [
  { value: "CASUAL", label: "Casual leave" },
  { value: "SICK", label: "Sick leave" },
  { value: "EARNED", label: "Earned leave" },
  { value: "UNPAID", label: "Unpaid leave" },
  { value: "OTHER", label: "Other" },
];

const LEAVE_STATUSES = [
  { value: "ALL", label: "All requests" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_STYLES = {
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

function dateKey(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDate(value) {
  const key = dateKey(value);
  if (!key) return "—";

  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function getLeaveDays(leave) {
  const start = dateKey(leave.startDate);
  const end = dateKey(leave.endDate);
  if (!start || !end) return 0;

  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const startValue = Date.UTC(sy, sm - 1, sd);
  const endValue = Date.UTC(ey, em - 1, ed);

  return Math.max(0, Math.round((endValue - startValue) / 86400000) + 1);
}

function formatStatus(value) {
  return String(value || "UNKNOWN").replaceAll("_", " ");
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-wide ${STATUS_STYLES[status] || "border-white/10 bg-white/5 text-slate-400"}`}>
      {formatStatus(status)}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone }) {
  return (
    <article className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-white">{value}</p>
          <p className="mt-2 text-[10px] text-slate-600">{detail}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[.06] ${tone}`}>
          <Icon size={19} />
        </span>
      </div>
    </article>
  );
}

function LeaveRequestModal({ onClose, onSubmit, submitting }) {
  const today = getISTDate();
  const [form, setForm] = useState({
    leaveType: "CASUAL",
    startDate: today,
    endDate: today,
    reason: "",
  });
  const [error, setError] = useState("");

  const inputClass = "mt-2 w-full rounded-xl border border-white/10 bg-[#090c19] px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/50 [color-scheme:dark]";

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === "startDate" && current.endDate < value) {
        return { ...current, startDate: value, endDate: value };
      }
      return { ...current, [name]: value };
    });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.startDate < today) {
      setError("Please select today or a future date.");
      return;
    }

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

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="leave-request-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-violet-400/20 bg-[#101323] p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[.18em] text-violet-300">LEAVE MANAGEMENT</p>
            <h2 id="leave-request-title" className="mt-2 font-display text-xl font-semibold text-white">Request time off</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Your request will be sent to an administrator for review.</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close leave request" className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="employee-leave-type" className="text-xs font-medium text-slate-300">Leave type</label>
            <select id="employee-leave-type" name="leaveType" value={form.leaveType} onChange={updateField} className={inputClass}>
              {LEAVE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="employee-leave-start" className="text-xs font-medium text-slate-300">Start date</label>
              <input id="employee-leave-start" name="startDate" type="date" min={today} value={form.startDate} onChange={updateField} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="employee-leave-end" className="text-xs font-medium text-slate-300">End date</label>
              <input id="employee-leave-end" name="endDate" type="date" min={form.startDate || today} value={form.endDate} onChange={updateField} required className={inputClass} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="employee-leave-reason" className="text-xs font-medium text-slate-300">Reason</label>
              <span className="text-[10px] text-slate-600">{form.reason.length}/1000</span>
            </div>
            <textarea id="employee-leave-reason" name="reason" rows={4} maxLength={1000} value={form.reason} onChange={updateField} placeholder="Briefly explain your leave request..." required className={`${inputClass} resize-y`} />
          </div>

          {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-xl border border-white/10 px-5 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              <CalendarPlus size={15} /> {submitting ? "Submitting..." : "Submit request"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function EmployeeLeavePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  const loadLeaves = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const response = await apiGet("/api/leaves/me?page=1&limit=100");
      setLeaves(Array.isArray(response.leaves) ? response.leaves : []);
      setTotal(Number(response.pagination?.total ?? response.leaves?.length ?? 0));
    } catch (loadError) {
      setError(loadError.message || "Unable to load your leave requests.");
      setLeaves([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const counts = useMemo(() => {
    const pending = leaves.filter((leave) => leave.status === "PENDING").length;
    const approved = leaves.filter((leave) => leave.status === "APPROVED").length;
    const rejected = leaves.filter((leave) => leave.status === "REJECTED").length;
    const today = getISTDate();
    const upcomingApprovedDays = leaves
      .filter((leave) => leave.status === "APPROVED" && dateKey(leave.endDate) >= today)
      .reduce((sum, leave) => {
        const start = dateKey(leave.startDate) < today ? today : dateKey(leave.startDate);
        return sum + getLeaveDays({ startDate: start, endDate: leave.endDate });
      }, 0);

    return { pending, approved, rejected, upcomingApprovedDays };
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leaves.filter((leave) => {
      if (statusFilter !== "ALL" && leave.status !== statusFilter) return false;
      if (typeFilter !== "ALL" && leave.leaveType !== typeFilter) return false;
      if (!query) return true;

      const searchable = [
        leave.leaveType,
        leave.reason,
        leave.adminRemarks,
        leave.status,
      ].filter(Boolean).join(" ").toLowerCase();

      return searchable.includes(query);
    });
  }, [leaves, search, statusFilter, typeFilter]);

  const handleSubmitLeave = async (formData) => {
    setSubmitting(true);

    try {
      const response = await apiRequest("/api/leaves", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setNotice(response.message || "Leave request submitted successfully.");
      setModalOpen(false);
      setStatusFilter("ALL");
      setTypeFilter("ALL");
      setSearch("");
      await loadLeaves(true);
    } catch (submitError) {
      throw submitError;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (leave) => {
    const confirmed = window.confirm("Cancel this pending leave request?");
    if (!confirmed) return;

    setCancellingId(leave._id);
    setError("");
    setNotice("");

    try {
      const response = await apiRequest(`/api/leaves/${leave._id}/cancel`, {
        method: "PATCH",
      });

      setNotice(response.message || "Leave request cancelled successfully.");
      await loadLeaves(true);
    } catch (cancelError) {
      setError(cancelError.message || "Unable to cancel this leave request.");
    } finally {
      setCancellingId("");
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

  const employeeName = user?.name || "Employee";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070914] px-5 py-8 text-white sm:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-20 animate-pulse rounded-2xl bg-white/[.04]" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white/[.04]" />)}</div>
          <div className="h-96 animate-pulse rounded-2xl bg-white/[.04]" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070914] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-700/[.09] blur-[130px]" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-cyan-600/[.06] blur-[130px]" />
        <div className="grid-overlay absolute inset-0 opacity-[.10]" />
      </div>

      <header className="relative z-10 flex min-h-[76px] items-center justify-between border-b border-white/[.07] bg-[#090b18]/85 px-5 backdrop-blur-xl sm:px-8">
        <Link to="/employee/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10"><Sparkles className="h-5 w-5 text-violet-300" /></span>
          <span className="font-display text-base font-bold">WorkForce<span className="text-violet-400"> AI</span><span className="mt-0.5 block text-[9px] font-normal tracking-[.2em] text-slate-500">EMPLOYEE WORKSPACE</span></span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-xs text-slate-500 md:block">{employeeName}</span>
          <Link to="/employee/dashboard" className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-300 transition hover:border-violet-400/30 hover:text-white sm:inline-flex"><ArrowLeft size={14} /> Dashboard</Link>
          <Link to="/employee/tasks" className="hidden items-center gap-2 rounded-xl border border-violet-400/15 bg-violet-400/[.05] px-3 py-2.5 text-xs text-violet-200 transition hover:bg-violet-400/[.1] sm:inline-flex"><FileClock size={14} /> My tasks</Link>
          <Link to="/employee/attendance" className="hidden items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[.05] px-3 py-2.5 text-xs text-cyan-200 transition hover:bg-cyan-400/[.1] sm:inline-flex"><Clock3 size={14} /> Attendance</Link>
          <button type="button" onClick={() => loadLeaves(true)} disabled={refreshing} aria-label="Refresh leave requests" className="rounded-xl border border-white/10 p-2.5 text-slate-400 transition hover:border-violet-400/30 hover:text-violet-200 disabled:opacity-50"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /></button>
          <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-400 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300"><LogOut size={14} /><span className="hidden sm:inline">Logout</span></button>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl space-y-7 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[.2em] text-violet-300">EMPLOYEE / LEAVE MANAGEMENT</p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Take time when <span className="text-violet-300">you need it.</span></h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Submit leave requests, follow their review status, and keep your time-off history in one place.</p>
          </div>
          <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-xs font-semibold text-white shadow-[0_0_35px_rgba(124,58,237,.18)] transition hover:-translate-y-0.5">
            <CalendarPlus size={15} /> Request leave
          </button>
        </section>

        {error && <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/[.08] px-4 py-3 text-xs text-red-300"><span>{error}</span><button type="button" aria-label="Dismiss error" onClick={() => setError("")}><X size={14} /></button></div>}
        {notice && <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[.08] px-4 py-3 text-xs text-emerald-300"><span>{notice}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={14} /></button></div>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={CalendarDays} label="Total requests" value={total} detail="Your recorded leave applications" tone="bg-violet-400/10 text-violet-300" />
          <MetricCard icon={Clock3} label="Awaiting review" value={counts.pending} detail="Requests awaiting an admin decision" tone="bg-amber-400/10 text-amber-300" />
          <MetricCard icon={CheckCircle2} label="Approved" value={counts.approved} detail="Requests approved by an administrator" tone="bg-emerald-400/10 text-emerald-300" />
          <MetricCard icon={CalendarPlus} label="Upcoming approved days" value={counts.upcomingApprovedDays} detail="Calendar days from today onward" tone="bg-cyan-400/10 text-cyan-300" />
        </section>

        <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-[10px] font-semibold tracking-[.18em] text-violet-300">YOUR TIME OFF</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-white">Leave history</h2>
              <p className="mt-1 text-[11px] text-slate-600">Showing your latest {leaves.length} of {total} request{total === 1 ? "" : "s"}.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:min-w-56">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reason or remarks..." className="w-full rounded-xl border border-white/10 bg-[#090c19] py-2.5 pl-9 pr-3 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-400/40" />
              </label>
              <label className="relative flex items-center rounded-xl border border-white/10 bg-[#090c19] px-3">
                <Filter size={14} className="mr-2 shrink-0 text-slate-500" />
                <select aria-label="Filter by leave type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="w-full bg-transparent py-2.5 pr-5 text-xs text-slate-300 outline-none [color-scheme:dark]">
                  <option value="ALL">All types</option>
                  {LEAVE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {LEAVE_STATUSES.map((status) => {
              const count = status.value === "ALL" ? leaves.length : leaves.filter((leave) => leave.status === status.value).length;
              const active = statusFilter === status.value;
              return (
                <button key={status.value} type="button" onClick={() => setStatusFilter(status.value)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-semibold transition ${active ? "border-violet-400/30 bg-violet-400/[.12] text-violet-200" : "border-white/[.07] bg-white/[.02] text-slate-500 hover:border-white/15 hover:text-slate-300"}`}>
                  {status.label}<span className={`rounded-md px-1.5 py-0.5 text-[9px] tabular-nums ${active ? "bg-violet-400/15 text-violet-200" : "bg-white/[.05] text-slate-600"}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 space-y-3">
            {filteredLeaves.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-5 py-14 text-center">
                <FileClock className="mx-auto text-slate-600" size={25} />
                <p className="mt-3 text-sm font-medium text-slate-300">{leaves.length ? "No matching leave requests" : "No leave requests yet"}</p>
                <p className="mt-1 text-xs text-slate-600">{leaves.length ? "Try changing your filters or search term." : "Your leave applications and their review status will appear here."}</p>
                {!leaves.length && <button type="button" onClick={() => setModalOpen(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/[.07] px-4 py-2.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-400/[.12]"><CalendarPlus size={14} /> Create your first request</button>}
              </div>
            ) : (
              filteredLeaves.map((leave) => {
                const canCancel = leave.status === "PENDING";
                const days = getLeaveDays(leave);
                return (
                  <article key={leave._id} className="rounded-2xl border border-white/[.07] bg-[#090c19]/65 p-4 transition hover:border-violet-400/20 sm:p-5">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-100">{formatStatus(leave.leaveType)}</h3>
                          <StatusBadge status={leave.status} />
                          <span className="rounded-full border border-white/[.07] bg-white/[.03] px-2.5 py-1 text-[9px] text-slate-500">{days} calendar day{days === 1 ? "" : "s"}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-2"><CalendarDays size={13} className="text-violet-300" /> {formatDate(leave.startDate)} <span className="text-slate-600">to</span> {formatDate(leave.endDate)}</span>
                          <span className="text-[10px] text-slate-600">Requested {formatDate(leave.createdAt)}</span>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-5 text-slate-400">{leave.reason}</p>
                        {leave.adminRemarks && (
                          <div className="mt-4 rounded-xl border border-cyan-400/10 bg-cyan-400/[.045] p-3">
                            <p className="flex items-center gap-2 text-[10px] font-semibold tracking-wide text-cyan-200"><MessageSquareText size={12} /> ADMIN REMARKS</p>
                            <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-slate-400">{leave.adminRemarks}</p>
                            {leave.reviewedBy?.name && <p className="mt-2 text-[10px] text-slate-600">Reviewed by {leave.reviewedBy.name}{leave.reviewedAt ? ` · ${formatDate(leave.reviewedAt)}` : ""}</p>}
                          </div>
                        )}
                      </div>

                      {canCancel && (
                        <button type="button" onClick={() => handleCancelLeave(leave)} disabled={Boolean(cancellingId)} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-red-400/15 bg-red-400/[.05] px-3.5 py-2.5 text-[10px] font-semibold text-red-300 transition hover:border-red-400/30 hover:bg-red-400/[.1] disabled:cursor-not-allowed disabled:opacity-50">
                          <XCircle size={13} /> {cancellingId === leave._id ? "Cancelling..." : "Cancel request"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {total > leaves.length && (
            <p className="mt-4 rounded-xl border border-amber-400/10 bg-amber-400/[.04] px-3 py-2.5 text-[10px] text-amber-200/80">
              Showing the latest {leaves.length} requests. Contact your administrator if you need older records beyond this view.
            </p>
          )}
        </section>

        <footer className="flex flex-col items-center justify-between gap-2 border-t border-white/[.06] pt-5 text-[10px] text-slate-600 sm:flex-row">
          <span>WorkForce AI · Employee workspace</span>
          <Link to="/employee/dashboard" className="inline-flex items-center gap-1.5 text-violet-300 transition hover:text-violet-200">Back to overview <ArrowRight size={12} /></Link>
        </footer>
      </div>

      {modalOpen && (
        <LeaveRequestModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitLeave}
          submitting={submitting}
        />
      )}
    </main>
  );
}
