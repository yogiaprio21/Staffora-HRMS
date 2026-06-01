import { Router } from "express";
import { leaveController } from "./leave.controller";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { Role } from "@prisma/client";
import { validate } from "../../middlewares/validate";
import {
  approveLeaveSchema,
  cancelLeaveSchema,
  leaveIdSchema,
  rejectLeaveSchema,
  listLeaveSchema,
  submitLeaveSchema
} from "./leave.validation";
import { asyncHandler } from "../../utils/asyncHandler";

export const leaveRouter = Router();

leaveRouter.use(authenticate);

leaveRouter.post("/", validate(submitLeaveSchema), asyncHandler(leaveController.submit));
leaveRouter.get("/", validate(listLeaveSchema), asyncHandler(leaveController.list));
leaveRouter.get("/:id", validate(leaveIdSchema), asyncHandler(leaveController.getById));
leaveRouter.patch(
  "/:id/cancel",
  validate(cancelLeaveSchema),
  asyncHandler(leaveController.cancel)
);
leaveRouter.patch(
  "/:id/approve",
  authorize([Role.SUPER_ADMIN, Role.HR]),
  validate(approveLeaveSchema),
  asyncHandler(leaveController.approve)
);
leaveRouter.patch(
  "/:id/reject",
  authorize([Role.SUPER_ADMIN, Role.HR]),
  validate(rejectLeaveSchema),
  asyncHandler(leaveController.reject)
);
