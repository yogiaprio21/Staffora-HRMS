import type { LeaveStatus, Role } from "../types";

export const roleLabel: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  HR: "HR",
  EMPLOYEE: "Karyawan"
};

export const leaveStatusLabel: Record<LeaveStatus, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  CANCELED: "Dibatalkan"
};

export const activityActionLabel: Record<string, string> = {
  EMPLOYEE_CREATED: "Karyawan dibuat",
  EMPLOYEE_UPDATED: "Karyawan diperbarui",
  EMPLOYEE_DEACTIVATED: "Karyawan dinonaktifkan",
  EMPLOYEE_RESTORED: "Karyawan dipulihkan",
  LEAVE_SUBMITTED: "Cuti diajukan",
  LEAVE_APPROVED: "Cuti disetujui",
  LEAVE_REJECTED: "Cuti ditolak",
  LEAVE_CANCELED: "Cuti dibatalkan"
};

export const notificationToneLabel: Record<string, string> = {
  info: "Informasi",
  success: "Berhasil",
  warning: "Perlu ditinjau",
  danger: "Penting"
};

export const formatRole = (role: Role) => roleLabel[role] || role;
export const formatLeaveStatus = (status: LeaveStatus) => leaveStatusLabel[status] || status;
export const formatActivityAction = (action: string) => activityActionLabel[action] || action;

export const formatDate = (value?: string | Date | null) => {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
};

export const formatDateTime = (value?: string | Date | null) => {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
};

export const formatRelativeTime = (value?: string | Date | null) => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000]
  ];
  const formatter = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });
  for (const [unit, size] of units) {
    if (absMs >= size) {
      return formatter.format(Math.round(diffMs / size), unit);
    }
  }
  return "baru saja";
};
