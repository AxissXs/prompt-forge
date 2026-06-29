import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, AuthSession } from "../types";
import { backend } from "../services/backend";

type AuthCtx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (email: string, username: string, password: string, recaptchaToken: string) => Promise<void>;
  login: (email: string, password: string, recaptchaToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const LS_KEY = "pf_auth_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const refreshUser = useCallback(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const persist = useCallback((s: AuthSession | null) => {
    setSession(s);
    if (s) localStorage.setItem(LS_KEY, JSON.stringify(s));
    else localStorage.removeItem(LS_KEY);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string, recaptchaToken: string) => {
    const s = await backend.register(email, username, password, recaptchaToken);
    persist(s);
  }, [persist]);

  const login = useCallback(async (email: string, password: string, recaptchaToken: string) => {
    const s = await backend.login(email, password, recaptchaToken);
    persist(s);
  }, [persist]);

  const logout = useCallback(() => {
    if (session) backend.logout(session.token);
    persist(null);
  }, [session, persist]);

  return (
    <Ctx.Provider value={{ user: session?.user ?? null, token: session?.token ?? null, loading, register, login, logout, refreshUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
