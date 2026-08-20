export type LearningPathCertification = {
  id: string;
  title: { en: string; fr: string };
  icon?: string;
};

export type OrientationRecommendationForPath = {
  order: number;
  certificationId: string;
  competencyId: string;
  currentPoints: number;
  diagnosticPoints: number;
  targetPoints: number;
  reason: string;
  type: "foundation" | "target" | "advanced";
};

export function buildRecommendedLearningPath(input: {
  certifications: LearningPathCertification[];
  orientationStatus?: string | null;
  orientationRecommendations?: OrientationRecommendationForPath[] | null;
}) {
  const recommendations = Array.isArray(input.orientationRecommendations)
    ? input.orientationRecommendations
    : [];
  const personalized = input.orientationStatus === "completed" && recommendations.length > 0;

  if (!personalized) {
    return {
      personalized: false,
      items: input.certifications.map((certification, index) => ({
        certification,
        order: index + 1,
        recommendation: null,
      })),
    };
  }

  const byId = new Map(input.certifications.map((certification) => [certification.id, certification]));
  const seen = new Set<string>();
  const items = [...recommendations]
    .sort((a, b) => a.order - b.order)
    .flatMap((recommendation) => {
      if (seen.has(recommendation.certificationId)) return [];
      const certification = byId.get(recommendation.certificationId);
      if (!certification) return [];
      seen.add(recommendation.certificationId);
      return [{ certification, order: recommendation.order, recommendation }];
    });

  return {
    personalized: items.length > 0,
    items: items.length
      ? items
      : input.certifications.map((certification, index) => ({ certification, order: index + 1, recommendation: null })),
  };
}
