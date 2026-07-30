import { z } from "zod";
import { router, adminProcedure } from "./_core/trpc";
import fs from "fs/promises";
import path from "path";

/**
 * Admin Content Management Router
 * Allows admins to browse, view, simulate, and edit course content (JSON files).
 */

// Resolve the path to the public data directory
function getDataDir(): string {
  // In dev, it's client/public/data; in production, it's dist/public/data
  const devPath = path.resolve(import.meta.dirname, "..", "client", "public", "data");
  const prodPath = path.resolve(import.meta.dirname, "..", "dist", "public", "data");
  return process.env.NODE_ENV === "production" ? prodPath : devPath;
}

async function readJsonFile(filePath: string): Promise<any> {
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

async function writeJsonFile(filePath: string, data: any): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export const adminContentRouter = router({
  // List all available courses with their metadata
  listCourses: adminProcedure.query(async () => {
    const dataDir = getDataDir();
    const coursesDir = path.join(dataDir, "courses");
    const files = await fs.readdir(coursesDir);
    const courseFiles = files.filter(f => f.endsWith(".json"));
    
    const courses: Array<{
      courseId: string;
      filename: string;
      title: string;
      lessonsCount: number;
      exercisesCount: number;
      sectionsCount: number;
    }> = [];

    for (const file of courseFiles) {
      try {
        const data = await readJsonFile(path.join(coursesDir, file));
        courses.push({
          courseId: data.courseId || file.replace(".json", ""),
          filename: file,
          title: data.sourceCourseTitle || data.courseId || file,
          lessonsCount: data.lessons?.length || 0,
          exercisesCount: data.exercises?.length || 0,
          sectionsCount: data.sections?.length || 0,
        });
      } catch {
        // Skip invalid files
      }
    }
    return courses;
  }),

  // Get full course content by courseId
  getCourse: adminProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ input }) => {
      const dataDir = getDataDir();
      const filePath = path.join(dataDir, "courses", `${input.courseId}.json`);
      try {
        return await readJsonFile(filePath);
      } catch {
        return null;
      }
    }),

  // Update a course JSON file
  updateCourse: adminProcedure
    .input(z.object({
      courseId: z.string(),
      data: z.any(),
    }))
    .mutation(async ({ input }) => {
      const dataDir = getDataDir();
      const filePath = path.join(dataDir, "courses", `${input.courseId}.json`);
      await writeJsonFile(filePath, input.data);
      return { success: true };
    }),

  // Get all lesson quizzes
  getQuizzes: adminProcedure.query(async () => {
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, "lessonQuizzes.json");
    try {
      return await readJsonFile(filePath);
    } catch {
      return {};
    }
  }),

  // Update quizzes for a specific course
  updateQuizzes: adminProcedure
    .input(z.object({
      courseId: z.string(),
      lessonKey: z.string(),
      questions: z.array(z.object({
        question: z.union([z.string(), z.record(z.string(), z.string())]),
        choices: z.array(z.object({
          id: z.string(),
          text: z.union([z.string(), z.record(z.string(), z.string())]),
        })),
        correctId: z.string(),
        explanation: z.union([z.string(), z.record(z.string(), z.string())]),
      })),
    }))
    .mutation(async ({ input }) => {
      const dataDir = getDataDir();
      const filePath = path.join(dataDir, "lessonQuizzes.json");
      const data = await readJsonFile(filePath);
      if (!data[input.courseId]) data[input.courseId] = {};
      data[input.courseId][input.lessonKey] = input.questions;
      await writeJsonFile(filePath, data);
      return { success: true };
    }),

  // Get all mock exam questions
  getMockExamQuestions: adminProcedure.query(async () => {
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, "mockExamQuestions.json");
    try {
      return await readJsonFile(filePath);
    } catch {
      return [];
    }
  }),

  // Update a mock exam question by ID
  updateMockExamQuestion: adminProcedure
    .input(z.object({
      questionId: z.string(),
      data: z.object({
        question: z.union([z.string(), z.record(z.string(), z.string())]),
        choices: z.array(z.object({
          id: z.string(),
          text: z.union([z.string(), z.record(z.string(), z.string())]),
        })),
        correctChoiceIds: z.array(z.string()),
        explanation: z.union([z.string(), z.record(z.string(), z.string())]),
        domain: z.union([z.string(), z.record(z.string(), z.string())]).optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const dataDir = getDataDir();
      const filePath = path.join(dataDir, "mockExamQuestions.json");
      const data: any[] = await readJsonFile(filePath);
      const idx = data.findIndex((q: any) => q.id === input.questionId);
      if (idx === -1) return { success: false, error: "Question not found" };
      data[idx] = { ...data[idx], ...input.data };
      await writeJsonFile(filePath, data);
      return { success: true };
    }),

  // Add a new mock exam question
  addMockExamQuestion: adminProcedure
    .input(z.object({
      certificationId: z.string(),
      domain: z.union([z.string(), z.record(z.string(), z.string())]),
      question: z.union([z.string(), z.record(z.string(), z.string())]),
      choices: z.array(z.object({
        id: z.string(),
        text: z.union([z.string(), z.record(z.string(), z.string())]),
      })),
      correctChoiceIds: z.array(z.string()),
      explanation: z.union([z.string(), z.record(z.string(), z.string())]),
    }))
    .mutation(async ({ input }) => {
      const dataDir = getDataDir();
      const filePath = path.join(dataDir, "mockExamQuestions.json");
      const data: any[] = await readJsonFile(filePath);
      const newId = `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      data.push({ id: newId, ...input });
      await writeJsonFile(filePath, data);
      return { success: true, id: newId };
    }),

  // Delete a mock exam question
  deleteMockExamQuestion: adminProcedure
    .input(z.object({ questionId: z.string() }))
    .mutation(async ({ input }) => {
      const dataDir = getDataDir();
      const filePath = path.join(dataDir, "mockExamQuestions.json");
      const data: any[] = await readJsonFile(filePath);
      const filtered = data.filter((q: any) => q.id !== input.questionId);
      await writeJsonFile(filePath, filtered);
      return { success: true };
    }),

  // Update a lesson's chapter content (blocks)
  updateChapterBlocks: adminProcedure
    .input(z.object({
      courseId: z.string(),
      lessonIndex: z.number(),
      chapterIndex: z.number(),
      blocks: z.array(z.any()),
    }))
    .mutation(async ({ input }) => {
      const dataDir = getDataDir();
      const filePath = path.join(dataDir, "courses", `${input.courseId}.json`);
      const data = await readJsonFile(filePath);
      if (!data.lessons?.[input.lessonIndex]?.chapters?.[input.chapterIndex]) {
        return { success: false, error: "Chapter not found" };
      }
      data.lessons[input.lessonIndex].chapters[input.chapterIndex].blocks = input.blocks;
      await writeJsonFile(filePath, data);
      return { success: true };
    }),

  // Update an exercise
  updateExercise: adminProcedure
    .input(z.object({
      courseId: z.string(),
      exerciseIndex: z.number(),
      data: z.object({
        prompt: z.union([z.string(), z.record(z.string(), z.string())]).optional(),
        instructions: z.union([z.string(), z.record(z.string(), z.string())]).optional(),
        correction: z.union([z.string(), z.record(z.string(), z.string())]).optional(),
        rubric: z.any().optional(),
        title: z.union([z.string(), z.record(z.string(), z.string())]).optional(),
        difficulty: z.string().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const dataDir = getDataDir();
      const filePath = path.join(dataDir, "courses", `${input.courseId}.json`);
      const data = await readJsonFile(filePath);
      if (!data.exercises?.[input.exerciseIndex]) {
        return { success: false, error: "Exercise not found" };
      }
      Object.assign(data.exercises[input.exerciseIndex], input.data);
      await writeJsonFile(filePath, data);
      return { success: true };
    }),

  // Get training index (certifications overview)
  getTrainingIndex: adminProcedure.query(async () => {
    const indexPath = path.resolve(import.meta.dirname, "..", "client", "src", "data", "trainingIndex.json");
    try {
      return await readJsonFile(indexPath);
    } catch {
      return { certifications: [] };
    }
  }),
});
