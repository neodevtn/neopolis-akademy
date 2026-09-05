export const COOKIE_CONSENT_KEY = "neopolis_cookie_consent";
export const COOKIE_CONSENT_UPDATED_EVENT = "neopolis:cookie-consent-updated";

export type CookieConsentChoice = "accepted" | "refused";

export function hasStoredCookieConsent(storage: Pick<Storage, "getItem"> | null = typeof window === "undefined" ? null : window.localStorage) {
  const value = storage?.getItem(COOKIE_CONSENT_KEY);
  return value === "accepted" || value === "refused";
}

export function notifyCookieConsentUpdated(choice: CookieConsentChoice) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<CookieConsentChoice>(COOKIE_CONSENT_UPDATED_EVENT, { detail: choice }));
}
