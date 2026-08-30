import { z } from "zod";
import { router, adminProcedure } from "./_core/trpc";
import fs from "fs/promises";
import path from "path";
import { validateStructuredCourse } from "../shared/contentStudio";
import { remapLessonQuizBanks } from "../shared/lessonManagement";
import { validateCatalogIndex } from "../shared/catalogValidation";
import { listGlobalMediaAssets, removeUnusedMediaMetadata, replaceMediaEverywhere, saveMediaMetadata } from "./mediaCatalog";
import { storagePut } from "./storage";
import { applyCatalogMetrics } from "../shared/catalogMetrics";
import { eq } from "drizzle-orm";
import { courseLifecycleStates } from "../drizzle/schema";
import { getCourseCatalogKpis, getDb } from "./db";

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

async function enrichCatalogMetrics(index: any, dataDir: string) {
  const coursesById: Record<string, any> = {};
  try {
    const coursesDir = path.join(dataDir, "courses");
    const files = await fs.readdir(coursesDir);
    await Promise.all(files.filter((file) => file.endsWith(".json")).map(async (file) => {
      const course = await readJsonFile(path.join(coursesDir, file));
      coursesById[course.courseId || file.replace(/\.json$/, "")] = course;
    }));
  } catch { /* Missing course files contribute zero resources. */ }
  return applyCatalogMetrics(index, coursesById);
}

async function syncCatalogMetrics(dataDir: string) {
  const indexPath = path.resolve(import.meta.dirname, "..", "client", "src", "data", "trainingIndex.json");
  const index = await readJsonFile(indexPath);
  const enriched = await enrichCatalogMetrics(index, dataDir);
  await writeJsonFile(indexPath, enriched);
  return enriched;
}

export const adminContentRouter = router({
  listMediaAssets: adminProcedure.query(async () => listGlobalMediaAssets(getDataDir())),

  saveMediaAsset: adminProcedure
    .input(z.object({
      url: z.string().min(1),
      title: z.string().max(240),
      kind: z.enum(["youtube", "video", "audio", "pdf", "image", "download", "slides"]),
    }))
    .mutation(async ({ input }) => saveMediaMetadata(getDataDir(), input)),

  uploadMediaAsset: adminProcedure
    .input(z.object({
      filename: z.string().min(1).max(180),
      mimeType: z.string().min(1).max(120),
      base64: z.string().min(1).max(12_000_000),
      title: z.string().max(240),
      kind: z.enum(["video", "audio", "pdf", "image", "download", "slides"]),
    }))
    .mutation(async ({ input }) => {
      const bytes = Buffer.from(input.base64, "base64");
      if (bytes.byteLength > 8 * 1024 * 1024) throw new Error("Le fichier dépasse 8 Mo. Pour les vidéos plus lourdes, utilisez une URL /api/assets/ déjà importée.");
      const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uploaded = await storagePut(`media-library/${safeFilename}`, bytes, input.mimeType);
      return saveMediaMetadata(getDataDir(), { url: uploaded.url, title: input.title || input.filename, kind: input.kind });
    }),

  replaceMediaAsset: adminProcedure
    .input(z.object({ fromUrl: z.string().min(1), toUrl: z.string().min(1) }))
    .mutation(async ({ input }) => replaceMediaEverywhere(getDataDir(), input.fromUrl, input.toUrl)),

  removeUnusedMediaAsset: adminProcedure
    .input(z.object({ url: z.string().min(1) }))
    .mutation(async ({ input }) => removeUnusedMediaMetadata(getDataDir(), input.url)),

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
    const db = await getDb();
    const [states, kpisByCourse] = await Promise.all([
      db ? db.select().from(courseLifecycleStates) : [],
      getCourseCatalogKpis(courses),
    ]);
    const statesByCourseId = new Map(states.map((state) => [state.courseId, state]));
    return courses.map((course) => {
      const state = statesByCourseId.get(course.courseId);
      return { ...course, kpi: kpisByCourse[course.courseId], lifecycleStatus: state?.status || "active", lifecycleReason: state?.reason || null, lifecycleUpdatedAt: state?.updatedAt || null };
    });
  }),

  setCourseLifecycle: adminProcedure
    .input(z.object({ courseId: z.string().min(1).max(200), status: z.enum(["active", "disabled", "archived"]), reason: z.string().trim().max(2000).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      await db.insert(courseLifecycleStates).values({ courseId: input.courseId, status: input.status, reason: input.reason || null, updatedBy: ctx.user.id }).onDuplicateKeyUpdate({ set: { status: input.status, reason: input.reason || null, updatedBy: ctx.user.id, updatedAt: new Date() } });
      return { success: true };
    }),

  bulkSetCourseLifecycle: adminProcedure
    .input(z.object({ courseIds: z.array(z.string().min(1).max(200)).min(1).max(100), status: z.enum(["active", "disabled", "archived"]), reason: z.string().trim().max(2000).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      await Promise.all(input.courseIds.map((courseId) => db.insert(courseLifecycleStates).values({ courseId, status: input.status, reason: input.reason || null, updatedBy: ctx.user.id }).onDuplicateKeyUpdate({ set: { status: input.status, reason: input.reason || null, updatedBy: ctx.user.id, updatedAt: new Date() } })));
      return { success: true, count: input.courseIds.length };
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
      const previous = await readJsonFile(filePath);
      await writeJsonFile(filePath, input.data);
      await syncCatalogMetrics(dataDir);
      const quizzesPath = path.join(dataDir, "lessonQuizzes.json");
      try {
        const quizzes = await readJsonFile(quizzesPath);
        if (quizzes[input.courseId]) {
          quizzes[input.courseId] = remapLessonQuizBanks(previous, input.data, quizzes[input.courseId]);
          await writeJsonFile(quizzesPath, quizzes);
        }
      } catch { /* The course can exist without a chapter quiz bank. */ }
      return { success: true };
    }),

  // Validate a complete structured course draft before publishing it from the visual builder.
  validateCourseDraft: adminProcedure
    .input(z.object({ data: z.any() }))
    .mutation(({ input }) => validateStructuredCourse(input.data)),

  // Explicit save path for the pilot studio. Legacy updateCourse remains unchanged.
  saveCourseDraft: adminProcedure
    .input(z.object({ courseId: z.string(), data: z.any() }))
    .mutation(async ({ input }) => {
      const validation = validateStructuredCourse(input.data);
      if (!validation.valid) return { success: false, validation };
      if (input.data.courseId && input.data.courseId !== input.courseId) {
        return { success: false, validation: { ...validation, valid: false, errors: [...validation.errors, { severity: "error" as const, path: "courseId", message: "L’identifiant du brouillon ne correspond pas au cours sélectionné." }] } };
      }
      const dataDir = getDataDir();
      const coursePath = path.join(dataDir, "courses", `${input.courseId}.json`);
      const previous = await readJsonFile(coursePath);
      await writeJsonFile(coursePath, input.data);
      await syncCatalogMetrics(dataDir);
      const quizzesPath = path.join(dataDir, "lessonQuizzes.json");
      try {
        const quizzes = await readJsonFile(quizzesPath);
        if (quizzes[input.courseId]) {
          quizzes[input.courseId] = remapLessonQuizBanks(previous, input.data, quizzes[input.courseId]);
          await writeJsonFile(quizzesPath, quizzes);
        }
      } catch { /* The course can exist without a chapter quiz bank. */ }
      return { success: true, validation };
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
      questions: z.union([z.array(z.object({
        question: z.union([z.string(), z.record(z.string(), z.string())]),
        choices: z.array(z.object({
          id: z.string(),
          text: z.union([z.string(), z.record(z.string(), z.string())]),
        })),
        correctId: z.string(),
        explanation: z.union([z.string(), z.record(z.string(), z.string())]),
      })), z.object({
        questions: z.array(z.object({
          question: z.union([z.string(), z.record(z.string(), z.string())]),
          choices: z.array(z.object({
            id: z.string(),
            text: z.union([z.string(), z.record(z.string(), z.string())]),
          })),
          correctId: z.string(),
          explanation: z.union([z.string(), z.record(z.string(), z.string())]),
        })),
        selection: z.object({
          mode: z.enum(["random", "all"]),
          questionCount: z.number().int().positive(),
          passThreshold: z.number().int().positive(),
          shuffleChoices: z.boolean(),
        }),
      })]),
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

  getExamConfigurations: adminProcedure.query(async () => {
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, "examConfigurations.json");
    try {
      return await readJsonFile(filePath);
    } catch {
      return {};
    }
  }),

  updateExamConfiguration: adminProcedure
    .input(z.object({
      certificationId: z.string(),
      configuration: z.object({
        questionCount: z.number().int().positive(),
        passingScore: z.number().int().min(1).max(100),
        shuffleQuestions: z.boolean(),
        shuffleChoices: z.boolean(),
      }),
    }))
    .mutation(async ({ input }) => {
      const dataDir = getDataDir();
      const filePath = path.join(dataDir, "examConfigurations.json");
      let data: Record<string, unknown> = {};
      try { data = await readJsonFile(filePath); } catch { /* first configuration */ }
      data[input.certificationId] = input.configuration;
      await writeJsonFile(filePath, data);
      return { success: true };
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
      await syncCatalogMetrics(dataDir);
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
        interactionType: z.string().optional(),
        inputSchema: z.any().optional(),
        options: z.array(z.object({
          id: z.string(),
          text: z.union([z.string(), z.record(z.string(), z.string())]),
          correct: z.boolean().optional(),
        })).optional(),
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
      await syncCatalogMetrics(dataDir);
      return { success: true };
    }),

  // Get training index (certifications overview)
  getTrainingIndex: adminProcedure.query(async () => {
      const indexPath = path.resolve(import.meta.dirname, "..", "client", "src", "data", "trainingIndex.json");
      try {
        return await enrichCatalogMetrics(await readJsonFile(indexPath), getDataDir());
    } catch {
      return { certifications: [] };
    }
  }),

  updateTrainingIndex: adminProcedure
    .input(z.object({
      data: z.object({
        certifications: z.array(z.any()),
        courses: z.array(z.any()),
        categories: z.array(z.any()).optional(),
        examConfig: z.any().optional(),
        _buildVersion: z.any().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const validationError = validateCatalogIndex(input.data);
      if (validationError) throw new Error(validationError);
      const indexPath = path.resolve(import.meta.dirname, "..", "client", "src", "data", "trainingIndex.json");
      const enriched = await enrichCatalogMetrics(input.data, getDataDir());
      await writeJsonFile(indexPath, enriched);
      return { success: true, data: enriched };
    }),
});
