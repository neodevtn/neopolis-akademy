import { describe, expect, it } from "vitest";

describe("configuration Cloudflare Turnstile", () => {
  it("reconnaît la clé serveur sans valider de jeton apprenant", async () => {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    expect(secret).toBeTruthy();

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret }),
      signal: AbortSignal.timeout(10_000),
    });
    expect(response.ok).toBe(true);
    const payload = await response.json() as { success?: boolean; "error-codes"?: string[] };
    expect(payload.success).toBe(false);
    expect(payload["error-codes"]).toContain("missing-input-response");
    expect(payload["error-codes"]).not.toContain("invalid-input-secret");
  }, 15_000);
});
