import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "./employeeApi";

export const useEmployees = (params: {
  page: number;
  limit: number;
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}) =>
  useQuery({
    queryKey: ["employees", params],
    queryFn: async () => {
      const response = await employeeApi.list(params);
      return response.data;
    }
  });

export const useEmployeeMeta = () =>
  useQuery({
    queryKey: ["employees", "meta"],
    queryFn: async () => {
      const response = await employeeApi.meta();
      return response.data;
    }
  });

export const useEmployeeSummary = () =>
  useQuery({
    queryKey: ["employees", "summary"],
    queryFn: async () => {
      const response = await employeeApi.summary();
      return response.data;
    }
  });

export const useEmployee = (id?: string) =>
  useQuery({
    queryKey: ["employees", "detail", id],
    queryFn: async () => {
      const response = await employeeApi.getById(id!);
      return response.data;
    },
    enabled: Boolean(id)
  });

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    }
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof employeeApi.update>[1] }) =>
      employeeApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees", "detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    }
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeeApi.softDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    }
  });
};

export const useRestoreEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeeApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    }
  });
};
