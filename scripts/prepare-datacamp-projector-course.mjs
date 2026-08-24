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

function extractSlideImages(value, localImages, label) {
  const images = [];
  const pattern = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)(?:\s+=\d+)?\)/g;
  for (const match of String(value || "").matchAll(pattern)) {
    const localPath = localImages.get(match[2]);
    const url = localAsset(localPath);
    if (!url) throw new Error(`Image Projector locale introuvable pour ${label}: ${match[2]}`);
    images.push({ alt: match[1] || "Illustration de slide", url });
  }
  return images;
}

function getSubtitleLocal(video, language) {
  const target = language.toLowerCase();
  if (video.subtitles && !Array.isArray(video.subtitles) && typeof video.subtitles === "object") {
    const code = target === "french" ? "fr" : target === "english" ? "en" : target;
    return video.subtitles[`${code}_local`] || "";
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
  firstActivity.blocks.unshift({
    type: "content",
    id: `neopolis_${course.courseId}_environment_preparation`,
    body: {
      fr: isReplitCourse
        ? "## Avant de commencer\n\nCréez ou ouvrez un compte Replit pour reproduire les mises en situation du cours dans votre propre environnement. Utilisez uniquement des données de démonstration, n’ajoutez jamais de mot de passe, clé API ou donnée sensible dans un projet ou un prompt."
        : "## Avant de commencer\n\nCe cours se réalise directement dans Neopolis avec des activités interactives. Pour les mises en situation, préparez un chatbot IA autorisé par votre organisation ; ne partagez jamais de données sensibles, de mots de passe ou de clés API.",
      en: isReplitCourse
        ? "## Before you start\n\nCreate or open a Replit account to reproduce the course scenarios in your own environment. Use demonstration data only; never add passwords, API keys, or sensitive data to a project or prompt."
        : "## Before you start\n\nThis course is completed in Neopolis through interactive activities. For the scenarios, prepare an AI chatbot approved by your organization; never share sensitive data, passwords, or API keys.",
    },
  });
}

const serialized = JSON.stringify(course);
if (/https?:\/\/(?:assets|videos|projector|campus)\.datacamp\.com/i.test(serialized)) {
  throw new Error("La conversion contient encore une URL média DataCamp externe.");
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
