import { useEffect, useRef } from "react";
import { Bold, Code2, Italic, List, RemoveFormatting, TextQuote, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WysiwygMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Renders only a small, safe Markdown subset inside the editable surface. */
function markdownToEditorHtml(value: string): string {
  const html = escapeHtml(value || "")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  return html.split(/\n{2,}/).map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>") || "<br>"}</p>`).join("");
}

function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const element = node as HTMLElement;
  const content = Array.from(element.childNodes).map(nodeToMarkdown).join("");
  switch (element.tagName.toLowerCase()) {
    case "strong": case "b": return `**${content}**`;
    case "em": case "i": return `*${content}*`;
    case "code": return `\`${content}\``;
    case "h1": return `# ${content}\n\n`;
    case "h2": return `## ${content}\n\n`;
    case "h3": return `### ${content}\n\n`;
    case "li": return `- ${content}\n`;
    case "ul": case "ol": return `${content}\n`;
    case "blockquote": return `> ${content}\n\n`;
    case "div": case "p": return `${content}\n\n`;
    case "br": return "\n";
    default: return content;
  }
}

function editorHtmlToMarkdown(editor: HTMLElement): string {
  return Array.from(editor.childNodes).map(nodeToMarkdown).join("").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Limited visual editor that persists Markdown, not arbitrary HTML.
 * It intentionally strips attributes/scripts by serialising only recognised tags.
 */
export function WysiwygMarkdownEditor({ value, onChange, placeholder, minHeight = "180px" }: WysiwygMarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValue = useRef(value);
  const initialized = useRef(false);

  useEffect(() => {
    if (editorRef.current && (!initialized.current || (document.activeElement !== editorRef.current && lastValue.current !== value))) {
      editorRef.current.innerHTML = markdownToEditorHtml(value);
      lastValue.current = value;
      initialized.current = true;
    }
  }, [value]);

  const applyCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    if (editorRef.current) {
      const nextValue = editorHtmlToMarkdown(editorRef.current);
      lastValue.current = nextValue;
      onChange(nextValue);
    }
  };

  return (
    <div className="overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
      <div className="flex flex-wrap gap-1 border-b bg-muted/40 p-1.5">
        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" title="Gras" onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand("bold")}><Bold className="h-3.5 w-3.5" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" title="Italique" onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand("italic")}><Italic className="h-3.5 w-3.5" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" title="Titre" onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand("formatBlock", "h2")}><Type className="h-3.5 w-3.5" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" title="Liste" onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand("insertUnorderedList")}><List className="h-3.5 w-3.5" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" title="Citation" onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand("formatBlock", "blockquote")}><TextQuote className="h-3.5 w-3.5" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" title="Effacer la mise en forme" onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand("removeFormat")}><RemoveFormatting className="h-3.5 w-3.5" /></Button>
        <span className="ml-auto flex items-center gap-1 px-2 text-[10px] text-muted-foreground"><Code2 className="h-3 w-3" /> Markdown sécurisé</span>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        className="prose prose-sm max-w-none p-3 outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
        style={{ minHeight }}
        onPaste={(event) => {
          event.preventDefault();
          document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
        }}
        onInput={(event) => {
          const nextValue = editorHtmlToMarkdown(event.currentTarget);
          lastValue.current = nextValue;
          onChange(nextValue);
        }}
      />
    </div>
  );
}
