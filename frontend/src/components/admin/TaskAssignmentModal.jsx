
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import {
  UserRoundCheck,
  X,
  Users,
  Building2,
} from "lucide-react";

export default function TaskAssignmentModal({
  open,
  task,
  employees = [],
  onClose,
  onSubmit,
}) {
  const modalRef = useRef(null);

  const [employeeId, setEmployeeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setEmployeeId(task?.assignedTo?._id || "");
    setSubmitting(false);
    setError("");
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
        ".assignment-backdrop",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2 }
      );

      gsap.fromTo(
        ".assignment-panel",
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

  const activeEmployees = employees.filter(
    (employee) => employee.employmentStatus === "ACTIVE"
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(employeeId);
    } catch (err) {
      setError(err.message || "Unable to assign this task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="assignment-backdrop fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <div className="assignment-panel w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#0b0e1c] shadow-[0_0_90px_rgba(8,145,178,.12)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/[.07] p-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <UserRoundCheck size={21} />
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[.2em] text-cyan-300">
                TASK ASSIGNMENT
              </p>

              <h2 className="mt-1 font-display text-xl font-semibold">
                Assign employee
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Choose an employee to take ownership of this task.
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
            <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Selected task
              </p>

              <h3 className="mt-2 text-sm font-semibold text-white">
                {task.title}
              </h3>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <Building2 size={14} className="text-slate-500" />
                {task.departmentId?.name || "No department"}
              </div>

              {task.assignedTo && (
                <p className="mt-2 text-[10px] text-cyan-300">
                  Currently assigned to:{" "}
                  {task.assignedTo.userId?.name ||
                    task.assignedTo.employeeCode}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-300">
                Select employee *
              </label>

              <select
                value={employeeId}
                onChange={(event) => {
                  setEmployeeId(event.target.value);
                  setError("");
                }}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0b0e1c] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
              >
                <option value="">Choose employee</option>

                {activeEmployees.map((employee) => (
                  <option
                    key={employee._id}
                    value={employee._id}
                    className="bg-[#0b0e1c]"
                  >
                    {employee.userId?.name || "Employee"} —{" "}
                    {employee.employeeCode}
                    {" · "}
                    {employee.departmentId?.name || "No department"}
                  </option>
                ))}
              </select>

              {activeEmployees.length === 0 && (
                <p className="mt-2 text-xs text-amber-300">
                  No active employees are available.
                </p>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-cyan-400/10 bg-cyan-400/[.04] p-4">
              <Users
                size={17}
                className="mt-0.5 shrink-0 text-cyan-300"
              />

              <p className="text-xs leading-5 text-slate-400">
                Only active employees can be assigned. You can
                reassign this task later, provided it hasn't been
                completed or cancelled.
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
              disabled={submitting || activeEmployees.length === 0}
              className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-[0_0_25px_rgba(8,145,178,.15)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Assigning..."
                : task.assignedTo
                  ? "Reassign task"
                  : "Assign task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
