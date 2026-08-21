export type CourseMetrics = {
  lessonCount: number;
  chapterCount: number;
  exerciseCount: number;
  videoCount: number;
  downloadCount: number;
  totalActivities: number;
};

const INTERACTIVE_BLOCK_TYPES = new Set([
  "exercise", "checkpoint", "quiz", "multi_choice", "matching", "bucket_sort", "fill_blank",
  "code_repl", "terminal_sim", "ai_evaluation", "ordering",
]);

function blocksOf(course: any) {
  return (course?.lessons || []).flatMap((lesson: any) =>
    (lesson?.chapters || []).flatMap((chapter: any) => chapter?.blocks || []),
  );
}

export function calculateCourseMetrics(course: any): CourseMetrics {
  const lessons = Array.isArray(course?.lessons) ? course.lessons : [];
  const blocks = blocksOf(course);
  const chapters = lessons.reduce((count: number, lesson: any) => count + (lesson?.chapters?.length || 0), 0);
  const interactiveBlocks = blocks.filter((block: any) => INTERACTIVE_BLOCK_TYPES.has(block?.type)).length;
  const referencedLegacyExercises = new Set(
    blocks.map((block: any) => block?.exerciseId || block?.exerciseIndex).filter((value: unknown) => value !== undefined && value !== null),
  ).size;
  const standaloneExercises = interactiveBlocks + referencedLegacyExercises;

  return {
    lessonCount: lessons.length,
    chapterCount: chapters,
    exerciseCount: standaloneExercises,
    videoCount: blocks.filter((block: any) => block?.type === "video").length,
    downloadCount: blocks.filter((block: any) => block?.type === "download" || block?.type === "file_download").length,
    totalActivities: chapters,
  };
}

export function applyCatalogMetrics(index: any, coursesById: Record<string, any>) {
  const courses = (index?.courses || []).map((course: any) => {
    const metrics = calculateCourseMetrics(coursesById[course.id]);
    return {
      ...course,
      lessonCount: metrics.lessonCount,
      chapterCount: metrics.chapterCount,
      exerciseCount: metrics.exerciseCount,
      videoCount: metrics.videoCount,
      downloadCount: metrics.downloadCount,
      totalActivities: metrics.totalActivities,
    };
  });

  const certifications = (index?.certifications || []).map((certification: any) => {
    const certificationCourses = courses.filter((course: any) => course.certId === certification.id);
    return {
      ...certification,
      courseCount: certificationCourses.length,
      totalLessons: certificationCourses.reduce((sum: number, course: any) => sum + course.lessonCount, 0),
      totalExercises: certificationCourses.reduce((sum: number, course: any) => sum + course.exerciseCount, 0),
      totalActivities: certificationCourses.reduce((sum: number, course: any) => sum + course.totalActivities, 0),
      totalVideos: certificationCourses.reduce((sum: number, course: any) => sum + course.videoCount, 0),
      totalDownloads: certificationCourses.reduce((sum: number, course: any) => sum + course.downloadCount, 0),
    };
  });

  return { ...index, courses, certifications };
}
