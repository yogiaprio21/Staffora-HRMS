import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./dashboardApi";
import { useIsPreviewMode } from "../preview/previewMode";
import { getPreviewDashboardStats } from "../preview/previewData";

export const useDashboardStats = (params?: { dateFrom?: string; dateTo?: string }) => {
  const isPreviewMode = useIsPreviewMode();

  return useQuery({
    queryKey: ["dashboard", "stats", params, isPreviewMode ? "preview" : "api"],
    queryFn: async () => {
      if (isPreviewMode) {
        return getPreviewDashboardStats();
      }
      const response = await dashboardApi.stats(params);
      return response.data;
    }
  });
};
