import { Link, useLocation } from "react-router-dom";

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "Karyawan",
  new: "Tambah",
  edit: "Ubah",
  leaves: "Ajukan Cuti",
  "leave-approvals": "Persetujuan Cuti",
  profile: "Profil",
  activity: "Log Aktivitas"
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0 || location.pathname === "/login") {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="hidden text-sm text-slate-500 sm:block">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="hover:text-slate-900">
            Beranda
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = labels[segment] || (segment.length > 12 ? "Detail" : segment);
          return (
            <li key={href} className="flex items-center gap-2">
              <span>/</span>
              {isLast ? (
                <span className="font-medium text-slate-700">{label}</span>
              ) : (
                <Link to={href} className="hover:text-slate-900">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
