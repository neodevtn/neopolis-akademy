import { describe, expect, it } from "vitest";
import { blockAppearanceFromData, resolveLearningTheme } from "./learningDesign";

describe("learning design templates", () => {
  it("résout le template Finance sans écraser son accent personnalisé", () => {
    const theme = resolveLearningTheme({ id: "finance-ledger", palette: { accent: "#ff0000" } });
    expect(theme.palette.primary).toBe("#155eef");
    expect(theme.palette.accent).toBe("#ff0000");
  });

  it("normalise les options visuelles déclarées par un bloc", () => {
    expect(blockAppearanceFromData({ styleTone: "warning", styleLayout: "flow" })).toMatchObject({ tone: "warning", layout: "flow" });
  });
});
