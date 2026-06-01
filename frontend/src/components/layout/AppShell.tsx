import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Breadcrumbs } from "./Breadcrumbs";
import { useAuth } from "../../features/auth/AuthContext";
import { PageTransition } from "../ui/PageTransition";

export const AppShell = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Tutup navigasi"
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <Sidebar
        role={user.role}
        onNavigate={() => setSidebarOpen(false)}
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      />
      <div className="flex min-w-0 flex-1 flex-col lg:min-h-screen">
        <Topbar user={user} onLogout={logout} onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 space-y-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <Breadcrumbs />
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};
