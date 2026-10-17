/* Generated from the protected Architect Foundations exercise corrections.
 * This server-only registry must never be included in learner course payloads. */

export type ArchitectFoundationsCorrection = {
  correction?: unknown;
  rubric?: unknown;
  sampleAnswer?: unknown;
  correctOptionIds?: string[];
};

export const ARCHITECT_FOUNDATIONS_SECURE_CORRECTIONS: Record<string, Record<string, ArchitectFoundationsCorrection>> = {
  "claude_certified_architect_foundations__01": {
    "ex_ai_fluency_certificate_completion": {
      "correction": {
        "en": "**Correct answer: b.** It combines Discernment (checking the result against the goal and evidence) with Diligence (accountability and transparent attribution). **a** treats generated text as self-validating. **c** removes the human judgment that remains necessary for responsible delegation. **d** weakens Description because useful AI collaboration depends on relevant context and constraints.",
        "fr": "**Bonne réponse : b.** Elle associe le Discernment (vérifier le résultat au regard de l’objectif et des éléments probants) et la Diligence (responsabilité et attribution transparente). **a** traite un texte généré comme auto-validant. **c** retire le jugement humain nécessaire à une délégation responsable. **d** affaiblit la Description, car une collaboration utile avec l’IA dépend d’un contexte et de contraintes pertinents."
      },
      "correctOptionIds": [
        "b"
      ]
    }
  }
};
