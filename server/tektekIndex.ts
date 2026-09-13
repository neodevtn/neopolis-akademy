import fs from "fs";
import path from "path";
import type { TekTekSource, TekTekSourceKind } from "../shared/tektek";

type Localized = string | { fr?: string; en?: string; ar?: string } | null | undefined;
type CourseRecord = Record<string, unknown>;

export type TekTekTraining = {
  id: string;
  title: Localized;
  courses: string[];
};

type CachedTraining = {
  training: TekTekTraining;
  sources: TekTekSource[];
  courseIds: Set<string>;
  version: string;
};

const cache = new Map<string, CachedTraining>();
const projectRoot = process.cwd();
const trainingIndexPath = path.join(projectRoot, "client", "src", "data", "trainingIndex.json");
const coursesDirectory = path.join(projectRoot, "client", "public", "data", "courses");
const MAX_CHUNK_LENGTH = 2200;

function textFor(value: Localized, language = "fr") {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const localized = value as { fr?: string; en?: string; ar?: string };
  return (localized[language as "fr" | "en" | "ar"] || localized.fr || localized.en || localized.ar || "").trim();
}

function compactText(value: unknown, limit = MAX_CHUNK_LENGTH) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function normalizeForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\u0600-\u06ff]+/g, " ")
    .trim();
}

function tokens(value: string) {
  return Array.from(new Set(normalizeForSearch(value).split(" ").filter((token) => token.length >= 3))).slice(0, 24);
}

const SEARCH_STOP_WORDS = new Set([
  "about", "again", "also", "and", "are", "can", "concept", "could", "does", "explain", "explored", "further", "here", "how", "into", "more", "please", "that", "the", "their", "this", "topic", "what", "where", "which", "with",
  "alors", "avec", "cela", "cette", "comment", "dans", "davantage", "encore", "est", "expliquer", "ici", "notion", "peut", "plus", "pour", "quoi", "sujet", "trouve", "quel", "quelle",
  "أكثر", "أين", "المفهوم", "الموضوع", "شرح", "هذا", "هذه", "ذلك", "كيف", "ماذا",
]);

function meaningfulTokens(value: string) {
  return tokens(value).filter((token) => !SEARCH_STOP_WORDS.has(token));
}

function searchableTokenSet(value: string) {
  return new Set(normalizeForSearch(value).split(" ").filter((token) => token.length >= 3));
}

export function isTekTekContextualQuestion(question: string) {
  const normalized = normalizeForSearch(question);
  return meaningfulTokens(question).length < 2
    || /\b(this|that|it|these|those|here|topic|concept)\b/.test(normalized)
    || /\b(ce|cet|cette|cela|ca|ça|ici|sujet|notion)\b/.test(normalized)
    || /\b(هذا|هذه|ذلك|الموضوع|المفهوم)\b/.test(normalized);
}

export function isTekTekExplorationQuestion(question: string) {
  const normalized = normalizeForSearch(question);
  return /\b(where|which).*(further|more|deeper|elsewhere)\b/.test(normalized)
    || /\b(ou|où|quel|quelle).*(approfond|davantage|plus|ailleurs)\b/.test(normalized)
    || /\b(approfond|explor).*(ailleurs|plus|davantage)\b/.test(normalized)
    || /(أين|أي).*(أكثر|بعمق|لاحقا)/.test(normalized);
}

export function isTekTekScreenExplanationQuestion(question: string) {
  const normalized = normalizeForSearch(question);
  return /\b(explain|summarize|summarise).*(this|current).*(screen|page|activity|lesson|sequence)\b/.test(normalized)
    || /\b(explique|resum|résum).*(cet|cette|ecran|écran|page|activite|activité|lecon|leçon|sequence|séquence)\b/.test(normalized)
    || /(اشرح|لخص).*(الشاشة|الصفحة|النشاط|الدرس|التسلسل)/.test(normalized);
}

function selectContextTokens(context: string, sources: TekTekSource[], requireReuse: boolean) {
  const candidates = meaningfulTokens(context);
  const documentFrequency = new Map<string, number>();
  for (const token of candidates) {
    const count = sources.reduce((sum, source) => sum + (normalizeForSearch(`${source.title} ${source.text}`).includes(token) ? 1 : 0), 0);
    documentFrequency.set(token, count);
  }
  return candidates
    .filter((token) => (documentFrequency.get(token) || 0) >= (requireReuse ? 2 : 1))
    .sort((left, right) => {
      const leftFrequency = documentFrequency.get(left) || 0;
      const rightFrequency = documentFrequency.get(right) || 0;
      return leftFrequency - rightFrequency || right.length - left.length;
    })
    .slice(0, 10);
}

function safeBlockText(block: CourseRecord, language: string) {
  const values: string[] = [];
  const keys = ["title", "heading", "description", "body", "content", "contentLeft", "contentRight", "script", "transcript", "prompt", "instructions", "question", "statement", "task", "learningObjective"];
  for (const key of keys) {
    const value = block[key];
    if (typeof value === "string") values.push(value);
    else if (value && typeof value === "object" && !Array.isArray(value)) values.push(textFor(value as Localized, language));
  }
  return compactText(values.filter(Boolean).join("\n"));
}

function readTrainingIndex(): TekTekTraining[] {
  const parsed = JSON.parse(fs.readFileSync(trainingIndexPath, "utf8")) as { certifications?: TekTekTraining[] };
  return Array.isArray(parsed.certifications) ? parsed.certifications : [];
}

function readCourse(courseId: string): CourseRecord | null {
  const filePath = path.resolve(coursesDirectory, `${courseId}.json`);
  if (!filePath.startsWith(coursesDirectory) || !fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as CourseRecord;
  } catch {
    return null;
  }
}

function trainingVersion(training: TekTekTraining) {
  const files = [trainingIndexPath, ...(training.courses || []).map((courseId) => path.resolve(coursesDirectory, `${courseId}.json`))];
  return files.map((filePath) => {
    try {
      return `${filePath}:${fs.statSync(filePath).mtimeMs}`;
    } catch {
      return `${filePath}:missing`;
    }
  }).join("|");
}

function sourceId(courseId: string, lessonIndex: number, chapterIndex: number, blockId: string | null, suffix: string) {
  return `${courseId}:${lessonIndex}:${chapterIndex}:${blockId || "block"}:${suffix}`;
}

function splitTranscript(value: string, maxLength = 850) {
  const sentences = value.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (!sentence) continue;
    if (current && current.length + sentence.length + 1 > maxLength) {
      chunks.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function timeFromSegment(segment: Record<string, unknown>) {
  const raw = segment.time ?? segment.start ?? segment.startSeconds ?? segment.timestamp;
  const numeric = Number(raw);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : null;
}

function buildSources(training: TekTekTraining, language = "fr") {
  const sources: TekTekSource[] = [];
  for (const courseId of training.courses || []) {
    const course = readCourse(courseId);
    if (!course) continue;
    const lessons = Array.isArray(course.lessons) ? course.lessons as CourseRecord[] : [];
    lessons.forEach((lesson, lessonIndex) => {
      const chapters = Array.isArray(lesson.chapters) ? lesson.chapters as CourseRecord[] : [];
      chapters.forEach((chapter, chapterIndex) => {
        const chapterTitle = textFor(chapter.title as Localized, language) || textFor(lesson.title as Localized, language) || courseId;
        const blocks = Array.isArray(chapter.blocks) ? chapter.blocks as CourseRecord[] : [];
        blocks.forEach((block, blockIndex) => {
          const blockId = typeof block.id === "string" ? block.id : `block-${blockIndex}`;
          const type = typeof block.type === "string" ? block.type : "content";
          const isVideoSource = type === "video" || type === "transcript" || type === "video_transcript";
          const title = textFor(block.title as Localized, language) || chapterTitle;
          const baseText = safeBlockText(block, language);
          if (baseText) {
            sources.push({
              id: sourceId(courseId, lessonIndex, chapterIndex, blockId, "base"),
              certificationId: training.id,
              courseId,
              lessonIndex,
              chapterIndex,
              blockId,
              kind: isVideoSource ? "video" : "activity",
              assessment: /(quiz|choice|checkpoint|drag|exercise|assessment|exam)/i.test(type),
              title,
              text: baseText,
              timeSeconds: null,
            });
          }

          if (type === "transcript" || type === "video_transcript") {
            splitTranscript(baseText).forEach((text, transcriptIndex) => {
              sources.push({
                id: sourceId(courseId, lessonIndex, chapterIndex, blockId, `transcript-text-${transcriptIndex}`),
                certificationId: training.id,
                courseId,
                lessonIndex,
                chapterIndex,
                blockId,
                kind: "video",
                assessment: false,
                title,
                text,
                timeSeconds: null,
              });
            });
            return;
          }
          if (type !== "video") return;
          const transcript = textFor(block.transcript as Localized, language);
          splitTranscript(transcript).forEach((text, transcriptIndex) => {
            sources.push({
              id: sourceId(courseId, lessonIndex, chapterIndex, blockId, `transcript-text-${transcriptIndex}`),
              certificationId: training.id,
              courseId,
              lessonIndex,
              chapterIndex,
              blockId,
              kind: "video",
              assessment: false,
              title,
              text,
              timeSeconds: null,
            });
          });
          const transcriptSegments = Array.isArray(block.transcriptSegments) ? block.transcriptSegments as CourseRecord[] : [];
          transcriptSegments.forEach((segment, segmentIndex) => {
            const segmentText = compactText(segment.text || segment.script || segment.content || "");
            if (!segmentText) return;
            sources.push({
              id: sourceId(courseId, lessonIndex, chapterIndex, blockId, `transcript-${segmentIndex}`),
              certificationId: training.id,
              courseId,
              lessonIndex,
              chapterIndex,
              blockId,
              kind: "video",
              assessment: false,
              title,
              text: segmentText,
              timeSeconds: timeFromSegment(segment),
            });
          });

          const slides = Array.isArray(block.projectorSlides) ? block.projectorSlides as CourseRecord[] : [];
          slides.forEach((slide, slideIndex) => {
            const slideText = compactText([textFor(slide.title as Localized, language), slide.script, slide.content, slide.contentLeft, slide.contentRight].filter(Boolean).join("\n"));
            if (!slideText) return;
            sources.push({
              id: sourceId(courseId, lessonIndex, chapterIndex, blockId, `slide-${slideIndex}`),
              certificationId: training.id,
              courseId,
              lessonIndex,
              chapterIndex,
              blockId,
              kind: "video",
              assessment: false,
              title: textFor(slide.title as Localized, language) || title,
              text: slideText,
              timeSeconds: null,
            });
          });
        });
      });
    });
  }
  return sources;
}

export function getTekTekTraining(certificationId: string) {
  const training = readTrainingIndex().find((candidate) => candidate.id === certificationId);
  if (!training) return null;
  return training;
}

export function getTekTekTrainingSources(certificationId: string, language = "fr") {
  const training = getTekTekTraining(certificationId);
  if (!training) return null;
  const version = trainingVersion(training);
  const cached = cache.get(`${certificationId}:${language}`);
  if (cached?.version === version) return cached;
  const sources = buildSources(training, language);
  const result: CachedTraining = { training, sources, courseIds: new Set(training.courses || []), version };
  cache.set(`${certificationId}:${language}`, result);
  return result;
}

export function getTekTekBlockContext(input: { certificationId: string; courseId: string; lessonIndex: number; chapterIndex: number; blockId?: string | null; language?: string }) {
  const indexed = getTekTekTrainingSources(input.certificationId, input.language);
  if (!indexed || !indexed.courseIds.has(input.courseId)) return [];
  return indexed.sources.filter((source) =>
    source.courseId === input.courseId
    && source.lessonIndex === input.lessonIndex
    && source.chapterIndex === input.chapterIndex
    && (!input.blockId || source.blockId === input.blockId),
  );
}

export function searchTekTekSources(input: {
  certificationId: string;
  allowedCourseIds: string[];
  activeCourseId: string;
  lessonIndex: number;
  chapterIndex: number;
  blockId?: string | null;
  videoTimeSeconds?: number | null;
  question: string;
  contextText?: string;
  language?: string;
  limit?: number;
}) {
  const indexed = getTekTekTrainingSources(input.certificationId, input.language);
  if (!indexed) return [];
  const allowed = new Set(input.allowedCourseIds);
  const allowedSources = indexed.sources.filter((source) => allowed.has(source.courseId));
  const contextualQuestion = isTekTekContextualQuestion(input.question);
  const explorationQuestion = isTekTekExplorationQuestion(input.question);
  const screenExplanationQuestion = isTekTekScreenExplanationQuestion(input.question);
  const activeContext = allowedSources.filter((source) =>
    source.courseId === input.activeCourseId
    && source.lessonIndex === input.lessonIndex
    && source.chapterIndex === input.chapterIndex
    && (!input.blockId || source.blockId === input.blockId),
  );
  if (screenExplanationQuestion && activeContext.length > 0) {
    const limit = Math.min(Math.max(input.limit ?? 7, 1), 7);
    return [...activeContext]
      .sort((left, right) => {
        if (left.kind !== right.kind) return left.kind === "activity" ? -1 : 1;
        if (left.timeSeconds !== right.timeSeconds) return left.timeSeconds === null ? -1 : right.timeSeconds === null ? 1 : left.timeSeconds - right.timeSeconds;
        return left.id.localeCompare(right.id);
      })
      .slice(0, limit);
  }
  const derivedContext = [
    input.contextText || "",
    ...activeContext.slice(0, 6).map((source) => `${source.title} ${truncateSourceText(source.text, 420)}`),
  ].join(" ");
  const questionTokens = meaningfulTokens(input.question);
  const contextTokens = contextualQuestion ? selectContextTokens(derivedContext, allowedSources, explorationQuestion) : [];
  const scored = allowedSources
    .map((source) => {
      const searchable = searchableTokenSet(`${source.title} ${source.text}`);
      const questionMatches = questionTokens.reduce((sum, token) => sum + (searchable.has(token) ? 1 : 0), 0);
      const contextMatches = contextTokens.reduce((sum, token) => sum + (searchable.has(token) ? 1 : 0), 0);
      const minimumQuestionMatches = !contextualQuestion && questionTokens.length >= 2 ? 2 : 1;
      const questionScore = questionMatches >= minimumQuestionMatches ? questionMatches * 6 : 0;
      const contextScore = contextMatches * 3;
      if (questionScore <= 0 && contextScore <= 0) return { ...source, score: -1 };
      let score = questionScore + contextScore;
      const activeCourse = source.courseId === input.activeCourseId;
      const activeLesson = activeCourse && source.lessonIndex === input.lessonIndex;
      const activeChapter = activeLesson && source.chapterIndex === input.chapterIndex;
      if (activeCourse) score += explorationQuestion ? 1 : 5;
      if (activeLesson) score += explorationQuestion ? 1 : 4;
      if (activeChapter) score += explorationQuestion ? -8 : 5;
      else if (explorationQuestion) score += 7;
      if (input.blockId && source.blockId === input.blockId) score += explorationQuestion ? -4 : 10;
      if (input.videoTimeSeconds !== null && input.videoTimeSeconds !== undefined && source.timeSeconds !== null && Math.abs(source.timeSeconds - input.videoTimeSeconds) <= 45) score += 6;
      return { ...source, score };
    })
    .filter((source) => source.score > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0));
  const limit = Math.min(Math.max(input.limit ?? 7, 1), 7);
  if (!explorationQuestion) return scored.slice(0, limit);
  const outsideActiveChapter = scored.filter((source) => source.courseId !== input.activeCourseId || source.lessonIndex !== input.lessonIndex || source.chapterIndex !== input.chapterIndex);
  const insideActiveChapter = scored.filter((source) => source.courseId === input.activeCourseId && source.lessonIndex === input.lessonIndex && source.chapterIndex === input.chapterIndex);
  return [...outsideActiveChapter.slice(0, Math.max(limit - 1, 1)), ...insideActiveChapter.slice(0, 1)].slice(0, limit);
}

function truncateSourceText(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit)}…` : value;
}

export function clearTekTekIndexCache() {
  cache.clear();
}
