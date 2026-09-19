import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TekTekCourseCta } from "./TekTekCourseCta";

describe("TekTekCourseCta", () => {
  it.each([
    ["fr", "Demander l’assistance de TekTek"],
    ["en", "Ask TekTek for help"],
    ["ar", "اطلب مساعدة TekTek"],
  ])("expose un libellé accessible en %s", (lang, label) => {
    const html = renderToStaticMarkup(createElement(TekTekCourseCta, { lang, placement: "header" }));
    expect(html).toContain(`aria-label="${label}"`);
    expect(html).toContain(`title="${label}"`);
  });

  it("présente TekTek sans promettre de réaliser l’évaluation", () => {
    const html = renderToStaticMarkup(createElement(TekTekCourseCta, { lang: "fr", placement: "introduction" }));
    expect(html).toContain("clarifier une consigne");
    expect(html).toContain("sans faire l’évaluation à votre place");
  });
});
