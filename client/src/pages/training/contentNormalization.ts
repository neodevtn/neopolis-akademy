/**
 * Normalise les artefacts historiques visibles dans les contenus de formation.
 * Les données canoniques restent intactes ; la normalisation garantit que le
 * rendu ne dépend jamais d'une position visuelle qui varie selon l'écran.
 */
export function normalizeCourseContent(content: string, lang: string): string {
  let normalized = content.replace(
    /StrategyWhat it doesWhen to applyWhat continuity you lose/g,
    lang === "fr" ? "Comparaison des stratégies de gestion du contexte" : "Context-management strategy comparison",
  );

  if (lang === "fr") {
    return normalized
      .replace(/^Pruning$/gm, "Élagage du contexte")
      .replace(/^Clearing \(/gm, "Réinitialisation de session (")
      .replace(/^Subagent Handoffs$/gm, "Relais vers des sous-agents")
      .replace(/^Subagent handoffs :/gmi, "Relais vers des sous-agents :")
      .replace(/sur la gauche/gi, "dans les options proposées")
      .replace(/sur la droite/gi, "dans les options proposées")
      .replace(/à gauche/gi, "dans les options proposées")
      .replace(/à droite/gi, "dans les options proposées");
  }

  return normalized
    .replace(/\bon the left\b/gi, "in the available options")
    .replace(/\bon the right\b/gi, "in the available options")
    .replace(/\bto the left\b/gi, "in the available options")
    .replace(/\bto the right\b/gi, "in the available options");
}
