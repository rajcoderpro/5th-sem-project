import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileClock,
  Filter,
  MessageSquareText,
  RefreshCw,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { apiGet, apiRequest } from "../../services/api.js";

const LIMIT = 10;

const LEAVE_TYPES = [
  { value: "CASUAL", label: "Casual" },
  { value: "SICK", label: "Sick" },
  { value: "EARNED", label: "Earned" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "OTHER", label: "Other" },
];

const STATUS_STYLES = {
  PENDING: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  APPROVED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  REJECTED: "border-red-400/20 bg-red-400/10 text-red-300",
  CANCELLED: "border-slate-500/20 bg-slate-500/10 text-slate-400",
};

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
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function leaveDays(leave) {
  const start = dateKey(leave.startDate);
  const end = dateKey(leave.endDate);
  if (!start || !end) return 0;
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  return Math.max(0, Math.round((Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86400000) + 1);
}

function titleCase(value) {
  return String(value || "—")
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-wide ${STATUS_STYLES[status] || "border-white/10 bg-white/5 text-slate-400"}`}>
      {titleCase(status)}
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

function ReviewModal({ leave, status, onClose, onConfirm, submitting }) {
  const [remarks, setRemarks] = useState("");
  const approving = status === "APPROVED";
  const employee = leave?.employeeId;
  const employeeName = employee?.userId?.name || "Employee";

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm(remarks.trim());
  };

  if (!leave) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && !submitting && onClose()}>
      <form onSubmit={handleSubmit} className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0d1020] shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between border-b border-white/[.07] px-5 py-5 sm:px-6">
          <div>
            <p className={`text-[10px] font-semibold uppercase tracking-[.18em] ${approving ? "text-emerald-300" : "text-red-300"}`}>Leave review</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-white">{approving ? "Approve request" : "Reject request"}</h2>
            <p className="mt-1 text-xs text-slate-500">{employeeName} · {titleCase(leave.leaveType)} leave</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close review dialog" className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-4">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">Requested dates</span>
              <span className="text-right font-medium text-slate-200">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Duration</span>
              <span className="font-medium text-slate-200">{leaveDays(leave)} calendar day{leaveDays(leave) === 1 ? "" : "s"}</span>
            </div>
            <p className="mt-3 border-t border-white/[.07] pt-3 text-xs leading-5 text-slate-400">{leave.reason}</p>
          </div>

          <label className="block text-xs font-medium text-slate-300">
            Admin remarks <span className="font-normal text-slate-600">(optional, max 500 characters)</span>
            <textarea value={remarks} onChange={(event) => setRemarks(event.target.value.slice(0, 500))} rows={3} maxLength={500} placeholder={approving ? "Add an approval note..." : "Explain why this request is being rejected..."} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#090c19] px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-400/50" />
            <span className="mt-1 block text-right text-[10px] text-slate-600">{remarks.length}/500</span>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-white/[.07] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/[.04] disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={submitting} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${approving ? "bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25" : "bg-red-400/15 text-red-200 hover:bg-red-400/25"}`}>
            {approving ? <Check size={15} /> : <XCircle size={15} />}
            {submitting ? "Saving..." : approving ? "Confirm approval" : "Confirm rejection"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, cancelled: 0 });
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: "PENDING", leaveType: "ALL" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("APPROVED");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    setError("");

    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (filters.status !== "ALL") params.set("status", filters.status);
    if (filters.leaveType !== "ALL") params.set("leaveType", filters.leaveType);

    try {
      const [listResult, pendingResult, approvedResult, rejectedResult, cancelledResult] = await Promise.all([
        apiGet(`/api/leaves?${params.toString()}`),
        apiGet("/api/leaves?status=PENDING&page=1&limit=1"),
        apiGet("/api/leaves?status=APPROVED&page=1&limit=1"),
        apiGet("/api/leaves?status=REJECTED&page=1&limit=1"),
        apiGet("/api/leaves?status=CANCELLED&page=1&limit=1"),
      ]);

      setLeaves(listResult.leaves || []);
      setPagination({
        page: listResult.pagination?.page || page,
        total: listResult.pagination?.total || 0,
        totalPages: Math.max(1, listResult.pagination?.totalPages || 1),
      });
      setCounts({
        pending: pendingResult.pagination?.total || 0,
        approved: approvedResult.pagination?.total || 0,
        rejected: rejectedResult.pagination?.total || 0,
        cancelled: cancelledResult.pagination?.total || 0,
      });
    } catch (loadError) {
      console.error("Admin leave loading error:", loadError);
      setError(loadError.message || "Unable to load leave requests.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const visibleLeaves = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return leaves;

    return leaves.filter((leave) => {
      const employee = leave.employeeId;
      const values = [
        employee?.userId?.name,
        employee?.userId?.email,
        employee?.employeeCode,
        employee?.designation,
        employee?.departmentId?.name,
        leave.leaveType,
        leave.status,
        leave.reason,
      ];
      return values.some((value) => String(value || "").toLowerCase().includes(query));
    });
  }, [leaves, search]);

  const handleFilterChange = (name, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const openReview = (leave, status) => {
    setReviewTarget(leave);
    setReviewStatus(status);
  };

  const handleReview = async (adminRemarks) => {
    if (!reviewTarget?._id || submitting) return;
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const result = await apiRequest(`/api/leaves/${reviewTarget._id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status: reviewStatus, adminRemarks }),
      });
      setReviewTarget(null);
      setNotice(result.message || `Leave request ${reviewStatus.toLowerCase()} successfully.`);
      await loadData(false);
    } catch (reviewError) {
      setError(reviewError.message || "Unable to review this leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const metrics = [
    { label: "Pending requests", value: counts.pending, detail: "Awaiting your review", icon: Clock3, tone: "border-amber-400/10 bg-amber-400/[.08] text-amber-300" },
    { label: "Approved", value: counts.approved, detail: "Approved leave requests", icon: CheckCircle2, tone: "border-emerald-400/10 bg-emerald-400/[.08] text-emerald-300" },
    { label: "Rejected", value: counts.rejected, detail: "Requests not approved", icon: XCircle, tone: "border-red-400/10 bg-red-400/[.08] text-red-300" },
    { label: "Cancelled", value: counts.cancelled, detail: "Withdrawn by employees", icon: FileClock, tone: "border-slate-400/10 bg-slate-400/[.08] text-slate-300" },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <Link to="/admin/dashboard" className="mb-4 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-violet-300"><ArrowLeft size={14} /> Back to overview</Link>
          <p className="text-xs font-medium uppercase tracking-[.18em] text-violet-300">PEOPLE OPERATIONS</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Leave management</h1>
          <p className="mt-2 text-sm text-slate-500">Review employee leave requests and record your decision.</p>
        </div>
        <button type="button" onClick={() => loadData(false)} disabled={loading || refreshing} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto">
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh requests"}
        </button>
      </div>

      {notice && <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[.07] px-4 py-3 text-xs text-emerald-200"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><X size={15} /></button></div>}
      {error && <div className="flex items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/[.07] px-4 py-3 text-xs text-red-200"><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Dismiss error"><X size={15} /></button></div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90">
        <div className="flex flex-col gap-4 border-b border-white/[.07] p-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <div className="flex items-center gap-2"><Users size={17} className="text-violet-300" /><h2 className="font-display text-lg font-semibold">Employee requests</h2></div>
            <p className="mt-1 text-xs text-slate-500">{pagination.total} request{pagination.total === 1 ? "" : "s"} in this view</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[540px]">
            <label className="relative flex items-center rounded-xl border border-white/10 bg-[#090c19] px-3 sm:col-span-1">
              <Search size={14} className="mr-2 shrink-0 text-slate-500" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this page..." className="w-full bg-transparent py-2.5 text-xs text-slate-300 outline-none placeholder:text-slate-600" />
            </label>
            <label className="relative flex items-center rounded-xl border border-white/10 bg-[#090c19] px-3">
              <Filter size={14} className="mr-2 shrink-0 text-slate-500" />
              <select value={filters.status} onChange={(event) => handleFilterChange("status", event.target.value)} aria-label="Filter by leave status" className="w-full bg-transparent py-2.5 pr-5 text-xs text-slate-300 outline-none [color-scheme:dark]">
                <option className="bg-[#090c19]" value="PENDING">Pending first</option>
                <option className="bg-[#090c19]" value="ALL">All statuses</option>
                <option className="bg-[#090c19]" value="APPROVED">Approved</option>
                <option className="bg-[#090c19]" value="REJECTED">Rejected</option>
                <option className="bg-[#090c19]" value="CANCELLED">Cancelled</option>
              </select>
            </label>
            <label className="relative flex items-center rounded-xl border border-white/10 bg-[#090c19] px-3">
              <CalendarDays size={14} className="mr-2 shrink-0 text-slate-500" />
              <select value={filters.leaveType} onChange={(event) => handleFilterChange("leaveType", event.target.value)} aria-label="Filter by leave type" className="w-full bg-transparent py-2.5 pr-5 text-xs text-slate-300 outline-none [color-scheme:dark]">
                <option className="bg-[#090c19]" value="ALL">All types</option>
                {LEAVE_TYPES.map((type) => <option className="bg-[#090c19]" key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">{[1, 2, 3, 4].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-white/[.03]" />)}</div>
        ) : visibleLeaves.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-400/[.07] text-violet-300"><CalendarDays size={23} /></span>
            <h3 className="mt-4 text-sm font-semibold text-slate-200">{search ? "No matching requests" : filters.status === "PENDING" ? "You're all caught up" : "No leave requests found"}</h3>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{search ? "Try another employee name, email, department or keyword." : filters.status === "PENDING" ? "There are no pending leave requests waiting for approval." : "Try changing the selected filters."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-white/[.06] bg-white/[.02] text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium lg:px-6">Employee</th>
                  <th className="px-4 py-4 font-medium">Leave details</th>
                  <th className="px-4 py-4 font-medium">Dates & duration</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium lg:px-6">Review action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[.05]">
                {visibleLeaves.map((leave) => {
                  const employee = leave.employeeId || {};
                  const person = employee.userId || {};
                  const days = leaveDays(leave);
                  return (
                    <tr key={leave._id} className="transition hover:bg-white/[.02]">
                      <td className="px-5 py-4 lg:px-6">
                        <p className="text-xs font-semibold text-slate-200">{person.name || "Unknown employee"}</p>
                        <p className="mt-1 text-[10px] text-slate-500">{employee.employeeCode || "—"} · {employee.designation || "Employee"}</p>
                        <p className="mt-1 text-[10px] text-slate-600">{employee.departmentId?.name || person.email || "—"}</p>
                      </td>
                      <td className="max-w-[240px] px-4 py-4">
                        <p className="text-xs font-medium text-slate-300">{titleCase(leave.leaveType)} leave</p>
                        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500" title={leave.reason}>{leave.reason || "No reason provided"}</p>
                        {leave.adminRemarks && <p className="mt-1 flex items-start gap-1 text-[10px] text-cyan-300/80"><MessageSquareText size={11} className="mt-0.5 shrink-0" />{leave.adminRemarks}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-slate-300">{formatDate(leave.startDate)}</p>
                        <p className="mt-1 text-[10px] text-slate-500">to {formatDate(leave.endDate)}</p>
                        <p className="mt-1 text-[10px] text-slate-600">{days} calendar day{days === 1 ? "" : "s"}</p>
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={leave.status} /></td>
                      <td className="px-5 py-4 text-right lg:px-6">
                        {leave.status === "PENDING" ? (
                          <div className="inline-flex items-center gap-2">
                            <button type="button" onClick={() => openReview(leave, "APPROVED")} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/[.08] px-3 py-2 text-[10px] font-semibold text-emerald-300 transition hover:bg-emerald-400/[.16]"><Check size={13} /> Approve</button>
                            <button type="button" onClick={() => openReview(leave, "REJECTED")} className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-400/[.07] px-3 py-2 text-[10px] font-semibold text-red-300 transition hover:bg-red-400/[.15]"><XCircle size={13} /> Reject</button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-600">Reviewed {leave.reviewedAt ? formatDate(leave.reviewedAt) : "—"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-white/[.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
            <p className="text-[10px] text-slate-500">Page {pagination.page} of {pagination.totalPages} · {pagination.total} requests</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || refreshing} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[.04] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={14} /> Previous</button>
              <button type="button" onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))} disabled={page >= pagination.totalPages || refreshing} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[.04] disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </section>

      <div className="flex items-center justify-center gap-2 border-t border-white/[.06] pt-5 text-center text-[10px] tracking-wider text-slate-600"><Clock3 size={12} /> WORKFORCE AI · LEAVE OPERATIONS</div>

      <ReviewModal leave={reviewTarget} status={reviewStatus} onClose={() => !submitting && setReviewTarget(null)} onConfirm={handleReview} submitting={submitting} />
    </div>
  );
}
