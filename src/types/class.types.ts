export type LevelType = "YLE" | "SCHOOL" | "CERTIFICATE";

export type ClassStatus = "ACTIVE" | "CLOSED";

export interface ClassEntity {
  id: number;
  name: string;
  levelType: LevelType;
  levelDetail?: string;
  tutorId: number;
  tutorName?: string;
  tuitionFee: number;
  maxStudents: number;
  currentStudents: number;
  status: ClassStatus;
  createdAt: string;
}

export interface CreateClassPayload {
  name: string;
  levelType: LevelType;
  levelDetail?: string;
  tutorId: number;
  tuitionFee: number;
  maxStudents: number;
}

export interface UpdateClassPayload {
  name?: string;
  levelDetail?: string;
  tutorId: number;
  tuitionFee: number;
  maxStudents: number;
}

export type ScheduleStatus = "PENDING_APPROVAL" | "SCHEDULED" | "COMPLETED" | "CANCELLED" | "REJECTED";

export interface Schedule {
  id: number;
  classId: number;
  className?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  note?: string;
}

export interface SchedulePayload {
  sessionDate: string;
  startTime: string;
  endTime: string;
  note?: string;
}
