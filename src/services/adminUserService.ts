import { api } from "./api";
import type { AdminUserResponse, ApiResponse } from "../types/user.types";

export const adminUserService = {
  getUsers: () =>
    api.get<ApiResponse<AdminUserResponse[]>>("/admin/users").then((res) => res.data.result),

  getPendingTutors: () =>
    api
      .get<ApiResponse<AdminUserResponse[]>>("/admin/users/pending-tutors")
      .then((res) => res.data.result),

  approve: (id: number) =>
    api
      .post<ApiResponse<AdminUserResponse>>(`/admin/users/${id}/approve`)
      .then((res) => res.data.result),

  reject: (id: number) =>
    api
      .post<ApiResponse<AdminUserResponse>>(`/admin/users/${id}/reject`)
      .then((res) => res.data.result),

  lock: (id: number) =>
    api
      .post<ApiResponse<AdminUserResponse>>(`/admin/users/${id}/lock`)
      .then((res) => res.data.result),

  unlock: (id: number) =>
    api
      .post<ApiResponse<AdminUserResponse>>(`/admin/users/${id}/unlock`)
      .then((res) => res.data.result),
};
