
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
const statusStyles = {
  ACTIVE: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  ON_LEAVE: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  INACTIVE: "border-slate-400/20 bg-slate-400/10 text-slate-400",
  TERMINATED: "border-red-400/20 bg-red-400/10 text-red-300",
};

function getInitials( name = "" ) {
  return name
    .split( " " )
    .filter( Boolean )
    .slice( 0, 2 )
    .map( ( part ) => part[0].toUpperCase() )
    .join( "" );
}

export default function EmployeeTable( { employees = [] } ) {
  const visibleEmployees = employees.slice( 0, 6 );

  return (
    <section
      id="employees"
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90"
    >
      <div className="flex items-center justify-between border-b border-white/[.06] p-5 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <Users size={17} className="text-violet-300" />
            <h2 className="font-display text-base font-semibold">
              Employees
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Latest employee records
          </p>
        </div>

        <span className="rounded-lg border border-white/10 bg-white/[.03] px-3 py-1.5 text-xs text-slate-400">
          {employees.length} total
        </span>
        <Link
          to="/admin/employees"
          className="text-xs font-medium text-violet-300 transition hover:text-white"
        >
          View all →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left">
          <thead>
            <tr className="border-b border-white/[.06] text-[10px] uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-medium">Employee</th>
              <th className="px-4 py-4 font-medium">Department</th>
              <th className="px-4 py-4 font-medium">Designation</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {visibleEmployees.map( ( employee ) => {
              const name = employee.userId?.name || "Unknown employee";
              const email = employee.userId?.email || "No email";
              const status = employee.employmentStatus || "INACTIVE";

              return (
                <tr
                  key={employee._id}
                  className="border-b border-white/[.04] transition hover:bg-white/[.025]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-400/15 bg-violet-400/10 text-xs font-semibold text-violet-200">
                        {getInitials( name )}
                      </div>

                      <div className="min-w-0">
                        <p className="max-w-44 truncate text-xs font-medium text-slate-200">
                          {name}
                        </p>

                        <p className="mt-1 max-w-44 truncate text-[10px] text-slate-500">
                          {email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-xs text-slate-300">
                      {employee.departmentId?.name || "Unassigned"}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      {employee.employeeCode || "—"}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-xs text-slate-400">
                    {employee.designation || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusStyles[status] || statusStyles.INACTIVE
                        }`}
                    >
                      {status.replaceAll( "_", " " )}
                    </span>
                  </td>
                </tr>
              );
            } )}

            {visibleEmployees.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <Users className="mx-auto h-8 w-8 text-slate-600" />
                  <p className="mt-3 text-sm text-slate-400">
                    No employees found.
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Employee records will appear here.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {employees.length > 6 && (
        <div className="border-t border-white/[.06] px-6 py-3 text-center text-[10px] text-slate-500">
          Showing 6 of {employees.length} employees
        </div>
      )}
    </section>
  );
}
