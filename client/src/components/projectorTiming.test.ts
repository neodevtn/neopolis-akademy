import { describe, expect, it } from "vitest";
import { findProjectorSlideIndex, timingToMediaTime } from "./projectorTiming";

describe("synchronisation Projector", () => {
  const timings = [
    { time: 0, slideIndex: 0, fragment: -1 },
    { time: 0.25, slideIndex: 1, fragment: -1 },
    { time: 0.75, slideIndex: 2, fragment: -1 },
  ];

  it("convertit les timings DataCamp fractionnaires en secondes média", () => {
    expect(timingToMediaTime(0.25, 240, "fraction")).toBe(60);
    expect(timingToMediaTime(60, 240, "seconds")).toBe(60);
  });

  it("sélectionne la slide correspondant à la position audio", () => {
    expect(findProjectorSlideIndex(10, timings, 240, 3, "fraction")).toBe(0);
    expect(findProjectorSlideIndex(60, timings, 240, 3, "fraction")).toBe(1);
    expect(findProjectorSlideIndex(220, timings, 240, 3, "fraction")).toBe(2);
  });
});
