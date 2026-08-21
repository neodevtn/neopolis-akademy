import { describe, expect, it } from "vitest";
import trainingIndex from "../client/src/data/trainingIndex.json";

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
});
