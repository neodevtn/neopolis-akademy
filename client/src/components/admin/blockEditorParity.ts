export type EditableField = {
  key: string;
  label: { en: string; fr: string };
  type: string;
  required?: boolean;
  placeholder?: string;
  helpText?: { en: string; fr: string };
  options?: Array<{ value: string; label: string }>;
  arrayItemSchema?: EditableField[];
  defaultValue?: any;
  editorGroup?: "advanced" | "media_details";
};

const INTERNAL_BLOCK_KEYS = new Set(["type", "id", "label", "source_page", "order", "mediaUnavailable", "optionalMediaUnavailable"]);
const VIDEO_LEGACY_SOURCE_KEYS = new Set(["url", "videoId", "watchUrl", "embedUrl", "mp4Url", "hlsUrl", "audioUrl"]);
const KNOWN_LABELS: Record<string, { en: string; fr: string }> = {
  videoId: { en: "YouTube video ID", fr: "Identifiant vidéo YouTube" },
  watchUrl: { en: "Watch URL", fr: "URL de consultation" },
  embedUrl: { en: "Embed URL", fr: "URL intégrée" },
  hlsUrl: { en: "HLS stream URL", fr: "URL du flux HLS" },
  audioUrl: { en: "Audio URL", fr: "URL audio" },
  slidesPdf: { en: "Slides PDF", fr: "PDF des slides" },
  projectorSlides: { en: "Projector slides", fr: "Slides Projector" },
  projectorTimings: { en: "Slide timings", fr: "Synchronisation des slides" },
  projectorDuration: { en: "Projector duration", fr: "Durée Projector" },
  subtitleUrlEn: { en: "English subtitles", fr: "Sous-titres anglais" },
  subtitleUrlFr: { en: "French subtitles", fr: "Sous-titres français" },
  transcriptSegments: { en: "Transcript segments", fr: "Segments de transcription" },
  referencedFiles: { en: "Referenced files", fr: "Fichiers référencés" },
  resources: { en: "Resources", fr: "Ressources" },
  hint: { en: "Hint", fr: "Indice" },
  hints: { en: "Hints", fr: "Indices" },
  feedback: { en: "Feedback", fr: "Feedback" },
  feedbacks: { en: "Answer feedback", fr: "Feedback des réponses" },
  successMessage: { en: "Success message", fr: "Message de réussite" },
  image: { en: "Illustration", fr: "Illustration" },
  assetMeta: { en: "Media provenance", fr: "Provenance du média" },
  exercise_type: { en: "Exercise type", fr: "Type d’exercice" },
  questions: { en: "Questions", fr: "Questions" },
  duration: { en: "Duration", fr: "Durée" },
  unitNumber: { en: "Unit number", fr: "Numéro d’unité" },
  toolMode: { en: "Tool mode", fr: "Mode d’outil" },
  suggestedQuestions: { en: "Suggested questions", fr: "Questions suggérées" },
  scenario: { en: "Scenario", fr: "Scénario" },
  layout: { en: "Layout", fr: "Disposition" },
  nodes: { en: "Visual nodes", fr: "Nœuds visuels" },
  optional: { en: "Optional activity", fr: "Activité facultative" },
  projectorTimingUnit: { en: "Projector timing unit", fr: "Unité de synchronisation Projector" },
};

const RUNTIME_FIELD_OVERRIDES: Record<string, Partial<EditableField>> = {
  hint: { type: "i18n_textarea" },
  feedback: { type: "i18n_textarea" },
  successMessage: { type: "i18n_text" },
  feedbacks: { type: "json" },
  hints: { type: "json" },
  image: { type: "json", editorGroup: "media_details" },
  assetMeta: { type: "json", editorGroup: "media_details" },
  referencedFiles: { type: "json", editorGroup: "media_details" },
  exercise_type: { type: "text" },
  questions: { type: "json" },
  duration: { type: "text" },
  unitNumber: { type: "number" },
  prompt: { type: "i18n_textarea" },
  suggestedQuestions: { type: "json" },
  toolMode: { type: "select", options: [{ value: "assistant", label: "Assistant" }, { value: "notes", label: "Notes" }, { value: "tools", label: "Outils" }] },
  scenario: { type: "i18n_textarea" },
  layout: { type: "select", options: [{ value: "timeline", label: "Timeline" }, { value: "flow", label: "Flux" }, { value: "grid", label: "Grille" }, { value: "stack", label: "Empilé" }] },
  nodes: { type: "json" },
  optional: { type: "boolean" },
  projectorTimingUnit: { type: "select", options: [{ value: "seconds", label: "Secondes" }, { value: "milliseconds", label: "Millisecondes" }] },
  asset_path: { type: "text", editorGroup: "advanced" },
  sha256: { type: "text", editorGroup: "advanced" },
  sourceScreenId: { type: "text", editorGroup: "advanced" },
  sourceEvidence: { type: "json", editorGroup: "advanced" },
  sourceSummary: { type: "i18n_textarea", editorGroup: "advanced" },
  source_refs: { type: "json", editorGroup: "advanced" },
  sourceClaims: { type: "json", editorGroup: "advanced" },
  evaluationPrompt: { type: "i18n_textarea", editorGroup: "advanced" },
  evaluationCriteria: { type: "json", editorGroup: "advanced" },
  learnerCriteria: { type: "json", editorGroup: "advanced" },
  rubricCriteria: { type: "json", editorGroup: "advanced" },
  rubricVersion: { type: "text", editorGroup: "advanced" },
  serverGradedAssessment: { type: "text", editorGroup: "advanced" },
  practiceStatus: { type: "text", editorGroup: "advanced" },
  requiredBeforeAdvance: { type: "boolean", editorGroup: "advanced" },
  workflowUploadRequired: { type: "boolean", editorGroup: "advanced" },
  xp: { type: "number", editorGroup: "advanced" },
  courseId: { type: "text", editorGroup: "advanced" },
};

function humanize(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/^./, (value) => value.toUpperCase());
}

function isI18n(value: unknown): value is Record<string, string> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && (typeof (value as any).en === "string" || typeof (value as any).fr === "string");
}

function inferType(key: string, value: unknown): string {
  if (isI18n(value)) return "i18n_textarea";
  if (Array.isArray(value) || (value !== null && typeof value === "object")) return "json";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (/transcript|instructions|hint|prompt|solution|description|feedback|assignment|steps|body/i.test(key)) return "textarea";
  return "text";
}

export function getRuntimeEditorFields(block: Record<string, unknown>, declaredFields: EditableField[] = []): EditableField[] {
  const declared = new Set(declaredFields.map((field) => field.key));
  return Object.entries(block)
    .filter(([key, value]) => !declared.has(key) && !INTERNAL_BLOCK_KEYS.has(key) && !(block.type === "video" && VIDEO_LEGACY_SOURCE_KEYS.has(key)) && value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const override = RUNTIME_FIELD_OVERRIDES[key];
      return {
      key,
        label: override?.label || KNOWN_LABELS[key] || { en: humanize(key), fr: humanize(key) },
        type: override?.type || inferType(key, value),
        options: override?.options,
        editorGroup: override?.editorGroup,
        helpText: { en: "Content attribute preserved from the learner rendering.", fr: "Attribut de contenu préservé depuis le rendu apprenant." },
      };
    });
}

export function getEditorFields(block: Record<string, unknown>, declaredFields: EditableField[] = []): EditableField[] {
  return [...declaredFields, ...getRuntimeEditorFields(block, declaredFields)];
}

export function hydrateBlockForEditor(block: Record<string, any>, declaredFields: EditableField[] = []): Record<string, any> {
  const hydrated = { ...block };
  if (hydrated.type === "video") {
    const source = canonicalVideoSource(hydrated);
    hydrated.sourceType = source.type;
    hydrated.sourceUrl = source.url;
  } else if (!hydrated.url) {
    hydrated.url = hydrated.watchUrl || hydrated.embedUrl || (hydrated.videoId ? `https://www.youtube.com/watch?v=${hydrated.videoId}` : "");
  }
  for (const field of declaredFields) {
    if (hydrated[field.key] === undefined && field.defaultValue !== undefined) {
      hydrated[field.key] = typeof field.defaultValue === "object" ? structuredClone(field.defaultValue) : field.defaultValue;
    }
  }
  return hydrated;
}

type LocalizedSourceValue = string | { en: string; fr: string };

function asLocalizedSourceValue(value: unknown): LocalizedSourceValue {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const locales = value as Record<string, unknown>;
    const en = typeof locales.en === "string" ? locales.en.trim() : "";
    const fr = typeof locales.fr === "string" ? locales.fr.trim() : "";
    if (en || fr) return { en: en || fr, fr: fr || en };
  }
  return typeof value === "string" ? value.trim() : "";
}

function hasSourceValue(value: LocalizedSourceValue) {
  return typeof value === "string" ? Boolean(value) : Boolean(value.en || value.fr);
}

function sourceValueFromYouTubeId(value: unknown): LocalizedSourceValue {
  const localized = asLocalizedSourceValue(value);
  const toUrl = (id: string) => id ? `https://www.youtube.com/watch?v=${id}` : "";
  return typeof localized === "string"
    ? toUrl(localized)
    : { en: toUrl(localized.en), fr: toUrl(localized.fr) };
}

function canonicalVideoSource(block: Record<string, any>): { type: string; url: LocalizedSourceValue } {
  const savedType = typeof block.sourceType === "string" ? block.sourceType : "";
  const savedUrl = asLocalizedSourceValue(block.sourceUrl);
  if (hasSourceValue(savedUrl) && ["youtube", "video", "hls", "audio"].includes(savedType)) return { type: savedType, url: savedUrl };
  if (typeof block.mp4Url === "string" && block.mp4Url.trim()) return { type: "video", url: block.mp4Url.trim() };
  if (typeof block.hlsUrl === "string" && block.hlsUrl.trim()) return { type: "hls", url: block.hlsUrl.trim() };
  if (typeof block.audioUrl === "string" && block.audioUrl.trim()) return { type: "audio", url: block.audioUrl.trim() };
  const youtubeUrl = [block.url, block.watchUrl, block.embedUrl].map(asLocalizedSourceValue).find(hasSourceValue);
  if (youtubeUrl) return { type: "youtube", url: youtubeUrl };
  const youtubeId = sourceValueFromYouTubeId(block.videoId);
  if (hasSourceValue(youtubeId)) return { type: "youtube", url: youtubeId };
  return { type: "youtube", url: "" };
}

function youtubeUrlFromInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const id = youtubeIdFromUrl(trimmed);
  if (id) return `https://www.youtube.com/watch?v=${id}`;
  return /^[A-Za-z0-9_-]{6,}$/.test(trimmed) ? `https://www.youtube.com/watch?v=${trimmed}` : trimmed;
}

function youtubeIdFromUrl(value: string) {
  const match = value.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&#/\s]+)/i);
  return match?.[1] || (/^[A-Za-z0-9_-]{6,}$/.test(value.trim()) ? value.trim() : "");
}

function normalizedYoutubeSource(value: unknown): LocalizedSourceValue {
  const localized = asLocalizedSourceValue(value);
  return typeof localized === "string"
    ? youtubeUrlFromInput(localized)
    : { en: youtubeUrlFromInput(localized.en), fr: youtubeUrlFromInput(localized.fr) };
}

function youtubeIdSource(value: LocalizedSourceValue): LocalizedSourceValue {
  return typeof value === "string"
    ? youtubeIdFromUrl(value)
    : { en: youtubeIdFromUrl(value.en), fr: youtubeIdFromUrl(value.fr) };
}

function primarySourceValue(value: unknown) {
  const localized = asLocalizedSourceValue(value);
  return typeof localized === "string" ? localized : localized.en || localized.fr;
}

/** Converts the editor-only source pair back to the renderer's backward-compatible fields. */
export function prepareBlockForSave(block: Record<string, any>): Record<string, any> {
  if (block.type !== "video") return block;
  const { sourceType, sourceUrl, ...saved } = block;
  const type = typeof sourceType === "string" ? sourceType : "youtube";
  const url = primarySourceValue(sourceUrl);
  const projectorAudio = Array.isArray(saved.projectorSlides) && saved.projectorSlides.length > 0 && typeof saved.audioUrl === "string" ? saved.audioUrl : "";
  if (type === "video") return { ...saved, url: "", watchUrl: "", embedUrl: "", videoId: "", mp4Url: url, hlsUrl: "", audioUrl: projectorAudio };
  if (type === "hls") return { ...saved, url: "", watchUrl: "", embedUrl: "", videoId: "", mp4Url: "", hlsUrl: url, audioUrl: "" };
  if (type === "audio") return { ...saved, url: "", watchUrl: "", embedUrl: "", videoId: "", mp4Url: "", hlsUrl: "", audioUrl: url };
  const youtubeSource = normalizedYoutubeSource(sourceUrl);
  return { ...saved, url: youtubeSource, watchUrl: youtubeSource, embedUrl: "", videoId: youtubeIdSource(youtubeSource), mp4Url: "", hlsUrl: "", audioUrl: "" };
}

export function isMediaEditorField(key: string): boolean {
  return /(?:^|_)(?:url|file|asset|image|illustration)(?:$|_)/i.test(key) || /(Url|Pdf|Slides|subtitle|audio|video|media|image|illustration)/i.test(key);
}
