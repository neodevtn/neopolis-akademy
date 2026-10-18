/**
 * Produces a block-library representation for legacy chapter fields while retaining
 * their original fields. Keeping the originals protects legacy learner renderers and
 * lets the migration be safely repeated.
 */
export function normalizeChapterBlocks(chapter: any) {
  const existingBlocks = Array.isArray(chapter?.blocks) ? [...chapter.blocks] : [];
  const generated: any[] = [];
  const legacyBlock = chapter?.block;

  // A video does not replace the lesson objectives or explanation stored in
  // legacy chapter.body. Promote that text before playback, but never duplicate
  // a body already explicitly represented in an existing standard content block.
  const normalizedText = (value: any): string => typeof value === "string"
    ? value.replace(/\s+/g, " ").trim()
    : value && typeof value === "object" ? Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, content]) => `${key}:${normalizedText(content)}`).join("|") : "";
  const legacyBody = normalizedText(chapter?.body);
  const hasRenderedExplanation = existingBlocks.some((block: any) => {
    if (!["content", "text", "callout"].includes(block?.type)) return false;
    return normalizedText(block?.body || block?.content).length > 0;
  });
  if (legacyBody && existingBlocks.some((block: any) => block?.type === "video") && !hasRenderedExplanation) {
    existingBlocks.unshift({ type: "content", id: `${chapter?.id || "chapter"}__legacy_body`, body: chapter.body });
  }

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
