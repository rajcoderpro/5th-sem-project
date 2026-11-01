
import {
  CalendarDays,
  Clock3,
  UserRound,
} from "lucide-react";

const statusStyles = {
  PRESENT: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  LATE: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  HALF_DAY: "border-orange-400/20 bg-orange-400/10 text-orange-300",
  ABSENT: "border-red-400/20 bg-red-400/10 text-red-300",
};

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

function formatMinutes(value) {
  const minutes = Math.max(0, Number(value) || 0);

  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function AttendanceTable({ records = [] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[.08]">
            <CalendarDays size={19} className="text-violet-300" />
          </div>

          <div>
            <h2 className="font-display text-base font-semibold">
              Attendance records
            </h2>

            <p className="mt-1 text-[10px] text-slate-500">
              Employee check-in and check-out history.
            </p>
          </div>
        </div>

        <span className="rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 text-[10px] text-slate-400">
          {records.length} records on this page
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left">
          <thead>
            <tr className="border-b border-white/[.06] bg-white/[.015] text-[10px] uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-medium">Employee</th>
              <th className="px-4 py-4 font-medium">Date</th>
              <th className="px-4 py-4 font-medium">Check-in</th>
              <th className="px-4 py-4 font-medium">Check-out</th>
              <th className="px-4 py-4 font-medium">Working time</th>
              <th className="px-4 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Source</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => {
              const employee = record.employeeId || {};
              const name = employee.userId?.name || "Unknown employee";
              const status = record.status || "ABSENT";

              return (
                <tr
                  key={record._id}
                  className="border-b border-white/[.04] transition hover:bg-white/[.025]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[.08] text-[10px] font-semibold text-violet-200">
                        {getInitials(name)}
                      </div>

                      <div className="min-w-0">
                        <p className="max-w-44 truncate text-xs font-semibold text-slate-200">
                          {name}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          {employee.employeeCode || "—"}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-600">
                          {employee.departmentId?.name || "No department"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-xs text-slate-400">
                    {formatDate(record.attendanceDate)}
                  </td>

                  <td className="px-4 py-4 text-xs text-slate-300">
                    {formatTime(record.checkInAt)}
                  </td>

                  <td className="px-4 py-4 text-xs text-slate-300">
                    {formatTime(record.checkOutAt)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Clock3 size={13} className="text-slate-500" />
                      {formatMinutes(record.workedMinutes)}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                        statusStyles[status] ||
                        "border-white/10 bg-white/5 text-slate-400"
                      }`}
                    >
                      {status.replaceAll("_", " ")}
                    </span>

                    {record.isLate && (
                      <p className="mt-1 text-[9px] text-amber-300">
                        Late arrival
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">
                      <UserRound size={12} className="text-slate-600" />
                      {record.source || "SELF"}
                    </span>
                  </td>
                </tr>
              );
            })}

            {records.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-slate-600" />

                  <p className="mt-3 text-sm font-medium text-slate-300">
                    No attendance records found.
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Try changing the filters or date range.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-white/[.06] px-5 py-4 text-[10px] text-slate-600 sm:px-6">
        All timestamps are displayed in Indian Standard Time.
      </div>
    </section>
  );
}
