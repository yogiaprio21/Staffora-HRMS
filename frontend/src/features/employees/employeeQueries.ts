import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "./employeeApi";
import { getPreviewEmployeeMeta, getPreviewEmployees, getPreviewEmployeeSummary, previewEmployees } from "../preview/previewData";
import { useIsPreviewMode } from "../preview/previewMode";

export const useEmployees = (params: {
  page: number;
  limit: number;
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const isPreviewMode = useIsPreviewMode();

  return useQuery({
    queryKey: ["employees", params, isPreviewMode ? "preview" : "api"],
    queryFn: async () => {
      if (isPreviewMode) {
        return getPreviewEmployees(params);
      }
      const response = await employeeApi.list(params);
      return response.data;
    }
  });
};

export const useEmployeeMeta = () => {
  const isPreviewMode = useIsPreviewMode();

  return useQuery({
    queryKey: ["employees", "meta", isPreviewMode ? "preview" : "api"],
    queryFn: async () => {
      if (isPreviewMode) {
        return getPreviewEmployeeMeta();
      }
      const response = await employeeApi.meta();
      return response.data;
    }
  });
};

export const useEmployeeSummary = () => {
  const isPreviewMode = useIsPreviewMode();

  return useQuery({
    queryKey: ["employees", "summary", isPreviewMode ? "preview" : "api"],
    queryFn: async () => {
      if (isPreviewMode) {
        return getPreviewEmployeeSummary();
      }
      const response = await employeeApi.summary();
      return response.data;
    }
  });
};

export const useEmployee = (id?: string) => {
  const isPreviewMode = useIsPreviewMode();

  return useQuery({
    queryKey: ["employees", "detail", id, isPreviewMode ? "preview" : "api"],
    queryFn: async () => {
      if (isPreviewMode) {
        return previewEmployees.find((employee) => employee.id === id)!;
      }
      const response = await employeeApi.getById(id!);
      return response.data;
    },
    enabled: Boolean(id)
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  const isPreviewMode = useIsPreviewMode();
  return useMutation({
    mutationFn: (payload: Parameters<typeof employeeApi.create>[0]) => {
      if (isPreviewMode) {
        return Promise.reject(new Error("Mode demo hanya menampilkan data contoh."));
      }
      return employeeApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    }
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const isPreviewMode = useIsPreviewMode();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof employeeApi.update>[1] }) => {
      if (isPreviewMode) {
        return Promise.reject(new Error("Mode demo hanya menampilkan data contoh."));
      }
      return employeeApi.update(id, payload);
    },
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
  const isPreviewMode = useIsPreviewMode();
  return useMutation({
    mutationFn: (id: string) => {
      if (isPreviewMode) {
        return Promise.reject(new Error("Mode demo hanya menampilkan data contoh."));
      }
      return employeeApi.softDelete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    }
  });
};

export const useRestoreEmployee = () => {
  const queryClient = useQueryClient();
  const isPreviewMode = useIsPreviewMode();
  return useMutation({
    mutationFn: (id: string) => {
      if (isPreviewMode) {
        return Promise.reject(new Error("Mode demo hanya menampilkan data contoh."));
      }
      return employeeApi.restore(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    }
  });
};
