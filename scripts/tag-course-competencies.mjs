import fs from "node:fs";
import path from "node:path";

const coursesDir = path.resolve("client/public/data/courses");
const signals = [
  ["prompt_engineering", /prompt|instruction|system prompt|few-shot|context window|sampling/i],
  ["ai_solution_design", /architect|solution design|conception|use case|cas d.?usage/i],
  ["ai_development", /developer|api|sdk|code|python|typescript|integration/i],
  ["rag_knowledge", /rag|retrieval|embedding|knowledge base|base de connaissances/i],
  ["ai_orchestration", /workflow|n8n|orchestration|agent|automation|automatisation/i],
  ["ai_devops", /devops|deploy|deployment|production|observability|monitoring|eval|reliability/i],
  ["bi_ai", /business intelligence|\bbi\b|analytics|reporting|data analysis|analyse de donn/i],
  ["ai_governance", /governance|security|safety|compliance|risk|sécurit|gouvernance/i],
  ["ai_business", /business|strategy|adoption|roi|sales|commercial|métier/i],
];
let lessons = 0;
for (const file of fs.readdirSync(coursesDir).filter((name) => name.endsWith(".json"))) {
  const full = path.join(coursesDir, file);
  const course = JSON.parse(fs.readFileSync(full, "utf8"));
  let changed = false;
  for (const lesson of course.lessons || []) {
    const source = JSON.stringify({ courseId: course.courseId, title: lesson.title, chapters: lesson.chapters?.map((chapter) => ({ title: chapter.title, blocks: chapter.blocks?.slice(0, 3) })) });
    const tags = signals.filter(([, pattern]) => pattern.test(source)).map(([tag]) => tag);
    const next = tags.length ? tags : ["ai_solution_design"];
    if (JSON.stringify(lesson.competencyTags || []) !== JSON.stringify(next)) { lesson.competencyTags = next; changed = true; }
    lessons += 1;
  }
  if (changed) fs.writeFileSync(full, `${JSON.stringify(course, null, 2)}\n`);
}
console.log(`Tagged ${lessons} lessons with competency tags.`);
