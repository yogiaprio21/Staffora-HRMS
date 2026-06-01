import { Router } from "express";
import { employeeController } from "./employee.controller";
import { validate } from "../../middlewares/validate";
import {
  createEmployeeSchema,
  employeeIdSchema,
  listEmployeeSchema,
  updateEmployeeSchema
} from "./employee.validation";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";

export const employeeRouter = Router();

employeeRouter.use(authenticate);
employeeRouter.use(authorize([Role.SUPER_ADMIN, Role.HR]));

employeeRouter.post("/", validate(createEmployeeSchema), asyncHandler(employeeController.create));
employeeRouter.get("/meta/departments", asyncHandler(employeeController.meta));
employeeRouter.get("/summary", asyncHandler(employeeController.summary));
employeeRouter.get("/", validate(listEmployeeSchema), asyncHandler(employeeController.list));
employeeRouter.get("/:id", validate(employeeIdSchema), asyncHandler(employeeController.getById));
employeeRouter.put("/:id", validate(updateEmployeeSchema), asyncHandler(employeeController.update));
employeeRouter.patch("/:id/restore", validate(employeeIdSchema), asyncHandler(employeeController.restore));
employeeRouter.delete(
  "/:id",
  validate(employeeIdSchema),
  asyncHandler(employeeController.softDelete)
);
