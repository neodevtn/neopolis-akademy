import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Resend API Key Validation", () => {
  it("should have a valid RESEND_API_KEY configured", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey!.length).toBeGreaterThan(10);

    // Validate key by listing domains (lightweight API call)
    const resend = new Resend(apiKey);
    const { data, error } = await resend.domains.list();
    
    // If the key is valid, we should get a response (even if empty domains list)
    // If invalid, we'll get an authentication error
    expect(error).toBeNull();
    expect(data).toBeDefined();
  }, 15_000);
});
