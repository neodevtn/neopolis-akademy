export function resolveMinimumAnswerLength(rawValue: unknown): number {
  const parsed = typeof rawValue === "number" ? rawValue : Number(rawValue);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export function hasRequiredAnswerLength(answer: string, minimumAnswerLength: number): boolean {
  return answer.trim().length >= minimumAnswerLength;
}

export function resolveLocalizedBlockText(value: unknown, lang: string): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const bilingual = value as { en?: unknown; fr?: unknown };
  const preferred = lang === "en" ? bilingual.en : bilingual.fr;
  const fallback = lang === "en" ? bilingual.fr : bilingual.en;
  return typeof preferred === "string" ? preferred : typeof fallback === "string" ? fallback : "";
}
