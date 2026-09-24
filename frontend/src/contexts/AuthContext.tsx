import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, setAccessToken } from "../services/api";

type Role = "ADMIN" | "SUPERVISOR" | "OPERATOR";
type User = { id: string; name: string; email: string; role: Role; active: boolean };
type AuthContextValue = { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; hasRole: (...roles: Role[]) => boolean };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await api.post("/auth/refresh");
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  useEffect(() => {
    refresh().catch(() => setAccessToken(null)).finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => undefined);
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, hasRole: (...roles: Role[]) => !!user && roles.includes(user.role) }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
