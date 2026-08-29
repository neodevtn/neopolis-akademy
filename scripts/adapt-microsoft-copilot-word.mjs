import fs from "node:fs";

const source = JSON.parse(fs.readFileSync("/home/ubuntu/datacamp_packages/microsoft-copilot-in-word/microsoft-copilot-in-word/COURSE_MANIFEST.json", "utf8"));
const path = "client/public/data/courses/microsoft_copilot_in_word__01.json";
const course = JSON.parse(fs.readFileSync(path, "utf8"));
const removed = new Set(["dc_ch01_act03", "dc_ch02_act05", "dc_ch02_act06", "dc_ch02_act08", "dc_ch03_act03"]);
const byKey = new Map(source.chapters.flatMap((chapter) => chapter.activities.map((activity) => [`${activity.chapter_number}.${activity.exercise_number}`, activity])));

const rubric = (prompt, id) => (prompt?.match(/<required_elements>\s*([\s\S]*?)\s*<\/required_elements>/i)?.[1] || "")
  .split(/\n(?=\s*\d+\.)/)
  .filter((value) => /^\s*\d+\./.test(value))
  .map((value, index) => ({
    id: `${id}_criterion_${index + 1}`,
    label: value.replace(/^\s*\d+\.\s*/, "").split(":")[0].replace(/\*\*/g, "").trim(),
    description: value.replace(/^\s*\d+\.\s*/, "").replace(/\*\*/g, "").trim(),
    weight: 1,
  }));

const removeProviderRecommendation = (value) => typeof value === "string"
  ? value
    .replace(/\s*Finally, and if you are ready to learn more, we have more DataCamp content for you, as well as Microsoft resources\.\s*/gi, "\n")
    .replace(/\s*\$\$\s*_Explorez plus de ressources DataCamp et Microsoft_\s*/gi, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  : value;

for (const lesson of course.lessons) {
  lesson.chapters = lesson.chapters.filter((chapter) => !removed.has(chapter.id));
  for (const chapter of lesson.chapters) {
    const match = chapter.id.match(/^dc_ch(\d+)_act(\d+)$/);
    const activity = match && byKey.get(`${Number(match[1])}.${Number(match[2])}`);
    for (const block of chapter.blocks || []) {
      if (block.type === "cloud_exercise") {
        const criteria = rubric(activity?.content?.question?.prompt, block.id);
        if (criteria.length) {
          Object.assign(block, {
            rubricCriteria: criteria,
            maxScore: criteria.length,
            passingScore: criteria.length,
            minWords: 1,
            rubricVersion: "datacamp-source-2026-08-28",
            evaluationPrompt: block.assignment,
            environmentGuide: {
              fr: "Utilisez un assistant IA génératif auquel vous avez personnellement accès. Ne partagez ni clé API, ni donnée confidentielle.",
              en: "Use a generative AI assistant you can personally access. Never share API keys or confidential data.",
            },
          });
        }
      }
      if (block.type === "video") {
        for (const slide of block.projectorSlides || []) {
          for (const field of ["script", "content", "contentLeft", "contentRight"]) {
            slide[field] = removeProviderRecommendation(slide[field]);
          }
        }
        for (const segment of block.transcriptSegments || []) {
          for (const field of ["heading", "text"]) {
            segment[field] = removeProviderRecommendation(segment[field]);
          }
        }
        block.transcript = removeProviderRecommendation(block.transcript);
      }
    }
  }
}

fs.writeFileSync(path, `${JSON.stringify(course, null, 2)}\n`);
console.log(JSON.stringify({
  activities: course.lessons.flatMap((lesson) => lesson.chapters).length,
  rubricated: course.lessons.flatMap((lesson) => lesson.chapters).flatMap((chapter) => chapter.blocks || []).filter((block) => block.type === "cloud_exercise" && block.rubricCriteria?.length).length,
}));
