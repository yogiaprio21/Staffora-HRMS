import { z } from "zod";

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Date must use YYYY-MM-DD format"
});

const validDateOnlySchema = dateOnlySchema.refine((value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Invalid date");

export const submitLeaveSchema = z.object({
  body: z.object({
    employeeId: z.string().uuid().optional(),
    startDate: validDateOnlySchema,
    endDate: validDateOnlySchema,
    reason: z.string().min(1)
  }).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"]
  }),
  params: z.object({}),
  query: z.object({})
});

export const approveLeaveSchema = z.object({
  body: z.object({
    reviewNote: z.string().trim().min(1).optional()
  }),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({})
});

export const rejectLeaveSchema = z.object({
  body: z.object({
    reviewNote: z.string().trim().min(1)
  }),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({})
});

export const cancelLeaveSchema = z.object({
  body: z.object({
    reviewNote: z.string().trim().min(1).optional()
  }),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({})
});

export const leaveIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id: z.string().uuid() }),
  query: z.object({})
});

export const listLeaveSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELED"]).optional(),
    employeeId: z.string().uuid().optional(),
    dateFrom: validDateOnlySchema.optional(),
    dateTo: validDateOnlySchema.optional(),
    sortBy: z.enum(["createdAt", "startDate", "endDate", "status", "employee"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc")
  })
});
