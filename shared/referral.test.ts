import { describe, expect, it } from "vitest";
import { buildReferralShareUrl, buildReferralUrl, normalizeReferralCode } from "./referral";

describe("referral tracking", () => {
  it("normalise uniquement un code de parrainage valide", () => {
    expect(normalizeReferralCode(" neo-ab12cd34 ")).toBe("NEO-AB12CD34");
    expect(normalizeReferralCode("invalid-code")).toBeNull();
    expect(normalizeReferralCode(undefined)).toBeNull();
  });

  it("construit un lien de candidature avec les paramètres d’attribution", () => {
    const url = new URL(buildReferralUrl({
      origin: "https://akademy.neodev.click",
      referralCode: "NEO-AB12CD34",
      content: "course",
      target: "linkedin",
      courseId: "course_ia",
      certificationId: "cert_ia",
    }));
    expect(url.pathname).toBe("/apply");
    expect(url.searchParams.get("ref")).toBe("NEO-AB12CD34");
    expect(url.searchParams.get("utm_source")).toBe("referral");
    expect(url.searchParams.get("utm_medium")).toBe("linkedin");
    expect(url.searchParams.get("utm_content")).toBe("course");
    expect(url.searchParams.get("course")).toBe("course_ia");
  });

  it("prépare une URL de partage compatible avec chaque réseau", () => {
    const link = "https://akademy.neodev.click/apply?ref=NEO-AB12CD34";
    expect(buildReferralShareUrl("whatsapp", link, "Bonjour")).toContain("wa.me");
    expect(buildReferralShareUrl("linkedin", link, "Bonjour")).toContain("linkedin.com");
    expect(buildReferralShareUrl("facebook", link, "Bonjour")).toContain("facebook.com");
    expect(buildReferralShareUrl("x", link, "Bonjour")).toContain("x.com/intent");
  });
});
