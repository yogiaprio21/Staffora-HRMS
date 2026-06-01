import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { logger } from "../config/logger";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details
    });
  }

  logger.error("Unhandled error", { err, path: req.path });
  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};
