import { describe, expect, it } from "vitest";
import { videoProviderFallbackCopy } from "./YouTubePlayer";

describe("videoProviderFallbackCopy", () => {
  it("ne prétend pas que le retour au cours enregistre automatiquement la progression", () => {
    expect(videoProviderFallbackCopy.en).not.toMatch(/return here to record your progress/i);
    expect(videoProviderFallbackCopy.fr).not.toMatch(/revenez ici pour enregistrer votre progression/i);
  });

  it("explique la seule action explicite disponible après la lecture externe", () => {
    expect(videoProviderFallbackCopy.en).toMatch(/if you complete it, mark it as watched/i);
    expect(videoProviderFallbackCopy.fr).toMatch(/si vous l’avez terminée, la marquer comme vue/i);
  });
});
