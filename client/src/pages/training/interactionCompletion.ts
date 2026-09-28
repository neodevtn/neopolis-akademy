export type InteractionBlockLike = {
  id?: string;
  type?: string;
  cards?: unknown[];
};

export function scopedInteractionKey(
  lessonIndex: number,
  chapterIndex: number,
  interactionId: string,
): string {
  return `${lessonIndex}:${chapterIndex}:${interactionId}`;
}

export function isScopedInteractionComplete(
  completed: Set<string>,
  lessonIndex: number,
  chapterIndex: number,
  interactionId: string,
  options: { allowUnscopedServerId?: boolean } = {},
): boolean {
  return completed.has(scopedInteractionKey(lessonIndex, chapterIndex, interactionId))
    || (options.allowUnscopedServerId === true && completed.has(interactionId));
}

export function currentScopedCompletions(
  completed: Set<string>,
  lessonIndex: number,
  chapterIndex: number,
  options: { includeUnscopedServerIds?: boolean } = {},
): Set<string> {
  const prefix = `${lessonIndex}:${chapterIndex}:`;
  const visible = new Set<string>();
  completed.forEach((key) => {
    if (key.startsWith(prefix)) visible.add(key.slice(prefix.length));
    else if (options.includeUnscopedServerIds === true && !/^\d+:\d+:/.test(key)) visible.add(key);
  });
  return visible;
}

export function requiredFlipCardCompletionKeys(
  blocks: InteractionBlockLike[] = [],
  lessonIndex: number,
  chapterIndex: number,
): string[] {
  return blocks
    .map((block, blockIndex) => ({ block, blockIndex }))
    .filter(({ block }) => block.type === "flip_cards" && (block.cards || []).length > 0)
    .map(({ block, blockIndex }) => scopedInteractionKey(
      lessonIndex,
      chapterIndex,
      String(block.id || `flip_cards_${blockIndex}`),
    ));
}
