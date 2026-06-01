import { api } from "../../lib/api";
import type { ActivityLog, PaginationMeta } from "../../types";

export type ActivityListResponse = {
  items: ActivityLog[];
  meta: PaginationMeta;
};

export type ActivityListParams = {
  page: number;
  limit: number;
  action?: string;
  entityType?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export const activityApi = {
  list: async (params: ActivityListParams) => {
    const response = await api.get("/activity", { params });
    return response.data as { data: ActivityListResponse };
  },
  exportCsv: async (params: Omit<ActivityListParams, "page" | "limit">) => {
    const response = await api.get("/activity/export.csv", {
      params,
      responseType: "blob"
    });
    return response.data as Blob;
  }
};
