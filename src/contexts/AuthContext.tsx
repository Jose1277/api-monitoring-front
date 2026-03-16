"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";

//types

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  // Restore session from localStorage on mount (client-only)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (!token || !rawUser) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    // Validate token hasn't expired
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        clearSession();
        return;
      }
    } catch {
      clearSession();
      return;
    }

    try {
      const user: User = JSON.parse(rawUser);
      setState({ user, token, loading: false });
    } catch {
      clearSession();
    }
  }, []);

  const persistSession = useCallback((token: string, user: User) => {
    localStorage.setItem("token", token);
    // store user info for display purposes
    localStorage.setItem(
      "user",
      JSON.stringify({ id: user.id, name: user.name, email: user.email })
    );
    setState({ user, token, loading: false });
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setState({ user: null, token: null, loading: false });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<{ token: string; user: User }>(
        "/auth/login",
        { email, password }
      );
      persistSession(data.token, data.user);
    },
    [persistSession]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { data } = await api.post<{ token: string; user: User }>(
        "/auth/register",
        { name, email, password }
      );
      persistSession(data.token, data.user);
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout }),
    [state, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return ctx;
}
