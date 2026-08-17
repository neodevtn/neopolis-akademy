export function getExercisesForSelectedChapter({
  exercises,
  lesson,
  lessonIndex,
  chapterId,
  chapterIndex,
}: {
  exercises: any[] | undefined;
  lesson: any;
  lessonIndex: number;
  chapterId?: string;
  chapterIndex: number;
}) {
  const lessonId = lesson?.id || `lesson_${lessonIndex}`;
  return (exercises || [])
    .map((exercise, index) => ({ ...exercise, _idx: index }))
    .filter((exercise) => {
      const belongsToLesson = exercise.lessonId === lessonId || exercise.lessonId === String(lessonIndex);
      const belongsToChapter = exercise.chapterId ? exercise.chapterId === chapterId : chapterIndex === 0;
      return belongsToLesson && belongsToChapter;
    });
}

export const legacyExerciseInteractionTypes = [
  { value: "free_text", label: "Réponse libre" },
  { value: "scenario", label: "Réponse scénarisée" },
  { value: "code", label: "Réponse code" },
  { value: "single_choice", label: "QCM à choix unique" },
  { value: "multi_choice", label: "QCM à choix multiples" },
  { value: "checklist", label: "Liste de vérification" },
] as const;

export function isLegacyExerciseInteractionType(value: string | undefined) {
  return legacyExerciseInteractionTypes.some((type) => type.value === value);
}
