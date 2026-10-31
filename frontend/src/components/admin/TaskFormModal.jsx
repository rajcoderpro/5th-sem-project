
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import {
  ClipboardPlus,
  Sparkles,
  Plus,
  Trash2,
  X,
} from "lucide-react";

function getLocalDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateValue(value) {
  if (!value) return getLocalDate();

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return getLocalDate();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const emptyForm = () => ({
  title: "",
  description: "",
  departmentId: "",
  priority: "MEDIUM",
  startDate: getLocalDate(),
  dueDate: getLocalDate(1),
  estimatedHours: 4,
  skillsRequired: [],
  tagsText: "",
});

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0b0e1c] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/10";

const labelClass =
  "mb-2 block text-xs font-medium text-slate-300";

function SectionHeading({ number, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-400/10 text-xs font-semibold text-violet-300">
        {number}
      </span>

      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export default function TaskFormModal({
  open,
  task,
  departments = [],
  onClose,
  onSubmit,
}) {
  const modalRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(task);

  useEffect(() => {
    if (!open) return;

    if (!task) {
      setForm(emptyForm());
    } else {
      setForm({
        title: task.title || "",
        description: task.description || "",
        departmentId: task.departmentId?._id || "",
        priority: task.priority || "MEDIUM",
        startDate: getDateValue(task.startDate),
        dueDate: getDateValue(task.dueDate),
        estimatedHours: task.estimatedHours ?? 4,
        skillsRequired: (task.skillsRequired || []).map((skill) => ({
          name: skill.name || "",
          minimumLevel: skill.minimumLevel || 1,
        })),
        tagsText: (task.tags || []).join(", "),
      });
    }

    setSubmitting(false);
    setError("");
  }, [open, task]);

  useEffect(() => {
    if (!open || !modalRef.current) return;

    const context = gsap.context(() => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reducedMotion) return;

      gsap.fromTo(
        ".task-modal-backdrop",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2 }
      );

      gsap.fromTo(
        ".task-modal-panel",
        { autoAlpha: 0, y: 22, scale: 0.97 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".task-field",
        { autoAlpha: 0, y: 9 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.035,
        }
      );
    }, modalRef);

    return () => context.revert();
  }, [open]);

  if (!open) return null;

  const updateField = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const addSkill = () => {
    setForm((previous) => ({
      ...previous,
      skillsRequired: [
        ...previous.skillsRequired,
        { name: "", minimumLevel: 1 },
      ],
    }));
  };

  const updateSkill = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      skillsRequired: previous.skillsRequired.map((skill, i) =>
        i === index
          ? { ...skill, [field]: value }
          : skill
      ),
    }));
  };

  const removeSkill = (index) => {
    setForm((previous) => ({
      ...previous,
      skillsRequired: previous.skillsRequired.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const title = form.title.trim();
    const description = form.description.trim();
    const estimatedHours = Number(form.estimatedHours);

    if (!title) {
      setError("Task title is required.");
      return;
    }

    if (!form.departmentId) {
      setError("Please select an active department.");
      return;
    }

    if (!form.startDate || !form.dueDate) {
      setError("Start date and due date are required.");
      return;
    }

    if (form.dueDate < form.startDate) {
      setError("Due date cannot be earlier than the start date.");
      return;
    }

    if (!Number.isFinite(estimatedHours) || estimatedHours <= 0) {
      setError("Estimated hours must be greater than zero.");
      return;
    }

    if (
      form.skillsRequired.some(
        (skill) => !skill.name.trim()
      )
    ) {
      setError("Enter a name for every required skill.");
      return;
    }

    const tags = [
      ...new Set(
        form.tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      ),
    ];

    const payload = {
      title,
      description,
      departmentId: form.departmentId,
      priority: form.priority,
      startDate: form.startDate,
      dueDate: form.dueDate,
      estimatedHours,
      skillsRequired: form.skillsRequired.map((skill) => ({
        name: skill.name.trim(),
        minimumLevel: Number(skill.minimumLevel),
      })),
      tags,
    };

    setSubmitting(true);

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || "Unable to save task.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeDepartments = departments.filter(
    (department) => department.isActive !== false
  );

  return (
    <div
      ref={modalRef}
      className="task-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <div className="task-modal-panel my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-violet-400/20 bg-[#0b0e1c] shadow-[0_0_100px_rgba(109,40,217,.18)]">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-white/[.07] px-5 py-5 sm:px-8">
          <div className="pointer-events-none absolute -right-10 -top-20 h-44 w-44 rounded-full bg-violet-600/15 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <ClipboardPlus size={21} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[.2em] text-violet-300">
                  TASK MANAGEMENT
                </p>

                <h2 className="mt-1 font-display text-xl font-semibold">
                  {isEdit ? "Edit task" : "Create new task"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {isEdit
                    ? "Update the task's details and requirements."
                    : "Define the task and its requirements for your team."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close form"
              className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[72vh] space-y-8 overflow-y-auto px-5 py-7 sm:px-8">
            {/* Basic details */}
            <section>
              <SectionHeading
                number="01"
                title="Task information"
                description="Give the task a clear title and description."
              />

              <div className="space-y-5">
                <div className="task-field">
                  <label className={labelClass}>Task title *</label>

                  <input
                    className={inputClass}
                    value={form.title}
                    onChange={(e) =>
                      updateField("title", e.target.value)
                    }
                    placeholder="e.g. Build employee authentication module"
                    maxLength={150}
                    required
                  />
                </div>

                <div className="task-field">
                  <label className={labelClass}>Description</label>

                  <textarea
                    rows={4}
                    maxLength={2000}
                    className={`${inputClass} resize-none`}
                    value={form.description}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                    placeholder="Explain the expected deliverables, requirements and scope..."
                  />

                  <p className="mt-1.5 text-right text-[10px] text-slate-600">
                    {form.description.length}/2000
                  </p>
                </div>
              </div>
            </section>

            {/* Classification */}
            <section>
              <SectionHeading
                number="02"
                title="Classification"
                description="Choose the department and priority."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="task-field">
                  <label className={labelClass}>Department *</label>

                  <select
                    className={inputClass}
                    value={form.departmentId}
                    onChange={(e) =>
                      updateField("departmentId", e.target.value)
                    }
                    required
                  >
                    <option value="">Select department</option>

                    {activeDepartments.map((department) => (
                      <option
                        key={department._id}
                        value={department._id}
                        className="bg-[#0b0e1c]"
                      >
                        {department.name} ({department.code})
                      </option>
                    ))}
                  </select>

                  {activeDepartments.length === 0 && (
                    <p className="mt-1.5 text-[10px] text-amber-300">
                      Create an active department first.
                    </p>
                  )}
                </div>

                <div className="task-field">
                  <label className={labelClass}>Priority *</label>

                  <select
                    className={inputClass}
                    value={form.priority}
                    onChange={(e) =>
                      updateField("priority", e.target.value)
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Schedule */}
            <section>
              <SectionHeading
                number="03"
                title="Schedule and estimation"
                description="Set the planned dates and expected effort."
              />

              <div className="grid gap-5 sm:grid-cols-3">
                <div className="task-field">
                  <label className={labelClass}>Start date *</label>

                  <input
                    type="date"
                    className={inputClass}
                    value={form.startDate}
                    onChange={(e) =>
                      updateField("startDate", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="task-field">
                  <label className={labelClass}>Due date *</label>

                  <input
                    type="date"
                    min={form.startDate}
                    className={inputClass}
                    value={form.dueDate}
                    onChange={(e) =>
                      updateField("dueDate", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="task-field">
                  <label className={labelClass}>
                    Estimated hours *
                  </label>

                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    className={inputClass}
                    value={form.estimatedHours}
                    onChange={(e) =>
                      updateField("estimatedHours", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </section>

            {/* Skills */}
            <section>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <SectionHeading
                  number="04"
                  title="Required skills"
                  description="Define the skills needed to complete this task."
                />

                <button
                  type="button"
                  onClick={addSkill}
                  className="inline-flex items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-400/[.08] px-3 py-2 text-xs font-medium text-violet-200 transition hover:bg-violet-400/15"
                >
                  <Plus size={14} />
                  Add skill
                </button>
              </div>

              <div className="space-y-3">
                {form.skillsRequired.map((skill, index) => (
                  <div
                    key={index}
                    className="task-field grid gap-3 rounded-xl border border-white/[.07] bg-white/[.02] p-4 sm:grid-cols-[1fr_180px_auto]"
                  >
                    <div>
                      <label className={labelClass}>Skill name</label>

                      <input
                        className={inputClass}
                        value={skill.name}
                        onChange={(e) =>
                          updateSkill(index, "name", e.target.value)
                        }
                        placeholder="e.g. React"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Minimum level
                      </label>

                      <select
                        className={inputClass}
                        value={skill.minimumLevel}
                        onChange={(e) =>
                          updateSkill(
                            index,
                            "minimumLevel",
                            Number(e.target.value)
                          )
                        }
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <option
                            key={level}
                            value={level}
                            className="bg-[#0b0e1c]"
                          >
                            Level {level}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        aria-label="Remove skill"
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/15 bg-red-400/[.06] text-red-300 transition hover:bg-red-400/15"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {form.skillsRequired.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 px-4 py-7 text-center">
                    <Sparkles className="mx-auto h-6 w-6 text-violet-300" />

                    <p className="mt-3 text-xs text-slate-400">
                      No required skills added.
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                      Skills can later help match tasks with employees.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Tags */}
            <section>
              <SectionHeading
                number="05"
                title="Task tags"
                description="Add labels to make tasks easier to organize."
              />

              <div className="task-field">
                <label className={labelClass}>
                  Tags (comma separated)
                </label>

                <input
                  className={inputClass}
                  value={form.tagsText}
                  onChange={(e) =>
                    updateField("tagsText", e.target.value)
                  }
                  placeholder="frontend, sprint-1, client-project"
                />

                <p className="mt-1.5 text-[10px] text-slate-600">
                  Example: frontend, urgent-release, redesign
                </p>
              </div>
            </section>

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/[.07] px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/[.07] bg-[#090c19] px-5 py-5 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-white/10 px-5 py-3 text-xs font-medium text-slate-300 transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || activeDepartments.length === 0}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-[0_0_25px_rgba(124,58,237,.2)] transition hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(124,58,237,.35)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Saving task..."
                : isEdit
                  ? "Save changes"
                  : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
