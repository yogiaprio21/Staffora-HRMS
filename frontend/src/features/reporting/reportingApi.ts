import { api } from "../../lib/api";

export const reportingApi = {
  downloadEmployeesPdf: async (params?: {
    search?: string;
    department?: string;
    role?: string;
    status?: string;
  }) => {
    const response = await api.get("/reports/employees/pdf", {
      params,
      responseType: "blob"
    });
    return response.data as Blob;
  },
  downloadLeaveExcel: async (params?: {
    status?: string;
    employeeId?: string;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const response = await api.get("/reports/leaves/excel", {
      params,
      responseType: "blob"
    });
    return response.data as Blob;
  }
};
