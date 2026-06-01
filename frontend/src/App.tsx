import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { useAuth } from "./features/auth/AuthContext";
import { Seo } from "./components/seo/Seo";

const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage }))
);
const EmployeesPage = lazy(() =>
  import("./pages/EmployeesPage").then((module) => ({ default: module.EmployeesPage }))
);
const EmployeeFormPage = lazy(() =>
  import("./pages/EmployeeFormPage").then((module) => ({ default: module.EmployeeFormPage }))
);
const LeaveSubmissionPage = lazy(() =>
  import("./pages/LeaveSubmissionPage").then((module) => ({ default: module.LeaveSubmissionPage }))
);
const LeaveApprovalPage = lazy(() =>
  import("./pages/LeaveApprovalPage").then((module) => ({ default: module.LeaveApprovalPage }))
);
const ActivityPage = lazy(() =>
  import("./pages/ActivityPage").then((module) => ({ default: module.ActivityPage }))
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage }))
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage }))
);

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.role === "EMPLOYEE" ? "/profile" : "/dashboard"} replace />;
};

const AppFallback = () => (
  <div className="p-6 text-sm text-slate-500">Memuat halaman...</div>
);

const App = () => (
  <Suspense fallback={<AppFallback />}>
    <Seo />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route element={<ProtectedRoute roles={["SUPER_ADMIN", "HR"]} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/new" element={<EmployeeFormPage />} />
          <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
          <Route path="/leave-approvals" element={<LeaveApprovalPage />} />
          <Route path="/activity" element={<ActivityPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={["SUPER_ADMIN", "HR", "EMPLOYEE"]} />}>
          <Route path="/leaves" element={<LeaveSubmissionPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default App;
