import type { CSSProperties, ReactNode } from "react";
import DOMPurify from "dompurify";
import { getBlockDef } from "@shared/blockRegistry";
import { blockAppearanceFromData, resolveLearningTheme, type LearningTheme } from "@shared/learningDesign";

const SAFE_CSS_PROPERTIES = new Set([
  "background", "background-color", "background-image", "border", "border-color", "border-radius", "border-width",
  "box-shadow", "color", "column-gap", "display", "font", "font-family", "font-size", "font-weight", "gap",
  "grid-template-columns", "justify-content", "align-items", "letter-spacing", "line-height", "margin", "margin-top",
  "margin-right", "margin-bottom", "margin-left", "max-width", "min-width", "min-height", "opacity", "padding",
  "padding-top", "padding-right", "padding-bottom", "padding-left", "text-align", "text-decoration", "text-transform",
  "width", "word-break", "overflow-wrap",
]);

function scopedCss(raw: unknown, scope: string): string {
  if (typeof raw !== "string" || !raw.trim() || raw.length > 8000) return "";
  if (/@|url\(|expression\(|javascript:|behavior:|-moz-binding|<|>/i.test(raw)) return "";
  return raw.split("}").map((rule) => {
    const [selectors, declarations] = rule.split("{");
    if (!selectors || !declarations) return "";
    const safeDeclarations = declarations.split(";").map((declaration) => {
      const separator = declaration.indexOf(":");
      if (separator < 1) return "";
      const property = declaration.slice(0, separator).trim().toLowerCase();
      const value = declaration.slice(separator + 1).trim();
      return SAFE_CSS_PROPERTIES.has(property) && !/!important/i.test(value) ? `${property}: ${value}` : "";
    }).filter(Boolean).join(";");
    if (!safeDeclarations) return "";
    const safeSelectors = selectors.split(",").map((selector) => `${scope} ${selector.trim().replace(/^(html|body|:root)\b/, "")}`.trim()).join(", ");
    return `${safeSelectors}{${safeDeclarations}}`;
  }).filter(Boolean).join("\n");
}

function localText(value: unknown, lang: string) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(record[lang] || record.fr || record.en || "");
  }
  return "";
}

export function BlockCustomizationFrame({ block, lang, theme, children }: { block: Record<string, any>; lang: string; theme?: LearningTheme | string | null; children: ReactNode }) {
  const resolvedTheme = resolveLearningTheme(theme);
  const appearance = blockAppearanceFromData(block);
  const scope = `block-${String(block.id || block.type || "learning").replace(/[^a-z0-9_-]/gi, "").slice(0, 48)}`;
  const definition = getBlockDef(String(block.type));
  const canReplace = definition?.category !== "interactive" && definition?.category !== "exercise" && definition?.category !== "assessment";
  const mode = block.overrideMode === "replace" && canReplace ? "replace" : block.overrideMode === "append" ? "append" : "none";
  const sanitizedHtml = DOMPurify.sanitize(localText(block.customHtml, lang), {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "code", "pre", "a", "table", "thead", "tbody", "tr", "th", "td", "span", "div", "hr"],
    ALLOWED_ATTR: ["href", "target", "rel", "title", "aria-label"],
  });
  const style: CSSProperties = {
    "--course-primary": resolvedTheme.palette.primary,
    "--course-secondary": resolvedTheme.palette.secondary,
    "--course-accent": resolvedTheme.palette.accent,
    "--course-surface": resolvedTheme.palette.surface,
    "--course-surface-muted": resolvedTheme.palette.surfaceMuted,
    "--course-foreground": resolvedTheme.palette.foreground,
    "--block-tone": appearance.tone || "brand",
    "--block-variant": appearance.variant || "soft",
    "--block-accent": appearance.accent || "blue",
    "--block-density": appearance.density || resolvedTheme.density,
  } as CSSProperties;
  const css = scopedCss(block.customCss, `.${scope}`);
  const html = sanitizedHtml ? <div className="block-advanced-html prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} /> : null;

  return <section data-block-type={block.type} data-block-theme={resolvedTheme.id} className={`${scope} course-block-frame w-full min-w-0 max-w-full`} style={style}>
    {css && <style>{css}</style>}
    {mode === "replace" && html ? html : children}
    {mode === "append" && html}
  </section>;
}
