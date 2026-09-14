import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/TrainingCourse.tsx"), "utf8");

describe("persistance de chapitre pour les cours multi-leçons", () => {
  it("persiste le chapitre validé avec le véritable index de leçon, sans dépendre du cas mono-leçon", () => {
    const multiLessonCallback = source.slice(
      source.indexOf("if (isSingleLessonCourse)"),
      source.indexOf("onViewingChapterChange={handleViewingChapterChange}"),
    );

    expect(multiLessonCallback).toContain("persistChapterProgress(courseId, displayedIndex, current, total)");
    expect(multiLessonCallback).toContain("setChapterProgressLessonIndex(displayedIndex)");
  });

  it("ne transforme pas une URL sans paramètre de chapitre en écran zéro, afin de préserver la reprise persistée", () => {
    expect(source).toContain('if (chapterParam !== null && Number.isInteger(chapter) && chapter >= 0)');
    expect(source).toContain('if (lessonParam !== null && Number.isInteger(lesson) && lesson >= 0)');
  });
});
