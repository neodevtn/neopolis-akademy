import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeCourseDataForLearner } from "./courseDataRoute";

const root = path.resolve(import.meta.dirname, "..");
const coursePath = path.join(root, "client/public/data/courses/initiation_automatisation_workflows_n8n__01.json");
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const chapters = course.lessons.flatMap((lesson: any) => lesson.chapters ?? []);
const blocks = chapters.flatMap((chapter: any) => chapter.blocks ?? []);
const practicals = blocks.filter((block: any) => block.serverGradedAssessment === "n8n_foundations_workflow_json");
const retainedPracticalIds = ["ch01_ex04_tp", "ch01_ex05_tp"];
const interactiveTypes = new Set(["exercise", "single_choice_exercise", "multi_choice_exercise", "multi_choice", "matching", "bucket_sort", "fill_blank", "code_repl", "terminal_sim", "ai_evaluation", "ordering", "cloud_exercise", "resource_review"]);

function courseMetrics() {
  const downloadableUrls = new Set<string>();
  let downloadsWithoutUrl = 0;
  for (const block of blocks) {
    const urls = [
      block.url,
      block.downloadUrl,
      block.fileUrl,
      block.slidesPdf,
      ...(Array.isArray(block.resources) ? block.resources.map((resource: any) => resource?.url) : []),
      ...(Array.isArray(block.downloads) ? block.downloads.map((download: any) => download?.url || download) : []),
    ].filter((url): url is string => typeof url === "string" && url.trim().length > 0);
    urls.forEach((url) => downloadableUrls.add(url));
    if ((block.type === "download" || block.type === "file_download") && urls.length === 0) downloadsWithoutUrl += 1;
  }
  return {
    lessonCount: course.lessons.length,
    chapterCount: chapters.length,
    totalActivities: chapters.length,
    exerciseCount: blocks.filter((block: any) => interactiveTypes.has(block.type)).length,
    videoCount: blocks.filter((block: any) => block.type === "video").length,
    downloadCount: downloadableUrls.size + downloadsWithoutUrl,
  };
}

describe("n8n foundations course resource integration", () => {
  it("maintains the published structure and synchronized catalog metrics", () => {
    const certification = index.certifications.find((entry: any) => entry.id === "initiation_automatisation_workflows_n8n");
    const courseIndex = index.courses.find((entry: any) => entry.id === course.courseId);
    const metrics = courseMetrics();

    expect(course.lessons).toHaveLength(3);
    expect(chapters).toHaveLength(18);
    expect(courseIndex).toMatchObject(metrics);
    expect(certification).toMatchObject({
      totalLessons: metrics.lessonCount,
      totalActivities: metrics.totalActivities,
      totalExercises: metrics.exerciseCount,
      totalVideos: metrics.videoCount,
      totalDownloads: metrics.downloadCount,
    });
  });

  it("links only the remaining renderable practices to their managed starter workflows", () => {
    expect(practicals.map((block: any) => block.id).sort()).toEqual(retainedPracticalIds);
    expect(new Set(practicals.map((block: any) => block.resources[0].url)).size).toBe(2);
    for (const practical of practicals) {
      expect(practical.workflowUploadRequired).toBe(true);
      expect(practical.resources).toHaveLength(1);
      expect(practical.resources[0]).toMatchObject({ url: expect.stringMatching(/^\/api\/assets\/n8n-foundations\/starters\//), filename: expect.stringMatching(/\.json$/) });
      expect(practical.resources[0].assetMeta).toMatchObject({ source: "Neopolis media library", sha256: expect.stringMatching(/^[a-f0-9]{64}$/), size: expect.any(Number) });
      expect(practical.steps.length).toBeGreaterThan(0);
      expect(practical.learnerCriteria.length).toBeGreaterThan(0);
      expect(practical.environmentGuide.fr).toContain("votre propre espace n8n");
      expect(practical.environmentGuide.fr).not.toMatch(/Desktop\/Resources|VM formation|préconfigurés/i);
    }
    expect(blocks.filter((block: any) => block.type === "cloud_exercise").map((block: any) => block.id).sort()).toEqual(retainedPracticalIds);
  });

  it("does not expose corrections or outdated source-environment instructions in learner course data", () => {
    const learnerCourse = sanitizeCourseDataForLearner(JSON.stringify(course));
    expect(learnerCourse).not.toMatch(/n8n-foundations\/corrections|Desktop\/Resources|VM formation|identifiants préconfigurés/i);
    const learnerPracticals = JSON.parse(learnerCourse).lessons.flatMap((lesson: any) => lesson.chapters ?? []).flatMap((chapter: any) => chapter.blocks ?? []).filter((block: any) => block.serverGradedAssessment === "n8n_foundations_workflow_json");
    expect(learnerPracticals.map((block: any) => block.id).sort()).toEqual(retainedPracticalIds);
    for (const practical of learnerPracticals) {
      expect(practical).not.toHaveProperty("solution");
      expect(practical).not.toHaveProperty("rubricCriteria");
      expect(practical).not.toHaveProperty("correctionResources");
    }
  });

  it("keeps all points under the Neopolis competency system and removes XP labels", () => {
    expect(JSON.stringify(course)).not.toMatch(/\bXP\b/i);
    expect(JSON.stringify(index.certifications.find((entry: any) => entry.id === "initiation_automatisation_workflows_n8n"))).not.toMatch(/\bXP\b/i);
  });
});
