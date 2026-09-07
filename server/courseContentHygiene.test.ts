import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const courseDir = path.join(root, "client/public/data/courses");

const localEnvironmentCourses = [
  "building_agentic_workflows_with_llamaindex__01.json",
  "building_ai_agents_with_crewai__01.json",
  "building_ai_agents_with_haystack__01.json",
  "end_to_end_rag_with_weaviate__01.json",
  "multi_agent_systems_with_langgraph__01.json",
  "text_to_query_agents_with_mongodb_and_langgraph__01.json",
  "working_with_the_openai_api__01.json",
];

const competencyPointsCourses = [
  "building_marketing_workflows_with_n8n__01.json",
  "intermediate_workflow_automation_with_n8n__01.json",
  "prompt_engineering_with_the_openai_api__01.json",
];

function readCourse(filename: string) {
  return JSON.parse(fs.readFileSync(path.join(courseDir, filename), "utf8"));
}

describe("hygiène des contenus importés", () => {
  it("retire les références DataLab tout en conservant une structure pédagogique exploitable", () => {
    for (const filename of localEnvironmentCourses) {
      const course = readCourse(filename);
      const serialized = JSON.stringify(course);

      expect(serialized).not.toMatch(/datalab/i);
      expect(course.lessons.length).toBeGreaterThan(0);
      expect(course.lessons.every((lesson: { chapters?: unknown[] }) => Array.isArray(lesson.chapters) && lesson.chapters.length > 0)).toBe(true);
    }
  });

  it("retire les points XP importés au profit des règles de compétences Neopolis", () => {
    for (const filename of competencyPointsCourses) {
      const serialized = JSON.stringify(readCourse(filename));

      expect(serialized).not.toMatch(/"xp"\s*:/i);
      expect(serialized).not.toMatch(/\bXP\b/i);
      expect(serialized).not.toMatch(/\+\s*\d+\s*points de compétences/i);
    }
  });
});
