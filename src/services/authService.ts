import { api } from "./api";
import type {
  ApiResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
} from "../types/user.types";

export const authService = {
  login: (payload: LoginPayload) =>
    api
      .post<ApiResponse<AuthResponse>>("/auth/login", payload)
      .then((res) => res.data.result),

  register: (payload: RegisterPayload) =>
    api
      .post<ApiResponse<RegisterResponse>>("/auth/register", payload)
      .then((res) => res.data.result),

  refresh: (refreshToken: string) =>
    api
      .post<ApiResponse<AuthResponse>>("/auth/refresh", { refreshToken })
      .then((res) => res.data.result),

  logout: () => api.post<ApiResponse<void>>("/auth/logout").then((res) => res.data),
};
