import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseDirectory = path.join(root, "client/public/data/courses");
const reportPath = path.join(root, "docs/bilingual-language-integrity-audit.json");
const cachePath = path.join("/tmp", "neopolis-bilingual-language-integrity-cache.json");
const maxSegmentCharacters = 12_000;
const maxRequestCharacters = 20_000;
const maxJobsPerRequest = 12;
const concurrency = 4;
const frenchSignal = /\b(?:le|la|les|des|du|de|une|un|pour|avec|dans|sur|puis|votre|vous|ajoutez|chargez|conservez|reliez|créez|choisissez|exécutez|réponse|message|étape|utilisez|vérifiez|définissez|ouvrez|placez|traitez|sélectionnez|données|résultat|fichier|workflow|nœud|activité|consigne|objectif|évaluation|réalisation|synthétique|requis|attendu|configuration|apprenant|formation)\b/giu;
const englishSignal = /\b(?:the|and|with|for|your|then|add|load|keep|connect|create|choose|run|response|message|step|use|verify|set|open|place|process|select|data|result|file|workflow|node|activity|instruction|objective|assessment|completion|synthetic|required|expected|configuration|learner|training)\b/giu;

function getParentAtTrace(rootValue, trace) {
  const parts = trace.split(".");
  const key = parts.pop();
  const parent = parts.reduce((value, part) => value?.[Number.isInteger(Number(part)) ? Number(part) : part], rootValue);
  if (!parent || !key) throw new Error(`Invalid trace: ${trace}`);
  return { parent, key };
}
function countMatches(text, pattern) {
  return [...String(text).matchAll(pattern)].length;
}
function targetLanguageIsCorrect(language, text) {
  const french = countMatches(text, frenchSignal);
  const english = countMatches(text, englishSignal);
  if (language === "en") return !(french >= 3 && french > english * 1.5);
  return !(english >= 5 && english > french * 1.8);
}
function markdownSignature(text) {
  const value = String(text);
  const prose = value.replace(/```[\s\S]*?```/g, "");
  return {
    headings: (prose.match(/(?:^|\n)#{1,6}\s/g) || []).length,
    bullets: (prose.match(/(?:^|\n)\s*(?:[-*•]|\d+\.)\s+/g) || []).length,
    bold: (prose.match(/\*\*/g) || []).length,
    inlineCode: (prose.match(/`/g) || []).length,
    fences: (value.match(/```/g) || []).length,
  };
}
function preservesStructure(source, target) {
  const from = markdownSignature(source);
  const to = markdownSignature(target);
  return Object.entries(from).every(([key, count]) => count === 0 || to[key] >= count);
}
function isEllipsized(text) {
  return /(?:\.\.\.|…)(?:\s*)$/u.test(String(text));
}
function splitMarkdown(text) {
  if (text.length <= maxSegmentCharacters) return [text];
  const pieces = text.split(/(?<=\n\n)/u);
  const segments = [];
  let current = "";
  for (const piece of pieces) {
    if (current && current.length + piece.length > maxSegmentCharacters) {
      segments.push(current);
      current = "";
    }
    if (!current && piece.length > maxSegmentCharacters) {
      const lines = piece.split(/(?<=\n)/u);
      let longCurrent = "";
      for (const line of lines) {
        if (longCurrent && longCurrent.length + line.length > maxSegmentCharacters) {
          segments.push(longCurrent);
          longCurrent = "";
        }
        longCurrent += line;
      }
      if (longCurrent) segments.push(longCurrent);
    } else {
      current += piece;
    }
  }
  if (current) segments.push(current);
  if (segments.join("") !== text) throw new Error("Markdown segmentation lost source text.");
  return segments;
}
function splitRequests(jobs) {
  const requests = [];
  let current = [];
  let size = 0;
  for (const job of jobs) {
    const jobSize = job.sourceSegment.length + 240;
    if (current.length && (current.length >= maxJobsPerRequest || size + jobSize > maxRequestCharacters)) {
      requests.push(current);
      current = [];
      size = 0;
    }
    current.push(job);
    size += jobSize;
  }
  if (current.length) requests.push(current);
  return requests;
}

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const initialCourses = new Map();
const candidates = report.findings.map((finding, index) => {
  const coursePath = path.join(courseDirectory, finding.file);
  if (!initialCourses.has(finding.file)) initialCourses.set(finding.file, JSON.parse(fs.readFileSync(coursePath, "utf8")));
  const { parent, key } = getParentAtTrace(initialCourses.get(finding.file), finding.trace);
  const sourceLanguage = finding.targetLanguage === "en" ? "fr" : "en";
  const sourceValue = parent[sourceLanguage];
  const oldValue = parent[key];
  if (key !== finding.targetLanguage || typeof sourceValue !== "string" || typeof oldValue !== "string") throw new Error(`Expected bilingual string at ${finding.file}:${finding.trace}.`);
  return { id: `field-${index}`, file: finding.file, courseId: finding.courseId, trace: finding.trace, targetLanguage: finding.targetLanguage, sourceLanguage, sourceValue, oldValue, kind: finding.kind };
});
if (!candidates.length) {
  console.log("No wrong-language or truncated bilingual fields require repair.");
  process.exit(0);
}
const jobs = candidates.flatMap((candidate) => splitMarkdown(candidate.sourceValue).map((sourceSegment, segmentIndex, segments) => ({
  jobId: `${candidate.id}-part-${segmentIndex + 1}`,
  fieldId: candidate.id,
  segmentIndex,
  segmentCount: segments.length,
  file: candidate.file,
  trace: candidate.trace,
  targetLanguage: candidate.targetLanguage,
  sourceSegment,
})));

const models = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/models`, { headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` } }).then((response) => response.json());
const model = models.data?.find((item) => item.id === "claude-sonnet-4-6")?.id;
if (!model) throw new Error("Claude Sonnet 4.6 is unavailable.");
const schema = {
  type: "object",
  properties: {
    patches: {
      type: "array",
      items: {
        type: "object",
        properties: { jobId: { type: "string" }, replacement: { type: "string" } },
        required: ["jobId", "replacement"],
        additionalProperties: false,
      },
    },
  },
  required: ["patches"],
  additionalProperties: false,
};

async function translate(request) {
  const prompt = `Translate each supplied learner-facing source segment into its requested target language. The existing target is wrong-language or visibly truncated. Return exactly one nonempty replacement per jobId; never omit or merge segments.

Preserve every fact, learning action, activity scope, Markdown heading, bullet, bold emphasis, inline-code delimiter, fenced-code delimiter, JSON, URL, filename, API name, node name, variable name, literal error and technical identifier. Translate learner-facing prose even when it is incorrectly wrapped in Markdown backticks; retain the delimiters but translate the prose inside them unless it is actual executable code, a command, JSON, an identifier, a URL, a filename or a literal error. Keep product names such as Claude, ChatGPT, Gemini, n8n, MCP and library/framework names unchanged unless a well-established localized form is present in the source. Do not invent facts, activities, outcomes, corrections or assessment answers. Do not simplify or summarize.

SEGMENTS:\n${JSON.stringify(request)}`;
  const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 20000, thinking: { type: "enabled", budget_tokens: 1024 }, response_format: { type: "json_schema", json_schema: { name: "bilingual_language_integrity_segment_repairs", strict: true, schema } }, messages: [{ role: "user", content: prompt }] }),
  }).then((result) => result.json());
  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Claude Sonnet returned no bilingual repair: ${JSON.stringify(response)}`);
  const result = JSON.parse(content.replace(/^```json\s*|\s*```$/g, ""));
  const expected = new Set(request.map((job) => job.jobId));
  const validPatches = result.patches.map((patch) => {
    if (!expected.delete(patch.jobId) || !patch.replacement?.trim()) throw new Error(`Unexpected or blank localization segment ${patch.jobId}.`);
    return patch;
  });
  const missing = request.filter((job) => expected.has(job.jobId));
  if (!missing.length) return validPatches;
  if (missing.length === request.length) throw new Error(`Claude Sonnet omitted every localization segment in a request of ${request.length} jobs.`);
  return [...validPatches, ...(await translate(missing))];
}

const cachedPatches = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};
const requests = splitRequests(jobs.filter((job) => !cachedPatches[job.jobId]));
const segmentPatches = Object.entries(cachedPatches).map(([jobId, replacement]) => ({ jobId, replacement }));
for (let offset = 0; offset < requests.length; offset += concurrency) {
  const batch = requests.slice(offset, offset + concurrency);
  const completed = (await Promise.all(batch.map(translate))).flat();
  segmentPatches.push(...completed);
  for (const patch of completed) cachedPatches[patch.jobId] = patch.replacement;
  fs.writeFileSync(cachePath, `${JSON.stringify(cachedPatches)}\n`);
  console.log(`Completed ${Math.min(offset + concurrency, requests.length)}/${requests.length} bilingual localization requests.`);
}
const segmentsByJobId = new Map(segmentPatches.map((patch) => [patch.jobId, patch.replacement]));
const patches = candidates.map((candidate) => {
  const candidateJobs = jobs.filter((job) => job.fieldId === candidate.id).sort((a, b) => a.segmentIndex - b.segmentIndex);
  const replacement = candidateJobs.map((job) => {
    const segment = segmentsByJobId.get(job.jobId);
    if (!segment) throw new Error(`Missing localized segment ${job.jobId}.`);
    return segment;
  }).join("");
  if (!preservesStructure(candidate.sourceValue, replacement)) throw new Error(`Markdown structure was lost at ${candidate.file}:${candidate.trace}.`);
  if (!targetLanguageIsCorrect(candidate.targetLanguage, replacement)) throw new Error(`Claude Sonnet returned the wrong language at ${candidate.file}:${candidate.trace}.`);
  if (candidate.kind === "truncated" && isEllipsized(replacement)) throw new Error(`Claude Sonnet left an ellipsized title at ${candidate.file}:${candidate.trace}.`);
  return { ...candidate, replacement };
});

const courses = new Map();
for (const patch of patches) {
  if (!courses.has(patch.file)) courses.set(patch.file, JSON.parse(fs.readFileSync(path.join(courseDirectory, patch.file), "utf8")));
  const { parent, key } = getParentAtTrace(courses.get(patch.file), patch.trace);
  if (parent[key] !== patch.oldValue || parent[patch.sourceLanguage] !== patch.sourceValue) throw new Error(`Source drift while applying ${patch.file}:${patch.trace}.`);
  parent[key] = patch.replacement;
}
for (const [file, course] of courses) fs.writeFileSync(path.join(courseDirectory, file), `${JSON.stringify(course, null, 2)}\n`);
fs.rmSync(cachePath, { force: true });
console.log(`Applied ${patches.length} Claude Sonnet bilingual language-integrity repairs across ${courses.size} course files.`);
