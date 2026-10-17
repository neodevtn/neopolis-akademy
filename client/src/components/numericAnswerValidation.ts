export type NumericAnswerQuestion = {
  expected_value: number | string;
  unit?: string;
  tolerance?: number;
  feedback?: string | { fr?: string; en?: string };
  explanation?: string | { fr?: string; en?: string };
};

/**
 * Accepts only a simple number with at most one decimal separator.
 * Group separators are intentionally rejected: `1,234.56` is ambiguous
 * across learner locales, while `12,5` and `12.5` are unambiguous.
 */
export function parseUnambiguousNumber(rawValue: string): number | null {
  const normalized = rawValue.trim().replace(/[\s\u00A0\u202F]/g, "");
  if (!/^[+-]?\d+(?:[.,]\d+)?$/.test(normalized)) return null;
  const result = Number(normalized.replace(",", "."));
  return Number.isFinite(result) ? result : null;
}

export function isNumericAnswerCorrect(question: NumericAnswerQuestion, userAnswer: string): boolean {
  if (typeof question.expected_value === "string") return userAnswer.trim().toLowerCase() === question.expected_value.trim().toLowerCase();
  const answer = parseUnambiguousNumber(userAnswer);
  if (answer === null) return false;
  const expected = question.expected_value;
  const tolerance = Number.isFinite(question.tolerance) ? Math.max(0, Number(question.tolerance)) : 0;
  // The epsilon only offsets binary floating-point representation (for example
  // 100 - 99.99 = 0.010000000000005116); it does not enlarge the declared
  // pedagogical tolerance in meaningful units.
  const floatingPointMargin = Number.EPSILON * Math.max(1, Math.abs(answer), Math.abs(expected));
  return Math.abs(answer - expected) <= tolerance + floatingPointMargin;
}

function localized(value: NumericAnswerQuestion["feedback"], lang: "en" | "fr"): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const direct = value[lang];
  const fallback = value[lang === "fr" ? "en" : "fr"];
  return typeof direct === "string" && direct.trim() ? direct.trim() : typeof fallback === "string" ? fallback.trim() : "";
}

/** Feedback stays factual: it exposes only the expected value and declared tolerance already embedded in the course. */
export function getNumericAnswerFeedback(question: NumericAnswerQuestion, lang: "en" | "fr"): string {
  const authored = localized(question.feedback, lang) || localized(question.explanation, lang);
  if (authored) return authored;
  const unit = question.unit ? ` ${question.unit}` : "";
  const tolerance = Number.isFinite(question.tolerance) ? Math.max(0, Number(question.tolerance)) : 0;
  const expected = `${question.expected_value}${unit}`;
  if (tolerance > 0) {
    return lang === "fr"
      ? `Réponse attendue : ${expected}. Tolérance appliquée : ±${tolerance}${unit}.`
      : `Expected answer: ${expected}. Applied tolerance: ±${tolerance}${unit}.`;
  }
  return lang === "fr" ? `Réponse attendue : ${expected}.` : `Expected answer: ${expected}.`;
}
