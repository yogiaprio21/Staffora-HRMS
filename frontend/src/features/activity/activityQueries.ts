import { useQuery } from "@tanstack/react-query";
import { activityApi, type ActivityListParams } from "./activityApi";
import { getPreviewActivity } from "../preview/previewData";
import { useIsPreviewMode } from "../preview/previewMode";

export const useActivity = (params: ActivityListParams) => {
  const isPreviewMode = useIsPreviewMode();

  return useQuery({
    queryKey: ["activity", params, isPreviewMode ? "preview" : "api"],
    queryFn: async () => {
      if (isPreviewMode) {
        return getPreviewActivity(params);
      }
      const response = await activityApi.list(params);
      return response.data;
    }
  });
};
