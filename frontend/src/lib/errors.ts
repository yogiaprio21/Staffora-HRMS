import type { AxiosError } from "axios";

type ApiError = {
  message?: string;
};

export const getErrorMessage = (error: unknown, fallback = "Terjadi kesalahan") => {
  const axiosError = error as AxiosError<ApiError>;
  if (axiosError?.code === "ERR_NETWORK") {
    return "Server belum tersedia. Pastikan backend berjalan dan koneksi API sudah benar.";
  }
  if (axiosError?.response?.status === 500) {
    return "Server mengalami kendala internal. Periksa migration database dan log backend.";
  }
  return axiosError?.response?.data?.message || axiosError?.message || fallback;
};
