import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { renderInlineFormatting } from "@/pages/training/PageContent";

describe("Cloud exercise learner criteria", () => {
  it("renders Markdown emphasis without exposing raw delimiters", () => {
    const html = renderToStaticMarkup(
      React.createElement(React.Fragment, null, renderInlineFormatting("**Form Trigger** connecté à `Edit Fields`")),
    );

    expect(html).toMatch(/<strong[^>]*>Form Trigger<\/strong>/);
    expect(html).toContain("<code");
    expect(html).not.toContain("**");
  });
});
