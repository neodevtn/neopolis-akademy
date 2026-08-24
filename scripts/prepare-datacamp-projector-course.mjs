import fs from "node:fs/promises";
import path from "node:path";
import { convertDataCampV1, parseUploadLog } from "./datacamp-importer-core.mjs";

function valueFor(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : "";
}

const packageRoot = valueFor("--package-root");
const assetRoot = valueFor("--asset-root");
const uploadLogPath = valueFor("--upload-log");
const outputPath = valueFor("--output");
const manifestPath = valueFor("--manifest") || path.join(packageRoot, "COURSE_MANIFEST.json");

if (!packageRoot || !assetRoot || !uploadLogPath || !outputPath) {
  console.error("Usage: node scripts/prepare-datacamp-projector-course.mjs --package-root <course-root> --asset-root <asset-root> --upload-log <upload-log.txt> --output <course.json> [--manifest <enriched-manifest.json>]");
  process.exit(1);
}

const [manifestRaw, uploadLog] = await Promise.all([
  fs.readFile(manifestPath, "utf8"),
  fs.readFile(uploadLogPath, "utf8"),
]);
const manifest = JSON.parse(manifestRaw);

async function hydrateCanonicalActivities() {
  const chaptersDir = path.join(packageRoot, "chapters");
  let files = [];
  try {
    files = await fs.readdir(chaptersDir);
  } catch {
    return;
  }
  const canonicalActivities = new Map();
  for (const file of files.filter((entry) => entry.endsWith("_canonical.json"))) {
    const chapter = JSON.parse(await fs.readFile(path.join(chaptersDir, file), "utf8"));
    for (const activity of chapter.activities || []) {
      canonicalActivities.set(String(activity.exercise_id), activity);
    }
  }
  for (const chapter of manifest.chapters || []) {
    for (const activity of chapter.activities || []) {
      const canonical = canonicalActivities.get(String(activity.exercise_id));
      if (canonical?.content && (!activity.content || Object.keys(activity.content).length === 0)) {
        activity.content = canonical.content;
      }
    }
  }
}

await hydrateCanonicalActivities();
const absoluteAssetMap = parseUploadLog(uploadLog);
const assetMap = new Map();
for (const [absolutePath, url] of absoluteAssetMap.entries()) {
  const relativePath = path.relative(assetRoot, absolutePath);
  assetMap.set(relativePath, url);
  assetMap.set(path.join("downloads", relativePath), url);
}

function localAsset(relativePath) {
  const normalized = path.normalize(relativePath || "");
  const direct = assetMap.get(normalized);
  if (direct) return direct;
  for (const [key, value] of assetMap.entries()) {
    if (key === normalized || key.endsWith(`${path.sep}${normalized}`)) return value;
  }
  return "";
}

function stripSlideMarkup(value) {
  return String(value || "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\{\{\d+\}\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const optionalMissingProjectorImages = new Set([
  "downloads/projector_images/ch01_ex01_comment_l_ia_transforme_la_finance_006_Perplexity_AI_logo.svg",
]);

const projectorLocalAliases = new Map([
  [
    "https://s3.us-east-1.amazonaws.com/assets.datacamp.com/production/repositories/7203/datasets/AI+shines.gif",
    "downloads/projector_images/ch01_ex01_le_changement_de_paradigme_de_l_ia_dans_la_vente_004_AI_saves_time.gif",
  ],
  [
    "https://s3.us-east-1.amazonaws.com/assets.datacamp.com/production/repositories/7203/datasets/email+generate+2.gif",
    "downloads/projector_images/ch01_ex08_r_diger_des_messages_d_approche_personnalis_s_016_Email_examples.png",
  ],
]);

function extractSlideImages(value, localImages, label) {
  const images = [];
  const pattern = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)(?:\s +=\d+)?\)/g;
  for (const match of String(value || "").matchAll(pattern)) {
    const localPath = localImages.get(match[2]) || projectorLocalAliases.get(match[2]);
    const url = localAsset(localPath);
    if (!url && optionalMissingProjectorImages.has(localPath)) continue;
    // Some Projector slides reference a short animation that is already embedded in
    // the lesson's downloaded MP4 but is not separately included in the canonical
    // local image manifest. Do not expose its external URL as an image fallback.
    if (!url && /\.(?:mp4|webm|mov)(?:\?.*)?$/i.test(match[2])) {
      console.warn(`Animation Projector intégrée à la vidéo locale, omise comme image de slide : ${match[2]}`);
      continue;
    }
    // Les URL externes restantes ne sont pas des médias publiables : si aucune copie
    // locale n’est déclarée dans le paquet canonique, conserver la slide sans image.
    if (!url && /^https?:\/\//i.test(match[2])) {
      console.warn(`Illustration Projector externe non fournie, omise : ${match[2]}`);
      continue;
    }
    if (!url) throw new Error(`Image Projector locale introuvable pour ${label}: ${match[2]}`);
    images.push({ alt: match[1] || "Illustration de slide", url });
  }
  return images;
}

function getSubtitleLocal(video, language) {
  const target = language.toLowerCase();
  if (video.subtitles && !Array.isArray(video.subtitles) && typeof video.subtitles === "object") {
    const code = target === "french" ? "fr" : target === "english" ? "en" : target;
    const direct = video.subtitles[`${code}_local`];
    if (direct) return direct;
    const fallback = (video.subtitles.all_language_locals || []).find((item) => String(item.language || "").toLowerCase().startsWith(target));
    return fallback?.local || "";
  }
  const entry = Array.isArray(video.subtitles)
    ? video.subtitles.find((item) => String(item.language || "").toLowerCase().startsWith(target))
    : null;
  return entry?.local || "";
}

async function augmentProjectorActivity(activity) {
  const video = activity.video || {};
  if (!video.projector_data_file) return;

  const raw = JSON.parse(await fs.readFile(path.join(packageRoot, video.projector_data_file), "utf8"));
  const localImages = new Map((video.slide_image_assets || video.images || []).map((image) => [image.url, image.local]));
  const structure = raw.slideDeckData?.structure || [];
  const timings = typeof raw.slideDeckData?.timings === "string"
    ? JSON.parse(raw.slideDeckData.timings)
    : (raw.slideDeckData?.timings || []);

  video.projectorSlides = structure.map((slide, index) => {
    const part1 = String(slide.part1 || "");
    const part2 = String(slide.part2 || "");
    return {
      number: Number(slide.number || index + 1),
      title: String(slide.title || activity.title || ""),
      type: String(slide.type || "FullSlide"),
      script: String(slide.script || ""),
      images: [...extractSlideImages(part1, localImages, activity.title), ...extractSlideImages(part2, localImages, activity.title)],
      content: stripSlideMarkup([part1, part2].filter(Boolean).join("\n\n")),
      contentLeft: stripSlideMarkup(part1),
      contentRight: stripSlideMarkup(part2),
      instructorName: slide.instructor_name || undefined,
      instructorTitle: slide.instructor_title || undefined,
      technology: slide.technology || undefined,
    };
  });
  video.projectorTimings = timings
    .filter((entry) => Number.isFinite(entry?.timing) && Number.isInteger(entry?.state?.indexh) && entry.state.indexh >= 0)
    .map((entry) => ({
      time: Number(entry.timing),
      slideIndex: Number(entry.state.indexh),
      fragment: Number.isInteger(entry.state.indexf) ? Number(entry.state.indexf) : -1,
    }));
  video.projectorTimingUnit = "fraction";
  video.projectorDuration = 300;
  video.subtitles = {
    fr_local: getSubtitleLocal(video, "french"),
    en_local: getSubtitleLocal(video, "english"),
  };

  const projectorMediaLocal = video.audio_local || video.mp4_local || video.hls_local;
  if (!projectorMediaLocal || !localAsset(projectorMediaLocal)) {
    throw new Error(`Média Projector local introuvable pour ${activity.title}`);
  }
  if (!video.projectorSlides.length || !video.projectorTimings.length) {
    throw new Error(`Slides ou timings Projector absents pour ${activity.title}`);
  }
}

for (const chapter of manifest.chapters || []) {
  for (const activity of chapter.activities || []) {
    await augmentProjectorActivity(activity);
  }
}

const course = convertDataCampV1(manifest, assetMap);
const firstActivity = course.lessons[0]?.chapters[0];
if (firstActivity) {
  const courseTitle = typeof course.sourceCourseTitle === "string"
    ? course.sourceCourseTitle
    : `${course.sourceCourseTitle?.fr || ""} ${course.sourceCourseTitle?.en || ""}`;
  const isReplitCourse = /replit/i.test(courseTitle);
  const isWindsurfCourse = /windsurf/i.test(courseTitle);
  const isFastApiCourse = /fastapi/i.test(courseTitle);
  const preparationFr = isReplitCourse
    ? "## Avant de commencer\n\nCréez ou ouvrez un compte Replit pour reproduire les mises en situation du cours dans votre propre environnement. Utilisez uniquement des données de démonstration, n’ajoutez jamais de mot de passe, clé API ou donnée sensible dans un projet ou un prompt."
    : isWindsurfCourse
      ? "## Avant de commencer\n\nInstallez Windsurf sur votre ordinateur depuis le site officiel, puis ouvrez un dossier de projet de démonstration ou créez-en un nouveau. Vous pouvez importer vos préférences depuis VS Code si nécessaire. Utilisez uniquement des données de test : ne placez jamais de mots de passe, clés API, jetons ou données confidentielles dans un projet, un prompt ou une règle Cascade."
      : isFastApiCourse
        ? "## Préparer votre environnement FastAPI\n\nInstallez Python 3.11 ou une version compatible, créez un dossier de démonstration puis un environnement virtuel (`python -m venv .venv`). Activez-le et installez les dépendances indiquées par les exercices, notamment `fastapi`, `uvicorn`, `pydantic` et `joblib`. Exécutez vos API uniquement en local (par exemple avec `uvicorn main:app --reload`) et testez-les depuis un second terminal avec les commandes fournies. Utilisez des fichiers et données de démonstration ; ne placez jamais de secrets, clés API, identifiants ou données personnelles dans votre code, vos requêtes ou vos journaux."
      : "## Avant de commencer\n\nCe cours se réalise directement dans Neopolis avec des activités interactives. Pour les mises en situation, préparez un chatbot IA autorisé par votre organisation ; ne partagez jamais de données sensibles, de mots de passe ou de clés API.";
  const preparationEn = isReplitCourse
    ? "## Before you start\n\nCreate or open a Replit account to reproduce the course scenarios in your own environment. Use demonstration data only; never add passwords, API keys, or sensitive data to a project or prompt."
    : isWindsurfCourse
      ? "## Before you start\n\nInstall Windsurf from its official website, then open a demonstration project folder or create a new one. You may import VS Code preferences if needed. Use test data only: never place passwords, API keys, tokens, or confidential data in a project, prompt, or Cascade rule."
      : isFastApiCourse
        ? "## Prepare your FastAPI environment\n\nInstall Python 3.11 or a compatible version, create a demonstration folder, then create a virtual environment (`python -m venv .venv`). Activate it and install the dependencies required by each exercise, including `fastapi`, `uvicorn`, `pydantic`, and `joblib`. Run APIs locally only (for example with `uvicorn main:app --reload`) and test them from a second terminal using the provided commands. Use demonstration files and data; never place secrets, API keys, credentials, or personal data in code, requests, or logs."
      : "## Before you start\n\nThis course is completed in Neopolis through interactive activities. For the scenarios, prepare an AI chatbot approved by your organization; never share sensitive data, passwords, or API keys.";
  firstActivity.blocks.unshift({
    type: "content",
    id: `neopolis_${course.courseId}_environment_preparation`,
    body: {
      fr: preparationFr,
      en: preparationEn,
    },
  });
}

const serialized = JSON.stringify(course);
const externalDataCampUrl = /https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com[^"\s]*/i.exec(serialized)?.[0];
if (externalDataCampUrl) {
  throw new Error(`La conversion contient encore une URL média DataCamp externe : ${externalDataCampUrl}`);
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  courseId: course.courseId,
  lessons: course.lessons.length,
  activities: course.lessons.reduce((total, lesson) => total + lesson.chapters.length, 0),
  projectorLessons: course.lessons.flatMap((lesson) => lesson.chapters).filter((chapter) => chapter.blocks.some((block) => block.projectorSlides?.length)).length,
  output: outputPath,
}, null, 2));
