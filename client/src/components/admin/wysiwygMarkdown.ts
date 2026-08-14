import { Marked } from "marked";

const safeMarked = new Marked({ async: false, gfm: true });
safeMarked.use({ renderer: { html: () => "" } });

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
