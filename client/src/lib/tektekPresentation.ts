export type TekTekInlineSegment = {
  emphasis: boolean;
  text: string;
};

/** Removes provider citation control characters; navigable course citations are rendered separately. */
export function stripTekTekInternalCitations(value: string) {
  return value
    .replace(/\uE200cite\uE202[\s\S]*?\uE201/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Converts the small Markdown subset requested from TekTek into data suitable
 * for React rendering. It deliberately does not parse or render HTML.
 */
export function splitTekTekInlineMarkdown(value: string): TekTekInlineSegment[] {
  const segments: TekTekInlineSegment[] = [];
  const expression = /\*\*([^*]+)\*\*/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = expression.exec(value)) !== null) {
    if (match.index > cursor) segments.push({ emphasis: false, text: value.slice(cursor, match.index) });
    if (match[1]) segments.push({ emphasis: true, text: match[1] });
    cursor = expression.lastIndex;
  }

  if (cursor < value.length || segments.length === 0) segments.push({ emphasis: false, text: value.slice(cursor) });
  return segments.filter((segment) => segment.text.length > 0);
}

export function parseTekTekAnswerLines(value: string) {
  return stripTekTekInternalCitations(value).split(/\r?\n/).map((line) => {
    const bullet = /^\s*(?:[-*])\s+(.+)$/.exec(line);
    return {
      bullet: Boolean(bullet),
      segments: splitTekTekInlineMarkdown(bullet?.[1] ?? line),
    };
  });
}
