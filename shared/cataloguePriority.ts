export type CataloguePriorityInput = {
  id?: string;
  title?: unknown;
  description?: unknown;
  level?: unknown;
  totalActivities?: unknown;
  metrics?: { totalActivities?: unknown };
};

const text = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>)
    .filter((item): item is string => typeof item === "string")
    .join(" ");
  return "";
};

const normalized = (value: unknown) => text(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();

const activityCount = (item: CataloguePriorityInput) => {
  const raw = Number(item.totalActivities ?? item.metrics?.totalActivities ?? 0);
  return Number.isFinite(raw) && raw > 0 ? raw : Number.MAX_SAFE_INTEGER;
};

/**
 * Catalogue order requested by Neopolis: accessible beginner paths first,
 * then finance / Excel relevance, then short entries, and finally longer or
 * technically complex pathways. A matching training is not hidden: it is
 * only given a stable, transparent order.
 */
export function cataloguePriorityTier(item: CataloguePriorityInput): number {
  const level = normalized(item.level);
  const corpus = normalized(`${item.id || ""} ${text(item.title)} ${text(item.description)}`);
  const beginner = /\b(debutant|beginner|initiation|foundation|fondation|introduction)\b/.test(level) || /\b(debutant|beginner|initiation|foundation|fondation)\b/.test(corpus);
  const financeOrExcel = /\b(finance|financier|financial|comptabilite|accounting|controle de gestion|budget|finops|excel|spreadsheet|reporting financier)\b/.test(corpus);
  if (beginner) return 0;
  if (financeOrExcel) return 1;
  if (activityCount(item) <= 15) return 2;
  return 3;
}

function complexityRank(item: CataloguePriorityInput): number {
  const level = normalized(item.level);
  if (/\b(advanced|avance|expert)\b/.test(level)) return 2;
  if (/\b(intermediate|intermediaire)\b/.test(level)) return 1;
  return 0;
}

export function compareCataloguePriority<T extends CataloguePriorityInput>(left: T, right: T): number {
  const tierDelta = cataloguePriorityTier(left) - cataloguePriorityTier(right);
  if (tierDelta) return tierDelta;
  const complexityDelta = complexityRank(left) - complexityRank(right);
  if (complexityDelta) return complexityDelta;
  const durationDelta = activityCount(left) - activityCount(right);
  if (durationDelta) return durationDelta;
  return normalized(left.title).localeCompare(normalized(right.title), "fr");
}
