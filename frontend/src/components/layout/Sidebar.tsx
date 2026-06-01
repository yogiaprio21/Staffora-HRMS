import { NavLink } from "react-router-dom";
import type { ComponentType } from "react";
import {
  Activity,
  BarChart3,
  ClipboardCheck,
  FileText,
  UserCircle,
  Users
} from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "../../lib/config";
import { StafforaLogo } from "../brand/StafforaLogo";
import type { Role } from "../../types";

type NavItem = {
  label: string;
  to: string;
  roles: Role[];
  group: "Ringkasan" | "Karyawan" | "Cuti" | "Akun";
  icon: ComponentType<{ size?: number; className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Dasbor", to: "/dashboard", roles: ["SUPER_ADMIN", "HR"], group: "Ringkasan", icon: BarChart3 },
  { label: "Data Karyawan", to: "/employees", roles: ["SUPER_ADMIN", "HR"], group: "Karyawan", icon: Users },
  { label: "Log Aktivitas", to: "/activity", roles: ["SUPER_ADMIN", "HR"], group: "Karyawan", icon: Activity },
  { label: "Ajukan Cuti", to: "/leaves", roles: ["SUPER_ADMIN", "HR", "EMPLOYEE"], group: "Cuti", icon: FileText },
  { label: "Persetujuan Cuti", to: "/leave-approvals", roles: ["SUPER_ADMIN", "HR"], group: "Cuti", icon: ClipboardCheck },
  { label: "Profil", to: "/profile", roles: ["SUPER_ADMIN", "HR", "EMPLOYEE"], group: "Akun", icon: UserCircle }
];

export const Sidebar = ({
  role,
  onNavigate,
  className = ""
}: {
  role: Role;
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
    </div>
    <nav className="flex min-h-0 flex-1 flex-col gap-5 text-sm" aria-label="Navigasi utama">
      {(["Ringkasan", "Karyawan", "Cuti", "Akun"] as const).map((group) => {
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
                    to={item.to}
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
                    <span className="truncate">{item.label}</span>
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
