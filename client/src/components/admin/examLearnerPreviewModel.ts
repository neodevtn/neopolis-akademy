import type { ExamConfiguration } from "@shared/examConfiguration";

export type ExamPreviewState = "needs_questions" | "draft" | "ready";

export interface ExamLearnerPreviewModel {
  state: ExamPreviewState;
  displayedQuestionCount: number;
  title: string;
  description: string;
}

/**
 * Résume ce que l’apprenant verra sans créer de session, modifier la banque ou
 * laisser entendre que le brouillon est déjà publié.
 */
export function buildExamLearnerPreviewModel(configuration: ExamConfiguration, availableQuestions: number): ExamLearnerPreviewModel {
  const displayedQuestionCount = Math.min(Math.max(0, configuration.totalQuestions), Math.max(0, availableQuestions));
  if (!displayedQuestionCount) {
    return {
      state: "needs_questions",
      displayedQuestionCount: 0,
      title: "Question requise",
      description: "Ajoutez au moins une question publiable avant de rendre l’examen disponible.",
    };
  }
  if (!configuration.isPublished) {
    return {
      state: "draft",
      displayedQuestionCount,
      title: "Brouillon non disponible",
      description: "Les apprenants ne peuvent pas démarrer cet examen tant que vous ne l’avez pas publié.",
    };
  }
  return {
    state: "ready",
    displayedQuestionCount,
    title: "Examen disponible après complétion",
    description: "Les apprenants ayant terminé tous les cours de la formation pourront démarrer une session chronométrée.",
  };
}
