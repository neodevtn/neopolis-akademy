import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Code2, Heading1, Heading2, Heading3, Italic, Link2, List, ListOrdered,
  Quote, Redo2, Undo2, Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { markdownToEditorHtml, tiptapDocumentToMarkdown } from "./wysiwygMarkdown";

interface WysiwygMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function ToolbarButton({ label, active = false, onClick, children }: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className="h-8 min-w-8 px-1.5"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

/**
 * A real ProseMirror/Tiptap editor. It stores sanitized Markdown rather than
 * arbitrary HTML so existing course JSON and the learner renderer stay compatible.
 */
export function WysiwygMarkdownEditor({ value, onChange, placeholder = "Rédigez le contenu…", minHeight = "220px" }: WysiwygMarkdownEditorProps) {
  const onChangeRef = useRef(onChange);
  const lastMarkdownRef = useRef(value);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
      }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: markdownToEditorHtml(value),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none px-4 py-3 outline-none text-foreground focus:outline-none",
        style: `min-height:${minHeight}`,
      },
    },
    onUpdate: ({ editor: nextEditor }) => {
      const markdown = tiptapDocumentToMarkdown(nextEditor.getJSON());
      lastMarkdownRef.current = markdown;
      onChangeRef.current(markdown);
    },
  });

  useEffect(() => {
    if (!editor || editor.isFocused || value === lastMarkdownRef.current) return;
    editor.commands.setContent(markdownToEditorHtml(value), { emitUpdate: false });
    lastMarkdownRef.current = value;
  }, [editor, value]);

  if (!editor) return <div className="min-h-[220px] animate-pulse rounded-md border bg-muted/30" />;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Adresse du lien", previousUrl || "https://");
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-1.5" role="toolbar" aria-label="Outils de mise en forme">
        <ToolbarButton label="Titre niveau 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Titre niveau 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Titre niveau 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></ToolbarButton>
        <span className="mx-1 h-5 border-l" />
        <ToolbarButton label="Gras" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Italique" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Code en ligne" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Code2 className="h-4 w-4" /></ToolbarButton>
        <span className="mx-1 h-5 border-l" />
        <ToolbarButton label="Liste à puces" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Liste numérotée" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Citation" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Bloc de code" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 className="h-4 w-4" /></ToolbarButton>
        <span className="mx-1 h-5 border-l" />
        <ToolbarButton label="Ajouter ou modifier un lien" active={editor.isActive("link")} onClick={setLink}><Link2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Retirer le lien" onClick={() => editor.chain().focus().unsetLink().run()}><Unlink className="h-4 w-4" /></ToolbarButton>
        <span className="mx-1 h-5 border-l" />
        <ToolbarButton label="Annuler" onClick={() => editor.chain().focus().undo().run()}><Undo2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Rétablir" onClick={() => editor.chain().focus().redo().run()}><Redo2 className="h-4 w-4" /></ToolbarButton>
        <span className="ml-auto px-2 text-[10px] text-muted-foreground">WYSIWYG structuré · Markdown compatible</span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
