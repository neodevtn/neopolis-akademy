import { promises as fs } from "node:fs";
import path from "node:path";
import type { Express, Request, Response } from "express";

const COURSE_ID_PATTERN = /^[a-z0-9_]+$/i;

function parseCourseData(content: string): any | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function sanitizeCourseDataForLearner(content: string): string {
  const course = parseCourseData(content);
  if (!course || !Array.isArray(course.lessons)) return content;
  for (const lesson of course.lessons) {
    for (const chapter of lesson?.chapters || []) {
      for (const block of chapter?.blocks || []) {
        if (block?.type === "single_choice_exercise" && block?.serverValidated === true) {
          delete block.correctAnswer;
          delete block.explanation;
        }
      }
    }
  }
  for (const exercise of course.exercises || []) {
    if (exercise?.serverValidated === true) {
      delete exercise.correctAnswer;
      delete exercise.explanation;
      delete exercise.correction;
      for (const option of exercise.options || []) delete option.correct;
    }
  }
  return JSON.stringify(course);
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

export function registerCourseDataRoute(app: Express): void {
  app.get("/api/trpc/course-data/:courseId", async (req: Request, res: Response) => {
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
  });
}
