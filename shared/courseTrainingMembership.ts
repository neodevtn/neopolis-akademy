export type TrainingMembership = {
  certificationId: string;
  order?: number;
};

export type CourseTrainingReference = {
  id: string;
  certId?: string | null;
  order?: number;
  trainingMemberships?: unknown;
};

const finiteOrder = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

/**
 * Un cours conserve un propriétaire canonique (`certId`) et peut être réutilisé
 * par d’autres formations via `trainingMemberships`. Son contenu et sa progression
 * restent ainsi uniques, alors que l’ordre est propre à chaque formation.
 */
export function getCourseTrainingMemberships(course: CourseTrainingReference): TrainingMembership[] {
  const memberships: TrainingMembership[] = [];
  if (typeof course?.certId === "string" && course.certId.trim()) {
    memberships.push({ certificationId: course.certId, order: finiteOrder(course.order) });
  }
  if (Array.isArray(course?.trainingMemberships)) {
    for (const candidate of course.trainingMemberships) {
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
      const record = candidate as { certificationId?: unknown; order?: unknown };
      if (typeof record.certificationId !== "string" || !record.certificationId.trim()) continue;
      if (memberships.some((membership) => membership.certificationId === record.certificationId)) continue;
      memberships.push({ certificationId: record.certificationId, order: finiteOrder(record.order) });
    }
  }
  return memberships;
}

export function courseBelongsToTraining(course: CourseTrainingReference, certificationId?: string | null) {
  return Boolean(certificationId) && getCourseTrainingMemberships(course).some((membership) => membership.certificationId === certificationId);
}

export function getCourseOrderInTraining(course: CourseTrainingReference, certificationId?: string | null) {
  const membership = getCourseTrainingMemberships(course).find((candidate) => candidate.certificationId === certificationId);
  return membership?.order ?? finiteOrder(course.order) ?? Number.MAX_SAFE_INTEGER;
}

export function getCoursesForTraining<T extends CourseTrainingReference>(courses: readonly T[], certificationId?: string | null): T[] {
  if (!certificationId) return [];
  return courses
    .filter((course) => courseBelongsToTraining(course, certificationId))
    .sort((left, right) => getCourseOrderInTraining(left, certificationId) - getCourseOrderInTraining(right, certificationId) || left.id.localeCompare(right.id));
}
