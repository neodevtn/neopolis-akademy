export type EditableInteractionSource = "chapter_block" | "chapter_quiz" | "checkpoint_exercise";

export type EditableInteraction = {
  source: EditableInteractionSource;
  id: string;
  position: number;
  type: string;
  title: string;
  sourceKey?: string;
  item: any;
};

const interactiveBlockTypes = new Set([
  "single_choice_exercise", "multi_choice_exercise", "bucket_sort", "fill_blank", "matching",
  "ordering", "code_repl", "cloud_exercise", "terminal_sim", "ai_evaluation", "exercise",
  "flip_cards", "checklist",
]);

function localized(value: any) {
  if (typeof value === "string") return value;
  return value?.fr || value?.en || value?.question?.fr || value?.question?.en || "";
}

/**
 * Returns only activities that the learner renderer can consume for a given chapter.
 * Legacy course.exercises are included exclusively when a `checkpoint` block references
 * their id; matching a chapter field alone is not enough to make them learner-visible.
 */
export function resolveEditableInteractions({
  course,
  lessonIndex,
  chapterIndex,
  lessonQuizzes,
}: {
  course: any;
  lessonIndex: number;
  chapterIndex: number;
  lessonQuizzes: Record<string, any>;
}): EditableInteraction[] {
  const chapter = course?.lessons?.[lessonIndex]?.chapters?.[chapterIndex];
  if (!chapter) return [];
  const blocks = Array.isArray(chapter.blocks) ? chapter.blocks : [];
  const output: EditableInteraction[] = [];

  blocks.forEach((block: any, index: number) => {
    if (!interactiveBlockTypes.has(block.type)) return;
    output.push({
      source: "chapter_block",
      id: block.id || `block_${index}`,
      position: index,
      type: block.type,
      title: localized(block.title) || localized(block.question) || block.type,
      item: block,
    });
  });

  const referencedExerciseIds = new Set(blocks.filter((block: any) => block.type === "checkpoint" && block.exerciseId).map((block: any) => block.exerciseId));
  for (const exercise of course?.exercises || []) {
    if (!referencedExerciseIds.has(exercise.id)) continue;
    output.push({
      source: "checkpoint_exercise",
      id: exercise.id,
      position: 0,
      type: exercise.interactionType || "free_text",
      title: localized(exercise.title) || localized(exercise.prompt) || "Exercice de validation",
      item: exercise,
    });
  }

  const courseQuizzes = lessonQuizzes?.[course?.courseId] || {};
  const compoundKey = `${lessonIndex}_${chapterIndex}`;
  const sourceKey = Object.prototype.hasOwnProperty.call(courseQuizzes, compoundKey)
    ? compoundKey
    : Object.prototype.hasOwnProperty.call(courseQuizzes, String(chapterIndex))
      ? String(chapterIndex)
      : undefined;
  if (sourceKey) {
    const rawBank = courseQuizzes[sourceKey];
    const questions = Array.isArray(rawBank) ? rawBank : rawBank?.questions;
    (questions || []).forEach((question: any, index: number) => {
      output.push({
        source: "chapter_quiz",
        id: question.id || `question_${index}`,
        position: index,
        type: "single_choice_exercise",
        title: localized(question.question) || `Question ${index + 1}`,
        sourceKey,
        item: question,
      });
    });
  }

  return output;
}
