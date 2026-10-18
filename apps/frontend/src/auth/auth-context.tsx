import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import api, { setAccessToken, unwrap } from "../lib/api";
import type { User } from "../types";

type SessionPayload = { user: User; accessToken: string };
type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((session: SessionPayload) => {
    setAccessToken(session.accessToken);
    setUser(session.user);
    return session.user;
  }, []);

  useEffect(() => {
    const restore = async () => {
      try {
        const response = await api.post("/auth/refresh", {});
        applySession(unwrap<SessionPayload>(response));
      } catch {
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    void restore();
  }, [applySession]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    login: async (email, password) => applySession(unwrap<SessionPayload>(await api.post("/auth/login", { email, password }))),
    register: async (name, email, password) => applySession(unwrap<SessionPayload>(await api.post("/auth/register", { name, email, password }))),
    logout: async () => {
      try { await api.post("/auth/logout", {}); } finally { setAccessToken(null); setUser(null); }
    }
  }), [applySession, isLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
