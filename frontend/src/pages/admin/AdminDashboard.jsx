
import { useCallback, useEffect, useState } from "react";

import {
  Building2,
  ClipboardList,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { apiGet } from "../../services/api.js";

import AdminStatCard from "../../components/admin/AdminStatCard.jsx";
import TaskStatusBreakdown from "../../components/admin/TaskStatusBreakdown.jsx";
import EmployeeTable from "../../components/admin/EmployeeTable.jsx";
import RecentTasksTable from "../../components/admin/RecentTasksTable.jsx";
import DepartmentOverview from "../../components/admin/DepartmentOverview.jsx";

const TASK_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "IN_REVIEW",
  "COMPLETED",
  "CANCELLED",
];

const initialDashboard = {
  employees: [],
  departments: [],
  tasks: [],
  taskCounts: {},
};

export default function AdminDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(initialDashboard);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (initialLoad = false) => {
    if (initialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const [
        employeeResult,
        departmentResult,
        taskResult,
        ...statusResults
      ] = await Promise.all([
        apiGet("/api/employees"),

        apiGet("/api/departments"),

        apiGet("/api/tasks?page=1&limit=5"),

        ...TASK_STATUSES.map((status) =>
          apiGet(
            `/api/tasks?status=${status}&page=1&limit=1`
          )
        ),
      ]);

      const taskCounts = {};

      TASK_STATUSES.forEach((status, index) => {
        taskCounts[status] = Number(
          statusResults[index]?.pagination?.total || 0
        );
      });

      setDashboard({
        employees: employeeResult.employees || [],
        departments: departmentResult.departments || [],
        tasks: taskResult.tasks || [],
        taskCounts,
      });
    } catch (err) {
      console.error("Admin dashboard loading error:", err);

      setError(
        err.message || "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  const { employees, departments, tasks, taskCounts } = dashboard;

  const activeEmployees = employees.filter(
    (employee) => employee.employmentStatus === "ACTIVE"
  ).length;

  const activeDepartments = departments.filter(
    (department) => department.isActive !== false
  ).length;

  const totalTasks = TASK_STATUSES.reduce(
    (total, status) => total + (taskCounts[status] || 0),
    0
  );

  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const stats = [
    {
      title: "Total employees",
      value: employees.length,
      description: "Employee profiles in the system",
      icon: Users,
      iconColor: "text-violet-300",
      iconBackground: "bg-violet-400/[.09]",
    },
    {
      title: "Active employees",
      value: activeEmployees,
      description: "Currently active employees",
      icon: UserCheck,
      iconColor: "text-emerald-300",
      iconBackground: "bg-emerald-400/[.09]",
    },
    {
      title: "Departments",
      value: departments.length,
      description: `${activeDepartments} active departments`,
      icon: Building2,
      iconColor: "text-cyan-300",
      iconBackground: "bg-cyan-400/[.09]",
    },
    {
      title: "Total tasks",
      value: totalTasks,
      description: "Across all task statuses",
      icon: ClipboardList,
      iconColor: "text-amber-300",
      iconBackground: "bg-amber-400/[.09]",
    },
  ];

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[.18em] text-violet-300">
            OVERVIEW
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back,{" "}
            <span className="text-violet-300">
              {user?.name?.split(" ")[0] || "Admin"}
            </span>
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here's what's happening across your workforce.
          </p>

          <p className="mt-3 text-xs text-slate-600">
            {today}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(false)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw
            size={15}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh data"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/[.07] p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-red-300">
              Dashboard data could not be loaded.
            </p>

            <p className="mt-1 text-xs text-red-300/70">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard(false)}
            disabled={refreshing}
            className="rounded-lg border border-red-400/20 px-4 py-2 text-xs text-red-200 transition hover:bg-red-400/10 disabled:opacity-50"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        /* Loading skeleton */
        <div className="space-y-7">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-white/[.06] bg-white/[.025]"
              />
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="h-96 animate-pulse rounded-2xl bg-white/[.025]" />
            <div className="h-96 animate-pulse rounded-2xl bg-white/[.025]" />
          </div>
        </div>
      ) : (
        <>
          {/* Statistic cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <AdminStatCard
                key={stat.title}
                {...stat}
                index={index}
              />
            ))}
          </div>

          {/* Task distribution + departments */}
          <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
            <div id="tasks" className="scroll-mt-24">
              <TaskStatusBreakdown counts={taskCounts} />
            </div>

            <DepartmentOverview
              departments={departments}
              employees={employees}
            />
          </div>

          {/* Employees */}
          <EmployeeTable employees={employees} />

          {/* Upcoming tasks */}
          <RecentTasksTable tasks={tasks} />
        </>
      )}

      <div className="border-t border-white/[.06] pt-5 text-center">
        <p className="text-[10px] tracking-wider text-slate-600">
          WORKFORCE AI · ADMIN WORKSPACE
        </p>
      </div>
    </div>
  );
}
