
import {
  ClipboardList,
  Pencil,
  UserRoundCheck,
  Activity,
  CalendarDays,
  Clock3,
} from "lucide-react";

const statusStyles = {
  TODO: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  IN_PROGRESS: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  BLOCKED: "border-red-400/20 bg-red-400/10 text-red-300",
  IN_REVIEW: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  COMPLETED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  CANCELLED: "border-slate-500/20 bg-slate-500/10 text-slate-400",
};

const priorityStyles = {
  LOW: "text-slate-400",
  MEDIUM: "text-cyan-300",
  HIGH: "text-amber-300",
  URGENT: "text-red-300",
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function isOverdue(task) {
  if (
    ["COMPLETED", "CANCELLED"].includes(task.status) ||
    !task.dueDate
  ) {
    return false;
  }

  const due = new Date(task.dueDate);
  due.setHours(23, 59, 59, 999);

  return due < new Date();
}

export default function TaskTable({
  tasks = [],
  onEdit,
  onAssign,
  onUpdateProgress,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[.08]">
            <ClipboardList size={19} className="text-violet-300" />
          </div>

          <div>
            <h2 className="font-display text-base font-semibold">
              Task directory
            </h2>

            <p className="mt-1 text-[10px] text-slate-500">
              Manage tasks, assignments and progress.
            </p>
          </div>
        </div>

        <span className="rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 text-[10px] text-slate-400">
          {tasks.length} tasks on this page
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left">
          <thead>
            <tr className="border-b border-white/[.06] bg-white/[.015] text-[10px] uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-medium">Task</th>
              <th className="px-4 py-4 font-medium">Department</th>
              <th className="px-4 py-4 font-medium">Assigned to</th>
              <th className="px-4 py-4 font-medium">Priority</th>
              <th className="px-4 py-4 font-medium">Due date</th>
              <th className="px-4 py-4 font-medium">Progress</th>
              <th className="px-4 py-4 font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => {
              const assignedName =
                task.assignedTo?.userId?.name || "";

              const assignedCode =
                task.assignedTo?.employeeCode || "";

              const closed = ["COMPLETED", "CANCELLED"].includes(
                task.status
              );

              const progress = Math.min(
                100,
                Math.max(0, Number(task.progressPercentage || 0))
              );

              const overdue = isOverdue(task);

              return (
                <tr
                  key={task._id}
                  className="border-b border-white/[.04] transition hover:bg-white/[.025]"
                >
                  {/* Task details */}
                  <td className="max-w-56 px-6 py-4">
                    <p className="truncate text-xs font-semibold text-slate-200">
                      {task.title}
                    </p>

                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
                      {task.description || "No description"}
                    </p>

                    {task.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-violet-400/10 bg-violet-400/[.05] px-1.5 py-0.5 text-[9px] text-violet-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Department */}
                  <td className="px-4 py-4">
                    <p className="text-xs text-slate-300">
                      {task.departmentId?.name || "—"}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                      {task.departmentId?.code || ""}
                    </p>
                  </td>

                  {/* Assigned employee */}
                  <td className="px-4 py-4">
                    {assignedName ? (
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/[.08] text-[10px] font-semibold text-cyan-200">
                          {getInitials(assignedName)}
                        </div>

                        <div>
                          <p className="max-w-32 truncate text-xs text-slate-300">
                            {assignedName}
                          </p>

                          <p className="mt-1 text-[9px] text-slate-600">
                            {assignedCode}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-4">
                    <span
                      className={`text-[10px] font-bold ${priorityStyles[task.priority] || priorityStyles.MEDIUM}`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  {/* Due date */}
                  <td className="px-4 py-4">
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        overdue ? "text-red-300" : "text-slate-400"
                      }`}
                    >
                      <CalendarDays size={13} />
                      {formatDate(task.dueDate)}
                    </div>

                    {overdue && (
                      <p className="mt-1 text-[9px] font-medium text-red-300">
                        Overdue
                      </p>
                    )}
                  </td>

                  {/* Progress */}
                  <td className="px-4 py-4">
                    <div className="w-28">
                      <div className="mb-2 flex justify-between text-[9px]">
                        <span className="text-slate-500">
                          Progress
                        </span>

                        <span className="font-semibold text-slate-300">
                          {progress}%
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-medium ${
                        statusStyles[task.status] || statusStyles.TODO
                      }`}
                    >
                      {(task.status || "TODO").replaceAll("_", " ")}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(task)}
                        title="Edit task"
                        aria-label={`Edit ${task.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-violet-200"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onAssign(task)}
                        disabled={closed}
                        title={
                          closed
                            ? "Closed tasks cannot be assigned"
                            : "Assign or reassign employee"
                        }
                        aria-label={`Assign employee to ${task.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <UserRoundCheck size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onUpdateProgress(task)}
                        title="Update status and progress"
                        aria-label={`Update progress for ${task.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200"
                      >
                        <Activity size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {tasks.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[.03]">
                    <ClipboardList className="h-6 w-6 text-slate-500" />
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-300">
                    No tasks found
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Try changing your filters or create a new task.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-white/[.06] px-5 py-4 text-[10px] text-slate-600 sm:px-6">
        <span>Task records from your workspace</span>

        <span className="inline-flex items-center gap-2">
          <Clock3 size={12} />
          Due-date ordered
        </span>
      </div>
    </section>
  );
}
