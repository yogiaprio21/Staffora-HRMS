import { api } from "../../lib/api";
import type { NotificationItem } from "../../types";

export type NotificationResponse = {
  unreadCount: number;
  items: NotificationItem[];
};

export const notificationApi = {
  list: async () => {
    const response = await api.get("/notifications");
    return response.data as { data: NotificationResponse };
  },
  markRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data as { data?: unknown };
  },
  markAllRead: async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data as { data?: unknown };
  }
};
