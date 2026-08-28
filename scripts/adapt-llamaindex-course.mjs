import fs from "node:fs";

const coursePath = "client/public/data/courses/building_agentic_workflows_with_llamaindex__01.json";
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const removed = [];

for (const lesson of course.lessons) {
  lesson.chapters = lesson.chapters.filter((chapter) => {
    if (chapter.sourceActivityType === "DatalabExercise") {
      removed.push(chapter.id);
      return false;
    }
    return true;
  });
  for (const chapter of lesson.chapters) {
    for (const block of chapter.blocks ?? []) {
      for (const slide of block.projectorSlides ?? [block]) {
        for (const key of ["content", "contentLeft", "contentRight"]) {
          if (typeof slide[key] === "string" && /https?:\/\//.test(slide[key])) slide[key] = "";
        }
      }
    }
  }
}

course.exerciseCount = 0;
fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log(JSON.stringify({ activities: course.lessons.flatMap((lesson) => lesson.chapters).length, removed, exerciseCount: course.exerciseCount }));
