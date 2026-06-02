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
  if (axiosError?.response?.status === 404) {
    return "Endpoint API tidak ditemukan. Pastikan URL API mengarah ke alamat backend yang benar.";
  }
  return axiosError?.response?.data?.message || axiosError?.message || fallback;
};
