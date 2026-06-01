import { activityRepository, type ActivityLogInput } from "./activity.repository";

export const activityService = {
  log: async (data: ActivityLogInput) => {
    try {
      return await activityRepository.create(data);
    } catch {
      return null;
    }
  },
  recent: async (take?: number) => activityRepository.recent(take),
  list: async (params: {
    page: number;
    limit: number;
    action?: string;
    entityType?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    return activityRepository.list({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      action: params.action,
      entityType: params.entityType,
      search: params.search,
      dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
      dateTo: params.dateTo ? new Date(params.dateTo) : undefined
    });
  }
};
