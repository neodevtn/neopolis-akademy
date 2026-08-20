import { describe, expect, it } from "vitest";
import { securityHeaders } from "./security";

describe("securityHeaders", () => {
  it("autorise uniquement les workers Blob locaux nécessaires au rendu sans élargir script-src", () => {
    const headers = new Map<string, string>();
    let poweredByRemoved = false;

    securityHeaders(
      {} as never,
      {
        removeHeader: (name: string) => {
          if (name === "X-Powered-By") poweredByRemoved = true;
        },
        setHeader: (name: string, value: string) => headers.set(name, value),
      } as never,
      () => undefined,
    );

    const csp = headers.get("Content-Security-Policy") ?? "";
    expect(poweredByRemoved).toBe(true);
    expect(csp).toContain("worker-src 'self' blob:");
    expect(csp).toContain("default-src 'self'");
    expect(csp).not.toContain("worker-src *");
  });
});
