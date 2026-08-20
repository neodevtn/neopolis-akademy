import { Marked } from "marked";

const safeMarked = new Marked({ async: false, gfm: true });
safeMarked.use({ renderer: { html: () => "" } });

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

/** Converts sanitized legacy HTML bodies into the Markdown contract used by the editor. */
export function normalizeEditableMarkdown(value: string): string {
  const source = String(value || "").trim();
  if (!/<\/?[a-z][^>]*>/i.test(source)) return source;

  return decodeHtmlEntities(source)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, "**$2**")
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, "*$2*")
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n")
    .replace(/<\/?(?:ul|ol)[^>]*>/gi, "\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function markdownToEditorHtml(markdown: string): string {
  return String(safeMarked.parse(markdown || ""));
}

function escapeMarkdown(value: string) {
  return value.replace(/([\\`*_[\]<>])/g, "\\$1");
}

function withMarks(text: string, marks: any[] = []): string {
  return marks.reduce((content, mark) => {
    if (mark.type === "bold") return `**${content}**`;
    if (mark.type === "italic") return `*${content}*`;
    if (mark.type === "code") return `\`${content}\``;
    if (mark.type === "link" && mark.attrs?.href) return `[${content}](${mark.attrs.href})`;
    return content;
  }, text);
}

function renderChildren(node: any): string {
  return (node.content || []).map((child: any, index: number) => tiptapDocumentToMarkdown(child, index)).join("");
}

export function tiptapDocumentToMarkdown(node: any, index = 0): string {
  if (!node) return "";
  if (node.type === "text") return withMarks(escapeMarkdown(node.text || ""), node.marks);

  const content = renderChildren(node);
  switch (node.type) {
    case "doc": return content.replace(/\n{3,}/g, "\n\n").trim();
    case "paragraph": return `${content}\n\n`;
    case "heading": return `${"#".repeat(Math.min(Math.max(node.attrs?.level || 2, 1), 3))} ${content}\n\n`;
    case "bulletList": return content.trimEnd() + "\n\n";
    case "orderedList": {
      return (node.content || []).map((child: any, itemIndex: number) => {
        const item = renderChildren(child).trim().replace(/\n/g, "\n   ");
        return `${itemIndex + 1}. ${item}\n`;
      }).join("") + "\n";
    }
    case "listItem": return `- ${content.trim().replace(/\n/g, "\n  ")}\n`;
    case "blockquote": return content.trim().split("\n").map((line: string) => `> ${line}`).join("\n") + "\n\n";
    case "codeBlock": return `\`\`\`${node.attrs?.language || ""}\n${content}\n\`\`\`\n\n`;
    case "hardBreak": return "\n";
    case "horizontalRule": return "---\n\n";
    default: return content;
  }
}
