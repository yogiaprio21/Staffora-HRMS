import { useEffect, useMemo, useState } from "react";
import { authApi } from "./authApi";
import { setAccessToken } from "../../lib/api";
import { storage } from "../../lib/storage";
import type { Employee } from "../../types";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<Employee | null>(storage.getUser());
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const refreshed = await authApi.refresh();
        const newToken = refreshed.data?.accessToken || null;
        const employee = refreshed.data?.employee || null;
        setAccessTokenState(newToken);
        setUserState(employee);
        storage.setUser(employee);
      } catch {
        setAccessTokenState(null);
        setUserState(null);
        storage.setUser(null);
      }
      setLoading(false);
    };
    bootstrap();
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    const response = await authApi.login(payload);
    const token = response.data.accessToken;
    const employee = response.data.employee;
    setAccessTokenState(token);
    setUserState(employee);
    storage.setUser(employee);
    return employee;
  };

  const logout = async () => {
    await authApi.logout();
    setAccessTokenState(null);
    setUserState(null);
    storage.setUser(null);
  };

  const refresh = async () => {
    const response = await authApi.refresh();
    const token = response.data.accessToken;
    const employee = response.data.employee;
    setAccessTokenState(token);
    setUserState(employee);
    storage.setUser(employee);
  };

  const setUser = (nextUser: Employee | null) => {
    setUserState(nextUser);
    storage.setUser(nextUser);
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      login,
      logout,
      refresh,
      setUser
    }),
    [user, accessToken, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
