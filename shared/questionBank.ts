export type QuestionSelectionMode = "random" | "all";

export interface QuestionSelectionSettings {
  mode: QuestionSelectionMode;
  questionCount: number;
  passThreshold: number;
  shuffleChoices: boolean;
}

export interface QuestionBank<T = any> {
  questions: T[];
  selection: QuestionSelectionSettings;
}

const DEFAULT_SELECTION: QuestionSelectionSettings = {
  mode: "random",
  questionCount: 3,
  passThreshold: 2,
  shuffleChoices: true,
};

/** Supports legacy arrays and the new `{ questions, selection }` bank format. */
export function normalizeQuestionBank<T = any>(raw: unknown): QuestionBank<T> {
  const candidate = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as { questions?: unknown; selection?: Partial<QuestionSelectionSettings> } : null;
  const questions = Array.isArray(raw) ? raw as T[] : Array.isArray(candidate?.questions) ? candidate!.questions as T[] : [];
  const requestedCount = Number(candidate?.selection?.questionCount ?? DEFAULT_SELECTION.questionCount);
  const questionCount = questions.length === 0 ? 0 : Math.min(Math.max(1, Number.isFinite(requestedCount) ? requestedCount : DEFAULT_SELECTION.questionCount), questions.length);
  const requestedThreshold = Number(candidate?.selection?.passThreshold ?? DEFAULT_SELECTION.passThreshold);
  const passThreshold = questionCount === 0 ? 0 : Math.min(Math.max(1, Number.isFinite(requestedThreshold) ? requestedThreshold : DEFAULT_SELECTION.passThreshold), questionCount);
  return {
    questions,
    selection: {
      mode: candidate?.selection?.mode === "all" ? "all" : "random",
      questionCount,
      passThreshold,
      shuffleChoices: candidate?.selection?.shuffleChoices !== false,
    },
  };
}

/** Keeps legacy JSON array format unless the admin intentionally configures selection rules. */
export function serializeQuestionBank<T>(bank: QuestionBank<T>, forceStructured = true): T[] | QuestionBank<T> {
  return forceStructured ? bank : bank.questions;
}
