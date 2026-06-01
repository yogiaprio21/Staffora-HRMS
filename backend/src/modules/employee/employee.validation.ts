import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export const createEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["SUPER_ADMIN", "HR", "EMPLOYEE"]),
    department: z.string().min(1),
    position: z.string().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    role: z.enum(["SUPER_ADMIN", "HR", "EMPLOYEE"]).optional(),
    department: z.string().min(1).optional(),
    position: z.string().optional(),
    leaveBalance: z.number().int().min(0).optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({})
});

export const employeeIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({})
});

export const listEmployeeSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    search: z.preprocess(emptyToUndefined, z.string().optional()),
    department: z.preprocess(emptyToUndefined, z.string().optional()),
    role: z.preprocess(emptyToUndefined, z.enum(["SUPER_ADMIN", "HR", "EMPLOYEE"]).optional()),
    status: z.preprocess(emptyToUndefined, z.enum(["ACTIVE", "INACTIVE", "ALL"]).optional()),
    sortBy: z
      .preprocess(
        emptyToUndefined,
        z
          .enum(["name", "email", "department", "role", "status", "leaveBalance", "createdAt"])
          .optional()
      )
      .default("createdAt"),
    sortOrder: z
      .preprocess(emptyToUndefined, z.enum(["asc", "desc"]).optional())
      .default("desc")
  })
});
