export function normalizeCodeForValidation(value: unknown): string {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

export function matchesCanonicalSolution(submitted: unknown, solution: unknown): boolean {
  const normalizedSolution = normalizeCodeForValidation(solution);
  return normalizedSolution.length > 0 && normalizeCodeForValidation(submitted) === normalizedSolution;
}
