import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const parseBooleanEnv = (value: unknown, defaultValue: boolean) => {
  if (value === undefined || value === "") {
    return defaultValue;
  }
  if (value === true || value === "true") {
    return true;
  }
  if (value === false || value === "false") {
    return false;
  }
  throw new Error(`Invalid boolean environment value: ${String(value)}`);
};

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGINS: z.string().default(""),
  COOKIE_SECURE: z.preprocess((value) => parseBooleanEnv(value, true), z.boolean()),
  COOKIE_DOMAIN: z.string().optional()
}).superRefine((value, ctx) => {
  if (value.NODE_ENV === "production") {
    if (value.JWT_ACCESS_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_ACCESS_SECRET"],
        message: "JWT_ACCESS_SECRET must be at least 32 characters in production"
      });
    }
    if (value.JWT_REFRESH_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_REFRESH_SECRET"],
        message: "JWT_REFRESH_SECRET must be at least 32 characters in production"
      });
    }
    if (!value.CORS_ORIGINS.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CORS_ORIGINS"],
        message: "CORS_ORIGINS is required in production"
      });
    }
  }
});

export const env = envSchema.parse(process.env);
