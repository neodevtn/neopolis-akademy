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
  submissionGuidance?: {
    mode: "prompt" | "artifact" | "mixed" | "evidence";
    title: string;
    introduction: string;
    instruction: string;
    placeholder: string;
    criteria: string[];
  };
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
  if (isLikelySubmissionClarificationQuestion(question)) return false;
  const frenchOrEnglish = /(bonne\s+(réponse|option)|donne(?:-moi)?\s+la\s+réponse|réponse\s+(?:toute\s+)?prête\s+à\s+(?:copier|coller|soumettre)|answer\s+for\s+(this|the)\s+(quiz|question)|correct\s+(answer|option)|ready[- ]to[- ]submit\s+answer|réponds?\s+à\s+(ma|la)\s+place|fais\s+(?:le|l['’])(?:exercice|activité)\s+à\s+ma\s+place)/i.test(question);
  const arabic = /(?:أعطني|اعطني|اكتب|أنجز|انجز).{0,35}(?:الإجابة\s+الصحيحة|جواباً\s+جاهزاً|جوابا\s+جاهزا|التمرين\s+مكاني|النشاط\s+مكاني)/i.test(question);
  return frenchOrEnglish || arabic;
}

/** Asking what evidence or format to submit is legitimate coaching, not answer fishing. */
export function isLikelySubmissionClarificationQuestion(question: string) {
  const frenchOrEnglish = /(que|quoi|qu['’]est-ce que|quel(?:le)?|comment|où).{0,45}(soumettre|remettre|coller|écrire|rédiger|répondre)|(?:soumettre|remettre|coller).{0,45}(quoi|quel(?:le)?|comment|format|preuve|élément)|what.{0,45}(submit|paste|write|provide)|how.{0,45}(submit|format|answer)|submission.{0,30}(format|evidence|instructions)|preuve\s+de\s+réalisation|proof\s+of\s+completion/i.test(question);
  const arabic = /(?:ماذا|ما\s+الذي|كيف|أي).{0,45}(?:أسلّم|اسلم|أقدّم|اقدم|ألصق|الصق|أكتب|اكتب)|(?:التسليم|الدليل|الإثبات|التنسيق).{0,30}(?:المطلوب|كيف|ماذا|ما)/i.test(question);
  return frenchOrEnglish || arabic;
}
