import { BLOCK_REGISTRY } from "./blockRegistry";

export type MediaKind = "youtube" | "video" | "audio" | "pdf" | "image" | "download" | "slides";

export interface MediaAsset {
  id: string;
  kind: MediaKind;
  url: string;
  title: string;
  usedBy: string[];
}

export interface ContentValidationIssue {
  severity: "error" | "warning";
  path: string;
  message: string;
}

export interface ContentValidationResult {
  valid: boolean;
  errors: ContentValidationIssue[];
  warnings: ContentValidationIssue[];
}

const knownBlockTypes = new Set(BLOCK_REGISTRY.map((definition) => definition.type));

export function cloneCourseDraft<T>(course: T): T {
  return JSON.parse(JSON.stringify(course)) as T;
}

export function resolveContentLabel(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const translated = value as { fr?: unknown; en?: unknown };
    if (typeof translated.fr === "string" && translated.fr.trim()) return translated.fr;
    if (typeof translated.en === "string" && translated.en.trim()) return translated.en;
  }
  return fallback;
}

function classifyUrl(key: string, url: string): MediaKind | null {
  const normalizedKey = key.toLowerCase();
  const normalizedUrl = url.toLowerCase();
  if (normalizedKey.includes("youtube") || /youtube\.com|youtu\.be/.test(normalizedUrl)) return "youtube";
  if ((normalizedKey === "videoid" || normalizedKey === "video_id") && /^[a-z0-9_-]{6,}$/i.test(url)) return "youtube";
  // Metadata such as `filename` and prose body text are not playable media references.
  if (["filename", "file_name", "title", "body", "content", "text", "alt", "caption", "description"].includes(normalizedKey)) return null;
  const isReferenceKey = /(?:url|uri|path|href|src|download|file|pdf|audio|video|image|slide)/.test(normalizedKey);
  const hasMediaExtension = /\.(mp4|webm|mov|mp3|wav|m4a|ogg|pdf|png|jpe?g|gif|webp|svg|zip|csv|xlsx?|ipynb)(\?|$)/.test(normalizedUrl);
  if (!isReferenceKey && !hasMediaExtension) return null;
  const hasUsableUrlShape = /^(?:https?:\/\/|\/api\/assets\/|\/manus-storage\/|\/data\/|data:)/.test(url.trim()) || hasMediaExtension;
  if (!hasUsableUrlShape) return null;
  if (normalizedKey.includes("audio") || /\.(mp3|wav|m4a|ogg)(\?|$)/.test(normalizedUrl)) return "audio";
  if (normalizedKey.includes("pdf") || /\.pdf(\?|$)/.test(normalizedUrl)) return "pdf";
  if (normalizedKey.includes("image") || /\.(png|jpe?g|gif|webp|svg)(\?|$)/.test(normalizedUrl)) return "image";
  if (normalizedKey.includes("download") || normalizedKey.includes("file")) return "download";
  if (normalizedKey.includes("slide")) return "slides";
  if (normalizedKey.includes("video") || normalizedKey.includes("mp4") || /\.(mp4|webm|mov)(\?|$)/.test(normalizedUrl)) return "video";
  return null;
}

/** Extracts reusable media references without moving or rewriting existing assets. */
export function collectMediaAssets(course: any): MediaAsset[] {
  const byKey = new Map<string, MediaAsset>();

  const register = (kind: MediaKind, url: string, title: string, usedBy: string) => {
    if (!url || typeof url !== "string") return;
    const id = `${kind}:${url}`;
    const current = byKey.get(id);
    if (current) {
      if (!current.usedBy.includes(usedBy)) current.usedBy.push(usedBy);
      return;
    }
    byKey.set(id, { id, kind, url, title, usedBy: [usedBy] });
  };

  const visit = (value: unknown, trail: string, title: string, visited = new WeakSet<object>()) => {
    if (!value || typeof value !== "object") return;
    if (visited.has(value as object)) return;
    visited.add(value as object);

    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${trail}[${index}]`, title, visited));
      return;
    }

    Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
      const kind = typeof child === "string" ? classifyUrl(key, child) : null;
      if (kind) register(kind, child as string, title, trail);
      visit(child, `${trail}.${key}`, title, visited);
    });
  };

  (course?.lessons || []).forEach((lesson: any, lessonIndex: number) => {
    (lesson?.recommendedVideos || []).forEach((video: any, videoIndex: number) => {
      if (typeof video?.videoId === "string" && /^[A-Za-z0-9_-]{6,}$/.test(video.videoId)) {
        register("youtube", `https://www.youtube.com/watch?v=${video.videoId}`, resolveContentLabel(video.title, `Recommandation ${videoIndex + 1}`), `lessons[${lessonIndex}].recommendedVideos[${videoIndex}]`);
      }
    });
    (lesson?.chapters || []).forEach((chapter: any, chapterIndex: number) => {
      const title = resolveContentLabel(chapter?.title, `Chapitre ${chapterIndex + 1}`);
      visit(chapter?.blocks || [], `lessons[${lessonIndex}].chapters[${chapterIndex}].blocks`, title);
    });
  });

  return Array.from(byKey.values()).sort((a, b) => a.title.localeCompare(b.title) || a.kind.localeCompare(b.kind));
}

/** Validates the minimum contract while intentionally preserving legacy block formats. */
export function validateStructuredCourse(course: any): ContentValidationResult {
  const errors: ContentValidationIssue[] = [];
  const warnings: ContentValidationIssue[] = [];

  if (!course || typeof course !== "object") {
    errors.push({ severity: "error", path: "course", message: "Le cours doit être un objet JSON." });
    return { valid: false, errors, warnings };
  }
  if (!course.courseId || typeof course.courseId !== "string") {
    errors.push({ severity: "error", path: "courseId", message: "Le cours doit avoir un identifiant courseId." });
  }
  if (!Array.isArray(course.lessons)) {
    errors.push({ severity: "error", path: "lessons", message: "Le cours doit contenir un tableau de leçons." });
    return { valid: false, errors, warnings };
  }

  const ids = new Set<string>();
  course.lessons.forEach((lesson: any, lessonIndex: number) => {
    if (lesson?.recommendedVideos !== undefined) {
      if (!Array.isArray(lesson.recommendedVideos)) {
        errors.push({ severity: "error", path: `lessons[${lessonIndex}].recommendedVideos`, message: "Les recommandations vidéo doivent être une liste." });
      } else {
        lesson.recommendedVideos.forEach((video: any, videoIndex: number) => {
          const path = `lessons[${lessonIndex}].recommendedVideos[${videoIndex}]`;
          if (!/^[A-Za-z0-9_-]{6,}$/.test(video?.videoId || "")) errors.push({ severity: "error", path: `${path}.videoId`, message: "La recommandation doit contenir un identifiant YouTube valide." });
          if (!video?.title || typeof video.title !== "string") errors.push({ severity: "error", path: `${path}.title`, message: "La recommandation doit avoir un titre." });
          if (!video?.channel || typeof video.channel !== "string") errors.push({ severity: "error", path: `${path}.channel`, message: "La recommandation doit indiquer sa chaîne." });
          if (!["tutorial", "deep_dive", "complementary", "masterclass"].includes(video?.type)) errors.push({ severity: "error", path: `${path}.type`, message: "Le format de recommandation est invalide." });
          if (!Array.isArray(video?.topics)) errors.push({ severity: "error", path: `${path}.topics`, message: "Les thèmes de recommandation doivent être une liste." });
        });
      }
    }
    if (!Array.isArray(lesson?.chapters)) {
      errors.push({ severity: "error", path: `lessons[${lessonIndex}].chapters`, message: "Chaque leçon doit contenir un tableau de chapitres." });
      return;
    }
    lesson.chapters.forEach((chapter: any, chapterIndex: number) => {
      const chapterPath = `lessons[${lessonIndex}].chapters[${chapterIndex}]`;
      if (chapter?.id) {
        if (ids.has(chapter.id)) errors.push({ severity: "error", path: `${chapterPath}.id`, message: `ID de chapitre dupliqué : ${chapter.id}.` });
        ids.add(chapter.id);
      }
      if (chapter?.blocks && !Array.isArray(chapter.blocks)) {
        errors.push({ severity: "error", path: `${chapterPath}.blocks`, message: "Les blocs du chapitre doivent être un tableau." });
        return;
      }
      (chapter?.blocks || []).forEach((block: any, blockIndex: number) => {
        const blockPath = `${chapterPath}.blocks[${blockIndex}]`;
        if (!block?.type || typeof block.type !== "string") {
          errors.push({ severity: "error", path: `${blockPath}.type`, message: "Chaque bloc doit préciser son type." });
        } else if (!knownBlockTypes.has(block.type)) {
          warnings.push({ severity: "warning", path: `${blockPath}.type`, message: `Type historique conservé sans formulaire dédié : ${block.type}.` });
        }
        if (block?.type === "checkpoint" && !block.exerciseId) {
          warnings.push({ severity: "warning", path: blockPath, message: "Checkpoint sans exerciseId associé." });
        }
      });
    });
  });

  return { valid: errors.length === 0, errors, warnings };
}
