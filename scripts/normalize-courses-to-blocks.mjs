import fs from "node:fs/promises";
import path from "node:path";

const directory = path.join(process.cwd(), "client", "public", "data", "courses");
const files = (await fs.readdir(directory)).filter((file) => file.endsWith(".json"));
let changedCourses = 0;
let addedBlocks = 0;

function normalizedChapter(chapter) {
  const before = Array.isArray(chapter.blocks) ? chapter.blocks.length : 0;
  const existing = Array.isArray(chapter.blocks) ? [...chapter.blocks] : [];
  const generated = [];
  if (chapter.block) {
    if (chapter.block.type === "content" && chapter.block.body) generated.push({ type: "content", body: chapter.block.body });
    else if (chapter.block.type === "checkpoint" && Array.isArray(chapter.block.questions)) chapter.block.questions.forEach((question, index) => generated.push({ type: "single_choice_exercise", id: `checkpoint_q${index}`, question: question.question, options: (question.choices || []).map((choice) => ({ id: choice.id, text: choice.text })), correctAnswer: question.correctId || question.answer || "a", explanation: question.explanation }));
    else generated.push(chapter.block);
  }
  if (existing.length === 0 && chapter.body) generated.push({ type: "content", body: chapter.body });
  if (existing.length === 0 && chapter.type === "checkpoint" && Array.isArray(chapter.questions)) chapter.questions.forEach((question, index) => generated.push({ type: "single_choice_exercise", id: `checkpoint_q${index}`, question: question.question, options: (question.choices || []).map((choice) => ({ id: choice.id, text: choice.text })), correctAnswer: question.correctId || question.answer || "a", explanation: question.explanation }));
  const blocks = existing.length ? [...existing, ...generated] : generated;
  addedBlocks += Math.max(0, blocks.length - before);
  return blocks.length ? { ...chapter, blocks } : chapter;
}

for (const file of files) {
  const filePath = path.join(directory, file);
  const course = JSON.parse(await fs.readFile(filePath, "utf8"));
  const next = { ...course, lessons: (course.lessons || []).map((lesson) => ({ ...lesson, chapters: (lesson.chapters || []).map(normalizedChapter) })) };
  if (JSON.stringify(course) !== JSON.stringify(next)) {
    await fs.writeFile(filePath, `${JSON.stringify(next, null, 2)}\n`);
    changedCourses += 1;
  }
}
console.log(`Normalisation terminée : ${changedCourses} cours modifiés, ${addedBlocks} blocs standards ajoutés.`);
