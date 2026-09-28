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
    if (!['bucket_sort', 'matching', 'ordering'].includes(block?.type || '')) return [];
    if (typeof block.id === "string" && block.id.trim()) return [block.id];
    if (block.type === "matching") return [`matching_${blockIndex}`];
    if (block.type === "ordering") return [`ordering_${blockIndex}`];
    return [`bucket_${blockIndex}`];
  });
}
