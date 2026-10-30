
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  // Wait until the backend session check finishes.
  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />

          <p className="mt-5 text-sm text-gray-400">
            Verifying your session...
          </p>
        </div>
      </main>
    );
  }

  // Not logged in: redirect to login.
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Logged in, but the user's role is not allowed.
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const correctDashboard =
      user.role === "ADMIN"
        ? "/admin/dashboard"
        : "/employee/dashboard";

    return <Navigate to={correctDashboard} replace />;
  }

  // Render the protected page.
  return children || <Outlet />;
}
