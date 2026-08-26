type CatalogCourse = {
  certId: string;
  lessonCount?: number;
  chapterCount?: number;
  totalActivities?: number;
  exerciseCount?: number;
  videoCount?: number;
  downloadCount?: number;
};

const metric = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
};

export function getCourseCatalogMetrics(course: CatalogCourse) {
  const lessonCount = metric(course.lessonCount);
  const chapterCount = metric(course.chapterCount);
  return {
    lessonCount,
    chapterCount,
    totalActivities: metric(course.totalActivities) || chapterCount,
    exerciseCount: metric(course.exerciseCount),
    videoCount: metric(course.videoCount),
    downloadCount: metric(course.downloadCount),
  };
}

export function getCertificationCatalogMetrics(certificationId: string, courses: CatalogCourse[]) {
  const certificationCourses = courses.filter((course) => course.certId === certificationId);
  return certificationCourses.reduce((totals, course) => {
    const metrics = getCourseCatalogMetrics(course);
    return {
      courseCount: totals.courseCount + 1,
      lessonCount: totals.lessonCount + metrics.lessonCount,
      chapterCount: totals.chapterCount + metrics.chapterCount,
      totalActivities: totals.totalActivities + metrics.totalActivities,
      exerciseCount: totals.exerciseCount + metrics.exerciseCount,
      videoCount: totals.videoCount + metrics.videoCount,
      downloadCount: totals.downloadCount + metrics.downloadCount,
    };
  }, { courseCount: 0, lessonCount: 0, chapterCount: 0, totalActivities: 0, exerciseCount: 0, videoCount: 0, downloadCount: 0 });
}
