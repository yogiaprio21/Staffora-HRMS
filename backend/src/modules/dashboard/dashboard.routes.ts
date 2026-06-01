import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/stats",
  authenticate,
  authorize([Role.SUPER_ADMIN, Role.HR]),
  asyncHandler(dashboardController.stats)
);
