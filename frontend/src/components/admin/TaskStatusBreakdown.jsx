
import { Activity } from "lucide-react";

const statusItems = [
  {
    key: "TODO",
    label: "To do",
    color: "bg-slate-400",
    textColor: "text-slate-300",
  },
  {
    key: "IN_PROGRESS",
    label: "In progress",
    color: "bg-cyan-400",
    textColor: "text-cyan-300",
  },
  {
    key: "BLOCKED",
    label: "Blocked",
    color: "bg-red-400",
    textColor: "text-red-300",
  },
  {
    key: "IN_REVIEW",
    label: "In review",
    color: "bg-amber-400",
    textColor: "text-amber-300",
  },
  {
    key: "COMPLETED",
    label: "Completed",
    color: "bg-emerald-400",
    textColor: "text-emerald-300",
  },
  {
    key: "CANCELLED",
    label: "Cancelled",
    color: "bg-slate-600",
    textColor: "text-slate-400",
  },
];

export default function TaskStatusBreakdown({ counts = {} }) {
  const total = statusItems.reduce(
    (sum, item) => sum + (counts[item.key] || 0),
    0
  );

  return (
    <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">
            TASK MANAGEMENT
          </p>

          <h2 className="mt-2 font-display text-lg font-semibold">
            Task overview
          </h2>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[.08]">
          <Activity className="h-5 w-5 text-violet-300" />
        </div>
      </div>

      <div className="mt-7 flex items-end justify-between border-b border-white/[.06] pb-5">
        <div>
          <p className="text-3xl font-semibold tabular-nums">{total}</p>
          <p className="mt-1 text-xs text-slate-500">Total recorded tasks</p>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-emerald-300">
            {counts.COMPLETED || 0}
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Completed
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {statusItems.map((item) => {
          const count = counts[item.key] || 0;
          const percentage =
            total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={item.key}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />

                  <span className="text-xs text-slate-400">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-200">
                    {count}
                  </span>

                  <span className="w-10 text-right text-[10px] text-slate-500">
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/[.06]">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-700`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {total === 0 && (
        <p className="mt-5 text-center text-xs text-slate-500">
          No tasks have been created yet.
        </p>
      )}
    </section>
  );
}
