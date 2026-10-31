
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import {
  Activity,
  CheckCircle2,
  X,
} from "lucide-react";

const statuses = [
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function TaskStatusModal({
  open,
  task,
  onClose,
  onSubmit,
}) {
  const modalRef = useRef(null);

  const [status, setStatus] = useState("TODO");
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !task) return;

    setStatus(task.status || "TODO");
    setProgress(task.progressPercentage ?? 0);
    setError("");
    setSubmitting(false);
  }, [open, task]);

  useEffect(() => {
    if (!open || !modalRef.current) return;

    const context = gsap.context(() => {
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      gsap.fromTo(
        ".status-backdrop",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2 }
      );

      gsap.fromTo(
        ".status-panel",
        { autoAlpha: 0, y: 18, scale: 0.97 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "power3.out",
        }
      );
    }, modalRef);

    return () => context.revert();
  }, [open]);

  if (!open || !task) return null;

  const fixedProgress =
    status === "COMPLETED" || status === "IN_REVIEW"
      ? 100
      : status === "TODO"
        ? 0
        : null;

  const currentProgress = fixedProgress ?? progress;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await onSubmit({
        status,
        progressPercentage: Number(currentProgress),
      });
    } catch (err) {
      setError(err.message || "Unable to update task status.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="status-backdrop fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <div className="status-panel w-full max-w-lg overflow-hidden rounded-3xl border border-violet-400/20 bg-[#0b0e1c] shadow-[0_0_90px_rgba(109,40,217,.15)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/[.07] p-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
              <Activity size={21} />
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[.2em] text-violet-300">
                TASK PROGRESS
              </p>

              <h2 className="mt-1 font-display text-xl font-semibold">
                Update status
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Change task status and completion percentage.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6 sm:px-8">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Selected task
              </p>

              <h3 className="mt-2 text-sm font-semibold">
                {task.title}
              </h3>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-300">
                Task status
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0b0e1c] px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60"
              >
                {statuses.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                    className="bg-[#0b0e1c]"
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Completion progress
                </label>

                <span className="font-display text-2xl font-semibold text-violet-300">
                  {currentProgress}%
                </span>
              </div>

              {fixedProgress === null ? (
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  onChange={(event) =>
                    setProgress(Number(event.target.value))
                  }
                  className="mt-6 w-full accent-violet-500"
                />
              ) : (
                <div className="mt-6">
                  <div className="h-2 overflow-hidden rounded-full bg-white/[.07]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                      style={{ width: `${fixedProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-3 flex justify-between text-[10px] text-slate-600">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>

              <p className="mt-4 text-[10px] leading-5 text-slate-500">
                {status === "COMPLETED"
                  ? "Completing this task automatically sets progress to 100%."
                  : status === "IN_REVIEW"
                    ? "Tasks submitted for review automatically show 100% progress."
                    : status === "TODO"
                      ? "Tasks moved back to To do automatically reset to 0%."
                      : "Set the current estimated completion percentage."}
              </p>
            </div>

            {error && (
              <p className="rounded-xl border border-red-400/20 bg-red-400/[.07] px-4 py-3 text-xs text-red-300">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/[.07] bg-[#090c19] px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-white/10 px-5 py-3 text-xs font-medium text-slate-300 hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              <CheckCircle2 size={15} />
              {submitting ? "Updating..." : "Save progress"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
