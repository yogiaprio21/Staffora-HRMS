const DEFAULT_API_BASE_URL = "http://localhost:4000/api/v1";

const normalizeApiBaseUrl = (value?: string) => {
  const trimmed = (value || DEFAULT_API_BASE_URL).trim().replace(/\/+$/, "");
  if (!trimmed) {
    return DEFAULT_API_BASE_URL;
  }
  return /\/api\/v1$/i.test(trimmed) ? trimmed : `${trimmed}/api/v1`;
};

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
export const APP_NAME = import.meta.env.VITE_APP_NAME || "Staffora HRMS";
export const APP_TAGLINE =
  import.meta.env.VITE_APP_TAGLINE || "Sistem Manajemen Karyawan yang Terpadu";
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
export const DEMO_HR_EMAIL = import.meta.env.VITE_DEMO_HR_EMAIL || "hr@staffora.local";
export const DEMO_EMPLOYEE_EMAIL =
  import.meta.env.VITE_DEMO_EMPLOYEE_EMAIL || "emma@staffora.local";
export const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "Password123!";
