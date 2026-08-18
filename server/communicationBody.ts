import { Marked } from "marked";

const safeMarked = new Marked({ async: false, gfm: true });
safeMarked.use({ renderer: { html: () => "" } });

const FORBIDDEN_TAGS = /<\s*\/?\s*(?:script|style|iframe|object|embed|form|input|button|svg|math|base|meta|link)[^>]*>/gi;
const EVENT_HANDLER_ATTRIBUTES = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const UNSAFE_URLS = /\s+(?:href|src)\s*=\s*(?:"\s*(?:javascript|data):[^"]*"|'\s*(?:javascript|data):[^']*'|(?:javascript|data):[^\s>]+)/gi;

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Restrains legacy HTML to email-safe structural markup and removes active content. */
export function sanitizeCommunicationHtml(html: string) {
  return String(html || "")
    .replace(/<\s*(?:script|style|iframe|object|embed|form|input|button|svg|math)[^>]*>[\s\S]*?<\s*\/\s*(?:script|style|iframe|object|embed|form|input|button|svg|math)\s*>/gi, "")
    .replace(FORBIDDEN_TAGS, "")
    .replace(EVENT_HANDLER_ATTRIBUTES, "")
    .replace(UNSAFE_URLS, "");
}

/** Converts rich editor Markdown into safe HTML ready for an email client. */
export function markdownToSafeEmailHtml(markdown: string) {
  return sanitizeCommunicationHtml(String(safeMarked.parse(markdown || "")));
}

export function formatCommunicationBody(body: string, format: "markdown" | "html" = "html") {
  const html = format === "markdown" ? markdownToSafeEmailHtml(body) : sanitizeCommunicationHtml(body);
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1f36;font-size:16px;line-height:1.6">${html}</div>`;
}

export function interpolateRecipientName(html: string, name: string | null | undefined) {
  return html.replace(/\{\{name\}\}/g, escapeHtml(name || ""));
}
