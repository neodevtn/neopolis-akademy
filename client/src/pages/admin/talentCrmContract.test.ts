import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(process.cwd());

describe("Talent CRM interface contract", () => {
  it("keeps the admin portfolio searchable, paginated and actionable", () => {
    const source = readFileSync(resolve(root, "client/src/pages/AdminTalentCRM.tsx"), "utf8");
    expect(source).toContain('placeholder="Rechercher un nom, une adresse ou un intitulé"');
    expect(source).toContain("Page {page} / {totalPages}");
    expect(source).toContain("Convoquer");
    expect(source).toContain("Évaluer");
    expect(source).toContain("Affecter");
    expect(source).toContain("Créer une tâche");
    expect(source).toContain('<TabsTrigger value="learning">Formation</TabsTrigger>');
    expect(source).toContain("Progression engagée");
    expect(source).toContain('firstExamPassRate == null ? "—"');
    expect(source).toContain("item.title");
    expect(source).toContain("item.completedLessons > 0");
  });

  it("exposes only the learner journey actions intended for the member", () => {
    const source = readFileSync(resolve(root, "client/src/components/TalentJourneyTab.tsx"), "utf8");
    expect(source).toContain("Accepter");
    expect(source).toContain("Replanifier");
    expect(source).toContain("Refuser");
    expect(source).not.toContain("privateNotes");
  });

  it("registers both admin and learner navigation entries", () => {
    const adminNav = readFileSync(resolve(root, "client/src/components/AdminNavbar.tsx"), "utf8");
    const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
    const learnerNav = readFileSync(resolve(root, "client/src/lib/learnerDashboardNavigation.ts"), "utf8");
    expect(adminNav).toContain('href: "/admin/talents"');
    expect(app).toContain('<Route path={"/admin/talents"} component={AdminTalentCRM} />');
    expect(learnerNav).toContain('"evolution"');
  });

  it("keeps stage management in its dedicated tab and removes the desktop content gutter", () => {
    const source = readFileSync(resolve(root, "client/src/pages/AdminTalentCRM.tsx"), "utf8");
    expect(source).toContain('<TabsTrigger value="stages">Étapes du parcours</TabsTrigger>');
    expect(source).toContain('className="px-4 py-8 lg:px-0"');
    expect(source).not.toContain("Configurer les étapes");
  });
});
