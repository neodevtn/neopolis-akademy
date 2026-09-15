import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coursesDir = path.join(root, 'client/public/data/courses');
const output = path.join(root, 'docs/anthropic-8020-static-audit.json');
const completed = new Set([
  ...Array.from({ length: 8 }, (_, index) => `claude_certified_associate_foundations__${String(index + 1).padStart(2, '0')}`),
  'claude_certified_developer_foundations__01',
  'claude_certified_developer_foundations__02',
  'claude_certified_architect_foundations__01',
]);
const certificationCourse = /^claude_certified_(developer_foundations|architect_foundations|architect_professional)__\d+\.json$/;
const englishPatterns = /\b(system prompt|output constraint|structured outputs|few[‑-]shot examples|few[‑-]shot pairs|workflow|workflows|Watch Out|What good looks like|Tool Use|Extended Thinking)\b/gi;
const walk = (value, list = []) => {
  if (Array.isArray(value)) value.forEach((item) => walk(item, list));
  else if (value && typeof value === 'object') {
    if (typeof value.fr === 'string') list.push(value.fr);
    Object.values(value).forEach((item) => walk(item, list));
  }
  return list;
};
const files = fs.readdirSync(coursesDir)
  .filter((file) => certificationCourse.test(file))
  .sort();
const courses = files.map((file) => {
  const data = JSON.parse(fs.readFileSync(path.join(coursesDir, file), 'utf8'));
  const lesson = data.lessons?.[0] || {};
  const texts = walk(data);
  const chapters = lesson.chapters || [];
  const cards = chapters.flatMap((chapter) => chapter.blocks || [])
    .filter((block) => block.type === 'flip_cards')
    .flatMap((block) => block.cards || []);
  const videos = chapters.flatMap((chapter) => chapter.blocks || []).filter((block) => block.type === 'video');
  const issues = {
    missingOfficialDuration: !Number.isFinite(lesson.officialDurationMinutes) || lesson.officialDurationMinutes < 1,
    freeTextRootExercises: (data.exercises || []).filter((exercise) => exercise.interactionType === 'free_text').length,
    emptyFrenchFields: texts.filter((text) => !text.trim()).length,
    likelyEnglishTerms: [...new Set(texts.flatMap((text) => [...text.matchAll(englishPatterns)].map((match) => match[0])))],
    concatenatedDashRows: texts.filter((text) => /^.{3,80}\s+—\s+.{3,80}\s+—\s+.{3,80}/m.test(text)).length,
    shortCardBacks: cards.filter((card) => typeof card.back?.fr === 'string' && card.back.fr.trim().length > 0 && card.back.fr.trim().length < 55).length,
    unsourcedVideoBlocks: videos.filter((block) => !block.source && !block.provenance && !block.video?.source).length,
  };
  return {
    courseId: data.courseId,
    file,
    includedIn8020Sweep: !completed.has(data.courseId),
    title: lesson.title?.fr || lesson.title?.en || '',
    chapterCount: chapters.length,
    rootExerciseCount: (data.exercises || []).length,
    videoBlockCount: videos.length,
    issues,
    highImpact: !completed.has(data.courseId) && (issues.missingOfficialDuration || issues.freeTextRootExercises > 0 || issues.concatenatedDashRows > 0 || issues.unsourcedVideoBlocks > 0 || issues.likelyEnglishTerms.length > 0),
  };
});
const included = courses.filter((course) => course.includedIn8020Sweep);
const report = {
  generatedAt: new Date().toISOString(),
  scope: 'Certification Anthropic only; Associate 1–8, Developer 1–2 and Architect Foundations 1 are excluded as already handled.',
  includedCourseCount: included.length,
  highImpactCourseCount: included.filter((course) => course.highImpact).length,
  courses: included,
};
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ includedCourseCount: report.includedCourseCount, highImpactCourseCount: report.highImpactCourseCount }, null, 2));
