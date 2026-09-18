import { describe, expect, it } from "vitest";
import { getPublicCatalogueTrainingSlug } from "./publicTrainingCatalog";
import { goldenJobs, goldenJobsPromotionalVideos } from "./goldenJobs";

const anthropicPathways = new Set([
  "claude_certified_architect_foundations",
  "claude_certified_architect_professional",
  "claude_certified_associate_foundations",
  "claude_certified_developer_foundations",
]);

describe("Golden Jobs pathways", () => {
  it("maps every recommended certification to an existing public training programme", () => {
    for (const job of goldenJobs) {
      expect(job.recommendedCertificationIds.length, job.slug).toBeGreaterThan(0);
      for (const certificationId of job.recommendedCertificationIds) {
        expect(getPublicCatalogueTrainingSlug(certificationId), `${job.slug}: ${certificationId}`).toBeTruthy();
      }
    }
  });

  it("includes a relevant Anthropic pathway for the large majority of AI career profiles", () => {
    const jobsWithAnthropicPathway = goldenJobs.filter((job) => job.recommendedCertificationIds.some((id) => anthropicPathways.has(id)));

    expect(jobsWithAnthropicPathway.length).toBeGreaterThanOrEqual(Math.ceil(goldenJobs.length * 0.75));
    expect(jobsWithAnthropicPathway.map((job) => job.slug)).toContain("genai-engineer");
    expect(jobsWithAnthropicPathway.map((job) => job.slug)).toContain("ai-architect");
    expect(jobsWithAnthropicPathway.map((job) => job.slug)).toContain("chief-ai-officer");
  });

  it("declares exactly one verified video per public language", () => {
    expect(goldenJobsPromotionalVideos.map((video) => video.id).sort()).toEqual(["ar", "en", "fr"]);
    expect(goldenJobsPromotionalVideos.every((video) => /^https:\/\/www\.youtube\.com\/embed\/[A-Za-z0-9_-]{6,}$/.test(video.embedUrl))).toBe(true);
  });
});
