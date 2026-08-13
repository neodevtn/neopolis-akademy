import { describe, expect, it } from "vitest";
import { buildInvitationHtml } from "./email";

describe("Invitation email CTA", () => {
  const invitationLink = "https://akademy.neodev.click/invite/accept?token=test-token";

  it("uses an email-safe table button with an explicit dark background and white label", () => {
    const html = buildInvitationHtml({
      to: "learner@example.com",
      invitedBy: "Achraf Khelil",
      invitationLink,
      language: "fr",
    });

    expect(html).toContain('bgcolor="#be123c"');
    expect(html).toContain("background-color: #be123c");
    expect(html).toContain("color: #ffffff !important");
    expect(html).toContain("Accepter l'invitation");
    expect(html).toContain(invitationLink);
  });

  it("includes a visible fallback link for clients that do not render buttons", () => {
    const html = buildInvitationHtml({
      to: "learner@example.com",
      invitedBy: "Achraf Khelil",
      invitationLink,
      language: "en",
    });

    expect(html).toContain("If the button is not displayed, open this link:");
    expect(html.match(new RegExp(invitationLink.replace(/[?]/g, "\\?"), "g"))?.length).toBeGreaterThanOrEqual(2);
  });
});
