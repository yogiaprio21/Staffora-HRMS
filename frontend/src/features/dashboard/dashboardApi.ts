import { api } from "../../lib/api";
import type { DashboardStats } from "../../types";

export const dashboardApi = {
  stats: async (params?: { dateFrom?: string; dateTo?: string }) => {
    const response = await api.get("/dashboard/stats", { params });
    return response.data as { data: DashboardStats };
  }
};
