import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => {
  if (value.startsWith("--")) pairs.push([value.slice(2), values[index + 1]]);
  return pairs;
}, []));

if (!args.package || !args.output) {
  throw new Error("Usage: node scripts/import-huggingface-learn-course.mjs --package <package-dir> --output <course.json>");
}

const packageDir = path.resolve(args.package);
const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, "COURSE_MANIFEST.json"), "utf8"));
const slug = manifest.slug;
const courseId = args.courseId ?? `huggingface_${slug.replaceAll("-", "_")}__01`;
const uploadLog = args.uploadLog && fs.existsSync(path.resolve(args.uploadLog)) ? fs.readFileSync(path.resolve(args.uploadLog), "utf8") : "";
const uploadedPaths = [...uploadLog.matchAll(/Storage Path: (\/manus-storage\/[^\s]+)/g)].map((match) => match[1]);

const localized = (value) => ({ en: value, fr: value });
const pageId = (index) => `hf_${slug}_page_${String(index).padStart(3, "0")}`;

function stripRemoteMedia(markdown) {
  return markdown
    .replace(/^import\s.+$/gm, "")
    .replace(/^export\s.+$/gm, "")
    .replace(/!\[([^\]]*)\]\(https?:\/\/[^)]+\)/g, "> Illustration source non distribuée dans le paquet local : $1.")
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1")
    .replace(/<iframe[\s\S]*?<\/iframe>/g, "")
    .replace(/<\/?(?:div|span|details|summary|section|article|center|br)[^>]*>/gi, "")
    .replace(/https?:\/\/[^\s<>)\]}]+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pageMarkdown(page) {
  const source = path.join(packageDir, page.generated_markdown_relpath);
  return stripRemoteMedia(fs.readFileSync(source, "utf8"));
}

function lessonKey(page) {
  const match = String(page.local ?? "").match(/^([^/]+)/);
  return match?.[1] ?? "supplemental";
}

function lessonTitle(key) {
  if (/^chapter\d+$/.test(key)) return `Chapter ${key.replace("chapter", "")}`;
  return key.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isInteractive(page) {
  return ["checkpoint_or_quiz", "exercise_or_lab"].includes(page.role);
}

function localAssetUrl(relativePath) {
  const safeName = `hf_${slug.replace(/-course$/, "").replaceAll("-", "_")}_${relativePath.replaceAll("/", "_")}`;
  const parsedName = path.parse(safeName);
  const uploaded = uploadedPaths.find((storagePath) => {
    const uploadedName = path.basename(storagePath);
    return uploadedName.startsWith(`${parsedName.name}_`) && uploadedName.endsWith(parsedName.ext);
  });
  return uploaded ? `/api/assets/${path.basename(uploaded)}` : null;
}

function exerciseBlock(page, body) {
  return {
    type: "cloud_exercise",
    id: `${pageId(page.index)}_practice`,
    title: localized(page.title),
    assignment: "Use the source material displayed above to complete the checkpoint, then describe your result or answer in the response field.",
    instructions: "",
    evaluationCriteria: [
      "Utilisez les notions, commandes ou démarches présentées dans cette page.",
      "Expliquez votre résultat ou votre choix avec des éléments vérifiables.",
    ],
    hints: [],
    solution: "La correction détaillée est disponible après une première tentative.",
    requiredBeforeAdvance: true,
  };
}

const lessons = [];
let currentLesson = null;

for (const page of manifest.pages) {
  const key = lessonKey(page);
  if (!currentLesson || currentLesson._key !== key) {
    currentLesson = {
      id: `hf_${slug}_${key.replaceAll("-", "_")}`,
      _key: key,
      title: localized(lessonTitle(key)),
      description: localized(manifest.description),
      competencyTags: manifest.skill_tags,
      recommendedVideos: [],
      recommendedVideosManaged: false,
      chapters: [],
    };
    lessons.push(currentLesson);
  }

  const body = pageMarkdown(page);
  const blocks = [{ type: "content", id: `${pageId(page.index)}_content`, body: localized(body) }];
  // The source manifest may enumerate YouTube references without supplying a
  // redistributable local media file. Those references are tracked in
  // huggingFaceImport.expected but are not embedded or hotlinked in Neopolis.
  if (isInteractive(page)) blocks.push(exerciseBlock(page, body));

  currentLesson.chapters.push({
    id: pageId(page.index),
    title: localized(page.title),
    description: localized(page.title),
    type: isInteractive(page) ? "exercise" : "teaching",
    sourceActivityType: page.role,
    requiredBeforeAdvance: true,
    blocks,
  });
}

for (const lesson of lessons) delete lesson._key;

const downloads = (manifest.supplemental_files ?? [])
  .map((relativePath) => ({ relativePath, url: localAssetUrl(relativePath) }))
  .filter((asset) => asset.url)
  .map((asset) => ({
    type: "download",
    id: `hf_${slug}_download_${asset.relativePath.replaceAll("/", "_")}`,
    label: asset.relativePath,
    download_url: asset.url,
  }));

if (downloads.length > 0) {
  const finalLesson = lessons.at(-1);
  const finalActivity = finalLesson?.chapters.at(-1);
  finalActivity?.blocks.push(...downloads);
}

const course = {
  courseId,
  sourceCourseTitle: manifest.title,
  huggingFaceImport: {
    schemaVersion: "neopolis.huggingface_learn.v1",
    sourceProvider: manifest.provider,
    sourceCourseSlug: manifest.slug,
    sourceLanguage: "en",
    expected: {
      pages_expected: manifest.counts.pages,
      pages_extracted: manifest.pages.length,
      checkpoint_or_lab_pages: manifest.counts.checkpoint_or_lab_pages,
      videos_expected: manifest.counts.videos,
      videos_local: 0,
      supplemental_files_expected: manifest.counts.supplemental_files,
      supplemental_files_local: downloads.length,
      missing_source_files: manifest.missing_source_files,
    },
    license: manifest.license,
    competencyTagging: "manifest_skill_tags_v1",
  },
  lessons,
};

fs.mkdirSync(path.dirname(path.resolve(args.output)), { recursive: true });
fs.writeFileSync(path.resolve(args.output), `${JSON.stringify(course, null, 2)}\n`);
console.log(JSON.stringify({ output: args.output, lessons: lessons.length, activities: manifest.pages.length, title: manifest.title, uploadLog: Boolean(uploadLog), uploadedPaths: uploadedPaths.length, downloads: downloads.length }, null, 2));
