import { api } from "./api";
import type {
  ClassEntity,
  CreateClassPayload,
  UpdateClassPayload,
} from "../types/class.types";
import type { ApiResponse } from "../types/user.types";

export const classService = {
  getClasses: () =>
    api.get<ApiResponse<ClassEntity[]>>("/classes").then((res) => res.data.result),

  getMyClasses: () =>
    api.get<ApiResponse<ClassEntity[]>>("/classes/mine").then((res) => res.data.result),

  getClassById: (id: number) =>
    api.get<ApiResponse<ClassEntity>>(`/classes/${id}`).then((res) => res.data.result),

  createClass: (payload: CreateClassPayload) =>
    api.post<ApiResponse<ClassEntity>>("/admin/classes", payload).then((res) => res.data.result),

  updateClass: (id: number, payload: UpdateClassPayload) =>
    api
      .put<ApiResponse<ClassEntity>>(`/admin/classes/${id}`, payload)
      .then((res) => res.data.result),

  closeClass: (id: number) =>
    api
      .post<ApiResponse<ClassEntity>>(`/admin/classes/${id}/close`)
      .then((res) => res.data.result),

  enroll: (id: number) => api.post<ApiResponse<void>>(`/classes/${id}/enroll`).then((res) => res.data),

  drop: (id: number) => api.post<ApiResponse<void>>(`/classes/${id}/drop`).then((res) => res.data),
};
