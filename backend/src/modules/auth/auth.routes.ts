import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { changePasswordSchema, loginSchema, registerSchema } from "./auth.validation";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/rbac";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";

export const authRouter = Router();

authRouter.post(
  "/register",
  authenticate,
  authorize([Role.SUPER_ADMIN, Role.HR]),
  validate(registerSchema),
  asyncHandler(authController.register)
);
authRouter.post("/login", validate(loginSchema), asyncHandler(authController.login));
authRouter.post("/refresh", asyncHandler(authController.refresh));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.get("/me", authenticate, asyncHandler(authController.me));
authRouter.patch(
  "/me/password",
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword)
);
