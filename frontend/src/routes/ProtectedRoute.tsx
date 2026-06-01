import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import type { Role } from "../types";

export const ProtectedRoute = ({ roles }: { roles?: Role[] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-sm text-slate-500">Memeriksa sesi...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};
