import axios from "axios";
import type { ApiResponse, AuthResponse } from "../types/user.types";
import {
  clearSession,
  getRefreshToken,
  getToken,
  isRefreshTokenValid,
  saveSession,
} from "../utils/tokenStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export const api = axios.create({ baseURL });

// Plain axios (no interceptors) so the refresh call itself never triggers
// the 401 handler below and loops.
const refreshClient = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh"];

let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken || !isRefreshTokenValid()) {
      throw new Error("Refresh token is missing or expired");
    }
    const res = await refreshClient.post<ApiResponse<AuthResponse>>("/auth/refresh", {
      refreshToken,
    });
    const auth = res.data.result;
    saveSession({
      token: auth.token,
      expiresAt: Date.now() + auth.expiresInMs,
      refreshToken: auth.refreshToken,
      refreshExpiresAt: Date.now() + auth.refreshExpiresInMs,
    });
    return auth.token;
  })();

  return refreshPromise.finally(() => {
    refreshPromise = null;
  });
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => config?.url?.includes(path));

    if (response?.status !== 401 || isAuthEndpoint || config._retried) {
      return Promise.reject(error);
    }

    try {
      config._retried = true;
      const newToken = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    } catch {
      clearSession();
      window.location.href = "/login";
      return Promise.reject(error);
    }
  }
);
