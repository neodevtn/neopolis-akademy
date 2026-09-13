/**
 * Normalise les artefacts historiques visibles dans les contenus de formation.
 * Les données canoniques restent intactes ; la normalisation garantit que le
 * rendu ne dépend jamais d'une position visuelle qui varie selon l'écran.
 */
export function normalizeCourseContent(content: string, lang: string): string {
  let normalized = content
    .replace(
      /StrategyWhat it doesWhen to applyWhat continuity you lose/g,
      lang === "fr" ? "Comparaison des stratégies de gestion du contexte" : "Context-management strategy comparison",
    )
    // Marqueurs d’import qui ne portent aucun contenu pédagogique autonome.
    .replace(/^[ \t]*\((?:Illustrative Scenario|Scénario illustratif)\)[ \t]*$/gim, "")
    .replace(/^[ \t]*>>\s*\[(?:music|musique)\]\s*>>[ \t]*$/gim, "")
    .replace(/\$\{expls\}/g, "")
    // Une instruction de composant brute n’apporte rien lorsque les cartes sont déjà rendues.
    .replace(
      /^[ \t]*(?:Flip each card(?: to see what it controls)?|Retournez chaque carte(?: pour voir ce qu'elle contrôle)?)[ \t]*$/gim,
      lang === "fr" ? "Consultez les cartes ci-dessous pour le détail." : "Explore the cards below for the details.",
    )
    .replace(
      /^[ \t]*(?:Toggle to compare(?:.*)?|Basculer pour comparer(?:.*)?)[ \t]*$/gim,
      lang === "fr" ? "Comparez les deux versions ci-dessous." : "Compare the two versions below.",
    );

  if (lang === "fr") {
    normalized = normalized
      .replace(/^Pruning$/gm, "Élagage du contexte")
      .replace(/^Clearing \(/gm, "Réinitialisation de session (")
      .replace(/^Subagent Handoffs$/gm, "Relais vers des sous-agents")
      .replace(/^Subagent handoffs :/gmi, "Relais vers des sous-agents :")
      .replace(/sur la gauche/gi, "dans les options proposées")
      .replace(/sur la droite/gi, "dans les options proposées")
      .replace(/à gauche/gi, "dans les options proposées")
      .replace(/à droite/gi, "dans les options proposées");
  } else {
    normalized = normalized
      .replace(/\bon the left\b/gi, "in the available options")
      .replace(/\bon the right\b/gi, "in the available options")
      .replace(/\bto the left\b/gi, "in the available options")
      .replace(/\bto the right\b/gi, "in the available options");
  }

  return normalized.replace(/\n{3,}/g, "\n\n").trim();
}
