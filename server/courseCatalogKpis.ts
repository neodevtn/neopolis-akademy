export const COURSE_KPI_ACTIVE_WINDOW_DAYS = 30;
export const COURSE_KPI_ABANDON_INACTIVITY_DAYS = 14;

export type CourseKpiCourse = { courseId: string; lessonsCount: number };
export type CourseKpiEvent = { userId: number; courseId: string | null; eventType: string; durationSeconds?: number | null; createdAt: Date };
export type CourseKpiChapterProgress = { userId: number; courseId: string; updatedAt: Date };
export type CourseKpiCompletion = { userId: number; courseId: string; lessonIndex: number; completedAt: Date };
export type CourseKpiVideo = { userId: number; courseId: string; watchedAt: Date };

export type CourseCatalogKpi = {
  hasData: boolean;
  uniqueStarters: number;
  activeLearners30d: number;
  activeMinutes30d: number;
  completedLearners: number;
  abandonedLearners: number;
  abandonmentRate: number | null;
};

type LearnerCourseActivity = { lastActivityAt: number; activeWithinWindow: boolean };

const at = (date: Date) => new Date(date).getTime();
const roundRate = (numerator: number, denominator: number) => denominator ? Math.round((numerator / denominator) * 1000) / 10 : null;

export function buildCourseCatalogKpis(input: {
  courses: CourseKpiCourse[];
  events: CourseKpiEvent[];
  chapterProgress: CourseKpiChapterProgress[];
  completions: CourseKpiCompletion[];
  videoProgress: CourseKpiVideo[];
  now?: Date;
}): Record<string, CourseCatalogKpi> {
  const now = at(input.now || new Date());
  const activeSince = now - COURSE_KPI_ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const abandonedBefore = now - COURSE_KPI_ABANDON_INACTIVITY_DAYS * 24 * 60 * 60 * 1000;
  const courseById = new Map(input.courses.map((course) => [course.courseId, course]));
  const activities = new Map<string, Map<number, LearnerCourseActivity>>();
  const activeMinutes = new Map<string, number>();
  const completedLessons = new Map<string, Map<number, Set<number>>>();

  const registerActivity = (courseId: string | null, userId: number, date: Date) => {
    if (!courseId || !courseById.has(courseId) || !Number.isFinite(userId)) return;
    const timestamp = at(date);
    if (!Number.isFinite(timestamp)) return;
    if (!activities.has(courseId)) activities.set(courseId, new Map());
    const learners = activities.get(courseId)!;
    const current = learners.get(userId);
    learners.set(userId, {
      lastActivityAt: Math.max(current?.lastActivityAt || 0, timestamp),
      activeWithinWindow: Boolean(current?.activeWithinWindow || timestamp >= activeSince),
    });
  };

  for (const event of input.events) {
    registerActivity(event.courseId, event.userId, event.createdAt);
    if (event.courseId && courseById.has(event.courseId) && event.eventType === "learning_time" && at(event.createdAt) >= activeSince) {
      activeMinutes.set(event.courseId, (activeMinutes.get(event.courseId) || 0) + Math.max(0, Number(event.durationSeconds || 0)) / 60);
    }
  }
  for (const row of input.chapterProgress) registerActivity(row.courseId, row.userId, row.updatedAt);
  for (const row of input.videoProgress) registerActivity(row.courseId, row.userId, row.watchedAt);
  for (const row of input.completions) {
    registerActivity(row.courseId, row.userId, row.completedAt);
    if (!courseById.has(row.courseId)) continue;
    if (!completedLessons.has(row.courseId)) completedLessons.set(row.courseId, new Map());
    const byLearner = completedLessons.get(row.courseId)!;
    if (!byLearner.has(row.userId)) byLearner.set(row.userId, new Set());
    byLearner.get(row.userId)!.add(row.lessonIndex);
  }

  return Object.fromEntries(input.courses.map((course) => {
    const learners = activities.get(course.courseId) || new Map<number, LearnerCourseActivity>();
    const completed = new Set(Array.from(completedLessons.get(course.courseId)?.entries() || [])
      .filter(([, lessons]) => course.lessonsCount > 0 && lessons.size >= course.lessonsCount)
      .map(([userId]) => userId));
    const abandonedLearners = Array.from(learners.entries()).filter(([userId, activity]) => !completed.has(userId) && activity.lastActivityAt > 0 && activity.lastActivityAt <= abandonedBefore).length;
    const uniqueStarters = learners.size;
    return [course.courseId, {
      hasData: uniqueStarters > 0,
      uniqueStarters,
      activeLearners30d: Array.from(learners.values()).filter((activity) => activity.activeWithinWindow).length,
      activeMinutes30d: Math.round(activeMinutes.get(course.courseId) || 0),
      completedLearners: completed.size,
      abandonedLearners,
      abandonmentRate: roundRate(abandonedLearners, uniqueStarters),
    }];
  }));
}
