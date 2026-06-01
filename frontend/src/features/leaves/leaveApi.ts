import { api } from "../../lib/api";
import type { LeaveRequest, PaginationMeta } from "../../types";

export type LeaveListResponse = {
  items: LeaveRequest[];
  meta: PaginationMeta;
};

export const leaveApi = {
  list: async (params: {
    page: number;
    limit: number;
    status?: string;
    employeeId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const response = await api.get("/leaves", { params });
    return response.data as { data: LeaveListResponse };
  },
  getById: async (id: string) => {
    const response = await api.get(`/leaves/${id}`);
    return response.data as { data: LeaveRequest };
  },
  submit: async (payload: {
    employeeId?: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    const response = await api.post("/leaves", payload);
    return response.data as { data: LeaveRequest };
  },
  approve: async ({ id, reviewNote }: { id: string; reviewNote?: string }) => {
    const response = await api.patch(`/leaves/${id}/approve`, { reviewNote });
    return response.data as { data: LeaveRequest };
  },
  reject: async ({ id, reviewNote }: { id: string; reviewNote: string }) => {
    const response = await api.patch(`/leaves/${id}/reject`, { reviewNote });
    return response.data as { data: LeaveRequest };
  },
  cancel: async ({ id, reviewNote }: { id: string; reviewNote?: string }) => {
    const response = await api.patch(`/leaves/${id}/cancel`, { reviewNote });
    return response.data as { data: LeaveRequest };
  }
};
