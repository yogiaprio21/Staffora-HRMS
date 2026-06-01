import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveApi } from "./leaveApi";

export const useLeaves = (params: {
  page: number;
    limit: number;
    status?: string;
    employeeId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
}) =>
  useQuery({
    queryKey: ["leaves", params],
    queryFn: async () => {
      const response = await leaveApi.list(params);
      return response.data;
    }
  });

export const useLeave = (id?: string) =>
  useQuery({
    queryKey: ["leaves", "detail", id],
    queryFn: async () => {
      const response = await leaveApi.getById(id!);
      return response.data;
    },
    enabled: Boolean(id)
  });

export const useSubmitLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveApi.submit,
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
  return useMutation({
    mutationFn: leaveApi.approve,
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
  return useMutation({
    mutationFn: leaveApi.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    }
  });
};
