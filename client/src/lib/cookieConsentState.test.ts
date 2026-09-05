import { describe, expect, it } from "vitest";
import { COOKIE_CONSENT_KEY, hasStoredCookieConsent } from "./cookieConsentState";

describe("cookie consent state", () => {
  it("ne considère comme choix valides que l’acceptation ou le refus explicites", () => {
    const storage = (value: string | null) => ({ getItem: (key: string) => key === COOKIE_CONSENT_KEY ? value : null });

    expect(hasStoredCookieConsent(storage(null))).toBe(false);
    expect(hasStoredCookieConsent(storage("accepted"))).toBe(true);
    expect(hasStoredCookieConsent(storage("refused"))).toBe(true);
    expect(hasStoredCookieConsent(storage("unexpected"))).toBe(false);
  });
});
