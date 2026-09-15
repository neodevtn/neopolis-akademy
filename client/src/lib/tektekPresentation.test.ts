import { describe, expect, it } from "vitest";
import { parseTekTekAnswerLines, splitTekTekInlineMarkdown, stripTekTekInternalCitations } from "./tektekPresentation";

describe("TekTek presentation", () => {
  it("converts supported emphasis into safe text segments", () => {
    expect(splitTekTekInlineMarkdown("Décider de **ce qui doit rester humain** avant d'automatiser.")).toEqual([
      { emphasis: false, text: "Décider de " },
      { emphasis: true, text: "ce qui doit rester humain" },
      { emphasis: false, text: " avant d'automatiser." },
    ]);
  });

  it("recognises Markdown bullets without interpreting HTML", () => {
    expect(parseTekTekAnswerLines("- **Objectif** : définir le résultat\n<p>ne pas rendre</p>")).toEqual([
      {
        bullet: true,
        segments: [
          { emphasis: true, text: "Objectif" },
          { emphasis: false, text: " : définir le résultat" },
        ],
      },
      { bullet: false, segments: [{ emphasis: false, text: "<p>ne pas rendre</p>" }] },
    ]);
  });

  it("removes provider citation control markers from persisted replies", () => {
    expect(stripTekTekInternalCitations("Le cours explique la délégation. citecourse:1:2:block-3 Ensuite, évaluez le résultat.")).toBe(
      "Le cours explique la délégation. Ensuite, évaluez le résultat.",
    );
  });
});
