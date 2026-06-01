import { prisma } from "../../config/prisma";
import { LeaveStatus, Prisma } from "@prisma/client";
import { AppError } from "../../utils/errors";

export type LeaveSortBy = "createdAt" | "startDate" | "endDate" | "status" | "employee";

const leaveOrderBy = (
  sortBy: LeaveSortBy = "createdAt",
  sortOrder: Prisma.SortOrder = "desc"
): Prisma.LeaveRequestOrderByWithRelationInput[] => {
  if (sortBy === "employee") {
    return [{ employee: { firstName: sortOrder } }, { employee: { lastName: sortOrder } }];
  }
  return [{ [sortBy]: sortOrder } as Prisma.LeaveRequestOrderByWithRelationInput];
};

export const leaveRepository = {
  create: async (data: {
    employeeId: string;
    startDate: Date;
    endDate: Date;
    reason: string;
  }) => {
    return prisma.leaveRequest.create({ data });
  },
  findById: async (id: string) => {
    return prisma.leaveRequest.findUnique({ where: { id }, include: { employee: true } });
  },
  findActiveEmployeeById: async (id: string) => {
    return prisma.employee.findFirst({
      where: { id, deletedAt: null }
    });
  },
  findOverlappingRequest: async (params: {
    employeeId: string;
    startDate: Date;
    endDate: Date;
  }) => {
    return prisma.leaveRequest.findFirst({
      where: {
        employeeId: params.employeeId,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        startDate: { lte: params.endDate },
        endDate: { gte: params.startDate }
      }
    });
  },
  list: async (params: {
    skip: number;
    take: number;
    employeeId?: string;
    status?: LeaveStatus;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: LeaveSortBy;
    sortOrder?: Prisma.SortOrder;
  }) => {
    const where = {
      ...(params.employeeId ? { employeeId: params.employeeId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.dateFrom ? { endDate: { gte: params.dateFrom } } : {}),
      ...(params.dateTo ? { startDate: { lte: params.dateTo } } : {})
    };
    const [items, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: leaveOrderBy(params.sortBy, params.sortOrder),
        include: { employee: true }
      }),
      prisma.leaveRequest.count({ where })
    ]);
    return { items, total };
  },
  approve: async (id: string, approvedBy: string, approvedAt: Date) => {
    return prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveStatus.APPROVED, approvedBy, approvedAt }
    });
  },
  approveWithBalanceDeduction: async (params: {
    id: string;
    employeeId: string;
    approvedBy: string;
    days: number;
    reviewNote?: string;
  }) => {
    return prisma.$transaction(async (tx) => {
      const employeeUpdate = await tx.employee.updateMany({
        where: {
          id: params.employeeId,
          deletedAt: null,
          isActive: true,
          leaveBalance: { gte: params.days }
        },
        data: {
          leaveBalance: { decrement: params.days }
        }
      });

      if (employeeUpdate.count === 0) {
        throw new AppError("Insufficient leave balance", 400);
      }

      const leaveUpdate = await tx.leaveRequest.updateMany({
        where: {
          id: params.id,
          status: LeaveStatus.PENDING
        },
        data: {
          status: LeaveStatus.APPROVED,
          approvedBy: params.approvedBy,
          approvedAt: new Date(),
          reviewNote: params.reviewNote
        }
      });

      if (leaveUpdate.count === 0) {
        throw new AppError("Leave request already processed", 400);
      }

      return tx.leaveRequest.findUniqueOrThrow({
        where: { id: params.id },
        include: { employee: true }
      });
    });
  },
  reject: async (id: string, rejectedBy: string, rejectedAt: Date, reviewNote: string) => {
    return prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveStatus.REJECTED, rejectedBy, rejectedAt, reviewNote },
      include: { employee: true }
    });
  }
};
