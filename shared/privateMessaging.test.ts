import { describe, expect, it } from "vitest";
import { PRIVATE_MESSAGE_LIMITS, normalizePrivateMessageText, privateConversationDisplaySource, privateMessagePreview } from "./privateMessaging";

describe("messagerie privée — normalisation", () => {
  it("normalise les espaces et les retours de ligne sans modifier le contenu métier", () => {
    expect(normalizePrivateMessageText("  Bonjour\r\n\tNeopolis   \n ")).toBe("Bonjour\n Neopolis");
  });

  it("produit un aperçu borné sans exposer de contenu supplémentaire", () => {
    const body = "a".repeat(PRIVATE_MESSAGE_LIMITS.previewMax + 30);
    const preview = privateMessagePreview(body);
    expect(preview).toHaveLength(PRIVATE_MESSAGE_LIMITS.previewMax);
    expect(preview.endsWith("…")).toBe(true);
  });

  it("affiche des sources compréhensibles sans modifier leur valeur de stockage", () => {
    expect(privateConversationDisplaySource("problem_report")).toBe("Signalement");
    expect(privateConversationDisplaySource("integrity_review")).toBe("Revue d’intégrité");
    expect(privateConversationDisplaySource("learner")).toBe("Initiative apprenant");
  });
});
