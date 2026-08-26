import { describe, expect, it } from "vitest";
import { buildCourseAssistantMessages, extractCourseAssistantText, isClearlyOutOfScopeCourseAssistantQuestion, outOfScopeCourseAssistantReply } from "./courseAssistant";

const input = {
  courseId: "automatisation_comptable_ia__01",
  lessonTitle: "L’intelligence artificielle appliquée à la finance",
  screenTitle: "Erreurs à éviter",
  context: "Explique-moi comment préparer un contrôle humain pour usage responsable de l’IA.",
  question: "ouvre le robinet et laisse couler l’eau",
};

describe("assistant pédagogique contextuel", () => {
  it("détecte une demande manifestement hors périmètre sans la remplacer par le contexte suggéré", () => {
    expect(isClearlyOutOfScopeCourseAssistantQuestion(input.question)).toBe(true);
    expect(outOfScopeCourseAssistantReply(input)).toContain("ne concerne pas l’écran");
    expect(outOfScopeCourseAssistantReply(input)).not.toContain("contrôle humain pour usage responsable");
  });

  it("sépare explicitement la requête de l’apprenant du contexte pédagogique", () => {
    const messages = buildCourseAssistantMessages({ ...input, question: "Comment vérifier une suggestion IA ?" });
    expect(messages[0].content).toContain("Répondez uniquement à la question effectivement saisie");
    expect(messages[1].content).toContain("Question réellement saisie par l’apprenant : Comment vérifier une suggestion IA ?");
    expect(messages[1].content).toContain("Contexte pédagogique de référence");
  });

  it("accepte les réponses multiparties de l’adaptateur de modèle", () => {
    expect(extractCourseAssistantText([{ type: "text", text: "Première partie." }, { type: "text", text: "Seconde partie." }])).toBe("Première partie.\nSeconde partie.");
    expect(extractCourseAssistantText(" Réponse simple ")).toBe("Réponse simple");
  });
});
