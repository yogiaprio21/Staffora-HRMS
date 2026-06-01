import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

export type JwtPayload = {
  sub: string;
  role: "SUPER_ADMIN" | "HR" | "EMPLOYEE";
};

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.replace("Bearer ", "").trim();
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
};
