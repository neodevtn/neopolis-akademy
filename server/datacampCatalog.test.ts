import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import trainingIndex from "../client/src/data/trainingIndex.json";

const agentSkillsCourse = JSON.parse(
  readFileSync(
    new URL("../client/public/data/courses/introduction_to_agent_skills__01.json", import.meta.url),
    "utf8",
  ),
);
const mcpAdvancedCourse = JSON.parse(
  readFileSync(
    new URL("../client/public/data/courses/model_context_protocol_advanced_topics__01.json", import.meta.url),
    "utf8",
  ),
);
const subagentsCourse = JSON.parse(
  readFileSync(
    new URL("../client/public/data/courses/introduction_to_subagents__01.json", import.meta.url),
    "utf8",
  ),
);
const claudeCode101Course = JSON.parse(
  readFileSync(
    new URL("../client/public/data/courses/claude_code_101__01.json", import.meta.url),
    "utf8",
  ),
);
const geminiNotebookLmCourse = JSON.parse(
  readFileSync(
    new URL("../client/public/data/courses/practical_ai_with_google_gemini_and_notebooklm__01.json", import.meta.url),
    "utf8",
  ),
);
const promptEngineeringCourse = JSON.parse(
  readFileSync(
    new URL("../client/public/data/courses/prompt_engineering_with_openai_api__01.json", import.meta.url),
    "utf8",
  ),
);

describe("catalogue DataCamp", () => {
  it("exposes Agent Skills comme un cours navigable avec ses compteurs canoniques", () => {
    const certification = trainingIndex.certifications.find(
      (item) => item.id === "datacamp_introduction_to_agent_skills",
    );
    const course = trainingIndex.courses.find(
      (item) => item.id === "introduction_to_agent_skills__01",
    );

    expect(certification).toMatchObject({
      courseCount: 1,
      totalLessons: 3,
      totalActivities: 18,
      totalVideos: 6,
      courses: ["introduction_to_agent_skills__01"],
    });
    expect(course).toMatchObject({
      certId: "datacamp_introduction_to_agent_skills",
      lessonCount: 3,
      totalActivities: 18,
      videoCount: 6,
    });
  });

  it("prépare l’environnement avant la première vidéo pratique", () => {
    const firstActivity = agentSkillsCourse.lessons[0].chapters[0];
    const preparation = firstActivity.blocks.find(
      (block: { id?: string }) => block.id === "neopolis_agent_skills_environment_preparation",
    );

    expect(preparation).toMatchObject({
      type: "content",
      body: {
        fr: expect.stringContaining("Avant de commencer"),
        en: expect.stringContaining("Before you start"),
      },
    });
    expect(firstActivity.blocks.findIndex((block: { id?: string }) => block.id === preparation.id)).toBe(0);
  });

  it("exposes MCP Advanced Topics comme un cours navigable avec ses compteurs canoniques", () => {
    const certification = trainingIndex.certifications.find(
      (item) => item.id === "datacamp_model_context_protocol_advanced_topics",
    );
    const course = trainingIndex.courses.find(
      (item) => item.id === "model_context_protocol_advanced_topics__01",
    );

    expect(certification).toMatchObject({
      courseCount: 1,
      totalLessons: 2,
      totalActivities: 32,
      totalVideos: 10,
      totalDownloads: 2,
      courses: ["model_context_protocol_advanced_topics__01"],
    });
    expect(course).toMatchObject({
      certId: "datacamp_model_context_protocol_advanced_topics",
      lessonCount: 2,
      totalActivities: 32,
      videoCount: 10,
      downloadCount: 2,
    });
  });

  it("prépare l’environnement avant la première vidéo MCP", () => {
    const firstActivity = mcpAdvancedCourse.lessons[0].chapters[0];
    const preparation = firstActivity.blocks.find(
      (block: { id?: string }) => block.id === "neopolis_mcp_advanced_environment_preparation",
    );

    expect(preparation).toMatchObject({
      type: "content",
      body: {
        fr: expect.stringContaining("Avant de commencer"),
        en: expect.stringContaining("Before you start"),
      },
    });
    expect(firstActivity.blocks.findIndex((block: { id?: string }) => block.id === preparation.id)).toBe(0);
  });

  it("exposes Introduction to Subagents comme un cours navigable avec ses compteurs canoniques", () => {
    const certification = trainingIndex.certifications.find(
      (item) => item.id === "datacamp_introduction_to_subagents",
    );
    const course = trainingIndex.courses.find(
      (item) => item.id === "introduction_to_subagents__01",
    );

    expect(certification).toMatchObject({
      courseCount: 1,
      totalLessons: 2,
      totalActivities: 12,
      totalVideos: 4,
      totalDownloads: 2,
      courses: ["introduction_to_subagents__01"],
    });
    expect(course).toMatchObject({
      certId: "datacamp_introduction_to_subagents",
      lessonCount: 2,
      totalActivities: 12,
      videoCount: 4,
      downloadCount: 2,
    });
  });

  it("prépare l'environnement avant la première vidéo Subagents", () => {
    const firstActivity = subagentsCourse.lessons[0].chapters[0];
    const preparation = firstActivity.blocks.find(
      (block: { id?: string }) => block.id === "neopolis_subagents_environment_preparation",
    );

    expect(preparation).toMatchObject({
      type: "content",
      body: {
        fr: expect.stringContaining("Avant de commencer"),
        en: expect.stringContaining("Before you start"),
      },
    });
    expect(firstActivity.blocks.findIndex((block: { id?: string }) => block.id === preparation.id)).toBe(0);
  });

  it("exposes Claude Code 101 comme un cours navigable avec ses compteurs canoniques", () => {
    const certification = trainingIndex.certifications.find(
      (item) => item.id === "datacamp_claude_code_101",
    );
    const course = trainingIndex.courses.find(
      (item) => item.id === "claude_code_101__01",
    );

    expect(certification).toMatchObject({
      courseCount: 1,
      totalLessons: 4,
      totalActivities: 37,
      totalVideos: 12,
      courses: ["claude_code_101__01"],
    });
    expect(course).toMatchObject({
      certId: "datacamp_claude_code_101",
      lessonCount: 4,
      totalActivities: 37,
      videoCount: 12,
    });
  });

  it("prépare l'environnement avant la première vidéo Claude Code 101", () => {
    const firstActivity = claudeCode101Course.lessons[0].chapters[0];
    const preparation = firstActivity.blocks.find(
      (block: { id?: string }) => block.id === "neopolis_claude_code_101_environment_preparation",
    );

    expect(preparation).toMatchObject({
      type: "content",
      body: {
        fr: expect.stringContaining("Avant de commencer"),
        en: expect.stringContaining("Before you start"),
      },
    });
    expect(firstActivity.blocks.findIndex((block: { id?: string }) => block.id === preparation.id)).toBe(0);
  });

  it("conserve le total canonique de 48 activités Gemini et NotebookLM", () => {
    const certification = trainingIndex.certifications.find(
      (item) => item.id === "datacamp_practical_ai_with_google_gemini_and_notebooklm",
    );
    const course = trainingIndex.courses.find(
      (item) => item.id === "practical_ai_with_google_gemini_and_notebooklm__01",
    );

    expect(certification).toMatchObject({
      courseCount: 1,
      totalLessons: 4,
      totalActivities: 48,
      totalVideos: 15,
      totalDownloads: 4,
    });
    expect(course).toMatchObject({
      certId: "datacamp_practical_ai_with_google_gemini_and_notebooklm",
      lessonCount: 4,
      totalActivities: 48,
      videoCount: 15,
      downloadCount: 4,
    });
  });

  it("prépare l'environnement avant la première vidéo Gemini et NotebookLM", () => {
    const firstActivity = geminiNotebookLmCourse.lessons[0].chapters[0];
    const preparation = firstActivity.blocks.find(
      (block: { id?: string }) => block.id === "neopolis_gemini_notebooklm_environment_preparation",
    );

    expect(preparation).toMatchObject({
      type: "content",
      body: {
        fr: expect.stringContaining("Avant de commencer"),
        en: expect.stringContaining("Before you start"),
      },
    });
    expect(firstActivity.blocks.findIndex((block: { id?: string }) => block.id === preparation.id)).toBe(0);
  });

  it("exposes Prompt Engineering comme un cours navigable avec ses compteurs canoniques", () => {
    const certification = trainingIndex.certifications.find(
      (item) => item.id === "datacamp_prompt_engineering_with_the_openai_api",
    );
    const course = trainingIndex.courses.find(
      (item) => item.id === "prompt_engineering_with_the_openai_api__01",
    );

    expect(certification).toMatchObject({
      courseCount: 1,
      totalLessons: 4,
      totalActivities: 55,
      totalVideos: 15,
      totalDownloads: 4,
      courses: ["prompt_engineering_with_the_openai_api__01"],
    });
    expect(course).toMatchObject({
      certId: "datacamp_prompt_engineering_with_the_openai_api",
      lessonCount: 4,
      totalActivities: 55,
      videoCount: 15,
      downloadCount: 4,
    });
  });

  it("prépare l'environnement avant la première vidéo Prompt Engineering", () => {
    const firstActivity = promptEngineeringCourse.lessons[0].chapters[0];
    const preparation = firstActivity.blocks.find(
      (block: { id?: string }) => block.id === "neopolis_prompt_engineering_openai_environment_preparation",
    );

    expect(preparation).toMatchObject({
      type: "content",
      body: {
        fr: expect.stringContaining("Avant de commencer"),
        en: expect.stringContaining("Before you start"),
      },
    });
    expect(firstActivity.blocks.findIndex((block: { id?: string }) => block.id === preparation.id)).toBe(0);
  });
});
