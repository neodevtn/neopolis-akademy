import { describe, expect, it } from "vitest";
import { getAssessmentSubmissionGuidance, getVisibleAssessmentCriteria, inferAssessmentSubmissionMode, resolveAssessmentMinimumLength } from "./assessmentSubmissionGuidance";

describe("assessment submission guidance", () => {
  it("asks for the exact prompt when the grading criterion evaluates a prompt", () => {
    const block = {
      rubricCriteria: [{ label: "Cas d’usage pour le conseil", description: "The prompt needs to mention use-cases of generative AI in consultancy." }],
    };
    const guidance = getAssessmentSubmissionGuidance(block, "fr");

    expect(inferAssessmentSubmissionMode(block, "fr")).toBe("prompt");
    expect(guidance.instruction).toContain("invite exacte");
    expect(guidance.placeholder).not.toMatch(/workflow JSON/i);
  });

  it("asks for both prompts and results when both are visible assessment criteria", () => {
    const block = {
      learnerCriteria: [
        "Une invite demande une analyse structurée.",
        "Le résultat contient un tableau avec les valeurs principales.",
      ],
    };
    const guidance = getAssessmentSubmissionGuidance(block, "fr");

    expect(guidance.mode).toBe("mixed");
    expect(guidance.placeholder).toContain("Invite(s)");
    expect(guidance.placeholder).toContain("Résultat");
  });

  it("honours an explicit source-defined deliverable before inferred guidance", () => {
    const guidance = getAssessmentSubmissionGuidance({
      submissionInstructions: { fr: "Collez uniquement les trois recommandations finales." },
      rubricCriteria: [{ label: "Recommandations" }],
    }, "fr");

    expect(guidance.instruction).toBe("Collez uniquement les trois recommandations finales.");
  });

  it("detects and explains prompt evidence in Arabic", () => {
    const block = { learnerCriteria: [{ label: { ar: "الموجّه المستخدم" }, description: { ar: "يجب أن يوضح الطلب حالة الاستخدام." } }] };
    const guidance = getAssessmentSubmissionGuidance(block, "ar");

    expect(guidance.mode).toBe("prompt");
    expect(guidance.title).toBe("ما الذي يجب تسليمه");
    expect(guidance.instruction).toContain("الموجّه الدقيق");
  });

  it("extracts concise visible requirements instead of exposing a raw legacy rubric", () => {
    const criteria = getVisibleAssessmentCriteria({
      prompt: { fr: "Rédigez une invite avec une **meilleure lisibilité**, le **cas d’usage métier** et du **code Python PEP 8**." },
      rubric: "task: improve code\ncontext: mention pricing\nresponse_format",
    }, "fr");

    expect(criteria).toEqual(["meilleure lisibilité", "cas d’usage métier", "code Python PEP 8"]);
    expect(criteria.join(" ")).not.toContain("response_format");
  });

  it("requires a meaningful textual attempt for tracked AI evaluations", () => {
    expect(resolveAssessmentMinimumLength({}, true)).toBe(40);
    expect(resolveAssessmentMinimumLength({ minimumAnswerLength: 120 }, true)).toBe(120);
    expect(resolveAssessmentMinimumLength({ workflowUploadRequired: true }, true)).toBe(1);
    expect(resolveAssessmentMinimumLength({}, false)).toBe(1);
  });
});
