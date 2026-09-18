import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const courseDir = path.join(root, "client/public/data/courses");
const index = JSON.parse(fs.readFileSync(path.join(root, "client/src/data/trainingIndex.json"), "utf8"));

function loadCourse(courseId: string) {
  return JSON.parse(fs.readFileSync(path.join(courseDir, `${courseId}.json`), "utf8"));
}

function blocks(course: any) {
  return (course.lessons || []).flatMap((lesson: any) => lesson.chapters || []).flatMap((chapter: any) => chapter.blocks || []);
}

function interactiveCount(course: any) {
  const types = new Set(["cloud_exercise", "bucket_sort", "single_choice_exercise", "multi_choice_exercise", "matching", "matching_exercise", "code_repl", "free_text_exercise", "fill_blank", "ordering", "terminal_sim", "ai_evaluation", "resource_review", "exercise", "quiz", "checkpoint"]);
  return blocks(course).filter((block: any) => types.has(block.type)).length;
}

function assertCatalogCounts(courseId: string, certificationId: string) {
  const course = loadCourse(courseId);
  const entry = index.courses.find((item: any) => item.id === courseId);
  const certification = index.certifications.find((item: any) => item.id === certificationId);
  const chapters = (course.lessons || []).flatMap((lesson: any) => lesson.chapters || []);
  const publishedBlocks = blocks(course);

  expect(entry).toBeTruthy();
  expect(certification).toBeTruthy();
  expect(entry.lessonCount).toBe(course.lessons.length);
  expect(entry.chapterCount).toBe(chapters.length);
  expect(entry.totalActivities).toBe(chapters.length);
  expect(entry.exerciseCount).toBe(interactiveCount(course));
  expect(entry.videoCount).toBe(publishedBlocks.filter((block: any) => block.type === "video").length);
  expect(entry.downloadCount).toBe(publishedBlocks.filter((block: any) => block.type === "download").length);
  const programmeEntries = index.courses.filter((item: any) => item.certId === certificationId);
  expect(certification.totalLessons).toBe(programmeEntries.reduce((total: number, item: any) => total + (item.lessonCount || 0), 0));
  expect(certification.totalActivities).toBe(programmeEntries.reduce((total: number, item: any) => total + (item.totalActivities || 0), 0));
  expect(certification.totalExercises).toBe(programmeEntries.reduce((total: number, item: any) => total + (item.exerciseCount || 0), 0));
  expect(certification.totalVideos).toBe(programmeEntries.reduce((total: number, item: any) => total + (item.videoCount || 0), 0));
  expect(certification.totalDownloads).toBe(programmeEntries.reduce((total: number, item: any) => total + (item.downloadCount || 0), 0));
}

describe("short blocking course remediation", () => {
  it("removes the consulting category sort that has no authorized category source", () => {
    const course = loadCourse("ai_for_consulting__01");
    const raw = JSON.stringify(course);
    expect(raw).not.toContain("dc_2_act_12_bucket_sort");
    expect(course.lessons.flatMap((lesson: any) => lesson.chapters || []).some((chapter: any) => chapter.id === "dc_ch02_act12")).toBe(false);
    assertCatalogCounts("ai_for_consulting__01", "datacamp_ai_for_consulting");
  });

  it("removes PowerPoint practices that require the absent SolarHome deck", () => {
    const course = loadCourse("microsoft_copilot_in_powerpoint__01");
    const raw = JSON.stringify(course);
    expect(raw).not.toMatch(/SolarHome_[A-Za-z]+\.(?:pptx|docx|xlsx)/i);
    expect(course.lessons.flatMap((lesson: any) => lesson.chapters || []).map((chapter: any) => chapter.id)).not.toEqual(expect.arrayContaining(["dc_ch02_act02", "dc_ch02_act05", "dc_ch03_act02", "dc_ch03_act03", "dc_ch03_act05", "dc_ch03_act06"]));
    assertCatalogCounts("microsoft_copilot_in_powerpoint__01", "datacamp_microsoft_copilot_in_powerpoint");
  });

  it("removes the AI-assisted coding sort with no authorized category source", () => {
    const course = loadCourse("ai_assisted_coding_for_developers__01");
    expect(JSON.stringify(course)).not.toContain("dc_3_act_06_bucket_sort");
    expect(course.lessons.flatMap((lesson: any) => lesson.chapters || []).some((chapter: any) => chapter.id === "dc_ch03_act06")).toBe(false);
    assertCatalogCounts("ai_assisted_coding_for_developers__01", "datacamp_ai_assisted_coding_for_developers");
  });

  it("removes the Claude Code video that has neither source nor transcript", () => {
    const course = loadCourse("software_development_with_claude_code__01");
    expect(JSON.stringify(course)).not.toContain("dc_2_act_10_video");
    expect(course.lessons.flatMap((lesson: any) => lesson.chapters || []).some((chapter: any) => chapter.id === "dc_ch02_act10")).toBe(false);
    assertCatalogCounts("software_development_with_claude_code__01", "datacamp_software_development_with_claude_code");
  });

  it("removes the unsupported Windsurf sort and malformed source links", () => {
    const course = loadCourse("software_development_with_windsurf__01");
    const raw = JSON.stringify(course);
    expect(raw).not.toContain("dc_3_act_06_bucket_sort");
    expect(raw).not.toMatch(/https:\/\/www\.neopolis akademy\.com/i);
    expect(course.lessons.flatMap((lesson: any) => lesson.chapters || []).some((chapter: any) => chapter.id === "dc_ch03_act06")).toBe(false);
    assertCatalogCounts("software_development_with_windsurf__01", "datacamp_software_development_with_windsurf");
  });

  it("removes the Claude 101 sort whose category source is unavailable", () => {
    const course = loadCourse("claude_101__01");
    expect(JSON.stringify(course)).not.toContain("dc_2_act_03_bucket_sort");
    expect(course.lessons.flatMap((lesson: any) => lesson.chapters || []).some((chapter: any) => chapter.id === "dc_ch02_act03")).toBe(false);
    assertCatalogCounts("claude_101__01", "datacamp_claude_101");
  });

  it("removes marketing workflow practicals whose authorized starters are unavailable", () => {
    const course = loadCourse("building_marketing_workflows_with_n8n__01");
    const raw = JSON.stringify(course);
    expect(course.lessons.flatMap((lesson: any) => lesson.chapters || []).flatMap((chapter: any) => chapter.blocks || []).some((block: any) => block.type === "cloud_exercise")).toBe(false);
    expect(raw).not.toMatch(/Desktop\s*(?:→|>)\s*Resources|Import from File|Marketing Multi-Agent System_\d+\.json|Conversion Rate Optimizer_\d+\.json|Lead Scraper_\d+\.json/i);
    assertCatalogCounts("building_marketing_workflows_with_n8n__01", "datacamp_building_marketing_workflows_with_n8n");
  });

  it("removes only the HR category sorts that lack authorized source categories", () => {
    const course = loadCourse("ai_for_human_resources__01");
    const raw = JSON.stringify(course);
    expect(raw).not.toMatch(/dc_1_act_03_bucket_sort|dc_2_act_12_bucket_sort/);
    assertCatalogCounts("ai_for_human_resources__01", "datacamp_ai_for_human_resources");
  });

  it("removes only the Vibe coding category sorts that lack authorized source categories", () => {
    const course = loadCourse("vibe_coding_with_replit__01");
    const raw = JSON.stringify(course);
    expect(raw).not.toMatch(/dc_1_act_05_bucket_sort|dc_1_act_10_bucket_sort/);
    assertCatalogCounts("vibe_coding_with_replit__01", "datacamp_vibe_coding_with_replit");
  });

  it("removes DATAS module one checkpoints whose prompts cannot be traced to an authorized source", () => {
    const course = loadCourse("transformation_processus_ia__01");
    const raw = JSON.stringify(course);
    expect(raw).not.toMatch(/ex_transformation_processus_ia__01_00[1-4]/);
    assertCatalogCounts("transformation_processus_ia__01", "transformation_processus_ia");
  });

  it("removes DATAS module four checkpoints whose prompts cannot be traced to an authorized source", () => {
    const course = loadCourse("transformation_processus_ia__04");
    const raw = JSON.stringify(course);
    expect(raw).not.toMatch(/ex_transformation_processus_ia__04_00[1-2]/);
    assertCatalogCounts("transformation_processus_ia__04", "transformation_processus_ia");
  });

  it("removes the Associate Foundations checkpoint whose promised prompt data are absent", () => {
    const course = loadCourse("claude_certified_associate_foundations__02");
    const raw = JSON.stringify(course);
    expect(raw).not.toContain("ex_claude_certified_associate_foundations__02_008");
    assertCatalogCounts("claude_certified_associate_foundations__02", "claude_certified_associate_foundations");
  });

  it("removes MCP practicals that require the confirmed-missing Frankfurter endpoint", () => {
    const course = loadCourse("introduction_to_model_context_protocol_mcp__01");
    const raw = JSON.stringify(course);
    expect(raw).not.toMatch(/dc_1_act_03_tp|dc_1_act_06_tp|dc_3_act_06_tp|dc_3_act_07_tp|frankfurter\.dev\/v1\/latest/i);
    assertCatalogCounts("introduction_to_model_context_protocol_mcp__01", "datacamp_introduction_to_model_context_protocol_mcp");
  });

  it("removes the AI-systems function-call sort whose categories cannot be sourced", () => {
    const course = loadCourse("developing_ai_systems_with_the_openai_api__01");
    expect(JSON.stringify(course)).not.toContain("dc_2_act_03_bucket_sort");
    assertCatalogCounts("developing_ai_systems_with_the_openai_api__01", "datacamp_developing_ai_systems_with_the_openai_api");
  });

  it("makes the published source objective visible as criteria for remaining MCP practicals", () => {
    const course = loadCourse("introduction_to_model_context_protocol_mcp__01");
    const practicals = course.lessons.flatMap((lesson: any) => lesson.chapters || []).flatMap((chapter: any) => chapter.blocks || []).filter((block: any) => block.type === "cloud_exercise");
    expect(practicals.length).toBeGreaterThan(0);
    expect(practicals.every((block: any) => Array.isArray(block.learnerCriteria) && block.learnerCriteria.length > 0)).toBe(true);
  });

  it("makes the published source objective visible as criteria for Responses API practicals", () => {
    const course = loadCourse("working_with_the_openai_responses_api__01");
    const practicals = course.lessons.flatMap((lesson: any) => lesson.chapters || []).flatMap((chapter: any) => chapter.blocks || []).filter((block: any) => block.type === "cloud_exercise");
    expect(practicals.length).toBeGreaterThan(0);
    expect(practicals.every((block: any) => Array.isArray(block.learnerCriteria) && block.learnerCriteria.length > 0)).toBe(true);
    assertCatalogCounts("working_with_the_openai_responses_api__01", "datacamp_working_with_the_openai_responses_api");
  });
});
