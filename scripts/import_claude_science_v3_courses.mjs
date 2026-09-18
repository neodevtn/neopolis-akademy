import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const packageRoot = path.join(root, ".work", "claude-science-v3-2026-09-18", "unpacked", "claude_science_recherche_sante_fr_v3_2026-09-18");
const assetMapPath = path.join(root, ".work", "claude-science-v3-2026-09-18", "asset-map.json");
const categoryId = "ai_research_health";

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
// The supplied collection is French-only. The catalog schema requires both
// locale keys, so the source text is stored verbatim in each key; no
// translation, summary, or pedagogical rewrite is performed.
const local = (value) => ({ fr: String(value ?? ""), en: String(value ?? "") });
const key = (...parts) => parts.join("__").replace(/[^a-zA-Z0-9_]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").toLowerCase();
const listItems = (value) => String(value || "").split(/\n+/).map((item) => item.trim().replace(/^(?:[-•*]|\d+[.)])\s*/, "").trim()).filter(Boolean);
const fileNamePattern = /\b[A-Za-z0-9][A-Za-z0-9_.-]*\.(?:csv|json|py|R|md|png)\b/g;

const collection = readJson(path.join(packageRoot, "COLLECTION.json"));
const sourceRegistry = readJson(path.join(packageRoot, "SOURCE_REGISTRY.json")).sources;
const mediaManifest = readJson(path.join(packageRoot, "media", "media_manifest.json"));
const videoManifest = readJson(path.join(packageRoot, "media", "videos_manifest.json"));
const assetMap = readJson(assetMapPath);

function required(value, identifier) {
  if (value === undefined || value === null || value === "") throw new Error(`Missing required value: ${identifier}`);
  return value;
}

function assetFor(relativePath) {
  const record = assetMap[relativePath];
  if (!record) throw new Error(`Missing uploaded declared asset: ${relativePath}`);
  return record;
}

function sourceRefs(ids = []) {
  return ids.map((id) => {
    const source = sourceRegistry[id];
    if (!source?.title || !source?.url) throw new Error(`Missing source registry reference: ${id}`);
    return { id, title: source.title, url: source.url };
  });
}

function screenSources(screen, lesson) {
  return sourceRefs(screen.sources || lesson.sources || []);
}

function labFor(screen, courseDirectory) {
  const labRef = required(screen.lab_ref, `${screen.type}.lab_ref`);
  const labPath = path.join(packageRoot, courseDirectory, labRef);
  if (!fs.existsSync(labPath)) throw new Error(`Missing declared lab: ${courseDirectory}/${labRef}`);
  return readJson(labPath);
}

function resourceForLabFile(relativePath, courseDirectory) {
  const asset = assetFor(path.join(courseDirectory, relativePath).replace(/\\/g, "/"));
  if (asset.visibility !== "public") throw new Error(`A learner-required lab file is not public: ${relativePath}`);
  return { title: local(path.basename(relativePath)), description: local(path.basename(relativePath)), filename: path.basename(relativePath), url: asset.url, sha256: asset.sha256, size: asset.bytes };
}

function resourcesNamedInAction(values) {
  const text = values.filter(Boolean).join("\n");
  return Object.entries(assetMap)
    .filter(([relativePath, asset]) => asset.visibility === "public" && (text.includes(relativePath.replace(/^courses\/03_travaux_pratiques\//, "")) || text.includes(path.basename(relativePath))))
    .map(([relativePath, asset]) => ({ title: local(path.basename(relativePath)), description: local(path.basename(relativePath)), filename: path.basename(relativePath), url: asset.url, sha256: asset.sha256, size: asset.bytes }));
}

function correctionResourcesFor(lab, courseDirectory) {
  const solution = fs.readFileSync(path.join(packageRoot, courseDirectory, required(lab.solution_file, `${lab.id}.solution_file`)), "utf8");
  const names = [...new Set(solution.match(fileNamePattern) || [])];
  return names.map((name) => {
    const record = Object.entries(assetMap).find(([relativePath, asset]) => asset.visibility === "after_submission" && path.basename(relativePath) === name);
    if (!record) throw new Error(`Correction cites an undeclared private asset: ${lab.id}/${name}`);
    const [, asset] = record;
    return { title: name, filename: name, url: asset.url, sha256: asset.sha256, size: asset.bytes };
  });
}

function rubricFor(lab) {
  return Object.entries(required(lab.grading?.rubric, `${lab.id}.grading.rubric`)).map(([id, weight]) => ({ id, label: id, weight: Number(weight) }));
}

function warningBlock(course) {
  return {
    type: "callout",
    variant: "danger",
    body: local(required(course.safety?.warning_fr, `${course.id}.safety.warning_fr`)),
  };
}

function mapScreen({ screen, course, courseDirectory, module, lesson, checkpointKeys, labs }) {
  const chapterId = key(course.id, module.id, lesson.id, "screen", required(screen.order, `${lesson.id}.screen.order`));
  const common = {
    id: chapterId,
    title: local(required(screen.title, `${chapterId}.title`)),
    type: "teaching",
    requiredBeforeAdvance: screen.completion !== "read",
  };

  if (screen.type === "Objectives") {
    return { ...common, requiredBeforeAdvance: false, blocks: [{ type: "learning_objectives", title: local(screen.title), items: listItems(required(screen.body_fr, `${chapterId}.body_fr`)).map(local) }] };
  }
  if (screen.type === "SourceGroundedText") {
    const references = screenSources(screen, lesson);
    return { ...common, requiredBeforeAdvance: false, blocks: [{ type: "content", body: local(required(screen.body_fr, `${chapterId}.body_fr`)), sourceClaims: screen.claims || [] }, { type: "source_references", sources: references }] };
  }
  if (screen.type === "VideoEmbed") {
    const video = videoManifest[required(screen.video_ref, `${chapterId}.video_ref`)];
    if (!video?.youtube_id || !video?.url || !video?.embed_url || !video?.alternative_fr) throw new Error(`Missing declared video metadata: ${screen.video_ref}`);
    return {
      ...common,
      requiredBeforeAdvance: !screen.optional,
      blocks: [{
        type: "video",
        id: video.youtube_id,
        videoId: video.youtube_id,
        title: local(screen.title),
        watchUrl: video.url,
        embedUrl: video.embed_url,
        videoLanguage: video.language,
        objectiveBefore: local(required(screen.viewing_task_fr, `${chapterId}.viewing_task_fr`)),
        alternativeTextFr: video.alternative_fr,
        optional: Boolean(screen.optional),
        mediaMeta: { source: video.official ? "Anthropic" : "", official: Boolean(video.official), type: "official_video" },
      }],
    };
  }
  if (screen.type === "AnnotatedScreenshot") {
    const media = mediaManifest[required(screen.media_ref, `${chapterId}.media_ref`)];
    if (!media?.path) throw new Error(`Missing declared image metadata: ${screen.media_ref}`);
    const asset = assetFor(media.path);
    return {
      ...common,
      requiredBeforeAdvance: false,
      blocks: [{
        type: "annotated_screenshot",
        title: local(screen.title),
        imageUrl: asset.url,
        alt: local(required(screen.alt_fr, `${chapterId}.alt_fr`)),
        caption: local(required(screen.caption_fr, `${chapterId}.caption_fr`)),
        guidedZones: (screen.guided_zones || []).map((zone) => ({ id: required(zone.id, `${chapterId}.zone.id`), label: local(required(zone.label_fr, `${chapterId}.zone.label_fr`)), explanation: local(required(zone.explanation_fr, `${chapterId}.zone.explanation_fr`)), check: local(required(zone.check_fr, `${chapterId}.zone.check_fr`)) })),
        displayPolicy: { allowZoom: Boolean(screen.display?.zoom), allowFullscreen: Boolean(screen.display?.lightbox), max_initial_height_px: screen.display?.max_width_px },
        sourceRefs: sourceRefs([required(media.source_ref, `${chapterId}.media.source_ref`)]),
      }],
    };
  }
  if (screen.type === "GuidedAction") {
    return {
      ...common,
      blocks: [{ type: "guided_action", id: chapterId, title: local(screen.title), steps: required(screen.steps_fr, `${chapterId}.steps_fr`).map(local), expectedEvidence: local(required(screen.expected_evidence_fr, `${chapterId}.expected_evidence_fr`)), resources: resourcesNamedInAction([...(screen.steps_fr || []), screen.expected_evidence_fr]) }],
    };
  }
  if (screen.type === "CheckpointMCQ") {
    const options = required(screen.options, `${chapterId}.options`);
    const correct = options.find((option) => option.correct === true);
    if (!correct) throw new Error(`Missing correct checkpoint option: ${chapterId}`);
    const exerciseId = key(course.id, module.id, lesson.id, "checkpoint", screen.order);
    checkpointKeys[exerciseId] = {
      correctAnswer: String(correct.id).toLowerCase(),
      explanation: { fr: required(screen.feedback_correct_fr, `${chapterId}.feedback_correct_fr`) },
      incorrectExplanation: { fr: required(screen.feedback_incorrect_fr, `${chapterId}.feedback_incorrect_fr`) },
    };
    return {
      ...common,
      type: "checkpoint",
      blocks: [{ type: "single_choice_exercise", id: exerciseId, question: local(required(screen.question_fr, `${chapterId}.question_fr`)), options: options.map((option) => ({ id: String(required(option.id, `${chapterId}.option.id`)).toLowerCase(), text: local(required(option.text_fr, `${chapterId}.option.text_fr`)) })), serverValidated: true }],
    };
  }
  if (screen.type === "LessonSummary") {
    return { ...common, requiredBeforeAdvance: false, blocks: [{ type: "lesson_summary", title: local(screen.title), items: listItems(required(screen.body_fr, `${chapterId}.body_fr`)).map(local) }] };
  }
  if (screen.type === "EnvironmentPreparation") {
    const lab = labFor(screen, courseDirectory);
    return {
      ...common,
      requiredBeforeAdvance: false,
      blocks: [
        { type: "callout", variant: "warning", title: local(screen.title), body: local(required(screen.body_fr, `${chapterId}.body_fr`)) },
        ...required(lab.required_files, `${lab.id}.required_files`).map((relativePath) => {
          const resource = resourceForLabFile(relativePath, courseDirectory);
          return { type: "download", title: resource.title, description: resource.description, url: resource.url, filename: resource.filename, sha256: resource.sha256 };
        }),
      ],
    };
  }
  if (screen.type === "PracticalLab") {
    const lab = labFor(screen, courseDirectory);
    const solutionPath = path.join(packageRoot, courseDirectory, required(lab.solution_file, `${lab.id}.solution_file`));
    const correction = fs.readFileSync(solutionPath, "utf8");
    labs[lab.id] = {
      id: lab.id,
      courseId: course.id,
      title: required(lab.title, `${lab.id}.title`),
      maxScore: Number(required(lab.grading?.total_points, `${lab.id}.grading.total_points`)),
      passingScore: Number(required(lab.grading?.passing_score, `${lab.id}.grading.passing_score`)),
      rubric: rubricFor(lab),
      correction,
      correctionSha256: crypto.createHash("sha256").update(correction).digest("hex"),
      correctionResources: correctionResourcesFor(lab, courseDirectory),
    };
    return {
      ...common,
      blocks: [{
        type: "cloud_exercise",
        id: lab.id,
        title: local(screen.title),
        assignment: local(required(lab.objective, `${lab.id}.objective`)),
        steps: required(lab.instructions, `${lab.id}.instructions`).map(local),
        resources: required(lab.required_files, `${lab.id}.required_files`).map((relativePath) => resourceForLabFile(relativePath, courseDirectory)),
        learnerCriteria: required(lab.evidence_required, `${lab.id}.evidence_required`).map(local),
        rubricCriteria: rubricFor(lab),
        maxScore: Number(required(lab.grading?.total_points, `${lab.id}.grading.total_points`)),
        passingScore: Number(required(lab.grading?.passing_score, `${lab.id}.grading.passing_score`)),
        serverGradedAssessment: "claude_science_v2_lab",
      }],
    };
  }
  if (screen.type === "Reflection") {
    return { ...common, blocks: [{ type: "reflection", id: key(course.id, module.id, lesson.id, "reflection", screen.order), title: local(screen.title), prompt: local(required(screen.prompts_fr, `${chapterId}.prompts_fr`).join("\n\n")) }] };
  }
  throw new Error(`Unsupported V3 source block: ${screen.type}`);
}

const courses = collection.course_paths.map((coursePath) => {
  const course = readJson(path.join(packageRoot, coursePath));
  const directory = path.dirname(coursePath);
  if (!collection.course_order.includes(course.id)) throw new Error(`Course absent from collection order: ${course.id}`);
  return { course, directory };
}).sort((left, right) => collection.course_order.indexOf(left.course.id) - collection.course_order.indexOf(right.course.id));

const checkpointKeys = {};
const labs = {};
const finalQuizzes = {};
const publicCourses = [];
const catalogEntries = [];

for (const { course, directory } of courses) {
  const lessons = [];
  for (const module of required(course.modules, `${course.id}.modules`)) {
    for (const lesson of required(module.lessons, `${module.id}.lessons`)) {
      const chapters = required(lesson.screens, `${lesson.id}.screens`).map((screen) => mapScreen({ screen, course, courseDirectory: directory, module, lesson, checkpointKeys, labs }));
      if (lessons.length === 0) chapters[0].blocks.unshift(warningBlock(course));
      lessons.push({ id: key(course.id, module.id, lesson.id), moduleId: module.id, title: local(required(lesson.title, `${lesson.id}.title`)), objective: local(required(lesson.objective, `${lesson.id}.objective`)), estimatedMinutes: Number(required(lesson.estimated_minutes, `${lesson.id}.estimated_minutes`)), recommendedVideosManaged: false, recommendedVideos: [], chapters });
    }
  }
  const quiz = readJson(path.join(packageRoot, directory, required(course.quiz_ref, `${course.id}.quiz_ref`)));
  const quizId = key(course.id, "final_quiz");
  finalQuizzes[course.id] = {
    id: quizId,
    title: required(quiz.title, `${course.id}.quiz.title`),
    passingScore: Number(required(quiz.passing_score_percent, `${course.id}.quiz.passing_score_percent`)),
    maxAttempts: null,
    questions: required(quiz.questions, `${course.id}.quiz.questions`).map((question) => ({
      id: required(question.id, `${course.id}.quiz.question.id`),
      prompt: required(question.prompt_fr, `${course.id}.quiz.question.prompt_fr`),
      options: required(question.options_fr, `${course.id}.quiz.question.options_fr`).map((text, index) => ({ id: String.fromCharCode(97 + index), text })),
      correctAnswer: String.fromCharCode(97 + Number(required(question.correct_option_index, `${course.id}.quiz.question.correct_option_index`))),
      explanation: required(question.explanation_fr, `${course.id}.quiz.question.explanation_fr`),
      sourceRefs: sourceRefs(required(question.source_refs, `${course.id}.quiz.question.source_refs`)),
    })),
  };
  lessons.at(-1).chapters.push({ id: key(course.id, "final_evaluation"), title: local(quiz.title), type: "quiz", requiredBeforeAdvance: true, blocks: [{ type: "course_final_quiz", id: quizId, courseId: course.id, title: local(quiz.title), passingScore: Number(quiz.passing_score_percent) }] });

  const courseJson = { courseId: course.id, certificationId: collection.id, collectionId: collection.id, language: course.language, supportedLanguages: [course.language], languageSelectionDisabled: true, safety: course.safety, lessons, exercises: [], sections: course.modules.map((module) => ({ id: module.id, title: local(module.title), lessons: module.lessons.map((lesson) => local(lesson.title)) })), competencyTags: course.modules.flatMap((module) => module.skill_tags || []), downloadableResources: [] };
  writeJson(path.join(root, "client", "public", "data", "courses", `${course.id}.json`), courseJson);
  publicCourses.push(courseJson);
  catalogEntries.push({ course, courseJson });
}

const assessmentOutput = `/** Generated only from the supplied Claude Science V3 package. Correct answers and corrections remain server-only. */\nexport const CLAUDE_SCIENCE_V2_CERTIFICATION_ID = ${JSON.stringify(collection.id)} as const;\nexport const CLAUDE_SCIENCE_V2_COURSE_ORDER = ${JSON.stringify(collection.course_order)} as const;\nexport const CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS = ${JSON.stringify(checkpointKeys, null, 2)} as const;\nexport const CLAUDE_SCIENCE_V2_FINAL_QUIZZES = ${JSON.stringify(finalQuizzes, null, 2)} as const;\nexport const CLAUDE_SCIENCE_V2_LABS = ${JSON.stringify(labs, null, 2)} as const;\n`;
fs.writeFileSync(path.join(root, "server", "claudeScienceV2Assessments.ts"), assessmentOutput);

const indexPath = path.join(root, "client", "src", "data", "trainingIndex.json");
const index = readJson(indexPath);
const oldClaudeScienceCourseIds = new Set(index.courses.filter((entry) => entry.certId === "claude_science_recherche_medicale" || entry.certId === collection.id).map((entry) => entry.id));
for (const legacyId of ["claude_science_01_initiation", "claude_science_02_pratique", "claude_science_03_travaux_pratiques"]) oldClaudeScienceCourseIds.add(legacyId);
for (const legacyId of oldClaudeScienceCourseIds) {
  if (!collection.course_order.includes(legacyId)) fs.rmSync(path.join(root, "client", "public", "data", "courses", `${legacyId}.json`), { force: true });
}
index.categories = (index.categories || []).filter((entry) => entry.id !== categoryId);
index.categories.push({ id: categoryId, title: local("IA pour la recherche scientifique et la sante"), subtitle: local(""), order: 10 });
index.certifications = (index.certifications || []).filter((entry) => entry.id !== "claude_science_recherche_medicale" && entry.id !== collection.id);
index.courses = (index.courses || []).filter((entry) => !oldClaudeScienceCourseIds.has(entry.id));
const sourceIds = [...new Set(courses.flatMap(({ course }) => course.modules.flatMap((module) => module.lessons.flatMap((lesson) => lesson.sources || []))))];
index.certifications.push({ id: collection.id, title: local(collection.title), description: local(""), level: local(""), icon: "", courseCount: collection.metrics.courses, totalLessons: collection.metrics.lessons, totalExercises: collection.metrics.checkpoints + collection.metrics.labs + collection.metrics.final_quiz_questions, totalVideos: Object.keys(videoManifest).length, totalDownloads: Object.values(assetMap).filter((asset) => asset.visibility === "public").length, totalActivities: collection.metrics.lessons, courses: collection.course_order, group: categoryId, trainingFormat: "formation", source_refs: sourceIds, sequentialCourseLocking: Boolean(collection.sequential_locking_between_courses), language: collection.language });
for (const [order, { course, courseJson }] of catalogEntries.entries()) {
  const finalQuiz = finalQuizzes[course.id];
  index.courses.push({ id: course.id, certId: collection.id, title: local(course.title), description: local(course.description), order: order + 1, subCategoryId: "research_health", subCategory: local(course.category), tags: course.modules.flatMap((module) => module.skill_tags || []), targetJob: course.target_audience.join(", "), tools: [], acquiredSkills: course.modules.flatMap((module) => module.skill_tags || []), level: local(course.level), lessonCount: course.lesson_count, chapterCount: course.lesson_count, exerciseCount: course.checkpoint_count + (finalQuiz?.questions.length || 0) + (course.id === "claude_science_03_tp" ? 3 : 0), videoCount: courseJson.lessons.flatMap((lesson) => lesson.chapters).flatMap((chapter) => chapter.blocks).filter((block) => block.type === "video").length, downloadCount: courseJson.lessons.flatMap((lesson) => lesson.chapters).flatMap((chapter) => chapter.blocks).filter((block) => block.type === "download").length, totalActivities: course.lesson_count, estimatedDurationMinutes: course.estimated_minutes, source_refs: sourceIds, supportedLanguages: [course.language], languageSelectionDisabled: true, ...(order > 0 ? { sequentialPreviousCourseId: catalogEntries[order - 1].course.id } : {}) });
}
writeJson(indexPath, index);

const mediaLibraryPath = path.join(root, "client", "public", "data", "mediaLibrary.json");
const mediaLibrary = fs.existsSync(mediaLibraryPath) ? readJson(mediaLibraryPath) : {};
for (const [url, item] of Object.entries(mediaLibrary)) {
  if (String(url).includes("/claude-science-v2/") || String(url).includes("/claude-science-v3/")) delete mediaLibrary[url];
}
for (const asset of Object.values(assetMap)) {
  if (asset.visibility !== "public") continue;
  mediaLibrary[asset.url] = { id: `claude_science_v3_${asset.sha256.slice(0, 18)}`, url: asset.url, title: path.basename(asset.path), kind: asset.kind, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}
writeJson(mediaLibraryPath, mediaLibrary);

const counters = { courses: publicCourses.length, modules: courses.reduce((sum, item) => sum + item.course.modules.length, 0), lessons: publicCourses.reduce((sum, course) => sum + course.lessons.length, 0), checkpoints: Object.keys(checkpointKeys).length, labs: Object.keys(labs).length, finalQuizQuestions: Object.values(finalQuizzes).reduce((sum, quiz) => sum + quiz.questions.length, 0) };
if (JSON.stringify(counters) !== JSON.stringify({ courses: 3, modules: 8, lessons: 12, checkpoints: 9, labs: 3, finalQuizQuestions: 12 })) throw new Error(`Unexpected V3 import counters: ${JSON.stringify(counters)}`);
console.log(JSON.stringify({ collectionId: collection.id, courseIds: collection.course_order, counters, assets: Object.keys(assetMap).length }, null, 2));
