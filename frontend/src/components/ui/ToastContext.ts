import { createContext, useContext } from "react";

export type ToastTone = "success" | "error" | "info";

export type ToastMessage = {
  id: number;
  tone: ToastTone;
  message: string;
};

export type ToastContextValue = {
  notify: (message: string, tone?: ToastTone) => void;
};

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
