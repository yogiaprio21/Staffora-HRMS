import { createContext, useContext } from "react";
import type { Employee } from "../../types";

export type AuthState = {
  user: Employee | null;
  accessToken: string | null;
  loading: boolean;
};

export type AuthContextValue = AuthState & {
  login: (payload: { email: string; password: string }) => Promise<Employee>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: Employee | null) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
