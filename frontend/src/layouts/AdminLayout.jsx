
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../components/admin/AdminTopbar.jsx";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#070914] text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-violet-700/[.08] blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-cyan-600/[.05] blur-[130px]" />
      </div>

      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="relative min-h-screen md:pl-[260px]">
        <AdminTopbar
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
