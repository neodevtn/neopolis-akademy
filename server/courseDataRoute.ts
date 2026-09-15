import { promises as fs } from "node:fs";
import path from "node:path";
import type { Express, Request, Response } from "express";

const COURSE_ID_PATTERN = /^[a-z0-9_]+$/i;

export function isValidCourseDataId(courseId: string): boolean {
  return COURSE_ID_PATTERN.test(courseId);
}

export function getCourseDataDirectory(nodeEnv = process.env.NODE_ENV): string {
  return nodeEnv === "production"
    ? path.resolve(import.meta.dirname, "public", "data", "courses")
    : path.resolve(import.meta.dirname, "..", "client", "public", "data", "courses");
}

export async function readCourseDataAsset(courseId: string, directory = getCourseDataDirectory()): Promise<string | null> {
  if (!isValidCourseDataId(courseId)) return null;
  try {
    const content = await fs.readFile(path.join(directory, `${courseId}.json`), "utf8");
    JSON.parse(content);
    return content;
  } catch {
    return null;
  }
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
    }).send(content);
  });
}
