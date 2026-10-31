
import { Building2, Users } from "lucide-react";

export default function DepartmentOverview({
  departments = [],
  employees = [],
}) {
  const visibleDepartments = departments.slice(0, 5);

  const getEmployeeCount = (departmentId) => {
    return employees.filter((employee) => {
      const employeeDepartmentId =
        employee.departmentId?._id || employee.departmentId;

      return (
        String(employeeDepartmentId) === String(departmentId)
      );
    }).length;
  };

  return (
    <section
      id="departments"
      className="scroll-mt-24 rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 size={17} className="text-cyan-300" />
            <h2 className="font-display text-base font-semibold">
              Departments
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Workforce distribution
          </p>
        </div>

        <span className="rounded-lg border border-white/10 bg-white/[.03] px-3 py-1.5 text-xs text-slate-400">
          {departments.length} total
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {visibleDepartments.map((department, index) => {
          const count = getEmployeeCount(department._id);

          const active = department.isActive !== false;

          return (
            <div
              key={department._id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[.05] bg-white/[.02] p-3 transition hover:border-violet-400/20 hover:bg-white/[.035]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[.08] text-xs font-semibold text-violet-300">
                  {department.code || `D${index + 1}`}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-200">
                    {department.name}
                  </p>

                  <p className="mt-1 truncate text-[10px] text-slate-500">
                    {department.description || "No description"}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-slate-300">
                  <Users size={13} className="text-slate-500" />
                  {count}
                </div>

                <span
                  className={`mt-1 inline-block text-[9px] ${
                    active ? "text-emerald-300" : "text-slate-500"
                  }`}
                >
                  {active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          );
        })}

        {visibleDepartments.length === 0 && (
          <div className="py-10 text-center">
            <Building2 className="mx-auto h-8 w-8 text-slate-600" />

            <p className="mt-3 text-sm text-slate-400">
              No departments found.
            </p>
          </div>
        )}
      </div>

      {departments.length > 5 && (
        <p className="mt-4 border-t border-white/[.06] pt-3 text-center text-[10px] text-slate-500">
          Showing 5 of {departments.length} departments
        </p>
      )}
    </section>
  );
}
