import { Prisma, Role } from "@prisma/client";
import { prisma } from "../../config/prisma";

export type NotificationInput = {
  userId: string;
  title: string;
  description: string;
  href: string;
  tone?: string;
};

export const notificationRepository = {
  findUsersByRoles: async (roles: Role[]) => {
    return prisma.employee.findMany({
      where: {
        role: { in: roles },
        isActive: true,
        deletedAt: null
      },
      select: { id: true }
    });
  },
  create: async (data: NotificationInput) => {
    return prisma.notification.create({ data });
  },
  createMany: async (items: NotificationInput[]) => {
    if (items.length === 0) {
      return { count: 0 };
    }
    return prisma.notification.createMany({ data: items, skipDuplicates: true });
  },
  listForUser: async (params: { userId: string; take?: number; unreadOnly?: boolean }) => {
    const where: Prisma.NotificationWhereInput = {
      userId: params.userId,
      ...(params.unreadOnly ? { readAt: null } : {})
    };
    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        take: params.take || 20,
        where,
        orderBy: { createdAt: "desc" }
      }),
      prisma.notification.count({
        where: { userId: params.userId, readAt: null }
      })
    ]);
    return { items, unreadCount };
  },
  markRead: async (params: { id: string; userId: string }) => {
    return prisma.notification.updateMany({
      where: { id: params.id, userId: params.userId, readAt: null },
      data: { readAt: new Date() }
    });
  },
  markAllRead: async (userId: string) => {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() }
    });
  }
};
