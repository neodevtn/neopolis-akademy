import { describe, expect, it } from "vitest";

describe("OpenRouter credential", () => {
  const runExternalChecks = process.env.RUN_EXTERNAL_SECRET_TESTS === "1";

  it("has an OpenRouter key configured", () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    expect(apiKey).toMatch(/^sk-or-v1-/);
  });

  it.runIf(runExternalChecks)("authenticates against the lightweight key endpoint", async () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { data?: { label?: string } };
    expect(payload.data).toBeDefined();
  }, 20_000);
});
