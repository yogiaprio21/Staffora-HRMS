import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { notificationController } from "./notification.controller";
import { validate } from "../../middlewares/validate";
import { z } from "zod";

export const notificationRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.get("/", asyncHandler(notificationController.list));
notificationRouter.patch("/read-all", asyncHandler(notificationController.markAllRead));
notificationRouter.patch(
  "/:id/read",
  validate(z.object({
    body: z.object({}),
    params: z.object({ id: z.string().uuid() }),
    query: z.object({})
  })),
  asyncHandler(notificationController.markRead)
);
