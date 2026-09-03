export const USER_ROLES = ["user", "manager", "admin", "admin_learner"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isAdministrativeRole(role: string | null | undefined): role is Extract<UserRole, "admin" | "admin_learner"> {
  return role === "admin" || role === "admin_learner";
}

/**
 * The legacy admin role retains unrestricted content review. An admin-learner
 * deliberately follows the learner sequence so the recorded progress remains meaningful.
 */
export function canBypassLearningSequence(role: string | null | undefined): boolean {
  return role === "admin";
}

export function isLearnerStatisticsRole(role: string | null | undefined): boolean {
  return role === "user" || role === "admin_learner";
}

export function userRoleLabel(role: string | null | undefined): string {
  if (role === "admin_learner") return "Admin-apprenant";
  if (role === "admin") return "Administrateur";
  if (role === "manager") return "Gestionnaire";
  return "Apprenant";
}
