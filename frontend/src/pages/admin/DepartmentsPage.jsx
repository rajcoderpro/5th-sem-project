
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import gsap from "gsap";

import {
  Building2,
  CheckCircle2,
  Search,
  RefreshCw,
  Plus,
  Power,
  Users,
  SlidersHorizontal,
} from "lucide-react";

import { apiGet, apiRequest } from "../../services/api.js";

import DepartmentFormModal from "../../components/admin/DepartmentFormModal.jsx";
import DepartmentTable from "../../components/admin/DepartmentTable.jsx";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="department-reveal group relative overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-500/[.05] blur-2xl transition group-hover:bg-violet-500/[.10]" />

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

export default function DepartmentsPage() {
  const rootRef = useRef(null);

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const [processingId, setProcessingId] = useState(null);

  // Load departments and employees together.
  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const [departmentResponse, employeeResponse] =
        await Promise.all([
          apiGet("/api/departments"),
          apiGet("/api/employees"),
        ]);

      setDepartments(departmentResponse.departments || []);
      setEmployees(employeeResponse.employees || []);
    } catch (err) {
      console.error("Department page loading error:", err);

      setError(
        err.message || "Unable to load department data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // GSAP entrance animation.
  useEffect(() => {
    if (loading || !rootRef.current) return;

    const context = gsap.context(() => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reducedMotion) return;

      gsap.fromTo(
        ".department-intro",
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".department-reveal",
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

  // Search and status filtering.
  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesSearch =
        !query ||
        [
          department.name,
          department.code,
          department.description,
        ].some((value) =>
          (value || "").toLowerCase().includes(query)
        );

      const active = department.isActive !== false;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  const activeCount = departments.filter(
    (department) => department.isActive !== false
  ).length;

  const inactiveCount = departments.length - activeCount;

  const getEmployeeCount = useCallback(
    (departmentId) => {
      return employees.filter((employee) => {
        const value = employee.departmentId;

        const employeeDepartmentId =
          value && typeof value === "object"
            ? value._id
            : value;

        return (
          String(employeeDepartmentId) === String(departmentId)
        );
      }).length;
    },
    [employees]
  );

  // Open create form.
  const handleCreate = () => {
    setEditingDepartment(null);
    setModalOpen(true);
  };

  // Open edit form.
  const handleEdit = (department) => {
    setEditingDepartment(department);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingDepartment(null);
  };

  // Create or update.
  const handleSaveDepartment = async (payload) => {
    const isEdit = Boolean(editingDepartment);

    const endpoint = isEdit
      ? `/api/departments/${editingDepartment._id}`
      : "/api/departments";

    const response = await apiRequest(endpoint, {
      method: isEdit ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });

    setNotice(
      response.message ||
        (isEdit
          ? "Department updated successfully."
          : "Department created successfully.")
    );

    handleCloseModal();

    await loadData(false);
  };

  // Activate/deactivate.
  const handleToggleStatus = async (department) => {
    const active = department.isActive !== false;

    const action = active ? "deactivate" : "activate";

    const assignedEmployees = getEmployeeCount(department._id);

    const warning = active && assignedEmployees > 0
      ? `\n\n${assignedEmployees} employee profile(s) are currently assigned to this department. They will remain linked to it, but new employees cannot be assigned to an inactive department using your current employee API.`
      : "";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${department.name}"?${warning}`
    );

    if (!confirmed) return;

    setProcessingId(department._id);
    setError("");
    setNotice("");

    try {
      const response = await apiRequest(
        `/api/departments/${department._id}/${action}`,
        {
          method: "PATCH",
        }
      );

      setNotice(
        response.message ||
          `Department ${action}d successfully.`
      );

      await loadData(false);
    } catch (err) {
      setError(
        err.message || "Unable to update department status."
      );
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
      {/* Heading */}
      <div className="department-intro flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">
            WORKFORCE / ORGANIZATION
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Department <span className="text-violet-300">management.</span>
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Organize your workforce into departments and manage
            their information from one workspace.
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
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-xs font-semibold text-white shadow-[0_0_25px_rgba(124,58,237,.22)] transition hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(124,58,237,.35)]"
          >
            <Plus size={16} />
            Create department
          </button>
        </div>
      </div>

      {/* Feedback */}
      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[.07] px-4 py-3 text-xs text-emerald-300">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            {notice}
          </span>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-emerald-200/70 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

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
        <StatCard
          icon={Building2}
          label="Total departments"
          value={departments.length}
          color="bg-violet-400/10 text-violet-300"
        />

        <StatCard
          icon={CheckCircle2}
          label="Active departments"
          value={activeCount}
          color="bg-emerald-400/10 text-emerald-300"
        />

        <StatCard
          icon={Power}
          label="Inactive departments"
          value={inactiveCount}
          color="bg-amber-400/10 text-amber-300"
        />

        <StatCard
          icon={Users}
          label="Total employees"
          value={employees.length}
          color="bg-cyan-400/10 text-cyan-300"
        />
      </div>

      {/* Filters */}
      <section className="department-reveal rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal
            size={16}
            className="text-violet-300"
          />

          <h2 className="text-sm font-semibold">
            Find departments
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search department name, code or description..."
              className="w-full rounded-xl border border-white/10 bg-[#090c19] py-3 pl-11 pr-4 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#090c19] px-4 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
          >
            <option value="ALL">All departments</option>
            <option value="ACTIVE">Active only</option>
            <option value="INACTIVE">Inactive only</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
          <span>
            Showing {filteredDepartments.length} of {departments.length} departments
          </span>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
            className="text-violet-300 transition hover:text-white"
          >
            Clear filters
          </button>
        </div>
      </section>

      {/* Directory */}
      <div className="department-reveal">
        <DepartmentTable
          departments={filteredDepartments}
          getEmployeeCount={getEmployeeCount}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          processingId={processingId}
        />
      </div>

      <div className="border-t border-white/[.06] pt-5 text-center">
        <p className="text-[10px] tracking-wider text-slate-600">
          WORKFORCE AI · DEPARTMENT WORKSPACE
        </p>
      </div>

      {/* Create/Edit modal */}
      <DepartmentFormModal
        open={modalOpen}
        department={editingDepartment}
        onClose={handleCloseModal}
        onSubmit={handleSaveDepartment}
      />
    </div>
  );
}
