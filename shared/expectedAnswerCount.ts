export type AssessmentLanguage = "fr" | "en" | "ar" | string;

function positiveInteger(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

/**
 * Resolve the number of selections a learner must make without guessing from
 * the number of choices. Public `requiredSelections` metadata takes priority;
 * local learning blocks may fall back to their already client-visible answer
 * configuration.
 */
export function resolveExpectedAnswerCount(input: {
  requiredSelections?: unknown;
  correctChoiceIds?: unknown;
  correctAnswers?: unknown;
  options?: Array<{ correct?: unknown }> | null;
  fallback?: number;
}): number {
  const explicit = positiveInteger(input.requiredSelections);
  if (explicit) return explicit;

  if (Array.isArray(input.correctChoiceIds) && input.correctChoiceIds.length > 0) {
    return input.correctChoiceIds.length;
  }

  if (Array.isArray(input.correctAnswers) && input.correctAnswers.length > 0) {
    return input.correctAnswers.length;
  }

  if (typeof input.correctAnswers === "string") {
    const count = input.correctAnswers.split(",").map((item) => item.trim()).filter(Boolean).length;
    if (count > 0) return count;
  }

  if (Array.isArray(input.options)) {
    const count = input.options.filter((option) => option.correct === true).length;
    if (count > 0) return count;
  }

  return positiveInteger(input.fallback) || 1;
}

export function expectedAnswerCountLabel(count: number, lang: AssessmentLanguage): string {
  const normalized = positiveInteger(count) || 1;
  if (lang === "ar") return normalized === 1 ? "إجابة واحدة مطلوبة" : `${normalized} إجابات مطلوبة`;
  if (lang === "en") return normalized === 1 ? "1 answer expected" : `${normalized} answers expected`;
  return normalized === 1 ? "1 réponse attendue" : `${normalized} réponses attendues`;
}

export function answerSelectionProgressLabel(selected: number, expected: number, lang: AssessmentLanguage): string {
  const normalizedExpected = positiveInteger(expected) || 1;
  const normalizedSelected = Math.max(0, Math.min(Number.isFinite(selected) ? Math.floor(selected) : 0, normalizedExpected));
  if (lang === "ar") return `${normalizedSelected} من ${normalizedExpected} محددة`;
  if (lang === "en") return `${normalizedSelected} of ${normalizedExpected} selected`;
  return `${normalizedSelected} sur ${normalizedExpected} sélectionnée${normalizedExpected > 1 ? "s" : ""}`;
}

/** Keep a selection valid for the exact number expected by the question. */
export function toggleExpectedSelection(current: string[], choiceId: string, expected: number): string[] {
  const limit = positiveInteger(expected) || 1;
  if (current.includes(choiceId)) return current.filter((id) => id !== choiceId);
  if (limit === 1) return [choiceId];
  if (current.length >= limit) return current;
  return [...current, choiceId];
}

export function hasExpectedAnswerCount(selected: number, expected: number): boolean {
  return selected === (positiveInteger(expected) || 1);
}
