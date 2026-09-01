export interface ExamDomain {
  name: string | { fr?: string; en?: string };
  weight: number;
}

/**
 * Source de vérité d’une épreuve blanche. Les seuils restent dans l’échelle
 * 100–1000 déjà utilisée par les tentatives et les certificats.
 */
export interface ExamConfiguration {
  examCode: string;
  totalQuestions: number;
  timeLimit: number;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
  isPublished: boolean;
  domains: ExamDomain[];
}

export const DEFAULT_EXAM_CONFIGURATION: ExamConfiguration = {
  examCode: "",
  totalQuestions: 30,
  timeLimit: 90,
  passingScore: 720,
  shuffleQuestions: true,
  shuffleChoices: true,
  isPublished: false,
  domains: [],
};

export function normalizeExamConfiguration(value: Partial<ExamConfiguration> & { questionCount?: number } | null | undefined, availableQuestions: number): ExamConfiguration {
  const max = Math.max(1, availableQuestions || DEFAULT_EXAM_CONFIGURATION.totalQuestions);
  const requestedQuestions = Number(value?.totalQuestions ?? value?.questionCount) || DEFAULT_EXAM_CONFIGURATION.totalQuestions;
  const totalQuestions = Math.min(Math.max(1, requestedQuestions), max);
  const timeLimit = Math.min(Math.max(1, Number(value?.timeLimit) || DEFAULT_EXAM_CONFIGURATION.timeLimit), 600);
  const passingScore = Math.min(Math.max(100, Number(value?.passingScore) || DEFAULT_EXAM_CONFIGURATION.passingScore), 1000);
  const domains = Array.isArray(value?.domains)
    ? value.domains
      .filter((domain): domain is ExamDomain => Boolean(domain) && typeof domain === "object" && Number.isFinite(Number(domain.weight)))
      .map((domain) => ({ name: domain.name, weight: Math.max(0, Math.min(100, Number(domain.weight))) }))
    : [];
  return {
    examCode: String(value?.examCode || "").trim().slice(0, 100),
    totalQuestions,
    timeLimit,
    passingScore,
    shuffleQuestions: value?.shuffleQuestions !== false,
    shuffleChoices: value?.shuffleChoices !== false,
    isPublished: value?.isPublished === true,
    domains,
  };
}
