export type CompanionCourse = {
  id: string;
  certId: string;
  title: { en?: string; fr?: string; ar?: string } | string;
  description?: { en?: string; fr?: string; ar?: string } | string;
  lessonCount?: number;
  chapterCount?: number;
};

/**
 * Resolves catalog course references in the editorial order configured on a training.
 * Companion modules remain owned by their canonical training and are never copied into
 * the current curriculum or its completion metrics.
 */
export function resolveTrainingCompanionCourses(training: unknown, allCourses: readonly CompanionCourse[]) {
  const record = training && typeof training === "object" ? training as { companionCourses?: unknown } : {};
  const ids = Array.isArray(record.companionCourses) ? record.companionCourses.filter((id): id is string => typeof id === "string") : [];
  const byId = new Map(allCourses.map((course) => [course.id, course]));
  const seen = new Set<string>();
  return ids.flatMap((id) => {
    if (seen.has(id)) return [];
    seen.add(id);
    const course = byId.get(id);
    return course ? [course] : [];
  });
}
