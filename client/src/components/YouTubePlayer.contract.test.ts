import { describe, expect, it } from "vitest";
import {
  canMarkVideoComplete,
  nextVideoEmbedHostAfterProviderError,
  videoProviderFallbackCopy,
} from "./YouTubePlayer";

describe("videoProviderFallbackCopy", () => {
  it("ne prétend pas que le retour au cours enregistre automatiquement la progression", () => {
    expect(videoProviderFallbackCopy.en).not.toMatch(/return here to record your progress/i);
    expect(videoProviderFallbackCopy.fr).not.toMatch(/revenez ici pour enregistrer votre progression/i);
  });

  it("explique la seule action explicite disponible après la lecture externe", () => {
    expect(videoProviderFallbackCopy.en).toMatch(/confirm you watched it before marking/i);
    expect(videoProviderFallbackCopy.fr).toMatch(/confirmez l’avoir regardée avant de valider/i);
  });

  it("ne déclare jamais une vidéo terminée après un simple délai de démarrage", () => {
    expect(canMarkVideoComplete({ playbackConfirmed: false, providerUnavailable: false, externalViewingConfirmed: false })).toBe(false);
  });

  it("autorise uniquement un repli explicite après une erreur fournisseur réelle", () => {
    expect(nextVideoEmbedHostAfterProviderError("privacy")).toBe("standard");
    expect(nextVideoEmbedHostAfterProviderError("standard")).toBeNull();
    expect(canMarkVideoComplete({ playbackConfirmed: false, providerUnavailable: true, externalViewingConfirmed: false })).toBe(false);
    expect(canMarkVideoComplete({ playbackConfirmed: false, providerUnavailable: true, externalViewingConfirmed: true })).toBe(true);
  });
});
