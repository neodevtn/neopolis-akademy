import { describe, expect, it } from "vitest";

describe("Google Analytics 4 configuration", () => {
  it("retrieves the Google tag script for the configured measurement identifier", async () => {
    const measurementId = process.env.VITE_GA4_MEASUREMENT_ID;
    expect(measurementId).toMatch(/^G-[A-Z0-9]{8,}$/);

    const response = await fetch(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId || "")}`);
    expect(response.ok).toBe(true);
    expect(response.headers.get("content-type")).toContain("javascript");
  }, 15_000);
});
