export const REFERRAL_CODE_PATTERN = /^NEO-[A-Z0-9]{6,24}$/;

export type ReferralShareTarget = "whatsapp" | "linkedin" | "facebook" | "x" | "copy";
export type ReferralShareContent = "academy" | "course" | "achievement";

export function normalizeReferralCode(value?: string | null): string | null {
  const normalized = value?.trim().toUpperCase() || "";
  return REFERRAL_CODE_PATTERN.test(normalized) ? normalized : null;
}

export function buildReferralUrl(input: {
  origin: string;
  referralCode: string;
  content: ReferralShareContent;
  target?: ReferralShareTarget;
  courseId?: string | null;
  certificationId?: string | null;
  achievementId?: number | null;
}): string {
  const url = new URL("/apply", input.origin);
  url.searchParams.set("ref", input.referralCode);
  url.searchParams.set("utm_source", "referral");
  url.searchParams.set("utm_medium", input.target || "share");
  url.searchParams.set("utm_campaign", "neopolis-referral");
  url.searchParams.set("utm_content", input.content);
  if (input.courseId) url.searchParams.set("course", input.courseId);
  if (input.certificationId) url.searchParams.set("certification", input.certificationId);
  if (input.achievementId) url.searchParams.set("achievement", String(input.achievementId));
  return url.toString();
}

export function buildReferralShareUrl(target: Exclude<ReferralShareTarget, "copy">, referralUrl: string, message: string): string {
  const encodedUrl = encodeURIComponent(referralUrl);
  const encodedMessage = encodeURIComponent(message);
  if (target === "whatsapp") return `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`;
  if (target === "linkedin") return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  if (target === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  return `https://x.com/intent/post?text=${encodedMessage}&url=${encodedUrl}`;
}

export function referralStatusLabel(status: "pending" | "eligible" | "rewarded" | "rejected"): string {
  return ({ pending: "À examiner", eligible: "Éligible", rewarded: "Récompensé", rejected: "Non retenu" })[status];
}
