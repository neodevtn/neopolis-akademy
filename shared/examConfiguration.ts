export interface ExamConfiguration {
  questionCount: number;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
}

export const DEFAULT_EXAM_CONFIGURATION: ExamConfiguration = {
  questionCount: 30,
  passingScore: 70,
  shuffleQuestions: true,
  shuffleChoices: true,
};

export function normalizeExamConfiguration(value: Partial<ExamConfiguration> | null | undefined, availableQuestions: number): ExamConfiguration {
  const max = Math.max(1, availableQuestions || DEFAULT_EXAM_CONFIGURATION.questionCount);
  const questionCount = Math.min(Math.max(1, Number(value?.questionCount) || DEFAULT_EXAM_CONFIGURATION.questionCount), max);
  const passingScore = Math.min(Math.max(1, Number(value?.passingScore) || DEFAULT_EXAM_CONFIGURATION.passingScore), 100);
  return {
    questionCount,
    passingScore,
    shuffleQuestions: value?.shuffleQuestions !== false,
    shuffleChoices: value?.shuffleChoices !== false,
  };
}
