export const ROLES = {
  ADMIN: "ADMIN",
  TUTOR: "TUTOR",
  STUDENT: "STUDENT",
} as const;

export const ROLE_HOME_PATH: Record<string, string> = {
  [ROLES.ADMIN]: "/admin",
  [ROLES.TUTOR]: "/tutor",
  [ROLES.STUDENT]: "/student",
};
