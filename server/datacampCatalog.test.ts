import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import trainingIndex from "../client/src/data/trainingIndex.json";

const interactiveBlockTypes = new Set([
  "exercise", "single_choice_exercise", "multi_choice_exercise", "multi_choice", "matching",
  "bucket_sort", "fill_blank", "code_repl", "terminal_sim", "ai_evaluation", "ordering",
  "cloud_exercise", "resource_review",
]);

const readCourse = (courseId: string) => JSON.parse(readFileSync(
  new URL(`../client/public/data/courses/${courseId}.json`, import.meta.url),
  "utf8",
));

function derivedMetrics(course: any) {
  const chapters = course.lessons.flatMap((lesson: any) => lesson.chapters || []);
  const blocks = chapters.flatMap((chapter: any) => chapter.blocks || []);
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
    if (["download", "file_download"].includes(block.type) && urls.length === 0) downloadsWithoutUrl += 1;
  }

  return {
    lessonCount: course.lessons.length,
    totalActivities: chapters.length,
    videoCount: blocks.filter((block: any) => block.type === "video").length,
    exerciseCount: blocks.filter((block: any) => interactiveBlockTypes.has(block.type)).length,
    downloadCount: downloadableUrls.size + downloadsWithoutUrl,
  };
}

function expectCatalogMetrics(certificationId: string, courseId: string) {
  const certification = trainingIndex.certifications.find((item: any) => item.id === certificationId);
  const courseIndex = trainingIndex.courses.find((item: any) => item.id === courseId);
  expect(certification).toBeTruthy();
  expect(courseIndex).toBeTruthy();

  const metrics = derivedMetrics(readCourse(courseId));
  const certificationMetrics = certification!.courses.map((id: string) => derivedMetrics(readCourse(id))).reduce(
    (total: any, current: any) => ({
      lessonCount: total.lessonCount + current.lessonCount,
      totalActivities: total.totalActivities + current.totalActivities,
      videoCount: total.videoCount + current.videoCount,
      exerciseCount: total.exerciseCount + current.exerciseCount,
      downloadCount: total.downloadCount + current.downloadCount,
    }),
    { lessonCount: 0, totalActivities: 0, videoCount: 0, exerciseCount: 0, downloadCount: 0 },
  );

  expect(courseIndex).toMatchObject({ id: courseId, certId: certificationId, ...metrics });
  expect(certification).toMatchObject({
    courseCount: certification!.courses.length,
    totalLessons: certificationMetrics.lessonCount,
    totalActivities: certificationMetrics.totalActivities,
    totalVideos: certificationMetrics.videoCount,
    totalExercises: certificationMetrics.exerciseCount,
    totalDownloads: certificationMetrics.downloadCount,
  });
  expect(certification!.courses).toContain(courseId);
}

const agentSkillsCourse = readCourse("introduction_to_agent_skills__01");
const mcpAdvancedCourse = readCourse("model_context_protocol_advanced_topics__01");
const subagentsCourse = readCourse("introduction_to_subagents__01");
const claudeCode101Course = readCourse("claude_code_101__01");
const geminiNotebookLmCourse = readCourse("practical_ai_with_google_gemini_and_notebooklm__01");
const promptEngineeringCourse = readCourse("prompt_engineering_with_the_openai_api__01");
const n8nIntroductionCourse = readCourse("initiation_automatisation_workflows_n8n__01");

describe("catalogue DataCamp", () => {
  for (const [label, certificationId, courseId] of [
    ["Agent Skills", "datacamp_introduction_to_agent_skills", "introduction_to_agent_skills__01"],
    ["MCP Advanced Topics", "datacamp_model_context_protocol_advanced_topics", "model_context_protocol_advanced_topics__01"],
    ["Introduction to Subagents", "datacamp_introduction_to_subagents", "introduction_to_subagents__01"],
    ["Claude Code 101", "datacamp_claude_code_101", "claude_code_101__01"],
    ["Gemini and NotebookLM", "datacamp_practical_ai_with_google_gemini_and_notebooklm", "practical_ai_with_google_gemini_and_notebooklm__01"],
    ["Prompt Engineering", "datacamp_prompt_engineering_with_the_openai_api", "prompt_engineering_with_the_openai_api__01"],
    ["l’introduction n8n", "initiation_automatisation_workflows_n8n", "initiation_automatisation_workflows_n8n__01"],
  ] as const) {
    it(`synchronise ${label} avec les métriques dérivées du cours livré`, () => {
      expectCatalogMetrics(certificationId, courseId);
    });
  }

  for (const [label, course, preparationId] of [
    ["Agent Skills", agentSkillsCourse, "neopolis_agent_skills_environment_preparation"],
    ["MCP", mcpAdvancedCourse, "neopolis_mcp_advanced_environment_preparation"],
    ["Subagents", subagentsCourse, "neopolis_subagents_environment_preparation"],
    ["Claude Code 101", claudeCode101Course, "neopolis_claude_code_101_environment_preparation"],
    ["Gemini et NotebookLM", geminiNotebookLmCourse, "neopolis_gemini_notebooklm_environment_preparation"],
    ["Prompt Engineering", promptEngineeringCourse, "neopolis_prompt_engineering_openai_environment_preparation"],
    ["n8n", n8nIntroductionCourse, "neopolis_n8n_environment_preparation"],
  ] as const) {
    it(`prépare l’environnement avant la première vidéo ${label}`, () => {
      const firstActivity = course.lessons[0].chapters[0];
      const preparation = firstActivity.blocks.find((block: { id?: string }) => block.id === preparationId);
      expect(preparation).toMatchObject({
        type: "content",
        body: {
          fr: expect.stringContaining("Avant de commencer"),
          en: expect.stringContaining("Before you start"),
        },
      });
      expect(firstActivity.blocks.findIndex((block: { id?: string }) => block.id === preparation?.id)).toBe(0);
    });
  }

  it("conserve des options, une réponse correcte et un feedback pour le QCM n8n Acme", () => {
    const quiz = n8nIntroductionCourse.lessons
      .flatMap((lesson: { chapters: unknown[] }) => lesson.chapters)
      .flatMap((chapter: { blocks: unknown[] }) => chapter.blocks)
      .find((block: { id?: string }) => block.id === "ch03_ex09_mcq");

    expect(quiz).toMatchObject({ type: "single_choice_exercise", correctAnswer: "a" });
    expect(quiz.options).toHaveLength(4);
    expect(quiz.options.find((option: { id: string }) => option.id === quiz.correctAnswer)).toBeDefined();
    expect(quiz.feedbacks).toHaveLength(4);
  });
});
