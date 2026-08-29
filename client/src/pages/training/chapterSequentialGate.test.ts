import { describe, expect, it } from "vitest";
import { isSequentialActivityNavigationLocked } from "./chapterProgress";

const empty = () => new Set<string>();

describe("verrouillage séquentiel de la navigation compacte", () => {
  it("bloque une ressource, un checkpoint, un TP, un quiz et un tri non complétés", () => {
    const cases = [
      { block: { type: "resource_review", id: "resource" }, completed: { exercises: empty(), cloud: empty(), matching: empty(), inline: empty() } },
      { block: { type: "checkpoint", id: "checkpoint" }, completed: { exercises: empty(), cloud: empty(), matching: empty(), inline: empty() } },
      { block: { type: "cloud_exercise", id: "proof" }, completed: { exercises: empty(), cloud: empty(), matching: empty(), inline: empty() } },
      { block: { type: "single_choice_exercise", id: "quiz" }, completed: { exercises: empty(), cloud: empty(), matching: empty(), inline: empty() } },
      { block: { type: "bucket_sort", id: "sort" }, completed: { exercises: empty(), cloud: empty(), matching: empty(), inline: empty() } },
      { block: { type: "knowledge_check", id: "knowledge" }, completed: { exercises: empty(), cloud: empty(), matching: empty(), inline: empty() } },
    ];
    cases.forEach(({ block, completed }) => expect(isSequentialActivityNavigationLocked({ blocks: [block], reviewMode: false, completedExercises: completed.exercises, completedCloudExercises: completed.cloud, completedMatching: completed.matching, completedInlineInteractions: completed.inline })).toBe(true));
  });

  it("débloque uniquement lorsque l’activité est validée, tout en gardant la révision navigable", () => {
    expect(isSequentialActivityNavigationLocked({ blocks: [{ type: "resource_review", id: "resource" }], completedExercises: new Set(["resource"]), completedCloudExercises: empty(), completedMatching: empty(), completedInlineInteractions: empty() })).toBe(false);
    expect(isSequentialActivityNavigationLocked({ blocks: [{ type: "cloud_exercise", id: "proof" }], completedExercises: empty(), completedCloudExercises: empty(), completedMatching: empty(), completedInlineInteractions: empty(), reviewMode: true })).toBe(false);
  });
});
