import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, securityHeaders } from "./security";

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

  it("autorise explicitement le chargement et la collecte GA4 en production", () => {
    const policy = buildContentSecurityPolicy(false);

    expect(policy).toContain("script-src 'self' 'unsafe-inline' https://manus-analytics.com https://www.youtube.com https://www.googletagmanager.com");
    expect(policy).toContain("connect-src 'self' https://manus-analytics.com https://sentry.neopolis-dev.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://analytics.google.com");
    expect(policy).toContain("img-src 'self' data: https: blob: https://www.googletagmanager.com https://*.google-analytics.com");
    expect(policy).not.toMatch(/connect-src[^;]*\shttps:\s/);
    expect(policy).not.toContain("doubleclick.net");
    expect(policy).not.toContain("googlesyndication.com");
    expect(policy).not.toContain("'unsafe-eval'");
  });

  it("réserve les websockets et eval au serveur de développement", () => {
    const policy = buildContentSecurityPolicy(true);

    expect(policy).toContain("'unsafe-eval'");
    expect(policy).toContain("ws:");
    expect(policy).toContain("wss:");
  });
});
