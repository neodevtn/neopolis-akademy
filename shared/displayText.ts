/**
 * Préserve les contenus stockés tout en rendant lisibles les séquences
 * littérales \"\\n\" présentes dans certaines consignes importées.
 * Cette normalisation est réservée aux textes descriptifs, jamais au code.
 */
export function normalizeInstructionText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
}
