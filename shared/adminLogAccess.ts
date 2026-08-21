export type AdminLogRole = "user" | "manager" | "admin";

/** Le rôle admin représente le Super Admin historique de Neopolis Akademy. */
export function canAccessAdminLogs(role: string | null | undefined): role is Extract<AdminLogRole, "manager" | "admin"> {
  return role === "admin" || role === "manager";
}
