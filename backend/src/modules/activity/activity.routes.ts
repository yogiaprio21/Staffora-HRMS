import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { asyncHandler } from "../../utils/asyncHandler";
import { activityController } from "./activity.controller";
import { validate } from "../../middlewares/validate";
import { z } from "zod";

export const activityRouter = Router();

activityRouter.use(authenticate);
activityRouter.use(authorize([Role.SUPER_ADMIN, Role.HR]));

const listActivitySchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    action: z.string().optional(),
    entityType: z.string().optional(),
    search: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional()
  })
});

activityRouter.get("/", validate(listActivitySchema), asyncHandler(activityController.list));
activityRouter.get("/export.csv", validate(listActivitySchema), asyncHandler(activityController.exportCsv));
