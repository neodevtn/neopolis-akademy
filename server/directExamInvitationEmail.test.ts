import { describe, expect, it } from "vitest";
import { buildDirectExamInvitationMessage } from "./directExamInvitationEmail";

const base = { name: "Ada", examTitle: "Developer <Foundations>", url: "https://akademy.neodev.click/accept-exam-invitation?token=" + "a".repeat(64) + "&source=test", existingAccount: false };

describe("courriel d’invitation directe à l’examen", () => {
  it("présente au guest l’inscription et le profil, sans délai d’expiration ni certification officielle", () => {
    const mail = buildDirectExamInvitationMessage({ ...base, language: "fr" });
    expect(mail.text).toContain("complétez votre profil");
    expect(mail.text).toContain("sans limite de temps");
    expect(mail.text).toContain("et non de la certification officielle");
    expect(mail.html).toContain("Developer &lt;Foundations&gt;");
    expect(mail.html).not.toContain("Developer <Foundations>");
    expect(mail.html).toContain("&amp;source=test");
  });
  it("propose la connexion du compte existant au lieu de recréer ses identifiants", () => {
    const mail = buildDirectExamInvitationMessage({ ...base, language: "en", existingAccount: true });
    expect(mail.text).toContain("Sign in with your existing account");
    expect(mail.text).not.toContain("Create a learner account");
    expect(mail.text).toContain("does not expire");
  });
});
