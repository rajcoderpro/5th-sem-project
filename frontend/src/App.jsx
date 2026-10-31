
import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPlaceholder from "./pages/DashboardPlaceholder.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import EmployeesPage from "./pages/admin/EmployeesPage.jsx";

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
        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="employees"
          element={<EmployeesPage />}
        />
      </Route>

      {/* Employee section */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <DashboardPlaceholder role="EMPLOYEE" />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
