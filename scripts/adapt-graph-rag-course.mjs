import fs from "node:fs";
const path = "client/public/data/courses/graph_rag_with_langchain_and_neo4j__01.json";
const course = JSON.parse(fs.readFileSync(path, "utf8"));
let cleared = 0;
let removedVisualExercises = 0;
for (const lesson of course.lessons) for (const chapter of lesson.chapters) for (const block of chapter.blocks ?? []) for (const slide of block.projectorSlides ?? [block]) for (const key of ["content", "contentLeft", "contentRight"]) {
  if (typeof slide[key] === "string" && /https?:\/\/www\.datacamp\.com\//.test(slide[key])) { slide[key] = ""; cleared++; }
}
for (const lesson of course.lessons) {
  const before = lesson.chapters.length;
  lesson.chapters = lesson.chapters.filter((chapter) => chapter.id !== "dc_ch02_act02");
  removedVisualExercises += before - lesson.chapters.length;
}
fs.writeFileSync(path, `${JSON.stringify(course, null, 2)}\n`);
console.log(JSON.stringify({ cleared, removedVisualExercises }));
