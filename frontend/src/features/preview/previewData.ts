import type {
  ActivityLog,
  DashboardStats,
  Employee,
  LeaveRequest,
  LeaveStatus,
  NotificationItem,
  PaginationMeta,
  Role
} from "../../types";
import type { ActivityListParams } from "../activity/activityApi";
import type { EmployeeListResponse, EmployeeSummaryResponse } from "../employees/employeeApi";
import type { LeaveListResponse } from "../leaves/leaveApi";

const now = "2026-06-01T09:00:00.000Z";

export const previewUser: Employee = {
  id: "preview-hr",
  firstName: "Ariana",
  lastName: "Santos",
  email: "preview@staffora.local",
  role: "SUPER_ADMIN",
  department: "Human Resources",
  position: "Head of People Operations",
  leaveBalance: 18,
  isActive: true
};

export const previewEmployees: Employee[] = [
  ["emp-001", "Ariana", "Santos", "Human Resources", "Head of People Operations", "SUPER_ADMIN", 18, true],
  ["emp-002", "Bima", "Pratama", "Engineering", "Frontend Engineer", "EMPLOYEE", 12, true],
  ["emp-003", "Nabila", "Putri", "Product", "Product Manager", "HR", 15, true],
  ["emp-004", "Raka", "Wijaya", "Sales", "Account Executive", "EMPLOYEE", 9, true],
  ["emp-005", "Sinta", "Cahyani", "Finance", "Finance Analyst", "EMPLOYEE", 11, true],
  ["emp-006", "Yoga", "Maulana", "Marketing", "Content Strategist", "EMPLOYEE", 8, true],
  ["emp-007", "Fajar", "Wibowo", "Operations", "Operations Lead", "HR", 16, true],
  ["emp-008", "Kirana", "Mahendra", "Design", "Product Designer", "EMPLOYEE", 10, true],
  ["emp-009", "Tania", "Ramadhan", "Legal", "Legal Associate", "EMPLOYEE", 7, false],
  ["emp-010", "Rafi", "Haryanto", "Customer Support", "Support Specialist", "EMPLOYEE", 13, true],
  ["emp-011", "Putri", "Mahendra", "Engineering", "QA Engineer", "EMPLOYEE", 14, true],
  ["emp-012", "Dimas", "Saputra", "Product", "Data Analyst", "EMPLOYEE", 10, true]
].map(([id, firstName, lastName, department, position, role, leaveBalance, isActive]) => ({
  id: String(id),
  firstName: String(firstName),
  lastName: String(lastName),
  email: `${String(firstName).toLowerCase()}.${String(lastName).toLowerCase()}@staffora.local`,
  role: role as Role,
  department: String(department),
  position: String(position),
  leaveBalance: Number(leaveBalance),
  isActive: Boolean(isActive)
}));

export const previewLeaves: LeaveRequest[] = [
  ["leave-001", "emp-004", "Raka Wijaya", "Sales", "2026-06-05", "2026-06-06", "Cuti tahunan untuk agenda keluarga.", "PENDING", null],
  ["leave-002", "emp-005", "Sinta Cahyani", "Finance", "2026-06-10", "2026-06-12", "Keperluan keluarga di luar kota.", "APPROVED", "Disetujui setelah konfirmasi manager."],
  ["leave-003", "emp-006", "Yoga Maulana", "Marketing", "2026-06-14", "2026-06-14", "Pemeriksaan kesehatan rutin.", "REJECTED", "Tanggal berbenturan dengan agenda kampanye."],
  ["leave-004", "emp-008", "Kirana Mahendra", "Design", "2026-06-17", "2026-06-18", "Cuti pribadi.", "PENDING", null],
  ["leave-005", "emp-010", "Rafi Haryanto", "Customer Support", "2026-05-22", "2026-05-23", "Cuti tahunan.", "CANCELED", "Dibatalkan oleh karyawan sebelum review."],
  ["leave-006", "emp-011", "Putri Mahendra", "Engineering", "2026-06-20", "2026-06-21", "Agenda keluarga.", "APPROVED", "Coverage tim sudah disiapkan."]
].map(([id, employeeId, employeeName, department, startDate, endDate, reason, status, reviewNote]) => ({
  id: String(id),
  employeeId: String(employeeId),
  employeeName: String(employeeName),
  department: String(department),
  startDate: String(startDate),
  endDate: String(endDate),
  reason: String(reason),
  status: status as LeaveStatus,
  reviewNote: reviewNote ? String(reviewNote) : null,
  createdAt: "2026-06-01T08:00:00.000Z",
  durationDays: 2,
  timeline: [
    { label: "Diajukan", at: "2026-06-01T08:00:00.000Z", by: String(employeeName) },
    ...(reviewNote ? [{ label: status === "APPROVED" ? "Direview" : status === "CANCELED" ? "Dibatalkan" : "Ditolak", at: now, by: "Ariana Santos", note: String(reviewNote) }] : [])
  ]
}));

export const previewActivities: ActivityLog[] = [
  ["act-001", "LEAVE_SUBMITTED", "LeaveRequest", "leave-001", "Raka Wijaya mengajukan cuti"],
  ["act-002", "LEAVE_APPROVED", "LeaveRequest", "leave-002", "Cuti Sinta Cahyani disetujui"],
  ["act-003", "LEAVE_REJECTED", "LeaveRequest", "leave-003", "Cuti Yoga Maulana ditolak"],
  ["act-004", "EMPLOYEE_UPDATED", "Employee", "emp-003", "Profil Nabila Putri diperbarui"],
  ["act-005", "EMPLOYEE_CREATED", "Employee", "emp-010", "Rafi Haryanto ditambahkan ke Staffora"],
  ["act-006", "LEAVE_CANCELED", "LeaveRequest", "leave-005", "Rafi Haryanto membatalkan pengajuan cuti"]
].map(([id, action, entityType, entityId, message], index) => ({
  id: String(id),
  action: String(action),
  entityType: String(entityType),
  entityId: String(entityId),
  message: String(message),
  actorId: index === 0 ? "emp-004" : "preview-hr",
  targetEmployeeId: entityType === "Employee" ? String(entityId) : undefined,
  metadata: null,
  createdAt: new Date(Date.UTC(2026, 5, 1, 8, 30 - index * 5)).toISOString()
}));

export const previewNotifications: NotificationItem[] = [
  {
    id: "notif-001",
    title: "Pengajuan cuti menunggu review",
    description: "Raka Wijaya meminta cuti 2 hari.",
    href: "/preview/leave-approvals?status=PENDING",
    tone: "warning",
    createdAt: now,
    readAt: null
  },
  {
    id: "notif-002",
    title: "Profil karyawan diperbarui",
    description: "Data Nabila Putri berhasil diperbarui.",
    href: "/preview/activity",
    tone: "info",
    createdAt: "2026-06-01T08:40:00.000Z",
    readAt: "2026-06-01T08:50:00.000Z"
  }
];

const paginate = <T,>(items: T[], page: number, limit: number) => ({
  items: items.slice((page - 1) * limit, page * limit),
  meta: {
    page,
    limit,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / limit))
  } satisfies PaginationMeta
});

const includesText = (value: string, search?: string) =>
  !search || value.toLowerCase().includes(search.toLowerCase());

export const getPreviewEmployees = (params: {
  page: number;
  limit: number;
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}): EmployeeListResponse => {
  let items = previewEmployees.filter((employee) => {
    const statusMatch =
      !params.status ||
      params.status === "ALL" ||
      (params.status === "ACTIVE" && employee.isActive) ||
      (params.status === "INACTIVE" && !employee.isActive);
    return (
      statusMatch &&
      (!params.department || employee.department === params.department) &&
      (!params.role || employee.role === params.role) &&
      includesText(`${employee.firstName} ${employee.lastName} ${employee.email}`, params.search)
    );
  });

  items = [...items].sort((a, b) => {
    const direction = params.sortOrder === "asc" ? 1 : -1;
    const field = params.sortBy || "firstName";
    const left = field === "name" ? `${a.firstName} ${a.lastName}` : String(a[field as keyof Employee] ?? "");
    const right = field === "name" ? `${b.firstName} ${b.lastName}` : String(b[field as keyof Employee] ?? "");
    return left.localeCompare(right) * direction;
  });

  return paginate(items, params.page, params.limit);
};

export const getPreviewEmployeeSummary = (): EmployeeSummaryResponse => {
  const departments = Array.from(new Set(previewEmployees.map((employee) => employee.department))).map((department) => ({
    department,
    total: previewEmployees.filter((employee) => employee.department === department).length
  }));
  return {
    active: previewEmployees.filter((employee) => employee.isActive).length,
    inactive: previewEmployees.filter((employee) => !employee.isActive).length,
    archived: 0,
    departments
  };
};

export const getPreviewEmployeeMeta = () => ({
  departments: Array.from(new Set(previewEmployees.map((employee) => employee.department))).sort()
});

export const getPreviewLeaves = (params: {
  page: number;
  limit: number;
  status?: string;
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
}): LeaveListResponse => {
  const items = previewLeaves.filter((leave) => {
    const afterStart = !params.dateFrom || leave.endDate >= params.dateFrom;
    const beforeEnd = !params.dateTo || leave.startDate <= params.dateTo;
    return (
      (!params.status || leave.status === params.status) &&
      (!params.employeeId || leave.employeeId === params.employeeId) &&
      afterStart &&
      beforeEnd
    );
  });
  return paginate(items, params.page, params.limit);
};

export const getPreviewActivity = (params: ActivityListParams) => {
  const items = previewActivities.filter(
    (activity) =>
      (!params.action || activity.action === params.action) &&
      (!params.entityType || activity.entityType === params.entityType) &&
      includesText(`${activity.message} ${activity.action} ${activity.entityType}`, params.search)
  );
  return paginate(items, params.page, params.limit);
};

export const getPreviewDashboardStats = (): DashboardStats => {
  const statusCounts = previewLeaves.reduce(
    (acc, leave) => ({ ...acc, [leave.status]: (acc[leave.status] || 0) + 1 }),
    { PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELED: 0 } as Record<LeaveStatus, number>
  );
  const departmentCounts = previewLeaves.reduce<Record<string, number>>((acc, leave) => {
    acc[leave.department || "Lainnya"] = (acc[leave.department || "Lainnya"] || 0) + 1;
    return acc;
  }, {});

  return {
    totalEmployees: previewEmployees.filter((employee) => employee.isActive).length,
    totalPendingLeaves: statusCounts.PENDING,
    totalApprovedLeavesThisMonth: statusCounts.APPROVED,
    leaveSummaryByDepartment: departmentCounts,
    leaveSummaryByStatus: statusCounts,
    recentLeaves: previewLeaves.slice(0, 5),
    pendingApprovals: previewLeaves.filter((leave) => leave.status === "PENDING"),
    upcomingLeaves: previewLeaves.filter((leave) => leave.status === "APPROVED"),
    recentActivity: previewActivities
  };
};

export const getPreviewNotifications = () => ({
  unreadCount: previewNotifications.filter((item) => !item.readAt).length,
  items: previewNotifications
});
