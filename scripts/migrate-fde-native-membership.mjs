import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "client", "src", "data", "trainingIndex.json");
const outputPath = path.join(root, "pedagogical-audit", "claude-fde-native-membership-manifest.json");
const fdeId = "claude_forward_deployed_engineer";
const coreIds = ["claude_fde_delivery_methodology__01", "claude_fde_enterprise_adoption__01"];
const sharedIds = [
  "claude_101__01",
  "claude_code_101__01",
  "claude_code_in_action__01",
  "introduction_to_agent_skills__01",
  "introduction_to_claude_models__01",
  "introduction_to_subagents__01",
  "model_context_protocol_advanced_topics__01",
  "software_development_with_claude_code__01",
  "building_scalable_agentic_systems__01",
];
const memberIds = [...coreIds, ...sharedIds];
const assetsPath = path.join(root, ".work", "claude-fde-visual-assets.json");
const check = process.argv.includes("--check");
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const byId = new Map(index.courses.map((course) => [course.id, course]));
const missing = memberIds.filter((id) => !byId.has(id));
if (missing.length) throw new Error(`Cours FDE absents: ${missing.join(", ")}`);
const training = index.certifications.find((entry) => entry.id === fdeId);
if (!training) throw new Error("Formation FDE absente du catalogue");
let visualAssets = {};
if (fs.existsSync(assetsPath)) visualAssets = JSON.parse(fs.readFileSync(assetsPath, "utf8"));
const previous = JSON.stringify(index);
training.trainingFormat = "formation";
training.contentKind = "learning_path";
training.certificationStatus = "non_certifying";
training.assessmentPolicy = "none";
training.credentialPolicy = "none";
training.sequentialCourseLocking = true;
training.courses = memberIds;
training.description = {
  fr: "Parcours avancé de déploiement Claude en entreprise : cadrer les cas d’usage, mener des pilotes mesurés, développer les capacités techniques et accompagner l’adoption à l’échelle.",
  en: "Advanced Claude enterprise deployment learning path: frame use cases, run measured pilots, build technical capability, and lead adoption at scale.",
};
training.catalogTag = { fr: "Déploiement Claude et adoption en entreprise", en: "Claude deployment & enterprise adoption" };
training.mediaStatus = {
  result: "A licensed Neopolis media-library visual illustrates enterprise AI deployment. No source instructional media was substituted.",
  verifiedAt: "2026-10-18",
};
delete training.noDuplicateSourceCourses;
delete training.companionCourses;
delete training.companionCoursesTitle;
delete training.companionCoursesDescription;
if (visualAssets.cardPath && visualAssets.socialPath) {
  training.visualAssets = {
    cardPath: visualAssets.cardPath,
    cardWidth: 1200,
    cardHeight: 900,
    socialPath: visualAssets.socialPath,
    socialWidth: 1200,
    socialHeight: 630,
    alt: {
      fr: "Déploiement de Claude et adoption en entreprise par une équipe pluridisciplinaire",
      en: "Claude deployment and enterprise adoption with a cross-functional team",
      ar: "نشر Claude واعتماده في المؤسسات مع فريق متعدد التخصصات",
    },
  };
}
for (const [offset, courseId] of sharedIds.entries()) {
  const course = byId.get(courseId);
  const preserved = Array.isArray(course.trainingMemberships) ? course.trainingMemberships.filter((entry) => entry?.certificationId !== fdeId) : [];
  course.trainingMemberships = [...preserved, { certificationId: fdeId, order: offset + coreIds.length + 1 }];
}
const manifest = {
  version: "2026-10-18-fde-native-membership-v1",
  trainingId: fdeId,
  courseIds: memberIds,
  coreCourseIds: coreIds,
  sharedCourseIds: sharedIds,
  progressPolicy: "A course retains one canonical content and learner-progress record across all training memberships.",
  canonicalCourseOwners: Object.fromEntries(sharedIds.map((id) => [id, byId.get(id).certId])),
  visualAssets: training.visualAssets || null,
};
if (check) {
  if (previous !== JSON.stringify(index)) throw new Error("Migration FDE non appliquée ou assets manquants");
  console.log(JSON.stringify({ ok: true, ...manifest }, null, 2));
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ applied: previous !== JSON.stringify(index), ...manifest }, null, 2));
}
