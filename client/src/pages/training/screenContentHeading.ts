export interface ExplicitScreenHeading {
  title: string;
  content: string;
}

/**
 * A learner screen may use a real Markdown heading as its title. Plain prose must
 * never be promoted to a display heading: doing so turns the first paragraph into
 * oversized decorative text and silently removes it from the learning content.
 */
export function extractExplicitScreenHeading(content: string): ExplicitScreenHeading {
  const lines = content.split("\n");
  const firstNonEmptyIndex = lines.findIndex((line) => line.trim().length > 0);
  if (firstNonEmptyIndex < 0) return { title: "", content };

  const candidate = lines[firstNonEmptyIndex].trim();
  const markdownHeading = candidate.match(/^#{1,6}\s+(.+?)\s*$/);
  const boldOnlyHeading = candidate.match(/^\*\*(.+?)\*\*$/);
  const title = (markdownHeading?.[1] || boldOnlyHeading?.[1] || "").trim();

  if (!title) return { title: "", content };

  lines.splice(firstNonEmptyIndex, 1);
  return { title, content: lines.join("\n") };
}

export function localizedBlockText(value: unknown, lang: string): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const text = value as Record<string, unknown>;
    return String(text[lang] || text.fr || text.en || "");
  }
  return "";
}
