import { afterEach, describe, expect, it, vi } from "vitest";
import { generateAchievementPdf } from "./achievementPdf";

describe("achievement PDF", () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it("generates a valid official PDF even when the logo asset is temporarily unavailable", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("offline")) as any;
    const pdf = await generateAchievementPdf({
      userName: "Alex Martin",
      achievement: {
        id: 1,
        kind: "certification",
        title: "Certification obtenue : Claude Certified Associate – Fondations",
        description: "Certification validée avec un score de 860/1000.",
        credentialCode: "NEO-CERT-1-CLAUDE-CERTIFIED-ASSOCIATE",
        issuedAt: new Date("2026-08-17T00:00:00.000Z"),
      },
    });
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.byteLength).toBeGreaterThan(1_000);
  });
});
