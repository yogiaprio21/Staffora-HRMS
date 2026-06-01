import { api } from "../../lib/api";
import type { Employee, PaginationMeta } from "../../types";

export type EmployeeListResponse = {
  items: Employee[];
  meta: PaginationMeta;
};
export type EmployeeSummaryResponse = {
  active: number;
  inactive: number;
  archived: number;
  departments: Array<{ department: string; total: number }>;
};

export const employeeApi = {
  list: async (params: {
    page: number;
    limit: number;
    search?: string;
    department?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const sanitizedParams = {
      page: params.page,
      limit: params.limit,
      ...(params.search ? { search: params.search } : {}),
      ...(params.department ? { department: params.department } : {}),
      ...(params.role ? { role: params.role } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params.sortOrder ? { sortOrder: params.sortOrder } : {})
    };
    const response = await api.get("/employees", { params: sanitizedParams });
    return response.data as { data: EmployeeListResponse };
  },
  meta: async () => {
    const response = await api.get("/employees/meta/departments");
    return response.data as { data: { departments: string[] } };
  },
  summary: async () => {
    const response = await api.get("/employees/summary");
    return response.data as { data: EmployeeSummaryResponse };
  },
  getById: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data as { data: Employee };
  },
  create: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    department: string;
    position?: string;
  }) => {
    const response = await api.post("/employees", payload);
    return response.data as { data: Employee };
  },
  update: async (
    id: string,
    payload: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: string;
      department: string;
      position?: string;
      leaveBalance: number;
      isActive: boolean;
    }>
  ) => {
    const response = await api.put(`/employees/${id}`, payload);
    return response.data as { data: Employee };
  },
  softDelete: async (id: string) => {
    const response = await api.delete(`/employees/${id}`, { data: {} });
    return response.data as { data?: unknown };
  },
  restore: async (id: string) => {
    const response = await api.patch(`/employees/${id}/restore`);
    return response.data as { data: Employee };
  }
};
