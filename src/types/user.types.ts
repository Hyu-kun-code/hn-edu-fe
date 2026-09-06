export type UserRole = "ADMIN" | "TUTOR" | "STUDENT";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface TutorProfile {
  id: string;
  userId: string;
  hourlyRate: number;
  isApproved: boolean;
  bio?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}
