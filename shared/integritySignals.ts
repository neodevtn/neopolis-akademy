export type IntegrityEvent = {
  eventType: string;
  success: number | null;
  score: number | null;
  attemptNumber: number | null;
  durationSeconds: number;
  createdAt: Date | string;
};

export type IntegrityExerciseResult = {
  courseId: string;
  moduleId: string;
  answers: string | null;
};

export type IntegritySignal = {
  id: "rapid_success_chain" | "recorded_time_mismatch" | "repeated_identical_submission" | "no_video_evidence";
  label: string;
  details: string;
  weight: number;
  evidence: Record<string, number | string>;
};

export type IntegrityAssessment = {
  riskScore: number;
  level: "none" | "monitor" | "review" | "priority_review";
  signals: IntegritySignal[];
  message: string;
};

const SUCCESS_EVENTS = new Set(["lesson_completed", "exercise_submitted", "quiz_passed", "checkpoint_passed", "assessment_passed"]);

function toMillis(value: Date | string) {
  return new Date(value).getTime();
}

/**
 * Produces review indicators only. It does not infer AI use, guilt, or an automatic sanction.
 */
export function assessLearningIntegrity(input: {
  events: IntegrityEvent[];
  watchedVideoCount: number;
  exerciseResults: IntegrityExerciseResult[];
}): IntegrityAssessment {
  const signals: IntegritySignal[] = [];
  const successfulEvents = input.events
    .filter((event) => SUCCESS_EVENTS.has(event.eventType) && event.success === 1)
    .sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));

  let longestRapidChain = 0;
  for (let start = 0; start < successfulEvents.length; start += 1) {
    let end = start;
    while (end + 1 < successfulEvents.length && toMillis(successfulEvents[end + 1].createdAt) - toMillis(successfulEvents[start].createdAt) <= 12 * 60 * 1000) end += 1;
    longestRapidChain = Math.max(longestRapidChain, end - start + 1);
  }
  if (longestRapidChain >= 6) {
    signals.push({
      id: "rapid_success_chain",
      label: "Série de validations très rapprochées",
      details: `${longestRapidChain} validations réussies ont été enregistrées en moins de 12 minutes.`,
      weight: 35,
      evidence: { successfulEvents: longestRapidChain, windowMinutes: 12 },
    });
  }

  const timedLearningSeconds = input.events
    .filter((event) => event.eventType === "learning_time" && event.durationSeconds > 0)
    .reduce((sum, event) => sum + event.durationSeconds, 0);
  if (timedLearningSeconds > 0 && successfulEvents.length >= 5 && timedLearningSeconds < successfulEvents.length * 12) {
    signals.push({
      id: "recorded_time_mismatch",
      label: "Temps déclaré très faible au regard des validations",
      details: `${timedLearningSeconds} secondes de temps d’apprentissage ont été déclarées pour ${successfulEvents.length} validations réussies.`,
      weight: 25,
      evidence: { timedLearningSeconds, successfulEvents: successfulEvents.length },
    });
  }

  const submissionCounts = new Map<string, number>();
  for (const result of input.exerciseResults) {
    if (!result.answers) continue;
    const key = `${result.courseId}:${result.moduleId}:${result.answers}`;
    submissionCounts.set(key, (submissionCounts.get(key) || 0) + 1);
  }
  const highestRepeatedSubmission = Math.max(0, ...Array.from(submissionCounts.values()));
  if (highestRepeatedSubmission >= 3) {
    signals.push({
      id: "repeated_identical_submission",
      label: "Soumissions identiques répétées",
      details: `La même réponse a été soumise ${highestRepeatedSubmission} fois pour un même exercice.`,
      weight: 10,
      evidence: { repeatedSubmissions: highestRepeatedSubmission },
    });
  }

  if (successfulEvents.length >= 8 && input.watchedVideoCount === 0) {
    signals.push({
      id: "no_video_evidence",
      label: "Aucune vidéo validée malgré une progression avancée",
      details: `${successfulEvents.length} validations ont été enregistrées sans vidéo marquée comme vue.`,
      weight: 10,
      evidence: { successfulEvents: successfulEvents.length, watchedVideoCount: input.watchedVideoCount },
    });
  }

  const riskScore = Math.min(100, signals.reduce((total, signal) => total + signal.weight, 0));
  const level = riskScore >= 60 ? "priority_review" : riskScore >= 35 ? "review" : riskScore > 0 ? "monitor" : "none";
  return {
    riskScore,
    level,
    signals,
    message: "Ces signaux sont des éléments de revue pédagogique. Ils ne prouvent pas l’utilisation d’une IA et ne déclenchent aucun blocage automatique.",
  };
}
