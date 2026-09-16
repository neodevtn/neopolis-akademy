export type MatchingGateBlock = {
  id?: string;
  type?: string;
};

/**
 * Identifiants des interactions de tri ou d’association qui doivent être
 * terminées avant la navigation suivante. Les identifiants de secours sont
 * alignés sur ceux employés par leurs composants de rendu standards.
 */
export function getRequiredMatchingInteractionIds(blocks: MatchingGateBlock[] = []): string[] {
  return blocks.flatMap((block, blockIndex) => {
    if (block?.type !== "bucket_sort" && block?.type !== "matching") return [];
    if (typeof block.id === "string" && block.id.trim()) return [block.id];
    return [block.type === "matching" ? `matching_${blockIndex}` : `bucket_${blockIndex}`];
  });
}
