import { buildPrivateMessageNotificationEmail } from "./email";
import { describe, expect, it } from "vitest";

describe("notifications e-mail de messagerie privée", () => {
  it("ne contient aucun corps de message et renvoie l’apprenant vers son historique authentifié", () => {
    const privateBodyMarker = "CORPS-PRIVE-NE-DOIT-JAMAIS-ETRE-DANS-LEMAIL";
    const result = buildPrivateMessageNotificationEmail({
      to: "learner@example.test",
      recipientName: "Apprenant",
      subject: "Question de parcours",
      fromLearner: false,
    });

    expect(result.destination).toBe("https://akademy.neodev.click/training?tab=messages");
    expect(result.html).toContain("Question de parcours");
    expect(result.html).not.toContain(privateBodyMarker);
    expect(result.html).toContain("uniquement après connexion");
  });

  it("oriente un administrateur vers l’inbox sans introduire d’aperçu de message", () => {
    const result = buildPrivateMessageNotificationEmail({
      to: "admin@example.test",
      recipientName: null,
      subject: "Signalement de problème",
      fromLearner: true,
    });

    expect(result.destination).toBe("https://akademy.neodev.click/admin?tab=messages");
    expect(result.subject).toBe("Nouveau message — Signalement de problème");
    expect(result.html).not.toContain("Aperçu");
  });
});
