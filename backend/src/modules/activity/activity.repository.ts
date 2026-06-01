import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";

export type ActivityLogInput = {
  action: string;
  entityType: string;
  entityId: string;
  message: string;
  actorId?: string;
  targetEmployeeId?: string;
  metadata?: Prisma.InputJsonValue;
};

export const activityRepository = {
  create: async (data: ActivityLogInput) => {
    return prisma.activityLog.create({ data });
  },
  recent: async (take = 10) => {
    return prisma.activityLog.findMany({
      take,
      orderBy: { createdAt: "desc" }
    });
  },
  list: async (params: {
    skip: number;
    take: number;
    action?: string;
    entityType?: string;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) => {
    const where: Prisma.ActivityLogWhereInput = {
      ...(params.action ? { action: params.action } : {}),
      ...(params.entityType ? { entityType: params.entityType } : {}),
      ...(params.search
        ? {
            message: {
              contains: params.search,
              mode: Prisma.QueryMode.insensitive
            }
          }
        : {}),
      ...(params.dateFrom || params.dateTo
        ? {
            createdAt: {
              ...(params.dateFrom ? { gte: params.dateFrom } : {}),
              ...(params.dateTo ? { lte: params.dateTo } : {})
            }
          }
        : {})
    };
    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" }
      }),
      prisma.activityLog.count({ where })
    ]);
    return { items, total };
  }
};
