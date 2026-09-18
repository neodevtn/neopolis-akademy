const baseUrl = (process.env.NEOPOLIS_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const certificationId = "claude_certified_architect_foundations";
const courseIds = ["01", "02", "03", "04", "05", "06", "07"].map((suffix) => `${certificationId}__${suffix}`);
const restrictedFields = new Set(["correction", "rubric", "sampleAnswer", "correct"]);

function countRestrictedFields(value) {
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countRestrictedFields(item), 0);
  if (!value || typeof value !== "object") return 0;
  return Object.entries(value).reduce((sum, [key, item]) => sum + (restrictedFields.has(key) ? 1 : 0) + countRestrictedFields(item), 0);
}

const results = [];
for (const courseId of courseIds) {
  for (const [kind, route] of [
    ["learnerApi", `/api/trpc/course-data/${courseId}`],
    ["staticPayload", `/data/courses/${courseId}.json`],
  ]) {
    const response = await fetch(`${baseUrl}${route}`, { headers: { "Cache-Control": "no-cache" } });
    const payload = await response.json().catch(() => null);
    const restrictedFieldCount = countRestrictedFields(payload);
    const protectedCheckpointCount = Array.isArray(payload?.exercises)
      ? payload.exercises.filter((exercise) => exercise?.serverCorrectionRequired === true).length
      : 0;
    results.push({ courseId, kind, status: response.status, protectedCheckpointCount, restrictedFieldCount, passed: response.status === 200 && protectedCheckpointCount > 0 && restrictedFieldCount === 0 });
  }
}

const report = {
  baseUrl,
  checks: results.length,
  protectedCheckpoints: results.filter((result) => result.kind === "learnerApi").reduce((sum, result) => sum + result.protectedCheckpointCount, 0),
  failed: results.filter((result) => !result.passed),
  results,
};
console.log(JSON.stringify(report, null, 2));
if (report.failed.length) process.exitCode = 1;
