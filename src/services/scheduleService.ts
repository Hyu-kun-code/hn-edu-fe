import { api } from "./api";
import type { Schedule, SchedulePayload } from "../types/class.types";
import type { ApiResponse } from "../types/user.types";
import { formatDate } from "../utils/format";

function toApiTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

function toRequestPayload(payload: SchedulePayload) {
  return {
    ...payload,
    sessionDate: formatDate(payload.sessionDate),
    startTime: toApiTime(payload.startTime),
    endTime: toApiTime(payload.endTime),
  };
}

export const scheduleService = {
  getUpcoming: () =>
    api.get<ApiResponse<Schedule[]>>("/schedules/upcoming").then((res) => res.data.result),

  getByClass: (classId: number) =>
    api
      .get<ApiResponse<Schedule[]>>(`/classes/${classId}/schedules`)
      .then((res) => res.data.result),

  create: (classId: number, payload: SchedulePayload) =>
    api
      .post<ApiResponse<Schedule>>(`/admin/classes/${classId}/schedules`, toRequestPayload(payload))
      .then((res) => res.data.result),

  requestSchedule: (classId: number, payload: SchedulePayload) =>
    api
      .post<ApiResponse<Schedule>>(`/classes/${classId}/schedules`, toRequestPayload(payload))
      .then((res) => res.data.result),

  reschedule: (id: number, payload: SchedulePayload) =>
    api
      .put<ApiResponse<Schedule>>(`/admin/schedules/${id}`, toRequestPayload(payload))
      .then((res) => res.data.result),

  cancel: (id: number) =>
    api
      .post<ApiResponse<Schedule>>(`/admin/schedules/${id}/cancel`)
      .then((res) => res.data.result),

  complete: (id: number) =>
    api.post<ApiResponse<Schedule>>(`/schedules/${id}/complete`).then((res) => res.data.result),

  getPending: () =>
    api.get<ApiResponse<Schedule[]>>("/admin/schedules/pending").then((res) => res.data.result),

  approve: (id: number) =>
    api
      .post<ApiResponse<Schedule>>(`/admin/schedules/${id}/approve`)
      .then((res) => res.data.result),

  reject: (id: number) =>
    api.post<ApiResponse<Schedule>>(`/admin/schedules/${id}/reject`).then((res) => res.data.result),
};
