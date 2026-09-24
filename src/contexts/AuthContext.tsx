import { createContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/user.types";
import { authService } from "../services/authService";
import {
  clearSession,
  getToken,
  isRefreshTokenValid,
  isTokenValid as isAccessTokenValid,
  saveSession,
} from "../utils/tokenStorage";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (
    user: User,
    token: string,
    expiresInMs: number,
    refreshToken: string,
    refreshExpiresInMs: number
  ) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  /** True if the access token is still valid, or a valid refresh token can silently renew it. */
  isTokenValid: () => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser && (isAccessTokenValid() || isRefreshTokenValid())) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else if (storedToken || storedUser) {
      // Both access and refresh tokens expired while the app was closed.
      clearSession();
    }
    setIsLoading(false);
  }, []);

  function login(
    nextUser: User,
    nextToken: string,
    expiresInMs: number,
    refreshToken: string,
    refreshExpiresInMs: number
  ) {
    saveSession({
      token: nextToken,
      expiresAt: Date.now() + expiresInMs,
      refreshToken,
      refreshExpiresAt: Date.now() + refreshExpiresInMs,
    });
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
    setToken(nextToken);
  }

  function isTokenValid() {
    return Boolean(token) && (isAccessTokenValid() || isRefreshTokenValid());
  }

  function updateUser(patch: Partial<User>) {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }

  function logout() {
    authService.logout().catch(() => {
      // Ignore — we clear local session regardless of API result.
    });
    clearSession();
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser, isTokenValid }}>
      {children}
    </AuthContext.Provider>
  );
}
