export type AdminInvitationKind = "exam" | "platform";

export const ADMIN_INVITATIONS_PATH = "/admin/training?tab=invitations";

export function adminInvitationHref(kind: AdminInvitationKind): string {
  return `${ADMIN_INVITATIONS_PATH}&kind=${kind}`;
}

/** L’ancien onglet affichait des invitations à rejoindre la plateforme. */
export function legacyAdminInvitationTarget(path: string, search: string): string | null {
  return path === "/admin" && new URLSearchParams(search).get("tab") === "invitations"
    ? adminInvitationHref("platform")
    : null;
}

/** L’accès depuis le menu mène directement à la nouvelle action d’examen. */
export function getAdminInvitationKind(search: string): AdminInvitationKind {
  return new URLSearchParams(search).get("kind") === "platform" ? "platform" : "exam";
}
