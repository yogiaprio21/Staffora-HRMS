import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

const protectedMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const allowedOrigins = () =>
  env.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const requestGuard = (req: Request, _res: Response, next: NextFunction) => {
  if (env.NODE_ENV !== "production" || !protectedMethods.has(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  if (!origin || !allowedOrigins().includes(origin)) {
    throw new AppError("Request origin is not allowed", 403);
  }

  if (req.header("X-Staffora-Request") !== "true") {
    throw new AppError("Missing request integrity header", 403);
  }

  return next();
};
