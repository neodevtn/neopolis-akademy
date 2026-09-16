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

export type PostRevealReflectionOption = {
  id: string;
  label: string;
  feedback: string;
  passes: boolean;
};

export function resolvePostRevealReflectionOptions(rawValue: unknown, lang: string): PostRevealReflectionOption[] {
  if (!Array.isArray(rawValue)) return [];

  return rawValue.flatMap((rawOption, index) => {
    if (!rawOption || typeof rawOption !== "object") return [];
    const option = rawOption as { id?: unknown; label?: unknown; feedback?: unknown; passes?: unknown };
    const label = resolveLocalizedBlockText(option.label, lang);
    if (!label) return [];
    return [{
      id: typeof option.id === "string" && option.id.trim() ? option.id : `reflection_${index + 1}`,
      label,
      feedback: resolveLocalizedBlockText(option.feedback, lang),
      passes: option.passes === true,
    }];
  });
}
