
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import {
  CalendarX,
  X,
  AlertTriangle,
} from "lucide-react";

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

export default function MarkAbsentModal({
  open,
  employees = [],
  onClose,
  onSubmit,
}) {
  const modalRef = useRef(null);

  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [remarks, setRemarks] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setEmployeeId("");
    setDate("");
    setRemarks("");
    setError("");
    setSubmitting(false);
  }, [open]);

  useEffect(() => {
    if (!open || !modalRef.current) return;

    const context = gsap.context(() => {
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      gsap.fromTo(
        ".absent-backdrop",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2 }
      );

      gsap.fromTo(
        ".absent-panel",
        { autoAlpha: 0, y: 20, scale: 0.97 },
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

  if (!open) return null;

  const activeEmployees = employees.filter(
    (employee) => employee.employmentStatus === "ACTIVE"
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!employeeId || !date) {
      setError("Select an employee and attendance date.");
      return;
    }

    if (date >= getISTDate()) {
      setError("Only past dates can be marked absent.");
      return;
    }

    if (remarks.trim().length > 500) {
      setError("Remarks cannot exceed 500 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        employeeId,
        date,
        adminRemarks: remarks.trim(),
      });
    } catch (err) {
      setError(err.message || "Unable to mark employee absent.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="absent-backdrop fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <div className="absent-panel w-full max-w-lg overflow-hidden rounded-3xl border border-red-400/20 bg-[#0b0e1c] shadow-[0_0_90px_rgba(220,38,38,.12)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/[.07] p-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10 text-red-300">
              <CalendarX size={21} />
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[.2em] text-red-300">
                ATTENDANCE MANAGEMENT
              </p>

              <h2 className="mt-1 font-display text-xl font-semibold">
                Mark absence
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Record an employee's absence for a past date.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6 sm:px-8">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-300">
                Employee *
              </label>

              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0b0e1c] px-4 py-3 text-sm text-white outline-none focus:border-red-400/50"
              >
                <option value="">Select employee</option>

                {activeEmployees.map((employee) => (
                  <option
                    key={employee._id}
                    value={employee._id}
                    className="bg-[#0b0e1c]"
                  >
                    {employee.userId?.name || "Employee"} —{" "}
                    {employee.employeeCode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-300">
                Attendance date *
              </label>

              <input
                type="date"
                value={date}
                max={getISTDate()}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0b0e1c] px-4 py-3 text-sm text-white outline-none focus:border-red-400/50"
              />

              <p className="mt-1.5 text-[10px] text-slate-600">
                Only past dates are accepted by the server.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-300">
                Admin remarks
              </label>

              <textarea
                rows={3}
                maxLength={500}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Reason for recording this absence..."
                className="w-full resize-none rounded-xl border border-white/10 bg-[#0b0e1c] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-400/50"
              />
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[.05] p-4">
              <AlertTriangle
                size={17}
                className="mt-0.5 shrink-0 text-amber-300"
              />

              <p className="text-xs leading-5 text-slate-400">
                Employees with an approved leave request on this date
                cannot be marked absent. Existing attendance records
                also cannot be overwritten.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/[.07] px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/[.07] bg-[#090c19] px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-white/10 px-5 py-3 text-xs text-slate-300 hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || activeEmployees.length === 0}
              className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Confirm absence"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
