export function normalizeMetricText(value) {
  return String(value ?? "").toLocaleLowerCase("fr-FR").replace(/\s+/g, " ").trim();
}
