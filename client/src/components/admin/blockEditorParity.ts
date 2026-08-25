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
};

const INTERNAL_BLOCK_KEYS = new Set(["type", "id", "label", "source_page", "order", "mediaUnavailable", "optionalMediaUnavailable"]);
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
    .filter(([key, value]) => !declared.has(key) && !INTERNAL_BLOCK_KEYS.has(key) && value !== undefined && value !== null && value !== "")
    .map(([key, value]) => ({
      key,
      label: KNOWN_LABELS[key] || { en: humanize(key), fr: humanize(key) },
      type: inferType(key, value),
      helpText: { en: "Runtime field preserved from the learner rendering.", fr: "Champ runtime conservé depuis le rendu apprenant." },
    }));
}

export function getEditorFields(block: Record<string, unknown>, declaredFields: EditableField[] = []): EditableField[] {
  return [...declaredFields, ...getRuntimeEditorFields(block, declaredFields)];
}

export function hydrateBlockForEditor(block: Record<string, any>, declaredFields: EditableField[] = []): Record<string, any> {
  const hydrated = { ...block };
  if (!hydrated.url) hydrated.url = hydrated.watchUrl || hydrated.embedUrl || (hydrated.videoId ? `https://www.youtube.com/watch?v=${hydrated.videoId}` : "");
  for (const field of declaredFields) {
    if (hydrated[field.key] === undefined && field.defaultValue !== undefined) {
      hydrated[field.key] = typeof field.defaultValue === "object" ? structuredClone(field.defaultValue) : field.defaultValue;
    }
  }
  return hydrated;
}

export function isMediaEditorField(key: string): boolean {
  return /(?:^|_)(?:url|file|asset)(?:$|_)/i.test(key) || /(Url|Pdf|Slides|subtitle|audio|video|media)/i.test(key);
}
