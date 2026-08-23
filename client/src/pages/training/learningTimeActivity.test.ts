import { describe, expect, it } from "vitest";
import { INACTIVITY_PAUSE_MS, shouldRecordLearningTime } from "./learningTimeActivity";

describe("shouldRecordLearningTime", () => {
  const now = 1_000_000;

  it("crédite une minute lorsque l’onglet est visible et l’interaction a moins de cinq minutes", () => {
    expect(shouldRecordLearningTime({
      now,
      lastInteractionAt: now - INACTIVITY_PAUSE_MS + 1,
      mediaPlaying: false,
      isVisible: true,
    })).toBe(true);
  });

  it("s’arrête exactement après cinq minutes sans interaction", () => {
    expect(shouldRecordLearningTime({
      now,
      lastInteractionAt: now - INACTIVITY_PAUSE_MS,
      mediaPlaying: false,
      isVisible: true,
    })).toBe(false);
  });

  it("continue pendant une lecture média réellement active dans un onglet visible", () => {
    expect(shouldRecordLearningTime({
      now,
      lastInteractionAt: now - INACTIVITY_PAUSE_MS - 60_000,
      mediaPlaying: true,
      isVisible: true,
    })).toBe(true);
  });

  it("ne crédite jamais un onglet masqué, même lorsqu’un média indique être en lecture", () => {
    expect(shouldRecordLearningTime({
      now,
      lastInteractionAt: now,
      mediaPlaying: true,
      isVisible: false,
    })).toBe(false);
  });
});
