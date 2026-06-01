import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { AppError } from "../../utils/errors";
import { employeeRepository } from "./employee.repository";
import { activityService } from "../activity/activity.service";
import { notificationService } from "../notification/notification.service";

const assertCanManageRole = (
  actorRole: Role | undefined,
  targetRole: Role,
  message = "Only Super Admin can manage Super Admin accounts"
) => {
  if (targetRole === Role.SUPER_ADMIN && actorRole !== Role.SUPER_ADMIN) {
    throw new AppError(message, 403);
  }
};

export const employeeService = {
  create: async (data: {
    actorId?: string;
    actorRole?: Role;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    department: string;
    position?: string;
  }) => {
    assertCanManageRole(data.actorRole, data.role, "Only Super Admin can create Super Admin accounts");
    const existing = await employeeRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError("Email already in use", 409);
    }
    const passwordHash = await bcrypt.hash(data.password, 12);
    const employee = await employeeRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      role: data.role,
      department: data.department,
      position: data.position
    });
    await activityService.log({
      action: "EMPLOYEE_CREATED",
      entityType: "Employee",
      entityId: employee.id,
      targetEmployeeId: employee.id,
      actorId: data.actorId,
      message: `${employee.firstName} ${employee.lastName} dibuat sebagai karyawan baru`,
      metadata: { role: employee.role, department: employee.department }
    });
    await notificationService.notifyUser({
      userId: employee.id,
      title: "Selamat datang di Staffora",
      description: "Akun karyawan Anda telah dibuat",
      href: "/profile",
      tone: "info"
    });
    return employee;
  },
  update: async (
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: Role;
      department: string;
      position?: string;
      leaveBalance: number;
      isActive: boolean;
    }>,
    actorId?: string,
    actorRole?: Role
  ) => {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw new AppError("Employee not found", 404);
    }
    assertCanManageRole(actorRole, employee.role);
    if (data.role) {
      assertCanManageRole(actorRole, data.role, "Only Super Admin can assign Super Admin role");
    }
    if (data.email && data.email !== employee.email) {
      const existing = await employeeRepository.findByEmail(data.email);
      if (existing) {
        throw new AppError("Email already in use", 409);
      }
    }
    const { password, ...rest } = data;
    const updateData: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      passwordHash: string;
      role: Role;
      department: string;
      position?: string;
      leaveBalance: number;
      isActive: boolean;
    }> = rest;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }
    const updated = await employeeRepository.update(id, updateData);
    await activityService.log({
      action: "EMPLOYEE_UPDATED",
      entityType: "Employee",
      entityId: updated.id,
      targetEmployeeId: updated.id,
      actorId,
      message: `Profil ${updated.firstName} ${updated.lastName} diperbarui`,
      metadata: { fields: Object.keys(updateData) }
    });
    if (updateData.isActive === false) {
      await notificationService.notifyUser({
        userId: updated.id,
        title: "Akun dinonaktifkan",
        description: "Akun Staffora Anda telah dinonaktifkan",
        href: "/profile",
        tone: "danger"
      });
    }
    return updated;
  },
  softDelete: async (id: string, actorId?: string, actorRole?: Role) => {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw new AppError("Employee not found", 404);
    }
    assertCanManageRole(actorRole, employee.role);
    const updated = await employeeRepository.softDelete(id);
    await activityService.log({
      action: "EMPLOYEE_DEACTIVATED",
      entityType: "Employee",
      entityId: updated.id,
      targetEmployeeId: updated.id,
      actorId,
      message: `${updated.firstName} ${updated.lastName} dinonaktifkan`
    });
    await notificationService.notifyUser({
      userId: updated.id,
      title: "Akun dinonaktifkan",
      description: "Akun Staffora Anda telah dinonaktifkan",
      href: "/profile",
      tone: "danger"
    });
    return updated;
  },
  restore: async (id: string, actorId?: string, actorRole?: Role) => {
    const employee = await employeeRepository.findAnyById(id);
    if (!employee) {
      throw new AppError("Employee not found", 404);
    }
    assertCanManageRole(actorRole, employee.role);
    const updated = await employeeRepository.restore(id);
    await activityService.log({
      action: "EMPLOYEE_RESTORED",
      entityType: "Employee",
      entityId: updated.id,
      targetEmployeeId: updated.id,
      actorId,
      message: `${updated.firstName} ${updated.lastName} dipulihkan`
    });
    await notificationService.notifyUser({
      userId: updated.id,
      title: "Akun dipulihkan",
      description: "Akun Staffora Anda telah dipulihkan",
      href: "/profile",
      tone: "success"
    });
    return updated;
  },
  getById: async (id: string) => {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw new AppError("Employee not found", 404);
    }
    return employee;
  },
  list: async (params: {
    page: number;
    limit: number;
    search?: string;
    department?: string;
    role?: Role;
    status?: "ACTIVE" | "INACTIVE" | "ALL";
    sortBy?: import("./employee.repository").EmployeeSortBy;
    sortOrder?: "asc" | "desc";
  }) => {
    const skip = (params.page - 1) * params.limit;
    return employeeRepository.list({
      skip,
      take: params.limit,
      search: params.search,
      department: params.department,
      role: params.role,
      status: params.status,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder
    });
  },
  departments: async () => employeeRepository.departments(),
  summary: async () => employeeRepository.summary()
};
