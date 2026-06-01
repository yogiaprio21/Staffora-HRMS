import { Request, Response } from "express";
import { leaveService } from "./leave.service";
import { sendResponse } from "../../utils/response";
import { createPaginationMeta } from "../../utils/pagination";

const calculateDays = (startDate: Date, endDate: Date) =>
  Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

const serializeLeave = (leave: {
  id: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: string;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  rejectedBy?: string | null;
  rejectedAt?: Date | null;
  reviewNote?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  employee?: { firstName: string; lastName: string; department: string };
}) => ({
  id: leave.id,
  employeeId: leave.employeeId,
  employeeName: leave.employee
    ? `${leave.employee.firstName} ${leave.employee.lastName}`
    : undefined,
  department: leave.employee?.department,
  startDate: leave.startDate,
  endDate: leave.endDate,
  durationDays: calculateDays(leave.startDate, leave.endDate),
  reason: leave.reason,
  status: leave.status,
  reviewNote: leave.reviewNote,
  reviewedBy: leave.approvedBy || leave.rejectedBy || null,
  reviewedAt: leave.approvedAt || leave.rejectedAt || null,
  createdAt: leave.createdAt,
  timeline: [
    { label: "Submitted", at: leave.createdAt },
    ...(leave.approvedAt
      ? [{ label: "Approved", at: leave.approvedAt, by: leave.approvedBy, note: leave.reviewNote }]
      : []),
    ...(leave.rejectedAt
      ? [{ label: "Rejected", at: leave.rejectedAt, by: leave.rejectedBy, note: leave.reviewNote }]
      : []),
    ...(leave.status === "CANCELED"
      ? [{ label: "Canceled", at: leave.updatedAt, note: leave.reviewNote }]
      : [])
  ]
});

export const leaveController = {
  submit: async (req: Request, res: Response) => {
    const leave = await leaveService.submit({
      requesterId: req.user!.id,
      requesterRole: req.user!.role,
      employeeId: req.body.employeeId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      reason: req.body.reason
    });
    return sendResponse(res, 201, "Leave request submitted", serializeLeave(leave));
  },
  approve: async (req: Request, res: Response) => {
    const leave = await leaveService.approve(req.params.id, req.user!.id, req.body.reviewNote);
    return sendResponse(res, 200, "Leave approved", serializeLeave(leave));
  },
  reject: async (req: Request, res: Response) => {
    const leave = await leaveService.reject(req.params.id, req.user!.id, req.body.reviewNote);
    return sendResponse(res, 200, "Leave rejected", serializeLeave(leave));
  },
  cancel: async (req: Request, res: Response) => {
    const leave = await leaveService.cancel({
      id: req.params.id,
      requesterId: req.user!.id,
      requesterRole: req.user!.role,
      reviewNote: req.body.reviewNote
    });
    return sendResponse(res, 200, "Leave canceled", serializeLeave(leave));
  },
  getById: async (req: Request, res: Response) => {
    const leave = await leaveService.getById({
      id: req.params.id,
      requesterId: req.user!.id,
      requesterRole: req.user!.role
    });
    return sendResponse(res, 200, "Leave request fetched", serializeLeave(leave));
  },
  list: async (req: Request, res: Response) => {
    const { items, total } = await leaveService.list({
      requesterId: req.user!.id,
      requesterRole: req.user!.role,
      page: req.query.page as any,
      limit: req.query.limit as any,
      status: req.query.status as any,
      employeeId: req.query.employeeId as any,
      dateFrom: req.query.dateFrom as any,
      dateTo: req.query.dateTo as any,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any
    });
    return sendResponse(res, 200, "Leave history fetched", {
      items: items.map(serializeLeave),
      meta: createPaginationMeta({
        page: req.query.page as any,
        limit: req.query.limit as any,
        total
      })
    });
  }
};
