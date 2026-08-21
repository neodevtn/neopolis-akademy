import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import trainingIndex from "../client/src/data/trainingIndex.json";

const agentSkillsCourse = JSON.parse(
  readFileSync(
    new URL("../client/public/data/courses/introduction_to_agent_skills__01.json", import.meta.url),
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
});
