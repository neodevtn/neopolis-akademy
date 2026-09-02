export type Learner360LessonProgress = {
  certificationId: string;
  courseId: string;
  lessonIndex: number;
};

export type Learner360ChapterProgress = {
  courseId: string;
  lessonIndex: number;
  chapterIndex: number;
  totalChapters: number;
};

export type Learner360VideoProgress = {
  courseId: string;
  youtubeId: string;
};

export type Learner360ExamAttempt = {
  certificationId: string;
  startedAt: Date | string | null;
  finishedAt: Date | string | null;
  passed: number | boolean;
  timedOut?: number | boolean | null;
};

export type Learner360LearningEvent = {
  eventType: string;
  durationSeconds?: number | null;
};

export type Learner360Course = {
  id: string;
  certificationId?: string | null;
  lessonCount?: number | null;
};

export type Learner360Metrics = {
  completedLessons: number;
  completedChapters: number;
  watchedVideos: number;
  examAttempts: number;
  examsPassed: number;
  firstExamPassRate: number | null;
  activeSeconds: number;
  timedOutExams: number;
};

export type Learner360CertificationProgress = {
  certificationId: string;
  completedLessons: number;
  totalLessons: number;
  completedCourses: number;
  totalCourses: number;
  completionPercent: number;
};

const key = (...parts: Array<string | number>) => parts.join("|");

const asDate = (value: Date | string | null) => value ? new Date(value).getTime() : 0;

/**
 * The reader writes one 60-second heartbeat when the learner is active. The
 * reporting view retains historical events but limits one event to five
 * minutes so malformed or legacy payloads cannot inflate a KPI indefinitely.
 */
export const MAX_COUNTED_LEARNING_HEARTBEAT_SECONDS = 300;

export function buildLearner360Metrics({
  lessons,
  chapters,
  videos,
  attempts,
  learningEvents,
  courses,
}: {
  lessons: Learner360LessonProgress[];
  chapters: Learner360ChapterProgress[];
  videos: Learner360VideoProgress[];
  attempts: Learner360ExamAttempt[];
  learningEvents: Learner360LearningEvent[];
  courses: Learner360Course[];
}): Learner360Metrics {
  const courseLessonCounts = new Map(courses.map((course) => [course.id, Math.max(1, Number(course.lessonCount || 1))]));
  const chapterByLesson = new Map<string, Learner360ChapterProgress>();

  for (const chapter of chapters) {
    const normalizedTotal = Math.max(0, Number(chapter.totalChapters || 0));
    const normalizedIndex = Math.max(0, Math.min(Number(chapter.chapterIndex || 0), normalizedTotal));
    const chapterKey = key(chapter.courseId, chapter.lessonIndex);
    const existing = chapterByLesson.get(chapterKey);
    if (!existing || normalizedIndex > Math.max(0, Math.min(Number(existing.chapterIndex || 0), Number(existing.totalChapters || 0)))) {
      chapterByLesson.set(chapterKey, { ...chapter, chapterIndex: normalizedIndex, totalChapters: normalizedTotal });
    }
  }

  const completedLessonsByCourse = new Map<string, Set<number>>();
  for (const lesson of lessons) {
    const values = completedLessonsByCourse.get(lesson.courseId) || new Set<number>();
    values.add(lesson.lessonIndex);
    completedLessonsByCourse.set(lesson.courseId, values);
  }
  for (const chapter of Array.from(chapterByLesson.values())) {
    const lessonCount = courseLessonCounts.get(chapter.courseId) || 1;
    const values = completedLessonsByCourse.get(chapter.courseId) || new Set<number>();
    if (lessonCount === 1 && chapter.totalChapters > 0 && chapter.chapterIndex >= chapter.totalChapters) {
      values.add(0);
      completedLessonsByCourse.set(chapter.courseId, values);
      continue;
    }
    if (chapter.totalChapters !== lessonCount || lessonCount <= 1) continue;
    for (let lessonIndex = 0; lessonIndex < Math.min(chapter.chapterIndex, lessonCount); lessonIndex += 1) values.add(lessonIndex);
    completedLessonsByCourse.set(chapter.courseId, values);
  }

  const completedLessons = Array.from(completedLessonsByCourse.values()).reduce((sum, values) => sum + values.size, 0);
  const completedChapters = Array.from(chapterByLesson.values()).reduce((sum, chapter) => sum + Math.min(chapter.chapterIndex, chapter.totalChapters), 0);
  const watchedVideos = new Set(videos.map((video) => key(video.courseId, video.youtubeId))).size;
  const activeSeconds = learningEvents.reduce((sum, event) => {
    if (event.eventType !== "learning_time") return sum;
    return sum + Math.min(MAX_COUNTED_LEARNING_HEARTBEAT_SECONDS, Math.max(0, Math.round(Number(event.durationSeconds || 0))));
  }, 0);

  const firstAttemptByCertification = new Map<string, Learner360ExamAttempt>();
  for (const attempt of attempts) {
    const existing = firstAttemptByCertification.get(attempt.certificationId);
    if (!existing || asDate(attempt.startedAt) < asDate(existing.startedAt) || (asDate(attempt.startedAt) === asDate(existing.startedAt) && asDate(attempt.finishedAt) < asDate(existing.finishedAt))) {
      firstAttemptByCertification.set(attempt.certificationId, attempt);
    }
  }
  const firstAttempts = Array.from(firstAttemptByCertification.values());
  const firstExamPassRate = firstAttempts.length
    ? Math.round((firstAttempts.filter((attempt) => Number(attempt.passed) === 1).length / firstAttempts.length) * 100)
    : null;

  return {
    completedLessons,
    completedChapters,
    watchedVideos,
    examAttempts: attempts.length,
    examsPassed: attempts.filter((attempt) => Number(attempt.passed) === 1).length,
    firstExamPassRate,
    activeSeconds,
    timedOutExams: attempts.filter((attempt) => Number(attempt.timedOut || 0) === 1).length,
  };
}

export function buildLearnerCertificationProgress({
  lessons,
  chapters,
  courses,
}: {
  lessons: Learner360LessonProgress[];
  chapters: Learner360ChapterProgress[];
  courses: Learner360Course[];
}): Learner360CertificationProgress[] {
  const courseLessonCounts = new Map(courses.map((course) => [course.id, Math.max(1, Number(course.lessonCount || 1))]));
  const completedByCourse = new Map<string, Set<number>>();
  for (const lesson of lessons) {
    const values = completedByCourse.get(lesson.courseId) || new Set<number>();
    values.add(lesson.lessonIndex);
    completedByCourse.set(lesson.courseId, values);
  }

  const highestChapterByCourse = new Map<string, Learner360ChapterProgress>();
  for (const chapter of chapters) {
    const total = Math.max(0, Number(chapter.totalChapters || 0));
    const index = Math.max(0, Math.min(Number(chapter.chapterIndex || 0), total));
    const existing = highestChapterByCourse.get(chapter.courseId);
    if (!existing || index > Math.min(Number(existing.chapterIndex || 0), Number(existing.totalChapters || 0))) {
      highestChapterByCourse.set(chapter.courseId, { ...chapter, chapterIndex: index, totalChapters: total });
    }
  }

  for (const chapter of Array.from(highestChapterByCourse.values())) {
    const lessonCount = courseLessonCounts.get(chapter.courseId) || 1;
    const values = completedByCourse.get(chapter.courseId) || new Set<number>();
    if (lessonCount === 1 && chapter.totalChapters > 0 && chapter.chapterIndex >= chapter.totalChapters) values.add(0);
    if (lessonCount > 1 && chapter.totalChapters === lessonCount) {
      for (let index = 0; index < Math.min(chapter.chapterIndex, lessonCount); index += 1) values.add(index);
    }
    completedByCourse.set(chapter.courseId, values);
  }

  const byCertification = new Map<string, Learner360CertificationProgress>();
  for (const course of courses) {
    if (!course.certificationId) continue;
    const current = byCertification.get(course.certificationId) || {
      certificationId: course.certificationId,
      completedLessons: 0,
      totalLessons: 0,
      completedCourses: 0,
      totalCourses: 0,
      completionPercent: 0,
    };
    const totalLessons = courseLessonCounts.get(course.id) || 1;
    const completedLessons = Math.min(totalLessons, completedByCourse.get(course.id)?.size || 0);
    current.totalCourses += 1;
    current.totalLessons += totalLessons;
    current.completedLessons += completedLessons;
    if (completedLessons >= totalLessons) current.completedCourses += 1;
    byCertification.set(course.certificationId, current);
  }
  return Array.from(byCertification.values()).map((progress) => ({
    ...progress,
    completionPercent: progress.totalLessons ? Math.round((progress.completedLessons / progress.totalLessons) * 100) : 0,
  })).sort((left, right) => right.completionPercent - left.completionPercent || left.certificationId.localeCompare(right.certificationId));
}
