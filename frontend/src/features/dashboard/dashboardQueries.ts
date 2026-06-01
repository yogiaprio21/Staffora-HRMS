import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./dashboardApi";

export const useDashboardStats = (params?: { dateFrom?: string; dateTo?: string }) =>
  useQuery({
    queryKey: ["dashboard", "stats", params],
    queryFn: async () => {
      const response = await dashboardApi.stats(params);
      return response.data;
    }
  });
