import { promises as fs } from "node:fs";
import path from "node:path";
import type { Express, Request, Response } from "express";

const COURSE_ID_PATTERN = /^[a-z0-9_]+$/i;

// Answer keys and correction material may use different historical naming
// conventions. Normalize the key name so camelCase, snake_case and kebab-case
// exports receive the same learner projection. Fields such as
// `completionRequiresCorrectAnswer` and learner-facing instructions remain
// available to render the activity, but data that reveals how it is scored
// never reaches a course-data response.
const SENSITIVE_LEARNER_CORRECTION_KEYS = new Set([
  "answer",
  "answers",
  "answerkey",
  "answerkeys",
  "correct",
  "iscorrect",
  "iscorrectanswer",
  "correctanswer",
  "correctanswers",
  "correctoption",
  "correctoptions",
  "correctoptionid",
  "correctoptionids",
  "correctoptionindex",
  "correctoptionindexes",
  "correctchoice",
  "correctchoices",
  "correctchoiceid",
  "correctchoiceids",
  "correctid",
  "correctids",
  "correctbucket",
  "correction",
  "corrections",
  "solution",
  "solutions",
  "sampleanswer",
  "sampleanswers",
  "modelanswer",
  "modelanswers",
  "expected",
  "expectedanswer",
  "expectedanswers",
  "expectedvalue",
  "expectedevidence",
  "expectedoutput",
  "expectedoutputs",
  "expectedresult",
  "expectedresults",
  "expectedresponse",
  "expectedresponses",
  "explanation",
  "explanations",
  "feedback",
  "feedbacks",
  "rationale",
  "rationales",
  "rubric",
  "rubriccriteria",
  "evaluationprompt",
  "evaluationcriteria",
  "gradingprompt",
  "solutionresource",
  "solutionresources",
  "correctionresource",
  "correctionresources",
]);

const SENSITIVE_LEARNER_CORRECTION_KEY_PREFIXES = [
  "correct",
  "answerkey",
  "solution",
  "correction",
  "sampleanswer",
  "modelanswer",
  "expectedanswer",
  "expectedvalue",
  "expectedevidence",
  "expectedoutput",
  "expectedresult",
  "expectedresponse",
  "explanation",
  "feedback",
  "rationale",
  "rubric",
  "evaluation",
  "grading",
] as const;

// These values constrain the learner interface but do not disclose which
// option, response or output is correct. They remain safe to use before a
// submission, including in future editor exports.
const LEARNER_RENDER_METADATA_KEYS = new Set([
  "completionrequirescorrectanswer",
  "expectedanswercount",
  "expectedselectioncount",
  "minimumanswerlength",
  "servercorrectionrequired",
  "servervalidated",
  "servergradedassessment",
]);

const LEARNER_CONTENT_ROOT_KEYS = new Set(["lessons", "exercises", "sections"]);

function normalizeCourseDataKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function isSensitiveLearnerCorrectionKey(key: string): boolean {
  const normalizedKey = normalizeCourseDataKey(key);
  if (LEARNER_RENDER_METADATA_KEYS.has(normalizedKey)) return false;
  return SENSITIVE_LEARNER_CORRECTION_KEYS.has(normalizedKey)
    || SENSITIVE_LEARNER_CORRECTION_KEY_PREFIXES.some(prefix => normalizedKey.startsWith(prefix));
}

/**
 * Rebuild a course-content value instead of mutating the parsed source.  This
 * makes the policy apply to every nested block shape (blocks, block, cards,
 * questions, options, steps, etc.) and leaves the source asset available to
 * server-side graders and secured post-submission endpoints.
 */
function sanitizeLearnerContent(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeLearnerContent);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !isSensitiveLearnerCorrectionKey(key))
      .map(([key, nestedValue]) => [key, sanitizeLearnerContent(nestedValue)]),
  );
}

function parseCourseData(content: string): any | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function sanitizeCourseDataForLearner(content: string): string {
  const course = parseCourseData(content);
  if (!course || typeof course !== "object" || Array.isArray(course)) return content;

  // Only project learner-visible course content. Import/integration metadata is
  // retained verbatim; it is not rendered as a lesson or exercise and may use
  // similarly named operational counters (for example `expected`).
  const learnerCourse = Object.fromEntries(
    Object.entries(course as Record<string, unknown>).map(([key, value]) => [
      key,
      LEARNER_CONTENT_ROOT_KEYS.has(key) ? sanitizeLearnerContent(value) : value,
    ]),
  );
  return JSON.stringify(learnerCourse);
}

export function isValidCourseDataId(courseId: string): boolean {
  return COURSE_ID_PATTERN.test(courseId);
}

export function getCourseDataDirectory(nodeEnv = process.env.NODE_ENV): string {
  return getCourseDataDirectories(nodeEnv)[0];
}

export function getCourseDataDirectories(nodeEnv = process.env.NODE_ENV, workingDirectory = process.cwd()): string[] {
  if (nodeEnv !== "production") {
    return [path.resolve(import.meta.dirname, "..", "client", "public", "data", "courses")];
  }

  return Array.from(new Set([
    process.env.COURSE_DATA_DIRECTORY,
    path.resolve(workingDirectory, "dist", "public", "data", "courses"),
    path.resolve(import.meta.dirname, "public", "data", "courses"),
    path.resolve(import.meta.dirname, "..", "public", "data", "courses"),
  ].filter((directory): directory is string => Boolean(directory))));
}

export async function readCourseDataAsset(courseId: string, directories = getCourseDataDirectories()): Promise<string | null> {
  if (!isValidCourseDataId(courseId)) return null;
  for (const directory of Array.isArray(directories) ? directories : [directories]) {
    try {
      const content = await fs.readFile(path.join(directory, `${courseId}.json`), "utf8");
      JSON.parse(content);
      return content;
    } catch {
      // Essayer le répertoire de build suivant, sans divulguer les chemins internes.
    }
  }
  return null;
}

export const COURSE_DATA_ROUTE_PATHS = [
  "/api/trpc/course-data/:courseId",
  "/data/courses/:courseId.json",
] as const;

export function registerCourseDataRoute(app: Express): void {
  const serveCourseData = async (req: Request, res: Response) => {
    const courseId = String(req.params.courseId || "");
    const content = await readCourseDataAsset(courseId);
    if (!content) {
      res.status(404).set({
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      }).json({ error: "Course data not found" });
      return;
    }

    res.status(200).set({
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    }).send(sanitizeCourseDataForLearner(content));
  };

  for (const routePath of COURSE_DATA_ROUTE_PATHS) app.get(routePath, serveCourseData);
}
