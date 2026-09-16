type LocalizedText = { en?: string; fr?: string };

export type SensitiveExerciseAnswerKey = {
  correctAnswer: string;
  explanation?: string | LocalizedText;
};

const sensitiveExerciseAnswerKeys: Record<string, Record<string, SensitiveExerciseAnswerKey>> = {
  claude_certified_developer_foundations__03: {
    checkpoint4_fix_plugin_definition: {
      correctAnswer: "b",
      explanation: {
        en: "The defect is the author-specific absolute path. It exists only on the author’s machine, so a teammate who installs the plugin will not have that location. Because `validate.sh` is bundled inside the plugin, reference it relative to `${CLAUDE_PLUGIN_ROOT}`, which points to the plugin’s bundled files.",
        fr: "Le défaut est le chemin absolu propre à l’auteur. Il n’existe que sur sa machine ; un collègue qui installe le plugin n’aura donc pas cet emplacement. Comme `validate.sh` est fourni avec le plugin, il faut le référencer à partir de `${CLAUDE_PLUGIN_ROOT}`, qui pointe vers les fichiers inclus dans le plugin.",
      },
    },
    checkpoint_s17_enterprise_integration: {
      correctAnswer: "b",
      explanation: {
        en: "The 401 means the key is rejected and must be rotated. The plaintext key in a known file is also a secret-handling failure. The targeted fix rotates the key, moves the value into a CI-injected environment variable, and updates MCP configuration to reference that variable.",
        fr: "Un code 401 indique que la clé est rejetée et doit être renouvelée. La clé en texte brut dans un fichier connu constitue aussi un défaut de gestion des secrets. La correction ciblée renouvelle la clé, déplace sa valeur vers une variable d’environnement injectée par la CI et met à jour la configuration MCP pour faire référence à cette variable.",
      },
    },
  },
};

export function getSensitiveExerciseAnswerKey(courseId: string, exerciseId: string): SensitiveExerciseAnswerKey | null {
  return sensitiveExerciseAnswerKeys[courseId]?.[exerciseId] ?? null;
}
