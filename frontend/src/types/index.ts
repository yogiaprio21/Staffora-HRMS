export type Role = "SUPER_ADMIN" | "HR" | "EMPLOYEE";

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  department: string;
  position?: string | null;
  leaveBalance: number;
  isActive: boolean;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  startDate: string;
  endDate: string;
  durationDays?: number;
  reason: string;
  status: LeaveStatus;
  reviewNote?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  timeline?: Array<{
    label: string;
    at?: string;
    by?: string | null;
    note?: string | null;
  }>;
};

export type ActivityLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  message: string;
  actorId?: string | null;
  targetEmployeeId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: "success" | "warning" | "danger" | "info";
  createdAt: string;
  readAt?: string | null;
};

export type DashboardStats = {
  totalEmployees: number;
  totalPendingLeaves: number;
  totalApprovedLeavesThisMonth: number;
  leaveSummaryByDepartment: Record<string, number>;
  leaveSummaryByStatus: Record<LeaveStatus, number>;
  recentLeaves: LeaveRequest[];
  pendingApprovals: LeaveRequest[];
  upcomingLeaves: LeaveRequest[];
  recentActivity: ActivityLog[];
};
