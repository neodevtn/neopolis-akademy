import fs from "node:fs";

const coursePath = "client/public/data/courses/building_ai_agents_with_haystack__01.json";
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const removed = [];

for (const lesson of course.lessons) {
  lesson.chapters = lesson.chapters.filter((chapter) => {
    if (chapter.sourceActivityType === "DatalabExercise") { removed.push(chapter.id); return false; }
    return true;
  });
  for (const chapter of lesson.chapters) for (const block of chapter.blocks ?? []) for (const slide of block.projectorSlides ?? [block]) for (const key of ["content", "contentLeft", "contentRight"]) {
    if (typeof slide[key] === "string" && /https?:\/\//.test(slide[key])) slide[key] = "";
  }
  for (const chapter of lesson.chapters) for (const block of chapter.blocks ?? []) {
    for (const key of ["script", "transcript"]) if (typeof block[key] === "string") block[key] = block[key].replace(/The format of this course[\s\S]*?not an AI expert\.\s*/g, "");
    for (const segment of block.transcriptSegments ?? []) if (typeof segment.text === "string" && /DataCamp’s DataLab environment/.test(segment.text)) segment.text = "";
    for (const slide of block.projectorSlides ?? []) for (const key of ["script", "content", "contentLeft", "contentRight"]) if (typeof slide[key] === "string" && /DataCamp’s DataLab environment/.test(slide[key])) slide[key] = "";
  }
}
course.exerciseCount = 0;
fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log(JSON.stringify({ activities: course.lessons.flatMap((lesson) => lesson.chapters).length, removed, exerciseCount: course.exerciseCount }));
