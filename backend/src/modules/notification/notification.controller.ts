import { Request, Response } from "express";
import { notificationService } from "./notification.service";
import { sendResponse } from "../../utils/response";

export const notificationController = {
  list: async (req: Request, res: Response) => {
    const notifications = await notificationService.listForUser(req.user!.id);
    return sendResponse(res, 200, "Notifications fetched", notifications);
  },
  markRead: async (req: Request, res: Response) => {
    await notificationService.markRead(req.params.id, req.user!.id);
    return sendResponse(res, 200, "Notification marked as read");
  },
  markAllRead: async (req: Request, res: Response) => {
    await notificationService.markAllRead(req.user!.id);
    return sendResponse(res, 200, "Notifications marked as read");
  }
};
