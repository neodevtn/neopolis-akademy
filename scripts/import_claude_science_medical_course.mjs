import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, ".work", "claude-science-medical-2026-09-17", "package", "claude_science_medical_fr_2026-09-17");
const courseId = "claude_science_recherche_medicale__01";
const certificationId = "claude_science_recherche_medicale";
const source = JSON.parse(fs.readFileSync(path.join(sourceRoot, "COURSE.json"), "utf8"));
const sources = JSON.parse(fs.readFileSync(path.join(sourceRoot, "sources", "SOURCES.json"), "utf8"));
const videos = JSON.parse(fs.readFileSync(path.join(sourceRoot, "media", "videos_manifest.json"), "utf8"));
const assetMap = JSON.parse(fs.readFileSync(path.join(root, ".work", "claude-science-medical-2026-09-17", "asset-map.json"), "utf8"));
const downloadsManifest = JSON.parse(fs.readFileSync(path.join(sourceRoot, "downloads", "downloads_manifest.json"), "utf8"));

const local = (fr, en = fr) => ({ fr, en });
const sourceRefs = (value, fallback = []) => Array.from(new Set(Array.isArray(value) ? value : fallback));
const sourceById = new Map(sources.map((entry) => [entry.id, entry]));
const videoById = new Map(videos.map((entry) => [entry.id, entry]));
const upload = (relative) => {
  const sourcePath = assetMap[relative] ? relative : `downloads/${relative}`;
  const value = assetMap[sourcePath];
  if (!value?.url?.startsWith("/api/assets/")) throw new Error(`Managed media asset missing: ${relative}`);
  return value.url;
};
const mimeFromPath = (relative) => assetMap[relative]?.mimeType || assetMap[`downloads/${relative}`]?.mimeType || "application/octet-stream";
const titleFromPath = (relative) => path.basename(relative);
const lessonSourceRefs = (lesson) => sourceRefs(lesson.sources, ["anthropic_product"]);

const videoAlternatives = {
  yt_getting_started: "Alternative textuelle originale : observez trois responsabilités distinctes. L’interface aide à organiser le travail ; les calculs et artefacts doivent rester inspectables ; une personne compétente conserve la décision sur la méthode et l’interprétation. Ne déduisez aucune conclusion clinique de cette démonstration.",
  yt_anthropic_briefing: "Alternative textuelle originale : la présentation illustre une assistance au travail scientifique fondée sur des plans, des exécutions et des artefacts consultables. Pour la recherche médicale, transformez toute sortie en hypothèse à vérifier avec un protocole, des données autorisées et une validation humaine adaptée. Elle ne remplace ni une revue systématique, ni une décision clinique.",
  yt_histora_demo: "Alternative textuelle originale : utilisez ce cas comme un exemple de raisonnement de recherche translationnelle. Distinguez toujours l’hypothèse, les données autorisées, les contrôles reproductibles et la conclusion qui demande une expertise humaine. Une interface convaincante ne constitue pas une validation médicale.",
  yt_first_impression_zh: "Alternative textuelle originale : cette première prise en main est proposée comme ressource facultative. Comparez les éléments de l’interface avec votre protocole : données uniquement synthétiques, étapes inspectables, artefacts conservés et contrôle humain avant toute interprétation. Sa langue ne modifie pas les limites non cliniques du parcours.",
};

const labExtraResources = {
  lab_01: ["downloads/templates/checklist_validation_humaine.md"],
  lab_02: ["downloads/scripts/starter_descriptive_analysis.py", "downloads/scripts/solution_descriptive_analysis.py", "downloads/expected/clinical_descriptive_expected.json"],
  lab_03: ["downloads/templates/matrice_provenance.csv"],
  lab_04: ["downloads/templates/fiche_verification_citation.csv"],
  lab_05: ["downloads/scripts/starter_descriptive_analysis.R"],
  lab_06: ["downloads/scripts/solution_gene_expression.py", "downloads/expected/gene_expression_expected.json"],
  lab_07: [],
  lab_08: [],
};
const labs = new Map();
for (let index = 1; index <= 8; index += 1) {
  const id = `lab_${String(index).padStart(2, "0")}`;
  labs.set(id, JSON.parse(fs.readFileSync(path.join(sourceRoot, "labs", `${id}.json`), "utf8")));
}
const quizzes = new Map();
for (let index = 1; index <= 8; index += 1) {
  const id = `quiz_${String(index).padStart(2, "0")}`;
  quizzes.set(id, JSON.parse(fs.readFileSync(path.join(sourceRoot, "quizzes", `${id}.json`), "utf8")));
}

const checkpointAnswerKeys = {};
const moduleQuizzes = {};
const exercises = [];
const modules = [];
const flattenedLessons = [];

const nonClinicalWarning = local(
  "Avertissement non clinique — Ce parcours est réservé à l’apprentissage et à la recherche. Utilisez uniquement les données synthétiques fournies. Il ne produit ni diagnostic, ni triage, ni conseil thérapeutique, et ne remplace jamais une autorisation institutionnelle, un protocole ni une validation humaine.",
  "Non-clinical notice — This learning and research pathway uses synthetic data only. It does not provide diagnosis, triage, treatment advice, institutional authorization, protocol approval, or human validation."
);

function downloadResource(relative) {
  return {
    url: upload(relative),
    title: local(titleFromPath(relative)),
    description: local("Ressource synthétique de la médiathèque Neopolis."),
    filename: path.basename(relative),
    assetMeta: { origin: "neopolis_media_library", provenance: "synthetic_course_package", mimeType: mimeFromPath(relative) },
  };
}

function mapScreen(screen, lesson, moduleIndex) {
  const refs = sourceRefs(screen.sources, lessonSourceRefs(lesson));
  const chapter = {
    id: `csm_${lesson.id}_screen_${String(screen.order).padStart(2, "0")}`,
    title: local(screen.title),
    type: "content",
    requiredBeforeAdvance: screen.type === "CheckpointMCQ" || screen.type === "VideoEmbed",
    source_refs: refs,
    blocks: [],
  };

  if (screen.type === "Objectives") {
    chapter.blocks.push({ type: "learning_section", sectionKind: "objectives", title: local(screen.title), body: local(screen.body_fr), source_refs: refs });
    return chapter;
  }
  if (screen.type === "SourceGroundedText") {
    chapter.blocks.push({ type: "content", body: local(`## ${screen.title}\n\n${screen.body_fr}`), source_refs: refs });
    return chapter;
  }
  if (screen.type === "AnnotatedScreenshot") {
    const screenshotUrl = upload(screen.media_ref);
    const sourceLinks = refs.map((id) => sourceById.get(id)).filter(Boolean).map((entry) => ({ id: entry.id, title: entry.title, url: entry.url }));
    chapter.blocks.push({
      type: "annotated_screenshot",
      title: local(screen.title),
      imageUrl: screenshotUrl,
      alt: local(screen.alt_fr),
      caption: local(`${screen.caption_fr} Attribution : documentation Anthropic.`),
      sourceRefs: sourceLinks,
      source_refs: refs,
      assetMeta: { origin: "anthropic_official_documentation", attributionRequired: true, kind: "reference_screenshot" },
    });
    return chapter;
  }
  if (screen.type === "PromptTemplate") {
    chapter.blocks.push({ type: "callout", variant: "tip", title: local(screen.title), body: local(screen.body_fr), source_refs: refs });
    return chapter;
  }
  if (screen.type === "GuidedAction") {
    chapter.blocks.push({ type: "learning_section", sectionKind: "content", title: local(screen.title), body: local(`${screen.body_fr}\n\n**Preuve attendue :** ${screen.expected_evidence_fr || "Réponse documentée avec données synthétiques."}`), source_refs: refs });
    return chapter;
  }
  if (screen.type === "CheckpointMCQ") {
    const exerciseId = `csm_checkpoint_${lesson.id}`;
    const correct = screen.options.find((option) => option.correct);
    if (!correct) throw new Error(`Missing checkpoint answer: ${lesson.id}`);
    checkpointAnswerKeys[exerciseId] = {
      correctAnswer: correct.id.toLowerCase(),
      explanation: local(`${screen.feedback_correct_fr} ${screen.feedback_incorrect_fr}`),
      sourceRefs: refs,
    };
    exercises.push({
      id: exerciseId,
      interactionType: "single_choice",
      title: local(screen.title),
      prompt: local(screen.question_fr),
      instructions: local("Choisissez une réponse. Le checkpoint doit être réussi pour poursuivre."),
      options: screen.options.map((option) => ({ id: option.id.toLowerCase(), text: local(option.text_fr) })),
      completionRequiresCorrectAnswer: true,
      serverValidated: true,
      required: true,
      skillTags: source.modules[moduleIndex].skill_tags || [],
      source_refs: refs,
    });
    chapter.type = "checkpoint";
    chapter.blocks.push({ type: "checkpoint", id: exerciseId, exerciseId, required: true, source_refs: refs });
    return chapter;
  }
  if (screen.type === "VideoEmbed") {
    const video = videoById.get(screen.video_ref);
    if (!video) throw new Error(`Unknown video: ${screen.video_ref}`);
    chapter.type = "video";
    chapter.blocks.push({
      type: "video",
      id: video.id,
      videoId: video.url.split("v=")[1],
      title: local(video.title),
      watchUrl: video.url,
      language: video.language,
      durationSeconds: video.duration_seconds,
      objectiveBefore: local(screen.instruction_before_fr),
      questionsAfter: screen.questions_after_fr.map((question) => local(question)),
      alternativeTextFr: videoAlternatives[video.id],
      source_refs: refs,
      mediaMeta: { origin: video.official ? "anthropic" : "external_source", label: video.official ? local("Source officielle Anthropic", "Official Anthropic source") : local("Vidéo externe citée", "Referenced external video"), author: video.author, language: video.language, official: Boolean(video.official) },
    });
    return chapter;
  }
  if (screen.type === "LessonSummary") {
    chapter.blocks.push({ type: "learning_section", sectionKind: "summary", title: local(screen.title), body: local(screen.body_fr), source_refs: refs });
    return chapter;
  }
  throw new Error(`Unsupported COURSE.json screen type: ${screen.type}`);
}

for (const [moduleIndex, module] of source.modules.entries()) {
  const moduleLessons = [];
  for (const lesson of module.lessons) {
    const chapters = lesson.screens.map((screen) => mapScreen(screen, lesson, moduleIndex));
    // The supplied COURSE_MANIFEST declares a fourth video that is present in
    // videos_manifest.json but not assigned to a COURSE.json screen. Preserve
    // it as an explicitly optional resource instead of silently losing it or
    // turning it into an extra prerequisite.
    if (lesson.id === "01_01") {
      const video = videoById.get("yt_first_impression_zh");
      chapters.push({
        id: "csm_01_01_optional_video",
        title: local("Ressource vidéo facultative", "Optional video resource"),
        type: "video",
        requiredBeforeAdvance: false,
        source_refs: ["anthropic_product"],
        blocks: [
          { type: "callout", variant: "info", title: local("Ressource complémentaire facultative", "Optional supplementary resource"), body: local("Cette vidéo est listée dans le manifeste fourni mais n’est pas un prérequis du parcours. Elle ne remplace ni les documents de référence ni une validation humaine."), source_refs: ["anthropic_product"] },
          { type: "video", id: video.id, videoId: video.url.split("v=")[1], title: local(video.title), watchUrl: video.url, language: video.language, durationSeconds: video.duration_seconds, objectiveBefore: local("Repérez les éléments qui doivent rester vérifiables dans un workflow de recherche."), questionsAfter: [local("Quels éléments de la démonstration sont vérifiables ?"), local("Quelle limite non clinique demeure applicable ?")], alternativeTextFr: videoAlternatives[video.id], optional: true, source_refs: ["anthropic_product"], mediaMeta: { origin: "external_source", label: local("Vidéo externe citée", "Referenced external video"), author: video.author, language: video.language, official: false } },
        ],
      });
    }
    if (moduleIndex === 0 && lesson.order === 1) {
      chapters[0].blocks.unshift({ type: "callout", variant: "danger", title: local("Limites médicales importantes", "Important medical boundaries"), body: nonClinicalWarning, source_refs: ["anthropic_product", "anthropic_docs_15"] });
    }
    const converted = {
      id: `csm_lesson_${lesson.id}`,
      title: local(lesson.title),
      description: local(lesson.objective),
      estimatedMinutes: lesson.estimated_minutes,
      moduleId: module.id,
      moduleTitle: local(module.title),
      competencyTags: module.skill_tags || [],
      source_refs: lessonSourceRefs(lesson),
      recommendedVideosManaged: false,
      recommendedVideos: [],
      chapters,
      unlockRule: "previous_lesson_checkpoint_passed_or_first_lesson",
    };
    // Keep legacy exercise metadata linked to the exact stable screen so that
    // activity audits and future content migrations preserve learner progress.
    for (const [chapterIndex, chapter] of chapters.entries()) {
      for (const checkpoint of (chapter.blocks || []).filter((block) => block.type === "checkpoint" && block.exerciseId)) {
        const exercise = exercises.find((item) => item.id === checkpoint.exerciseId);
        if (exercise) {
          exercise.lessonId = converted.id;
          exercise.lessonIndex = flattenedLessons.length;
          exercise.chapterId = chapter.id;
          exercise.chapterIndex = chapterIndex;
        }
      }
    }
    moduleLessons.push(converted);
    flattenedLessons.push(converted);
  }

  const lab = labs.get(module.lab_id);
  const allFiles = Array.from(new Set([...(lab.required_files || []), ...(labExtraResources[lab.id] || [])]));
  const labChapter = {
    id: `csm_${module.id}_lab`,
    title: local(`TP — ${lab.title}`),
    type: "exercise",
    requiredBeforeAdvance: true,
    source_refs: sourceRefs(module.lessons.flatMap((lesson) => lesson.sources), ["anthropic_product"]),
    blocks: [
      { type: "callout", variant: "danger", title: local(module.order === 8 ? "Projet final — limites médicales" : "TP — limites médicales"), body: nonClinicalWarning, source_refs: ["anthropic_product", "anthropic_docs_15"] },
      {
        type: "cloud_exercise",
        id: `csm_${module.id}_lab`,
        title: local(lab.title),
        assignment: local(lab.objective),
        environmentGuide: local("Préparez un espace de travail de démonstration avec uniquement les fichiers synthétiques téléchargés depuis la médiathèque Neopolis. N’ajoutez aucune donnée patient, identifiante ou clinique réelle."),
        instructions: local((lab.instructions || []).map((instruction, index) => `${index + 1}. ${instruction}`).join("\n")),
        resources: allFiles.map(downloadResource),
        minimumAnswerLength: 120,
        hint: local("Décrivez une démarche vérifiable : fichiers synthétiques utilisés, contrôle effectué, limite identifiée et validation humaine prévue."),
        solution: local("Une réponse recevable décrit une démarche reproductible limitée aux données synthétiques, sépare les faits observés des hypothèses et prévoit une validation humaine avant tout partage."),
        successMessage: local("TP validé. Vous pouvez maintenant ouvrir le quiz de module."),
        source_refs: sourceRefs(module.lessons.flatMap((lesson) => lesson.sources), ["anthropic_product"]),
        competencyPoints: 5,
      },
    ],
  };
  moduleLessons[3].chapters.push(labChapter);

  const quiz = quizzes.get(module.quiz_id);
  if (!quiz || quiz.questions.length !== 8) throw new Error(`Expected eight questions for ${module.quiz_id}`);
  moduleQuizzes[module.id] = {
    id: quiz.id,
    title: quiz.title,
    passingScore: quiz.passing_score,
    maxAttempts: quiz.attempts,
    questionCount: quiz.questions.length,
    labActivityId: `csm_${module.id}_lab`,
    checkpoints: moduleLessons.map((lesson) => `csm_checkpoint_${lesson.id}`),
    questions: quiz.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt_fr,
      options: question.options.map((option) => ({ id: option.id.toLowerCase(), text: option.text_fr })),
      correctAnswer: question.options.find((option) => option.correct)?.id.toLowerCase(),
      explanation: question.explanation_fr,
      sourceRefs: question.source_refs || [],
      skillTags: question.skill_tags || module.skill_tags || [],
      points: question.points || 10,
    })),
  };
  moduleLessons[3].chapters.push({
    id: `csm_${module.id}_quiz`,
    title: local(`Quiz de module — ${module.title}`),
    type: "quiz",
    requiredBeforeAdvance: true,
    source_refs: sourceRefs(quiz.questions.flatMap((question) => question.source_refs || []), ["anthropic_product"]),
    blocks: [{ type: "module_quiz", id: `csm_${module.id}_quiz`, moduleId: module.id, title: local(quiz.title), passingScore: quiz.passing_score, questionCount: quiz.questions.length, competencyPoints: 10, source_refs: sourceRefs(quiz.questions.flatMap((question) => question.source_refs || []), ["anthropic_product"]) }],
  });
  modules.push({ id: module.id, title: local(module.title), lessonIds: moduleLessons.map((lesson) => lesson.id), labId: labChapter.blocks[1].id, quizId: quiz.id, source_refs: sourceRefs(moduleLessons.flatMap((lesson) => lesson.source_refs), ["anthropic_product"]) });
}

const sourceCatalog = Object.fromEntries(sources.map((entry) => [entry.id, { title: entry.title, url: entry.url, authority: entry.authority, verifiedAt: entry.verified_at, copyrightUse: entry.copyright_use }]));
const course = {
  courseId,
  sourceCourseTitle: "Prise en main de Claude Science pour la recherche médicale",
  sourceLanguage: "fr",
  sourceProvider: "Anthropic documentation and cited sources",
  integration: {
    schemaVersion: "neopolis.claude-science-medical.v1",
    sourceManifest: "COURSE.json",
    reader: "screen_paginated_reader_not_long_scroll",
    dataPolicy: "synthetic_only",
    assessmentAnswerPolicy: "server_only",
    learnerProgressMigration: "stable_lesson_and_chapter_ids",
  },
  sourceCatalog,
  modules,
  sections: modules.map((module, index) => ({ id: module.id, title: module.title, startLessonIndex: index * 4, endLessonIndex: index * 4 + 3 })),
  lessons: flattenedLessons,
  exercises,
  downloadableResources: downloadsManifest.files.map((relative) => ({ path: relative, url: upload(relative), mimeType: mimeFromPath(relative), source: "neopolis_media_library" })),
  medicalSafety: { syntheticDataOnly: true, nonClinicalWarning, source_refs: ["anthropic_product", "anthropic_docs_15", "anthropic_docs_18"] },
};

fs.writeFileSync(path.join(root, "client", "public", "data", "courses", `${courseId}.json`), `${JSON.stringify(course, null, 2)}\n`);
fs.writeFileSync(path.join(root, "server", "claudeScienceCourseAssessments.ts"), `/** Generated from the supplied COURSE.json. Private answer keys are intentionally server-only. */\nexport const CLAUDE_SCIENCE_MEDICAL_COURSE_ID = ${JSON.stringify(courseId)} as const;\nexport const CLAUDE_SCIENCE_MEDICAL_CERTIFICATION_ID = ${JSON.stringify(certificationId)} as const;\nexport const CLAUDE_SCIENCE_CHECKPOINT_KEYS = ${JSON.stringify(checkpointAnswerKeys, null, 2)} as const;\nexport const CLAUDE_SCIENCE_MODULE_QUIZZES = ${JSON.stringify(moduleQuizzes, null, 2)} as const;\nexport const CLAUDE_SCIENCE_MODULE_LABS = ${JSON.stringify(Object.fromEntries(modules.map((module) => [module.id, module.labId])), null, 2)} as const;\n`);

const indexPath = path.join(root, "client", "src", "data", "trainingIndex.json");
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
index.categories = index.categories || [];
if (!index.categories.some((entry) => entry.id === "ai_research_health")) index.categories.push({ id: "ai_research_health", title: local("IA pour la recherche et la santé", "AI for Research & Health"), order: 9 });
index.certifications = (index.certifications || []).filter((entry) => entry.id !== certificationId);
index.courses = (index.courses || []).filter((entry) => entry.id !== courseId);
index.certifications.push({
  id: certificationId,
  title: local("Claude Science pour la recherche médicale", "Claude Science for Medical Research"),
  description: local("Un parcours de recherche responsable sur Claude Science : données synthétiques, traçabilité, artefacts, validation humaine et limites non cliniques.", "A responsible Claude Science research pathway: synthetic data, traceability, artifacts, human validation, and non-clinical boundaries."),
  level: local("Intermédiaire", "Intermediate"),
  icon: "🔬",
  courseCount: 1,
  totalLessons: 32,
  totalExercises: 104,
  totalVideos: 4,
  totalDownloads: 19,
  totalActivities: 80,
  courses: [courseId],
  group: "ai_research_health",
  trainingFormat: "formation",
  source_refs: ["anthropic_product", "anthropic_docs_01", "anthropic_docs_15"],
});
index.courses.push({
  id: courseId,
  certId: certificationId,
  title: local("Prise en main de Claude Science pour la recherche médicale", "Getting started with Claude Science for medical research"),
  description: local("32 leçons, 8 TP sur données synthétiques et 8 quiz sécurisés pour structurer une recherche médicale reproductible sans usage clinique.", "32 lessons, 8 synthetic-data labs, and 8 secure quizzes to structure reproducible medical research without clinical use."),
  order: 1,
  subCategoryId: "research_health",
  subCategory: local("Recherche & santé", "Research & Health"),
  tags: ["claude-science", "recherche-médicale", "données-synthétiques", "reproductibilité", "validation-humaine", "santé"],
  targetJob: "Chercheur·se, biostatisticien·ne, data scientist santé, coordinateur·rice de recherche",
  tools: ["Claude Science", "Python", "R", "données synthétiques"],
  acquiredSkills: ["Définir un cadre de recherche non clinique", "Documenter la provenance et les artefacts", "Préparer une validation humaine", "Structurer une analyse reproductible"],
  level: local("Intermédiaire", "Intermediate"),
  lessonCount: 32,
  chapterCount: flattenedLessons.reduce((total, lesson) => total + lesson.chapters.length, 0),
  exerciseCount: 32,
  videoCount: 4,
  downloadCount: 19,
  totalActivities: 80,
  estimatedDurationMinutes: flattenedLessons.reduce((total, lesson) => total + Number(lesson.estimatedMinutes || 0), 0),
  source_refs: ["anthropic_product", "anthropic_docs_01", "anthropic_docs_15"],
  learningTheme: "laboratory",
});
fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);

const mediaLibraryPath = path.join(root, "client", "public", "data", "mediaLibrary.json");
const mediaLibrary = fs.existsSync(mediaLibraryPath) ? JSON.parse(fs.readFileSync(mediaLibraryPath, "utf8")) : {};
for (const [relative, asset] of Object.entries(assetMap)) {
  const url = asset.url;
  if (!url.startsWith("/api/assets/")) continue;
  mediaLibrary[url] = mediaLibrary[url] || { id: `claude_science_${Buffer.from(relative).toString("hex").slice(0, 24)}`, url, title: path.basename(relative), kind: asset.kind, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}
fs.writeFileSync(mediaLibraryPath, `${JSON.stringify(mediaLibrary, null, 2)}\n`);

console.log(JSON.stringify({ courseId, modules: modules.length, lessons: flattenedLessons.length, checkpoints: exercises.length, labs: modules.length, quizzes: Object.keys(moduleQuizzes).length, quizQuestions: Object.values(moduleQuizzes).reduce((total, quiz) => total + quiz.questions.length, 0), downloads: course.downloadableResources.length, chapters: index.courses.find((item) => item.id === courseId).chapterCount }, null, 2));
