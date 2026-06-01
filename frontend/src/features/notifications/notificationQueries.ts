import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "./notificationApi";
import { getPreviewNotifications } from "../preview/previewData";
import { useIsPreviewMode } from "../preview/previewMode";

export const useNotifications = () => {
  const isPreviewMode = useIsPreviewMode();

  return useQuery({
    queryKey: ["notifications", isPreviewMode ? "preview" : "api"],
    queryFn: async () => {
      if (isPreviewMode) {
        return getPreviewNotifications();
      }
      const response = await notificationApi.list();
      return response.data;
    },
    refetchInterval: isPreviewMode ? false : 60_000
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const isPreviewMode = useIsPreviewMode();
  return useMutation({
    mutationFn: (id: string) => {
      if (isPreviewMode) {
        return Promise.reject(new Error("Mode demo hanya menampilkan data contoh."));
      }
      return notificationApi.markRead(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const isPreviewMode = useIsPreviewMode();
  return useMutation({
    mutationFn: () => {
      if (isPreviewMode) {
        return Promise.reject(new Error("Mode demo hanya menampilkan data contoh."));
      }
      return notificationApi.markAllRead();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
  });
};
