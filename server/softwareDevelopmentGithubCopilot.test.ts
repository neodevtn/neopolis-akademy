import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import course from "../client/public/data/courses/software_development_with_github_copilot__01.json";
import catalog from "../client/src/data/trainingIndex.json";

const courseId = "software_development_with_github_copilot__01";
const interactiveTypes = new Set(["single_choice_exercise", "multi_choice_exercise", "bucket_sort", "matching", "ordering"]);
const isLocalAsset = (value: unknown) => typeof value === "string" && value.startsWith("/api/assets/");

function metrics(payload: any) {
  const chapters = payload.lessons.flatMap((lesson: any) => lesson.chapters || []);
  const blocks = chapters.flatMap((chapter: any) => chapter.blocks || []);
  const downloadUrls = new Set(blocks.flatMap((block: any) => [block.url, block.downloadUrl, block.fileUrl, block.slidesPdf]
    .filter((url): url is string => typeof url === "string" && url.trim().length > 0)));
  return {
    lessonCount: payload.lessons.length,
    totalActivities: chapters.length,
    videoCount: blocks.filter((block: any) => block.type === "video").length,
    exerciseCount: blocks.filter((block: any) => interactiveTypes.has(block.type)).length,
    downloadCount: downloadUrls.size,
  };
}

function hasVerifier(block: any) {
  if (block.type === "single_choice_exercise") {
    return Array.isArray(block.options) && block.options.some((option: any) => option.id === block.correctAnswer);
  }
  if (block.type === "multi_choice_exercise") {
    const expected = String(block.correctAnswers || "").split(",").filter(Boolean);
    return expected.length > 0 && Array.isArray(block.options) && expected.every((id) => block.options.some((option: any) => option.id === id));
  }
  if (block.type === "bucket_sort") return Array.isArray(block.buckets) && block.buckets.length > 0 && Array.isArray(block.cards) && block.cards.every((card: any) => block.buckets.some((bucket: any) => bucket.id === card.correctBucket));
  if (block.type === "matching") return Array.isArray(block.pairs) && block.pairs.length > 0;
  if (block.type === "ordering") return Array.isArray(block.items) && block.items.length > 0;
  return false;
}

describe("cours DataCamp Développement logiciel avec GitHub Copilot", () => {
  const activities = course.lessons.flatMap((lesson: any) => lesson.chapters || []);
  const blocks = activities.flatMap((activity: any) => activity.blocks || []);

  it("synchronise catalogue et rattachement avec les métriques dérivées du JSON publié", () => {
    const certification = catalog.certifications.find((entry: any) => entry.id === "datacamp_software_development_with_github_copilot");
    const courseIndex = catalog.courses.find((entry: any) => entry.id === courseId);
    const derived = metrics(course);
    expect(courseIndex).toMatchObject({ id: courseId, certId: certification?.id, ...derived });
    expect(certification).toBeTruthy();
    const certificationMetrics = certification!.courses.map((id: string) => metrics(JSON.parse(readFileSync(
      new URL(`../client/public/data/courses/${id}.json`, import.meta.url), "utf8",
    )))).reduce((total: any, current: any) => ({
      lessonCount: total.lessonCount + current.lessonCount,
      totalActivities: total.totalActivities + current.totalActivities,
      videoCount: total.videoCount + current.videoCount,
      exerciseCount: total.exerciseCount + current.exerciseCount,
      downloadCount: total.downloadCount + current.downloadCount,
    }), { lessonCount: 0, totalActivities: 0, videoCount: 0, exerciseCount: 0, downloadCount: 0 });
    expect(certification).toMatchObject({
      courseCount: certification!.courses.length,
      totalLessons: certificationMetrics.lessonCount,
      totalActivities: certificationMetrics.totalActivities,
      totalVideos: certificationMetrics.videoCount,
      totalExercises: certificationMetrics.exerciseCount,
      totalDownloads: certificationMetrics.downloadCount,
    });
  });

  it("conserve les médias Projector locaux et des interactions dont la correction est vérifiable", () => {
    const projectorVideos = blocks.filter((block: any) => block.type === "video" && block.projectorSlides?.length);
    const expectedVideos = course.datacampImport?.expected?.videos_extracted;
    expect(expectedVideos).toBeGreaterThan(0);
    expect(projectorVideos).toHaveLength(expectedVideos);
    expect(projectorVideos.every((block: any) => block.projectorTimings?.length && block.transcriptSegments?.length && (isLocalAsset(block.mp4Url) || isLocalAsset(block.audioUrl)) && isLocalAsset(block.slidesPdf))).toBe(true);
    const interactiveActivities = activities.filter((activity: any) => activity.sourceActivityType && activity.sourceActivityType !== "VideoExercise");
    expect(interactiveActivities.length).toBeGreaterThan(0);
    expect(interactiveActivities.every((activity: any) => activity.blocks.some(hasVerifier))).toBe(true);
  });

  it("ne laisse aucun chapitre vide ou verrou obligatoire sans contenu complétable", () => {
    expect(activities.every((activity: any) => Array.isArray(activity.blocks) && activity.blocks.length > 0)).toBe(true);
    const required = activities.filter((activity: any) => activity.requiredBeforeAdvance);
    expect(required.length).toBeGreaterThan(0);
    expect(required.every((activity: any) => activity.blocks.some((block: any) =>
      hasVerifier(block) || (block.type === "video" && (isLocalAsset(block.mp4Url) || isLocalAsset(block.audioUrl))) || (block.type === "content" && Boolean(block.body)),
    ))).toBe(true);
  });

  it("ne publie aucun lien source DataCamp ni chemin de stockage direct", () => {
    const serialized = JSON.stringify(course);
    expect(serialized).not.toMatch(/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i);
    expect(serialized).not.toContain("/manus-storage/");
  });
});
