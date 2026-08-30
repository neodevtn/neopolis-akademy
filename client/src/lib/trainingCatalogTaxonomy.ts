export type LocalizedLabel = { fr: string; en: string };

export type TrainingFormatDefinition = {
  id: string;
  title: LocalizedLabel;
  order: number;
};

type TrainingFormatReference = {
  group?: string;
  trainingFormat?: string;
  isStandaloneTP?: boolean;
};

type TargetJobReference = {
  targetJob?: unknown;
};

export const DEFAULT_TRAINING_FORMATS: TrainingFormatDefinition[] = [
  { id: "certification_preparation", title: { fr: "Préparation aux certifications", en: "Certification preparation" }, order: 1 },
  { id: "formation", title: { fr: "Formation", en: "Course" }, order: 2 },
  { id: "tutorial_tp", title: { fr: "Tutoriel / TP", en: "Tutorial / practical exercise" }, order: 3 },
];

export function getTrainingFormatDefinitions(value: unknown): TrainingFormatDefinition[] {
  if (!Array.isArray(value)) return DEFAULT_TRAINING_FORMATS;
  const formats = value.filter((item): item is TrainingFormatDefinition => Boolean(
    item
      && typeof item === "object"
      && typeof (item as TrainingFormatDefinition).id === "string"
      && typeof (item as TrainingFormatDefinition).title?.fr === "string"
      && typeof (item as TrainingFormatDefinition).title?.en === "string"
      && typeof (item as TrainingFormatDefinition).order === "number",
  ));
  return formats.length ? formats.slice().sort((a, b) => a.order - b.order) : DEFAULT_TRAINING_FORMATS;
}

export function resolveTrainingFormat(certification: TrainingFormatReference): string {
  if (certification.trainingFormat) return certification.trainingFormat;
  if (certification.isStandaloneTP) return "tutorial_tp";
  if (certification.group === "anthropic_certification_preparation") return "certification_preparation";
  return "formation";
}

export function extractTargetJobRoles(courses: TargetJobReference[]): string[] {
  return Array.from(new Set(
    courses
      .flatMap((course) => typeof course.targetJob === "string" ? course.targetJob.split(",") : [])
      .map((role) => role.trim())
      .filter(Boolean),
  )).sort((a, b) => a.localeCompare(b, "fr"));
}
