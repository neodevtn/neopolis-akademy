export function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createLesson(seed = Date.now().toString(36)) {
  return {
    id: `lesson_${seed}`,
    title: { fr: "Nouvelle leçon", en: "New lesson" },
    completionRule: "all_chapters",
    recommendedVideos: [],
    chapters: [{
      id: `chapter_${seed}`,
      title: { fr: "Introduction", en: "Introduction" },
      type: "content",
      blocks: [{ type: "content", body: { fr: "", en: "" } }],
    }],
  };
}

export function duplicateLesson(lesson: any, seed = Date.now().toString(36)) {
  const duplicate = cloneValue(lesson);
  duplicate.id = `${lesson?.id || "lesson"}_copy_${seed}`;
  duplicate.title = typeof lesson?.title === "object"
    ? { ...lesson.title, fr: `${lesson.title.fr || lesson.title.en || "Leçon"} — copie` }
    : { fr: `${lesson?.title || "Leçon"} — copie`, en: lesson?.title || "Lesson copy" };
  duplicate.chapters = (duplicate.chapters || []).map((chapter: any, index: number) => ({
    ...chapter,
    id: `${chapter.id || "chapter"}_copy_${seed}_${index + 1}`,
  }));
  return duplicate;
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

/** Re-indexes lesson-qualified chapter quiz keys after lesson reordering or deletion. */
export function remapLessonQuizBanks(previousCourse: any, nextCourse: any, courseQuizzes: Record<string, any>) {
  const nextByLessonId = new Map<string, { lesson: any; index: number }>((nextCourse?.lessons || []).map((lesson: any, index: number) => [lesson.id, { lesson, index }]));
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(courseQuizzes || {})) {
    const match = key.match(/^(\d+)_(\d+)$/);
    if (!match) {
      result[key] = value;
      continue;
    }
    const previousLesson = previousCourse?.lessons?.[Number(match[1])];
    const previousChapter = previousLesson?.chapters?.[Number(match[2])];
    const destination = nextByLessonId.get(previousLesson?.id);
    if (!destination) continue; // The associated lesson was intentionally deleted.
    const nextChapterIndex = (destination.lesson.chapters || []).findIndex((chapter: any) => chapter.id === previousChapter?.id);
    if (nextChapterIndex < 0) continue; // The associated chapter was intentionally deleted.
    result[`${destination.index}_${nextChapterIndex}`] = value;
  }
  return result;
}
