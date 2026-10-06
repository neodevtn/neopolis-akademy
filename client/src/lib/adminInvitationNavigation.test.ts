import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ADMIN_INVITATIONS_PATH, adminInvitationHref, getAdminInvitationKind, legacyAdminInvitationTarget } from "./adminInvitationNavigation";

const source = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");

describe("destination unique des invitations administrateur", () => {
  it("ouvre l’invitation à un examen par défaut et préserve le choix plateforme", () => {
    expect(ADMIN_INVITATIONS_PATH).toBe("/admin/training?tab=invitations");
    expect(getAdminInvitationKind("tab=invitations")).toBe("exam");
    expect(getAdminInvitationKind("tab=invitations&kind=exam")).toBe("exam");
    expect(getAdminInvitationKind("tab=invitations&kind=platform")).toBe("platform");
    expect(adminInvitationHref("exam")).toBe("/admin/training?tab=invitations&kind=exam");
  });

  it("redirige seulement l’ancien onglet d’invitations vers ses données plateforme historiques", () => {
    expect(legacyAdminInvitationTarget("/admin", "?tab=invitations")).toBe(adminInvitationHref("platform"));
    expect(legacyAdminInvitationTarget("/admin", "?tab=invitations&invPage=2")).toBe(adminInvitationHref("platform"));
    expect(legacyAdminInvitationTarget("/admin", "?tab=candidatures")).toBeNull();
    expect(legacyAdminInvitationTarget("/admin/training", "?tab=invitations")).toBeNull();
  });

  it("n’expose qu’une entrée Invitations dans le menu et un seul gestionnaire d’examens", () => {
    const navbar = source("../components/AdminNavbar.tsx");
    const training = source("../pages/AdminTraining.tsx");
    const content = source("../pages/AdminContentManager.tsx");
    expect(navbar.match(/label: "Invitations"/g)).toHaveLength(1);
    expect(navbar).not.toContain("Invitations de candidature");
    expect(navbar).not.toContain("Invitations directes");
    expect(training).toContain('invitationKind === "exam" ? <DirectExamInvitationManager />');
    expect(training).toContain('invitationKind === "platform"');
    expect(content).not.toContain("<DirectExamInvitationManager");
    expect(content).toContain('adminInvitationHref("exam")');
  });
});
