import { api } from "./api";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../types/user.types";

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", payload).then((res) => res.data),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", payload).then((res) => res.data),
};
