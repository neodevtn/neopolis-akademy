import fs from "fs/promises";
import path from "path";
import { eq } from "drizzle-orm";
import trainingIndex from "../client/src/data/trainingIndex.json";
import { certificationExams } from "../drizzle/schema";
import { normalizeExamConfiguration, type ExamConfiguration } from "../shared/examConfiguration";
import { getDb } from "./db";

export type ExamChoice = {
  id: string;
  text: string | { fr?: string; en?: string };
  rationale?: string | { fr?: string; en?: string };
  rationaleProvenance?: { model?: string; method?: string; generatedAt?: string };
};

export type ExamQuestion = {
  id: string;
  certificationId: string;
  domain?: string | { fr?: string; en?: string };
  scenarioFamily?: string;
  scenarioTitle?: string | { fr?: string; en?: string };
  subdomain?: string;
  objective?: string;
  difficulty?: "foundational" | "intermediate" | "advanced";
  competency?: string[];
  sourcePedagogique?: string;
  version?: string;
  question: string | { fr?: string; en?: string };
  choices: ExamChoice[];
  correctChoiceIds: string[];
  explanation?: string | { fr?: string; en?: string };
};

type StoredConfigurations = Record<string, Partial<ExamConfiguration> & { questionCount?: number }>;

function privateDataPath(filename: string): string {
  const root = process.env.NODE_ENV === "production" ? "dist/data" : "server/data";
  return path.resolve(import.meta.dirname, "..", root, filename);
}

async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(privateDataPath(filename), "utf8")) as T;
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
  const updatedQuestion: ExamQuestion = {
    ...existing,
    ...data,
    choices: data.choices.map((choice) => ({
      ...existing.choices.find((existingChoice) => existingChoice.id === choice.id),
      ...choice,
    })),
  };
  const certificationQuestions = questions.filter((question) => question.certificationId === existing.certificationId).map((question) => question.id === questionId ? updatedQuestion : question);
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

function localizedName(value: string | { fr?: string; en?: string } | undefined): string {
  if (typeof value === "string") return value;
  return value?.en || value?.fr || "";
}

function shuffled<T>(items: T[], enabled = true): T[] {
  const result = [...items];
  if (!enabled) return result;
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function domainTargets(configuration: ExamConfiguration): Map<string, number> {
  const domains = configuration.domains.filter((domain) => Number(domain.weight) > 0);
  if (!domains.length) return new Map();
  const targets = domains.map((domain) => ({
    key: localizedName(domain.name),
    raw: configuration.totalQuestions * Number(domain.weight) / 100,
  }));
  const result = new Map(targets.map((target) => [target.key, Math.floor(target.raw)]));
  let remainder = configuration.totalQuestions - Array.from(result.values()).reduce((sum, value) => sum + value, 0);
  for (const target of [...targets].sort((a, b) => (b.raw % 1) - (a.raw % 1))) {
    if (remainder <= 0) break;
    result.set(target.key, (result.get(target.key) || 0) + 1);
    remainder -= 1;
  }
  return result;
}

export function selectExamQuestions(questions: ExamQuestion[], configuration: ExamConfiguration): ExamQuestion[] {
  const scenarioPolicy = configuration.scenarioSelection;
  const scenarios = new Map<string, ExamQuestion[]>();
  for (const question of questions) {
    if (!question.scenarioFamily) continue;
    scenarios.set(question.scenarioFamily, [...(scenarios.get(question.scenarioFamily) || []), question]);
  }

  const scenarioFamilies = scenarioPolicy
    ? shuffled(Array.from(scenarios.entries()).filter(([, entries]) => entries.length >= scenarioPolicy.questionsPerFamily), configuration.shuffleQuestions)
      .slice(0, scenarioPolicy.selectedFamilies)
    : [];
  const selectedScenarioQuestions = scenarioFamilies.flatMap(([, entries]) => shuffled(entries, configuration.shuffleQuestions).slice(0, scenarioPolicy?.questionsPerFamily || 0));
  const selectedIds = new Set(selectedScenarioQuestions.map((question) => question.id));
  const unselectedScenarioFamilies = new Set(Array.from(scenarios.keys()).filter((family) => !scenarioFamilies.some(([selectedFamily]) => selectedFamily === family)));
  const regularPool = questions.filter((question) => !selectedIds.has(question.id) && !question.scenarioFamily && !unselectedScenarioFamilies.has(question.scenarioFamily || ""));
  const selected = [...selectedScenarioQuestions];
  const targets = domainTargets(configuration);

  if (targets.size) {
    for (const [targetDomain, targetCount] of Array.from(targets.entries())) {
      const alreadySelected = selected.filter((question) => localizedName(question.domain) === targetDomain).length;
      const needed = Math.max(0, targetCount - alreadySelected);
      const candidates = shuffled(regularPool.filter((question) => localizedName(question.domain) === targetDomain && !selectedIds.has(question.id)), configuration.shuffleQuestions).slice(0, needed);
      for (const question of candidates) {
        selected.push(question);
        selectedIds.add(question.id);
      }
    }
  }

  for (const question of shuffled(regularPool.filter((candidate) => !selectedIds.has(candidate.id)), configuration.shuffleQuestions)) {
    if (selected.length >= configuration.totalQuestions) break;
    selected.push(question);
    selectedIds.add(question.id);
  }

  return shuffled(selected, configuration.shuffleQuestions).slice(0, configuration.totalQuestions).map((question) => ({
    ...question,
    choices: configuration.shuffleChoices ? [...question.choices].sort(() => Math.random() - 0.5) : question.choices,
  }));
}

/** Projection sans correction destinée exclusivement au navigateur pendant l’épreuve. */
export function toLearnerExamQuestions(questions: ExamQuestion[]) {
  return questions.map(({ id, certificationId, domain, question, choices, correctChoiceIds }) => ({
    id,
    certificationId,
    domain,
    question,
    choices: choices.map(({ id: choiceId, text }) => ({ id: choiceId, text })),
    // Le nombre de réponses attendues guide l’interface sans révéler les choix corrects.
    requiredSelections: Math.max(1, correctChoiceIds.length),
  }));
}

function rationaleForChoice(explanation: ExamQuestion["explanation"], choiceId: string): string | { fr?: string; en?: string } | undefined {
  const extract = (value: string | undefined) => {
    if (!value) return undefined;
    const escapedId = choiceId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\*\\*[^*]*\\b${escapedId}\\b[^*]*\\*\\*\\s*([\\s\\S]*?)(?=\\s*\\*\\*(?:[a-z0-9]+|Correct|Bonne réponse)[^*]*\\*\\*|$)`, "i");
    return value.match(pattern)?.[1]?.trim() || undefined;
  };
  if (typeof explanation === "string") return extract(explanation);
  const en = extract(explanation?.en);
  const fr = extract(explanation?.fr);
  return en || fr ? { ...(en ? { en } : {}), ...(fr ? { fr } : {}) } : undefined;
}

function fallbackRationaleForChoice(text: ExamQuestion["choices"][number]["text"], isCorrect: boolean): string | { fr?: string; en?: string } {
  const statement = isCorrect
    ? {
      en: "This is the keyed answer because it meets the decision rule evaluated by the question.",
      fr: "C’est la réponse attendue, car elle respecte la règle de décision évaluée par la question.",
    }
    : {
      en: "This option is not the best answer because it does not meet all conditions of the decision rule evaluated by the question.",
      fr: "Cette option n’est pas la meilleure réponse, car elle ne respecte pas toutes les conditions de la règle de décision évaluée par la question.",
    };
  if (typeof text === "string") return statement.en;
  return statement;
}

/** Revue détaillée rendue uniquement après une soumission d’examen validée côté serveur. */
export function toLearnerExamReview(questions: ExamQuestion[]) {
  return questions.map(({ id, domain, question, choices, correctChoiceIds, explanation }) => ({
    id,
    domain,
    question,
    choices: choices.map(({ id: choiceId, text, rationale }) => ({
      id: choiceId,
      text,
      rationale: rationale || rationaleForChoice(explanation, choiceId) || fallbackRationaleForChoice(text, correctChoiceIds.includes(choiceId)),
    })),
    correctChoiceIds: [...correctChoiceIds],
    explanation,
  }));
}
