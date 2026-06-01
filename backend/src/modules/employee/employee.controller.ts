import { Request, Response } from "express";
import { employeeService } from "./employee.service";
import { sendResponse } from "../../utils/response";
import { createPaginationMeta } from "../../utils/pagination";

const serializeEmployee = (employee: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  position?: string | null;
  leaveBalance: number;
  isActive: boolean;
}) => ({
  id: employee.id,
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
  role: employee.role,
  department: employee.department,
  position: employee.position,
  leaveBalance: employee.leaveBalance,
  isActive: employee.isActive
});

export const employeeController = {
  create: async (req: Request, res: Response) => {
    const employee = await employeeService.create({
      ...req.body,
      actorId: req.user?.id,
      actorRole: req.user?.role
    });
    return sendResponse(res, 201, "Employee created", serializeEmployee(employee));
  },
  update: async (req: Request, res: Response) => {
    const employee = await employeeService.update(req.params.id, req.body, req.user?.id, req.user?.role);
    return sendResponse(res, 200, "Employee updated", serializeEmployee(employee));
  },
  getById: async (req: Request, res: Response) => {
    const employee = await employeeService.getById(req.params.id);
    return sendResponse(res, 200, "Employee fetched", serializeEmployee(employee));
  },
  softDelete: async (req: Request, res: Response) => {
    await employeeService.softDelete(req.params.id, req.user?.id, req.user?.role);
    return sendResponse(res, 200, "Employee deactivated");
  },
  restore: async (req: Request, res: Response) => {
    const employee = await employeeService.restore(req.params.id, req.user?.id, req.user?.role);
    return sendResponse(res, 200, "Employee restored", serializeEmployee(employee));
  },
  meta: async (_req: Request, res: Response) => {
    const departments = await employeeService.departments();
    return sendResponse(res, 200, "Employee metadata fetched", { departments });
  },
  summary: async (_req: Request, res: Response) => {
    const summary = await employeeService.summary();
    return sendResponse(res, 200, "Employee summary fetched", summary);
  },
  list: async (req: Request, res: Response) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const { items, total } = await employeeService.list({
      page,
      limit,
      search: req.query.search as string | undefined,
      department: req.query.department as string | undefined,
      role: req.query.role as any,
      status: req.query.status as any,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any
    });
    return sendResponse(res, 200, "Employees fetched", {
      items: items.map(serializeEmployee),
      meta: createPaginationMeta({ page, limit, total })
    });
  }
};
