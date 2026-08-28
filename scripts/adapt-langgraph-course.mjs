import fs from "node:fs";

const coursePath = "client/public/data/courses/multi_agent_systems_with_langgraph__01.json";
const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
const removed = [];
const cleanVisibleText = (text) => typeof text === "string"
  ? text.replace(/DataCamp/g, "plateforme source").replace(/DataLab/g, "environnement de pratique")
  : text;

for (const lesson of course.lessons) {
  lesson.chapters = lesson.chapters.filter((chapter) => {
    if (chapter.sourceActivityType === "DatalabExercise") {
      removed.push(chapter.id);
      return false;
    }
    return true;
  });
  for (const chapter of lesson.chapters) for (const block of chapter.blocks ?? []) {
    for (const slide of block.projectorSlides ?? [block]) {
      for (const key of ["content", "contentLeft", "contentRight", "instructorTitle"]) {
        slide[key] = cleanVisibleText(slide[key]);
        if (typeof slide[key] === "string" && /https?:\/\//.test(slide[key])) slide[key] = "";
      }
    }
    for (const segment of block.transcriptSegments ?? []) segment.text = cleanVisibleText(segment.text);
    for (const locale of Object.values(block.description ?? {})) cleanVisibleText(locale);
  }
}

course.exerciseCount = 0;
fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);
console.log(JSON.stringify({ activities: course.lessons.flatMap((lesson) => lesson.chapters).length, removed, exerciseCount: course.exerciseCount }));
