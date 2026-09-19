import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CloudExerciseBlock } from "@/components/CloudExerciseBlock";
import { adaptDataCampVmText, getUnavailableExerciseResourceNames, shouldRecordClientCompetency, toCompetencyPercentage } from "@/components/CloudExerciseBlock";
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

  it("does not label a supplied starter workflow as an unavailable source file", () => {
    expect(getUnavailableExerciseResourceNames({
      resources: [{ filename: "currency_exchange.json", url: "/api/assets/n8n-foundations/starters/currency_exchange.json" }],
      referencedFiles: [{ filename: "currency_exchange.json", local_path: null }],
    })).toEqual([]);
  });

  it("leaves competency recording to the server for server-graded activities", () => {
    expect(shouldRecordClientCompetency({ serverGradedAssessment: "n8n_foundations_workflow_json" }, { rubricEvaluated: true })).toBe(false);
    expect(shouldRecordClientCompetency({}, { rubricEvaluated: true })).toBe(true);
  });

  it("explains the exact evidence expected by a prompt-based AI evaluation", () => {
    const html = renderToStaticMarkup(React.createElement(CloudExerciseBlock, {
      block: {
        id: "dc_1_act_02_tp",
        title: "Votre première conversation avec l’assistant IA choisi",
        assignment: "Explorez les usages de l’IA générative en conseil.",
        rubricCriteria: [{ id: "criterion_1", label: "Cas d’usage", description: "The prompt needs to mention use-cases of generative AI in consultancy." }],
        maxScore: 1,
        passingScore: 1,
      },
      lang: "fr",
      t: (value: { en: string; fr: string }) => value.fr,
      blockIdx: 0,
      evaluationContext: { certificationId: "datacamp_ai_for_consulting", courseId: "ai_for_consulting__01", lessonIndex: 0, chapterIndex: 1 },
      onEvaluate: async () => ({ score: 1, feedback: "OK", strengths: [], improvements: [], passed: true }),
    }));

    expect(html).toContain("Ce que vous devez remettre");
    expect(html).toContain("invite exacte");
    expect(html).not.toMatch(/workflow JSON/i);
    expect(html).toContain("au moins 40 caractères");
  });
});
