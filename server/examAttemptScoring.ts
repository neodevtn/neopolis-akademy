import type { ExamConfiguration } from "../shared/examConfiguration";
import type { ExamQuestion } from "./examDefinition";

export type StoredExamAnswer = { questionId: string; selectedIds: string[] };

export type ExamAttemptScore = {
  correct: number;
  total: number;
  pct: number;
  scaled: number;
  passing: number;
  passed: boolean;
  timedOut: boolean;
  domainResults: Record<string, { correct: number; total: number }>;
};

const domainLabel = (domain: ExamQuestion["domain"]) => typeof domain === "string" ? domain : domain?.fr || domain?.en || "Sans domaine";

/** Score calculé exclusivement à partir de la session persistée côté serveur. */
export function scoreStoredExamSession(
  questions: ExamQuestion[],
  answers: StoredExamAnswer[],
  configuration: ExamConfiguration,
  timedOut: boolean,
): ExamAttemptScore {
  const answersByQuestion = new Map<string, string[]>();
  for (const answer of answers) {
    if (!answersByQuestion.has(answer.questionId) && Array.isArray(answer.selectedIds)) answersByQuestion.set(answer.questionId, answer.selectedIds);
  }
  const domainResults: ExamAttemptScore["domainResults"] = {};
  let correct = 0;
  for (const question of questions) {
    const domain = domainLabel(question.domain);
    domainResults[domain] ||= { correct: 0, total: 0 };
    domainResults[domain].total += 1;
    const permittedChoices = new Set(question.choices.map((choice) => choice.id));
    const selected = (answersByQuestion.get(question.id) || []).filter((choiceId) => permittedChoices.has(choiceId)).sort();
    const expected = [...question.correctChoiceIds].sort();
    if (expected.length === selected.length && expected.every((choiceId, index) => choiceId === selected[index])) {
      correct += 1;
      domainResults[domain].correct += 1;
    }
  }
  const total = questions.length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const scaled = total ? Math.round(100 + (pct / 100) * 900) : 100;
  return { correct, total, pct, scaled, passing: configuration.passingScore, passed: !timedOut && total > 0 && scaled >= configuration.passingScore, timedOut, domainResults };
}
