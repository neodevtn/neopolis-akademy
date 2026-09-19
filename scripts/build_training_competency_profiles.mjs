import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const coursesDir = path.join(root, "client/public/data/courses");
const outputPath = path.join(root, "shared/trainingCompetencyProfiles.json");
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));

const signals = [
  ["ai_governance", /governance|gouvernance|security|securit|safety|compliance|conformit|risk|risque|responsible|responsable|audit|clinical|clinique|medical|sante/i],
  ["rag_knowledge", /\brag\b|retrieval|embedding|knowledge|connaissance|document|recherche|research|vector|citation|source/i],
  ["ai_devops", /devops|mlops|llmops|deploy|production|observability|monitoring|infrastructure|serving|latency|reliability|fiabilit/i],
  ["ai_development", /developer|developp|software|logiciel|\bapi\b|\bsdk\b|python|typescript|javascript|fastapi|code|coding|program/i],
  ["ai_orchestration", /workflow|orchestration|automat|\bn8n\b|agent|multi-agent|mcp|make\.com|zapier/i],
  ["bi_ai", /business intelligence|\bbi\b|analytics|analyse de donn|data analyst|data scientist|reporting|dashboard|\bsql\b|finance|comptab|statisti|spreadsheet|excel/i],
  ["prompt_engineering", /prompt|instruction|context window|few-shot|system message|claude 101/i],
  ["ai_business", /business|metier|strategy|strategie|adoption|consult|marketing|sales|vente|recrut|human resource|ressource humaine|customer|relation client|service client|productivit/i],
  ["ai_solution_design", /architect|architecture|solution design|conception|use case|cas d.?usage|product management|transformation|system design/i],
];
const validIds = new Set(signals.map(([id]) => id));

function addScore(scores, id, amount) {
  if (!validIds.has(id)) return;
  scores.set(id, (scores.get(id) || 0) + amount);
}

function profileText(courseRef, course) {
  return JSON.stringify({
    certificationId: courseRef.certId,
    courseId: courseRef.id,
    group: courseRef.group,
    category: courseRef.category,
    targetJob: courseRef.targetJob,
    title: courseRef.title,
    description: courseRef.description,
    courseTitle: course.title,
    descriptionLong: course.description,
    lessons: (course.lessons || []).map((lesson) => ({
      title: lesson.title,
      competencyTags: lesson.competencyTags,
      chapterTitles: (lesson.chapters || []).map((chapter) => chapter.title),
    })),
  }).replace(/[_-]+/g, " ");
}

function deriveProfile(courseRef, course) {
  const text = profileText(courseRef, course);
  const scores = new Map();
  for (const [id, pattern] of signals) if (pattern.test(text)) addScore(scores, id, 4);
  for (const tag of new Set((course.lessons || []).flatMap((lesson) => Array.isArray(lesson.competencyTags) ? lesson.competencyTags : []))) addScore(scores, tag, 1);

  const certId = String(courseRef.certId || "");
  if (certId.includes("associate_foundations")) ["prompt_engineering", "ai_governance", "ai_solution_design"].forEach((id, rank) => addScore(scores, id, 12 - rank));
  if (certId.includes("architect")) ["ai_solution_design", "ai_governance", "rag_knowledge"].forEach((id, rank) => addScore(scores, id, 12 - rank));
  if (certId.includes("developer_foundations")) ["ai_development", "ai_devops", "ai_orchestration"].forEach((id, rank) => addScore(scores, id, 12 - rank));
  if (certId.includes("science_recherche_sante")) ["bi_ai", "ai_governance", "rag_knowledge"].forEach((id, rank) => addScore(scores, id, 14 - rank));
  if (/finance|comptab/i.test(text)) ["bi_ai", "ai_governance", "ai_orchestration"].forEach((id, rank) => addScore(scores, id, 10 - rank));
  if (/data analyst|analyse de donn|analytics|reporting|dashboard|excel|spreadsheet|statisti/i.test(text)) ["bi_ai", "ai_governance", "prompt_engineering"].forEach((id, rank) => addScore(scores, id, 12 - rank));
  if (/human resource|ressource humaine|recrut/i.test(text)) ["ai_business", "ai_governance", "ai_orchestration"].forEach((id, rank) => addScore(scores, id, 10 - rank));
  if (/legal|juridi|contract|compliance/i.test(text)) ["ai_governance", "rag_knowledge", "ai_solution_design"].forEach((id, rank) => addScore(scores, id, 10 - rank));
  if (/marketing|sales|vente|crm|customer|relation client|service client|e-?commerce/i.test(text)) ["ai_business", "prompt_engineering", "ai_orchestration"].forEach((id, rank) => addScore(scores, id, 9 - rank));

  if (!scores.size) addScore(scores, /developer|code|api/i.test(text) ? "ai_development" : "ai_business", 1);
  const total = Array.from(scores.values()).sort((a, b) => b - a).slice(0, 3).reduce((sum, value) => sum + value, 0) || 1;
  return Array.from(scores.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 3)
    .map(([competencyId, score]) => ({ competencyId, weight: Math.round((score / total) * 100) / 100 }));
}

const courses = {};
const certifications = {};
for (const courseRef of index.courses || []) {
  const sourcePath = path.join(coursesDir, `${courseRef.id}.json`);
  const course = fs.existsSync(sourcePath) ? JSON.parse(fs.readFileSync(sourcePath, "utf8")) : {};
  const profile = deriveProfile(courseRef, course);
  courses[courseRef.id] = profile;
  const aggregate = certifications[courseRef.certId] || new Map();
  for (const item of profile) aggregate.set(item.competencyId, Math.max(aggregate.get(item.competencyId) || 0, item.weight));
  certifications[courseRef.certId] = aggregate;
}
for (const [certificationId, aggregate] of Object.entries(certifications)) {
  const selected = Array.from(aggregate.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 3);
  const total = selected.reduce((sum, [, weight]) => sum + weight, 0) || 1;
  certifications[certificationId] = selected.map(([competencyId, weight]) => ({ competencyId, weight: Math.round((weight / total) * 100) / 100 }));
}

fs.writeFileSync(outputPath, `${JSON.stringify({ version: "2026-09-19-v2", courses, certifications }, null, 2)}\n`);
const cardinality = Object.values(courses).reduce((counts, profile) => ({ ...counts, [profile.length]: (counts[profile.length] || 0) + 1 }), {});
console.log(JSON.stringify({ outputPath, courses: Object.keys(courses).length, certifications: Object.keys(certifications).length, cardinality }, null, 2));
