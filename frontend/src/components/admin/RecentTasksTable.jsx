
import { ClipboardList } from "lucide-react";

const statusStyles = {
  TODO: "bg-slate-400/10 text-slate-300",
  IN_PROGRESS: "bg-cyan-400/10 text-cyan-300",
  BLOCKED: "bg-red-400/10 text-red-300",
  IN_REVIEW: "bg-amber-400/10 text-amber-300",
  COMPLETED: "bg-emerald-400/10 text-emerald-300",
  CANCELLED: "bg-slate-500/10 text-slate-400",
};

const priorityStyles = {
  LOW: "text-slate-400",
  MEDIUM: "text-cyan-300",
  HIGH: "text-amber-300",
  URGENT: "text-red-300",
};

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RecentTasksTable({ tasks = [] }) {
  return (
    <section
      id="recent-tasks"
      className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90"
    >
      <div className="flex items-center justify-between border-b border-white/[.06] p-5 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList size={17} className="text-cyan-300" />
            <h2 className="font-display text-base font-semibold">
              Tasks by due date
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Tasks returned in due-date order
          </p>
        </div>

        <span className="rounded-lg border border-white/10 bg-white/[.03] px-3 py-1.5 text-xs text-slate-400">
          Showing {tasks.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b border-white/[.06] text-[10px] uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-medium">Task</th>
              <th className="px-4 py-4 font-medium">Assigned to</th>
              <th className="px-4 py-4 font-medium">Priority</th>
              <th className="px-4 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Due date</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => {
              const status = task.status || "TODO";
              const priority = task.priority || "MEDIUM";

              const assignedName =
                task.assignedTo?.userId?.name || "Unassigned";

              return (
                <tr
                  key={task._id}
                  className="border-b border-white/[.04] transition hover:bg-white/[.025]"
                >
                  <td className="max-w-52 px-6 py-4">
                    <p className="truncate text-xs font-medium text-slate-200">
                      {task.title}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      {task.departmentId?.name || "No department"}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-xs text-slate-400">
                    {assignedName}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`text-[10px] font-semibold ${priorityStyles[priority] || priorityStyles.MEDIUM}`}
                    >
                      {priority}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] ${statusStyles[status] || statusStyles.TODO}`}
                    >
                      {status.replaceAll("_", " ")}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-400">
                    {formatDate(task.dueDate)}
                  </td>
                </tr>
              );
            })}

            {tasks.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <ClipboardList className="mx-auto h-8 w-8 text-slate-600" />

                  <p className="mt-3 text-sm text-slate-400">
                    No tasks available.
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Your latest tasks will appear here.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
