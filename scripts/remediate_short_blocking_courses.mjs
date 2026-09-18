import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseDir = path.join(root, "client/public/data/courses");
const indexPath = path.join(root, "client/src/data/trainingIndex.json");

const remediationTargets = [
  {
    courseId: "ai_for_consulting__01",
    certificationId: "datacamp_ai_for_consulting",
    chapterIds: ["dc_ch02_act12"],
    reason: "BUCKETS_MISSING: categories cannot be restored without an authorized source.",
  },
  {
    courseId: "microsoft_copilot_in_powerpoint__01",
    certificationId: "datacamp_microsoft_copilot_in_powerpoint",
    chapterIds: ["dc_ch02_act02", "dc_ch02_act05", "dc_ch03_act02", "dc_ch03_act03", "dc_ch03_act05", "dc_ch03_act06"],
    reason: "MENTIONED_FILE_NOT_LINKED: the referenced SolarHome source files are absent from authorized sources and the media library.",
  },
  {
    courseId: "ai_assisted_coding_for_developers__01",
    certificationId: "datacamp_ai_assisted_coding_for_developers",
    chapterIds: ["dc_ch03_act06"],
    reason: "BUCKETS_MISSING: categories cannot be restored without an authorized source.",
  },
  {
    courseId: "software_development_with_claude_code__01",
    certificationId: "datacamp_software_development_with_claude_code",
    chapterIds: ["dc_ch02_act10"],
    reason: "VIDEO_SOURCE_MISSING: no authorized video source or transcript exists for this block.",
  },
  {
    courseId: "software_development_with_windsurf__01",
    certificationId: "datacamp_software_development_with_windsurf",
    chapterIds: ["dc_ch03_act06"],
    reason: "BUCKETS_MISSING: categories cannot be restored without an authorized source.",
  },
  {
    courseId: "claude_101__01",
    certificationId: "datacamp_claude_101",
    chapterIds: ["dc_ch02_act03"],
    reason: "BUCKETS_MISSING: categories cannot be restored without an authorized source.",
  },
  {
    courseId: "building_marketing_workflows_with_n8n__01",
    certificationId: "datacamp_building_marketing_workflows_with_n8n",
    removeCloudExerciseChapters: true,
    reason: "PRACTICAL_STARTER_UNAVAILABLE: no authorized workflow starter or correction source exists for the published practicals.",
  },
  {
    courseId: "ai_for_human_resources__01",
    certificationId: "datacamp_ai_for_human_resources",
    blockIds: ["dc_1_act_03_bucket_sort", "dc_2_act_12_bucket_sort"],
    reason: "BUCKETS_MISSING: categories cannot be restored without an authorized source.",
  },
  {
    courseId: "vibe_coding_with_replit__01",
    certificationId: "datacamp_vibe_coding_with_replit",
    blockIds: ["dc_1_act_05_bucket_sort", "dc_1_act_10_bucket_sort"],
    reason: "BUCKETS_MISSING: categories cannot be restored without an authorized source.",
  },
  {
    courseId: "transformation_processus_ia__01",
    certificationId: "transformation_processus_ia",
    exerciseIds: ["ex_transformation_processus_ia__01_001", "ex_transformation_processus_ia__01_002", "ex_transformation_processus_ia__01_003", "ex_transformation_processus_ia__01_004"],
    reason: "EXERCISE_PROMPT_MISSING_OR_UNCLEAR: no authorized source verifies the checkpoint prompts.",
  },
  {
    courseId: "transformation_processus_ia__04",
    certificationId: "transformation_processus_ia",
    exerciseIds: ["ex_transformation_processus_ia__04_001", "ex_transformation_processus_ia__04_002"],
    reason: "EXERCISE_PROMPT_MISSING_OR_UNCLEAR: no authorized source verifies the checkpoint prompts.",
  },
  {
    courseId: "claude_certified_associate_foundations__02",
    certificationId: "claude_certified_associate_foundations",
    blockIds: ["ex_claude_certified_associate_foundations__02_008"],
    exerciseIds: ["ex_claude_certified_associate_foundations__02_008"],
    reason: "EXERCISE_PROMPT_MISSING_OR_UNCLEAR: the checkpoint announces source data that are absent from the authorized materials.",
  },
  {
    courseId: "introduction_to_model_context_protocol_mcp__01",
    certificationId: "datacamp_introduction_to_model_context_protocol_mcp",
    blockIds: ["dc_1_act_03_tp", "dc_1_act_06_tp", "dc_3_act_06_tp", "dc_3_act_07_tp"],
    sourceDerivedLearnerCriteria: true,
    reason: "BROKEN_RESOURCE_URL: the mandatory Frankfurter endpoint is confirmed HTTP 404 and no authorized replacement exists.",
  },
  {
    courseId: "developing_ai_systems_with_the_openai_api__01",
    certificationId: "datacamp_developing_ai_systems_with_the_openai_api",
    blockIds: ["dc_2_act_03_bucket_sort"],
    sourceDerivedLearnerCriteria: true,
    reason: "BUCKETS_MISSING: categories cannot be restored without an authorized source.",
  },
  {
    courseId: "working_with_the_openai_responses_api__01",
    certificationId: "datacamp_working_with_the_openai_responses_api",
    sourceDerivedLearnerCriteria: true,
    reason: "PRACTICAL_CRITERIA_MISSING: learner criteria are derived verbatim from the published assignment or instructions.",
  },
];

const interactiveTypes = new Set([
  "cloud_exercise",
  "bucket_sort",
  "single_choice_exercise",
  "multi_choice_exercise",
  "matching",
  "matching_exercise",
  "code_repl",
  "free_text_exercise",
  "fill_blank",
  "ordering",
  "terminal_sim",
  "ai_evaluation",
  "resource_review",
  "exercise",
  "quiz",
  "checkpoint",
]);

function localizedBreakdown({ lessons, activities, videos, practicals, buckets, quizzes, codeExercises, aiEvaluations, downloads }) {
  const enParts = [
    `${lessons} chapters`,
    `${activities} activities`,
    `${videos} Projector lessons`,
  ];
  const frParts = [
    `${lessons} chapitres`,
    `${activities} activités`,
    `${videos} leçons Projector`,
  ];
  if (practicals > 0) {
    enParts.push(`${practicals} autonomous practice exercises`);
    frParts.push(`${practicals} TP autonomes`);
  }
  if (buckets > 0) {
    enParts.push(`${buckets} drag-and-drop ${buckets === 1 ? "exercise" : "exercises"}`);
    frParts.push(`${buckets} ${buckets === 1 ? "tri interactif" : "tris interactifs"}`);
  }
  if (quizzes > 0) {
    enParts.push(`${quizzes} quizzes`);
    frParts.push(`${quizzes} QCM`);
  }
  if (codeExercises > 0) {
    enParts.push(`${codeExercises} console exercises`);
    frParts.push(`${codeExercises} exercices console`);
  }
  if (aiEvaluations > 0) {
    enParts.push(`${aiEvaluations} practical prompting exercises`);
    frParts.push(`${aiEvaluations} exercices pratiques de prompting`);
  }
  enParts.push(`${downloads} downloads`);
  frParts.push(`${downloads} téléchargements`);
  return { en: enParts.join(" · "), fr: frParts.join(" · "), chapters: lessons };
}

function getCounts(course) {
  const chapters = (course.lessons || []).flatMap((lesson) => lesson.chapters || []);
  const blocks = chapters.flatMap((chapter) => chapter.blocks || []);
  const count = (type) => blocks.filter((block) => block.type === type).length;
  const practicals = count("cloud_exercise");
  const buckets = count("bucket_sort");
  const quizzes = count("single_choice_exercise") + count("multi_choice_exercise");
  const codeExercises = count("code_repl");
  const aiEvaluations = count("ai_evaluation");
  const exercises = blocks.filter((block) => interactiveTypes.has(block.type)).length;
  return {
    lessons: (course.lessons || []).length,
    activities: chapters.length,
    videos: count("video"),
    downloads: count("download"),
    exercises,
    practicals,
    buckets,
    quizzes,
    codeExercises,
    aiEvaluations,
  };
}

const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const results = [];

for (const target of remediationTargets) {
  const coursePath = path.join(courseDir, `${target.courseId}.json`);
  const course = JSON.parse(fs.readFileSync(coursePath, "utf8"));
  const chapterIds = new Set(target.chapterIds || []);
  const blockIds = new Set(target.blockIds || []);
  const exerciseIds = new Set(target.exerciseIds || []);
  if (target.removeCloudExerciseChapters) {
    for (const chapter of course.lessons.flatMap((lesson) => lesson.chapters || [])) {
      if ((chapter.blocks || []).some((block) => block.type === "cloud_exercise")) chapterIds.add(chapter.id);
    }
  }
  const beforeChapters = course.lessons.flatMap((lesson) => lesson.chapters || []);
  const presentChapterTargets = beforeChapters
    .filter((chapter) => chapterIds.has(chapter.id))
    .map((chapter) => chapter.id);
  const presentBlockTargets = beforeChapters
    .flatMap((chapter) => chapter.blocks || [])
    .filter((block) => blockIds.has(block.id) || exerciseIds.has(block.exerciseId) || exerciseIds.has(block.id))
    .map((block) => block.id || block.exerciseId);

  for (const lesson of course.lessons || []) {
    lesson.chapters = (lesson.chapters || [])
      .map((chapter) => {
        const hadTargetBlock = (chapter.blocks || []).some((block) => blockIds.has(block.id) || exerciseIds.has(block.exerciseId) || exerciseIds.has(block.id));
        return { ...chapter, blocks: (chapter.blocks || []).filter((block) => !blockIds.has(block.id) && !exerciseIds.has(block.exerciseId) && !exerciseIds.has(block.id)), hadTargetBlock };
      })
      .filter((chapter) => (!chapterIds.has(chapter.id) && (chapter.blocks || []).length > 0) || !chapter.hadTargetBlock)
      .map(({ hadTargetBlock, ...chapter }) => chapter);
  }
  course.lessons = (course.lessons || []).filter((lesson) => (lesson.chapters || []).length > 0);
  if (Array.isArray(course.exercises)) course.exercises = course.exercises.filter((exercise) => !exerciseIds.has(exercise.id));

  const survivingBlocks = course.lessons.flatMap((lesson) => lesson.chapters || []).flatMap((chapter) => chapter.blocks || []);
  if (survivingBlocks.some((block) => blockIds.has(block.id) || exerciseIds.has(block.exerciseId) || exerciseIds.has(block.id))) throw new Error(`A targeted block survives in ${target.courseId}.`);

  const counts = getCounts(course);

  if (target.courseId === "software_development_with_windsurf__01") {
    for (const block of course.lessons.flatMap((lesson) => lesson.chapters || []).flatMap((chapter) => chapter.blocks || [])) {
      for (const slide of block.projectorSlides || []) {
        for (const field of ["content", "contentLeft", "contentRight"]) {
          if (typeof slide[field] === "string" && /https:\/\/www\.neopolis akademy\.com/i.test(slide[field])) {
            slide[field] = "";
          }
        }
      }
    }
  }
  if (target.sourceDerivedLearnerCriteria) {
    for (const block of course.lessons.flatMap((lesson) => lesson.chapters || []).flatMap((chapter) => chapter.blocks || [])) {
      if (block.type !== "cloud_exercise" || (Array.isArray(block.learnerCriteria) && block.learnerCriteria.length > 0)) continue;
      const sourceCriterion = block.assignment || block.instructions || block.hint;
      if (sourceCriterion) block.learnerCriteria = [sourceCriterion];
    }
  }
  course.exerciseCount = counts.exercises;
  course.videoCount = counts.videos;
  course.downloadCount = counts.downloads;
  course.chapterCount = counts.activities;
  course.totalActivities = counts.activities;
  fs.writeFileSync(coursePath, `${JSON.stringify(course, null, 2)}\n`);

  const entry = index.courses.find((item) => item.id === target.courseId);
  const certification = index.certifications.find((item) => item.id === target.certificationId);
  if (!entry || !certification) throw new Error(`Missing catalog record for ${target.courseId}.`);

  const breakdown = localizedBreakdown(counts);
  Object.assign(entry, {
    lessonCount: counts.lessons,
    chapterCount: counts.activities,
    totalActivities: counts.activities,
    exerciseCount: counts.exercises,
    videoCount: counts.videos,
    downloadCount: counts.downloads,
    videos: [],
    breakdown,
  });
  const certificationCourses = index.courses.filter((item) => item.certId === target.certificationId);
  const certificationCounts = certificationCourses.reduce((total, item) => ({
    lessons: total.lessons + (item.lessonCount || 0),
    activities: total.activities + (item.totalActivities || 0),
    exercises: total.exercises + (item.exerciseCount || 0),
    videos: total.videos + (item.videoCount || 0),
    downloads: total.downloads + (item.downloadCount || 0),
  }), { lessons: 0, activities: 0, exercises: 0, videos: 0, downloads: 0 });
  const certificationBreakdown = certificationCourses.length === 1
    ? breakdown
    : {
      en: `${certificationCourses.length} courses · ${certificationCounts.lessons} chapters · ${certificationCounts.activities} activities · ${certificationCounts.videos} lessons · ${certificationCounts.exercises} interactive activities · ${certificationCounts.downloads} downloads`,
      fr: `${certificationCourses.length} cours · ${certificationCounts.lessons} chapitres · ${certificationCounts.activities} activités · ${certificationCounts.videos} leçons · ${certificationCounts.exercises} activités interactives · ${certificationCounts.downloads} téléchargements`,
      chapters: certificationCounts.lessons,
    };
  Object.assign(certification, {
    courseCount: certificationCourses.length,
    totalLessons: certificationCounts.lessons,
    totalActivities: certificationCounts.activities,
    totalExercises: certificationCounts.exercises,
    totalVideos: certificationCounts.videos,
    totalDownloads: certificationCounts.downloads,
    breakdown: certificationBreakdown,
  });

  results.push({
    courseId: target.courseId,
    removedChapterIds: presentChapterTargets,
    removedBlockIds: presentBlockTargets,
    reason: target.reason,
    counts,
  });
}

fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(JSON.stringify({ remediated: results }, null, 2));
