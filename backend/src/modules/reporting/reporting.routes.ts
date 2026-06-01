import { Router } from "express";
import { reportingController } from "./reporting.controller";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";

export const reportingRouter = Router();

reportingRouter.use(authenticate);
reportingRouter.use(authorize([Role.SUPER_ADMIN, Role.HR]));

reportingRouter.get("/employees/pdf", asyncHandler(reportingController.exportEmployeesPdf));
reportingRouter.get("/leaves/excel", asyncHandler(reportingController.exportLeavesExcel));
