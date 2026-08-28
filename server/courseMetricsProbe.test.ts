import { describe, expect, it } from "vitest";

describe("normalisation des métriques de cours", () => {
  it("reconnaît les indicateurs lorsqu’un libellé est affiché sur plusieurs lignes", async () => {
    const { normalizeMetricText } = await import("../scripts/course-metrics-utils.mjs");
    const rendered = normalizeMetricText("0\nExercices interactifs\n7\nVidéos");

    expect(rendered).toContain("0 exercices interactifs");
    expect(rendered).toContain("7 vidéos");
  });
});
