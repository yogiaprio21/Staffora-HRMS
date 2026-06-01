import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { requestGuard } from "./middlewares/requestGuard";
import { prisma } from "./config/prisma";
import { authRouter } from "./modules/auth/auth.routes";
import { employeeRouter } from "./modules/employee/employee.routes";
import { leaveRouter } from "./modules/leave/leave.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { reportingRouter } from "./modules/reporting/reporting.routes";
import { activityRouter } from "./modules/activity/activity.routes";
import { notificationRouter } from "./modules/notification/notification.routes";
import { swaggerRouter } from "./docs/swagger";

export const createApp = () => {
  const app = express();
  app.set("trust proxy", 1);

  const origins = env.CORS_ORIGINS.split(",").map((origin) => origin.trim());

  app.use(
    cors({
      origin: origins.length > 0 && origins[0] !== "" ? origins : false,
      credentials: true
    })
  );

  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(requestGuard);

  app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Staffora HRMS API is healthy",
      data: {
        uptime: process.uptime()
      }
    });
  });

  app.get("/api/v1/ready", async (_req, res, next) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        success: true,
        message: "Staffora HRMS API is ready",
        data: {
          database: "connected"
        }
      });
    } catch (err) {
      next(err);
    }
  });

  app.use("/api/v1/docs", swaggerRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/employees", employeeRouter);
  app.use("/api/v1/leaves", leaveRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/reports", reportingRouter);
  app.use("/api/v1/activity", activityRouter);
  app.use("/api/v1/notifications", notificationRouter);

  app.use(errorHandler);

  return app;
};
