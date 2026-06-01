import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { Role } from "@prisma/client";

export const authorize =
  (roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError("Forbidden", 403);
    }
    return next();
  };
