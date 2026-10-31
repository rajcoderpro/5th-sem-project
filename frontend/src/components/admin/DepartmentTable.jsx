
import {
  Building2,
  Pencil,
  Power,
  Users,
  CalendarDays,
} from "lucide-react";

const statusClass = {
  active: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  inactive: "border-slate-400/20 bg-slate-400/10 text-slate-400",
};

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DepartmentTable({
  departments = [],
  getEmployeeCount,
  onEdit,
  onToggleStatus,
  processingId,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[.08]">
            <Building2 size={19} className="text-violet-300" />
          </div>

          <div>
            <h2 className="font-display text-base font-semibold">
              Department directory
            </h2>

            <p className="mt-1 text-[10px] text-slate-500">
              Manage all departments in your organization.
            </p>
          </div>
        </div>

        <span className="rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 text-[10px] text-slate-400">
          {departments.length} departments
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead>
            <tr className="border-b border-white/[.06] bg-white/[.015] text-[10px] uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-4 py-4 font-medium">Description</th>
              <th className="px-4 py-4 font-medium">Employees</th>
              <th className="px-4 py-4 font-medium">Created</th>
              <th className="px-4 py-4 font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {departments.map((department) => {
              const active = department.isActive !== false;
              const count = getEmployeeCount(department._id);

              return (
                <tr
                  key={department._id}
                  className="border-b border-white/[.04] transition hover:bg-white/[.025]"
                >
                  {/* Department identity */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-gradient-to-br from-violet-500/15 to-cyan-500/[.07] font-mono text-[10px] font-bold tracking-wider text-violet-200">
                        {department.code}
                      </div>

                      <div className="min-w-0">
                        <p className="max-w-44 truncate text-xs font-semibold text-slate-200">
                          {department.name}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-600">
                          Code: {department.code}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="max-w-64 px-4 py-4">
                    <p className="line-clamp-2 text-xs leading-5 text-slate-400">
                      {department.description || "No description added"}
                    </p>
                  </td>

                  {/* Employee count */}
                  <td className="px-4 py-4">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-white/[.06] bg-white/[.025] px-3 py-2">
                      <Users size={13} className="text-violet-300" />

                      <span className="text-xs font-semibold text-slate-200">
                        {count}
                      </span>

                      <span className="text-[10px] text-slate-500">
                        assigned
                      </span>
                    </div>
                  </td>

                  {/* Created at */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays
                        size={13}
                        className="text-slate-600"
                      />

                      {formatDate(department.createdAt)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                        active
                          ? statusClass.active
                          : statusClass.inactive
                      }`}
                    >
                      {active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(department)}
                        aria-label={`Edit ${department.name}`}
                        title="Edit department"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-violet-200"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(department)}
                        disabled={processingId === department._id}
                        aria-label={
                          active
                            ? `Deactivate ${department.name}`
                            : `Activate ${department.name}`
                        }
                        title={
                          active
                            ? "Deactivate department"
                            : "Activate department"
                        }
                        className={`flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-[10px] font-medium transition disabled:opacity-50 ${
                          active
                            ? "border-red-400/20 text-red-300 hover:bg-red-400/10"
                            : "border-emerald-400/20 text-emerald-300 hover:bg-emerald-400/10"
                        }`}
                      >
                        <Power size={14} />

                        <span>
                          {processingId === department._id
                            ? "Updating"
                            : active
                              ? "Deactivate"
                              : "Activate"}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {departments.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[.03]">
                    <Building2 className="h-6 w-6 text-slate-500" />
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-300">
                    No departments found
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Create your first department to get started.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-white/[.06] px-5 py-4 text-[10px] text-slate-600 sm:px-6">
        Department records are loaded from your backend API.
      </div>
    </section>
  );
}
