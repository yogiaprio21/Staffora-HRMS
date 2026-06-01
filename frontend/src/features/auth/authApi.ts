import { api, requestTokenRefresh } from "../../lib/api";
import type { Employee } from "../../types";

export type LoginResponse = {
  accessToken: string;
  employee: Employee;
};

export const authApi = {
  login: async (payload: { email: string; password: string }) => {
    const response = await api.post("/auth/login", payload);
    return response.data as { data: LoginResponse };
  },
  refresh: async () => {
    return requestTokenRefresh();
  },
  me: async () => {
    const response = await api.get("/auth/me");
    return response.data as { data: Employee };
  },
  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const response = await api.patch("/auth/me/password", payload);
    return response.data as { data?: unknown };
  },
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data as { data?: unknown };
  }
};
