export function parseMarkdownHeading(line: string): { level: number; text: string } | null {
  const match = line.match(/^(#{1,6})\s+(.+)$/);
  return match ? { level: match[1].length, text: match[2] } : null;
}
