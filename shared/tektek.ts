export const TEKTEK_NAME = "TekTek";
export const TEKTEK_MAX_QUESTION_LENGTH = 1000;
export const TEKTEK_MAX_RESPONSE_LENGTH = 1800;
export const TEKTEK_MAX_SOURCES = 7;
export const TEKTEK_HOURLY_REQUEST_LIMIT = 12;

export type TekTekLanguage = "fr" | "en" | "ar";
export type TekTekSourceKind = "activity" | "video" | "resource";

export type TekTekSource = {
  id: string;
  certificationId: string;
  courseId: string;
  lessonIndex: number;
  chapterIndex: number;
  blockId: string | null;
  kind: TekTekSourceKind;
  assessment: boolean;
  title: string;
  text: string;
  timeSeconds: number | null;
  score?: number;
};

export type TekTekCitation = Pick<TekTekSource, "id" | "certificationId" | "courseId" | "lessonIndex" | "chapterIndex" | "blockId" | "kind" | "title" | "timeSeconds">;

export type TekTekVisibleMessage = {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  citations: TekTekCitation[];
  createdAt: Date;
};

const LABELS = {
  fr: {
    noSource: "Je ne trouve pas de réponse suffisamment étayée dans cette formation. Essayez de préciser la notion, la leçon ou la vidéo concernée.",
    assessment: "Je peux expliquer la notion et vous guider vers les passages utiles, mais je ne peux pas fournir une réponse prête à soumettre pour une activité d’évaluation avant votre tentative.",
    course: "Cours",
    lesson: "Leçon",
    activity: "Activité",
    video: "Vidéo",
  },
  en: {
    noSource: "I cannot find a sufficiently supported answer in this training programme. Please specify the concept, lesson, or video involved.",
    assessment: "I can explain the concept and guide you to the relevant passages, but I cannot provide a ready-to-submit answer for an assessment activity before your attempt.",
    course: "Course",
    lesson: "Lesson",
    activity: "Activity",
    video: "Video",
  },
  ar: {
    noSource: "لا أجد إجابة مدعومة بما يكفي داخل هذا المسار التدريبي. يرجى تحديد المفهوم أو الدرس أو الفيديو المعني.",
    assessment: "يمكنني شرح المفهوم وإرشادك إلى المقاطع المفيدة، لكن لا يمكنني تقديم إجابة جاهزة للتسليم في نشاط تقييمي قبل محاولتك.",
    course: "الدورة",
    lesson: "الدرس",
    activity: "النشاط",
    video: "الفيديو",
  },
} as const;

export function normalizeTekTekLanguage(value: string | undefined): TekTekLanguage {
  return value === "en" || value === "ar" ? value : "fr";
}

export function tektekLabel(language: TekTekLanguage, key: keyof typeof LABELS.fr) {
  return LABELS[language][key];
}

export function formatTekTekCitation(citation: TekTekCitation, language: TekTekLanguage) {
  const labels = LABELS[language];
  const time = citation.timeSeconds === null ? "" : ` · ${Math.floor(citation.timeSeconds / 60).toString().padStart(2, "0")}:${Math.floor(citation.timeSeconds % 60).toString().padStart(2, "0")}`;
  const kind = citation.kind === "video" ? labels.video : labels.activity;
  return `${labels.course} ${citation.courseId} · ${labels.lesson} ${citation.lessonIndex + 1} · ${kind}${time}`;
}

export function isLikelyAssessmentQuestion(question: string) {
  return /(bonne\s+(réponse|option)|donne(?:-moi)?\s+la\s+réponse|answer\s+for\s+(this|the)\s+(quiz|question)|correct\s+(answer|option)|réponds?\s+à\s+(ma|la)\s+place|soumettre|submit)/i.test(question);
}
