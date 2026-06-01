import { LeaveStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";

const startOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const dateRangeWhere = (dateFrom?: Date, dateTo?: Date) => ({
  ...(dateFrom || dateTo
    ? {
        createdAt: {
          ...(dateFrom ? { gte: dateFrom } : {}),
          ...(dateTo ? { lte: dateTo } : {})
        }
      }
    : {})
});

export const dashboardRepository = {
  countActiveEmployees: async () => {
    return prisma.employee.count({ where: { deletedAt: null } });
  },
  countPendingLeaves: async () => {
    return prisma.leaveRequest.count({ where: { status: LeaveStatus.PENDING } });
  },
  countApprovedLeavesThisMonth: async (dateFrom?: Date, dateTo?: Date) => {
    return prisma.leaveRequest.count({
      where: {
        status: LeaveStatus.APPROVED,
        approvedAt: dateFrom || dateTo
          ? {
              ...(dateFrom ? { gte: dateFrom } : {}),
              ...(dateTo ? { lte: dateTo } : {})
            }
          : { gte: startOfMonth() }
      }
    });
  },
  countLeavesByDepartment: async (dateFrom?: Date, dateTo?: Date) => {
    const leaves = await prisma.leaveRequest.groupBy({
      by: ["employeeId"],
      where: dateRangeWhere(dateFrom, dateTo),
      _count: { _all: true }
    });

    const employeeIds = leaves.map((leave) => leave.employeeId);
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds }, deletedAt: null },
      select: { id: true, department: true }
    });
    const departmentByEmployee = new Map(
      employees.map((employee) => [employee.id, employee.department])
    );

    return leaves.reduce<Record<string, number>>((acc, leave) => {
      const department = departmentByEmployee.get(leave.employeeId);
      if (!department) {
        return acc;
      }
      acc[department] = (acc[department] || 0) + leave._count._all;
      return acc;
    }, {});
  },
  countLeavesByStatus: async (dateFrom?: Date, dateTo?: Date) => {
    const rows = await prisma.leaveRequest.groupBy({
      by: ["status"],
      where: dateRangeWhere(dateFrom, dateTo),
      _count: { _all: true }
    });
    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {});
  },
  recentLeaves: async (take = 5, dateFrom?: Date, dateTo?: Date) => {
    return prisma.leaveRequest.findMany({
      take,
      where: dateRangeWhere(dateFrom, dateTo),
      orderBy: { createdAt: "desc" },
      include: { employee: true }
    });
  },
  pendingApprovals: async (take = 5) => {
    return prisma.leaveRequest.findMany({
      take,
      where: { status: LeaveStatus.PENDING },
      orderBy: { createdAt: "asc" },
      include: { employee: true }
    });
  },
  upcomingLeaves: async (take = 5) => {
    return prisma.leaveRequest.findMany({
      take,
      where: {
        status: LeaveStatus.APPROVED,
        startDate: { gte: new Date() }
      },
      orderBy: { startDate: "asc" },
      include: { employee: true }
    });
  },
  recentActivity: async (take = 8) => {
    return prisma.activityLog.findMany({
      take,
      orderBy: { createdAt: "desc" }
    });
  }
};
