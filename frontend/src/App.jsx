
import { Route, Routes } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPlaceholder from "./pages/DashboardPlaceholder.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin-only route */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardPlaceholder role="ADMIN" />
          </ProtectedRoute>
        }
      />

      {/* Employee-only route */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <DashboardPlaceholder role="EMPLOYEE" />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
