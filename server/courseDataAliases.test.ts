import { describe, expect, it } from "vitest";
import { getCourseFileCandidates } from "../client/src/hooks/useCourseData";

describe("getCourseFileCandidates", () => {
  it("preserves the canonical Prompt Engineering identifier while retrying its historical public filename", () => {
    expect(getCourseFileCandidates("prompt_engineering_with_the_openai_api__01")).toEqual([
      "prompt_engineering_with_the_openai_api__01",
      "prompt_engineering_with_openai_api__01",
    ]);
  });

  it("does not add a fallback for canonical course IDs without a renamed file", () => {
    expect(getCourseFileCandidates("introduction_to_agent_skills__01")).toEqual([
      "introduction_to_agent_skills__01",
    ]);
  });
});
