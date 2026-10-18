import { GENERATED_TRAINING_VISUAL_ASSETS } from "./trainingVisualAssets.generated";
import trainingIndex from "../client/src/data/trainingIndex.json";
import {
  getTrainingVisualAsset,
  resolveTrainingVisualAsset,
} from "./trainingVisualAssets";
import { describe, expect, it } from "vitest";

describe("registre des visuels de formation", () => {
  it("associe le pilote Claude à une image sociale Open Graph et une carte 4:3", () => {
    const visual = getTrainingVisualAsset(
      "claude_certified_associate_foundations"
    );

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

  it("associe FDE aux deux sorties du template de marque plutôt qu’à une photo brute", () => {
    const fde = (trainingIndex.certifications as any[]).find(
      (training) => training.id === "claude_forward_deployed_engineer",
    );
    const visual = resolveTrainingVisualAsset(fde.id, fde.visualAssets);

    expect(visual).toMatchObject({
      socialWidth: 1200,
      socialHeight: 630,
      cardWidth: 1200,
      cardHeight: 900,
    });
    expect(visual.cardPath).toMatch(/^\/api\/assets\/claude_forward_deployed_engineer-card_[a-f0-9]+\.png$/);
    expect(visual.socialPath).toMatch(/^\/api\/assets\/claude_forward_deployed_engineer-social_[a-f0-9]+\.png$/);
  });

  it("conserve les visuels dédiés générés pour les formations qui en disposent", () => {
    const visuals = Object.values(GENERATED_TRAINING_VISUAL_ASSETS);

    expect(visuals.length).toBeGreaterThan(0);
    for (const visual of visuals) {
      expect(visual.socialPath).toMatch(
        /^\/manus-storage\/.+-social_[a-f0-9]+\.png$/
      );
      expect(visual.socialWidth).toBe(1200);
      expect(visual.socialHeight).toBe(630);
      expect(visual.cardPath).toMatch(
        /^\/api\/assets\/.+-card_[a-f0-9]+\.png$/
      );
      expect(visual.cardWidth).toBe(1200);
      expect(visual.cardHeight).toBe(900);
    }
  });
});
