
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import {
  Building2,
  X,
  Sparkles,
} from "lucide-react";

const emptyForm = {
  name: "",
  code: "",
  description: "",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0b0e1c] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/10";

const labelClass =
  "mb-2 block text-xs font-medium text-slate-300";

export default function DepartmentFormModal({
  open,
  department,
  onClose,
  onSubmit,
}) {
  const modalRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(department);

  useEffect(() => {
    if (!open) return;

    setForm(
      department
        ? {
            name: department.name || "",
            code: department.code || "",
            description: department.description || "",
          }
        : emptyForm
    );

    setError("");
    setSubmitting(false);
  }, [open, department]);

  useEffect(() => {
    if (!open || !modalRef.current) return;

    const context = gsap.context(() => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reducedMotion) return;

      gsap.fromTo(
        ".department-modal-backdrop",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2 }
      );

      gsap.fromTo(
        ".department-modal-panel",
        {
          autoAlpha: 0,
          y: 22,
          scale: 0.97,
        },
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
    };

    if (!payload.name || !payload.code) {
      setError("Department name and code are required.");
      return;
    }

    if (payload.name.length > 80) {
      setError("Department name cannot exceed 80 characters.");
      return;
    }

    if (payload.code.length > 10) {
      setError("Department code cannot exceed 10 characters.");
      return;
    }

    if (payload.description.length > 500) {
      setError("Description cannot exceed 500 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(
        err.message || "Unable to save department."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="department-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <div className="department-modal-panel my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-violet-400/20 bg-[#0b0e1c] shadow-[0_0_100px_rgba(109,40,217,.18)]">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-white/[.07] px-6 py-6 sm:px-8">
          <div className="pointer-events-none absolute -right-10 -top-20 h-44 w-44 rounded-full bg-violet-600/15 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <Building2 size={21} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[.2em] text-violet-300">
                  DEPARTMENT MANAGEMENT
                </p>

                <h2 className="mt-1 font-display text-xl font-semibold text-white">
                  {isEdit ? "Edit department" : "Create department"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {isEdit
                    ? "Update department details."
                    : "Add a new department to your workspace."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close form"
              className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-6 py-7 sm:px-8">
            <div>
              <label className={labelClass}>
                Department name *
              </label>

              <input
                autoFocus
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Engineering"
                maxLength={80}
                required
              />

              <p className="mt-1.5 text-[10px] text-slate-600">
                Use a clear, recognizable department name.
              </p>
            </div>

            <div>
              <label className={labelClass}>
                Department code *
              </label>

              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                className={`${inputClass} font-mono uppercase tracking-wider`}
                placeholder="e.g. ENG"
                maxLength={10}
                required
              />

              <p className="mt-1.5 text-[10px] text-slate-600">
                Maximum 10 characters. The code is automatically
                converted to uppercase.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className={labelClass}>
                  Description
                </label>

                <span className="text-[10px] text-slate-600">
                  {form.description.length}/500
                </span>
              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                className={`${inputClass} resize-none`}
                placeholder="Describe this department's responsibilities..."
              />
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-violet-400/10 bg-violet-400/[.04] p-4">
              <Sparkles
                size={17}
                className="mt-0.5 shrink-0 text-violet-300"
              />

              <p className="text-xs leading-5 text-slate-400">
                Departments help organize employees and tasks. This
                information will also support future workload
                analysis and intelligent task allocation.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/[.07] px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/[.07] bg-[#090c19] px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-white/10 px-5 py-3 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-[0_0_25px_rgba(124,58,237,.2)] transition hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(124,58,237,.35)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
