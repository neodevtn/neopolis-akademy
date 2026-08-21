import { describe, expect, it } from "vitest";
import { applyCatalogMetrics, calculateCourseMetrics } from "./catalogMetrics";

describe("catalog metrics", () => {
  const course = {
    lessons: [{ chapters: [{ blocks: [{ type: "video" }, { type: "download" }, { type: "checkpoint" }, { type: "text" }] }, { blocks: [{ type: "multi_choice" }, { type: "video" }] }] }],
  };

  it("counts actual resources from course blocks", () => {
    expect(calculateCourseMetrics(course)).toMatchObject({ lessonCount: 1, chapterCount: 2, exerciseCount: 2, videoCount: 2, downloadCount: 1, totalActivities: 2 });
  });

  it("aggregates certifications only from their actual indexed courses", () => {
    const result = applyCatalogMetrics({ certifications: [{ id: "cert_a" }], courses: [{ id: "course_a", certId: "cert_a" }] }, { course_a: course });
    expect(result.certifications[0]).toMatchObject({ courseCount: 1, totalLessons: 1, totalExercises: 2, totalActivities: 2, totalVideos: 2, totalDownloads: 1 });
  });
});
