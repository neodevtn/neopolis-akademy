import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "client", "public", "data");
const coursesDir = path.join(dataDir, "courses");
const catalog = JSON.parse(await fs.readFile(path.join(dataDir, "videoRecommendations.json"), "utf8"));

function text(value) {
  if (!value) return "";
  return typeof value === "string" ? value : [value.en, value.fr].filter(Boolean).join(" ");
}

function lessonText(lesson) {
  return [
    text(lesson.title),
    ...(lesson.chapters || []).flatMap((chapter) => [
      text(chapter.title),
      ...(chapter.blocks || []).slice(0, 3).flatMap((block) => [text(block.title), text(block.body).slice(0, 200)]),
    ]),
  ].join(" ").toLowerCase();
}

function select(textValue) {
  const keywords = textValue.split(/[\s,.\-_:;/()[\]{}]+/).filter((word) => word.length > 2);
  const ranked = catalog.videos.map((video) => {
    let score = video.type === "tutorial" ? 2 : video.type === "masterclass" ? 1 : 0;
    for (const [topic, aliases] of Object.entries(catalog.topicAliases)) {
      if (aliases.some((term) => textValue.includes(term)) && video.topics.some((tag) => tag.includes(topic) || aliases.some((term) => tag.includes(term)))) score += 10;
    }
    for (const keyword of keywords) {
      if (video.topics.some((tag) => tag.includes(keyword))) score += 2;
      if (video.title.toLowerCase().includes(keyword)) score += 1;
    }
    return { video, score };
  }).sort((left, right) => right.score - left.score || left.video.title.localeCompare(right.video.title));
  const relevant = ranked.filter((item) => item.score >= 5).slice(0, 3).map((item) => item.video);
  const selected = [...relevant];
  for (const { video } of ranked) {
    if (selected.length >= 3) break;
    if (!selected.some((item) => item.videoId === video.videoId)) selected.push(video);
  }
  return selected;
}

const report = { courses: 0, lessons: 0, configured: 0, preserved: 0, fallbackFilled: 0 };
for (const filename of (await fs.readdir(coursesDir)).filter((file) => file.endsWith(".json"))) {
  const filePath = path.join(coursesDir, filename);
  const course = JSON.parse(await fs.readFile(filePath, "utf8"));
  let changed = false;
  report.courses += 1;
  for (const lesson of course.lessons || []) {
    report.lessons += 1;
    if (Array.isArray(lesson.recommendedVideos) && lesson.recommendedVideos.length > 0) {
      report.preserved += 1;
      continue;
    }
    const chosen = select(lessonText(lesson));
    lesson.recommendedVideos = chosen;
    report.configured += 1;
    if (chosen.length < 3) report.fallbackFilled += 1;
    changed = true;
  }
  if (changed) await fs.writeFile(filePath, `${JSON.stringify(course, null, 2)}\n`, "utf8");
}
console.log(JSON.stringify(report, null, 2));
