export type TrainingExamInfo = {
  examCode?: string;
  totalQuestions?: number;
  timeLimit?: number;
  passingScore?: number;
  scoreRange?: [number, number];
  domains?: Array<{ name?: { fr?: string; en?: string } | string; weight?: number }>;
};

type TrainingCatalogLike = {
  examConfig?: Record<string, TrainingExamInfo>;
};

type CertificationLike = {
  id?: string;
};

export function getTrainingExamInfo(catalog: TrainingCatalogLike, certificationId: string | undefined | null): TrainingExamInfo | null {
  if (!certificationId) return null;
  const info = catalog.examConfig?.[certificationId];
  if (!info || typeof info !== "object") return null;
  const totalQuestions = Number(info.totalQuestions);
  const timeLimit = Number(info.timeLimit);
  return {
    ...info,
    totalQuestions: Number.isFinite(totalQuestions) && totalQuestions > 0 ? totalQuestions : undefined,
    timeLimit: Number.isFinite(timeLimit) && timeLimit > 0 ? timeLimit : undefined,
  };
}

export function certificationHasExam(catalog: TrainingCatalogLike, certification: CertificationLike | string | undefined | null): boolean {
  const certificationId = typeof certification === "string" ? certification : certification?.id;
  return Boolean(getTrainingExamInfo(catalog, certificationId));
}

function normalizeExamSummaryLanguage(language: string | undefined): "fr" | "en" {
  return language === "en" ? "en" : "fr";
}

export function formatExamSummary(info: TrainingExamInfo | null | undefined, language: string = "fr"): string {
  const normalizedLanguage = normalizeExamSummaryLanguage(language);
  if (!info) return normalizedLanguage === "fr" ? "Sans examen blanc" : "No mock exam";
  const parts: string[] = [];
  if (info.totalQuestions) parts.push(normalizedLanguage === "fr" ? `${info.totalQuestions} questions` : `${info.totalQuestions} questions`);
  if (info.timeLimit) parts.push(normalizedLanguage === "fr" ? `${info.timeLimit} min` : `${info.timeLimit} min`);
  if (info.passingScore) parts.push(normalizedLanguage === "fr" ? `seuil ${info.passingScore}/1000` : `pass ${info.passingScore}/1000`);
  return parts.length ? parts.join(" · ") : (normalizedLanguage === "fr" ? "Examen blanc disponible" : "Mock exam available");
}
