import { NavLink } from "react-router-dom";
import type { ComponentType } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  ClipboardCheck,
  FileText,
  UserCircle,
  UserCog
} from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "../../lib/config";
import { StafforaLogo } from "../brand/StafforaLogo";
import type { Role } from "../../types";

type NavItem = {
  label: string;
  superAdminLabel?: string;
  to: string;
  roles: Role[];
  group: "Ringkasan" | "Administrasi" | "Cuti" | "Akun";
  icon: ComponentType<{ size?: number; className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", roles: ["SUPER_ADMIN", "HR"], group: "Ringkasan", icon: BarChart3 },
  {
    label: "Data Karyawan",
    superAdminLabel: "Manajemen Pengguna",
    to: "/employees",
    roles: ["SUPER_ADMIN", "HR"],
    group: "Administrasi",
    icon: UserCog
  },
  { label: "Log Aktivitas", to: "/activity", roles: ["SUPER_ADMIN", "HR"], group: "Administrasi", icon: Activity },
  { label: "Cuti Saya", to: "/leaves", roles: ["SUPER_ADMIN", "HR", "EMPLOYEE"], group: "Cuti", icon: FileText },
  { label: "Persetujuan Cuti", to: "/leave-approvals", roles: ["SUPER_ADMIN", "HR"], group: "Cuti", icon: ClipboardCheck },
  { label: "Notifikasi", to: "/notifications", roles: ["SUPER_ADMIN", "HR", "EMPLOYEE"], group: "Akun", icon: Bell },
  { label: "Profil", to: "/profile", roles: ["SUPER_ADMIN", "HR", "EMPLOYEE"], group: "Akun", icon: UserCircle }
];

export const Sidebar = ({
  role,
  basePath = "",
  isPreviewMode = false,
  onNavigate,
  className = ""
}: {
  role: Role;
  basePath?: string;
  isPreviewMode?: boolean;
  onNavigate?: () => void;
  className?: string;
}) => (
  <aside
    className={`flex h-screen w-72 shrink-0 flex-col gap-6 overflow-y-auto overscroll-contain border-r border-slate-200 bg-white px-5 py-6 ${className}`}
  >
    <div className="shrink-0 rounded-xl bg-slate-950 p-4 text-white shadow-sm">
      <StafforaLogo />
      <h1 className="sr-only">{APP_NAME}</h1>
      <p className="mt-1 text-xs leading-5 text-slate-300">{APP_TAGLINE}</p>
      {isPreviewMode ? (
        <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white">
          Mode demo lihat saja
        </p>
      ) : null}
    </div>
    <nav className="flex min-h-0 flex-1 flex-col gap-5 text-sm" aria-label="Navigasi utama">
      {(["Ringkasan", "Administrasi", "Cuti", "Akun"] as const).map((group) => {
        const items = navItems.filter((item) => item.group === group && item.roles.includes(role));
        if (items.length === 0) {
          return null;
        }
        return (
          <div key={group} className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{group}</p>
            <div className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={`${basePath}${item.to}`}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 font-medium transition ${
                        isActive
                          ? "bg-primary-50 text-primary-700 ring-1 ring-primary-100"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="truncate">{role === "SUPER_ADMIN" && item.superAdminLabel ? item.superAdminLabel : item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  </aside>
);
