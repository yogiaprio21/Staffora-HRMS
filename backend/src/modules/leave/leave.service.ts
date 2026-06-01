import { LeaveStatus, Role } from "@prisma/client";
import { AppError } from "../../utils/errors";
import { leaveRepository } from "./leave.repository";
import { activityService } from "../activity/activity.service";
import { notificationService } from "../notification/notification.service";

const calculateDays = (startDate: Date, endDate: Date) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new AppError("Invalid date", 400);
  }
  if (end < start) {
    throw new AppError("End date must be after start date", 400);
  }
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

export const leaveService = {
  submit: async (data: {
    requesterId: string;
    requesterRole: Role;
    employeeId?: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    const targetEmployeeId =
      data.requesterRole === Role.EMPLOYEE ? data.requesterId : data.employeeId || data.requesterId;

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const employee = await leaveRepository.findActiveEmployeeById(targetEmployeeId);
    if (!employee) {
      throw new AppError("Employee not found", 404);
    }
    if (!employee.isActive) {
      throw new AppError("Employee is inactive", 400);
    }

    const days = calculateDays(startDate, endDate);
    if (employee.leaveBalance < days) {
      throw new AppError("Insufficient leave balance", 400);
    }

    const overlappingRequest = await leaveRepository.findOverlappingRequest({
      employeeId: employee.id,
      startDate,
      endDate
    });
    if (overlappingRequest) {
      throw new AppError("Leave request overlaps with an existing request", 409);
    }

    const leave = await leaveRepository.create({
      employeeId: employee.id,
      startDate,
      endDate,
      reason: data.reason
    });
    await activityService.log({
      action: "LEAVE_SUBMITTED",
      entityType: "LeaveRequest",
      entityId: leave.id,
      actorId: data.requesterId,
      targetEmployeeId: employee.id,
      message: `${employee.firstName} ${employee.lastName} mengajukan cuti`,
      metadata: { startDate: data.startDate, endDate: data.endDate, days }
    });
    await notificationService.notifyRoles([Role.SUPER_ADMIN, Role.HR], {
      title: "Pengajuan cuti menunggu persetujuan",
      description: `${employee.firstName} ${employee.lastName} mengajukan cuti selama ${days} hari`,
      href: "/leave-approvals?status=PENDING",
      tone: "warning"
    });
    return leave;
  },
  approve: async (id: string, approverId: string, reviewNote?: string) => {
    const leave = await leaveRepository.findById(id);
    if (!leave) {
      throw new AppError("Leave request not found", 404);
    }
    if (leave.status !== LeaveStatus.PENDING) {
      throw new AppError("Leave request already processed", 400);
    }
    if (leave.employeeId === approverId) {
      throw new AppError("Approvers cannot approve their own leave request", 403);
    }

    const days = calculateDays(leave.startDate, leave.endDate);
    const approved = await leaveRepository.approveWithBalanceDeduction({
      id: leave.id,
      employeeId: leave.employeeId,
      approvedBy: approverId,
      days,
      reviewNote
    });
    await activityService.log({
      action: "LEAVE_APPROVED",
      entityType: "LeaveRequest",
      entityId: approved.id,
      actorId: approverId,
      targetEmployeeId: approved.employeeId,
      message: `Cuti ${approved.employee.firstName} ${approved.employee.lastName} disetujui`,
      metadata: { days, reviewNote }
    });
    await notificationService.notifyUser({
      userId: approved.employeeId,
      title: "Cuti disetujui",
      description: `Pengajuan cuti Anda selama ${days} hari telah disetujui`,
      href: "/profile",
      tone: "success"
    });
    return approved;
  },
  reject: async (id: string, approverId: string, reviewNote: string) => {
    const leave = await leaveRepository.findById(id);
    if (!leave) {
      throw new AppError("Leave request not found", 404);
    }
    if (leave.status !== LeaveStatus.PENDING) {
      throw new AppError("Leave request already processed", 400);
    }
    if (leave.employeeId === approverId) {
      throw new AppError("Approvers cannot reject their own leave request", 403);
    }
    const rejected = await leaveRepository.reject(id, approverId, new Date(), reviewNote);
    await activityService.log({
      action: "LEAVE_REJECTED",
      entityType: "LeaveRequest",
      entityId: rejected.id,
      actorId: approverId,
      targetEmployeeId: rejected.employeeId,
      message: `Cuti ${rejected.employee.firstName} ${rejected.employee.lastName} ditolak`,
      metadata: { reviewNote }
    });
    await notificationService.notifyUser({
      userId: rejected.employeeId,
      title: "Cuti ditolak",
      description: reviewNote,
      href: "/profile",
      tone: "danger"
    });
    return rejected;
  },
  getById: async (params: { id: string; requesterId: string; requesterRole: Role }) => {
    const leave = await leaveRepository.findById(params.id);
    if (!leave) {
      throw new AppError("Leave request not found", 404);
    }
    if (params.requesterRole === Role.EMPLOYEE && leave.employeeId !== params.requesterId) {
      throw new AppError("Leave request not found", 404);
    }
    return leave;
  },
  list: async (params: {
    requesterId: string;
    requesterRole: Role;
    page: number;
    limit: number;
    status?: LeaveStatus;
    employeeId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: import("./leave.repository").LeaveSortBy;
    sortOrder?: "asc" | "desc";
  }) => {
    const employeeId =
      params.requesterRole === Role.EMPLOYEE ? params.requesterId : params.employeeId;
    const skip = (params.page - 1) * params.limit;
    return leaveRepository.list({
      skip,
      take: params.limit,
      status: params.status,
      employeeId,
      dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
      dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder
    });
  }
};
