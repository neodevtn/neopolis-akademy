import * as React from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CatalogOperationsConsole } from "./CatalogOperationsConsole";

describe("CatalogOperationsConsole — accès aux visuels de formation", () => {
  it("affiche un point d’entrée explicite et une action par formation", () => {
    vi.stubGlobal("React", React);
    const html = renderToStaticMarkup(createElement(CatalogOperationsConsole, {
      catalogMode: true,
      courses: [{ courseId: "course_01", title: "Cours de démonstration", lessonsCount: 1, exercisesCount: 0, sectionsCount: 1 }],
      certifications: [{ id: "formation_01", title: { fr: "Formation de démonstration" }, courses: ["course_01"] }],
      onOpenCourse: vi.fn(),
      onOpenCatalogSettings: vi.fn(),
      onSetLifecycle: vi.fn(),
    }));

    expect(html).toContain("Carte et Open Graph");
    expect(html).toContain("Choisissez une formation puis définissez ses deux visuels depuis la bibliothèque média.");
    expect(html.match(/Gérer les visuels/g)).toHaveLength(2);
    expect(html).toContain("Formations et visuels");
  });
});
