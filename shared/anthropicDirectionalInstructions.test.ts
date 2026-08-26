import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function courseText(courseId: string) {
  return readFileSync(resolve("client/public/data/courses", `${courseId}.json`), "utf8");
}

describe("normalisation des consignes Anthropic sans dépendance gauche/droite", () => {
  it("normalise le tri de couches Architect Professional sans modifier son objectif", () => {
    const content = courseText("claude_certified_architect_professional__01");
    expect(content).toContain("Place each statement in the layer it belongs to.");
    expect(content).toContain("Placez chaque énoncé dans la couche à laquelle il appartient.");
    expect(content).not.toContain("For each statement on the left, drop it into the correct layer on the right.");
    expect(content).not.toContain("Pour chaque énoncé à gauche, déposez-le dans la couche correcte à droite.");
  });

  it("normalise le tri de décisions Developer Foundations sans dépendance gauche/droite", () => {
    const content = courseText("claude_certified_developer_foundations__02");
    expect(content).toContain("Place each task in the most appropriate decision category");
    expect(content).toContain("Placez chaque tâche dans la catégorie de décision la plus appropriée");
    expect(content).not.toContain("Drag each task on the left into the best decision category on the right");
    expect(content).not.toContain("Glissez chaque tâche à gauche vers la catégorie de décision à droite");
  });
});
