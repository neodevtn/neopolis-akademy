import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const viewer = readFileSync(resolve(root, "client/src/pages/training/LessonViewer.tsx"), "utf8");
const screenshotBlock = readFileSync(resolve(root, "client/src/components/blocks/AnnotatedScreenshotBlock.tsx"), "utf8");
const quizBlock = readFileSync(resolve(root, "client/src/components/blocks/ModuleQuizBlock.tsx"), "utf8");
const videoPlayer = readFileSync(resolve(root, "client/src/components/YouTubePlayer.tsx"), "utf8");
const registry = readFileSync(resolve(root, "shared/blockRegistry.ts"), "utf8");

describe("reusable Claude Science learning blocks", () => {
  it("registers generic attributed screenshots and server-graded module quizzes", () => {
    expect(registry).toContain('type: "annotated_screenshot"');
    expect(registry).toContain('type: "module_quiz"');
    expect(viewer).toContain('case "annotated_screenshot"');
    expect(viewer).toContain('case "module_quiz"');
    expect(screenshotBlock).toContain("sourceRefs");
    expect(screenshotBlock).toContain("alt={alt}");
  });

  it("keeps module quiz answers server-only until the learner submits all eight", () => {
    expect(quizBlock).toContain("trpc.training.getModuleQuiz.useQuery");
    expect(quizBlock).toContain("trpc.training.submitModuleQuiz.useMutation");
    expect(quizBlock).toContain("answers: questions.map");
    expect(quizBlock).toContain("!allAnswered");
    expect(quizBlock).toContain("submission ?");
    expect(quizBlock).not.toContain("correctAnswer");
  });

  it("gates module continuation and adds objective, duration and French text alternative to videos", () => {
    expect(viewer).toContain("completedModuleQuizzes");
    expect(viewer).toContain("isGatedByCurrentModuleQuiz");
    expect(viewer).toContain("completeModuleLab.mutateAsync");
    expect(videoPlayer).toContain("objectiveBefore");
    expect(videoPlayer).toContain("questionsAfter");
    expect(videoPlayer).toContain("alternativeTextFr");
    expect(videoPlayer).toContain("durationLabel");
  });
});
