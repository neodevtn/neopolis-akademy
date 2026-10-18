export type TrainingEligibilitySource = {
  trainingFormat?: string | null;
  contentKind?: string | null;
  certificationStatus?: string | null;
  assessmentPolicy?: string | null;
  credentialPolicy?: string | null;
};

/**
 * Politique métier des formations. Les champs explicites priment; les contenus
 * historiques sans politique conservent leur comportement fondé sur le format.
 */
export function isLearningPath(training?: TrainingEligibilitySource | null) {
  return training?.contentKind === "learning_path";
}

export function isCertifyingTraining(training?: TrainingEligibilitySource | null) {
  if (!training) return false;
  if (training.certificationStatus) return training.certificationStatus === "certifying";
  return training.trainingFormat === "certification_preparation";
}

export function isMockExamEligible(training?: TrainingEligibilitySource | null) {
  if (!training) return false;
  if (training.assessmentPolicy) return training.assessmentPolicy === "mock_exam";
  return training.trainingFormat === "certification_preparation";
}

export function canIssueTrainingCredential(training?: TrainingEligibilitySource | null) {
  if (!training) return false;
  if (training.credentialPolicy) return training.credentialPolicy !== "none";
  return isCertifyingTraining(training);
}

export function isNonCertifyingTraining(training?: TrainingEligibilitySource | null) {
  return Boolean(training) && !isCertifyingTraining(training);
}
