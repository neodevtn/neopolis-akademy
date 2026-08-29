import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("pile de consentement", () => {
  it("laisse le dialogue obligatoire au-dessus de la bannière de cookies", () => {
    const cookieConsent = fs.readFileSync("client/src/components/CookieConsent.tsx", "utf8");
    const dialog = fs.readFileSync("client/src/components/ui/dialog.tsx", "utf8");

    expect(cookieConsent).toContain("z-40");
    expect(cookieConsent).not.toContain("z-[9999]");
    expect(dialog).toContain("z-50");
  });
});
