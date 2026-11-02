import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

import AdminLayout from "./layouts/AdminLayout.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import EmployeesPage from "./pages/admin/EmployeesPage.jsx";
import DepartmentsPage from "./pages/admin/DepartmentsPage.jsx";
import TasksPage from "./pages/admin/TasksPage.jsx";
import AttendancePage from "./pages/admin/AttendancePage.jsx";
import LeavesPage from "./pages/admin/LeavesPage.jsx";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard.jsx";
import EmployeeTasksPage from "./pages/employee/EmployeeTasksPage.jsx";
import EmployeeAttendancePage from "./pages/employee/EmployeeAttendancePage.jsx";
import EmployeeLeavePage from "./pages/employee/EmployeeLeavePage.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected admin section */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leaves" element={<LeavesPage />} />
      </Route>

      {/* Protected employee workspace */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/tasks"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <EmployeeTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/attendance"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <EmployeeAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/leaves"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <EmployeeLeavePage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
