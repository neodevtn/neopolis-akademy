import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "client/src/data/trainingIndex.json");
const outputPath = path.join(root, "docs/training-visual-manifest.json");
const trainingIndex = JSON.parse(fs.readFileSync(indexPath, "utf8"));

const langLabel = { fr: "FR", en: "EN", ar: "AR" };

function localized(value, locale = "fr") {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.en || value.ar || "";
}

function statusLabel(certification) {
  const description = `${localized(certification.description, "fr")} ${localized(certification.description, "en")}`.toLowerCase();
  if (/certification officielle|official .*certification|official certification/.test(description)) {
    return "Préparation à une certification officielle";
  }
  return "Formation Neopolis Akademy";
}

function subjectHint(certification, relatedCourses) {
  const skills = [
    ...(certification.skills || []),
    ...relatedCourses.flatMap((course) => course.skills || []),
    ...relatedCourses.flatMap((course) => course.tags || []),
  ].filter(Boolean);
  return skills.slice(0, 4).join(", ") || localized(certification.title, "fr");
}

const entries = (trainingIndex.certifications || []).map((certification) => {
  const courses = (trainingIndex.courses || []).filter((course) => course.certId === certification.id);
  const languageKeys = Object.keys(certification.title || {}).filter((key) => langLabel[key]);
  const languages = languageKeys.length ? languageKeys.map((key) => langLabel[key]) : ["FR", "EN"];
  const title = localized(certification.title, "fr");
  const level = localized(certification.level, "fr") || "Tous niveaux";
  const activities = Number(certification.totalActivities || courses.reduce((total, course) => total + Number(course.totalActivities || 0), 0));
  const exercises = Number(certification.exerciseCount || courses.reduce((total, course) => total + Number(course.exerciseCount || 0), 0));
  const videos = Number(certification.videoCount || courses.reduce((total, course) => total + Number(course.videoCount || 0), 0));

  return {
    id: certification.id,
    slug: certification.slug || certification.id,
    title,
    description: localized(certification.description, "fr"),
    status: statusLabel(certification),
    level,
    languages,
    courseCount: Number(certification.courseCount || courses.length),
    activities,
    exercises,
    videos,
    subjectHint: subjectHint(certification, courses),
    socialFile: `${certification.id}-social.png`,
    cardFile: `${certification.id}-card.png`,
  };
});

const output = {
  generatedAt: new Date().toISOString(),
  totalTrainings: entries.length,
  template: {
    social: { width: 1200, height: 630 },
    card: { aspectRatio: "4:3", width: 1200, height: 900 },
    requiredBrandAsset: "/api/assets/neopolis-akademy-official-logo_40a16b6c.svg",
  },
  trainings: entries,
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`training_visual_manifest=${entries.length}`);
