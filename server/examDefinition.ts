import fs from "fs/promises";
import path from "path";
import { eq } from "drizzle-orm";
import trainingIndex from "../client/src/data/trainingIndex.json";
import { certificationExams } from "../drizzle/schema";
import { normalizeExamConfiguration, type ExamConfiguration } from "../shared/examConfiguration";
import { getDb } from "./db";

export type ExamQuestion = {
  id: string;
  certificationId: string;
  domain?: string | { fr?: string; en?: string };
  question: string | { fr?: string; en?: string };
  choices: Array<{ id: string; text: string | { fr?: string; en?: string } }>;
  correctChoiceIds: string[];
  explanation?: string | { fr?: string; en?: string };
};

type StoredConfigurations = Record<string, Partial<ExamConfiguration> & { questionCount?: number }>;

function publicDataPath(filename: string): string {
  const root = process.env.NODE_ENV === "production" ? "dist/public/data" : "client/public/data";
  return path.resolve(import.meta.dirname, "..", root, filename);
}

async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(publicDataPath(filename), "utf8")) as T;
  } catch {
    return fallback;
  }
}

type StoredExam = { certificationId: string; configuration: Partial<ExamConfiguration>; questions: ExamQuestion[] };

async function getStoredExams(): Promise<StoredExam[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select({ certificationId: certificationExams.certificationId, configuration: certificationExams.configuration, questions: certificationExams.questions }).from(certificationExams);
  return rows.filter((row): row is StoredExam => Boolean(row.certificationId) && row.configuration !== null && Array.isArray(row.questions)).map((row) => ({
    certificationId: row.certificationId,
    configuration: (row.configuration || {}) as Partial<ExamConfiguration>,
    questions: (row.questions || []) as ExamQuestion[],
  }));
}

async function persistExam(certificationId: string, configuration: ExamConfiguration, questions: ExamQuestion[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(certificationExams).values({ certificationId, configuration, questions }).onDuplicateKeyUpdate({ set: { configuration, questions } });
}

export function certificationExists(certificationId: string): boolean {
  return (trainingIndex.certifications as Array<{ id: string }>).some((certification) => certification.id === certificationId);
}

export function getCertificationLessonCounts(certificationId: string): Record<string, number> {
  return (trainingIndex as unknown as { courses: Array<{ id: string; certId?: string; lessonCount?: number }> }).courses
    .filter((course) => course.certId === certificationId)
    .reduce<Record<string, number>>((counts, course) => ({ ...counts, [course.id]: Math.max(1, Number(course.lessonCount) || 1) }), {});
}

export async function getMockExamQuestions(): Promise<ExamQuestion[]> {
  const [raw, storedExams] = await Promise.all([readJsonFile<unknown[]>("mockExamQuestions.json", []), getStoredExams()]);
  const fallback = raw.filter((question): question is ExamQuestion => Boolean(question) && typeof question === "object" && typeof (question as ExamQuestion).id === "string" && typeof (question as ExamQuestion).certificationId === "string" && Array.isArray((question as ExamQuestion).choices) && Array.isArray((question as ExamQuestion).correctChoiceIds));
  const storedByCertification = new Map(storedExams.map((exam) => [exam.certificationId, exam.questions]));
  const fallbackCertificationIds = new Set(fallback.map((question) => question.certificationId));
  const resolvedFallback = fallback.filter((question) => !storedByCertification.has(question.certificationId));
  const databaseOnly = Array.from(storedByCertification.entries()).filter(([certificationId]) => !fallbackCertificationIds.has(certificationId)).flatMap(([, questions]) => questions);
  return [...resolvedFallback, ...Array.from(storedByCertification.entries()).filter(([certificationId]) => fallbackCertificationIds.has(certificationId)).flatMap(([, questions]) => questions), ...databaseOnly];
}

export async function getExamConfigurationOverrides(): Promise<StoredConfigurations> {
  const raw = await readJsonFile<unknown>("examConfigurations.json", {});
  return raw && typeof raw === "object" && !Array.isArray(raw) ? raw as StoredConfigurations : {};
}

export async function getExamDefinitions(): Promise<Record<string, ExamConfiguration>> {
  const [questions, overrides, storedExams] = await Promise.all([getMockExamQuestions(), getExamConfigurationOverrides(), getStoredExams()]);
  const staticConfigurations = ((trainingIndex as unknown as { examConfig?: StoredConfigurations }).examConfig || {});
  const storedByCertification = new Map(storedExams.map((exam) => [exam.certificationId, exam]));
  const certificationIds = new Set([...Object.keys(staticConfigurations), ...Object.keys(overrides), ...Array.from(storedByCertification.keys())]);
  const definitions: Record<string, ExamConfiguration> = {};
  for (const certificationId of Array.from(certificationIds)) {
    if (!certificationExists(certificationId)) continue;
    const availableQuestions = questions.filter((question) => question.certificationId === certificationId).length;
    const base = staticConfigurations[certificationId] || {};
    const override = overrides[certificationId] || {};
    const stored = storedByCertification.get(certificationId);
    const merged = { ...base, ...override, ...(stored?.configuration || {}) };
    const normalized = normalizeExamConfiguration(merged, availableQuestions);
    definitions[certificationId] = {
      ...normalized,
      isPublished: typeof stored?.configuration.isPublished === "boolean" ? stored.configuration.isPublished : typeof override.isPublished === "boolean" ? override.isPublished : Boolean(staticConfigurations[certificationId]),
    };
  }
  return definitions;
}

export async function getExamDefinition(certificationId: string): Promise<ExamConfiguration | null> {
  const definitions = await getExamDefinitions();
  return definitions[certificationId] || null;
}

export async function saveExamConfiguration(certificationId: string, configuration: ExamConfiguration): Promise<void> {
  if (!certificationExists(certificationId)) throw new Error("Formation inconnue pour cet examen");
  const questions = await getQuestionsForCertification(certificationId);
  await persistExam(certificationId, configuration, questions);
}

export async function disableExamConfiguration(certificationId: string): Promise<void> {
  const definitions = await getExamDefinitions();
  const current = definitions[certificationId];
  if (!current) throw new Error("Aucun examen à désactiver pour cette formation");
  await saveExamConfiguration(certificationId, { ...current, isPublished: false });
}

/** Suppression explicite d’une épreuve administrée ; les anciennes sources de repli ne sont jamais modifiées. */
export async function deleteExamConfiguration(certificationId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.delete(certificationExams).where(eq(certificationExams.certificationId, certificationId));
  return Number(result[0]?.affectedRows || 0) > 0;
}

export async function getQuestionsForCertification(certificationId: string): Promise<ExamQuestion[]> {
  const questions = await getMockExamQuestions();
  return questions.filter((question) => question.certificationId === certificationId);
}

export async function updateExamQuestion(questionId: string, data: Omit<ExamQuestion, "id" | "certificationId">): Promise<boolean> {
  const questions = await getMockExamQuestions();
  const existing = questions.find((question) => question.id === questionId);
  if (!existing) return false;
  const certificationQuestions = questions.filter((question) => question.certificationId === existing.certificationId).map((question) => question.id === questionId ? { ...question, ...data } : question);
  const configuration = await getExamDefinition(existing.certificationId);
  if (!configuration) throw new Error("Configuration d’examen introuvable");
  await persistExam(existing.certificationId, configuration, certificationQuestions);
  return true;
}

export async function addExamQuestion(data: Omit<ExamQuestion, "id">): Promise<string> {
  if (!certificationExists(data.certificationId)) throw new Error("Formation inconnue pour cette question");
  const existing = await getQuestionsForCertification(data.certificationId);
  const id = `exam_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const configuration = await getExamDefinition(data.certificationId) || normalizeExamConfiguration({}, existing.length + 1);
  await persistExam(data.certificationId, configuration, [...existing, { ...data, id }]);
  return id;
}

export async function deleteExamQuestion(questionId: string): Promise<boolean> {
  const questions = await getMockExamQuestions();
  const existing = questions.find((question) => question.id === questionId);
  if (!existing) return false;
  const certificationQuestions = questions.filter((question) => question.certificationId === existing.certificationId && question.id !== questionId);
  const configuration = await getExamDefinition(existing.certificationId);
  if (!configuration) throw new Error("Configuration d’examen introuvable");
  await persistExam(existing.certificationId, { ...configuration, isPublished: configuration.isPublished && certificationQuestions.length > 0 }, certificationQuestions);
  return true;
}

export function selectExamQuestions(questions: ExamQuestion[], configuration: ExamConfiguration): ExamQuestion[] {
  const pool = [...questions];
  if (configuration.shuffleQuestions) {
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
    }
  }
  return pool.slice(0, configuration.totalQuestions).map((question) => ({
    ...question,
    choices: configuration.shuffleChoices ? [...question.choices].sort(() => Math.random() - 0.5) : question.choices,
  }));
}
