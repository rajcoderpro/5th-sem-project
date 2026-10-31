
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Pencil,
  Power,
  MapPin,
  BriefcaseBusiness,
  Building2,
} from "lucide-react";

import { apiGet, apiRequest } from "../../services/api.js";
import EmployeeFormModal from "../../components/admin/EmployeeFormModal.jsx";

const statusStyles = {
  ACTIVE: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  ON_LEAVE: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  INACTIVE: "border-slate-400/20 bg-slate-400/10 text-slate-400",
  TERMINATED: "border-red-400/20 bg-red-400/10 text-red-300",
};

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function StatCard({ icon: Icon, label, value, color, index }) {
  return (
    <div
      className="employee-reveal relative overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-500/[.05] blur-2xl" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <h3 className="mt-3 font-display text-3xl font-semibold tabular-nums">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.06] ${color}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const rootRef = useRef(null);

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [processingId, setProcessingId] = useState(null);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    setError("");

    try {
      const [employeeResponse, departmentResponse] =
        await Promise.all([
          apiGet("/api/employees"),
          apiGet("/api/departments"),
        ]);

      setEmployees(employeeResponse.employees || []);
      setDepartments(departmentResponse.departments || []);
    } catch (err) {
      console.error("Employee page loading error:", err);
      setError(err.message || "Unable to load employee data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Animate the page after the initial loading state.
  useEffect(() => {
    if (loading || !rootRef.current) return;

    const context = gsap.context(() => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reducedMotion) return;

      gsap.fromTo(
        ".employee-intro",
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".employee-reveal",
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.07,
          ease: "power2.out",
          delay: 0.1,
        }
      );
    }, rootRef);

    return () => context.revert();
  }, [loading]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const name = employee.userId?.name || "";
      const email = employee.userId?.email || "";
      const code = employee.employeeCode || "";
      const designation = employee.designation || "";

      const matchesSearch =
        !query ||
        [name, email, code, designation].some((value) =>
          value.toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        employee.employmentStatus === statusFilter;

      const matchesDepartment =
        departmentFilter === "ALL" ||
        employee.departmentId?._id === departmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDepartment
      );
    });
  }, [employees, search, statusFilter, departmentFilter]);

  const stats = [
    {
      label: "Total employees",
      value: employees.length,
      icon: Users,
      color: "bg-violet-400/10 text-violet-300",
    },
    {
      label: "Active employees",
      value: employees.filter(
        (employee) => employee.employmentStatus === "ACTIVE"
      ).length,
      icon: UserCheck,
      color: "bg-emerald-400/10 text-emerald-300",
    },
    {
      label: "On leave",
      value: employees.filter(
        (employee) => employee.employmentStatus === "ON_LEAVE"
      ).length,
      icon: UserX,
      color: "bg-amber-400/10 text-amber-300",
    },
    {
      label: "Inactive",
      value: employees.filter(
        (employee) => employee.employmentStatus === "INACTIVE"
      ).length,
      icon: Power,
      color: "bg-slate-400/10 text-slate-300",
    },
  ];

  const openCreateModal = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSaveEmployee = async (payload) => {
    const isEdit = Boolean(editingEmployee);

    const endpoint = isEdit
      ? `/api/employees/${editingEmployee._id}`
      : "/api/employees";

    const response = await apiRequest(endpoint, {
      method: isEdit ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });

    setNotice(
      response.message ||
        (isEdit
          ? "Employee updated successfully."
          : "Employee created successfully.")
    );

    closeModal();
    await loadData(false);
  };

  const handleToggleStatus = async (employee) => {
    const isInactive = employee.employmentStatus === "INACTIVE";

    if (employee.employmentStatus === "TERMINATED") {
      return;
    }

    const action = isInactive ? "activate" : "deactivate";

    const employeeName =
      employee.userId?.name || employee.employeeCode;

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${employeeName}?`
    );

    if (!confirmed) return;

    setProcessingId(employee._id);
    setNotice("");
    setError("");

    try {
      const response = await apiRequest(
        `/api/employees/${employee._id}/${action}`,
        {
          method: "PATCH",
        }
      );

      setNotice(response.message || "Employee status updated.");
      await loadData(false);
    } catch (err) {
      setError(err.message || "Unable to update employee status.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-7">
        <div className="h-24 animate-pulse rounded-2xl bg-white/[.025]" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-white/[.025]"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-white/[.025]" />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="space-y-7">
      {/* Page heading */}
      <div className="employee-intro flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">
            WORKFORCE / PEOPLE
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Employee <span className="text-violet-300">management.</span>
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Manage employee accounts, departments, skills and working
            capacity from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => loadData(false)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-xs font-semibold text-white shadow-[0_0_25px_rgba(124,58,237,.22)] transition hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(124,58,237,.35)]"
          >
            <UserPlus size={16} />
            Add employee
          </button>
        </div>
      </div>

      {/* Success message */}
      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[.07] px-4 py-3 text-xs text-emerald-300">
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-emerald-200/70 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/[.07] px-4 py-3 text-xs text-red-300">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-200/70 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      {/* Filters */}
      <section className="employee-reveal rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-violet-300" />
          <h2 className="text-sm font-semibold">Find employees</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_190px_190px]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, code or designation..."
              className="w-full rounded-xl border border-white/10 bg-[#090c19] py-3 pl-11 pr-4 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#090c19] px-4 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
          >
            <option value="ALL">All departments</option>

            {departments.map((department) => (
              <option
                key={department._id}
                value={department._id}
                className="bg-[#090c19]"
              >
                {department.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#090c19] px-4 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On leave</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
          <span>
            Showing {filteredEmployees.length} of {employees.length} employees
          </span>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setDepartmentFilter("ALL");
            }}
            className="text-violet-300 transition hover:text-white"
          >
            Clear filters
          </button>
        </div>
      </section>

      {/* Employee directory */}
      <section className="employee-reveal overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90">
        <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[.08]">
              <Users size={19} className="text-violet-300" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold">
                Employee directory
              </h2>

              <p className="mt-1 text-[10px] text-slate-500">
                Manage your organization's employee records.
              </p>
            </div>
          </div>

          <span className="rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 text-[10px] text-slate-400">
            {filteredEmployees.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-white/[.06] bg-white/[.015] text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-4 py-4 font-medium">Department</th>
                <th className="px-4 py-4 font-medium">Designation</th>
                <th className="px-4 py-4 font-medium">Employment</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => {
                const name =
                  employee.userId?.name || "Unknown employee";

                const email =
                  employee.userId?.email || "No email available";

                const status =
                  employee.employmentStatus || "INACTIVE";

                const isInactive = status === "INACTIVE";
                const isTerminated = status === "TERMINATED";

                return (
                  <tr
                    key={employee._id}
                    className="border-b border-white/[.04] transition hover:bg-white/[.025]"
                  >
                    {/* Employee */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-gradient-to-br from-violet-500/15 to-cyan-500/[.07] text-xs font-semibold text-violet-200">
                          {getInitials(name)}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-48 truncate text-xs font-semibold text-slate-200">
                            {name}
                          </p>

                          <p className="mt-1 max-w-48 truncate text-[10px] text-slate-500">
                            {email}
                          </p>

                          <p className="mt-1 text-[9px] tracking-wider text-slate-600">
                            {employee.employeeCode}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building2
                          size={14}
                          className="text-slate-500"
                        />

                        <span className="text-xs text-slate-300">
                          {employee.departmentId?.name || "Unassigned"}
                        </span>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness
                          size={14}
                          className="text-slate-500"
                        />

                        <span className="text-xs text-slate-400">
                          {employee.designation || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Employment type */}
                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-300">
                        {(employee.employmentType || "FULL_TIME")
                          .replaceAll("_", " ")}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-600">
                        {employee.workMode || "ONSITE"}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                          statusStyles[status] || statusStyles.INACTIVE
                        }`}
                      >
                        {status.replaceAll("_", " ")}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(employee)}
                          title="Edit employee"
                          aria-label={`Edit ${name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-violet-200"
                        >
                          <Pencil size={15} />
                        </button>

                        {!isTerminated && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(employee)}
                            disabled={processingId === employee._id}
                            title={
                              isInactive
                                ? "Reactivate employee"
                                : "Deactivate employee"
                            }
                            aria-label={
                              isInactive
                                ? `Reactivate ${name}`
                                : `Deactivate ${name}`
                            }
                            className={`flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-[10px] font-medium transition disabled:opacity-50 ${
                              isInactive
                                ? "border-emerald-400/20 text-emerald-300 hover:bg-emerald-400/10"
                                : "border-red-400/20 text-red-300 hover:bg-red-400/10"
                            }`}
                          >
                            <Power size={14} />
                            <span>
                              {processingId === employee._id
                                ? "Updating"
                                : isInactive
                                  ? "Activate"
                                  : "Deactivate"}
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[.03]">
                      <Users className="h-6 w-6 text-slate-500" />
                    </div>

                    <p className="mt-4 text-sm font-medium text-slate-300">
                      No employees found
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Try changing your filters or add a new employee.
                    </p>

                    {search === "" &&
                      statusFilter === "ALL" &&
                      departmentFilter === "ALL" && (
                        <button
                          type="button"
                          onClick={openCreateModal}
                          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500"
                        >
                          <UserPlus size={14} />
                          Add first employee
                        </button>
                      )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[.06] px-5 py-4 text-[10px] text-slate-600 sm:px-6">
          <span>Employee records are loaded from your backend API.</span>

          <span className="inline-flex items-center gap-2">
            <MapPin size={12} />
            WorkForce AI
          </span>
        </div>
      </section>

      {/* Employee create/edit modal */}
      <EmployeeFormModal
        open={modalOpen}
        employee={editingEmployee}
        employees={employees}
        departments={departments}
        onClose={closeModal}
        onSubmit={handleSaveEmployee}
      />
    </div>
  );
}
