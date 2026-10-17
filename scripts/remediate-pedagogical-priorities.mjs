import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const auditPath = path.join(root, "pedagogical-audit", "07-audit-data.json");
const coursesDir = path.join(root, "client", "public", "data", "courses");
const manifestPath = path.join(root, "pedagogical-audit", "remediation-manifest.json");

const removableCategories = new Set([
  "ressource_essentielle_non_declaree",
  "ressource_prérequis",
  "ressource_et_énoncé",
  "ressources_et_prerequis",
  "accessibilité des ressources",
]);

const removableContentTypes = new Set([
  "cloud_exercise",
  "code_repl",
  "terminal_sim",
  "ai_evaluation",
  "resource_review",
]);

function isResourceFailure(issue) {
  const category = String(issue.category || "").toLocaleLowerCase("fr");
  const description = String(issue.description || "").toLocaleLowerCase("fr");
  return removableCategories.has(issue.category)
    || category.includes("ressource")
    || category.includes("fichier")
    || description.includes("aucun fichier")
    || description.includes("aucune ressource")
    || description.includes("jeu de données")
    || description.includes("pack")
    || description.includes("télécharger") && description.includes("non fourni");
}

function isUnexecutableCode(issue) {
  const description = String(issue.description || "").toLocaleLowerCase("fr");
  return issue.content_type === "code_repl"
    && (description.includes("ne lance aucune commande")
      || description.includes("ne lance pas claude code")
      || description.includes("compare") && description.includes("solution textuelle")
      || description.includes("éditeur navigateur"));
}

function keyFor(issue) {
  return `${issue.course_id}::${issue.content_id}`;
}

function recomputeCourseMetadata(course) {
  const lessons = course.lessons || [];
  const chapters = lessons.flatMap((lesson) => lesson.chapters || []);
  const blocks = chapters.flatMap((chapter) => chapter.blocks || []);
  const interactive = new Set([
    "exercise", "single_choice_exercise", "multi_choice_exercise", "multi_choice", "matching",
    "bucket_sort", "fill_blank", "code_repl", "terminal_sim", "ai_evaluation", "ordering",
    "cloud_exercise", "resource_review", "checkpoint", "course_final_quiz", "reflection",
    "guided_action", "knowledge_check",
  ]);
  const referencedAssessments = new Set(blocks.filter((b) => b.type === "checkpoint").map((b) => b.exerciseId ?? b.exerciseIndex).filter((v) => v !== undefined && v !== null));
  const downloadUrls = new Set();
  let downloadsWithoutUrl = 0;
  for (const block of blocks) {
    const urls = [
      block.url, block.downloadUrl, block.fileUrl, block.download_url, block.slidesPdf,
      ...(Array.isArray(block.resources) ? block.resources.map((r) => r?.url) : []),
      ...(Array.isArray(block.downloads) ? block.downloads.map((r) => r?.url || r) : []),
    ].filter((v) => typeof v === "string" && v.trim());
    urls.forEach((url) => downloadUrls.add(url));
    if (["download", "file_download"].includes(block.type) && urls.length === 0) downloadsWithoutUrl += 1;
  }
  course.lessonCount = lessons.length;
  course.chapterCount = chapters.length;
  course.totalActivities = chapters.length;
  course.exerciseCount = blocks.filter((b) => interactive.has(b.type)).length + referencedAssessments.size;
  course.videoCount = blocks.filter((b) => b.type === "video").length;
  course.downloadCount = downloadUrls.size + downloadsWithoutUrl;
}

const audit = JSON.parse(await fs.readFile(auditPath, "utf8"));
const removableIssues = audit.issues.filter((issue) => {
  if (!(["P0", "P1", "P2"].includes(issue.severity))) return false;
  return (removableContentTypes.has(issue.content_type) && (isResourceFailure(issue) || isUnexecutableCode(issue)))
    || (issue.content_type === "checkpoint_exercise" && isResourceFailure(issue));
});
const targets = new Map(removableIssues.map((issue) => [keyFor(issue), issue]));
const changed = [];
const removedChapters = [];
const touchedCourses = new Set();

for (const file of (await fs.readdir(coursesDir)).filter((name) => name.endsWith(".json"))) {
  const filePath = path.join(coursesDir, file);
  const course = JSON.parse(await fs.readFile(filePath, "utf8"));
  let courseChanged = false;
  for (const lesson of course.lessons || []) {
    const nextChapters = [];
    for (const chapter of lesson.chapters || []) {
      const before = chapter.blocks || [];
      const removed = [];
      const after = before.filter((block) => {
        const id = block.id || block.exerciseId;
        const issue = id ? targets.get(`${course.courseId}::${id}`) : undefined;
        if (!issue) return true;
        removed.push({ id, type: block.type, severity: issue.severity, category: issue.category, issueId: issue.issue_id, reason: issue.description });
        return false;
      });
      if (removed.length) {
        courseChanged = true;
        touchedCourses.add(course.courseId);
        changed.push({ courseId: course.courseId, chapterId: chapter.id || chapter.chapter_id || null, removed });
      }
      chapter.blocks = after;
      if (after.length > 0) {
        nextChapters.push(chapter);
      } else if (before.length > 0) {
        removedChapters.push({ courseId: course.courseId, chapterId: chapter.id || chapter.chapter_id || null, reason: "Écran devenu vide après retrait d’une activité irréalisable" });
      }
    }
    lesson.chapters = nextChapters;
  }
  course.lessons = (course.lessons || []).filter((lesson) => (lesson.chapters || []).length > 0);
  if (courseChanged) {
    recomputeCourseMetadata(course);
    await fs.writeFile(filePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
  }
}

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  policy: "Supprimer les activités obligatoires irréalisables faute de fichier/corpus/environnement fourni ; ne rien inventer. Supprimer aussi les activités code dont le renderer ne peut pas exécuter la tâche décrite.",
  auditSource: "pedagogical-audit/07-audit-data.json",
  issueCountSelected: removableIssues.length,
  changedBlocks: changed,
  removedChapters,
  touchedCourses: [...touchedCourses].sort(),
  remainingSelectedIssues: removableIssues.filter((issue) => !changed.some((entry) => entry.removed.some((block) => block.issueId === issue.issue_id))),
};
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ selectedIssues: removableIssues.length, changedBlocks: changed.reduce((sum, item) => sum + item.removed.length, 0), removedChapters: removedChapters.length, touchedCourses: touchedCourses.size, manifestPath }, null, 2));
