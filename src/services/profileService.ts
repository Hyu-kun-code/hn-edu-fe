import { api } from "./api";
import type {
  ApiResponse,
  ChangePasswordPayload,
  UpdateProfilePayload,
  UserProfileResponse,
} from "../types/user.types";

export const profileService = {
  getProfile: () =>
    api.get<ApiResponse<UserProfileResponse>>("/profile").then((res) => res.data.result),

  updateProfile: (payload: UpdateProfilePayload) =>
    api
      .post<ApiResponse<UserProfileResponse>>("/profile/update", payload)
      .then((res) => res.data.result),

  changePassword: (payload: ChangePasswordPayload) =>
    api.post<ApiResponse<void>>("/profile/password", payload).then((res) => res.data),
};
