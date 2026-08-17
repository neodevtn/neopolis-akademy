export function getContextualCourseEditorHref({
  courseId,
  lessonIndex,
  chapterIndex,
}: {
  courseId: string;
  lessonIndex: number;
  chapterIndex: number;
}) {
  const params = new URLSearchParams({
    courseId,
    mode: "edit",
    lesson: String(Math.max(0, lessonIndex)),
    chapter: String(Math.max(0, chapterIndex)),
  });

  return `/admin/content?${params.toString()}`;
}
