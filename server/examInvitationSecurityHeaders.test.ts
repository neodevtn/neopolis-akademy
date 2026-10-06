import { describe, expect, it, vi } from "vitest";
import { examInvitationSecurityHeaders } from "./examInvitationSecurityHeaders";
import { applySpaDocumentNoCacheHeaders } from "./_core/vite";
import { renderRobotsTxt } from "../shared/agenticDiscovery";

function headersFor(path: string) {
  const headers = new Map<string, string>();
  const response = {
    setHeader: (name: string, value: string) => { headers.set(name.toLowerCase(), value); },
    getHeader: (name: string) => headers.get(name.toLowerCase()),
    set: (values: Record<string, string>) => { for (const [name, value] of Object.entries(values)) headers.set(name.toLowerCase(), value); },
  };
  const next = vi.fn();
  examInvitationSecurityHeaders({ path } as never, response as never, next);
  applySpaDocumentNoCacheHeaders(response);
  expect(next).toHaveBeenCalledOnce();
  return headers;
}

describe("confidentialité des jetons d’examen", () => {
  it("n’expose pas le jeton d’invitation par Referer, cache ou index de recherche", () => {
    const headers = headersFor("/accept-exam-invitation");
    expect(headers.get("referrer-policy")).toBe("no-referrer");
    expect(headers.get("cache-control")).toMatch(/private.*no-store/);
    expect(headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(renderRobotsTxt()).toContain("Disallow: /accept-exam-invitation");
  });
  it("ne change pas le cache du document SPA pour les autres pages", () => {
    const headers = headersFor("/formations-ia");
    expect(headers.get("cache-control")).toBe("no-cache, must-revalidate, proxy-revalidate");
    expect(headers.has("x-robots-tag")).toBe(false);
  });
});
