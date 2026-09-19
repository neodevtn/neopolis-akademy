import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "client/src/components/blocks/AiEvaluationBlock.tsx"), "utf8");

describe("AI evaluation submission guidance contract", () => {
  it("derives guidance from the visible prompt and legacy rubric when structured criteria are absent", () => {
    expect(source).toContain("learnerCriteria: [prompt, rubric].filter(Boolean)");
    expect(source).toContain("<p className=\"font-semibold\">{submissionGuidance.title}</p>");
    expect(source).toContain("placeholder={submissionGuidance.placeholder}");
    expect(source).not.toContain("placeholder={usesTrackedRubric ? submissionGuidance.placeholder");
  });
});
