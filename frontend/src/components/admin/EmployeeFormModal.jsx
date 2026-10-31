
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  X,
  UserPlus,
  UserRoundPen,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0b0e1c] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/10";

const labelClass =
  "mb-2 block text-xs font-medium text-slate-300";

const today = () => {
  const date = new Date();
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 10);
};

const emptyForm = () => ({
  name: "",
  email: "",
  password: "",
  employeeCode: "",
  designation: "",
  departmentId: "",
  managerId: "",
  employmentType: "FULL_TIME",
  workMode: "ONSITE",
  joiningDate: today(),
  skills: [],
  capacity: {
    weeklyHours: 40,
    maxConcurrentTasks: 5,
  },
  profile: {
    location: "",
    bio: "",
  },
});

function getDateValue(value) {
  if (!value) return today();

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? today()
    : date.toISOString().slice(0, 10);
}

function SectionTitle({ number, title, description }) {
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

export default function EmployeeFormModal({
  open,
  employee,
  employees = [],
  departments = [],
  onClose,
  onSubmit,
}) {
  const modalRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const isEdit = Boolean(employee);

  useEffect(() => {
    if (!open) return;

    if (!employee) {
      setForm(emptyForm());
    } else {
      setForm({
        ...emptyForm(),
        name: employee.userId?.name || "",
        email: employee.userId?.email || "",
        employeeCode: employee.employeeCode || "",
        designation: employee.designation || "",
        departmentId: employee.departmentId?._id || "",
        managerId: employee.managerId?._id || "",
        employmentType: employee.employmentType || "FULL_TIME",
        workMode: employee.workMode || "ONSITE",
        joiningDate: getDateValue(employee.joiningDate),
        skills: (employee.skills || []).map((skill) => ({
          name: skill.name || "",
          proficiencyLevel: skill.proficiencyLevel || 1,
          yearsOfExperience: skill.yearsOfExperience || 0,
        })),
        capacity: {
          weeklyHours: employee.capacity?.weeklyHours ?? 40,
          maxConcurrentTasks:
            employee.capacity?.maxConcurrentTasks ?? 5,
        },
        profile: {
          location: employee.profile?.location || "",
          bio: employee.profile?.bio || "",
        },
      });
    }

    setFormError("");
    setSubmitting(false);
  }, [employee, open]);

  useEffect(() => {
    if (!open || !modalRef.current) return;

    const context = gsap.context(() => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reducedMotion) return;

      gsap.fromTo(
        ".employee-modal-backdrop",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2 }
      );

      gsap.fromTo(
        ".employee-modal-panel",
        {
          autoAlpha: 0,
          y: 24,
          scale: 0.97,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".employee-field",
        {
          autoAlpha: 0,
          y: 10,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.035,
          ease: "power2.out",
        }
      );
    }, modalRef);

    return () => context.revert();
  }, [open]);

  if (!open) return null;

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedField = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const addSkill = () => {
    setForm((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          name: "",
          proficiencyLevel: 3,
          yearsOfExperience: 0,
        },
      ],
    }));
  };

  const updateSkill = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) =>
        i === index
          ? {
              ...skill,
              [field]: value,
            }
          : skill
      ),
    }));
  };

  const removeSkill = (index) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.departmentId) {
      setFormError("Please select an active department.");
      return;
    }

    if (!form.joiningDate) {
      setFormError("Please select a joining date.");
      return;
    }

    if (!isEdit && form.password.length < 8) {
      setFormError("Password must contain at least 8 characters.");
      return;
    }

    if (form.skills.some((skill) => !skill.name.trim())) {
      setFormError("Please enter a name for every skill.");
      return;
    }

    const skills = form.skills.map((skill) => ({
      name: skill.name.trim(),
      proficiencyLevel: Number(skill.proficiencyLevel),
      yearsOfExperience: Number(skill.yearsOfExperience),
    }));

    const payload = {
      employeeCode: form.employeeCode.trim().toUpperCase(),
      designation: form.designation.trim(),
      departmentId: form.departmentId,
      managerId: form.managerId || null,
      employmentType: form.employmentType,
      workMode: form.workMode,
      joiningDate: form.joiningDate,
      skills,
      capacity: {
        weeklyHours: Number(form.capacity.weeklyHours),
        maxConcurrentTasks: Number(
          form.capacity.maxConcurrentTasks
        ),
      },
      profile: {
        location: form.profile.location.trim(),
        bio: form.profile.bio.trim(),
      },
    };

    if (!isEdit) {
      Object.assign(payload, {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
    }

    setSubmitting(true);

    try {
      await onSubmit(payload);
    } catch (error) {
      setFormError(
        error.message || "Unable to save employee details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const activeDepartments = departments.filter(
    (department) => department.isActive !== false
  );

  const availableManagers = employees.filter(
    (item) =>
      item.employmentStatus === "ACTIVE" &&
      item._id !== employee?._id
  );

  return (
    <div
      ref={modalRef}
      className="employee-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div className="employee-modal-panel my-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-violet-400/20 bg-[#0b0e1c] shadow-[0_0_100px_rgba(109,40,217,.18)]">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-white/[.07] px-5 py-5 sm:px-8">
          <div className="pointer-events-none absolute -right-10 -top-20 h-44 w-44 rounded-full bg-violet-600/15 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                {isEdit ? (
                  <UserRoundPen size={21} />
                ) : (
                  <UserPlus size={21} />
                )}
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[.2em] text-violet-300">
                  EMPLOYEE MANAGEMENT
                </p>

                <h2 className="mt-1 font-display text-xl font-semibold">
                  {isEdit ? "Edit employee" : "Add new employee"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {isEdit
                    ? "Update employee profile and work information."
                    : "Create an employee account and workspace profile."}
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

        <form onSubmit={handleSubmit}>
          <div className="max-h-[72vh] space-y-8 overflow-y-auto px-5 py-7 sm:px-8">
            {/* Account information */}
            <section>
              <SectionTitle
                number="01"
                title="Account information"
                description="Employee login and identity details."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="employee-field">
                  <label className={labelClass}>Full name *</label>

                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={(e) =>
                      updateField("name", e.target.value)
                    }
                    placeholder="e.g. Aarav Sharma"
                    maxLength={80}
                    required
                    disabled={isEdit}
                  />

                  {isEdit && (
                    <p className="mt-1.5 text-[10px] text-slate-600">
                      Account name editing isn't enabled in the current API.
                    </p>
                  )}
                </div>

                <div className="employee-field">
                  <label className={labelClass}>Email address *</label>

                  <input
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    placeholder="employee@company.com"
                    required
                    disabled={isEdit}
                  />

                  {isEdit && (
                    <p className="mt-1.5 text-[10px] text-slate-600">
                      Login email editing isn't enabled in the current API.
                    </p>
                  )}
                </div>

                {!isEdit && (
                  <div className="employee-field sm:col-span-2">
                    <label className={labelClass}>
                      Initial password *
                    </label>

                    <input
                      type="password"
                      className={inputClass}
                      value={form.password}
                      onChange={(e) =>
                        updateField("password", e.target.value)
                      }
                      placeholder="At least 8 characters"
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                      required
                    />

                    <p className="mt-1.5 text-[10px] text-slate-600">
                      The backend hashes this password before saving it.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Employment details */}
            <section>
              <SectionTitle
                number="02"
                title="Employment details"
                description="Department, role and employment information."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="employee-field">
                  <label className={labelClass}>Employee code *</label>

                  <input
                    className={inputClass}
                    value={form.employeeCode}
                    onChange={(e) =>
                      updateField("employeeCode", e.target.value)
                    }
                    placeholder="e.g. WF-001"
                    required
                  />
                </div>

                <div className="employee-field">
                  <label className={labelClass}>Designation *</label>

                  <input
                    className={inputClass}
                    value={form.designation}
                    onChange={(e) =>
                      updateField("designation", e.target.value)
                    }
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                </div>

                <div className="employee-field">
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
                      Create an active department before adding employees.
                    </p>
                  )}
                </div>

                <div className="employee-field">
                  <label className={labelClass}>Reporting manager</label>

                  <select
                    className={inputClass}
                    value={form.managerId}
                    onChange={(e) =>
                      updateField("managerId", e.target.value)
                    }
                  >
                    <option value="">No manager</option>

                    {availableManagers.map((manager) => (
                      <option
                        key={manager._id}
                        value={manager._id}
                        className="bg-[#0b0e1c]"
                      >
                        {manager.employeeCode} —{" "}
                        {manager.userId?.name || manager.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="employee-field">
                  <label className={labelClass}>Employment type</label>

                  <select
                    className={inputClass}
                    value={form.employmentType}
                    onChange={(e) =>
                      updateField("employmentType", e.target.value)
                    }
                  >
                    <option value="FULL_TIME">Full time</option>
                    <option value="PART_TIME">Part time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>

                <div className="employee-field">
                  <label className={labelClass}>Work mode</label>

                  <select
                    className={inputClass}
                    value={form.workMode}
                    onChange={(e) =>
                      updateField("workMode", e.target.value)
                    }
                  >
                    <option value="ONSITE">Onsite</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>

                <div className="employee-field sm:col-span-2">
                  <label className={labelClass}>Joining date *</label>

                  <input
                    type="date"
                    className={inputClass}
                    value={form.joiningDate}
                    onChange={(e) =>
                      updateField("joiningDate", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </section>

            {/* Skills */}
            <section>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <SectionTitle
                  number="03"
                  title="Skills and expertise"
                  description="Capture employee skills for future intelligent task allocation."
                />

                <button
                  type="button"
                  onClick={addSkill}
                  className="mb-5 inline-flex items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-400/[.08] px-3 py-2 text-xs font-medium text-violet-200 transition hover:bg-violet-400/15"
                >
                  <Plus size={14} />
                  Add skill
                </button>
              </div>

              <div className="space-y-3">
                {form.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="employee-field grid gap-3 rounded-xl border border-white/[.07] bg-white/[.02] p-4 sm:grid-cols-[1.3fr_.8fr_.8fr_auto]"
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
                        Proficiency (1–5)
                      </label>

                      <select
                        className={inputClass}
                        value={skill.proficiencyLevel}
                        onChange={(e) =>
                          updateSkill(
                            index,
                            "proficiencyLevel",
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

                    <div>
                      <label className={labelClass}>Experience (yrs)</label>

                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className={inputClass}
                        value={skill.yearsOfExperience}
                        onChange={(e) =>
                          updateSkill(
                            index,
                            "yearsOfExperience",
                            e.target.value
                          )
                        }
                      />
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

                {form.skills.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
                    <Sparkles className="mx-auto h-6 w-6 text-violet-300" />
                    <p className="mt-3 text-xs text-slate-400">
                      No skills added yet.
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      Add skills to support future AI-based task matching.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Work capacity */}
            <section>
              <SectionTitle
                number="04"
                title="Work capacity"
                description="Define the employee's expected working capacity."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="employee-field">
                  <label className={labelClass}>Weekly working hours</label>

                  <input
                    type="number"
                    min="0"
                    max="168"
                    className={inputClass}
                    value={form.capacity.weeklyHours}
                    onChange={(e) =>
                      updateNestedField(
                        "capacity",
                        "weeklyHours",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="employee-field">
                  <label className={labelClass}>
                    Maximum concurrent tasks
                  </label>

                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={form.capacity.maxConcurrentTasks}
                    onChange={(e) =>
                      updateNestedField(
                        "capacity",
                        "maxConcurrentTasks",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>
            </section>

            {/* Profile */}
            <section>
              <SectionTitle
                number="05"
                title="Additional information"
                description="Optional employee profile details."
              />

              <div className="space-y-5">
                <div className="employee-field">
                  <label className={labelClass}>Location</label>

                  <input
                    className={inputClass}
                    value={form.profile.location}
                    onChange={(e) =>
                      updateNestedField(
                        "profile",
                        "location",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Delhi, India"
                  />
                </div>

                <div className="employee-field">
                  <label className={labelClass}>Short bio</label>

                  <textarea
                    rows={3}
                    maxLength={500}
                    className={`${inputClass} resize-none`}
                    value={form.profile.bio}
                    onChange={(e) =>
                      updateNestedField(
                        "profile",
                        "bio",
                        e.target.value
                      )
                    }
                    placeholder="A short introduction about the employee..."
                  />
                </div>
              </div>
            </section>

            {formError && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/[.07] px-4 py-3 text-xs text-red-300">
                {formError}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/[.07] bg-[#090c19] px-5 py-5 sm:flex-row sm:justify-end sm:px-8">
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
              disabled={
                submitting ||
                (!isEdit && activeDepartments.length === 0)
              }
              className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-[0_0_25px_rgba(124,58,237,.2)] transition hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(124,58,237,.35)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Saving employee..."
                : isEdit
                  ? "Save changes"
                  : "Create employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
