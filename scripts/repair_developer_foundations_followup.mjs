import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const coursePath = (suffix) => path.join(root, "client/public/data/courses", `claude_certified_developer_foundations__${suffix}.json`);
const read = (suffix) => JSON.parse(fs.readFileSync(coursePath(suffix), "utf8"));
const write = (suffix, course) => fs.writeFileSync(coursePath(suffix), `${JSON.stringify(course, null, 2)}\n`);
const chapter = (course, id) => {
  const found = course.lessons?.[0]?.chapters?.find((item) => item.id === id);
  if (!found) throw new Error(`Missing chapter ${id}`);
  return found;
};
const content = (course, id) => {
  const found = chapter(course, id).blocks?.find((block) => block.type === "content");
  if (!found?.body) throw new Error(`Missing content ${id}`);
  return found;
};

const course3 = read("03");
const permissionCheckpoint = course3.exercises?.find((exercise) => exercise.id === "ex_claude_certified_developer_foundations__03_001");
if (!permissionCheckpoint) throw new Error("Missing Developer 3 permission checkpoint");
permissionCheckpoint.title = {
  en: "Place the human review gate by worst-case impact",
  fr: "Placer la barrière de révision humaine selon l’impact maximal",
};
permissionCheckpoint.inputSchema = { ...(permissionCheckpoint.inputSchema || {}), minWords: 15, maxWords: 500 };
delete permissionCheckpoint.inputSchema.language;
permissionCheckpoint.prompt.fr = permissionCheckpoint.prompt.fr
  .replace("Permission modes and deny rules", "Les modes d’autorisation et les règles de refus")
  .replaceAll("working directory", "répertoire de travail")
  .replaceAll("destructive shell command", "commande shell destructive")
  .replaceAll("deny rule", "règle de refus")
  .replaceAll("default or plan mode", "mode `default` ou `plan`")
  .replaceAll("pull request", "demande de fusion");
write("03", course3);

const course4 = read("04");
for (const chapterId of ["chapter_05", "chapter_07"]) {
  const target = chapter(course4, chapterId);
  // These blocks announce an exercise but contain no answer field, exercise
  // definition, or authorized answer key. The teaching blocks before them are
  // retained; only the unusable activity invitation is removed.
  target.blocks = (target.blocks || []).filter((block, index) => !(block.type === "content" && index > 0));
}
for (const block of chapter(course4, "chapter_11").blocks || []) {
  if (block.type === "flip_cards") block.cards = (block.cards || []).filter((card) => card.front?.en !== "OS-level sandboxing: the residual control");
}
write("04", course4);

const course5 = read("05");
const packagingCheckpoint = course5.exercises?.find((exercise) => exercise.id === "ex_claude_certified_developer_foundations__05_002");
const packagingBody = content(course5, "chapter_02").body;
if (!packagingCheckpoint) throw new Error("Missing Developer 5 packaging checkpoint");
// The complete source prompt is already published in the paired checkpoint
// content. Copy it verbatim so the root activity and learner screen match.
packagingCheckpoint.prompt = { en: packagingBody.en, fr: packagingBody.fr };
for (const block of chapter(course5, "chapter_11").blocks || []) {
  if (block.type === "flip_cards") block.cards = (block.cards || []).filter((card) => card.front?.en !== "What to Watch Out for");
}
for (const chapterId of ["chapter_11", "chapter_13"]) {
  const target = content(course5, chapterId);
  const next = {
    en: target.body.en
      .replace("DimensionHow it differs by platformHow to measure itWhere each platform wins\n\nLatencyA platform in the customer's region shortens the round trip, while the first-party API may reach new features first.From the customer's actual region against their actual payload.An in-region cloud platform wins on round-trip latency, while the first-party API is advantaged on earliest feature access.\n\nComplianceData residency, certifications, and audit controls are determined by the deployment platform.Against the customer's existing certification and residency requirements during scoping.The cloud platform the customer has already certified wins, because it needs no re-certification.\n\nCostToken price, data egress, platform fees, and integration effort all vary.Total cost per call per platform, including egress and integration, rather than token price alone.The platform with the lowest total cost for the actual workload wins, which is not always the cheapest token.", "| Dimension | How it differs by platform | How to measure it | Where each platform wins |\n|---|---|---|---|\n| Latency | A platform in the customer's region shortens the round trip, while the first-party API may reach new features first. | From the customer's actual region against their actual payload. | An in-region cloud platform wins on round-trip latency, while the first-party API is advantaged on earliest feature access. |\n| Compliance | Data residency, certifications, and audit controls are determined by the deployment platform. | Against the customer's existing certification and residency requirements during scoping. | The cloud platform the customer has already certified wins, because it needs no re-certification. |\n| Cost | Token price, data egress, platform fees, and integration effort all vary. | Total cost per call per platform, including egress and integration, rather than token price alone. | The platform with the lowest total cost for the actual workload wins, which is not always the cheapest token. |")
      .replace("ComponentWhat it contributesThe trust boundary at its seamThe control that enforces it\n\nFirst-party APIOrchestrates the workflow and holds the entry point.The request entering the app from outside.Input validation and the identity the call runs under.\n\nClaude Code taskRuns the agentic work and may fetch external content.Content it fetched, which is untrusted downstream.Treat fetched content as data at the next seam.\n\nMCP serverReaches a customer system to read or act.The system access it holds on the app's behalf.Scope the server to least privilege and log the access.", "| Component | What it contributes | The trust boundary at its seam | The control that enforces it |\n|---|---|---|---|\n| First-party API | Orchestrates the workflow and holds the entry point. | The request entering the app from outside. | Input validation and the identity the call runs under. |\n| Claude Code task | Runs the agentic work and may fetch external content. | Content it fetched, which is untrusted downstream. | Treat fetched content as data at the next seam. |\n| MCP server | Reaches a customer system to read or act. | The system access it holds on the app's behalf. | Scope the server to least privilege and log the access. |"),
    fr: target.body.fr
      .replaceAll("Packaging for Reuse", "Emballage réutilisable")
      .replaceAll("Contributing Back", "Contribuer à la communauté")
      .replaceAll("Requirements & Lifecycle", "Exigences et cycle de vie")
      .replaceAll("Deployment & Versioning", "Déploiement et versionnage")
      .replaceAll("Platform Placement", "Choix de la plateforme")
      .replaceAll("Trust Boundaries", "Frontières de confiance"),
  };
  target.body = next;
}
const introduction = content(course5, "chapter_01_1");
introduction.body.en = introduction.body.en.replace(/\*\*Estimated time:\*\*\s*15\s*[-–]\s*25 minutes/i, "**Official course duration:** 155 minutes");
introduction.body.fr = introduction.body.fr.replace(/\*\*Durée estimée\s*:\*\*\s*15\s*[-–]\s*25 minutes/i, "**Durée officielle du cours :** 155 minutes");
write("05", course5);

console.log("Applied source-safe Developer Foundations follow-up corrections.");
