export type LevelType = "YLE" | "SCHOOL" | "CERTIFICATE";

export interface ClassEntity {
  id: string;
  name: string;
  levelType: LevelType;
  levelDetail: string;
  tutorId: string;
}

export type ScheduleStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface Schedule {
  id: string;
  classId: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
}
