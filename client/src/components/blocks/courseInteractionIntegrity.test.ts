import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildUniqueMatchingTargets } from "./MatchingBlock";
import {
  currentScopedCompletions,
  isScopedInteractionComplete,
  requiredFlipCardCompletionKeys,
  scopedInteractionKey,
} from "../../pages/training/interactionCompletion";

const lessonViewerSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/training/LessonViewer.tsx"),
  "utf8",
);

function runStrictAuditFixture(fixture: unknown): string {
  const directory = mkdtempSync(join(tmpdir(), "neopolis-interaction-audit-"));
  const filename = join(directory, "fixture.json");
  writeFileSync(filename, `${JSON.stringify(fixture)}\n`, "utf8");
  try {
    execFileSync(
      process.execPath,
      ["scripts/audit-course-interactions.mjs", "--strict", `--fixture=${filename}`],
      { cwd: process.cwd(), stdio: "pipe" },
    );
    return "";
  } catch (error: any) {
    return `${error?.stdout || ""}${error?.stderr || ""}`;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe("course interaction integrity", () => {
  it("renders one reusable target when several matching prompts share the same answer label", () => {
    const targets = buildUniqueMatchingTargets(
      [
        { right: "Deploy" },
        { right: " deploy  " },
        { right: "Monitor" },
      ],
      () => 0.5,
    );

    expect(targets).toHaveLength(2);
    expect(targets.map((target) => target.key).sort()).toEqual(["deploy", "monitor"]);
  });

  it("isolates local completion by lesson and chapter while preserving explicit server IDs", () => {
    const completed = new Set([
      scopedInteractionKey(0, 0, "shared-id"),
      "server-restored-id",
    ]);

    expect(isScopedInteractionComplete(completed, 0, 0, "shared-id")).toBe(true);
    expect(isScopedInteractionComplete(completed, 1, 0, "shared-id")).toBe(false);
    expect(isScopedInteractionComplete(completed, 0, 1, "shared-id")).toBe(false);
    expect(isScopedInteractionComplete(completed, 4, 3, "server-restored-id")).toBe(false);
    expect(isScopedInteractionComplete(completed, 4, 3, "server-restored-id", { allowUnscopedServerId: true })).toBe(true);
    expect([...currentScopedCompletions(completed, 0, 0)]).toEqual(["shared-id"]);
    expect([...currentScopedCompletions(completed, 1, 0)]).toEqual([]);
    expect([...currentScopedCompletions(completed, 1, 0, { includeUnscopedServerIds: true })]).toEqual(["server-restored-id"]);
  });

  it("assigns a distinct required key to every flip-card block in each lesson", () => {
    const blocks = [
      { type: "flip_cards", cards: [{ front: "A", back: "B" }] },
      { type: "content" },
      { type: "flip_cards", id: "review", cards: [{ front: "C", back: "D" }] },
    ];

    expect(requiredFlipCardCompletionKeys(blocks, 2, 4)).toEqual([
      "2:4:flip_cards_0",
      "2:4:review",
    ]);
    expect(requiredFlipCardCompletionKeys(blocks, 3, 4)).not.toEqual(
      requiredFlipCardCompletionKeys(blocks, 2, 4),
    );
  });

  it("uses lesson-scoped completion writes in the learner renderer", () => {
    expect(lessonViewerSource).toContain("scopedInteractionKey(lessonIndex, currentChapter, id)");
    expect(lessonViewerSource).toContain("scopedInteractionKey(lessonIndex, currentChapter, matchingId)");
    expect(lessonViewerSource).toContain("requiredFlipCardCompletionKeys(chapter?.blocks || [], lessonIndex, currentChapter)");
    expect(lessonViewerSource).not.toContain("chapterInteractionKey(");
  });

  it("rejects matching activities with blank targets", () => {
    const output = runStrictAuditFixture({
      type: "matching",
      pairs: [
        { left: { en: "Build", fr: "Construire" }, right: { en: "", fr: "" } },
        { left: { en: "Deploy", fr: "Déployer" }, right: { en: "Operate", fr: "Exploiter" } },
      ],
    });

    expect(output).toContain("matching_missing_right_en");
    expect(output).toContain("matching_missing_right_fr");
  });

  it("rejects client-graded questions without a correct answer", () => {
    const output = runStrictAuditFixture({
      type: "single_choice_exercise",
      question: { en: "Choose", fr: "Choisissez" },
      options: [
        { id: "a", text: { en: "First", fr: "Premier" } },
        { id: "b", text: { en: "Second", fr: "Deuxième" } },
      ],
    });

    expect(output).toContain("question_missing_correct_answer");
  });

  it("passes the strict catalogue-wide question, flip-card, and mini-exercise audit", () => {
    expect(() => execFileSync(
      process.execPath,
      ["scripts/audit-course-interactions.mjs", "--strict"],
      { cwd: process.cwd(), stdio: "pipe" },
    )).not.toThrow();
  }, 30_000);
});
