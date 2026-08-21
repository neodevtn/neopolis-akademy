import path from "node:path";

const ENTITY_MAP = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

function decodeEntities(value) {
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&(nbsp|amp|quot|apos|lt|gt);/gi, (entity) => ENTITY_MAP[entity.toLowerCase()] || entity);
}

export function htmlToText(value) {
  if (!value) return "";
  return decodeEntities(String(value)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|ul|ol|pre)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<code[^>]*>/gi, "`")
    .replace(/<\/code>/gi, "`")
    .replace(/<strong[^>]*>|<b[^>]*>/gi, "**")
    .replace(/<\/(strong|b)>/gi, "**")
    .replace(/<em[^>]*>|<i[^>]*>/gi, "_")
    .replace(/<\/(em|i)>/gi, "_")
    .replace(/<[^>]+>/g, ""))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function toI18n(value) {
  const text = typeof value === "object" && value !== null
    ? (value.fr || value.en || Object.values(value).find((item) => typeof item === "string") || "")
    : String(value || "");
  return { en: text, fr: text };
}

export function assetProxyUrl(storagePath) {
  if (!storagePath || typeof storagePath !== "string") return "";
  if (storagePath.startsWith("/api/assets/")) return storagePath;
  if (storagePath.startsWith("/manus-storage/")) return `/api/assets/${storagePath.slice("/manus-storage/".length)}`;
  return "";
}

export function parseUploadLog(uploadLog) {
  const map = new Map();
  const pattern = /Uploading file \(webdev private\):\s*(.+?)\s*\nFile uploaded successfully!\s*\nStorage Path:\s*(\/manus-storage\/[^\s]+)/g;
  for (const match of uploadLog.matchAll(pattern)) {
    const sourcePath = match[1].replace(/\s+\(size:\s*\d+\s+bytes\)\s*$/, "");
    map.set(path.normalize(sourcePath), assetProxyUrl(match[2]));
  }
  return map;
}

function assetFor(relativePath, assetMap) {
  if (!relativePath) return "";
  const direct = assetMap.get(relativePath) || assetMap.get(path.normalize(relativePath));
  if (direct) return assetProxyUrl(direct);
  const normalized = path.normalize(relativePath);
  for (const [key, value] of assetMap.entries()) {
    if (key === normalized || key.endsWith(`${path.sep}${normalized}`)) return assetProxyUrl(value);
  }
  return "";
}

function sanitizeAutonomousCode(value) {
  if (!value) return "";
  return String(value)
    .replace(/^.*base_url\s*=.*\n?/gmi, "")
    .replace(/api_key\s*=\s*["']datacamp-token["']/gi, 'api_key=os.environ["ANTHROPIC_API_KEY"]')
    .replace(/api_key\s*=\s*datacamp-token/gi, 'api_key=os.environ["ANTHROPIC_API_KEY"]')
    .replace(/base_url\s*=\s*url,?\s*/gi, "")
    .trim();
}

function transcriptText(segments) {
  return (segments || [])
    .map((segment) => `${segment.heading || segment.slide_title || ""}\n${segment.text || ""}`.trim())
    .filter(Boolean)
    .join("\n\n");
}

function activityContent(activity) {
  return activity?.content || {};
}

function extractChoiceData(activity) {
  const content = activityContent(activity);
  const nestedQuestion = content.question && typeof content.question === "object" ? content.question : null;
  const solutionItems = Array.isArray(nestedQuestion?.solutionItems) ? nestedQuestion.solutionItems : [];
  const question = htmlToText(content.assignment_text || content.assignment_html || activity.title);
  const hint = toI18n(htmlToText(content.hint_text || content.hint_html || ""));
  if (solutionItems.length > 0) {
    const options = solutionItems.map((item, index) => ({
      id: String.fromCharCode(97 + index),
      text: toI18n(item.answer || ""),
    }));
    const correctAnswers = solutionItems
      .map((item, index) => item.correct ? String.fromCharCode(97 + index) : "")
      .filter(Boolean);
    if (correctAnswers.length === 0) {
      throw new Error(`QCM à réponses multiples sans réponse correcte explicite : activité ${activity.exercise_id || activity.exercise_number}`);
    }
    const explanation = solutionItems
      .filter((item) => item.correct && item.feedback)
      .map((item) => htmlToText(item.feedback))
      .join("\n\n");
    return {
      type: "multi_choice_exercise",
      id: `dc_${activity.chapter_number}_act_${String(activity.exercise_number).padStart(2, "0")}_qcm_multiple`,
      question: toI18n(question),
      options,
      correctAnswers: correctAnswers.join(","),
      explanation: toI18n(explanation),
      hint,
    };
  }
  const answers = nestedQuestion?.possible_answers?.length
    ? nestedQuestion.possible_answers
    : (content.possible_answers || []);
  const feedback = nestedQuestion?.feedback?.length
    ? nestedQuestion.feedback
    : (content.feedbacks || []);
  const options = answers.map((raw, index) => ({
    id: String.fromCharCode(97 + index),
    text: toI18n(String(raw).replace(/^\[|\]$/g, "")),
  }));
  const correctIndex = answers.findIndex((raw) => /^\[.*\]$/s.test(String(raw).trim()));
  if (correctIndex < 0) {
    throw new Error(`QCM sans réponse correcte explicite : activité ${activity.exercise_id || activity.exercise_number}`);
  }
  return {
    type: "single_choice_exercise",
    id: `dc_${activity.chapter_number}_act_${String(activity.exercise_number).padStart(2, "0")}_qcm`,
    question: toI18n(question),
    options,
    correctAnswer: String.fromCharCode(97 + correctIndex),
    explanation: toI18n(htmlToText(feedback[correctIndex] || "")),
    hint,
  };
}

function buildVideoBlock(activity, assetMap, slidesPdf) {
  const video = activity.video || {};
  const audioUrl = assetFor(video.audio_local, assetMap);
  const mp4Url = assetFor(video.mp4_local, assetMap);
  if (!audioUrl && !mp4Url) {
    throw new Error(`Vidéo sans média local mappé : activité ${activity.exercise_id || activity.exercise_number}`);
  }
  const segments = video.transcript_segments || [];
  return {
    type: "video",
    id: `dc_${activity.chapter_number}_act_${String(activity.exercise_number).padStart(2, "0")}_video`,
    title: toI18n(activity.title),
    ...(mp4Url ? { mp4Url } : {}),
    ...(audioUrl ? { audioUrl } : {}),
    ...(assetFor(video.hls_local, assetMap) ? { hlsUrl: assetFor(video.hls_local, assetMap) } : {}),
    ...(assetFor(video.subtitles?.fr_local, assetMap) ? { subtitleUrlFr: assetFor(video.subtitles?.fr_local, assetMap) } : {}),
    ...(assetFor(video.subtitles?.en_local, assetMap) ? { subtitleUrlEn: assetFor(video.subtitles?.en_local, assetMap) } : {}),
    ...(slidesPdf ? { slidesPdf } : {}),
    transcript: transcriptText(segments),
    transcriptSegments: segments.map((segment) => ({ heading: segment.heading || segment.slide_title || "", text: segment.text || "" })),
  };
}

function buildPracticalBlock(activity) {
  const content = activityContent(activity);
  const assignment = htmlToText(content.assignment_text || content.assignment_html || "");
  const instructions = htmlToText(content.instructions_text || content.instructions_markdown || "");
  const starterCode = sanitizeAutonomousCode(content.sample_code || "");
  const solution = sanitizeAutonomousCode(content.solution || "");
  const combinedInstructions = [
    instructions,
    starterCode ? `### Code de départ\n\n\`\`\`python\n${starterCode}\n\`\`\`` : "",
  ].filter(Boolean).join("\n\n");
  return {
    type: "cloud_exercise",
    id: `dc_${activity.chapter_number}_act_${String(activity.exercise_number).padStart(2, "0")}_tp`,
    title: toI18n(activity.title),
    assignment,
    instructions: combinedInstructions,
    environmentGuide: {
      fr: "Préparez votre environnement autonome : installez Python et le SDK requis, définissez vos identifiants personnels dans des variables d’environnement et remplacez tout proxy ou jeton DataCamp par votre propre configuration. Ne publiez jamais de clé API dans votre réponse.",
      en: "Prepare your own environment: install Python and the required SDK, configure your personal credentials through environment variables, and replace any DataCamp proxy or token with your own setup. Never paste an API key in your answer.",
    },
    hint: htmlToText(content.hint_text || content.hint_html || ""),
    solution,
    successMessage: content.success_message || "",
    xp: activity.xp || 0,
  };
}

function buildChapter(activity, sourceChapter, assetMap, activityIndex) {
  const slidesPdf = assetFor(sourceChapter.slides_pdf_local, assetMap);
  let blocks;
  let type = "teaching";
  switch (activity.type) {
    case "VideoExercise":
      blocks = [buildVideoBlock(activity, assetMap, slidesPdf)];
      break;
    case "PureMultipleChoiceExercise":
      type = "quiz";
      blocks = [extractChoiceData(activity)];
      break;
    case "NormalExercise":
      type = "exercise";
      blocks = [buildPracticalBlock(activity)];
      break;
    default:
      throw new Error(`Type d’activité DataCamp non encore pris en charge sans perte de contenu : ${activity.type}`);
  }
  if (activityIndex === 0 && slidesPdf) {
    blocks.push({
      type: "download",
      id: `dc_ch${String(activity.chapter_number).padStart(2, "0")}_slides`,
      title: toI18n(`Chapter ${activity.chapter_number} slides`),
      description: toI18n("Official course slides provided in the local DataCamp package."),
      url: slidesPdf,
      filename: path.basename(sourceChapter.slides_pdf_local),
    });
  }
  return {
    id: `dc_ch${String(activity.chapter_number).padStart(2, "0")}_act${String(activity.exercise_number).padStart(2, "0")}`,
    title: toI18n(activity.title),
    description: toI18n(sourceChapter.description || ""),
    type,
    requiredBeforeAdvance: true,
    blocks,
  };
}

export function convertDataCampV1(manifest, assetMap = new Map()) {
  if (manifest?.schema_version !== "neopolis.datacamp_course.v1") {
    throw new Error("Le convertisseur v1 exige un COURSE_MANIFEST.json au schéma neopolis.datacamp_course.v1.");
  }
  if (!manifest?.course?.slug || !Array.isArray(manifest.chapters)) {
    throw new Error("Manifest v1 incomplet : course.slug ou chapters absent.");
  }
  const lessons = manifest.chapters.map((sourceChapter) => ({
    id: `datacamp_ch${String(sourceChapter.number).padStart(2, "0")}`,
    title: toI18n(sourceChapter.title),
    description: toI18n(sourceChapter.description || ""),
    recommendedVideos: [],
    recommendedVideosManaged: false,
    chapters: (sourceChapter.activities || []).map((activity, activityIndex) => buildChapter(activity, sourceChapter, assetMap, activityIndex)),
  }));
  return {
    courseId: `${manifest.course.slug.replace(/-/g, "_")}__01`,
    sourceCourseTitle: manifest.course.title,
    datacampImport: {
      schemaVersion: manifest.schema_version,
      sourceProvider: manifest.source?.provider || "DataCamp",
      sourceCourseSlug: manifest.course.slug,
      sourceLanguage: manifest.source?.extraction_language || "",
      expected: manifest.completeness || {},
    },
    lessons,
  };
}

export function describeDataCampV1(manifest) {
  if (manifest?.schema_version !== "neopolis.datacamp_course.v1") {
    throw new Error("Schéma de manifest non v1.");
  }
  const activities = manifest.chapters.flatMap((chapter) => chapter.activities || []);
  return {
    chapters: manifest.chapters.length,
    activities: activities.length,
    videos: activities.filter((activity) => activity.type === "VideoExercise").length,
    normalExercises: activities.filter((activity) => activity.type === "NormalExercise").length,
    qcm: activities.filter((activity) => activity.type === "PureMultipleChoiceExercise").length,
    unsupported: [...new Set(activities.map((activity) => activity.type).filter((type) => !["VideoExercise", "NormalExercise", "PureMultipleChoiceExercise"].includes(type)))],
  };
}
