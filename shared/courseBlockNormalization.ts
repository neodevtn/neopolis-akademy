/**
 * Produces a block-library representation for legacy chapter fields while retaining
 * their original fields. Keeping the originals protects legacy learner renderers and
 * lets the migration be safely repeated.
 */
export function normalizeChapterBlocks(chapter: any) {
  const existingBlocks = Array.isArray(chapter?.blocks) ? [...chapter.blocks] : [];
  const generated: any[] = [];
  const legacyBlock = chapter?.block;

  if (legacyBlock) {
    if (legacyBlock.type === "content" && legacyBlock.body) generated.push({ type: "content", body: legacyBlock.body });
    else if (legacyBlock.type === "checkpoint" && Array.isArray(legacyBlock.questions)) {
      legacyBlock.questions.forEach((question: any, index: number) => generated.push({
        type: "single_choice_exercise",
        id: `checkpoint_q${index}`,
        question: question.question,
        options: (question.choices || []).map((choice: any) => ({ id: choice.id, text: choice.text })),
        correctAnswer: question.correctId || question.answer || "a",
        explanation: question.explanation,
      }));
    } else generated.push(legacyBlock);
  }
  if (existingBlocks.length === 0 && chapter?.body) generated.push({ type: "content", body: chapter.body });
  if (existingBlocks.length === 0 && chapter?.type === "checkpoint" && Array.isArray(chapter?.questions)) {
    chapter.questions.forEach((question: any, index: number) => generated.push({
      type: "single_choice_exercise",
      id: `checkpoint_q${index}`,
      question: question.question,
      options: (question.choices || []).map((choice: any) => ({ id: choice.id, text: choice.text })),
      correctAnswer: question.correctId || question.answer || "a",
      explanation: question.explanation,
    }));
  }

  const blocks = existingBlocks.length > 0 ? [...existingBlocks, ...generated] : generated;
  return blocks.length > 0 ? { ...chapter, blocks } : chapter;
}

export function normalizeCourseBlocks<T extends { lessons?: any[] }>(course: T): T {
  return {
    ...course,
    lessons: (course.lessons || []).map((lesson: any) => ({
      ...lesson,
      chapters: (lesson.chapters || []).map(normalizeChapterBlocks),
    })),
  } as T;
}
