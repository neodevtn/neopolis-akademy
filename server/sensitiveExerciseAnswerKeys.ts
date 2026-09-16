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
  },
};

export function getSensitiveExerciseAnswerKey(courseId: string, exerciseId: string): SensitiveExerciseAnswerKey | null {
  return sensitiveExerciseAnswerKeys[courseId]?.[exerciseId] ?? null;
}
