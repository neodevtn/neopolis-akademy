import fs from "node:fs";

const courseId = process.env.PROJECTOR_AUDIT_ID || "multi_agent_systems_with_langgraph__01";
const course = JSON.parse(fs.readFileSync(`client/public/data/courses/${courseId}.json`, "utf8"));
const results = [];
for (const [lessonIndex, lesson] of course.lessons.entries()) for (const [chapterIndex, chapter] of lesson.chapters.entries()) for (const block of chapter.blocks ?? []) {
  if (block.type !== "video" || !block.projectorSlides?.length) continue;
  const visible = [block.title, block.instructorTitle, ...(block.projectorSlides ?? []).flatMap((slide) => [slide.heading, slide.content, slide.contentLeft, slide.contentRight, slide.instructorTitle]), ...(block.transcriptSegments ?? []).map((segment) => segment.text)].filter(Boolean).join("\n");
  results.push({ lessonIndex, chapterIndex, title: chapter.title, audioLocal: [block.audioUrl, block.mp4Url, block.hlsUrl].some((url) => /^\/api\/assets\//.test(url ?? "")), slidesLocal: /^\/api\/assets\//.test(block.slidesPdf ?? ""), slides: block.projectorSlides.length, transcriptSegments: block.transcriptSegments?.length ?? 0, providerReferenceVisible: /DataCamp|Copilot/i.test(visible) });
}
const report = { generatedAt: new Date().toISOString(), courseId, projectorCount: results.length, results, passed: results.length > 0 && results.every((item) => item.audioLocal && item.slidesLocal && item.slides > 0 && item.transcriptSegments > 0 && !item.providerReferenceVisible) };
fs.writeFileSync(`docs/${courseId}_projector_statistical_audit_2026-08-28.json`, `${JSON.stringify(report, null, 2)}\n`);
console.table(results);
if (!report.passed) process.exitCode = 1;
