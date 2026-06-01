import { prisma } from "../../config/prisma";
import { LeaveStatus, Prisma, Role } from "@prisma/client";

export const reportingRepository = {
  listEmployees: async (filters: {
    search?: string;
    department?: string;
    role?: Role;
    status?: "ACTIVE" | "INACTIVE" | "ALL";
  }) => {
    const where: Prisma.EmployeeWhereInput = {
      deletedAt: null,
      ...(filters.status === "ACTIVE" ? { isActive: true } : {}),
      ...(filters.status === "INACTIVE" ? { isActive: false } : {}),
      ...(filters.department ? { department: filters.department } : {}),
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.search
        ? {
            OR: [
              { firstName: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
              { lastName: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: filters.search, mode: Prisma.QueryMode.insensitive } }
            ]
          }
        : {})
    };
    return prisma.employee.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
  },
  listLeavesWithEmployees: async (filters: {
    status?: LeaveStatus;
    employeeId?: string;
    department?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) => {
    const where: Prisma.LeaveRequestWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
      ...(filters.dateFrom ? { endDate: { gte: filters.dateFrom } } : {}),
      ...(filters.dateTo ? { startDate: { lte: filters.dateTo } } : {}),
      ...(filters.department
        ? { employee: { department: filters.department, deletedAt: null } }
        : {})
    };
    return prisma.leaveRequest.findMany({
      where,
      include: { employee: true },
      orderBy: { createdAt: "desc" }
    });
  }
};
