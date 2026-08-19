import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./cookies";

describe("getSessionCookieOptions", () => {
  it("uses a secure, HttpOnly and Lax session cookie on HTTPS", () => {
    const options = getSessionCookieOptions({ protocol: "https", headers: {}, hostname: "akademy.neodev.click" } as any);

    expect(options).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  });
});
