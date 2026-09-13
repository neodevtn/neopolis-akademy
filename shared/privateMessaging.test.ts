import { describe, expect, it } from "vitest";
import { PRIVATE_MESSAGE_LIMITS, normalizePrivateMessageText, privateConversationDisplaySource, privateConversationDisplayStatus, privateMessagePreview, privateMessageReceiptLabel } from "./privateMessaging";

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

  it("distingue clairement un message envoyé, distribué et vu", () => {
    expect(privateMessageReceiptLabel({})).toBe("Envoyé");
    expect(privateMessageReceiptLabel({ deliveredAt: new Date("2026-09-13T08:00:00Z") })).toBe("Distribué");
    expect(privateMessageReceiptLabel({ deliveredAt: new Date("2026-09-13T08:00:00Z"), readAt: new Date("2026-09-13T08:01:00Z") })).toBe("Vu");
  });

  it("localise les statuts et sources de la messagerie en anglais", () => {
    expect(privateMessageReceiptLabel({}, "en")).toBe("Sent");
    expect(privateMessageReceiptLabel({ deliveredAt: new Date("2026-09-13T08:00:00Z") }, "en")).toBe("Delivered");
    expect(privateMessageReceiptLabel({ readAt: new Date("2026-09-13T08:01:00Z") }, "en")).toBe("Seen");
    expect(privateConversationDisplayStatus("closed", "en")).toBe("Closed");
    expect(privateConversationDisplaySource("integrity_review", "en")).toBe("Integrity review");
  });
});
