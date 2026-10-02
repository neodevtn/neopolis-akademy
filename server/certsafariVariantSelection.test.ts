import { describe, expect, it } from "vitest";
import { normalizeExamConfiguration } from "../shared/examConfiguration";
import { selectExamQuestions, type ExamQuestion } from "./examDefinition";

const configuration = normalizeExamConfiguration({
  examCode: "CCDV-F",
  totalQuestions: 2,
  timeLimit: 120,
  passingScore: 720,
  shuffleQuestions: true,
  shuffleChoices: false,
  isPublished: true,
  domains: [],
}, 3);
const make = (id: string, stem: string, correctChoiceIds: string[]): ExamQuestion => ({
  id, certificationId: "claude_certified_developer_foundations",
  question: { en: stem, fr: stem },
  choices: [{ id: "a", text: "A" }, { id: "b", text: "B" }, { id: "c", text: "C" }, { id: "d", text: "D" }],
  correctChoiceIds,
});

describe("éditions CertSafari partageant un énoncé", () => {
  it("présente un seul énoncé par tentative et peut tirer chacune des deux variantes", () => {
    const variants = [
      make("vendor-1", "Which rollback policy minimizes business disruption?", ["a"]),
      make("vendor-2", "Which rollback policy minimizes business disruption?", ["c"]),
      make("vendor-3", "How should an architect validate the release?", ["b"]),
    ];
    const seen = new Set<string>();
    for (let attempt = 0; attempt < 100; attempt++) {
      const selected = selectExamQuestions(variants, configuration);
      expect(selected).toHaveLength(2);
      expect(new Set(selected.map((question) => (question.question as { en: string }).en)).size).toBe(2);
      seen.add(selected.find((question) => question.id !== "vendor-3")!.id);
    }
    expect(seen).toEqual(new Set(["vendor-1", "vendor-2"]));
  });
});
