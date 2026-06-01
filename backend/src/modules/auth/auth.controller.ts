import { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/response";
import { env } from "../../config/env";

const serializeEmployee = (employee: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  position?: string | null;
  leaveBalance: number;
  isActive: boolean;
}) => ({
  id: employee.id,
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
  role: employee.role,
  department: employee.department,
  position: employee.position,
  leaveBalance: employee.leaveBalance,
  isActive: employee.isActive
});

const cookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  domain: env.COOKIE_DOMAIN || undefined,
  path: "/api/v1/auth"
} as const;

export const authController = {
  register: async (req: Request, res: Response) => {
    const employee = await authService.registerEmployee({ ...req.body, actorRole: req.user?.role });
    return sendResponse(res, 201, "Employee registered", serializeEmployee(employee));
  },
  login: async (req: Request, res: Response) => {
    const { employee, accessToken, refreshToken } = await authService.login(req.body);
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions
    });
    return sendResponse(res, 200, "Authenticated", {
      accessToken,
      employee: {
        ...serializeEmployee(employee)
      }
    });
  },
  refresh: async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { accessToken, refreshToken: newRefresh, employee } = await authService.refresh(refreshToken);
    res.cookie("refreshToken", newRefresh, {
      ...cookieOptions
    });
    return sendResponse(res, 200, "Tokens refreshed", {
      accessToken,
      employee: serializeEmployee(employee)
    });
  },
  logout: async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    await authService.logout(refreshToken);
    res.clearCookie("refreshToken", {
      ...cookieOptions
    });
    return sendResponse(res, 200, "Logged out");
  },
  me: async (req: Request, res: Response) => {
    const employee = await authService.me(req.user!.id);
    return sendResponse(res, 200, "Authenticated employee fetched", serializeEmployee(employee));
  },
  changePassword: async (req: Request, res: Response) => {
    await authService.changePassword({
      employeeId: req.user!.id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword
    });
    return sendResponse(res, 200, "Password updated");
  }
};
