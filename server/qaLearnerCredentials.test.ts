import { describe, expect, it } from "vitest";

describe("identifiants QA apprenant", () => {
  it("ouvrent une session de contrôle valide", async () => {
    const email = process.env.QA_EMAIL;
    const password = process.env.QA_PASSWORD;
    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    const response = await fetch("http://127.0.0.1:3000/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", "x-neopolis-qa-probe": "1" },
      body: JSON.stringify({ email, password }),
    });

    expect(response.ok).toBe(true);
    expect(response.headers.get("set-cookie")).toContain("app_session_id=");
  }, 15_000);
});
