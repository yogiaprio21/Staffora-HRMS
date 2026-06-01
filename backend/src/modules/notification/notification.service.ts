import { Role } from "@prisma/client";
import {
  notificationRepository,
  type NotificationInput
} from "./notification.repository";

export const notificationService = {
  notifyUser: async (data: NotificationInput) => {
    try {
      return await notificationRepository.create(data);
    } catch {
      return null;
    }
  },
  notifyRoles: async (roles: Role[], data: Omit<NotificationInput, "userId">) => {
    try {
      const users = await notificationRepository.findUsersByRoles(roles);
      return await notificationRepository.createMany(
        users.map((user) => ({
          ...data,
          userId: user.id
        }))
      );
    } catch {
      return null;
    }
  },
  listForUser: async (userId: string) => {
    return notificationRepository.listForUser({ userId, take: 20 });
  },
  markRead: async (id: string, userId: string) => {
    return notificationRepository.markRead({ id, userId });
  },
  markAllRead: async (userId: string) => {
    return notificationRepository.markAllRead(userId);
  }
};
