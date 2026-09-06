import { api } from "./api";
import type { ClassEntity, Schedule } from "../types/class.types";

export const classService = {
  getClasses: () => api.get<ClassEntity[]>("/classes").then((res) => res.data),

  getClassById: (id: string) =>
    api.get<ClassEntity>(`/classes/${id}`).then((res) => res.data),

  getSchedulesByClass: (classId: string) =>
    api.get<Schedule[]>(`/classes/${classId}/schedules`).then((res) => res.data),
};
