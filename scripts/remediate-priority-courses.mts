#!/usr/bin/env tsx
/**
 * Remédiation pédagogique prioritaire, fondée sur des constats vérifiés.
 *
 * Principes :
 * - ne pas fabriquer de données, de critères ou de corrections ;
 * - retirer toute porte de progression qui ne peut pas être évaluée ;
 * - conserver les activités dont les réponses / critères sont déjà présents ;
 * - garder une trace idempotente des décisions de retrait.
 *
 * Usage : pnpm tsx scripts/remediate-priority-courses.mts [--check]
 */
import fs from "node:fs";
import path from "node:path";
import { ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS } from "../server/architectFoundationsCorrectionRegistry";

const root = path.resolve(import.meta.dirname, "..");
const coursesDir = path.join(root, "client", "public", "data", "courses");
const dryRun = process.argv.includes("--check");
const now = new Date().toISOString();

type Json = Record<string, any>;
type Decision = { courseId: string; chapterId?: string; blockId?: string; exerciseId?: string; action: string; reason: string; source?: string };

function jsonPath(...parts: string[]) { return path.join(root, ...parts); }
function readJson<T = Json>(file: string): T { return JSON.parse(fs.readFileSync(file, "utf8")) as T; }
function writeJson(file: string, value: unknown) {
  if (!dryRun) fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
function localized(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const item = value as { fr?: unknown; en?: unknown };
    return typeof item.fr === "string" ? item.fr : typeof item.en === "string" ? item.en : "";
  }
  return "";
}
function normalizedBody(chapter: Json): string {
  const body = chapter?.blocks?.[0]?.body ?? chapter?.blocks?.[0]?.content ?? "";
  return localized(body).replace(/\s+/g, " ").trim();
}
function isOnlyDownloadLesson(lesson: Json, filename: string): boolean {
  const blocks = (lesson?.chapters ?? []).flatMap((chapter: Json) => chapter?.blocks ?? []);
  return blocks.length > 0 && blocks.every((block: Json) => block.type === "download" && (block.filename === filename || block.title === filename));
}
function removeEmptyLessons(course: Json, decisions: Decision[]) {
  course.lessons = (course.lessons ?? []).filter((lesson: Json) => {
    const empty = !(lesson.chapters ?? []).length || (lesson.chapters ?? []).every((chapter: Json) => !(chapter.blocks ?? []).length);
    if (empty) decisions.push({ courseId: course.courseId, action: "removed_empty_lesson", reason: "Leçon devenue vide après retrait d’une activité non vérifiable." });
    return !empty;
  });
}
function cleanSections(course: Json) {
  if (!Array.isArray(course.sections)) return;
  const remaining = new Set((course.lessons ?? []).flatMap((lesson: Json) => [localized(lesson.title), localized(lesson.title).replace(/^Exercise:\s*/i, "")]).filter(Boolean));
  course.sections = course.sections
    .map((section: Json) => ({ ...section, lessons: Array.isArray(section.lessons) ? section.lessons.filter((title: unknown) => {
      const value = localized(title);
      return !value || remaining.has(value);
    }) : section.lessons }))
    .filter((section: Json) => !Array.isArray(section.lessons) || section.lessons.length > 0);
}

const allDecisions: Decision[] = [];
const architectRemovedExerciseIds = new Map<string, Set<string>>();

function remediateArchitect() {
  for (let suffix = 1; suffix <= 7; suffix += 1) {
    const courseId = `claude_certified_architect_foundations__${String(suffix).padStart(2, "0")}`;
    const file = path.join(coursesDir, `${courseId}.json`);
    const course = readJson(file);
    const freeText = new Set((course.exercises ?? [])
      .filter((exercise: Json) => exercise?.interactionType === "free_text")
      .map((exercise: Json) => exercise.id));
    const removed = new Set<string>();

    for (const lesson of course.lessons ?? []) {
      for (const chapter of lesson.chapters ?? []) {
        const previous = chapter.blocks ?? [];
        chapter.blocks = previous.filter((block: Json) => {
          const remove = block?.type === "checkpoint" && freeText.has(block.exerciseId);
          if (remove) {
            removed.add(block.exerciseId);
            allDecisions.push({
              courseId,
              chapterId: chapter.id,
              blockId: block.id,
              exerciseId: block.exerciseId,
              action: "removed_unverifiable_checkpoint",
              reason: "Validation libre sans clé de correction machine-évaluable ; la porte de progression ne peut pas être justifiée.",
              source: "pedagogical-audit/recheck/008-claude_certified_architect_foundations.json",
            });
          }
          return !remove;
        });
        if (previous.length !== chapter.blocks.length) {
          delete chapter.requiredExercisesPassed;
          if (chapter.type === "checkpoint") chapter.type = "teaching";
          if (chapter.blocks.length === 0) chapter.blocks = [];
        }
        if (Array.isArray(chapter.completionRule?.requires) && !chapter.blocks.some((block: Json) => block.type === "checkpoint")) {
          chapter.completionRule.requires = chapter.completionRule.requires.filter((requirement: unknown) => requirement !== "requiredExercisesPassed");
          if (!chapter.completionRule.requires.length) delete chapter.completionRule;
        }
      }
    }
    if (removed.size) {
      course.exercises = (course.exercises ?? []).filter((exercise: Json) => !removed.has(exercise.id));
      architectRemovedExerciseIds.set(courseId, removed);
    }

    if (suffix === 1) {
      const tutorialIds = new Set(["chapter_03", "chapter_03_video_2", "chapter_03_video_3", "chapter_03_video_4", "chapter_03_video_5", "chapter_03_video_6"]);
      const lesson = course.lessons?.[0];
      if (lesson) {
        lesson.chapters = lesson.chapters.filter((chapter: Json) => {
          if (!tutorialIds.has(chapter.id)) return true;
          allDecisions.push({
            courseId,
            chapterId: chapter.id,
            action: "removed_uncontextualized_supplementary_video",
            reason: "Tutoriel complémentaire non officiel sans objectif, question de réinvestissement ni alternative textuelle fiable dans les données publiées.",
            source: "pedagogical-audit/recheck/008-claude_certified_architect_foundations.json",
          });
          return false;
        });
      }
    }
    if (suffix === 2) {
      course.lessons = (course.lessons ?? []).filter((lesson: Json) => {
        if (!isOnlyDownloadLesson(lesson, "001_tools_008.ipynb")) return true;
        allDecisions.push({
          courseId,
          action: "removed_uncontextualized_download_lesson",
          reason: "Écran limité à un nom de fichier sans objectif, prérequis ni résultat attendu vérifiable.",
          source: "pedagogical-audit/recheck/008-claude_certified_architect_foundations.json",
        });
        return false;
      });
    }
    if (suffix === 5) {
      const corrupted = new Set(["Exercise: Connecting your tools", "Exercise: Enterprise search"]);
      for (const lesson of course.lessons ?? []) {
        lesson.chapters = (lesson.chapters ?? []).filter((chapter: Json) => {
          const titleValues = typeof chapter.title === "object" && chapter.title
            ? Object.values(chapter.title).filter((value): value is string => typeof value === "string")
            : [localized(chapter.title)];
          if (!titleValues.some((title) => corrupted.has(title))) return true;
          allDecisions.push({
            courseId,
            chapterId: chapter.id,
            action: "removed_corrupted_content_chapter",
            reason: "Contenu sérialisé CSS/JavaScript et activité associée non publiables ; aucune réécriture non sourcée n’est ajoutée.",
            source: "pedagogical-audit/recheck/008-claude_certified_architect_foundations.json",
          });
          return false;
        });
      }
    }
    removeEmptyLessons(course, allDecisions);
    cleanSections(course);
    writeJson(file, course);
  }
}

function remediationEntry(manifest: Json, entry: Json) {
  const list = Array.isArray(manifest.convertedActivities) ? manifest.convertedActivities : [];
  const exists = list.some((candidate: Json) => candidate.courseId === entry.courseId && candidate.chapterId === entry.chapterId && candidate.blockId === entry.blockId);
  if (!exists) list.push(entry);
  manifest.convertedActivities = list;
}

const learnerCriteria: Record<string, Array<{ fr: string; en: string }>> = {
  dc_1_act_02_tp: [
    { fr: "Demandez une liste de tâches courantes réalisées par des commerciaux.", en: "Ask for a list of common tasks performed by sales representatives." },
    { fr: "Demandez environ cinq tâches (entre quatre et six est acceptable).", en: "Ask for about five tasks (four to six is acceptable)." },
    { fr: "Faites ensuite une seconde demande sur la façon dont l’IA peut aider, faire gagner du temps ou automatiser au moins une de ces tâches.", en: "Then make a second request about how AI can help, save time on, or automate at least one of those tasks." },
  ],
  dc_1_act_07_tp: [
    { fr: "Nommez une entreprise cible précise.", en: "Name a specific target company." },
    { fr: "Demandez cinq responsables ou décideurs clés.", en: "Ask for five key executives or decision-makers." },
    { fr: "Couvrez les rôles liés aux revenus, à la finance et à la technologie/IT.", en: "Cover roles related to revenue, finance, and technology/IT." },
    { fr: "Demandez un résumé de profil, de biographie ou de parcours LinkedIn pour les personnes proposées.", en: "Ask for LinkedIn profile, biography, or background summaries for the people proposed." },
  ],
  dc_1_act_10_tp: [
    { fr: "Demandez trois variantes d’email.", en: "Ask for three email variants." },
    { fr: "Limitez l’objet à quatre mots maximum.", en: "Limit the subject line to four words maximum." },
    { fr: "Demandez une accroche d’une seule phrase.", en: "Ask for a one-sentence opening hook." },
    { fr: "Demandez un appel à l’action d’une seule phrase.", en: "Ask for a one-sentence call to action." },
  ],
  dc_2_act_02_tp: [
    { fr: "Demandez d’analyser le positionnement du concurrent et d’énumérer ses cinq fonctionnalités principales.", en: "Ask to analyze the competitor’s positioning and list its five main features." },
    { fr: "Demandez des pistes de différenciation, d’avantage concurrentiel ou de value wedge, dans l’agent de recherche Copilot prévu par le cours.", en: "Ask for differentiation, competitive advantage, or value-wedge ideas in the Copilot research agent specified by the course." },
  ],
  dc_2_act_03_tp: [
    { fr: "Demandez d’extraire les principales objections de la transcription d’appel.", en: "Ask to extract the main objections from the call transcript." },
    { fr: "Précisez que cinq objections doivent être identifiées.", en: "Specify that five objections must be identified." },
    { fr: "Pour chaque réponse, demandez les quatre éléments : comprendre, recadrer, preuve et question.", en: "For each response, request all four elements: understand, reframe, proof, and ask." },
    { fr: "Demandez des réponses courtes, par exemple moins de 60 mots.", en: "Request concise responses, for example under 60 words." },
  ],
  dc_2_act_08_tp: [
    { fr: "Structurez la demande avec les instructions, le contexte et les précisions de format attendues.", en: "Structure the request with instructions, context, and the expected format specifics." },
    { fr: "Demandez une note de préparation avant appel (ou un livrable équivalent).", en: "Ask for a pre-call brief (or an equivalent deliverable)." },
    { fr: "Incluez les priorités de l’acheteur et les événements déclencheurs récents.", en: "Include buyer priorities and recent trigger events." },
    { fr: "Demandez des preuves de crédibilité et/ou un ordre du jour du premier appel.", en: "Request credibility proof points and/or a first-call agenda." },
    { fr: "Exigez un format concis, lisible et orienté résultat.", en: "Require a concise, scannable, outcome-focused format." },
  ],
  dc_3_act_07_tp: [
    { fr: "Évaluez le ton et la création de relation, la qualité des questions de découverte, la gestion des objections et la conclusion/prochaine étape.", en: "Evaluate tone and rapport, discovery-question quality, objection handling, and the close/next step." },
    { fr: "Demandez exactement deux points forts, deux axes d’amélioration et un enseignement clé.", en: "Request exactly two strengths, two areas for improvement, and one key takeaway." },
    { fr: "Demandez des preuves ou des moments précis issus de la transcription.", en: "Request evidence or specific moments from the transcript." },
    { fr: "Demandez un style de coaching encourageant et constructif.", en: "Request a supportive and constructive coaching style." },
  ],
};

function remediateSales() {
  const courseId = "ai_for_sales__01";
  const file = path.join(coursesDir, `${courseId}.json`);
  const course = readJson(file);
  for (const lesson of course.lessons ?? []) {
    for (const chapter of lesson.chapters ?? []) {
      chapter.blocks = (chapter.blocks ?? []).map((block: Json) => {
        if (block?.type === "cloud_exercise" && learnerCriteria[block.id]) return { ...block, learnerCriteria: learnerCriteria[block.id] };
        if (block?.type === "bucket_sort" && block.id === "dc_1_act_09_bucket_sort") {
          return { ...block, correction: {
            fr: "CTO : microservices/Kubernetes/Redis et OAuth/SAML/LDAP/RBAC. COO : réduction du temps de réponse aux incidents et automatisation du reporting de conformité. À éviter : les deux formulations vagues sur les paradigmes synergiques et la solution de nouvelle génération.",
            en: "CTO: microservices/Kubernetes/Redis and OAuth/SAML/LDAP/RBAC. COO: reduced incident-response time and automated compliance reporting. Avoid: the two vague formulations about synergistic paradigms and next-generation disruption.",
          } };
        }
        if (block?.type === "bucket_sort" && block.id === "dc_3_act_02_bucket_sort") {
          return { ...block, correction: {
            fr: "Prompts uniquement : fournir le contexte et les instructions à chaque échange ; généraliste. Agents uniquement : préconfigurés avec instructions, connaissances et capacités ; spécialistes. Les deux : langage naturel et amélioration par itération.",
            en: "Prompts only: provide context and instructions at every interaction; generalist use. Agents only: preconfigured with instructions, knowledge, and capabilities; specialist use. Both: natural language and iterative refinement.",
          } };
        }
        if (block?.id === "dc_3_act_03_tp") {
          const assignment = typeof block.assignment === "string" ? block.assignment.trim() : "";
          const hint = typeof block.hint === "string" ? block.hint.trim() : "";
          allDecisions.push({
            courseId,
            chapterId: chapter.id,
            blockId: "dc_3_act_03_tp_learning_note",
            action: "converted_unavailable_copilot_agent_practical_to_source_note",
            reason: "Le TP exige une création vérifiable dans Microsoft Copilot/Copilot Studio, environnement ni fourni ni vérifiable pour l’apprenant.",
            source: "pedagogical-audit/recheck/021-datacamp_ai_for_sales.json",
          });
          return {
            type: "content",
            id: "dc_3_act_03_tp_learning_note",
            remediation: { sourcePreserved: true, reason: "activity_removed_unverifiable_or_incomplete_source" },
            body: {
              fr: `## ${localized(block.title)}\n\n${assignment}${hint ? `\n\n${hint}` : ""}`,
              en: `## ${typeof block.title === "object" ? block.title.en || block.title.fr : block.title}\n\n${assignment}${hint ? `\n\n${hint}` : ""}`,
            },
          };
        }
        return block;
      });
      if (chapter.blocks?.some((block: Json) => block.id === "dc_3_act_03_tp_learning_note")) {
        chapter.type = "content";
        chapter.requiredBeforeAdvance = false;
      }
    }
  }
  const manifestPath = jsonPath("pedagogical-audit", "p0-p2-remediation-manifest.json");
  const manifest = readJson(manifestPath);
  remediationEntry(manifest, { courseId, chapterId: "dc_ch03_act03", blockId: "dc_3_act_03_tp_learning_note", reason: "activity_removed_unverifiable_or_incomplete_source" });
  manifest.generatedAt = now;
  writeJson(manifestPath, manifest);
  writeJson(file, course);
}

function remediateReportingBi() {
  const decisions: Decision[] = [];
  for (let number = 1; number <= 8; number += 1) {
    const courseId = `analyse_donnees_reporting_bi_codex__${String(number).padStart(2, "0")}`;
    const file = path.join(coursesDir, `${courseId}.json`);
    const course = readJson(file);
    const firstLesson = course.lessons?.[0];
    if (firstLesson) {
      firstLesson.chapters = (firstLesson.chapters ?? []).filter((chapter: Json) => {
        if (chapter.id === "chapter_00") {
          decisions.push({ courseId, chapterId: chapter.id, action: "removed_superseded_download_screen", reason: "Inventaire de données dupliqué ; la version actuelle du téléchargement est conservée dans chapter_01." });
          return false;
        }
        if (number === 1 && chapter.id === "chapter_02") {
          decisions.push({ courseId, chapterId: chapter.id, action: "removed_duplicate_download_screen", reason: "Deuxième inventaire de données dupliqué ; la version détaillée avec taux de référence est conservée." });
          return false;
        }
        return true;
      });
      if (number >= 2) {
        const canonical = firstLesson.chapters.find((chapter: Json) => chapter.id === "chapter_03");
        const canonicalText = canonical ? normalizedBody(canonical) : "";
        firstLesson.chapters = firstLesson.chapters.filter((chapter: Json) => {
          if (!["chapter_02", "chapter_04"].includes(chapter.id) || !canonicalText || normalizedBody(chapter) !== canonicalText) return true;
          decisions.push({ courseId, chapterId: chapter.id, action: "removed_duplicate_lab_screen", reason: "Copie exacte du brief de laboratoire conservé dans chapter_03 ; aucun faux TP ni libellé téléchargement ne subsiste." });
          return false;
        });
      }
    }
    for (const lesson of course.lessons ?? []) {
      lesson.chapters = (lesson.chapters ?? []).filter((chapter: Json) => {
        const title = localized(chapter.title);
        const onlyContent = (chapter.blocks ?? []).length > 0 && (chapter.blocks ?? []).every((block: Json) => block.type === "content");
        const body = (chapter.blocks ?? []).map((block: Json) => localized(block.body ?? block.content)).join("\n");
        if (!/^checkpoint/i.test(title) || !onlyContent || !/\b(?:soumettez|submit)\b/i.test(body)) return true;
        decisions.push({ courseId, chapterId: chapter.id, action: "removed_unverifiable_submission_screen", reason: "Écran demandant une soumission sans champ, dépôt, critères évaluables ni mécanisme de correction." });
        return false;
      });
      for (const chapter of lesson.chapters ?? []) {
        chapter.blocks = (chapter.blocks ?? []).map((block: Json) => {
          if (number === 1 && block.type === "text" && block.content && !block.body) {
            decisions.push({ courseId, chapterId: chapter.id, action: "normalized_legacy_text_block", reason: "Le renderer publie les blocs content/body ; la même valeur localisée est préservée." });
            const { content, ...remaining } = block;
            return { ...remaining, type: "content", body: content };
          }
          if (number >= 2 && block.type === "exercise" && block.exercise_type === "numeric_answers" && !block.id) {
            const id = `numeric_exercise_${String(number).padStart(2, "0")}`;
            decisions.push({ courseId, chapterId: chapter.id, blockId: id, action: "added_stable_numeric_exercise_id", reason: "Identifiant stable nécessaire pour une porte de progression scopée." });
            return { ...block, id };
          }
          return block;
        });
      }
    }
    removeEmptyLessons(course, decisions);
    cleanSections(course);
    writeJson(file, course);
  }
  allDecisions.push(...decisions);
  const reportPath = jsonPath("pedagogical-audit", "remediation", "007-analyse_donnees_reporting_bi_codex.json");
  const report = {
    generatedAt: now,
    courseFamily: "analyse_donnees_reporting_bi_codex",
    policy: "Retraits uniquement lorsque la soumission ou le doublon ne peut pas être rendu ou vérifié ; conservation des ressources et exercices numériques dont les réponses attendues sont présentes.",
    decisions,
  };
  if (!dryRun) fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  writeJson(reportPath, report);
}

function persistArchitectRegistry() {
  const filtered: Record<string, Record<string, any>> = {};
  for (const [courseId, entries] of Object.entries(ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS)) {
    const retained = Object.fromEntries(Object.entries(entries).filter(([exerciseId, correction]) => {
      const removed = architectRemovedExerciseIds.get(courseId);
      return !removed?.has(exerciseId) && Array.isArray(correction.correctOptionIds) && correction.correctOptionIds.length > 0;
    }));
    if (Object.keys(retained).length) filtered[courseId] = retained;
  }
  const registryPath = jsonPath("server", "architectFoundationsCorrectionRegistry.ts");
  const source = `/* Generated from the protected Architect Foundations exercise corrections.\n * This server-only registry must never be included in learner course payloads. */\n\nexport type ArchitectFoundationsCorrection = {\n  correction?: unknown;\n  rubric?: unknown;\n  sampleAnswer?: unknown;\n  correctOptionIds?: string[];\n};\n\nexport const ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS: Record<string, Record<string, ArchitectFoundationsCorrection>> = ${JSON.stringify(filtered, null, 2)};\n`;
  if (!dryRun) fs.writeFileSync(registryPath, source);
}

function writeArchitectManifest() {
  const reportPath = jsonPath("pedagogical-audit", "remediation", "008-claude_certified_architect_foundations.json");
  const decisions = allDecisions.filter((entry) => entry.courseId.startsWith("claude_certified_architect_foundations__"));
  const report = {
    generatedAt: now,
    courseFamily: "claude_certified_architect_foundations",
    policy: "Une validation libre sans clé de correction machine-évaluable est retirée plutôt que déclarée réussie. Les ressources non contextualisables et contenus sérialisés sont retirés, jamais réécrits sans source.",
    decisions,
  };
  if (!dryRun) fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  writeJson(reportPath, report);
}

remediateArchitect();
remediateSales();
remediateReportingBi();
persistArchitectRegistry();
writeArchitectManifest();

const summary = {
  dryRun,
  decisions: allDecisions.length,
  architectRemovedCheckpoints: Object.fromEntries(Array.from(architectRemovedExerciseIds.entries()).map(([courseId, ids]) => [courseId, ids.size])),
  retainedArchitectMachineCorrections: Object.values(ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS).flatMap((entries) => Object.values(entries)).filter((entry) => entry.correctOptionIds?.length).length,
};
console.log(JSON.stringify(summary, null, 2));
