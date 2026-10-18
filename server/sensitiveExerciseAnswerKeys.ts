import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { getCourseDataDirectories, isValidCourseDataId } from "./courseDataRoute";
import { CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS } from "./claudeScienceV2Assessments";

type LocalizedText = { en?: string; fr?: string };

export type SensitiveExerciseAnswerKey = {
  correctAnswer: string;
  explanation?: string | LocalizedText;
};

const sensitiveExerciseAnswerKeys: Record<string, Record<string, SensitiveExerciseAnswerKey>> = {
  claude_science_01_fondamentaux: Object.fromEntries(Object.entries(CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS)
    .filter(([exerciseId]) => exerciseId.startsWith("claude_science_01_fondamentaux_"))
    .map(([exerciseId, answer]) => [exerciseId, answer])),
  claude_science_02_pratique: Object.fromEntries(Object.entries(CLAUDE_SCIENCE_V2_CHECKPOINT_KEYS)
    .filter(([exerciseId]) => exerciseId.startsWith("claude_science_02_pratique_"))
    .map(([exerciseId, answer]) => [exerciseId, answer])),
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
  claude_certified_developer_foundations__05: {
    skilljar_s07b_q1: {
      correctAnswer: "b",
      explanation: {
        en: "The agent producing a summary that a human approves before it is stored is a functional requirement. “The agent should be fast and accurate” is not checkable. An approved cloud provider and EU-only transcript handling are infrastructure requirements, not functional ones.",
        fr: "Le résumé produit par l’agent puis approuvé par un humain avant son stockage est une exigence fonctionnelle. « L’agent doit être rapide et précis » n’est pas vérifiable. Le fournisseur cloud approuvé et le traitement des transcriptions dans l’UE sont des exigences d’infrastructure, non fonctionnelles.",
      },
    },
    skilljar_s07b_q2: {
      correctAnswer: "c",
      explanation: {
        en: "Processing transcript data in the EU is an infrastructure requirement tied to data residency. Producing summaries quickly is not checkable as written, the prompt template is a design choice, and human review before storage is a functional requirement.",
        fr: "Le traitement des données de transcription dans l’UE est une exigence d’infrastructure liée à la résidence des données. Produire des résumés rapidement n’est pas vérifiable tel quel, le modèle de prompt est un choix de conception et la relecture humaine avant stockage est une exigence fonctionnelle.",
      },
    },
  },
};

/** Resolve only active, explicitly server-validated choices with an unambiguous key. */
export function findServerValidatedChoiceKey(course: any, exerciseId: string): SensitiveExerciseAnswerKey | null {
  const candidates = (Array.isArray(course?.lessons) ? course.lessons : [])
    .flatMap((lesson: any) => Array.isArray(lesson?.chapters) ? lesson.chapters : [])
    .flatMap((chapter: any) => Array.isArray(chapter?.blocks) ? chapter.blocks : [])
    .filter((block: any) => block?.type === "single_choice_exercise"
      && block.serverValidated === true && (block.exerciseId || block.id) === exerciseId);
  if (candidates.length !== 1) return null;
  const block = candidates[0];
  const options = Array.isArray(block.options) ? block.options : [];
  const optionIds = options.map((option: any) => option?.id);
  if (options.length < 2 || optionIds.some((id: unknown) => typeof id !== "string" || !id)
    || new Set(optionIds).size !== options.length
    || typeof block.correctAnswer !== "string" || !optionIds.includes(block.correctAnswer)) return null;
  return { correctAnswer: block.correctAnswer, explanation: block.explanation };
}

const courseKeyCache = new Map<string, { stamp: string; course: any }>();

export function getSensitiveExerciseAnswerKey(courseId: string, exerciseId: string): SensitiveExerciseAnswerKey | null {
  if (!isValidCourseDataId(courseId) || !exerciseId) return null;
  const registered = sensitiveExerciseAnswerKeys[courseId]?.[exerciseId];
  if (registered) return registered;
  for (const directory of getCourseDataDirectories()) {
    const filename = path.join(directory, `${courseId}.json`);
    try {
      const stat = statSync(filename);
      const stamp = `${stat.mtimeMs}:${stat.size}`;
      const cached = courseKeyCache.get(filename);
      const course = cached?.stamp === stamp ? cached.course : JSON.parse(readFileSync(filename, "utf8"));
      courseKeyCache.set(filename, { stamp, course });
      return findServerValidatedChoiceKey(course, exerciseId);
    } catch {
      // Try the next managed course directory; do not expose paths or raw keys.
    }
  }
  return null;
}
