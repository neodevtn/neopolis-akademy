import { describe, expect, it } from "vitest";
import { blockAppearanceFromData, resolveLearningTheme } from "./learningDesign";
import { getEditableBlockTypes } from "./blockRegistry";

describe("learning design templates", () => {
  it("résout le template Finance sans écraser son accent personnalisé", () => {
    const theme = resolveLearningTheme({ id: "finance-ledger", palette: { accent: "#ff0000" } });
    expect(theme.palette.primary).toBe("#155eef");
    expect(theme.palette.accent).toBe("#ff0000");
  });

  it("normalise les options visuelles déclarées par un bloc", () => {
    expect(blockAppearanceFromData({ styleTone: "warning", styleLayout: "flow" })).toMatchObject({ tone: "warning", layout: "flow" });
  });

  it("n’expose pas les anciens blocs Novasavo dans la bibliothèque de création", () => {
    const editableTypes = getEditableBlockTypes().map((block) => block.type);
    expect(editableTypes).toContain("knowledge_check");
    expect(editableTypes).not.toContain("inline_myth_reality");
    expect(editableTypes).not.toContain("unit_hero_blue");
    expect(editableTypes).not.toContain("notes_highlights_bookmarks_panel");
  });
});
