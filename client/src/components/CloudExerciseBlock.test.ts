import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CloudExerciseBlock } from "@/components/CloudExerciseBlock";
import { adaptDataCampVmText, toCompetencyPercentage } from "@/components/CloudExerciseBlock";
import { renderInlineFormatting } from "@/pages/training/PageContent";

describe("Cloud exercise learner criteria", () => {
  it("renders Markdown emphasis without exposing raw delimiters", () => {
    const html = renderToStaticMarkup(
      React.createElement(React.Fragment, null, renderInlineFormatting("**Form Trigger** connecté à `Edit Fields`")),
    );

    expect(html).toMatch(/<strong[^>]*>Form Trigger<\/strong>/);
    expect(html).toContain("<code");
    expect(html).not.toContain("**");
  });

  it("exposes environment guidance, local resources and unavailable VM files for autonomous labs", () => {
    const html = renderToStaticMarkup(React.createElement(CloudExerciseBlock, {
      block: {
        id: "n8n_lab",
        title: "TP n8n",
        environmentGuide: { fr: "Utilisez **n8n Cloud** ou Docker." },
        resources: [{ title: { fr: "Supports PDF" }, description: { fr: "Chapitre local" }, url: "/api/assets/chapter_01_slides.pdf" }],
        referencedFiles: [{ filename: "currency_exchange.json", local_path: null }],
        steps: [],
      },
      lang: "fr",
      t: (value: { en: string; fr: string }) => value.fr,
      blockIdx: 0,
    }));

    expect(html).toContain("Prérequis et préparation de l’environnement");
    expect(html).toContain("/api/assets/chapter_01_slides.pdf");
    expect(html).toContain("currency_exchange.json");
  });

  it("replaces DataCamp VM-only references with learner-environment instructions", () => {
    const adapted = adaptDataCampVmText(
      "Vous avez été connecté automatiquement à votre propre compte n8n ! Sous le Desktop de la VM, allez dans Resources et ouvrez currency_exchange.json.",
      true,
    );
    expect(adapted).toContain("n8n Cloud ou Docker");
    expect(adapted).toContain("reconstituez le workflow `currency_exchange.json`");
    expect(adapted).not.toContain("connecté automatiquement");
    expect(adapted).not.toContain("Desktop de la VM");
  });

  it("normalise un score de rubrique en pourcentage avant la contribution de compétence", () => {
    expect(toCompetencyPercentage(1, 1)).toBe(100);
    expect(toCompetencyPercentage(3, 4)).toBe(75);
    expect(toCompetencyPercentage(-1, 4)).toBe(0);
    expect(toCompetencyPercentage(8, 4)).toBe(100);
  });
});
