import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CloudExerciseBlock } from "@/components/CloudExerciseBlock";
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
});
