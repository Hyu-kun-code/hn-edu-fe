import { api } from "./api";
import type { AddVideoLinkPayload, CourseDocument } from "../types/document.types";
import type { ApiResponse } from "../types/user.types";

export const documentService = {
  getByClass: (classId: number) =>
    api
      .get<ApiResponse<CourseDocument[]>>(`/classes/${classId}/documents`)
      .then((res) => res.data.result),

  getBySchedule: (scheduleId: number) =>
    api
      .get<ApiResponse<CourseDocument[]>>(`/schedules/${scheduleId}/documents`)
      .then((res) => res.data.result),

  uploadForClass: (classId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post<ApiResponse<CourseDocument>>(`/classes/${classId}/documents/upload`, formData)
      .then((res) => res.data.result);
  },

  uploadForSchedule: (scheduleId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post<ApiResponse<CourseDocument>>(`/schedules/${scheduleId}/documents/upload`, formData)
      .then((res) => res.data.result);
  },

  addVideoLinkForClass: (classId: number, payload: AddVideoLinkPayload) =>
    api
      .post<ApiResponse<CourseDocument>>(`/classes/${classId}/documents/link`, payload)
      .then((res) => res.data.result),

  addVideoLinkForSchedule: (scheduleId: number, payload: AddVideoLinkPayload) =>
    api
      .post<ApiResponse<CourseDocument>>(`/schedules/${scheduleId}/documents/link`, payload)
      .then((res) => res.data.result),

  deleteDocument: (id: number) =>
    api.delete<ApiResponse<void>>(`/documents/${id}`).then((res) => res.data),

  downloadBlob: (id: number) =>
    api.get(`/documents/${id}/download`, { responseType: "blob" }).then((res) => res.data as Blob),
};
