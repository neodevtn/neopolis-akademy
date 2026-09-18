import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseUrl = (process.env.NEOPOLIS_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const defaultCourseIds = [
  "ai_for_consulting__01",
  "microsoft_copilot_in_powerpoint__01",
  "ai_assisted_coding_for_developers__01",
  "software_development_with_claude_code__01",
  "software_development_with_windsurf__01",
  "claude_101__01",
  "building_marketing_workflows_with_n8n__01",
  "ai_for_human_resources__01",
  "vibe_coding_with_replit__01",
  "transformation_processus_ia__01",
  "transformation_processus_ia__04",
  "claude_certified_associate_foundations__02",
  "introduction_to_model_context_protocol_mcp__01",
  "developing_ai_systems_with_the_openai_api__01",
];
const courseIds = process.env.COURSE_IDS ? process.env.COURSE_IDS.split(",").filter(Boolean) : defaultCourseIds;
const removedBlockIdsByCourse = {
  ai_for_consulting__01: ["dc_2_act_12_bucket_sort"],
  ai_assisted_coding_for_developers__01: ["dc_3_act_06_bucket_sort"],
  software_development_with_claude_code__01: ["dc_2_act_10_video"],
  software_development_with_windsurf__01: ["dc_3_act_06_bucket_sort"],
  claude_101__01: ["dc_2_act_03_bucket_sort"],
  ai_for_human_resources__01: ["dc_1_act_03_bucket_sort", "dc_2_act_12_bucket_sort"],
  vibe_coding_with_replit__01: ["dc_1_act_05_bucket_sort", "dc_1_act_10_bucket_sort"],
  transformation_processus_ia__01: ["ex_transformation_processus_ia__01_001", "ex_transformation_processus_ia__01_002", "ex_transformation_processus_ia__01_003", "ex_transformation_processus_ia__01_004"],
  transformation_processus_ia__04: ["ex_transformation_processus_ia__04_001", "ex_transformation_processus_ia__04_002"],
  claude_certified_associate_foundations__02: ["ex_claude_certified_associate_foundations__02_008"],
  introduction_to_model_context_protocol_mcp__01: ["dc_1_act_03_tp", "dc_1_act_06_tp", "dc_3_act_06_tp", "dc_3_act_07_tp"],
  developing_ai_systems_with_the_openai_api__01: ["dc_2_act_03_bucket_sort"],
};

const checks = [];
for (const courseId of courseIds) {
  const course = JSON.parse(fs.readFileSync(path.join(root, "client/public/data/courses", `${courseId}.json`), "utf8"));
  const courseResponse = await fetch(`${baseUrl}/api/trpc/course-data/${courseId}`);
  if (!courseResponse.ok) throw new Error(`${courseId}: learner payload returned HTTP ${courseResponse.status}.`);
  const learnerPayload = await courseResponse.json();
  const learnerRaw = JSON.stringify(learnerPayload);
  const allBlocks = (course.lessons || []).flatMap((lesson) => lesson.chapters || []).flatMap((chapter) => chapter.blocks || []);
  const media = new Set();
  for (const block of allBlocks) {
    for (const value of Object.values(block)) if (typeof value === "string" && value.startsWith("/api/assets/")) media.add(value);
    for (const resource of block.resources || []) if (typeof resource.url === "string" && resource.url.startsWith("/api/assets/")) media.add(resource.url);
  }
  const failedMedia = [];
  for (const mediaPath of media) {
    const response = await fetch(`${baseUrl}${mediaPath}`, { method: "HEAD" });
    if (!response.ok) failedMedia.push({ path: mediaPath, status: response.status, contentType: response.headers.get("content-type") || "" });
  }
  checks.push({
    courseId,
    learnerPayloadStatus: courseResponse.status,
    activities: (course.lessons || []).flatMap((lesson) => lesson.chapters || []).length,
    checkedMedia: media.size,
    failedMedia,
    hasKnownAuditedBlocker: allBlocks.some((block) => (removedBlockIdsByCourse[courseId] || []).includes(block.id)),
    hasMissingVideo: allBlocks.some((block) => block.type === "video" && block.mediaUnavailable === true),
    hasUnavailableSourceFileReference: /SolarHome_[A-Za-z]+\.(?:pptx|docx|xlsx)|https:\/\/www\.neopolis akademy\.com/i.test(learnerRaw),
  });
}

const failed = checks.filter((check) => check.failedMedia.length || check.hasKnownAuditedBlocker || check.hasMissingVideo || check.hasUnavailableSourceFileReference);
console.log(JSON.stringify({ baseUrl, checks, passed: failed.length === 0 }, null, 2));
if (failed.length) process.exit(1);
