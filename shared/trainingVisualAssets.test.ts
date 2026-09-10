import { GENERATED_TRAINING_VISUAL_ASSETS } from "./trainingVisualAssets.generated";
import { getTrainingVisualAsset, resolveTrainingVisualAsset } from "./trainingVisualAssets";
import { describe, expect, it } from "vitest";

describe("registre des visuels de formation", () => {
  it("associe le pilote Claude à une image sociale Open Graph et une carte 4:3", () => {
    const visual = getTrainingVisualAsset("claude_certified_associate_foundations");

    expect(visual).toMatchObject({
      socialWidth: 1200,
      socialHeight: 630,
      cardWidth: 2176,
      cardHeight: 1632,
    });
    expect(visual?.socialPath).toMatch(/^\/manus-storage\/.+\.png$/);
    expect(visual?.cardPath).toMatch(/^\/api\/assets\/.+\.png$/);
    expect(visual?.alt.fr).toContain("Anthropic");
  });

  it("conserve un repli explicite pour les formations sans visuel dédié", () => {
    expect(getTrainingVisualAsset("formation-inconnue")).toBeUndefined();
  });

  it("priorise les visuels administrables et garantit un repli de marque", () => {
    const custom = resolveTrainingVisualAsset("formation-inconnue", {
      cardPath: "/api/assets/carte-admin.png",
      socialPath: "/api/assets/social-admin.png",
    });
    expect(custom.cardPath).toBe("/api/assets/carte-admin.png");
    expect(custom.socialPath).toBe("/api/assets/social-admin.png");

    const fallback = resolveTrainingVisualAsset("formation-inconnue");
    expect(fallback.cardPath).toContain("square-neopolis-akademy");
    expect(fallback.socialPath).toContain("og-neopolis-akademy");
  });

  it("attribue une carte et une image sociale dédiées aux 115 formations du manifeste", () => {
    const visuals = Object.values(GENERATED_TRAINING_VISUAL_ASSETS);

    expect(visuals).toHaveLength(115);
    for (const visual of visuals) {
      expect(visual.socialPath).toMatch(/^\/manus-storage\/.+-social_[a-f0-9]+\.png$/);
      expect(visual.socialWidth).toBe(1200);
      expect(visual.socialHeight).toBe(630);
      expect(visual.cardPath).toMatch(/^\/api\/assets\/.+-card_[a-f0-9]+\.png$/);
      expect(visual.cardWidth).toBe(1200);
      expect(visual.cardHeight).toBe(900);
    }
  });
});
