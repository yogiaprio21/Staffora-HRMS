import { useQuery } from "@tanstack/react-query";
import { activityApi, type ActivityListParams } from "./activityApi";

export const useActivity = (params: ActivityListParams) =>
  useQuery({
    queryKey: ["activity", params],
    queryFn: async () => {
      const response = await activityApi.list(params);
      return response.data;
    }
  });
