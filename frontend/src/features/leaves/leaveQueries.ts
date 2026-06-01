import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveApi } from "./leaveApi";
import { getPreviewLeaves, previewLeaves } from "../preview/previewData";
import { useIsPreviewMode } from "../preview/previewMode";

export const useLeaves = (params: {
  page: number;
    limit: number;
    status?: string;
    employeeId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
}) => {
  const isPreviewMode = useIsPreviewMode();

  return useQuery({
    queryKey: ["leaves", params, isPreviewMode ? "preview" : "api"],
    queryFn: async () => {
      if (isPreviewMode) {
        return getPreviewLeaves(params);
      }
      const response = await leaveApi.list(params);
      return response.data;
    }
  });
};

export const useLeave = (id?: string) => {
  const isPreviewMode = useIsPreviewMode();

  return useQuery({
    queryKey: ["leaves", "detail", id, isPreviewMode ? "preview" : "api"],
    queryFn: async () => {
      if (isPreviewMode) {
        return previewLeaves.find((leave) => leave.id === id)!;
      }
      const response = await leaveApi.getById(id!);
      return response.data;
    },
    enabled: Boolean(id)
  });
};

export const useSubmitLeave = () => {
  const queryClient = useQueryClient();
  const isPreviewMode = useIsPreviewMode();
  return useMutation({
    mutationFn: (payload: Parameters<typeof leaveApi.submit>[0]) => {
      if (isPreviewMode) {
        return Promise.reject(new Error("Mode demo hanya menampilkan data contoh."));
      }
      return leaveApi.submit(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    }
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();
  const isPreviewMode = useIsPreviewMode();
  return useMutation({
    mutationFn: (payload: Parameters<typeof leaveApi.approve>[0]) => {
      if (isPreviewMode) {
        return Promise.reject(new Error("Mode demo hanya menampilkan data contoh."));
      }
      return leaveApi.approve(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    }
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();
  const isPreviewMode = useIsPreviewMode();
  return useMutation({
    mutationFn: (payload: Parameters<typeof leaveApi.reject>[0]) => {
      if (isPreviewMode) {
        return Promise.reject(new Error("Mode demo hanya menampilkan data contoh."));
      }
      return leaveApi.reject(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    }
  });
};

export const useCancelLeave = () => {
  const queryClient = useQueryClient();
  const isPreviewMode = useIsPreviewMode();
  return useMutation({
    mutationFn: (payload: Parameters<typeof leaveApi.cancel>[0]) => {
      if (isPreviewMode) {
        return Promise.reject(new Error("Mode demo hanya menampilkan data contoh."));
      }
      return leaveApi.cancel(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    }
  });
};
