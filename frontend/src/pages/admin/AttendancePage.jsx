
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import gsap from "gsap";

import {
  CalendarDays,
  Users,
  UserCheck,
  UserX,
  Clock3,
  Timer,
  RefreshCw,
  CalendarX,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { apiGet, apiRequest } from "../../services/api.js";

import AttendanceTable from "../../components/admin/AttendanceTable.jsx";
import MarkAbsentModal from "../../components/admin/MarkAbsentModal.jsx";

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

function StatCard({ icon: Icon, label, value, description, color }) {
  return (
    <div className="admin-attendance-reveal group relative overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-500/[.05] blur-2xl transition group-hover:bg-violet-500/[.10]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500">{label}</p>

          <h3 className="mt-3 font-display text-3xl font-semibold tabular-nums">
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

export default function AttendancePage() {
  const rootRef = useRef(null);
  const hasLoadedRef = useRef(false);

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [summary, setSummary] = useState(null);
  const [summaryDate, setSummaryDate] = useState(getISTDate());

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });

  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    status: "ALL",
    employeeId: "ALL",
    fromDate: "",
    toDate: "",
    isLate: "ALL",
  });

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [absentModalOpen, setAbsentModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!hasLoadedRef.current) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
    });

    if (filters.status !== "ALL") {
      params.set("status", filters.status);
    }

    if (filters.employeeId !== "ALL") {
      params.set("employeeId", filters.employeeId);
    }

    if (filters.fromDate) {
      params.set("fromDate", filters.fromDate);
    }

    if (filters.toDate) {
      params.set("toDate", filters.toDate);
    }

    if (filters.isLate !== "ALL") {
      params.set("isLate", filters.isLate);
    }

    try {
      const [attendanceResponse, summaryResponse, employeeResponse] =
        await Promise.all([
          apiGet(`/api/attendance?${params.toString()}`),

          apiGet(
            `/api/attendance/summary?date=${summaryDate}`
          ),

          apiGet("/api/employees"),
        ]);

      setRecords(attendanceResponse.attendance || []);

      setPagination({
        page: attendanceResponse.pagination?.page || page,
        total: attendanceResponse.pagination?.total || 0,
        totalPages: Math.max(
          1,
          attendanceResponse.pagination?.totalPages || 1
        ),
      });

      setSummary(summaryResponse.summary || null);
      setEmployees(employeeResponse.employees || []);
    } catch (err) {
      console.error("Admin attendance loading error:", err);

      setError(
        err.message || "Unable to load attendance information."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      hasLoadedRef.current = true;
    }
  }, [page, filters, summaryDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // GSAP entrance animation
  useEffect(() => {
    if (loading || !rootRef.current) return;

    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap.fromTo(
        ".admin-attendance-intro",
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );

      gsap.fromTo(
        ".admin-attendance-reveal",
        { autoAlpha: 0, y: 18 },
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

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) => {
      const employee = record.employeeId || {};

      const name = employee.userId?.name || "";
      const email = employee.userId?.email || "";
      const code = employee.employeeCode || "";
      const department = employee.departmentId?.name || "";

      return [
        name,
        email,
        code,
        department,
        record.status,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [records, search]);

  const stats = [
    {
      label: "Total employees",
      value: summary?.totalEmployees ?? 0,
      description: "Active workforce and employees on leave",
      icon: Users,
      color: "bg-violet-400/10 text-violet-300",
    },
    {
      label: "Present",
      value: summary?.present ?? 0,
      description: "Present, including late arrivals",
      icon: UserCheck,
      color: "bg-emerald-400/10 text-emerald-300",
    },
    {
      label: "Late arrivals",
      value: summary?.late ?? 0,
      description: "Beyond the attendance grace period",
      icon: Clock3,
      color: "bg-amber-400/10 text-amber-300",
    },
    {
      label: "Half day",
      value: summary?.halfDay ?? 0,
      description: "Below the configured work-duration threshold",
      icon: Timer,
      color: "bg-orange-400/10 text-orange-300",
    },
    {
      label: "Absent",
      value: summary?.absent ?? 0,
      description: "Manually recorded absences",
      icon: UserX,
      color: "bg-red-400/10 text-red-300",
    },
    {
      label: "On leave",
      value: summary?.onLeave ?? 0,
      description: "Approved leave or employee leave status",
      icon: CalendarDays,
      color: "bg-cyan-400/10 text-cyan-300",
    },
  ];

  const updateFilter = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");

    setFilters({
      status: "ALL",
      employeeId: "ALL",
      fromDate: "",
      toDate: "",
      isLate: "ALL",
    });

    setPage(1);
  };

  const handleMarkAbsent = async ({
    employeeId,
    date,
    adminRemarks,
  }) => {
    const response = await apiRequest(
      `/api/attendance/${employeeId}/absent`,
      {
        method: "POST",
        body: JSON.stringify({
          date,
          adminRemarks,
        }),
      }
    );

    setAbsentModalOpen(false);

    setNotice(
      response.message || "Employee marked absent successfully."
    );

    await loadData();
  };

  if (loading) {
    return (
      <div className="space-y-7">
        <div className="h-24 animate-pulse rounded-2xl bg-white/[.025]" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-white/[.025]"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-white/[.025]" />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="space-y-7">
      {/* Heading */}
      <div className="admin-attendance-intro flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">
            WORKFORCE / TIME & ATTENDANCE
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Attendance <span className="text-violet-300">management.</span>
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Monitor attendance, punctuality, employee availability and working hours.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setAbsentModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[.06] px-4 py-3 text-xs font-medium text-red-300 transition hover:bg-red-400/10"
          >
            <CalendarX size={15} />
            Mark absent
          </button>

          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Feedback */}
      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[.07] px-4 py-3 text-xs text-emerald-300">
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-emerald-200/70 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/[.07] px-4 py-3 text-xs text-red-300">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-200/70 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary date */}
      <section className="admin-attendance-reveal flex flex-col justify-between gap-4 rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-slate-200">
            Daily attendance summary
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            Select a date to view the workforce attendance snapshot.
          </p>
        </div>

        <input
          type="date"
          value={summaryDate}
          max={getISTDate()}
          onChange={(event) => setSummaryDate(event.target.value)}
          className="rounded-xl border border-white/10 bg-[#090c19] px-4 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
        />
      </section>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Additional summary */}
      <div className="admin-attendance-reveal grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5">
          <p className="text-xs text-slate-500">Not marked</p>

          <h3 className="mt-3 font-display text-2xl font-semibold">
            {summary?.notMarked ?? 0}
          </h3>

          <p className="mt-1 text-[10px] text-slate-600">
            No attendance record and no approved leave
          </p>
        </div>

        <div className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5">
          <p className="text-xs text-slate-500">Total attendance records</p>

          <h3 className="mt-3 font-display text-2xl font-semibold">
            {summary?.totalRecords ?? 0}
          </h3>

          <p className="mt-1 text-[10px] text-slate-600">
            Records created for the selected date
          </p>
        </div>

        <div className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5">
          <p className="text-xs text-slate-500">Late arrival rate</p>

          <h3 className="mt-3 font-display text-2xl font-semibold">
            {summary?.present
              ? `${Math.round((summary.late / summary.present) * 100)}%`
              : "0%"}
          </h3>

          <p className="mt-1 text-[10px] text-slate-600">
            Late arrivals compared with present records
          </p>
        </div>
      </div>

      {/* Filters */}
      <section className="admin-attendance-reveal rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-violet-300" />

          <h2 className="text-sm font-semibold">
            Filter attendance records
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search current page..."
              className="w-full rounded-xl border border-white/10 bg-[#090c19] py-3 pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50"
            />
          </div>

          <select
            value={filters.status}
            onChange={(event) => updateFilter("status", event.target.value)}
            className="rounded-xl border border-white/10 bg-[#090c19] px-3 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
          >
            <option value="ALL">All statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half day</option>
            <option value="ABSENT">Absent</option>
          </select>

          <select
            value={filters.employeeId}
            onChange={(event) => updateFilter("employeeId", event.target.value)}
            className="rounded-xl border border-white/10 bg-[#090c19] px-3 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
          >
            <option value="ALL">All employees</option>

            {employees.map((employee) => (
              <option
                key={employee._id}
                value={employee._id}
                className="bg-[#090c19]"
              >
                {employee.userId?.name || employee.employeeCode}
              </option>
            ))}
          </select>

          <select
            value={filters.isLate}
            onChange={(event) => updateFilter("isLate", event.target.value)}
            className="rounded-xl border border-white/10 bg-[#090c19] px-3 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
          >
            <option value="ALL">Late: All</option>
            <option value="true">Late arrivals only</option>
            <option value="false">Non-late only</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-white/10 px-4 py-3 text-xs text-violet-300 transition hover:bg-white/[.04] hover:text-white"
          >
            Clear filters
          </button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            type="date"
            value={filters.fromDate}
            onChange={(event) => updateFilter("fromDate", event.target.value)}
            className="rounded-xl border border-white/10 bg-[#090c19] px-4 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
          />

          <input
            type="date"
            value={filters.toDate}
            min={filters.fromDate || undefined}
            onChange={(event) => updateFilter("toDate", event.target.value)}
            className="rounded-xl border border-white/10 bg-[#090c19] px-4 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
          />
        </div>

        <p className="mt-3 text-[10px] text-slate-500">
          Showing {filteredRecords.length} matching records on this page ·{" "}
          {pagination.total} server-filtered records
        </p>
      </section>

      {/* Table */}
      <div className="admin-attendance-reveal">
        <AttendanceTable records={filteredRecords} />
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[.07] bg-[#0d1020]/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-slate-500">
          Page <span className="font-semibold text-slate-300">{page}</span>
          {" "}of{" "}
          <span className="font-semibold text-slate-300">
            {pagination.totalPages}
          </span>
          {" · "}
          {pagination.total} records
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || refreshing}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-30"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={page >= pagination.totalPages || refreshing}
            onClick={() =>
              setPage((value) => Math.min(pagination.totalPages, value + 1))
            }
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>

      <div className="border-t border-white/[.06] pt-5 text-center">
        <p className="text-[10px] tracking-wider text-slate-600">
          WORKFORCE AI · ATTENDANCE CONSOLE
        </p>
      </div>

      {/* Mark absent modal */}
      <MarkAbsentModal
        open={absentModalOpen}
        employees={employees}
        onClose={() => setAbsentModalOpen(false)}
        onSubmit={handleMarkAbsent}
      />
    </div>
  );
}
