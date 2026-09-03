export type AdminLogRole = "user" | "manager" | "admin" | "admin_learner";

/** Le rôle admin représente le Super Admin historique de Neopolis Akademy. */
export function canAccessAdminLogs(role: string | null | undefined): role is Extract<AdminLogRole, "manager" | "admin" | "admin_learner"> {
  return role === "admin" || role === "admin_learner" || role === "manager";
}
