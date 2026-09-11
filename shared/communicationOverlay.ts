/** Returns true only for the administration area, never for public paths that merely share the same prefix. */
export function isAdministrativePath(location: string) {
  const path = String(location || "").split(/[?#]/, 1)[0] || "/";
  return path === "/admin" || path.startsWith("/admin/");
}
