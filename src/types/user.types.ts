export type UserRole = "ADMIN" | "TUTOR" | "STUDENT";

export type UserStatus = "PENDING" | "ACTIVE" | "LOCKED" | "REJECTED";

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface TutorProfile {
  id: string;
  userId: string;
  hourlyRate: number;
  isApproved: boolean;
  bio?: string;
}

export interface ApiResponse<T> {
  code: string;
  message: string;
  result: T;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInMs: number;
  refreshToken: string;
  refreshExpiresInMs: number;
  userId: number;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface RegisterResponse {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  message: string;
}

export interface UserProfileResponse {
  id: number;
  username: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
}

export interface UpdateProfilePayload {
  fullName: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AdminUserResponse {
  id: number;
  username: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}
