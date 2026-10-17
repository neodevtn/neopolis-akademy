#!/usr/bin/env node
/**
 * Contrôle structurel pédagogique des cours Neopolis.
 * Produit uniquement des constats d'audit révisables ; ne modifie aucun cours.
 * Usage: node scripts/audit-pedagogical-static.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const coursesDir = path.join(root, "client/public/data/courses");
const outDir = path.join(root, "pedagogical-audit");
const outPath = path.join(outDir, "static-audit-data.json");
fs.mkdirSync(outDir, { recursive: true });

const text = (value, locale = "fr") => {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") return String(value[locale] || value.fr || value.en || "").trim();
  return "";
};
const compact = (value, max = 360) => text(value).replace(/\s+/g, " ").slice(0, max);
const meaningful = (value) => text(value).replace(/<[^>]*>/g, "").replace(/[#*_`>|-]/g, "").trim();
const activityTypes = new Set([
  "checkpoint", "single_choice_exercise", "multi_choice_exercise", "resource_review",
  "cloud_exercise", "exercise", "matching", "bucket_sort", "ordering", "fill_blank",
  "code_repl", "terminal_sim", "ai_evaluation", "knowledge_check", "inline_myth_reality",
  "inline_multiple_choice_feedback", "inline_scenario_question_feedback", "course_final_quiz",
  "reflection", "guided_action",
]);
const explanatoryTypes = new Set(["content", "text", "callout", "comparison", "tabbed_content", "transcript", "key_points_summary", "mistake_correction_pairs", "timeline_step_cards", "process_flow_diagram"]);
const mediaTypes = new Set(["video", "audio", "image", "illustration", "diagram", "FullSlide", "TitleSlide", "TwoColumns", "FinalSlide"]);

function hasUsableText(value) { return meaningful(value).length >= 20; }
function issue(base, overrides) { return { ...base, confidence: "high", verification_status: "verified_static", ...overrides }; }
function blockLabel(block) { return compact(block.title || block.question || block.prompt || block.instructions || block.assignment || block.body, 240) || "Aucun libellé exploitable"; }

const results = [];
for (const filename of fs.readdirSync(coursesDir).filter((name) => name.endsWith(".json")).sort()) {
  const sourcePath = path.join(coursesDir, filename);
  const course = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const courseId = course.courseId || course.id || path.basename(filename, ".json");
  const exercises = new Map((course.exercises || []).map((entry) => [entry.id, entry]));
  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  const courseIssues = [];
  const add = (lessonIndex, chapterIndex, chapter, block, severity, category, description, proposed, confidence = "high") => {
    courseIssues.push(issue({
      issue_id: `static:${courseId}:${lessonIndex}:${chapterIndex}:${block?.id || block?.exerciseId || block?.type || "chapter"}:${courseIssues.length + 1}`,
      course_id: courseId,
      chapter_id: chapter?.id || `lesson_${lessonIndex + 1}_chapter_${chapterIndex + 1}`,
      content_id: block?.id || block?.exerciseId || block?.type || "chapter",
      content_type: block?.type || "chapter",
      severity,
      category,
      description,
      current_content: block ? blockLabel(block) : compact(chapter?.title),
      proposed_content: proposed,
      evidence: `${path.relative(root, sourcePath)} → lessons[${lessonIndex}].chapters[${chapterIndex}]${block ? `.blocks[type=${block.type}]` : ""}`,
      recommended_action: proposed,
    }, { confidence }));
  };

  if (!lessons.length) {
    add(-1, -1, {}, null, "P0", "structure", "Le cours ne contient aucune leçon exploitable.", "Créer une structure de leçons et de chapitres avant publication.");
  }
  lessons.forEach((lesson, lessonIndex) => {
    const chapters = Array.isArray(lesson.chapters) ? lesson.chapters : [];
    if (!chapters.length) add(lessonIndex, -1, {}, null, "P1", "structure", "La leçon ne contient aucun écran pédagogique.", "Créer au moins un chapitre avec objectif, explication et activité adaptée.");
    chapters.forEach((chapter, chapterIndex) => {
      const blocks = Array.isArray(chapter.blocks) ? chapter.blocks : [];
      if (!chapter.id) add(lessonIndex, chapterIndex, chapter, null, "P1", "traçabilité", "L’écran ne possède pas d’identifiant stable, ce qui empêche un suivi pédagogique fiable.", "Attribuer un chapter_id stable et unique.");
      if (!meaningful(chapter.title)) add(lessonIndex, chapterIndex, chapter, null, "P1", "objectifs", "L’écran ne possède pas de titre pédagogique visible.", "Ajouter un titre explicite indiquant le concept ou l’action à apprendre.");
      if (!blocks.length) {
        add(lessonIndex, chapterIndex, chapter, null, "P0", "structure", "L’écran est vide : aucun contenu ne peut être présenté à l’apprenant.", "Ajouter un contenu pédagogique ou retirer l’écran.");
        return;
      }
      const hasExplanation = blocks.some((block) => explanatoryTypes.has(block?.type) && (hasUsableText(block.body) || hasUsableText(block.content) || hasUsableText(block.description)));
      const activities = blocks.filter((block) => activityTypes.has(block?.type));
      const media = blocks.filter((block) => mediaTypes.has(block?.type));
      // A standard checkpoint delegates its visible prompt and correction to the
      // referenced course exercise. Likewise, scenario checks place their
      // learner-facing statement in `scenario`. Audit the rendered source, not
      // just the small wrapper block stored in the chapter.
      const activityPrompt = (block) => {
        const linkedExercise = block?.type === "checkpoint" && block.exerciseId ? exercises.get(block.exerciseId) : null;
        return block?.question || block?.prompt || block?.scenario || block?.instructions || block?.assignment || block?.body || linkedExercise?.prompt || linkedExercise?.instructions || linkedExercise?.title || block?.title;
      };
      const activitiesAreSelfContained = activities.length > 0 && activities.every((block) => hasUsableText(activityPrompt(block)));
      if (activities.length && !hasExplanation && !activitiesAreSelfContained) {
        add(lessonIndex, chapterIndex, chapter, null, "P1", "progression", "Une activité apparaît sans explication textuelle suffisante dans le même écran ; les prérequis doivent être confirmés manuellement.", "Ajouter une courte mise en contexte : objectif, connaissance à mobiliser et transition vers l’activité.", "medium");
      }
      if (media.length && !hasExplanation) {
        for (const block of media) {
          const videoSupport = block.type === "video" && (hasUsableText(block.objectiveBefore) || hasUsableText(block.alternativeTextFr) || hasUsableText(block.transcript) || Array.isArray(block.questionsAfter) && block.questionsAfter.length > 0);
          if (!videoSupport) add(lessonIndex, chapterIndex, chapter, block, "P2", "média", "La ressource média n’est pas contextualisée par une explication, un objectif de visionnage ou une alternative textuelle vérifiable dans cet écran.", "Ajouter avant le média l’objectif, ce que l’apprenant doit observer, puis une explication ou activité de réinvestissement après lecture.", "medium");
        }
      }
      for (const block of activities) {
        const prompt = activityPrompt(block);
        if (!hasUsableText(prompt)) add(lessonIndex, chapterIndex, chapter, block, "P0", "énoncé", "L’activité ne contient aucun énoncé ou consigne exploitable par l’apprenant.", "Rédiger un énoncé indiquant l’objectif, l’action attendue, le résultat attendu et le critère de réussite.");
        if (["single_choice_exercise", "multi_choice_exercise"].includes(block.type)) {
          const options = Array.isArray(block.options) ? block.options : [];
          if (options.length < 2) add(lessonIndex, chapterIndex, chapter, block, "P0", "activité", "Le QCM ne fournit pas au moins deux options sélectionnables.", "Ajouter des options distinctes et valides.");
          // Server-validated choices only release their answer key and
          // explanation after a submission; this is still observable feedback
          // and must not be reported as missing by a static scan.
          if (!hasUsableText(block.explanation) && block.serverValidated !== true) add(lessonIndex, chapterIndex, chapter, block, "P2", "feedback", "Le QCM ne contient pas d’explication pédagogique observable après réponse.", "Ajouter un feedback expliquant la réponse correcte et la raison des distracteurs.");
        }
        if (block.type === "checkpoint") {
          if (!block.exerciseId) add(lessonIndex, chapterIndex, chapter, block, "P0", "verrouillage", "Le checkpoint obligatoire ne référence aucun exercice à rendre ou valider.", "Associer le checkpoint à un exerciseId existant et vérifiable.");
          else if (!exercises.has(block.exerciseId)) add(lessonIndex, chapterIndex, chapter, block, "P0", "verrouillage", "Le checkpoint référence un exercice absent de la banque du cours.", "Créer ou restaurer l’exercice référencé, ou corriger exerciseId.");
        }
        if (block.type === "cloud_exercise") {
          if (!hasUsableText(block.instructions) && !hasUsableText(block.assignment)) add(lessonIndex, chapterIndex, chapter, block, "P0", "énoncé", "Le TP ne précise pas clairement ce que l’apprenant doit réaliser.", "Ajouter une consigne détaillée, un résultat attendu et un exemple de preuve recevable.");
          if (!Array.isArray(block.steps) || !block.steps.length) add(lessonIndex, chapterIndex, chapter, block, "P1", "guidage", "Le TP ne contient aucune étape de réalisation structurée.", "Ajouter des étapes courtes, séquentielles et vérifiables.");
          // A server-graded practical deliberately keeps its model correction
          // private until submission. Its post-submission feedback is therefore
          // available without exposing a solution in the course JSON.
          if (!hasUsableText(block.solution) && !hasUsableText(block.hint) && typeof block.serverGradedAssessment !== "string") add(lessonIndex, chapterIndex, chapter, block, "P2", "feedback", "Le TP ne propose ni indice ni élément de correction observable.", "Ajouter au minimum un indice progressif et une correction pédagogique post-soumission.");
        }
        if (block.type === "ai_evaluation") {
          if (!hasUsableText(block.prompt)) add(lessonIndex, chapterIndex, chapter, block, "P0", "énoncé", "L’évaluation IA ne possède pas de consigne exploitable.", "Ajouter une consigne précise décrivant la production attendue.");
          const hasStructuredRubric = Array.isArray(block.rubricCriteria) && block.rubricCriteria.length > 0;
          const hasLegacyVisibleRubric = hasUsableText(block.rubric);
          if (!hasStructuredRubric && !hasLegacyVisibleRubric) add(lessonIndex, chapterIndex, chapter, block, "P1", "évaluation", "L’évaluation IA ne fournit pas de critères structurés visibles et vérifiables.", "Ajouter des critères, descriptions, pondérations et seuil de réussite explicites.");
        }
        if (["matching", "bucket_sort", "ordering", "fill_blank", "terminal_sim", "code_repl"].includes(block.type) && !hasUsableText(block.instructions)) {
          add(lessonIndex, chapterIndex, chapter, block, "P1", "énoncé", "L’activité interactive ne comporte pas de consigne d’utilisation explicite.", "Préciser ce que l’apprenant doit sélectionner, déplacer, saisir ou exécuter, ainsi que le résultat attendu.");
        }
      }
    });
  });
  results.push({ course_id: courseId, source_file: path.relative(root, sourcePath), lesson_count: lessons.length, chapter_count: lessons.reduce((sum, lesson) => sum + (lesson.chapters || []).length, 0), issue_count: courseIssues.length, issues: courseIssues });
}

const allIssues = results.flatMap((entry) => entry.issues);
const summary = {
  generated_at: new Date().toISOString(),
  audit_type: "static_structural_pre-audit",
  coverage: { course_count: results.length, chapter_count: results.reduce((sum, entry) => sum + entry.chapter_count, 0), verification_status: "verified_static_only" },
  severity_counts: Object.fromEntries(["P0", "P1", "P2", "P3"].map((severity) => [severity, allIssues.filter((entry) => entry.severity === severity).length])),
  category_counts: Object.fromEntries([...new Set(allIssues.map((entry) => entry.category))].sort().map((category) => [category, allIssues.filter((entry) => entry.category === category).length])),
  limitations: ["Les constats statiques ne prouvent pas le rendu navigateur, l’accessibilité réelle, la qualité factuelle des vidéos ni la pertinence d’un prérequis situé dans un écran antérieur.", "Chaque constat doit être consolidé par une revue pédagogique humaine ou agentique du cours concerné avant correction."],
  courses: results,
};
fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify({ output: path.relative(root, outPath), courses: results.length, chapters: summary.coverage.chapter_count, issues: allIssues.length, severity_counts: summary.severity_counts }, null, 2));
