import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./config";
import { storage } from "./storage";
import type { Employee } from "../types";

let accessToken: string | null = null;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15_000
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15_000
});

export const requestTokenRefresh = async () => {
  const response = await refreshClient.post("/auth/refresh");
  return response.data as { data: { accessToken: string; employee: Employee } };
};

type FailedRequest = {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.authorization = `Bearer ${accessToken}`;
  }
  if (config.method && !["get", "head", "options"].includes(config.method)) {
    config.headers["X-Staffora-Request"] = "true";
  }
  return config;
});

refreshClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.method && !["get", "head", "options"].includes(config.method)) {
    config.headers["X-Staffora-Request"] = "true";
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            if (token) {
              originalRequest.headers.authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          },
          reject
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await requestTokenRefresh();
      const newToken =
        refreshResponse.data?.accessToken || null;
      accessToken = newToken;
      processQueue(null, newToken);
      if (newToken) {
        originalRequest.headers.authorization = `Bearer ${newToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      accessToken = null;
      storage.setUser(null);
      processQueue(refreshError, null);
      window.location.assign("/login");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export { api };
