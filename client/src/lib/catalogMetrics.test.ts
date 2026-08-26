import { describe, expect, it } from "vitest";
import { getCertificationCatalogMetrics, getCourseCatalogMetrics } from "./catalogMetrics";

describe("catalog metrics", () => {
  it("uses the course-level generated metrics and falls back to chapters for activities", () => {
    expect(getCourseCatalogMetrics({ certId: "cert_a", lessonCount: 2, chapterCount: 5, exerciseCount: 3, videoCount: 2, downloadCount: 1 })).toEqual({ lessonCount: 2, chapterCount: 5, totalActivities: 5, exerciseCount: 3, videoCount: 2, downloadCount: 1 });
  });

  it("aggregates a certification from its courses rather than certification attributes", () => {
    const courses = [
      { certId: "cert_a", lessonCount: 2, chapterCount: 5, totalActivities: 5, exerciseCount: 3, videoCount: 2, downloadCount: 1 },
      { certId: "cert_a", lessonCount: 1, chapterCount: 4, totalActivities: 4, exerciseCount: 2, videoCount: 1, downloadCount: 0 },
      { certId: "cert_b", lessonCount: 9, chapterCount: 9, totalActivities: 9, exerciseCount: 9, videoCount: 9, downloadCount: 9 },
    ];
    expect(getCertificationCatalogMetrics("cert_a", courses)).toEqual({ courseCount: 2, lessonCount: 3, chapterCount: 9, totalActivities: 9, exerciseCount: 5, videoCount: 3, downloadCount: 1 });
  });
});
