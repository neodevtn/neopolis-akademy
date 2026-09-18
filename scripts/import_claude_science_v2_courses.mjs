import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const packageRoot = path.join(root, ".work", "claude-science-medical-v2-2026-09-17", "package", "claude_science_medical_fr_v2_2026-09-17");
const assetMapPath = path.join(root, ".work", "claude-science-medical-v2-2026-09-17", "asset-map.json");
const certificationId = "claude_science_recherche_medicale";
const collectionId = "parcours_claude_science_recherche_medicale";
const categoryId = "ai_research_health";

function restoreFrenchTypography(value) {
  let text = String(value || "");
  const replacements = [
    [/\bgenerative\b/gi, "générative"], [/\bmethode\b/gi, "méthode"], [/\bConformite\b/g, "Conformité"],
    [/\bdonnees\b/gi, "données"], [/\bsante\b/gi, "santé"], [/\brecherche medicale\b/gi, "recherche médicale"],
    [/\bactivite\b/gi, "activité"], [/\blecon\b/gi, "leçon"], [/\bpremiere\b/gi, "première"],
    [/\breussir\b/gi, "réussir"], [/\bProteger\b/g, "Protéger"], [/\bresultat\b/gi, "résultat"],
    [/\bresultats\b/gi, "résultats"], [/\blitterature\b/gi, "littérature"], [/\banalyse\b/gi, "analyse"],
    [/\binterpre?tation\b/gi, "interprétation"], [/\bencadre\b/gi, "encadré"], [/\boptimiser\b/gi, "optimiser"],
    [/\bgenique\b/gi, "génique"], [/\butiliser\b/gi, "utiliser"], [/\bprojets\b/gi, "projets"],
    [/\bprotegees\b/gi, "protégées"], [/\btherapeutique\b/gi, "thérapeutique"], [/\btaches\b/gi, "tâches"],
    [/\baccelerer\b/gi, "accélérer"], [/\bReconnaitre\b/g, "Reconnaître"], [/\bautomatisation\b/gi, "automatisation"],
    [/\betape\b/gi, "étape"], [/\bDecrire\b/g, "Décrire"], [/\bpreparer\b/gi, "préparer"],
    [/\bexecuter\b/gi, "exécuter"], [/\bnecessaire\b/gi, "nécessaire"], [/\bindependante\b/gi, "indépendante"],
    [/\bverifier\b/gi, "vérifier"], [/\bpreuve\b/gi, "preuve"], [/\bevaluation\b/gi, "évaluation"],
    [/\bDemonstration\b/g, "Démonstration"], [/\bpresentateur\b/gi, "présentateur"], [/\bvideo\b/gi, "vidéo"],
    [/\bdeclenche\b/gi, "déclenche"], [/\bresultat reste a\b/gi, "résultat reste à"],
    [/\bDe la question de recherche a la preuve\b/g, "De la question de recherche à la preuve"],
    [/\bInitiation a Claude\b/g, "Initiation à Claude"], [/\bA retenir\b/g, "À retenir"],
  ];
  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, (match) => match[0] === match[0].toUpperCase()
      ? `${replacement[0].toUpperCase()}${replacement.slice(1)}`
      : replacement);
  }
  text = text
    .replace(/^projets,/u, "Projets,")
    .replace(/^interprétation,/u, "Interprétation,")
    .replace(/^(TP \d+ - )analyse\b/u, "$1Analyse");
  return text;
}
const local = (fr, en = fr) => ({ fr: restoreFrenchTypography(fr), en });
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const writeText = (file, value) => fs.writeFileSync(file, value);
const asKey = (...parts) => parts.join("__").replace(/[^a-zA-Z0-9_]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").toLowerCase();
const trim = (value) => String(value || "").trim();
const titleFromPath = (relativePath) => path.basename(relativePath).replace(/[_-]+/g, " ").replace(/\.[^.]+$/, "");
const courseDefinitions = [
  { path: "courses/01_initiation_claude_et_claude_science/COURSE.json", key: "initiation" },
  { path: "courses/02_claude_science_installation_utilisation_optimisation/COURSE.json", key: "pratique" },
  { path: "courses/03_claude_science_travaux_pratiques/COURSE.json", key: "labs" },
];
const assetMap = readJson(assetMapPath);

function getAsset(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  const entry = assetMap[normalized];
  if (!entry) throw new Error(`Managed asset missing for ${normalized}`);
  return entry;
}

function sourceCatalogFor(courseDirectory) {
  const sourcePath = path.join(packageRoot, courseDirectory, "sources", "SOURCES.json");
  return fs.existsSync(sourcePath) ? readJson(sourcePath).sources : {};
}

function sourceRefs(ids, catalog) {
  return (ids || []).map((id) => ({ id, title: catalog[id]?.title || id, url: catalog[id]?.url || "" })).filter((entry) => entry.url);
}

function toContent(title, text, type = "teaching") {
  return {
    title: local(title),
    type,
    requiredBeforeAdvance: true,
    blocks: [{ type: "content", body: local(text) }],
  };
}

function warningBlock(safety) {
  return {
    type: "callout",
    variant: "danger",
    title: local("Limites non cliniques"),
    body: local(`${safety.warning_fr}\n\nCadre Neopolis : contenu pédagogique non clinique. Utilisez uniquement les données synthétiques fournies et faites valider toute décision réelle par les personnes compétentes.`),
  };
}

function sourceBlock(references) {
  if (!references.length) return null;
  return {
    type: "source_references",
    title: local("Références"),
    sources: references,
  };
}

function sourceList(value) {
  return trim(value)
    .split(/\n+/)
    .map((line) => line.trim().replace(/^(?:[-•*]|\d+[.)])\s*/, "").trim())
    .filter(Boolean)
    .map((item) => local(item));
}

/** Expected-output files are correction material and remain server-only. */
function learnerSafeLabInstruction(value) {
  const text = String(value || "");
  if (/fichier\s+(?:de\s+)?(?:valeurs\s+)?expected|fichier\s+de\s+valeurs\s+attendues/i.test(text)) {
    return "Après votre soumission, utilisez les points de contrôle fournis dans le retour de correction pour documenter les éventuels écarts.";
  }
  return text;
}

function screenToChapter({ screen, course, module, lesson, catalog, media, courseId }) {
  const chapterId = asKey(courseId, module.id, lesson.id, "screen", screen.order);
  const common = {
    id: chapterId,
    title: local(screen.title || lesson.title),
    type: "teaching",
    requiredBeforeAdvance: screen.completion !== "read",
  };
  const refs = sourceRefs(screen.sources, catalog);

  if (screen.type === "Objectives") {
    return { ...common, requiredBeforeAdvance: false, blocks: [{ type: "learning_objectives", title: local(screen.title), items: sourceList(screen.body_fr) }] };
  }
  if (screen.type === "SourceGroundedText") {
    const blocks = [{ type: "content", body: local(screen.body_fr) }];
    const refsBlock = sourceBlock(refs);
    if (refsBlock) blocks.push(refsBlock);
    return { ...common, requiredBeforeAdvance: false, blocks };
  }
  if (screen.type === "GuidedAction") {
    const blocks = [
      { type: "guided_action", id: chapterId, title: local(screen.title), steps: sourceList(screen.body_fr), expectedEvidence: local(screen.expected_evidence_fr) },
    ];
    const refsBlock = sourceBlock(refs);
    if (refsBlock) blocks.push(refsBlock);
    return { ...common, blocks };
  }
  if (screen.type === "LessonSummary") {
    return { ...common, requiredBeforeAdvance: false, blocks: [{ type: "lesson_summary", title: local(screen.title), items: sourceList(screen.body_fr) }] };
  }
  if (screen.type === "CheckpointMCQ") {
    const exerciseId = asKey(courseId, module.id, lesson.id, "checkpoint", screen.order);
    return {
      ...common,
      type: "checkpoint",
      passThreshold: 1,
      blocks: [{ type: "single_choice_exercise", id: exerciseId, question: local(screen.question_fr), options: screen.options.map((option) => ({ id: option.id.toLowerCase(), text: local(option.text_fr) })), serverValidated: true, hint: local("Relisez les éléments sourcés de cette leçon avant de répondre."), sourceRefs: refs }],
      exerciseId,
      _privateCheckpoint: { exerciseId, correctAnswer: String(screen.options.find((option) => option.correct)?.id || "").toLowerCase(), explanation: screen.feedback_correct_fr, incorrectExplanation: screen.feedback_incorrect_fr },
    };
  }
  if (screen.type === "AnnotatedScreenshot") {
    const details = media[screen.media_ref];
    if (!details) throw new Error(`Media ${screen.media_ref} missing from source manifest`);
    const asset = getAsset(path.join(course._directory, details.path));
    return {
      ...common,
      requiredBeforeAdvance: false,
      blocks: [{
        type: "annotated_screenshot",
        title: local(screen.title),
        imageUrl: asset.url,
        alt: local(screen.alt_fr),
        caption: local(screen.caption_fr),
        purpose: local(screen.purpose_fr),
        learnerAction: local(screen.learner_action_fr),
        interpretationWarning: local(screen.interpretation_warning_fr),
        guidedZones: (screen.guided_zones || []).map((zone) => ({ id: zone.id, position: zone.position, label: local(zone.label_fr), explanation: local(zone.explanation_fr), check: local(zone.check_fr) })),
        sourceRefs: refs,
        displayPolicy: screen.display_policy,
      }],
    };
  }
  if (screen.type === "VideoEmbed") {
    const video = course._videos?.[screen.video_ref];
    if (!video) throw new Error(`Video ${screen.video_ref} missing from V2 manifest`);
    return {
      ...common,
      requiredBeforeAdvance: !video.optional,
      blocks: [{
        type: "video",
        id: video.youtube_id,
        videoId: video.youtube_id,
        title: local(video.title),
        watchUrl: video.url,
        videoLanguage: video.language,
        durationSeconds: video.duration_seconds,
        objectiveBefore: local(screen.instruction_before_fr || "Ressource d'approfondissement facultative."),
        questionsAfter: (screen.questions_after_fr || []).map((question) => local(question)),
        alternativeTextFr: video.alternative_fr,
        optional: Boolean(video.optional),
        provenance: { source: video.official ? "Anthropic" : video.author, official: Boolean(video.official), type: video.official ? "official_video" : "supplementary_video" },
      }],
    };
  }
  if (screen.type === "EnvironmentPreparation") {
    return {
      ...common,
      requiredBeforeAdvance: false,
      blocks: [{ type: "callout", variant: "warning", title: local(screen.title), body: local(`${course.safety.warning_fr}\n\n${learnerSafeLabInstruction(screen.body_fr)}`) }, ...resourceBlocks(screen.required_files || [], course)],
    };
  }
  if (screen.type === "PracticalLab") {
    const labId = module.lab_id;
    const solutionPath = path.join(course._directory, screen.solution_file);
    const solution = fs.readFileSync(path.join(packageRoot, solutionPath), "utf8");
    const solutionSha256 = crypto.createHash("sha256").update(solution).digest("hex");
    const rubric = Object.entries(screen.grading?.rubric || {}).map(([id, weight]) => ({ id, label: labelForRubric(id), description: descriptionForRubric(id), weight: Number(weight) }));
    return {
      ...common,
      blocks: [{
        type: "cloud_exercise",
        id: labId,
        title: local(screen.title),
        assignment: local(`${course.safety.warning_fr}\nCadre Neopolis : TP non clinique. Utilisez uniquement les données synthétiques fournies ; aucune conclusion clinique ni donnée patient.\n\n${screen.instructions_fr.map(learnerSafeLabInstruction).join("\n")}`),
        environmentGuide: local("Téléchargez uniquement les fichiers ci-dessous dans un dossier de travail isolé. Aucun dossier patient, secret ou identifiant ne doit être ajouté."),
        resources: resourcesFor(screen.required_files || [], course),
        steps: screen.instructions_fr.map((value) => local(learnerSafeLabInstruction(value))),
        rubricCriteria: rubric,
        evaluationPrompt: local(`Évaluez strictement la preuve de réalisation du TP « ${screen.title} ». Les données doivent rester synthétiques, la démarche doit être vérifiable et aucune conclusion clinique ne doit être formulée.`),
        maxScore: Number(screen.grading?.total_points || 100),
        passingScore: Number(screen.grading?.passing_score || 75),
        minimumAnswerLength: 300,
        serverGradedAssessment: "claude_science_v2_lab",
        solutionLabel: local("La correction expliquée devient disponible après la première soumission."),
        requirePostRevealReflection: false,
      }],
      _privateLab: { labId, solution, solutionSha256 },
    };
  }
  if (screen.type === "Reflection") {
    return {
      ...common,
      blocks: [{ type: "reflection", id: asKey(courseId, module.id, lesson.id, "reflection"), title: local(screen.title), prompt: local(screen.body_fr), minimumCharacters: Number(screen.minimum_characters || 300) }],
    };
  }
  throw new Error(`Unsupported source screen ${screen.type}`);
}

function labelForRubric(id) {
  return ({ cadrage: "Cadrage", methode: "Méthode", reproductibilite: "Reproductibilité", validation: "Validation", limites: "Limites" })[id] || id;
}
function descriptionForRubric(id) {
  return ({
    cadrage: "La question, le périmètre et les données autorisées sont explicitement définis.",
    methode: "Les étapes suivent une méthode lisible et vérifiable.",
    reproductibilite: "Les fichiers, versions, paramètres et contrôles nécessaires sont documentés.",
    validation: "Les contrôles indépendants et la validation humaine sont décrits.",
    limites: "Les limites, incertitudes et l'absence de portée clinique sont explicites.",
  })[id] || "Critère de réussite documenté.";
}

function resourcesFor(paths, course) {
  return paths.filter((relative) => !relative.includes("/expected/") && !/\/scripts\/solution_/i.test(relative)).map((relative) => {
    const fullPath = path.join(course._directory, relative);
    const asset = getAsset(fullPath);
    return { title: local(titleFromPath(relative)), description: local(`Ressource du TP · SHA-256 : ${asset.sha256}`), url: asset.url, sha256: asset.sha256 };
  });
}
function resourceBlocks(paths, course) {
  return resourcesFor(paths, course).map((resource) => ({ type: "download", title: resource.title, description: resource.description, url: resource.url, filename: resource.title.fr, sha256: resource.sha256 }));
}

function sourceData(definition) {
  const absolutePath = path.join(packageRoot, definition.path);
  const course = readJson(absolutePath);
  const courseDirectory = path.dirname(definition.path);
  course._directory = courseDirectory;
  const mediaPath = path.join(packageRoot, courseDirectory, "media", "media_manifest.json");
  course._media = fs.existsSync(mediaPath) ? readJson(mediaPath) : {};
  const videoPath = path.join(packageRoot, courseDirectory, "media", "videos_manifest.json");
  course._videos = fs.existsSync(videoPath) ? readJson(videoPath) : {};
  course._catalog = sourceCatalogFor(courseDirectory);
  return course;
}

const sourceCourses = courseDefinitions.map(sourceData);
const checkpointKeys = {};
const finalQuizzes = {};
const labs = {};
const publicCourses = [];
const courseMetadata = [];
const allSources = {};

for (const sourceCourse of sourceCourses) {
  Object.assign(allSources, sourceCourse._catalog);
  const courseLessons = [];
  for (const module of sourceCourse.modules) {
    for (const lesson of module.lessons) {
      const chapters = [];
      for (const screen of lesson.screens) {
        const chapter = screenToChapter({ screen, course: sourceCourse, module, lesson, catalog: sourceCourse._catalog, media: sourceCourse._media, courseId: sourceCourse.id });
        if (courseLessons.length === 0 && chapters.length === 0) chapter.blocks.unshift(warningBlock(sourceCourse.safety));
        if (chapter._privateCheckpoint) {
          checkpointKeys[chapter._privateCheckpoint.exerciseId] = {
            correctAnswer: chapter._privateCheckpoint.correctAnswer,
            explanation: { fr: chapter._privateCheckpoint.explanation || "Réponse correcte.", en: chapter._privateCheckpoint.explanation || "Correct answer." },
            incorrectExplanation: { fr: chapter._privateCheckpoint.incorrectExplanation || "Réponse incorrecte.", en: chapter._privateCheckpoint.incorrectExplanation || "Incorrect answer." },
          };
          delete chapter._privateCheckpoint;
        }
        if (chapter._privateLab) {
          labs[chapter._privateLab.labId] = {
            id: chapter._privateLab.labId,
            courseId: sourceCourse.id,
            title: chapter.blocks[0]?.title?.fr || chapter.title?.fr || chapter._privateLab.labId,
            maxScore: Number(chapter.blocks[0].maxScore || 100),
            passingScore: Number(chapter.blocks[0].passingScore || 75),
            rubric: chapter.blocks[0].rubricCriteria,
            correction: chapter._privateLab.solution,
            correctionSha256: chapter._privateLab.solutionSha256,
          };
          delete chapter._privateLab;
        }
        chapters.push(chapter);
      }
      courseLessons.push({
        id: asKey(sourceCourse.id, module.id, lesson.id),
        moduleId: module.id,
        title: local(lesson.title),
        objective: local(lesson.objective_fr || lesson.objective || lesson.description_fr || ""),
        estimatedMinutes: Number(lesson.estimated_minutes || 0),
        recommendedVideosManaged: false,
        recommendedVideos: [],
        chapters,
      });
    }
  }

  if (sourceCourse.final_quiz_ref) {
    const sourceQuiz = readJson(path.join(packageRoot, sourceCourse._directory, sourceCourse.final_quiz_ref));
    const quizId = asKey(sourceCourse.id, "final_quiz");
    const questions = sourceQuiz.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt_fr,
      options: question.options.map((option) => ({ id: option.id.toLowerCase(), text: option.text_fr })),
      correctAnswer: String(question.options.find((option) => option.correct)?.id || "").toLowerCase(),
      explanation: question.explanation_fr,
      sourceRefs: sourceRefs(question.source_refs, sourceCourse._catalog),
    }));
    finalQuizzes[sourceCourse.id] = { id: quizId, title: sourceQuiz.title, passingScore: Number(sourceQuiz.passing_score_percent || 75), maxAttempts: 3, questions };
    courseLessons.at(-1).chapters.push({ id: asKey(sourceCourse.id, "final_evaluation"), title: local("Évaluation finale"), type: "quiz", requiredBeforeAdvance: true, blocks: [{ type: "course_final_quiz", id: quizId, courseId: sourceCourse.id, title: local(sourceQuiz.title), passingScore: Number(sourceQuiz.passing_score_percent || 75) }] });
  }

  const courseJson = {
    courseId: sourceCourse.id,
    certificationId,
    collectionId,
    language: "fr",
    supportedLanguages: ["fr"],
    languageSelectionDisabled: true,
    safety: sourceCourse.safety,
    lessons: courseLessons,
    exercises: [],
    sections: sourceCourse.modules.map((module) => ({
      id: module.id,
      title: local(module.title),
      lessons: module.lessons.map((lesson) => lesson.title),
    })),
    competencyTags: ["research_method", "ai_governance", "reproducibility", "human_validation"],
    downloadableResources: sourceCourse.id === "claude_science_03_travaux_pratiques" ? Object.values(assetMap).filter((asset) => asset.kind === "download" && !asset.key.includes("solutions/")).map((asset) => ({ title: local(asset.title), url: asset.url, sha256: asset.sha256 })) : [],
  };
  writeJson(path.join(root, "client", "public", "data", "courses", `${sourceCourse.id}.json`), courseJson);
  publicCourses.push(courseJson);
  courseMetadata.push({ sourceCourse, courseJson });
}

writeText(path.join(root, "server", "claudeScienceV2Assessments.ts"), `/** Generated from the supplied Claude Science V2 package. Correct answers and TP corrections remain server-only. */\nexport const CLAUDE_SCIENCE_V2_CERTIFICATION_ID = ${JSON.stringify(certificationId)} as const;\nexport const CLAUDE_SCIENCE_V2_COURSE_ORDER = ${JSON.stringify(sourceCourses.map((course) => course.id))} as const;\nexport const CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS = ${JSON.stringify(checkpointKeys, null, 2)} as const;\nexport const CLAUDE_SCIENCE_V2_FINAL_QUIZZES = ${JSON.stringify(finalQuizzes, null, 2)} as const;\nexport const CLAUDE_SCIENCE_V2_LABS = ${JSON.stringify(labs, null, 2)} as const;\n`);

const indexPath = path.join(root, "client", "src", "data", "trainingIndex.json");
const index = readJson(indexPath);
index.categories = (index.categories || []).filter((entry) => entry.id !== categoryId);
index.categories.push({ id: categoryId, title: local("IA pour la recherche et la santé", "AI for Research & Health"), subtitle: local("Formations responsables pour la recherche scientifique : données synthétiques, reproductibilité et validation humaine."), order: 10 });
index.certifications = (index.certifications || []).filter((entry) => entry.id !== certificationId);
index.courses = (index.courses || []).filter((entry) => !sourceCourses.some((course) => course.id === entry.id));
const totalLessons = sourceCourses.reduce((total, course) => total + course.lesson_count, 0);
const totalCheckpoints = sourceCourses.reduce((total, course) => total + course.checkpoint_count, 0);
const totalQuestions = sourceCourses.reduce((total, course) => total + course.quiz_question_count, 0);
const totalChapters = publicCourses.reduce((total, course) => total + course.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.chapters.length, 0), 0);
const courseIds = sourceCourses.map((course) => course.id);
index.certifications.push({
  id: certificationId,
  title: local("Parcours Claude Science pour la recherche médicale", "Claude Science for Medical Research"),
  description: local("Un parcours français, non clinique et progressif pour les chercheurs : méthodes, conformité, analyses reproductibles et travaux pratiques sur données synthétiques."),
  level: local("Débutant à avancé", "Beginner to advanced"),
  icon: "🔬",
  courseCount: sourceCourses.length,
  totalLessons,
  totalExercises: totalCheckpoints + totalQuestions + 4,
  totalVideos: 2,
  totalDownloads: Object.values(assetMap).filter((asset) => asset.kind === "download" && !asset.key.includes("solutions/")).length,
  // Screens rhythm a lesson in the reader; only the 19 canonical lessons are
  // learner-facing catalogue units and must feed neither catalogue nor KPI counts.
  totalActivities: totalLessons,
  courses: courseIds,
  group: categoryId,
  trainingFormat: "formation",
  source_refs: ["anthropic_product", "anthropic_overview", "prisma_2020"],
  sequentialCourseLocking: true,
  language: "fr",
});
for (const [indexPosition, { sourceCourse, courseJson }] of courseMetadata.entries()) {
  const finalQuiz = finalQuizzes[sourceCourse.id];
  index.courses.push({
    id: sourceCourse.id,
    certId: certificationId,
    title: local(sourceCourse.title),
    description: local(sourceCourse.description),
    order: indexPosition + 1,
    subCategoryId: "research_health",
    subCategory: local("Recherche & santé", "Research & Health"),
    tags: ["claude-science", "recherche-médicale", "données-synthétiques", "reproductibilité", "validation-humaine", "non-clinique"],
    targetJob: "Chercheur·se en santé, médecin chercheur, doctorant·e, épidémiologiste, biostatisticien·ne, coordinateur·rice de recherche",
    tools: ["Claude Science", "données synthétiques", "Python", "R"],
    acquiredSkills: ["Cadrer une analyse non clinique", "Documenter la provenance", "Appliquer le moindre privilège", "Vérifier une sortie avec un contrôle humain"],
    level: local(sourceCourse.level.replace(/_/g, " ")), 
    lessonCount: sourceCourse.lesson_count,
    chapterCount: sourceCourse.lesson_count,
    exerciseCount: sourceCourse.checkpoint_count + (finalQuiz?.questions.length || 0) + sourceCourse.lab_count,
    videoCount: Object.keys(sourceCourse._videos || {}).length,
    downloadCount: sourceCourse.id === "claude_science_03_travaux_pratiques" ? courseJson.downloadableResources.length : 0,
    totalActivities: sourceCourse.lesson_count,
    estimatedDurationMinutes: Math.round(Number(sourceCourse.estimated_duration_hours || 0) * 60),
    source_refs: ["anthropic_product", "anthropic_overview"],
    learningTheme: "laboratory",
    supportedLanguages: ["fr"],
    languageSelectionDisabled: true,
    sequentialPreviousCourseId: indexPosition > 0 ? sourceCourses[indexPosition - 1].id : undefined,
  });
}
writeJson(indexPath, index);

const mediaLibraryPath = path.join(root, "client", "public", "data", "mediaLibrary.json");
const mediaLibrary = fs.existsSync(mediaLibraryPath) ? readJson(mediaLibraryPath) : {};
const isPrivateClaudeScienceAssetUrl = (url) => /\/api\/assets\/claude-science-v2\/03_claude_science_travaux_pratiques\/(?:solutions\/|downloads\/expected\/|downloads\/scripts\/solution_)/.test(url);
for (const url of Object.keys(mediaLibrary)) {
  if (isPrivateClaudeScienceAssetUrl(url)) delete mediaLibrary[url];
}
for (const asset of Object.values(assetMap)) {
  if (isPrivateClaudeScienceAssetUrl(asset.url)) continue;
  mediaLibrary[asset.url] = { id: `claude_science_v2_${asset.sha256.slice(0, 18)}`, url: asset.url, title: asset.title, kind: asset.kind, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}
writeJson(mediaLibraryPath, mediaLibrary);

console.log(JSON.stringify({ certificationId, courses: sourceCourses.map((course) => course.id), checkpoints: Object.keys(checkpointKeys).length, finalQuestions: Object.values(finalQuizzes).reduce((total, quiz) => total + quiz.questions.length, 0), labs: sourceCourses.reduce((total, course) => total + course.lab_count, 0), assets: Object.keys(assetMap).length, chapters: totalChapters }, null, 2));
