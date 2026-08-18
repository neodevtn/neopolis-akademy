import { describe, expect, it } from "vitest";
import { formatCommunicationBody, interpolateRecipientName, markdownToSafeEmailHtml } from "./communicationBody";

describe("communicationBody", () => {
  it("keeps structured rich Markdown while removing pasted active HTML", () => {
    const html = markdownToSafeEmailHtml("# Bonjour\n\n**Important**\n\n<script>alert(1)</script>");
    expect(html).toContain("<h1>Bonjour</h1>");
    expect(html).toContain("<strong>Important</strong>");
    expect(html).not.toContain("script");
  });

  it("sanitizes legacy HTML and safely interpolates every name placeholder", () => {
    const body = formatCommunicationBody('<p onclick="bad()">Bonjour {{name}}</p><script>alert(1)</script>');
    const output = interpolateRecipientName(body, '<Marie & Co>');
    expect(output).toContain("Bonjour &lt;Marie &amp; Co&gt;");
    expect(output).not.toContain("onclick");
    expect(output).not.toContain("script");
  });
});
